# Kubernetes 완벽 가이드

## 목차
1. [Kubernetes 개요](#kubernetes-개요)
2. [아키텍처](#아키텍처)
3. [핵심 오브젝트](#핵심-오브젝트)
4. [네트워킹](#네트워킹)
5. [스토리지](#스토리지)
6. [보안](#보안)
7. [실전 배포](#실전-배포)

---

## Kubernetes 개요

### Kubernetes란?

```
Kubernetes (K8s) = 컨테이너 오케스트레이션 플랫폼
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

오케스트레이션이란?
→ 여러 서버(노드)에서 컨테이너를 자동으로 관리하는 것

주요 기능:
✓ 자동 배포 (Automated Deployment)
✓ 자동 스케일링 (Auto Scaling)
✓ 자가 치유 (Self-healing)
✓ 로드 밸런싱 (Load Balancing)
✓ 롤링 업데이트 (Rolling Updates)
✓ 서비스 디스커버리 (Service Discovery)
✓ 시크릿 관리 (Secret Management)
```

### 왜 Kubernetes인가?

```
문제 상황 (Docker Compose만 사용):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Single Server
┌─────────────────────────────────┐
│  Docker Compose                 │
│  ├─ web (3 replicas)            │
│  ├─ api (2 replicas)            │
│  └─ db (1 replica)              │
└─────────────────────────────────┘

문제점:
❌ 서버가 다운되면? → 모든 서비스 중단
❌ 트래픽 증가하면? → 수동으로 서버 추가
❌ 컨테이너 죽으면? → 수동 재시작
❌ 서버 간 로드 밸런싱? → 직접 구현
❌ 무중단 배포? → 복잡한 스크립트


Kubernetes 사용:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Kubernetes Cluster
┌────────────┬────────────┬────────────┬────────────┐
│  Node 1    │  Node 2    │  Node 3    │  Node 4    │
│  web-1     │  web-2     │  api-1     │  db-1      │
│  api-2     │  web-3     │            │            │
└────────────┴────────────┴────────────┴────────────┘
              ↑
         Control Plane
    (자동 관리, 모니터링, 스케일링)

해결:
✅ 서버 다운 → 자동으로 다른 서버로 이동
✅ 트래픽 증가 → 자동 스케일링
✅ 컨테이너 죽음 → 자동 재시작
✅ 로드 밸런싱 → 내장 기능
✅ 무중단 배포 → 롤링 업데이트
```

---

## 아키텍처

### Kubernetes 클러스터 구조

```
Kubernetes 클러스터 전체 구조:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────┐
│               Control Plane (Master)                 │
│  ┌────────────────────────────────────────────────┐ │
│  │           API Server (kube-apiserver)          │ │
│  │  - REST API 제공                               │ │
│  │  - 모든 요청의 중앙 허브                       │ │
│  │  - 인증/권한 관리                              │ │
│  └────────────┬───────────────────────────────────┘ │
│               │                                      │
│  ┌────────────▼────────────┐   ┌─────────────────┐ │
│  │  etcd (Key-Value Store) │   │   Scheduler     │ │
│  │  - 클러스터 상태 저장   │   │  - Pod를 어느   │ │
│  │  - 분산 데이터베이스    │   │    노드에 배치? │ │
│  └─────────────────────────┘   └─────────────────┘ │
│                                                      │
│  ┌──────────────────────┐   ┌──────────────────┐   │
│  │ Controller Manager   │   │ Cloud Controller │   │
│  │ - Deployment         │   │ - 클라우드 리소스│   │
│  │ - ReplicaSet         │   │   관리           │   │
│  │ - Service            │   └──────────────────┘   │
│  └──────────────────────┘                           │
└──────────────┬──────────────────────────────────────┘
               │ (kubelet 통신)
    ┌──────────┼──────────┬──────────┐
    │          │          │          │
┌───▼────┐ ┌──▼─────┐ ┌──▼─────┐ ┌──▼─────┐
│ Node 1 │ │ Node 2 │ │ Node 3 │ │ Node 4 │
│────────│ │────────│ │────────│ │────────│
│kubelet │ │kubelet │ │kubelet │ │kubelet │
│  ↓     │ │  ↓     │ │  ↓     │ │  ↓     │
│kube-   │ │kube-   │ │kube-   │ │kube-   │
│proxy   │ │proxy   │ │proxy   │ │proxy   │
│  ↓     │ │  ↓     │ │  ↓     │ │  ↓     │
│┌──────┐│ │┌──────┐│ │┌──────┐│ │┌──────┐│
││Pod 1 ││ ││Pod 2 ││ ││Pod 3 ││ ││Pod 4 ││
│└──────┘│ │└──────┘│ │└──────┘│ │└──────┘│
││Pod 2 ││ ││Pod 3 ││ │        │ │        │
│└──────┘│ │└──────┘│ │        │ │        │
└────────┘ └────────┘ └────────┘ └────────┘
```

### Control Plane 컴포넌트

#### 1. API Server

```
API Server (kube-apiserver):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

역할:
✓ Kubernetes의 "프론트엔드"
✓ 모든 통신의 중앙 허브
✓ REST API 제공
✓ 인증/인가 처리
✓ etcd와 유일하게 통신하는 컴포넌트

동작 흐름:

사용자/kubectl
     │
     │ kubectl create deployment nginx --image=nginx
     │ (HTTP POST)
     ▼
API Server
     │
     ├─► 1. 인증 (Authentication)
     │   "이 사용자가 누구인가?"
     │   → JWT 토큰, 인증서 확인
     │
     ├─► 2. 인가 (Authorization)
     │   "이 사용자가 이 작업을 할 수 있나?"
     │   → RBAC 확인
     │
     ├─► 3. Admission Control
     │   "이 요청이 정책을 만족하는가?"
     │   → ResourceQuota, PodSecurityPolicy 등
     │
     ├─► 4. Validation
     │   "이 요청이 유효한가?"
     │   → 스키마 검증
     │
     └─► 5. etcd에 저장
         "상태를 영구 저장"
         → Deployment 오브젝트 저장

etcd
     │
     │ (Watch)
     ▼
Controller Manager
     │
     └─► Deployment 감지
         → ReplicaSet 생성
         → API Server에 요청

API Server
     │
     └─► etcd에 ReplicaSet 저장

Scheduler
     │ (Watch)
     │
     └─► 미할당 Pod 감지
         → 적절한 Node 선택
         → API Server에 바인딩 요청

Kubelet (Node)
     │ (Watch)
     │
     └─► 자신의 Node에 할당된 Pod 감지
         → 컨테이너 실행
         → 상태를 API Server에 보고
```

#### 2. etcd

```
etcd:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

분산 Key-Value 저장소 (Like Redis, but for clusters)

저장하는 데이터:
✓ 클러스터 설정
✓ 모든 오브젝트 상태
  - Deployments
  - Services
  - Pods
  - ConfigMaps
  - Secrets
✓ 네트워크 정보
✓ 노드 정보

특징:
✓ 일관성 보장 (Raft 알고리즘)
✓ 고가용성 (HA)
✓ Watch 기능 (변경 감지)

데이터 예시:
/registry/deployments/default/nginx
{
  "apiVersion": "apps/v1",
  "kind": "Deployment",
  "metadata": {
    "name": "nginx",
    "namespace": "default"
  },
  "spec": {
    "replicas": 3,
    ...
  }
}

중요:
⚠️ etcd = Kubernetes의 뇌
⚠️ etcd 손실 = 클러스터 상태 손실
→ 반드시 백업 필수!
```

#### 3. Scheduler

```
Scheduler (kube-scheduler):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

역할: Pod를 어느 Node에 배치할지 결정

스케줄링 과정:

1. Filtering (필터링)
   모든 Node 중에서 Pod를 실행할 수 있는 Node 찾기

   ✗ Node A: CPU 부족
   ✓ Node B: 리소스 충분
   ✓ Node C: 리소스 충분
   ✗ Node D: Taints 불일치

2. Scoring (점수 매기기)
   남은 Node들에 점수 부여

   Node B:
   - 남은 CPU: 50% → 점수 +5
   - 남은 Memory: 60% → 점수 +6
   - 같은 Deployment Pod 있음 → 점수 -2
   총점: 9

   Node C:
   - 남은 CPU: 70% → 점수 +7
   - 남은 Memory: 80% → 점수 +8
   - 같은 Deployment Pod 없음 → 점수 +3
   총점: 18 ← 선택!

3. Binding (바인딩)
   가장 높은 점수의 Node에 Pod 할당

   Pod → Node C 바인딩
   API Server에 업데이트

스케줄링 정책:

NodeAffinity (노드 친화성)
→ "SSD가 있는 노드에만 배치"

PodAffinity (파드 친화성)
→ "Redis와 같은 노드에 배치"

PodAntiAffinity (파드 반친화성)
→ "같은 Deployment Pod는 다른 노드에 분산"

Taints and Tolerations
→ "GPU 노드는 특별한 Pod만 배치"
```

#### 4. Controller Manager

```
Controller Manager (kube-controller-manager):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

여러 Controller의 집합체

주요 Controller:

1. Deployment Controller
   목표 상태 유지

   desired: 3 replicas
   current: 2 replicas (1개 죽음)
   → ReplicaSet에 3개 유지 요청

2. ReplicaSet Controller
   Pod 개수 유지

   desired: 3 pods
   current: 2 pods
   → 1개 Pod 생성 요청

3. Node Controller
   Node 상태 모니터링

   Node 1: Ready
   Node 2: NotReady (40초 동안)
   → Pod 대피 시작

4. Service Controller
   Service 리소스 관리

   LoadBalancer Service 생성
   → 클라우드 LB 프로비저닝 요청

5. Endpoint Controller
   Service와 Pod 연결

   Service "web"
   → Pod "web-1", "web-2", "web-3" 찾기
   → Endpoint 오브젝트 업데이트

동작 원리 (Control Loop):

while true:
    # 1. 원하는 상태 읽기
    desired_state = read_from_spec()

    # 2. 현재 상태 읽기
    current_state = read_from_status()

    # 3. 차이 확인
    if current_state != desired_state:
        # 4. 조치 취하기
        reconcile(desired_state, current_state)

    sleep(10)
```

### Node 컴포넌트

#### 1. kubelet

```
kubelet:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Node의 에이전트"

역할:
✓ Pod 실행/관리
✓ 컨테이너 상태 모니터링
✓ 볼륨 마운트
✓ API Server에 상태 보고

동작 흐름:

kubelet
   │
   │ (Watch API Server)
   │
   ├─► 1. 자신의 Node에 할당된 Pod 감지
   │   Pod "web-1" 할당됨!
   │
   ├─► 2. Container Runtime에 요청
   │   containerd에게 "nginx 이미지로 컨테이너 실행"
   │
   ├─► 3. 볼륨 마운트
   │   PersistentVolume 마운트
   │
   ├─► 4. Health Check
   │   Liveness Probe: HTTP GET /health
   │   → 200 OK
   │
   └─► 5. 상태 보고
       API Server에 Pod 상태 업데이트
       Status: Running

Health Check:

Liveness Probe (생존 확인)
→ 컨테이너가 살아있는가?
→ 실패 시: 컨테이너 재시작

apiVersion: v1
kind: Pod
spec:
  containers:
  - name: web
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10

Readiness Probe (준비 확인)
→ 컨테이너가 트래픽 받을 준비 되었는가?
→ 실패 시: Service에서 제외

    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
```

#### 2. kube-proxy

```
kube-proxy:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"네트워크 프록시"

역할:
✓ Service 리소스 구현
✓ 로드 밸런싱
✓ 네트워크 규칙 관리

동작 모드:

1. iptables 모드 (기본)

Service: web
ClusterIP: 10.96.0.10
Endpoints: 172.17.0.2, 172.17.0.3, 172.17.0.4

kube-proxy가 iptables 규칙 생성:

# Service IP로 오는 트래픽을 Pod로 분산
-A KUBE-SERVICES -d 10.96.0.10/32 -p tcp -m tcp --dport 80 -j KUBE-SVC-WEB

-A KUBE-SVC-WEB -m statistic --mode random --probability 0.33 -j KUBE-SEP-1
-A KUBE-SVC-WEB -m statistic --mode random --probability 0.50 -j KUBE-SEP-2
-A KUBE-SVC-WEB -j KUBE-SEP-3

-A KUBE-SEP-1 -p tcp -m tcp -j DNAT --to-destination 172.17.0.2:80
-A KUBE-SEP-2 -p tcp -m tcp -j DNAT --to-destination 172.17.0.3:80
-A KUBE-SEP-3 -p tcp -m tcp -j DNAT --to-destination 172.17.0.4:80

요청 흐름:

Client
  │
  │ GET http://web.default.svc.cluster.local
  │ (DNS → 10.96.0.10)
  ▼
iptables
  │
  │ 랜덤 선택 (33% 확률)
  ├─► Pod 1 (172.17.0.2)
  ├─► Pod 2 (172.17.0.3)
  └─► Pod 3 (172.17.0.4)

2. IPVS 모드 (고성능)

더 빠른 로드 밸런싱
더 많은 알고리즘:
- rr (Round Robin)
- lc (Least Connection)
- sh (Source Hashing)
```

---

## 핵심 오브젝트

### Pod

```
Pod = Kubernetes의 최소 배포 단위
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pod 구조:

┌─────────────────────────────────────┐
│              Pod                     │
│  ┌────────────────────────────────┐ │
│  │     Network Namespace          │ │
│  │  IP: 172.17.0.5                │ │
│  │  Hostname: web-pod-abc123      │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │ Container 1  │  │Container 2  │ │
│  │  (nginx)     │  │ (sidecar)   │ │
│  │              │  │             │ │
│  │ Port: 80     │  │ Port: 9090  │ │
│  └──────────────┘  └─────────────┘ │
│         │                 │         │
│         └────────┬────────┘         │
│                  │                  │
│  ┌───────────────▼───────────────┐ │
│  │       Shared Volumes          │ │
│  │  /var/log (EmptyDir)          │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘

특징:
✓ 하나 이상의 컨테이너
✓ 같은 IP 주소 공유
✓ localhost로 통신
✓ 볼륨 공유
✓ 함께 스케줄링
✓ 생명주기 동일
```

```yaml
# Pod 예제
apiVersion: v1
kind: Pod
metadata:
  name: web-pod
  labels:
    app: web
    tier: frontend
spec:
  # 컨테이너들
  containers:
  # 메인 컨테이너
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80
    resources:
      requests:
        memory: "128Mi"
        cpu: "100m"
      limits:
        memory: "256Mi"
        cpu: "200m"
    livenessProbe:
      httpGet:
        path: /health
        port: 80
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /ready
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
    env:
    - name: ENV
      value: "production"

  # 사이드카 컨테이너
  - name: log-collector
    image: fluentd:latest
    volumeMounts:
    - name: logs
      mountPath: /logs

  # 볼륨
  volumes:
  - name: logs
    emptyDir: {}

  # Node 선택
  nodeSelector:
    disktype: ssd

  # 재시작 정책
  restartPolicy: Always
```

```
Pod 생명주기:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Pending
   → Pod 생성됨, 스케줄링 대기 중

2. ContainerCreating
   → 이미지 다운로드, 컨테이너 생성 중

3. Running
   → 모든 컨테이너 실행 중

4. Succeeded / Failed
   → 컨테이너 종료

5. Unknown
   → kubelet과 통신 불가

┌─────────┐
│ Pending │
└────┬────┘
     │ Scheduler가 Node 할당
     ▼
┌──────────────────┐
│ContainerCreating │
└────┬─────────────┘
     │ 이미지 pull 완료
     ▼
┌─────────┐
│ Running │──┐
└────┬────┘  │ Liveness Probe 실패
     │       │ (재시작)
     │       ▼
     │  ┌─────────┐
     │  │Restarting│
     │  └────┬────┘
     │       │
     │◄──────┘
     │
     │ 컨테이너 정상 종료
     ▼
┌───────────┐
│ Succeeded │
└───────────┘

컨테이너 비정상 종료:
┌─────────┐
│ Failed  │
└─────────┘
```

### ReplicaSet

```
ReplicaSet = Pod 복제본 관리
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

목적: 지정된 수의 Pod 복제본 유지

┌──────────────────────────────────────┐
│         ReplicaSet: web-rs           │
│         Replicas: 3                  │
│                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐
│  │ Pod 1    │ │ Pod 2    │ │ Pod 3    │
│  │ Running  │ │ Running  │ │ Running  │
│  └──────────┘ └──────────┘ └──────────┘
└──────────────────────────────────────┘

동작:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

시나리오 1: Pod 하나 죽음
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Pod 1    │ │ Pod 2    │ │ Pod 3    │
│ Running  │ │ Failed ✗ │ │ Running  │
└──────────┘ └──────────┘ └──────────┘

ReplicaSet Controller 감지:
current: 2, desired: 3
→ Pod 1개 생성

┌──────────┐ ┌──────────┐ ┌──────────┐
│ Pod 1    │ │ Pod 4    │ │ Pod 3    │
│ Running  │ │ Creating │ │ Running  │
└──────────┘ └──────────┘ └──────────┘

시나리오 2: 스케일 업
kubectl scale rs web-rs --replicas=5

┌──────────┐ ┌──────────┐ ┌──────────┐
│ Pod 1    │ │ Pod 2    │ │ Pod 3    │
└──────────┘ └──────────┘ └──────────┘
             ┌──────────┐ ┌──────────┐
             │ Pod 4    │ │ Pod 5    │
             │ Creating │ │ Creating │
             └──────────┘ └──────────┘

시나리오 3: 스케일 다운
kubectl scale rs web-rs --replicas=2

┌──────────┐ ┌──────────┐ ┌──────────┐
│ Pod 1    │ │ Pod 2    │ │ Pod 3    │
│ Running  │ │ Running  │ │Terminating
└──────────┘ └──────────┘ └──────────┘
```

```yaml
# ReplicaSet 예제
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: web-rs
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
```

### Deployment

```
Deployment = ReplicaSet의 상위 개념
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ReplicaSet + 롤링 업데이트 + 롤백

Deployment
    │
    ├─► ReplicaSet v1 (replicas: 0)
    │   └─► Pod (종료됨)
    │
    └─► ReplicaSet v2 (replicas: 3)
        ├─► Pod 1 (nginx:1.22)
        ├─► Pod 2 (nginx:1.22)
        └─► Pod 3 (nginx:1.22)
```

```yaml
# Deployment 예제
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 최대 추가 Pod 수
      maxUnavailable: 1  # 최대 불가능 Pod 수
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
        version: v1
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

```
롤링 업데이트 과정:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

초기 상태 (nginx:1.21):
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Pod 1    │ │ Pod 2    │ │ Pod 3    │
│ v1.21    │ │ v1.21    │ │ v1.21    │
└──────────┘ └──────────┘ └──────────┘

$ kubectl set image deployment/web nginx=nginx:1.22

Step 1: 새 Pod 생성 (maxSurge: 1)
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Pod 1    │ │ Pod 2    │ │ Pod 3    │ │ Pod 4    │
│ v1.21    │ │ v1.21    │ │ v1.21    │ │ v1.22    │
└──────────┘ └──────────┘ └──────────┘ └Creating──┘

Step 2: Pod 4 준비 완료, Pod 1 종료 (maxUnavailable: 1)
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Pod 1    │ │ Pod 2    │ │ Pod 3    │ │ Pod 4    │
│Terminating│ │ v1.21    │ │ v1.21    │ │ v1.22 ✓  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

Step 3: Pod 5 생성
             ┌──────────┐ ┌──────────┐ ┌──────────┐
             │ Pod 2    │ │ Pod 3    │ │ Pod 4    │
             │ v1.21    │ │ v1.21    │ │ v1.22    │
             └──────────┘ └──────────┘ └──────────┘
┌──────────┐
│ Pod 5    │
│ v1.22    │
└Creating──┘

Step 4: Pod 5 준비, Pod 2 종료
┌──────────┐              ┌──────────┐ ┌──────────┐
│ Pod 2    │              │ Pod 3    │ │ Pod 4    │
│Terminating│              │ v1.21    │ │ v1.22    │
└──────────┘              └──────────┘ └──────────┘
             ┌──────────┐
             │ Pod 5    │
             │ v1.22 ✓  │
             └──────────┘

Step 5: Pod 6 생성
                          ┌──────────┐ ┌──────────┐
                          │ Pod 3    │ │ Pod 4    │
                          │ v1.21    │ │ v1.22    │
                          └──────────┘ └──────────┘
             ┌──────────┐ ┌──────────┐
             │ Pod 5    │ │ Pod 6    │
             │ v1.22    │ │ v1.22    │
             └──────────┘ └Creating──┘

Step 6: 완료
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Pod 4    │ │ Pod 5    │ │ Pod 6    │
│ v1.22 ✓  │ │ v1.22 ✓  │ │ v1.22 ✓  │
└──────────┘ └──────────┘ └──────────┘

→ 무중단 배포 완료!
```

```bash
# 롤백
$ kubectl rollout undo deployment/web

# 특정 버전으로 롤백
$ kubectl rollout undo deployment/web --to-revision=2

# 히스토리 확인
$ kubectl rollout history deployment/web
REVISION  CHANGE-CAUSE
1         <none>
2         kubectl set image deployment/web nginx=nginx:1.22
3         kubectl set image deployment/web nginx=nginx:1.23
```

### Service

```
Service = Pod 그룹에 대한 네트워크 엔드포인트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

문제:
Pod는 언제든지 재생성될 수 있음
→ IP 주소가 바뀜
→ 어떻게 안정적으로 접근?

해결:
Service가 고정 IP 제공
→ 뒤의 Pod가 바뀌어도 Service IP는 동일
```

#### Service 타입

```
1. ClusterIP (기본값)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

클러스터 내부에서만 접근 가능

┌─────────────────────────────────────┐
│         Kubernetes Cluster          │
│                                     │
│  ┌────────────────────────────┐   │
│  │  Service: web              │   │
│  │  Type: ClusterIP           │   │
│  │  IP: 10.96.0.10            │   │
│  └──────┬─────────────────────┘   │
│         │                          │
│    ┌────┼────┬────────┐           │
│    │         │        │           │
│  ┌─▼──┐  ┌──▼─┐  ┌──▼─┐          │
│  │Pod1│  │Pod2│  │Pod3│          │
│  └────┘  └────┘  └────┘          │
│                                     │
│  다른 Pod에서 접근:                │
│  curl http://web.default.svc.cluster.local
│  curl http://10.96.0.10            │
└─────────────────────────────────────┘

외부에서 접근 불가 ✗


2. NodePort
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

각 Node의 포트로 접근 가능

┌─────────────────────────────────────┐
│         Kubernetes Cluster          │
│                                     │
│  Node 1          Node 2          Node 3
│  :30080          :30080          :30080
│    │               │               │
│    └───────────────┼───────────────┘
│                    │
│  ┌────────────────▼───────────────┐
│  │  Service: web                  │
│  │  Type: NodePort                │
│  │  ClusterIP: 10.96.0.10         │
│  │  NodePort: 30080               │
│  └──────┬─────────────────────────┘
│         │
│    ┌────┼────┬────────┐
│    │         │        │
│  ┌─▼──┐  ┌──▼─┐  ┌──▼─┐
│  │Pod1│  │Pod2│  │Pod3│
│  └────┘  └────┘  └────┘
└─────────────────────────────────────┘

외부에서 접근:
http://<NodeIP>:30080
http://192.168.1.10:30080
http://192.168.1.11:30080
http://192.168.1.12:30080


3. LoadBalancer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

클라우드 로드 밸런서 생성

              Internet
                 │
                 ▼
┌────────────────────────────────┐
│  Cloud Load Balancer           │
│  IP: 34.123.45.67              │
└──────────────┬─────────────────┘
               │
┌──────────────▼──────────────────┐
│    Kubernetes Cluster           │
│                                 │
│  Node 1      Node 2      Node 3 │
│    :30080      :30080      :30080
│      │           │           │
│      └───────────┼───────────┘
│                  │
│  ┌──────────────▼──────────────┐
│  │  Service: web               │
│  │  Type: LoadBalancer         │
│  │  ClusterIP: 10.96.0.10      │
│  │  External IP: 34.123.45.67  │
│  └──────┬──────────────────────┘
│         │
│    ┌────┼────┬────────┐
│    │         │        │
│  ┌─▼──┐  ┌──▼─┐  ┌──▼─┐
│  │Pod1│  │Pod2│  │Pod3│
│  └────┘  └────┘  └────┘
└─────────────────────────────────┘

외부에서 접근:
http://34.123.45.67


4. ExternalName
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

외부 서비스를 Kubernetes 내부 이름으로 매핑

Service: external-db
ExternalName: db.example.com

Pod에서:
mysql -h external-db.default.svc.cluster.local
→ 실제로는 db.example.com으로 연결
```

```yaml
# ClusterIP Service
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
  - port: 80        # Service 포트
    targetPort: 8080 # Pod 포트

---
# NodePort Service
apiVersion: v1
kind: Service
metadata:
  name: web-nodeport
spec:
  type: NodePort
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080  # 30000-32767 범위

---
# LoadBalancer Service
apiVersion: v1
kind: Service
metadata:
  name: web-lb
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 8080
```

### Ingress

```
Ingress = HTTP/HTTPS 라우팅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

L7 로드 밸런서 (Application Layer)

              Internet
                 │
                 ▼
        ┌────────────────┐
        │  Ingress       │
        │  (nginx/traefik│
        └────┬───────────┘
             │
    ┌────────┼────────┐
    │        │        │
    │ example.com/    │
    │        │        │
    ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐
│Service │ │Service │ │Service │
│  web   │ │  api   │ │  admin │
└────────┘ └────────┘ └────────┘

라우팅 규칙:
example.com/        → web service
example.com/api     → api service
admin.example.com   → admin service
```

```yaml
# Ingress 예제
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  # example.com
  - host: example.com
    http:
      paths:
      # example.com/ → web service
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
      # example.com/api → api service
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80

  # admin.example.com → admin service
  - host: admin.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin
            port:
              number: 80

  # TLS 설정
  tls:
  - hosts:
    - example.com
    - admin.example.com
    secretName: tls-secret
```

---

## 실전 배포 예제

### 완전한 웹 애플리케이션

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: myapp

---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: myapp
data:
  database_host: postgres.myapp.svc.cluster.local
  redis_host: redis.myapp.svc.cluster.local
  log_level: "info"

---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
  namespace: myapp
type: Opaque
data:
  db_password: cGFzc3dvcmQxMjM=  # base64 encoded
  jwt_secret: c2VjcmV0a2V5MTIz

---
# postgres-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: db_password
        - name: POSTGRES_DB
          value: myapp
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc

---
# postgres-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: myapp
spec:
  selector:
    app: postgres
  ports:
  - port: 5432

---
# redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:alpine
        ports:
        - containerPort: 6379

---
# redis-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: myapp
spec:
  selector:
    app: redis
  ports:
  - port: 6379

---
# app-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: myapp
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: database_host
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: db_password
        - name: REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: redis_host
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# app-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: myapp
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 3000

---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  namespace: myapp
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - myapp.example.com
    secretName: myapp-tls
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80

---
# hpa.yaml (Auto Scaling)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
  namespace: myapp
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

```bash
# 배포
$ kubectl apply -f namespace.yaml
$ kubectl apply -f configmap.yaml
$ kubectl apply -f secret.yaml
$ kubectl apply -f postgres-deployment.yaml
$ kubectl apply -f postgres-service.yaml
$ kubectl apply -f redis-deployment.yaml
$ kubectl apply -f redis-service.yaml
$ kubectl apply -f app-deployment.yaml
$ kubectl apply -f app-service.yaml
$ kubectl apply -f ingress.yaml
$ kubectl apply -f hpa.yaml

# 상태 확인
$ kubectl get all -n myapp

NAME                           READY   STATUS    RESTARTS   AGE
pod/postgres-abc123           1/1     Running   0          5m
pod/redis-def456              1/1     Running   0          5m
pod/web-ghi789                1/1     Running   0          3m
pod/web-jkl012                1/1     Running   0          3m
pod/web-mno345                1/1     Running   0          3m

NAME                   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)
service/postgres       ClusterIP   10.96.0.10      <none>        5432/TCP
service/redis          ClusterIP   10.96.0.11      <none>        6379/TCP
service/web            ClusterIP   10.96.0.12      <none>        80/TCP

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/postgres   1/1     1            1           5m
deployment.apps/redis      1/1     1            1           5m
deployment.apps/web        3/3     3            3           3m
```

---

## 다음 학습

- [Kubernetes 네트워킹 심화](kubernetes-networking.md)
- [Kubernetes 스토리지](kubernetes-storage.md)
- [Helm 패키지 관리](helm-guide.md)
- [실습 프로젝트](../code-examples/kubernetes-hands-on/README.md)

---

*Last updated: 2026-01-12*
