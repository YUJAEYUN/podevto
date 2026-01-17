# OS vs 커널, 그리고 네트워크 프로토콜 표준화

## 1. 운영체제(OS) vs 커널(Kernel)

### 운영체제 = 커널 + 응용 프로그램들

```
┌──────────────────────────────────────────────┐
│           운영체제 (Operating System)        │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │      User Space (사용자 영역)          │ │
│  │                                        │ │
│  │  - 쉘 (bash, zsh)                     │ │
│  │  - GUI (Finder, Explorer)             │ │
│  │  - 응용 프로그램 (Chrome, VSCode)     │ │
│  │  - 유틸리티 (ls, cat, grep)          │ │
│  │  - 라이브러리 (glibc, stdlib)         │ │
│  └────────────────────────────────────────┘ │
│              ↕ System Call                  │
│  ┌────────────────────────────────────────┐ │
│  │    Kernel Space (커널 영역) ⭐        │ │
│  │                                        │ │
│  │  1. 프로세스 관리                     │ │
│  │     - 스케줄링, 컨텍스트 스위칭       │ │
│  │                                        │ │
│  │  2. 메모리 관리                       │ │
│  │     - 가상 메모리, 페이징            │ │
│  │                                        │ │
│  │  3. 파일 시스템                       │ │
│  │     - ext4, APFS, NTFS               │ │
│  │                                        │ │
│  │  4. 네트워크 스택 ← 여기!            │ │
│  │     - TCP/IP 구현                    │ │
│  │     - 소켓 관리                      │ │
│  │                                        │ │
│  │  5. 디바이스 드라이버                 │ │
│  │     - 네트워크 카드, 디스크 등       │ │
│  └────────────────────────────────────────┘ │
│              ↕ 하드웨어 제어                │
│      하드웨어 (CPU, RAM, NIC, Disk)         │
└──────────────────────────────────────────────┘
```

### 실제 예시

| OS 이름       | 커널                  | 추가 구성 요소                         |
| ----------- | ------------------- | -------------------------------- |
| **Ubuntu**  | Linux 커널            | GNU 도구, apt 패키지 관리자, GNOME       |
| **macOS**   | XNU 커널 (Mach + BSD) | Aqua GUI, Finder, macOS 앱들       |
| **Windows** | NT 커널               | Explorer, PowerShell, Windows 앱들 |
| **Android** | Linux 커널            | Dalvik/ART VM, Android Framework |

**중요:** "Linux"는 **커널 이름**입니다!
- 정확한 표현: "Ubuntu Linux", "Arch Linux" (Linux 커널 기반 OS)
- 흔한 실수: "Linux OS" (엄밀히는 부정확)

---

## 2. 네트워크 스택은 커널에 구현

### System Call 흐름

```c
// User Space - 사용자 프로그램
#include <sys/socket.h>

int main() {
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    send(sock, "Hello", 5, 0);  // ← System Call
    return 0;
}
```

```
User Space    send("Hello")
              ↓ System Call
══════════════════════════════════
Kernel Space  sys_sendto()
              ↓
              sock_sendmsg()
              ↓
              tcp_sendmsg()         [TCP 헤더 추가]
              ↓
              ip_queue_xmit()       [IP 헤더 추가]
              ↓
              eth_header()          [Ethernet 헤더 추가]
              ↓
              dev_queue_xmit()      [NIC로 전송]
              ↓
Hardware      Network Card
```

### 커널 소스 위치

```bash
# Linux 커널
linux/
├── net/
│   ├── ipv4/
│   │   ├── tcp.c              # TCP 구현
│   │   ├── tcp_output.c       # TCP 송신
│   │   ├── tcp_input.c        # TCP 수신
│   │   ├── ip_output.c        # IP 송신
│   │   └── ip_input.c         # IP 수신
│   ├── ethernet/
│   │   └── eth.c              # Ethernet
│   └── core/
│       └── dev.c              # 네트워크 디바이스
└── include/
    └── linux/
        ├── tcp.h              # TCP 구조체 정의
        └── ip.h               # IP 구조체 정의

# macOS XNU 커널
darwin-xnu/
└── bsd/
    └── netinet/
        ├── tcp_input.c        # TCP 수신
        ├── tcp_output.c       # TCP 송신
        ├── ip_output.c        # IP 송신
        └── tcp.h              # TCP 구조체
```

---

## 3. 왜 OS마다 다른데 통신이 되나?

### RFC (Request for Comments) 표준

**IETF (Internet Engineering Task Force)**가 프로토콜 규격을 **RFC 문서**로 제정:

```
1981년: RFC 793 발표
┌────────────────────────────────────────┐
│  RFC 793 - TCP 표준                    │
│                                        │
│  "TCP 헤더는 20바이트"                 │
│  "Source Port는 16비트 (0~65535)"     │
│  "Sequence Number는 32비트"           │
│  "SYN, ACK, FIN 플래그 정의..."       │
└────────────────────────────────────────┘
         ↓ 이 규격대로 구현
    ┌────┴────┬─────────┬──────────┐
    ↓         ↓         ↓          ↓
  Linux    Windows   macOS      FreeBSD
  (1991)   (1993)    (2001)     (1993)

  → 모두 동일한 형식의 TCP 패킷 생성
  → 서로 통신 가능! ✅
```

### 주요 RFC 문서

| 프로토콜 | RFC | 발표년도 | 내용 |
|---------|-----|---------|------|
| IP | RFC 791 | 1981 | Internet Protocol |
| TCP | RFC 793 | 1981 | Transmission Control Protocol |
| UDP | RFC 768 | 1980 | User Datagram Protocol |
| HTTP/1.1 | RFC 2616 | 1999 | Hypertext Transfer Protocol |
| HTTP/2 | RFC 7540 | 2015 | HTTP/2 |
| DNS | RFC 1035 | 1987 | Domain Name System |

---

## 4. 구현은 다르지만, 결과는 같음

### 예시: TCP 헤더 구조체

#### RFC 793 규격 (모두가 따라야 함)

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

#### Linux 커널 구현

```c
// include/uapi/linux/tcp.h
struct tcphdr {
    __be16  source;      // 16비트
    __be16  dest;        // 16비트
    __be32  seq;         // 32비트
    __be32  ack_seq;     // 32비트
    // ... (RFC 793과 동일한 레이아웃)
};
```

#### macOS XNU 커널 구현

```c
// bsd/netinet/tcp.h
struct tcphdr {
    u_short th_sport;    // 16비트 (이름만 다름)
    u_short th_dport;    // 16비트
    tcp_seq th_seq;      // 32비트
    tcp_seq th_ack;      // 32비트
    // ... (RFC 793과 동일한 레이아웃)
};
```

#### Windows 구현 (비공개)

```c
// 소스코드는 비공개지만, RFC 793을 따름
// 실제 패킷 형식은 Linux/macOS와 동일
```

### 실제 패킷 비교

```
Linux가 만든 TCP 패킷:
[Source: 12345][Dest: 80][Seq: 1000][Ack: 2000]...

macOS가 만든 TCP 패킷:
[Source: 54321][Dest: 80][Seq: 5000][Ack: 6000]...

Windows가 만든 TCP 패킷:
[Source: 49152][Dest: 80][Seq: 7000][Ack: 8000]...

→ 모두 동일한 형식! (값만 다름)
→ 서로 해석 가능! ✅
```

---

## 5. 표준 준수를 어떻게 보장하나?

### 상호 운용성 테스트

```
┌─────────┐         ┌─────────┐
│ Linux   │ ←────→  │ Windows │  OK?
│ Client  │         │ Server  │
└─────────┘         └─────────┘

┌─────────┐         ┌─────────┐
│ macOS   │ ←────→  │ Linux   │  OK?
│ Client  │         │ Server  │
└─────────┘         └─────────┘

┌─────────┐         ┌─────────┐
│ Windows │ ←────→  │ macOS   │  OK?
│ Client  │         │ Server  │
└─────────┘         └─────────┘
```

만약 RFC를 제대로 구현하지 않으면:
- 다른 OS와 통신 실패
- 버그 리포트
- 수정 후 재배포

### 오픈소스의 힘 (Linux)

```bash
# Linux 커널 소스는 공개되어 있음
git clone https://github.com/torvalds/linux.git

# 전 세계 개발자들이 검토
# RFC 위반 사항 발견 → 즉시 패치
```

---

## 6. 실제 통신 시나리오

### 예: 당신의 macOS에서 Google (Linux) 서버로 요청

```
[1단계 - macOS]
   사용자: curl http://google.com
        ↓
   XNU 커널:
   - HTTP 요청 "GET /" 생성
   - TCP 헤더 추가 (RFC 793 규격대로)
   - IP 헤더 추가 (RFC 791 규격대로)
   - Ethernet 헤더 추가
        ↓
   패킷: [Eth][IP][TCP]["GET /"]

[2단계 - 인터넷 라우터들]
   라우터 1 (Linux): IP 헤더 읽고 다음으로 전달
   라우터 2 (Cisco IOS): IP 헤더 읽고 전달
   라우터 3 (Juniper): IP 헤더 읽고 전달
        ↓
   모두 RFC 791을 따르므로 IP 해석 가능!

[3단계 - Google 서버 (Linux)]
   Linux 커널:
   - Ethernet 헤더 제거
   - IP 헤더 제거 (RFC 791 규격대로)
   - TCP 헤더 제거 (RFC 793 규격대로)
   - "GET /" 데이터 추출
        ↓
   웹 서버(nginx): "GET /" 처리 후 응답

[4단계 - 응답 (Linux → macOS)]
   Linux → 인터넷 → macOS
   모두 동일한 RFC 규격 사용
        ↓
   성공! ✅
```

---

## 7. 비유로 이해하기

### 자동차 규격 vs 제조사

| | 프로토콜 세계 | 자동차 세계 |
|---|-------------|------------|
| **표준** | RFC (IETF 제정) | 도로교통법 (정부 제정) |
| **규격** | TCP 헤더 20바이트 | 운전석은 왼쪽, 페달은 오른쪽 |
| **제조사** | Linux, Windows, macOS | 현대, 도요타, BMW |
| **구현** | 커널 코드는 다름 | 엔진, 디자인은 다름 |
| **결과** | 동일한 패킷 형식 | 모두 도로에서 운행 가능 |

"규격만 맞으면 어떤 차든 도로를 달릴 수 있다!"
"규격만 맞으면 어떤 OS든 인터넷에서 통신할 수 있다!"

---

## 8. 정리

| 질문 | 답변 |
|------|------|
| **OS vs 커널?** | 커널 = OS의 핵심 (하드웨어 제어), OS = 커널 + 응용 프로그램 |
| **Linux는?** | 커널 이름 (Ubuntu, Fedora 등이 Linux 기반 OS) |
| **네트워크 스택 어디?** | 커널 내부 (Linux: `/net/`, macOS: XNU) |
| **누가 표준 만들어?** | IETF (Internet Engineering Task Force) |
| **표준 문서는?** | RFC (Request for Comments) |
| **OS마다 다른데 왜 통신돼?** | 모두 동일한 RFC 규격을 따르기 때문 |
| **구현은 다른데?** | 코드는 다르지만, 생성하는 패킷 형식은 동일 |

---

## 더 공부하기

### 읽어볼 자료

1. **RFC 793 (TCP)**: https://www.rfc-editor.org/rfc/rfc793
2. **Linux 커널 소스**: https://github.com/torvalds/linux
3. **macOS XNU 커널**: https://github.com/apple/darwin-xnu
4. **"TCP/IP Illustrated" (책)**: W. Richard Stevens 저

### 실습

```bash
# Linux 커널 TCP 구현 보기
git clone https://github.com/torvalds/linux.git
cd linux/net/ipv4
cat tcp.c

# RFC 문서 읽기
curl https://www.rfc-editor.org/rfc/rfc793.txt | less
```
