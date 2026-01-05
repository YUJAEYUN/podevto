# SQL 기초 (SQL Basics)

## SQL이란?

**SQL (Structured Query Language)** 은 관계형 데이터베이스를 관리하고 조작하기 위한 표준 언어입니다.

```
SQL = 데이터베이스와 대화하는 언어

사람: "모든 사용자를 보여줘"
SQL:  SELECT * FROM users;

사람: "30세 이상인 사용자만 보여줘"
SQL:  SELECT * FROM users WHERE age >= 30;
```

---

## SQL 명령어 분류

```
┌─────────────────────────────────────────────────┐
│                  SQL 명령어                      │
├─────────────────────────────────────────────────┤
│                                                  │
│ DDL (Data Definition Language)                  │
│ - 데이터베이스 구조 정의                          │
│ - CREATE, ALTER, DROP                           │
│                                                  │
│ DML (Data Manipulation Language)                 │
│ - 데이터 조작                                    │
│ - SELECT, INSERT, UPDATE, DELETE                │
│                                                  │
│ DCL (Data Control Language)                      │
│ - 권한 관리                                      │
│ - GRANT, REVOKE                                 │
│                                                  │
│ TCL (Transaction Control Language)               │
│ - 트랜잭션 제어                                  │
│ - COMMIT, ROLLBACK                              │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## DDL - 데이터베이스 구조 정의

### 1. CREATE - 생성

#### 데이터베이스 생성

```sql
CREATE DATABASE myapp;
```

#### 테이블 생성

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 다양한 제약 조건

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    stock INT DEFAULT 0 CHECK (stock >= 0),
    category_id INT REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. ALTER - 수정

```sql
-- 컬럼 추가
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 컬럼 삭제
ALTER TABLE users DROP COLUMN phone;

-- 컬럼 타입 변경
ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(150);

-- NOT NULL 추가
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
```

### 3. DROP - 삭제

```sql
-- 테이블 삭제
DROP TABLE users;

-- 존재하는 경우에만 삭제
DROP TABLE IF EXISTS users;

-- 데이터베이스 삭제
DROP DATABASE myapp;
```

---

## DML - 데이터 조작

### 1. SELECT - 조회

#### 기본 조회

```sql
-- 모든 컬럼 조회
SELECT * FROM users;

-- 특정 컬럼만 조회
SELECT name, email FROM users;

-- 별칭(alias) 사용
SELECT name AS user_name, email AS user_email FROM users;
```

#### WHERE - 조건 필터링

```sql
-- 기본 조건
SELECT * FROM users WHERE age > 25;

-- 여러 조건 (AND)
SELECT * FROM users WHERE age > 25 AND is_active = TRUE;

-- 여러 조건 (OR)
SELECT * FROM users WHERE age < 20 OR age > 60;

-- IN 연산자
SELECT * FROM users WHERE age IN (25, 30, 35);

-- BETWEEN
SELECT * FROM users WHERE age BETWEEN 20 AND 30;

-- LIKE (패턴 매칭)
SELECT * FROM users WHERE email LIKE '%@gmail.com';
SELECT * FROM users WHERE name LIKE 'J%';  -- J로 시작

-- IS NULL
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;
```

#### ORDER BY - 정렬

```sql
-- 오름차순 (기본)
SELECT * FROM users ORDER BY age;
SELECT * FROM users ORDER BY age ASC;

-- 내림차순
SELECT * FROM users ORDER BY age DESC;

-- 여러 컬럼으로 정렬
SELECT * FROM users ORDER BY age DESC, name ASC;
```

#### LIMIT - 결과 개수 제한

```sql
-- 상위 10개
SELECT * FROM users LIMIT 10;

-- OFFSET과 함께 사용 (페이지네이션)
SELECT * FROM users LIMIT 10 OFFSET 20;  -- 21~30번째 레코드
```

#### DISTINCT - 중복 제거

```sql
-- 중복 없이 나이 목록
SELECT DISTINCT age FROM users;
```

### 2. INSERT - 삽입

```sql
-- 단일 레코드 삽입
INSERT INTO users (name, email, age)
VALUES ('John Doe', 'john@example.com', 30);

-- 여러 레코드 삽입
INSERT INTO users (name, email, age)
VALUES
    ('Jane Smith', 'jane@example.com', 25),
    ('Bob Johnson', 'bob@example.com', 35),
    ('Alice Brown', 'alice@example.com', 28);

-- 삽입 후 ID 반환 (PostgreSQL)
INSERT INTO users (name, email, age)
VALUES ('Mike Wilson', 'mike@example.com', 40)
RETURNING id;
```

### 3. UPDATE - 수정

```sql
-- 특정 레코드 수정
UPDATE users
SET age = 31, email = 'john.doe@example.com'
WHERE id = 1;

-- 조건에 맞는 모든 레코드 수정
UPDATE users
SET is_active = FALSE
WHERE age > 60;

-- 모든 레코드 수정 (주의!)
UPDATE users SET is_active = TRUE;
```

### 4. DELETE - 삭제

```sql
-- 특정 레코드 삭제
DELETE FROM users WHERE id = 1;

-- 조건에 맞는 레코드 삭제
DELETE FROM users WHERE is_active = FALSE;

-- 모든 레코드 삭제 (주의!)
DELETE FROM users;

-- TRUNCATE (더 빠름, 복구 불가)
TRUNCATE TABLE users;
```

---

## JOIN - 테이블 연결

### 테이블 구조 예시

```sql
-- users 테이블
┌────┬──────┬─────────────────┐
│ id │ name │ email           │
├────┼──────┼─────────────────┤
│ 1  │ John │ john@example.com│
│ 2  │ Jane │ jane@example.com│
│ 3  │ Bob  │ bob@example.com │
└────┴──────┴─────────────────┘

-- orders 테이블
┌────┬─────────┬─────────┬────────┐
│ id │ user_id │ product │ amount │
├────┼─────────┼─────────┼────────┤
│ 1  │ 1       │ Laptop  │ 1000   │
│ 2  │ 1       │ Mouse   │ 20     │
│ 3  │ 2       │ Phone   │ 800    │
└────┴─────────┴─────────┴────────┘
```

### 1. INNER JOIN

양쪽 테이블에 모두 존재하는 데이터만 반환합니다.

```sql
SELECT
    users.name,
    orders.product,
    orders.amount
FROM users
INNER JOIN orders ON users.id = orders.user_id;
```

```
결과:
┌──────┬─────────┬────────┐
│ name │ product │ amount │
├──────┼─────────┼────────┤
│ John │ Laptop  │ 1000   │
│ John │ Mouse   │ 20     │
│ Jane │ Phone   │ 800    │
└──────┴─────────┴────────┘
```

**특징**: Bob은 주문이 없어서 결과에 없음

### 2. LEFT JOIN (LEFT OUTER JOIN)

왼쪽 테이블의 모든 데이터를 반환합니다.

```sql
SELECT
    users.name,
    orders.product,
    orders.amount
FROM users
LEFT JOIN orders ON users.id = orders.user_id;
```

```
결과:
┌──────┬─────────┬────────┐
│ name │ product │ amount │
├──────┼─────────┼────────┤
│ John │ Laptop  │ 1000   │
│ John │ Mouse   │ 20     │
│ Jane │ Phone   │ 800    │
│ Bob  │ NULL    │ NULL   │  ← 주문 없어도 표시
└──────┴─────────┴────────┘
```

### 3. RIGHT JOIN (RIGHT OUTER JOIN)

오른쪽 테이블의 모든 데이터를 반환합니다.

```sql
SELECT
    users.name,
    orders.product,
    orders.amount
FROM users
RIGHT JOIN orders ON users.id = orders.user_id;
```

### 4. FULL OUTER JOIN

양쪽 테이블의 모든 데이터를 반환합니다.

```sql
SELECT
    users.name,
    orders.product
FROM users
FULL OUTER JOIN orders ON users.id = orders.user_id;
```

### JOIN 비교

```
INNER JOIN          LEFT JOIN           RIGHT JOIN
┌─────┐            ┌─────┐             ┌─────┐
│  A  │            │  A  │             │  A  │
│ ╱ ╲ │            │ █ ╲ │             │ ╱ █ │
│█   █│            │█   █│             │█   █│
│ ╲ ╱ │            │ ╲ ╱ │             │ ╲ ╱ │
└─────┘            └─────┘             └─────┘
교집합              왼쪽 전체            오른쪽 전체
```

---

## 집계 함수 (Aggregate Functions)

### 기본 집계 함수

```sql
-- COUNT - 개수
SELECT COUNT(*) FROM users;
SELECT COUNT(DISTINCT age) FROM users;  -- 중복 제외

-- SUM - 합계
SELECT SUM(amount) FROM orders;

-- AVG - 평균
SELECT AVG(age) FROM users;

-- MAX - 최댓값
SELECT MAX(age) FROM users;

-- MIN - 최솟값
SELECT MIN(age) FROM users;
```

### GROUP BY - 그룹화

```sql
-- 사용자별 주문 수
SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id;

-- 사용자별 총 주문 금액
SELECT user_id, SUM(amount) AS total_amount
FROM orders
GROUP BY user_id;

-- 사용자 이름과 함께
SELECT
    users.name,
    COUNT(orders.id) AS order_count,
    SUM(orders.amount) AS total_amount
FROM users
LEFT JOIN orders ON users.id = orders.user_id
GROUP BY users.id, users.name;
```

### HAVING - 그룹 필터링

```sql
-- 주문이 2개 이상인 사용자
SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) >= 2;

-- 총 주문 금액이 1000 이상인 사용자
SELECT user_id, SUM(amount) AS total_amount
FROM orders
GROUP BY user_id
HAVING SUM(amount) >= 1000;
```

**WHERE vs HAVING**:
```sql
-- WHERE: 그룹화 전 필터링
-- HAVING: 그룹화 후 필터링

SELECT user_id, COUNT(*) AS order_count
FROM orders
WHERE amount > 100           -- 개별 주문 필터링
GROUP BY user_id
HAVING COUNT(*) >= 2;        -- 그룹 필터링
```

---

## 서브쿼리 (Subquery)

### WHERE절의 서브쿼리

```sql
-- 평균 나이보다 많은 사용자
SELECT * FROM users
WHERE age > (SELECT AVG(age) FROM users);

-- 주문이 있는 사용자
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders);

-- 주문이 없는 사용자
SELECT * FROM users
WHERE id NOT IN (SELECT user_id FROM orders);
```

### FROM절의 서브쿼리

```sql
-- 사용자별 주문 통계를 먼저 계산
SELECT *
FROM (
    SELECT user_id, COUNT(*) AS order_count
    FROM orders
    GROUP BY user_id
) AS order_stats
WHERE order_count > 2;
```

---

## 실무 SQL 예제

### 1. 페이지네이션

```sql
-- 페이지당 20개, 2페이지
SELECT * FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 20;

-- 더 효율적인 방법 (커서 기반)
SELECT * FROM users
WHERE id > 100  -- 마지막으로 본 ID
ORDER BY id
LIMIT 20;
```

### 2. 검색

```sql
-- 이름 또는 이메일 검색
SELECT * FROM users
WHERE name LIKE '%john%' OR email LIKE '%john%';

-- 대소문자 구분 없이 (PostgreSQL)
SELECT * FROM users
WHERE name ILIKE '%john%' OR email ILIKE '%john%';
```

### 3. 통계 쿼리

```sql
-- 사용자별 주문 통계 대시보드
SELECT
    users.id,
    users.name,
    COUNT(orders.id) AS total_orders,
    COALESCE(SUM(orders.amount), 0) AS total_spent,
    COALESCE(AVG(orders.amount), 0) AS avg_order_value,
    MAX(orders.created_at) AS last_order_date
FROM users
LEFT JOIN orders ON users.id = orders.user_id
GROUP BY users.id, users.name
ORDER BY total_spent DESC;
```

### 4. 날짜 필터링

```sql
-- 오늘 생성된 사용자
SELECT * FROM users
WHERE DATE(created_at) = CURRENT_DATE;

-- 최근 7일 주문
SELECT * FROM orders
WHERE created_at >= NOW() - INTERVAL '7 days';

-- 월별 통계
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS order_count,
    SUM(amount) AS total_amount
FROM orders
GROUP BY month
ORDER BY month DESC;
```

---

## SQL 작성 팁

### 1. 가독성

```sql
-- ❌ 읽기 어려움
SELECT users.name,orders.product,orders.amount FROM users INNER JOIN orders ON users.id=orders.user_id WHERE orders.amount>100;

-- ✅ 읽기 쉬움
SELECT
    users.name,
    orders.product,
    orders.amount
FROM users
INNER JOIN orders ON users.id = orders.user_id
WHERE orders.amount > 100;
```

### 2. 명시적 컬럼 지정

```sql
-- ❌ SELECT *는 지양
SELECT * FROM users;

-- ✅ 필요한 컬럼만
SELECT id, name, email FROM users;
```

### 3. 인덱스 활용

```sql
-- 자주 검색하는 컬럼에 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 복합 인덱스
CREATE INDEX idx_orders_user_date
ON orders(user_id, created_at);
```

---

## 일반적인 실수

### 1. WHERE vs HAVING 혼동

```sql
-- ❌ 잘못됨
SELECT user_id, COUNT(*) AS cnt
FROM orders
HAVING user_id = 1;  -- user_id는 그룹화 전 필터링

-- ✅ 올바름
SELECT user_id, COUNT(*) AS cnt
FROM orders
WHERE user_id = 1
GROUP BY user_id;
```

### 2. NULL 처리

```sql
-- ❌ NULL은 = 로 비교 불가
SELECT * FROM users WHERE phone = NULL;

-- ✅ IS NULL 사용
SELECT * FROM users WHERE phone IS NULL;
```

### 3. 문자열과 숫자 비교

```sql
-- ❌ 타입 불일치
WHERE age = '30'  -- age가 INT인 경우

-- ✅ 타입 일치
WHERE age = 30
```

---

## 연습 문제

```sql
-- 1. 30세 이상 사용자의 이름과 이메일 조회
SELECT name, email FROM users WHERE age >= 30;

-- 2. 주문 금액이 가장 큰 5개 주문 조회
SELECT * FROM orders ORDER BY amount DESC LIMIT 5;

-- 3. 주문이 없는 사용자 찾기
SELECT * FROM users
WHERE id NOT IN (SELECT user_id FROM orders);

-- 4. 사용자별 평균 주문 금액 (주문이 있는 사용자만)
SELECT
    users.name,
    AVG(orders.amount) AS avg_amount
FROM users
INNER JOIN orders ON users.id = orders.user_id
GROUP BY users.id, users.name;

-- 5. 월별 주문 수와 총액
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS order_count,
    SUM(amount) AS total_amount
FROM orders
GROUP BY month
ORDER BY month DESC;
```

---

## 추가 학습 자료

- [SQL Tutorial | W3Schools](https://www.w3schools.com/sql/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [SQLBolt - Interactive Learning](https://sqlbolt.com/)
- [SQL Zoo](https://sqlzoo.net/)

---

## 다음 학습

- [PostgreSQL 완벽 가이드](postgresql-guide.md)
- [인덱싱](indexing.md)
- [쿼리 최적화](query-optimization.md)

---

*Last updated: 2026-01-05*
