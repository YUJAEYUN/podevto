# VPC Endpoint와 비용 최적화 완벽 가이드

> NAT Gateway 비용을 절반 이하로 줄이는 비밀 무기

## 목차
1. [VPC Endpoint가 왜 필요한가?](#vpc-endpoint가-왜-필요한가)
2. [Interface Endpoint vs Gateway Endpoint](#interface-endpoint-vs-gateway-endpoint)
3. [S3 Gateway Endpoint 완벽 이해](#s3-gateway-endpoint-완벽-이해)
4. [Interface Endpoint (PrivateLink) 완벽 이해](#interface-endpoint-privatelink-완벽-이해)
5. [비용 비교와 최적화 전략](#비용-비교와-최적화-전략)
6. [실전 시나리오](#실전-시나리오)

---

## VPC Endpoint가 왜 필요한가?

### 문제 상황: NAT Gateway 비용 폭탄

```
시나리오: Private Subnet의 애플리케이션이 S3 사용

❌ NAT Gateway 사용 시:

┌─────────────────────────────────────────────────────────┐
│                     VPC                                 │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ Private Subnet                                 │    │
│  │                                                │    │
│  │  ┌──────────────────┐                          │    │
│  │  │ EC2 (Lambda)     │                          │    │
│  │  │ "S3에 파일 업로드" │                          │    │
│  │  └────────┬─────────┘                          │    │
│  │           │                                    │    │
│  │           │ 1. S3 API 호출 (52.X.X.X)          │    │
│  │           │    데이터: 100GB/월                 │    │
│  └───────────┼────────────────────────────────────┘    │
│              │                                         │
│              ▼                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ Public Subnet                                  │    │
│  │                                                │    │
│  │  ┌──────────────────┐                          │    │
│  │  │  NAT Gateway     │                          │    │
│  │  │  💰 비용 폭탄!    │                          │    │
│  │  └────────┬─────────┘                          │    │
│  └───────────┼────────────────────────────────────┘    │
│              │                                         │
└──────────────┼─────────────────────────────────────────┘
               │
               ▼ Internet Gateway
               │
               ▼ Internet
               │
               ▼
         ┌─────────────┐
         │   S3 (AWS)   │
         └─────────────┘

💰 월 비용 계산:
• NAT Gateway 시간 비용: $0.045/시간 × 24 × 30 = $32.4
• 데이터 처리 비용: $0.045/GB × 100GB = $4.5
• 합계: $36.9/월 (약 ₩50,000)

😱 문제점:
• Private → Public(NAT) → Internet → S3 경로
• NAT Gateway를 거쳐야만 인터넷 접근 가능
• 같은 AWS 서비스인데도 인터넷 거쳐서 접근
• 불필요한 비용 발생!
```

### 해결책: VPC Endpoint

```
✅ VPC Endpoint 사용 시:

┌─────────────────────────────────────────────────────────┐
│                     VPC                                 │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ Private Subnet                                 │    │
│  │                                                │    │
│  │  ┌──────────────────┐                          │    │
│  │  │ EC2 (Lambda)     │                          │    │
│  │  │ "S3에 파일 업로드" │                          │    │
│  │  └────────┬─────────┘                          │    │
│  │           │                                    │    │
│  │           │ 1. S3 API 호출                      │    │
│  │           │    데이터: 100GB/월                 │    │
│  │           │                                    │    │
│  │           ▼                                    │    │
│  │      ┌─────────────────┐                       │    │
│  │      │  VPC Endpoint   │ ← AWS 내부망!         │    │
│  │      │  (Gateway)      │                       │    │
│  │      └────────┬────────┘                       │    │
│  └───────────────┼────────────────────────────────┘    │
│                  │                                     │
│                  │ AWS PrivateLink                     │
│                  │ (인터넷 안 거침!)                    │
└──────────────────┼─────────────────────────────────────┘
                   │
                   ▼ AWS 백본 네트워크
                   │
         ┌─────────────┐
         │   S3 (AWS)   │
         └─────────────┘

💰 월 비용 계산:
• VPC Endpoint (Gateway): $0 ✅
• 데이터 전송: $0 (같은 리전 내) ✅
• 합계: $0/월

😍 장점:
• Private → S3 직접 연결 (AWS 내부망)
• 인터넷 안 거침 (빠르고 안전!)
• NAT Gateway 불필요
• 비용 $36.9 → $0 (100% 절감!)
```

### VPC Endpoint의 핵심 개념

```
VPC Endpoint = AWS 서비스를 VPC 내부에서 직접 접근하는 진입점

일상 비유:
┌────────────────────────────────────────────────────┐
│ NAT Gateway = 우회 도로                            │
│  • 집(Private) → 시내(Public) → 고속도로 → 목적지 │
│  • 통행료 매번 발생 💰                             │
│                                                    │
│ VPC Endpoint = 전용 고속도로                       │
│  • 집(Private) → 전용 출구 → 목적지 (직통!)       │
│  • 통행료 무료 또는 저렴 ✅                        │
└────────────────────────────────────────────────────┘

지원하는 AWS 서비스:
• S3 (Gateway Endpoint) - 무료!
• DynamoDB (Gateway Endpoint) - 무료!
• ECR, CloudWatch, SQS, SNS, etc. (Interface Endpoint) - 유료
• 100개 이상의 AWS 서비스 지원
```

---

## Interface Endpoint vs Gateway Endpoint

### 두 가지 타입 비교

| 특성 | Gateway Endpoint | Interface Endpoint (PrivateLink) |
|------|------------------|----------------------------------|
| **지원 서비스** | S3, DynamoDB만 | ECR, CloudWatch, SQS, SNS 등 대부분 |
| **구현 방식** | 라우팅 테이블 수정 | ENI (네트워크 인터페이스) 생성 |
| **IP 주소** | 없음 (라우팅으로 처리) | Private IP 할당됨 |
| **DNS** | 서비스 기본 DNS 사용 | Endpoint 전용 DNS 생성 |
| **비용** | **무료** ✅ | 시간당 $0.01 + 데이터 전송료 💰 |
| **AZ** | AZ 무관 (VPC 전체) | AZ별로 생성 (고가용성 위해 여러 개) |
| **보안그룹** | 지원 안 함 | 지원 (세밀한 제어 가능) |
| **VPC Peering** | 지원 안 함 | 지원 |

### 동작 방식 차이

```
┌─────────────────────────────────────────────────────────┐
│              Gateway Endpoint (S3)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1️⃣ EC2가 S3 API 호출                                   │
│    aws s3 cp file.txt s3://my-bucket/                   │
│                                                         │
│ 2️⃣ DNS 조회                                            │
│    s3.ap-northeast-2.amazonaws.com → 52.X.X.X          │
│    (공인 IP로 resolve됨)                               │
│                                                         │
│ 3️⃣ 라우팅 테이블 확인                                  │
│    ┌────────────────────────────────────┐              │
│    │ Destination: pl-xxxxx (S3 prefix)  │              │
│    │ Target: vpce-gateway-xxx           │              │
│    └────────────────────────────────────┘              │
│    → VPC Endpoint로 전달 ✅                            │
│                                                         │
│ 4️⃣ AWS 백본 네트워크로 S3 접근                         │
│    (인터넷 안 거침!)                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           Interface Endpoint (ECR, SQS...)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1️⃣ EC2가 ECR API 호출                                  │
│    docker pull xxxx.dkr.ecr.region.amazonaws.com/...   │
│                                                         │
│ 2️⃣ DNS 조회 (Private DNS 활성화 시)                    │
│    ecr.ap-northeast-2.amazonaws.com                    │
│    → 10.0.1.50 (VPC Endpoint ENI의 Private IP!)        │
│                                                         │
│ 3️⃣ ENI로 직접 전송                                     │
│    ┌────────────────────────────────────┐              │
│    │ VPC Endpoint ENI                   │              │
│    │ • Private IP: 10.0.1.50            │              │
│    │ • 보안그룹 적용 가능               │              │
│    └────────────────────────────────────┘              │
│                                                         │
│ 4️⃣ AWS PrivateLink로 ECR 접근                          │
│    (인터넷 안 거침!)                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## S3 Gateway Endpoint 완벽 이해

### Gateway Endpoint 생성 과정

```
AWS Console:
VPC → Endpoints → Create Endpoint

1️⃣ 기본 설정:
   ┌────────────────────────────────────────┐
   │ Service Category: AWS services         │
   │ Service Name: com.amazonaws.ap-northeast-2.s3 │
   │ Type: Gateway ✅                       │
   └────────────────────────────────────────┘

2️⃣ VPC 선택:
   ┌────────────────────────────────────────┐
   │ VPC: vpc-abc123 (your-vpc)            │
   └────────────────────────────────────────┘

3️⃣ 라우팅 테이블 선택:
   ┌────────────────────────────────────────┐
   │ ☑ rtb-private-1 (Private Subnet 1)    │
   │ ☑ rtb-private-2 (Private Subnet 2)    │
   │                                        │
   │ → 이 라우팅 테이블들에 자동으로        │
   │   S3 Endpoint 라우트 추가됨            │
   └────────────────────────────────────────┘

4️⃣ Policy (선택사항):
   ┌────────────────────────────────────────┐
   │ Full Access (기본값) 또는              │
   │ Custom Policy (특정 버킷만 허용)       │
   └────────────────────────────────────────┘

✅ 생성 완료!
   비용: $0
   적용: 즉시
```

### 라우팅 테이블 변경 내용

```
Before (Gateway Endpoint 생성 전):

┌──────────────────────────────────────────────┐
│ Route Table: rtb-private                     │
├──────────────────────────────────────────────┤
│ Destination          Target                  │
├──────────────────────────────────────────────┤
│ 10.0.0.0/16          local                   │
│ 0.0.0.0/0            nat-gateway-xxx         │
└──────────────────────────────────────────────┘

S3 접근 시:
52.X.X.X (S3 IP) → 0.0.0.0/0 매칭 → NAT Gateway 💰

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After (Gateway Endpoint 생성 후):

┌──────────────────────────────────────────────┐
│ Route Table: rtb-private                     │
├──────────────────────────────────────────────┤
│ Destination          Target                  │
├──────────────────────────────────────────────┤
│ 10.0.0.0/16          local                   │
│ pl-78a54011          vpce-gateway-xxx ✅     │  ← 자동 추가!
│ 0.0.0.0/0            nat-gateway-xxx         │
└──────────────────────────────────────────────┘

💡 pl-78a54011 = S3의 Prefix List (IP 대역 목록)
   AWS가 관리하는 S3의 모든 IP 주소 포함

S3 접근 시:
52.X.X.X (S3 IP) → pl-78a54011 매칭 (더 구체적!)
→ VPC Endpoint ✅ 무료!

다른 인터넷 접근 시:
8.8.8.8 (구글 DNS) → 0.0.0.0/0 매칭
→ NAT Gateway (여전히 사용)
```

### S3 Endpoint Policy

```json
// Full Access (기본값)
{
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "*",
      "Resource": "*"
    }
  ]
}

// 특정 버킷만 허용 (권장)
{
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-app-bucket",
        "arn:aws:s3:::my-app-bucket/*"
      ]
    }
  ]
}

// 💡 왜 제한하나?
// • 실수로 다른 버킷 접근 방지
// • 보안 강화 (최소 권한 원칙)
// • 컴플라이언스 요구사항
```

### 실전 예시: Lambda에서 S3 사용

```python
# Lambda 함수 (Python)

import boto3

s3 = boto3.client('s3')

def lambda_handler(event, context):
    # S3에 파일 업로드
    s3.put_object(
        Bucket='my-app-bucket',
        Key='data.json',
        Body='{"test": "data"}'
    )

    return {'statusCode': 200}

# 네트워크 흐름:
# ┌────────────────────────────────────────┐
# │ Lambda (VPC 연결, Private Subnet)      │
# │   ↓                                    │
# │ VPC Endpoint (Gateway) ✅ 무료          │
# │   ↓                                    │
# │ S3 (AWS 백본 네트워크)                  │
# └────────────────────────────────────────┘
#
# vs NAT Gateway 사용 시:
# ┌────────────────────────────────────────┐
# │ Lambda (VPC 연결, Private Subnet)      │
# │   ↓                                    │
# │ NAT Gateway 💰 $0.045/GB               │
# │   ↓                                    │
# │ Internet Gateway                       │
# │   ↓                                    │
# │ S3 (공인 인터넷 경유)                   │
# └────────────────────────────────────────┘
```

---

## Interface Endpoint (PrivateLink) 완벽 이해

### Interface Endpoint가 필요한 경우

```
Gateway Endpoint는 S3, DynamoDB만 지원
다른 AWS 서비스는 Interface Endpoint 필요:

주요 서비스:
• ECR (Docker 이미지 저장소) ⭐ 필수!
• CloudWatch Logs
• SQS, SNS
• Secrets Manager
• Systems Manager (Session Manager)
• API Gateway
• ECS, EKS
• Lambda (VPC 외부 호출 시)
```

### Interface Endpoint 동작 방식

```
Interface Endpoint = ENI (Elastic Network Interface)

┌─────────────────────────────────────────────────────────┐
│                     VPC (10.0.0.0/16)                   │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ Private Subnet A (10.0.1.0/24)                 │    │
│  │                                                │    │
│  │  ┌──────────────────┐                          │    │
│  │  │ EC2              │                          │    │
│  │  │ 10.0.1.10        │                          │    │
│  │  └────────┬─────────┘                          │    │
│  │           │                                    │    │
│  │           │ docker pull ...                    │    │
│  │           ▼                                    │    │
│  │  ┌──────────────────┐                          │    │
│  │  │ VPC Endpoint ENI │ ← Interface Endpoint     │    │
│  │  │ 10.0.1.50        │                          │    │
│  │  │ (ECR)            │                          │    │
│  │  └────────┬─────────┘                          │    │
│  └───────────┼────────────────────────────────────┘    │
│              │                                         │
│  ┌───────────┼────────────────────────────────────┐    │
│  │ Private Subnet B (10.0.2.0/24)                 │    │
│  │           │                                    │    │
│  │           ▼                                    │    │
│  │  ┌──────────────────┐                          │    │
│  │  │ VPC Endpoint ENI │ ← 고가용성 위해 각 AZ에  │    │
│  │  │ 10.0.2.50        │                          │    │
│  │  │ (ECR)            │                          │    │
│  │  └────────┬─────────┘                          │    │
│  └───────────┼────────────────────────────────────┘    │
│              │                                         │
└──────────────┼─────────────────────────────────────────┘
               │
               ▼ AWS PrivateLink
               │
         ┌─────────────┐
         │     ECR     │
         └─────────────┘
```

### ECR Interface Endpoint 구성 (중요!)

```
ECS/Fargate에서 Docker 이미지 가져오려면 3개 필요:

1️⃣ com.amazonaws.region.ecr.dkr
   • Docker 레지스트리 API
   • docker pull 명령 처리

2️⃣ com.amazonaws.region.ecr.api
   • ECR 관리 API
   • 인증, 이미지 메타데이터 조회

3️⃣ com.amazonaws.region.s3 (Gateway Endpoint)
   • ECR은 실제 이미지를 S3에 저장
   • 이미지 레이어 다운로드 시 필요

┌────────────────────────────────────────────────┐
│ ECS Task (Private Subnet)                     │
│   ↓                                            │
│ 1. ecr.api → 인증 및 이미지 메타데이터         │
│   ↓                                            │
│ 2. ecr.dkr → 이미지 레이어 위치 확인           │
│   ↓                                            │
│ 3. s3 → 실제 이미지 레이어 다운로드            │
└────────────────────────────────────────────────┘

⚠️  3개 중 하나라도 없으면 이미지 다운로드 실패!
```

### Private DNS 설정

```
Private DNS = VPC Endpoint의 핵심 기능

❌ Private DNS 비활성화 시:

# 애플리케이션 코드에서 Endpoint DNS 직접 사용
aws ecr get-login-password \
  --endpoint-url https://vpce-xxx-yyy.ecr.ap-northeast-2.vpce.amazonaws.com

→ 코드 수정 필요! 😡

✅ Private DNS 활성화 시:

# 기존 코드 그대로 사용 가능
aws ecr get-login-password

→ DNS가 자동으로 VPC Endpoint로 resolve ✅

동작 방식:
┌────────────────────────────────────────────────┐
│ Private DNS 활성화:                            │
│                                                │
│ 1. VPC에 Private Hosted Zone 자동 생성         │
│    ecr.ap-northeast-2.amazonaws.com            │
│                                                │
│ 2. A 레코드 추가:                              │
│    ecr.ap-northeast-2.amazonaws.com            │
│    → 10.0.1.50, 10.0.2.50 (ENI IP)             │
│                                                │
│ 3. VPC DNS 서버 (10.0.0.2)가 자동 처리         │
│                                                │
│ 4. 애플리케이션은 변경 불필요! ✅               │
│    기존 AWS SDK 코드 그대로 동작               │
└────────────────────────────────────────────────┘

💡 권장: 항상 Private DNS 활성화
```

### 보안그룹 설정

```
Interface Endpoint는 ENI이므로 보안그룹 적용 가능

예시: ECR Endpoint 보안그룹

┌──────────────────────────────────────────────────┐
│ Security Group: sg-vpce-ecr                      │
├──────────────────────────────────────────────────┤
│ Inbound Rules:                                   │
├──────────────────────────────────────────────────┤
│ Type     Protocol  Port   Source                 │
│ HTTPS    TCP       443    10.0.0.0/16 (VPC CIDR) │
│                           또는                    │
│                           sg-ecs-tasks            │
└──────────────────────────────────────────────────┘

💡 Source를 VPC CIDR 또는 특정 보안그룹으로 제한
   불필요한 접근 차단
```

---

## 비용 비교와 최적화 전략

### 시나리오 1: ECS Fargate (Container 환경)

```
구성:
• ECS Fargate Tasks (Private Subnet)
• ECR에서 Docker 이미지 pull (1GB, 하루 10회 배포)
• CloudWatch Logs (100MB/일)
• S3 접근 (10GB/일)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ NAT Gateway만 사용:

월간 데이터:
• ECR 이미지: 1GB × 10회 × 30일 = 300GB
• CloudWatch: 0.1GB × 30일 = 3GB
• S3: 10GB × 30일 = 300GB
• 합계: 603GB

비용:
• NAT Gateway 시간: $32.4/월
• 데이터 처리: 603GB × $0.045 = $27.1/월
• 합계: $59.5/월 💰💰

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VPC Endpoint 최적화:

1. S3 Gateway Endpoint (무료)
   300GB → $0 ✅

2. ECR Interface Endpoint
   • vpce 비용: $0.01/시간 × 2 AZ × 2개 = $28.8/월
   • 데이터: 300GB × $0.01 = $3/월
   • 소계: $31.8/월

3. CloudWatch Interface Endpoint
   • vpce 비용: $0.01/시간 × 2 AZ = $14.4/월
   • 데이터: 3GB × $0.01 = $0.03/월
   • 소계: $14.4/월

4. NAT Gateway (다른 트래픽용, 최소화)
   • 거의 사용 안 함 → $5/월

합계: $51.2/월

절감: $59.5 - $51.2 = $8.3/월 (14% 절감) ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  하지만 트래픽이 더 많으면?

트래픽 10배 (6,030GB/월):

NAT Gateway: $32.4 + $271 = $303.4/월 💰💰💰

VPC Endpoint:
• S3: $0
• ECR: $28.8 + $30 = $58.8
• CloudWatch: $14.4 + $0.3 = $14.7
• NAT: $5
• 합계: $78.5/월 ✅

절감: $303.4 - $78.5 = $224.9/월 (74% 절감!) 🎉
```

### 시나리오 2: Lambda 중심 아키텍처

```
구성:
• Lambda Functions (VPC 연결, Private Subnet)
• S3 읽기/쓰기 (100GB/일)
• DynamoDB 접근 (50GB/일)
• Secrets Manager (인증 정보 조회, 소량)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ NAT Gateway만 사용:

월간 데이터:
• S3: 100GB × 30 = 3,000GB
• DynamoDB: 50GB × 30 = 1,500GB
• Secrets Manager: 1GB
• 합계: 4,501GB

비용:
• NAT Gateway: $32.4 + ($0.045 × 4,501) = $234.9/월 💰💰💰

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VPC Endpoint 최적화:

1. S3 Gateway Endpoint: $0
2. DynamoDB Gateway Endpoint: $0
3. Secrets Manager Interface Endpoint: $14.4 + $0.01 = $14.41/월
4. NAT Gateway: $5/월 (거의 안 씀)

합계: $19.41/월 ✅

절감: $234.9 - $19.41 = $215.5/월 (92% 절감!) 🎉🎉
```

### 비용 최적화 결정 플로우차트

```
┌─────────────────────────────────────┐
│ AWS 서비스 접근이 필요한가?          │
└──────────────┬──────────────────────┘
               │ Yes
               ▼
        ┌──────────────┐
        │ 어떤 서비스?  │
        └──────┬───────┘
               │
    ┌──────────┼──────────┐
    │ S3       │ DynamoDB │ 기타 (ECR, CloudWatch...)
    ▼          ▼          ▼
┌─────────┐ ┌──────────┐ ┌───────────────────────────┐
│Gateway  │ │Gateway   │ │ 데이터 전송량?            │
│Endpoint │ │Endpoint  │ └────────┬──────────────────┘
│무료 ✅  │ │무료 ✅   │          │
└─────────┘ └──────────┘   ┌──────┴──────┐
                           │ < 100GB/월  │ > 100GB/월
                           ▼             ▼
                   ┌──────────────┐ ┌──────────────────┐
                   │NAT Gateway   │ │Interface Endpoint│
                   │(저렴함)      │ │(장기적으로 저렴) │
                   └──────────────┘ └──────────────────┘

💡 경험 법칙:
• S3, DynamoDB: 무조건 Gateway Endpoint (무료!)
• 기타 서비스:
  - 데이터 < 100GB/월: NAT Gateway
  - 데이터 > 100GB/월: Interface Endpoint
  - 보안 중요: Interface Endpoint (인터넷 안 거침)
```

---

## 실전 시나리오

### 시나리오 1: 완전 Private 환경 (보안 중시)

```
요구사항:
• 모든 트래픽 인터넷 차단
• Private Subnet만 사용
• NAT Gateway도 없음 (최고 보안)

구성:
┌─────────────────────────────────────────────────────┐
│ VPC                                                 │
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ Private Subnet (NAT 없음!)                  │    │
│ │                                             │    │
│ │ ┌──────────┐  ┌──────────┐  ┌───────────┐  │    │
│ │ │   ECS    │  │ Lambda   │  │   RDS     │  │    │
│ │ └────┬─────┘  └────┬─────┘  └───────────┘  │    │
│ │      │             │                        │    │
│ │      ▼             ▼                        │    │
│ │ VPC Endpoints:                              │    │
│ │ • S3 (Gateway) - $0                         │    │
│ │ • DynamoDB (Gateway) - $0                   │    │
│ │ • ECR (Interface) - $28.8/월                │    │
│ │ • CloudWatch (Interface) - $14.4/월         │    │
│ │ • Secrets Manager (Interface) - $14.4/월    │    │
│ │ • Systems Manager (Interface) - $14.4/월    │    │
│ └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘

비용: $72/월
장점:
✅ 완전 격리 (인터넷 접근 불가)
✅ 컴플라이언스 요구사항 충족
✅ 해킹 공격 표면 최소화

단점:
❌ 외부 API 호출 불가 (Slack, PG사 등)
❌ apt-get, npm install 등 불가 (미러 서버 필요)
```

### 시나리오 2: 하이브리드 (실용적)

```
요구사항:
• 대부분 Private
• 외부 API 가끔 필요 (Slack, 결제 등)

구성:
┌─────────────────────────────────────────────────────┐
│ VPC                                                 │
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ Private Subnet                              │    │
│ │                                             │    │
│ │ ┌──────────┐  ┌──────────┐                  │    │
│ │ │   ECS    │  │ Lambda   │                  │    │
│ │ └────┬─────┘  └────┬─────┘                  │    │
│ │      │             │                        │    │
│ │      ▼             ▼                        │    │
│ │ VPC Endpoints (AWS 서비스용):               │    │
│ │ • S3, DynamoDB, ECR, CloudWatch             │    │
│ │                                             │    │
│ │      │ (외부 API 호출 시만)                 │    │
│ │      ▼                                      │    │
│ │ ┌──────────────┐                            │    │
│ │ │ NAT Gateway  │ ← 최소한만 사용            │    │
│ │ └──────────────┘                            │    │
│ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘

비용: $72 (Endpoint) + $10 (NAT) = $82/월

최적화 팁:
• AWS 서비스 → VPC Endpoint
• 외부 API → NAT Gateway
• NAT 데이터 전송량 최소화 (주요 트래픽은 Endpoint로)
```

### 시나리오 3: 비용 최소화 (스타트업)

```
요구사항:
• 비용 민감
• 트래픽 적음 (< 100GB/월)

구성:
┌─────────────────────────────────────────────────────┐
│ VPC                                                 │
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ Private Subnet                              │    │
│ │                                             │    │
│ │ ┌──────────┐                                │    │
│ │ │   EC2    │                                │    │
│ │ └────┬─────┘                                │    │
│ │      │                                      │    │
│ │      ▼                                      │    │
│ │ VPC Endpoints (무료만):                     │    │
│ │ • S3 (Gateway) - $0 ✅                      │    │
│ │ • DynamoDB (Gateway) - $0 ✅                │    │
│ │                                             │    │
│ │      │ (기타 모든 트래픽)                   │    │
│ │      ▼                                      │    │
│ │ ┌──────────────┐                            │    │
│ │ │ NAT Gateway  │                            │    │
│ │ └──────────────┘                            │    │
│ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘

비용: $0 (Endpoint) + $35 (NAT) = $35/월

전략:
• S3, DynamoDB는 무료 Endpoint 필수
• 나머지는 NAT Gateway (트래픽 적어서 저렴)
• 트래픽 증가하면 Interface Endpoint 추가 고려
```

### 실습: VPC Endpoint 생성 및 테스트

```bash
# 1️⃣ S3 Gateway Endpoint 생성
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-abc123 \
  --service-name com.amazonaws.ap-northeast-2.s3 \
  --route-table-ids rtb-private1 rtb-private2

# 2️⃣ 라우팅 테이블 확인
aws ec2 describe-route-tables --route-table-ids rtb-private1

# 출력:
# {
#   "Routes": [
#     {"DestinationCidrBlock": "10.0.0.0/16", "GatewayId": "local"},
#     {"DestinationPrefixListId": "pl-78a54011", "GatewayId": "vpce-xxx"}, ← 추가됨!
#     {"DestinationCidrBlock": "0.0.0.0/0", "NatGatewayId": "nat-xxx"}
#   ]
# }

# 3️⃣ Private Subnet EC2에서 테스트
ssh ec2-user@10.0.1.10

# S3 접근 (Endpoint 통해서)
aws s3 ls s3://my-bucket/

# 어느 경로로 가는지 확인
traceroute -n $(dig +short s3.ap-northeast-2.amazonaws.com | head -1)
# → 10.0.0.0/16 내부 IP로만 hop (NAT 안 거침!)

# 4️⃣ ECR Interface Endpoint 생성
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-abc123 \
  --vpc-endpoint-type Interface \
  --service-name com.amazonaws.ap-northeast-2.ecr.dkr \
  --subnet-ids subnet-private1 subnet-private2 \
  --security-group-ids sg-vpce \
  --private-dns-enabled

# 5️⃣ Docker pull 테스트
docker pull xxxx.dkr.ecr.ap-northeast-2.amazonaws.com/my-image:latest
# → VPC Endpoint 통해 다운로드 (NAT 안 거침!)

# 6️⃣ CloudWatch Logs 전송
aws logs create-log-stream --log-group-name /aws/app --log-stream-name test
# → VPC Endpoint 사용 (NAT 불필요)
```

---

## 핵심 정리

### 🎯 5가지 핵심 원칙

```
1️⃣ S3, DynamoDB는 무조건 Gateway Endpoint
   • 무료!
   • 성능 좋음
   • 즉시 적용 가능

2️⃣ Interface Endpoint는 비용 vs 효과 계산
   • 데이터 전송 많으면 ($100+/월) → Endpoint 저렴
   • 데이터 적으면 (<$50/월) → NAT 저렴
   • 보안 중요하면 → Endpoint 선택

3️⃣ ECR 사용 시 3개 Endpoint 필요
   • ecr.dkr (Interface)
   • ecr.api (Interface)
   • s3 (Gateway)

4️⃣ Private DNS는 항상 활성화
   • 애플리케이션 코드 수정 불필요
   • 기존 AWS SDK 그대로 동작

5️⃣ 고가용성을 위해 여러 AZ에 생성
   • Interface Endpoint는 AZ별 생성
   • 비용 2배지만 장애 대응 가능
```

### 🧠 이해도 자가 테스트

```
Q1: Gateway Endpoint와 Interface Endpoint의 가장 큰 차이는?
A1: 구현 방식. Gateway는 라우팅 테이블 수정, Interface는 ENI 생성.

Q2: S3 Gateway Endpoint의 비용은?
A2: 무료! ($0)

Q3: ECR에서 Docker 이미지 pull하려면 몇 개의 Endpoint가 필요한가?
A3: 3개. ecr.dkr, ecr.api (Interface), s3 (Gateway)

Q4: Private DNS를 활성화하는 이유는?
A4: 애플리케이션 코드 수정 없이 기존 AWS SDK로 Endpoint 사용 가능.

Q5: NAT Gateway vs VPC Endpoint, 언제 어느 것을 쓰나?
A5: 트래픽 적으면 NAT, 많으면 Endpoint. S3/DynamoDB는 무조건 Endpoint (무료).
```

---

## 다음 단계

이제 VPC Endpoint를 완벽히 이해했으니:

1. **Bastion Host / Session Manager**: Private Subnet 접속 방법
2. **VPC Peering / Transit Gateway**: 다중 VPC 연결
3. **CloudWatch + VPC Flow Logs**: 네트워크 트래픽 모니터링

다음 가이드에서 계속됩니다!

---

*마지막 업데이트: 2026-01-13*
