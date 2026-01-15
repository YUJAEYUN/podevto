# Index Basics - 인덱스 기초

> "인덱스는 책의 목차와 같다"

## 🎯 핵심 개념

### 인덱스가 없을 때
```sql
-- 1000만 건의 users 테이블에서 검색
SELECT * FROM users WHERE email = 'alice@example.com';

-- Full Table Scan: O(n) = 10,000,000번 비교 😢
```

### 인덱스가 있을 때
```sql
CREATE INDEX idx_email ON users(email);

SELECT * FROM users WHERE email = 'alice@example.com';

-- Index Scan: O(log n) = 약 23번 비교 ✅
```

## 📚 인덱스 생성

```sql
-- 단일 컬럼 인덱스
CREATE INDEX idx_email ON users(email);

-- 복합 인덱스
CREATE INDEX idx_name_age ON users(name, age);

-- 유니크 인덱스
CREATE UNIQUE INDEX idx_email_unique ON users(email);

-- 삭제
DROP INDEX idx_email;
```

## 🔍 EXPLAIN으로 확인

```sql
-- 실행 계획 확인
EXPLAIN SELECT * FROM users WHERE email = 'alice@example.com';

-- PostgreSQL
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'alice@example.com';
```

**결과 읽기**:
- `Seq Scan`: Full Table Scan (느림)
- `Index Scan`: 인덱스 사용 (빠름)
- `Index Only Scan`: 인덱스만으로 해결 (가장 빠름)

## ⚡ 인덱스 사용 조건

### ✅ 인덱스가 사용되는 경우
```sql
-- = 연산
SELECT * FROM users WHERE email = 'alice@example.com';

-- 범위 검색
SELECT * FROM users WHERE age BETWEEN 20 AND 30;

-- ORDER BY
SELECT * FROM users ORDER BY created_at;

-- 복합 인덱스 (첫 번째 컬럼 사용)
CREATE INDEX idx_name_age ON users(name, age);
SELECT * FROM users WHERE name = 'Alice';  ✅
```

### ❌ 인덱스가 사용되지 않는 경우
```sql
-- 함수 사용
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';  ❌

-- LIKE 시작 와일드카드
SELECT * FROM users WHERE email LIKE '%@example.com';  ❌

-- 복합 인덱스 (첫 번째 컬럼 없음)
CREATE INDEX idx_name_age ON users(name, age);
SELECT * FROM users WHERE age = 25;  ❌
```

## 💡 실전 팁

### 1. 자주 검색하는 컬럼에 생성
```sql
-- 로그인: email로 검색
CREATE INDEX idx_email ON users(email);

-- 주문 조회: user_id로 검색
CREATE INDEX idx_user_id ON orders(user_id);
```

### 2. 복합 인덱스 순서
```sql
-- WHERE name = ? AND age = ?
CREATE INDEX idx_name_age ON users(name, age);  ✅

-- WHERE age = ? AND name = ?
-- 위 인덱스 사용 가능 (순서 상관없음)
```

### 3. 커버링 인덱스
```sql
CREATE INDEX idx_name_age_email ON users(name, age, email);

-- 테이블 접근 없이 인덱스만으로 해결
SELECT name, age, email 
FROM users 
WHERE name = 'Alice';  -- Index Only Scan ✅
```

## ⚠️ 인덱스의 단점

1. **저장 공간**: 추가 디스크 사용
2. **쓰기 성능 저하**: INSERT, UPDATE, DELETE 시 인덱스도 갱신
3. **메모리 사용**: 인덱스를 메모리에 로드

**결론**: 모든 컬럼에 인덱스를 만들지 말 것!

## 🔗 다음 학습

- [../deep-dive/01-BTree-BPlusTree.md](../deep-dive/01-BTree-BPlusTree.md)

---

**"적절한 인덱스는 성능을 100배 향상시킨다"**
