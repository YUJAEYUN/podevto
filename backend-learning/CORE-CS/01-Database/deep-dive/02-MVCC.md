# MVCC - Multi-Version Concurrency Control

> "읽기와 쓰기가 서로 블록하지 않는 마법"

## 🎯 핵심 개념

### 전통적인 락 방식의 문제
```sql
-- Transaction A (읽기)
BEGIN;
SELECT * FROM accounts WHERE id = 1;
-- 읽는 동안 락을 잡음...

-- Transaction B (쓰기)  
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
-- A가 끝날 때까지 대기! 😢
```

### MVCC 방식
```sql
-- Transaction A (읽기)
BEGIN;
SELECT * FROM accounts WHERE id = 1;
-- 현재 버전을 읽음

-- Transaction B (쓰기)
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
-- 새 버전을 생성! A는 대기하지 않음 ✅
```

## 📚 MVCC 동작 원리

### 버전 관리
```
accounts 테이블:

| id | balance | xmin (생성 TX) | xmax (삭제 TX) |
|----|---------|----------------|----------------|
| 1  | 500     | 100            | 150            | ← 구버전
| 1  | 1000    | 150            | NULL           | ← 신버전
```

- `xmin`: 이 행을 생성한 트랜잭션 ID
- `xmax`: 이 행을 삭제/수정한 트랜잭션 ID (NULL이면 최신)

### 읽기 과정
```sql
-- Transaction 120이 읽기
SELECT * FROM accounts WHERE id = 1;

-- MVCC가 판단:
-- xmin=100 <= 120 && (xmax=NULL 또는 xmax > 120)
-- → xmin=100, xmax=150 버전: 150 > 120 ✅ 보임
```

## 💡 실전 예제

### 예제 1: Dirty Read 방지
```sql
-- Transaction A (TX ID = 100)
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;  -- xmin=100, xmax=NULL
-- 아직 COMMIT 안 함

-- Transaction B (TX ID = 101)
BEGIN;
SELECT * FROM accounts WHERE id = 1;
-- TX 100이 커밋되지 않았으므로 구버전(balance=500)을 읽음 ✅
```

### 예제 2: 스냅샷 격리
```sql
-- Transaction A (Read Committed)
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- 500

-- Transaction B
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
COMMIT;

-- Transaction A
SELECT balance FROM accounts WHERE id = 1;  -- 1000 (최신 버전)

-- Transaction A (Repeatable Read)
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- 500

-- Transaction B의 변경이 COMMIT되어도
SELECT balance FROM accounts WHERE id = 1;  -- 500 (스냅샷 유지) ✅
```

## 🧹 VACUUM (PostgreSQL)

구버전 정리:
```sql
-- 수동 VACUUM
VACUUM FULL accounts;

-- 자동 VACUUM (autovacuum)
-- postgresql.conf에서 설정
```

## 🎯 장단점

**장점**:
- 읽기/쓰기 동시성 향상
- Dirty Read 방지
- 일관된 스냅샷

**단점**:
- 저장 공간 증가
- VACUUM 필요
- 복잡성

## 🔗 다음 학습

- [03-Transaction-Isolation.md](./03-Transaction-Isolation.md)

---

**"MVCC는 시간 여행 같은 것이다"**
