# Docker 프로덕션 베스트 프랙티스

## 목차
1. [이미지 최적화](#이미지-최적화)
2. [보안 강화](#보안-강화)
3. [리소스 관리](#리소스-관리)
4. [로깅 및 모니터링](#로깅-및-모니터링)
5. [배포 전략](#배포-전략)

---

## 이미지 최적화

### 1. 멀티 스테이지 빌드

```dockerfile
# ==================== 빌드 스테이지 ====================
FROM node:18 AS builder

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 빌드
COPY . .
RUN npm run build

# ==================== 실행 스테이지 ====================
FROM node:18-alpine

WORKDIR /app

# 빌드된 결과물만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

CMD ["node", "dist/index.js"]

# 결과: 이미지 크기 80% 감소
```

### 2. 레이어 캐싱 최적화

```dockerfile
# ❌ 비효율적
COPY . .
RUN npm install

# 소스 변경 시마다 npm install 재실행

# ✅ 효율적
COPY package*.json ./
RUN npm install    # ← 캐싱됨
COPY . .          # ← 소스만 변경

# package.json 변경 없으면 npm install 스킵
```

### 3. .dockerignore 활용

```
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
README.md
.vscode
.idea
.DS_Store
*.log
dist/
build/
coverage/
.nyc_output/
.cache/
*.swp
*~
```

### 4. Alpine 이미지 사용

```dockerfile
# Before: 1.1GB
FROM node:18
...

# After: 180MB (83% 감소)
FROM node:18-alpine
...
```

### 5. 불필요한 파일 제거

```dockerfile
RUN apt-get update && \
    apt-get install -y \
        curl \
        wget && \
    # 캐시 정리
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 한 RUN 명령으로 합쳐서 레이어 최소화
```

---

## 보안 강화

### 1. 비root 사용자로 실행

```dockerfile
# ❌ root로 실행 (보안 위험)
FROM node:18-alpine
COPY . .
CMD ["node", "app.js"]

# ✅ 전용 사용자 생성
FROM node:18-alpine

# 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app
COPY --chown=nodejs:nodejs . .

# 사용자 전환
USER nodejs

CMD ["node", "app.js"]
```

### 2. 읽기 전용 파일시스템

```bash
# 읽기 전용 컨테이너 실행
docker run -d \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \
  --tmpfs /var/run:rw,noexec,nosuid,size=10m \
  myapp:latest
```

```yaml
# Docker Compose
services:
  app:
    image: myapp:latest
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=100m
      - /var/run:rw,noexec,nosuid,size=10m
```

### 3. Capability 제한

```bash
# 모든 capability 제거 후 필요한 것만 추가
docker run -d \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --cap-add=CHOWN \
  myapp:latest
```

```yaml
# Docker Compose
services:
  app:
    image: myapp:latest
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
      - CHOWN
```

### 4. 시크릿 관리

```dockerfile
# ❌ 이미지에 시크릿 포함 (절대 금지!)
ENV API_KEY=secret123
ENV DB_PASSWORD=password123

# ✅ 런타임에 주입
# Docker Swarm Secrets 사용
```

```bash
# 시크릿 생성
echo "my-db-password" | docker secret create db_password -

# 컨테이너에서 사용
docker service create \
  --name myapp \
  --secret db_password \
  myapp:latest
```

```yaml
# Docker Compose (Swarm mode)
version: '3.8'

services:
  app:
    image: myapp:latest
    secrets:
      - db_password

secrets:
  db_password:
    external: true
```

### 5. 이미지 스캔

```bash
# Trivy로 취약점 스캔
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image myapp:latest

# Docker scan (Docker Desktop)
docker scan myapp:latest

# Snyk
snyk container test myapp:latest
```

### 6. 이미지 서명 및 검증

```bash
# Docker Content Trust 활성화
export DOCKER_CONTENT_TRUST=1

# 서명된 이미지만 pull
docker pull myregistry.com/myapp:latest
```

---

## 리소스 관리

### 1. CPU 제한

```bash
# CPU 코어 제한
docker run -d \
  --cpus="1.5" \
  myapp:latest

# CPU 가중치
docker run -d \
  --cpu-shares=1024 \
  myapp:latest

# CPU 셋 지정
docker run -d \
  --cpuset-cpus="0,1" \
  myapp:latest
```

```yaml
# Docker Compose
services:
  app:
    image: myapp:latest
    deploy:
      resources:
        limits:
          cpus: '1.5'
        reservations:
          cpus: '0.5'
```

### 2. 메모리 제한

```bash
# 메모리 제한
docker run -d \
  --memory="512m" \
  --memory-swap="1g" \
  --memory-reservation="256m" \
  myapp:latest

# OOM Killer 제어
docker run -d \
  --memory="512m" \
  --oom-kill-disable \
  myapp:latest
```

```yaml
# Docker Compose
services:
  app:
    image: myapp:latest
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### 3. Disk I/O 제한

```bash
# 읽기/쓰기 속도 제한
docker run -d \
  --device-read-bps /dev/sda:1mb \
  --device-write-bps /dev/sda:1mb \
  myapp:latest

# IOPS 제한
docker run -d \
  --device-read-iops /dev/sda:100 \
  --device-write-iops /dev/sda:100 \
  myapp:latest
```

### 4. 프로세스 수 제한

```bash
# PID 제한
docker run -d \
  --pids-limit=100 \
  myapp:latest
```

### 5. Health Check

```dockerfile
HEALTHCHECK --interval=30s \
            --timeout=3s \
            --start-period=5s \
            --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

```yaml
# Docker Compose
services:
  app:
    image: myapp:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

---

## 로깅 및 모니터링

### 1. 로깅 드라이버

```bash
# JSON 파일 로깅 (기본)
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myapp:latest

# Syslog
docker run -d \
  --log-driver syslog \
  --log-opt syslog-address=tcp://192.168.1.100:514 \
  myapp:latest

# Fluentd
docker run -d \
  --log-driver fluentd \
  --log-opt fluentd-address=192.168.1.100:24224 \
  --log-opt tag=myapp \
  myapp:latest
```

```yaml
# Docker Compose
services:
  app:
    image: myapp:latest
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

### 2. 구조화된 로깅

```javascript
// ❌ 비구조화된 로그
console.log('User login: johndoe');

// ✅ 구조화된 로그 (JSON)
const logger = require('pino')();

logger.info({
  event: 'user_login',
  userId: 'johndoe',
  timestamp: new Date().toISOString(),
  ip: req.ip
});
```

### 3. 메트릭 수집

```dockerfile
# Prometheus 메트릭 노출
EXPOSE 9090

# 애플리케이션에서 메트릭 제공
```

```javascript
// Node.js with Prometheus
const promClient = require('prom-client');
const register = new promClient.Registry();

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### 4. 모니터링 스택

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  # Grafana
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

  # cAdvisor (컨테이너 메트릭)
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro

  # Node Exporter (시스템 메트릭)
  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro

volumes:
  prometheus_data:
  grafana_data:
```

---

## 배포 전략

### 1. 블루-그린 배포

```bash
# Green (새 버전) 배포
docker run -d --name app-green -p 3001:3000 myapp:v2.0

# Health check
curl http://localhost:3001/health

# 트래픽 전환 (Nginx/Load Balancer)
# Blue (3000) → Green (3001)

# Blue 중지
docker stop app-blue
docker rm app-blue

# Green을 Blue로 변경
docker rename app-green app-blue
docker update --publish 3000:3000 app-blue
```

### 2. 카나리 배포

```bash
# 현재: v1.0 (90%)
docker-compose up -d --scale app=9

# 카나리: v2.0 (10%)
docker-compose -f docker-compose.canary.yml up -d --scale app-canary=1

# 트래픽 분산 (Nginx/HAProxy)
# 90% → v1.0
# 10% → v2.0

# 모니터링 후 점진적 증가
# 80% → v1.0, 20% → v2.0
# 50% → v1.0, 50% → v2.0
# ...
# 0% → v1.0, 100% → v2.0
```

### 3. 롤링 업데이트

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: myapp:latest
    deploy:
      replicas: 6
      update_config:
        parallelism: 2      # 한 번에 2개씩
        delay: 10s          # 10초 대기
        failure_action: rollback
        monitor: 60s
        max_failure_ratio: 0.3
      rollback_config:
        parallelism: 2
        delay: 5s
```

### 4. 제로 다운타임 배포

```bash
# 1. 새 버전 빌드
docker build -t myapp:v2.0 .

# 2. 새 컨테이너 시작 (다른 포트)
docker run -d --name app-v2 -p 3001:3000 myapp:v2.0

# 3. Health check 대기
while ! curl -f http://localhost:3001/health; do
  sleep 1
done

# 4. Load Balancer 설정 변경
# 트래픽을 3001로 전환

# 5. 구버전 컨테이너 중지
docker stop app-v1

# 6. 확인 후 구버전 삭제
docker rm app-v1
```

### 5. Docker Compose 무중단 배포

```bash
# docker-compose.yml 수정 후

# 무중단 배포
docker-compose up -d --no-deps --build app

# --no-deps: 의존 서비스 재시작 안 함
# --build: 이미지 재빌드
# app: 특정 서비스만 업데이트
```

---

## CI/CD 파이프라인

### GitHub Actions 예제

```yaml
# .github/workflows/docker.yml
name: Docker Build and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Scan image for vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app
            docker-compose pull
            docker-compose up -d --no-deps app
            docker image prune -f
```

---

## 체크리스트

배포 전 확인사항:

### 이미지
- [ ] Alpine 이미지 사용
- [ ] 멀티 스테이지 빌드
- [ ] .dockerignore 설정
- [ ] 불필요한 파일 제거
- [ ] 이미지 크기 < 500MB

### 보안
- [ ] 비root 사용자
- [ ] 읽기 전용 파일시스템
- [ ] Capability 제한
- [ ] 시크릿 외부화
- [ ] 취약점 스캔 통과
- [ ] 이미지 서명

### 리소스
- [ ] CPU 제한 설정
- [ ] 메모리 제한 설정
- [ ] Health check 구현
- [ ] 재시작 정책 설정

### 로깅/모니터링
- [ ] 구조화된 로깅
- [ ] 로그 로테이션
- [ ] 메트릭 노출
- [ ] 모니터링 대시보드

### 배포
- [ ] 무중단 배포 전략
- [ ] 롤백 계획
- [ ] Health check 통과 확인
- [ ] 성능 테스트

---

## 다음 학습

- [Kubernetes 프로덕션 가이드](kubernetes-production.md)
- [모니터링 심화](monitoring-guide.md)
- [보안 심화](security-hardening.md)

---

*Last updated: 2026-01-12*
