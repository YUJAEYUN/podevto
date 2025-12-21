# CLIP과 대조학습 (Contrastive Learning)

> 이미지와 텍스트를 같은 공간에 매핑하는 혁신적인 학습 방법

## 개요

**CLIP (Contrastive Language-Image Pre-training)**은 2021년 OpenAI에서 발표한 모델로, 이미지와 텍스트를 동일한 임베딩 공간에 매핑하여 "이해"할 수 있게 합니다.

### 핵심 아이디어

```
"이미지와 그 설명 텍스트를 같은 공간의 가까운 점으로 매핑한다"

┌─────────────────────────────────────────────────────────┐
│           공유 임베딩 공간 (Shared Embedding Space)      │
│                                                         │
│     🐱 이미지 ●──────────────● "a photo of a cat"      │
│              (가까운 거리)                               │
│                                                         │
│     🐶 이미지 ●              ● "a photo of a dog"      │
│              (가까운 거리)                               │
│                                                         │
│     🐱 이미지 ●─ ─ ─ ─ ─ ─ ─● "a photo of a dog"      │
│              (먼 거리)                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## CLIP 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIP Architecture                         │
│                                                                  │
│  ┌───────────────────────┐      ┌───────────────────────┐       │
│  │      Image Encoder     │      │     Text Encoder      │       │
│  │                        │      │                       │       │
│  │   ┌─────────────┐     │      │   ┌─────────────┐    │       │
│  │   │   입력 이미지  │     │      │   │   입력 텍스트  │    │    │
│  │   │  (224x224x3)  │     │      │   │   "a cat"     │    │    │
│  │   └──────┬──────┘     │      │   └──────┬──────┘    │       │
│  │          ↓            │      │          ↓           │       │
│  │   ┌─────────────┐     │      │   ┌─────────────┐    │       │
│  │   │ Vision       │     │      │   │ Transformer  │    │       │
│  │   │ Transformer  │     │      │   │ Encoder      │    │       │
│  │   │ (ViT)        │     │      │   │             │    │       │
│  │   └──────┬──────┘     │      │   └──────┬──────┘    │       │
│  │          ↓            │      │          ↓           │       │
│  │   ┌─────────────┐     │      │   ┌─────────────┐    │       │
│  │   │ Image       │     │      │   │ Text        │    │       │
│  │   │ Embedding   │     │      │   │ Embedding   │    │       │
│  │   │ (512-dim)   │     │      │   │ (512-dim)   │    │       │
│  │   └──────┬──────┘     │      │   └──────┬──────┘    │       │
│  └──────────┼────────────┘      └──────────┼───────────┘       │
│             │                              │                    │
│             └──────────┬───────────────────┘                    │
│                        ↓                                        │
│             ┌─────────────────┐                                 │
│             │ Cosine          │                                 │
│             │ Similarity      │                                 │
│             │ 계산            │                                 │
│             └─────────────────┘                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 인코더 상세

| 구성 요소             | 구현                               | 출력          |
| ----------------- | -------------------------------- | ----------- |
| **Image Encoder** | ViT-L/14 (336px) 또는 ResNet-50x64 | 이미지 임베딩 벡터  |
| **Text Encoder**  | 12-layer Transformer (GPT-2 스타일) | 텍스트 임베딩 벡터  |
| **Projection**    | Linear Layer                     | 512차원 공유 공간 |

---

## 대조학습 (Contrastive Learning)

### 핵심 원리

```
목표:
─────────────────────────────────────────
✅ 매칭되는 쌍: 가깝게 (유사도 높이기)
❌ 매칭되지 않는 쌍: 멀게 (유사도 낮추기)
```

### 학습 과정

```
Batch 예시 (N=4)
─────────────────────────────────────────
이미지:  [I₁: 🐱] [I₂: 🐶] [I₃: 🚗] [I₄: 🌸]
텍스트:  [T₁: cat] [T₂: dog] [T₃: car] [T₄: flower]

유사도 행렬 (N x N):
         T₁      T₂      T₃      T₄
       ┌──────┬──────┬──────┬──────┐
    I₁ │ 0.95 │ 0.20 │ 0.10 │ 0.15 │  ← 🐱과 각 텍스트
       ├──────┼──────┼──────┼──────┤
    I₂ │ 0.25 │ 0.92 │ 0.12 │ 0.18 │  ← 🐶과 각 텍스트
       ├──────┼──────┼──────┼──────┤
    I₃ │ 0.08 │ 0.15 │ 0.88 │ 0.10 │  ← 🚗과 각 텍스트
       ├──────┼──────┼──────┼──────┤
    I₄ │ 0.12 │ 0.20 │ 0.08 │ 0.90 │  ← 🌸과 각 텍스트
       └──────┴──────┴──────┴──────┘

목표: 대각선 값(정답 쌍)을 최대화, 나머지를 최소화
```

### 손실 함수 (Loss Function)

```
CLIP Loss = (Image-to-Text Loss + Text-to-Image Loss) / 2

Image-to-Text Loss (각 이미지에 대해):
─────────────────────────────────────────
L_i2t = -log( exp(sim(I_i, T_i)/τ) / Σⱼ exp(sim(I_i, T_j)/τ) )

"이미지 I_i와 가장 유사한 텍스트가 T_i(정답)가 되도록"

Text-to-Image Loss (각 텍스트에 대해):
─────────────────────────────────────────
L_t2i = -log( exp(sim(T_i, I_i)/τ) / Σⱼ exp(sim(T_i, I_j)/τ) )

"텍스트 T_i와 가장 유사한 이미지가 I_i(정답)가 되도록"

τ (temperature): 유사도 분포의 날카로움 조절 (학습 파라미터)
```

### 시각적 설명

```
학습 전:
─────────────────────────────────────────
공유 공간에서의 분포:

    ●(🐱이미지)                    ○(cat 텍스트)
              ●(🐶이미지)    ○(dog 텍스트)
        ○(car 텍스트)   ●(🚗이미지)
                    ○(flower 텍스트)    ●(🌸이미지)

→ 임베딩들이 무작위로 분포

학습 후:
─────────────────────────────────────────
    ●○ (🐱-cat)      ●○ (🐶-dog)

    ●○ (🚗-car)      ●○ (🌸-flower)

→ 매칭 쌍들이 가깝게 클러스터링
```

---

## CLIP의 학습 데이터

### WebImageText (WIT) 데이터셋

```
규모:
─────────────────────────────────────────
- 4억 개의 (이미지, 텍스트) 쌍
- 인터넷에서 수집
- 자연스러운 alt-text, 캡션 등

예시:
─────────────────────────────────────────
이미지: [강아지가 공원에서 뛰는 사진]
텍스트: "A golden retriever playing fetch in the park"

이미지: [에펠탑 야경 사진]
텍스트: "The Eiffel Tower illuminated at night"
```

### 데이터 규모의 중요성

| 학습 데이터 크기 | Zero-shot ImageNet 정확도 |
|------------------|---------------------------|
| 1500만 쌍 (YFCC) | ~35% |
| 4억 쌍 (WIT) | ~76% |

→ 대규모 웹 데이터가 핵심 성공 요인

---

## Zero-shot 분류

### 원리

```
학습 시:
─────────────────────────────────────────
"a photo of a cat" ←→ 고양이 이미지
"a dog running" ←→ 달리는 개 이미지
... (4억 쌍으로 학습)

추론 시 (새로운 범주):
─────────────────────────────────────────
분류하고 싶은 클래스들:
["airplane", "automobile", "bird", "cat", "deer", "dog", ...]

템플릿 적용:
["a photo of a airplane",
 "a photo of a automobile",
 "a photo of a bird",
 ...]

각 텍스트의 임베딩 계산 → 입력 이미지 임베딩과 비교
→ 가장 유사도 높은 클래스 선택
```

### 프롬프트 엔지니어링

```python
# 단순 템플릿
templates = [
    "a photo of a {}",
]

# 앙상블 템플릿 (더 좋은 성능)
templates = [
    "a photo of a {}",
    "a bad photo of a {}",
    "a origami {}",
    "a photo of the large {}",
    "a photo of the small {}",
    "a photo of many {}",
    "a plushie {}",
    "a sculpture of a {}",
    ... # 80개 템플릿
]

# 각 템플릿의 임베딩 평균 사용
```

---

## CLIP의 활용

### 1. Zero-shot 이미지 분류

```python
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

image = Image.open("test.jpg")
texts = ["a photo of a cat", "a photo of a dog", "a photo of a bird"]

inputs = processor(text=texts, images=image, return_tensors="pt", padding=True)
outputs = model(**inputs)

# 유사도 계산
logits_per_image = outputs.logits_per_image
probs = logits_per_image.softmax(dim=1)
print(f"Probabilities: {probs}")
```

### 2. 이미지 검색 (Image Retrieval)

```
쿼리: "sunset over the ocean"

1. 쿼리 텍스트를 임베딩으로 변환
2. 데이터베이스의 모든 이미지 임베딩과 유사도 계산
3. 가장 유사한 이미지들 반환

┌───────────────────────────────────────┐
│ Query: "sunset over the ocean"        │
│        ↓                              │
│ 텍스트 임베딩 [0.1, -0.3, 0.8, ...]   │
│        ↓                              │
│ 이미지 DB와 유사도 비교               │
│        ↓                              │
│ 결과: 🌅 🌅 🌅 (노을 이미지들)       │
└───────────────────────────────────────┘
```

### 3. 이미지 생성 가이드

```
CLIP은 이미지 생성 모델의 평가/가이드에 사용

Stable Diffusion, DALL-E 등:
─────────────────────────────────────────
1. 텍스트 프롬프트 → CLIP 텍스트 임베딩
2. 이미지 생성
3. 생성된 이미지 → CLIP 이미지 임베딩
4. 두 임베딩의 유사도로 품질 평가
5. 유사도를 높이는 방향으로 이미지 개선
```

---

## CLIP의 한계와 발전

### 알려진 한계

| 한계 | 설명 |
|------|------|
| **세밀한 분류** | 비슷한 개념 구분이 어려움 (e.g., 차종 구분) |
| **추상적 개념** | 숫자 세기, 공간 관계 이해 부족 |
| **도메인 특화** | 의료, 위성 이미지 등에서 성능 저하 |
| **적대적 공격** | Typographic attack에 취약 |

### 후속 연구

```
CLIP 이후의 발전:
─────────────────────────────────────────

ALIGN (Google, 2021)
├── 18억 쌍의 노이즈 있는 데이터 사용
└── 데이터 정제 없이도 좋은 성능

BLIP (Salesforce, 2022)
├── Bootstrapping Language-Image Pre-training
└── 캡션 생성 + 필터링으로 데이터 품질 향상

SigLIP (Google, 2023)
├── Sigmoid Loss 사용
└── 더 효율적인 학습

OpenCLIP (커뮤니티)
├── CLIP 오픈소스 재구현
└── 다양한 데이터셋으로 학습된 버전 제공
```

---

## 대조학습의 핵심 요소

### 1. 긍정/부정 쌍 정의

```
이미지-텍스트 대조학습:
─────────────────────────────────────────
긍정 쌍 (Positive): 원래 매칭된 (이미지, 텍스트)
부정 쌍 (Negative): 같은 배치 내 다른 조합

SimCLR (이미지 자체 대조학습):
─────────────────────────────────────────
긍정 쌍: 같은 이미지의 다른 augmentation
부정 쌍: 다른 이미지들
```

### 2. Temperature 파라미터

```
τ (temperature)의 역할:
─────────────────────────────────────────
softmax( similarity / τ )

τ가 작을수록 (예: 0.01):
→ 분포가 날카로워짐 (peaked)
→ 가장 유사한 것에 더 집중

τ가 클수록 (예: 1.0):
→ 분포가 평평해짐 (uniform)
→ 덜 차별적인 학습

CLIP 기본값: τ ≈ 0.07 (학습 가능)
```

### 3. 배치 크기의 중요성

```
대조학습에서 배치 크기:
─────────────────────────────────────────
배치 크기 = 부정 샘플 수

배치 크기 32,768 → 32,767개의 부정 쌍
→ 더 많은 부정 샘플 = 더 나은 표현 학습

CLIP 학습 설정:
- 배치 크기: 32,768
- GPU: 592 V100
- 학습 시간: 12일
```

---

## 핵심 정리

1. **CLIP은 이미지와 텍스트를 같은 공간에 매핑**
   - 듀얼 인코더 구조 (Vision + Text)
   - 512차원 공유 임베딩 공간

2. **대조학습으로 매칭 쌍을 가깝게 학습**
   - 매칭 쌍: 유사도 최대화
   - 비매칭 쌍: 유사도 최소화

3. **Zero-shot 분류 가능**
   - 학습하지 않은 새로운 클래스도 분류
   - 텍스트 프롬프트로 분류 기준 정의

4. **대규모 데이터가 핵심**
   - 4억 이미지-텍스트 쌍
   - 인터넷에서 자연스럽게 수집

5. **다양한 활용 분야**
   - 이미지 분류, 검색, 생성 가이드 등

---

## 참고 자료

- [CLIP: Connecting text and images | OpenAI](https://openai.com/index/clip/)
- [Learning Transferable Visual Models From Natural Language Supervision (원논문)](https://arxiv.org/abs/2103.00020)
- [CLIP Tutorial | Ultralytics](https://www.ultralytics.com/glossary/clip-contrastive-language-image-pre-training)
- [Building CLIP from Scratch | ReadyTensor](https://app.readytensor.ai/publications/building-clip-from-scratch-a-tutorial-on-multimodal-learning-57Nhu0gMyonV)

---

*마지막 업데이트: 2025-12-20*
