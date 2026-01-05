# 인덱싱 (Indexing)

## 인덱스란?

**인덱스(Index)** 는 데이터베이스 테이블의 검색 속도를 향상시키기 위한 자료구조입니다. 책의 색인과 같은 역할을 합니다.

```
책에서 정보 찾기
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 인덱스 없이 (전체 스캔)
   → 1페이지부터 끝까지 모두 읽기
   → 1000페이지 책: 평균 500페이지 읽어야 함

✅ 인덱스 사용 (색인 페이지)
   → 색인에서 페이지 번호 찾기
   → 해당 페이지로 바로 이동
   → 1000페이지 책: 1~2페이지만 읽으면 됨
```

---

## 왜 인덱스가 필요한가?

### 성능 비교

```sql
-- users 테이블 (100만 명)
SELECT * FROM users WHERE email = 'john@example.com';
```

```
인덱스 없음:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full Table Scan
100만 행 모두 읽음
소요 시간: ~1000ms

인덱스 있음:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Index Scan
B-Tree 탐색 + 행 읽기
소요 시간: ~5ms

→ 200배 빠름! 🚀
```

---

## 인덱스 생성

### 기본 인덱스

```sql
-- 단일 컬럼 인덱스
CREATE INDEX idx_users_email ON users(email);

-- 고유 인덱스 (UNIQUE)
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- 인덱스 삭제
DROP INDEX idx_users_email;
```

### 복합 인덱스 (Composite Index)

```sql
-- 여러 컬럼을 함께 인덱싱
CREATE INDEX idx_users_city_age ON users(city, age);

-- 사용 예시
SELECT * FROM users WHERE city = 'Seoul' AND age = 30;
SELECT * FROM users WHERE city = 'Seoul';  -- 앞쪽 컬럼만도 사용 가능

-- 주의: 뒤쪽 컬럼만 사용하면 인덱스 활용 안 됨
SELECT * FROM users WHERE age = 30;  -- 인덱스 사용 안 됨
```

### 부분 인덱스 (Partial Index)

```sql
-- 특정 조건의 행만 인덱싱
CREATE INDEX idx_active_users_email
ON users(email)
WHERE is_active = TRUE;

-- 활성 사용자만 자주 조회하는 경우 유용
SELECT * FROM users WHERE email = 'john@example.com' AND is_active = TRUE;
```

### 표현식 인덱스 (Expression Index)

```sql
-- 소문자로 변환한 값에 인덱스
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- 대소문자 구분 없이 검색
SELECT * FROM users WHERE LOWER(email) = 'john@example.com';
```

---

## 인덱스 자료구조

### 1. B-Tree (가장 일반적)

```
B-Tree 구조
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                [M]
              /    \
          [D]        [S]
         /  \       /   \
    [A,B] [E,F] [N,O] [T,U]
     ↓     ↓     ↓     ↓
   실제   실제   실제   실제
   데이터 데이터 데이터 데이터

특징:
✓ 범위 검색 효율적
✓ 정렬된 순서 유지
✓ 등호(=), 비교(>, <) 모두 지원
```

```sql
-- B-Tree가 효과적인 쿼리
SELECT * FROM users WHERE age = 30;         -- 등호
SELECT * FROM users WHERE age > 25;         -- 범위
SELECT * FROM users WHERE age BETWEEN 20 AND 30;  -- 범위
SELECT * FROM users ORDER BY age LIMIT 10;  -- 정렬
```

### 2. Hash Index

```
Hash 인덱스
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

값 → Hash 함수 → Bucket

"john@example.com" → hash() → Bucket #42
"jane@example.com" → hash() → Bucket #17

특징:
✓ 등호(=) 검색 매우 빠름
✗ 범위 검색 불가
✗ 정렬 불가
```

```sql
-- PostgreSQL은 기본적으로 Hash 인덱스를 거의 사용하지 않음
-- B-Tree가 대부분의 경우 더 효율적
```

### 3. GiST/GIN (전문 검색)

```sql
-- GIN: 전문 검색, 배열, JSON
CREATE INDEX idx_posts_content_gin ON posts USING gin(to_tsvector('english', content));

-- 전문 검색
SELECT * FROM posts
WHERE to_tsvector('english', content) @@ to_tsquery('postgresql & performance');
```

---

## 인덱스 사용 여부 확인

### EXPLAIN으로 실행 계획 확인

```sql
-- 인덱스 없이
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';
```

```
인덱스 없음:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Seq Scan on users  (cost=0.00..18334.00 rows=1 width=100)
  Filter: (email = 'john@example.com'::text)

→ Seq Scan = Sequential Scan = 순차 스캔 (전체 테이블 읽기)
```

```sql
-- 인덱스 생성 후
CREATE INDEX idx_users_email ON users(email);
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';
```

```
인덱스 사용:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Index Scan using idx_users_email on users  (cost=0.42..8.44 rows=1 width=100)
  Index Cond: (email = 'john@example.com'::text)

→ Index Scan = 인덱스 스캔 (인덱스 사용)
```

### EXPLAIN ANALYZE로 실제 실행 시간 측정

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';
```

```
결과:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Index Scan using idx_users_email on users
  (cost=0.42..8.44 rows=1 width=100)
  (actual time=0.025..0.026 rows=1 loops=1)
Planning Time: 0.123 ms
Execution Time: 0.051 ms
```

---

## 언제 인덱스를 만들어야 하나?

### 인덱스가 필요한 경우

```sql
✓ WHERE 절에서 자주 사용되는 컬럼
SELECT * FROM users WHERE email = ?;
→ email 컬럼에 인덱스

✓ JOIN의 ON 절에서 사용되는 컬럼
SELECT * FROM orders JOIN users ON orders.user_id = users.id;
→ orders.user_id, users.id에 인덱스

✓ ORDER BY에서 사용되는 컬럼
SELECT * FROM products ORDER BY price DESC;
→ price 컬럼에 인덱스

✓ GROUP BY에서 사용되는 컬럼
SELECT category, COUNT(*) FROM products GROUP BY category;
→ category 컬럼에 인덱스

✓ 외래 키 컬럼
→ JOIN 성능 향상
```

### 인덱스가 불필요한 경우

```sql
✗ 데이터가 적은 테이블 (수천 행 이하)
→ Full Scan이 더 빠를 수 있음

✗ 자주 업데이트되는 컬럼
→ 인덱스 유지 비용 > 검색 성능 향상

✗ 카디널리티가 낮은 컬럼 (값의 종류가 적음)
→ 예: is_active (TRUE/FALSE 2가지)
→ 예: gender (M/F 2가지)

✗ INSERT/UPDATE가 빈번한 테이블
→ 인덱스 갱신 오버헤드
```

---

## 인덱스 전략

### 1. 카디널리티 (Cardinality)

카디널리티가 높을수록 인덱스 효과가 좋습니다.

```
카디널리티 = 고유한 값의 개수 / 전체 행의 개수

높은 카디널리티 (인덱스 효과 좋음):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
email: 100만 개 중 99만 개 고유 → 99%
user_id: 100만 개 중 100만 개 고유 → 100%

낮은 카디널리티 (인덱스 효과 나쁨):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gender: 100만 개 중 2개 고유 (M/F) → 0.0002%
is_active: 100만 개 중 2개 고유 → 0.0002%
```

### 2. 선택도 (Selectivity)

```sql
-- 선택도 계산
SELECT
    COUNT(DISTINCT email) AS distinct_count,
    COUNT(*) AS total_count,
    COUNT(DISTINCT email)::float / COUNT(*) AS selectivity
FROM users;
```

```
선택도가 높을수록 인덱스 효과 좋음
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

선택도 > 0.1 (10%) → 인덱스 추천
선택도 < 0.01 (1%) → 인덱스 효과 낮음
```

### 3. 복합 인덱스 순서

```sql
-- 카디널리티 높은 것을 앞에
CREATE INDEX idx_users_city_age ON users(city, age);

-- city: 100개 도시 (카디널리티 높음)
-- age: 0~100 (카디널리티 낮음)

-- 좋음: 앞쪽 컬럼 사용
SELECT * FROM users WHERE city = 'Seoul';

-- 좋음: 모든 컬럼 사용
SELECT * FROM users WHERE city = 'Seoul' AND age = 30;

-- 나쁨: 뒤쪽 컬럼만 사용
SELECT * FROM users WHERE age = 30;  -- 인덱스 사용 안 됨
```

---

## 인덱스의 단점

### 1. 저장 공간 차지

```
users 테이블: 1GB
인덱스 5개: 각 200MB
총 저장 공간: 1GB + 1GB = 2GB
```

### 2. INSERT/UPDATE/DELETE 성능 저하

```
인덱스 없이 INSERT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 테이블에 행 추가
완료! ✓

인덱스 5개 있을 때 INSERT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 테이블에 행 추가
2. 인덱스 1 업데이트
3. 인덱스 2 업데이트
4. 인덱스 3 업데이트
5. 인덱스 4 업데이트
6. 인덱스 5 업데이트
완료 (더 느림) ✓
```

### 3. 인덱스 유지 비용

```sql
-- 정기적인 인덱스 재구성 필요
REINDEX INDEX idx_users_email;
REINDEX TABLE users;

-- VACUUM으로 공간 회수
VACUUM ANALYZE users;
```

---

## 실무 예제

### 이커머스 사이트

```sql
-- products 테이블
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    category_id INT,
    price DECIMAL(10, 2),
    stock INT,
    created_at TIMESTAMP
);

-- 필요한 인덱스
CREATE INDEX idx_products_category ON products(category_id);  -- 카테고리별 조회
CREATE INDEX idx_products_price ON products(price);           -- 가격 범위 검색
CREATE INDEX idx_products_created ON products(created_at DESC); -- 최신순 정렬

-- 복합 인덱스
CREATE INDEX idx_products_cat_price ON products(category_id, price);  -- 카테고리 + 가격
```

### 검색 최적화

```sql
-- 일반 검색
SELECT * FROM products WHERE name = 'iPhone';  -- 느림

-- 부분 일치
SELECT * FROM products WHERE name LIKE '%iPhone%';  -- 인덱스 사용 안 됨

-- 전문 검색 인덱스 (PostgreSQL)
CREATE INDEX idx_products_name_gin ON products USING gin(to_tsvector('english', name));

SELECT * FROM products
WHERE to_tsvector('english', name) @@ to_tsquery('iphone');  -- 빠름
```

---

## 인덱스 모니터링

### PostgreSQL

```sql
-- 인덱스 목록 조회
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'users';

-- 인덱스 사용 통계
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,  -- 인덱스 스캔 횟수
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'users';

-- 사용되지 않는 인덱스 찾기
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pg_toast%';
```

### MySQL

```sql
-- 인덱스 목록
SHOW INDEX FROM users;

-- 인덱스 사용 통계
SELECT
    TABLE_NAME,
    INDEX_NAME,
    SEQ_IN_INDEX,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'mydb'
AND TABLE_NAME = 'users';
```

---

## 인덱스 설계 체크리스트

```
✓ WHERE 절에서 자주 사용되는 컬럼인가?
✓ 카디널리티가 높은가?
✓ JOIN에서 사용되는가?
✓ ORDER BY에서 사용되는가?
✓ 테이블 크기가 충분히 큰가? (수만 행 이상)

✗ INSERT/UPDATE가 너무 빈번한가?
✗ 테이블이 작은가? (수천 행 이하)
✗ 컬럼 값이 자주 변경되는가?

인덱스 생성 후:
✓ EXPLAIN으로 실제 사용 확인
✓ 쿼리 성능 측정
✓ 정기적으로 사용 통계 확인
```

---

## 실수 사례

### 1. 너무 많은 인덱스

```sql
-- ❌ 모든 컬럼에 인덱스
CREATE INDEX idx1 ON users(name);
CREATE INDEX idx2 ON users(email);
CREATE INDEX idx3 ON users(phone);
CREATE INDEX idx4 ON users(address);
CREATE INDEX idx5 ON users(city);
CREATE INDEX idx6 ON users(country);
-- ... (10개 이상)

문제:
- INSERT 매우 느림
- 저장 공간 낭비
- 유지보수 어려움
```

### 2. 함수 사용으로 인덱스 무효화

```sql
-- ❌ 인덱스 사용 안 됨
SELECT * FROM users WHERE YEAR(created_at) = 2024;

-- ✅ 인덱스 사용됨
SELECT * FROM users
WHERE created_at >= '2024-01-01'
AND created_at < '2025-01-01';
```

### 3. LIKE의 와일드카드 위치

```sql
-- ❌ 인덱스 사용 안 됨
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- ✅ 인덱스 사용됨
SELECT * FROM users WHERE email LIKE 'john%';
```

---

## 추가 학습 자료

- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Use The Index, Luke!](https://use-the-index-luke.com/)
- [Database Indexing Explained | Hussein Nasser](https://www.youtube.com/watch?v=ITcOiLSfVJQ)

---

## 다음 학습

- [쿼리 최적화](query-optimization.md)
- [EXPLAIN 분석](explain-analysis.md)
- [데이터베이스 프로파일링](database-profiling.md)

---

*Last updated: 2026-01-05*
