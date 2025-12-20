# CLIP 구조 이해

> 듀얼 인코더와 대조학습 구현 코드 분석

## 개요

CLIP은 이미지 인코더와 텍스트 인코더를 사용하여 두 모달리티를 같은 임베딩 공간에 매핑합니다. 이 문서에서는 그 구조를 코드로 이해합니다.

---

## 1. CLIP 전체 구조

### 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIP Model                              │
│                                                                  │
│  ┌───────────────────┐          ┌───────────────────┐          │
│  │   Vision Encoder   │          │   Text Encoder     │          │
│  │   (ViT or ResNet)  │          │   (Transformer)    │          │
│  └─────────┬─────────┘          └─────────┬─────────┘          │
│            ↓                              ↓                     │
│  ┌─────────────────┐          ┌─────────────────┐              │
│  │ Image Projection │          │ Text Projection  │              │
│  │   (Linear)       │          │   (Linear)       │              │
│  └─────────┬─────────┘          └─────────┬─────────┘          │
│            ↓                              ↓                     │
│  ┌─────────────────┐          ┌─────────────────┐              │
│  │ L2 Normalize     │          │ L2 Normalize     │              │
│  └─────────┬─────────┘          └─────────┬─────────┘          │
│            │                              │                     │
│            └──────────────┬───────────────┘                     │
│                           ↓                                     │
│                  Cosine Similarity                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 간단한 CLIP 구현

### 기본 구조

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class SimpleCLIP(nn.Module):
    """
    간단한 CLIP 구현 (교육 목적)
    """
    def __init__(
        self,
        embed_dim: int = 512,
        vision_width: int = 768,
        text_width: int = 512,
        vision_model = None,  # ViT 등
        text_model = None,    # Transformer 등
    ):
        super().__init__()

        # 인코더들
        self.vision_encoder = vision_model
        self.text_encoder = text_model

        # Projection layers (공유 임베딩 공간으로 변환)
        self.vision_projection = nn.Linear(vision_width, embed_dim, bias=False)
        self.text_projection = nn.Linear(text_width, embed_dim, bias=False)

        # Temperature (학습 가능)
        self.logit_scale = nn.Parameter(torch.ones([]) * np.log(1 / 0.07))

    def encode_image(self, images: torch.Tensor) -> torch.Tensor:
        """
        이미지 → 임베딩
        """
        # Vision encoder 통과
        vision_features = self.vision_encoder(images)

        # Projection
        image_embeddings = self.vision_projection(vision_features)

        # L2 정규화
        image_embeddings = F.normalize(image_embeddings, dim=-1)

        return image_embeddings

    def encode_text(self, text_tokens: torch.Tensor) -> torch.Tensor:
        """
        텍스트 → 임베딩
        """
        # Text encoder 통과
        text_features = self.text_encoder(text_tokens)

        # Projection
        text_embeddings = self.text_projection(text_features)

        # L2 정규화
        text_embeddings = F.normalize(text_embeddings, dim=-1)

        return text_embeddings

    def forward(
        self,
        images: torch.Tensor,
        text_tokens: torch.Tensor
    ) -> tuple:
        """
        이미지와 텍스트 모두 인코딩 후 유사도 계산
        """
        # 각각 인코딩
        image_embeddings = self.encode_image(images)      # (B, embed_dim)
        text_embeddings = self.encode_text(text_tokens)   # (B, embed_dim)

        # Temperature scaling
        logit_scale = self.logit_scale.exp()

        # 유사도 행렬 계산 (B x B)
        logits_per_image = logit_scale * image_embeddings @ text_embeddings.T
        logits_per_text = logits_per_image.T

        return logits_per_image, logits_per_text
```

---

## 3. Vision Encoder (ViT 기반)

### CLIP의 Vision Transformer

```python
class CLIPVisionEncoder(nn.Module):
    """
    CLIP용 Vision Transformer Encoder
    """
    def __init__(
        self,
        image_size: int = 224,
        patch_size: int = 16,
        width: int = 768,
        layers: int = 12,
        heads: int = 12,
    ):
        super().__init__()

        self.num_patches = (image_size // patch_size) ** 2

        # 패치 임베딩
        self.conv1 = nn.Conv2d(
            3, width,
            kernel_size=patch_size,
            stride=patch_size,
            bias=False
        )

        # CLS 토큰
        self.class_embedding = nn.Parameter(torch.randn(width))

        # 위치 임베딩
        self.positional_embedding = nn.Parameter(
            torch.randn(self.num_patches + 1, width)
        )

        # Layer Normalization
        self.ln_pre = nn.LayerNorm(width)

        # Transformer 블록들
        self.transformer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(
                d_model=width,
                nhead=heads,
                dim_feedforward=width * 4,
                activation='gelu',
                batch_first=True
            ),
            num_layers=layers
        )

        # 최종 Layer Norm
        self.ln_post = nn.LayerNorm(width)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (batch_size, 3, image_size, image_size)

        Returns:
            (batch_size, width) - CLS 토큰의 표현
        """
        B = x.shape[0]

        # 패치 임베딩
        x = self.conv1(x)  # (B, width, grid, grid)
        x = x.flatten(2).transpose(1, 2)  # (B, num_patches, width)

        # CLS 토큰 추가
        cls_token = self.class_embedding.unsqueeze(0).unsqueeze(0)
        cls_tokens = cls_token.expand(B, -1, -1)  # (B, 1, width)
        x = torch.cat([cls_tokens, x], dim=1)  # (B, num_patches + 1, width)

        # 위치 임베딩 추가
        x = x + self.positional_embedding

        # Pre-norm
        x = self.ln_pre(x)

        # Transformer
        x = self.transformer(x)

        # CLS 토큰만 추출하고 post-norm
        x = self.ln_post(x[:, 0, :])  # (B, width)

        return x
```

---

## 4. Text Encoder

### CLIP의 Text Transformer

```python
class CLIPTextEncoder(nn.Module):
    """
    CLIP용 Text Transformer Encoder
    """
    def __init__(
        self,
        vocab_size: int = 49408,
        context_length: int = 77,
        width: int = 512,
        layers: int = 12,
        heads: int = 8,
    ):
        super().__init__()

        self.context_length = context_length

        # 토큰 임베딩
        self.token_embedding = nn.Embedding(vocab_size, width)

        # 위치 임베딩
        self.positional_embedding = nn.Parameter(
            torch.randn(context_length, width)
        )

        # Transformer (Causal Attention)
        self.transformer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(
                d_model=width,
                nhead=heads,
                dim_feedforward=width * 4,
                activation='gelu',
                batch_first=True
            ),
            num_layers=layers
        )

        # 최종 Layer Norm
        self.ln_final = nn.LayerNorm(width)

        # Causal mask 생성
        self.register_buffer(
            "causal_mask",
            torch.triu(torch.ones(context_length, context_length) * float('-inf'), diagonal=1)
        )

    def forward(self, text: torch.Tensor) -> torch.Tensor:
        """
        Args:
            text: (batch_size, context_length) - 토큰화된 텍스트

        Returns:
            (batch_size, width) - EOT 토큰의 표현
        """
        # 토큰 임베딩
        x = self.token_embedding(text)  # (B, L, width)

        # 위치 임베딩 추가
        x = x + self.positional_embedding

        # Transformer with causal mask
        x = self.transformer(x, mask=self.causal_mask)

        # Layer Norm
        x = self.ln_final(x)

        # EOT (End of Text) 토큰 위치에서 특징 추출
        # text.argmax(dim=-1)로 EOT 위치 찾기 (가장 큰 토큰 ID)
        eot_indices = text.argmax(dim=-1)
        x = x[torch.arange(x.shape[0]), eot_indices]  # (B, width)

        return x
```

---

## 5. 대조 손실 함수 (Contrastive Loss)

### CLIP Loss 구현

```python
def clip_loss(
    image_embeddings: torch.Tensor,
    text_embeddings: torch.Tensor,
    temperature: float = 0.07
) -> torch.Tensor:
    """
    CLIP의 대칭 대조 손실 함수

    Args:
        image_embeddings: (B, D) - 정규화된 이미지 임베딩
        text_embeddings: (B, D) - 정규화된 텍스트 임베딩
        temperature: 온도 파라미터

    Returns:
        스칼라 손실값
    """
    batch_size = image_embeddings.shape[0]

    # 유사도 행렬 계산 (B x B)
    # 정규화된 벡터의 내적 = 코사인 유사도
    logits = image_embeddings @ text_embeddings.T / temperature

    # 정답 라벨: 대각선이 정답 쌍
    labels = torch.arange(batch_size, device=logits.device)

    # Image-to-Text Loss
    # 각 이미지에 대해, 올바른 텍스트를 찾는 분류 문제
    loss_i2t = F.cross_entropy(logits, labels)

    # Text-to-Image Loss
    # 각 텍스트에 대해, 올바른 이미지를 찾는 분류 문제
    loss_t2i = F.cross_entropy(logits.T, labels)

    # 대칭 손실
    total_loss = (loss_i2t + loss_t2i) / 2

    return total_loss


# 학습 루프 예시
def train_step(model, images, texts, optimizer):
    """
    CLIP 학습 한 스텝
    """
    optimizer.zero_grad()

    # Forward
    image_embeddings = model.encode_image(images)
    text_embeddings = model.encode_text(texts)

    # Loss 계산
    loss = clip_loss(
        image_embeddings,
        text_embeddings,
        temperature=model.logit_scale.exp().item()
    )

    # Backward
    loss.backward()
    optimizer.step()

    return loss.item()
```

### 손실 함수 시각화

```
Batch size = 4 예시:

유사도 행렬 (logits):
         T₁      T₂      T₃      T₄
       ┌──────┬──────┬──────┬──────┐
    I₁ │ 3.2  │ 0.5  │ 0.2  │ 0.8  │
       ├──────┼──────┼──────┼──────┤
    I₂ │ 0.3  │ 2.8  │ 0.4  │ 0.6  │
       ├──────┼──────┼──────┼──────┤
    I₃ │ 0.1  │ 0.7  │ 3.5  │ 0.3  │
       ├──────┼──────┼──────┼──────┤
    I₄ │ 0.4  │ 0.2  │ 0.5  │ 2.9  │
       └──────┴──────┴──────┴──────┘

Labels: [0, 1, 2, 3] (대각선이 정답)

CrossEntropy(row 0, label=0):
  -log(softmax([3.2, 0.5, 0.2, 0.8])[0])
  = -log(0.89) ≈ 0.12

→ 대각선 값이 커질수록 손실 감소
```

---

## 6. Hugging Face에서 CLIP 사용하기

### 기본 사용법

```python
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import requests
import torch

# 모델과 프로세서 로드
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# 이미지 로드
url = "http://images.cocodataset.org/val2017/000000039769.jpg"
image = Image.open(requests.get(url, stream=True).raw)

# 텍스트 후보들
texts = ["a photo of a cat", "a photo of a dog", "a photo of a bird"]

# 전처리
inputs = processor(
    text=texts,
    images=image,
    return_tensors="pt",
    padding=True
)

# 추론
with torch.no_grad():
    outputs = model(**inputs)

# 유사도 계산
logits_per_image = outputs.logits_per_image  # (1, 3)
probs = logits_per_image.softmax(dim=1)      # 확률로 변환

print("Probabilities:")
for i, text in enumerate(texts):
    print(f"  {text}: {probs[0][i].item():.2%}")

# 출력 예시:
# a photo of a cat: 92.5%
# a photo of a dog: 6.3%
# a photo of a bird: 1.2%
```

### 이미지/텍스트 임베딩 추출

```python
# 개별 인코딩
from transformers import CLIPVisionModel, CLIPTextModel, CLIPTokenizer

# Vision 모델만
vision_model = CLIPVisionModel.from_pretrained("openai/clip-vit-base-patch32")
image_inputs = processor(images=image, return_tensors="pt")
image_features = vision_model(**image_inputs).pooler_output
print(f"Image embedding: {image_features.shape}")  # (1, 768)

# Text 모델만
text_model = CLIPTextModel.from_pretrained("openai/clip-vit-base-patch32")
tokenizer = CLIPTokenizer.from_pretrained("openai/clip-vit-base-patch32")
text_inputs = tokenizer(texts, return_tensors="pt", padding=True)
text_features = text_model(**text_inputs).pooler_output
print(f"Text embedding: {text_features.shape}")  # (3, 512)
```

---

## 7. Zero-shot 분류 구현

```python
def zero_shot_classify(
    model,
    processor,
    image,
    class_names: list,
    template: str = "a photo of a {}"
) -> dict:
    """
    CLIP을 사용한 Zero-shot 이미지 분류

    Args:
        model: CLIP 모델
        processor: CLIP 프로세서
        image: PIL Image
        class_names: 분류할 클래스 이름들
        template: 프롬프트 템플릿

    Returns:
        클래스별 확률 딕셔너리
    """
    # 텍스트 프롬프트 생성
    texts = [template.format(name) for name in class_names]

    # 전처리
    inputs = processor(
        text=texts,
        images=image,
        return_tensors="pt",
        padding=True
    )

    # 추론
    with torch.no_grad():
        outputs = model(**inputs)

    # 확률 계산
    probs = outputs.logits_per_image.softmax(dim=1)[0]

    # 결과 정리
    results = {
        name: prob.item()
        for name, prob in zip(class_names, probs)
    }

    return dict(sorted(results.items(), key=lambda x: -x[1]))


# 사용 예시
classes = ["cat", "dog", "bird", "fish", "horse"]
results = zero_shot_classify(model, processor, image, classes)

for cls, prob in results.items():
    print(f"{cls}: {prob:.2%}")
```

---

## 8. 이미지 검색 구현

```python
import numpy as np
from PIL import Image

class ImageSearchEngine:
    """
    CLIP 기반 이미지 검색 엔진
    """
    def __init__(self, model, processor):
        self.model = model
        self.processor = processor
        self.image_embeddings = []
        self.image_paths = []

    def add_images(self, image_paths: list):
        """
        검색 인덱스에 이미지 추가
        """
        for path in image_paths:
            image = Image.open(path)
            inputs = self.processor(images=image, return_tensors="pt")

            with torch.no_grad():
                embedding = self.model.get_image_features(**inputs)
                embedding = embedding / embedding.norm(dim=-1, keepdim=True)

            self.image_embeddings.append(embedding)
            self.image_paths.append(path)

        # 스택으로 변환
        self.image_embeddings = torch.cat(self.image_embeddings, dim=0)

    def search(self, query: str, top_k: int = 5) -> list:
        """
        텍스트 쿼리로 이미지 검색
        """
        # 쿼리 인코딩
        inputs = self.processor(text=query, return_tensors="pt", padding=True)

        with torch.no_grad():
            text_embedding = self.model.get_text_features(**inputs)
            text_embedding = text_embedding / text_embedding.norm(dim=-1, keepdim=True)

        # 유사도 계산
        similarities = (text_embedding @ self.image_embeddings.T)[0]

        # Top-K 결과
        top_indices = similarities.argsort(descending=True)[:top_k]

        results = [
            {
                "path": self.image_paths[idx],
                "score": similarities[idx].item()
            }
            for idx in top_indices
        ]

        return results


# 사용 예시
engine = ImageSearchEngine(model, processor)
engine.add_images(["img1.jpg", "img2.jpg", "img3.jpg"])

results = engine.search("a sunset over the ocean")
for r in results:
    print(f"{r['path']}: {r['score']:.3f}")
```

---

## 핵심 정리

| 구성 요소 | 역할 | 출력 형태 |
|-----------|------|-----------|
| Vision Encoder | 이미지 특징 추출 | (B, vision_width) |
| Text Encoder | 텍스트 특징 추출 | (B, text_width) |
| Projection | 공유 공간으로 변환 | (B, embed_dim) |
| L2 Normalize | 코사인 유사도 준비 | (B, embed_dim) |
| Contrastive Loss | 매칭 쌍 학습 | 스칼라 |

---

## 참고 자료

- [OpenAI CLIP 논문](https://arxiv.org/abs/2103.00020)
- [Hugging Face CLIP](https://huggingface.co/openai/clip-vit-base-patch32)
- [OpenCLIP (오픈소스 재구현)](https://github.com/mlfoundations/open_clip)
- [CLIP from Scratch Tutorial](https://app.readytensor.ai/publications/building-clip-from-scratch-a-tutorial-on-multimodal-learning-57Nhu0gMyonV)

---

*마지막 업데이트: 2025-12-20*
