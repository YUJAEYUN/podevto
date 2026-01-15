# 실습 프로젝트 가이드

> "이론을 실전으로 연결하는 프로젝트들"

## 🎯 프로젝트 철학

### "원원원 원칙" (회고 문서에서)
```
1. 단 한 명의 사용자 (본인)
2. 단 하나의 핵심 문제
3. 단 하나의 익숙한 기술
```

### 목표
- **이론을 코드로 구현**하며 깊이 이해
- **실제 동작하는 시스템** 만들기
- **포트폴리오**로 활용 가능한 결과물

## 📂 프로젝트 목록

### 1. Database 프로젝트

#### Project 1-1: Simple Key-Value Store
**난이도**: ⭐⭐☆☆☆
**기간**: 3~5일
**학습 목표**: 데이터베이스 기본 동작 원리 이해

**핵심 기능**:
```python
store = SimpleKV()
store.put("key1", "value1")  # 저장
value = store.get("key1")    # 조회
store.delete("key1")         # 삭제
```

**구현 단계**:

1. **Phase 1: In-Memory (1일)**
```python
class SimpleKV:
    def __init__(self):
        self.data = {}

    def put(self, key, value):
        self.data[key] = value

    def get(self, key):
        return self.data.get(key)

    def delete(self, key):
        if key in self.data:
            del self.data[key]
```

2. **Phase 2: Disk Persistence (2일)**
```python
import json
import os

class SimpleKV:
    def __init__(self, db_file="data.db"):
        self.db_file = db_file
        self.data = self._load_from_disk()

    def _load_from_disk(self):
        if os.path.exists(self.db_file):
            with open(self.db_file, 'r') as f:
                return json.load(f)
        return {}

    def _save_to_disk(self):
        with open(self.db_file, 'w') as f:
            json.dump(self.data, f)

    def put(self, key, value):
        self.data[key] = value
        self._save_to_disk()  # Write-Through

    def get(self, key):
        return self.data.get(key)
```

3. **Phase 3: Write-Ahead Log (WAL) (2일)**
```python
class SimpleKV:
    def __init__(self, db_file="data.db", wal_file="wal.log"):
        self.db_file = db_file
        self.wal_file = wal_file
        self.data = {}
        self._replay_wal()  # 복구

    def _write_wal(self, operation, key, value=None):
        with open(self.wal_file, 'a') as f:
            log_entry = {
                'op': operation,
                'key': key,
                'value': value,
                'timestamp': time.time()
            }
            f.write(json.dumps(log_entry) + '\n')

    def _replay_wal(self):
        """크래시 복구: WAL 재적용"""
        if not os.path.exists(self.wal_file):
            return

        with open(self.wal_file, 'r') as f:
            for line in f:
                entry = json.loads(line)
                if entry['op'] == 'PUT':
                    self.data[entry['key']] = entry['value']
                elif entry['op'] == 'DELETE':
                    self.data.pop(entry['key'], None)

    def put(self, key, value):
        self._write_wal('PUT', key, value)  # WAL 먼저
        self.data[key] = value
        # 주기적으로 디스크에 flush
```

**심화 기능**:
- LSM-Tree 구조 구현 (Memtable + SSTable)
- Compaction (병합)
- Bloom Filter (존재 여부 빠르게 확인)

**배우는 것**:
- WAL의 역할 (Durability)
- 크래시 복구 메커니즘
- Write-Through vs Write-Back

---

#### Project 1-2: SQL Parser
**난이도**: ⭐⭐⭐☆☆
**기간**: 5~7일
**학습 목표**: SQL 파싱과 실행 계획 이해

**핵심 기능**:
```python
parser = SQLParser()
query = "SELECT name, age FROM users WHERE age > 20"
ast = parser.parse(query)
# Abstract Syntax Tree:
# {
#   'type': 'SELECT',
#   'columns': ['name', 'age'],
#   'table': 'users',
#   'where': {'column': 'age', 'op': '>', 'value': 20}
# }
```

**구현 단계**:

1. **Phase 1: Tokenizer (2일)**
```python
import re

class Tokenizer:
    def tokenize(self, query):
        # SQL을 토큰으로 분리
        tokens = []
        patterns = [
            ('SELECT', r'\bSELECT\b'),
            ('FROM', r'\bFROM\b'),
            ('WHERE', r'\bWHERE\b'),
            ('IDENTIFIER', r'\b[a-zA-Z_][a-zA-Z0-9_]*\b'),
            ('NUMBER', r'\d+'),
            ('STRING', r"'[^']*'"),
            ('OPERATOR', r'[><=!]+'),
            ('COMMA', r','),
        ]

        for match in re.finditer('|'.join(f'(?P<{name}>{pattern})'
                                  for name, pattern in patterns), query):
            token_type = match.lastgroup
            token_value = match.group()
            tokens.append((token_type, token_value))

        return tokens
```

2. **Phase 2: Parser (3일)**
```python
class SQLParser:
    def __init__(self):
        self.tokens = []
        self.pos = 0

    def parse(self, query):
        tokenizer = Tokenizer()
        self.tokens = tokenizer.tokenize(query)
        self.pos = 0

        return self._parse_select()

    def _parse_select(self):
        self._expect('SELECT')
        columns = self._parse_columns()
        self._expect('FROM')
        table = self._expect('IDENTIFIER')

        where_clause = None
        if self._peek() == 'WHERE':
            self._expect('WHERE')
            where_clause = self._parse_where()

        return {
            'type': 'SELECT',
            'columns': columns,
            'table': table,
            'where': where_clause
        }

    def _parse_columns(self):
        columns = []
        columns.append(self._expect('IDENTIFIER'))

        while self._peek() == 'COMMA':
            self._expect('COMMA')
            columns.append(self._expect('IDENTIFIER'))

        return columns

    def _expect(self, token_type):
        if self.pos >= len(self.tokens):
            raise SyntaxError(f"Expected {token_type}, got EOF")

        token = self.tokens[self.pos]
        if token[0] != token_type:
            raise SyntaxError(f"Expected {token_type}, got {token[0]}")

        self.pos += 1
        return token[1]

    def _peek(self):
        if self.pos >= len(self.tokens):
            return None
        return self.tokens[self.pos][0]
```

3. **Phase 3: Simple Executor (2일)**
```python
class SQLExecutor:
    def __init__(self, data):
        self.data = data  # {'users': [{'name': 'Alice', 'age': 25}, ...]}

    def execute(self, ast):
        if ast['type'] == 'SELECT':
            return self._execute_select(ast)

    def _execute_select(self, ast):
        table_name = ast['table']
        rows = self.data[table_name]

        # WHERE 필터링
        if ast['where']:
            rows = [row for row in rows
                    if self._evaluate_where(row, ast['where'])]

        # 컬럼 선택
        if ast['columns'] == ['*']:
            return rows
        else:
            return [{col: row[col] for col in ast['columns']}
                    for row in rows]

    def _evaluate_where(self, row, where):
        column = where['column']
        op = where['op']
        value = where['value']

        if op == '>':
            return row[column] > value
        elif op == '<':
            return row[column] < value
        elif op == '=':
            return row[column] == value
        # ... 더 많은 연산자
```

**배우는 것**:
- 파서의 동작 원리
- AST (Abstract Syntax Tree)
- SQL 실행 과정

---

#### Project 1-3: N+1 Query Detector
**난이도**: ⭐⭐☆☆☆
**기간**: 2~3일
**학습 목표**: N+1 문제 감지 및 해결

**핵심 기능**:
```python
detector = NPlusOneDetector()

with detector.monitor():
    users = User.objects.all()
    for user in users:
        orders = user.orders.all()  # N+1 발생!

detector.report()
# Warning: Potential N+1 query detected
# Query: SELECT * FROM orders WHERE user_id = ?
# Executed 100 times (for 100 users)
# Suggestion: Use select_related() or prefetch_related()
```

**구현**:
```python
import time
from collections import defaultdict

class NPlusOneDetector:
    def __init__(self, threshold=10):
        self.threshold = threshold
        self.queries = defaultdict(int)
        self.enabled = False

    def monitor(self):
        return self

    def __enter__(self):
        self.enabled = True
        self.queries.clear()
        # Hook into DB query execution
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.enabled = False
        self._analyze()

    def log_query(self, query):
        if not self.enabled:
            return

        # 쿼리를 정규화 (파라미터 제거)
        normalized = self._normalize_query(query)
        self.queries[normalized] += 1

    def _normalize_query(self, query):
        # SELECT * FROM users WHERE id = 123
        # → SELECT * FROM users WHERE id = ?
        import re
        query = re.sub(r'\d+', '?', query)
        query = re.sub(r"'[^']*'", '?', query)
        return query

    def _analyze(self):
        for query, count in self.queries.items():
            if count > self.threshold:
                print(f"⚠️ Potential N+1 query detected:")
                print(f"  Query: {query}")
                print(f"  Executed {count} times")
                print(f"  Suggestion: Use JOIN or batch loading")
```

**배우는 것**:
- N+1 문제의 원인
- 쿼리 로그 분석
- 성능 모니터링

---

### 2. Network 프로젝트

#### Project 2-1: HTTP Server from Scratch
**난이도**: ⭐⭐⭐☆☆
**기간**: 5~7일
**학습 목표**: HTTP 프로토콜 완벽 이해

**핵심 기능**:
```bash
python http_server.py

# 브라우저에서 http://localhost:8080 접속
# 또는
curl http://localhost:8080/api/users
```

**구현 단계**:

1. **Phase 1: TCP 서버 (1일)**
```python
import socket

class TCPServer:
    def __init__(self, host='0.0.0.0', port=8080):
        self.host = host
        self.port = port
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    def start(self):
        self.socket.bind((self.host, self.port))
        self.socket.listen(5)
        print(f"Server listening on {self.host}:{self.port}")

        while True:
            client_socket, addr = self.socket.accept()
            print(f"Connection from {addr}")
            self.handle_client(client_socket)

    def handle_client(self, client_socket):
        # 데이터 읽기
        data = client_socket.recv(4096)
        print(f"Received: {data.decode()}")

        # 응답 보내기
        response = b"Hello, TCP!"
        client_socket.send(response)
        client_socket.close()
```

2. **Phase 2: HTTP 요청 파싱 (2일)**
```python
class HTTPRequest:
    def __init__(self, raw_request):
        lines = raw_request.split('\r\n')
        # 첫 줄: GET /path HTTP/1.1
        request_line = lines[0].split(' ')
        self.method = request_line[0]
        self.path = request_line[1]
        self.version = request_line[2]

        # 헤더 파싱
        self.headers = {}
        for line in lines[1:]:
            if line == '':
                break
            key, value = line.split(': ', 1)
            self.headers[key] = value

class HTTPServer(TCPServer):
    def handle_client(self, client_socket):
        raw_request = client_socket.recv(4096).decode()
        request = HTTPRequest(raw_request)

        print(f"{request.method} {request.path}")

        response = self.handle_request(request)
        client_socket.send(response.encode())
        client_socket.close()

    def handle_request(self, request):
        if request.path == '/':
            return self.response_200('<h1>Hello, HTTP!</h1>')
        elif request.path == '/api/users':
            return self.response_json([
                {'id': 1, 'name': 'Alice'},
                {'id': 2, 'name': 'Bob'}
            ])
        else:
            return self.response_404()

    def response_200(self, body):
        return f"HTTP/1.1 200 OK\r\n" \
               f"Content-Type: text/html\r\n" \
               f"Content-Length: {len(body)}\r\n" \
               f"\r\n" \
               f"{body}"

    def response_json(self, data):
        import json
        body = json.dumps(data)
        return f"HTTP/1.1 200 OK\r\n" \
               f"Content-Type: application/json\r\n" \
               f"Content-Length: {len(body)}\r\n" \
               f"\r\n" \
               f"{body}"

    def response_404(self):
        body = "<h1>404 Not Found</h1>"
        return f"HTTP/1.1 404 Not Found\r\n" \
               f"Content-Type: text/html\r\n" \
               f"Content-Length: {len(body)}\r\n" \
               f"\r\n" \
               f"{body}"
```

3. **Phase 3: Routing + Multithreading (2~3일)**
```python
import threading

class HTTPServer:
    def __init__(self, host='0.0.0.0', port=8080):
        self.host = host
        self.port = port
        self.routes = {}
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    def route(self, path, method='GET'):
        def decorator(func):
            self.routes[(method, path)] = func
            return func
        return decorator

    def start(self):
        self.socket.bind((self.host, self.port))
        self.socket.listen(5)
        print(f"Server listening on {self.host}:{self.port}")

        while True:
            client_socket, addr = self.socket.accept()
            # 멀티쓰레드로 처리
            thread = threading.Thread(
                target=self.handle_client,
                args=(client_socket,)
            )
            thread.start()

    def handle_request(self, request):
        handler = self.routes.get((request.method, request.path))
        if handler:
            return handler(request)
        else:
            return self.response_404()

# 사용 예시
server = HTTPServer()

@server.route('/', method='GET')
def index(request):
    return server.response_200('<h1>Home Page</h1>')

@server.route('/api/users', method='GET')
def get_users(request):
    users = [{'id': 1, 'name': 'Alice'}]
    return server.response_json(users)

server.start()
```

**심화 기능**:
- POST 요청 Body 파싱
- Cookie 지원
- Keep-Alive 연결
- HTTPS (TLS) 지원

**배우는 것**:
- 소켓 프로그래밍
- HTTP 프로토콜 상세
- 멀티쓰레드 서버

---

#### Project 2-2: Simple Load Balancer
**난이도**: ⭐⭐⭐☆☆
**기간**: 3~5일
**학습 목표**: 로드밸런싱 전략 이해

**핵심 기능**:
```python
balancer = LoadBalancer([
    'http://server1:8080',
    'http://server2:8080',
    'http://server3:8080'
])

balancer.start()  # 8000 포트에서 리슨
```

**구현**:
```python
import socket
import requests
from enum import Enum

class Algorithm(Enum):
    ROUND_ROBIN = 1
    LEAST_CONNECTIONS = 2
    IP_HASH = 3

class LoadBalancer:
    def __init__(self, servers, algorithm=Algorithm.ROUND_ROBIN):
        self.servers = servers
        self.algorithm = algorithm
        self.current_index = 0
        self.connections = {server: 0 for server in servers}

    def select_server(self, client_ip=None):
        if self.algorithm == Algorithm.ROUND_ROBIN:
            server = self.servers[self.current_index]
            self.current_index = (self.current_index + 1) % len(self.servers)
            return server

        elif self.algorithm == Algorithm.LEAST_CONNECTIONS:
            return min(self.connections, key=self.connections.get)

        elif self.algorithm == Algorithm.IP_HASH:
            # 같은 IP는 항상 같은 서버로
            hash_value = hash(client_ip) % len(self.servers)
            return self.servers[hash_value]

    def proxy_request(self, client_socket, client_addr):
        # 클라이언트 요청 읽기
        request_data = client_socket.recv(4096)

        # 서버 선택
        server = self.select_server(client_addr[0])
        self.connections[server] += 1

        try:
            # 백엔드 서버로 요청 전달
            response = requests.request(
                method='GET',  # 파싱 필요
                url=server,
                headers={},  # 파싱 필요
                data=request_data
            )

            # 클라이언트에게 응답 전달
            client_socket.send(response.content)

        finally:
            self.connections[server] -= 1
            client_socket.close()

    def start(self, port=8000):
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.bind(('0.0.0.0', port))
        server_socket.listen(5)

        print(f"Load Balancer started on port {port}")
        print(f"Backend servers: {self.servers}")

        while True:
            client_socket, addr = server_socket.accept()
            thread = threading.Thread(
                target=self.proxy_request,
                args=(client_socket, addr)
            )
            thread.start()
```

**배우는 것**:
- 로드밸런싱 알고리즘
- 프록시 서버
- 헬스 체크

---

### 3. OS 프로젝트

#### Project 3-1: Simple Shell
**난이도**: ⭐⭐☆☆☆
**기간**: 3~5일
**학습 목표**: 프로세스 생성 및 제어

**핵심 기능**:
```bash
$ python myshell.py
myshell> ls -la
myshell> echo "Hello, World!"
myshell> cat file.txt | grep "pattern"
myshell> exit
```

**구현**:
```python
import os
import sys
import subprocess

class SimpleShell:
    def __init__(self):
        self.history = []

    def run(self):
        while True:
            try:
                command = input("myshell> ")
                if command.strip() == '':
                    continue

                self.history.append(command)

                if command == 'exit':
                    break
                elif command.startswith('cd '):
                    self.cmd_cd(command)
                elif '|' in command:
                    self.cmd_pipe(command)
                else:
                    self.cmd_execute(command)

            except KeyboardInterrupt:
                print()
            except EOFError:
                break

    def cmd_cd(self, command):
        path = command.split(' ', 1)[1]
        try:
            os.chdir(path)
        except FileNotFoundError:
            print(f"cd: {path}: No such file or directory")

    def cmd_pipe(self, command):
        commands = command.split('|')
        # 파이프 구현
        prev_stdout = None

        for cmd in commands:
            cmd = cmd.strip()
            args = cmd.split()

            stdin = prev_stdout if prev_stdout else None
            proc = subprocess.Popen(
                args,
                stdin=stdin,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            prev_stdout = proc.stdout

        # 마지막 프로세스의 출력
        output, error = proc.communicate()
        if output:
            print(output.decode())
        if error:
            print(error.decode(), file=sys.stderr)

    def cmd_execute(self, command):
        args = command.split()

        try:
            result = subprocess.run(
                args,
                capture_output=True,
                text=True
            )
            if result.stdout:
                print(result.stdout, end='')
            if result.stderr:
                print(result.stderr, end='', file=sys.stderr)

        except FileNotFoundError:
            print(f"{args[0]}: command not found")

if __name__ == '__main__':
    shell = SimpleShell()
    shell.run()
```

**배우는 것**:
- fork(), exec() 시스템 콜
- 파이프와 리다이렉션
- 프로세스 제어

---

#### Project 3-2: Thread Pool
**난이도**: ⭐⭐⭐☆☆
**기간**: 3~4일
**학습 목표**: 멀티쓰레딩과 동기화

**핵심 기능**:
```python
pool = ThreadPool(num_threads=4)

def task(x):
    return x * x

results = pool.map(task, range(100))
```

**구현**:
```python
import threading
from queue import Queue
import time

class ThreadPool:
    def __init__(self, num_threads=4):
        self.num_threads = num_threads
        self.task_queue = Queue()
        self.results = {}
        self.threads = []
        self.shutdown = False

        # 워커 쓰레드 생성
        for _ in range(num_threads):
            thread = threading.Thread(target=self._worker)
            thread.start()
            self.threads.append(thread)

    def _worker(self):
        while not self.shutdown:
            try:
                task_id, func, args = self.task_queue.get(timeout=1)
                result = func(*args)
                self.results[task_id] = result
                self.task_queue.task_done()
            except:
                continue

    def submit(self, func, *args):
        task_id = id((func, args))
        self.task_queue.put((task_id, func, args))
        return task_id

    def map(self, func, iterable):
        task_ids = []
        for item in iterable:
            task_id = self.submit(func, item)
            task_ids.append(task_id)

        # 모든 작업 완료 대기
        self.task_queue.join()

        # 결과 수집
        return [self.results[task_id] for task_id in task_ids]

    def close(self):
        self.shutdown = True
        for thread in self.threads:
            thread.join()
```

**배우는 것**:
- 쓰레드 풀 패턴
- 동기화 (Queue, Lock)
- Producer-Consumer 패턴

---

### 4. 알고리즘 프로젝트

#### Project 4-1: LRU Cache Library
**난이도**: ⭐⭐⭐☆☆
**기간**: 2~3일
**학습 목표**: HashMap + Doubly Linked List

**구현**:
```python
class Node:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}  # key -> Node
        self.head = Node(0, 0)  # Dummy head
        self.tail = Node(0, 0)  # Dummy tail
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key):
        if key not in self.cache:
            return -1

        node = self.cache[key]
        self._move_to_head(node)
        return node.value

    def put(self, key, value):
        if key in self.cache:
            # 이미 존재: 값 업데이트
            node = self.cache[key]
            node.value = value
            self._move_to_head(node)
        else:
            # 새로 추가
            node = Node(key, value)
            self.cache[key] = node
            self._add_to_head(node)

            if len(self.cache) > self.capacity:
                # 가장 오래된 항목 제거
                lru_node = self.tail.prev
                self._remove_node(lru_node)
                del self.cache[lru_node.key]

    def _add_to_head(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def _remove_node(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _move_to_head(self, node):
        self._remove_node(node)
        self._add_to_head(node)
```

**배우는 것**:
- LRU 알고리즘
- HashMap + Doubly Linked List
- O(1) 연산

---

## 🎯 프로젝트 선택 가이드

### 우선순위
1. **Database 프로젝트** (Key-Value Store) - 가장 먼저 추천
2. **Network 프로젝트** (HTTP Server) - 두 번째
3. **OS 프로젝트** (Thread Pool) - 세 번째
4. **알고리즘 프로젝트** (LRU Cache) - 병행

### 시간 배분
```
Week 3: Key-Value Store
Week 6: HTTP Server
Week 10: 본인이 선택한 프로젝트
```

---

**"이론을 코드로 구현할 때 진정한 이해가 시작된다"**
