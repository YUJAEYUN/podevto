# 관계형 vs NoSQL 데이터베이스

## 개요

데이터베이스를 선택할 때 가장 먼저 결정해야 하는 것은 **관계형(RDBMS)** 과 **NoSQL** 중 어떤 것을 사용할지입니다.

```
데이터베이스 선택
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

관계형 DB (RDBMS)          NoSQL DB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- PostgreSQL               - MongoDB (Document)
- MySQL                    - Redis (Key-Value)
- Oracle                   - Cassandra (Column)
- MS SQL Server            - Neo4j (Graph)
```

**핵심 질문**: "내 애플리케이션에는 어떤 데이터베이스가 적합한가?"

---

## 관계형 데이터베이스 (RDBMS)

### 특징

```
테이블 구조 (행과 열)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

users
┌────┬──────┬─────────────────┐
│ id │ name │ email           │
├────┼──────┼─────────────────┤
│ 1  │ John │ john@example.com│
│ 2  │ Jane │ jane@example.com│
└────┴──────┴─────────────────┘

orders
┌────┬─────────┬────────┬────────┐
│ id │ user_id │ product│ amount │
├────┼─────────┼────────┼────────┤
│ 1  │ 1       │ Laptop │ 1000   │
│ 2  │ 1       │ Mouse  │ 20     │
└────┴─────────┴────────┴────────┘
         ↑
         └─ users.id와 연결 (Foreign Key)
```

**핵심 개념**:
- 고정된 스키마 (Schema)
- SQL 쿼리 언어
- 테이블 간 관계 (JOIN)
- ACID 속성 보장

### 장점

```
✅ 강력한 일관성
   - ACID 트랜잭션 보장
   - 데이터 무결성 강력

✅ 복잡한 쿼리
   - JOIN을 통한 다중 테이블 조회
   - 집계 함수, 서브쿼리 지원

✅ 검증된 기술
   - 40년 이상의 역사
   - 풍부한 도구와 커뮤니티

✅ 표준화
   - SQL 표준 언어
   - 데이터베이스 간 이식성
```

### 단점

```
❌ 수평 확장 어려움
   - Sharding 복잡
   - 분산 시스템 구성 어려움

❌ 스키마 변경 비용
   - 마이그레이션 필요
   - 대용량 데이터에서 ALTER TABLE 느림

❌ 성능 한계
   - 대규모 읽기/쓰기에서 병목
   - JOIN 비용 증가
```

### 언제 사용?

```
금융 시스템
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 은행 계좌 이체
- 결제 처리
- 회계 시스템
→ 트랜잭션 일관성이 중요!

전자상거래
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 주문 관리
- 재고 관리
- 사용자-주문-상품 관계
→ 데이터 무결성과 JOIN이 필요!

관리 시스템
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ERP, CRM
- HR 시스템
- 학사 관리
→ 복잡한 쿼리와 보고서!
```

---

## NoSQL 데이터베이스

### 특징

NoSQL은 "Not Only SQL"의 약자로, 관계형 모델을 따르지 않는 데이터베이스입니다.

```
NoSQL 유형
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Document DB (MongoDB)
   - JSON 형태로 데이터 저장
   - 유연한 스키마

2. Key-Value (Redis)
   - 단순한 키-값 쌍
   - 초고속 읽기/쓰기

3. Column Family (Cassandra)
   - 컬럼 기반 저장
   - 대용량 쓰기 최적화

4. Graph (Neo4j)
   - 노드와 관계 저장
   - 관계 탐색 최적화
```

### 장점

```
✅ 수평 확장 용이
   - Sharding 기본 지원
   - 노드 추가만으로 확장

✅ 유연한 스키마
   - 스키마 변경 쉬움
   - 비정형 데이터 저장 가능

✅ 빠른 읽기/쓰기
   - 단순 쿼리에서 고성능
   - 캐싱 최적화

✅ 대용량 데이터
   - 페타바이트급 데이터 처리
   - 분산 시스템 기본
```

### 단점

```
❌ 일관성 약함
   - 최종 일관성 (Eventual Consistency)
   - ACID 속성 제한적

❌ 복잡한 쿼리 어려움
   - JOIN 없음 (또는 제한적)
   - 집계 기능 부족

❌ 표준 부재
   - DB마다 다른 쿼리 언어
   - 이식성 낮음

❌ 성숙도
   - 관계형 DB보다 역사 짧음
   - 도구 생태계 작음
```

### 언제 사용?

```
소셜 미디어
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 게시물, 댓글 (비정형 데이터)
- 좋아요, 팔로우
- 실시간 피드
→ 대용량, 빠른 읽기/쓰기!

IoT / 로그 시스템
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 센서 데이터
- 애플리케이션 로그
- 모니터링 지표
→ 초당 수만 건의 쓰기!

캐싱
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 세션 저장소
- 실시간 랭킹
- 임시 데이터
→ 초고속 읽기 필요!
```

---

## 상세 비교

### 1. 데이터 모델

#### 관계형 (RDBMS)

```sql
-- 고정된 스키마
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 데이터 추가
INSERT INTO users (name, email, age)
VALUES ('John', 'john@example.com', 30);
```

**스키마 변경**:
```sql
-- 새로운 컬럼 추가 (마이그레이션 필요)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
-- 대용량 테이블에서는 시간 오래 걸림!
```

#### NoSQL (MongoDB)

```javascript
// 유연한 스키마
db.users.insertOne({
  name: "John",
  email: "john@example.com",
  age: 30,
  created_at: new Date()
});

// 스키마 변경 쉬움
db.users.insertOne({
  name: "Jane",
  email: "jane@example.com",
  age: 25,
  phone: "010-1234-5678",  // 새 필드 자유롭게 추가
  address: {                // 중첩 객체도 가능
    city: "Seoul",
    country: "Korea"
  }
});
```

---

### 2. 관계 표현

#### 관계형 (RDBMS)

```sql
-- 정규화: 데이터를 여러 테이블로 분리
users                         orders
┌────┬──────┐                ┌────┬─────────┬────────┐
│ id │ name │                │ id │ user_id │ amount │
├────┼──────┤                ├────┼─────────┼────────┤
│ 1  │ John │                │ 1  │ 1       │ 1000   │
│ 2  │ Jane │                │ 2  │ 1       │ 20     │
└────┴──────┘                │ 3  │ 2       │ 500    │
                              └────┴─────────┴────────┘

-- JOIN으로 연결
SELECT users.name, orders.amount
FROM users
JOIN orders ON users.id = orders.user_id
WHERE users.id = 1;
```

#### NoSQL (MongoDB)

```javascript
// 비정규화: 데이터를 한 문서에 포함 (Embedding)
{
  "_id": 1,
  "name": "John",
  "email": "john@example.com",
  "orders": [
    { "product": "Laptop", "amount": 1000 },
    { "product": "Mouse", "amount": 20 }
  ]
}

// 조회 (JOIN 없음)
db.users.findOne({ _id: 1 });
// → 한 번의 쿼리로 모든 데이터 조회!
```

**트레이드오프**:
```
관계형 (정규화)
✅ 데이터 중복 없음
✅ 업데이트 일관성
❌ 여러 테이블 JOIN 필요

NoSQL (비정규화)
✅ 한 번의 쿼리로 조회
✅ 빠른 읽기
❌ 데이터 중복
❌ 업데이트 시 여러 문서 수정 필요
```

---

### 3. 확장성

#### 관계형 (RDBMS)

```
수직 확장 (Vertical Scaling)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────┐
│  단일 서버      │
│  CPU: 4 → 16    │
│  RAM: 16GB → 64GB│
│  Disk: SSD 업그레이드│
└─────────────────┘

한계:
- 하드웨어 한계 존재
- 비용 기하급수적 증가
- 단일 장애점 (SPOF)
```

**읽기 복제본 (Read Replica)**:
```
Master (쓰기)
    ↓ 복제
Replica 1 (읽기)
Replica 2 (읽기)

→ 읽기 성능 향상
→ 쓰기는 여전히 Master 하나에만
```

#### NoSQL

```
수평 확장 (Horizontal Scaling)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sharding (데이터 분산)

Node 1: users 1-1000
Node 2: users 1001-2000
Node 3: users 2001-3000

장점:
✅ 노드 추가만으로 확장
✅ 무제한 확장 가능
✅ 장애 시 일부만 영향
```

---

### 4. 트랜잭션

#### 관계형 (RDBMS)

```javascript
// ACID 트랜잭션 보장
const client = await pool.connect();

try {
  await client.query('BEGIN');

  // 1. A 계좌에서 차감
  await client.query(
    'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
    [100, 1]
  );

  // 2. B 계좌에 추가
  await client.query(
    'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
    [100, 2]
  );

  await client.query('COMMIT');
  // 모두 성공하거나, 모두 실패!

} catch (error) {
  await client.query('ROLLBACK');
  throw error;
}
```

#### NoSQL (MongoDB)

```javascript
// MongoDB 4.0+ 에서 트랜잭션 지원
const session = client.startSession();

try {
  await session.withTransaction(async () => {
    await accountsCollection.updateOne(
      { _id: 1 },
      { $inc: { balance: -100 } },
      { session }
    );

    await accountsCollection.updateOne(
      { _id: 2 },
      { $inc: { balance: 100 } },
      { session }
    );
  });

  // ✅ 가능하지만, 성능 저하
  // → NoSQL의 주요 장점(속도)을 상쇄

} finally {
  await session.endSession();
}
```

**NoSQL 트랜잭션 제약**:
```
- 단일 문서: ACID 보장 O
- 여러 문서: 제한적 지원 (성능 저하)
- Sharded 환경: 더 복잡
```

---

### 5. 쿼리 복잡도

#### 관계형 (RDBMS)

```sql
-- 복잡한 쿼리 가능
SELECT
  u.name,
  COUNT(o.id) AS order_count,
  SUM(o.amount) AS total_spent,
  AVG(o.amount) AS avg_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY total_spent DESC
LIMIT 10;

-- ✅ 한 번의 쿼리로 복잡한 분석!
```

#### NoSQL (MongoDB)

```javascript
// Aggregation Pipeline (복잡하고 느림)
db.users.aggregate([
  {
    $match: {
      created_at: { $gt: new Date('2024-01-01') }
    }
  },
  {
    $lookup: {
      from: 'orders',
      localField: '_id',
      foreignField: 'user_id',
      as: 'orders'
    }
  },
  {
    $addFields: {
      order_count: { $size: '$orders' },
      total_spent: { $sum: '$orders.amount' }
    }
  },
  {
    $match: {
      order_count: { $gt: 5 }
    }
  },
  {
    $sort: { total_spent: -1 }
  },
  {
    $limit: 10
  }
]);

// ❌ 복잡하고, 관계형 DB보다 느림
```

**대안: 데이터 비정규화**
```javascript
// 사용자 문서에 통계 미리 저장
{
  "_id": 1,
  "name": "John",
  "stats": {
    "order_count": 10,
    "total_spent": 5000,
    "avg_order": 500
  }
}

// 단순 쿼리로 빠르게 조회
db.users.find({ "stats.order_count": { $gt: 5 } })
        .sort({ "stats.total_spent": -1 })
        .limit(10);

// ✅ 빠르지만, 데이터 중복과 업데이트 복잡도 증가
```

---

## 실제 사용 사례

### 사례 1: 전자상거래 플랫폼

```
요구사항
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 사용자, 상품, 주문, 결제
- 재고 관리 (정확해야 함)
- 복잡한 주문 프로세스
- 트랜잭션 필수

선택: PostgreSQL (관계형)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이유:
✅ ACID 트랜잭션 (주문-결제-재고 동시 처리)
✅ 데이터 무결성 (재고 음수 방지)
✅ 복잡한 쿼리 (매출 분석, 재고 현황)
✅ 외래 키로 관계 보장
```

```sql
-- 주문 처리 트랜잭션
BEGIN;

-- 1. 주문 생성
INSERT INTO orders (user_id, total_amount) VALUES (1, 1000);

-- 2. 재고 차감
UPDATE products
SET stock = stock - 1
WHERE id = 5 AND stock >= 1;

-- 3. 결제 처리
INSERT INTO payments (order_id, amount) VALUES (LAST_INSERT_ID(), 1000);

COMMIT;  -- 모두 성공하거나 모두 롤백!
```

### 사례 2: 소셜 미디어 피드

```
요구사항
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 수백만 사용자
- 실시간 게시물 피드
- 좋아요, 댓글 (초당 수만 건)
- 빠른 읽기 필수

선택: MongoDB (NoSQL Document)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이유:
✅ 유연한 스키마 (게시물마다 다른 구조)
✅ 빠른 읽기/쓰기
✅ 수평 확장 (Sharding)
✅ 비정규화로 JOIN 없이 조회
```

```javascript
// 게시물 문서 (모든 정보 포함)
{
  "_id": ObjectId("..."),
  "user": {
    "id": 123,
    "name": "John",
    "avatar": "https://..."
  },
  "content": "Hello World!",
  "images": ["url1", "url2"],
  "likes": 1500,
  "comments": [
    {
      "user": { "id": 456, "name": "Jane" },
      "text": "Nice post!",
      "created_at": ISODate("...")
    }
  ],
  "created_at": ISODate("...")
}

// 한 번의 쿼리로 모든 정보 조회!
db.posts.find({ "user.id": 123 }).sort({ created_at: -1 }).limit(20);
```

### 사례 3: 실시간 채팅

```
요구사항
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 실시간 메시지 전달
- 초당 수십만 메시지
- 세션 관리
- Pub/Sub 필요

선택: Redis (NoSQL Key-Value)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이유:
✅ 초고속 읽기/쓰기 (메모리 기반)
✅ Pub/Sub 기능
✅ 세션 저장소
✅ TTL로 자동 삭제
```

```javascript
const redis = require('redis');
const client = redis.createClient();

// 세션 저장 (5분 후 자동 삭제)
await client.setex('session:abc123', 300, JSON.stringify({
  userId: 1,
  username: 'john'
}));

// Pub/Sub으로 실시간 메시지
await client.publish('room:1', JSON.stringify({
  user: 'John',
  message: 'Hello!'
}));

// 구독자는 즉시 메시지 수신
client.subscribe('room:1');
client.on('message', (channel, message) => {
  console.log(`[${channel}] ${message}`);
});
```

### 사례 4: 하이브리드 접근

대부분의 대규모 애플리케이션은 **여러 데이터베이스를 함께 사용**합니다.

```
전자상거래 플랫폼 (하이브리드)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PostgreSQL (주 데이터베이스)
- 사용자, 주문, 결제, 재고
- 트랜잭션 처리

Redis (캐싱 + 세션)
- 세션 저장소
- 상품 목록 캐싱
- 장바구니 (임시 데이터)

MongoDB (로그 + 분석)
- 사용자 행동 로그
- 상품 조회 기록
- 검색 쿼리 분석

Elasticsearch (검색)
- 상품 전문 검색
- 자동 완성
```

```javascript
// Express API 예시
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  // 1. Redis에서 캐시 확인
  const cached = await redis.get(`product:${id}`);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // 2. PostgreSQL에서 조회
  const product = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );

  // 3. Redis에 캐싱 (1시간)
  await redis.setex(`product:${id}`, 3600, JSON.stringify(product.rows[0]));

  // 4. MongoDB에 조회 로그 기록
  await logsCollection.insertOne({
    product_id: id,
    user_id: req.user.id,
    timestamp: new Date()
  });

  res.json(product.rows[0]);
});
```

---

## 선택 가이드

### 의사결정 플로우

```
데이터베이스 선택
      │
      ├─ 트랜잭션이 필수적인가?
      │  (금융, 결제, 재고 관리)
      │  YES → 관계형 DB (PostgreSQL, MySQL)
      │
      ├─ 데이터 간 관계가 복잡한가?
      │  (사용자-주문-상품 등)
      │  YES → 관계형 DB
      │
      ├─ 복잡한 쿼리와 집계가 필요한가?
      │  (분석, 보고서)
      │  YES → 관계형 DB
      │
      ├─ 대용량 읽기/쓰기가 필요한가?
      │  (초당 수만 건)
      │  YES → NoSQL (MongoDB, Cassandra)
      │
      ├─ 스키마가 자주 변경되는가?
      │  (비정형 데이터)
      │  YES → NoSQL (MongoDB)
      │
      ├─ 수평 확장이 필수적인가?
      │  (페타바이트급 데이터)
      │  YES → NoSQL
      │
      └─ 초고속 캐싱이 필요한가?
         (세션, 임시 데이터)
         YES → Redis
```

### 비교표

| 기준 | 관계형 DB | NoSQL |
|------|----------|-------|
| **스키마** | 고정 (Rigid) | 유연 (Flexible) |
| **확장** | 수직 (Vertical) | 수평 (Horizontal) |
| **트랜잭션** | ACID 완전 지원 | 제한적 지원 |
| **쿼리** | SQL (복잡한 쿼리) | DB마다 다름 (단순 쿼리) |
| **일관성** | 강한 일관성 | 최종 일관성 |
| **성능** | 중간 규모에서 최적 | 대규모에서 최적 |
| **사용 사례** | 금융, 관리 시스템 | 소셜미디어, IoT, 로그 |

---

## CAP 정리

분산 시스템에서는 CAP 정리에 따라 **3가지 중 2가지만 선택** 가능합니다.

```
CAP 정리
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C - Consistency   (일관성)
    모든 노드가 같은 데이터를 가짐

A - Availability  (가용성)
    모든 요청이 응답을 받음

P - Partition Tolerance (분할 내성)
    네트워크 분할에도 동작
```

### 데이터베이스 분류

```
CP (일관성 + 분할 내성)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- PostgreSQL, MySQL (단일 노드)
- MongoDB (일관성 모드)
→ 네트워크 문제 시 가용성 희생

AP (가용성 + 분할 내성)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Cassandra
- DynamoDB
→ 일관성 희생 (최종 일관성)

CA (일관성 + 가용성)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 단일 노드 RDBMS
→ 분산 시스템이 아님
```

**실무 선택**:
```
금융 시스템 → CP (일관성 우선)
소셜 미디어 → AP (가용성 우선)
```

---

## 마이그레이션 전략

### 관계형 → NoSQL

```javascript
// Before: PostgreSQL (정규화)
users
┌────┬──────┬─────────────────┐
│ id │ name │ email           │
└────┴──────┴─────────────────┘

orders
┌────┬─────────┬────────┐
│ id │ user_id │ amount │
└────┴─────────┴────────┘

// After: MongoDB (비정규화)
{
  "_id": 1,
  "name": "John",
  "email": "john@example.com",
  "orders": [
    { "id": 1, "amount": 1000 },
    { "id": 2, "amount": 500 }
  ]
}
```

**마이그레이션 단계**:
1. 데이터 모델 재설계 (정규화 → 비정규화)
2. 양방향 쓰기 (PostgreSQL + MongoDB)
3. 검증 기간
4. 읽기 트래픽 이전
5. PostgreSQL 제거

---

## 실무 팁

### 1. 처음엔 관계형 DB

```
대부분의 경우 PostgreSQL로 시작!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이유:
✅ 검증된 기술
✅ ACID 보장
✅ 나중에 확장 가능 (pg_partman, Citus)
✅ 풍부한 도구와 커뮤니티

→ "NoSQL이 필요하다"는 확신이 들 때만 전환
```

### 2. Polyglot Persistence

```
각 데이터베이스의 강점을 활용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PostgreSQL: 핵심 비즈니스 데이터
Redis: 캐싱, 세션
MongoDB: 로그, 비정형 데이터
Elasticsearch: 검색

→ 적재적소에 사용!
```

### 3. NoSQL은 만능이 아님

```
NoSQL을 선택하기 전에 질문
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❓ 정말 초당 수만 건의 쓰기가 필요한가?
❓ 페타바이트급 데이터인가?
❓ 트랜잭션 없이도 괜찮은가?
❓ 최종 일관성으로 충분한가?

→ 모두 NO라면 관계형 DB가 더 나음!
```

---

## 추가 학습 자료

- [CAP Theorem | Martin Kleppmann](https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html)
- [NoSQL Distilled | Pramod Sadalage](https://martinfowler.com/books/nosql.html)
- [Database Internals | Alex Petrov](https://www.databass.dev/)

---

## 다음 학습

- [정규화](normalization.md)
- [MongoDB 완벽 가이드](mongodb-guide.md)
- [Redis 완벽 가이드](redis-guide.md)
- [CAP 정리](cap-theorem.md)

---

*Last updated: 2026-01-05*
