# Packet Analyzer - Wireshark로 패킷 분석

> "네트워크를 눈으로 보기"

## 🎯 학습 목표

- **Wireshark 기본 사용법** 습득
- **TCP 3-Way Handshake** 실제 패킷으로 확인
- **HTTP 요청/응답** 패킷 분석
- **네트워크 문제 진단** 능력 향상

## 📚 준비물

### 설치

```bash
# macOS
brew install --cask wireshark

# Ubuntu
sudo apt install wireshark

# Windows
# https://www.wireshark.org/download.html
```

### tcpdump (대안)

```bash
# macOS/Linux
sudo tcpdump -i any -w capture.pcap port 80

# Wireshark로 열기
wireshark capture.pcap
```

---

## 🔍 실습 1: TCP 3-Way Handshake 분석

### 1단계: 패킷 캡처

```bash
# Wireshark 필터
tcp.port == 80 and tcp.flags

# 또는 tcpdump
sudo tcpdump -i any -nn 'tcp port 80 and (tcp[tcpflags] & (tcp-syn|tcp-ack) != 0)' -w handshake.pcap
```

### 2단계: HTTP 요청 생성

```bash
# 새 터미널에서
curl http://example.com
```

### 3단계: 패킷 분석

**패킷 #1: SYN (클라이언트 → 서버)**
```
Transmission Control Protocol
    Source Port: 54321
    Destination Port: 80
    Sequence Number: 0 (relative)
    Flags: 0x002 (SYN)
        .... ..1. = Syn: Set
    Window Size: 65535

의미:
- 클라이언트가 연결 요청
- 초기 Sequence Number: 0
- Window Size: 수신 가능한 버퍼 크기
```

**패킷 #2: SYN-ACK (서버 → 클라이언트)**
```
Transmission Control Protocol
    Source Port: 80
    Destination Port: 54321
    Sequence Number: 0 (relative)
    Acknowledgment Number: 1
    Flags: 0x012 (SYN, ACK)
        ...1 .... = Ack: Set
        .... ..1. = Syn: Set
    Window Size: 29200

의미:
- 서버가 연결 수락
- ACK = 1 (클라이언트의 SYN 확인)
- 서버의 초기 Sequence Number: 0
```

**패킷 #3: ACK (클라이언트 → 서버)**
```
Transmission Control Protocol
    Source Port: 54321
    Destination Port: 80
    Sequence Number: 1
    Acknowledgment Number: 1
    Flags: 0x010 (ACK)
        ...1 .... = Ack: Set

의미:
- 클라이언트가 서버의 SYN-ACK 확인
- 연결 수립 완료! ✅
```

### Wireshark 화면 분석

```
No.  Time     Source          Destination     Protocol Info
1    0.000000 192.168.1.10    93.184.216.34   TCP      54321 → 80 [SYN]
2    0.050000 93.184.216.34   192.168.1.10    TCP      80 → 54321 [SYN, ACK]
3    0.050100 192.168.1.10    93.184.216.34   TCP      54321 → 80 [ACK]
4    0.050200 192.168.1.10    93.184.216.34   HTTP     GET / HTTP/1.1

타이밍:
- 1번 패킷: 0.000초 (SYN 전송)
- 2번 패킷: 0.050초 (SYN-ACK 수신, RTT = 50ms)
- 3번 패킷: 0.050초 (ACK 전송)
- 4번 패킷: 0.050초 (HTTP 요청 전송)
```

---

## 🔍 실습 2: HTTP 요청/응답 분석

### 1단계: HTTP 트래픽 캡처

```bash
# Wireshark 필터
http

# tcpdump
sudo tcpdump -i any -A -s 0 'tcp port 80' -w http.pcap
```

### 2단계: HTTP 요청 생성

```bash
curl -v http://example.com/api/users
```

### 3단계: 패킷 분석

**HTTP 요청 패킷**
```
Hypertext Transfer Protocol
    GET /api/users HTTP/1.1\r\n
    Host: example.com\r\n
    User-Agent: curl/7.79.1\r\n
    Accept: */*\r\n
    \r\n

분석:
- Method: GET
- Path: /api/users
- Host 헤더: example.com (필수!)
- User-Agent: curl
```

**HTTP 응답 패킷**
```
Hypertext Transfer Protocol
    HTTP/1.1 200 OK\r\n
    Content-Type: application/json\r\n
    Content-Length: 45\r\n
    \r\n
    {"users": [{"id": 1, "name": "Alice"}]}

분석:
- 상태 코드: 200 OK
- Content-Type: JSON
- Content-Length: 45 바이트
- Body: JSON 데이터
```

### Follow TCP Stream (스트림 추적)

```
Wireshark에서:
1. HTTP 패킷 우클릭
2. "Follow" → "TCP Stream" 선택

결과:
빨간색 (클라이언트 → 서버):
  GET /api/users HTTP/1.1
  Host: example.com
  ...

파란색 (서버 → 클라이언트):
  HTTP/1.1 200 OK
  Content-Type: application/json
  ...
```

---

## 🔍 실습 3: HTTPS (TLS) 핸드셰이크 분석

### 1단계: TLS 트래픽 캡처

```bash
# Wireshark 필터
tls.handshake

# tcpdump
sudo tcpdump -i any -nn 'tcp port 443' -w https.pcap
```

### 2단계: HTTPS 요청 생성

```bash
curl -v https://example.com
```

### 3단계: 패킷 분석

**TLS Handshake 과정**

```
패킷 #1: Client Hello
    TLS Version: TLS 1.2
    Cipher Suites:
        - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
        - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
    Extensions:
        - server_name: example.com (SNI)

패킷 #2: Server Hello
    Selected Cipher Suite: TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
    Certificate (서버 인증서)

패킷 #3: Client Key Exchange
    Pre-Master Secret (암호화)

패킷 #4: Change Cipher Spec
    암호화 시작!

이후:
모든 HTTP 데이터 암호화 ✅ (Wireshark로 볼 수 없음)
```

### SSL/TLS 복호화 (개발 환경)

```bash
# 환경 변수 설정 (pre-master secret 로그)
export SSLKEYLOGFILE=~/sslkeys.log

# Chrome/Firefox로 HTTPS 접속
# sslkeys.log 파일 생성됨

# Wireshark 설정
Edit → Preferences → Protocols → TLS
  (Pre)-Master-Secret log filename: ~/sslkeys.log

# 이제 HTTPS 트래픽 복호화 가능! ✅
```

---

## 🔍 실습 4: DNS 쿼리 분석

### 1단계: DNS 트래픽 캡처

```bash
# Wireshark 필터
dns

# tcpdump
sudo tcpdump -i any -nn 'udp port 53' -w dns.pcap
```

### 2단계: DNS 쿼리 생성

```bash
# DNS 캐시 삭제 (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# DNS 쿼리
nslookup example.com
```

### 3단계: 패킷 분석

**DNS 쿼리 패킷**
```
Domain Name System (query)
    Transaction ID: 0x1234
    Flags: 0x0100 (Standard query)
    Questions: 1
        example.com: type A, class IN

의미:
- "example.com의 A 레코드(IPv4 주소)를 알려주세요"
```

**DNS 응답 패킷**
```
Domain Name System (response)
    Transaction ID: 0x1234
    Flags: 0x8180 (Standard query response)
    Questions: 1
    Answers: 1
        example.com: type A, class IN, addr 93.184.216.34

의미:
- "example.com의 IP는 93.184.216.34입니다"
```

---

## 🔍 실습 5: 네트워크 문제 진단

### 시나리오 1: 패킷 손실 감지

**증상**: 웹 페이지 로딩 느림

**분석**:
```bash
# Wireshark 필터
tcp.analysis.retransmission

# 결과:
No.  Info
100  [TCP Retransmission] 54321 → 80
150  [TCP Retransmission] 54321 → 80
200  [TCP Retransmission] 54321 → 80

진단:
- 재전송 패킷 다수 발견
- 네트워크 불안정 또는 패킷 손실
```

### 시나리오 2: TCP Window Full

**증상**: 연결 속도 느림

**분석**:
```bash
# Wireshark 필터
tcp.analysis.window_full

# 결과:
No.  Info
50   [TCP Window Full] 54321 → 80

진단:
- 수신자의 Window Size가 0
- 수신자의 버퍼가 가득 참
- 송신자는 전송 중지
```

### 시나리오 3: SYN Flooding 공격

**증상**: 서버 응답 없음

**분석**:
```bash
# Wireshark 필터
tcp.flags.syn == 1 and tcp.flags.ack == 0

# 통계
Statistics → Conversations → TCP

# 결과:
같은 IP에서 수천 개의 SYN 패킷 전송

진단:
- SYN Flooding 공격 가능성
- 방화벽/Rate Limiting 필요
```

---

## 🛠️ Wireshark 필터 모음

### 기본 필터

```
# IP 주소
ip.addr == 192.168.1.10
ip.src == 192.168.1.10
ip.dst == 93.184.216.34

# 포트
tcp.port == 80
tcp.srcport == 54321
tcp.dstport == 80

# 프로토콜
http
https
dns
tcp
udp

# TCP 플래그
tcp.flags.syn == 1
tcp.flags.ack == 1
tcp.flags.fin == 1
tcp.flags.reset == 1
```

### 고급 필터

```
# HTTP 메서드
http.request.method == "GET"
http.request.method == "POST"

# HTTP 상태 코드
http.response.code == 200
http.response.code >= 400

# HTTP 호스트
http.host == "example.com"

# HTTP URI
http.request.uri contains "api"

# TLS 버전
tls.handshake.version == 0x0303  # TLS 1.2

# DNS 쿼리 타입
dns.qry.type == 1  # A 레코드
dns.qry.type == 28  # AAAA 레코드

# 패킷 크기
frame.len > 1000
```

### 성능 분석 필터

```
# TCP 재전송
tcp.analysis.retransmission

# TCP 중복 ACK
tcp.analysis.duplicate_ack

# TCP Window Update
tcp.analysis.window_update

# TCP Zero Window
tcp.analysis.zero_window

# 느린 응답 시간 (1초 이상)
http.time > 1
```

---

## 📊 통계 분석

### 1. Protocol Hierarchy (프로토콜 계층)

```
Statistics → Protocol Hierarchy

결과:
Ethernet                100%
  IPv4                  95%
    TCP                 80%
      HTTP              50%
      HTTPS             30%
    UDP                 15%
      DNS               10%
  IPv6                  5%
```

### 2. Conversations (연결 통계)

```
Statistics → Conversations → TCP

결과:
Address A        Address B        Packets  Bytes
192.168.1.10:54321 → 93.184.216.34:80  100    50KB

분석:
- 100개 패킷 교환
- 총 50KB 전송
```

### 3. IO Graph (입출력 그래프)

```
Statistics → I/O Graph

그래프:
패킷 수
  ^
  |    ╱╲
  |   ╱  ╲
  | ╱      ╲
  |╱        ╲___
  +---------------> 시간

분석:
- 초당 패킷 수 변화 확인
- 트래픽 패턴 분석
```

---

## 🎯 실전 예제

### 예제 1: 느린 웹 페이지 진단

```bash
# 1. 패킷 캡처 시작
# Wireshark 필터: http and ip.addr == example.com

# 2. 웹 페이지 접속
curl -w "@curl-format.txt" http://example.com

# 3. Wireshark 분석
# - TCP 핸드셰이크 시간 확인
# - HTTP 요청 전송 시간 확인
# - HTTP 응답 수신 시간 확인

# 4. Follow TCP Stream으로 HTTP 내용 확인
```

### 예제 2: API 디버깅

```bash
# 1. API 요청 전 패킷 캡처 시작
# Wireshark 필터: http and http.request.method == "POST"

# 2. API 요청
curl -X POST -H "Content-Type: application/json" \
  -d '{"name": "Alice"}' \
  http://api.example.com/users

# 3. Wireshark에서 확인
# - 요청 헤더 확인
# - 요청 바디 확인
# - 응답 상태 코드 확인
# - 응답 바디 확인
```

---

## 🎯 체크리스트

- [ ] Wireshark를 설치하고 패킷을 캡처할 수 있다
- [ ] TCP 3-Way Handshake를 실제 패킷으로 확인했다
- [ ] HTTP 요청/응답 패킷을 분석할 수 있다
- [ ] TLS 핸드셰이크 과정을 이해한다
- [ ] DNS 쿼리/응답 패킷을 분석할 수 있다
- [ ] Wireshark 필터를 사용하여 원하는 패킷을 찾을 수 있다
- [ ] 네트워크 문제를 진단할 수 있다

## 🔗 다음 학습

- [01-HTTP-Server.md](./01-HTTP-Server.md) - HTTP 서버 구현
- [03-Simple-Proxy.md](./03-Simple-Proxy.md) - 프록시 서버 구현

---

**"패킷을 보면 네트워크가 보인다"**
