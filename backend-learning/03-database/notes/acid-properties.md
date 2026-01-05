# ACID 속성

## ACID란?

**ACID**는 데이터베이스 트랜잭션이 안전하게 처리되기 위해 보장해야 하는 4가지 속성입니다.

```
A - Atomicity    (원자성)
C - Consistency  (일관성)
I - Isolation    (격리성)
D - Durability   (지속성)
```

트랜잭션이 ACID 속성을 만족하면, 데이터베이스의 **무결성**과 **신뢰성**이 보장됩니다.

---

## 트랜잭션이란?

**트랜잭션(Transaction)** 은 데이터베이스에서 하나의 논리적 작업 단위입니다.

```
은행 송금 예시
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A 계좌에서 B 계좌로 100원 송금

1. A 계좌 잔액 확인 (1000원)
2. A 계좌에서 100원 차감 (→ 900원)
3. B 계좌 잔액 확인 (500원)
4. B 계좌에 100원 추가 (→ 600원)

→ 이 4가지 작업은 하나의 트랜잭션
   전부 성공하거나, 전부 실패해야 함!
```

---

## A - Atomicity (원자성)

**"전부 아니면 전무" (All or Nothing)**

트랜잭션의 모든 작업이 완전히 실행되거나, 하나도 실행되지 않아야 합니다.

### 원자성이 없다면?

```
송금 트랜잭션 실패 예시
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. A 계좌에서 100원 차감 (성공) → 900원
2. [시스템 장애 발생!]
3. B 계좌에 100원 추가 (실패)

결과: 100원이 사라짐! 😱
```

### 원자성 보장

```sql
BEGIN TRANSACTION;

-- A 계좌에서 차감
UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- B 계좌에 추가
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- 모두 성공하면 커밋
COMMIT;

-- 하나라도 실패하면 롤백
-- ROLLBACK;
```

```
원자성 보장 시
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 두 작업 모두 성공 → COMMIT
  A: 900원, B: 600원

✗ 하나라도 실패 → ROLLBACK
  A: 1000원, B: 500원 (원래대로 복구)
```

### Node.js 예시

```javascript
const pool = require('./db');

async function transfer(fromId, toId, amount) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // A 계좌 차감
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromId]
    );

    // B 계좌 추가
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toId]
    );

    await client.query('COMMIT');
    console.log('송금 완료');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('송금 실패, 롤백됨:', error);
    throw error;

  } finally {
    client.release();
  }
}
```

---

## C - Consistency (일관성)

**"트랜잭션 전후로 데이터베이스가 일관된 상태를 유지해야 함"**

데이터베이스의 제약 조건(constraints)을 항상 만족해야 합니다.

### 일관성 예시

```sql
-- 제약 조건
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    balance DECIMAL(10, 2) NOT NULL CHECK (balance >= 0)  ← 잔액은 0 이상
);
```

```
일관성 위반 시도
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A 계좌 잔액: 50원
송금 시도: 100원

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
→ balance = -50원 (음수!)

✗ 제약 조건 위반! 트랜잭션 롤백
```

### 일관성 규칙

```
비즈니스 규칙 예시
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 계좌 잔액은 항상 0 이상
2. 송금 전후 전체 금액의 합은 동일
3. 이메일은 고유해야 함 (UNIQUE)
4. 외래 키 관계 유지 (FOREIGN KEY)
```

---

## I - Isolation (격리성)

**"동시에 실행되는 트랜잭션들이 서로 영향을 주지 않음"**

여러 트랜잭션이 동시에 실행되어도, 각 트랜잭션은 독립적으로 실행되는 것처럼 보여야 합니다.

### 격리성이 없다면?

```
동시 송금 문제
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

초기 상태: A 계좌 = 1000원

[트랜잭션 1]           [트랜잭션 2]
읽기: 1000원
                       읽기: 1000원
차감 100원 → 900원
저장: 900원
                       차감 200원 → 800원
                       저장: 800원 (900원 덮어씀!)

결과: 800원 (100원 차감이 무시됨!) 😱
```

### 격리 수준 (Isolation Levels)

```
격리 수준 (낮음 → 높음)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. READ UNCOMMITTED
   - 커밋되지 않은 데이터 읽기 가능
   - 문제: Dirty Read

2. READ COMMITTED (PostgreSQL 기본값)
   - 커밋된 데이터만 읽기
   - 문제: Non-Repeatable Read

3. REPEATABLE READ (MySQL 기본값)
   - 같은 데이터를 여러 번 읽어도 동일
   - 문제: Phantom Read

4. SERIALIZABLE (가장 엄격)
   - 완전히 직렬화된 실행
   - 문제: 성능 저하
```

### 격리 수준 설정

```sql
-- PostgreSQL
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 트랜잭션 시작 시 지정
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

### Node.js 예시

```javascript
async function transfer(fromId, toId, amount) {
  const client = await pool.connect();

  try {
    // 격리 수준 설정
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
    await client.query('BEGIN');

    // 잔액 조회 및 검증
    const result = await client.query(
      'SELECT balance FROM accounts WHERE id = $1 FOR UPDATE',
      [fromId]  // FOR UPDATE: 행 잠금
    );

    if (result.rows[0].balance < amount) {
      throw new Error('잔액 부족');
    }

    // 송금 처리
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromId]
    );

    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toId]
    );

    await client.query('COMMIT');

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

---

## D - Durability (지속성)

**"커밋된 트랜잭션은 영구적으로 저장됨"**

트랜잭션이 성공적으로 완료되면, 시스템 장애가 발생해도 결과가 유지되어야 합니다.

### 지속성 보장 방법

```
Write-Ahead Logging (WAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 트랜잭션 로그에 먼저 기록
   └─ WAL 파일에 저장

2. 실제 데이터 파일에 반영
   └─ 비동기적으로 처리 가능

3. 장애 발생 시
   └─ WAL 파일로부터 복구
```

### PostgreSQL 예시

```sql
-- WAL 설정 확인
SHOW wal_level;  -- replica or logical

-- 체크포인트 (데이터 파일에 강제로 반영)
CHECKPOINT;

-- 트랜잭션 로그 동기화 수준
SHOW synchronous_commit;  -- on/off/local/remote_write
```

### 지속성 시나리오

```
정전 시나리오
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 트랜잭션 시작
2. 데이터 수정
3. COMMIT (WAL에 기록 완료)
4. [갑자기 정전!] ← 데이터 파일에 아직 반영 안 됨
5. 시스템 재시작
6. WAL 파일 읽어서 복구
7. 데이터 손실 없음 ✓
```

---

## ACID 전체 예시

```javascript
// 전자상거래 주문 처리
async function createOrder(userId, items) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. 주문 생성
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id',
      [userId, calculateTotal(items)]
    );
    const orderId = orderResult.rows[0].id;

    // 2. 주문 항목 추가
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.productId, item.quantity, item.price]
      );

      // 3. 재고 차감 (격리성 - FOR UPDATE로 잠금)
      const stockResult = await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING stock',
        [item.quantity, item.productId]
      );

      // 일관성 - 재고 부족 확인
      if (stockResult.rows.length === 0) {
        throw new Error(`상품 ${item.productId} 재고 부족`);
      }
    }

    // 4. 포인트 차감 (일관성 - 음수 방지)
    const pointResult = await client.query(
      'UPDATE users SET points = points - $1 WHERE id = $2 AND points >= $1 RETURNING points',
      [usedPoints, userId]
    );

    if (pointResult.rows.length === 0) {
      throw new Error('포인트 부족');
    }

    // 원자성 - 모두 성공하면 커밋
    await client.query('COMMIT');
    console.log('주문 완료:', orderId);

    // 지속성 - COMMIT 후 시스템 장애가 발생해도 주문 데이터는 보존됨

    return orderId;

  } catch (error) {
    // 원자성 - 하나라도 실패하면 모두 롤백
    await client.query('ROLLBACK');
    console.error('주문 실패, 롤백됨:', error);
    throw error;

  } finally {
    client.release();
  }
}
```

---

## NoSQL과 ACID

### NoSQL의 트레이드오프

```
대부분의 NoSQL은 ACID보다 성능과 확장성을 우선
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MongoDB (Document DB)
- 단일 문서: ACID 보장
- 여러 문서: 트랜잭션 지원 (4.0+)

Redis (Key-Value)
- 단일 명령: ACID 보장
- 여러 명령: MULTI/EXEC로 원자성 보장
- 지속성: AOF, RDB로 보장

Cassandra (Column)
- 최종 일관성 (Eventual Consistency)
- ACID 대신 BASE 모델
```

### CAP 정리와의 관계

```
CAP 정리
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C - Consistency   (일관성)
A - Availability  (가용성)
P - Partition Tolerance (분할 내성)

→ 3가지 중 2가지만 선택 가능

RDBMS: CP 선택 (일관성 우선)
NoSQL: AP 선택 (가용성 우선)
```

---

## 실무 팁

### 1. 트랜잭션은 짧게

```javascript
// ❌ 나쁜 예: 오래 걸리는 작업 포함
await client.query('BEGIN');
await processPayment();  // 외부 API 호출 (느림)
await sendEmail();       // 이메일 발송 (느림)
await client.query('COMMIT');

// ✅ 좋은 예: DB 작업만
await client.query('BEGIN');
await createOrder();
await updateStock();
await client.query('COMMIT');

// 이메일은 트랜잭션 밖에서
await sendEmail();
```

### 2. 적절한 격리 수준 선택

```
READ COMMITTED: 대부분의 경우 충분
REPEATABLE READ: 통계, 보고서
SERIALIZABLE: 금융 거래, 결제
```

### 3. 데드락 주의

```sql
-- 데드락 발생 가능
-- 트랜잭션 1: A → B 순서로 잠금
-- 트랜잭션 2: B → A 순서로 잠금

-- 해결: 항상 같은 순서로 잠금
UPDATE accounts SET ... WHERE id IN (1, 2) ORDER BY id;
```

---

## 추가 학습 자료

- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [ACID Properties | Wikipedia](https://en.wikipedia.org/wiki/ACID)
- [Database Transactions | Martin Kleppmann](https://martin.kleppmann.com/2014/11/25/hermitage-testing-the-i-in-acid.html)

---

## 다음 학습

- [트랜잭션](transactions.md)
- [격리 수준 상세](isolation-levels.md)
- [CAP 정리](cap-theorem.md)

---

*Last updated: 2026-01-05*
