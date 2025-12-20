# Vision Language Models (VLM)

> 이미지를 보고 자연어로 대화할 수 있는 AI 시스템의 구조와 원리

## 개요

**Vision Language Model (VLM)**은 이미지와 텍스트를 동시에 이해하고, 이미지에 대해 자연어로 대화할 수 있는 AI 모델입니다. GPT-4V, Claude Vision, Gemini 등이 대표적인 예입니다.

### VLM vs 기존 모델

```
기존 Vision 모델:
─────────────────────────────────────────
이미지 → [CNN/ViT] → "cat" (단일 라벨)

CLIP 스타일:
─────────────────────────────────────────
이미지 → [Image Encoder] → 임베딩 ←비교→ 텍스트 임베딩 ← [Text Encoder] ← 텍스트

VLM (Vision Language Model):
─────────────────────────────────────────
이미지 + 질문 → [Vision + LLM] → "이 이미지는 공원에서 노는
                                  갈색 강아지를 보여줍니다.
                                  배경에는 나무와 벤치가 있네요."
→ 자연스러운 대화 형태의 응답 생성
```

---

## VLM 아키텍처 분류

### 세 가지 핵심 구성 요소

```
┌─────────────────────────────────────────────────────────────────┐
│                     VLM = 3가지 구성 요소                        │
│                                                                  │
│  1. Vision Encoder                                              │
│     └── 이미지에서 시각적 특징 추출                              │
│                                                                  │
│  2. Modality Connector (Projector)                              │
│     └── 시각 특징을 언어 모델 공간에 맞게 변환                   │
│                                                                  │
│  3. Large Language Model (LLM)                                  │
│     └── 시각 정보 + 텍스트로 응답 생성                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 아키텍처 유형

```
Type 1: Decoder-Only (가장 일반적)
─────────────────────────────────────────
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│ Vision       │     │ Projection    │     │ LLM Decoder  │
│ Encoder      │────→│ Layer         │────→│ (LLaMA 등)   │
│ (CLIP ViT)   │     │               │     │              │
└──────────────┘     └───────────────┘     └──────────────┘

예: LLaVA, Qwen-VL, Phi-Vision

장점: 단순한 구조, 구현 용이
단점: 이미지 토큰이 길어지면 비효율적


Type 2: Cross-Attention
─────────────────────────────────────────
┌──────────────┐     ┌───────────────────────────────────┐
│ Vision       │     │ LLM with Cross-Attention Layers   │
│ Encoder      │────→│                                   │
│ (CLIP ViT)   │     │ Text ──┬─→ Self-Attn ─→ Cross-Attn│
└──────────────┘     │        │                 ↑        │
                     │        └─────────────────┘        │
                     └───────────────────────────────────┘

예: Flamingo, IDEFICS

장점: 고해상도 이미지 처리에 효율적
단점: 구현 복잡도 증가


Type 3: Hybrid (Decoder + Cross-Attention)
─────────────────────────────────────────
NVLM-H, 일부 최신 모델들

장점: 두 방식의 장점 결합
단점: 구조 복잡, 학습 어려움
```

---

## 핵심 구성 요소 상세

### 1. Vision Encoder

이미지에서 의미 있는 특징을 추출하는 역할

```
일반적으로 사용되는 Vision Encoder:
─────────────────────────────────────────

CLIP ViT (가장 흔함)
├── 이미 이미지-텍스트 정렬이 되어 있음
├── 다양한 크기: ViT-B/16, ViT-L/14, ViT-H/14
└── LLaVA, Qwen-VL 등에서 사용

SigLIP
├── Sigmoid Loss로 학습된 CLIP 변형
├── 더 효율적인 학습
└── PaliGemma, Idefics2 등에서 사용

EVA-CLIP
├── 더 큰 규모의 사전학습
└── InternVL 등에서 사용
```

### 2. Modality Connector (Projection Layer)

Vision Encoder의 출력을 LLM이 이해할 수 있는 형태로 변환

```
타입 1: Linear Projection (가장 단순)
─────────────────────────────────────────
Vision Features (dim: 1024) → Linear → LLM Input (dim: 4096)

예: LLaVA

장점: 단순함, 학습 빠름
단점: 정보 손실 가능


타입 2: MLP (Multi-Layer Perceptron)
─────────────────────────────────────────
Vision Features → Linear → GELU → Linear → LLM Input

예: LLaVA-1.5

장점: 더 복잡한 변환 가능
단점: 파라미터 증가


타입 3: Q-Former (Querying Transformer)
─────────────────────────────────────────
┌─────────────────────────────────────────────────┐
│                   Q-Former                       │
│                                                  │
│  Learnable Queries [32개]                        │
│         ↓                                        │
│  Cross-Attention with Vision Features            │
│         ↓                                        │
│  32개의 압축된 시각 토큰                         │
└─────────────────────────────────────────────────┘

예: BLIP-2, InstructBLIP

장점: 토큰 수 압축 (효율성)
단점: 세밀한 정보 손실 가능


타입 4: Perceiver Resampler
─────────────────────────────────────────
Flamingo에서 사용
가변 길이 시각 특징 → 고정 길이 토큰으로 변환
```

### 3. Large Language Model

시각 정보와 텍스트를 받아 응답을 생성

```
자주 사용되는 LLM:
─────────────────────────────────────────

Open Source:
├── LLaMA / LLaMA-2 / LLaMA-3
├── Vicuna (LLaMA 기반 instruction-tuned)
├── Mistral / Mixtral
├── Qwen / Qwen-2
└── Phi-2 / Phi-3

Proprietary:
├── GPT-4 (GPT-4V, GPT-4o)
├── Claude 3/3.5 (Opus, Sonnet)
└── Gemini (Pro, Ultra, Nano)
```

---

## LLaVA 아키텍처 상세 분석

LLaVA는 가장 영향력 있는 오픈소스 VLM 중 하나입니다.

### 전체 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                         LLaVA                                    │
│                                                                  │
│  Input: 이미지 + "이 이미지에서 무엇을 볼 수 있나요?"           │
│                                                                  │
│  ┌───────────────┐                                               │
│  │   이미지       │                                              │
│  │  (336x336)    │                                               │
│  └───────┬───────┘                                               │
│          ↓                                                        │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ CLIP ViT-L/14 (Frozen or Fine-tuned)                      │   │
│  │ → 576개 패치 토큰 (24x24 grid, 각 1024차원)               │   │
│  └───────────────────────────────────────────────────────────┘   │
│          ↓                                                        │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ MLP Projection (2-layer)                                   │   │
│  │ 1024 → 4096 차원으로 변환                                  │   │
│  │ → 576개 시각 토큰 (LLM 차원에 맞춤)                        │   │
│  └───────────────────────────────────────────────────────────┘   │
│          ↓                                                        │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                      Vicuna (LLaMA)                        │   │
│  │                                                            │   │
│  │  입력 시퀀스:                                              │   │
│  │  [SYSTEM] [시각토큰x576] [USER: 질문] [ASSISTANT:]        │   │
│  │                                                            │   │
│  │  → Autoregressive 생성                                     │   │
│  └───────────────────────────────────────────────────────────┘   │
│          ↓                                                        │
│  Output: "이 이미지는 해변에서 일몰을 보여줍니다..."             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### LLaVA 학습 과정

```
Stage 1: Pre-training (Feature Alignment)
─────────────────────────────────────────
목적: Vision Encoder와 LLM 연결
데이터: 595K 이미지-캡션 쌍 (CC3M subset)
학습 대상: Projection Layer만 (나머지 Frozen)
손실: 다음 토큰 예측 (Next Token Prediction)

┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ CLIP ViT    │     │ Projection   │     │ Vicuna      │
│ (Frozen)    │────→│ (Training)   │────→│ (Frozen)    │
└─────────────┘     └──────────────┘     └─────────────┘


Stage 2: Fine-tuning (Visual Instruction Tuning)
─────────────────────────────────────────
목적: 지시를 따르는 능력 학습
데이터: 665K 멀티모달 지시-응답 쌍
학습 대상: Projection + LLM (ViT는 선택적)
손실: 다음 토큰 예측

┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ CLIP ViT    │     │ Projection   │     │ Vicuna      │
│ (Optional)  │────→│ (Training)   │────→│ (Training)  │
└─────────────┘     └──────────────┘     └─────────────┘
```

---

## 입력 처리 방식

### 이미지 해상도 처리

```
고정 해상도 (Fixed Resolution):
─────────────────────────────────────────
모든 이미지를 224x224 또는 336x336으로 리사이즈
장점: 단순함
단점: 정보 손실, 종횡비 변형

Dynamic Resolution (AnyRes):
─────────────────────────────────────────
LLaVA-NeXT, Qwen2.5-VL 등에서 사용

┌─────────────────────────────────────────────────┐
│                                                 │
│  원본 이미지 (1920 x 1080)                      │
│         ↓                                       │
│  그리드로 분할 (예: 2x3 = 6개 타일)             │
│         ↓                                       │
│  각 타일 + 전체 썸네일 = 7개 이미지             │
│         ↓                                       │
│  각각 Vision Encoder 통과                       │
│         ↓                                       │
│  7 x 576 = 4032개 시각 토큰                     │
│                                                 │
└─────────────────────────────────────────────────┘

장점: 고해상도 보존, 다양한 종횡비 지원
단점: 토큰 수 증가 → 컨텍스트 길이 부담
```

### 비디오 처리

```
Qwen2.5-VL의 3D Patch 방식:
─────────────────────────────────────────
┌─────────────────────────────────────────────────┐
│                                                 │
│  비디오: T 프레임 x H x W                       │
│         ↓                                       │
│  3D Conv: 여러 프레임을 하나의 토큰으로 압축    │
│         ↓                                       │
│  시공간 정보를 효율적으로 인코딩                │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 주요 VLM 비교

### 오픈소스 VLM

| 모델 | Vision Encoder | LLM | Connector | 특징 |
|------|---------------|-----|-----------|------|
| **LLaVA-1.5** | CLIP ViT-L/14 | Vicuna-7B/13B | MLP | 단순하고 효과적 |
| **LLaVA-NeXT** | CLIP ViT-L/14 | LLaMA-3 등 | MLP + AnyRes | 고해상도 지원 |
| **Qwen2.5-VL** | SigLIP | Qwen-2 | 3D Conv | 비디오, 고해상도 |
| **InternVL-2** | InternViT-6B | InternLM2 | MLP | 대규모 ViT |
| **Phi-3-Vision** | CLIP ViT | Phi-3-mini | Perceiver | 경량화 |

### 성능 벤치마크 (MMMU)

```
MMMU (Massive Multi-discipline Multimodal Understanding):
─────────────────────────────────────────

GPT-4o:              ~70%
Claude 3.5 Sonnet:   ~68%
Gemini 1.5 Pro:      ~65%
Qwen2-VL-72B:        ~64%
LLaVA-NeXT-72B:      ~60%
InternVL-2-76B:      ~62%
LLaVA-1.5-13B:       ~36%

→ 모델 크기와 성능이 대체로 비례
→ 하지만 효율적 설계도 중요 (Qwen, InternVL)
```

---

## VLM의 한계와 도전 과제

### 현재 한계

```
1. Hallucination (환각)
─────────────────────────────────────────
이미지에 없는 내용을 생성하는 문제

예:
이미지: 빨간 사과 1개
응답: "이 이미지에는 빨간 사과 3개가 있습니다"

→ Object Existence, Counting, Position 오류


2. Fine-grained Understanding
─────────────────────────────────────────
세밀한 차이 인식 어려움

예:
- 비슷한 새 종류 구분
- 미세한 표정 변화 인식
- 작은 텍스트 읽기


3. Spatial Reasoning
─────────────────────────────────────────
공간 관계 추론 부족

예:
"왼쪽에 있는 물체는 오른쪽 물체보다 크다"
→ 틀린 답변을 하는 경우 많음


4. Temporal Understanding (비디오)
─────────────────────────────────────────
시간 순서, 인과 관계 파악 어려움
```

### 연구 방향

```
1. 더 효율적인 Vision Encoder
   └── FastVLM (Apple): 경량화된 고해상도 처리

2. 더 나은 Modality Alignment
   └── 시각-언어 간 더 깊은 융합

3. Reasoning 능력 강화
   └── Chain-of-Thought for Vision

4. Multimodal RAG
   └── 외부 지식 활용

5. Multimodal Agents
   └── GUI 조작, 도구 사용
```

---

## 핵심 정리

1. **VLM = Vision Encoder + Projection + LLM**
   - 세 구성 요소의 조합으로 이미지 대화 가능

2. **Projection Layer가 모달리티를 연결**
   - 시각 특징을 언어 모델 공간으로 변환
   - Linear, MLP, Q-Former 등 다양한 방식

3. **2단계 학습이 일반적**
   - Stage 1: Feature Alignment (Projection만)
   - Stage 2: Instruction Tuning (전체 미세조정)

4. **해상도 처리가 성능에 중요**
   - AnyRes, 3D Conv 등 고해상도 처리 기법 발전

5. **Hallucination이 주요 과제**
   - 이미지에 없는 내용 생성 문제

---

## 참고 자료

- [Vision Language Models Explained | Hugging Face](https://huggingface.co/blog/vlms)
- [VLMs 2025: Better, Faster, Stronger | Hugging Face](https://huggingface.co/blog/vlms-2025)
- [LLaVA: Visual Instruction Tuning (원논문)](https://arxiv.org/abs/2304.08485)
- [What Are Vision Language Models? | IBM](https://www.ibm.com/think/topics/vision-language-models)
- [Exploring VLM Survey | arXiv](https://arxiv.org/html/2404.07214v3)

---

*마지막 업데이트: 2025-12-20*
