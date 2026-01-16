# Load Balancer Implementation - 로드 밸런서 구현

> "트래픽을 분산하는 마법"

## 🎯 학습 목표

- **로드 밸런싱 알고리즘** 직접 구현
- **헬스 체크** 메커니즘 이해
- **세션 유지 (Sticky Session)** 구현
- **실무 로드 밸런서**의 동작 원리 습득

## 📚 프로젝트 개요

### 구현할 기능

```
Phase 1: 기본 로드 밸런서
- Round Robin 알고리즘
- 백엔드 서버 목록 관리

Phase 2: 고급 알고리즘
- Weighted Round Robin
- Least Connections
- IP Hash

Phase 3: 헬스 체크
- Active Health Check
- Passive Health Check
- 자동 서버 제외/복구

Phase 4: 추가 기능
- Sticky Session
- 통계 및 모니터링
```

---

## 🔨 Phase 1: 기본 로드 밸런서

### Round Robin 구현 (Python)

```python
#!/usr/bin/env python3
"""
간단한 HTTP 로드 밸런서
"""
import socket
import threading

class LoadBalancer:
    def __init__(self, backends):
        """
        backends: [('host', port), ...]
        """
        self.backends = backends
        self.current = 0
        self.lock = threading.Lock()

    def get_next_backend(self):
        """Round Robin으로 백엔드 선택"""
        with self.lock:
            backend = self.backends[self.current]
            self.current = (self.current + 1) % len(self.backends)
            return backend

    def handle_client(self, client_socket, client_address):
        """클라이언트 요청 처리"""
        print(f"클라이언트 연결: {client_address}")

        try:
            # 1. 클라이언트 요청 수신
            request = client_socket.recv(4096)
            if not request:
                return

            # 2. 백엔드 서버 선택
            backend_host, backend_port = self.get_next_backend()
            print(f"백엔드 선택: {backend_host}:{backend_port}")

            # 3. 백엔드 서버에 연결
            backend_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            backend_socket.connect((backend_host, backend_port))

            # 4. 요청 전달
            backend_socket.sendall(request)

            # 5. 응답 중계
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

    def start(self, host='0.0.0.0', port=8080):
        """로드 밸런서 시작"""
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((host, port))
        server_socket.listen(5)

        print(f"로드 밸런서가 포트 {port}에서 실행 중...")
        print(f"백엔드 서버: {self.backends}")

        try:
            while True:
                client_socket, client_address = server_socket.accept()

                # 스레드로 처리
                thread = threading.Thread(
                    target=self.handle_client,
                    args=(client_socket, client_address)
                )
                thread.daemon = True
                thread.start()
        except KeyboardInterrupt:
            print("\n로드 밸런서 종료")
        finally:
            server_socket.close()

# 사용 예시
if __name__ == '__main__':
    backends = [
        ('localhost', 8001),
        ('localhost', 8002),
        ('localhost', 8003)
    ]

    lb = LoadBalancer(backends)
    lb.start()
```

### 테스트

```bash
# 백엔드 서버 3개 실행
# 터미널 1
cd backend1 && python3 -m http.server 8001

# 터미널 2
cd backend2 && python3 -m http.server 8002

# 터미널 3
cd backend3 && python3 -m http.server 8003

# 로드 밸런서 실행
python3 load_balancer.py

# 테스트
curl http://localhost:8080/
curl http://localhost:8080/
curl http://localhost:8080/

# 결과: 8001 → 8002 → 8003 → 8001 ...
```

---

## 🚀 Phase 2: 고급 알고리즘

### 1. Weighted Round Robin (가중 라운드 로빈)

```python
class WeightedRoundRobinLB(LoadBalancer):
    def __init__(self, backends_with_weight):
        """
        backends_with_weight: [
            (('host', port), weight),
            ...
        ]
        """
        self.backends_with_weight = backends_with_weight
        self.weights = [w for _, w in backends_with_weight]
        self.backends = [b for b, _ in backends_with_weight]
        self.total_weight = sum(self.weights)
        self.current_weight = 0
        self.current_index = 0
        self.lock = threading.Lock()

    def get_next_backend(self):
        """가중치 기반 선택"""
        with self.lock:
            while True:
                self.current_index = (self.current_index + 1) % len(self.backends)
                if self.current_index == 0:
                    self.current_weight = self.current_weight - 1
                    if self.current_weight <= 0:
                        self.current_weight = max(self.weights)

                if self.weights[self.current_index] >= self.current_weight:
                    return self.backends[self.current_index]

# 사용 예시
backends_with_weight = [
    (('localhost', 8001), 5),  # 고성능 서버: 가중치 5
    (('localhost', 8002), 3),  # 중성능 서버: 가중치 3
    (('localhost', 8003), 2)   # 저성능 서버: 가중치 2
]

lb = WeightedRoundRobinLB(backends_with_weight)
lb.start()

# 분배: 8001 (50%), 8002 (30%), 8003 (20%)
```

### 2. Least Connections (최소 연결)

```python
class LeastConnectionsLB(LoadBalancer):
    def __init__(self, backends):
        super().__init__(backends)
        self.connections = {backend: 0 for backend in backends}

    def get_next_backend(self):
        """연결 수가 가장 적은 백엔드 선택"""
        with self.lock:
            backend = min(self.connections, key=self.connections.get)
            self.connections[backend] += 1
            return backend

    def release_backend(self, backend):
        """연결 종료 시 카운트 감소"""
        with self.lock:
            self.connections[backend] -= 1

    def handle_client(self, client_socket, client_address):
        """클라이언트 요청 처리 (연결 추적)"""
        backend = None
        try:
            request = client_socket.recv(4096)
            if not request:
                return

            backend = self.get_next_backend()
            backend_host, backend_port = backend
            print(f"백엔드 선택: {backend_host}:{backend_port} (연결 수: {self.connections[backend]})")

            backend_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            backend_socket.connect((backend_host, backend_port))
            backend_socket.sendall(request)

            while True:
                response = backend_socket.recv(4096)
                if not response:
                    break
                client_socket.sendall(response)

            backend_socket.close()
        except Exception as e:
            print(f"에러: {e}")
        finally:
            if backend:
                self.release_backend(backend)
            client_socket.close()
```

### 3. IP Hash (세션 유지)

```python
import hashlib

class IPHashLB(LoadBalancer):
    def get_backend_for_ip(self, client_ip):
        """클라이언트 IP를 해싱하여 백엔드 선택"""
        hash_value = int(hashlib.md5(client_ip.encode()).hexdigest(), 16)
        index = hash_value % len(self.backends)
        return self.backends[index]

    def handle_client(self, client_socket, client_address):
        """IP 기반 라우팅"""
        client_ip = client_address[0]

        try:
            request = client_socket.recv(4096)
            if not request:
                return

            # IP로 백엔드 결정
            backend_host, backend_port = self.get_backend_for_ip(client_ip)
            print(f"클라이언트 {client_ip} → 백엔드 {backend_host}:{backend_port}")

            backend_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            backend_socket.connect((backend_host, backend_port))
            backend_socket.sendall(request)

            while True:
                response = backend_socket.recv(4096)
                if not response:
                    break
                client_socket.sendall(response)

            backend_socket.close()
        except Exception as e:
            print(f"에러: {e}")
        finally:
            client_socket.close()

# 같은 IP는 항상 같은 백엔드로! (세션 유지)
```

---

## 🩺 Phase 3: 헬스 체크

### Active Health Check (능동적 헬스 체크)

```python
import time
import requests

class HealthCheck:
    def __init__(self, backends, interval=5, timeout=2):
        """
        interval: 헬스 체크 간격 (초)
        timeout: 응답 대기 시간 (초)
        """
        self.backends = backends
        self.interval = interval
        self.timeout = timeout
        self.healthy_backends = set(backends)
        self.lock = threading.Lock()

    def check_backend(self, backend):
        """백엔드 서버 헬스 체크"""
        host, port = backend
        url = f"http://{host}:{port}/health"

        try:
            response = requests.get(url, timeout=self.timeout)
            return response.status_code == 200
        except:
            return False

    def run_health_check(self):
        """주기적 헬스 체크"""
        while True:
            time.sleep(self.interval)

            with self.lock:
                for backend in self.backends:
                    is_healthy = self.check_backend(backend)
                    host, port = backend

                    if is_healthy:
                        if backend not in self.healthy_backends:
                            print(f"✅ 백엔드 복구: {host}:{port}")
                            self.healthy_backends.add(backend)
                    else:
                        if backend in self.healthy_backends:
                            print(f"❌ 백엔드 다운: {host}:{port}")
                            self.healthy_backends.remove(backend)

                print(f"헬스 체크 완료: {len(self.healthy_backends)}/{len(self.backends)} 정상")

    def get_healthy_backends(self):
        """정상 백엔드 목록 반환"""
        with self.lock:
            return list(self.healthy_backends)

    def start(self):
        """헬스 체크 시작 (백그라운드 스레드)"""
        thread = threading.Thread(target=self.run_health_check)
        thread.daemon = True
        thread.start()

# 로드 밸런서에 통합
class LoadBalancerWithHealthCheck(LoadBalancer):
    def __init__(self, backends):
        super().__init__(backends)
        self.health_check = HealthCheck(backends)
        self.health_check.start()

    def get_next_backend(self):
        """정상 백엔드 중에서 선택"""
        healthy_backends = self.health_check.get_healthy_backends()

        if not healthy_backends:
            raise Exception("모든 백엔드 서버가 다운되었습니다")

        # Round Robin
        with self.lock:
            backend = healthy_backends[self.current % len(healthy_backends)]
            self.current += 1
            return backend
```

### Passive Health Check (수동적 헬스 체크)

```python
class PassiveHealthCheck:
    def __init__(self, backends, max_failures=3):
        """
        max_failures: 연속 실패 횟수 임계값
        """
        self.backends = backends
        self.max_failures = max_failures
        self.failures = {backend: 0 for backend in backends}
        self.healthy_backends = set(backends)
        self.lock = threading.Lock()

    def record_success(self, backend):
        """성공 기록"""
        with self.lock:
            self.failures[backend] = 0
            if backend not in self.healthy_backends:
                print(f"✅ 백엔드 복구: {backend}")
                self.healthy_backends.add(backend)

    def record_failure(self, backend):
        """실패 기록"""
        with self.lock:
            self.failures[backend] += 1

            if self.failures[backend] >= self.max_failures:
                if backend in self.healthy_backends:
                    print(f"❌ 백엔드 다운: {backend} (연속 {self.failures[backend]}회 실패)")
                    self.healthy_backends.remove(backend)

    def get_healthy_backends(self):
        """정상 백엔드 목록"""
        with self.lock:
            return list(self.healthy_backends)

# 로드 밸런서에 통합
class LoadBalancerWithPassiveHealthCheck(LoadBalancer):
    def __init__(self, backends):
        super().__init__(backends)
        self.health_check = PassiveHealthCheck(backends)

    def handle_client(self, client_socket, client_address):
        """클라이언트 요청 처리 (헬스 체크 포함)"""
        backend = None
        try:
            request = client_socket.recv(4096)
            if not request:
                return

            # 정상 백엔드 선택
            healthy_backends = self.health_check.get_healthy_backends()
            if not healthy_backends:
                raise Exception("모든 백엔드 다운")

            backend = healthy_backends[0]  # 단순화
            backend_host, backend_port = backend

            backend_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            backend_socket.connect((backend_host, backend_port))
            backend_socket.sendall(request)

            while True:
                response = backend_socket.recv(4096)
                if not response:
                    break
                client_socket.sendall(response)

            backend_socket.close()

            # 성공 기록
            self.health_check.record_success(backend)
        except Exception as e:
            print(f"에러: {e}")
            if backend:
                # 실패 기록
                self.health_check.record_failure(backend)
        finally:
            client_socket.close()
```

---

## 🍪 Phase 4: Sticky Session (세션 유지)

### Cookie 기반 Sticky Session

```python
import re

class StickySessionLB(LoadBalancer):
    def __init__(self, backends):
        super().__init__(backends)
        self.sessions = {}  # session_id → backend

    def extract_session_id(self, request):
        """Cookie에서 세션 ID 추출"""
        match = re.search(rb'Cookie:.*SESSION_ID=([a-zA-Z0-9]+)', request)
        if match:
            return match.group(1).decode('utf-8')
        return None

    def generate_session_id(self):
        """세션 ID 생성"""
        import uuid
        return str(uuid.uuid4())

    def handle_client(self, client_socket, client_address):
        """Sticky Session 지원"""
        try:
            request = client_socket.recv(4096)
            if not request:
                return

            # 세션 ID 확인
            session_id = self.extract_session_id(request)

            if session_id and session_id in self.sessions:
                # 기존 세션 → 같은 백엔드
                backend = self.sessions[session_id]
                print(f"세션 유지: {session_id} → {backend}")
            else:
                # 새 세션 → 라운드 로빈
                backend = self.get_next_backend()
                session_id = self.generate_session_id()
                self.sessions[session_id] = backend
                print(f"새 세션: {session_id} → {backend}")

            backend_host, backend_port = backend

            # 백엔드 연결
            backend_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            backend_socket.connect((backend_host, backend_port))
            backend_socket.sendall(request)

            # 응답 수신
            response = b''
            while True:
                chunk = backend_socket.recv(4096)
                if not chunk:
                    break
                response += chunk

            # Set-Cookie 헤더 추가
            if b'Set-Cookie' not in response:
                response = response.replace(
                    b'\r\n\r\n',
                    f'\r\nSet-Cookie: SESSION_ID={session_id}; Path=/\r\n\r\n'.encode()
                )

            client_socket.sendall(response)
            backend_socket.close()
        except Exception as e:
            print(f"에러: {e}")
        finally:
            client_socket.close()
```

---

## 📊 통계 및 모니터링

### 통계 수집

```python
import time
from collections import defaultdict

class LoadBalancerStats:
    def __init__(self):
        self.total_requests = 0
        self.backend_requests = defaultdict(int)
        self.backend_errors = defaultdict(int)
        self.start_time = time.time()
        self.lock = threading.Lock()

    def record_request(self, backend, success=True):
        """요청 기록"""
        with self.lock:
            self.total_requests += 1
            self.backend_requests[backend] += 1

            if not success:
                self.backend_errors[backend] += 1

    def print_stats(self):
        """통계 출력"""
        with self.lock:
            uptime = time.time() - self.start_time
            rps = self.total_requests / uptime if uptime > 0 else 0

            print("\n=== 로드 밸런서 통계 ===")
            print(f"가동 시간: {uptime:.0f}초")
            print(f"총 요청: {self.total_requests}")
            print(f"RPS: {rps:.2f}")
            print("\n백엔드별 통계:")

            for backend in sorted(self.backend_requests.keys()):
                requests = self.backend_requests[backend]
                errors = self.backend_errors[backend]
                error_rate = (errors / requests * 100) if requests > 0 else 0

                print(f"  {backend[0]}:{backend[1]}")
                print(f"    요청: {requests}")
                print(f"    에러: {errors} ({error_rate:.2f}%)")

# 주기적으로 통계 출력
def print_stats_periodically(stats):
    while True:
        time.sleep(30)  # 30초마다
        stats.print_stats()

stats = LoadBalancerStats()
stats_thread = threading.Thread(target=print_stats_periodically, args=(stats,))
stats_thread.daemon = True
stats_thread.start()
```

---

## 🎯 체크리스트

- [ ] Round Robin 알고리즘을 구현할 수 있다
- [ ] Weighted Round Robin을 구현할 수 있다
- [ ] Least Connections 알고리즘을 구현할 수 있다
- [ ] IP Hash로 세션 유지를 구현할 수 있다
- [ ] Active Health Check를 구현할 수 있다
- [ ] Passive Health Check를 구현할 수 있다
- [ ] Cookie 기반 Sticky Session을 구현할 수 있다
- [ ] 로드 밸런서 통계를 수집하고 출력할 수 있다

## 🔗 다음 학습

- [05-DNS-Resolver.md](./05-DNS-Resolver.md) - DNS 리졸버 구현
- [03-Simple-Proxy.md](./03-Simple-Proxy.md) - 프록시 서버와의 차이

---

**"로드 밸런서는 가용성의 핵심. 단일 장애 지점을 제거하라."**
