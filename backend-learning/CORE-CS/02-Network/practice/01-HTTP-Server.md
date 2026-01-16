# HTTP Server from Scratch - HTTP 서버 직접 구현

> "HTTP의 동작 원리를 코드로 이해하기"

## 🎯 학습 목표

- **소켓 프로그래밍** 기초 습득
- **HTTP 프로토콜** 파싱과 응답 생성
- **멀티스레딩/비동기 처리**로 동시 요청 처리
- **실무 웹 서버의 내부 동작** 이해

## 📚 프로젝트 개요

### 구현할 기능

```
Phase 1: 기본 HTTP 서버
- TCP 소켓 생성 및 바인딩
- HTTP 요청 파싱
- 정적 파일 서빙

Phase 2: 고급 기능
- Keep-Alive 연결 지원
- 멀티스레딩/비동기 처리
- URL 라우팅

Phase 3: 성능 최적화
- 커넥션 풀
- 파일 캐싱
- gzip 압축
```

## 🔨 Phase 1: 기본 HTTP 서버

### 단계별 구현

#### 1. TCP 소켓 생성 (Python)

```python
import socket

# 1. 소켓 생성
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 2. 주소 재사용 옵션 (개발 시 편의)
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

# 3. IP와 포트에 바인딩
HOST = '0.0.0.0'  # 모든 인터페이스
PORT = 8080
server_socket.bind((HOST, PORT))

# 4. 리스닝 시작 (백로그 큐 크기: 5)
server_socket.listen(5)
print(f"HTTP 서버가 포트 {PORT}에서 실행 중...")

# 5. 클라이언트 연결 대기
while True:
    # Accept: 블로킹 (연결 올 때까지 대기)
    client_socket, client_address = server_socket.accept()
    print(f"클라이언트 연결: {client_address}")

    # 요청 처리 (다음 단계)
    handle_request(client_socket)

    # 연결 종료
    client_socket.close()
```

#### 2. HTTP 요청 파싱

```python
def parse_http_request(request_data):
    """HTTP 요청 파싱"""
    lines = request_data.split('\r\n')

    # 1. Request Line 파싱
    request_line = lines[0]
    method, path, protocol = request_line.split(' ')

    # 2. Headers 파싱
    headers = {}
    i = 1
    while i < len(lines) and lines[i] != '':
        header_line = lines[i]
        key, value = header_line.split(': ', 1)
        headers[key] = value
        i += 1

    # 3. Body (있는 경우)
    body_start = i + 1
    body = '\r\n'.join(lines[body_start:]) if body_start < len(lines) else ''

    return {
        'method': method,
        'path': path,
        'protocol': protocol,
        'headers': headers,
        'body': body
    }

def handle_request(client_socket):
    """HTTP 요청 처리"""
    # 1. 요청 수신 (최대 4096 바이트)
    request_data = client_socket.recv(4096).decode('utf-8')

    if not request_data:
        return

    print(f"요청:\n{request_data}")

    # 2. 요청 파싱
    request = parse_http_request(request_data)

    # 3. 응답 생성
    response = handle_route(request)

    # 4. 응답 전송
    client_socket.sendall(response.encode('utf-8'))
```

#### 3. HTTP 응답 생성

```python
def handle_route(request):
    """라우팅 및 응답 생성"""
    method = request['method']
    path = request['path']

    # GET 요청만 처리
    if method != 'GET':
        return create_response(405, 'Method Not Allowed')

    # 라우팅
    if path == '/':
        return create_response(200, '<h1>Hello, World!</h1>', 'text/html')
    elif path == '/api/hello':
        return create_response(200, '{"message": "Hello, API!"}', 'application/json')
    else:
        return create_response(404, '<h1>404 Not Found</h1>', 'text/html')

def create_response(status_code, body, content_type='text/html'):
    """HTTP 응답 생성"""
    # 상태 메시지
    status_messages = {
        200: 'OK',
        404: 'Not Found',
        405: 'Method Not Allowed',
        500: 'Internal Server Error'
    }

    status_message = status_messages.get(status_code, 'Unknown')

    # 응답 헤더
    response = f"HTTP/1.1 {status_code} {status_message}\r\n"
    response += f"Content-Type: {content_type}\r\n"
    response += f"Content-Length: {len(body)}\r\n"
    response += "Connection: close\r\n"
    response += "\r\n"
    response += body

    return response
```

#### 4. 정적 파일 서빙

```python
import os
import mimetypes

def serve_static_file(file_path):
    """정적 파일 서빙"""
    # 보안: 경로 탐색 공격 방지
    base_dir = os.path.abspath('./public')
    requested_path = os.path.abspath(os.path.join(base_dir, file_path.lstrip('/')))

    if not requested_path.startswith(base_dir):
        return create_response(403, '<h1>403 Forbidden</h1>')

    # 파일 존재 확인
    if not os.path.exists(requested_path):
        return create_response(404, '<h1>404 Not Found</h1>')

    # 디렉토리인 경우 index.html 제공
    if os.path.isdir(requested_path):
        requested_path = os.path.join(requested_path, 'index.html')
        if not os.path.exists(requested_path):
            return create_response(404, '<h1>404 Not Found</h1>')

    # 파일 읽기
    try:
        with open(requested_path, 'rb') as f:
            content = f.read()

        # MIME 타입 추측
        content_type, _ = mimetypes.guess_type(requested_path)
        if not content_type:
            content_type = 'application/octet-stream'

        # 응답 생성 (바이너리)
        response = f"HTTP/1.1 200 OK\r\n"
        response += f"Content-Type: {content_type}\r\n"
        response += f"Content-Length: {len(content)}\r\n"
        response += "Connection: close\r\n"
        response += "\r\n"

        return response.encode('utf-8') + content
    except Exception as e:
        print(f"파일 읽기 에러: {e}")
        return create_response(500, '<h1>500 Internal Server Error</h1>')

def handle_route(request):
    """라우팅 (정적 파일 포함)"""
    method = request['method']
    path = request['path']

    if method != 'GET':
        return create_response(405, 'Method Not Allowed')

    # API 라우팅
    if path.startswith('/api/'):
        if path == '/api/hello':
            return create_response(200, '{"message": "Hello, API!"}', 'application/json')
        else:
            return create_response(404, '{"error": "Not Found"}', 'application/json')

    # 정적 파일 서빙
    return serve_static_file(path)
```

### 전체 코드 (Phase 1)

```python
#!/usr/bin/env python3
"""
간단한 HTTP 서버
"""
import socket
import os
import mimetypes

def parse_http_request(request_data):
    lines = request_data.split('\r\n')
    request_line = lines[0]
    method, path, protocol = request_line.split(' ')

    headers = {}
    i = 1
    while i < len(lines) and lines[i] != '':
        key, value = lines[i].split(': ', 1)
        headers[key] = value
        i += 1

    body = '\r\n'.join(lines[i+1:]) if i+1 < len(lines) else ''

    return {
        'method': method,
        'path': path,
        'protocol': protocol,
        'headers': headers,
        'body': body
    }

def create_response(status_code, body, content_type='text/html'):
    status_messages = {
        200: 'OK', 404: 'Not Found', 405: 'Method Not Allowed',
        500: 'Internal Server Error'
    }

    status_message = status_messages.get(status_code, 'Unknown')

    response = f"HTTP/1.1 {status_code} {status_message}\r\n"
    response += f"Content-Type: {content_type}\r\n"
    response += f"Content-Length: {len(body)}\r\n"
    response += "Connection: close\r\n\r\n"
    response += body

    return response

def serve_static_file(file_path):
    base_dir = os.path.abspath('./public')
    requested_path = os.path.abspath(os.path.join(base_dir, file_path.lstrip('/')))

    if not requested_path.startswith(base_dir):
        return create_response(403, '<h1>403 Forbidden</h1>')

    if not os.path.exists(requested_path):
        return create_response(404, '<h1>404 Not Found</h1>')

    if os.path.isdir(requested_path):
        requested_path = os.path.join(requested_path, 'index.html')

    try:
        with open(requested_path, 'rb') as f:
            content = f.read()

        content_type, _ = mimetypes.guess_type(requested_path)
        if not content_type:
            content_type = 'application/octet-stream'

        response = f"HTTP/1.1 200 OK\r\n"
        response += f"Content-Type: {content_type}\r\n"
        response += f"Content-Length: {len(content)}\r\n"
        response += "Connection: close\r\n\r\n"

        return response.encode('utf-8') + content
    except:
        return create_response(500, '<h1>500 Internal Server Error</h1>')

def handle_route(request):
    method = request['method']
    path = request['path']

    if method != 'GET':
        return create_response(405, 'Method Not Allowed')

    if path.startswith('/api/'):
        if path == '/api/hello':
            return create_response(200, '{"message": "Hello"}', 'application/json')
        return create_response(404, '{"error": "Not Found"}', 'application/json')

    return serve_static_file(path)

def handle_request(client_socket):
    request_data = client_socket.recv(4096).decode('utf-8')
    if not request_data:
        return

    request = parse_http_request(request_data)
    response = handle_route(request)

    if isinstance(response, str):
        response = response.encode('utf-8')

    client_socket.sendall(response)

def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    HOST = '0.0.0.0'
    PORT = 8080
    server_socket.bind((HOST, PORT))
    server_socket.listen(5)

    print(f"HTTP 서버가 포트 {PORT}에서 실행 중...")

    try:
        while True:
            client_socket, client_address = server_socket.accept()
            print(f"연결: {client_address}")

            try:
                handle_request(client_socket)
            except Exception as e:
                print(f"에러: {e}")
            finally:
                client_socket.close()
    except KeyboardInterrupt:
        print("\n서버 종료")
    finally:
        server_socket.close()

if __name__ == '__main__':
    main()
```

### 테스트

```bash
# public 디렉토리 생성
mkdir -p public
echo "<h1>Welcome!</h1>" > public/index.html

# 서버 실행
python3 http_server.py

# 브라우저에서 접속
open http://localhost:8080

# curl로 테스트
curl http://localhost:8080/
curl http://localhost:8080/api/hello
```

---

## 🚀 Phase 2: 고급 기능

### 1. Keep-Alive 연결 지원

```python
def handle_request_keep_alive(client_socket):
    """Keep-Alive 지원"""
    while True:
        # 요청 수신
        request_data = client_socket.recv(4096).decode('utf-8')

        if not request_data:
            break  # 클라이언트가 연결 종료

        request = parse_http_request(request_data)

        # Connection 헤더 확인
        connection = request['headers'].get('Connection', '').lower()
        keep_alive = connection == 'keep-alive'

        # 응답 생성
        response = handle_route(request)

        # Keep-Alive 헤더 추가
        if keep_alive:
            response = response.replace(
                'Connection: close',
                'Connection: keep-alive\r\nKeep-Alive: timeout=5, max=100'
            )

        # 응답 전송
        if isinstance(response, str):
            response = response.encode('utf-8')
        client_socket.sendall(response)

        # Keep-Alive가 아니면 종료
        if not keep_alive:
            break
```

### 2. 멀티스레딩

```python
import threading

def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(('0.0.0.0', 8080))
    server_socket.listen(5)

    print("HTTP 서버 (멀티스레드) 실행 중...")

    try:
        while True:
            client_socket, client_address = server_socket.accept()
            print(f"연결: {client_address}")

            # 스레드로 처리
            thread = threading.Thread(
                target=handle_client,
                args=(client_socket,)
            )
            thread.daemon = True
            thread.start()
    except KeyboardInterrupt:
        print("\n서버 종료")
    finally:
        server_socket.close()

def handle_client(client_socket):
    """클라이언트 처리 (스레드)"""
    try:
        handle_request_keep_alive(client_socket)
    except Exception as e:
        print(f"에러: {e}")
    finally:
        client_socket.close()
```

### 3. 비동기 처리 (asyncio)

```python
import asyncio

async def handle_client_async(reader, writer):
    """비동기 클라이언트 처리"""
    addr = writer.get_extra_info('peername')
    print(f"연결: {addr}")

    try:
        while True:
            # 요청 수신
            data = await reader.read(4096)
            if not data:
                break

            request_data = data.decode('utf-8')
            request = parse_http_request(request_data)

            # 응답 생성
            response = handle_route(request)
            if isinstance(response, str):
                response = response.encode('utf-8')

            # 응답 전송
            writer.write(response)
            await writer.drain()

            # Connection 헤더 확인
            connection = request['headers'].get('Connection', '').lower()
            if connection != 'keep-alive':
                break
    except Exception as e:
        print(f"에러: {e}")
    finally:
        writer.close()
        await writer.wait_closed()

async def main_async():
    """비동기 서버"""
    server = await asyncio.start_server(
        handle_client_async,
        '0.0.0.0',
        8080
    )

    addr = server.sockets[0].getsockname()
    print(f"HTTP 서버 (비동기) {addr} 실행 중...")

    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    asyncio.run(main_async())
```

---

## ⚡ Phase 3: 성능 최적화

### 1. 파일 캐싱

```python
from functools import lru_cache
import hashlib
import time

# 파일 캐시 (LRU, 최대 100개)
@lru_cache(maxsize=100)
def read_file_cached(file_path, mtime):
    """파일 캐싱 (수정 시간 기준)"""
    with open(file_path, 'rb') as f:
        return f.read()

def serve_static_file_cached(file_path):
    """캐싱된 정적 파일 서빙"""
    base_dir = os.path.abspath('./public')
    requested_path = os.path.abspath(os.path.join(base_dir, file_path.lstrip('/')))

    if not requested_path.startswith(base_dir):
        return create_response(403, '<h1>403 Forbidden</h1>')

    if not os.path.exists(requested_path):
        return create_response(404, '<h1>404 Not Found</h1>')

    try:
        # 파일 수정 시간
        mtime = os.path.getmtime(requested_path)

        # 캐시에서 읽기
        content = read_file_cached(requested_path, mtime)

        # ETag 생성
        etag = hashlib.md5(content).hexdigest()

        # Content-Type
        content_type, _ = mimetypes.guess_type(requested_path)
        if not content_type:
            content_type = 'application/octet-stream'

        # 응답
        response = f"HTTP/1.1 200 OK\r\n"
        response += f"Content-Type: {content_type}\r\n"
        response += f"Content-Length: {len(content)}\r\n"
        response += f"ETag: \"{etag}\"\r\n"
        response += f"Cache-Control: max-age=3600\r\n"
        response += "Connection: close\r\n\r\n"

        return response.encode('utf-8') + content
    except:
        return create_response(500, '<h1>500 Internal Server Error</h1>')
```

### 2. gzip 압축

```python
import gzip

def compress_response(response, request):
    """gzip 압축"""
    # Accept-Encoding 확인
    accept_encoding = request['headers'].get('Accept-Encoding', '')

    if 'gzip' not in accept_encoding:
        return response  # 압축 미지원

    # 응답 분리 (헤더 + 바디)
    if isinstance(response, bytes):
        parts = response.split(b'\r\n\r\n', 1)
    else:
        parts = response.split('\r\n\r\n', 1)

    if len(parts) != 2:
        return response

    headers, body = parts

    # 바디 압축
    if isinstance(body, str):
        body = body.encode('utf-8')

    compressed_body = gzip.compress(body)

    # 헤더 수정
    if isinstance(headers, bytes):
        headers = headers.decode('utf-8')

    headers = headers.replace(
        f'Content-Length: {len(body)}',
        f'Content-Length: {len(compressed_body)}'
    )
    headers += '\r\nContent-Encoding: gzip'

    return headers.encode('utf-8') + b'\r\n\r\n' + compressed_body
```

---

## 📊 성능 테스트

### Apache Bench (ab)

```bash
# 1000 요청, 동시 접속 10
ab -n 1000 -c 10 http://localhost:8080/

# 결과:
Requests per second:    500.00 [#/sec]
Time per request:       20.000 [ms]
Transfer rate:          100.00 [Kbytes/sec]
```

### wrk (고성능 벤치마크)

```bash
# 10초 동안, 2개 스레드, 10개 연결
wrk -t2 -c10 -d10s http://localhost:8080/

# 결과:
Running 10s test @ http://localhost:8080/
  2 threads and 10 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     5.00ms    2.00ms   50.00ms   75.00%
    Req/Sec     1.00k   100.00     1.20k    80.00%
  20000 requests in 10.00s, 10.00MB read
Requests/sec:   2000.00
Transfer/sec:      1.00MB
```

---

## 🎯 체크리스트

- [ ] TCP 소켓을 생성하고 바인딩할 수 있다
- [ ] HTTP 요청을 파싱할 수 있다
- [ ] HTTP 응답을 생성할 수 있다
- [ ] 정적 파일을 서빙할 수 있다
- [ ] Keep-Alive 연결을 지원한다
- [ ] 멀티스레딩 또는 비동기로 동시 요청을 처리한다
- [ ] 파일 캐싱으로 성능을 개선한다
- [ ] gzip 압축을 구현한다

## 🔗 다음 학습

- [02-Packet-Analyzer.md](./02-Packet-Analyzer.md) - Wireshark 패킷 분석
- [03-Simple-Proxy.md](./03-Simple-Proxy.md) - 프록시 서버 구현

---

**"HTTP 서버를 직접 만들면 웹 프레임워크의 내부가 보인다"**
