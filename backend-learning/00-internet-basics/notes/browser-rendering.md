# 브라우저 동작 원리와 렌더링 과정

## 개요

백엔드 개발자도 브라우저의 동작 원리를 이해하면 더 효율적인 API와 웹 서비스를 설계할 수 있습니다. 특히 렌더링 성능, 캐싱 전략, CORS 등을 이해하는 데 필수적입니다.

---

## 브라우저의 주요 구성 요소

```
┌───────────────────────────────────────────────┐
│          User Interface (UI)                  │
│  주소창, 뒤로가기, 새로고침 버튼 등               │
├───────────────────────────────────────────────┤
│          Browser Engine                       │
│  UI와 렌더링 엔진 사이 동작 제어                 │
├───────────────────────────────────────────────┤
│          Rendering Engine                     │
│  HTML/CSS를 파싱하고 화면에 표시                │
│  - Blink (Chrome, Edge)                       │
│  - WebKit (Safari)                            │
│  - Gecko (Firefox)                            │
├──────────────┬────────────────────────────────┤
│  JavaScript  │   Networking                   │
│  Engine      │   HTTP 요청 처리                │
│  - V8        │   캐싱, 쿠키 관리               │
│  - SpiderMonkey                               │
├──────────────┴────────────────────────────────┤
│          UI Backend                           │
│  운영체제의 UI 메서드 사용                       │
├───────────────────────────────────────────────┤
│          Data Storage                         │
│  LocalStorage, SessionStorage, IndexedDB      │
│  Cookies, Cache                               │
└───────────────────────────────────────────────┘
```

---

## 웹 페이지 로딩 과정 (전체 흐름)

사용자가 `https://example.com`을 입력했을 때:

```
1. URL 입력
   └─ 사용자가 주소창에 URL 입력

2. DNS 조회
   ┌──────────────────────────────────┐
   │ example.com → 93.184.216.34      │
   └──────────────────────────────────┘

3. TCP 연결 (3-way handshake)
   ┌──────────┐          ┌──────────┐
   │ Browser  │ ─ SYN →  │  Server  │
   │          │ ← SYN-ACK │          │
   │          │ ─ ACK →  │          │
   └──────────┘          └──────────┘

4. TLS 핸드셰이크 (HTTPS)
   - SSL/TLS 인증서 교환
   - 암호화 키 생성

5. HTTP 요청
   ┌──────────────────────────────────┐
   │ GET / HTTP/1.1                   │
   │ Host: example.com                │
   │ User-Agent: Chrome/120.0         │
   └──────────────────────────────────┘

6. 서버 응답
   ┌──────────────────────────────────┐
   │ HTTP/1.1 200 OK                  │
   │ Content-Type: text/html          │
   │                                  │
   │ <!DOCTYPE html>                  │
   │ <html>...</html>                 │
   └──────────────────────────────────┘

7. 렌더링 시작
   └─ HTML 파싱 및 DOM 생성

8. 리소스 로드
   └─ CSS, JavaScript, 이미지 등

9. 페이지 표시
   └─ 사용자에게 최종 화면 표시
```

---

## 렌더링 엔진의 동작 과정

### Critical Rendering Path

```
HTML 파싱 → DOM Tree 생성
    ↓
CSS 파싱 → CSSOM Tree 생성
    ↓
DOM + CSSOM → Render Tree 생성
    ↓
Layout (Reflow) → 요소의 위치와 크기 계산
    ↓
Paint → 픽셀로 그리기
    ↓
Composite → 레이어 합성
    ↓
Display → 화면에 표시
```

### 1. HTML 파싱 및 DOM 생성

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Example</title>
  </head>
  <body>
    <h1>Hello World</h1>
    <p>This is a paragraph.</p>
  </body>
</html>
```

**DOM Tree**:
```
Document
 └─ html
     ├─ head
     │   └─ title
     │       └─ "Example"
     └─ body
         ├─ h1
         │   └─ "Hello World"
         └─ p
             └─ "This is a paragraph."
```

### 2. CSS 파싱 및 CSSOM 생성

```css
body { font-size: 16px; }
h1 { color: blue; font-size: 32px; }
p { color: gray; }
```

**CSSOM Tree**:
```
Document
 └─ html
     └─ body (font-size: 16px)
         ├─ h1 (color: blue, font-size: 32px)
         └─ p (color: gray)
```

### 3. Render Tree 생성

DOM과 CSSOM을 결합하여 실제로 화면에 표시될 요소만 포함합니다.

```
Render Tree (표시될 요소만)
 └─ body
     ├─ h1 "Hello World" (color: blue, font-size: 32px)
     └─ p "This is..." (color: gray, font-size: 16px)
```

**제외되는 요소**:
- `display: none`
- `<head>`, `<script>`, `<meta>` 등

### 4. Layout (Reflow)

각 요소의 정확한 위치와 크기를 계산합니다.

```
h1:
  x: 0, y: 0
  width: 800px
  height: 40px

p:
  x: 0, y: 40px
  width: 800px
  height: 20px
```

### 5. Paint

계산된 정보를 바탕으로 픽셀로 그립니다.

```
- 배경색 그리기
- 테두리 그리기
- 텍스트 그리기
- 그림자 그리기
```

### 6. Composite

여러 레이어를 합성하여 최종 화면을 만듭니다.

```
Layer 1: 배경
Layer 2: 텍스트
Layer 3: 애니메이션 요소
    ↓
최종 화면
```

---

## 렌더링 차단 리소스

### CSS는 렌더링 차단

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 이 CSS가 로드될 때까지 렌더링 차단 -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Hello</h1>
</body>
</html>
```

**해결 방법**:
```html
<!-- 미디어 쿼리로 조건부 로드 -->
<link rel="stylesheet" href="print.css" media="print">

<!-- 비동기 로드 -->
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
```

### JavaScript는 파싱 차단

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 이 스크립트가 실행될 때까지 파싱 차단 -->
  <script src="app.js"></script>
</head>
<body>
  <h1>Hello</h1>
</body>
</html>
```

**해결 방법**:
```html
<!-- async: 다운로드 중에도 파싱 계속, 다운로드 완료 즉시 실행 -->
<script src="analytics.js" async></script>

<!-- defer: 다운로드 중에도 파싱 계속, DOM 완성 후 실행 -->
<script src="app.js" defer></script>

<!-- body 끝에 배치 -->
<body>
  <h1>Hello</h1>
  <script src="app.js"></script>
</body>
```

---

## 요청-응답 사이클

### 1. 리소스 우선순위

브라우저는 리소스를 우선순위에 따라 로드합니다.

```
High Priority:
  - HTML
  - CSS
  - Fonts (in viewport)

Medium Priority:
  - JavaScript (async/defer)
  - Images (in viewport)

Low Priority:
  - Images (below fold)
  - Prefetch resources
```

### 2. 동시 연결 제한

브라우저는 도메인당 동시 연결 수에 제한이 있습니다.

```
HTTP/1.1: 도메인당 6개 연결 (브라우저마다 다름)
HTTP/2:   단일 연결에서 멀티플렉싱
```

**최적화 전략**:
```
HTTP/1.1:
- 도메인 샤딩 (assets1.example.com, assets2.example.com)
- 파일 합치기 (bundling)

HTTP/2:
- 단일 도메인 사용
- 파일 분할 (code splitting)
```

---

## 브라우저 캐싱

### 캐시 종류

#### 1. Memory Cache
```
- 가장 빠름
- 메모리에 저장
- 탭을 닫으면 사라짐
```

#### 2. Disk Cache
```
- 디스크에 저장
- 브라우저를 닫아도 유지
- Memory Cache보다 느림
```

#### 3. Service Worker Cache
```
- 프로그래밍 가능한 캐시
- 오프라인 지원
- PWA에서 사용
```

### HTTP 캐싱 헤더

```http
# 서버 응답
HTTP/1.1 200 OK
Cache-Control: public, max-age=31536000
ETag: "abc123"
Last-Modified: Mon, 01 Jan 2024 00:00:00 GMT
```

**Cache-Control 옵션**:
```
public          - 모든 캐시에 저장 가능
private         - 브라우저 캐시만 허용
no-cache        - 캐시하되, 매번 재검증
no-store        - 캐시 금지
max-age=3600    - 3600초(1시간) 동안 유효
```

**백엔드 예제 (Express)**:
```javascript
// 정적 파일 - 1년 캐싱
app.use('/static', express.static('public', {
  maxAge: '1y',
  immutable: true
}));

// API 응답 - 캐싱 금지
app.get('/api/users', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(users);
});

// 조건부 캐싱
app.get('/api/news', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5분
  res.json(news);
});
```

---

## CORS (Cross-Origin Resource Sharing)

### 동일 출처 정책 (Same-Origin Policy)

보안을 위해 다른 출처의 리소스 접근을 제한합니다.

```
출처(Origin) = 프로토콜 + 도메인 + 포트

https://example.com:443/page
  │       │          │
  │       │          └─ 포트
  │       └──────────── 도메인
  └──────────────────── 프로토콜
```

**동일 출처 예시**:
```
기준: https://example.com

✓ https://example.com/page        (동일)
✓ https://example.com/api/users   (동일)

✗ http://example.com              (프로토콜 다름)
✗ https://api.example.com         (서브도메인 다름)
✗ https://example.com:8080        (포트 다름)
```

### CORS 동작 방식

#### Simple Request

```
브라우저 → 서버
GET /api/users HTTP/1.1
Origin: https://example.com

서버 → 브라우저
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://example.com
```

#### Preflight Request

```
1. OPTIONS 요청 (Preflight)
   브라우저 → 서버
   OPTIONS /api/users HTTP/1.1
   Origin: https://example.com
   Access-Control-Request-Method: POST
   Access-Control-Request-Headers: Content-Type

2. 서버 응답
   HTTP/1.1 204 No Content
   Access-Control-Allow-Origin: https://example.com
   Access-Control-Allow-Methods: POST, GET, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   Access-Control-Max-Age: 86400

3. 실제 요청
   POST /api/users HTTP/1.1
   Origin: https://example.com
   Content-Type: application/json
```

### CORS 설정 (백엔드)

```javascript
// Express - 모든 출처 허용 (개발 환경)
const cors = require('cors');
app.use(cors());

// 특정 출처만 허용 (프로덕션)
app.use(cors({
  origin: 'https://example.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // 쿠키 포함 허용
  maxAge: 86400 // Preflight 캐시 시간 (24시간)
}));

// 동적 출처 검증
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://example.com',
      'https://app.example.com'
    ];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// 수동 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://example.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
```

---

## 성능 최적화 (백엔드 관점)

### 1. 응답 압축

```javascript
const compression = require('compression');
app.use(compression());
```

```http
# 압축된 응답
HTTP/1.1 200 OK
Content-Encoding: gzip
Content-Type: application/json
Content-Length: 1234  ← 압축 후 크기
```

### 2. HTTP/2 사용

```javascript
const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
}, app);

server.listen(443);
```

### 3. 조건부 요청 지원

```javascript
app.get('/api/news', (req, res) => {
  const etag = generateETag(newsData);
  const lastModified = newsData.updatedAt;

  // If-None-Match (ETag 비교)
  if (req.headers['if-none-match'] === etag) {
    return res.sendStatus(304); // Not Modified
  }

  // If-Modified-Since (시간 비교)
  if (req.headers['if-modified-since']) {
    const since = new Date(req.headers['if-modified-since']);
    if (lastModified <= since) {
      return res.sendStatus(304);
    }
  }

  res.set('ETag', etag);
  res.set('Last-Modified', lastModified.toUTCString());
  res.set('Cache-Control', 'public, max-age=300');
  res.json(newsData);
});
```

### 4. 리소스 힌트 제공

```html
<!-- DNS Prefetch -->
<link rel="dns-prefetch" href="https://api.example.com">

<!-- Preconnect -->
<link rel="preconnect" href="https://cdn.example.com">

<!-- Prefetch (미래에 필요할 리소스) -->
<link rel="prefetch" href="/next-page.html">

<!-- Preload (현재 페이지에 필요한 리소스) -->
<link rel="preload" href="/critical.css" as="style">
```

---

## 개발자 도구 활용

### Network 탭

```
요청 확인:
- 요청/응답 헤더
- 타이밍 (TTFB, Content Download)
- 크기 (전송 크기 vs 리소스 크기)
- 캐시 상태

필터:
- XHR: AJAX 요청만
- JS: JavaScript 파일만
- CSS: CSS 파일만
- Img: 이미지만
```

### Performance 탭

```
측정 항목:
- FCP (First Contentful Paint): 첫 콘텐츠 표시 시간
- LCP (Largest Contentful Paint): 최대 콘텐츠 표시 시간
- TTI (Time to Interactive): 상호작용 가능 시간
- TBT (Total Blocking Time): 총 차단 시간
```

### Lighthouse

```bash
# Chrome DevTools에서 실행
또는
# CLI로 실행
npm install -g lighthouse
lighthouse https://example.com --view
```

---

## 추가 학습 자료

- [How Browsers Work](https://web.dev/howbrowserswork/)
- [Critical Rendering Path](https://developers.google.com/web/fundamentals/performance/critical-rendering-path)
- [MDN - CORS](https://developer.mozilla.org/ko/docs/Web/HTTP/CORS)
- [Web.dev - Performance](https://web.dev/performance/)

---

## 다음 학습

- [HTTP 기초](http-basics.md)
- [HTTPS와 보안](https-security.md)
- [호스팅 기초](hosting-basics.md)

---

*Last updated: 2026-01-05*
