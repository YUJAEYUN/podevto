# 12. Containerization (컨테이너화)

Docker와 Kubernetes를 완벽하게 마스터하는 학습 가이드입니다.

## 📚 목차

### 📖 이론 (Notes)
1. **[컨테이너 기초](notes/container-basics.md)** - 컨테이너란 무엇인가?
2. **[프로세스 깊이 이해](notes/process-deep-dive.md)** - 프로세스와 컨테이너의 관계
3. **[격리 메커니즘](notes/isolation-explained.md)** - Namespace와 Cgroups
4. **[VM vs venv vs Container](notes/vm-vs-venv-vs-container.md)** - 비교 분석
5. **[Docker 완벽 가이드](notes/docker.md)** - Docker 기초부터 고급까지
6. **[Docker 이미지 심화](notes/docker-image-deep-dive.md)** - 이미지 레이어 시스템
7. **[Docker 내부 동작](notes/docker-internals-deep-dive.md)** ⭐ - 아키텍처와 내부 구조
8. **[Docker Compose vs Kubernetes](notes/compose-vs-kubernetes.md)** - 언제 무엇을 사용할까?
9. **[Kubernetes 완벽 가이드](notes/kubernetes-complete-guide.md)** ⭐ - K8s 마스터
10. **[프로덕션 베스트 프랙티스](notes/production-best-practices.md)** ⭐ - 실전 운영 가이드

### 💻 실습 (Code Examples)
1. **[Docker Hands-on](code-examples/docker-hands-on/)** - Docker 실전 프로젝트
   - Node.js 앱 컨테이너화
   - Python Flask 앱
   - Go 멀티 스테이지 빌드
   - Docker Compose 마이크로서비스
   - 프로덕션 최적화

### 🎯 학습 자료 (Resources)
- 추천 강의 및 책
- 공식 문서 링크
- 유용한 도구들

---

## 🗺️ 학습 로드맵

### Week 1: Docker 기초 (10-12시간)
```
Day 1-2: 개념 이해 (4시간)
├── 컨테이너란 무엇인가?
├── VM vs Container
├── Docker 아키텍처
└── 실습: Hello World 컨테이너

Day 3-4: Docker 실습 (4시간)
├── Dockerfile 작성
├── 이미지 빌드
├── 컨테이너 실행/관리
└── 실습: Node.js 앱 컨테이너화

Day 5-7: Docker 심화 (4시간)
├── 멀티 스테이지 빌드
├── 네트워킹
├── 볼륨
├── Docker Compose
└── 실습: 마이크로서비스 구축
```

### Week 2: Docker 고급 & Kubernetes 입문 (10-12시간)
```
Day 1-2: Docker 최적화 (3시간)
├── 이미지 최적화
├── 보안 강화
├── 프로덕션 설정
└── 실습: 프로덕션 레디 이미지

Day 3-4: Kubernetes 기초 (4시간)
├── K8s 아키텍처
├── Pod, Deployment, Service
├── kubectl 명령어
└── 실습: 로컬 클러스터 (minikube)

Day 5-7: Kubernetes 심화 (4시간)
├── ConfigMap, Secret
├── Ingress
├── StatefulSet
├── Auto Scaling
└── 실습: 완전한 웹 애플리케이션 배포
```

### Week 3: 실전 프로젝트 (10시간)
```
프로젝트 1: 블로그 플랫폼 (5시간)
├── Frontend (React) + Backend (Node.js) + DB (PostgreSQL)
├── Docker Compose로 로컬 개발
├── Kubernetes로 프로덕션 배포
└── CI/CD 파이프라인

프로젝트 2: E-commerce 마이크로서비스 (5시간)
├── 여러 마이크로서비스
├── Redis 캐싱
├── 메시지 큐 (RabbitMQ)
├── 모니터링 (Prometheus + Grafana)
└── 무중단 배포
```

---

## 📋 학습 체크리스트

### Docker 기초
- [ ] 컨테이너와 이미지의 차이 이해
- [ ] Dockerfile 작성 가능
- [ ] 이미지 빌드 및 실행
- [ ] docker-compose.yml 작성
- [ ] 볼륨 마운트
- [ ] 네트워크 설정

### Docker 중급
- [ ] 멀티 스테이지 빌드
- [ ] 이미지 최적화 (크기 줄이기)
- [ ] Health check 구현
- [ ] 비root 사용자 설정
- [ ] 로그 관리
- [ ] 리소스 제한

### Docker 고급
- [ ] Docker 내부 구조 이해 (containerd, runc)
- [ ] 네임스페이스와 Cgroups
- [ ] Union File System
- [ ] 보안 강화 (capability, seccomp)
- [ ] 프로덕션 베스트 프랙티스
- [ ] CI/CD 파이프라인 구축

### Kubernetes 기초
- [ ] K8s 아키텍처 이해
- [ ] Pod, Deployment 생성
- [ ] Service로 네트워크 노출
- [ ] kubectl 명령어 숙지
- [ ] ConfigMap, Secret 사용
- [ ] 로컬 클러스터 운영 (minikube/kind)

### Kubernetes 중급
- [ ] Ingress 설정
- [ ] StatefulSet 이해
- [ ] PersistentVolume 사용
- [ ] Auto Scaling (HPA)
- [ ] 롤링 업데이트
- [ ] Helm 패키지 관리

### Kubernetes 고급
- [ ] 클러스터 아키텍처 이해
- [ ] RBAC 권한 관리
- [ ] Network Policy
- [ ] 모니터링 (Prometheus, Grafana)
- [ ] 로깅 (EFK Stack)
- [ ] 프로덕션 운영

---

## 🎓 추천 학습 자료

### 📺 온라인 강의
1. **Docker Mastery** (Udemy)
   - 강사: Bret Fisher
   - 시간: 20시간
   - 난이도: 초급~중급
   - 추천도: ⭐⭐⭐⭐⭐

2. **Docker Deep Dive** (Pluralsight)
   - 강사: Nigel Poulton
   - 시간: 10시간
   - 난이도: 중급
   - 추천도: ⭐⭐⭐⭐⭐

3. **Kubernetes for Developers** (Udemy)
   - 강사: Mumshad Mannambeth
   - 시간: 15시간
   - 난이도: 초급~중급
   - 추천도: ⭐⭐⭐⭐⭐

### 📚 책
1. **Docker Deep Dive**
   - 저자: Nigel Poulton
   - 난이도: 초급~중급
   - 추천도: ⭐⭐⭐⭐⭐

2. **Kubernetes in Action**
   - 저자: Marko Lukša
   - 난이도: 중급~고급
   - 추천도: ⭐⭐⭐⭐⭐

3. **The Docker Book**
   - 저자: James Turnbull
   - 난이도: 초급
   - 추천도: ⭐⭐⭐⭐

### 🎥 유튜브 채널
1. **TechWorld with Nana**
   - Docker Tutorial for Beginners
   - Kubernetes Tutorial for Beginners
   - 추천도: ⭐⭐⭐⭐⭐

2. **NetworkChuck**
   - Docker 기초 시리즈
   - 재미있고 이해하기 쉬움
   - 추천도: ⭐⭐⭐⭐

3. **Hussein Nasser**
   - Docker 내부 구조
   - 네트워킹 심화
   - 추천도: ⭐⭐⭐⭐⭐

### 📖 공식 문서
1. **Docker Documentation**
   - https://docs.docker.com/
   - 가장 정확한 정보

2. **Kubernetes Documentation**
   - https://kubernetes.io/docs/
   - 필수 레퍼런스

3. **Docker Hub**
   - https://hub.docker.com/
   - 공식 이미지 탐색

### 🛠️ 유용한 도구
1. **Docker Desktop**
   - GUI 기반 Docker 관리
   - Mac/Windows

2. **Portainer**
   - 웹 기반 Docker UI
   - 컨테이너 관리

3. **Lens**
   - Kubernetes IDE
   - 클러스터 관리

4. **k9s**
   - 터미널 기반 K8s UI
   - 빠른 관리

5. **Dive**
   - 이미지 레이어 분석
   - 최적화 도구

6. **Trivy**
   - 이미지 취약점 스캔
   - 보안 강화

---

## 🎯 실습 프로젝트 아이디어

### 프로젝트 1: 개인 블로그 플랫폼
```
기술 스택:
- Frontend: React + Nginx
- Backend: Node.js + Express
- Database: PostgreSQL
- Cache: Redis

학습 목표:
✓ Docker Compose로 로컬 개발 환경
✓ Kubernetes로 프로덕션 배포
✓ CI/CD 파이프라인
✓ 모니터링 및 로깅
```

### 프로젝트 2: E-commerce 마이크로서비스
```
서비스 구성:
- User Service (인증/권한)
- Product Service (상품 관리)
- Order Service (주문 처리)
- Payment Service (결제)
- Notification Service (알림)

학습 목표:
✓ 마이크로서비스 아키텍처
✓ 서비스 간 통신 (REST/gRPC)
✓ 메시지 큐 (RabbitMQ/Kafka)
✓ API Gateway (Kong/Traefik)
✓ 분산 트레이싱 (Jaeger)
```

### 프로젝트 3: 실시간 채팅 애플리케이션
```
기술 스택:
- Frontend: React + WebSocket
- Backend: Node.js + Socket.io
- Database: MongoDB
- Cache: Redis (Pub/Sub)

학습 목표:
✓ 스케일링 (수평 확장)
✓ 세션 공유
✓ 실시간 통신
✓ 로드 밸런싱
```

---

## 🚀 시작하기

### 1. Docker 설치
```bash
# Mac
brew install --cask docker

# Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 확인
docker --version
docker-compose --version
```

### 2. 첫 컨테이너 실행
```bash
# Hello World
docker run hello-world

# Nginx 웹 서버
docker run -d -p 80:80 nginx

# 확인
curl http://localhost
```

### 3. 실습 시작
```bash
cd code-examples/docker-hands-on/01-node-app
cat README.md
```

---

## 💡 학습 팁

### 효과적인 학습 방법
1. **이론 → 실습 → 프로젝트** 순서로 학습
2. 매일 **1-2시간** 꾸준히 학습
3. 직접 **타이핑**하며 실습 (복붙 금지!)
4. 에러를 두려워하지 말고 **디버깅** 연습
5. **공식 문서** 읽는 습관
6. 실제 **프로젝트**에 적용

### 자주 하는 실수
❌ 이론만 보고 실습 안 함
❌ 복붙만 하고 이해 안 함
❌ 에러 발생 시 바로 포기
❌ Docker만 배우고 Kubernetes는 나중에
❌ 로컬에서만 테스트하고 배포 안 해봄

✅ 이론 50% + 실습 50%
✅ 직접 타이핑하며 이해
✅ 에러 로그 읽고 해결
✅ Docker와 Kubernetes 함께 학습
✅ 실제 서버에 배포해보기

### 질문하는 법
1. **에러 메시지** 전문 복사
2. **실행 환경** 명시 (OS, Docker 버전)
3. **재현 단계** 작성
4. **시도한 해결 방법** 공유
5. Stack Overflow, GitHub Issues 활용

---

## 📊 학습 진도 추적

### Week 1 Progress
- [ ] Docker 기초 개념 이해
- [ ] Dockerfile 작성
- [ ] Docker Compose 사용
- [ ] 실습 프로젝트 1 완료

### Week 2 Progress
- [ ] Docker 최적화
- [ ] Kubernetes 기초
- [ ] kubectl 명령어 숙지
- [ ] 실습 프로젝트 2 완료

### Week 3 Progress
- [ ] Kubernetes 심화
- [ ] 프로덕션 배포
- [ ] CI/CD 구축
- [ ] 최종 프로젝트 완료

---

## 🤝 기여하기

이 학습 자료에 기여하고 싶으신가요?
- 오타/오류 발견 시 Issue 생성
- 새로운 실습 프로젝트 제안
- 추가 학습 자료 공유

---

## 📞 문의

질문이나 피드백이 있으시면 자유롭게 연락주세요!

---

## 📄 라이선스

MIT License

---

## 🎉 다음 단계

컨테이너화를 마스터했다면:
- [13. CI/CD](../13-ci-cd/) - 자동화 파이프라인
- [14. Cloud Computing](../14-cloud/) - AWS, GCP, Azure
- [15. Microservices](../15-microservices/) - 마이크로서비스 아키텍처

---

*Happy Containerizing!* 🐳

---

**Last updated:** 2026-01-12
**Version:** 1.0.0
**Maintained by:** Backend Learning Team
