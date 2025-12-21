# Nginx 완벽 가이드

> 고성능 웹 서버, 리버스 프록시, 로드 밸런서

## 개요

**Nginx** (엔진엑스, "engine x")는 2004년 Igor Sysoev가 개발한 고성능 웹 서버입니다. 이벤트 기반 비동기 아키텍처로 적은 리소스로 수만 개의 동시 연결을 처리할 수 있습니다.

### 핵심 아이디어

```
"적은 리소스로 많은 연결을 동시에 처리한다"

┌─────────────────────────────────────────────────────────────────────┐
│                         Nginx의 주요 역할                            │
│                                                                     │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐              │
│   │  웹 서버     │   │ 리버스 프록시 │   │ 로드 밸런서  │             │
│   │ (정적 파일)  │   │ (요청 전달)   │   │ (부하 분산)  │             │
│   └─────────────┘   └─────────────┘   └─────────────┘              │
│                                                                     │
│   + SSL/TLS 처리, 캐싱, 압축, Rate Limiting                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Nginx vs Apache

| 특성 | Nginx | Apache |
|------|-------|--------|
| **아키텍처** | 이벤트 기반, 비동기 | 프로세스/스레드 기반 |
| **동시 연결** | 수만 개 처리 가능 | 연결당 스레드 필요 |
| **메모리 사용** | 적음 (예측 가능) | 많음 (연결에 비례) |
| **정적 파일** | 매우 빠름 | 빠름 |
| **동적 처리** | 외부 프로세서 필요 | 모듈로 직접 처리 |
| **설정** | 단순, 선언적 | 유연, .htaccess 지원 |

```
동시 연결 처리 방식 비교
─────────────────────────────────────────

Apache (프로세스/스레드 모델):
┌────────────────────────────────────────┐
│  연결1 → [프로세스1] ─── 응답 대기... │
│  연결2 → [프로세스2] ─── 응답 대기... │
│  연결3 → [프로세스3] ─── 응답 대기... │
│  ...                                   │
│  연결N → [프로세스N] ─── 메모리 증가! │
└────────────────────────────────────────┘

Nginx (이벤트 기반 모델):
┌────────────────────────────────────────┐
│  ┌─────────────────────────────────┐  │
│  │      단일 Worker Process        │  │
│  │                                 │  │
│  │  연결1 ─┐                       │  │
│  │  연결2 ─┼─▶ 이벤트 루프 ─▶ 처리 │  │
│  │  연결3 ─┤    (비동기)           │  │
│  │  ...   ─┤                       │  │
│  │  연결N ─┘    메모리 일정!       │  │
│  └─────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## Nginx 아키텍처

### Master-Worker 프로세스 모델

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Nginx 프로세스 구조                             │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    Master Process (root)                     │  │
│   │                                                             │  │
│   │   • 설정 파일 읽기 및 검증                                   │  │
│   │   • 포트 바인딩 (80, 443)                                   │  │
│   │   • Worker 프로세스 생성/관리                                │  │
│   │   • 로그 파일 관리                                          │  │
│   │   • 무중단 설정 리로드                                       │  │
│   └──────────────────────┬──────────────────────────────────────┘  │
│                          │                                          │
│          ┌───────────────┼───────────────┬───────────────┐         │
│          ▼               ▼               ▼               ▼         │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   │
│   │  Worker 1  │   │  Worker 2  │   │  Worker 3  │   │  Worker 4  │  │
│   │  (CPU 0)   │   │  (CPU 1)   │   │  (CPU 2)   │   │  (CPU 3)   │  │
│   └───────────┘   └───────────┘   └───────────┘   └───────────┘   │
│        │               │               │               │           │
│        └───────────────┴───────────────┴───────────────┘           │
│                          │                                          │
│                     각 Worker가                                     │
│                  수천 개 연결 처리                                   │
│                                                                     │
│   ┌───────────────────┐   ┌───────────────────┐                    │
│   │   Cache Loader    │   │   Cache Manager   │                    │
│   │  (시작 시 실행)    │   │   (주기적 실행)    │                    │
│   └───────────────────┘   └───────────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 각 프로세스 역할

| 프로세스 | 역할 |
|----------|------|
| **Master** | 설정 관리, 포트 바인딩, Worker 관리 (root 권한) |
| **Worker** | 실제 요청 처리, 네트워크 연결 관리 (권한 없음) |
| **Cache Loader** | 시작 시 디스크 캐시를 메모리에 로드 |
| **Cache Manager** | 주기적으로 캐시 정리 및 만료 처리 |

### 이벤트 기반 비블로킹 처리

```
Nginx Worker의 요청 처리 방식 (체스 동시 대국 비유)
─────────────────────────────────────────────────────

기존 방식 (블로킹):
┌────────────────────────────────────────────────┐
│  선수A와 대국 시작                              │
│       ↓                                        │
│  선수A가 수를 둘 때까지 대기... (블로킹)        │
│       ↓                                        │
│  선수A 대국 완료                                │
│       ↓                                        │
│  선수B와 대국 시작 (이제서야!)                  │
└────────────────────────────────────────────────┘

Nginx 방식 (비블로킹, 이벤트 기반):
┌────────────────────────────────────────────────┐
│  선수A와 대국 → 수를 두고 → 즉시 다음으로 이동 │
│       ↓                                        │
│  선수B와 대국 → 수를 두고 → 즉시 다음으로 이동 │
│       ↓                                        │
│  선수C와 대국 → 수를 두고 → 즉시 다음으로 이동 │
│       ↓                                        │
│  선수A가 수를 둠 → 이벤트 발생 → 처리 후 이동  │
│       ↓                                        │
│  모든 대국을 동시에 진행!                       │
└────────────────────────────────────────────────┘
```

```
이벤트 루프 동작
─────────────────────────────────────────

Worker Process
┌────────────────────────────────────────────┐
│                                            │
│   ┌──────────────────────────────────┐    │
│   │         이벤트 큐                 │    │
│   │  [연결요청] [데이터수신] [쓰기완료] │   │
│   └──────────────┬───────────────────┘    │
│                  │                         │
│                  ▼                         │
│   ┌──────────────────────────────────┐    │
│   │         이벤트 루프               │    │
│   │                                  │    │
│   │   while(true) {                  │    │
│   │       events = wait_for_events() │    │
│   │       for(event in events) {     │    │
│   │           handle(event)          │    │
│   │       }                          │    │
│   │   }                              │    │
│   └──────────────────────────────────┘    │
│                                            │
│   * 블로킹 없이 모든 이벤트 순차 처리      │
│   * epoll(Linux), kqueue(BSD) 사용        │
│                                            │
└────────────────────────────────────────────┘
```

---

## Nginx 주요 기능

### 1. 정적 파일 서빙

```nginx
server {
    listen 80;
    server_name example.com;

    # 정적 파일 위치
    root /var/www/html;
    index index.html;

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. 리버스 프록시

```
리버스 프록시 구조
─────────────────────────────────────────

클라이언트는 Nginx만 알고, 백엔드 서버는 숨겨짐

┌──────────┐      ┌──────────┐      ┌──────────────┐
│ 클라이언트 │ ───▶ │  Nginx   │ ───▶ │ 백엔드 서버   │
│          │ ◀─── │ (프록시)  │ ◀─── │ (Node, etc) │
└──────────┘      └──────────┘      └──────────────┘
                       │
                  • SSL 처리
                  • 캐싱
                  • 압축
                  • 보안
```

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        # Node.js 서버로 프록시
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # WebSocket 지원
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # 원본 IP 전달
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. 로드 밸런싱

```
로드 밸런싱 구조
─────────────────────────────────────────

                    ┌──────────────┐
                    │    Nginx     │
                    │ Load Balancer│
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │  Server 1  │   │  Server 2  │   │  Server 3  │
    │  :3001    │   │  :3002    │   │  :3003    │
    └───────────┘   └───────────┘   └───────────┘
```

```nginx
# 업스트림 서버 그룹 정의
upstream backend {
    # 로드 밸런싱 알고리즘
    # (기본값: round-robin)

    server 127.0.0.1:3001 weight=3;  # 가중치 3
    server 127.0.0.1:3002 weight=2;  # 가중치 2
    server 127.0.0.1:3003 weight=1;  # 가중치 1

    # 헬스 체크
    server 127.0.0.1:3004 backup;    # 백업 서버
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
    }
}
```

**로드 밸런싱 알고리즘:**

| 알고리즘 | 설명 |
|----------|------|
| `round-robin` | 순차적으로 분배 (기본값) |
| `least_conn` | 연결 수가 가장 적은 서버로 |
| `ip_hash` | 클라이언트 IP 기반 (세션 유지) |
| `hash` | 커스텀 키 기반 해싱 |

### 4. SSL/TLS 설정

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # SSL 인증서
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 보안 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
}

# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

### 5. Gzip 압축

```nginx
http {
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json
               application/javascript text/xml application/xml;
}
```

---

## 설정 파일 구조

```
Nginx 설정 파일 계층
─────────────────────────────────────────

/etc/nginx/
├── nginx.conf              ← 메인 설정 파일
├── conf.d/
│   ├── default.conf        ← 기본 서버 설정
│   └── example.com.conf    ← 사이트별 설정
├── sites-available/        ← 사용 가능한 사이트 설정
├── sites-enabled/          ← 활성화된 사이트 (심볼릭 링크)
└── snippets/               ← 재사용 가능한 설정 조각
```

### 기본 설정 구조

```nginx
# /etc/nginx/nginx.conf

# 전역 설정
user nginx;
worker_processes auto;              # CPU 코어 수만큼 자동 설정
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

# 이벤트 설정
events {
    worker_connections 1024;        # Worker당 최대 연결 수
    use epoll;                      # Linux 이벤트 모델
    multi_accept on;
}

# HTTP 설정
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 로그 형식
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent';

    access_log /var/log/nginx/access.log main;

    # 성능 최적화
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    # 서버 블록 포함
    include /etc/nginx/conf.d/*.conf;
}
```

---

## 무중단 설정 리로드

```
nginx -s reload 동작 과정
─────────────────────────────────────────

1. Master가 SIGHUP 신호 수신
        │
        ▼
2. 새 설정 파일 검증
        │
        ├── 실패 → 기존 설정 유지
        │
        ▼ 성공
3. 새 Worker 프로세스 생성
        │
        ▼
4. 기존 Worker에 종료 신호
        │
        ▼
5. 기존 Worker는 현재 연결 완료 후 종료
        │
        ▼
6. 완전히 새 설정으로 전환 완료

* 서비스 중단 없음!
```

```bash
# 설정 테스트
nginx -t

# 설정 리로드 (무중단)
nginx -s reload

# 또는 systemd 사용
sudo systemctl reload nginx
```

---

## 자주 사용하는 설정 예시

### SPA (React, Vue) 서빙

```nginx
server {
    listen 80;
    server_name app.example.com;
    root /var/www/app/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 프록시
    location /api/ {
        proxy_pass http://localhost:3000/;
    }
}
```

### Rate Limiting

```nginx
http {
    # 요청 제한 정의 (10r/s)
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        location /api/ {
            # 버스트 20, 초과 시 지연
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
        }
    }
}
```

---

## 핵심 정리

1. **이벤트 기반 비동기 아키텍처**
   - 단일 Worker가 수천 개 연결 처리
   - 적은 메모리로 높은 동시성

2. **Master-Worker 프로세스 모델**
   - Master: 설정/관리 (root)
   - Worker: 요청 처리 (CPU 코어당 1개)

3. **다양한 역할 수행**
   - 웹 서버, 리버스 프록시, 로드 밸런서
   - SSL, 캐싱, 압축

4. **무중단 운영**
   - `nginx -s reload`로 서비스 중단 없이 설정 변경

5. **Apache 대비 장점**
   - 높은 동시 연결 처리
   - 예측 가능한 메모리 사용
   - 정적 파일 서빙에 최적화

---

## 참고 자료

- [Inside NGINX: How We Designed for Performance & Scale | NGINX Blog](https://blog.nginx.org/blog/inside-nginx-how-we-designed-for-performance-scale)
- [Understanding NGINX: Architecture & Alternatives | Solo.io](https://www.solo.io/topics/nginx)
- [The Architecture of Open Source Applications: nginx](https://aosabook.org/en/v2/nginx.html)
- [NGINX Documentation](https://nginx.org/en/docs/)

---

*마지막 업데이트: 2025-12-21*
