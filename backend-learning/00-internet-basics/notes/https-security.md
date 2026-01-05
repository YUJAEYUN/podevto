# HTTPS와 보안 (HTTPS & Security)

## HTTPS란?

**HTTPS (HTTP Secure)** 는 HTTP에 보안 계층을 추가한 프로토콜입니다. SSL/TLS를 사용하여 데이터를 암호화하고 통신 보안을 보장합니다.

```
HTTP  = 평문 전송 (누구나 볼 수 있음)
HTTPS = 암호화 전송 (암호화되어 안전함)
```

---

## HTTP vs HTTPS

| 구분 | HTTP | HTTPS |
|------|------|-------|
| 포트 | 80 | 443 |
| 보안 | ❌ 평문 | ✅ 암호화 |
| 속도 | 빠름 | 약간 느림 (암호화 오버헤드) |
| SEO | 불리 | 유리 (Google 순위 요소) |
| 인증서 | 불필요 | 필수 (SSL/TLS 인증서) |
| 브라우저 표시 | "주의 요함" | 🔒 자물쇠 아이콘 |

### HTTP의 문제점

```
사용자 ─────── 평문 ─────── 서버
         ↑
      중간자 (공격자)
      - 데이터 읽기 가능
      - 데이터 변조 가능
      - 가짜 서버로 위장 가능
```

### HTTPS의 장점

```
사용자 ──── 암호화 ──── 서버
        ↑
     중간자 (공격자)
     - 데이터 읽기 불가 (암호화됨)
     - 변조 감지 가능
     - 서버 신원 확인 가능
```

---

## SSL/TLS란?

- **SSL (Secure Sockets Layer)**: 넷스케이프가 개발한 초기 보안 프로토콜
- **TLS (Transport Layer Security)**: SSL의 후속 버전, 현재 표준

```
SSL 1.0  (미공개)
SSL 2.0  (1995, 보안 취약점으로 사용 중단)
SSL 3.0  (1996, 보안 취약점으로 사용 중단)
───────────────────────────────────────
TLS 1.0  (1999)
TLS 1.1  (2006)
TLS 1.2  (2008, 현재 널리 사용)
TLS 1.3  (2018, 최신, 권장)
```

**용어 정리**:
- SSL/TLS는 같은 의미로 사용 (TLS가 정확한 용어)
- "SSL 인증서"라고 부르지만 실제로는 TLS 사용

---

## TLS 핸드셰이크 과정

HTTPS 연결이 맺어지는 과정입니다.

```
클라이언트                                  서버
    │                                      │
    ├─ 1. ClientHello ────────────────────→│
    │   - TLS 버전, 지원 암호화 방식          │
    │   - 랜덤 데이터                        │
    │                                      │
    │←─ 2. ServerHello ────────────────────┤
    │   - 선택된 TLS 버전, 암호화 방식        │
    │   - 서버 인증서 (공개키 포함)           │
    │   - 랜덤 데이터                        │
    │                                      │
    ├─ 3. 인증서 검증 ────────────────────────┤
    │   - CA가 서명한 인증서인지 확인         │
    │   - 도메인 일치 여부 확인               │
    │   - 유효기간 확인                      │
    │                                      │
    ├─ 4. PreMaster Secret 생성 ──────────→│
    │   (서버 공개키로 암호화하여 전송)        │
    │                                      │
    ├─ 5. Session Key 생성 ──────────────────┤
    │   (양측이 같은 키 생성)                 │
    │                                      │
    ├─ 6. Finished ───────────────────────→│
    │   (암호화 통신 준비 완료)               │
    │                                      │
    │←─ 7. Finished ───────────────────────┤
    │                                      │
    ├─ 8. 암호화된 데이터 전송 시작 ───────────┤
    │                                      │
```

### 간단한 요약

```
1. 악수 (Hello)
   - "나는 이런 암호화를 지원해"
   - "그럼 이걸로 하자"

2. 인증서 교환
   - 서버: "여기 내 신분증(인증서)"
   - 클라이언트: "확인했어, 진짜네"

3. 키 교환
   - 암호화에 사용할 공통 키 생성

4. 암호화 통신 시작
   - 이제 모든 데이터는 암호화됨
```

---

## SSL/TLS 인증서

### 인증서란?

서버의 신원을 증명하는 전자 문서입니다.

```
인증서 내용:
┌──────────────────────────────────────┐
│ - 도메인 이름: example.com            │
│ - 발급 대상: Example Inc.             │
│ - 공개키: MIIBIjANBg...               │
│ - 발급자: Let's Encrypt               │
│ - 유효기간: 2024-01-01 ~ 2025-01-01  │
│ - 디지털 서명                          │
└──────────────────────────────────────┘
```

### CA (Certificate Authority)

인증서를 발급하는 신뢰할 수 있는 기관입니다.

```
주요 CA:
- Let's Encrypt (무료, 자동화)
- DigiCert
- GlobalSign
- Sectigo (구 Comodo)
```

### 인증서 종류

#### 1. DV (Domain Validation)

```
검증 수준: 낮음
검증 내용: 도메인 소유권만 확인
발급 시간: 수분~수시간
가격: 무료~저렴
용도: 개인 블로그, 소규모 사이트
예: Let's Encrypt
```

#### 2. OV (Organization Validation)

```
검증 수준: 중간
검증 내용: 도메인 + 조직 실재 확인
발급 시간: 며칠
가격: 연간 $50-200
용도: 중소기업 웹사이트
```

#### 3. EV (Extended Validation)

```
검증 수준: 높음
검증 내용: 도메인 + 조직 + 법적 실체 확인
발급 시간: 1-2주
가격: 연간 $200-1000+
용도: 금융, 전자상거래
특징: 주소창에 회사명 표시 (일부 브라우저)
```

---

## Let's Encrypt 인증서 발급

### Certbot 설치 및 사용

```bash
# Ubuntu/Debian
$ sudo apt update
$ sudo apt install certbot python3-certbot-nginx

# 인증서 발급 (Nginx)
$ sudo certbot --nginx -d example.com -d www.example.com

# 인증서 발급 (Apache)
$ sudo certbot --apache -d example.com

# 수동 발급 (웹서버 자동 설정 안 함)
$ sudo certbot certonly --standalone -d example.com

# 인증서 갱신 (자동)
$ sudo certbot renew

# 자동 갱신 크론탭 설정
$ sudo crontab -e
# 추가: 매일 새벽 2시에 갱신 시도
0 2 * * * certbot renew --quiet
```

### 인증서 위치

```bash
# Let's Encrypt 인증서 경로
/etc/letsencrypt/live/example.com/
├── fullchain.pem    # 인증서 체인 (서버에서 사용)
├── privkey.pem      # 개인키 (절대 공유 금지!)
├── cert.pem         # 인증서
└── chain.pem        # 중간 인증서
```

---

## 웹 서버 HTTPS 설정

### Nginx 설정

```nginx
server {
    # HTTP (80) → HTTPS (443) 리다이렉트
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    # SSL 인증서 경로
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # SSL 프로토콜 및 암호화 방식
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # OCSP Stapling (인증서 검증 성능 향상)
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Node.js HTTPS 서버

```javascript
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

// HTTP → HTTPS 리다이렉트
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80);

// HTTPS 서버
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/example.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/example.com/fullchain.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS 서버가 포트 443에서 실행 중');
});

app.get('/', (req, res) => {
  res.send('안전한 HTTPS 연결!');
});
```

---

## 암호화 방식

### 대칭키 암호화 (Symmetric Encryption)

```
같은 키로 암호화/복호화

┌──────────┐   암호화    ┌──────────┐   복호화    ┌──────────┐
│ 평문      │ ─────────→ │ 암호문    │ ─────────→ │ 평문      │
│ "Hello"  │   (Key A)   │ "x7g9#"  │   (Key A)   │ "Hello"  │
└──────────┘            └──────────┘            └──────────┘

장점: 빠름
단점: 키 공유 문제
예: AES, ChaCha20
```

### 비대칭키 암호화 (Asymmetric Encryption)

```
공개키로 암호화, 개인키로 복호화

공개키 (Public Key): 누구나 알 수 있음
개인키 (Private Key): 절대 비밀

┌──────────┐   암호화     ┌──────────┐   복호화     ┌──────────┐
│ 평문      │ ─────────→  │ 암호문    │ ─────────→  │ 평문      │
│ "Hello"  │  (공개키)    │ "x7g9#"  │  (개인키)    │ "Hello"  │
└──────────┘             └──────────┘             └──────────┘

장점: 키 공유 불필요
단점: 느림
예: RSA, ECDSA
```

### TLS에서의 암호화

```
1. 핸드셰이크 (비대칭키)
   - 서버 인증
   - 세션 키 교환

2. 데이터 전송 (대칭키)
   - 빠른 암호화/복호화
   - 세션 키 사용
```

---

## 보안 헤더

### 1. HSTS (HTTP Strict Transport Security)

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

```javascript
// Express
app.use((req, res, next) => {
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  next();
});
```

**효과**:
- 브라우저가 항상 HTTPS로만 접속
- 중간자 공격 방지

### 2. X-Frame-Options

```http
X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN
```

```javascript
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
```

**효과**: 클릭재킹 공격 방지

### 3. X-Content-Type-Options

```http
X-Content-Type-Options: nosniff
```

**효과**: MIME 타입 스니핑 방지

### 4. Content-Security-Policy (CSP)

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
```

```javascript
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://cdn.example.com"
  );
  next();
});
```

**효과**: XSS 공격 방지

### helmet.js 사용 (권장)

```javascript
const helmet = require('helmet');
app.use(helmet());

// 또는 개별 설정
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.noSniff());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://cdn.example.com"]
  }
}));
```

---

## HTTPS 테스트 및 검증

### 1. SSL Labs 테스트

```
https://www.ssllabs.com/ssltest/

평가 항목:
- 인증서 유효성
- 프로토콜 지원
- 암호화 강도
- 취약점 여부

등급: A+, A, B, C, D, E, F
```

### 2. 명령줄 도구

```bash
# 인증서 정보 확인
$ openssl s_client -connect example.com:443 -servername example.com

# 인증서 만료일 확인
$ echo | openssl s_client -connect example.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# TLS 버전 테스트
$ openssl s_client -connect example.com:443 -tls1_2
$ openssl s_client -connect example.com:443 -tls1_3

# 인증서 체인 확인
$ curl -v https://example.com
```

### 3. 브라우저 확인

```
Chrome DevTools:
1. 주소창 🔒 아이콘 클릭
2. "인증서" 또는 "Certificate" 클릭
3. 인증서 상세 정보 확인
```

---

## 일반적인 HTTPS 문제 해결

### 1. 혼합 콘텐츠 (Mixed Content)

```
문제: HTTPS 페이지에서 HTTP 리소스 로드

<img src="http://example.com/image.jpg">  ← 차단됨!

해결:
<img src="https://example.com/image.jpg">  ← HTTPS 사용
<img src="//example.com/image.jpg">        ← 프로토콜 상대 경로
```

### 2. 자체 서명 인증서 오류

```
개발 환경에서 자체 서명 인증서 사용 시:

Node.js:
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';  // 프로덕션 금지!

curl:
curl -k https://localhost:3000  // -k는 인증서 검증 무시
```

### 3. 인증서 만료

```bash
# 인증서 갱신 (Let's Encrypt)
$ sudo certbot renew

# 강제 갱신
$ sudo certbot renew --force-renewal

# 자동 갱신 테스트
$ sudo certbot renew --dry-run
```

---

## 개발 환경 HTTPS 설정

### mkcert 사용 (권장)

```bash
# mkcert 설치 (macOS)
$ brew install mkcert
$ mkcert -install

# 로컬 인증서 생성
$ mkcert localhost 127.0.0.1 ::1

# 생성된 파일:
# - localhost+2.pem (인증서)
# - localhost+2-key.pem (개인키)
```

```javascript
// Node.js에서 사용
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

const options = {
  key: fs.readFileSync('./localhost+2-key.pem'),
  cert: fs.readFileSync('./localhost+2.pem')
};

https.createServer(options, app).listen(3000, () => {
  console.log('https://localhost:3000');
});
```

---

## 보안 모범 사례

### 1. 항상 HTTPS 사용

```
✓ 모든 페이지에서 HTTPS 사용
✓ HTTP → HTTPS 자동 리다이렉트
✓ HSTS 헤더 설정
```

### 2. 최신 TLS 버전 사용

```nginx
# TLS 1.2, 1.3만 허용
ssl_protocols TLSv1.2 TLSv1.3;
```

### 3. 강력한 암호화 방식

```nginx
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
```

### 4. 인증서 자동 갱신

```bash
# cron으로 자동 갱신
0 2 * * * certbot renew --quiet
```

### 5. 보안 헤더 설정

```javascript
app.use(helmet());
```

---

## 추가 학습 자료

- [Let's Encrypt](https://letsencrypt.org/)
- [SSL Labs](https://www.ssllabs.com/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [OWASP HTTPS Best Practices](https://owasp.org/www-project-web-security-testing-guide/)
- [How HTTPS Works (만화)](https://howhttps.works/)

---

## 다음 학습

- [인터넷 동작 원리](how-internet-works.md)
- [HTTP 기초](http-basics.md)
- [브라우저 렌더링](browser-rendering.md)

---

*Last updated: 2026-01-05*
