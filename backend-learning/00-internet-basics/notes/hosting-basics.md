# 웹 호스팅 기초 (Web Hosting Basics)

## 호스팅이란?

**웹 호스팅**은 웹사이트나 애플리케이션을 인터넷에 공개하기 위해 서버 공간과 리소스를 제공하는 서비스입니다.

```
개발 환경 (로컬)             프로덕션 환경 (호스팅)
┌────────────────┐          ┌────────────────┐
│ localhost:3000 │    →     │ example.com    │
│ 나만 접근 가능  │          │ 전 세계 접근 가능│
└────────────────┘          └────────────────┘
```

---

## 호스팅 구성 요소

### 1. 서버 (Server)

```
물리적 또는 가상의 컴퓨터:
- CPU, RAM, 저장공간
- 운영체제 (Linux, Windows)
- 네트워크 연결
- 24/7 가동
```

### 2. 도메인 (Domain)

```
example.com → 서버 IP 주소
사용자 친화적인 주소
```

### 3. DNS (Domain Name System)

```
도메인을 IP 주소로 변환
example.com → 93.184.216.34
```

### 4. 대역폭 (Bandwidth)

```
데이터 전송량
월 100GB, 무제한 등
```

---

## 호스팅 종류

### 1. 공유 호스팅 (Shared Hosting)

```
┌───────────────────────────────────┐
│          하나의 물리 서버          │
├───────┬───────┬───────┬───────────┤
│ Site A│ Site B│ Site C│ Site D    │
│ (나)  │       │       │           │
└───────┴───────┴───────┴───────────┘
```

**특징**:
- ✓ 저렴 (월 $3-10)
- ✓ 관리 간편
- ✗ 성능 제한적
- ✗ 리소스 공유 (다른 사이트 영향 받음)
- ✗ 커스터마이징 제한

**적합한 경우**:
- 개인 블로그
- 소규모 웹사이트
- 트래픽이 적은 사이트

**주요 제공사**:
- Bluehost
- HostGator
- SiteGround

### 2. VPS (Virtual Private Server)

```
┌───────────────────────────────────┐
│          하나의 물리 서버          │
├───────────┬───────────┬───────────┤
│  VPS 1    │  VPS 2    │  VPS 3    │
│  (나)     │           │           │
│  독립된    │           │           │
│  자원     │           │           │
└───────────┴───────────┴───────────┘
```

**특징**:
- ✓ 전용 리소스 보장
- ✓ Root 액세스
- ✓ 커스터마이징 가능
- ✓ 확장 가능
- ✗ 서버 관리 필요
- ✗ 공유 호스팅보다 비쌈 (월 $20-100)

**적합한 경우**:
- 중간 규모 웹사이트
- 개발자 프로젝트
- 커스텀 환경 필요

**주요 제공사**:
- DigitalOcean
- Linode
- Vultr

### 3. 전용 서버 (Dedicated Server)

```
┌───────────────────────────────────┐
│     전체 물리 서버를 독점 사용      │
│         모든 리소스 전용           │
└───────────────────────────────────┘
```

**특징**:
- ✓ 최고 성능
- ✓ 완전한 제어
- ✓ 최대 보안
- ✗ 비쌈 (월 $100-500+)
- ✗ 서버 관리 전문 지식 필요

**적합한 경우**:
- 대규모 웹사이트
- 높은 트래픽
- 엄격한 보안 요구사항

### 4. 클라우드 호스팅 (Cloud Hosting)

```
┌──────┐  ┌──────┐  ┌──────┐
│서버 1 │  │서버 2 │  │서버 3 │
└───┬──┘  └───┬──┘  └───┬──┘
    └─────────┼─────────┘
          네트워크
             │
        ┌────┴────┐
        │ 웹사이트 │
        └─────────┘
```

**특징**:
- ✓ 높은 가용성
- ✓ 자동 확장
- ✓ 사용한 만큼 지불
- ✓ 글로벌 배포
- ✗ 복잡한 설정
- ✗ 비용 예측 어려움

**주요 제공사**:
- AWS (Amazon Web Services)
- Google Cloud Platform (GCP)
- Microsoft Azure
- DigitalOcean
- Linode

---

## 클라우드 플랫폼 비교

### AWS (Amazon Web Services)

```
주요 서비스:
- EC2: 가상 서버
- S3: 객체 스토리지
- RDS: 관리형 데이터베이스
- Lambda: 서버리스 함수
- CloudFront: CDN

장점:
✓ 가장 많은 서비스
✓ 성숙한 생태계
✓ 글로벌 인프라

단점:
✗ 복잡한 가격 체계
✗ 학습 곡선 높음
```

### Google Cloud Platform (GCP)

```
주요 서비스:
- Compute Engine: 가상 서버
- Cloud Storage: 객체 스토리지
- Cloud SQL: 관리형 데이터베이스
- Cloud Functions: 서버리스
- Cloud CDN

장점:
✓ 우수한 네트워크
✓ BigQuery 등 데이터 분석
✓ Kubernetes 기원

단점:
✗ AWS보다 적은 서비스
```

### Microsoft Azure

```
주요 서비스:
- Virtual Machines
- Blob Storage
- Azure SQL Database
- Azure Functions

장점:
✓ Microsoft 제품 통합
✓ 엔터프라이즈 친화적

단점:
✗ 복잡한 UI
```

### DigitalOcean

```
주요 서비스:
- Droplets: 가상 서버
- Spaces: 객체 스토리지
- Managed Databases
- App Platform

장점:
✓ 간단한 UI
✓ 개발자 친화적
✓ 투명한 가격
✓ 좋은 문서

단점:
✗ AWS/GCP보다 적은 기능
```

---

## PaaS (Platform as a Service)

코드만 배포하면 인프라는 자동으로 관리되는 서비스입니다.

### Vercel

```
특징:
✓ Next.js에 최적화
✓ 자동 HTTPS
✓ Git 연동 자동 배포
✓ 글로벌 CDN
✓ 무료 티어 제공

적합한 용도:
- Next.js 애플리케이션
- 정적 사이트
- 프론트엔드 프로젝트
```

```bash
# Vercel 배포
$ npm install -g vercel
$ vercel

# 또는 Git 연동
1. GitHub/GitLab에 코드 푸시
2. Vercel에서 프로젝트 연결
3. 자동 배포 ✓
```

### Netlify

```
특징:
✓ 정적 사이트에 최적화
✓ 서버리스 함수 지원
✓ 폼 처리 내장
✓ Git 연동 자동 배포

적합한 용도:
- JAMstack 사이트
- 정적 사이트 생성기 (Gatsby, Hugo)
```

### Heroku

```
특징:
✓ 다양한 언어 지원 (Node.js, Python, Ruby)
✓ 애드온 생태계
✓ Git 연동 배포
✓ 간단한 설정

적합한 용도:
- 풀스택 애플리케이션
- API 서버
- 프로토타입
```

```bash
# Heroku 배포
$ npm install -g heroku
$ heroku login
$ heroku create my-app
$ git push heroku main
```

### Railway

```
특징:
✓ 간단한 UI
✓ Git 연동
✓ 데이터베이스 제공
✓ 합리적인 가격

적합한 용도:
- 소규모 프로젝트
- 사이드 프로젝트
```

---

## 배포 프로세스

### 1. 전통적인 배포 (VPS)

```bash
# 1. 서버 접속
$ ssh user@your-server-ip

# 2. 애플리케이션 클론
$ git clone https://github.com/username/app.git
$ cd app

# 3. 의존성 설치
$ npm install

# 4. 환경 변수 설정
$ nano .env
PORT=3000
DATABASE_URL=postgresql://...

# 5. 빌드
$ npm run build

# 6. PM2로 프로세스 관리
$ npm install -g pm2
$ pm2 start npm --name "my-app" -- start
$ pm2 save
$ pm2 startup

# 7. Nginx 설정
$ sudo nano /etc/nginx/sites-available/my-app
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}

$ sudo ln -s /etc/nginx/sites-available/my-app /etc/nginx/sites-enabled/
$ sudo nginx -t
$ sudo systemctl reload nginx

# 8. SSL 인증서 (Let's Encrypt)
$ sudo certbot --nginx -d example.com
```

### 2. Docker 배포

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 빌드 및 실행
$ docker build -t my-app .
$ docker run -d -p 3000:3000 --name my-app my-app

# Docker Compose
$ docker-compose up -d
```

```yaml
# docker-compose.yml
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_PASSWORD=secret
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

### 3. CI/CD 파이프라인 (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/my-app
            git pull origin main
            npm install
            npm run build
            pm2 reload my-app
```

---

## 환경 변수 관리

### .env 파일

```bash
# .env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=your-secret-key
API_KEY=abc123def456
```

```javascript
// 사용
require('dotenv').config();

const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
```

### 주의사항

```
✓ .env 파일은 .gitignore에 추가
✓ .env.example 파일로 템플릿 제공
✗ 절대 Git에 커밋하지 말 것
✗ 클라이언트 측 코드에 노출 금지
```

```
# .gitignore
.env
.env.local
.env.production
```

---

## 데이터베이스 호스팅

### 관리형 데이터베이스 서비스

#### AWS RDS (Relational Database Service)

```
지원 DB:
- PostgreSQL
- MySQL
- MariaDB
- Oracle
- SQL Server

장점:
✓ 자동 백업
✓ 자동 패치
✓ 읽기 복제본
✓ 자동 장애 조치
```

#### Heroku Postgres

```
특징:
✓ 간단한 설정
✓ 무료 티어 (10,000 rows)
✓ Heroku 앱과 통합

가격:
- Hobby: 무료 (10K rows)
- Basic: $9/월 (10M rows)
- Standard: $50+/월
```

#### Supabase

```
특징:
✓ PostgreSQL 기반
✓ 실시간 구독
✓ 인증 내장
✓ 자동 API 생성
✓ 무료 티어 제공
```

#### PlanetScale

```
특징:
✓ MySQL 호환
✓ 서버리스
✓ 브랜치 기능 (Git처럼)
✓ 무료 티어 제공
```

---

## 정적 사이트 호스팅

### GitHub Pages

```bash
# 무료 호스팅
# username.github.io로 접근

# 배포
1. GitHub 저장소 생성
2. Settings → Pages → Source 선택
3. https://username.github.io/repo-name
```

### Cloudflare Pages

```
특징:
✓ 무제한 대역폭
✓ 무료
✓ Git 연동 자동 배포
✓ 서버리스 함수 지원
```

### AWS S3 + CloudFront

```bash
# S3 버킷 생성 및 정적 웹사이트 호스팅 활성화
$ aws s3 mb s3://my-website
$ aws s3 website s3://my-website --index-document index.html

# 파일 업로드
$ aws s3 sync ./build s3://my-website --acl public-read

# CloudFront로 CDN 설정
```

---

## 모니터링 및 로깅

### Application Monitoring

```javascript
// PM2 모니터링
$ pm2 monit

// PM2 로그
$ pm2 logs

// PM2 상태
$ pm2 status
```

### 로그 관리

```javascript
// Winston 로깅
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.info('서버 시작됨');
logger.error('데이터베이스 연결 실패', { error: err });
```

---

## 백엔드 개발자를 위한 체크리스트

### 배포 전

```
□ 환경 변수 설정 확인
□ 데이터베이스 마이그레이션
□ 보안 설정 (방화벽, 포트)
□ HTTPS 인증서 설정
□ 도메인 DNS 설정
□ 에러 핸들링 확인
□ 로깅 설정
```

### 배포 후

```
□ 서버 상태 모니터링
□ 로그 확인
□ 성능 테스트
□ 백업 설정
□ 업데이트 계획
```

---

## 비용 최적화 팁

```
1. 무료 티어 활용
   - Vercel, Netlify: 프론트엔드
   - Railway, Render: 백엔드
   - Supabase, PlanetScale: 데이터베이스

2. 리소스 모니터링
   - 사용하지 않는 서버 종료
   - 자동 스케일링 설정

3. CDN 사용
   - 정적 파일은 CDN으로
   - 대역폭 비용 절감

4. 예약 인스턴스 (AWS/GCP)
   - 장기 사용 시 할인
```

---

## 추가 학습 자료

- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)

---

## 다음 학습

- [CI/CD](../13-ci-cd/)
- [컨테이너화 (Docker)](../12-containerization/)
- [모니터링](../14-monitoring/)

---

*Last updated: 2026-01-05*
