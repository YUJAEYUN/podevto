# pnpm과 심볼릭 링크

**학습 날짜:** 2026-01-08

## 목차
1. [심볼릭 링크란?](#심볼릭-링크란)
2. [pnpm의 동작 원리](#pnpm의-동작-원리)
3. [디스크 공간 절약 원리](#디스크-공간-절약-원리)
4. [트레이드오프](#트레이드오프)

---

## 심볼릭 링크란?

**심볼릭 링크 (Symbolic Link) = 파일이나 디렉토리의 바로가기**

### 일상 비유

```
집 (실제 파일)         vs      지도의 주소 (심볼릭 링크)
─────────────────            ─────────────────────
실제 물리적 공간 차지          종이 한 장 (거의 공간 안 차지)
집에 가구가 있음               "XX로 123번지" 라고 적혀있음
집을 두 채 지으면 공간 2배      주소를 10개 적어도 공간 거의 그대로
```

### 파일 시스템에서

**일반 파일 복사 (실제 파일 복제):**
```
/project-A/node_modules/lodash/
  ├── index.js (1MB)
  ├── package.json
  └── ...

/project-B/node_modules/lodash/
  ├── index.js (1MB)    ← 같은 내용이지만 완전히 별도 파일!
  ├── package.json
  └── ...

총 디스크 사용량: 2MB (중복!)
```

**심볼릭 링크 (바로가기):**
```
/global-storage/lodash/      ← 실제 파일은 여기 하나만
  ├── index.js (1MB)
  ├── package.json
  └── ...

/project-A/node_modules/lodash → /global-storage/lodash  ← 바로가기
/project-B/node_modules/lodash → /global-storage/lodash  ← 바로가기

총 디스크 사용량: 1MB + 약간 (심볼릭 링크는 거의 공간 안 차지)
```

### 실제 명령어 예시

```bash
# 실제 파일 생성
echo "Hello World" > real-file.txt
ls -lh real-file.txt
# -rw-r--r--  1 user  12 bytes  real-file.txt

# 심볼릭 링크 생성
ln -s real-file.txt link-to-file.txt
ls -lh link-to-file.txt
# lrwxr-xr-x  1 user  13 bytes  link-to-file.txt -> real-file.txt
#                      ↑ 매우 작음!

# 링크를 통해 접근 가능
cat link-to-file.txt
# Hello World  ← 실제 파일 내용 읽어옴!
```

### 동작 원리

```
프로그램이 파일 읽기 시도
    ↓
/project/node_modules/lodash/index.js 접근
    ↓
운영체제: "아, 이건 심볼릭 링크네?"
    ↓
자동으로 /global-storage/lodash/index.js로 이동
    ↓
실제 파일 읽어서 반환
```

**프로그램은 차이를 모름!** 마치 실제 파일이 그 위치에 있는 것처럼 동작합니다.

---

## pnpm의 동작 원리

### npm/yarn의 방식 (중복 저장)

```
프로젝트 구조:
/my-app/
  └── node_modules/
      ├── lodash/        (1MB)
      ├── express/       (500KB)
      └── react/         (300KB)

/another-app/
  └── node_modules/
      ├── lodash/        (1MB) ← 똑같은 버전인데 또 저장!
      └── react/         (300KB) ← 중복!

총 용량: 3.1MB
```

### pnpm의 방식 (심볼릭 링크)

```
전역 저장소 (한 번만 저장):
~/.pnpm-store/
  ├── lodash@4.17.21/    (1MB) ← 실제 파일은 여기 하나만!
  ├── express@4.18.0/    (500KB)
  └── react@18.2.0/      (300KB)

프로젝트들 (심볼릭 링크만):
/my-app/node_modules/
  ├── lodash → ~/.pnpm-store/lodash@4.17.21/  ← 바로가기
  ├── express → ~/.pnpm-store/express@4.18.0/
  └── react → ~/.pnpm-store/react@18.2.0/

/another-app/node_modules/
  ├── lodash → ~/.pnpm-store/lodash@4.17.21/  ← 같은 곳 가리킴!
  └── react → ~/.pnpm-store/react@18.2.0/

총 용량: 1.8MB + 링크(거의 0) = 약 1.8MB (절반 절약!)
```

### 디스크 공간 절약 효과

```bash
# 프로젝트 10개에서 모두 lodash 사용
# npm/yarn: 1MB × 10 = 10MB
# pnpm: 1MB × 1 = 1MB (90% 절약!)
```

### 실제 pnpm 구조

```bash
cd my-app
ls -la node_modules/lodash
# lrwxr-xr-x ... lodash -> ../../.pnpm/lodash@4.17.21/node_modules/lodash

# 실제로는 .pnpm-store를 가리키는 구조
```

---

## 디스크 공간 절약 원리

### 시각적 비교

```
npm/yarn (복사본):
┌─────────┐  ┌─────────┐  ┌─────────┐
│ 프로젝트A │  │ 프로젝트B │  │ 프로젝트C │
│ lodash  │  │ lodash  │  │ lodash  │
│  1MB    │  │  1MB    │  │  1MB    │
└─────────┘  └─────────┘  └─────────┘
총 3MB

pnpm (심볼릭 링크):
┌─────────┐  ┌─────────┐  ┌─────────┐
│ 프로젝트A │  │ 프로젝트B │  │ 프로젝트C │
│   →     │  │   →     │  │   →     │
└────┼────┘  └────┼────┘  └────┼────┘
     │            │            │
     └────────────┼────────────┘
                  ↓
           ┌─────────────┐
           │ 전역 저장소  │
           │   lodash    │
           │    1MB      │
           └─────────────┘
총 1MB
```

### 핵심 원리

1. **실제 파일은 한 곳**에만 저장 (pnpm-store)
2. **각 프로젝트는 링크만** 가지고 있음 (거의 공간 안 차지)
3. **프로그램은 차이를 모름** (투명하게 동작)
4. **결과**: 같은 패키지를 100번 설치해도 디스크는 1번만 차지!

---

## 트레이드오프

### pnpm의 장점

```
✅ 디스크 공간 절약 (중복 제거)
✅ 설치 속도 빠름 (복사 대신 링크)
✅ 엄격한 의존성 관리 (Phantom dependency 방지)
✅ 모노레포에 최적
```

### pnpm의 단점

**1. 호환성 문제**

```javascript
// npm/yarn에서 동작하던 코드
const lodash = require('../../../node_modules/lodash');
// npm: ✅ 동작 (실제 파일이 그 위치에 있음)
// pnpm: ❌ 에러! (심볼릭 링크 구조가 다름)
```

**npm의 flat 구조 (예측 가능):**
```
node_modules/
  ├── react/
  ├── lodash/
  └── express/
```

**pnpm의 strict 구조 (예측 어려움):**
```
node_modules/
  ├── .pnpm/
  │   ├── react@18.0.0/
  │   ├── lodash@4.17.21/
  │   └── express@4.18.0/
  └── react → .pnpm/react@18.0.0/node_modules/react
```

**2. 일부 패키지가 작동 안 함**

```bash
# 오래된 패키지나 잘못 만들어진 패키지
pnpm install old-legacy-package
# ❌ 에러 발생!
# Error: Cannot find module 'peer-dependency'

# 이유: 패키지가 npm의 hoisting(끌어올림)에 의존
```

**npm의 hoisting (끌어올림):**
```
# package.json에 없어도 간접 의존성 접근 가능
node_modules/
  ├── express/
  ├── debug/  ← express가 의존하는 패키지가 올라옴
  └── my-app/
      └── index.js에서 require('debug') 가능! (npm의 관대함)
```

**pnpm의 strict mode:**
```
# package.json에 명시하지 않으면 접근 불가!
node_modules/
  ├── express → ...
  └── my-app/
      └── index.js에서 require('debug') 불가! (pnpm의 엄격함)
```

**3. 생태계 지원 부족**

```bash
# CI/CD, Docker 이미지, 튜토리얼 등이 npm/yarn 기준

# Dockerfile 예시
FROM node:18
COPY package.json .
RUN npm install  # ← 대부분 npm 기준으로 작성됨

# pnpm 사용하려면 직접 수정 필요
FROM node:18
RUN npm install -g pnpm  # ← pnpm 먼저 설치
COPY package.json pnpm-lock.yaml .
RUN pnpm install
```

**4. 디버깅 어려움**

```bash
# npm: node_modules 열어보면 파일 그대로 보임
node_modules/lodash/index.js  # 실제 파일

# pnpm: 심볼릭 링크 구조 이해 필요
node_modules/lodash → .pnpm/lodash@4.17.21/node_modules/lodash
# ↑ 어디 있는지 찾기 어려움
```

---

## npm vs pnpm 비교

| 항목 | npm | pnpm |
|------|-----|------|
| **디스크 공간** | ❌ 중복 저장 | ✅ 공유 저장 |
| **설치 속도** | ❌ 느림 | ✅ 빠름 |
| **호환성** | ✅ 거의 모든 패키지 | ❌ 일부 안 됨 |
| **생태계** | ✅ 광범위한 지원 | ⚠️ 제한적 |
| **러닝 커브** | ✅ 낮음 | ⚠️ 중간 |
| **의존성 엄격성** | ❌ 느슨함 (버그 숨김) | ✅ 엄격함 (버그 발견) |
| **디버깅** | ✅ 직관적 | ❌ 복잡함 |
| **팀 도입** | ✅ 쉬움 | ⚠️ 교육 필요 |

---

## 실무 선택 기준

### npm 선택

```
✅ 팀이 작고 npm에 익숙
✅ 레거시 프로젝트 (오래된 패키지 많음)
✅ 빠른 프로토타이핑 (설정 신경 안 쓰고 싶음)
✅ 디스크 공간이 충분함
✅ 안정성/호환성이 최우선
```

### pnpm 선택

```
✅ 모노레포 프로젝트
✅ 프로젝트가 많음 (10개 이상)
✅ 디스크 공간 부족
✅ 의존성 관리를 엄격하게 하고 싶음
✅ 최신 패키지 생태계 (잘 관리된 패키지들)
✅ 팀이 새 도구 학습에 적극적
```

---

## 정리

**심볼릭 링크:**
- 실제 파일 위치를 가리키는 포인터 (바로가기)
- Windows의 "바로가기", macOS/Linux의 "Alias"와 비슷

**pnpm:**
- 실제 파일은 한 곳(pnpm-store)에만 저장
- 각 프로젝트는 링크만 가지고 있음
- 같은 패키지를 100번 설치해도 디스크는 1번만 차지

**트레이드오프:**
- 기술적으로는 pnpm이 우수 (속도, 공간)
- 현실적으로는 npm이 안전 (호환성, 생태계)

**은탄환(Silver Bullet)은 없습니다!** 프로젝트 상황, 팀 상황에 따라 선택하세요.

---

## 참고 자료

- [pnpm 공식 문서](https://pnpm.io/)
- [Symbolic Links 설명 | Wikipedia](https://en.wikipedia.org/wiki/Symbolic_link)
- [pnpm vs npm vs yarn](https://pnpm.io/benchmarks)
