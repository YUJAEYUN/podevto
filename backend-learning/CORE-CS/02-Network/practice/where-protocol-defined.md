# 프로토콜은 어디에 정의되어 있나?

## 1. 표준 규격 (RFC 문서) - "설계도"

### TCP/IP 프로토콜 스택 주요 RFC

| 프로토콜         | RFC 번호     | 내용                            | 문서 링크                                  |
| ------------ | ---------- | ----------------------------- | -------------------------------------- |
| **IP**       | RFC 791    | Internet Protocol             | https://www.rfc-editor.org/rfc/rfc791  |
| **TCP**      | RFC 793    | Transmission Control Protocol | https://www.rfc-editor.org/rfc/rfc793  |
| **UDP**      | RFC 768    | User Datagram Protocol        | https://www.rfc-editor.org/rfc/rfc768  |
| **HTTP/1.1** | RFC 2616   | Hypertext Transfer Protocol   | https://www.rfc-editor.org/rfc/rfc2616 |
| **HTTP/2**   | RFC 7540   | HTTP/2                        | https://www.rfc-editor.org/rfc/rfc7540 |
| **Ethernet** | IEEE 802.3 | Ethernet 표준                   | IEEE 규격                                |
| **DNS**      | RFC 1035   | Domain Name System            | https://www.rfc-editor.org/rfc/rfc1035 |

### RFC 문서 예제 - TCP 헤더 정의

```
RFC 793 - Transmission Control Protocol

TCP Header Format

    0                   1                   2                   3
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |          Source Port          |       Destination Port        |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                        Sequence Number                        |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                    Acknowledgment Number                      |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |  Data |           |U|A|P|R|S|F|                               |
   | Offset| Reserved  |R|C|S|S|Y|I|            Window             |
   |       |           |G|K|H|T|N|N|                               |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |           Checksum            |         Urgent Pointer        |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                    Options                    |    Padding    |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                             data                              |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

---

## 2. OS 커널 구현 - "실제 동작하는 코드"

### Linux 커널의 TCP 헤더 구조체

```c
// include/uapi/linux/tcp.h
struct tcphdr {
    __be16  source;      // Source port (16비트)
    __be16  dest;        // Destination port (16비트)
    __be32  seq;         // Sequence number (32비트)
    __be32  ack_seq;     // Acknowledgment number (32비트)
#if defined(__LITTLE_ENDIAN_BITFIELD)
    __u16   res1:4,
            doff:4,
            fin:1,
            syn:1,
            rst:1,
            psh:1,
            ack:1,
            urg:1,
            ece:1,
            cwr:1;
#endif
    __be16  window;      // Window size (16비트)
    __sum16 check;       // Checksum (16비트)
    __be16  urg_ptr;     // Urgent pointer (16비트)
};
```

→ **RFC 793의 규격을 C 구조체로 구현**

### macOS (XNU 커널)의 TCP 헤더 구조체

```c
// bsd/netinet/tcp.h
struct tcphdr {
    u_short th_sport;        /* source port */
    u_short th_dport;        /* destination port */
    tcp_seq th_seq;          /* sequence number */
    tcp_seq th_ack;          /* acknowledgement number */
    u_int   th_x2:4,         /* (unused) */
            th_off:4;        /* data offset */
    u_char  th_flags;
    u_short th_win;          /* window */
    u_short th_sum;          /* checksum */
    u_short th_urp;          /* urgent pointer */
};
```

→ **동일한 RFC 793을 따르지만 구조체 이름/타입이 조금 다름**

---

## 3. 계층별 규격과 구현 위치

### Application Layer (응용 계층)

**규격:**
- HTTP: RFC 2616, RFC 7540
- FTP: RFC 959
- SMTP: RFC 5321

**구현:**
- 사용자 프로그램 (curl, 웹브라우저 등)
- 라이브러리 (libcurl, requests 등)

---

### Transport Layer (전송 계층)

**규격:**
- TCP: RFC 793
- UDP: RFC 768

**구현 위치:**
```
Linux:   /linux/net/ipv4/tcp.c
         /linux/net/ipv4/udp.c

macOS:   /xnu/bsd/netinet/tcp_input.c
         /xnu/bsd/netinet/tcp_output.c

Windows: tcpip.sys (closed source)
```

---

### Network Layer (네트워크 계층)

**규격:**
- IPv4: RFC 791
- IPv6: RFC 2460
- ICMP: RFC 792

**구현 위치:**
```
Linux:   /linux/net/ipv4/ip_output.c
         /linux/net/ipv4/ip_input.c

macOS:   /xnu/bsd/netinet/ip_output.c
         /xnu/bsd/netinet/ip_input.c
```

---

### Data Link Layer (데이터링크 계층)

**규격:**
- Ethernet: IEEE 802.3
- Wi-Fi: IEEE 802.11

**구현 위치:**
```
Linux:   /linux/net/ethernet/eth.c
         /linux/drivers/net/ethernet/

macOS:   IONetworkingFamily.kext (드라이버)
```

---

## 4. 실제로 확인하는 방법

### Linux 커널 소스 보기

```bash
# 1. Linux 커널 클론
git clone https://github.com/torvalds/linux.git
cd linux

# 2. TCP 헤더 정의 확인
cat include/uapi/linux/tcp.h

# 3. TCP 헤더 추가 로직
cat net/ipv4/tcp_output.c | grep -A 20 "tcp_transmit_skb"

# 4. IP 헤더 추가 로직
cat net/ipv4/ip_output.c | grep -A 20 "ip_queue_xmit"
```

### macOS (XNU) 커널 소스 보기

```bash
# 1. XNU 커널 클론
git clone https://github.com/apple/darwin-xnu.git
cd darwin-xnu

# 2. TCP 헤더 정의 확인
cat bsd/netinet/tcp.h

# 3. TCP 구현 보기
cat bsd/netinet/tcp_output.c
```

### RFC 문서 직접 읽기

```bash
# curl로 RFC 문서 다운로드
curl https://www.rfc-editor.org/rfc/rfc793.txt > tcp_rfc.txt
cat tcp_rfc.txt
```

---

## 5. 왜 OS마다 구현이 다른데 통신이 되나?

### 핵심: "인터페이스는 동일, 구현은 자유"

모든 OS가 **RFC 규격(인터페이스)**을 따르므로:

```
┌─────────────────────────────────────┐
│  RFC 793 - TCP 규격                 │
│  "TCP 헤더는 이렇게 생겨야 함"       │
└─────────────────────────────────────┘
           ↓ 구현
    ┌──────┴──────┬──────────┐
    │             │          │
  Linux        macOS      Windows
  (오픈소스)   (BSD기반)  (독자구현)

  → 모두 동일한 형식의 패킷 생성
  → 서로 통신 가능! ✅
```

### 비유

- **RFC = 자동차 규격** (핸들 위치, 페달 배치)
- **OS 구현 = 자동차 제조사** (현대, 도요타, BMW)
- 규격만 맞으면 어떤 차든 도로에서 운행 가능!

---

## 6. 정리

| 질문                  | 답변                                     |
| ------------------- | -------------------------------------- |
| **규칙은 어디에?**        | RFC 문서 (국제 표준)                         |
| **누가 만들어?**         | IETF (Internet Engineering Task Force) |
| **누가 구현해?**         | OS 커널 개발자들                             |
| **어디에 구현돼?**        | OS 커널의 네트워크 스택                         |
| **왜 OS마다 다른데 통신돼?** | 모두 동일한 RFC 규격을 따르기 때문                  |

---

## 추가 학습 자료

- **RFC 문서 읽기**: https://www.rfc-editor.org/
- **Linux 커널 네트워크 스택**: https://github.com/torvalds/linux/tree/master/net
- **XNU 커널 (macOS)**: https://github.com/apple/darwin-xnu
- **TCP/IP Illustrated (책)**: Stevens의 명저
