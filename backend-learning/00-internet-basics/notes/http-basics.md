# HTTP 기초 (HTTP Basics)

## HTTP란?

**HTTP (HyperText Transfer Protocol)** 는 웹에서 데이터를 주고받기 위한 프로토콜입니다. 클라이언트(브라우저)와 서버 간의 통신 규칙을 정의합니다.

---

## HTTP의 특징

### 1. 클라이언트-서버 프로토콜

```
┌─────────────┐                  ┌─────────────┐
│  클라이언트  │ ─── Request ──→  │    서버     │
│   (Client)  │                  │  (Server)   │
│             │ ←── Response ──  │             │
└─────────────┘                  └─────────────┘
```

- **클라이언트**: 요청을 시작하는 쪽
- **서버**: 요청을 처리하고 응답하는 쪽

### 2. 무상태 프로토콜 (Stateless)

각 요청은 독립적이며, 이전 요청의 정보를 저장하지 않습니다.

```
요청 1: GET /login     → 응답: 로그인 페이지
요청 2: POST /login    → 응답: 로그인 성공
요청 3: GET /profile   → 서버는 로그인 상태를 모름!
```

**해결 방법**:
- 쿠키 (Cookie)
- 세션 (Session)
- 토큰 (JWT 등)

### 3. 무연결 프로토콜 (Connectionless)

요청-응답이 끝나면 연결을 끊습니다 (HTTP/1.0).

```
요청 → 연결 → 응답 → 연결 종료
```

**HTTP/1.1부터는 Keep-Alive**로 연결 재사용 가능:
```
연결 → 요청1 → 응답1 → 요청2 → 응답2 → ... → 연결 종료
```

---

## HTTP 메시지 구조

### 1. HTTP 요청 (Request)

```http
GET /api/users/123 HTTP/1.1              ← 요청 라인
Host: api.example.com                    ← 헤더
User-Agent: Mozilla/5.0
Accept: application/json
Authorization: Bearer eyJhbGc...
                                         ← 빈 줄 (헤더와 본문 구분)
{                                        ← 본문 (Body)
  "name": "John Doe"
}
```

**구성 요소**:
1. **요청 라인** (Request Line)
   - HTTP 메서드: GET, POST, PUT, DELETE 등
   - 요청 URL: `/api/users/123`
   - HTTP 버전: `HTTP/1.1`

2. **헤더** (Headers)
   - 요청에 대한 메타데이터
   - `Host`, `User-Agent`, `Accept`, `Authorization` 등

3. **본문** (Body)
   - 전송할 데이터 (선택적)
   - GET 요청은 보통 본문이 없음

### 2. HTTP 응답 (Response)

```http
HTTP/1.1 200 OK                          ← 상태 라인
Content-Type: application/json           ← 헤더
Content-Length: 87
Cache-Control: no-cache
Set-Cookie: sessionId=abc123
                                         ← 빈 줄
{                                        ← 본문
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com"
}
```

**구성 요소**:
1. **상태 라인** (Status Line)
   - HTTP 버전: `HTTP/1.1`
   - 상태 코드: `200`
   - 상태 메시지: `OK`

2. **헤더** (Headers)
   - 응답에 대한 메타데이터

3. **본문** (Body)
   - 실제 응답 데이터

---

## HTTP 메서드 (HTTP Methods)

### 주요 메서드

| 메서드 | 설명 | 용도 | 멱등성 | Body |
|--------|------|------|--------|------|
| **GET** | 리소스 조회 | 데이터 읽기 | ✅ | ❌ |
| **POST** | 리소스 생성 | 데이터 생성 | ❌ | ✅ |
| **PUT** | 리소스 전체 수정 | 데이터 교체 | ✅ | ✅ |
| **PATCH** | 리소스 부분 수정 | 데이터 일부 수정 | ❌ | ✅ |
| **DELETE** | 리소스 삭제 | 데이터 삭제 | ✅ | ❌ |
| **HEAD** | 헤더만 조회 | 메타데이터 확인 | ✅ | ❌ |
| **OPTIONS** | 지원 메서드 조회 | CORS 등 | ✅ | ❌ |

**멱등성 (Idempotent)**: 같은 요청을 여러 번 해도 결과가 동일

### 실무 예제

#### 1. GET - 사용자 조회

```http
GET /api/users/123 HTTP/1.1
Host: api.example.com
```

```javascript
// Node.js (Express)
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});
```

#### 2. POST - 사용자 생성

```http
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

```javascript
app.post('/api/users', async (req, res) => {
  const newUser = await User.create(req.body);
  res.status(201).json(newUser);
});
```

#### 3. PUT - 사용자 전체 수정

```http
PUT /api/users/123 HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 30
}
```

#### 4. PATCH - 사용자 부분 수정

```http
PATCH /api/users/123 HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

#### 5. DELETE - 사용자 삭제

```http
DELETE /api/users/123 HTTP/1.1
Host: api.example.com
```

---

## HTTP 상태 코드 (Status Codes)

### 상태 코드 분류

| 범위 | 분류 | 의미 |
|------|------|------|
| **1xx** | Informational | 요청을 받았으며 처리 중 |
| **2xx** | Success | 요청이 성공적으로 처리됨 |
| **3xx** | Redirection | 추가 동작 필요 (리다이렉트) |
| **4xx** | Client Error | 클라이언트 오류 |
| **5xx** | Server Error | 서버 오류 |

### 자주 사용하는 상태 코드

#### 2xx - 성공

| 코드 | 상태 | 설명 | 사용 예시 |
|------|------|------|----------|
| 200 | OK | 요청 성공 | GET 요청 성공 |
| 201 | Created | 리소스 생성 성공 | POST로 새 리소스 생성 |
| 204 | No Content | 성공했지만 응답 본문 없음 | DELETE 성공 |

```javascript
// 200 OK
res.status(200).json({ user: userData });

// 201 Created
res.status(201).json({ id: newUserId });

// 204 No Content
res.status(204).send();
```

#### 3xx - 리다이렉션

| 코드 | 상태 | 설명 | 사용 예시 |
|------|------|------|----------|
| 301 | Moved Permanently | 영구 이동 | URL 구조 변경 |
| 302 | Found | 임시 이동 | 임시 리다이렉트 |
| 304 | Not Modified | 캐시된 리소스 사용 | 캐싱 |

```javascript
// 301 Redirect
res.redirect(301, '/new-url');

// 302 Redirect
res.redirect('/temp-url');
```

#### 4xx - 클라이언트 오류

| 코드 | 상태 | 설명 | 사용 예시 |
|------|------|------|----------|
| 400 | Bad Request | 잘못된 요청 | 유효성 검사 실패 |
| 401 | Unauthorized | 인증 필요 | 로그인 안 됨 |
| 403 | Forbidden | 권한 없음 | 접근 권한 없음 |
| 404 | Not Found | 리소스 없음 | 존재하지 않는 경로 |
| 409 | Conflict | 충돌 | 중복된 이메일 |
| 429 | Too Many Requests | 요청 과다 | Rate Limiting |

```javascript
// 400 Bad Request
if (!email) {
  return res.status(400).json({ error: '이메일이 필요합니다' });
}

// 401 Unauthorized
if (!req.user) {
  return res.status(401).json({ error: '로그인이 필요합니다' });
}

// 403 Forbidden
if (!req.user.isAdmin) {
  return res.status(403).json({ error: '권한이 없습니다' });
}

// 404 Not Found
if (!user) {
  return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
}
```

#### 5xx - 서버 오류

| 코드 | 상태 | 설명 | 사용 예시 |
|------|------|------|----------|
| 500 | Internal Server Error | 서버 내부 오류 | 예상치 못한 에러 |
| 502 | Bad Gateway | 게이트웨이 오류 | 프록시 서버 문제 |
| 503 | Service Unavailable | 서비스 불가 | 유지보수 중 |

```javascript
// 500 Internal Server Error
try {
  // 서버 로직
} catch (error) {
  console.error(error);
  res.status(500).json({ error: '서버 오류가 발생했습니다' });
}
```

---

## HTTP 헤더 (Headers)

### 요청 헤더 (Request Headers)

```http
GET /api/users HTTP/1.1
Host: api.example.com                    ← 필수 헤더
User-Agent: Mozilla/5.0...               ← 클라이언트 정보
Accept: application/json                 ← 원하는 응답 형식
Accept-Language: ko-KR,ko;q=0.9          ← 선호 언어
Authorization: Bearer eyJhbGc...         ← 인증 토큰
Content-Type: application/json           ← 본문 형식
Cookie: sessionId=abc123                 ← 쿠키
```

### 응답 헤더 (Response Headers)

```http
HTTP/1.1 200 OK
Content-Type: application/json           ← 응답 본문 형식
Content-Length: 1234                     ← 본문 크기 (bytes)
Cache-Control: max-age=3600              ← 캐싱 정책
Set-Cookie: sessionId=xyz; HttpOnly      ← 쿠키 설정
Access-Control-Allow-Origin: *           ← CORS 정책
Server: nginx/1.18.0                     ← 서버 정보
```

### 주요 헤더 설명

#### 1. Content-Type

전송하는 데이터의 형식을 지정합니다.

```javascript
// JSON
res.setHeader('Content-Type', 'application/json');
res.json({ message: 'Success' });

// HTML
res.setHeader('Content-Type', 'text/html');
res.send('<h1>Hello</h1>');

// 파일 다운로드
res.setHeader('Content-Type', 'application/octet-stream');
res.setHeader('Content-Disposition', 'attachment; filename="file.pdf"');
```

**주요 Content-Type**:
- `application/json`: JSON 데이터
- `application/x-www-form-urlencoded`: 폼 데이터
- `multipart/form-data`: 파일 업로드
- `text/html`: HTML
- `text/plain`: 일반 텍스트

#### 2. Authorization

인증 정보를 전달합니다.

```http
Authorization: Basic dXNlcjpwYXNzd29yZA==      ← Basic Auth
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...  ← JWT
Authorization: API-Key abc123def456            ← API Key
```

```javascript
// Express 미들웨어
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: '토큰이 필요합니다' });
  }
  // 토큰 검증 로직
  next();
});
```

#### 3. Cache-Control

캐싱 동작을 제어합니다.

```http
Cache-Control: no-cache              ← 항상 재검증
Cache-Control: no-store              ← 캐싱 금지
Cache-Control: max-age=3600          ← 1시간 캐싱
Cache-Control: public, max-age=31536000  ← 1년 캐싱
```

```javascript
// 정적 파일 캐싱
app.use('/static', express.static('public', {
  maxAge: '1y'  // 1년
}));

// API 응답 캐싱 방지
res.setHeader('Cache-Control', 'no-store');
```

#### 4. CORS 헤더

```http
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

```javascript
// Express CORS 설정
const cors = require('cors');
app.use(cors({
  origin: 'https://example.com',
  credentials: true
}));
```

---

## HTTP 버전별 차이

### HTTP/1.0
```
- 연결당 하나의 요청
- 매번 TCP 연결 재설정
```

### HTTP/1.1 (가장 많이 사용)
```
✓ Keep-Alive (연결 재사용)
✓ 파이프라이닝
✓ 청크 전송 인코딩
✓ Host 헤더 필수
```

### HTTP/2
```
✓ 멀티플렉싱 (동시 다중 요청)
✓ 서버 푸시
✓ 헤더 압축
✓ 바이너리 프로토콜
```

### HTTP/3
```
✓ QUIC 프로토콜 (UDP 기반)
✓ 더 빠른 연결 설정
✓ 연결 마이그레이션
```

---

## 실무 코드 예제

### Express.js 전체 예제

```javascript
const express = require('express');
const app = express();

// JSON 파싱 미들웨어
app.use(express.json());

// 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// GET - 목록 조회
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - 단일 조회
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - 생성
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;

    // 유효성 검사
    if (!name || !email) {
      return res.status(400).json({ error: '이름과 이메일이 필요합니다' });
    }

    const newUser = await User.create({ name, email });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - 전체 수정
app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - 부분 수정
app.patch('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }

    Object.assign(user, req.body);
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - 삭제
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('서버가 http://localhost:3000 에서 실행 중입니다');
});
```

---

## curl로 HTTP 요청 테스트

```bash
# GET 요청
curl http://localhost:3000/api/users

# POST 요청
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'

# PUT 요청
curl -X PUT http://localhost:3000/api/users/123 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com"}'

# DELETE 요청
curl -X DELETE http://localhost:3000/api/users/123

# 헤더 포함 요청
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer token123" \
  -H "Accept: application/json"

# 상세 정보 보기 (-v)
curl -v http://localhost:3000/api/users
```

---

## 추가 학습 자료

- [MDN - HTTP 개요](https://developer.mozilla.org/ko/docs/Web/HTTP/Overview)
- [RFC 9110 - HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [HTTP 완벽 가이드 (도서)](http://www.yes24.com/Product/Goods/15381085)
- [HTTP Status Codes](https://httpstatuses.com/)

---

## 다음 학습

- [HTTPS와 보안](https-security.md)
- [DNS 완벽 가이드](dns-guide.md)

---

*Last updated: 2026-01-05*
