 # Docker Compose vs Kubernetes

## Docker Compose란?

**Docker Compose = 여러 컨테이너를 한 번에 관리하는 도구 (단일 서버용)**

```
비유: 가정식 요리
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

혼자 요리하기:
- 밥, 국, 반찬 3가지 만들기
- 가스레인지 3개 동시에 사용
- 나 혼자 관리 가능
- 작은 주방에서 충분

→ Docker Compose
```

### Docker Compose 사용 예시

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 1. 웹 애플리케이션
  web:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis

  # 2. 데이터베이스
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - db-data:/var/lib/postgresql/data

  # 3. 캐시
  redis:
    image: redis:alpine

volumes:
  db-data:
```

```bash
# 한 번에 모두 실행
$ docker-compose up -d

Creating network "myapp_default"
Creating myapp_db_1    ... done
Creating myapp_redis_1 ... done
Creating myapp_web_1   ... done

# 컨테이너 확인
$ docker-compose ps

Name                  State    Ports
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
myapp_web_1      Up      0.0.0.0:8000->8000/tcp
myapp_db_1       Up      5432/tcp
myapp_redis_1    Up      6379/tcp

# 한 번에 모두 종료
$ docker-compose down

Stopping myapp_web_1   ... done
Stopping myapp_redis_1 ... done
Stopping myapp_db_1    ... done
Removing containers... done
Removing network... done
```

### Docker Compose 특징

```
장점:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 간단하고 배우기 쉬움
✓ YAML 파일 하나로 관리
✓ 로컬 개발에 최적
✓ 빠른 시작/종료
✓ 설정이 직관적

한계:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✗ 단일 서버만 지원
✗ 자동 복구 없음 (컨테이너 죽으면 끝)
✗ 자동 스케일링 없음
✗ 로드 밸런싱 제한적
✗ 대규모 배포 불가능

용도:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 로컬 개발 환경
✓ 소규모 프로젝트 배포
✓ 간단한 프로덕션 (서버 1대)
✓ 빠른 프로토타이핑
```

---

## Kubernetes란?

**Kubernetes = 여러 서버에 걸쳐 컨테이너를 자동으로 관리하는 시스템 (클러스터용)**

```
비유: 대형 레스토랑 체인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

레스토랑 체인 운영:
- 전국 100개 지점
- 각 지점 여러 요리사
- 주문 분산 처리
- 바쁜 지점에 요리사 추가 배치
- 한 지점 문제 생기면 다른 지점에서 대응
- 매니저가 전체 관리

→ Kubernetes
```

### 실제 시나리오로 이해하기

#### 시나리오 1: 트래픽 증가

```
Docker Compose (한계):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

서버 1대에서 실행:
┌─────────────────────────┐
│  Server 1               │
│  - web (1개)            │
│  - db (1개)             │
│  - redis (1개)          │
└─────────────────────────┘

사용자 급증 (1만 → 100만):
→ 서버 1대로 감당 불가
→ 수동으로 서버 추가?
→ 어떻게 로드 밸런싱?
→ 어떻게 상태 관리?
→ 복잡하고 어려움 ✗


Kubernetes (자동 처리):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

초기 상태:
┌─────────────┬─────────────┬─────────────┐
│  Server 1   │  Server 2   │  Server 3   │
│  - web (1)  │  - web (1)  │  - db       │
│             │             │  - redis    │
└─────────────┴─────────────┴─────────────┘

사용자 급증 감지:
→ Kubernetes가 자동으로 web 컨테이너 추가

자동 스케일링 후:
┌─────────────┬─────────────┬─────────────┐
│  Server 1   │  Server 2   │  Server 3   │
│  - web (1)  │  - web (1)  │  - web (1)  │
│  - web (2)  │  - web (2)  │  - web (2)  │
│  - web (3)  │  - web (3)  │  - db       │
│             │             │  - redis    │
└─────────────┴─────────────┴─────────────┘

→ 자동으로 9개 컨테이너 실행
→ 자동으로 로드 밸런싱
→ 관리자 개입 없음 ✓
```

#### 시나리오 2: 컨테이너 장애

```
Docker Compose:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

web 컨테이너 크래시:
$ docker-compose ps
Name          State
web           Exit 1   ← 죽음

→ 자동 재시작 없음 (기본)
→ 수동으로 재시작 필요
→ 서비스 다운 시간 발생
$ docker-compose restart web


Kubernetes:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

web 컨테이너 크래시:
10:00:00 - web-pod-1 crash (서버 1)
10:00:01 - Kubernetes 감지
10:00:02 - 새 컨테이너 자동 시작 (서버 2)
10:00:05 - 트래픽 자동 전환

→ 자동 복구
→ 다운타임 거의 없음 (5초)
→ 사용자는 느끼지 못함 ✓
```

---

## Kubernetes가 하는 일

### 1. 오케스트레이션 (자동 관리)

```
Kubernetes의 역할:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 배포 (Deployment)
   "web 컨테이너 10개 실행해줘"
   → 자동으로 서버들에 분산 배치

2. 스케일링 (Scaling)
   "CPU 사용률 70% 넘으면 컨테이너 추가"
   → 자동으로 증가/감소

3. 자가 치유 (Self-healing)
   "컨테이너 죽으면 재시작"
   → 자동으로 감지하고 재시작

4. 로드 밸런싱
   "트래픽을 컨테이너들에 분산"
   → 자동으로 부하 분산

5. 롤링 업데이트
   "새 버전으로 무중단 배포"
   → 하나씩 교체하며 업데이트

6. 상태 관리
   "항상 원하는 상태 유지"
   → 지속적으로 모니터링
```

### 2. Kubernetes 구성 예시

```yaml
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3  # 컨테이너 3개 실행
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: myapp:1.0
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "256Mi"
            cpu: "500m"
          limits:
            memory: "512Mi"
            cpu: "1000m"

---
# 자동 스케일링 설정
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70

---
# 로드 밸런서 설정
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 8000
```

```bash
# Kubernetes에 배포
$ kubectl apply -f kubernetes-deployment.yaml

deployment.apps/web-app created
horizontalpodautoscaler.autoscaling/web-app-hpa created
service/web-service created

# 자동으로 일어나는 일:
1. 3개 컨테이너를 서버들에 분산 배치
2. 로드 밸런서 생성
3. 헬스 체크 시작
4. CPU 모니터링 시작
5. 자동 스케일링 준비

# 상태 확인
$ kubectl get pods

NAME                       READY   STATUS    RESTARTS
web-app-abc123            1/1     Running   0
web-app-def456            1/1     Running   0
web-app-ghi789            1/1     Running   0

→ 3개 컨테이너 정상 실행 중
```

---

## 실제 사용 시나리오

### 시나리오 A: 소규모 스타트업 (Docker Compose)

```
상황:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
팀: 개발자 3명
사용자: 1,000명
서버: AWS EC2 1대

요구사항:
- 간단한 웹 서비스
- 빠른 배포
- 적은 관리 부담

솔루션: Docker Compose
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# docker-compose.yml
services:
  web:
    image: myapp:latest
  db:
    image: postgres:15
  redis:
    image: redis:alpine

# 배포
$ ssh ec2-server
$ docker-compose up -d

→ 끝!
→ 5분 만에 배포 완료
→ 관리 간단
→ 비용 저렴 ($50/월)
```

### 시나리오 B: 중견 기업 (Kubernetes)

```
상황:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
팀: 개발자 20명
사용자: 100만 명
서버: AWS 50대 클러스터

요구사항:
- 고가용성 (99.9% 업타임)
- 자동 스케일링
- 무중단 배포
- 장애 자동 복구

솔루션: Kubernetes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 배포
$ kubectl apply -f deployment.yaml

자동으로 처리되는 것:
1. 50개 서버에 자동 분산 배치
2. 트래픽 증가 시 자동 확장
3. 서버 장애 시 자동 이동
4. 롤링 업데이트
5. 헬스 체크
6. 로그 수집
7. 모니터링

→ 안정적인 서비스
→ 관리는 복잡하지만 자동화
→ 비용 높음 ($5,000/월)
```

---

## 애플리케이션 올린 후 할 일

### Docker Compose 사용 시

```bash
# 1. 배포
$ docker-compose up -d

# 2. 로그 확인
$ docker-compose logs -f

# 3. 모니터링 (수동)
$ docker stats

# 4. 문제 발생 시
$ docker-compose restart web

# 5. 업데이트
$ docker-compose pull
$ docker-compose up -d

→ 대부분 수동 관리
→ 간단하지만 손이 많이 감
```

### Kubernetes 사용 시

```bash
# 1. 배포
$ kubectl apply -f deployment.yaml

# 이후 자동으로 처리됨:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 헬스 체크 (자동)
  컨테이너가 정상인지 계속 확인

✓ 자동 복구 (자동)
  컨테이너 죽으면 자동 재시작

✓ 자동 스케일링 (자동)
  트래픽 증가하면 컨테이너 추가
  트래픽 감소하면 컨테이너 제거

✓ 로드 밸런싱 (자동)
  트래픽을 컨테이너들에 분산

✓ 롤링 업데이트 (자동)
  $ kubectl set image deployment/web web=myapp:2.0
  → 무중단으로 업데이트

# 모니터링
$ kubectl get pods       # 상태 확인
$ kubectl logs <pod>     # 로그 확인
$ kubectl top pods       # 리소스 사용량

→ 대부분 자동 관리
→ 설정은 복잡하지만 이후엔 편함
```

---

## 실제 기업 사례

### 사례 1: 넷플릭스 (Kubernetes 사용)

```
규모:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 사용자: 2억 명
- 서버: 수천 대
- 트래픽: 초당 수백만 요청

왜 Kubernetes?
- 금요일 저녁 트래픽 폭증
  → 자동으로 컨테이너 수천 개 추가
- 새벽 트래픽 감소
  → 자동으로 컨테이너 제거 (비용 절감)
- 서버 장애 발생
  → 자동으로 다른 서버로 이동
- 새 버전 배포
  → 무중단 롤링 업데이트

Docker Compose로는 불가능!
```

### 사례 2: 소규모 스타트업 (Docker Compose 사용)

```
규모:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 사용자: 5,000명
- 서버: 1-2대
- 트래픽: 안정적

왜 Docker Compose?
- 간단한 구조
- 빠른 배포 (5분)
- 적은 관리 비용
- 충분한 성능

Kubernetes는 오버킬!
```

---

## 비교표

```
┌──────────────────┬──────────────────┬──────────────────┐
│     항목         │ Docker Compose   │   Kubernetes     │
├──────────────────┼──────────────────┼──────────────────┤
│ 대상             │ 단일 서버         │ 여러 서버 클러스터│
│ 복잡도           │ 낮음 ⭐          │ 높음 ⭐⭐⭐⭐⭐  │
│ 학습 곡선        │ 쉬움             │ 어려움           │
│ 자동 복구        │ 제한적           │ 완전 자동        │
│ 자동 스케일링    │ 없음             │ 있음             │
│ 로드 밸런싱      │ 제한적           │ 강력             │
│ 고가용성         │ 낮음             │ 높음             │
│ 설정 파일        │ docker-compose.yml│ 여러 YAML 파일   │
│ 배포 시간        │ 빠름 (분)        │ 느림 (10-30분)   │
│ 용도             │ 개발, 소규모      │ 프로덕션, 대규모 │
│ 비용             │ 낮음             │ 높음             │
│ 모니터링         │ 수동             │ 자동             │
│ 업데이트         │ 수동             │ 롤링 업데이트    │
└──────────────────┴──────────────────┴──────────────────┘
```

---

## 언제 무엇을 사용할까?

### Docker Compose 사용 시기

```
✓ 로컬 개발 환경
✓ 사용자 < 10,000명
✓ 서버 1-2대
✓ 빠른 프로토타이핑
✓ 간단한 프로젝트
✓ 관리 리소스 부족
✓ Kubernetes 학습 전

예시:
- 개인 블로그
- 사이드 프로젝트
- MVP 개발
- 사내 도구
```

### Kubernetes 사용 시기

```
✓ 프로덕션 환경
✓ 사용자 > 100,000명
✓ 서버 10대 이상
✓ 고가용성 필요
✓ 자동 스케일링 필요
✓ 복잡한 마이크로서비스
✓ 무중단 배포 필요

예시:
- 커머스 플랫폼
- SNS 서비스
- 금융 서비스
- 스트리밍 서비스
```

---

## 학습 경로

```
1단계: Docker 기초
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Dockerfile 작성
- 이미지 빌드
- 컨테이너 실행
- 기본 명령어

2단계: Docker Compose
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- docker-compose.yml 작성
- 여러 컨테이너 관리
- 네트워크 설정
- 볼륨 관리

3단계: Kubernetes (선택)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Kubernetes 개념
- kubectl 명령어
- Deployment, Service 등
- Helm 차트

→ Docker Compose까지만 배워도
  대부분의 프로젝트에 충분!
```

---

## 정리

### Docker Compose

```
✓ 정확합니다!

여러 컨테이너를 한 번에 관리하는 도구
- 단일 서버용
- YAML 파일로 정의
- 간단하고 쉬움
- 개발/소규모에 적합

docker-compose.yml:
services:
  web:    # 컨테이너 1
  db:     # 컨테이너 2
  redis:  # 컨테이너 3

$ docker-compose up -d
→ 3개 컨테이너 한 번에 실행!
```

### Kubernetes

```
여러 서버에 걸쳐 컨테이너를 자동 관리
- 클러스터 (여러 서버)
- 자동 스케일링
- 자동 복구
- 로드 밸런싱
- 대규모 프로덕션에 적합

배포 후 자동으로 처리:
✓ 헬스 체크
✓ 장애 복구
✓ 트래픽 분산
✓ 스케일링
✓ 무중단 업데이트

→ 관리자 개입 최소화
→ 안정적인 서비스 운영
```

### 선택 기준

```
소규모 (사용자 < 10,000):
→ Docker Compose 사용
→ 간단하고 충분함

대규모 (사용자 > 100,000):
→ Kubernetes 사용
→ 복잡하지만 필요함

대부분의 프로젝트:
→ Docker Compose로 충분!
→ Kubernetes는 정말 필요할 때만
```

---

## 실전 예제

### Docker Compose로 시작

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret

  redis:
    image: redis:alpine
```

```bash
# 실행
$ docker-compose up -d

# 확인
$ docker-compose ps

# 로그
$ docker-compose logs -f

→ 5분 만에 전체 스택 실행!
```

### 나중에 필요하면 Kubernetes로

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 10
  template:
    spec:
      containers:
      - name: web
        image: myapp:latest
```

```bash
# 배포
$ kubectl apply -f kubernetes/

→ 10개 서버에 자동 분산
→ 자동 관리 시작
```

---

## 다음 학습

- [Docker 실습](docker.md)
- [Docker Compose 상세](docker-compose-guide.md)
- [Kubernetes 기초](kubernetes-basics.md) (선택)

---

*Last updated: 2026-01-09*
