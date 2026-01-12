# 멀티 스테이지 빌드 심화

## 🎯 학습 목표

- 멀티 스테이지 빌드 패턴 마스터
- 빌드/테스트/프로덕션 분리
- 캐싱 최적화
- 디버그 vs 프로덕션 빌드

## 📚 주요 패턴

### 1. 3-Stage 빌드 (개발/테스트/프로덕션)

```dockerfile
# Stage 1: 의존성
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: 빌드
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm run test

# Stage 3: 프로덕션
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

### 2. 조건부 빌드

```dockerfile
# 개발용 타겟
FROM node:18 AS development
WORKDIR /app
COPY package*.json ./
RUN npm install  # dev 의존성 포함
COPY . .
CMD ["npm", "run", "dev"]

# 프로덕션용 타겟
FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "index.js"]
```

```bash
# 개발 이미지 빌드
docker build --target development -t app:dev .

# 프로덕션 이미지 빌드
docker build --target production -t app:prod .
```

### 3. 캐싱 최적화

```dockerfile
# ❌ 나쁜 예 (캐싱 안 됨)
FROM node:18
COPY . .
RUN npm install

# ✅ 좋은 예 (캐싱 활용)
FROM node:18-alpine AS deps
COPY package*.json ./
RUN npm ci  # ← 캐싱됨

FROM deps AS builder
COPY . .  # ← 소스만 변경 시 deps 캐싱 사용
RUN npm run build
```

## 📊 크기 비교

| 방법 | 이미지 크기 | 빌드 시간 |
|------|------------|-----------|
| 단일 스테이지 | 1.2GB | 3분 |
| 2-Stage (Alpine) | 180MB | 2분 |
| 3-Stage (최적화) | 150MB | 1.5분 |
| scratch 기반 | 10MB | 2분 |

## ✅ 베스트 프랙티스

1. **의존성 먼저 복사** (캐싱)
2. **빌드 도구는 빌더 스테이지에만**
3. **프로덕션은 최소 이미지**
4. **--target으로 용도별 빌드**
5. **BuildKit 캐싱 활용**

## 🎯 다음 단계

- [Docker Compose 마이크로서비스](../05-compose-microservices/README.md)
