# DNS Resolver - DNS 리졸버 구현

> "도메인을 IP로 변환하는 마법"

## 🎯 학습 목표

- **DNS 프로토콜** 직접 구현
- **DNS 패킷 파싱 및 생성** 이해
- **Recursive Query** 동작 원리 체득
- **DNS 캐싱** 메커니즘 구현

## 📚 DNS 프로토콜 기초

### DNS 패킷 구조

```
 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                      ID                       |  Transaction ID
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|QR|   Opcode  |AA|TC|RD|RA|   Z    |   RCODE   |  Flags
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    QDCOUNT                    |  Question Count
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    ANCOUNT                    |  Answer Count
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    NSCOUNT                    |  Authority Count
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    ARCOUNT                    |  Additional Count
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                   Questions                   |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    Answers                    |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                   Authority                   |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                  Additional                   |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+

플래그:
- QR: 0 = Query, 1 = Response
- RD: Recursion Desired
- RA: Recursion Available
```

### DNS Question 형식

```
도메인 이름 (가변 길이, Label 형식)
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                     QTYPE                     |  Query Type (A, AAAA, MX, ...)
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                     QCLASS                    |  Query Class (IN = Internet)
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+

Label 형식:
예: "www.example.com"
→ [3]www[7]example[3]com[0]
   길이  텍스트
```

### DNS Answer 형식

```
도메인 이름 (또는 포인터)
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                     TYPE                      |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                     CLASS                     |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                      TTL                      |  Time To Live
|                                               |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                   RDLENGTH                    |  Resource Data Length
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--|
|                     RDATA                     |  Resource Data
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
```

---

## 🔨 Phase 1: 기본 DNS 쿼리

### DNS 쿼리 패킷 생성 (Python)

```python
#!/usr/bin/env python3
"""
간단한 DNS 리졸버
"""
import socket
import struct
import random

def encode_domain_name(domain):
    """도메인 이름을 DNS 형식으로 인코딩

    예: "www.example.com" → [3]www[7]example[3]com[0]
    """
    encoded = b''
    for label in domain.split('.'):
        encoded += bytes([len(label)]) + label.encode('utf-8')
    encoded += b'\x00'  # 종료
    return encoded

def decode_domain_name(data, offset):
    """DNS 형식에서 도메인 이름 디코딩"""
    labels = []
    jumped = False
    jump_offset = 0

    while True:
        length = data[offset]

        # 포인터 (압축)
        if length & 0xC0 == 0xC0:
            if not jumped:
                jump_offset = offset + 2
            pointer = struct.unpack('!H', data[offset:offset+2])[0]
            offset = pointer & 0x3FFF
            jumped = True
            continue

        # 종료
        if length == 0:
            offset += 1
            break

        # Label
        offset += 1
        labels.append(data[offset:offset+length].decode('utf-8'))
        offset += length

    domain = '.'.join(labels)

    if jumped:
        return domain, jump_offset
    else:
        return domain, offset

def build_dns_query(domain, qtype=1):
    """DNS 쿼리 패킷 생성

    qtype: 1 = A (IPv4), 28 = AAAA (IPv6), 15 = MX, ...
    """
    # Header
    transaction_id = random.randint(0, 65535)
    flags = 0x0100  # Standard query, RD=1
    qdcount = 1
    ancount = 0
    nscount = 0
    arcount = 0

    header = struct.pack('!HHHHHH',
        transaction_id, flags,
        qdcount, ancount, nscount, arcount
    )

    # Question
    qname = encode_domain_name(domain)
    qtype = struct.pack('!H', qtype)  # A record
    qclass = struct.pack('!H', 1)     # IN (Internet)

    question = qname + qtype + qclass

    return transaction_id, header + question

def parse_dns_response(data):
    """DNS 응답 파싱"""
    # Header
    transaction_id, flags, qdcount, ancount, nscount, arcount = \
        struct.unpack('!HHHHHH', data[:12])

    offset = 12

    # Questions (스킵)
    for _ in range(qdcount):
        _, offset = decode_domain_name(data, offset)
        offset += 4  # QTYPE + QCLASS

    # Answers
    answers = []
    for _ in range(ancount):
        name, offset = decode_domain_name(data, offset)
        atype, aclass, ttl, rdlength = struct.unpack('!HHIH', data[offset:offset+10])
        offset += 10

        rdata = data[offset:offset+rdlength]
        offset += rdlength

        # A 레코드 (IPv4)
        if atype == 1 and rdlength == 4:
            ip = '.'.join(str(b) for b in rdata)
            answers.append({
                'name': name,
                'type': 'A',
                'ttl': ttl,
                'data': ip
            })

        # AAAA 레코드 (IPv6)
        elif atype == 28 and rdlength == 16:
            ip = ':'.join(f'{b1:02x}{b2:02x}' for b1, b2 in zip(rdata[::2], rdata[1::2]))
            answers.append({
                'name': name,
                'type': 'AAAA',
                'ttl': ttl,
                'data': ip
            })

    return {
        'transaction_id': transaction_id,
        'answers': answers
    }

def resolve(domain, dns_server='8.8.8.8', qtype=1):
    """도메인을 IP로 변환

    dns_server: DNS 서버 IP (기본: Google DNS)
    qtype: 1 = A, 28 = AAAA
    """
    # DNS 쿼리 생성
    transaction_id, query = build_dns_query(domain, qtype)

    # UDP 소켓 생성
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(5)

    try:
        # DNS 서버에 쿼리 전송 (포트 53)
        sock.sendto(query, (dns_server, 53))

        # 응답 수신
        response, _ = sock.recvfrom(512)

        # 응답 파싱
        result = parse_dns_response(response)

        if result['transaction_id'] != transaction_id:
            raise Exception("Transaction ID 불일치")

        return result['answers']
    finally:
        sock.close()

# 사용 예시
if __name__ == '__main__':
    domain = 'example.com'

    print(f"도메인: {domain}")
    print("DNS 쿼리 전송 중...")

    # A 레코드 (IPv4)
    answers = resolve(domain, qtype=1)

    print("\nA 레코드 (IPv4):")
    for answer in answers:
        print(f"  {answer['name']} → {answer['data']} (TTL: {answer['ttl']}초)")

    # AAAA 레코드 (IPv6)
    answers = resolve(domain, qtype=28)

    print("\nAAAA 레코드 (IPv6):")
    for answer in answers:
        print(f"  {answer['name']} → {answer['data']} (TTL: {answer['ttl']}초)")
```

### 실행 결과

```bash
$ python3 dns_resolver.py

도메인: example.com
DNS 쿼리 전송 중...

A 레코드 (IPv4):
  example.com → 93.184.216.34 (TTL: 3600초)

AAAA 레코드 (IPv6):
  example.com → 2606:2800:220:1:248:1893:25c8:1946 (TTL: 3600초)
```

---

## 🚀 Phase 2: Recursive Resolver (재귀 리졸버)

### Recursive Query 구현

```python
def resolve_recursive(domain, qtype=1):
    """Recursive DNS 쿼리

    Root → TLD → Authoritative 순서로 쿼리
    """
    # Root DNS 서버 (a.root-servers.net)
    root_servers = [
        '198.41.0.4',    # a.root-servers.net
        '199.9.14.201',  # b.root-servers.net
        '192.33.4.12',   # c.root-servers.net
    ]

    current_servers = root_servers
    domain_parts = domain.split('.')

    print(f"\n=== Recursive Query: {domain} ===")

    for i in range(len(domain_parts) + 1):
        # 현재 쿼리할 도메인
        if i == 0:
            query_domain = domain
        else:
            query_domain = '.'.join(domain_parts[-i:])

        print(f"\n단계 {i+1}: {query_domain} 쿼리")

        # 현재 서버들에 쿼리
        for server in current_servers:
            try:
                print(f"  서버: {server}")
                transaction_id, query = build_dns_query(query_domain, qtype)

                sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                sock.settimeout(5)
                sock.sendto(query, (server, 53))
                response, _ = sock.recvfrom(512)
                sock.close()

                result = parse_dns_response(response)

                # 답변이 있으면 완료
                if result['answers']:
                    print(f"  ✅ 답변 발견!")
                    return result['answers']

                # Authority 섹션에서 다음 NS 서버 추출
                # (간소화: 실제로는 Authority/Additional 섹션 파싱 필요)
                print(f"  → 다음 서버로 이동")
                break
            except Exception as e:
                print(f"  ❌ 에러: {e}")
                continue

    return []

# 사용
answers = resolve_recursive('example.com')
for answer in answers:
    print(f"\n최종 답변: {answer['data']}")
```

---

## 💾 Phase 3: DNS 캐싱

### 캐시 구현

```python
import time
from threading import Lock

class DNSCache:
    def __init__(self):
        self.cache = {}  # (domain, qtype) → (answers, expire_time)
        self.lock = Lock()

    def get(self, domain, qtype):
        """캐시 조회"""
        with self.lock:
            key = (domain, qtype)

            if key in self.cache:
                answers, expire_time = self.cache[key]

                # 만료 확인
                if time.time() < expire_time:
                    print(f"캐시 히트: {domain}")
                    return answers
                else:
                    # 만료된 캐시 제거
                    del self.cache[key]

            return None

    def set(self, domain, qtype, answers):
        """캐시 저장"""
        with self.lock:
            if not answers:
                return

            # TTL은 가장 작은 값 사용
            min_ttl = min(answer['ttl'] for answer in answers)
            expire_time = time.time() + min_ttl

            key = (domain, qtype)
            self.cache[key] = (answers, expire_time)

            print(f"캐시 저장: {domain} (TTL: {min_ttl}초)")

    def clear(self):
        """캐시 전체 삭제"""
        with self.lock:
            self.cache.clear()
            print("캐시 삭제 완료")

# 사용 예시
cache = DNSCache()

def resolve_with_cache(domain, qtype=1):
    """캐싱 지원 DNS 쿼리"""
    # 1. 캐시 확인
    cached = cache.get(domain, qtype)
    if cached:
        return cached

    # 2. 캐시 미스 → DNS 쿼리
    print(f"캐시 미스: {domain}")
    answers = resolve(domain, qtype=qtype)

    # 3. 캐시 저장
    cache.set(domain, qtype, answers)

    return answers

# 테스트
print("첫 번째 쿼리:")
resolve_with_cache('example.com')

print("\n두 번째 쿼리 (캐시 히트!):")
resolve_with_cache('example.com')
```

---

## 🔧 Phase 4: DNS 서버 구현

### Simple DNS Server

```python
import threading

class SimpleDNSServer:
    def __init__(self, port=53):
        self.port = port
        self.cache = DNSCache()
        self.upstream_dns = '8.8.8.8'

    def handle_query(self, data, client_address):
        """DNS 쿼리 처리"""
        try:
            # 헤더 파싱
            transaction_id = struct.unpack('!H', data[:2])[0]
            offset = 12

            # Question 파싱
            domain, offset = decode_domain_name(data, offset)
            qtype, qclass = struct.unpack('!HH', data[offset:offset+4])

            print(f"쿼리: {domain} (타입: {qtype})")

            # 캐시 확인
            answers = self.cache.get(domain, qtype)

            if not answers:
                # Upstream DNS에 쿼리
                answers = resolve(domain, self.upstream_dns, qtype)
                self.cache.set(domain, qtype, answers)

            # 응답 생성
            response = self.build_response(transaction_id, domain, qtype, answers)

            return response
        except Exception as e:
            print(f"쿼리 처리 에러: {e}")
            # 에러 응답 (SERVFAIL)
            return data[:2] + b'\x81\x02' + data[4:12]

    def build_response(self, transaction_id, domain, qtype, answers):
        """DNS 응답 생성"""
        # Header
        flags = 0x8180  # Response, RD=1, RA=1
        qdcount = 1
        ancount = len(answers)

        header = struct.pack('!HHHHHH',
            transaction_id, flags,
            qdcount, ancount, 0, 0
        )

        # Question
        question = encode_domain_name(domain)
        question += struct.pack('!HH', qtype, 1)

        # Answers
        answer_section = b''
        for answer in answers:
            # Name (포인터 사용: 0xC00C = offset 12)
            answer_section += b'\xc0\x0c'

            # Type, Class, TTL
            if answer['type'] == 'A':
                atype = 1
                rdata = bytes(map(int, answer['data'].split('.')))
            elif answer['type'] == 'AAAA':
                atype = 28
                rdata = bytes.fromhex(answer['data'].replace(':', ''))

            answer_section += struct.pack('!HHIH',
                atype, 1, answer['ttl'], len(rdata)
            )
            answer_section += rdata

        return header + question + answer_section

    def start(self):
        """DNS 서버 시작"""
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind(('0.0.0.0', self.port))

        print(f"DNS 서버가 포트 {self.port}에서 실행 중...")

        try:
            while True:
                data, client_address = sock.recvfrom(512)

                # 스레드로 처리
                thread = threading.Thread(
                    target=self.handle_and_respond,
                    args=(sock, data, client_address)
                )
                thread.daemon = True
                thread.start()
        except KeyboardInterrupt:
            print("\nDNS 서버 종료")
        finally:
            sock.close()

    def handle_and_respond(self, sock, data, client_address):
        """쿼리 처리 및 응답"""
        response = self.handle_query(data, client_address)
        sock.sendto(response, client_address)

# 사용
if __name__ == '__main__':
    server = SimpleDNSServer(port=5353)  # 권한 문제로 5353 사용
    server.start()
```

### 테스트

```bash
# DNS 서버 실행
python3 dns_server.py

# 다른 터미널에서 테스트
dig @localhost -p 5353 example.com

# 결과:
;; ANSWER SECTION:
example.com.            3600    IN      A       93.184.216.34
```

---

## 🎯 체크리스트

- [ ] DNS 패킷 구조를 이해한다
- [ ] 도메인 이름을 DNS 형식으로 인코딩/디코딩할 수 있다
- [ ] DNS 쿼리 패킷을 생성할 수 있다
- [ ] DNS 응답 패킷을 파싱할 수 있다
- [ ] Recursive Query의 동작 원리를 이해한다
- [ ] DNS 캐싱을 구현할 수 있다
- [ ] 간단한 DNS 서버를 구현할 수 있다

## 🔗 다음 학습

- [02-Packet-Analyzer.md](./02-Packet-Analyzer.md) - DNS 패킷 분석
- [../deep-dive/06-DNS-Deep-Dive.md](../deep-dive/06-DNS-Deep-Dive.md) - DNS 심화

---

**"DNS는 인터넷의 전화번호부. 도메인을 IP로 변환하는 첫 걸음."**
