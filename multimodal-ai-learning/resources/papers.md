# 핵심 논문 및 연구 자료

> 멀티모달 AI 이미지 이해 분야의 필수 논문들

## 필독 논문 (Foundation Papers)

### Vision Transformer

| 논문 | 연도 | 핵심 기여 |
|------|------|-----------|
| [An Image is Worth 16x16 Words](https://arxiv.org/abs/2010.11929) | 2020 | ViT 제안, 이미지를 패치 토큰으로 처리 |
| [DeiT](https://arxiv.org/abs/2012.12877) | 2020 | 데이터 효율적 ViT 학습 |
| [Swin Transformer](https://arxiv.org/abs/2103.14030) | 2021 | 계층적 ViT, Shifted Window |
| [BEiT](https://arxiv.org/abs/2106.08254) | 2021 | BERT 스타일 이미지 사전학습 |

### Contrastive Learning / CLIP

| 논문 | 연도 | 핵심 기여 |
|------|------|-----------|
| [CLIP](https://arxiv.org/abs/2103.00020) | 2021 | 이미지-텍스트 대조학습, Zero-shot |
| [ALIGN](https://arxiv.org/abs/2102.05918) | 2021 | 노이즈 있는 대규모 데이터 활용 |
| [SigLIP](https://arxiv.org/abs/2303.15343) | 2023 | Sigmoid 기반 대조학습 |
| [OpenCLIP](https://arxiv.org/abs/2212.07143) | 2022 | CLIP 오픈소스 재현 및 확장 |

### Vision-Language Models

| 논문 | 연도 | 핵심 기여 |
|------|------|-----------|
| [Flamingo](https://arxiv.org/abs/2204.14198) | 2022 | Few-shot 멀티모달 학습 |
| [BLIP](https://arxiv.org/abs/2201.12086) | 2022 | 캡셔닝 + 이해 통합 |
| [BLIP-2](https://arxiv.org/abs/2301.12597) | 2023 | Q-Former로 효율적 연결 |
| [LLaVA](https://arxiv.org/abs/2304.08485) | 2023 | Visual Instruction Tuning |
| [LLaVA-NeXT](https://llava-vl.github.io/blog/2024-01-30-llava-next/) | 2024 | 고해상도, 개선된 성능 |
| [InstructBLIP](https://arxiv.org/abs/2305.06500) | 2023 | Instruction-aware 시각 특징 |

---

## 주제별 분류

### 1. 아키텍처 혁신

```
Vision Encoder 발전:
─────────────────────────────────────────
├── ViT (2020) - 기초 아키텍처
├── DeiT (2020) - 효율적 학습
├── Swin (2021) - 계층적 구조
├── BEiT (2021) - 마스크 모델링
├── EVA-CLIP (2023) - 대규모 사전학습
└── SigLIP (2023) - 개선된 대조학습

Modality Connector 발전:
─────────────────────────────────────────
├── Linear Projection (LLaVA)
├── Q-Former (BLIP-2)
├── Perceiver Resampler (Flamingo)
└── C-Abstractor (Honeybee)
```

### 2. 학습 방법론

| 논문 | 핵심 방법 |
|------|-----------|
| [Visual Instruction Tuning (LLaVA)](https://arxiv.org/abs/2304.08485) | GPT-4로 생성한 instruction 데이터 |
| [Bootstrapping (BLIP)](https://arxiv.org/abs/2201.12086) | 캡션 생성 → 필터링 → 재학습 |
| [Contrastive Captioners (CoCa)](https://arxiv.org/abs/2205.01917) | 대조학습 + 캡셔닝 결합 |
| [Self-Supervised (DINO)](https://arxiv.org/abs/2104.14294) | 라벨 없는 시각 표현 학습 |

### 3. 효율성 연구

| 논문 | 핵심 기여 |
|------|-----------|
| [TinyViT](https://arxiv.org/abs/2207.10666) | 소형 고효율 ViT |
| [FastViT](https://arxiv.org/abs/2303.14189) | 모바일 친화적 ViT |
| [FastVLM](https://arxiv.org/abs/2412.04460) | 효율적 VLM 인코딩 |
| [MiniCPM-V](https://arxiv.org/abs/2408.01800) | 경량 멀티모달 모델 |

### 4. 고해상도 / 비디오 처리

| 논문 | 핵심 기여 |
|------|-----------|
| [LLaVA-NeXT](https://llava-vl.github.io/blog/2024-01-30-llava-next/) | AnyRes 고해상도 처리 |
| [Qwen-VL](https://arxiv.org/abs/2308.12966) | 다양한 해상도 지원 |
| [InternVL](https://arxiv.org/abs/2312.14238) | Dynamic Resolution |
| [Video-LLaVA](https://arxiv.org/abs/2311.10122) | 비디오 이해 |
| [LongVA](https://arxiv.org/abs/2406.16852) | 긴 비디오 처리 |

---

## 연도별 주요 발전

### 2020년
- **ViT**: Transformer의 Vision 적용 성공
- **DeiT**: 적은 데이터로도 ViT 학습 가능

### 2021년
- **CLIP**: 이미지-텍스트 연결의 새 패러다임
- **Swin Transformer**: 효율적인 계층적 ViT

### 2022년
- **Flamingo**: LLM + Vision 결합의 시작
- **BLIP**: 캡셔닝과 이해의 통합

### 2023년
- **BLIP-2**: Q-Former로 효율적 연결
- **LLaVA**: Visual Instruction Tuning
- **GPT-4V**: 상용 멀티모달 AI 시작
- **Qwen-VL**: 강력한 오픈소스 VLM

### 2024년
- **LLaVA-NeXT**: 고해상도, 비디오 확장
- **GPT-4o**: 네이티브 멀티모달
- **Claude 3**: 문서 이해 강화
- **효율성 연구 활발**: FastVLM, MiniCPM-V 등

---

## 서베이 논문

종합적인 이해를 위한 리뷰 논문들:

| 논문 | 설명 |
|------|------|
| [A Survey on Vision Transformer](https://arxiv.org/abs/2012.12556) | ViT 계열 종합 리뷰 |
| [VLP: A Survey](https://arxiv.org/abs/2202.09061) | Vision-Language 사전학습 서베이 |
| [Multimodal LLMs Survey](https://arxiv.org/abs/2306.13549) | 멀티모달 LLM 종합 리뷰 |
| [Exploring VLM Frontiers](https://arxiv.org/abs/2404.07214) | VLM 최신 동향 (2024) |
| [Small VLMs Survey](https://arxiv.org/abs/2411.00307) | 소형 VLM 서베이 (2024) |

---

## 논문 읽기 순서 추천

### 입문자용 (순서대로)

```
1. ViT (2020)
   └── 기본 아키텍처 이해

2. CLIP (2021)
   └── 이미지-텍스트 연결 원리

3. LLaVA (2023)
   └── VLM의 기본 구조와 학습 방법

4. Multimodal LLMs Survey (2023)
   └── 전체 분야 조망
```

### 심화 학습용

```
아키텍처 심화:
├── Swin Transformer
├── BLIP-2 (Q-Former)
└── Flamingo (Perceiver Resampler)

학습 방법 심화:
├── Contrastive Learning 논문들
├── Visual Instruction Tuning
└── Self-Supervised Learning

최신 동향:
├── LLaVA-NeXT
├── Qwen-VL
└── InternVL
```

---

## 코드와 함께 보기

| 논문 | 공식 구현 |
|------|-----------|
| ViT | [google-research/vision_transformer](https://github.com/google-research/vision_transformer) |
| CLIP | [openai/CLIP](https://github.com/openai/CLIP) |
| OpenCLIP | [mlfoundations/open_clip](https://github.com/mlfoundations/open_clip) |
| LLaVA | [haotian-liu/LLaVA](https://github.com/haotian-liu/LLaVA) |
| BLIP-2 | [salesforce/LAVIS](https://github.com/salesforce/LAVIS) |
| InternVL | [OpenGVLab/InternVL](https://github.com/OpenGVLab/InternVL) |
| Qwen-VL | [QwenLM/Qwen-VL](https://github.com/QwenLM/Qwen-VL) |

---

*마지막 업데이트: 2025-12-20*
