# Transaction Isolation Levels - 격리 수준

> "일관성과 동시성의 트레이드오프"

## 🎯 학습 목표

- 4가지 격리 수준의 **차이와 트레이드오프** 이해
- 각 수준에서 발생 가능한 **문제 현상** 파악
- **실무에서 격리 수준 선택** 방법 습득

## 📚 격리 수준 개요

### 4가지 표준 격리 수준

```
┌─────────────────────┬──────────────┬──────────────┬─────────────┬─────────┐
│ Isolation Level     │ Dirty Read   │ Non-Repeatable│ Phantom Read│ 동시성  │
│                     │              │ Read          │             │         │
├─────────────────────┼──────────────┼──────────────┼─────────────┼─────────┤
│ Read Uncommitted    │ 발생 가능    │ 발생 가능    │ 발생 가능   │ 최고 ⚡ │
│ Read Committed      │ 방지 ✅      │ 발생 가능    │ 발생 가능   │ 높음    │
│ Repeatable Read     │ 방지 ✅      │ 방지 ✅      │ 발생 가능*  │ 중간    │
│ Serializable        │ 방지 ✅      │ 방지 ✅      │ 방지 ✅     │ 낮음 🐌 │
└─────────────────────┴──────────────┴──────────────┴─────────────┴─────────┘

* PostgreSQL/InnoDB는 Repeatable Read에서 Phantom Read도 방지
```

## 🔍 문제 현상 이해

### 1. Dirty Read (오손 읽기)

**정의**: 커밋되지 않은 데이터를 읽음

```sql
-- Transaction A
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
-- 아직 COMMIT 안 함

-- Transaction B (Read Uncommitted)
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- 1000을 읽음!

-- Transaction A
ROLLBACK;  -- 취소!

-- 결과: B는 존재하지 않는 값(1000)을 읽음 😱
```

**문제**: 트랜잭션 A가 롤백하면 B가 읽은 데이터는 무효

---

### 2. Non-Repeatable Read (반복 불가능 읽기)

**정의**: 같은 데이터를 다시 읽었을 때 값이 변경됨

```sql
-- Transaction A (Read Committed)
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- 500

-- Transaction B
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
COMMIT;

-- Transaction A
SELECT balance FROM accounts WHERE id = 1;  -- 1000 (값이 바뀜!)
COMMIT;
```

**문제**: 같은 트랜잭션 내에서 같은 쿼리가 다른 결과

---

### 3. Phantom Read (유령 읽기)

**정의**: 같은 조건으로 조회했을 때 행의 개수가 변경됨

```sql
-- Transaction A (Repeatable Read)
BEGIN;
SELECT COUNT(*) FROM employees WHERE age > 30;  -- 10명

-- Transaction B
BEGIN;
INSERT INTO employees VALUES (100, 'John', 35);
COMMIT;

-- Transaction A
SELECT COUNT(*) FROM employees WHERE age > 30;  -- 11명 (유령 등장!)
COMMIT;
```

**문제**: 행의 개수가 변경됨 (삽입/삭제)

---

## 🎯 각 격리 수준 상세

### Level 0: Read Uncommitted

**특징**:
- 커밋되지 않은 데이터도 읽음
- 가장 빠름 (락 없음)
- Dirty Read 발생

**실무 사용**:
```
❌ 거의 사용 안 함
✅ 예외적으로: 대략적인 통계 (정확도 불필요)
```

**설정**:
```sql
-- PostgreSQL
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

-- MySQL
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
```

---

### Level 1: Read Committed (가장 일반적)

**특징**:
- 커밋된 데이터만 읽음
- Dirty Read 방지
- Non-Repeatable Read 발생 가능

**동작 원리** (MVCC):
```sql
-- Transaction A
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
-- 아직 COMMIT 안 함

-- Transaction B (Read Committed)
BEGIN;
SELECT balance FROM accounts WHERE id = 1;
-- 구버전(500)을 읽음 ✅ (A가 커밋 안 했으므로)

-- Transaction A
COMMIT;

-- Transaction B
SELECT balance FROM accounts WHERE id = 1;
-- 신버전(1000)을 읽음 ✅ (A가 커밋했으므로)
```

**실무 사용**:
```
✅ Oracle, PostgreSQL의 기본값
✅ 대부분의 웹 애플리케이션
✅ 일반적인 트랜잭션 처리
```

**설정**:
```sql
-- PostgreSQL (기본값)
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- MySQL
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

---

### Level 2: Repeatable Read

**특징**:
- 같은 데이터는 항상 같은 값
- Non-Repeatable Read 방지
- Phantom Read 발생 가능 (표준 기준)

**동작 원리** (MVCC 스냅샷):
```sql
-- Transaction A (Repeatable Read)
BEGIN;  -- 스냅샷 생성!
SELECT balance FROM accounts WHERE id = 1;  -- 500

-- Transaction B
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
COMMIT;

-- Transaction A
SELECT balance FROM accounts WHERE id = 1;  -- 500 (스냅샷 유지) ✅
COMMIT;
```

**실무 사용**:
```
✅ MySQL InnoDB의 기본값
✅ 보고서 생성 (일관된 스냅샷 필요)
✅ 금융 거래 (읽기 일관성 중요)
```

**특이사항: PostgreSQL/InnoDB**:
- Phantom Read도 방지! (Next-Key Lock)
- 사실상 Serializable과 유사

**설정**:
```sql
-- MySQL (기본값)
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- PostgreSQL
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

---

### Level 3: Serializable

**특징**:
- 완전한 격리
- 모든 문제 방지
- 가장 느림 (락이 많음)

**동작 원리**:
```sql
-- Transaction A (Serializable)
BEGIN;
SELECT * FROM accounts WHERE id = 1;
-- id=1 행에 공유 락

-- Transaction B (Serializable)
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
-- A가 끝날 때까지 대기... 🕐
```

**실무 사용**:
```
✅ 매우 중요한 금융 거래
✅ 재고 관리 (정확성이 생명)
⚠️ 성능 저하 감수
```

**설정**:
```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

---

## 💡 실무 가이드

### 격리 수준 선택 기준

#### Read Committed를 선택할 때
```sql
-- 일반적인 웹 애플리케이션
BEGIN;
    SELECT * FROM users WHERE id = 123;
    UPDATE users SET last_login = NOW() WHERE id = 123;
COMMIT;

-- 특징:
-- - 커밋된 최신 데이터 읽기
-- - 동시성 높음
-- - 대부분의 경우 충분
```

#### Repeatable Read를 선택할 때
```sql
-- 보고서 생성 (일관된 스냅샷)
BEGIN;
    -- 10:00 시점의 스냅샷
    SELECT SUM(balance) FROM accounts;  -- 1,000,000
    SELECT COUNT(*) FROM accounts;      -- 100
    -- ... 복잡한 계산 ...
    SELECT AVG(balance) FROM accounts;  -- 10,000
    -- 모두 같은 시점의 데이터 ✅
COMMIT;
```

#### Serializable을 선택할 때
```sql
-- 좌석 예매 (정확성이 생명)
BEGIN;
    SELECT * FROM seats WHERE seat_no = 'A1' FOR UPDATE;
    -- 다른 트랜잭션은 대기

    IF seat is available:
        INSERT INTO bookings VALUES (...);
        UPDATE seats SET status = 'booked' WHERE seat_no = 'A1';

COMMIT;
```

---

## 🔒 락과의 관계

### Read Committed + 명시적 락

```sql
-- SELECT ... FOR UPDATE (배타 락)
BEGIN;
    SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
    -- 다른 트랜잭션은 대기

    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- SELECT ... FOR SHARE (공유 락)
BEGIN;
    SELECT * FROM accounts WHERE id = 1 FOR SHARE;
    -- 다른 읽기는 가능, 쓰기는 대기
COMMIT;
```

### Repeatable Read + Next-Key Lock (InnoDB)

```sql
-- InnoDB는 범위 락 사용
BEGIN;
    SELECT * FROM employees WHERE age BETWEEN 20 AND 30;
    -- age 20~30 범위에 락
    -- 다른 트랜잭션은 이 범위에 INSERT 불가
COMMIT;
```

---

## 🧪 실습 예제

### 실습 1: Dirty Read 재현

```sql
-- Terminal 1
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
BEGIN;

-- Terminal 2
BEGIN;
UPDATE accounts SET balance = 999 WHERE id = 1;
-- COMMIT 하지 않음

-- Terminal 1
SELECT balance FROM accounts WHERE id = 1;
-- 999를 읽음 (Dirty Read!)

-- Terminal 2
ROLLBACK;

-- Terminal 1
SELECT balance FROM accounts WHERE id = 1;
-- 원래 값으로 돌아옴
```

### 실습 2: Repeatable Read 테스트

```sql
-- Terminal 1
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- 500

-- Terminal 2
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
COMMIT;

-- Terminal 1
SELECT balance FROM accounts WHERE id = 1;  -- 여전히 500 ✅
COMMIT;
```

---

## 🎯 DB별 기본 격리 수준

```
PostgreSQL:   Read Committed
MySQL InnoDB: Repeatable Read
Oracle:       Read Committed
SQL Server:   Read Committed
```

---

## 📊 성능 vs 일관성 트레이드오프

```
Read Uncommitted   |████████████| 동시성 최고, 일관성 최저
Read Committed     |████████    | 균형 ✅
Repeatable Read    |████        | 일관성 높음
Serializable       |█           | 동시성 최저, 일관성 최고
```

---

## ⚠️ 실무 주의사항

### 1. 기본값 확인

```sql
-- 현재 격리 수준 확인
-- PostgreSQL
SHOW TRANSACTION ISOLATION LEVEL;

-- MySQL
SELECT @@transaction_isolation;
```

### 2. ORM 설정

```python
# Django
DATABASES = {
    'default': {
        'OPTIONS': {
            'isolation_level': 'read committed',  # 명시적 설정
        }
    }
}

# Spring Boot (JPA)
spring:
  jpa:
    properties:
      hibernate:
        connection:
          isolation: 2  # READ_COMMITTED
```

### 3. Deadlock 주의

```sql
-- Repeatable Read 이상에서 Deadlock 발생 가능
-- 일관된 순서로 락 획득 필요

-- ✅ 좋은 예: 항상 id 순서로
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

---

## 🎯 체크리스트

- [ ] 4가지 격리 수준의 차이를 설명할 수 있다
- [ ] Dirty Read, Non-Repeatable Read, Phantom Read를 구분할 수 있다
- [ ] 실무에서 적절한 격리 수준을 선택할 수 있다
- [ ] MVCC의 역할을 이해한다
- [ ] 격리 수준과 락의 관계를 안다

## 🔗 다음 학습

- [02-MVCC.md](./02-MVCC.md) - MVCC 동작 원리
- [06-Locking-Mechanisms.md](./06-Locking-Mechanisms.md) - 락 메커니즘

---

**"대부분은 Read Committed면 충분하다. 하지만 왜 그런지는 알아야 한다."**
