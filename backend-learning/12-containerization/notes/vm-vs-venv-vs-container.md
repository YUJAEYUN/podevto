# 가상머신 vs Python 가상환경 vs 컨테이너

## 개념 비교

### 1. Python 가상환경 (venv)

**가장 가벼운 격리 수준**

```
Python 가상환경이란?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

단순히 Python 라이브러리만 분리
OS는 공유, Python도 공유

┌─────────────────────────────────────┐
│         운영체제 (Ubuntu)            │
│                                     │
│    ┌──────────────────────┐        │
│    │   Python 3.9 설치    │        │
│    └──────────────────────┘        │
│              │                      │
│    ┌─────────┴──────────┐          │
│    │                    │          │
│ ┌──▼──────┐      ┌──────▼───┐     │
│ │ venv A  │      │  venv B  │     │
│ │         │      │          │     │
│ │Django   │      │ Flask    │     │
│ │2.2      │      │ 2.0      │     │
│ │numpy    │      │ pandas   │     │
│ │1.18     │      │ 1.5      │     │
│ └─────────┘      └──────────┘     │
└─────────────────────────────────────┘

격리 수준:
✓ Python 패키지만 분리
✗ Python 버전은 공유 (3.9 고정)
✗ OS는 공유
✗ 시스템 라이브러리 공유
```

#### 실제 사용 예시

```bash
# Python 가상환경 만들기
$ python3 -m venv myenv

# 가상환경 활성화
$ source myenv/bin/activate

# 패키지 설치
(myenv) $ pip install django==2.2

# 격리 확인
(myenv) $ pip list
Django    2.2.0
...

# 다른 터미널 (가상환경 없음)
$ pip list
# Django가 안 보임

# 하지만 Python은 같은 버전
(myenv) $ python --version
Python 3.9.0

$ python --version
Python 3.9.0  # 똑같음!
```

**Python 가상환경의 한계:**

```bash
# 불가능한 것들:

# 1. 다른 Python 버전 사용 불가
$ python3.8 -m venv env38  # Python 3.8이 없으면 안 됨

# 2. 시스템 패키지 격리 안 됨
$ sudo apt install postgresql-client
→ 모든 가상환경에서 접근 가능

# 3. 포트 격리 안 됨
(venv1) $ python -m http.server 8000 &
(venv2) $ python -m http.server 8000
에러! 포트 충돌

# 4. 파일 시스템 격리 안 됨
(venv1) $ echo "data" > /tmp/file.txt
(venv2) $ cat /tmp/file.txt
data  # 보임!
```

---

### 2. 가상머신 (VM)

**가장 강력한 격리 수준 (무거움)**

```
가상머신이란?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

완전히 독립된 컴퓨터를 소프트웨어로 구현
각 VM마다 OS 전체를 설치해야 함

┌─────────────────────────────────────────────┐
│           물리 서버 (호스트)                 │
│                                             │
│  ┌──────────────────┐  ┌──────────────────┐│
│  │   VM 1           │  │   VM 2           ││
│  │                  │  │                  ││
│  │  ┌────────────┐  │  │  ┌────────────┐ ││
│  │  │ App + Libs │  │  │  │ App + Libs │ ││
│  │  └────────────┘  │  │  └────────────┘ ││
│  │  ┌────────────┐  │  │  ┌────────────┐ ││
│  │  │  Ubuntu    │  │  │  │  CentOS    │ ││
│  │  │  (전체 OS) │  │  │  │  (전체 OS) │ ││
│  │  │  5GB       │  │  │  │  4GB       │ ││
│  │  └────────────┘  │  │  └────────────┘ ││
│  └──────────────────┘  └──────────────────┘│
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │       Hypervisor                    │   │
│  │    (VMware, VirtualBox, KVM)        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │       호스트 OS (macOS)             │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

격리 수준:
✓ 완전히 독립된 OS
✓ 다른 커널 버전 가능
✓ 다른 OS 종류 가능 (Ubuntu, CentOS, Windows)
✓ 하드웨어 레벨 격리
✗ 무거움 (GB 단위)
✗ 느림 (부팅 분 단위)
```

#### 실제 사용 예시

```bash
# VirtualBox로 VM 만들기
1. VirtualBox 설치
2. Ubuntu ISO 다운로드 (2GB)
3. VM 생성 (디스크 20GB 할당)
4. Ubuntu 설치 (20분)
5. 부팅 (2분)
6. Python 설치
7. 앱 설치

# VM 내부에서
$ cat /etc/os-release
Ubuntu 22.04  # 호스트와 다를 수 있음

$ uname -r
5.15.0-generic  # 커널 버전도 독립적

$ df -h
Filesystem      Size  Used  Avail
/dev/sda1       20G   8G    11G   # VM 전용 디스크

# 리소스 사용
VM 하나:
- 디스크: 8GB (OS 포함)
- 메모리: 2GB 할당
- CPU: 2 core 할당
```

**가상머신의 특징:**

```
장점:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 완전한 격리 (가장 안전)
✓ 다른 OS 실행 가능
  - macOS 호스트에서 Linux VM
  - Windows 호스트에서 Ubuntu VM
✓ 다른 커널 버전
  - Linux 5.4와 5.15 동시 실행

단점:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✗ 무거움
  - VM 1개 = 수 GB (OS 포함)
  - 메모리 많이 사용 (GB 단위)
✗ 느림
  - 부팅 시간 분 단위
  - 하이퍼바이저 오버헤드
✗ 관리 복잡
  - OS 업데이트 각각 필요
  - OS 설정 각각 필요
```

---

### 3. 컨테이너 (Docker)

**중간 격리 수준 (가볍고 실용적)**

```
컨테이너란?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OS 커널은 공유하되, 나머지는 격리
OS를 따로 설치할 필요 없음!

┌─────────────────────────────────────────────┐
│           물리 서버 (호스트)                 │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ Container 1  │  │ Container 2  │        │
│  │              │  │              │        │
│  │ App + Libs   │  │ App + Libs   │        │
│  │ Python 3.8   │  │ Python 3.10  │        │
│  │ Django 2.2   │  │ Django 4.0   │        │
│  │ 200MB        │  │ 250MB        │        │
│  └──────────────┘  └──────────────┘        │
│          │                │                 │
│  ┌───────┴────────────────┴──────────────┐  │
│  │      Docker Engine                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │   호스트 OS (Linux 커널)              │  │ ← 공유!
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

격리 수준:
✓ 파일 시스템 격리
✓ 네트워크 격리
✓ 프로세스 격리
✓ 다른 Python 버전 가능
✓ 다른 라이브러리 버전 가능
⚠ OS 커널은 공유
  - 호스트가 Linux면 컨테이너도 Linux
✗ 다른 OS 커널 불가
  - Linux 호스트에서 Windows 컨테이너 불가
```

#### 핵심: OS 공유의 의미

```
OS는 두 부분으로 나뉩니다:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 커널 (Kernel):
   - 하드웨어와 직접 통신
   - 메모리 관리
   - 프로세스 스케줄링
   - 시스템 콜 처리
   → Docker는 이걸 공유

2. 유저스페이스 (Userspace):
   - 파일 시스템 (/bin, /lib, /usr)
   - 설치된 프로그램들
   - 라이브러리들
   - 설정 파일들
   → Docker는 이걸 각각 가짐

┌─────────────────────────────────────┐
│       Container 1                   │
│  /bin, /lib, /usr (Ubuntu 파일들)   │
│  Python 3.8, Django 2.2             │
└────────────┬────────────────────────┘
             │
             ▼ 시스템 콜
┌─────────────────────────────────────┐
│    Linux Kernel (공유)              │  ← 하나만!
│  프로세스 관리, 메모리 관리          │
└────────────┬────────────────────────┘
             │
             ▼ 시스템 콜
┌─────────────────────────────────────┐
│       Container 2                   │
│  /bin, /lib, /usr (CentOS 파일들)   │
│  Python 3.10, Django 4.0            │
└─────────────────────────────────────┘

결과:
- Container 1은 Ubuntu처럼 보임
- Container 2는 CentOS처럼 보임
- 실제 커널은 하나 (호스트의 Linux 커널)
```

---

## 이미지(Image)란?

**이미지 = 실행 파일 + 필요한 모든 것을 담은 패키지**

```
이미지의 개념:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

비유: 설치 파일 (installer)

Windows 프로그램:
- setup.exe → 프로그램 설치 파일
- 실행하면 프로그램이 설치됨
- 여러 번 실행 가능 (여러 곳에 설치)

Docker 이미지:
- myapp.img → 컨테이너 생성 파일
- 실행하면 컨테이너가 생성됨
- 여러 번 실행 가능 (여러 컨테이너 생성)

┌─────────────────────────────────────┐
│         Docker Image                │
│     (읽기 전용 템플릿)               │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ OS 기본 파일 (/bin, /lib)     │  │
│  │ Python 3.9                    │  │
│  │ Django 2.2                    │  │
│  │ 내 앱 코드                     │  │
│  │ 설정 파일                      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
          │
          ├─── docker run → Container 1
          ├─── docker run → Container 2
          └─── docker run → Container 3

이미지 1개로 컨테이너 여러 개 생성 가능
```

### 이미지의 실체

```bash
# 이미지 확인
$ docker images
REPOSITORY    TAG       SIZE
python        3.9       915MB     ← 이미지
ubuntu        22.04     77MB      ← 이미지
nginx         latest    142MB     ← 이미지

# 이미지 내용물
$ docker image inspect python:3.9
{
  "Architecture": "amd64",
  "Os": "linux",
  "Size": 915000000,  # 915MB
  "Layers": [
    "sha256:abc123...",  # Layer 1: Ubuntu 기본 파일
    "sha256:def456...",  # Layer 2: Python 설치
    "sha256:ghi789..."   # Layer 3: pip, setuptools
  ]
}

# 이미지로 컨테이너 만들기
$ docker run python:3.9 python --version
Python 3.9.18

# 같은 이미지로 여러 컨테이너
$ docker run -d --name app1 python:3.9 python -m http.server
$ docker run -d --name app2 python:3.9 python -m http.server
$ docker run -d --name app3 python:3.9 python -m http.server

→ 이미지 1개로 컨테이너 3개 생성
→ 이미지는 그대로 (읽기 전용)
```

### 이미지 만들기 (Dockerfile)

```dockerfile
# Dockerfile: 이미지를 만드는 레시피

# 1단계: 베이스 이미지 선택
FROM ubuntu:22.04

# 2단계: Python 설치
RUN apt-get update && apt-get install -y python3

# 3단계: 내 앱 코드 복사
COPY myapp.py /app/myapp.py

# 4단계: 작업 디렉토리 설정
WORKDIR /app

# 5단계: 실행 명령
CMD ["python3", "myapp.py"]
```

```bash
# 이미지 빌드
$ docker build -t myapp:1.0 .

Step 1/5 : FROM ubuntu:22.04
 ---> 다운로드 중... (77MB)
Step 2/5 : RUN apt-get install python3
 ---> 설치 중...
Step 3/5 : COPY myapp.py /app/
 ---> 복사 완료
Step 4/5 : WORKDIR /app
 ---> 완료
Step 5/5 : CMD python3 myapp.py
 ---> 완료

Successfully built: myapp:1.0

# 이미지 확인
$ docker images
REPOSITORY    TAG       SIZE
myapp         1.0       200MB    ← 방금 만든 이미지!

# 이미지로 컨테이너 실행
$ docker run myapp:1.0
Hello from my app!
```

---

## 레이어 시스템

이미지는 **레이어(층)**로 구성되어 있습니다.

```
이미지 레이어 구조:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

케이크 만들기 비유:

레시피 (Dockerfile):
1. 빵 (베이스)
2. 크림
3. 딸기
4. 초콜릿

완성된 케이크 (이미지):
┌───────────────┐
│  초콜릿       │  Layer 4: 2MB
├───────────────┤
│  딸기         │  Layer 3: 5MB
├───────────────┤
│  크림         │  Layer 2: 10MB
├───────────────┤
│  빵 (베이스)   │  Layer 1: 100MB
└───────────────┘
총 크기: 117MB

특징:
- 각 레이어는 읽기 전용
- 레이어는 재사용 가능
- 변경된 레이어만 다시 만듦
```

### 레이어 재사용 예시

```dockerfile
# 이미지 A
FROM ubuntu:22.04          # Layer 1: 77MB
RUN apt-get install python3 # Layer 2: 50MB
RUN pip install django      # Layer 3: 100MB
COPY app_a.py /app/        # Layer 4: 1MB

# 이미지 B
FROM ubuntu:22.04          # Layer 1: 77MB (재사용!)
RUN apt-get install python3 # Layer 2: 50MB (재사용!)
RUN pip install django      # Layer 3: 100MB (재사용!)
COPY app_b.py /app/        # Layer 4: 2MB (새로 만듦)
```

```bash
# 디스크 사용량
이미지 A: 228MB
이미지 B: 229MB (예상)

실제 디스크 사용량:
228MB + 2MB = 230MB

→ 공통 레이어(227MB)는 한 번만 저장!
→ 디스크 절약
```

---

## 비교 정리

### 스펙트럼으로 보기

```
가벼움 ←──────────────────────────────────→ 무거움
빠름   ←──────────────────────────────────→ 느림
약한 격리 ←────────────────────────────────→ 강한 격리

┌─────────┬─────────┬─────────┐
│  venv   │ Docker  │   VM    │
└─────────┴─────────┴─────────┘

Python 가상환경 (venv):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
크기:    수십 MB
시작:    즉시 (밀리초)
격리:    Python 패키지만
OS:      공유
커널:    공유
용도:    Python 프로젝트 의존성 분리

Docker 컨테이너:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
크기:    수백 MB
시작:    빠름 (초 단위)
격리:    파일 시스템, 네트워크, 프로세스
OS:      유저스페이스 독립, 커널 공유
커널:    공유
용도:    애플리케이션 전체 격리 및 배포

가상 머신 (VM):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
크기:    수 GB
시작:    느림 (분 단위)
격리:    완전 격리
OS:      각각 설치 필요
커널:    독립
용도:    다른 OS 실행, 최대 격리 필요 시
```

### 구체적 비교표

```
┌──────────────┬───────────┬──────────┬────────┐
│   항목       │   venv    │  Docker  │   VM   │
├──────────────┼───────────┼──────────┼────────┤
│ 크기         │ 10-50MB   │ 100-500MB│ 5-20GB │
│ 시작 시간    │ 즉시      │ 1-3초    │ 1-3분  │
│ OS 설치      │ 불필요    │ 불필요   │ 필요   │
│ OS 종류      │ 불가      │ 제한적   │ 자유   │
│ Python 버전  │ 호스트    │ 독립     │ 독립   │
│ 포트 격리    │ ✗         │ ✓        │ ✓      │
│ 파일 격리    │ ✗         │ ✓        │ ✓      │
│ 프로세스 격리│ ✗         │ ✓        │ ✓      │
│ 보안 수준    │ 낮음      │ 중간     │ 높음   │
│ 리소스 효율  │ 최고      │ 높음     │ 낮음   │
│ 이식성       │ 낮음      │ 높음     │ 중간   │
└──────────────┴───────────┴──────────┴────────┘
```

---

## 실전 예제

### 시나리오 1: Python 프로젝트 개발

```bash
# Python 가상환경 사용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 프로젝트 A
$ cd project_a
$ python3 -m venv venv
$ source venv/bin/activate
(venv) $ pip install django==2.2

# 프로젝트 B (동시에 가능)
$ cd project_b
$ python3 -m venv venv
$ source venv/bin/activate
(venv) $ pip install django==4.0

→ Python 패키지만 분리하면 됨
→ 가장 간단하고 빠름
→ Python 개발자들이 일반적으로 사용
```

### 시나리오 2: 웹 애플리케이션 배포

```bash
# Docker 사용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Dockerfile
FROM python:3.9
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python", "app.py"]

# 빌드
$ docker build -t myapp .

# 실행 (어디서든 동일하게)
$ docker run -p 8000:8000 myapp

→ 개발 PC, 서버, 클라우드 어디서든 동일
→ Python 버전, 라이브러리, 설정 모두 포함
→ 현대적인 배포 방식
```

### 시나리오 3: Windows 애플리케이션 테스트

```bash
# VM 사용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# macOS에서 Windows 프로그램 테스트 필요
1. VirtualBox 설치
2. Windows 10 VM 생성
3. Windows 10 ISO로 설치
4. VM에서 Windows 프로그램 실행

→ 완전히 다른 OS 필요
→ VM만 가능
→ Docker는 불가능 (커널이 다름)
```

---

## 실습: 세 가지 방법 비교

### 실습 1: Python 가상환경

```bash
# venv 만들기
$ python3 -m venv test_venv
$ source test_venv/bin/activate

# 패키지 설치
(test_venv) $ pip install requests

# 확인
(test_venv) $ python -c "import requests; print(requests.__version__)"
2.31.0

# 크기 확인
$ du -sh test_venv
45M    # 45MB

# 시작 시간
$ time source test_venv/bin/activate
real    0m0.010s  # 10 밀리초
```

### 실습 2: Docker 컨테이너

```bash
# Dockerfile
FROM python:3.9-slim
RUN pip install requests

# 빌드
$ docker build -t test_docker .

# 크기 확인
$ docker images test_docker
REPOSITORY    TAG     SIZE
test_docker   latest  125MB

# 실행 시간 측정
$ time docker run test_docker python -c "import requests; print(requests.__version__)"
2.31.0
real    0m1.234s  # 1.2초
```

### 실습 3: 가상 머신 (개념적)

```bash
# VM 스펙
- OS 설치: Ubuntu 22.04
- 디스크: 8GB 사용
- 메모리: 2GB 할당
- 부팅 시간: 약 45초
- Python 설치: 추가 5분
```

---

## 언제 무엇을 사용할까?

```
Python 가상환경 (venv) 사용:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Python 프로젝트 로컬 개발
✓ Python 패키지 의존성만 분리 필요
✓ 빠른 프로토타이핑
✓ 간단한 스크립트

예: 데이터 분석, 간단한 스크립트, 학습

Docker 컨테이너 사용:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 웹 애플리케이션 배포
✓ 마이크로서비스
✓ CI/CD 파이프라인
✓ 여러 서비스 조합 (DB, 캐시, 앱)
✓ 팀 협업 (동일한 환경)
✓ 다양한 환경에서 동일하게 실행

예: 웹 서비스, API 서버, 프로덕션 배포

가상 머신 (VM) 사용:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 다른 OS 필요 (Windows, macOS, Linux)
✓ 다른 커널 버전 필요
✓ 최대 보안 격리 필요
✓ 레거시 애플리케이션
✓ OS 레벨 테스트

예: Windows 애플리케이션, OS 테스트, 보안 연구
```

---

## 핵심 정리

### 1. Python 가상환경 ≠ 가상 머신

```
Python venv:
- Python 패키지만 분리
- OS, 커널 모두 공유
- 매우 가벼움

가상 머신:
- OS 전체 분리
- 커널도 독립
- 매우 무거움

→ 완전히 다른 개념!
```

### 2. VM은 OS를 각각 설치해야 함

```
VM 1: Ubuntu 설치 필요 (5GB)
VM 2: CentOS 설치 필요 (4GB)
VM 3: Windows 설치 필요 (10GB)

→ 각 VM마다 전체 OS 설치
→ 디스크, 메모리 많이 사용
```

### 3. Docker는 OS 커널을 공유

```
Docker는 영리하게 설계됨:
- 커널은 호스트 것 사용 (공유)
- 파일 시스템은 각자 가짐 (격리)
- OS를 설치할 필요 없음!

Container 1: Ubuntu 파일들 (100MB)
Container 2: Alpine 파일들 (5MB)
↓
호스트 Linux 커널 (공유)

→ 가볍고 빠름
→ OS 설치 불필요
```

### 4. 이미지 = 컨테이너의 설계도

```
이미지 (Image):
- 읽기 전용 템플릿
- 실행 파일 + 라이브러리 + 설정
- 한 번 만들어서 여러 번 사용

컨테이너 (Container):
- 이미지를 실행한 것
- 실제로 동작하는 인스턴스

비유:
이미지 = 붕어빵 틀
컨테이너 = 구운 붕어빵

이미지 1개로 컨테이너 여러 개 만들기 가능
```

---

## 추가 학습

- [격리의 의미](isolation-explained.md)
- [프로세스 이해하기](process-deep-dive.md)
- [Docker 실습](docker.md)

---

*Last updated: 2026-01-09*
