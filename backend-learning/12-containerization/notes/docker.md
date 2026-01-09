# Docker (도커)

## 도커란?

**Docker**는 애플리케이션을 컨테이너라는 표준화된 유닛으로 패키징하여 어디서든 동일하게 실행할 수 있게 해주는 오픈소스 플랫폼입니다.

```
전통적인 배포
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
개발 환경: "내 컴퓨터에서는 잘 되는데..."
테스트 환경: "여기선 안 돌아가네요?"
운영 환경: "왜 여기선 또 다르게 동작하죠?"

→ 환경마다 다른 문제 발생
→ 의존성 충돌
→ 배포 시간 오래 걸림

도커 사용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
개발 환경: 컨테이너로 실행 ✓
테스트 환경: 동일한 컨테이너 ✓
운영 환경: 동일한 컨테이너 ✓

→ 어디서든 동일하게 동작
→ "Build once, run anywhere"
```

---

## 도커의 탄생 배경

### 2008년: 도커 이전 시대

```
문제점들:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ 환경 설정 복잡
   → Python 2.7? 3.6? 라이브러리 버전은?

❌ 의존성 충돌
   → 프로젝트 A는 Node 12, B는 Node 14 필요

❌ 배포 시간 오래 걸림
   → 서버마다 수동 설치/설정

❌ 리소스 낭비
   → VM은 무겁고 느림 (OS 전체 포함)
```

### 2013년: Docker 탄생

**Solomon Hykes**가 dotCloud(PaaS 회사)에서 내부 도구로 개발하다가 오픈소스로 공개

```
혁신적인 점:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 리눅스 컨테이너 기술을 쉽게 사용
✓ 이미지 기반 배포
✓ Dockerfile로 환경을 코드로 관리
✓ Docker Hub로 이미지 공유
```

### 2014~현재: 폭발적 성장

```
2014년 → Docker 1.0 출시
2015년 → Kubernetes와 함께 성장
2016년 → Docker Swarm (오케스트레이션)
2017년 → Docker EE (Enterprise Edition)
2020년 → 대부분의 클라우드 서비스가 Docker 지원
2024년 → 사실상 컨테이너 표준
```

---

## 왜 도커가 인기가 많은가?

### 1. 일관성 (Consistency)

```
개발자의 꿈:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"내 컴퓨터에서 돌아가면 어디서든 돌아간다!"

도커 이전:
개발(Mac) → 테스트(Ubuntu) → 운영(CentOS)
각 환경마다 설정 다름, 버전 다름 → 문제 발생

도커 사용:
개발(Container) → 테스트(Container) → 운영(Container)
동일한 컨테이너 이미지 → 어디서든 동일하게 동작 ✓
```

### 2. 격리성 (Isolation)

```
VM vs Container
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

가상 머신 (VM):
┌─────────────────────┐
│   App A   │  App B  │
├───────────┼─────────┤
│  Guest OS │ Guest OS│  ← 각 VM마다 OS 필요
├───────────┴─────────┤
│     Hypervisor      │
├─────────────────────┤
│      Host OS        │
└─────────────────────┘
크기: 수 GB
부팅: 분 단위
리소스: 많이 사용

컨테이너 (Docker):
┌─────────────────────┐
│   App A   │  App B  │
├───────────┼─────────┤
│   Docker Engine     │  ← OS 공유
├─────────────────────┤
│      Host OS        │
└─────────────────────┘
크기: 수십~수백 MB
부팅: 초 단위
리소스: 적게 사용
```

### 3. 빠른 배포

```
전통적 배포:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 서버 준비 (30분)
2. OS 설치 (20분)
3. 의존성 설치 (10분)
4. 애플리케이션 배포 (10분)
5. 설정 및 테스트 (30분)
총: 약 1.5시간

도커 배포:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. docker pull myapp:latest (1분)
2. docker run myapp (10초)
총: 약 1분
```

### 4. 마이크로서비스 친화적

```
모놀리식:
┌──────────────────────┐
│  거대한 하나의 앱     │
│  - 유저 관리          │
│  - 결제               │
│  - 주문               │
│  - 배송               │
└──────────────────────┘
→ 배포 느림, 확장 어려움

마이크로서비스 + Docker:
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ User   │ │Payment │ │ Order  │ │Delivery│
│Service │ │Service │ │Service │ │Service │
└────────┘ └────────┘ └────────┘ └────────┘
   ↓          ↓          ↓          ↓
각각 독립적인 Docker 컨테이너
→ 개별 배포, 개별 확장 가능
```

### 5. DevOps와 CI/CD

```
CI/CD 파이프라인:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
코드 푸시
   ↓
자동 빌드 (Docker 이미지)
   ↓
자동 테스트 (컨테이너에서)
   ↓
자동 배포 (Kubernetes/ECS/등)
   ↓
운영 환경 (컨테이너 실행)

→ 전체 과정 자동화 가능
→ 배포 시간 단축 (몇 분 내)
→ 롤백 쉬움 (이전 이미지로 교체)
```

---

## 도커의 원리

### 핵심 개념

```
Docker 아키텍처
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────────────────┐
│      Docker Client (CLI)       │
│    $ docker run, build, etc    │
└───────────┬────────────────────┘
            │ REST API
┌───────────▼────────────────────┐
│      Docker Daemon             │
│  - 이미지 관리                  │
│  - 컨테이너 생명주기 관리       │
│  - 네트워크 관리                │
│  - 볼륨 관리                    │
└───────────┬────────────────────┘
            │
    ┌───────┼───────┐
    │       │       │
┌───▼───┐ ┌─▼────┐ ┌─▼────┐
│Image 1│ │Cont 1│ │Vol 1 │
└───────┘ └──────┘ └──────┘
```

### 1. 이미지 (Image)

이미지는 컨테이너를 만들기 위한 **읽기 전용 템플릿**입니다.

```
이미지 레이어 구조:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────────────┐
│   Your App Code      │ Layer 5 (2MB)
├──────────────────────┤
│   npm install        │ Layer 4 (50MB)
├──────────────────────┤
│   Node.js            │ Layer 3 (100MB)
├──────────────────────┤
│   OS Libraries       │ Layer 2 (80MB)
├──────────────────────┤
│   Base OS (Ubuntu)   │ Layer 1 (200MB)
└──────────────────────┘

특징:
✓ 각 레이어는 읽기 전용
✓ 레이어 재사용 가능 (캐싱)
✓ 변경된 레이어만 다운로드
```

```dockerfile
# Dockerfile 예제
FROM node:18-alpine      # Base 이미지

WORKDIR /app             # 작업 디렉토리

COPY package*.json ./    # 의존성 파일 복사
RUN npm install          # 의존성 설치

COPY . .                 # 소스코드 복사

EXPOSE 3000              # 포트 노출
CMD ["node", "server.js"] # 실행 명령
```

### 2. 컨테이너 (Container)

컨테이너는 이미지의 **실행 가능한 인스턴스**입니다.

```
이미지 vs 컨테이너:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이미지 (Image)          컨테이너 (Container)
    = 클래스                = 인스턴스
    = 레시피                = 요리
    = 설계도                = 건물

하나의 이미지로 여러 컨테이너 생성 가능:

[Node.js Image]
      │
      ├─→ Container 1 (API 서버)
      ├─→ Container 2 (백그라운드 작업)
      └─→ Container 3 (테스트)
```

### 3. 리눅스 커널 기술

도커는 리눅스 커널의 두 가지 핵심 기술을 사용합니다.

#### Namespaces (격리)

```
Namespace 종류:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PID Namespace
→ 각 컨테이너는 자신만의 프로세스 트리
→ 컨테이너 내부: PID 1부터 시작
→ 호스트: 다른 PID 번호

Network Namespace
→ 각 컨테이너는 자신만의 네트워크 스택
→ 독립적인 IP, 포트, 라우팅 테이블

Mount Namespace
→ 각 컨테이너는 자신만의 파일 시스템
→ 다른 컨테이너의 파일 볼 수 없음

User Namespace
→ 컨테이너 내 root ≠ 호스트 root
→ 보안 강화
```

#### cgroups (리소스 제한)

```
cgroups로 제어 가능한 리소스:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CPU
→ 컨테이너 A: 최대 2 Core
→ 컨테이너 B: 최대 1 Core

Memory
→ 컨테이너 A: 최대 2GB
→ 컨테이너 B: 최대 512MB

Disk I/O
→ 각 컨테이너의 읽기/쓰기 속도 제한

Network
→ 각 컨테이너의 대역폭 제한
```

```bash
# cgroups 사용 예제
docker run -d \
  --name myapp \
  --cpus="1.5" \        # CPU 1.5 core로 제한
  --memory="1g" \       # 메모리 1GB로 제한
  --memory-swap="2g" \  # Swap 포함 2GB
  nginx
```

### 4. Union File System

```
Union FS (레이어 병합):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

읽기 전용 레이어들:
┌──────────────────────┐
│   Layer 3 (App)      │
├──────────────────────┤
│   Layer 2 (Runtime)  │
├──────────────────────┤
│   Layer 1 (Base OS)  │
└──────────────────────┘
           ↓
   Union File System
           ↓
┌──────────────────────┐
│  Container Layer     │ ← 쓰기 가능
│  (임시 변경사항)      │
└──────────────────────┘

✓ 읽기: 모든 레이어 병합해서 보여줌
✓ 쓰기: Container Layer에만 기록
✓ 컨테이너 삭제 → Container Layer만 삭제
```

---

## 도커 기본 사용법

### 이미지 관리

```bash
# 이미지 검색
docker search nginx

# 이미지 다운로드
docker pull nginx:latest
docker pull node:18-alpine

# 로컬 이미지 목록
docker images

# 이미지 삭제
docker rmi nginx:latest

# 이미지 빌드
docker build -t myapp:v1.0 .

# 이미지 태그
docker tag myapp:v1.0 myapp:latest

# 이미지 정보 확인
docker inspect nginx:latest
```

### 컨테이너 관리

```bash
# 컨테이너 실행
docker run -d \
  --name mycontainer \
  -p 8080:80 \
  -e NODE_ENV=production \
  nginx

# 실행 중인 컨테이너 목록
docker ps

# 모든 컨테이너 목록 (중지된 것 포함)
docker ps -a

# 컨테이너 중지
docker stop mycontainer

# 컨테이너 시작
docker start mycontainer

# 컨테이너 재시작
docker restart mycontainer

# 컨테이너 삭제
docker rm mycontainer

# 실행 중인 컨테이너에 명령 실행
docker exec -it mycontainer bash

# 컨테이너 로그 보기
docker logs mycontainer
docker logs -f mycontainer  # 실시간 로그
```

### 실용적인 예제

```bash
# Node.js 애플리케이션 실행
docker run -d \
  --name nodeapp \
  -p 3000:3000 \
  -v $(pwd):/app \         # 로컬 디렉토리를 컨테이너에 마운트
  -e NODE_ENV=development \
  node:18-alpine \
  node /app/server.js

# PostgreSQL 데이터베이스 실행
docker run -d \
  --name postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=mydb \
  -v pgdata:/var/lib/postgresql/data \  # 데이터 영속화
  postgres:15

# Redis 캐시 실행
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:alpine
```

---

## Docker Compose

### Docker Compose란?

**Docker Compose**는 여러 컨테이너로 구성된 애플리케이션을 정의하고 실행하는 도구입니다.

```
문제 상황:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
웹 애플리케이션 실행에 필요한 것:
- Node.js 앱 컨테이너
- PostgreSQL 컨테이너
- Redis 컨테이너
- Nginx 컨테이너

❌ 각각 docker run 명령어로 실행?
   → 복잡하고 관리 어려움
   → 네트워크 연결 수동 설정
   → 실행 순서 관리 필요

✅ Docker Compose 사용
   → 하나의 YAML 파일로 정의
   → 한 번의 명령으로 모두 실행
   → 자동으로 네트워크 연결
```

### Docker Compose 파일 예제

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Node.js 애플리케이션
  app:
    build: .
    container_name: nodeapp
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:secret@db:5432/mydb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./src:/app/src
    networks:
      - app-network

  # PostgreSQL 데이터베이스
  db:
    image: postgres:15
    container_name: postgres
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - app-network

  # Redis 캐시
  redis:
    image: redis:alpine
    container_name: redis
    networks:
      - app-network

  # Nginx 리버스 프록시
  nginx:
    image: nginx:alpine
    container_name: nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    networks:
      - app-network

volumes:
  pgdata:

networks:
  app-network:
    driver: bridge
```

### Docker Compose 명령어

```bash
# 모든 서비스 시작 (백그라운드)
docker-compose up -d

# 로그 보기
docker-compose logs
docker-compose logs -f app  # app 서비스만 실시간 로그

# 실행 중인 서비스 목록
docker-compose ps

# 특정 서비스만 재시작
docker-compose restart app

# 서비스 중지
docker-compose stop

# 서비스 중지 및 컨테이너 삭제
docker-compose down

# 볼륨까지 삭제
docker-compose down -v

# 이미지 다시 빌드
docker-compose build

# 빌드 후 실행
docker-compose up -d --build

# 특정 서비스에서 명령 실행
docker-compose exec app npm test

# 서비스 스케일링
docker-compose up -d --scale app=3  # app 컨테이너 3개 실행
```

### Docker Compose 실전 예제

#### 마이크로서비스 아키텍처

```yaml
# docker-compose.yml
version: '3.8'

services:
  # API Gateway
  gateway:
    build: ./gateway
    ports:
      - "8080:8080"
    depends_on:
      - auth-service
      - user-service
      - order-service

  # 인증 서비스
  auth-service:
    build: ./services/auth
    environment:
      - JWT_SECRET=mysecret
      - DATABASE_URL=postgresql://postgres:secret@auth-db:5432/auth

  # 사용자 서비스
  user-service:
    build: ./services/user
    environment:
      - DATABASE_URL=postgresql://postgres:secret@user-db:5432/users

  # 주문 서비스
  order-service:
    build: ./services/order
    environment:
      - DATABASE_URL=postgresql://postgres:secret@order-db:5432/orders
      - RABBITMQ_URL=amqp://rabbitmq:5672

  # 각 서비스별 데이터베이스
  auth-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=auth
      - POSTGRES_PASSWORD=secret
    volumes:
      - auth-data:/var/lib/postgresql/data

  user-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=users
      - POSTGRES_PASSWORD=secret
    volumes:
      - user-data:/var/lib/postgresql/data

  order-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=orders
      - POSTGRES_PASSWORD=secret
    volumes:
      - order-data:/var/lib/postgresql/data

  # 메시지 브로커
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"  # 관리 UI

volumes:
  auth-data:
  user-data:
  order-data:
```

#### 개발 환경 설정

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev  # 개발용 Dockerfile
    volumes:
      - ./src:/app/src          # 코드 변경 즉시 반영
      - /app/node_modules       # node_modules는 컨테이너 것 사용
    environment:
      - NODE_ENV=development
      - DEBUG=*                 # 디버그 모드
    command: npm run dev        # 핫 리로드

  db:
    image: postgres:15
    ports:
      - "5432:5432"             # 로컬에서 접근 가능
    environment:
      - POSTGRES_PASSWORD=dev

  # 개발용 메일 서버
  maildev:
    image: maildev/maildev
    ports:
      - "1080:1080"             # 웹 UI
      - "1025:1025"             # SMTP
```

```bash
# 개발 환경 실행
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

---

## Docker vs VM 비교

```
┌─────────────────────────────────────────────────┐
│                    VM 방식                       │
├─────────────────────────────────────────────────┤
│  App A  │  App B  │  App C                      │
│ Bins/   │ Bins/   │ Bins/                       │
│ Libs    │ Libs    │ Libs                        │
├─────────┼─────────┼─────────┤                   │
│ Guest   │ Guest   │ Guest   │                   │
│ OS      │ OS      │ OS      │  각 VM마다 OS 필요 │
├─────────┴─────────┴─────────┤                   │
│       Hypervisor             │                   │
├──────────────────────────────┤                   │
│         Host OS              │                   │
├──────────────────────────────┤                   │
│         Hardware             │                   │
└──────────────────────────────┘                   │

크기: 수 GB (각 VM)
부팅: 분 단위
성능: 오버헤드 큼
격리: 강력 (하드웨어 레벨)
───────────────────────────────────────────────────

┌─────────────────────────────────────────────────┐
│                 Container 방식                   │
├─────────────────────────────────────────────────┤
│  App A  │  App B  │  App C                      │
│ Bins/   │ Bins/   │ Bins/                       │
│ Libs    │ Libs    │ Libs                        │
├─────────┴─────────┴─────────┤                   │
│     Docker Engine            │  OS 커널 공유     │
├──────────────────────────────┤                   │
│         Host OS              │                   │
├──────────────────────────────┤                   │
│         Hardware             │                   │
└──────────────────────────────┘                   │

크기: 수십~수백 MB (각 컨테이너)
부팅: 초 단위
성능: 네이티브에 가까움
격리: 충분함 (프로세스 레벨)
```

---

## Docker 네트워크

### 네트워크 드라이버

```
Docker Network 종류:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

bridge (기본값)
→ 같은 호스트의 컨테이너끼리 통신
→ 외부 접근은 포트 매핑 필요

host
→ 호스트 네트워크 직접 사용
→ 포트 매핑 불필요
→ 성능은 좋지만 격리 약함

none
→ 네트워크 없음
→ 완전히 격리된 컨테이너

overlay
→ 여러 호스트에 걸친 컨테이너 통신
→ Docker Swarm/Kubernetes에서 사용
```

```bash
# 네트워크 생성
docker network create mynetwork

# 네트워크에 연결해서 컨테이너 실행
docker run -d --name app --network mynetwork nginx

# 같은 네트워크의 컨테이너는 이름으로 통신 가능
docker run -d --name db --network mynetwork postgres

# app 컨테이너에서 'db'라는 호스트명으로 접근 가능
# 예: postgresql://postgres:5432/mydb → postgresql://db:5432/mydb
```

---

## Docker 볼륨 (데이터 영속화)

### 왜 볼륨이 필요한가?

```
문제:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
컨테이너는 임시적(ephemeral)
→ 컨테이너 삭제 = 데이터 삭제
→ 데이터베이스 데이터가 날아감!

해결:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Volume 사용
→ 데이터를 호스트에 저장
→ 컨테이너 삭제해도 데이터 유지
```

### 볼륨 종류

```bash
# 1. Named Volume (추천)
docker volume create pgdata
docker run -d \
  --name postgres \
  -v pgdata:/var/lib/postgresql/data \
  postgres:15

# 2. Bind Mount
docker run -d \
  --name app \
  -v $(pwd)/src:/app/src \    # 로컬 디렉토리 직접 마운트
  node:18-alpine

# 3. Anonymous Volume
docker run -d \
  --name app \
  -v /app/data \              # 이름 없는 볼륨 (자동 생성)
  myapp
```

```bash
# 볼륨 관리
docker volume ls                    # 볼륨 목록
docker volume inspect pgdata        # 볼륨 정보
docker volume rm pgdata             # 볼륨 삭제
docker volume prune                 # 사용하지 않는 볼륨 모두 삭제
```

---

## 실전 Dockerfile 작성

### 최적화된 Node.js Dockerfile

```dockerfile
# 멀티 스테이지 빌드
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 파일만 먼저 복사 (캐싱 활용)
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# TypeScript 빌드 (필요한 경우)
RUN npm run build

# 실행 스테이지
FROM node:18-alpine

# 보안: 루트가 아닌 사용자로 실행
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# 필요한 파일만 복사
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/server.js"]
```

### 최적화 팁

```dockerfile
# ❌ 나쁜 예
FROM node:18
COPY . .
RUN npm install
CMD ["node", "server.js"]

# 문제점:
# - 큰 베이스 이미지 (node:18 = 1GB)
# - 모든 파일을 한번에 복사 (캐싱 안 됨)
# - devDependencies까지 설치
# - 루트 권한으로 실행 (보안 위험)

# ✅ 좋은 예
FROM node:18-alpine AS builder    # alpine = 작은 이미지
WORKDIR /app
COPY package*.json ./              # 의존성 파일만 먼저
RUN npm ci --only=production       # 프로덕션 의존성만
COPY . .                           # 소스 코드는 나중에

FROM node:18-alpine                # 멀티 스테이지
RUN adduser -S nodejs              # 전용 사용자
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app ./
USER nodejs                        # 비루트 사용자
CMD ["node", "server.js"]
```

### .dockerignore 파일

```
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
README.md
.vscode
.idea
coverage
.DS_Store
*.log
dist
build
```

---

## 보안 베스트 프랙티스

```
Docker 보안 체크리스트:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 최소 권한 원칙
  → 루트 사용자로 실행하지 않기
  → USER 지시어 사용

✓ 최소 베이스 이미지
  → alpine 이미지 사용 (경량)
  → distroless 이미지 고려

✓ 멀티 스테이지 빌드
  → 빌드 도구는 최종 이미지에 포함하지 않기
  → 최종 이미지 크기 최소화

✓ 이미지 스캔
  → docker scan myimage
  → Trivy, Clair 등 도구 사용

✓ 비밀 정보 관리
  → 이미지에 비밀번호/키 포함하지 않기
  → Docker secrets 또는 환경 변수 사용

✓ 읽기 전용 파일 시스템
  → docker run --read-only
  → 필요한 디렉토리만 쓰기 가능하게

✓ 리소스 제한
  → --cpus, --memory 옵션 사용
  → DoS 공격 방지
```

```bash
# 보안을 고려한 컨테이너 실행
docker run -d \
  --name myapp \
  --read-only \                   # 읽기 전용 파일 시스템
  --tmpfs /tmp:rw,noexec \        # 임시 디렉토리만 쓰기 가능
  --cap-drop=ALL \                # 모든 권한 제거
  --cap-add=NET_BIND_SERVICE \    # 필요한 권한만 추가
  --security-opt=no-new-privileges \
  --cpus="1" \                    # CPU 제한
  --memory="512m" \               # 메모리 제한
  --pids-limit=100 \              # 프로세스 수 제한
  myapp:latest
```

---

## 도커 모니터링

### 리소스 사용량 확인

```bash
# 실시간 리소스 사용량
docker stats

# 특정 컨테이너
docker stats mycontainer

# 출력 예:
CONTAINER ID   NAME       CPU %   MEM USAGE / LIMIT   MEM %   NET I/O
abc123def456   myapp      0.50%   150MB / 512MB       29.3%   1.2MB / 850KB
```

### 상세 정보 확인

```bash
# 컨테이너 상세 정보
docker inspect mycontainer

# 특정 정보만 추출
docker inspect -f '{{.State.Status}}' mycontainer
docker inspect -f '{{.NetworkSettings.IPAddress}}' mycontainer
```

### 로깅

```bash
# 로그 보기
docker logs mycontainer

# 실시간 로그
docker logs -f mycontainer

# 최근 100줄
docker logs --tail 100 mycontainer

# 타임스탬프 포함
docker logs -t mycontainer
```

---

## 트러블슈팅

### 자주 발생하는 문제

```bash
# 1. 컨테이너가 바로 종료됨
docker logs mycontainer  # 로그 확인
docker inspect mycontainer  # 종료 코드 확인

# 2. 포트가 이미 사용 중
docker ps -a  # 다른 컨테이너가 사용 중인지 확인
# 또는 다른 포트 사용
docker run -p 8081:80 nginx

# 3. 디스크 공간 부족
docker system df  # 디스크 사용량 확인
docker system prune  # 사용하지 않는 리소스 정리
docker system prune -a --volumes  # 모든 미사용 리소스 삭제

# 4. 이미지 빌드 실패
docker build --no-cache -t myapp .  # 캐시 없이 빌드
docker build --progress=plain -t myapp .  # 상세 출력

# 5. 네트워크 문제
docker network ls  # 네트워크 목록
docker network inspect bridge  # 네트워크 상세 정보
```

---

## 도커 생태계

```
Docker 생태계:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Docker Hub
→ 공식 이미지 저장소
→ hub.docker.com

Docker Desktop
→ Mac/Windows용 Docker
→ GUI 제공

Docker Compose
→ 다중 컨테이너 관리
→ YAML 기반 설정

Docker Swarm
→ 오케스트레이션 (클러스터 관리)
→ 여러 호스트에 컨테이너 배포

Kubernetes (K8s)
→ 가장 인기 있는 오케스트레이션
→ 대규모 프로덕션 환경

Container Registry
→ Docker Hub, AWS ECR, GCR
→ 프라이빗 이미지 저장소
```

---

## 실전 시나리오

### 시나리오 1: 로컬 개발 환경

```bash
# 1. docker-compose.yml 생성
cat > docker-compose.yml << EOF
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src
    environment:
      - DATABASE_URL=postgresql://postgres:secret@db:5432/mydb

  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
EOF

# 2. 실행
docker-compose up -d

# 3. 개발하면서 로그 확인
docker-compose logs -f app

# 4. 종료
docker-compose down
```

### 시나리오 2: CI/CD 파이프라인

```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v2
        with:
          context: .
          push: true
          tags: username/myapp:latest,username/myapp:${{ github.sha }}

      - name: Deploy to production
        run: |
          ssh user@server "docker pull username/myapp:latest"
          ssh user@server "docker-compose up -d"
```

### 시나리오 3: 프로덕션 배포

```bash
# 1. 이미지 빌드 및 푸시
docker build -t myregistry.com/myapp:v1.0 .
docker push myregistry.com/myapp:v1.0

# 2. 프로덕션 서버에서
docker pull myregistry.com/myapp:v1.0

# 3. 블루-그린 배포
docker run -d --name myapp-green \
  -p 3001:3000 \
  myregistry.com/myapp:v1.0

# 4. 헬스 체크
curl http://localhost:3001/health

# 5. 트래픽 전환 (Nginx/Load Balancer)
# 6. 이전 버전 컨테이너 중지
docker stop myapp-blue
docker rm myapp-blue

# 7. 새 버전을 blue로 이름 변경
docker rename myapp-green myapp-blue
```

---

## 학습 로드맵

```
Docker 학습 순서:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1주차: 기초
✓ Docker 설치
✓ 이미지 pull/run
✓ 기본 명령어 (ps, logs, exec)
✓ Dockerfile 작성

2주차: 중급
✓ Docker Compose
✓ 네트워크
✓ 볼륨
✓ 멀티 스테이지 빌드

3주차: 고급
✓ 보안 베스트 프랙티스
✓ 최적화 기법
✓ Docker Registry
✓ CI/CD 통합

4주차: 오케스트레이션
✓ Kubernetes 기초
✓ Docker Swarm (선택)
✓ 프로덕션 배포 전략
```

---

## 추가 학습 자료

**공식 문서:**
- [Docker Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

**추천 강의:**
- Docker Mastery (Udemy)
- Docker Deep Dive (Pluralsight)

**유튜브:**
- TechWorld with Nana - Docker Tutorial
- NetworkChuck - Docker
- Hussein Nasser - Docker

**책:**
- Docker Deep Dive by Nigel Poulton
- The Docker Book by James Turnbull

---

## 다음 학습

- [Kubernetes 기초](kubernetes-basics.md)
- [CI/CD 파이프라인](../13-ci-cd/notes/ci-cd-pipeline.md)
- [마이크로서비스 아키텍처](../10-architecture/notes/microservices.md)

---

*Last updated: 2026-01-09*
