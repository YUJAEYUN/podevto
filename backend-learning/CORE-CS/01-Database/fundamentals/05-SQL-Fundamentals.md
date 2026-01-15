# SQL Fundamentals - SQL 제대로 이해하기

> "SQL은 선언적 언어다 - '무엇'을 원하는지만 말하면 된다"

## 🎯 학습 목표

- SQL의 **실행 순서**를 이해
- **JOIN의 종류**와 사용 시기 파악
- **서브쿼리 vs JOIN** 성능 차이 이해
- **실무에서 자주 사용하는 패턴** 숙지

## 📚 SQL 기본 구조

### SELECT 문의 실행 순서

```sql
SELECT column_list          -- 5. 선택할 컬럼
FROM table_name             -- 1. 테이블 먼저 읽음
WHERE condition             -- 2. 행 필터링
GROUP BY column_list        -- 3. 그룹화
HAVING group_condition      -- 4. 그룹 필터링
ORDER BY column_list        -- 6. 정렬
LIMIT n;                    -- 7. 개수 제한
```

**중요**: 작성 순서 ≠ 실행 순서!

### 실행 순서 예제

```sql
SELECT department, AVG(salary) as avg_salary  -- 5
FROM employees                                 -- 1
WHERE hire_date > '2020-01-01'                -- 2
GROUP BY department                            -- 3
HAVING AVG(salary) > 50000                    -- 4
ORDER BY avg_salary DESC                       -- 6
LIMIT 10;                                      -- 7
```

**실행 과정**:
1. `employees` 테이블 읽기
2. `hire_date > '2020-01-01'` 필터링
3. `department`로 그룹화
4. `AVG(salary) > 50000` 그룹 필터링
5. `department`, `avg_salary` 선택
6. `avg_salary` 기준 정렬
7. 상위 10개만 반환

## 🔗 JOIN 완벽 이해

### 1. INNER JOIN (교집합)

```sql
SELECT
    users.name,
    orders.order_id,
    orders.order_date
FROM users
INNER JOIN orders ON users.user_id = orders.user_id;
```

**결과**: 주문이 있는 사용자만 반환

```
users: {Alice, Bob, Charlie}
orders: {Alice의 주문, Bob의 주문}

결과: {Alice, Bob}  ✅
Charlie는 제외됨 (주문 없음)
```

### 2. LEFT JOIN (왼쪽 기준)

```sql
SELECT
    users.name,
    orders.order_id,
    orders.order_date
FROM users
LEFT JOIN orders ON users.user_id = orders.user_id;
```

**결과**: 모든 사용자 + 주문 정보 (없으면 NULL)

```
users: {Alice, Bob, Charlie}
orders: {Alice의 주문, Bob의 주문}

결과:
Alice   | order_123 | 2024-01-01
Bob     | order_456 | 2024-01-02
Charlie | NULL      | NULL        ✅
```

### 3. RIGHT JOIN (오른쪽 기준)

```sql
SELECT
    users.name,
    orders.order_id
FROM users
RIGHT JOIN orders ON users.user_id = orders.user_id;
```

**결과**: 모든 주문 + 사용자 정보 (없으면 NULL)

### 4. FULL OUTER JOIN (합집합)

```sql
SELECT
    users.name,
    orders.order_id
FROM users
FULL OUTER JOIN orders ON users.user_id = orders.user_id;
```

**결과**: 모든 사용자 + 모든 주문 (없으면 NULL)

### 5. CROSS JOIN (카티션 곱)

```sql
SELECT
    colors.color,
    sizes.size
FROM colors
CROSS JOIN sizes;
```

**결과**: 모든 조합

```
colors: {Red, Blue}
sizes: {S, M, L}

결과:
Red  | S
Red  | M
Red  | L
Blue | S
Blue | M
Blue | L
```

## 💡 실무 JOIN 패턴

### 패턴 1: N+1 문제 해결

```sql
-- ❌ 나쁜 예: N+1 쿼리
SELECT * FROM users;  -- 1번
-- 각 user마다
SELECT * FROM orders WHERE user_id = ?;  -- N번

-- ✅ 좋은 예: JOIN 사용
SELECT
    u.user_id,
    u.name,
    o.order_id,
    o.order_date
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id;
```

### 패턴 2: 주문이 없는 사용자 찾기

```sql
-- 방법 1: LEFT JOIN + NULL 체크
SELECT u.name
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.order_id IS NULL;

-- 방법 2: NOT EXISTS (더 명확)
SELECT u.name
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.user_id
);
```

### 패턴 3: 최신 주문만 가져오기

```sql
-- 각 사용자의 최신 주문 1개씩
SELECT
    u.user_id,
    u.name,
    o.order_id,
    o.order_date
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
INNER JOIN (
    SELECT user_id, MAX(order_date) as max_date
    FROM orders
    GROUP BY user_id
) latest ON o.user_id = latest.user_id
         AND o.order_date = latest.max_date;
```

## 🔍 서브쿼리 (Subquery)

### 1. 스칼라 서브쿼리 (단일 값)

```sql
SELECT
    name,
    salary,
    (SELECT AVG(salary) FROM employees) as avg_salary
FROM employees;
```

### 2. 인라인 뷰 (FROM 절)

```sql
SELECT dept_name, avg_salary
FROM (
    SELECT
        department as dept_name,
        AVG(salary) as avg_salary
    FROM employees
    GROUP BY department
) dept_stats
WHERE avg_salary > 50000;
```

### 3. 중첩 서브쿼리 (WHERE 절)

```sql
-- IN
SELECT name
FROM employees
WHERE department IN (
    SELECT department
    FROM departments
    WHERE location = 'Seoul'
);

-- EXISTS (성능상 유리할 수 있음)
SELECT name
FROM employees e
WHERE EXISTS (
    SELECT 1
    FROM departments d
    WHERE d.department = e.department
      AND d.location = 'Seoul'
);
```

## ⚡ 서브쿼리 vs JOIN 성능

### 일반적인 경우: JOIN이 빠름

```sql
-- ✅ JOIN (보통 더 빠름)
SELECT e.name
FROM employees e
INNER JOIN departments d ON e.dept_id = d.dept_id
WHERE d.location = 'Seoul';

-- ❌ 서브쿼리 (느릴 수 있음)
SELECT name
FROM employees
WHERE dept_id IN (
    SELECT dept_id
    FROM departments
    WHERE location = 'Seoul'
);
```

**이유**: JOIN은 해시 조인, 머지 조인 등 최적화 가능

### 예외: EXISTS가 유리한 경우

```sql
-- ✅ EXISTS (빠름 - 첫 매칭만 찾으면 됨)
SELECT name
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.user_id
);

-- ❌ JOIN (느릴 수 있음 - 모든 주문 조회)
SELECT DISTINCT u.name
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id;
```

## 📊 집계 함수 (Aggregate Functions)

### 기본 집계

```sql
SELECT
    COUNT(*) as total_count,           -- 전체 행 수
    COUNT(email) as email_count,       -- NULL 제외
    COUNT(DISTINCT department) as dept_count,  -- 중복 제거
    SUM(salary) as total_salary,
    AVG(salary) as avg_salary,
    MAX(salary) as max_salary,
    MIN(salary) as min_salary
FROM employees;
```

### GROUP BY와 함께

```sql
SELECT
    department,
    COUNT(*) as emp_count,
    AVG(salary) as avg_salary
FROM employees
GROUP BY department;
```

### HAVING (그룹 필터링)

```sql
-- ✅ 올바른 사용
SELECT
    department,
    COUNT(*) as emp_count
FROM employees
GROUP BY department
HAVING COUNT(*) >= 10;  -- 그룹 조건

-- ❌ 잘못된 사용
SELECT
    department,
    COUNT(*) as emp_count
FROM employees
WHERE COUNT(*) >= 10  -- 에러! 집계 함수는 WHERE 불가
GROUP BY department;
```

## 💻 윈도우 함수 (Window Functions)

### ROW_NUMBER (순위)

```sql
SELECT
    name,
    salary,
    department,
    ROW_NUMBER() OVER (
        PARTITION BY department
        ORDER BY salary DESC
    ) as rank_in_dept
FROM employees;
```

**결과**:
```
Alice  | 100000 | Sales | 1
Bob    | 90000  | Sales | 2
Charlie| 80000  | IT    | 1
David  | 75000  | IT    | 2
```

### LAG/LEAD (이전/다음 행)

```sql
SELECT
    order_date,
    amount,
    LAG(amount) OVER (ORDER BY order_date) as prev_amount,
    LEAD(amount) OVER (ORDER BY order_date) as next_amount
FROM orders;
```

### RANK vs DENSE_RANK

```sql
SELECT
    name,
    score,
    RANK() OVER (ORDER BY score DESC) as rank,
    DENSE_RANK() OVER (ORDER BY score DESC) as dense_rank
FROM students;
```

**결과**:
```
Alice   | 100 | 1 | 1
Bob     | 100 | 1 | 1  -- 동점
Charlie | 90  | 3 | 2  -- RANK는 2를 건너뜀
David   | 90  | 3 | 2
Eve     | 80  | 5 | 3
```

## 🎯 실전 SQL 패턴

### 1. 페이징 (Pagination)

```sql
-- OFFSET/LIMIT
SELECT *
FROM products
ORDER BY product_id
LIMIT 20 OFFSET 40;  -- 3페이지 (20개씩)

-- 더 빠른 방법: WHERE + 인덱스
SELECT *
FROM products
WHERE product_id > 40
ORDER BY product_id
LIMIT 20;
```

### 2. 중복 제거

```sql
-- DISTINCT
SELECT DISTINCT department
FROM employees;

-- GROUP BY (더 유연)
SELECT department, COUNT(*) as count
FROM employees
GROUP BY department;
```

### 3. CASE 문 (조건부 로직)

```sql
SELECT
    name,
    salary,
    CASE
        WHEN salary >= 100000 THEN 'High'
        WHEN salary >= 50000 THEN 'Medium'
        ELSE 'Low'
    END as salary_grade
FROM employees;
```

### 4. COALESCE (NULL 처리)

```sql
SELECT
    name,
    COALESCE(email, 'No Email') as email,
    COALESCE(phone, mobile, 'No Contact') as contact
FROM users;
```

### 5. 날짜 처리

```sql
-- PostgreSQL
SELECT
    order_date,
    DATE_TRUNC('month', order_date) as month,
    EXTRACT(YEAR FROM order_date) as year,
    NOW() - order_date as age
FROM orders;

-- MySQL
SELECT
    order_date,
    DATE_FORMAT(order_date, '%Y-%m') as month,
    YEAR(order_date) as year,
    DATEDIFF(NOW(), order_date) as days_ago
FROM orders;
```

## ⚠️ SQL 안티패턴

### 1. SELECT *

```sql
-- ❌ 나쁜 예
SELECT * FROM users;

-- ✅ 좋은 예
SELECT user_id, name, email FROM users;
```

**이유**:
- 불필요한 데이터 전송
- 인덱스 최적화 방해
- 테이블 구조 변경 시 영향

### 2. OR 대신 IN 사용

```sql
-- ❌ 나쁜 예
SELECT * FROM products
WHERE category = 'A' OR category = 'B' OR category = 'C';

-- ✅ 좋은 예
SELECT * FROM products
WHERE category IN ('A', 'B', 'C');
```

### 3. 함수 사용 시 인덱스 무효화

```sql
-- ❌ 인덱스 사용 불가
SELECT * FROM users
WHERE YEAR(created_at) = 2024;

-- ✅ 인덱스 사용 가능
SELECT * FROM users
WHERE created_at >= '2024-01-01'
  AND created_at < '2025-01-01';
```

## 🧪 실습 문제

### 문제 1: 부서별 최고 연봉자

```sql
-- employees(emp_id, name, department, salary)
-- 각 부서에서 가장 높은 연봉을 받는 직원 찾기

-- 정답:
SELECT e.department, e.name, e.salary
FROM employees e
INNER JOIN (
    SELECT department, MAX(salary) as max_salary
    FROM employees
    GROUP BY department
) dept_max ON e.department = dept_max.department
           AND e.salary = dept_max.max_salary;

-- 또는 윈도우 함수:
SELECT department, name, salary
FROM (
    SELECT
        department,
        name,
        salary,
        ROW_NUMBER() OVER (
            PARTITION BY department
            ORDER BY salary DESC
        ) as rn
    FROM employees
) ranked
WHERE rn = 1;
```

### 문제 2: 연속된 3일 이상 로그인한 사용자

```sql
-- login_logs(user_id, login_date)
-- 연속 3일 이상 로그인한 사용자 찾기

-- 정답 (윈도우 함수 활용):
WITH consecutive AS (
    SELECT
        user_id,
        login_date,
        login_date - ROW_NUMBER() OVER (
            PARTITION BY user_id
            ORDER BY login_date
        ) * INTERVAL '1 day' as grp
    FROM (
        SELECT DISTINCT user_id, login_date
        FROM login_logs
    ) distinct_logins
)
SELECT user_id, MIN(login_date) as start_date, COUNT(*) as consecutive_days
FROM consecutive
GROUP BY user_id, grp
HAVING COUNT(*) >= 3;
```

## 🎯 체크리스트

- [ ] SQL 실행 순서를 이해한다 (FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY)
- [ ] JOIN의 종류와 차이를 설명할 수 있다
- [ ] 서브쿼리 vs JOIN의 성능 차이를 이해한다
- [ ] 윈도우 함수를 사용할 수 있다
- [ ] SQL 안티패턴을 피할 수 있다
- [ ] 복잡한 쿼리를 단계별로 작성할 수 있다

## 🔗 다음 학습

- [../deep-dive/05-Query-Optimizer.md](../deep-dive/05-Query-Optimizer.md) - 쿼리 최적화
- [04-Index-Basics.md](./04-Index-Basics.md) - 인덱스와 함께 학습

---

**"SQL은 선언적 언어 - WHAT을 말하면 DB가 HOW를 결정한다"**
