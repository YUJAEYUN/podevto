# HTTP Versions - HTTP 버전 비교

> "HTTP의 진화: 1.1 → 2 → 3"

## 🎯 학습 목표

- **HTTP/1.1, HTTP/2, HTTP/3**의 차이 이해
- 각 버전의 **성능 개선 포인트** 파악
- **실무 적용 시 고려사항** 습득

## 📚 HTTP 버전 개요

### 버전별 주요 특징

```
┌──────────┬──────────────┬──────────────┬──────────────┐
│ Version  │ Year         │ Transport    │ Key Feature  │
├──────────┼──────────────┼──────────────┼──────────────┤
│ HTTP/1.0 │ 1996         │ TCP          │ 기본형       │
│ HTTP/1.1 │ 1997         │ TCP          │ Keep-Alive   │
│ HTTP/2   │ 2015         │ TCP          │ Multiplexing │
│ HTTP/3   │ 2022         │ QUIC (UDP)   │ 0-RTT        │
└──────────┴──────────────┴──────────────┴──────────────┘
```

## 🔍 HTTP/1.1 (1997~)

### 주요 특징

**1. Persistent Connection (Keep-Alive)**

```
HTTP/1.0:
요청 1 → TCP 연결 → 응답 1 → TCP 종료
요청 2 → TCP 연결 → 응답 2 → TCP 종료
요청 3 → TCP 연결 → 응답 3 → TCP 종료

HTTP/1.1:
TCP 연결 → 요청 1 → 응답 1
         → 요청 2 → 응답 2
         → 요청 3 → 응답 3 → TCP 종료
```

**2. Pipelining (파이프라이닝)**

```
요청 1 → 요청 2 → 요청 3 → (대기)
응답 1 → 응답 2 → 응답 3 ← (순서대로!)
```

**문제점: Head-of-Line Blocking**

```
요청 1 (큰 파일) → 요청 2 (작은 파일)
응답 1 ████████████ (처리 중...)
응답 2             ... (대기 중 😱)

→ 응답 1이 끝날 때까지 응답 2는 대기!
```

### HTTP/1.1 헤더

```http
GET /api/users HTTP/1.1
Host: example.com
Connection: keep-alive
Accept: application/json
User-Agent: Mozilla/5.0
Accept-Encoding: gzip, deflate
```

### 성능 최적화 기법

**1. Domain Sharding (도메인 샤딩)**

```
브라우저: 도메인당 최대 6개 연결

최적화:
static1.example.com  → 이미지 1~6
static2.example.com  → 이미지 7~12
static3.example.com  → 이미지 13~18

총 18개 동시 다운로드 ⚡
```

**2. Resource Concatenation (리소스 병합)**

```
변경 전:
<script src="a.js"></script>
<script src="b.js"></script>
<script src="c.js"></script>

변경 후:
<script src="bundle.js"></script>  ← a+b+c 합침
```

**3. Image Spriting (이미지 스프라이트)**

```css
/* 여러 아이콘을 1개 이미지로 합침 */
.icon-home {
  background: url('sprite.png') 0 0;
}
.icon-user {
  background: url('sprite.png') -20px 0;
}
```

## 🚀 HTTP/2 (2015~)

### 핵심 개선사항

#### 1. Binary Framing (바이너리 프레이밍)

```
HTTP/1.1 (텍스트):
GET /index.html HTTP/1.1\r\n
Host: example.com\r\n
\r\n

HTTP/2 (바이너리):
+-------+-------+-------+
| HEADERS Frame         |
| Stream ID: 1          |
| :method: GET          |
| :path: /index.html    |
+-------+-------+-------+
```

**장점**:
- 파싱 속도 향상
- 오류 감소
- 압축 효율 증가

#### 2. Multiplexing (멀티플렉싱)

**HTTP/1.1의 문제**:
```
TCP 연결 1개당 1개 요청/응답만 처리
→ 병렬 처리를 위해 여러 TCP 연결 필요
```

**HTTP/2의 해결**:
```
1개 TCP 연결로 여러 요청/응답 동시 처리!

Stream 1: ─────req1───────────>
                    <──res1────
Stream 3:     ──req2──>
              <─res2─
Stream 5: ───────req3─────────>
          <───res3────

모두 1개 TCP 연결 안에서! ✅
```

**HOL Blocking 해결**:
```
HTTP/1.1:
요청1(큰 파일) → 요청2(작은 파일)
████████████     ... 대기 😱

HTTP/2:
Stream 1: ████████████ (큰 파일)
Stream 3: ██ (작은 파일, 먼저 완료!) ⚡
```

#### 3. Stream Prioritization (스트림 우선순위)

```
우선순위 설정:
Stream 1 (HTML):      가중치 256 (최우선)
Stream 3 (CSS):       가중치 220 (높음)
Stream 5 (JavaScript): 가중치 220 (높음)
Stream 7 (이미지):     가중치 32  (낮음)

→ 중요한 리소스 먼저 전송!
```

#### 4. Header Compression (HPACK)

**HTTP/1.1의 문제**:
```
요청 1:
GET /api/users HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
Accept: application/json
Cookie: session=abc123xyz...
...

요청 2:
GET /api/posts HTTP/1.1
Host: api.example.com  ← 중복!
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...  ← 중복!
Accept: application/json  ← 중복!
Cookie: session=abc123xyz...  ← 중복!
...
```

**HTTP/2 HPACK**:
```
요청 1:
[전체 헤더 전송]
인덱스 테이블:
1: Host: api.example.com
2: User-Agent: Mozilla/5.0 ...
3: Accept: application/json
4: Cookie: session=abc123xyz...

요청 2:
[인덱스만 전송]
:method: GET
:path: /api/posts
1  ← Host 재사용
2  ← User-Agent 재사용
3  ← Accept 재사용
4  ← Cookie 재사용

크기 절감: 80% 이상! ⚡
```

#### 5. Server Push (서버 푸시)

**HTTP/1.1**:
```
클라이언트 → GET /index.html
서버 → index.html 응답
클라이언트 (파싱) → "style.css가 필요하네"
클라이언트 → GET /style.css
서버 → style.css 응답
```

**HTTP/2 Server Push**:
```
클라이언트 → GET /index.html
서버 → index.html 응답
      + style.css 푸시! (요청 없이 전송)
      + script.js 푸시!

클라이언트: "이미 받았네!" ⚡
```

**설정 예시**:
```nginx
# Nginx
location / {
    http2_push /style.css;
    http2_push /script.js;
}
```

### HTTP/2 예제

```http
# HTTP/2 요청 (의사 헤더)
:method: GET
:scheme: https
:authority: example.com
:path: /api/users
accept: application/json
```

### HTTP/1.1 vs HTTP/2 성능 비교

```
웹페이지 로딩 시간:
┌─────────────────────────────────────┐
│ HTTP/1.1: ████████████████ 3.2초    │
│ HTTP/2:   ████████ 1.5초 (53% 개선!)│
└─────────────────────────────────────┘

리소스 100개 로딩:
┌─────────────────────────────────────┐
│ HTTP/1.1: ██████████████████ 8.5초  │
│ HTTP/2:   ████ 2.1초 (75% 개선!)    │
└─────────────────────────────────────┘
```

## ⚡ HTTP/3 (2022~)

### QUIC (Quick UDP Internet Connections)

**HTTP/2의 남은 문제**:
```
TCP의 HOL Blocking:

패킷 1 (손실!) ❌
패킷 2 ✓
패킷 3 ✓

→ TCP는 패킷 1을 재전송할 때까지 2, 3도 대기 😱
  (TCP의 순서 보장 특성 때문)
```

**HTTP/3의 해결**:
```
QUIC (UDP 기반):

Stream 1: 패킷 1 (손실!) ❌ → 재전송 중...
Stream 3: 패킷 2 ✓ → 즉시 처리! ⚡
Stream 5: 패킷 3 ✓ → 즉시 처리! ⚡

→ 스트림별 독립적 처리!
```

### 주요 특징

#### 1. 0-RTT Connection (빠른 연결)

**HTTP/2 (TCP + TLS)**:
```
1-RTT: TCP 핸드셰이크 (SYN, SYN-ACK, ACK)
1-RTT: TLS 핸드셰이크
───────────────────────────────────
총 2-RTT (왕복 2회) 필요
```

**HTTP/3 (QUIC)**:
```
0-RTT: 이전 연결 정보 재사용
───────────────────────────────────
총 0-RTT! 즉시 데이터 전송 ⚡

재연결:
클라이언트 → [연결 재개 토큰 + 요청 데이터]
서버 → [응답 데이터]

핸드셰이크 없이 바로 통신!
```

#### 2. Connection Migration (연결 이동)

**HTTP/2 (TCP)**:
```
Wi-Fi 연결: IP 192.168.1.10:5000
↓ (Wi-Fi → 4G 전환)
4G 연결:   IP 10.0.0.5:5000

→ IP 변경 → TCP 연결 끊김 ❌ → 재연결 필요
```

**HTTP/3 (QUIC)**:
```
Wi-Fi 연결: Connection ID: abc123
↓ (Wi-Fi → 4G 전환)
4G 연결:   Connection ID: abc123 (동일!)

→ IP 변경해도 연결 유지! ✅
→ 모바일에서 매우 유용!
```

#### 3. 향상된 혼잡 제어

```
QUIC:
- 더 정확한 RTT 측정
- 패킷별 ACK (TCP는 누적 ACK)
- 더 빠른 손실 감지

성능:
┌────────────────────────────────┐
│ HTTP/2: 패킷 손실 3% 시 30% 저하 │
│ HTTP/3: 패킷 손실 3% 시 10% 저하 │
└────────────────────────────────┘
```

### HTTP/3 스택

```
HTTP/3:
┌──────────────────┐
│  HTTP/3          │
├──────────────────┤
│  QUIC            │ ← UDP 기반
├──────────────────┤
│  UDP             │
└──────────────────┘

HTTP/2:
┌──────────────────┐
│  HTTP/2          │
├──────────────────┤
│  TLS             │
├──────────────────┤
│  TCP             │
└──────────────────┘
```

## 📊 버전별 비교표

```
┌────────────────┬───────────┬───────────┬───────────┐
│ Feature        │ HTTP/1.1  │ HTTP/2    │ HTTP/3    │
├────────────────┼───────────┼───────────┼───────────┤
│ Transport      │ TCP       │ TCP       │ QUIC(UDP) │
│ Multiplexing   │ ❌        │ ✅        │ ✅        │
│ Header 압축    │ ❌        │ ✅ HPACK  │ ✅ QPACK  │
│ Server Push    │ ❌        │ ✅        │ ✅        │
│ HOL Blocking   │ ✅ 발생   │ 부분 해결 │ ✅ 해결   │
│ 0-RTT          │ ❌        │ ❌        │ ✅        │
│ Connection     │           │           │           │
│ Migration      │ ❌        │ ❌        │ ✅        │
│ 암호화         │ 선택      │ 사실상필수│ 필수      │
└────────────────┴───────────┴───────────┴───────────┘
```

## 💻 실무 적용

### HTTP/2 활성화

**Nginx**:
```nginx
server {
    listen 443 ssl http2;  # HTTP/2 활성화
    server_name example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Server Push
    location / {
        http2_push /css/main.css;
        http2_push /js/main.js;
    }
}
```

**Apache**:
```apache
# HTTP/2 활성화
LoadModule http2_module modules/mod_http2.so

<VirtualHost *:443>
    Protocols h2 http/1.1

    # Server Push
    <Location />
        Header add Link "</css/main.css>; rel=preload; as=style"
        Header add Link "</js/main.js>; rel=preload; as=script"
    </Location>
</VirtualHost>
```

### HTTP/3 활성화

**Nginx (with ngx_http_v3_module)**:
```nginx
server {
    listen 443 quic reuseport;  # HTTP/3
    listen 443 ssl http2;       # HTTP/2 fallback

    ssl_protocols TLSv1.3;

    # Alt-Svc 헤더로 HTTP/3 지원 알림
    add_header Alt-Svc 'h3=":443"; ma=86400';
}
```

### 브라우저 확인

**Chrome DevTools**:
```
1. Network 탭 열기
2. Protocol 컬럼 확인
   - h2: HTTP/2
   - h3: HTTP/3
   - http/1.1: HTTP/1.1
```

**curl 테스트**:
```bash
# HTTP/2 테스트
curl -I --http2 https://example.com

# HTTP/3 테스트
curl -I --http3 https://example.com

# 결과:
HTTP/2 200
alt-svc: h3=":443"; ma=86400
```

## 🎯 버전 선택 가이드

### HTTP/1.1을 사용할 때
```
✅ 레거시 시스템
✅ 간단한 API
✅ 디버깅 편의성 중요
```

### HTTP/2를 사용할 때
```
✅ 현대적인 웹 애플리케이션 (표준)
✅ 많은 리소스 로딩
✅ 성능 개선 필요
```

### HTTP/3를 사용할 때
```
✅ 모바일 우선 서비스
✅ 불안정한 네트워크 환경
✅ 초저지연 요구
✅ 실시간 스트리밍

⚠️ 제약사항:
- 서버/CDN 지원 필요
- 브라우저 지원 확인 필요
- UDP 트래픽 허용 필요
```

## ⚠️ 최적화 전략 변화

### HTTP/1.1 최적화 (이제 불필요!)

```
HTTP/1.1 시절:
✅ Domain Sharding → HTTP/2에서는 ❌ 역효과!
✅ Resource Concatenation → HTTP/2에서는 ❌ 캐싱 비효율!
✅ Image Spriting → HTTP/2에서는 ❌ 불필요!

이유:
- HTTP/2는 1개 연결로 충분
- 파일 분리가 캐싱에 유리
- Multiplexing으로 동시 전송
```

### HTTP/2 최적화

```
✅ 파일 분할 (개별 캐싱)
✅ 서버 푸시 활용
✅ HPACK 활용 (헤더 최소화)
✅ TLS 1.3 사용
```

## 🔍 실제 성능 측정

### 테스트 시나리오

```bash
# 100개 이미지 로딩 테스트

# HTTP/1.1
curl -w "@curl-format.txt" \
  --http1.1 https://example.com/test
# 결과: 8.5초

# HTTP/2
curl -w "@curl-format.txt" \
  --http2 https://example.com/test
# 결과: 2.1초 (75% 개선!)

# HTTP/3
curl -w "@curl-format.txt" \
  --http3 https://example.com/test
# 결과: 1.8초 (79% 개선!)
```

## 🎯 체크리스트

- [ ] HTTP/1.1의 Keep-Alive와 Pipelining을 이해한다
- [ ] HTTP/2의 Multiplexing이 HOL Blocking을 해결하는 방법을 안다
- [ ] HPACK 헤더 압축의 원리를 설명할 수 있다
- [ ] HTTP/3의 QUIC이 TCP의 문제를 해결하는 방법을 안다
- [ ] 0-RTT와 Connection Migration의 장점을 이해한다
- [ ] 실무에서 적절한 HTTP 버전을 선택할 수 있다

## 🔗 다음 학습

- [05-HTTPS-TLS.md](./05-HTTPS-TLS.md) - HTTPS와 TLS
- [08-WebSocket-gRPC.md](./08-WebSocket-gRPC.md) - 실시간 통신

---

**"HTTP/2는 현재, HTTP/3는 미래"**
