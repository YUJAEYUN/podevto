# PostgreSQL 완벽 가이드

## PostgreSQL이란?

**PostgreSQL**은 세계에서 가장 발전된 오픈소스 관계형 데이터베이스입니다.

```
PostgreSQL 특징
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 완전한 ACID 준수
✓ 강력한 확장성
✓ JSON/JSONB 지원 (NoSQL 기능)
✓ 풍부한 데이터 타입
✓ 우수한 성능
✓ 활발한 커뮤니티
✓ MIT 라이선스 (무료, 상업적 사용 가능)
```

---

## 설치

### macOS

```bash
# Homebrew로 설치
brew install postgresql@15

# 서비스 시작
brew services start postgresql@15

# 접속
psql postgres
```

### Ubuntu/Debian

```bash
# 패키지 업데이트
sudo apt update

# PostgreSQL 설치
sudo apt install postgresql postgresql-contrib

# 서비스 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# postgres 사용자로 접속
sudo -u postgres psql
```

### Docker

```bash
# PostgreSQL 컨테이너 실행
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  -d postgres:15

# 접속
docker exec -it postgres-dev psql -U postgres -d mydb
```

---

## 기본 사용법

### psql 명령어

```sql
-- 데이터베이스 목록
\l

-- 데이터베이스 연결
\c mydb

-- 테이블 목록
\dt

-- 테이블 구조 확인
\d users

-- 쿼리 실행
SELECT * FROM users;

-- 쿼리 실행 시간 표시
\timing

-- SQL 파일 실행
\i script.sql

-- 종료
\q
```

### 데이터베이스 생성

```sql
-- 데이터베이스 생성
CREATE DATABASE myapp;

-- 인코딩 지정
CREATE DATABASE myapp
    ENCODING 'UTF8'
    LC_COLLATE = 'ko_KR.UTF-8'
    LC_CTYPE = 'ko_KR.UTF-8'
    TEMPLATE template0;

-- 데이터베이스 삭제
DROP DATABASE myapp;
```

---

## PostgreSQL 데이터 타입

### 숫자 타입

| 타입 | 크기 | 범위 | 사용 예시 |
|------|------|------|----------|
| **SMALLINT** | 2 bytes | -32,768 ~ 32,767 | 작은 정수 |
| **INTEGER (INT)** | 4 bytes | -2억 ~ 2억 | 일반 정수 |
| **BIGINT** | 8 bytes | 매우 큰 정수 | ID, 타임스탬프 |
| **SERIAL** | 4 bytes | 자동 증가 | 기본 키 |
| **BIGSERIAL** | 8 bytes | 자동 증가 (큰 값) | 기본 키 |
| **DECIMAL(p,s)** | 가변 | 정확한 소수 | 금액, 가격 |
| **REAL** | 4 bytes | 부동소수점 | 과학 계산 |
| **DOUBLE PRECISION** | 8 bytes | 부동소수점 | 과학 계산 |

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10, 2),  -- 99999999.99까지
    weight REAL,
    views BIGINT
);
```

### 문자열 타입

| 타입 | 설명 | 사용 예시 |
|------|------|----------|
| **VARCHAR(n)** | 가변 길이 (최대 n) | 이름, 이메일 |
| **CHAR(n)** | 고정 길이 | 국가 코드 |
| **TEXT** | 무제한 길이 | 본문, 설명 |

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),      -- 최대 100자
    country_code CHAR(2),   -- 정확히 2자 (KR, US)
    bio TEXT                -- 긴 텍스트
);
```

### 날짜/시간 타입

```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_date DATE,                    -- 2024-01-01
    event_time TIME,                    -- 14:30:00
    event_datetime TIMESTAMP,           -- 2024-01-01 14:30:00
    event_datetime_tz TIMESTAMPTZ,      -- 2024-01-01 14:30:00+09
    created_at TIMESTAMP DEFAULT NOW()
);

-- 날짜 연산
SELECT NOW();                           -- 현재 시간
SELECT CURRENT_DATE;                    -- 오늘 날짜
SELECT NOW() - INTERVAL '7 days';       -- 7일 전
SELECT NOW() + INTERVAL '1 month';      -- 1개월 후
```

### Boolean 타입

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE
);

-- 사용
INSERT INTO posts (title, is_published) VALUES ('Hello', TRUE);
SELECT * FROM posts WHERE is_published = TRUE;
```

### JSON 타입

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    metadata JSON,         -- JSON (텍스트 저장)
    settings JSONB         -- JSONB (바이너리 저장, 더 빠름)
);

-- 데이터 삽입
INSERT INTO users (name, settings) VALUES
('John', '{"theme": "dark", "notifications": true}');

-- JSON 쿼리
SELECT * FROM users WHERE settings->>'theme' = 'dark';
SELECT * FROM users WHERE settings->'notifications' = 'true';

-- JSONB 인덱스
CREATE INDEX idx_users_settings ON users USING gin(settings);
```

### 배열 타입

```sql
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    tags TEXT[]  -- 문자열 배열
);

-- 데이터 삽입
INSERT INTO articles (title, tags) VALUES
('PostgreSQL Guide', ARRAY['database', 'postgresql', 'tutorial']);

-- 배열 쿼리
SELECT * FROM articles WHERE 'postgresql' = ANY(tags);
SELECT * FROM articles WHERE tags @> ARRAY['database'];
```

---

## PostgreSQL 특화 기능

### 1. RETURNING 절

```sql
-- INSERT 후 생성된 ID 반환
INSERT INTO users (name, email)
VALUES ('John', 'john@example.com')
RETURNING id;

-- UPDATE 후 수정된 행 반환
UPDATE users SET age = age + 1
WHERE id = 1
RETURNING *;

-- DELETE 후 삭제된 행 반환
DELETE FROM users WHERE id = 1
RETURNING name, email;
```

### 2. UPSERT (ON CONFLICT)

```sql
-- 있으면 업데이트, 없으면 삽입
INSERT INTO users (email, name, age)
VALUES ('john@example.com', 'John Doe', 30)
ON CONFLICT (email)
DO UPDATE SET
    name = EXCLUDED.name,
    age = EXCLUDED.age,
    updated_at = NOW();

-- 충돌 시 무시
INSERT INTO users (email, name)
VALUES ('john@example.com', 'John Doe')
ON CONFLICT (email) DO NOTHING;
```

### 3. Common Table Expressions (CTE)

```sql
-- WITH를 사용한 복잡한 쿼리
WITH recent_orders AS (
    SELECT user_id, COUNT(*) AS order_count
    FROM orders
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY user_id
)
SELECT
    users.name,
    recent_orders.order_count
FROM users
LEFT JOIN recent_orders ON users.id = recent_orders.user_id
WHERE recent_orders.order_count > 5;
```

### 4. Window Functions

```sql
-- 순위 매기기
SELECT
    name,
    salary,
    RANK() OVER (ORDER BY salary DESC) AS salary_rank,
    ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num
FROM employees;

-- 부서별 순위
SELECT
    department,
    name,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees;

-- 누적 합계
SELECT
    date,
    amount,
    SUM(amount) OVER (ORDER BY date) AS cumulative_total
FROM sales;
```

### 5. Full Text Search

```sql
-- tsvector와 tsquery 사용
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    search_vector TSVECTOR
);

-- 검색 벡터 생성
UPDATE documents
SET search_vector = to_tsvector('english', title || ' ' || content);

-- 인덱스 생성
CREATE INDEX idx_documents_search ON documents USING gin(search_vector);

-- 검색
SELECT * FROM documents
WHERE search_vector @@ to_tsquery('postgresql & performance');

-- 자동 업데이트 트리거
CREATE TRIGGER documents_search_update
BEFORE INSERT OR UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', title, content);
```

---

## 인덱스

### 인덱스 타입

```sql
-- B-Tree (기본값, 가장 많이 사용)
CREATE INDEX idx_users_email ON users(email);

-- Hash (등호 검색에 최적화)
CREATE INDEX idx_users_id_hash ON users USING hash(id);

-- GIN (JSON, 배열, 전문 검색)
CREATE INDEX idx_posts_tags ON posts USING gin(tags);
CREATE INDEX idx_users_metadata ON users USING gin(metadata);

-- GiST (지리 데이터, 범위)
CREATE INDEX idx_locations ON places USING gist(location);

-- BRIN (매우 큰 테이블, 순차 데이터)
CREATE INDEX idx_logs_created ON logs USING brin(created_at);
```

### 부분 인덱스

```sql
-- 활성 사용자만 인덱싱
CREATE INDEX idx_active_users_email
ON users(email)
WHERE is_active = TRUE;
```

### 표현식 인덱스

```sql
-- 소문자 변환 인덱스
CREATE INDEX idx_users_lower_email
ON users(LOWER(email));

-- 사용
SELECT * FROM users WHERE LOWER(email) = 'john@example.com';
```

---

## 제약 조건 (Constraints)

### PRIMARY KEY

```sql
-- 자동 증가 기본 키
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

-- UUID 기본 키
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100)
);
```

### FOREIGN KEY

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE          -- 사용자 삭제 시 주문도 삭제
        ON UPDATE CASCADE
);

-- ON DELETE 옵션:
-- CASCADE: 함께 삭제
-- SET NULL: NULL로 설정
-- SET DEFAULT: 기본값으로 설정
-- RESTRICT: 삭제 방지 (기본값)
```

### UNIQUE

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL
);

-- 복합 UNIQUE
CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    UNIQUE(user_id, role_id)
);
```

### CHECK

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10, 2) CHECK (price > 0),
    stock INT CHECK (stock >= 0),
    discount_percent INT CHECK (discount_percent BETWEEN 0 AND 100)
);
```

---

## 트랜잭션

```sql
-- 기본 트랜잭션
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- 롤백
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- 문제 발생!
ROLLBACK;

-- Savepoint
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
SAVEPOINT sp1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
-- 문제 발생, sp1으로 롤백
ROLLBACK TO sp1;
COMMIT;
```

### 격리 수준

```sql
-- 격리 수준 설정
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 트랜잭션 시작 시 지정
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

---

## 성능 최적화

### EXPLAIN으로 쿼리 분석

```sql
-- 실행 계획만 확인
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';

-- 실제 실행 + 실행 계획
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';

-- 더 자세한 정보
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM users WHERE email = 'john@example.com';
```

### VACUUM

```sql
-- 테이블 정리 (공간 회수)
VACUUM users;

-- 분석 정보 업데이트
VACUUM ANALYZE users;

-- 전체 데이터베이스
VACUUM ANALYZE;

-- 강제 정리 (테이블 잠금)
VACUUM FULL users;
```

### 연결 풀링

```javascript
// Node.js pg 패키지
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password',
  database: 'mydb',
  max: 20,                    // 최대 연결 수
  idleTimeoutMillis: 30000,   // 유휴 연결 타임아웃
  connectionTimeoutMillis: 2000
});

// 쿼리 실행
const result = await pool.query('SELECT * FROM users WHERE id = $1', [1]);

// 트랜잭션
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE ...');
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

---

## 유용한 쿼리

### 데이터베이스 정보

```sql
-- 데이터베이스 크기
SELECT
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database;

-- 테이블 크기
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 인덱스 크기
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) AS size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

### 실행 중인 쿼리

```sql
-- 현재 실행 중인 쿼리
SELECT
    pid,
    usename,
    application_name,
    state,
    query,
    query_start
FROM pg_stat_activity
WHERE state = 'active';

-- 느린 쿼리 찾기
SELECT
    pid,
    now() - query_start AS duration,
    query
FROM pg_stat_activity
WHERE state = 'active'
AND now() - query_start > interval '1 minute';

-- 쿼리 종료
SELECT pg_cancel_backend(PID);  -- 부드럽게 종료
SELECT pg_terminate_backend(PID);  -- 강제 종료
```

---

## 백업 및 복구

### pg_dump로 백업

```bash
# 데이터베이스 백업
pg_dump mydb > mydb_backup.sql

# 압축 백업
pg_dump mydb | gzip > mydb_backup.sql.gz

# 특정 테이블만 백업
pg_dump mydb -t users > users_backup.sql

# 커스텀 포맷 (병렬 복구 가능)
pg_dump -Fc mydb > mydb_backup.dump
```

### 복구

```bash
# SQL 파일 복구
psql mydb < mydb_backup.sql

# 압축 파일 복구
gunzip -c mydb_backup.sql.gz | psql mydb

# 커스텀 포맷 복구 (병렬)
pg_restore -j 4 -d mydb mydb_backup.dump
```

---

## 실무 팁

### 1. 파라미터 바인딩 (SQL Injection 방지)

```javascript
// ❌ 위험! SQL Injection 가능
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ 안전: 파라미터 바인딩
const query = 'SELECT * FROM users WHERE email = $1';
const result = await pool.query(query, [email]);
```

### 2. 페이지네이션

```sql
-- 커서 기반 (더 효율적)
SELECT * FROM users
WHERE id > 100  -- 마지막 ID
ORDER BY id
LIMIT 20;

-- OFFSET 기반 (간단하지만 느림)
SELECT * FROM users
ORDER BY id
LIMIT 20 OFFSET 40;
```

### 3. Bulk Insert

```javascript
// 여러 행 한 번에 삽입
const values = users.map((u, i) =>
  `($${i * 2 + 1}, $${i * 2 + 2})`
).join(',');

const params = users.flatMap(u => [u.name, u.email]);

const query = `
  INSERT INTO users (name, email)
  VALUES ${values}
`;

await pool.query(query, params);
```

---

## 추가 학습 자료

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [Postgres Guide](http://postgresguide.com/)
- [PostgreSQL Exercises](https://pgexercises.com/)

---

## 다음 학습

- [인덱싱](indexing.md)
- [쿼리 최적화](query-optimization.md)
- [ACID 속성](acid-properties.md)

---

*Last updated: 2026-01-05*
