# Python Flask 애플리케이션 Docker 실습

## 🎯 학습 목표

- Python 애플리케이션 컨테이너화
- 가상환경 vs Docker
- requirements.txt 관리
- Gunicorn 프로덕션 배포

## 📝 실습 내용

Flask REST API를 Docker 컨테이너로 실행합니다.

## 🏗️ 프로젝트 구조

```
02-python-app/
├── README.md
├── requirements.txt
├── app.py
├── .dockerignore
├── Dockerfile.dev
└── Dockerfile.prod
```

## 📦 Step 1: Flask 애플리케이션 생성

### requirements.txt
```txt
Flask==3.0.0
gunicorn==21.2.0
redis==5.0.1
psycopg2-binary==2.9.9
python-dotenv==1.0.0
```

### app.py
```python
from flask import Flask, jsonify, request
import os
import redis
import psycopg2
from datetime import datetime

app = Flask(__name__)

# Redis 연결
try:
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        decode_responses=True
    )
    redis_client.ping()
    print("✅ Redis connected")
except Exception as e:
    print(f"❌ Redis connection failed: {e}")
    redis_client = None

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'python-api',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/')
def index():
    return jsonify({
        'message': 'Hello from Python Flask! 🐍',
        'version': '1.0.0',
        'python_version': os.sys.version,
        'environment': os.getenv('FLASK_ENV', 'development')
    })

@app.route('/cache/set', methods=['POST'])
def set_cache():
    if not redis_client:
        return jsonify({'error': 'Redis not available'}), 503

    data = request.get_json()
    key = data.get('key')
    value = data.get('value')

    if not key or not value:
        return jsonify({'error': 'key and value required'}), 400

    redis_client.setex(key, 300, value)  # 5분 TTL
    return jsonify({'message': 'Cache set', 'key': key})

@app.route('/cache/get/<key>')
def get_cache(key):
    if not redis_client:
        return jsonify({'error': 'Redis not available'}), 503

    value = redis_client.get(key)
    if value is None:
        return jsonify({'error': 'Key not found'}), 404

    return jsonify({'key': key, 'value': value})

@app.route('/counter')
def counter():
    if not redis_client:
        return jsonify({'error': 'Redis not available'}), 503

    count = redis_client.incr('visit_counter')
    return jsonify({'visits': count})

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_ENV') == 'development'
    )
```

## 🐳 Step 2: Dockerfile 작성

### Dockerfile.dev (개발용)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 복사
COPY app.py .

# 환경 변수
ENV FLASK_ENV=development \
    PORT=5000

# 개발 서버 실행 (자동 리로드)
CMD ["python", "app.py"]
```

### Dockerfile.prod (프로덕션용)
```dockerfile
# ==================== Builder Stage ====================
FROM python:3.11-slim AS builder

WORKDIR /app

# 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ==================== Runtime Stage ====================
FROM python:3.11-slim

# 비root 사용자 생성
RUN useradd -m -u 1001 appuser

WORKDIR /app

# 의존성만 복사
COPY --from=builder /root/.local /home/appuser/.local
COPY --chown=appuser:appuser app.py .

# PATH 설정
ENV PATH=/home/appuser/.local/bin:$PATH \
    FLASK_ENV=production \
    PORT=5000

USER appuser

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/health')" || exit 1

# Gunicorn으로 실행
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--threads", "2", "app:app"]
```

### .dockerignore
```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
pip-log.txt
pip-delete-this-directory.txt
.pytest_cache/
.coverage
htmlcov/
.git
.gitignore
.env
.env.local
README.md
.vscode
.idea
.DS_Store
*.log
```

## 🛠️ Step 3: 빌드 및 실행

### 개발 환경
```bash
# 빌드
docker build -f Dockerfile.dev -t python-app:dev .

# 실행
docker run -d \
  --name python-app-dev \
  -p 5000:5000 \
  -e FLASK_ENV=development \
  python-app:dev

# 로그 확인
docker logs -f python-app-dev

# 테스트
curl http://localhost:5000
curl http://localhost:5000/health
```

### 프로덕션 환경
```bash
# 빌드
docker build -f Dockerfile.prod -t python-app:prod .

# 실행
docker run -d \
  --name python-app-prod \
  -p 5001:5000 \
  -e FLASK_ENV=production \
  python-app:prod

# Health check 확인
docker inspect python-app-prod | grep -A 10 Health

# 성능 테스트
ab -n 1000 -c 10 http://localhost:5001/
```

## 🔗 Redis와 연동

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

```bash
# 실행
docker-compose up -d

# 캐시 테스트
curl -X POST http://localhost:5000/cache/set \
  -H "Content-Type: application/json" \
  -d '{"key": "name", "value": "Docker"}'

curl http://localhost:5000/cache/get/name

# 카운터 테스트
curl http://localhost:5000/counter
curl http://localhost:5000/counter
curl http://localhost:5000/counter
```

## 📊 성능 비교

```bash
# 개발 서버 (Flask)
ab -n 1000 -c 10 http://localhost:5000/
# Requests per second: ~100

# 프로덕션 서버 (Gunicorn)
ab -n 1000 -c 10 http://localhost:5001/
# Requests per second: ~800

# 8배 성능 향상! 🚀
```

## 🧹 정리

```bash
docker-compose down
docker rm -f python-app-dev python-app-prod
docker rmi python-app:dev python-app:prod
```

## ✅ 체크리스트

- [ ] Python 앱 컨테이너화
- [ ] requirements.txt 관리
- [ ] 개발/프로덕션 Dockerfile 분리
- [ ] Gunicorn 설정
- [ ] Redis 연동
- [ ] Health check 구현
- [ ] 성능 테스트

## 🎯 다음 단계

- [Go 멀티 스테이지 빌드](../03-go-app/README.md)
