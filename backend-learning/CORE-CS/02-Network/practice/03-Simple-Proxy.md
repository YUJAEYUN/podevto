# Simple Proxy Server - 간단한 프록시 서버

> "중간자가 되어 트래픽을 관찰하고 조작하기"

## 🎯 학습 목표

- **프록시 서버의 동작 원리** 이해
- **HTTP 요청 전달 및 응답 중계** 구현
- **캐싱과 로깅** 기능 추가
- **리버스 프록시**와 포워드 프록시 구분

## 📚 프록시 서버란?

### Forward Proxy (포워드 프록시)

```
클라이언트 → 프록시 → 인터넷
           ↑
     (대리로 요청)

사용 사례:
- 회사/학교 방화벽
- 익명성 보호 (VPN)
- 캐싱으로 속도 향상
```

### Reverse Proxy (리버스 프록시)

```
인터넷 → 프록시 → 백엔드 서버
              ↑
         (로드 밸런싱)

사용 사례:
- Nginx, HAProxy
- 로드 밸런싱
- SSL 터미네이션
- 캐싱
```

---

## 🔨 Phase 1: 기본 HTTP 프록시

### 구현 (Python)

```python
#!/usr/bin/env python3
"""
간단한 HTTP Forward Proxy
"""
import socket
import threading

def handle_client(client_socket):
    """클라이언트 요청 처리"""
    # 1. 클라이언트로부터 요청 수신
    request = client_socket.recv(4096)

    if not request:
        client_socket.close()
        return

    # 2. 요청 파싱
    first_line = request.split(b'\r\n')[0]
    print(f"요청: {first_line.decode('utf-8')}")

    # 3. 목적지 서버 추출
    # 예: GET http://example.com/path HTTP/1.1
    parts = first_line.split(b' ')
    if len(parts) < 3:
        client_socket.close()
        return

    method, url, protocol = parts
    url = url.decode('utf-8')

    # URL 파싱
    if url.startswith('http://'):
        url = url[7:]  # "http://" 제거

    if '/' in url:
        host, path = url.split('/', 1)
        path = '/' + path
    else:
        host = url
        path = '/'

    # 포트 추출
    if ':' in host:
        host, port = host.split(':')
        port = int(port)
    else:
        port = 80

    print(f"목적지: {host}:{port}{path}")

    # 4. 목적지 서버에 연결
    try:
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.connect((host, port))

        # 5. 요청 수정 (프록시용)
        # GET http://example.com/path → GET /path
        modified_request = request.replace(
            method + b' ' + url.encode('utf-8'),
            method + b' ' + path.encode('utf-8')
        )

        # 6. 서버에 요청 전달
        server_socket.sendall(modified_request)

        # 7. 서버 응답 수신 및 클라이언트에 전달
        while True:
            response = server_socket.recv(4096)
            if not response:
                break
            client_socket.sendall(response)

        server_socket.close()
    except Exception as e:
        print(f"에러: {e}")
        error_response = b"HTTP/1.1 502 Bad Gateway\r\n\r\n"
        client_socket.sendall(error_response)
    finally:
        client_socket.close()

def main():
    """프록시 서버 시작"""
    proxy_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    proxy_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    HOST = '0.0.0.0'
    PORT = 8888
    proxy_socket.bind((HOST, PORT))
    proxy_socket.listen(5)

    print(f"HTTP 프록시 서버가 포트 {PORT}에서 실행 중...")

    try:
        while True:
            client_socket, addr = proxy_socket.accept()
            print(f"연결: {addr}")

            # 스레드로 처리
            thread = threading.Thread(target=handle_client, args=(client_socket,))
            thread.daemon = True
            thread.start()
    except KeyboardInterrupt:
        print("\n프록시 서버 종료")
    finally:
        proxy_socket.close()

if __name__ == '__main__':
    main()
```

### 테스트

```bash
# 프록시 서버 실행
python3 proxy.py

# curl로 테스트
curl -x http://localhost:8888 http://example.com

# 브라우저 프록시 설정
# 설정 → 네트워크 → 프록시
# HTTP 프록시: localhost:8888
```

---

## 🚀 Phase 2: 고급 기능

### 1. 요청/응답 로깅

```python
import time
from datetime import datetime

def log_request(method, url, status_code, size, duration):
    """요청 로깅"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] {method} {url} → {status_code} ({size} bytes, {duration:.2f}s)")

def handle_client_with_logging(client_socket):
    """로깅 기능 추가"""
    start_time = time.time()

    request = client_socket.recv(4096)
    if not request:
        client_socket.close()
        return

    # 요청 파싱
    first_line = request.split(b'\r\n')[0]
    method, url, protocol = first_line.split(b' ')

    # URL 파싱 (이전과 동일)
    # ...

    # 서버에 요청 전달
    try:
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.connect((host, port))
        server_socket.sendall(modified_request)

        # 응답 수신
        response_data = b''
        while True:
            chunk = server_socket.recv(4096)
            if not chunk:
                break
            response_data += chunk
            client_socket.sendall(chunk)

        # 상태 코드 추출
        status_line = response_data.split(b'\r\n')[0]
        status_code = status_line.split(b' ')[1].decode('utf-8')

        # 로깅
        duration = time.time() - start_time
        log_request(
            method.decode('utf-8'),
            url.decode('utf-8'),
            status_code,
            len(response_data),
            duration
        )

        server_socket.close()
    except Exception as e:
        print(f"에러: {e}")
        log_request(method.decode('utf-8'), url.decode('utf-8'), '502', 0, time.time() - start_time)
    finally:
        client_socket.close()
```

### 2. 캐싱

```python
import hashlib
import os
import pickle

CACHE_DIR = './proxy_cache'

def get_cache_key(url):
    """URL을 캐시 키로 변환"""
    return hashlib.md5(url.encode('utf-8')).hexdigest()

def get_cached_response(url):
    """캐시에서 응답 조회"""
    os.makedirs(CACHE_DIR, exist_ok=True)

    cache_key = get_cache_key(url)
    cache_path = os.path.join(CACHE_DIR, cache_key)

    if os.path.exists(cache_path):
        # 캐시 만료 확인 (1시간)
        age = time.time() - os.path.getmtime(cache_path)
        if age < 3600:
            with open(cache_path, 'rb') as f:
                return pickle.load(f)

    return None

def save_cached_response(url, response_data):
    """응답을 캐시에 저장"""
    os.makedirs(CACHE_DIR, exist_ok=True)

    cache_key = get_cache_key(url)
    cache_path = os.path.join(CACHE_DIR, cache_key)

    with open(cache_path, 'wb') as f:
        pickle.dump(response_data, f)

def handle_client_with_cache(client_socket):
    """캐싱 기능 추가"""
    request = client_socket.recv(4096)
    if not request:
        client_socket.close()
        return

    # 요청 파싱
    first_line = request.split(b'\r\n')[0]
    method, url, protocol = first_line.split(b' ')

    # GET 요청만 캐싱
    if method == b'GET':
        # 캐시 조회
        cached = get_cached_response(url.decode('utf-8'))
        if cached:
            print(f"캐시 히트: {url.decode('utf-8')}")
            client_socket.sendall(cached)
            client_socket.close()
            return

    # 캐시 미스 → 서버에 요청
    # ... (이전과 동일)

    # 응답 저장
    if method == b'GET' and status_code == '200':
        save_cached_response(url.decode('utf-8'), response_data)
        print(f"캐시 저장: {url.decode('utf-8')}")
```

### 3. 요청/응답 수정 (Content Filtering)

```python
def modify_response(response_data):
    """응답 수정 (광고 제거 등)"""
    # HTML 응답인 경우
    if b'Content-Type: text/html' in response_data:
        # 광고 스크립트 제거
        response_data = response_data.replace(
            b'<script src="ads.js"></script>',
            b''
        )

        # 특정 문자열 치환
        response_data = response_data.replace(
            b'Google',
            b'[REDACTED]'
        )

    return response_data

def handle_client_with_filtering(client_socket):
    """콘텐츠 필터링"""
    # ... (이전과 동일)

    # 응답 수신
    response_data = b''
    while True:
        chunk = server_socket.recv(4096)
        if not chunk:
            break
        response_data += chunk

    # 응답 수정
    modified_response = modify_response(response_data)

    # 클라이언트에 전달
    client_socket.sendall(modified_response)
```

---

## 🔄 Phase 3: 리버스 프록시

### 구현

```python
#!/usr/bin/env python3
"""
리버스 프록시 (Nginx 스타일)
"""
import socket
import threading

# 백엔드 서버 목록
BACKENDS = [
    ('localhost', 8001),
    ('localhost', 8002),
    ('localhost', 8003)
]

current_backend = 0

def get_next_backend():
    """라운드 로빈으로 백엔드 선택"""
    global current_backend
    backend = BACKENDS[current_backend]
    current_backend = (current_backend + 1) % len(BACKENDS)
    return backend

def handle_client_reverse(client_socket):
    """리버스 프록시 요청 처리"""
    request = client_socket.recv(4096)
    if not request:
        client_socket.close()
        return

    # 백엔드 서버 선택
    backend_host, backend_port = get_next_backend()
    print(f"백엔드로 전달: {backend_host}:{backend_port}")

    try:
        # 백엔드 서버에 연결
        backend_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        backend_socket.connect((backend_host, backend_port))

        # X-Forwarded-For 헤더 추가
        client_ip = client_socket.getpeername()[0]
        request = request.replace(
            b'\r\n\r\n',
            f'\r\nX-Forwarded-For: {client_ip}\r\n\r\n'.encode('utf-8')
        )

        # 백엔드에 요청 전달
        backend_socket.sendall(request)

        # 응답 중계
        while True:
            response = backend_socket.recv(4096)
            if not response:
                break
            client_socket.sendall(response)

        backend_socket.close()
    except Exception as e:
        print(f"에러: {e}")
        error_response = b"HTTP/1.1 502 Bad Gateway\r\n\r\n<h1>502 Bad Gateway</h1>"
        client_socket.sendall(error_response)
    finally:
        client_socket.close()

def main_reverse():
    """리버스 프록시 서버 시작"""
    proxy_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    proxy_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    proxy_socket.bind(('0.0.0.0', 80))
    proxy_socket.listen(5)

    print("리버스 프록시 서버가 포트 80에서 실행 중...")

    try:
        while True:
            client_socket, addr = proxy_socket.accept()
            thread = threading.Thread(target=handle_client_reverse, args=(client_socket,))
            thread.daemon = True
            thread.start()
    except KeyboardInterrupt:
        print("\n프록시 서버 종료")
    finally:
        proxy_socket.close()

if __name__ == '__main__':
    main_reverse()
```

### 테스트

```bash
# 백엔드 서버 3개 실행
python3 -m http.server 8001 &
python3 -m http.server 8002 &
python3 -m http.server 8003 &

# 리버스 프록시 실행
sudo python3 reverse_proxy.py

# 테스트
curl http://localhost/
curl http://localhost/
curl http://localhost/

# 로그 확인: 라운드 로빈으로 분산됨
백엔드로 전달: localhost:8001
백엔드로 전달: localhost:8002
백엔드로 전달: localhost:8003
백엔드로 전달: localhost:8001
```

---

## 🔒 Phase 4: HTTPS 프록시 (CONNECT 메서드)

### HTTP CONNECT 터널링

```python
def handle_https_connect(client_socket):
    """HTTPS 프록시 (CONNECT 메서드)"""
    request = client_socket.recv(4096).decode('utf-8')

    # CONNECT example.com:443 HTTP/1.1
    if not request.startswith('CONNECT'):
        client_socket.close()
        return

    # 목적지 추출
    first_line = request.split('\r\n')[0]
    _, destination, _ = first_line.split(' ')
    host, port = destination.split(':')
    port = int(port)

    print(f"HTTPS 터널: {host}:{port}")

    try:
        # 목적지 서버에 연결
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.connect((host, port))

        # 클라이언트에 연결 성공 응답
        client_socket.sendall(b"HTTP/1.1 200 Connection Established\r\n\r\n")

        # 양방향 터널링
        client_socket.setblocking(False)
        server_socket.setblocking(False)

        import select

        sockets = [client_socket, server_socket]
        while True:
            readable, _, _ = select.select(sockets, [], [], 1)

            for sock in readable:
                if sock == client_socket:
                    # 클라이언트 → 서버
                    data = client_socket.recv(4096)
                    if not data:
                        return
                    server_socket.sendall(data)
                elif sock == server_socket:
                    # 서버 → 클라이언트
                    data = server_socket.recv(4096)
                    if not data:
                        return
                    client_socket.sendall(data)
    except Exception as e:
        print(f"에러: {e}")
    finally:
        client_socket.close()
        server_socket.close()
```

---

## 📊 프록시 통계 및 모니터링

### 통계 수집

```python
import threading
from collections import defaultdict

class ProxyStats:
    def __init__(self):
        self.requests = 0
        self.bytes_sent = 0
        self.bytes_received = 0
        self.cache_hits = 0
        self.cache_misses = 0
        self.errors = 0
        self.status_codes = defaultdict(int)
        self.lock = threading.Lock()

    def record_request(self, status_code, sent, received, cached=False):
        with self.lock:
            self.requests += 1
            self.bytes_sent += sent
            self.bytes_received += received
            self.status_codes[status_code] += 1

            if cached:
                self.cache_hits += 1
            else:
                self.cache_misses += 1

    def record_error(self):
        with self.lock:
            self.errors += 1

    def print_stats(self):
        with self.lock:
            print("\n=== 프록시 통계 ===")
            print(f"총 요청: {self.requests}")
            print(f"전송: {self.bytes_sent / 1024:.2f} KB")
            print(f"수신: {self.bytes_received / 1024:.2f} KB")
            print(f"캐시 히트: {self.cache_hits}")
            print(f"캐시 미스: {self.cache_misses}")
            if self.cache_hits + self.cache_misses > 0:
                hit_rate = self.cache_hits / (self.cache_hits + self.cache_misses) * 100
                print(f"캐시 히트율: {hit_rate:.2f}%")
            print(f"에러: {self.errors}")
            print("\n상태 코드:")
            for code, count in sorted(self.status_codes.items()):
                print(f"  {code}: {count}")

stats = ProxyStats()

# 주기적으로 통계 출력
def print_stats_periodically():
    while True:
        time.sleep(60)  # 1분마다
        stats.print_stats()

stats_thread = threading.Thread(target=print_stats_periodically)
stats_thread.daemon = True
stats_thread.start()
```

---

## 🎯 체크리스트

- [ ] 포워드 프록시를 구현할 수 있다
- [ ] 리버스 프록시를 구현할 수 있다
- [ ] HTTP 요청/응답을 로깅할 수 있다
- [ ] 캐싱 기능을 구현할 수 있다
- [ ] HTTPS CONNECT 터널링을 이해한다
- [ ] 프록시 통계를 수집하고 출력할 수 있다
- [ ] 포워드 프록시와 리버스 프록시의 차이를 설명할 수 있다

## 🔗 다음 학습

- [04-Load-Balancer.md](./04-Load-Balancer.md) - 로드 밸런서 구현
- [01-HTTP-Server.md](./01-HTTP-Server.md) - HTTP 서버 구현

---

**"프록시는 네트워크의 중간자. 관찰하고, 수정하고, 최적화한다."**
