# HTTP Basics - HTTP 기본 개념

> "웹의 언어"

## 🎯 학습 목표

- **HTTP 프로토콜** 이해
- **HTTP 메서드** 숙지
- **HTTP 상태 코드** 파악
- **HTTP 헤더** 이해

## 📚 HTTP란?

**HyperText Transfer Protocol**
- 애플리케이션 계층 프로토콜
- 클라이언트-서버 모델
- 요청-응답 구조
- TCP 기반 (신뢰성)

## 🔍 HTTP 메서드

### GET (조회)

```http
GET /users/123 HTTP/1.1
Host: api.example.com

응답:
{
  "id": 123,
  "name": "Alice"
}
```

### POST (생성)

```http
POST /users HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "name": "Bob",
  "email": "bob@example.com"
}
```

### PUT (전체 수정)

```http
PUT /users/123 HTTP/1.1

{
  "name": "Alice Updated",
  "email": "alice@example.com"
}
```

### PATCH (부분 수정)

```http
PATCH /users/123 HTTP/1.1

{
  "email": "newemail@example.com"
}
```

### DELETE (삭제)

```http
DELETE /users/123 HTTP/1.1
```

## 📊 HTTP 상태 코드

### 2xx (성공)

```
200 OK: 성공
201 Created: 생성됨
204 No Content: 내용 없음 (삭제 성공)
```

### 3xx (리다이렉션)

```
301 Moved Permanently: 영구 이동
302 Found: 임시 이동
304 Not Modified: 캐시 사용
```

### 4xx (클라이언트 오류)

```
400 Bad Request: 잘못된 요청
401 Unauthorized: 인증 필요
403 Forbidden: 권한 없음
404 Not Found: 없음
```

### 5xx (서버 오류)

```
500 Internal Server Error: 서버 오류
502 Bad Gateway: 게이트웨이 오류
503 Service Unavailable: 서비스 불가
```

## 💡 HTTP 헤더

### 요청 헤더

```http
GET / HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: text/html
Accept-Language: ko-KR
Cookie: session=abc123
```

### 응답 헤더

```http
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1234
Set-Cookie: session=xyz789
Cache-Control: max-age=3600
```

## 🔍 HTTP 요청/응답 구조

### 요청

```
1. Request Line: GET /path HTTP/1.1
2. Headers: Host, User-Agent, ...
3. 빈 줄
4. Body (선택)
```

### 응답

```
1. Status Line: HTTP/1.1 200 OK
2. Headers: Content-Type, ...
3. 빈 줄
4. Body
```

## 💻 실습

### curl로 HTTP 요청

```bash
# GET
curl https://api.example.com/users

# POST
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob"}' \
  https://api.example.com/users

# 상세 정보 (-v)
curl -v https://example.com
```

## 🔗 다음 학습

- [../deep-dive/04-HTTP-Versions.md](../deep-dive/04-HTTP-Versions.md)

---

**"HTTP는 웹의 기본 언어"**
