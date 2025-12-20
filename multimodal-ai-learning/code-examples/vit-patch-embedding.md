# ViT 패치 임베딩 구현

> 이미지를 패치로 분할하고 임베딩으로 변환하는 과정의 코드 분석

## 개요

Vision Transformer의 핵심은 이미지를 패치 단위로 분할하여 토큰처럼 처리하는 것입니다. 이 문서에서는 그 과정을 코드로 이해합니다.

---

## 1. 패치 생성 과정

### 개념적 흐름

```
입력 이미지 (224 x 224 x 3)
         ↓
패치 분할 (16 x 16 크기)
         ↓
14 x 14 = 196개 패치
         ↓
각 패치 Flatten (16 x 16 x 3 = 768)
         ↓
Linear Projection (768 → D)
         ↓
196개의 D차원 패치 임베딩
```

### PyTorch 구현

```python
import torch
import torch.nn as nn

class PatchEmbedding(nn.Module):
    """
    이미지를 패치로 분할하고 임베딩으로 변환

    Parameters:
        img_size: 입력 이미지 크기 (정사각형 가정)
        patch_size: 패치 크기
        in_channels: 입력 채널 수 (RGB=3)
        embed_dim: 임베딩 차원
    """
    def __init__(
        self,
        img_size: int = 224,
        patch_size: int = 16,
        in_channels: int = 3,
        embed_dim: int = 768
    ):
        super().__init__()

        self.img_size = img_size
        self.patch_size = patch_size
        self.num_patches = (img_size // patch_size) ** 2  # 196

        # Conv2d로 패치 분할 + 임베딩을 한 번에 수행
        # kernel_size=patch_size, stride=patch_size로 설정하면
        # 겹치지 않게 패치를 추출하면서 동시에 projection
        self.projection = nn.Conv2d(
            in_channels,      # 3
            embed_dim,        # 768
            kernel_size=patch_size,  # 16
            stride=patch_size        # 16 (겹치지 않게)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (batch_size, channels, height, width)
               예: (32, 3, 224, 224)

        Returns:
            (batch_size, num_patches, embed_dim)
            예: (32, 196, 768)
        """
        # x: (B, 3, 224, 224)
        x = self.projection(x)  # (B, 768, 14, 14)
        x = x.flatten(2)        # (B, 768, 196)
        x = x.transpose(1, 2)   # (B, 196, 768)
        return x


# 사용 예시
patch_embed = PatchEmbedding(
    img_size=224,
    patch_size=16,
    in_channels=3,
    embed_dim=768
)

# 배치 크기 4의 이미지
images = torch.randn(4, 3, 224, 224)
patches = patch_embed(images)
print(f"Output shape: {patches.shape}")  # (4, 196, 768)
```

---

## 2. 수동 패치 분할 (이해를 위한 코드)

Conv2d를 사용하지 않고 직접 구현하면 과정을 더 명확히 이해할 수 있습니다.

```python
import torch
import torch.nn as nn

class ManualPatchEmbedding(nn.Module):
    """
    패치 분할을 수동으로 구현 (교육 목적)
    """
    def __init__(
        self,
        img_size: int = 224,
        patch_size: int = 16,
        in_channels: int = 3,
        embed_dim: int = 768
    ):
        super().__init__()

        self.img_size = img_size
        self.patch_size = patch_size
        self.num_patches = (img_size // patch_size) ** 2

        # 패치를 flatten한 후 projection하는 선형 레이어
        patch_dim = in_channels * patch_size * patch_size  # 3 * 16 * 16 = 768
        self.projection = nn.Linear(patch_dim, embed_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Step-by-step 패치 생성
        """
        B, C, H, W = x.shape
        P = self.patch_size

        # Step 1: 이미지를 패치 그리드로 reshape
        # (B, C, H, W) → (B, C, H/P, P, W/P, P)
        x = x.view(B, C, H // P, P, W // P, P)

        # Step 2: 축 재배열로 패치별로 그룹화
        # (B, C, H/P, P, W/P, P) → (B, H/P, W/P, C, P, P)
        x = x.permute(0, 2, 4, 1, 3, 5)

        # Step 3: 패치 수와 패치 내용으로 reshape
        # (B, H/P, W/P, C, P, P) → (B, num_patches, C*P*P)
        x = x.reshape(B, self.num_patches, -1)

        # Step 4: Linear projection
        # (B, num_patches, 768) → (B, num_patches, embed_dim)
        x = self.projection(x)

        return x


# 각 단계 시각화
def visualize_patch_creation():
    B, C, H, W = 1, 3, 224, 224
    P = 16

    x = torch.randn(B, C, H, W)
    print(f"원본: {x.shape}")  # (1, 3, 224, 224)

    x = x.view(B, C, H // P, P, W // P, P)
    print(f"그리드로 변환: {x.shape}")  # (1, 3, 14, 16, 14, 16)

    x = x.permute(0, 2, 4, 1, 3, 5)
    print(f"축 재배열: {x.shape}")  # (1, 14, 14, 3, 16, 16)

    num_patches = (H // P) * (W // P)
    x = x.reshape(B, num_patches, -1)
    print(f"Flatten: {x.shape}")  # (1, 196, 768)

visualize_patch_creation()
```

---

## 3. 위치 임베딩 추가

패치의 공간적 위치 정보를 보존하기 위해 위치 임베딩을 추가합니다.

```python
class ViTEmbedding(nn.Module):
    """
    패치 임베딩 + 위치 임베딩 + CLS 토큰
    """
    def __init__(
        self,
        img_size: int = 224,
        patch_size: int = 16,
        in_channels: int = 3,
        embed_dim: int = 768,
        dropout: float = 0.1
    ):
        super().__init__()

        self.num_patches = (img_size // patch_size) ** 2

        # 패치 임베딩
        self.patch_embedding = PatchEmbedding(
            img_size, patch_size, in_channels, embed_dim
        )

        # CLS 토큰 (학습 가능한 파라미터)
        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))

        # 위치 임베딩 (학습 가능한 파라미터)
        # num_patches + 1 (CLS 토큰 포함)
        self.position_embedding = nn.Parameter(
            torch.zeros(1, self.num_patches + 1, embed_dim)
        )

        self.dropout = nn.Dropout(dropout)

        # 초기화
        nn.init.trunc_normal_(self.cls_token, std=0.02)
        nn.init.trunc_normal_(self.position_embedding, std=0.02)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (batch_size, channels, height, width)

        Returns:
            (batch_size, num_patches + 1, embed_dim)
        """
        B = x.shape[0]

        # 패치 임베딩: (B, 196, 768)
        x = self.patch_embedding(x)

        # CLS 토큰 확장: (1, 1, 768) → (B, 1, 768)
        cls_tokens = self.cls_token.expand(B, -1, -1)

        # CLS 토큰을 앞에 붙이기: (B, 197, 768)
        x = torch.cat([cls_tokens, x], dim=1)

        # 위치 임베딩 추가: (B, 197, 768)
        x = x + self.position_embedding

        # Dropout
        x = self.dropout(x)

        return x


# 사용 예시
embedding = ViTEmbedding(
    img_size=224,
    patch_size=16,
    in_channels=3,
    embed_dim=768
)

images = torch.randn(4, 3, 224, 224)
embedded = embedding(images)
print(f"Output shape: {embedded.shape}")  # (4, 197, 768)
# 197 = 196 패치 + 1 CLS 토큰
```

---

## 4. Hugging Face Transformers 구현

실제 Hugging Face의 ViT 구현을 살펴봅니다.

```python
from transformers import ViTImageProcessor, ViTModel
from PIL import Image
import requests
import torch

# 모델과 프로세서 로드
processor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224')
model = ViTModel.from_pretrained('google/vit-base-patch16-224')

# 이미지 로드
url = "http://images.cocodataset.org/val2017/000000039769.jpg"
image = Image.open(requests.get(url, stream=True).raw)

# 이미지 전처리
inputs = processor(images=image, return_tensors="pt")
print(f"Preprocessed shape: {inputs['pixel_values'].shape}")
# (1, 3, 224, 224)

# 모델 추론
with torch.no_grad():
    outputs = model(**inputs)

# 출력 확인
print(f"Last hidden state shape: {outputs.last_hidden_state.shape}")
# (1, 197, 768) - 196 패치 + 1 CLS 토큰

print(f"Pooler output shape: {outputs.pooler_output.shape}")
# (1, 768) - CLS 토큰의 최종 표현
```

### Hugging Face ViT 내부 구조

```python
# transformers/models/vit/modeling_vit.py 에서 발췌

class ViTPatchEmbeddings(nn.Module):
    """
    Hugging Face의 실제 구현
    """
    def __init__(self, config):
        super().__init__()
        image_size = config.image_size  # 224
        patch_size = config.patch_size  # 16
        num_channels = config.num_channels  # 3
        hidden_size = config.hidden_size  # 768

        num_patches = (image_size // patch_size) ** 2  # 196
        self.num_patches = num_patches

        # Conv2d로 패치 추출 + projection
        self.projection = nn.Conv2d(
            num_channels,
            hidden_size,
            kernel_size=patch_size,
            stride=patch_size
        )

    def forward(self, pixel_values):
        # pixel_values: (B, C, H, W)
        embeddings = self.projection(pixel_values)  # (B, hidden_size, H/P, W/P)
        embeddings = embeddings.flatten(2)  # (B, hidden_size, num_patches)
        embeddings = embeddings.transpose(1, 2)  # (B, num_patches, hidden_size)
        return embeddings
```

---

## 5. 2D 위치 임베딩 (고급)

1D 위치 임베딩 대신 2D 좌표 정보를 명시적으로 사용할 수도 있습니다.

```python
class ViT2DPositionEmbedding(nn.Module):
    """
    2D 위치 정보를 명시적으로 인코딩
    """
    def __init__(
        self,
        img_size: int = 224,
        patch_size: int = 16,
        embed_dim: int = 768
    ):
        super().__init__()

        num_patches_side = img_size // patch_size  # 14

        # 행과 열 각각에 대한 임베딩
        self.row_embed = nn.Embedding(num_patches_side, embed_dim // 2)
        self.col_embed = nn.Embedding(num_patches_side, embed_dim // 2)

        # 위치 인덱스 생성
        rows = torch.arange(num_patches_side)
        cols = torch.arange(num_patches_side)

        # 그리드 생성
        row_grid, col_grid = torch.meshgrid(rows, cols, indexing='ij')

        # flatten하여 패치 순서대로
        self.register_buffer('row_indices', row_grid.flatten())
        self.register_buffer('col_indices', col_grid.flatten())

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (batch_size, num_patches, embed_dim)

        Returns:
            (batch_size, num_patches, embed_dim) with position info
        """
        # 행/열 임베딩 가져오기
        row_emb = self.row_embed(self.row_indices)  # (196, 384)
        col_emb = self.col_embed(self.col_indices)  # (196, 384)

        # 결합하여 위치 임베딩 생성
        pos_emb = torch.cat([row_emb, col_emb], dim=-1)  # (196, 768)

        # 배치 차원 추가
        pos_emb = pos_emb.unsqueeze(0)  # (1, 196, 768)

        return x + pos_emb
```

---

## 핵심 정리

| 단계 | 입력 형태 | 출력 형태 | 설명 |
|------|-----------|-----------|------|
| 1. 원본 이미지 | (B, 3, 224, 224) | - | RGB 이미지 |
| 2. Conv2d | (B, 3, 224, 224) | (B, 768, 14, 14) | 패치 추출+투영 |
| 3. Flatten | (B, 768, 14, 14) | (B, 768, 196) | 공간→시퀀스 |
| 4. Transpose | (B, 768, 196) | (B, 196, 768) | 축 교환 |
| 5. CLS 추가 | (B, 196, 768) | (B, 197, 768) | CLS 토큰 |
| 6. Position | (B, 197, 768) | (B, 197, 768) | 위치 정보 |

---

## 참고 자료

- [ViT 원논문 코드 (Google)](https://github.com/google-research/vision_transformer)
- [Hugging Face ViT](https://huggingface.co/docs/transformers/en/model_doc/vit)
- [Understanding Patch Embeddings | Medium](https://medium.com/advanced-deep-learning/understanding-vision-transformers-vit-70ca8d817ff3)

---

*마지막 업데이트: 2025-12-20*
