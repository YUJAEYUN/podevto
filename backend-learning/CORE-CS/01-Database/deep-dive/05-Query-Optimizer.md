# Query Optimizer - 쿼리 최적화

> "같은 결과, 다른 경로"

## 🎯 핵심 개념

### 쿼리 옵티마이저란?

SQL (선언적) → 실행 계획 (절차적)으로 변환하는 컴포넌트

```sql
-- 사용자가 작성 (WHAT)
SELECT * FROM users WHERE age > 20;

-- 옵티마이저가 결정 (HOW)
1. Full Table Scan? vs Index Scan?
2. 어떤 인덱스를 사용할지?
3. 어떤 순서로 JOIN할지?
```

## 📚 실행 계획 보기

### EXPLAIN

```sql
-- PostgreSQL
EXPLAIN SELECT * FROM users WHERE age > 20;

결과:
Seq Scan on users  (cost=0.00..35.50 rows=1000 width=40)
  Filter: (age > 20)
```

### EXPLAIN ANALYZE (실제 실행)

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE age > 20;

결과:
Seq Scan on users  (cost=0.00..35.50 rows=1000 width=40)
                   (actual time=0.010..0.250 rows=800 loops=1)
  Filter: (age > 20)
Planning Time: 0.050 ms
Execution Time: 0.300 ms
```

## 🔍 주요 Scan 방식

### 1. Sequential Scan (Full Table Scan)

```
테이블 전체를 순차적으로 읽음
- 인덱스 없음
- 많은 행이 매칭됨 (>30%)
```

### 2. Index Scan

```
인덱스 → 테이블 조회
- 적은 행 매칭 (<10%)
- Random I/O 발생
```

### 3. Index Only Scan

```
인덱스만으로 해결 (가장 빠름!)
- Covering Index
- 테이블 접근 불필요
```

### 4. Bitmap Index Scan

```
인덱스로 비트맵 생성 → 테이블 조회
- 중간 개수 매칭
- Random I/O 줄임
```

## 💡 JOIN 전략

### 1. Nested Loop Join

```
for each row in table A:
    for each row in table B:
        if match: output

사용: 작은 테이블 JOIN
```

### 2. Hash Join

```
1. Build: table A를 해시테이블로
2. Probe: table B를 스캔하며 매칭

사용: 큰 테이블 JOIN (메모리 충분)
```

### 3. Merge Join

```
1. 양쪽 테이블 정렬
2. 병합하며 매칭

사용: 이미 정렬된 데이터
```

## 🎯 최적화 팁

### 1. 인덱스 활용

```sql
-- ❌ 인덱스 무효화
WHERE YEAR(created_at) = 2024;

-- ✅ 인덱스 사용
WHERE created_at >= '2024-01-01'
  AND created_at < '2025-01-01';
```

### 2. 통계 정보 업데이트

```sql
-- PostgreSQL
ANALYZE users;

-- MySQL
ANALYZE TABLE users;
```

### 3. JOIN 순서

```sql
-- 작은 테이블을 먼저
SELECT *
FROM small_table s
JOIN large_table l ON s.id = l.small_id;
```

## 🔗 다음 학습

- [../fundamentals/04-Index-Basics.md](../fundamentals/04-Index-Basics.md)
- [06-Locking-Mechanisms.md](./06-Locking-Mechanisms.md)

---

**"EXPLAIN은 개발자의 친구"**
