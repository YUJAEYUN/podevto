# Locking Mechanisms - 락 메커니즘

> "동시성 제어의 핵심"

## 🎯 핵심 개념

### 락의 종류

```
1. 공유 락 (Shared Lock, S-Lock)
   - 읽기 락
   - 다른 공유 락 허용
   - 배타 락 차단

2. 배타 락 (Exclusive Lock, X-Lock)
   - 쓰기 락
   - 모든 다른 락 차단
```

## 📚 락 호환성

```
┌─────────┬─────────┬─────────┐
│         │ S-Lock  │ X-Lock  │
├─────────┼─────────┼─────────┤
│ S-Lock  │   ✅    │   ❌    │
│ X-Lock  │   ❌    │   ❌    │
└─────────┴─────────┴─────────┘
```

## 💡 락 레벨

### 1. Row-Level Lock (행 락)

```sql
-- 특정 행만 락
SELECT * FROM users WHERE id = 1 FOR UPDATE;
-- id=1 행만 락, 다른 행은 접근 가능
```

### 2. Table-Level Lock (테이블 락)

```sql
-- 전체 테이블 락
LOCK TABLE users IN EXCLUSIVE MODE;
```

### 3. Page-Level Lock (페이지 락)

```
중간 수준 (SQL Server)
```

## 🔍 명시적 락

### SELECT ... FOR UPDATE

```sql
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- 배타 락 (다른 트랜잭션 대기)

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;
```

### SELECT ... FOR SHARE

```sql
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR SHARE;
-- 공유 락 (다른 읽기 허용, 쓰기 차단)
COMMIT;
```

## 🚫 Deadlock (교착 상태)

### 발생 조건

```sql
-- Transaction A
BEGIN;
UPDATE accounts SET balance = 900 WHERE id = 1;  -- A가 id=1 락
UPDATE accounts SET balance = 600 WHERE id = 2;  -- B가 id=2 락 대기...

-- Transaction B
BEGIN;
UPDATE accounts SET balance = 600 WHERE id = 2;  -- B가 id=2 락
UPDATE accounts SET balance = 900 WHERE id = 1;  -- A가 id=1 락 대기...

-- 💥 Deadlock!
```

### 해결 방법

```sql
-- ✅ 일관된 순서로 락 획득
-- 항상 id 오름차순으로

-- Transaction A
UPDATE accounts WHERE id = 1;
UPDATE accounts WHERE id = 2;

-- Transaction B
UPDATE accounts WHERE id = 1;  -- 같은 순서
UPDATE accounts WHERE id = 2;
```

## ⚡ 락 최적화

### 1. 락 시간 최소화

```sql
-- ❌ 나쁜 예
BEGIN;
SELECT complex_calculation();  -- 10초
UPDATE accounts SET balance = 1000;
COMMIT;

-- ✅ 좋은 예
SELECT complex_calculation();  -- 트랜잭션 밖
BEGIN;
UPDATE accounts SET balance = 1000;
COMMIT;
```

### 2. Optimistic Locking

```sql
-- Version 기반
UPDATE accounts
SET balance = 1000, version = version + 1
WHERE id = 1 AND version = 5;

-- 0 rows affected → 충돌!
```

## 🔗 다음 학습

- [03-Transaction-Isolation.md](./03-Transaction-Isolation.md)
- [07-Replication.md](./07-Replication.md)

---

**"락은 필요하지만 최소화해야 한다"**
