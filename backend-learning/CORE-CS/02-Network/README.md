# Network - 백엔드 필수 지식

> "네트워크를 모르면 백엔드를 할 수 없다"

## 🎯 학습 목표

- **패킷이 어떻게 전달**되는지 계층별로 이해
- **TCP와 HTTP의 내부 동작** 원리 파악
- 네트워크 **성능 문제를 진단**하고 해결할 수 있는 능력

## 📊 학습 우선순위

```
1. TCP/IP 프로토콜 스택 (40%)
   - 3-Way Handshake, 흐름 제어, 혼잡 제어

2. HTTP/HTTPS 동작 원리 (30%)
   - HTTP/1.1, HTTP/2, HTTP/3 차이

3. DNS와 로드밸런싱 (20%)
   - 도메인 해석, L4/L7 로드밸런서

4. 현대 프로토콜 (10%)
   - WebSocket, gRPC, QUIC
```

## 📂 학습 경로

### Phase 1: Fundamentals (1주차)

- [01-OSI-TCPIP-Layers.md](./fundamentals/01-OSI-TCPIP-Layers.md) - 계층 구조 이해
- [02-IP-Address-Routing.md](./fundamentals/02-IP-Address-Routing.md) - IP와 라우팅
- [03-TCP-Basics.md](./fundamentals/03-TCP-Basics.md) - TCP 기초
- [04-UDP-Basics.md](./fundamentals/04-UDP-Basics.md) - UDP와 사용 사례
- [05-HTTP-Basics.md](./fundamentals/05-HTTP-Basics.md) - HTTP 기본 개념

### Phase 2: Deep Dive (2주차)

- [01-TCP-3Way-Handshake.md](./deep-dive/01-TCP-3Way-Handshake.md) - 연결 수립 과정
- [02-TCP-Flow-Control.md](./deep-dive/02-TCP-Flow-Control.md) - 흐름 제어
- [03-TCP-Congestion-Control.md](./deep-dive/03-TCP-Congestion-Control.md) - 혼잡 제어
- [04-HTTP-Versions.md](./deep-dive/04-HTTP-Versions.md) - HTTP/1.1 vs 2 vs 3
- [05-HTTPS-TLS.md](./deep-dive/05-HTTPS-TLS.md) - SSL/TLS 암호화
- [06-DNS-Deep-Dive.md](./deep-dive/06-DNS-Deep-Dive.md) - DNS 동작 원리
- [07-Load-Balancing.md](./deep-dive/07-Load-Balancing.md) - 로드밸런싱 전략
- [08-WebSocket-gRPC.md](./deep-dive/08-WebSocket-gRPC.md) - 실시간 통신

### Phase 3: Practice (3주차)

- [01-HTTP-Server.md](./practice/01-HTTP-Server.md) - HTTP 서버 직접 구현
- [02-Packet-Analyzer.md](./practice/02-Packet-Analyzer.md) - Wireshark로 패킷 분석
- [03-Simple-Proxy.md](./practice/03-Simple-Proxy.md) - 간단한 프록시 서버
- [04-Load-Balancer.md](./practice/04-Load-Balancer.md) - 로드밸런서 구현
- [05-DNS-Resolver.md](./practice/05-DNS-Resolver.md) - DNS 리졸버

### Phase 4: Resources

- [RFCs.md](./resources/RFCs.md) - 필수 RFC 문서
- [Tools.md](./resources/Tools.md) - 네트워크 분석 도구
- [Post-Mortems.md](./resources/Post-Mortems.md) - 네트워크 장애 사례

## 🔍 핵심 질문들

### TCP
1. **왜 3-Way Handshake인가?**
   - 2-Way는 왜 안 될까? → 양방향 연결 확인 필요

2. **왜 흐름 제어가 필요한가?**
   - 송신자가 빠르고 수신자가 느릴 때

3. **왜 혼잡 제어가 필요한가?**
   - 네트워크가 혼잡하면 패킷 손실 발생

### HTTP
1. **왜 HTTP/2가 나왔는가?**
   - HTTP/1.1의 HOL Blocking 문제

2. **왜 HTTPS를 사용하는가?**
   - 중간자 공격(MITM) 방지

3. **왜 HTTP/3는 UDP를 쓰는가?**
   - TCP의 HOL Blocking을 완전히 제거

## 💡 실무 시나리오

### 시나리오 1: 느린 API 응답
```bash
# 문제: API 응답이 2초 걸림

# 진단:
curl -w "@curl-format.txt" -o /dev/null -s https://api.example.com

# 결과:
time_namelookup:  0.001s  ✅ DNS는 빠름
time_connect:     0.050s  ✅ TCP 연결도 빠름
time_starttransfer: 2.000s  ❌ 서버 처리가 느림

# 해결: 서버 로직 최적화 필요
```

### 시나리오 2: Connection Timeout
```bash
# 문제: 간헐적으로 연결 실패

# 원인 분석:
ss -tan | grep SYN_SENT  # SYN을 보냈지만 응답이 없음

# 가능한 원인:
# 1. 방화벽 차단
# 2. 서버 다운
# 3. 네트워크 경로 문제

# 해결:
traceroute api.example.com  # 경로 확인
```

### 시나리오 3: SSL Handshake 실패
```bash
# 문제: HTTPS 연결 실패

# 진단:
openssl s_client -connect example.com:443

# 원인:
# - 인증서 만료
# - 인증서 체인 불완전
# - TLS 버전 미스매치

# 해결: 인증서 갱신 또는 설정 수정
```

## 📈 학습 진행도 체크리스트

### Week 1: Fundamentals
- [ ] OSI 7계층과 TCP/IP 4계층을 그림으로 그릴 수 있다
- [ ] IP 주소와 서브넷 마스크를 이해한다
- [ ] TCP와 UDP의 차이를 설명할 수 있다
- [ ] HTTP 메서드와 상태 코드를 이해한다
- [ ] curl로 HTTP 요청을 분석할 수 있다

### Week 2: Deep Dive
- [ ] 3-Way Handshake를 그림으로 그릴 수 있다
- [ ] TCP 흐름 제어 (슬라이딩 윈도우)를 설명할 수 있다
- [ ] TCP 혼잡 제어 알고리즘을 이해한다
- [ ] HTTP/1.1과 HTTP/2의 차이를 설명할 수 있다
- [ ] HTTPS 인증서 동작 원리를 이해한다
- [ ] DNS 쿼리 과정을 설명할 수 있다
- [ ] L4와 L7 로드밸런서의 차이를 이해한다

### Week 3: Practice
- [ ] 소켓 프로그래밍으로 HTTP 서버를 만들었다
- [ ] Wireshark로 패킷을 캡처하고 분석했다
- [ ] 간단한 프록시 서버를 구현했다
- [ ] 네트워크 장애 회고록 5개 이상을 분석했다

## 🎓 추천 학습 흐름

```
Day 1-2: OSI/TCP-IP 계층, IP 주소
   ↓
Day 3-4: TCP 기초, 3-Way Handshake
   ↓
Day 5-7: TCP 흐름/혼잡 제어 깊이 파기
   ↓
Day 8-10: HTTP/HTTPS 기초와 버전별 차이
   ↓
Day 11-13: TLS/SSL 암호화 이해
   ↓
Day 14-16: DNS와 로드밸런싱
   ↓
Day 17-19: 실습 프로젝트 (HTTP 서버)
   ↓
Day 20-21: Wireshark 패킷 분석
```

## 🔗 다음 단계

Network 학습 완료 후:
1. [Operating System](../03-Operating-System/README.md) - 프로세스와 쓰레드
2. 또는 Network를 더 깊이 (Cloudflare 블로그 읽기)

## 💬 학습 팁

### 1. Wireshark로 패킷 직접 보기
```bash
# HTTP 요청 캡처
sudo tcpdump -i any -w capture.pcap port 80

# Wireshark로 열어서 분석
wireshark capture.pcap
```

### 2. curl로 HTTP 상세 분석
```bash
# 헤더 포함 출력
curl -v https://example.com

# 타이밍 정보
curl -w "@curl-format.txt" https://example.com

# 특정 HTTP 버전 지정
curl --http2 https://example.com
```

### 3. RFC 문서 읽기
- RFC 793 (TCP)
- RFC 2616 (HTTP/1.1)
- RFC 7540 (HTTP/2)
- RFC 9000 (QUIC)

### 4. 장애 회고록 분석
- Cloudflare 네트워크 장애
- AWS Route53 DNS 장애
- Facebook BGP 장애 (2021)

---

**"네트워크를 이해하면 분산 시스템이 보인다"**
