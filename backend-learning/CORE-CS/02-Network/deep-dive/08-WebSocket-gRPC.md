# WebSocket & gRPC - 실시간 통신

> "HTTP를 넘어서: 양방향 통신과 고성능 RPC"

## 🎯 학습 목표

- **WebSocket의 동작 원리**와 사용 사례 이해
- **gRPC의 특징**과 Protobuf 메커니즘 파악
- **HTTP vs WebSocket vs gRPC** 비교
- **실무에서 실시간 통신** 구현 방법 습득

## 📚 실시간 통신의 필요성

### HTTP의 한계

```
HTTP 요청-응답 모델:
클라이언트 → 요청 → 서버
클라이언트 ← 응답 ← 서버

문제점:
1. 단방향 (클라이언트만 요청 가능)
2. 서버가 클라이언트에게 먼저 푸시 불가
3. 실시간 데이터 전송 비효율

채팅 앱 예시:
클라이언트: "새 메시지 있어?" (매 1초마다 폴링)
서버: "없어요" (99% 경우)
→ 낭비! 😱
```

### 해결책

```
1. WebSocket:
   - 양방향 통신
   - 지속 연결
   - 낮은 지연

2. gRPC:
   - HTTP/2 기반
   - 스트리밍 지원
   - 고성능 RPC
```

## 🔌 WebSocket

### WebSocket이란?

```
HTTP → 단방향, 요청-응답
WebSocket → 양방향, 지속 연결

┌──────────────────────────────────┐
│  클라이언트    ↔    서버         │
│  (브라우저)         (Node.js)     │
│                                   │
│  실시간 양방향 통신 ⚡           │
└──────────────────────────────────┘
```

### WebSocket 핸드셰이크

**1. HTTP로 시작 (Upgrade)**:
```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

**2. 서버 응답 (101 Switching Protocols)**:
```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

**3. WebSocket 연결 수립**:
```
HTTP 연결 → WebSocket 연결로 전환
이후 HTTP 헤더 없이 데이터 프레임만 전송! ⚡
```

### WebSocket 프레임 구조

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+

Opcode:
- 0x1: Text frame (텍스트)
- 0x2: Binary frame (바이너리)
- 0x8: Close frame (연결 종료)
- 0x9: Ping (핑)
- 0xA: Pong (퐁)
```

### WebSocket 구현 (JavaScript)

**클라이언트 (브라우저)**:
```javascript
// WebSocket 연결
const ws = new WebSocket('ws://example.com/chat');

// 연결 성공
ws.onopen = () => {
  console.log('WebSocket 연결 성공!');
  ws.send('Hello, Server!');
};

// 메시지 수신
ws.onmessage = (event) => {
  console.log('서버로부터:', event.data);
};

// 에러
ws.onerror = (error) => {
  console.error('WebSocket 에러:', error);
};

// 연결 종료
ws.onclose = () => {
  console.log('WebSocket 연결 종료');
};

// 메시지 전송
ws.send('안녕하세요!');
ws.send(JSON.stringify({ type: 'chat', message: '채팅 메시지' }));
```

**서버 (Node.js - ws 라이브러리)**:
```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// 연결된 클라이언트 목록
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('새 클라이언트 연결');
  clients.add(ws);

  // 메시지 수신
  ws.on('message', (message) => {
    console.log('받은 메시지:', message);

    // 모든 클라이언트에게 브로드캐스트
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // 연결 종료
  ws.on('close', () => {
    console.log('클라이언트 연결 종료');
    clients.delete(ws);
  });

  // 에러
  ws.on('error', (error) => {
    console.error('WebSocket 에러:', error);
  });

  // 환영 메시지 전송
  ws.send('서버에 오신 것을 환영합니다!');
});

console.log('WebSocket 서버가 포트 8080에서 실행 중...');
```

**서버 (Python - websockets)**:
```python
import asyncio
import websockets

# 연결된 클라이언트
connected = set()

async def handler(websocket, path):
    # 클라이언트 추가
    connected.add(websocket)
    try:
        # 환영 메시지
        await websocket.send("서버에 오신 것을 환영합니다!")

        # 메시지 수신 루프
        async for message in websocket:
            print(f"받은 메시지: {message}")

            # 모든 클라이언트에게 브로드캐스트
            websockets.broadcast(connected, message)
    finally:
        # 클라이언트 제거
        connected.remove(websocket)

# 서버 시작
start_server = websockets.serve(handler, "localhost", 8080)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
```

### WebSocket 사용 사례

```
✅ 실시간 채팅 (Slack, Discord)
✅ 실시간 알림 (Facebook, Twitter)
✅ 협업 툴 (Google Docs, Figma)
✅ 주식/암호화폐 실시간 가격 (업비트, 빗썸)
✅ 멀티플레이어 게임
✅ IoT 디바이스 모니터링
```

### WebSocket vs HTTP Polling

**HTTP Polling (비효율)**:
```
클라이언트 → 요청 (1초마다)
서버 → 응답 "데이터 없음"
클라이언트 → 요청
서버 → 응답 "데이터 없음"
...
서버 → 응답 "새 데이터!" (100번째)

낭비: 99번의 불필요한 요청 😱
```

**WebSocket (효율)**:
```
클라이언트 ↔ 서버 (연결 유지)
(대기...)
서버 → 푸시 "새 데이터!"

낭비 없음! ✅
```

**성능 비교**:
```
HTTP Polling:
- 요청 수: 100개/분 (1초마다)
- 대역폭: 10KB/요청 × 100 = 1MB/분

WebSocket:
- 요청 수: 1개 (연결 1번)
- 대역폭: 실제 데이터만 전송 (1KB/분)

→ 대역폭 절감: 99% ⚡
```

---

## 🚀 gRPC

### gRPC란?

```
gRPC = Google Remote Procedure Call

특징:
- HTTP/2 기반 (Multiplexing, 스트리밍)
- Protobuf (Protocol Buffers) 사용 (바이너리 직렬화)
- 양방향 스트리밍 지원
- 다양한 언어 지원 (Go, Java, Python, Node.js, ...)

서버 RPC 호출이 마치 로컬 함수 호출처럼 느껴짐!
```

### gRPC vs REST

```
┌─────────────────┬──────────────┬──────────────┐
│ Feature         │ REST (HTTP)  │ gRPC         │
├─────────────────┼──────────────┼──────────────┤
│ 프로토콜        │ HTTP/1.1     │ HTTP/2       │
│ 직렬화          │ JSON (텍스트)│ Protobuf     │
│ 스트리밍        │ ❌           │ ✅           │
│ 브라우저 지원   │ ✅           │ ❌ (제한적)  │
│ 성능            │ 중간         │ 빠름 ⚡      │
│ 가독성          │ 높음         │ 낮음         │
│ 스키마 정의     │ 선택         │ 필수 (.proto)│
│ 사용 사례       │ 공개 API     │ 내부 서비스  │
└─────────────────┴──────────────┴──────────────┘
```

### Protobuf (Protocol Buffers)

**정의 (.proto 파일)**:
```protobuf
syntax = "proto3";

package user;

// 메시지 정의
message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  repeated string roles = 4;
}

message GetUserRequest {
  int32 id = 1;
}

message GetUserResponse {
  User user = 1;
}

// 서비스 정의
service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ListUsers(Empty) returns (stream User);  // 서버 스트리밍
  rpc CreateUser(stream User) returns (CreateUserResponse);  // 클라이언트 스트리밍
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);  // 양방향 스트리밍
}
```

**JSON vs Protobuf 비교**:
```
JSON (텍스트):
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com"
}
크기: 60 bytes

Protobuf (바이너리):
[08 7B 12 05 41 6C 69 63 65 1A 13 61 6C 69 63 65 40 65 78 61 6D 70 6C 65 2E 63 6F 6D]
크기: 28 bytes

절감: 53% ⚡
```

### gRPC 통신 방식

#### 1. Unary RPC (단일 요청-응답)

```
클라이언트 → [요청] → 서버
클라이언트 ← [응답] ← 서버

일반 REST API와 유사
```

**예시**:
```protobuf
service UserService {
  rpc GetUser(GetUserRequest) returns (User);
}
```

---

#### 2. Server Streaming (서버 스트리밍)

```
클라이언트 → [요청] → 서버
클라이언트 ← [응답 1] ← 서버
클라이언트 ← [응답 2] ← 서버
클라이언트 ← [응답 3] ← 서버
...

서버가 여러 응답을 스트리밍
```

**예시**:
```protobuf
service LogService {
  rpc StreamLogs(Empty) returns (stream LogEntry);
}
```

**사용 사례**:
```
✅ 실시간 로그 모니터링
✅ 주식 가격 스트리밍
✅ 대용량 파일 다운로드
```

---

#### 3. Client Streaming (클라이언트 스트리밍)

```
클라이언트 → [요청 1] → 서버
클라이언트 → [요청 2] → 서버
클라이언트 → [요청 3] → 서버
...
클라이언트 ← [응답] ← 서버 (모두 받은 후)

클라이언트가 여러 요청을 스트리밍
```

**예시**:
```protobuf
service FileService {
  rpc UploadFile(stream FileChunk) returns (UploadResponse);
}
```

**사용 사례**:
```
✅ 대용량 파일 업로드
✅ 배치 데이터 전송
✅ IoT 센서 데이터 수집
```

---

#### 4. Bidirectional Streaming (양방향 스트리밍)

```
클라이언트 → [요청 1] → 서버
클라이언트 ← [응답 1] ← 서버
클라이언트 → [요청 2] → 서버
클라이언트 ← [응답 2] ← 서버
...

양쪽이 동시에 스트리밍
```

**예시**:
```protobuf
service ChatService {
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}
```

**사용 사례**:
```
✅ 실시간 채팅
✅ 게임 서버
✅ 협업 툴
```

---

### gRPC 구현 (Node.js)

**1. .proto 파일 정의**:
```protobuf
// user.proto
syntax = "proto3";

package user;

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}

message GetUserRequest {
  int32 id = 1;
}

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(Empty) returns (stream User);
}

message Empty {}
```

**2. gRPC 서버 (Node.js)**:
```javascript
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// .proto 파일 로드
const packageDefinition = protoLoader.loadSync('user.proto');
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// 서비스 구현
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

function getUser(call, callback) {
  const user = users.find(u => u.id === call.request.id);
  if (user) {
    callback(null, user);
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      details: 'User not found'
    });
  }
}

function listUsers(call) {
  users.forEach(user => {
    call.write(user);  // 스트리밍
  });
  call.end();
}

// gRPC 서버 시작
const server = new grpc.Server();
server.addService(userProto.UserService.service, {
  getUser: getUser,
  listUsers: listUsers
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('gRPC 서버가 포트 50051에서 실행 중...');
  server.start();
});
```

**3. gRPC 클라이언트 (Node.js)**:
```javascript
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('user.proto');
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// 클라이언트 생성
const client = new userProto.UserService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Unary RPC
client.getUser({ id: 1 }, (error, user) => {
  if (error) {
    console.error('에러:', error);
  } else {
    console.log('사용자:', user);
    // 출력: { id: 1, name: 'Alice', email: 'alice@example.com' }
  }
});

// Server Streaming RPC
const call = client.listUsers({});
call.on('data', (user) => {
  console.log('사용자:', user);
});
call.on('end', () => {
  console.log('스트리밍 종료');
});
call.on('error', (error) => {
  console.error('에러:', error);
});
```

### gRPC 구현 (Python)

**서버**:
```python
import grpc
from concurrent import futures
import user_pb2
import user_pb2_grpc

class UserService(user_pb2_grpc.UserServiceServicer):
    def GetUser(self, request, context):
        # Unary RPC
        return user_pb2.User(
            id=request.id,
            name="Alice",
            email="alice@example.com"
        )

    def ListUsers(self, request, context):
        # Server Streaming RPC
        users = [
            user_pb2.User(id=1, name="Alice", email="alice@example.com"),
            user_pb2.User(id=2, name="Bob", email="bob@example.com")
        ]
        for user in users:
            yield user

# 서버 시작
server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
user_pb2_grpc.add_UserServiceServicer_to_server(UserService(), server)
server.add_insecure_port('[::]:50051')
server.start()
print("gRPC 서버가 포트 50051에서 실행 중...")
server.wait_for_termination()
```

**클라이언트**:
```python
import grpc
import user_pb2
import user_pb2_grpc

# 채널 생성
channel = grpc.insecure_channel('localhost:50051')
stub = user_pb2_grpc.UserServiceStub(channel)

# Unary RPC
response = stub.GetUser(user_pb2.GetUserRequest(id=1))
print(f"사용자: {response.name}, {response.email}")

# Server Streaming RPC
for user in stub.ListUsers(user_pb2.Empty()):
    print(f"사용자: {user.name}, {user.email}")
```

---

## 📊 기술 비교

### HTTP REST vs WebSocket vs gRPC

```
┌────────────────┬─────────────┬─────────────┬─────────────┐
│ Feature        │ HTTP REST   │ WebSocket   │ gRPC        │
├────────────────┼─────────────┼─────────────┼─────────────┤
│ 통신 방향      │ 단방향      │ 양방향      │ 양방향      │
│ 프로토콜       │ HTTP/1.1    │ WS (HTTP→WS)│ HTTP/2      │
│ 직렬화         │ JSON        │ 자유 (JSON) │ Protobuf    │
│ 지속 연결      │ ❌          │ ✅          │ ✅          │
│ 스트리밍       │ ❌          │ ✅          │ ✅          │
│ 브라우저 지원  │ ✅          │ ✅          │ ❌ (제한적) │
│ 성능           │ 중간        │ 빠름        │ 매우 빠름 ⚡│
│ 오버헤드       │ 높음 (헤더) │ 낮음        │ 매우 낮음   │
│ 사용 사례      │ 일반 API    │ 실시간 통신 │ 마이크로    │
│                │             │             │ 서비스      │
└────────────────┴─────────────┴─────────────┴─────────────┘
```

### 선택 가이드

**HTTP REST**:
```
✅ 공개 API (외부 개발자 사용)
✅ 간단한 CRUD
✅ 브라우저 직접 호출
✅ 캐싱 필요

예: GitHub API, Twitter API
```

**WebSocket**:
```
✅ 실시간 양방향 통신 (브라우저 ↔ 서버)
✅ 낮은 지연 중요
✅ 지속적인 데이터 스트림

예: 채팅, 알림, 게임, 협업 툴
```

**gRPC**:
```
✅ 마이크로서비스 간 통신
✅ 고성능 요구 (내부 API)
✅ 스트리밍 필요
✅ 타입 안정성 중요

예: Netflix, Uber 내부 서비스
```

---

## 🛠️ 실무 팁

### WebSocket 최적화

**1. Reconnection (재연결)**:
```javascript
class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.reconnectInterval = 1000;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('연결 성공');
      this.reconnectInterval = 1000;  // 리셋
    };

    this.ws.onclose = () => {
      console.log('연결 종료, 재연결 시도...');
      setTimeout(() => {
        this.reconnectInterval *= 2;  // Exponential Backoff
        this.connect();
      }, this.reconnectInterval);
    };

    this.ws.onerror = (error) => {
      console.error('에러:', error);
      this.ws.close();
    };
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      console.warn('연결되지 않음');
    }
  }
}
```

**2. Heartbeat (연결 유지)**:
```javascript
// 서버
setInterval(() => {
  clients.forEach((client) => {
    if (client.isAlive === false) {
      return client.terminate();  // 응답 없으면 종료
    }
    client.isAlive = false;
    client.ping();  // Ping 전송
  });
}, 30000);  // 30초마다

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;  // Pong 받으면 살아있음
  });
});
```

### gRPC 최적화

**1. Connection Pooling**:
```javascript
// 연결 재사용
const channelOptions = {
  'grpc.keepalive_time_ms': 10000,
  'grpc.keepalive_timeout_ms': 5000,
  'grpc.http2.max_pings_without_data': 0,
  'grpc.keepalive_permit_without_calls': 1
};

const client = new userProto.UserService(
  'localhost:50051',
  grpc.credentials.createInsecure(),
  channelOptions
);
```

**2. 타임아웃 설정**:
```javascript
client.getUser({ id: 1 }, { deadline: Date.now() + 5000 }, (error, user) => {
  // 5초 타임아웃
});
```

---

## 🎯 체크리스트

- [ ] WebSocket 핸드셰이크 과정을 설명할 수 있다
- [ ] WebSocket과 HTTP Polling의 차이를 이해한다
- [ ] gRPC의 4가지 통신 방식을 구분할 수 있다
- [ ] Protobuf의 장점을 설명할 수 있다
- [ ] HTTP REST vs WebSocket vs gRPC 선택 기준을 안다
- [ ] 실무에서 실시간 통신을 구현할 수 있다

## 🔗 다음 학습

- [04-HTTP-Versions.md](./04-HTTP-Versions.md) - HTTP/2와 gRPC
- [07-Load-Balancing.md](./07-Load-Balancing.md) - WebSocket 로드 밸런싱

---

**"실시간 통신은 선택이 아닌 필수. 사용자는 즉각적인 반응을 기대한다."**
