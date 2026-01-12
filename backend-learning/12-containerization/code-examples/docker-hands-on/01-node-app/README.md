# Node.js 애플리케이션 Docker 실습

## 🎯 학습 목표

- Node.js 애플리케이션을 Docker 이미지로 만들기
- Dockerfile 작성법 이해
- 이미지 빌드 캐싱 최적화
- 환경 변수 사용
- 볼륨 마운트

## 📝 실습 내용

간단한 Express.js REST API를 Docker 컨테이너로 실행합니다.

## 🏗️ 프로젝트 구조

```
01-node-app/
├── README.md
├── package.json
├── server.js
├── .dockerignore
├── Dockerfile.bad          # ❌ 나쁜 예
├── Dockerfile.good         # ✅ 좋은 예
└── Dockerfile.optimized    # 🚀 최적화된 예
```

## 📦 Step 1: Node.js 애플리케이션 생성

### package.json
```json
{
  "name": "docker-node-app",
  "version": "1.0.0",
  "description": "Node.js app for Docker learning",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

### server.js
```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Docker!',
    environment: process.env.NODE_ENV || 'development',
    hostname: require('os').hostname()
  });
});

// Data endpoint
let data = [];
app.get('/api/data', (req, res) => {
  res.json(data);
});

app.post('/api/data', (req, res) => {
  const item = {
    id: Date.now(),
    ...req.body
  };
  data.push(item);
  res.status(201).json(item);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

## 🐳 Step 2: Dockerfile 작성

### ❌ Dockerfile.bad (나쁜 예)
```dockerfile
FROM node:18

# 모든 파일 복사 (node_modules 포함!)
COPY . .

# 의존성 설치
RUN npm install

# 포트 노출
EXPOSE 3000

# 앱 실행
CMD ["npm", "start"]
```

**문제점:**
- 큰 베이스 이미지 (node:18 = ~1GB)
- node_modules까지 복사
- 캐싱 활용 안 됨
- root 권한으로 실행
- devDependencies까지 설치

### ✅ Dockerfile.good (좋은 예)
```dockerfile
# 베이스 이미지 (alpine = 경량)
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json 먼저 복사 (캐싱)
COPY package*.json ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY server.js ./

# 비root 사용자로 실행
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# 포트 노출
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 앱 실행
CMD ["node", "server.js"]
```

**개선점:**
- alpine 이미지 사용 (크기 1/10)
- package.json 먼저 복사 (캐싱 활용)
- 프로덕션 의존성만 설치
- 비root 사용자
- Health check 추가

### 🚀 Dockerfile.optimized (최적화)
```dockerfile
# 멀티 스테이지 빌드
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 복사
COPY server.js ./

# 실행 스테이지
FROM node:18-alpine

WORKDIR /app

# 빌더에서 필요한 것만 복사
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json

# 비root 사용자
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

### .dockerignore
```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
README.md
.vscode
.idea
.DS_Store
*.log
dist
coverage
```

## 🛠️ Step 3: 빌드 및 실행

### 나쁜 예 빌드
```bash
# 빌드
docker build -f Dockerfile.bad -t node-app:bad .

# 이미지 크기 확인
docker images node-app:bad
# REPOSITORY   TAG   SIZE
# node-app     bad   1.1GB  ← 매우 큼!

# 실행
docker run -p 3000:3000 node-app:bad

# 테스트
curl http://localhost:3000
```

### 좋은 예 빌드
```bash
# 빌드
docker build -f Dockerfile.good -t node-app:good .

# 이미지 크기 확인
docker images node-app:good
# REPOSITORY   TAG   SIZE
# node-app     good  180MB  ← 6배 작음!

# 실행
docker run -d \
  --name node-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  node-app:good

# 로그 확인
docker logs node-app

# Health check
docker inspect node-app | grep -A 5 Health
```

### 최적화 예 빌드
```bash
# 빌드
docker build -f Dockerfile.optimized -t node-app:optimized .

# 이미지 크기 확인
docker images node-app:optimized
# REPOSITORY   TAG        SIZE
# node-app     optimized  170MB  ← 가장 작음!

# 실행
docker run -d \
  --name node-app-opt \
  -p 3001:3000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  node-app:optimized
```

## 📊 캐싱 테스트

### 소스 코드 수정
```bash
# server.js 수정
echo 'console.log("Updated");' >> server.js

# 다시 빌드 (캐싱 효과 확인)
docker build -f Dockerfile.good -t node-app:good .

# 출력:
# Step 1/10 : FROM node:18-alpine
#  ---> Using cache  ← 캐시 사용
# Step 2/10 : WORKDIR /app
#  ---> Using cache  ← 캐시 사용
# Step 3/10 : COPY package*.json ./
#  ---> Using cache  ← 캐시 사용
# Step 4/10 : RUN npm ci --only=production
#  ---> Using cache  ← 캐시 사용 (5분 절약!)
# Step 5/10 : COPY server.js ./
#  ---> abc123def456  ← 새로 빌드
# ...
```

## 🔧 환경 변수 사용

```bash
# 환경 변수로 실행
docker run -d \
  --name node-app-env \
  -p 3002:4000 \
  -e PORT=4000 \
  -e NODE_ENV=staging \
  -e API_KEY=secret123 \
  node-app:good

# 환경 변수 파일 사용
cat > .env << EOF
PORT=3000
NODE_ENV=production
API_KEY=prod_key_123
EOF

docker run -d \
  --name node-app-envfile \
  -p 3003:3000 \
  --env-file .env \
  node-app:good
```

## 📦 볼륨 마운트

```bash
# 로그 디렉토리 마운트
docker run -d \
  --name node-app-volume \
  -p 3004:3000 \
  -v $(pwd)/logs:/app/logs \
  node-app:good

# Named volume 사용
docker volume create node-app-data

docker run -d \
  --name node-app-named-volume \
  -p 3005:3000 \
  -v node-app-data:/app/data \
  node-app:good
```

## 🧪 테스트

```bash
# API 테스트
curl http://localhost:3000
curl http://localhost:3000/health

# 데이터 추가
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "Docker", "type": "Container"}'

# 데이터 조회
curl http://localhost:3000/api/data

# 컨테이너 내부 접속
docker exec -it node-app sh
> ls -la
> ps aux
> exit
```

## 📈 성능 비교

```bash
# 빌드 시간 비교
time docker build -f Dockerfile.bad -t node-app:bad .
# real: 2m 30s

time docker build -f Dockerfile.good -t node-app:good .
# real: 1m 45s

time docker build -f Dockerfile.optimized -t node-app:optimized .
# real: 1m 30s

# 이미지 크기 비교
docker images | grep node-app
# node-app  bad        1.1GB
# node-app  good       180MB
# node-app  optimized  170MB
```

## 🧹 정리

```bash
# 컨테이너 중지 및 삭제
docker stop $(docker ps -a -q --filter ancestor=node-app:*)
docker rm $(docker ps -a -q --filter ancestor=node-app:*)

# 이미지 삭제
docker rmi node-app:bad node-app:good node-app:optimized

# 볼륨 삭제
docker volume rm node-app-data

# 모든 정지된 컨테이너 삭제
docker container prune

# 사용하지 않는 이미지 삭제
docker image prune
```

## ✅ 체크리스트

실습을 완료했다면 다음을 이해했어야 합니다:

- [ ] Dockerfile 작성법
- [ ] 이미지 레이어와 캐싱
- [ ] alpine 이미지 사용
- [ ] 멀티 스테이지 빌드
- [ ] 비root 사용자 설정
- [ ] Health check
- [ ] 환경 변수 사용
- [ ] 볼륨 마운트
- [ ] .dockerignore 사용

## 🎯 다음 단계

- [Python 앱 컨테이너화](../02-python-app/README.md)
- [Go 멀티 스테이지 빌드](../03-go-app/README.md)

---

*Docker 기초를 마스터했습니다!* 🎉
