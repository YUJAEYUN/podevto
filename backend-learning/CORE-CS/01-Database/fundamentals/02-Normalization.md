# Normalization - 정규화와 비정규화

> "왜 정규화를 하고, 언제 비정규화를 하는가?"

## 🎯 학습 목표

- 정규화가 **어떤 문제를 해결**하는지 이해
- 각 정규형(1NF~BCNF)의 **실제 적용 사례** 파악
- **언제 비정규화를 해야 하는지** 판단할 수 있는 능력

## 🤔 왜 정규화가 필요한가?

### 비정규화된 테이블의 문제점

```sql
-- 나쁜 예: 비정규화된 테이블
CREATE TABLE orders (
    order_id INT,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_address VARCHAR(200),
    product_names VARCHAR(500),  -- "사과,바나나,오렌지"
    product_prices VARCHAR(100), -- "1000,2000,1500"
    total_price INT
);
```

**문제점**:

1. **중복 (Redundancy)**
```sql
-- 같은 고객이 여러 주문을 하면 정보가 중복됨
INSERT INTO orders VALUES (1, 'Alice', 'alice@example.com', 'Seoul', ...);
INSERT INTO orders VALUES (2, 'Alice', 'alice@example.com', 'Seoul', ...);
-- Alice의 정보가 계속 중복!
```

2. **갱신 이상 (Update Anomaly)**
```sql
-- Alice가 이메일을 변경하면?
UPDATE orders SET customer_email = 'alice_new@example.com'
WHERE customer_name = 'Alice';

-- 만약 일부만 업데이트되면 데이터 불일치!
```

3. **삽입 이상 (Insert Anomaly)**
```sql
-- 주문이 없는 고객 정보를 저장할 수 없음
-- order_id가 PRIMARY KEY이므로
```

4. **삭제 이상 (Delete Anomaly)**
```sql
-- 주문을 삭제하면 고객 정보도 함께 삭제됨
DELETE FROM orders WHERE order_id = 1;
-- Alice의 유일한 주문이었다면 Alice 정보도 사라짐!
```

## 📚 정규형 (Normal Forms)

### 제1정규형 (1NF)

**정의**: 모든 속성의 값이 **원자값(Atomic Value)**이어야 함

#### ❌ 1NF 위반
```sql
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    product_names VARCHAR(500)  -- "사과,바나나,오렌지" ❌
);
```

**문제**:
- 특정 상품을 찾기 어려움 (LIKE '%사과%' 사용해야 함)
- 상품 개수를 카운트할 수 없음

#### ✅ 1NF 준수
```sql
CREATE TABLE orders (
    order_id INT,
    customer_name VARCHAR(100),
    product_name VARCHAR(100),  -- 각 상품마다 별도 행
    PRIMARY KEY (order_id, product_name)
);

-- 데이터
(1, 'Alice', '사과')
(1, 'Alice', '바나나')
(1, 'Alice', '오렌지')
```

**장점**:
- 상품 검색이 쉬움
- 상품별 집계 가능

---

### 제2정규형 (2NF)

**정의**: 1NF + **부분 함수 종속 제거**

**부분 함수 종속**: 기본키의 일부만으로 다른 속성을 결정할 수 있는 경우

#### ❌ 2NF 위반
```sql
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    product_name VARCHAR(100),    -- product_id만으로 결정됨 ❌
    product_price INT,            -- product_id만으로 결정됨 ❌
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);
```

**문제**:
- `product_name`, `product_price`는 `product_id`만으로 결정됨
- 같은 상품이 여러 주문에 있으면 정보 중복

**함수 종속 다이어그램**:
```
(order_id, product_id) → quantity        ✅ 완전 함수 종속
product_id → product_name                ❌ 부분 함수 종속
product_id → product_price               ❌ 부분 함수 종속
```

#### ✅ 2NF 준수
```sql
-- 주문 항목 테이블
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 상품 테이블 (분리)
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    product_price INT
);
```

**장점**:
- 상품 정보가 한 곳에만 존재
- 상품 가격 변경이 쉬움

---

### 제3정규형 (3NF)

**정의**: 2NF + **이행적 함수 종속 제거**

**이행적 함수 종속**: A → B, B → C이면 A → C (간접 종속)

#### ❌ 3NF 위반
```sql
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(100),
    dept_id INT,
    dept_name VARCHAR(100),    -- dept_id → dept_name ❌
    dept_location VARCHAR(100) -- dept_id → dept_location ❌
);
```

**함수 종속 다이어그램**:
```
emp_id → dept_id           ✅ 직접 종속
dept_id → dept_name        ✅ 직접 종속
emp_id → dept_name         ❌ 이행적 종속 (emp_id → dept_id → dept_name)
```

**문제**:
- 부서명이 변경되면 모든 직원 레코드를 업데이트해야 함
- 직원이 없는 부서 정보를 저장할 수 없음

#### ✅ 3NF 준수
```sql
-- 직원 테이블
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(100),
    dept_id INT,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- 부서 테이블 (분리)
CREATE TABLE departments (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(100),
    dept_location VARCHAR(100)
);
```

**장점**:
- 부서 정보가 한 곳에만 존재
- 직원이 없어도 부서 정보 저장 가능

---

### BCNF (Boyce-Codd Normal Form)

**정의**: 3NF + **모든 결정자가 후보키**

복잡한 케이스에서 3NF보다 엄격한 조건

#### ❌ BCNF 위반
```sql
-- 강의 시간표
CREATE TABLE schedules (
    student_id INT,
    course_name VARCHAR(100),
    professor VARCHAR(100),
    PRIMARY KEY (student_id, course_name)
);

-- 제약: 각 교수는 한 과목만 가르침
-- professor → course_name (하지만 professor는 후보키가 아님)
```

**문제**:
- 교수가 가르치는 과목이 중복 저장됨
- 교수의 담당 과목을 변경하기 어려움

#### ✅ BCNF 준수
```sql
CREATE TABLE enrollments (
    student_id INT,
    professor VARCHAR(100),
    PRIMARY KEY (student_id, professor)
);

CREATE TABLE courses (
    professor VARCHAR(100) PRIMARY KEY,
    course_name VARCHAR(100)
);
```

---

## 💡 실전 정규화 예제

### Before: 비정규화된 주문 시스템

```sql
CREATE TABLE orders_bad (
    order_id INT PRIMARY KEY,
    order_date DATE,
    -- 고객 정보
    customer_id INT,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20),
    customer_address VARCHAR(200),
    -- 상품 정보 (쉼표로 구분)
    product_ids VARCHAR(100),    -- "1,2,3"
    product_names VARCHAR(500),  -- "사과,바나나,오렌지"
    product_prices VARCHAR(100), -- "1000,2000,1500"
    quantities VARCHAR(100),     -- "2,1,3"
    -- 총계
    total_amount INT
);
```

### After: 정규화된 주문 시스템

```sql
-- 고객 테이블 (3NF)
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100) UNIQUE,
    customer_phone VARCHAR(20),
    customer_address VARCHAR(200)
);

-- 상품 테이블 (3NF)
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    product_price INT,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- 카테고리 테이블 (3NF)
CREATE TABLE categories (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(100)
);

-- 주문 테이블 (3NF)
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount INT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- 주문 항목 테이블 (2NF)
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT,
    price_at_order INT,  -- 주문 당시 가격 (가격 변동 대비)
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

**장점**:
- 중복 제거
- 데이터 일관성 보장
- 유지보수 용이

---

## 🔄 비정규화 (Denormalization)

### 왜 비정규화를 하는가?

정규화의 단점:
```sql
-- 고객의 주문 목록 조회 (5개 테이블 JOIN)
SELECT
    c.customer_name,
    o.order_id,
    o.order_date,
    p.product_name,
    oi.quantity,
    oi.price_at_order
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE c.customer_id = 1;

-- JOIN이 많아서 느림! 😢
```

### 비정규화 전략

#### 1. 계산된 컬럼 추가

```sql
-- Before: 매번 계산
SELECT order_id, SUM(quantity * price_at_order) as total
FROM order_items
GROUP BY order_id;

-- After: 미리 계산된 컬럼 추가
ALTER TABLE orders ADD COLUMN total_amount INT;

-- 트리거로 자동 갱신
CREATE TRIGGER update_order_total
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW
BEGIN
    UPDATE orders
    SET total_amount = (
        SELECT SUM(quantity * price_at_order)
        FROM order_items
        WHERE order_id = NEW.order_id
    )
    WHERE order_id = NEW.order_id;
END;
```

#### 2. 자주 조회되는 정보 중복 저장

```sql
-- 주문 테이블에 고객 이름 추가
ALTER TABLE orders ADD COLUMN customer_name VARCHAR(100);

-- 이제 JOIN 없이 조회 가능
SELECT order_id, customer_name, order_date
FROM orders
WHERE order_id = 1;

-- 단점: customer 테이블과 동기화 필요
```

#### 3. 요약 테이블 (Summary Table)

```sql
-- 일별 매출 요약 테이블
CREATE TABLE daily_sales (
    sales_date DATE PRIMARY KEY,
    total_orders INT,
    total_amount INT,
    total_customers INT
);

-- 매일 밤 배치로 갱신
INSERT INTO daily_sales
SELECT
    DATE(order_date) as sales_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_amount,
    COUNT(DISTINCT customer_id) as total_customers
FROM orders
WHERE DATE(order_date) = CURRENT_DATE - INTERVAL 1 DAY
GROUP BY DATE(order_date);
```

#### 4. 읽기 전용 복제본

```sql
-- Master DB: 정규화된 테이블 (쓰기 최적화)
-- Replica DB: 비정규화된 테이블 (읽기 최적화)

-- Replica에 비정규화된 뷰 생성
CREATE MATERIALIZED VIEW order_summary AS
SELECT
    o.order_id,
    o.order_date,
    c.customer_name,
    c.customer_email,
    p.product_name,
    oi.quantity,
    oi.price_at_order
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id;

-- 주기적으로 갱신
REFRESH MATERIALIZED VIEW order_summary;
```

---

## 🎯 정규화 vs 비정규화 의사결정

### 정규화를 선택할 때

```
✅ 쓰기가 많은 시스템 (OLTP)
✅ 데이터 일관성이 중요
✅ 저장 공간이 제한적
✅ 트랜잭션 처리가 중요
✅ 예: 은행 시스템, 주문 시스템
```

### 비정규화를 선택할 때

```
✅ 읽기가 많은 시스템 (OLAP)
✅ 조회 성능이 중요
✅ 데이터 변경이 적음
✅ 복잡한 JOIN이 성능 병목
✅ 예: 분석 시스템, 리포팅, 캐시
```

### 하이브리드 접근

```
Master DB (정규화)
    ↓ 복제
Replica DB (비정규화)
    ↓ 읽기 전용
Application
```

---

## 💻 실습 예제

### 실습 1: 정규화 연습

```sql
-- 비정규화된 학생 성적 테이블
CREATE TABLE student_grades_bad (
    student_id INT,
    student_name VARCHAR(100),
    student_email VARCHAR(100),
    course_id INT,
    course_name VARCHAR(100),
    professor_name VARCHAR(100),
    grade CHAR(1),
    semester VARCHAR(20)
);

-- TODO: 이 테이블을 3NF로 정규화하세요
-- 힌트: students, courses, professors, enrollments 테이블로 분리
```

**정답**:
```sql
CREATE TABLE students (
    student_id INT PRIMARY KEY,
    student_name VARCHAR(100),
    student_email VARCHAR(100) UNIQUE
);

CREATE TABLE professors (
    professor_id INT PRIMARY KEY,
    professor_name VARCHAR(100)
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY,
    course_name VARCHAR(100),
    professor_id INT,
    FOREIGN KEY (professor_id) REFERENCES professors(professor_id)
);

CREATE TABLE enrollments (
    student_id INT,
    course_id INT,
    semester VARCHAR(20),
    grade CHAR(1),
    PRIMARY KEY (student_id, course_id, semester),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
```

---

## 🎯 체크리스트

- [ ] 1NF~3NF, BCNF의 차이를 설명할 수 있다
- [ ] 비정규화의 문제점을 나열할 수 있다
- [ ] 정규화의 장단점을 이해한다
- [ ] 비정규화가 필요한 상황을 판단할 수 있다
- [ ] 실제 테이블을 정규화할 수 있다

## 🔗 다음 학습

- [03-Transaction-Basics.md](./03-Transaction-Basics.md) - 트랜잭션 기초
- [../deep-dive/05-Query-Optimizer.md](../deep-dive/05-Query-Optimizer.md) - JOIN 최적화

---

**"정규화는 데이터 무결성을, 비정규화는 성능을. 둘의 균형이 중요하다"**
