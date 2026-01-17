# 네트워크 스택 처리 흐름

## 송신 과정 (User Space → Network)

```
[Application Layer]
  사용자 프로그램: send("Hello")
       ↓
  System Call: write() / sendto()
       ↓
═══════════════════════════════════════
[Kernel Space - Network Stack]

1. Transport Layer (TCP/UDP)
   함수: tcp_sendmsg() 또는 udp_sendmsg()
   위치: net/ipv4/tcp.c, net/ipv4/udp.c

   작업:
   - TCP 헤더 생성
   - 포트 번호 추가 (Source Port, Dest Port)
   - 시퀀스 번호, ACK 번호 계산
   - 체크섬 계산

   결과: [TCP Header | "Hello"]

       ↓

2. Network Layer (IP)
   함수: ip_queue_xmit()
   위치: net/ipv4/ip_output.c

   작업:
   - IP 헤더 생성
   - 출발지/목적지 IP 주소 추가
   - TTL 설정
   - IP 체크섬 계산
   - 라우팅 테이블 확인

   결과: [IP Header | TCP Header | "Hello"]

       ↓

3. Data Link Layer (Ethernet)
   함수: dev_hard_start_xmit()
   위치: net/core/dev.c

   그 후: eth_header()
   위치: net/ethernet/eth.c

   작업:
   - Ethernet 헤더 생성
   - 출발지/목적지 MAC 주소 추가
   - EtherType 추가 (0x0800 for IPv4)
   - ARP로 MAC 주소 찾기

   결과: [Eth Header | IP Header | TCP Header | "Hello"]

       ↓

4. Physical Layer
   함수: 네트워크 드라이버 (e.g., e1000_xmit_frame)

   작업:
   - 패킷을 네트워크 카드(NIC)에 전달
   - DMA를 통해 실제 전송

═══════════════════════════════════════
[Hardware - Network Card]
  실제 전기 신호로 변환하여 네트워크로 전송
```

---

## 수신 과정 (Network → User Space)

```
[Hardware - Network Card]
  네트워크에서 패킷 수신
       ↓
  인터럽트 발생 → 커널에 알림
       ↓
═══════════════════════════════════════
[Kernel Space - Network Stack]

1. Physical Layer
   함수: 네트워크 드라이버 인터럽트 핸들러

   작업:
   - 패킷을 메모리로 복사 (DMA)

   현재: [Eth Header | IP Header | TCP Header | "Hello"]

       ↓

2. Data Link Layer (Ethernet)
   함수: __netif_receive_skb()
   위치: net/core/dev.c

   작업:
   - Ethernet 헤더 파싱
   - EtherType 확인 (0x0800 → IPv4)
   - Ethernet 헤더 제거
   - MAC 주소 확인 (나한테 온 패킷인가?)

   현재: [IP Header | TCP Header | "Hello"]

       ↓

3. Network Layer (IP)
   함수: ip_rcv()
   위치: net/ipv4/ip_input.c

   작업:
   - IP 헤더 파싱
   - IP 체크섬 검증
   - TTL 확인
   - 목적지 IP 확인 (나한테 온 패킷인가?)
   - Protocol 필드 확인 (6 = TCP, 17 = UDP)
   - IP 헤더 제거

   현재: [TCP Header | "Hello"]

       ↓

4. Transport Layer (TCP/UDP)
   함수: tcp_v4_rcv() 또는 udp_rcv()
   위치: net/ipv4/tcp_ipv4.c, net/ipv4/udp.c

   작업:
   - TCP 헤더 파싱
   - 포트 번호로 소켓 찾기
   - 시퀀스 번호 확인
   - 체크섬 검증
   - ACK 전송 (필요시)
   - TCP 헤더 제거
   - 소켓 버퍼에 데이터 저장

   현재: "Hello"

       ↓

═══════════════════════════════════════
[Application Layer]
  System Call: read() / recv()
       ↓
  사용자 프로그램: "Hello" 받음
```

---

## 각 계층의 핵심 커널 코드 예제

### Transport Layer - TCP 헤더 추가

```c
// net/ipv4/tcp_output.c
static int tcp_transmit_skb(struct sock *sk, struct sk_buff *skb)
{
    struct tcp_sock *tp = tcp_sk(sk);
    struct tcphdr *th;

    // TCP 헤더 공간 확보
    th = (struct tcphdr *)skb_push(skb, tcp_header_size);

    // TCP 헤더 필드 설정
    th->source = inet->inet_sport;          // 출발지 포트
    th->dest = inet->inet_dport;            // 목적지 포트
    th->seq = htonl(tp->snd_nxt);          // 시퀀스 번호
    th->ack_seq = htonl(tp->rcv_nxt);      // ACK 번호
    th->window = htons(tcp_select_window(sk));

    // 체크섬 계산
    th->check = tcp_v4_check(skb->len, inet->inet_saddr,
                             inet->inet_daddr, csum);

    // IP 계층으로 전달
    return ip_queue_xmit(sk, skb);
}
```

### Network Layer - IP 헤더 추가

```c
// net/ipv4/ip_output.c
int ip_queue_xmit(struct sock *sk, struct sk_buff *skb)
{
    struct iphdr *iph;

    // IP 헤더 공간 확보
    iph = (struct iphdr *)skb_push(skb, sizeof(struct iphdr));

    // IP 헤더 필드 설정
    iph->version = 4;
    iph->ihl = 5;                           // 헤더 길이
    iph->tos = inet->tos;
    iph->tot_len = htons(skb->len);        // 전체 길이
    iph->id = htons(inet->id++);
    iph->ttl = ip_select_ttl(inet, &rt->dst);
    iph->protocol = sk->sk_protocol;       // 6 = TCP
    iph->saddr = fl4->saddr;               // 출발지 IP
    iph->daddr = fl4->daddr;               // 목적지 IP

    // 체크섬 계산
    ip_send_check(iph);

    // 데이터링크 계층으로 전달
    return dst_output(sk, skb);
}
```

### Data Link Layer - Ethernet 헤더 추가

```c
// net/ethernet/eth.c
int eth_header(struct sk_buff *skb, struct net_device *dev,
               unsigned short type, const void *daddr,
               const void *saddr, unsigned int len)
{
    struct ethhdr *eth;

    // Ethernet 헤더 공간 확보
    eth = (struct ethhdr *)skb_push(skb, ETH_HLEN);

    // Ethernet 헤더 필드 설정
    eth->h_proto = htons(type);            // 0x0800 (IPv4)
    memcpy(eth->h_source, saddr, ETH_ALEN);  // 출발지 MAC
    memcpy(eth->h_dest, daddr, ETH_ALEN);    // 목적지 MAC

    return ETH_HLEN;
}
```

---

## 핵심 개념

1. **각 계층은 독립적**: 한 계층은 다른 계층의 내부를 모름
2. **헤더 추가/제거**: 송신 시 앞에 추가, 수신 시 앞에서 제거
3. **sk_buff 구조체**: Linux 커널에서 패킷을 표현하는 핵심 자료구조
4. **계층 간 함수 호출**: 각 계층의 함수가 순차적으로 호출됨

---

## 실제 Linux 커널에서 확인하는 방법

```bash
# Linux 커널 소스 다운로드
git clone https://github.com/torvalds/linux.git
cd linux

# TCP 헤더 추가 로직 확인
less net/ipv4/tcp_output.c

# IP 헤더 추가 로직 확인
less net/ipv4/ip_output.c

# Ethernet 헤더 추가 로직 확인
less net/ethernet/eth.c
```
