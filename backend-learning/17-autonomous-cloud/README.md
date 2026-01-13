# AWS 클라우드 & 네트워킹 완벽 가이드

> 클라우드 인프라와 AWS 네트워킹을 처음부터 끝까지 체계적으로 학습하는 로드맵

## 📚 학습 목표

이 폴더는 다음을 학습하기 위한 자료입니다:
- AWS VPC와 네트워킹 개념 완벽 이해
- 클라우드 인프라 아키텍처 설계 능력
- 실무에서 바로 적용 가능한 AWS 서비스 활용
- 비용 최적화 전략
- 보안 강화 방법

---

## 🗺️ 학습 로드맵

### Phase 1: 기초 개념 (필수)

이 단계를 건너뛰지 마세요! 모든 것의 기반이 됩니다.

#### 1️⃣ [cloud-infrastructure-basics.md](notes/cloud-infrastructure-basics.md)
**학습 시간: 2-3시간**

클라우드 컴퓨팅의 기초 개념을 배웁니다.

**배우는 것:**
- 클라우드 vs 온프레미스
- IaaS, PaaS, SaaS 차이
- 리전, 가용영역(AZ) 개념
- AWS 주요 서비스 개요

**완료 기준:**
- [ ] 클라우드의 3가지 서비스 모델 설명 가능
- [ ] 리전과 AZ의 차이 이해
- [ ] EC2, S3, RDS가 무엇인지 설명 가능

---

#### 2️⃣ [aws-vpc-networking.md](notes/aws-vpc-networking.md)
**학습 시간: 3-4시간**

VPC의 전체적인 구조를 이해합니다.

**배우는 것:**
- VPC란 무엇인가
- CIDR 블록과 IP 대역
- 서브넷 개념
- 기본 네트워크 구조

**완료 기준:**
- [ ] VPC가 왜 필요한지 설명 가능
- [ ] 10.0.0.0/16 같은 CIDR 표기 이해
- [ ] Public/Private 서브넷 개념 이해

---

### Phase 2: 핵심 네트워킹 (중요!)

이 단계가 가장 중요합니다. 여기서 모든 헷갈림이 해결됩니다.

#### 3️⃣ [aws-route-table-guide.md](notes/aws-route-table-guide.md) ⭐
**학습 시간: 4-5시간 | 난이도: ★★★★☆**

**가장 중요한 문서입니다!** 이것을 이해하면 VPC의 90%를 이해한 것입니다.

**배우는 것:**
- 라우팅 테이블이 어떻게 동작하는가
- IGW와 NAT Gateway의 진짜 차이 (라우팅으로 결정!)
- Public/Private 서브넷의 진실
- 패킷이 실제로 이동하는 경로

**왜 중요한가:**
```
"공인IP만 있으면 인터넷 되는 거 아닌가?"
"IGW와 NAT Gateway 차이가 뭐야?"
"Private에서 Public으로 통신 가능해?"

→ 이 모든 질문의 답이 "라우팅 테이블"에 있습니다!
```

**완료 기준:**
- [ ] 라우팅 테이블 규칙 읽을 수 있음
- [ ] 0.0.0.0/0 → IGW의 의미 이해
- [ ] Public 서브넷 = IGW 라우트가 있는 서브넷 이해
- [ ] 패킷 흐름을 라우팅 테이블 기반으로 설명 가능

**실습:**
- AWS Console에서 라우팅 테이블 직접 확인
- EC2에서 `ip route` 명령으로 로컬 라우팅 확인
- traceroute로 패킷 경로 추적

---

#### 4️⃣ [aws-security-group-vs-nacl.md](notes/aws-security-group-vs-nacl.md)
**학습 시간: 3-4시간 | 난이도: ★★★★☆**

라우팅 테이블이 "경로"라면, 보안그룹/NACL은 "검문소"입니다.

**배우는 것:**
- 보안그룹 (Stateful) vs NACL (Stateless)
- Ephemeral Port 개념 (중요!)
- 보안 계층화 전략
- 실전 시나리오별 설정

**왜 중요한가:**
```
"Stateful과 Stateless가 뭐가 다른데?"
"왜 NACL Outbound에 1024-65535를 열어야 해?"

→ 연결 추적의 유무가 모든 것을 결정합니다!
```

**완료 기준:**
- [ ] Stateful vs Stateless 차이 설명 가능
- [ ] Ephemeral Port가 무엇인지 이해
- [ ] 3-Tier 아키텍처 보안그룹 설계 가능
- [ ] NACL은 언제 쓰는지 판단 가능

---

#### 5️⃣ [aws-ip-address-guide.md](notes/aws-ip-address-guide.md)
**학습 시간: 2-3시간 | 난이도: ★★★☆☆**

IP 주소 종류와 비용을 완벽히 이해합니다.

**배우는 것:**
- Private IP, Public IP, Elastic IP 차이
- IGW의 1:1 NAT 변환 원리
- Elastic IP 비용 함정
- 비용 최적화 전략

**완료 기준:**
- [ ] EC2 내부에서 Public IP가 안 보이는 이유 이해
- [ ] Elastic IP 비용 정책 이해 (미사용 시 과금!)
- [ ] 상황별 IP 선택 기준 판단 가능

---

### Phase 3: 로드밸런서와 고가용성

#### 6️⃣ [aws-load-balancer-guide.md](notes/aws-load-balancer-guide.md) ⭐
**학습 시간: 4-5시간 | 난이도: ★★★★☆**

**실무에서 가장 많이 쓰는 서비스입니다.**

**배우는 것:**
- ALB vs NLB vs CLB 완벽 비교
- 서버 1대여도 ALB가 필요한 이유 (핵심!)
- Health Check와 Connection Draining
- Path 기반 라우팅, SSL 종료
- 무중단 배포 구성

**왜 중요한가:**
```
"서버 1대인데 로드밸런서가 필요해?"
"IGW만으로는 안 돼?"

→ ALB는 단순 부하 분산이 아닙니다!
   - 무중단 배포
   - 자동 장애 복구
   - SSL 관리 간소화
   - 고정 DNS 제공
```

**완료 기준:**
- [ ] ALB vs NLB 선택 기준 이해
- [ ] Target Group과 Health Check 이해
- [ ] Connection Draining 동작 방식 이해
- [ ] 서버 1대 환경에서 ALB 필요성 설명 가능

**실습:**
- ALB 생성 및 EC2 연결
- Path 기반 라우팅 설정 (/api, /web)
- Health Check 실패 시나리오 테스트

---

### Phase 4: 비용 최적화 (필수!)

#### 7️⃣ [aws-vpc-endpoint-guide.md](notes/aws-vpc-endpoint-guide.md) ⭐
**학습 시간: 3-4시간 | 난이도: ★★★★☆**

**월 비용을 절반 이하로 줄이는 비밀 무기!**

**배우는 것:**
- Gateway Endpoint vs Interface Endpoint
- S3, DynamoDB는 무료 Endpoint (필수!)
- ECR Interface Endpoint 구성 (ECS/Fargate 필수)
- 비용 계산 및 최적화 전략

**왜 중요한가:**
```
NAT Gateway 비용 폭탄 해결!

Before:
- NAT Gateway: $32.4/월
- 데이터 전송 (300GB): $13.5/월
- 합계: $45.9/월 💰💰

After (VPC Endpoint):
- S3 Gateway: $0 ✅
- ECR Interface: $28.8/월
- 데이터 전송: $3/월
- 합계: $31.8/월 ✅

절감: $14.1/월 (30%)
```

**완료 기준:**
- [ ] Gateway vs Interface Endpoint 차이 이해
- [ ] S3, DynamoDB는 무조건 Gateway Endpoint 사용
- [ ] ECR 사용 시 3개 Endpoint 필요 이해
- [ ] 비용 계산 및 최적화 판단 가능

**실습:**
- S3 Gateway Endpoint 생성 (무료!)
- 라우팅 테이블 변경 확인
- Private Subnet에서 S3 접근 테스트

---

### Phase 5: 운영과 관리

#### 8️⃣ [aws-private-access-guide.md](notes/aws-private-access-guide.md)
**학습 시간: 3-4시간 | 난이도: ★★★☆☆**

Private 서브넷에 어떻게 접속하고 관리하는가?

**배우는 것:**
- Bastion Host vs Session Manager 완벽 비교
- SSH 터널링과 포트 포워딩
- RDS 접속 방법
- 보안 강화 전략

**완료 기준:**
- [ ] Bastion Host 동작 방식 이해
- [ ] Session Manager 장점 이해 (권장 방식)
- [ ] RDS 포트 포워딩으로 로컬 접속 가능
- [ ] 상황별 접속 방법 선택 가능

**실습:**
- Session Manager로 Private EC2 접속
- SSH 터널로 RDS 접속 (로컬 GUI 도구 사용)

---

#### 9️⃣ [autonomous-cloud-fundamentals.md](notes/autonomous-cloud-fundamentals.md)
**학습 시간: 2-3시간 | 난이도: ★★★☆☆**

전체 개념을 통합하고 자동화를 학습합니다.

**배우는 것:**
- Infrastructure as Code (IaC)
- AWS CLI 활용
- CloudFormation / Terraform 소개
- 모니터링과 알람

**완료 기준:**
- [ ] IaC의 필요성 이해
- [ ] AWS CLI로 기본 작업 수행 가능
- [ ] CloudWatch 알람 설정 가능

---

## 🎯 학습 순서 요약

```
필수 순서:

1. cloud-infrastructure-basics.md          (클라우드 기초)
   ↓
2. aws-vpc-networking.md                   (VPC 개요)
   ↓
3. aws-route-table-guide.md ⭐⭐⭐         (가장 중요!)
   ↓
4. aws-security-group-vs-nacl.md           (보안 계층)
   ↓
5. aws-ip-address-guide.md                 (IP 이해)
   ↓
6. aws-load-balancer-guide.md ⭐⭐         (실무 필수)
   ↓
7. aws-vpc-endpoint-guide.md ⭐            (비용 절감)
   ↓
8. aws-private-access-guide.md             (운영 관리)
   ↓
9. autonomous-cloud-fundamentals.md        (자동화)
```

### ⏱️ 총 학습 시간

- **빠른 학습**: 20-25시간 (읽기만)
- **실습 포함**: 30-40시간 (권장)
- **완벽 마스터**: 50-60시간 (프로젝트 포함)

---

## 💡 학습 팁

### 1. 순서를 지키세요
- 특히 1→2→3번은 반드시 순서대로!
- 라우팅 테이블(3번)을 이해하면 나머지가 쉬워집니다

### 2. 실습이 필수입니다
- AWS 프리티어로 직접 해보기
- 비용 걱정 마세요: 대부분 무료 또는 월 $10 이내

### 3. 개념을 그려보세요
- 네트워크 다이어그램을 직접 그리기
- 패킷 흐름을 화살표로 표시
- 라우팅 테이블을 표로 정리

### 4. 질문을 만들어보세요
```
❌ "VPC가 뭐지?"
✅ "VPC 없이 EC2를 쓰면 어떤 문제가 생기지?"

❌ "NAT Gateway가 뭐지?"
✅ "Private Subnet이 S3에 접근할 때 패킷이 어떤 경로로 가지?"
```

### 5. 비용을 계산해보세요
- 각 문서의 비용 섹션을 꼼꼼히 읽기
- 자신의 프로젝트에 적용하면 얼마나 드는지 계산
- 최적화 방법 찾기

---

## 🔥 핵심 개념 정리

학습 후 이것들을 설명할 수 있어야 합니다:

### 라우팅과 네트워크
- [ ] Public 서브넷 = IGW 라우트가 있는 서브넷
- [ ] Private 서브넷 = IGW 라우트가 없는 서브넷
- [ ] 같은 VPC 내 서브넷끼리는 `local` 라우트로 직접 통신
- [ ] NAT Gateway는 N:1 변환, IGW는 1:1 변환

### 보안
- [ ] 보안그룹은 Stateful (응답 자동 허용)
- [ ] NACL은 Stateless (응답도 별도 허용 필요)
- [ ] Ephemeral Port (1024-65535)는 응답용

### IP와 연결
- [ ] Public IP는 EC2 내부에서 안 보임 (IGW가 변환)
- [ ] Elastic IP는 미사용 시 과금 ($3.6/월)

### 로드밸런서
- [ ] 서버 1대여도 ALB 가치 있음 (무중단 배포, 자동 복구, SSL)
- [ ] Health Check는 서버 상태 자동 감지
- [ ] Connection Draining은 안전한 서버 제거

### 비용 최적화
- [ ] S3, DynamoDB는 Gateway Endpoint 필수 (무료!)
- [ ] 데이터 전송 많으면 Interface Endpoint 고려
- [ ] NAT Gateway 비용 주의 ($32.4/월 + 데이터 전송료)

---

## 📊 학습 체크리스트

### Phase 1: 기초 (3-4일)
- [ ] cloud-infrastructure-basics.md 완료
- [ ] aws-vpc-networking.md 완료
- [ ] 프리티어 계정 생성
- [ ] VPC 하나 직접 만들어보기

### Phase 2: 핵심 (5-7일)
- [ ] aws-route-table-guide.md 완료 ⭐
- [ ] aws-security-group-vs-nacl.md 완료
- [ ] aws-ip-address-guide.md 완료
- [ ] Public/Private 서브넷 구성 실습
- [ ] EC2 2대로 통신 테스트

### Phase 3: 실무 (3-5일)
- [ ] aws-load-balancer-guide.md 완료
- [ ] aws-vpc-endpoint-guide.md 완료
- [ ] ALB + EC2 구성 실습
- [ ] S3 Gateway Endpoint 설정

### Phase 4: 운영 (2-3일)
- [ ] aws-private-access-guide.md 완료
- [ ] autonomous-cloud-fundamentals.md 완료
- [ ] Session Manager 설정
- [ ] RDS 접속 테스트

### 최종 프로젝트 (3-5일)
- [ ] 3-Tier 아키텍처 구성
  - Public Subnet: ALB
  - Private Subnet 1: Web/App Server
  - Private Subnet 2: RDS
- [ ] VPC Endpoint 설정 (S3, ECR)
- [ ] Session Manager 설정
- [ ] 비용 계산 및 최적화

---

## 🚀 실습 환경 구성

### AWS 프리티어 활용

**무료 사용 가능:**
- VPC, 서브넷, 라우팅 테이블: 무료
- 보안그룹, NACL: 무료
- S3 Gateway Endpoint: 무료
- EC2 t2.micro/t3.micro: 월 750시간 무료
- ALB: 첫 15LCU 무료 (충분함)

**비용 발생 (최소화 방법):**
- NAT Gateway: $32.4/월 → 학습 시에만 켜기
- Interface Endpoint: $0.01/시간 → 필요할 때만
- Elastic IP (미사용): $0.005/시간 → 사용 안 하면 즉시 Release

**권장 예산:**
- 학습 기간 (1-2개월): $20-30/월
- 항상 켜놓고 공부: $50-70/월

### 비용 절감 팁
```bash
# 실습 끝나면 반드시:
1. EC2 중지 (Stop)
2. NAT Gateway 삭제
3. Interface Endpoint 삭제
4. 미사용 Elastic IP Release
5. ALB 삭제 (필요 시)

# CloudWatch 알람 설정:
- 월 $10 초과 시 알림
- 미사용 리소스 감지
```

---

## 📚 추가 학습 자료

### AWS 공식 문서
- [AWS VPC 사용 설명서](https://docs.aws.amazon.com/vpc/)
- [VPC Peering 가이드](https://docs.aws.amazon.com/vpc/latest/peering/)
- [AWS 요금 계산기](https://calculator.aws/)

### 실습 튜토리얼
- [AWS 핸즈온 랩](https://aws.amazon.com/getting-started/hands-on/)
- [AWS Workshop](https://workshops.aws/)

### 커뮤니티
- AWS 한국 사용자 그룹
- AWS re:Post (공식 Q&A)
- Reddit r/aws

---

## 🎓 학습 후 다음 단계

### 1. 실전 프로젝트 배포
- 자신의 애플리케이션을 AWS에 배포
- 3-Tier 아키텍처 구성
- 비용 최적화 적용

### 2. 자격증 준비
- AWS Certified Solutions Architect - Associate
- 이 폴더의 내용이 80% 커버함

### 3. 고급 주제
- VPC Peering / Transit Gateway
- Direct Connect / VPN
- CloudFront + WAF
- EKS (Kubernetes)

### 4. DevOps 도구 연계
- Terraform으로 IaC 구현
- CI/CD 파이프라인 구축
- 모니터링 자동화

---

## 💬 피드백 & 질문

이 학습 자료는 실제 질문과 학습 과정에서 나온 내용을 바탕으로 작성되었습니다.

**개선 사항이나 추가 질문이 있다면:**
- 학습 중 막히는 부분을 메모하기
- 실습에서 에러 났을 때 원인 파악하기
- 비용 최적화 아이디어 공유하기

---

## ⚡ Quick Start

바쁘신 분들을 위한 최소 학습 경로:

```
1일차 (4시간):
- cloud-infrastructure-basics.md (2h)
- aws-vpc-networking.md (2h)

2일차 (5시간):
- aws-route-table-guide.md (5h) ⭐⭐⭐

3일차 (4시간):
- aws-security-group-vs-nacl.md (2h)
- aws-ip-address-guide.md (2h)

4일차 (5시간):
- aws-load-balancer-guide.md (3h)
- 실습: ALB + EC2 (2h)

5일차 (4시간):
- aws-vpc-endpoint-guide.md (2h)
- aws-private-access-guide.md (2h)

총: 22시간 (5일)
```

---

**시작일:** ________

**목표 완료일:** ________

**실제 완료일:** ________

---

*마지막 업데이트: 2026-01-13*
