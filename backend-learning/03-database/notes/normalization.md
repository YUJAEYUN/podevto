# 데이터베이스 정규화 (Normalization)

## 정규화란?

**정규화(Normalization)** 는 데이터베이스 설계에서 데이터 중복을 최소화하고 무결성을 보장하기 위해 테이블을 구조화하는 과정입니다.

```
정규화의 목표
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 데이터 중복 제거
✅ 삽입/수정/삭제 이상 현상 방지
✅ 데이터 무결성 유지
✅ 저장 공간 절약
```

---

## 정규화 vs 비정규화

### 비정규화된 테이블 (나쁜 예)

```
students 테이블
┌────┬──────┬──────┬─────────┬────────┬────────┬────────┐
│ id │ name │ major│ major_  │ course1│ course2│ course3│
│    │      │      │ building│        │        │        │
├────┼──────┼──────┼─────────┼────────┼────────┼────────┤
│ 1  │ John │ CS   │ Building│ Math   │ Physics│ NULL   │
│    │      │      │ A       │        │        │        │
│ 2  │ Jane │ CS   │ Building│ Math   │ CS101  │ CS102  │
│    │      │      │ A       │        │        │        │
│ 3  │ Bob  │ Math │ Building│ Algebra│ NULL   │ NULL   │
│    │      │      │ B       │        │        │        │
└────┴──────┴──────┴─────────┴────────┴────────┴────────┘
```

**문제점**:
```
❌ 데이터 중복
   - "CS" 전공 정보가 여러 행에 중복
   - "Building A" 정보가 중복

❌ 삽입 이상
   - 학생 없이 새로운 전공 정보만 추가 불가

❌ 수정 이상
   - "Building A" → "Building C" 변경 시
     모든 CS 학생 행을 수정해야 함

❌ 삭제 이상
   - Bob 삭제 시 Math 전공 정보도 함께 삭제됨

❌ NULL 값 낭비
   - course3 컬럼이 대부분 NULL
```

### 정규화된 테이블 (좋은 예)

```
students
┌────┬──────┬──────────┐
│ id │ name │ major_id │
├────┼──────┼──────────┤
│ 1  │ John │ 1        │
│ 2  │ Jane │ 1        │
│ 3  │ Bob  │ 2        │
└────┴──────┴──────────┘

majors
┌────┬──────┬──────────┐
│ id │ name │ building │
├────┼──────┼──────────┤
│ 1  │ CS   │ Building A│
│ 2  │ Math │ Building B│
└────┴──────┴──────────┘

enrollments
┌────┬────────────┬───────────┐
│ id │ student_id │ course_id │
├────┼────────────┼───────────┤
│ 1  │ 1          │ 1         │
│ 2  │ 1          │ 2         │
│ 3  │ 2          │ 1         │
│ 4  │ 2          │ 3         │
│ 5  │ 2          │ 4         │
│ 6  │ 3          │ 5         │
└────┴────────────┴───────────┘

courses
┌────┬─────────┐
│ id │ name    │
├────┼─────────┤
│ 1  │ Math    │
│ 2  │ Physics │
│ 3  │ CS101   │
│ 4  │ CS102   │
│ 5  │ Algebra │
└────┴─────────┘
```

**장점**:
```
✅ 중복 제거
✅ 이상 현상 방지
✅ 데이터 무결성 보장
✅ 저장 공간 절약
```

---

## 정규화 단계

### 제1정규형 (1NF)

**규칙**: 각 컬럼은 **원자값(Atomic Value)** 만 가져야 합니다.

#### 비정규형 (0NF)

```
students
┌────┬──────┬────────────────────┐
│ id │ name │ courses            │
├────┼──────┼────────────────────┤
│ 1  │ John │ Math, Physics      │  ← 복합 값!
│ 2  │ Jane │ Math, CS101, CS102 │  ← 복합 값!
└────┴──────┴────────────────────┘
```

**문제점**:
- 특정 과목 검색 어려움
- 과목 수 제한
- 과목 추가/삭제 복잡

#### 제1정규형 (1NF)

```
students
┌────┬──────┬─────────┐
│ id │ name │ course  │
├────┼──────┼─────────┤
│ 1  │ John │ Math    │  ← 원자값
│ 1  │ John │ Physics │  ← 원자값
│ 2  │ Jane │ Math    │
│ 2  │ Jane │ CS101   │
│ 2  │ Jane │ CS102   │
└────┴──────┴─────────┘
```

**SQL 예시**:

```sql
-- ❌ 1NF 위반
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    courses TEXT  -- "Math, Physics, CS101" 같은 복합 값 저장
);

-- ✅ 1NF 준수
CREATE TABLE students (
    id INT,
    name VARCHAR(100),
    course VARCHAR(100),
    PRIMARY KEY (id, course)
);
```

---

### 제2정규형 (2NF)

**규칙**: 1NF를 만족하고, **부분 함수 종속**을 제거해야 합니다.

**부분 함수 종속**: 복합 기본 키의 일부에만 종속되는 컬럼

#### 1NF (2NF 위반)

```
students
┌────┬─────────┬──────┬──────────┬───────────┐
│ id │ course  │ name │ major    │ professor │
├────┼─────────┼──────┼──────────┼───────────┤
│ 1  │ Math    │ John │ CS       │ Dr. Kim   │
│ 1  │ Physics │ John │ CS       │ Dr. Lee   │
│ 2  │ Math    │ Jane │ Math     │ Dr. Kim   │
└────┴─────────┴──────┴──────────┴───────────┘
        ↑
    복합 기본 키: (id, course)
```

**문제 분석**:
```
id + course → name, major, professor  (전체 종속)
id → name, major  (부분 종속! ❌)
course → professor  (부분 종속! ❌)
```

- `name`, `major`는 `id`에만 종속 (course 불필요)
- `professor`는 `course`에만 종속 (id 불필요)

#### 제2정규형 (2NF)

```
students
┌────┬──────┬──────┐
│ id │ name │ major│
├────┼──────┼──────┤
│ 1  │ John │ CS   │
│ 2  │ Jane │ Math │
└────┴──────┴──────┘
     ↑
   기본 키: id

courses
┌─────────┬───────────┐
│ name    │ professor │
├─────────┼───────────┤
│ Math    │ Dr. Kim   │
│ Physics │ Dr. Lee   │
└─────────┴───────────┘
        ↑
    기본 키: name

enrollments
┌────────────┬───────────┐
│ student_id │ course_id │
├────────────┼───────────┤
│ 1          │ Math      │
│ 1          │ Physics   │
│ 2          │ Math      │
└────────────┴───────────┘
```

**SQL 예시**:

```sql
-- 2NF 준수
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    major VARCHAR(100)
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    professor VARCHAR(100)
);

CREATE TABLE enrollments (
    student_id INT REFERENCES students(id),
    course_id INT REFERENCES courses(id),
    PRIMARY KEY (student_id, course_id)
);
```

---

### 제3정규형 (3NF)

**규칙**: 2NF를 만족하고, **이행적 함수 종속**을 제거해야 합니다.

**이행적 함수 종속**: A → B, B → C 일 때 A → C (간접 종속)

#### 2NF (3NF 위반)

```
employees
┌────┬──────┬─────────────┬──────────────┐
│ id │ name │ department  │ dept_location│
├────┼──────┼─────────────┼──────────────┤
│ 1  │ John │ Engineering │ Building A   │
│ 2  │ Jane │ Engineering │ Building A   │
│ 3  │ Bob  │ Marketing   │ Building B   │
└────┴──────┴─────────────┴──────────────┘
```

**문제 분석**:
```
id → department → dept_location

id → department  (직접 종속)
department → dept_location  (직접 종속)
id → dept_location  (이행적 종속! ❌)
```

- `dept_location`이 `id`에 직접 종속되지 않고 `department`를 거쳐 간접 종속

**문제점**:
```
❌ 수정 이상
   - "Engineering" 부서 위치 변경 시 모든 행 수정 필요

❌ 삭제 이상
   - 마지막 Marketing 직원 삭제 시 부서 정보도 삭제

❌ 데이터 중복
   - "Building A"가 여러 행에 중복
```

#### 제3정규형 (3NF)

```
employees
┌────┬──────┬───────────────┐
│ id │ name │ department_id │
├────┼──────┼───────────────┤
│ 1  │ John │ 1             │
│ 2  │ Jane │ 1             │
│ 3  │ Bob  │ 2             │
└────┴──────┴───────────────┘

departments
┌────┬─────────────┬──────────┐
│ id │ name        │ location │
├────┼─────────────┼──────────┤
│ 1  │ Engineering │ Building A│
│ 2  │ Marketing   │ Building B│
└────┴─────────────┴──────────┘
```

**SQL 예시**:

```sql
-- 3NF 준수
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    location VARCHAR(100)
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    department_id INT REFERENCES departments(id)
);
```

---

### BCNF (Boyce-Codd Normal Form)

**규칙**: 3NF를 만족하고, **모든 결정자가 후보 키**여야 합니다.

대부분의 경우 3NF = BCNF이지만, 드물게 3NF이지만 BCNF가 아닌 경우가 있습니다.

#### 3NF (BCNF 위반)

```
course_schedule
┌──────────┬───────────┬──────────┐
│ student  │ course    │ professor│
├──────────┼───────────┼──────────┤
│ John     │ Database  │ Dr. Kim  │
│ John     │ Algorithm │ Dr. Lee  │
│ Jane     │ Database  │ Dr. Kim  │
└──────────┴───────────┴──────────┘

제약: 각 교수는 한 과목만 담당
      (professor → course)

기본 키: (student, course)
```

**문제**:
```
professor → course  (professor가 결정자)
하지만 professor는 후보 키가 아님! ❌
```

#### BCNF

```
students_courses
┌──────────┬─────────────┐
│ student  │ professor   │
├──────────┼─────────────┤
│ John     │ Dr. Kim     │
│ John     │ Dr. Lee     │
│ Jane     │ Dr. Kim     │
└──────────┴─────────────┘

professor_courses
┌───────────┬───────────┐
│ professor │ course    │
├───────────┼───────────┤
│ Dr. Kim   │ Database  │
│ Dr. Lee   │ Algorithm │
└───────────┴───────────┘
```

**실무에서는**:
```
대부분의 경우 3NF까지만 적용
BCNF는 특수한 경우에만 필요
```

---

## 정규화 과정 예시

### 초기 테이블 (비정규형)

```
orders
┌────┬────────────┬──────┬────────────────┬─────────────┬──────┬────────┐
│ id │ date       │ cust │ cust_addr      │ products    │ qty  │ price  │
├────┼────────────┼──────┼────────────────┼─────────────┼──────┼────────┤
│ 1  │ 2024-01-01 │ John │ Seoul, Korea   │ Laptop, Mouse│ 1, 2 │ 1000, 20│
│ 2  │ 2024-01-02 │ Jane │ Busan, Korea   │ Phone       │ 1    │ 800    │
│ 3  │ 2024-01-03 │ John │ Seoul, Korea   │ Keyboard    │ 3    │ 50     │
└────┴────────────┴──────┴────────────────┴─────────────┴──────┴────────┘
```

### 1NF 적용

```
orders (원자값으로 분리)
┌────┬────────────┬──────┬──────────────┬─────────┬─────┬───────┐
│ id │ date       │ cust │ cust_addr    │ product │ qty │ price │
├────┼────────────┼──────┼──────────────┼─────────┼─────┼───────┤
│ 1  │ 2024-01-01 │ John │ Seoul, Korea │ Laptop  │ 1   │ 1000  │
│ 1  │ 2024-01-01 │ John │ Seoul, Korea │ Mouse   │ 2   │ 20    │
│ 2  │ 2024-01-02 │ Jane │ Busan, Korea │ Phone   │ 1   │ 800   │
│ 3  │ 2024-01-03 │ John │ Seoul, Korea │ Keyboard│ 3   │ 50    │
└────┴────────────┴──────┴──────────────┴─────────┴─────┴───────┘
```

### 2NF 적용

```
orders
┌────┬────────────┬─────────────┐
│ id │ date       │ customer_id │
├────┼────────────┼─────────────┤
│ 1  │ 2024-01-01 │ 1           │
│ 2  │ 2024-01-02 │ 2           │
│ 3  │ 2024-01-03 │ 1           │
└────┴────────────┴─────────────┘

customers
┌────┬──────┬──────────────┐
│ id │ name │ address      │
├────┼──────┼──────────────┤
│ 1  │ John │ Seoul, Korea │
│ 2  │ Jane │ Busan, Korea │
└────┴──────┴──────────────┘

order_items
┌──────────┬────────────┬──────┬───────┐
│ order_id │ product_id │ qty  │ price │
├──────────┼────────────┼──────┼───────┤
│ 1        │ 1          │ 1    │ 1000  │
│ 1        │ 2          │ 2    │ 20    │
│ 2        │ 3          │ 1    │ 800   │
│ 3        │ 4          │ 3    │ 50    │
└──────────┴────────────┴──────┴───────┘

products
┌────┬──────────┐
│ id │ name     │
├────┼──────────┤
│ 1  │ Laptop   │
│ 2  │ Mouse    │
│ 3  │ Phone    │
│ 4  │ Keyboard │
└────┴──────────┘
```

### 3NF 적용 (이미 완료)

위 테이블은 이미 3NF를 만족합니다.

---

## 정규화의 장단점

### 장점

```
✅ 데이터 중복 최소화
   - 저장 공간 절약
   - 데이터 일관성 향상

✅ 이상 현상 방지
   - 삽입 이상 방지
   - 수정 이상 방지
   - 삭제 이상 방지

✅ 데이터 무결성
   - 외래 키로 관계 보장
   - 제약 조건 명확

✅ 유지보수 용이
   - 데이터 수정이 한 곳에서만
   - 구조 변경 영향 최소화
```

### 단점

```
❌ 조회 성능 저하
   - 여러 테이블 JOIN 필요
   - 쿼리 복잡도 증가

❌ 쓰기 성능 저하
   - 여러 테이블에 데이터 삽입
   - 트랜잭션 복잡도 증가

❌ 개발 복잡도
   - 쿼리 작성 어려움
   - 애플리케이션 로직 복잡
```

---

## 비정규화 (Denormalization)

성능 향상을 위해 **의도적으로** 정규화를 역행하는 것입니다.

### 언제 비정규화?

```
읽기 성능이 중요한 경우
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 자주 조회되는 데이터
- 복잡한 JOIN이 필요한 쿼리
- 실시간 응답이 중요한 API

예: 전자상거래 상품 목록
    - 상품 정보 + 브랜드 + 카테고리
    - JOIN 없이 한 번에 조회
```

### 비정규화 기법

#### 1. 컬럼 추가 (중복 저장)

```sql
-- 정규화
orders
┌────┬─────────────┬────────┐
│ id │ customer_id │ amount │
└────┴─────────────┴────────┘

customers
┌────┬──────┬─────────┐
│ id │ name │ country │
└────┴──────┴─────────┘

-- 비정규화 (customer_name 중복 저장)
orders
┌────┬─────────────┬───────────────┬────────┐
│ id │ customer_id │ customer_name │ amount │  ← 중복!
└────┴─────────────┴───────────────┴────────┘

-- 장점: JOIN 없이 주문 목록 조회
SELECT id, customer_name, amount FROM orders;

-- 단점: 고객 이름 변경 시 orders 테이블도 업데이트 필요
```

#### 2. 집계 컬럼 추가

```sql
-- 정규화
users
┌────┬──────┐
│ id │ name │
└────┴──────┘

orders
┌────┬─────────┬────────┐
│ id │ user_id │ amount │
└────┴─────────┴────────┘

-- 비정규화 (주문 수, 총 금액 저장)
users
┌────┬──────┬─────────────┬──────────────┐
│ id │ name │ order_count │ total_amount │  ← 집계 값 저장
└────┴──────┴─────────────┴──────────────┘

-- 장점: 빠른 조회
SELECT name, order_count, total_amount FROM users;

-- 단점: 주문 추가/삭제 시 users 테이블 업데이트 필요
```

**업데이트 트리거 예시**:

```sql
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 주문 추가 시
  IF (TG_OP = 'INSERT') THEN
    UPDATE users
    SET order_count = order_count + 1,
        total_amount = total_amount + NEW.amount
    WHERE id = NEW.user_id;
    RETURN NEW;

  -- 주문 삭제 시
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE users
    SET order_count = order_count - 1,
        total_amount = total_amount - OLD.amount
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_stats_trigger
AFTER INSERT OR DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();
```

#### 3. 테이블 병합

```sql
-- 정규화 (1:1 관계)
users
┌────┬──────┬─────────┐
│ id │ name │ email   │
└────┴──────┴─────────┘

user_profiles
┌─────────┬─────────┬─────┐
│ user_id │ address │ bio │
└─────────┴─────────┴─────┘

-- 비정규화 (병합)
users
┌────┬──────┬─────────┬─────────┬─────┐
│ id │ name │ email   │ address │ bio │
└────┴──────┴─────────┴─────────┴─────┘

-- 장점: JOIN 불필요
-- 단점: NULL 값 증가 (모든 사용자가 bio 작성하지 않음)
```

---

## 실무 가이드

### 정규화 수준 선택

```
일반적인 웹 애플리케이션
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3NF까지 정규화 (권장)
- 데이터 무결성 보장
- 대부분의 경우 충분한 성능

필요시 선택적 비정규화
- 자주 조회되는 데이터만
- 캐싱으로 먼저 해결 시도
```

### 비정규화 결정 기준

```
비정규화를 고려할 때
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 성능 측정
   - EXPLAIN ANALYZE로 쿼리 분석
   - 실제 병목 확인

2. 캐싱 먼저 시도
   - Redis로 결과 캐싱
   - 비정규화보다 간단

3. 읽기:쓰기 비율
   - 읽기 >> 쓰기 → 비정규화 고려
   - 쓰기 빈번 → 정규화 유지

4. 일관성 허용 범위
   - 실시간 일관성 필요 → 정규화
   - 최종 일관성 가능 → 비정규화
```

### 성능 최적화 순서

```
1단계: 인덱스 추가
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE INDEX idx_orders_user_id ON orders(user_id);

→ 대부분의 성능 문제 해결!

2단계: 쿼리 최적화
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- N+1 문제 해결 (JOIN 사용)
- 불필요한 컬럼 제거 (SELECT * 지양)

3단계: 캐싱
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Redis로 자주 조회되는 데이터 캐싱

4단계: 비정규화 (마지막 수단)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 정말 필요한 경우에만
- 트레이드오프 명확히 이해
```

---

## 실전 예시

### 전자상거래 데이터 모델

#### 초기 설계 (3NF)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10, 2),
    category_id INT REFERENCES categories(id)
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20)
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    product_id INT REFERENCES products(id),
    quantity INT,
    price DECIMAL(10, 2)  -- 주문 당시 가격 저장 (비정규화!)
);
```

**비정규화 포인트**:
```sql
-- order_items.price는 products.price와 중복
-- 하지만 주문 후 상품 가격이 변경될 수 있으므로
-- 주문 당시 가격을 저장해야 함!
```

#### 성능 최적화 후 (선택적 비정규화)

```sql
-- 상품 목록 조회 최적화
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10, 2),
    category_id INT REFERENCES categories(id),
    category_name VARCHAR(100),  -- 비정규화 (JOIN 제거)
    review_count INT DEFAULT 0,   -- 비정규화 (집계 값 저장)
    avg_rating DECIMAL(3, 2) DEFAULT 0  -- 비정규화
);

-- 사용자 통계 추가
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    order_count INT DEFAULT 0,    -- 비정규화
    total_spent DECIMAL(10, 2) DEFAULT 0  -- 비정규화
);
```

**트레이드오프**:
```
장점:
✅ 상품 목록 조회 시 JOIN 불필요
✅ 사용자 통계 빠른 조회

단점:
❌ 카테고리명 변경 시 products 테이블도 업데이트 필요
❌ 리뷰 추가/삭제 시 products 테이블 업데이트 필요
❌ 데이터 일관성 유지 복잡
```

---

## 정규화 체크리스트

### 설계 시 확인 사항

```
□ 각 컬럼이 원자값인가? (1NF)
□ 부분 함수 종속이 없는가? (2NF)
□ 이행적 함수 종속이 없는가? (3NF)
□ 외래 키가 올바르게 설정되었는가?
□ 인덱스가 필요한 컬럼을 식별했는가?
□ 비정규화가 필요한 부분을 파악했는가?
```

### 정규화 vs 비정규화 결정

```
정규화 선택
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 데이터 무결성이 최우선
✓ 쓰기가 빈번함
✓ 복잡한 비즈니스 로직
✓ 일관성이 중요
→ 금융, 결제, 재고 관리

비정규화 선택
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 읽기 성능이 최우선
✓ 읽기가 쓰기보다 훨씬 많음
✓ 최종 일관성 허용 가능
✓ 복잡한 JOIN 회피
→ 분석, 보고서, 캐싱
```

---

## 추가 학습 자료

- [Database Normalization | Wikipedia](https://en.wikipedia.org/wiki/Database_normalization)
- [Normal Forms | Stanford CS](https://web.stanford.edu/class/cs145/lecture-notes.html)
- [SQL Anti-patterns | Bill Karwin](https://pragprog.com/titles/bksqla/sql-antipatterns/)

---

## 다음 학습

- [인덱싱](indexing.md)
- [쿼리 최적화](query-optimization.md)
- [데이터 모델링](data-modeling.md)

---

*Last updated: 2026-01-05*
