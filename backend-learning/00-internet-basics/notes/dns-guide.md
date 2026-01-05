# DNS 완벽 가이드 (Domain Name System)

## DNS란?

**DNS (Domain Name System)** 는 인터넷의 전화번호부입니다. 사람이 읽기 쉬운 도메인 이름(예: `www.google.com`)을 컴퓨터가 이해할 수 있는 IP 주소(예: `142.250.207.46`)로 변환합니다.

```
www.google.com  ──DNS 조회──→  142.250.207.46
  (도메인 이름)                    (IP 주소)
```

---

## 왜 DNS가 필요한가?

### IP 주소는 기억하기 어렵다

```
✗ http://142.250.207.46        ← 기억하기 어려움
✓ http://www.google.com        ← 기억하기 쉬움
```

### IP 주소는 변경될 수 있다

서버를 이전하거나 확장할 때 IP 주소가 바뀔 수 있지만, 도메인 이름은 그대로 유지됩니다.

```
2024년: example.com → 93.184.216.34
2025년: example.com → 104.26.10.123  ← IP만 변경, 도메인은 동일
```

---

## DNS 조회 과정

사용자가 `www.example.com`을 브라우저에 입력했을 때:

```
1. 브라우저 캐시 확인
   ┌──────────────────────────────┐
   │ 최근 방문한 적 있나?          │
   │ 있으면 캐시된 IP 사용         │
   └──────────────────────────────┘

2. OS 캐시 확인
   ┌──────────────────────────────┐
   │ /etc/hosts 또는                │
   │ 시스템 DNS 캐시 확인           │
   └──────────────────────────────┘

3. 로컬 DNS 서버 (Recursive Resolver)
   ┌──────────────────────────────┐
   │ ISP가 제공하는 DNS 서버       │
   │ 또는 8.8.8.8 (Google DNS)     │
   └──────────────────────────────┘

4. Root DNS 서버
   ┌──────────────────────────────┐
   │ ".com은 어디서 관리하나요?"   │
   │ → TLD 서버 주소 응답          │
   └──────────────────────────────┘

5. TLD DNS 서버 (.com)
   ┌──────────────────────────────┐
   │ "example.com은 어디 있나요?"  │
   │ → Authoritative 서버 주소 응답│
   └──────────────────────────────┘

6. Authoritative DNS 서버 (권한 있는 DNS 서버)
   ┌──────────────────────────────┐
   │ "www.example.com의 IP는?"     │
   │ → 93.184.216.34               │
   │                               │
   │ 💡 여기가 핵심!                │
   │ 도메인 소유자가 설정한 서버   │
   │ example.com의 실제 IP 정보를  │
   │ 관리하는 곳                    │
   └──────────────────────────────┘

7. 결과 반환 및 캐싱
   ┌──────────────────────────────┐
   │ IP 주소를 브라우저에 반환     │
   │ 일정 시간 동안 캐싱           │
   └──────────────────────────────┘
```

---

## 누가 매핑을 관리하는가?

### 관리 주체와 역할

```
┌─────────────────────────────────────────────────────────────┐
│                  DNS 관리 체계                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. ICANN (최상위 관리 기구)                                 │
│     └─ 전체 DNS 시스템 총괄                                  │
│                                                              │
│  2. Root DNS 서버 운영자 (13개 조직)                         │
│     └─ . (루트) 관리                                         │
│                                                              │
│  3. TLD 레지스트리 (TLD 관리자)                              │
│     ├─ .com → Verisign                                      │
│     ├─ .org → Public Interest Registry                      │
│     ├─ .kr  → KISA (한국인터넷진흥원)                        │
│     └─ TLD별 네임서버 목록 관리                              │
│                                                              │
│  4. 도메인 등록 대행사 (Registrar)                           │
│     ├─ GoDaddy, Namecheap, 가비아 등                        │
│     └─ 사용자와 레지스트리 중개                              │
│                                                              │
│  5. 네임서버 제공자 (DNS 호스팅)                             │
│     ├─ Cloudflare, Route 53, DNS Made Easy                  │
│     └─ 실제 DNS 레코드 저장 및 응답                          │
│                                                              │
│  6. 도메인 소유자 (당신!)                                    │
│     └─ example.com → 93.184.216.34 매핑 설정               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 구체적인 예시: example.com

```
질문: example.com → 93.184.216.34 매핑은 누가 관리?

답: 도메인 소유자 (IANA)가 설정하고,
    네임서버 (Authoritative DNS)가 저장 및 응답

┌──────────────────────────────────────────────────────────┐
│ 1. 도메인 구매 (등록)                                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  당신이 GoDaddy에서 mysite.com 구매                       │
│                                                           │
│  GoDaddy (등록 대행사)                                    │
│      ↓                                                    │
│  Verisign (TLD 레지스트리)                                │
│      ↓                                                    │
│  .com 데이터베이스에 등록:                                │
│  "mysite.com의 네임서버는 ns1.example.com"                │
│                                                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 2. DNS 레코드 설정                                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  당신이 Cloudflare DNS 설정 화면에서:                     │
│                                                           │
│  Type: A                                                  │
│  Name: mysite.com                                         │
│  Value: 192.0.2.1        ← 이 매핑을 당신이 설정!        │
│  TTL: 3600                                                │
│                                                           │
│  → Cloudflare 네임서버에 저장됨                           │
│    (ns1.cloudflare.com)                                   │
│                                                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 3. DNS 조회 시                                            │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  사용자: "mysite.com의 IP는?"                             │
│     ↓                                                     │
│  Root DNS: ".com은 Verisign이 관리"                       │
│     ↓                                                     │
│  TLD (.com): "mysite.com은 ns1.cloudflare.com이 관리"     │
│     ↓                                                     │
│  Authoritative DNS (Cloudflare):                          │
│  "mysite.com → 192.0.2.1"  ← 여기서 당신이 설정한 값 반환!│
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 실제 예시: 도메인 설정부터 조회까지

### 시나리오: 블로그를 만든다고 가정

```
단계 1: 도메인 구매
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

당신 → Namecheap에서 "myblog.com" 구매 ($12/년)

Namecheap → Verisign에 등록 요청
            "myblog.com이라는 도메인을 등록합니다"

Verisign → .com TLD 데이터베이스에 추가
          ┌─────────────────────────────────┐
          │ myblog.com                      │
          │ 네임서버: ns1.namecheap.com     │
          │           ns2.namecheap.com     │
          │ 등록자: 당신                     │
          └─────────────────────────────────┘
```

```
단계 2: DNS 레코드 설정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

당신 → Namecheap DNS 설정 페이지에 접속
     → A 레코드 추가:
       ┌─────────────────────────────────┐
       │ Host: @                         │
       │ Type: A                         │
       │ Value: 192.0.2.1  ← 당신의 서버 IP│
       │ TTL: 3600                       │
       └─────────────────────────────────┘

Namecheap 네임서버 (ns1.namecheap.com)에 저장됨:
┌─────────────────────────────────────┐
│ Zone: myblog.com                    │
├─────────────────────────────────────┤
│ myblog.com.  A  192.0.2.1           │
│ www.myblog.com.  A  192.0.2.1       │
└─────────────────────────────────────┘
```

```
단계 3: 사용자가 방문할 때
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

사용자가 브라우저에 "myblog.com" 입력
    ↓
로컬 DNS (예: 8.8.8.8)가 조회 시작
    ↓
1. Root DNS에 물음
   "myblog.com이 어디 있나요?"
   → ".com은 a.gtld-servers.net이 관리합니다"
    ↓
2. TLD DNS (.com)에 물음
   "myblog.com이 어디 있나요?"
   → "ns1.namecheap.com에 물어보세요"
    ↓
3. Authoritative DNS (ns1.namecheap.com)에 물음
   "myblog.com의 IP는?"
   → "192.0.2.1입니다"  ← 당신이 설정한 값!
    ↓
사용자 브라우저 → 192.0.2.1로 접속
```

---

## 각 주체의 역할 정리

### 1. ICANN (Internet Corporation for Assigned Names and Numbers)
```
역할: DNS 시스템 총괄 관리
- Root DNS 서버 관리 감독
- TLD 승인 (.com, .org, .kr 등)
- IP 주소 할당 정책
```

### 2. Root DNS 서버 운영자
```
역할: . (루트) 영역 관리
- 전 세계 13개 조직이 운영
- TLD 네임서버 목록 보유
- ".com은 어디? → Verisign"
```

### 3. TLD 레지스트리 (Registry)
```
역할: 특정 TLD의 모든 도메인 관리
- .com → Verisign
- .org → PIR (Public Interest Registry)
- .kr → KISA

관리 내용:
- 해당 TLD의 모든 도메인 목록
- 각 도메인의 네임서버 정보
- "example.com의 네임서버는 ns1.example.com"
```

### 4. 도메인 등록 대행사 (Registrar)
```
역할: 도메인 판매 및 중개
- GoDaddy, Namecheap, 가비아 등
- 사용자가 도메인 구매하는 곳
- 레지스트리에 등록 요청

하는 일:
- 도메인 검색 및 판매
- 도메인 갱신 관리
- 기본 DNS 서비스 제공
```

### 5. 네임서버 제공자 (DNS Hosting)
```
역할: 실제 DNS 레코드 저장 및 응답
- Cloudflare, Route 53, DNS Made Easy 등
- Authoritative DNS 서버 운영

저장하는 정보:
- example.com → 93.184.216.34 (A 레코드)
- mail.example.com → 192.0.2.2 (A 레코드)
- example.com → mail.example.com (MX 레코드)

💡 여기가 실제 IP 매핑이 저장되는 곳!
```

### 6. 도메인 소유자 (당신!)
```
역할: DNS 레코드 설정
- 도메인을 어떤 IP로 연결할지 결정
- A, AAAA, CNAME, MX 등 레코드 추가/수정

설정하는 것:
- example.com → 93.184.216.34
- www.example.com → 93.184.216.34
- api.example.com → 104.26.10.123
```

### 전체 흐름도

```
브라우저
   │
   ├─→ 1. www.example.com?
   │
   ↓
로컬 DNS 서버 (ISP)
   │
   ├─→ 2. .com은 어디?
   │
   ↓
Root DNS (.)
   │
   ├─→ 3. .com TLD 서버: 192.5.6.30
   │
   ↓
TLD DNS (.com)
   │
   ├─→ 4. example.com 네임서버: ns1.example.com
   │
   ↓
Authoritative DNS (example.com)
   │
   ├─→ 5. www.example.com: 93.184.216.34
   │
   ↓
로컬 DNS 서버 → 브라우저
```

---

## DNS 레코드 타입

DNS는 다양한 타입의 레코드를 관리합니다.

### 주요 레코드 타입

| 타입 | 이름 | 설명 | 예시 |
|------|------|------|------|
| **A** | Address | IPv4 주소 매핑 | `example.com → 93.184.216.34` |
| **AAAA** | IPv6 Address | IPv6 주소 매핑 | `example.com → 2606:2800:220:1:...` |
| **CNAME** | Canonical Name | 도메인 별칭 | `www.example.com → example.com` |
| **MX** | Mail Exchange | 메일 서버 지정 | `example.com → mail.example.com` |
| **TXT** | Text | 텍스트 정보 | SPF, DKIM, 도메인 인증 |
| **NS** | Name Server | 네임서버 지정 | `example.com → ns1.example.com` |
| **SOA** | Start of Authority | 도메인 권한 정보 | 관리자, TTL 등 |
| **PTR** | Pointer | 역방향 조회 (IP→도메인) | `34.216.184.93 → example.com` |

### 레코드 예시

#### A 레코드
```
example.com.        A      93.184.216.34
www.example.com.    A      93.184.216.34
```

#### AAAA 레코드
```
example.com.        AAAA   2606:2800:220:1:248:1893:25c8:1946
```

#### CNAME 레코드
```
www.example.com.    CNAME  example.com.
blog.example.com.   CNAME  hosting-provider.com.
```

**CNAME 사용 시 주의사항**:
- 루트 도메인(`example.com`)에는 CNAME 사용 불가
- 다른 레코드와 함께 사용 불가

#### MX 레코드
```
example.com.        MX     10 mail.example.com.
example.com.        MX     20 backup-mail.example.com.
```
- 숫자는 우선순위 (낮을수록 우선)

#### TXT 레코드
```
example.com.        TXT    "v=spf1 include:_spf.google.com ~all"
_dmarc.example.com. TXT    "v=DMARC1; p=reject; rua=mailto:admin@example.com"
```

#### NS 레코드
```
example.com.        NS     ns1.example.com.
example.com.        NS     ns2.example.com.
```

---

## TTL (Time To Live)

TTL은 DNS 레코드가 캐시에 저장되는 시간(초)을 지정합니다.

```
example.com.  3600  A  93.184.216.34
              ↑
           TTL (1시간)
```

### TTL 설정 가이드

| 시나리오 | TTL | 이유 |
|---------|-----|------|
| 안정적인 서비스 | 86400 (24시간) | 트래픽 감소, 빠른 응답 |
| 일반적인 경우 | 3600 (1시간) | 균형잡힌 설정 |
| IP 변경 예정 | 300 (5분) | 빠른 전파 |
| 개발/테스트 | 60 (1분) | 즉시 반영 |

**주의사항**:
- TTL이 짧으면: 변경사항 빠르게 반영, DNS 쿼리 증가
- TTL이 길면: 트래픽 감소, 변경사항 반영 느림

---

## DNS 조회 실습

### 1. nslookup 사용

```bash
# 기본 조회
$ nslookup google.com
Server:         8.8.8.8
Address:        8.8.8.8#53

Non-authoritative answer:
Name:   google.com
Address: 142.250.207.46
```

```bash
# 특정 DNS 서버 지정
$ nslookup google.com 1.1.1.1
```

```bash
# MX 레코드 조회
$ nslookup -type=mx google.com
```

### 2. dig 사용 (더 상세한 정보)

```bash
# A 레코드 조회
$ dig google.com

; <<>> DiG 9.10.6 <<>> google.com
;; ANSWER SECTION:
google.com.             300     IN      A       142.250.207.46

;; Query time: 23 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
```

```bash
# 간단한 출력 (+short)
$ dig google.com +short
142.250.207.46
```

```bash
# AAAA 레코드 (IPv6)
$ dig google.com AAAA +short
2404:6800:4004:825::200e
```

```bash
# MX 레코드
$ dig google.com MX +short
10 smtp.google.com.
```

```bash
# NS 레코드 (네임서버)
$ dig google.com NS +short
ns1.google.com.
ns2.google.com.
ns3.google.com.
ns4.google.com.
```

```bash
# 전체 DNS 경로 추적 (+trace)
$ dig google.com +trace
```

### 3. host 사용

```bash
$ host google.com
google.com has address 142.250.207.46
google.com has IPv6 address 2404:6800:4004:825::200e
google.com mail is handled by 10 smtp.google.com.
```

### 4. whois - 도메인 소유자 정보

```bash
$ whois google.com

Domain Name: GOOGLE.COM
Registrar: MarkMonitor Inc.
Creation Date: 1997-09-15T04:00:00Z
Registry Expiry Date: 2028-09-14T04:00:00Z
```

---

## DNS 캐싱

### 캐싱 계층

```
1. 브라우저 캐시
   └─ 가장 빠름, 브라우저 재시작 시 삭제

2. OS 캐시
   └─ 시스템 레벨 캐시

3. 로컬 DNS 서버 (ISP)
   └─ 여러 사용자가 공유

4. DNS 서버 체인
   └─ Root, TLD, Authoritative
```

### 캐시 확인 및 제거

```bash
# macOS - DNS 캐시 삭제
$ sudo dscacheutil -flushcache
$ sudo killall -HUP mDNSResponder

# Windows - DNS 캐시 삭제
C:\> ipconfig /flushdns

# Linux - DNS 캐시 삭제
$ sudo systemd-resolve --flush-caches
```

---

## 주요 DNS 서버

### 퍼블릭 DNS 서버

| 제공자 | Primary | Secondary | 특징 |
|--------|---------|-----------|------|
| **Google** | 8.8.8.8 | 8.8.4.4 | 빠르고 안정적 |
| **Cloudflare** | 1.1.1.1 | 1.0.0.1 | 프라이버시 중점 |
| **Quad9** | 9.9.9.9 | 149.112.112.112 | 보안 중점 |
| **OpenDNS** | 208.67.222.222 | 208.67.220.220 | 필터링 기능 |

### DNS 서버 변경 (macOS)

```bash
# 현재 DNS 확인
$ scutil --dns | grep nameserver

# DNS 변경 (네트워크 설정 → DNS 탭)
또는
$ networksetup -setdnsservers Wi-Fi 8.8.8.8 8.8.4.4
```

---

## 도메인 구조

```
www.blog.example.com.
 │   │    │      │  └─ Root (.)
 │   │    │      └──── TLD (Top-Level Domain)
 │   │    └─────────── SLD (Second-Level Domain)
 │   └──────────────── Subdomain
 └───────────────────── Subdomain
```

### TLD 종류

#### 1. gTLD (Generic TLD)
```
.com    - 상업용 (가장 일반적)
.org    - 비영리 조직
.net    - 네트워크 관련
.edu    - 교육 기관
.gov    - 정부 기관
.io     - 기술 스타트업에서 선호
.dev    - 개발자 커뮤니티
.app    - 애플리케이션
```

#### 2. ccTLD (Country Code TLD)
```
.kr     - 대한민국
.us     - 미국
.jp     - 일본
.uk     - 영국
.cn     - 중국
```

---

## 백엔드 개발자를 위한 DNS 실무

### 1. 도메인 설정 예시

```
# 웹 서버
example.com           A      93.184.216.34
www.example.com       A      93.184.216.34

# API 서버
api.example.com       A      104.26.10.123

# 로드 밸런서 (여러 IP)
app.example.com       A      192.0.2.1
app.example.com       A      192.0.2.2
app.example.com       A      192.0.2.3

# CDN (CNAME)
cdn.example.com       CNAME  cdn-provider.cloudfront.net

# 메일 서버
example.com           MX     10 mail.example.com
mail.example.com      A      93.184.216.50

# 서브도메인
blog.example.com      CNAME  hosting.wordpress.com
docs.example.com      CNAME  readthedocs.io
```

### 2. Node.js에서 DNS 조회

```javascript
const dns = require('dns');

// A 레코드 조회
dns.resolve4('google.com', (err, addresses) => {
  if (err) throw err;
  console.log('IP 주소:', addresses);
  // IP 주소: [ '142.250.207.46' ]
});

// 모든 레코드 조회
dns.resolve('google.com', 'ANY', (err, records) => {
  if (err) throw err;
  console.log(records);
});

// 역방향 조회 (IP → 도메인)
dns.reverse('8.8.8.8', (err, hostnames) => {
  if (err) throw err;
  console.log('호스트명:', hostnames);
  // 호스트명: [ 'dns.google' ]
});

// Promise 버전
const { promises: dnsPromises } = require('dns');

async function lookupDomain(domain) {
  try {
    const addresses = await dnsPromises.resolve4(domain);
    console.log(`${domain} → ${addresses[0]}`);
  } catch (error) {
    console.error('DNS 조회 실패:', error);
  }
}

lookupDomain('google.com');
```

### 3. Python에서 DNS 조회

```python
import socket
import dns.resolver

# 기본 조회
ip = socket.gethostbyname('google.com')
print(f'google.com → {ip}')

# dnspython 사용
resolver = dns.resolver.Resolver()

# A 레코드
answers = resolver.resolve('google.com', 'A')
for rdata in answers:
    print(f'IP: {rdata.address}')

# MX 레코드
answers = resolver.resolve('google.com', 'MX')
for rdata in answers:
    print(f'Mail Server: {rdata.exchange} (Priority: {rdata.preference})')

# TXT 레코드
answers = resolver.resolve('google.com', 'TXT')
for rdata in answers:
    print(f'TXT: {rdata.strings}')
```

---

## DNS 보안

### 1. DNS Spoofing (DNS 스푸핑)

공격자가 DNS 응답을 위조하여 사용자를 가짜 사이트로 유도합니다.

```
사용자 → "bank.com IP는?"
         ↓
공격자 → "123.45.67.89" (가짜 IP 반환)
         ↓
사용자 → 피싱 사이트 접속
```

**방어 방법**:
- DNSSEC (DNS Security Extensions)
- HTTPS 사용
- 신뢰할 수 있는 DNS 서버 사용

### 2. DNS over HTTPS (DoH)

DNS 쿼리를 HTTPS로 암호화하여 프라이버시를 보호합니다.

```
일반 DNS:  평문으로 전송 → ISP가 조회 내역 확인 가능
DoH:       암호화하여 전송 → 프라이버시 보호
```

**DoH 지원 DNS**:
- Cloudflare: `https://1.1.1.1/dns-query`
- Google: `https://dns.google/dns-query`

---

## DNS 문제 해결

### 일반적인 문제

#### 1. DNS 조회 실패

```bash
# 증상
$ curl https://example.com
curl: (6) Could not resolve host: example.com

# 해결
# 1. DNS 캐시 삭제
$ sudo dscacheutil -flushcache

# 2. 다른 DNS 서버로 변경
$ dig example.com @8.8.8.8

# 3. /etc/hosts 확인
$ cat /etc/hosts
```

#### 2. DNS 전파 지연

도메인 설정을 변경한 후 즉시 반영되지 않을 수 있습니다.

```
이유: TTL 때문에 캐시된 레코드가 여전히 사용됨

해결:
1. TTL이 만료될 때까지 대기 (보통 1시간~24시간)
2. 변경 전에 TTL을 짧게 설정 (예: 300초)
3. 전파 상태 확인: https://www.whatsmydns.net/
```

#### 3. 로컬 테스트

```bash
# /etc/hosts 파일 수정으로 임시 매핑
$ sudo nano /etc/hosts

# 추가
127.0.0.1    myapp.local
192.168.1.100    staging.myapp.com

# 확인
$ ping myapp.local
```

---

## DNS 레코드 관리 예시

### Route 53 (AWS) CLI

```bash
# A 레코드 추가
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.example.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "93.184.216.34"}]
      }
    }]
  }'
```

### Cloudflare API

```bash
# DNS 레코드 생성
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "A",
    "name": "api.example.com",
    "content": "93.184.216.34",
    "ttl": 3600,
    "proxied": false
  }'
```

---

## 추가 학습 자료

- [DNS RFC 1034](https://www.ietf.org/rfc/rfc1034.txt)
- [DNS RFC 1035](https://www.ietf.org/rfc/rfc1035.txt)
- [Cloudflare Learning - DNS](https://www.cloudflare.com/learning/dns/what-is-dns/)
- [Google Public DNS](https://developers.google.com/speed/public-dns)
- [DNS Propagation Checker](https://www.whatsmydns.net/)

---

## 다음 학습

- [도메인 네임 이해하기](domain-names.md)
- [HTTPS와 보안](https-security.md)
- [호스팅 기초](hosting-basics.md)

---

*Last updated: 2026-01-05*
