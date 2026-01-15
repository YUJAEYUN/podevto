# Transaction Basics - 트랜잭션 기초

> "트랜잭션 없이는 데이터 일관성을 보장할 수 없다"

## 🎯 학습 목표

- 트랜잭션의 기본 명령어 완벽 숙지
- **Commit과 Rollback**의 차이 이해
- 실무에서 트랜잭션을 **올바르게 사용**하는 방법

## 📚 트랜잭션이란?

**정의**: 데이터베이스의 상태를 변환시키는 **하나의 논리적 작업 단위**

```sql
-- 예: 계좌 이체 (하나의 트랜잭션)
BEGIN TRANSACTION;
    UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
    UPDATE accounts SET balance = balance + 100 WHERE id = 'B';
COMMIT;
```

두 UPDATE 문은 **함께 성공하거나 함께 실패**해야 함!

## 🔧 기본 명령어

### 1. BEGIN / START TRANSACTION
```sql
-- PostgreSQL, MySQL
BEGIN;
-- 또는
START TRANSACTION;
```

**의미**: 트랜잭션 시작

### 2. COMMIT
```sql
COMMIT;
```

**의미**: 트랜잭션의 모든 변경사항을 **영구적으로 저장**

### 3. ROLLBACK
```sql
ROLLBACK;
```

**의미**: 트랜잭션의 모든 변경사항을 **취소**하고 이전 상태로 복구

## 💡 실습 예제

### 예제 1: 정상적인 트랜잭션

```sql
-- 초기 상태
SELECT * FROM accounts;
-- | id | name  | balance |
-- | A  | Alice | 1000    |
-- | B  | Bob   | 500     |

BEGIN;
    UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
    UPDATE accounts SET balance = balance + 100 WHERE id = 'B';
COMMIT;

SELECT * FROM accounts;
-- | id | name  | balance |
-- | A  | Alice | 900     |  ✅
-- | B  | Bob   | 600     |  ✅
```

### 예제 2: 에러 발생 시 ROLLBACK

```sql
BEGIN;
    UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
    -- 여기서 에러 발생! (예: B 계좌가 없음)
    UPDATE accounts SET balance = balance + 100 WHERE id = 'Z';  -- ❌
ROLLBACK;

SELECT * FROM accounts;
-- | id | name  | balance |
-- | A  | Alice | 1000    |  ✅ 원래대로!
-- | B  | Bob   | 500     |  ✅
```

### 예제 3: SAVEPOINT

```sql
BEGIN;
    UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
    SAVEPOINT sp1;  -- 체크포인트 생성

    UPDATE accounts SET balance = balance + 50 WHERE id = 'B';
    SAVEPOINT sp2;

    UPDATE accounts SET balance = balance + 50 WHERE id = 'C';

    -- sp2까지만 롤백
    ROLLBACK TO sp2;

    -- A: -100, B: +50 (C는 취소됨)
COMMIT;
```

## 🔍 Auto-Commit

대부분의 DB는 기본적으로 **Auto-Commit 모드**

```sql
-- Auto-Commit 모드 (기본)
UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
-- 자동으로 COMMIT됨!

-- Auto-Commit 끄기
SET AUTOCOMMIT = 0;  -- MySQL
BEGIN;  -- PostgreSQL
```

## ⚠️ 실무 주의사항

### 1. 트랜잭션은 짧게 유지

```sql
-- ❌ 나쁜 예: 트랜잭션이 너무 길음
BEGIN;
    -- 복잡한 계산 (10초 소요)
    SELECT ... complex query ...;

    -- 사용자 입력 대기 (30초 소요)
    -- ...

    UPDATE accounts SET balance = balance - 100;
COMMIT;

-- 다른 트랜잭션들이 락 때문에 대기! 😢
```

```sql
-- ✅ 좋은 예: 트랜잭션은 최소한으로
-- 1. 계산 먼저 (트랜잭션 밖에서)
SELECT ... complex query ...;

-- 2. 사용자 입력 받기

-- 3. 짧은 트랜잭션
BEGIN;
    UPDATE accounts SET balance = balance - 100;
COMMIT;
```

### 2. 에러 처리

```python
# Python 예제
import psycopg2

conn = psycopg2.connect(...)
try:
    cursor = conn.cursor()
    cursor.execute("BEGIN")

    cursor.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 'A'")
    cursor.execute("UPDATE accounts SET balance = balance + 100 WHERE id = 'B'")

    cursor.execute("COMMIT")
except Exception as e:
    cursor.execute("ROLLBACK")
    print(f"Error: {e}")
finally:
    conn.close()
```

### 3. Deadlock 방지

```sql
-- ❌ Deadlock 발생 가능
-- Transaction A:
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
UPDATE accounts SET balance = balance + 100 WHERE id = 'B';
COMMIT;

-- Transaction B (동시 실행):
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 'B';
UPDATE accounts SET balance = balance + 50 WHERE id = 'A';
COMMIT;

-- 💥 Deadlock!
```

```sql
-- ✅ 일관된 순서로 락 획득
-- Transaction A:
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
UPDATE accounts SET balance = balance + 100 WHERE id = 'B';
COMMIT;

-- Transaction B:
BEGIN;
UPDATE accounts SET balance = balance + 50 WHERE id = 'A';  -- 같은 순서
UPDATE accounts SET balance = balance - 50 WHERE id = 'B';
COMMIT;
```

## 🎯 체크리스트

- [ ] BEGIN, COMMIT, ROLLBACK을 사용할 수 있다
- [ ] SAVEPOINT의 역할을 이해한다
- [ ] 트랜잭션을 짧게 유지하는 이유를 안다
- [ ] Deadlock을 방지할 수 있다

## 🔗 다음 학습

- [04-Index-Basics.md](./04-Index-Basics.md)
- [../deep-dive/03-Transaction-Isolation.md](../deep-dive/03-Transaction-Isolation.md)

---

**"트랜잭션은 짧고 명확하게!"**
