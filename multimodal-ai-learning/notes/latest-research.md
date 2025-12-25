# 최신 연구 동향 (2024-2025)

> 멀티모달 AI 이미지 이해 분야의 최신 발전과 핵심 연구

## 2024-2025 주요 트렌드

### 전체 흐름

```
2020-2021: 기초 모델 등장
─────────────────────────────────────────
├── ViT (2020): Vision Transformer 제안
├── CLIP (2021): 이미지-텍스트 대조학습
└── 기초 아키텍처 확립

2022-2023: VLM 폭발
─────────────────────────────────────────
├── Flamingo, BLIP-2: 효율적 연결 방법
├── LLaVA: 오픈소스 Visual Instruction Tuning
├── GPT-4V: 상용 멀티모달 AI 시작
└── 다양한 오픈소스 모델 등장

2024-2025: 고도화 단계
─────────────────────────────────────────
├── 더 작고 효율적인 모델
├── 고해상도 & 비디오 처리
├── Reasoning 능력 강화
├── Multimodal Agents
└── 도메인 특화 모델
```

---

## 2024년 주요 발전

### 1. 효율적인 소형 VLM

```
Small Vision-Language Models (SVLMs) 부상:
─────────────────────────────────────────

Microsoft Phi-3-Vision (2024)
├── 크기: 4.2B 파라미터
├── 장점: 모바일/온디바이스 실행 가능
├── 특징: 적은 자원으로 준수한 성능
└── 벤치마크: MMBench 69.2%

Apple FastVLM (2024)
├── 하이브리드 Vision Encoder
├── 고해상도 이미지 효율적 처리
├── 실시간 애플리케이션 목표
└── on-device 시각 질의 가능

Moondream (커뮤니티)
├── 2B 미만 파라미터
├── 개인 장치에서 실행 가능
└── 빠른 추론 속도
```

### 2. 고해상도 & Dynamic Resolution

```
AnyRes / Dynamic Resolution 기법:
─────────────────────────────────────────

기존 문제:
이미지를 224x224로 압축 → 세부 정보 손실

해결 방식:

LLaVA-NeXT (2024)
├── 이미지를 그리드로 분할 (예: 2x3)
├── 각 타일 독립적 인코딩
├── 전체 썸네일도 함께 사용
└── 최대 4K 해상도 지원

Qwen2.5-VL (2024-2025)
├── Native resolution 지원
├── 3D Conv로 프레임 압축
├── 비디오와 이미지 통합 처리
└── 다양한 종횡비 자연스럽게 처리

InternVL-2 (2024)
├── Dynamic Resolution
├── 6B 파라미터 Vision Encoder
└── 세밀한 시각 인식
```

### 3. 대규모 모델 경쟁

```
Frontier Model 발전:
─────────────────────────────────────────

GPT-4o (OpenAI, 2024.05)
├── 네이티브 멀티모달 (audio + vision + text)
├── 실시간 대화 가능
├── 이미지 생성도 지원 (GPT-4o + DALL-E)
└── 벤치마크 최상위권

Claude 3.5 (Anthropic, 2024)
├── Opus: 복잡한 추론에 강함
├── Sonnet: 균형잡힌 성능
├── 문서 분석에 특히 우수
└── 안전성 강조

Gemini 1.5 Pro (Google, 2024)
├── 1M 토큰 컨텍스트
├── 긴 비디오 이해 가능
├── 멀티모달 RAG 활용
└── 다국어 지원 강화
```

---

## 핵심 연구 논문 (2024-2025)

### Vision Encoder 발전

```
SigLIP (Google, 2024)
─────────────────────────────────────────
"Sigmoid Loss for Language Image Pre-Training"

기존 CLIP: Softmax 기반 대조학습
SigLIP: Sigmoid 기반으로 변경

장점:
├── 배치 크기에 덜 민감
├── 학습 효율성 향상
└── 여러 VLM에서 채택 (PaliGemma, Idefics2)


DINOv2 (Meta, 2024)
─────────────────────────────────────────
"Self-Supervised Learning with Transformers"

자기지도학습 기반 Vision Encoder
├── 라벨 없이 시각 표현 학습
├── 세밀한 특징 추출에 강함
├── CLIP과 상호보완적
└── Depth estimation, Segmentation에도 활용
```

### VLM 아키텍처 혁신

```
LLaVA-NeXT Series (2024)
─────────────────────────────────────────

LLaVA-NeXT-Stronger (2024.05)
├── LLaMA-3-8B 기반
├── Qwen-1.5-72B/110B 지원
└── 향상된 reasoning

LLaVA-NeXT-Video (2024.05)
├── 이미지 학습만으로 비디오 이해
├── Zero-shot video QA
└── 효율적인 시간 모델링


MiniCPM-V Series (2024)
─────────────────────────────────────────
"Small but Mighty"

├── 2B-8B 파라미터
├── 모바일 배포 가능
├── 고해상도 지원 (1344x1344)
└── 중국어 이해 강화


InternVL 2.0 (2024)
─────────────────────────────────────────
"Scaling Up Vision Foundation Model"

├── InternViT-6B: 대형 Vision Encoder
├── 108B 최대 크기
├── 중국어+영어 Bilingual
└── 세밀한 OCR, 문서 이해
```

### Reasoning 강화

```
Chain-of-Thought for Vision (2024)
─────────────────────────────────────────

기존 문제:
이미지 질문 → 바로 답변 (추론 과정 불투명)

연구 방향:
이미지 질문 → 단계별 추론 → 최종 답변

예시:
Q: "테이블 위에 사과가 몇 개 있나요?"
A: "먼저 테이블을 찾습니다.
    테이블 위의 물체들을 확인합니다.
    빨간 사과 2개, 초록 사과 1개가 있습니다.
    총 3개입니다."


Visual Self-Consistency (2024)
─────────────────────────────────────────
여러 관점/방법으로 추론 후 일치하는 답 선택
Hallucination 감소에 효과적
```

---

## 새로운 연구 방향

### 1. Multimodal RAG

```
개념:
─────────────────────────────────────────
텍스트 RAG처럼 이미지/비디오도 검색 활용

┌─────────────────────────────────────────────────┐
│                Multimodal RAG                   │
│                                                 │
│  질문: "이 건물의 역사는?"                      │
│  이미지: [에펠탑 사진]                          │
│         ↓                                       │
│  1. 이미지 임베딩 생성 (CLIP)                   │
│  2. 유사한 이미지/문서 검색                     │
│  3. 검색된 정보 + 원본 이미지 → VLM             │
│  4. 풍부한 컨텍스트로 응답                      │
│         ↓                                       │
│  "이것은 1889년 파리 세계 박람회를 위해..."     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. Multimodal Agents

```
GUI 조작 에이전트:
─────────────────────────────────────────

예시: 컴퓨터 사용 에이전트

1. 화면 스크린샷 → VLM 분석
2. 버튼, 텍스트 필드 등 인식
3. 클릭, 타이핑 액션 결정
4. 실제 GUI 조작 수행

관련 연구:
├── Claude Computer Use (2024)
├── WebVoyager (CMU)
├── OSWorld (benchmark)
└── SeeAct (OSU)


도구 사용 에이전트:
─────────────────────────────────────────
├── 이미지 분석 → 필요한 도구 선택
├── 계산기, 코드 실행, 웹 검색 등 활용
└── 복합적인 태스크 해결
```

### 3. 도메인 특화 VLM

```
의료 영상:
─────────────────────────────────────────
├── MedPaLM-M (Google)
├── LLaVA-Med
├── 의료 영상 + 진단 리포트 생성
└── FDA 승인 도전 과제

문서 이해:
─────────────────────────────────────────
├── DocOwl, Pix2Struct
├── 표, 차트, 수식 이해
├── 멀티페이지 문서 처리
└── OCR + Layout 분석

과학 연구:
─────────────────────────────────────────
├── 분자 구조 이해
├── 위성 이미지 분석
├── 현미경 이미지 분석
└── 데이터 시각화 해석
```

---

## 벤치마크 동향

### 주요 벤치마크

| 벤치마크           | 평가 내용         | 특징               |
| -------------- | ------------- | ---------------- |
| **MMMU**       | 대학 수준 멀티모달 이해 | 11.5K 문제, 6개 분야  |
| **MMBench**    | 다양한 시각 능력     | 3000 문제, 20개 능력  |
| **SEED-Bench** | 이미지+비디오 이해    | 19K 문제, 27개 평가 축 |
| **VQAv2**      | 시각 질의응답       | 고전적 벤치마크         |
| **TextVQA**    | 이미지 내 텍스트 이해  | OCR 능력 평가        |

### 2024 벤치마크 순위 (MMMU 기준)

```
MMMU Leaderboard (2024-2025):
─────────────────────────────────────────

1. GPT-4o                    ~70%
2. Claude 3.5 Sonnet         ~68%
3. Gemini 1.5 Pro           ~65%
4. Qwen2-VL-72B             ~64%
5. InternVL-2-76B           ~62%
6. LLaVA-NeXT-110B          ~61%
   ...
   Open models catching up!

주목할 점:
├── 오픈소스와 상용 모델 격차 감소
├── 소형 모델(7B-13B) 성능 급상승
└── 특화 벤치마크에서 오픈소스 우위도 있음
```

---

## 2025 전망

### 예상 발전 방향

```
1. 더 작고 효율적인 모델
─────────────────────────────────────────
├── On-device VLM 상용화
├── 2B 미만 모델도 실용적 성능
├── Edge AI 활용 증가
└── 배터리/컴퓨팅 효율성

2. 실시간 비디오 이해
─────────────────────────────────────────
├── 스트리밍 비디오 분석
├── 자율주행, 로보틱스 적용
├── 실시간 액션 인식
└── 시공간 추론 강화

3. 범용 에이전트
─────────────────────────────────────────
├── 컴퓨터/모바일 자동화
├── 멀티스텝 태스크 수행
├── 도구 사용 일반화
└── 자율 계획 및 실행

4. 3D/공간 이해
─────────────────────────────────────────
├── 2D 이미지에서 3D 추론
├── 공간 관계 이해 개선
├── 로보틱스 연동
└── AR/VR 활용

5. 안전성과 신뢰성
─────────────────────────────────────────
├── Hallucination 감소
├── 편향 검출 및 완화
├── Explainability 개선
└── 안전한 배포 프레임워크
```

---

## 핵심 GitHub 저장소

### 연구 추적

| 저장소 | 설명 |
|--------|------|
| [Awesome-VLM-Architectures](https://github.com/gokayfem/awesome-vlm-architectures) | VLM 아키텍처 총정리 |
| [Awesome-Unified-Multimodal-Models](https://github.com/AIDC-AI/Awesome-Unified-Multimodal-Models) | 2023-2025 통합 멀티모달 모델 |
| [LLaVA](https://github.com/haotian-liu/LLaVA) | 핵심 오픈소스 VLM |
| [Qwen-VL](https://github.com/QwenLM/Qwen-VL) | 알리바바 VLM |
| [InternVL](https://github.com/OpenGVLab/InternVL) | 대규모 VLM |

---

## 핵심 정리

1. **효율성 중시**: 소형 모델도 실용적 성능 달성
2. **고해상도 처리**: Dynamic Resolution, AnyRes 기법 표준화
3. **비디오 확장**: 이미지 → 비디오 이해로 자연스러운 확장
4. **Reasoning 강화**: Chain-of-Thought, Self-Consistency 적용
5. **에이전트화**: GUI 조작, 도구 사용 능력 개발
6. **도메인 특화**: 의료, 문서, 과학 등 전문 분야 적용

---

## 참고 자료

- [VLMs 2025 | Hugging Face Blog](https://huggingface.co/blog/vlms-2025)
- [Multimodal LLMs Transforming CV | Edge AI](https://www.edge-ai-vision.com/2025/01/multimodal-large-language-models-transforming-computer-vision/)
- [CVPR 2025 Workshop on CV in the Wild](https://computer-vision-in-the-wild.github.io/cvpr-2025/)
- [Awesome Unified Multimodal Models | GitHub](https://github.com/AIDC-AI/Awesome-Unified-Multimodal-Models)

---

*마지막 업데이트: 2025-12-20*
