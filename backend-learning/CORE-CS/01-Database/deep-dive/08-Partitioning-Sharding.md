# Partitioning & Sharding - 데이터 분산

> "하나의 큰 테이블을 여러 개로 나누기"

## 🎯 핵심 개념

### Partitioning vs Sharding

```
Partitioning (수직/수평 분할)
- 같은 DB 서버 내에서 테이블 분할
- 논리적으로는 하나의 테이블

Sharding (샤딩)
- 여러 DB 서버로 데이터 분산
- 물리적으로 분리됨
```

## 📚 Partitioning 종류

### 1. Range Partitioning

```sql
-- 날짜 기준
CREATE TABLE orders (
    order_id INT,
    order_date DATE,
    amount INT
)
PARTITION BY RANGE (YEAR(order_date)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025)
);

-- 쿼리 시 자동으로 적절한 파티션만 스캔
SELECT * FROM orders WHERE order_date = '2023-01-01';
-- p2023 파티션만 스캔 ✅
```

### 2. Hash Partitioning

```sql
-- user_id % 4로 분할
CREATE TABLE users (
    user_id INT,
    name VARCHAR(100)
)
PARTITION BY HASH(user_id)
PARTITIONS 4;

-- user_id=123 → 123 % 4 = 3 → partition 3
```

### 3. List Partitioning

```sql
-- 지역별 분할
CREATE TABLE customers (
    customer_id INT,
    region VARCHAR(50)
)
PARTITION BY LIST(region) (
    PARTITION p_asia VALUES IN ('Korea', 'Japan', 'China'),
    PARTITION p_eu VALUES IN ('Germany', 'France', 'UK'),
    PARTITION p_us VALUES IN ('USA', 'Canada')
);
```

## 💡 Sharding 전략

### 1. Range-Based Sharding

```
user_id 1~100000    → Shard 1
user_id 100001~200000 → Shard 2
user_id 200001~300000 → Shard 3

문제: 핫스팟 (최근 데이터에 몰림)
```

### 2. Hash-Based Sharding

```
hash(user_id) % 3
user_id=123 → shard 0
user_id=456 → shard 0
user_id=789 → shard 2

장점: 고르게 분산
단점: 리샤딩 어려움
```

### 3. Geographic Sharding

```
Korea users → Asia Shard
US users    → US Shard
EU users    → EU Shard

장점: 지연 시간 감소
```

## ⚠️ Sharding의 문제점

### 1. JOIN 어려움

```sql
-- Shard 1: users 1~100
-- Shard 2: users 101~200
-- Shard 3: orders (모든 주문)

-- 불가능한 쿼리
SELECT u.name, o.order_id
FROM users u
JOIN orders o ON u.user_id = o.user_id;

-- 해결: 애플리케이션에서 조합
```

### 2. 트랜잭션 제한

```sql
-- 여러 Shard에 걸친 트랜잭션 불가능
BEGIN;
UPDATE users SET name = 'Alice' WHERE user_id = 50;  -- Shard 1
UPDATE users SET name = 'Bob' WHERE user_id = 150;   -- Shard 2
COMMIT;  -- 불가능!
```

### 3. 리샤딩 비용

```
3 Shards → 4 Shards
- 모든 데이터 재분배
- 다운타임 발생
```

## 🎯 실무 선택 기준

### Partitioning 선택

```
✅ 같은 서버에서 관리 가능
✅ 주로 시간 기반 분할 (로그, 주문)
✅ 자동 파티션 정리 필요
```

### Sharding 선택

```
✅ 단일 서버 한계 도달
✅ 멀티 테넌트 시스템
✅ 글로벌 서비스
⚠️ 복잡도 증가 감수
```

## 🔗 다음 학습

- [07-Replication.md](./07-Replication.md)
- [../fundamentals/02-Normalization.md](../fundamentals/02-Normalization.md)

---

**"샤딩은 최후의 수단, 하지만 필수적인 수단"**
