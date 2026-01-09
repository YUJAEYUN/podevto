# Docker 이미지 완전 해부

## 이미지는 "컴파일"이 아니라 "패키징"

### 컴파일 vs 패키징

```
컴파일 (Compile):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

소스 코드 → 기계어로 변환
예: C, Java, Go

main.c  →  gcc  →  main.exe (바이너리)
App.java → javac → App.class (바이트코드)

결과: 실행 파일 (보통 MB 단위)


패키징 (Packaging):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

실행에 필요한 모든 것을 하나로 묶음
예: Docker 이미지

┌─────────────────────────────────┐
│     Docker 이미지               │
│                                 │
│  1. OS 파일들 (bin, lib)        │  ← 500MB
│  2. Python 실행 파일            │  ← 50MB
│  3. Python 라이브러리           │  ← 100MB
│  4. 내 Python 코드 (원본)       │  ← 1MB
│  5. 설정 파일                   │  ← 1KB
│                                 │
│  총: 약 650MB                   │
└─────────────────────────────────┘

→ 코드를 컴파일하는 게 아니라
→ 필요한 모든 파일을 zip처럼 묶는 것
```

### 이미지 크기가 큰 이유

```
예시: node:18 이미지 (915MB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$ docker image inspect node:18

크기 분석:
1. Ubuntu 기본 파일들:    400MB
   /bin/bash, /lib/libc.so, /usr/bin/*, etc.

2. Node.js 바이너리:      100MB
   /usr/local/bin/node

3. npm + 기본 패키지:     300MB
   /usr/local/lib/node_modules/*

4. 시스템 도구들:         100MB
   curl, wget, git, etc.

5. 기타 의존성:            15MB

총합: 915MB

→ OS 파일 + 런타임 + 도구들 전부 포함
→ "자족적인(self-contained)" 환경
```

---

## 이미지 내부 구조

### 1. 레이어 시스템

이미지는 **레이어(층)**들이 쌓인 구조입니다.

```
레이어 구조 (실제 예시):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$ docker history node:18

IMAGE          CREATED BY                                     SIZE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<missing>      CMD ["node"]                                   0B      ← Layer 7
<missing>      COPY file:xxx /usr/local/bin/                  2KB     ← Layer 6
<missing>      RUN npm install                                200MB   ← Layer 5
<missing>      RUN apt-get install nodejs                     100MB   ← Layer 4
<missing>      RUN apt-get update                             50MB    ← Layer 3
<missing>      ADD file:xxx /                                 150MB   ← Layer 2
<missing>      /bin/sh -c #(nop) ENV PATH=/usr/local/bin     0B      ← Layer 1

총 크기: 502MB

각 레이어는:
- 읽기 전용
- 독립적인 파일 시스템 변경사항
- 이전 레이어 위에 쌓임
```

### 2. 레이어의 실체

각 레이어는 실제로 **tar 파일** (압축된 파일 묶음)입니다.

```bash
# 이미지를 tar로 추출
$ docker save node:18 -o node.tar

# 압축 풀기
$ tar -xf node.tar

# 내용물 확인
$ ls
├── manifest.json          # 이미지 메타데이터
├── abc123.../
│   ├── layer.tar         # Layer 1 (Ubuntu 파일들)
│   └── json              # Layer 메타데이터
├── def456.../
│   ├── layer.tar         # Layer 2 (apt-get update)
│   └── json
├── ghi789.../
│   ├── layer.tar         # Layer 3 (Node.js 설치)
│   └── json
└── ...

# Layer 하나 풀어보기
$ tar -xf abc123/layer.tar
$ ls
bin/    # /bin 디렉토리 내용
lib/    # /lib 디렉토리 내용
usr/    # /usr 디렉토리 내용
etc/    # /etc 디렉토리 내용
...

→ 각 레이어는 파일 시스템의 일부
→ 모든 레이어를 합치면 완전한 파일 시스템
```

### 3. 레이어 병합 (Union File System)

```
레이어들이 어떻게 합쳐지는가:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layer 3: /app/config.json (새 파일)
         /app/main.py (새 파일)

Layer 2: /usr/bin/python (새 파일)
         /usr/lib/python3.9/* (새 파일)

Layer 1: /bin/bash (새 파일)
         /lib/* (새 파일)
         /etc/os-release (새 파일)

↓ Union FS로 병합 ↓

최종 파일 시스템:
/
├── bin/
│   └── bash           (from Layer 1)
├── usr/
│   ├── bin/
│   │   └── python     (from Layer 2)
│   └── lib/
│       └── python3.9/ (from Layer 2)
├── app/
│   ├── main.py        (from Layer 3)
│   └── config.json    (from Layer 3)
├── lib/               (from Layer 1)
└── etc/
    └── os-release     (from Layer 1)

→ 컨테이너는 이걸 하나의 파일 시스템으로 봄
```

### 4. 실제 저장 위치

```bash
# Docker 이미지 저장 위치 (Linux)
$ ls -la /var/lib/docker/

overlay2/           # 레이어 저장 (OverlayFS)
├── abc123.../      # Layer 1 내용
│   ├── diff/       # 실제 파일들
│   │   ├── bin/
│   │   ├── lib/
│   │   └── usr/
│   └── link        # 레이어 링크
├── def456.../      # Layer 2 내용
└── ghi789.../      # Layer 3 내용

image/              # 이미지 메타데이터
└── overlay2/
    └── imagedb/
        └── content/
            └── sha256/
                └── abc123...  # 이미지 정보 (JSON)

# 이미지 정보 보기
$ cat /var/lib/docker/image/overlay2/imagedb/content/sha256/abc123...

{
  "architecture": "amd64",
  "os": "linux",
  "rootfs": {
    "type": "layers",
    "diff_ids": [
      "sha256:layer1_hash",
      "sha256:layer2_hash",
      "sha256:layer3_hash"
    ]
  }
}
```

---

## Dockerfile - 이미지 빌드 스크립트

### Dockerfile이란?

**Dockerfile = 이미지를 만드는 레시피 (스크립트)**

```
비유:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

요리 레시피:
1. 밀가루 준비
2. 물 넣고 반죽
3. 발효 1시간
4. 오븐에 굽기

Dockerfile:
1. 베이스 이미지 선택
2. 파일 복사
3. 명령어 실행
4. 실행 설정
```

### 실제 Dockerfile 예시

```dockerfile
# Dockerfile

# 1단계: 베이스 이미지 (시작점)
FROM ubuntu:22.04

# 2단계: 메타데이터
LABEL maintainer="developer@example.com"
LABEL description="My Python Web App"

# 3단계: 환경 변수 설정
ENV PYTHON_VERSION=3.9
ENV APP_HOME=/app

# 4단계: 시스템 패키지 설치
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# 5단계: 작업 디렉토리 생성
WORKDIR /app

# 6단계: 의존성 파일 복사 (먼저!)
COPY requirements.txt .

# 7단계: Python 패키지 설치
RUN pip3 install -r requirements.txt

# 8단계: 애플리케이션 코드 복사
COPY . .

# 9단계: 포트 노출 (문서화 목적)
EXPOSE 8000

# 10단계: 실행 명령
CMD ["python3", "app.py"]
```

### Dockerfile → 이미지 빌드 과정

```bash
# 이미지 빌드
$ docker build -t myapp:1.0 .

# 실제 빌드 과정:

Step 1/10 : FROM ubuntu:22.04
 ---> ubuntu:22.04 이미지 다운로드
 ---> Layer 1 생성 (77MB)

Step 2/10 : LABEL maintainer="developer@example.com"
 ---> Layer 2 생성 (0B - 메타데이터만)

Step 3/10 : ENV PYTHON_VERSION=3.9
 ---> Layer 3 생성 (0B - 메타데이터만)

Step 4/10 : RUN apt-get update && apt-get install -y python3
 ---> 명령어 실행 중...
 ---> Python 설치 완료
 ---> Layer 4 생성 (100MB)

Step 5/10 : WORKDIR /app
 ---> /app 디렉토리 생성
 ---> Layer 5 생성 (0B)

Step 6/10 : COPY requirements.txt .
 ---> requirements.txt 복사
 ---> Layer 6 생성 (1KB)

Step 7/10 : RUN pip3 install -r requirements.txt
 ---> pip 패키지 설치 중...
 ---> Django, Flask 등 설치
 ---> Layer 7 생성 (50MB)

Step 8/10 : COPY . .
 ---> 애플리케이션 코드 복사
 ---> Layer 8 생성 (5MB)

Step 9/10 : EXPOSE 8000
 ---> 메타데이터 추가
 ---> Layer 9 생성 (0B)

Step 10/10 : CMD ["python3", "app.py"]
 ---> 기본 실행 명령 설정
 ---> Layer 10 생성 (0B)

Successfully built myapp:1.0
총 크기: 232MB (77 + 100 + 50 + 5)
```

### 각 명령어가 레이어를 만듦

```
Dockerfile 명령어 → 레이어 매핑:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FROM ubuntu:22.04
↓
┌─────────────────────────────┐
│ Layer 1: Ubuntu 기본 파일    │  77MB
└─────────────────────────────┘

RUN apt-get install python3
↓
┌─────────────────────────────┐
│ Layer 2: Python 파일 추가    │  100MB
└─────────────────────────────┘

COPY requirements.txt .
↓
┌─────────────────────────────┐
│ Layer 3: requirements.txt   │  1KB
└─────────────────────────────┘

RUN pip install -r requirements.txt
↓
┌─────────────────────────────┐
│ Layer 4: Python 패키지들     │  50MB
└─────────────────────────────┘

COPY . .
↓
┌─────────────────────────────┐
│ Layer 5: 앱 코드             │  5MB
└─────────────────────────────┘

→ 각 명령어가 새로운 레이어 생성
→ 레이어들이 쌓여서 최종 이미지
```

---

## 왜 컨테이너를 사용하는가?

### 시나리오: 로컬 → AWS 배포

당신이 말씀하신 게 정확히 맞습니다!

```
로컬 개발 환경:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

내 맥북:
- macOS
- Python 3.9.7
- Django 4.0
- PostgreSQL 14
- Redis 6.2
→ 완벽하게 동작! ✓


AWS 서버 (Doc
ker 없이):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

문제 1: 이미 다른 Python 설치됨
$ python --version
Python 2.7.18  # 오래된 버전!

문제 2: 다른 팀의 앱도 실행 중
- 팀 A의 앱: Django 2.2 사용
- 팀 B의 앱: Django 3.1 사용

내 앱 설치:
$ pip install Django==4.0
→ 팀 A, B의 앱이 망가짐! ✗

문제 3: PostgreSQL 버전 다름
서버: PostgreSQL 12
내 앱: PostgreSQL 14 필요
→ 호환성 문제

문제 4: 포트 충돌
팀 A의 앱: 8000번 포트 사용 중
내 앱: 8000번 포트 필요
→ 포트 충돌! ✗
```

### Docker를 사용하면

```
AWS 서버 (Docker 사용):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────────────────────────┐
│  팀 A 컨테이너                          │
│  - Python 3.7                          │
│  - Django 2.2                          │
│  - 포트 8000 (내부)                    │
│  - PostgreSQL 12 연결                  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  팀 B 컨테이너                          │
│  - Python 3.8                          │
│  - Django 3.1                          │
│  - 포트 8000 (내부)                    │
│  - MySQL 8.0 연결                      │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  내 컨테이너                            │
│  - Python 3.9.7                        │
│  - Django 4.0                          │
│  - 포트 8000 (내부)                    │
│  - PostgreSQL 14 연결                  │
└────────────────────────────────────────┘

→ 서로 격리됨!
→ 충돌 없음!
→ 각자 독립적으로 실행!
```

### 실제 배포 과정

```bash
# 1. 로컬에서 Dockerfile 작성
$ cat Dockerfile
FROM python:3.9
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python", "app.py"]

# 2. 로컬에서 이미지 빌드
$ docker build -t myapp:1.0 .

# 3. 로컬에서 테스트
$ docker run -p 8000:8000 myapp:1.0
→ 완벽하게 동작! ✓

# 4. 이미지를 레지스트리에 푸시
$ docker tag myapp:1.0 myregistry.com/myapp:1.0
$ docker push myregistry.com/myapp:1.0

# 5. AWS 서버에서 이미지 다운로드
aws$ docker pull myregistry.com/myapp:1.0

# 6. AWS 서버에서 실행
aws$ docker run -d -p 8000:8000 myregistry.com/myapp:1.0
→ 로컬과 똑같이 동작! ✓

핵심:
- 로컬에서 동작하면 서버에서도 동작
- 환경 차이 없음
- 라이브러리 충돌 없음
- "내 컴퓨터에선 되는데" 문제 해결!
```

---

## 실제 예제: 버전 충돌 시나리오

### Docker 없이 (문제 발생)

```bash
# 서버 상태
$ python --version
Python 3.8.10

$ pip list
Django==3.0

# 프로젝트 A 배포 (Django 3.0)
$ cd project-a
$ python manage.py runserver
✓ 동작

# 프로젝트 B 배포 시도 (Django 4.0 필요)
$ cd project-b
$ pip install Django==4.0
→ Django가 4.0으로 업그레이드

$ python manage.py runserver
✓ 동작

# 문제: 프로젝트 A가 망가짐
$ cd project-a
$ python manage.py runserver
✗ 에러! Django 4.0과 호환 안 됨!

# 해결 방법?
→ 매번 재설치? (비현실적)
→ virtualenv? (포트 충돌은 어떻게?)
→ 다른 서버 사용? (비용 증가)
```

### Docker 사용 (문제 해결)

```bash
# 프로젝트 A Dockerfile
FROM python:3.8
RUN pip install Django==3.0
COPY . /app
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# 프로젝트 B Dockerfile
FROM python:3.10
RUN pip install Django==4.0
COPY . /app
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# 서버에서 둘 다 실행
$ docker run -d -p 8001:8000 --name project-a project-a:latest
$ docker run -d -p 8002:8000 --name project-b project-b:latest

# 결과
http://server:8001 → 프로젝트 A (Django 3.0) ✓
http://server:8002 → 프로젝트 B (Django 4.0) ✓

→ 둘 다 정상 동작!
→ 서로 영향 없음!
```

---

## 이미지 레이어 캐싱

### 빌드 최적화

```dockerfile
# 비효율적인 Dockerfile
FROM python:3.9
COPY . /app              # 코드 전체 복사 (자주 변경됨)
WORKDIR /app
RUN pip install -r requirements.txt  # 매번 재설치
CMD ["python", "app.py"]

# 문제:
코드 수정 → COPY . /app이 변경됨
         → 이후 모든 레이어 재빌드
         → pip install 다시 실행 (느림!)


# 효율적인 Dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .   # 의존성 파일만 먼저
RUN pip install -r requirements.txt  # 캐시됨!
COPY . /app              # 코드는 나중에
CMD ["python", "app.py"]

# 장점:
코드 수정 → COPY . /app만 변경됨
         → pip install은 캐시 사용 (빠름!)
```

### 실제 빌드 시간 비교

```bash
# 첫 번째 빌드
$ docker build -t myapp .
Step 1/5: FROM python:3.9        (캐시)
Step 2/5: WORKDIR /app           (캐시)
Step 3/5: COPY requirements.txt  (0.1초)
Step 4/5: RUN pip install        (30초)
Step 5/5: COPY . /app            (0.5초)
총 시간: 31초

# 코드만 수정 후 두 번째 빌드
$ docker build -t myapp .
Step 1/5: FROM python:3.9        (캐시 사용)
Step 2/5: WORKDIR /app           (캐시 사용)
Step 3/5: COPY requirements.txt  (캐시 사용)
Step 4/5: RUN pip install        (캐시 사용!) ← 30초 절약
Step 5/5: COPY . /app            (0.5초)
총 시간: 0.5초!

→ 60배 빠름!
```

---

## 멀티 스테이지 빌드

컴파일이 필요한 언어는 이미지 크기를 줄일 수 있습니다.

```dockerfile
# 나쁜 예: 빌드 도구까지 포함
FROM golang:1.20
WORKDIR /app
COPY . .
RUN go build -o myapp
CMD ["./myapp"]

# 문제:
# - golang 이미지 크기: 800MB
# - 빌드 도구 포함 (gcc, make 등)
# - 실행에는 불필요

최종 이미지: 800MB


# 좋은 예: 멀티 스테이지 빌드
# 1단계: 빌드
FROM golang:1.20 AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp

# 2단계: 실행
FROM alpine:3.18
WORKDIR /app
COPY --from=builder /app/myapp .
CMD ["./myapp"]

# 장점:
# - alpine 이미지: 5MB
# - 빌드 도구 제외
# - 실행 파일만 포함

최종 이미지: 10MB

→ 80배 작아짐!
```

---

## 정리

### 1. 이미지 = 패키징, 컴파일 아님

```
✗ 컴파일: 코드 → 바이너리
✓ 패키징: 모든 것을 하나로 묶음

이미지 내용:
- OS 파일들 (500MB)
- 런타임 (Python, Node) (100MB)
- 라이브러리들 (200MB)
- 내 코드 (원본 그대로) (5MB)

→ 그래서 크기가 큼 (GB 단위)
```

### 2. 이미지 내부 = 레이어들

```
이미지 구조:
┌─────────────────┐
│ Layer 5: 앱 코드 │  5MB
├─────────────────┤
│ Layer 4: pip    │  200MB
├─────────────────┤
│ Layer 3: Python │  100MB
├─────────────────┤
│ Layer 2: apt    │  50MB
├─────────────────┤
│ Layer 1: Ubuntu │  77MB
└─────────────────┘

각 레이어는 tar 파일 (파일 묶음)
합쳐서 하나의 파일 시스템
```

### 3. Dockerfile = 이미지 만드는 레시피

```
✓ 정확합니다!

Dockerfile:
- 이미지를 만드는 방법
- 스크립트 형식
- 각 명령어가 레이어 생성

FROM ubuntu:22.04      → Layer 1
RUN apt-get install    → Layer 2
COPY requirements.txt  → Layer 3
RUN pip install        → Layer 4
COPY . .               → Layer 5
```

### 4. 왜 컨테이너를 사용하는가?

```
✓ 정확합니다!

로컬:
- Python 3.9, Django 4.0
- 완벽하게 동작 ✓

AWS 서버 (Docker 없이):
- Python 2.7 (다른 버전!)
- 다른 앱의 Django 2.2와 충돌
- 포트 충돌
→ 동작 안 함 ✗

AWS 서버 (Docker 사용):
- 컨테이너에 Python 3.9, Django 4.0 포함
- 다른 앱과 격리
- 포트도 격리
→ 로컬과 똑같이 동작 ✓

핵심:
"로컬에서 되면 서버에서도 된다"
→ 환경 차이 없음
→ 라이브러리 충돌 없음
→ 안전한 배포
```

---

## 실전 예제

```bash
# 1. Dockerfile 작성
$ cat Dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]

# 2. 로컬에서 빌드
$ docker build -t myapp:1.0 .
→ 이미지 생성 (500MB)

# 3. 로컬에서 테스트
$ docker run -p 8000:8000 myapp:1.0
→ 정상 동작 확인 ✓

# 4. AWS로 배포
$ docker push myregistry.com/myapp:1.0
$ ssh aws-server
aws$ docker pull myregistry.com/myapp:1.0
aws$ docker run -d -p 8000:8000 myapp:1.0
→ 로컬과 똑같이 동작 ✓

→ 환경 차이 걱정 없음!
```

완벽하게 이해하셨네요! 추가 질문 있으시면 말씀해주세요!

---

## 다음 학습

- [Docker Compose](docker.md)
- [실전 Dockerfile 작성](dockerfile-best-practices.md)
- [이미지 최적화](image-optimization.md)

---

*Last updated: 2026-01-09*
