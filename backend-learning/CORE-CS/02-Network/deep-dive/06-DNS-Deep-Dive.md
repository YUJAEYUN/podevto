# DNS Deep Dive - DNS 심화

> "인터넷의 전화번호부"

## 🎯 학습 목표

- **DNS 계층 구조**와 동작 원리 이해
- **DNS 레코드 타입** 상세 파악
- **DNS 쿼리 과정** 단계별 분석
- **DNS 캐싱과 TTL** 메커니즘 습득
- **실무 DNS 설정과 최적화** 방법 학습

## 📚 DNS 기초

### DNS란?

```
도메인 이름 → IP 주소 변환

사람:     example.com
컴퓨터:   93.184.216.34

DNS가 중간에서 번역!
```

### 왜 필요한가?

```
IP 주소 직접 사용 시:
- 외우기 어려움: 93.184.216.34 😱
- 변경 시 문제: IP 바뀌면 모두 수정

도메인 사용 시:
- 외우기 쉬움: example.com ✅
- 변경 용이: IP 바뀌어도 DNS만 수정 ✅
```

## 🏗️ DNS 계층 구조

### DNS 트리

```
                        . (루트)
                         |
        +----------------+----------------+
        |                |                |
       com              org              net
        |                |                |
    +---+---+        +---+---+
    |       |        |       |
 example  google  wikipedia  ...
    |
+---+---+
|       |
www    api
```

### FQDN (Fully Qualified Domain Name)

```
www.example.com.
│   │       │   │
│   │       │   └─ 루트 (생략 가능)
│   │       └───── TLD (Top-Level Domain)
│   └───────────── SLD (Second-Level Domain)
└───────────────── 서브도메인 (Subdomain)

전체: www.example.com. (마지막 점이 루트)
```

## 🔍 DNS 서버 종류

### 1. Root DNS Server (루트 DNS 서버)

```
역할:
- TLD DNS 서버 주소 제공
- 전 세계 13개 루트 서버 (a.root-servers.net ~ m.root-servers.net)

쿼리:
"example.com은 어디에 있나요?"
→ ".com TLD 서버는 192.5.6.30입니다"
```

### 2. TLD DNS Server (최상위 도메인 서버)

```
역할:
- SLD DNS 서버 (권한 있는 네임서버) 주소 제공

종류:
- gTLD: .com, .org, .net, ...
- ccTLD: .kr, .jp, .uk, ...
- New gTLD: .dev, .app, .blog, ...

쿼리:
"example.com은 어디에 있나요?"
→ "example.com 네임서버는 ns1.example.com입니다"
```

### 3. Authoritative DNS Server (권한 있는 네임서버)

```
역할:
- 도메인의 실제 IP 주소 제공
- 도메인 소유자가 직접 관리

쿼리:
"www.example.com은 어디에 있나요?"
→ "93.184.216.34입니다" ✅
```

### 4. Recursive DNS Resolver (재귀 DNS 서버)

```
역할:
- 클라이언트 대신 DNS 쿼리 수행
- 결과를 캐싱하여 성능 향상

예:
- ISP DNS: 168.126.63.1 (KT)
- 공용 DNS: 8.8.8.8 (Google), 1.1.1.1 (Cloudflare)
```

## 🔄 DNS 쿼리 과정

### 전체 흐름 (Recursive Query)

```
1. 브라우저 캐시 확인
   www.example.com → 캐시 없음

2. OS 캐시 확인
   /etc/hosts, 시스템 캐시 확인 → 캐시 없음

3. Recursive DNS Resolver에 쿼리
   클라이언트 → "www.example.com?" → Resolver (8.8.8.8)

4. Resolver가 Root DNS에 쿼리
   Resolver → "www.example.com?" → Root DNS
   Root DNS → ".com TLD는 192.5.6.30" → Resolver

5. Resolver가 TLD DNS에 쿼리
   Resolver → "www.example.com?" → TLD DNS (192.5.6.30)
   TLD DNS → "example.com NS는 ns1.example.com (1.2.3.4)" → Resolver

6. Resolver가 Authoritative DNS에 쿼리
   Resolver → "www.example.com?" → ns1.example.com (1.2.3.4)
   ns1.example.com → "93.184.216.34" → Resolver

7. Resolver가 클라이언트에 응답
   Resolver → "93.184.216.34" → 클라이언트

8. 브라우저가 IP로 접속
   클라이언트 → HTTP 요청 → 93.184.216.34
```

### 상세 단계별 분석

```
클라이언트: "www.example.com의 IP는?"
     ↓
Resolver: 캐시 확인 → 없음
     ↓
Resolver → Root DNS: "www.example.com?"
Root DNS → Resolver: ".com TLD = 192.5.6.30"
     ↓
Resolver → TLD (.com): "www.example.com?"
TLD → Resolver: "example.com NS = ns1.example.com (1.2.3.4)"
     ↓
Resolver → Authoritative (ns1.example.com): "www.example.com?"
Authoritative → Resolver: "A 93.184.216.34, TTL=3600"
     ↓
Resolver: 캐시 저장 (3600초)
     ↓
Resolver → 클라이언트: "93.184.216.34"
     ↓
클라이언트: 93.184.216.34로 HTTP 요청 ✅
```

### Iterative Query vs Recursive Query

**Recursive Query** (재귀 쿼리):
```
클라이언트 → Resolver: "www.example.com?"
Resolver가 모든 단계 수행 후:
Resolver → 클라이언트: "93.184.216.34"

클라이언트는 1번만 쿼리! ✅
```

**Iterative Query** (반복 쿼리):
```
클라이언트 → Root: "www.example.com?"
Root → 클라이언트: ".com TLD = 192.5.6.30"
클라이언트 → TLD: "www.example.com?"
TLD → 클라이언트: "NS = ns1.example.com"
클라이언트 → NS: "www.example.com?"
NS → 클라이언트: "93.184.216.34"

클라이언트가 직접 여러 번 쿼리 😓
```

## 📋 DNS 레코드 타입

### A Record (Address Record)

```
도메인 → IPv4 주소

예:
www.example.com.  3600  IN  A  93.184.216.34
│                  │    │   │  │
│                  │    │   │  └─ IP 주소
│                  │    │   └──── 레코드 타입
│                  │    └──────── 클래스 (IN = Internet)
│                  └───────────── TTL (초)
└──────────────────────────────── 도메인
```

### AAAA Record (IPv6 Address Record)

```
도메인 → IPv6 주소

예:
www.example.com.  3600  IN  AAAA  2606:2800:220:1:248:1893:25c8:1946
```

### CNAME Record (Canonical Name Record)

```
도메인 별칭 → 실제 도메인

예:
blog.example.com.  3600  IN  CNAME  www.example.com.

사용 사례:
blog.example.com → www.example.com → 93.184.216.34
shop.example.com → www.example.com → 93.184.216.34

www의 IP만 바꾸면 모든 별칭이 자동 변경! ✅
```

### MX Record (Mail Exchange Record)

```
이메일 서버 지정

예:
example.com.  3600  IN  MX  10 mail.example.com.
example.com.  3600  IN  MX  20 mail2.example.com.
                         │  │
                         │  └─ 메일 서버
                         └──── 우선순위 (낮을수록 우선)

user@example.com으로 메일 전송 시:
1. mail.example.com 시도 (우선순위 10)
2. 실패 시 mail2.example.com 시도 (우선순위 20)
```

### NS Record (Name Server Record)

```
도메인의 네임서버 지정

예:
example.com.  3600  IN  NS  ns1.example.com.
example.com.  3600  IN  NS  ns2.example.com.

의미:
"example.com의 DNS 정보는 ns1.example.com에 물어보세요"
```

### TXT Record (Text Record)

```
텍스트 정보 저장

사용 사례:
1. SPF (이메일 인증)
   example.com.  3600  IN  TXT  "v=spf1 include:_spf.google.com ~all"

2. 도메인 소유 확인
   example.com.  3600  IN  TXT  "google-site-verification=abc123xyz"

3. DKIM (이메일 서명)
   _domainkey.example.com.  3600  IN  TXT  "v=DKIM1; k=rsa; p=MIGfMA0..."
```

### SOA Record (Start of Authority Record)

```
도메인 권한 정보

예:
example.com.  3600  IN  SOA  ns1.example.com. admin.example.com. (
                              2026011601 ; Serial (버전)
                              7200       ; Refresh (2시간)
                              3600       ; Retry (1시간)
                              1209600    ; Expire (2주)
                              86400      ; Minimum TTL (1일)
                            )
```

### PTR Record (Pointer Record)

```
IP → 도메인 (역방향 DNS)

예:
34.216.184.93.in-addr.arpa.  3600  IN  PTR  www.example.com.

용도:
- 이메일 서버 검증 (스팸 방지)
- 로깅/보안
```

## ⏱️ TTL (Time To Live)

### TTL이란?

```
DNS 레코드의 캐시 유효 시간 (초)

예:
www.example.com.  3600  IN  A  93.184.216.34
                  ^^^^
                  3600초 (1시간) 동안 캐시 유효
```

### TTL 설정 전략

**짧은 TTL (300초 = 5분)**:
```
✅ 장점:
- IP 변경 시 빠른 반영
- 장애 시 빠른 Failover

❌ 단점:
- DNS 쿼리 증가 (부하)
- 응답 시간 증가

사용 사례:
- 서버 마이그레이션 예정
- A/B 테스트
- 장애 대응 중
```

**긴 TTL (86400초 = 1일)**:
```
✅ 장점:
- DNS 쿼리 감소 (성능)
- 응답 속도 향상

❌ 단점:
- IP 변경 시 느린 반영

사용 사례:
- 안정적인 운영 환경
- 변경 계획 없음
```

**실무 전략**:
```
1. 평상시: TTL 3600 (1시간)

2. 마이그레이션 1일 전: TTL 300 (5분)으로 변경
   → 기존 캐시가 소진되도록 대기

3. 마이그레이션: IP 변경
   → 5분 내 전파 완료

4. 마이그레이션 완료 후: TTL 3600 (1시간)으로 복원
```

## 💾 DNS 캐싱

### 캐싱 계층

```
1. 브라우저 캐시
   chrome://net-internals/#dns

2. OS 캐시
   Windows: ipconfig /displaydns
   Linux: systemd-resolved
   macOS: dscacheutil -cachedump

3. Recursive Resolver 캐시
   8.8.8.8, 1.1.1.1 등

4. ISP DNS 캐시
```

### 캐시 무효화

```bash
# 브라우저 캐시 삭제
chrome://net-internals/#dns → Clear host cache

# OS 캐시 삭제
# Windows
ipconfig /flushdns

# Linux
sudo systemd-resolve --flush-caches

# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

## 🛠️ DNS 실무 설정

### Zone File 예제

```bind
; example.com zone file
$TTL 3600
@       IN  SOA  ns1.example.com. admin.example.com. (
                 2026011601 ; Serial
                 7200       ; Refresh
                 3600       ; Retry
                 1209600    ; Expire
                 86400      ; Minimum
                 )

; 네임서버
@       IN  NS   ns1.example.com.
@       IN  NS   ns2.example.com.

; A 레코드
@       IN  A    93.184.216.34
www     IN  A    93.184.216.34
api     IN  A    93.184.216.35

; AAAA 레코드
@       IN  AAAA 2606:2800:220:1:248:1893:25c8:1946

; CNAME 레코드
blog    IN  CNAME www.example.com.
shop    IN  CNAME www.example.com.

; MX 레코드
@       IN  MX   10 mail.example.com.
@       IN  MX   20 mail2.example.com.

; TXT 레코드
@       IN  TXT  "v=spf1 include:_spf.google.com ~all"
```

### Cloudflare DNS 설정

```
1. Cloudflare 가입 및 도메인 추가

2. 네임서버 변경
   도메인 등록기관에서:
   ns1.example.com → ns1.cloudflare.com
   ns2.example.com → ns2.cloudflare.com

3. DNS 레코드 추가
   Type: A
   Name: @
   Content: 93.184.216.34
   TTL: Auto
   Proxy status: Proxied (CDN + DDoS 보호)
```

### AWS Route 53 설정

```bash
# AWS CLI로 Zone 생성
aws route53 create-hosted-zone \
  --name example.com \
  --caller-reference 2026-01-16

# A 레코드 생성
cat > change-batch.json <<EOF
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "www.example.com",
      "Type": "A",
      "TTL": 300,
      "ResourceRecords": [{"Value": "93.184.216.34"}]
    }
  }]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://change-batch.json
```

## 🔍 DNS 디버깅

### dig 명령어

```bash
# 기본 쿼리
dig example.com

# 결과:
;; QUESTION SECTION:
;example.com.                   IN      A

;; ANSWER SECTION:
example.com.            3600    IN      A       93.184.216.34

# 특정 레코드 타입 쿼리
dig example.com MX
dig example.com NS
dig example.com TXT

# 특정 DNS 서버로 쿼리
dig @8.8.8.8 example.com

# 전체 쿼리 경로 추적 (+trace)
dig +trace example.com

# 결과:
.                       518400  IN      NS      a.root-servers.net.
com.                    172800  IN      NS      a.gtld-servers.net.
example.com.            172800  IN      NS      ns1.example.com.
example.com.            3600    IN      A       93.184.216.34

# 짧은 출력 (+short)
dig +short example.com
# 결과: 93.184.216.34
```

### nslookup 명령어

```bash
# 기본 쿼리
nslookup example.com

# 결과:
Server:         8.8.8.8
Address:        8.8.8.8#53

Non-authoritative answer:
Name:   example.com
Address: 93.184.216.34

# 특정 레코드 타입
nslookup -type=MX example.com
nslookup -type=NS example.com
```

### host 명령어

```bash
# 기본 쿼리
host example.com

# 결과:
example.com has address 93.184.216.34
example.com mail is handled by 10 mail.example.com.

# 역방향 DNS (PTR)
host 93.184.216.34

# 결과:
34.216.184.93.in-addr.arpa domain name pointer www.example.com.
```

## 🚀 DNS 성능 최적화

### 1. DNS Prefetching

```html
<!-- 브라우저가 미리 DNS 조회 -->
<link rel="dns-prefetch" href="//api.example.com">
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 페이지 로드 시 DNS 조회 완료 → 빠른 연결 ⚡ -->
```

### 2. DNS Resolver 선택

```
성능 비교:
┌─────────────────┬──────────────┐
│ DNS Provider    │ 평균 응답시간│
├─────────────────┼──────────────┤
│ Cloudflare 1.1  │ 14ms ⚡      │
│ Google 8.8.8.8  │ 20ms         │
│ ISP DNS         │ 30~100ms     │
└─────────────────┴──────────────┘

권장: Cloudflare (1.1.1.1) 또는 Google (8.8.8.8)
```

### 3. TTL 최적화

```
균형 잡힌 TTL:
- SOA: 86400 (1일)
- NS: 86400 (1일)
- A/AAAA: 3600 (1시간)
- CNAME: 3600 (1시간)
- MX: 3600 (1시간)
```

### 4. Anycast DNS

```
Cloudflare/Route 53:
- 전 세계 여러 위치에 DNS 서버
- 클라이언트와 가장 가까운 서버 응답
- 지연 시간 최소화 ⚡
```

## 🔒 DNS 보안

### DNSSEC (DNS Security Extensions)

```
목적:
DNS 응답의 진위 확인 (위변조 방지)

동작:
1. 도메인 소유자: DNS 레코드에 디지털 서명
2. Resolver: 서명 검증
3. 검증 실패 시: 응답 거부 ✅

설정:
example.com.  3600  IN  DNSKEY  257 3 8 AwEAAb...
example.com.  3600  IN  RRSIG   A 8 2 3600 ...
```

### DNS over HTTPS (DoH)

```
목적:
DNS 쿼리를 HTTPS로 암호화 (감청 방지)

일반 DNS:
클라이언트 → [평문 쿼리] → DNS 서버
         ↑ ISP가 볼 수 있음! 😱

DoH:
클라이언트 → [HTTPS 암호화] → DNS 서버
         ↑ ISP도 볼 수 없음! ✅

설정 (Firefox):
about:config
network.trr.mode = 2
network.trr.uri = https://1.1.1.1/dns-query
```

### DNS over TLS (DoT)

```
DoH와 유사하지만 TLS 사용 (Port 853)

설정 (systemd-resolved):
[Resolve]
DNS=1.1.1.1#cloudflare-dns.com
DNSOverTLS=yes
```

## 🎯 체크리스트

- [ ] DNS 계층 구조를 설명할 수 있다
- [ ] DNS 쿼리 과정을 단계별로 이해한다
- [ ] A, AAAA, CNAME, MX, NS, TXT 레코드를 구분할 수 있다
- [ ] TTL의 역할과 설정 전략을 안다
- [ ] dig/nslookup으로 DNS를 디버깅할 수 있다
- [ ] DNSSEC, DoH, DoT의 차이를 이해한다

## 🔗 다음 학습

- [07-Load-Balancing.md](./07-Load-Balancing.md) - 로드 밸런싱
- [../fundamentals/02-IP-Address-Routing.md](../fundamentals/02-IP-Address-Routing.md) - IP 주소 기초

---

**"DNS는 인터넷의 전화번호부. 없으면 웹은 작동하지 않는다."**
