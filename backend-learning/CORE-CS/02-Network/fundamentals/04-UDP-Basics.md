# UDP Basics - UDP 기초

> "빠르지만 신뢰할 수 없는 전송"

## 🎯 학습 목표

- **UDP의 특징** 이해
- **TCP vs UDP 사용 시기** 판단
- **UDP 사용 사례** 파악

## 📚 UDP란?

**User Datagram Protocol**
- 비연결 지향 (Connectionless)
- 신뢰성 미보장 (Unreliable)
- 순서 미보장 (Unordered)
- 빠른 전송 (Fast)

## 🔍 UDP의 특징

### 1. 비연결 지향

```
연결 수립 없음 ✅
  ↓
바로 데이터 전송
  ↓
연결 종료 없음 ✅
```

### 2. 신뢰성 미보장

```
송신: 데이터 전송 → 끝!
수신: 받았는지 모름
송신: 재전송 안 함

패킷 손실 가능!
```

### 3. 빠른 전송

```
오버헤드 최소
재전송 없음
순서 체크 없음

→ 빠름! ⚡
```

## 📊 UDP 헤더 구조

```
 0                   15                  31
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Source Port      |  Dest Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Length           |  Checksum         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|             Data                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

헤더 크기: 8바이트 (TCP: 20바이트)
```

## 💡 UDP 사용 사례

### 1. DNS (Domain Name System)

```
빠른 응답 필요
패킷 손실 시 재요청

dig google.com  # UDP 53번 포트
```

### 2. 실시간 스트리밍

```
영상/음성 스트리밍
- 약간의 손실 허용
- 빠른 전송이 중요

YouTube Live, Zoom
```

### 3. 온라인 게임

```
실시간 위치 정보
- 최신 정보가 중요
- 이전 패킷은 버려도 됨

LOL, 오버워치
```

### 4. IoT 센서

```
센서 데이터 전송
- 주기적 전송
- 일부 손실 허용
```

## ⚖️ TCP vs UDP 선택

### TCP를 선택할 때

```
✅ 신뢰성이 중요
✅ 순서가 중요
✅ 데이터 무결성

예: HTTP, FTP, Email
```

### UDP를 선택할 때

```
✅ 속도가 중요
✅ 약간의 손실 허용
✅ 실시간성 중요

예: 스트리밍, 게임, DNS
```

## 💻 실습

### UDP 소켓 프로그래밍

```python
# UDP 서버
import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server_socket.bind(('0.0.0.0', 9999))

while True:
    data, addr = server_socket.recvfrom(1024)
    print(f"Received from {addr}: {data}")

# UDP 클라이언트
client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
client_socket.sendto(b"Hello", ('localhost', 9999))
```

## 🔗 다음 학습

- [05-HTTP-Basics.md](./05-HTTP-Basics.md)

---

**"UDP는 빠르지만 책임은 애플리케이션이"**
