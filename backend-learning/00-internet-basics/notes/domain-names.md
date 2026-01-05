# 도메인 네임 (Domain Names)

## 도메인 네임이란?

도메인 네임은 IP 주소를 사람이 기억하기 쉬운 문자로 표현한 인터넷 주소입니다.

```
IP 주소:       93.184.216.34          ← 기억하기 어려움
도메인 네임:   www.example.com        ← 기억하기 쉬움
```

---

## 도메인 구조

도메인은 계층적 구조로 되어 있으며, 오른쪽에서 왼쪽으로 읽습니다.

```
www.blog.example.com.
 │   │    │      │  │
 │   │    │      │  └─── Root (루트)
 │   │    │      └────── TLD (Top-Level Domain)
 │   │    └───────────── SLD (Second-Level Domain)
 │   └────────────────── Subdomain (서브도메인)
 └─────────────────────── Subdomain (서브도메인)
```

### 각 레벨 설명

#### 1. Root (.)
```
.   ← 모든 도메인의 최상위
```
- 보통 생략되지만 실제로는 존재
- 전체 표기: `www.example.com.` (끝에 점)

#### 2. TLD (Top-Level Domain)
```
.com, .org, .net, .kr, .io, .dev
```
- 도메인의 가장 오른쪽 부분
- 종류: gTLD, ccTLD, sTLD

#### 3. Second-Level Domain (SLD)
```
example in example.com
google in google.com
```
- 실제로 등록하는 도메인 이름
- 고유해야 함 (같은 TLD 내에서)

#### 4. Subdomain (서브도메인)
```
www.example.com
blog.example.com
api.example.com
```
- 도메인 소유자가 자유롭게 생성 가능
- 별도의 등록 불필요

---

## TLD 종류

### 1. gTLD (Generic Top-Level Domain)

일반적인 목적으로 사용되는 TLD입니다.

| TLD     | 용도           | 특징                |
| ------- | ------------ | ----------------- |
| `.com`  | Commercial   | 가장 인기 있는 TLD, 상업용 |
| `.org`  | Organization | 비영리 조직            |
| `.net`  | Network      | 네트워크 관련           |
| `.edu`  | Education    | 교육 기관 (제한적)       |
| `.gov`  | Government   | 정부 기관 (제한적)       |
| `.info` | Information  | 정보 제공 사이트         |
| `.biz`  | Business     | 비즈니스용             |

**개발자들이 선호하는 gTLD**:
```
.io     - 기술 스타트업 (Input/Output의 약자로 인식)
.dev    - 개발자 및 프로젝트
.app    - 모바일/웹 애플리케이션
.tech   - 기술 회사
.ai     - 인공지능 관련
.cloud  - 클라우드 서비스
```

### 2. ccTLD (Country Code Top-Level Domain)

국가별 TLD입니다.

```
.kr     - 대한민국 (Korea)
.us     - 미국 (United States)
.jp     - 일본 (Japan)
.uk     - 영국 (United Kingdom)
.de     - 독일 (Germany)
.cn     - 중국 (China)
.fr     - 프랑스 (France)
```

**한국 도메인 예시**:
```
.kr             - 일반 한국 도메인
.co.kr          - 기업용
.or.kr          - 비영리 단체
.ac.kr          - 대학교
.go.kr          - 정부 기관
```

### 3. sTLD (Sponsored Top-Level Domain)

특정 조직이나 커뮤니티를 위한 TLD입니다.

```
.edu    - 교육 기관
.gov    - 정부
.mil    - 군사
.museum - 박물관
.aero   - 항공 산업
```

---

## 서브도메인 (Subdomain)

도메인 앞에 추가하는 접두사입니다.

### 일반적인 서브도메인 사용 패턴

```
www.example.com         - 메인 웹사이트
api.example.com         - REST API 서버
blog.example.com        - 블로그
docs.example.com        - 문서 사이트
shop.example.com        - 온라인 스토어
admin.example.com       - 관리자 패널
dev.example.com         - 개발 환경
staging.example.com     - 스테이징 환경
cdn.example.com         - CDN 엔드포인트
mail.example.com        - 메일 서버
```

### 환경별 서브도메인

```
production:   app.example.com
staging:      staging.example.com
development:  dev.example.com
testing:      test.example.com
```

### 지역별 서브도메인

```
us.example.com          - 미국
eu.example.com          - 유럽
asia.example.com        - 아시아
kr.example.com          - 한국
```

### 다단계 서브도메인

```
api.v2.example.com      - API 버전 2
admin.beta.example.com  - 베타 관리자 패널
user.api.example.com    - 사용자 API
```

---

## 도메인 등록 과정

### 1. 도메인 검색

원하는 도메인이 사용 가능한지 확인합니다.

```bash
# whois로 확인
$ whois example.com

# 또는 등록 대행사 웹사이트에서 검색
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare Registrar
- 가비아 (한국)
```

### 2. 도메인 선택 팁

```
✓ 짧고 기억하기 쉬운 이름
✓ 철자가 간단한 이름
✓ 브랜드와 일치하는 이름
✓ .com 우선 고려 (가장 인식도 높음)

✗ 하이픈(-) 사용 지양
✗ 숫자 사용 지양
✗ 너무 긴 이름
✗ 상표권 침해 가능성
```

### 3. 등록 및 결제

```
1. 등록 대행사 선택
   └─ 가격, 서비스, UI 비교

2. 도메인 등록
   └─ 보통 1년 단위로 결제

3. 등록자 정보 입력
   └─ WHOIS 개인정보 보호 옵션 추천

4. 네임서버 설정
   └─ 호스팅 제공자의 네임서버 또는
      Cloudflare 등 DNS 서비스
```

---

## 도메인 설정

### 네임서버 설정

도메인을 구매한 후 DNS를 관리할 네임서버를 지정합니다.

```
도메인 등록: GoDaddy
DNS 관리:    Cloudflare

GoDaddy에서 네임서버 변경:
ns1.cloudflare.com
ns2.cloudflare.com
```

### DNS 레코드 추가

```
# 웹 서버 연결
example.com           A      93.184.216.34
www.example.com       A      93.184.216.34

# API 서버
api.example.com       A      104.26.10.123

# 메일 서버
example.com           MX     10 mail.example.com
mail.example.com      A      93.184.216.50

# 도메인 인증 (SPF, DKIM)
example.com           TXT    "v=spf1 include:_spf.google.com ~all"
```

---

## 도메인 관리

### WHOIS 정보

도메인 소유자 정보를 공개하는 데이터베이스입니다.

```bash
$ whois example.com

Domain Name: EXAMPLE.COM
Registry Domain ID: 2336799_DOMAIN_COM-VRSN
Registrar: RESERVED-Internet Assigned Numbers Authority
Registrar WHOIS Server: whois.iana.org
Updated Date: 2024-08-14T07:01:31Z
Creation Date: 1995-08-14T04:00:00Z
Registry Expiry Date: 2025-08-13T04:00:00Z
```

**WHOIS 개인정보 보호**:
- 대부분의 등록 대행사가 무료 제공
- 실제 정보 대신 대행사 정보 표시
- 개인 도메인은 필수적으로 활성화 권장

### 도메인 갱신

```
만료 전 알림:  30일, 15일, 7일, 1일
자동 갱신:     권장 (도메인 손실 방지)
유예 기간:     만료 후 약 30일 (등록 대행사마다 다름)
삭제 대기:     유예 기간 이후 약 5일
```

**주의사항**:
- 도메인이 만료되면 웹사이트와 이메일이 작동 중지
- 삭제되면 다른 사람이 등록 가능
- 자동 갱신 설정 강력 권장

### 도메인 이전 (Transfer)

```
1. 이전 준비
   - 등록한 지 60일 이상 경과 확인
   - 도메인 잠금 해제
   - 인증 코드 (EPP Code) 발급

2. 새 등록 대행사에서 이전 신청
   - 인증 코드 입력
   - 이전 비용 결제 (보통 1년 연장 포함)

3. 승인
   - 이전 승인 이메일 확인
   - 보통 5~7일 소요
```

---

## 실무 예제

### Express.js 서브도메인 라우팅

```javascript
const express = require('express');
const app = express();

// 서브도메인별 처리
app.use((req, res, next) => {
  const host = req.hostname;

  if (host === 'api.example.com') {
    // API 서버 로직
    return res.json({ message: 'API Server' });
  }

  if (host === 'blog.example.com') {
    // 블로그 서버 로직
    return res.send('Blog');
  }

  // 메인 도메인
  res.send('Main Website');
});

app.listen(3000);
```

### subdomain 패키지 사용

```javascript
const express = require('express');
const subdomain = require('express-subdomain');
const app = express();

// API 서브도메인 라우터
const apiRouter = express.Router();
apiRouter.get('/', (req, res) => {
  res.json({ message: 'API Server' });
});

// 블로그 서브도메인 라우터
const blogRouter = express.Router();
blogRouter.get('/', (req, res) => {
  res.send('Blog Homepage');
});

// 서브도메인 연결
app.use(subdomain('api', apiRouter));
app.use(subdomain('blog', blogRouter));

// 메인 도메인
app.get('/', (req, res) => {
  res.send('Main Website');
});

app.listen(3000);
```

### Nginx 서브도메인 설정

```nginx
# api.example.com
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
}

# blog.example.com
server {
    listen 80;
    server_name blog.example.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
    }
}

# www.example.com & example.com
server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

---

## 도메인 네이밍 전략

### 스타트업/제품

```
Good:
✓ stripe.com      - 짧고 기억하기 쉬움
✓ slack.com       - 단순하고 발음하기 쉬움
✓ vercel.com      - 독특하고 현대적

Avoid:
✗ myawesomeapp123.com    - 너무 길고 복잡
✗ best-app-ever.com      - 하이픈 사용
✗ AwesomeApp.com         - 대소문자 혼용 (혼란 가능)
```

### API 엔드포인트

```
api.example.com              ← 가장 일반적
api-v1.example.com           ← 버전 관리
{region}.api.example.com     ← 지역별
developer.example.com        ← 개발자 포털
```

### 개발/스테이징 환경

```
dev.example.com
staging.example.com
test.example.com
preview-{pr-number}.example.com   ← PR별 프리뷰
```

---

## 도메인 보안

### 1. 도메인 잠금 (Domain Lock)

```
등록 대행사에서 도메인 잠금 활성화
→ 무단 이전 방지
```

### 2. 2FA (Two-Factor Authentication)

```
등록 대행사 계정에 2FA 설정
→ 계정 해킹 방지
```

### 3. DNSSEC

```
DNS 위조 방지를 위한 보안 확장
일부 TLD와 등록 대행사에서 지원
```

### 4. 자동 갱신

```
도메인 만료로 인한 손실 방지
결제 수단 정기적으로 확인
```

---

## 도메인 비용

### 일반적인 가격대 (연간)

```
.com        $10-15
.net        $12-17
.org        $12-17
.io         $30-60
.dev        $12-15
.app        $12-15
.ai         $80-100
.co         $20-30

.kr         ₩15,000-20,000
.co.kr      ₩18,000-25,000
```

**주의**:
- 첫 해 할인 후 갱신 비용이 다를 수 있음
- 프리미엄 도메인은 훨씬 비쌀 수 있음

---

## 유용한 도구

### 도메인 검색

```
- Namecheap Beast Mode: 한 번에 여러 도메인 검색
- Lean Domain Search: 키워드 조합 제안
- Domainr: 짧은 도메인 검색
```

### 도메인 평가

```
- EstiBot: 도메인 가치 평가
- GoDaddy Appraisal: 도메인 시장 가치
```

### DNS 도구

```
- DNSChecker: 전 세계 DNS 전파 확인
- MXToolbox: DNS 레코드 조회 및 검증
- WhatsMyDNS: DNS 전파 상태 확인
```

---

## 주요 도메인 등록 대행사

### 글로벌

```
- Namecheap      → 저렴한 가격, 무료 WHOIS 보호
- Cloudflare     → 원가 제공, 우수한 DNS
- Google Domains → 간단한 UI, 구글 통합
- GoDaddy        → 가장 큰 등록 대행사
- Name.com       → 개발자 친화적
```

### 한국

```
- 가비아         → 한국 최대 도메인 등록 대행사
- 후이즈         → .kr 도메인 전문
- 카페24         → 호스팅과 통합
```

---

## 추가 학습 자료

- [ICANN - 도메인 관리 기구](https://www.icann.org/)
- [IANA - TLD 목록](https://www.iana.org/domains/root/db)
- [한국인터넷진흥원 (KISA)](https://www.kisa.or.kr/)
- [도메인 네이밍 가이드](https://www.namecheap.com/domains/domain-name-generator/)

---

## 다음 학습

- [DNS 완벽 가이드](dns-guide.md)
- [호스팅 기초](hosting-basics.md)
- [HTTPS와 보안](https-security.md)

---

*Last updated: 2026-01-05*
