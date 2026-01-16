# HTTPS & TLS - 보안 통신

> "인터넷의 자물쇠"

## 🎯 학습 목표

- **HTTPS와 TLS의 역할** 이해
- **TLS 핸드셰이크 과정** 상세 파악
- **인증서와 공개키 암호화** 원리 습득
- **실무에서 HTTPS 적용** 방법 학습

## 📚 HTTPS 기초

### HTTP vs HTTPS

```
HTTP (Port 80):
클라이언트 → [평문 데이터] → 서버
         ↑ 누구나 읽을 수 있음! 😱

HTTPS (Port 443):
클라이언트 → [암호화된 데이터] → 서버
         ↑ 복호화 키 없이는 불가능 ✅
```

### HTTPS = HTTP + TLS

```
┌──────────────────┐
│  HTTP            │ ← 애플리케이션 계층
├──────────────────┤
│  TLS/SSL         │ ← 보안 계층 (암호화)
├──────────────────┤
│  TCP             │ ← 전송 계층
└──────────────────┘
```

## 🔐 암호화 기초

### 대칭키 암호화 (Symmetric Encryption)

**개념**: 암호화와 복호화에 같은 키 사용

```
평문: "Hello"
키: "abc123"

암호화:
"Hello" + "abc123" → "X@#$%"

복호화:
"X@#$%" + "abc123" → "Hello"
```

**장점**:
- 빠름 ⚡ (AES: 수 GB/s)

**단점**:
- 키 전달 문제 😱
  ```
  클라이언트: "키는 abc123이야"
  중간자: "키 훔쳤다! 이제 모든 데이터 복호화 가능!"
  ```

### 비대칭키 암호화 (Asymmetric Encryption)

**개념**: 공개키와 개인키 쌍 사용

```
공개키 (Public Key): 누구나 알 수 있음
개인키 (Private Key): 본인만 알고 있음

암호화:
"Hello" + 공개키 → "X@#$%"

복호화:
"X@#$%" + 개인키 → "Hello"
```

**특징**:
```
공개키로 암호화 → 개인키로만 복호화 가능 ✅
개인키로 서명 → 공개키로 검증 가능 ✅
```

**단점**:
- 느림 🐌 (RSA: 대칭키의 1/1000 속도)

### 하이브리드 방식 (HTTPS가 사용)

```
1단계: 비대칭키로 대칭키 전달
   클라이언트 → [대칭키를 공개키로 암호화] → 서버
   서버: 개인키로 복호화 → 대칭키 획득 ✅

2단계: 대칭키로 실제 데이터 암호화
   클라이언트 ↔ [대칭키로 고속 암호화 통신] ↔ 서버

결과:
- 보안: 비대칭키의 안전성 ✅
- 속도: 대칭키의 빠른 속도 ✅
```

## 🤝 TLS 핸드셰이크

### TLS 1.2 핸드셰이크 (2-RTT)

```
클라이언트                              서버
   |                                    |
   |  1. ClientHello                    |
   |  - TLS 버전: 1.2                   |
   |  - 지원 암호 스위트 목록            |
   |  - 랜덤 데이터 (Client Random)     |
   | ---------------------------------> |
   |                                    |
   |  2. ServerHello                    |
   |  - 선택한 암호 스위트              |
   |  - 랜덤 데이터 (Server Random)     |
   |  - 인증서 (공개키 포함)            |
   |  - ServerHelloDone                 |
   | <--------------------------------- |
   |                                    |
   |  3. ClientKeyExchange              |
   |  - Pre-Master Secret               |
   |    (서버 공개키로 암호화)          |
   |  - ChangeCipherSpec                |
   |  - Finished                        |
   | ---------------------------------> |
   |                                    |
   | 양쪽: Master Secret 생성            |
   | Client Random + Server Random +    |
   | Pre-Master Secret → Master Secret  |
   |                                    |
   |  4. ChangeCipherSpec               |
   |  - Finished                        |
   | <--------------------------------- |
   |                                    |
   |  5. 암호화된 HTTP 데이터 전송      |
   | <--------------------------------> |

총 2-RTT (왕복 2회)
```

### TLS 1.3 핸드셰이크 (1-RTT)

```
클라이언트                              서버
   |                                    |
   |  1. ClientHello                    |
   |  - TLS 버전: 1.3                   |
   |  - 지원 암호 스위트                |
   |  - Key Share (공개키 미리 전송!)   |
   | ---------------------------------> |
   |                                    |
   |  2. ServerHello                    |
   |  - 선택한 암호 스위트              |
   |  - Key Share (서버 공개키)         |
   |  - 인증서                          |
   |  - Finished                        |
   | <--------------------------------- |
   |                                    |
   | 양쪽: 즉시 Master Secret 생성!      |
   |                                    |
   |  3. 암호화된 HTTP 데이터 전송      |
   | <--------------------------------> |

총 1-RTT (왕복 1회) ⚡
```

### 0-RTT (TLS 1.3 재연결)

```
이전 연결에서 PSK (Pre-Shared Key) 저장

재연결:
클라이언트                              서버
   |                                    |
   |  ClientHello + PSK + HTTP 요청     |
   |  (암호화된 HTTP 데이터 즉시 전송!) |
   | ---------------------------------> |
   |                                    |
   |  ServerHello + HTTP 응답           |
   | <--------------------------------- |

총 0-RTT! 핸드셰이크 없이 바로 통신 ⚡
```

## 🔍 암호 스위트 (Cipher Suite)

### 구조

```
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
│   │      │        │       │   │
│   │      │        │       │   └─ 해시: SHA-256
│   │      │        │       └───── AEAD: GCM
│   │      │        └──────────── 암호화: AES-128
│   │      └───────────────────── 인증: RSA
│   └──────────────────────────── 키 교환: ECDHE
└──────────────────────────────── 프로토콜: TLS
```

### 주요 알고리즘

**키 교환** (Key Exchange):
```
RSA:
- 서버 공개키로 Pre-Master Secret 암호화
- ❌ Forward Secrecy 없음 (개인키 탈취 시 과거 통신 복호화 가능)

ECDHE (Elliptic Curve Diffie-Hellman Ephemeral):
- 세션마다 임시 키 쌍 생성
- ✅ Forward Secrecy (개인키 탈취해도 과거 통신 안전)
```

**암호화** (Encryption):
```
AES-128: 128비트 키 (빠름, 충분히 안전)
AES-256: 256비트 키 (느림, 더 안전)

모드:
- GCM (Galois/Counter Mode): AEAD (인증 + 암호화)
- CBC (Cipher Block Chaining): 구식 (Padding Oracle 취약점)
```

**해시** (Hash):
```
SHA-256: 256비트 해시 (안전)
SHA-384: 384비트 해시 (더 안전)
MD5, SHA-1: ❌ 취약 (사용 금지)
```

## 📜 인증서 (Certificate)

### 인증서 체인

```
루트 CA (Root Certificate Authority)
└─ 중간 CA (Intermediate CA)
   └─ 서버 인증서 (example.com)

브라우저는 루트 CA의 공개키를 미리 신뢰 목록에 저장
```

### 인증 과정

```
1. 서버가 인증서 전송
   - 도메인: example.com
   - 공개키: [서버 공개키]
   - 서명: [중간 CA의 개인키로 서명]

2. 클라이언트 검증
   ① 중간 CA의 공개키로 서명 검증 ✅
   ② 중간 CA 인증서의 서명을 루트 CA 공개키로 검증 ✅
   ③ 루트 CA가 신뢰 목록에 있는지 확인 ✅
   ④ 도메인 일치 확인 (example.com) ✅
   ⑤ 유효기간 확인 ✅

3. 검증 성공 → 서버의 공개키 신뢰 ✅
```

### 인증서 내용

```bash
# 인증서 확인
openssl x509 -in cert.pem -text -noout

# 결과:
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 0x1a2b3c4d...
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C=US, O=Let's Encrypt, CN=R3
        Validity
            Not Before: Jan  1 00:00:00 2026 GMT
            Not After : Apr  1 23:59:59 2026 GMT
        Subject: CN=example.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus: 00:c5:4a:...
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:example.com, DNS:www.example.com
```

## 🔒 실무 적용

### Let's Encrypt로 무료 인증서 발급

```bash
# Certbot 설치 (Ubuntu)
sudo apt install certbot python3-certbot-nginx

# 인증서 발급 (Nginx)
sudo certbot --nginx -d example.com -d www.example.com

# 자동 갱신 (90일마다)
sudo certbot renew --dry-run
```

### Nginx HTTPS 설정

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    # HTTP → HTTPS 리다이렉트
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    # 인증서
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # TLS 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # OCSP Stapling (인증서 검증 최적화)
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

### Apache HTTPS 설정

```apache
<VirtualHost *:80>
    ServerName example.com
    Redirect permanent / https://example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName example.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/example.com/privkey.pem

    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384
    SSLHonorCipherOrder on

    # HSTS
    Header always set Strict-Transport-Security "max-age=31536000"

    # OCSP Stapling
    SSLUseStapling on
    SSLStaplingCache "shmcb:logs/ssl_stapling(32768)"
</VirtualHost>
```

## 🔍 TLS 디버깅

### OpenSSL로 연결 테스트

```bash
# TLS 핸드셰이크 확인
openssl s_client -connect example.com:443 -tls1_3

# 결과:
CONNECTED(00000003)
depth=2 C = US, O = Internet Security Research Group, CN = ISRG Root X1
verify return:1
depth=1 C = US, O = Let's Encrypt, CN = R3
verify return:1
depth=0 CN = example.com
verify return:1
---
Certificate chain
 0 s:CN = example.com
   i:C = US, O = Let's Encrypt, CN = R3
 1 s:C = US, O = Let's Encrypt, CN = R3
   i:C = US, O = Internet Security Research Group, CN = ISRG Root X1
---
SSL handshake has read 3234 bytes and written 398 bytes
---
New, TLSv1.3, Cipher is TLS_AES_128_GCM_SHA256
Server public key is 2048 bit
...
```

### 암호 스위트 확인

```bash
# 지원 암호 스위트 확인
nmap --script ssl-enum-ciphers -p 443 example.com

# 결과:
PORT    STATE SERVICE
443/tcp open  https
| ssl-enum-ciphers:
|   TLSv1.2:
|     ciphers:
|       TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (ecdh_x25519) - A
|       TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (ecdh_x25519) - A
|   TLSv1.3:
|     ciphers:
|       TLS_AES_128_GCM_SHA256 (ecdh_x25519) - A
|       TLS_AES_256_GCM_SHA384 (ecdh_x25519) - A
```

### SSL Labs 테스트

```bash
# https://www.ssllabs.com/ssltest/
# 웹사이트에서 도메인 입력 → 종합 평가

평가 항목:
- 인증서 유효성
- 프로토콜 지원 (TLS 1.2, 1.3)
- 암호 스위트 강도
- 취약점 (POODLE, Heartbleed 등)

등급: A+ (최고) ~ F (최저)
```

## 🎯 보안 모범 사례

### 1. TLS 1.3 사용

```nginx
# TLS 1.0, 1.1 비활성화 (취약)
ssl_protocols TLSv1.2 TLSv1.3;
```

### 2. 강력한 암호 스위트

```nginx
# Forward Secrecy 지원 (ECDHE)
ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;
```

### 3. HSTS 활성화

```nginx
# 브라우저에게 "항상 HTTPS만 사용" 강제
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### 4. OCSP Stapling

```nginx
# 인증서 검증 속도 향상
ssl_stapling on;
ssl_stapling_verify on;
```

### 5. 인증서 자동 갱신

```bash
# Cron job
0 0,12 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

## 🔍 TLS vs SSL

```
SSL (Secure Sockets Layer):
- SSL 1.0: 출시 안 됨 (취약점)
- SSL 2.0: 1995년 (❌ 취약, 사용 금지)
- SSL 3.0: 1996년 (❌ 취약, 사용 금지)

TLS (Transport Layer Security):
- TLS 1.0: 1999년 (❌ 취약, 사용 금지)
- TLS 1.1: 2006년 (❌ 취약, 사용 금지)
- TLS 1.2: 2008년 (✅ 안전, 현재 표준)
- TLS 1.3: 2018년 (✅ 안전, 권장)

용어:
"SSL 인증서"라고 하지만 실제로는 TLS 사용!
```

## 📊 성능 영향

### TLS 오버헤드

```
TLS 핸드셰이크:
- TLS 1.2: 2-RTT (약 100~200ms 추가)
- TLS 1.3: 1-RTT (약 50~100ms 추가)
- 0-RTT: 0ms (재연결)

암호화/복호화 CPU 사용:
- 대칭키 (AES): 무시할 수준 (1~2%)
- 비대칭키 (RSA): 핸드셰이크 시에만

결론:
✅ TLS 1.3 + 0-RTT 사용 시 성능 영향 최소화
✅ CPU는 충분히 빠름 (AES-NI 하드웨어 가속)
```

### 최적화

```nginx
# Session Resumption (세션 재사용)
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# 0-RTT (TLS 1.3)
ssl_early_data on;
```

## 🎯 체크리스트

- [ ] 대칭키와 비대칭키 암호화의 차이를 설명할 수 있다
- [ ] TLS 핸드셰이크 과정을 단계별로 이해한다
- [ ] 인증서 체인과 CA의 역할을 안다
- [ ] Forward Secrecy가 무엇인지 설명할 수 있다
- [ ] TLS 1.2와 1.3의 차이를 안다
- [ ] 실무에서 HTTPS를 올바르게 설정할 수 있다

## 🔗 다음 학습

- [04-HTTP-Versions.md](./04-HTTP-Versions.md) - HTTP 버전별 특징
- [06-DNS-Deep-Dive.md](./06-DNS-Deep-Dive.md) - DNS 상세

---

**"HTTPS는 선택이 아닌 필수. 모든 트래픽은 암호화되어야 한다."**
