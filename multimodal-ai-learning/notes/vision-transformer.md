# Vision Transformer (ViT) 이해하기

> 이미지를 패치로 분할하여 Transformer로 처리하는 핵심 원리

## 개요

**Vision Transformer (ViT)**는 2020년 Google에서 발표한 모델로, NLP에서 성공한 Transformer 아키텍처를 컴퓨터 비전에 적용한 혁신적인 접근법입니다.

### 핵심 아이디어

```
"이미지의 패치를 NLP의 단어(토큰)처럼 다룬다"

┌─────────────────────────────────────────────────────────┐
│                                                         │
│   NLP:    [The] [cat] [sat] [on] [the] [mat]           │
│            ↓    ↓     ↓    ↓    ↓     ↓               │
│         토큰 시퀀스 → Transformer → 의미 이해          │
│                                                         │
│   Vision: [P1] [P2] [P3] [P4] [P5] [P6] ...            │
│            ↓    ↓    ↓    ↓    ↓    ↓                 │
│         패치 시퀀스 → Transformer → 이미지 이해        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ViT 아키텍처 상세

### 전체 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                     Vision Transformer (ViT)                     │
│                                                                  │
│  Input Image (224 x 224 x 3)                                    │
│         ↓                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Patch Embedding                                        │   │
│  │    - 16x16 패치로 분할 → 196개 패치                       │   │
│  │    - Linear Projection → D차원 벡터                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 2. Position Embedding                                     │   │
│  │    - 각 패치에 위치 정보 추가                              │   │
│  │    - 학습 가능한 위치 임베딩                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 3. [CLS] Token 추가                                       │   │
│  │    - 전체 이미지를 대표하는 특별 토큰                      │   │
│  │    - 시퀀스 맨 앞에 추가                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 4. Transformer Encoder (L layers)                         │   │
│  │    - Multi-Head Self-Attention                            │   │
│  │    - Feed-Forward Network (MLP)                           │   │
│  │    - Layer Normalization                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 5. Classification Head                                    │   │
│  │    - [CLS] 토큰의 최종 표현 사용                          │   │
│  │    - MLP로 클래스 예측                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Patch Embedding (패치 임베딩)

### 왜 패치로 분할하는가?

```
문제: 픽셀 단위 처리의 계산량

224 x 224 이미지 = 50,176 픽셀
Self-Attention 복잡도: O(n²) = O(50,176²) = 2.5 billion 연산
→ GPU 메모리 및 연산량 폭발!

해결: 패치 단위 처리

224 x 224 이미지를 16x16 패치로 분할
→ 196개 패치
Self-Attention 복잡도: O(196²) = 38,416 연산
→ 65,000배 감소!
```

### 패치 생성 과정

```
Step 1: 이미지 분할
─────────────────────────────────────────
입력: 224 x 224 x 3 (RGB 이미지)
패치 크기: 16 x 16
패치 개수: (224/16) x (224/16) = 14 x 14 = 196개

┌─────────────────────────────────────┐
│ ┌───┬───┬───┬───┬ ... ┬───┐        │
│ │P1 │P2 │P3 │P4 │     │P14│  ← Row 1│
│ ├───┼───┼───┼───┼ ... ┼───┤        │
│ │P15│P16│   │   │     │   │  ← Row 2│
│ ├───┼───┼───┼───┼ ... ┼───┤        │
│ │   │   │   │   │     │   │        │
│ ├───┼───┼───┼───┼ ... ┼───┤        │
│ │   │   │   │   │     │P196│← Row 14│
│ └───┴───┴───┴───┴ ... ┴───┘        │
└─────────────────────────────────────┘

Step 2: 패치 Flatten
─────────────────────────────────────────
각 패치 (16 x 16 x 3) → 1D 벡터 (768차원)
16 * 16 * 3 = 768

Step 3: Linear Projection
─────────────────────────────────────────
768차원 → D차원 (예: 768 또는 1024)
학습 가능한 가중치 행렬 E를 통해 투영
```

### 수식으로 표현

```
x_p^i = Flatten(Patch_i) ∈ R^(P²·C)

z_0^i = x_p^i · E + E_pos^i

여기서:
- P = 패치 크기 (16)
- C = 채널 수 (3)
- E = 투영 행렬 ∈ R^(P²·C × D)
- E_pos = 위치 임베딩 ∈ R^(N+1 × D)
```

---

## 2. Position Embedding (위치 임베딩)

### 왜 위치 정보가 필요한가?

```
문제: Transformer는 순서 정보를 모름

[P1, P2, P3, P4] ← 어떤 순서로 입력하든
Attention은 동일하게 처리

하지만 이미지에서 위치는 중요!
─────────────────────────────────
P1이 왼쪽 위에 있는 것과
P1이 오른쪽 아래에 있는 것은 전혀 다른 의미
```

### 위치 임베딩 종류

| 종류 | 설명 | ViT에서 사용 |
|------|------|--------------|
| **Learnable** | 학습 가능한 임베딩 | 기본 사용 |
| **Sinusoidal** | sin/cos 함수 기반 | 가능하지만 덜 사용 |
| **2D-aware** | 2D 좌표 정보 반영 | 변형 버전에서 사용 |

```
ViT의 기본 방식: 1D Learnable Position Embedding

z_0 = [x_class; x_p^1E; x_p^2E; ...; x_p^NE] + E_pos

E_pos ∈ R^(N+1 × D)  ← 학습되는 파라미터
```

---

## 3. CLS Token

### 역할

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [CLS] [P1] [P2] [P3] ... [P196]                       │
│    ↓                                                    │
│  Self-Attention을 거치면서                              │
│  모든 패치의 정보를 종합                                │
│    ↓                                                    │
│  최종 [CLS] 토큰 = 전체 이미지의 표현                   │
│    ↓                                                    │
│  Classification Head에 입력                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### BERT와의 유사성

```
BERT (NLP):
[CLS] The cat sat on the mat [SEP]
  ↓
[CLS] 토큰으로 문장 전체 분류

ViT (Vision):
[CLS] [P1] [P2] ... [P196]
  ↓
[CLS] 토큰으로 이미지 전체 분류
```

---

## 4. Self-Attention 메커니즘

### 핵심 개념

Self-Attention은 시퀀스 내 모든 요소가 서로를 참조하여 관계를 학습합니다.

```
Query, Key, Value 계산
─────────────────────────────────────────
Q = X · W_Q    (각 토큰이 "찾고 싶은 것")
K = X · W_K    (각 토큰이 "제공하는 정보")
V = X · W_V    (각 토큰의 "실제 값")

Attention 계산
─────────────────────────────────────────
Attention(Q, K, V) = softmax(QK^T / √d_k) · V

┌───────────────────────────────────────┐
│  각 패치가 다른 모든 패치와의          │
│  관련성(attention weight)을 계산       │
│                                        │
│  예: 고양이 얼굴 패치 ←→ 고양이 몸 패치│
│       높은 attention weight            │
│                                        │
│      고양이 얼굴 패치 ←→ 배경 패치     │
│       낮은 attention weight            │
└───────────────────────────────────────┘
```

### Multi-Head Attention

```
┌─────────────────────────────────────────────────────────┐
│                Multi-Head Attention                      │
│                                                         │
│  Head 1: 색상 관계에 집중                               │
│  Head 2: 윤곽선 관계에 집중                             │
│  Head 3: 텍스처 관계에 집중                             │
│  Head 4: 공간적 관계에 집중                             │
│  ...                                                    │
│  Head 12: 다른 특징에 집중                              │
│                                                         │
│  → 모든 Head의 출력을 Concat → Linear 투영              │
└─────────────────────────────────────────────────────────┘
```

### 이미지에서 Attention의 의미

```
예: "고양이" 이미지

Attention Map 시각화:
┌─────────────────────┐
│   ● ● ●             │  ● = 높은 attention
│   ● ● ●   ○         │  ○ = 낮은 attention
│   ● ● ●             │
│     ○   ○   ○       │  고양이 얼굴 영역의 패치들이
│   ○   ○   ○   ○     │  서로 높은 attention을 가짐
└─────────────────────┘

→ 모델이 "고양이 얼굴"을 하나의 의미 단위로 인식
```

---

## 5. ViT 변형 모델들

### 크기별 분류

| 모델 | Layers (L) | Hidden Size (D) | Heads | Parameters |
|------|------------|-----------------|-------|------------|
| **ViT-Base** | 12 | 768 | 12 | 86M |
| **ViT-Large** | 24 | 1024 | 16 | 307M |
| **ViT-Huge** | 32 | 1280 | 16 | 632M |

### 주요 변형들

```
DeiT (Data-efficient Image Transformer)
─────────────────────────────────────────
- Facebook에서 개발
- 더 적은 데이터로도 효과적 학습
- Knowledge Distillation 활용

Swin Transformer
─────────────────────────────────────────
- Microsoft에서 개발
- 계층적 구조 (Hierarchical)
- Shifted Window Attention
- 더 효율적인 연산

BEiT (BERT pre-training of Image Transformers)
─────────────────────────────────────────
- Microsoft에서 개발
- BERT 스타일의 사전학습
- Masked Image Modeling
```

---

## 6. CNN vs ViT 비교

| 특성 | CNN | ViT |
|------|-----|-----|
| **Inductive Bias** | 강함 (locality, translation equivariance) | 약함 |
| **데이터 효율성** | 적은 데이터에도 잘 학습 | 대규모 데이터 필요 |
| **전역 정보 처리** | 깊은 층 필요 | 첫 층부터 가능 |
| **계산 복잡도** | O(n) | O(n²) |
| **확장성** | 제한적 | 우수 |

```
ViT의 강점: 전역적 관계 학습
─────────────────────────────────────────
CNN:
  [Conv 3x3] → [Conv 3x3] → ... → [Conv 3x3]
  ↳ 점진적으로 receptive field 확장
  ↳ 멀리 떨어진 영역 연결에 많은 층 필요

ViT:
  [Self-Attention] →
  ↳ 첫 층부터 모든 패치 직접 연결
  ↳ 이미지 전체의 관계 즉시 학습 가능
```

---

## 7. 실무에서의 ViT

### 사전학습 + 미세조정 패러다임

```
1단계: 대규모 사전학습
─────────────────────────────────────────
- ImageNet-21k (1400만 이미지, 21000 클래스)
- JFT-300M (3억 이미지, Google 내부 데이터)
- 범용적인 시각 표현 학습

2단계: 미세조정 (Fine-tuning)
─────────────────────────────────────────
- 특정 태스크에 맞게 조정
- Classification Head만 교체
- 적은 데이터로도 좋은 성능
```

### Hugging Face에서 사용하기

```python
from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import requests

# 모델 로드
processor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224')
model = ViTForImageClassification.from_pretrained('google/vit-base-patch16-224')

# 이미지 처리
url = 'http://images.cocodataset.org/val2017/000000039769.jpg'
image = Image.open(requests.get(url, stream=True).raw)

# 추론
inputs = processor(images=image, return_tensors="pt")
outputs = model(**inputs)
logits = outputs.logits

# 예측
predicted_class_idx = logits.argmax(-1).item()
print(f"Predicted: {model.config.id2label[predicted_class_idx]}")
```

---

## 핵심 정리

1. **ViT는 이미지를 패치로 분할하여 Transformer로 처리**
   - 16x16 패치 → 선형 투영 → 토큰 시퀀스

2. **위치 임베딩으로 공간 정보 보존**
   - 학습 가능한 위치 임베딩 사용

3. **CLS 토큰이 전체 이미지를 대표**
   - 모든 패치의 정보를 종합

4. **Self-Attention으로 전역적 관계 학습**
   - 첫 층부터 이미지 전체의 관계 파악

5. **대규모 데이터가 필요하지만, 규모에서 강점**
   - 데이터가 충분하면 CNN 능가

---

## 참고 자료

- [An Image is Worth 16x16 Words (원논문)](https://arxiv.org/abs/2010.11929)
- [Vision Transformers Explained | Pinecone](https://www.pinecone.io/learn/series/image-search/vision-transformers/)
- [ViT Architecture - GeeksforGeeks](https://www.geeksforgeeks.org/deep-learning/vision-transformer-vit-architecture/)
- [Dive into Deep Learning - ViT](https://d2l.ai/chapter_attention-mechanisms-and-transformers/vision-transformer.html)

---

*마지막 업데이트: 2025-12-20*
