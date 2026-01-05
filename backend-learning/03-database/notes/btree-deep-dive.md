# B-트리 (B-Tree) 완벽 이해

## B-트리가 뭐길래?

**B-트리(B-Tree)** 는 데이터베이스 인덱스의 핵심 자료구조입니다. 디스크 기반 저장소에서 **최소한의 디스크 접근**으로 데이터를 찾을 수 있도록 설계되었습니다.

```
왜 B-트리인가?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

문제: 디스크 접근은 매우 느림
     - 메모리 접근: 100ns (나노초)
     - SSD 접근: 100μs (마이크로초) → 1000배 느림
     - HDD 접근: 10ms (밀리초) → 100,000배 느림

해결: 디스크 접근 횟수를 최소화!
     → B-트리는 한 번에 많은 키를 읽어서 접근 횟수 줄임
```

---

## 이진 탐색 트리 (BST) vs B-트리

### 이진 탐색 트리의 문제

```
이진 탐색 트리 (Binary Search Tree)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

         50
        /  \
      30    70
     / \    / \
   20  40 60  80

특징:
- 각 노드는 최대 2개의 자식 (왼쪽, 오른쪽)
- 왼쪽 < 부모 < 오른쪽

검색: 80을 찾는다면?
50 (디스크 접근 1) → 70 (디스크 접근 2) → 80 (디스크 접근 3)

문제점:
❌ 키가 하나씩만 있어서 디스크 접근 많음
❌ 100만 개 데이터: 최악 log₂(1,000,000) = 약 20번 접근
❌ 불균형 위험 (한쪽으로 치우침)
```

### B-트리의 해결책

```
B-트리 (한 노드에 여러 키 저장)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

         [30, 50, 70]              ← 한 노드에 여러 키!
        /    |    |    \
    [10,20] [40] [60] [80,90]

특징:
✅ 한 노드에 여러 키 (보통 수백~수천 개)
✅ 균형 유지 (모든 리프 노드가 같은 깊이)
✅ 디스크 블록 크기에 최적화

검색: 60을 찾는다면?
[30,50,70] (디스크 접근 1) → [60] (디스크 접근 2) → 찾음!

장점:
✅ 100만 개 데이터: log₁₀₀(1,000,000) = 약 3번 접근!
   (한 노드에 100개 키가 있다고 가정)
```

---

## B-트리 구조 상세

### B-트리의 특성

```
B-트리의 차수(Order): m
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

예: m = 4 (4차 B-트리)

규칙:
1. 각 노드는 최대 m개의 자식 (4개)
2. 각 노드는 최대 m-1개의 키 (3개)
3. 루트를 제외한 모든 노드는 최소 ⌈m/2⌉개의 자식 (2개)
4. 모든 리프 노드는 같은 깊이 (균형 보장)
5. 키는 정렬되어 있음
```

### 실제 B-트리 예시

```
4차 B-트리 (최대 3개의 키, 4개의 자식)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    [50]
                   /    \
            [20, 30]    [70, 80]
           /   |   \    /   |   \
       [10] [25] [40] [60] [75] [90]

깊이: 3
노드 수: 10개
저장된 키: 12개

만약 BST였다면?
깊이: 최악 12 (선형), 최선 4 (완전 균형)
노드 수: 12개
```

---

## 왜 이렇게 빠를까?

### 1. 디스크 블록 크기 최적화

```
디스크 I/O의 비밀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

디스크는 "블록" 단위로 읽음
- 일반적인 블록 크기: 4KB ~ 16KB
- 1바이트를 읽든, 4KB를 읽든 시간 동일!

B-트리의 전략:
✅ 한 노드 크기 = 한 디스크 블록 크기
✅ 한 번의 디스크 접근으로 수백 개의 키 읽기

예: 8KB 블록, 키 크기 40바이트
→ 한 노드에 약 200개의 키 저장 가능!
```

**실제 계산**:

```
100만 개의 레코드 검색
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이진 탐색 트리 (BST):
- 노드당 키 1개
- 깊이: log₂(1,000,000) ≈ 20
- 디스크 접근: 20번
- 시간: 20 × 10ms = 200ms

B-트리 (노드당 키 200개):
- 노드당 키 200개
- 깊이: log₂₀₀(1,000,000) ≈ 3
- 디스크 접근: 3번
- 시간: 3 × 10ms = 30ms

→ 약 6.7배 빠름!
```

### 2. 균형 보장

```
균형 유지
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

B-트리는 항상 균형을 유지
→ 모든 리프 노드가 같은 깊이
→ 최악의 경우도 O(log n) 보장

불균형 BST (최악):
         1
          \
           2
            \
             3
              \
               4  ← 깊이 4 (선형)

B-트리 (항상 균형):
       [2]
      /   \
    [1]   [3,4]  ← 깊이 2
```

### 3. 범위 검색 효율적

```
범위 검색 (Range Query)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT * FROM users WHERE age BETWEEN 25 AND 35;

B-트리의 장점:
1. 25를 찾음 (log n)
2. 리프 노드에서 순차적으로 읽음
3. 35까지 도달하면 종료

         [30]
        /    \
    [10,20] [40,50]
           ↑
    리프 노드끼리 연결되어 있음 (B+트리)
    → 순차 접근 빠름!
```

---

## B-트리 동작 원리

### 검색 (Search)

```javascript
// 60을 검색한다고 가정

         [50]
        /    \
    [20,30]  [70,80]
    /  |  \   /  |  \
  [10][25][40][60][75][90]

1단계: 루트 노드 [50]
       60 > 50 → 오른쪽 자식으로

2단계: [70, 80]
       60 < 70 → 첫 번째 자식으로

3단계: [60]
       60 == 60 → 찾음!

총 3번의 디스크 접근
```

**의사 코드**:

```python
def search(node, key):
    # 현재 노드에서 키 위치 찾기
    i = 0
    while i < node.key_count and key > node.keys[i]:
        i += 1

    # 키를 찾았으면 반환
    if i < node.key_count and key == node.keys[i]:
        return node, i

    # 리프 노드면 없음
    if node.is_leaf:
        return None

    # 자식 노드로 재귀
    return search(node.children[i], key)
```

### 삽입 (Insert)

```
삽입 과정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 삽입 위치 찾기 (검색과 동일)
2. 리프 노드에 삽입
3. 노드가 가득 차면? → 분할 (Split)

예: [10, 20, 30]에 25 삽입 (최대 3개 키)
```

**분할 없이 삽입**:

```
초기 상태:
[10, 20, 30]

25 삽입:
[10, 20, 25, 30]  ← 가득 참! (4개 초과)
```

**분할 발생**:

```
1. 중간 키(25)를 부모로 올림
2. 나머지를 두 노드로 분할

        [25]           ← 새 루트
       /    \
   [10,20]  [30]       ← 분할된 노드
```

### 삭제 (Delete)

삭제는 복잡하지만 기본 원리는 다음과 같습니다.

```
삭제 과정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 삭제할 키 찾기
2. 리프 노드면 그냥 삭제
3. 내부 노드면:
   - 왼쪽 서브트리의 최대값 또는
   - 오른쪽 서브트리의 최소값으로 대체
4. 노드의 키가 최소값 미만이면:
   - 형제에게서 빌리기 (Borrow)
   - 또는 병합 (Merge)
```

---

## PostgreSQL의 B-트리 인덱스

### 실제 구조

PostgreSQL에서 B-트리 인덱스를 생성하면:

```sql
CREATE INDEX idx_users_email ON users(email);
```

**내부 구조**:

```
디스크에 저장된 B-트리
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

페이지 크기: 8KB (PostgreSQL 기본값)

루트 페이지:
┌─────────────────────────────┐
│ email: "m@..."  → 페이지 2  │
│ email: "z@..."  → 페이지 3  │
└─────────────────────────────┘

리프 페이지 2:
┌─────────────────────────────┐
│ "a@..." → CTID (0,1)        │  ← 실제 행 위치
│ "b@..." → CTID (0,5)        │
│ "c@..." → CTID (1,2)        │
│ ...                         │
└─────────────────────────────┘

CTID = (페이지 번호, 슬롯 번호)
```

### 성능 확인

```sql
-- 인덱스 사용 확인
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'john@example.com';

-- 결과
Index Scan using idx_users_email on users
  (cost=0.42..8.44 rows=1 width=100)
  (actual time=0.015..0.016 rows=1 loops=1)
  Index Cond: (email = 'john@example.com'::text)
  Buffers: shared hit=3          ← 3개 페이지 접근!
Planning Time: 0.082 ms
Execution Time: 0.031 ms

→ 인덱스 없이: 1000ms (전체 테이블 스캔)
→ 인덱스 사용: 0.031ms (약 32,000배 빠름!)
```

---

## B+트리 (B-Plus Tree)

실제 데이터베이스는 **B+트리**를 더 많이 사용합니다.

### B-트리 vs B+트리

```
B-트리
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

         [30, 50, 70]
        /    |    |    \
    [10,20] [40] [60] [80,90]

- 모든 노드에 데이터 저장
- 내부 노드, 리프 노드 모두 데이터 가짐

B+트리
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

         [30, 50, 70]          ← 키만 저장 (데이터 없음)
        /    |    |    \
리프: [10,20]→[30,40]→[50,60]→[70,80,90]  ← 데이터는 리프에만
         ↓        ↓        ↓        ↓
       데이터    데이터    데이터    데이터

- 리프 노드끼리 연결 (Linked List)
- 데이터는 리프 노드에만 저장
```

### B+트리의 장점

```
1. 범위 검색 최적화
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT * FROM users WHERE age BETWEEN 20 AND 30;

B-트리: 트리를 여러 번 순회
B+트리: 20을 찾은 후 리프에서 순차 읽기 (Linked List)
→ 캐시 효율적!

2. 내부 노드 효율성
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B-트리: 내부 노드에 데이터 → 노드당 키 개수 적음
B+트리: 내부 노드에 키만 → 더 많은 키 저장 가능
→ 트리 깊이 감소!

3. 순차 접근 성능
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT * FROM users ORDER BY age;

B+트리: 리프 노드만 순회 (Linked List)
B-트리: In-order 순회 필요 (재귀적)
→ B+트리가 훨씬 빠름!
```

---

## 실제 성능 비교

### 인덱스 없음 vs B-트리 인덱스

```sql
-- 100만 개 레코드
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    name VARCHAR(100)
);

-- 100만 개 삽입
INSERT INTO users (email, name)
SELECT
    'user' || i || '@example.com',
    'User ' || i
FROM generate_series(1, 1000000) AS i;
```

**성능 테스트**:

```sql
-- 인덱스 없이 검색
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'user500000@example.com';

Result:
Seq Scan on users  (cost=0.00..21394.00 rows=1 width=100)
                   (actual time=150.234..300.567 rows=1 loops=1)
Execution Time: 300.589 ms  ← 느림!

-- B-트리 인덱스 생성
CREATE INDEX idx_users_email ON users(email);

-- 인덱스로 검색
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'user500000@example.com';

Result:
Index Scan using idx_users_email on users
  (cost=0.42..8.44 rows=1 width=100)
  (actual time=0.025..0.026 rows=1 loops=1)
Execution Time: 0.031 ms  ← 약 10,000배 빠름!
```

### 인덱스 크기

```sql
-- 테이블 크기 확인
SELECT pg_size_pretty(pg_table_size('users'));
-- 65 MB

-- 인덱스 크기 확인
SELECT pg_size_pretty(pg_indexes_size('users'));
-- 21 MB

→ 인덱스는 테이블의 약 32% 크기
→ 검색 속도를 위해 추가 저장 공간 사용
```

---

## B-트리가 적합한 경우

### ✅ 사용하기 좋은 경우

```sql
-- 1. 동등 비교 (=)
SELECT * FROM users WHERE email = 'john@example.com';

-- 2. 범위 검색 (<, >, BETWEEN)
SELECT * FROM users WHERE age BETWEEN 20 AND 30;
SELECT * FROM orders WHERE created_at > '2024-01-01';

-- 3. 정렬 (ORDER BY)
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- 4. MIN/MAX
SELECT MIN(price), MAX(price) FROM products;

-- 5. LIKE 'prefix%' (앞부분 일치)
SELECT * FROM users WHERE email LIKE 'john%';
```

### ❌ 효과가 없는 경우

```sql
-- 1. LIKE '%suffix' (뒷부분 일치)
SELECT * FROM users WHERE email LIKE '%@gmail.com';
-- B-트리는 앞에서부터 비교 → 뒷부분 일치는 비효율적
-- 해결: 전문 검색 인덱스 (GIN)

-- 2. 함수 적용
SELECT * FROM users WHERE LOWER(email) = 'john@example.com';
-- 인덱스는 원본 값에만 적용
-- 해결: 표현식 인덱스 CREATE INDEX ON users(LOWER(email));

-- 3. OR 조건
SELECT * FROM users WHERE name = 'John' OR age = 30;
-- 인덱스를 두 번 사용해야 함 (비효율적)

-- 4. 부정 조건
SELECT * FROM users WHERE status != 'active';
-- 대부분의 행이 매칭 → 인덱스보다 전체 스캔이 나음
```

---

## 복합 인덱스 (Composite Index)

여러 컬럼을 조합한 B-트리 인덱스입니다.

```sql
CREATE INDEX idx_users_name_age ON users(name, age);
```

**내부 구조**:

```
복합 인덱스 B-트리
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

         [(John, 25), (Mary, 30)]
        /            |             \
[(Alice,20)]  [(Bob,25)]    [(Tom,35)]
                ↓
  먼저 name으로 정렬, 같으면 age로 정렬
```

### 복합 인덱스 활용

```sql
-- ✅ 인덱스 사용 (name)
SELECT * FROM users WHERE name = 'John';

-- ✅ 인덱스 사용 (name, age)
SELECT * FROM users WHERE name = 'John' AND age = 25;

-- ✅ 인덱스 사용 (name, age 범위)
SELECT * FROM users WHERE name = 'John' AND age > 20;

-- ❌ 인덱스 미사용 (age만)
SELECT * FROM users WHERE age = 25;
-- name이 첫 번째 컬럼이므로 age만으로는 사용 불가

-- 해결: age에 별도 인덱스 또는 (age, name) 인덱스 생성
```

**규칙**:

```
복합 인덱스 (A, B, C)는:

✅ (A)           사용 가능
✅ (A, B)        사용 가능
✅ (A, B, C)     사용 가능
❌ (B)           사용 불가
❌ (B, C)        사용 불가
❌ (C)           사용 불가

→ 왼쪽부터 연속적으로 사용해야 함!
```

---

## 시각화로 이해하기

### 1억 개 레코드 검색

```
인덱스 없이 (전체 스캔)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

레코드 1  ───┐
레코드 2     │
레코드 3     │
   ...       ├─ 1억 개 모두 확인
레코드 99M   │
레코드 100M ─┘

시간: 1억 × 1μs = 100초

B-트리 인덱스 사용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

루트 (깊이 0)   ───┐
중간 (깊이 1)      ├─ 4번만 접근
중간 (깊이 2)      │
리프 (깊이 3)   ───┘

시간: 4 × 10ms = 40ms

→ 2,500배 빠름!
```

---

## 실무 팁

### 1. 인덱스 모니터링

```sql
-- 사용되지 않는 인덱스 찾기
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,                    -- 인덱스 사용 횟수
    pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
WHERE idx_scan = 0               -- 한 번도 사용 안 됨
ORDER BY pg_relation_size(indexrelid) DESC;

-- 사용하지 않으면 삭제!
DROP INDEX idx_unused;
```

### 2. 인덱스 재구성

```sql
-- 인덱스 비대화 확인
SELECT
    indexrelname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    pg_size_pretty(pg_relation_size(relid)) AS table_size
FROM pg_stat_user_indexes;

-- 인덱스 재구성 (동시 사용 가능)
REINDEX INDEX CONCURRENTLY idx_users_email;

-- 또는
DROP INDEX CONCURRENTLY idx_users_email;
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

### 3. 부분 인덱스로 최적화

```sql
-- 활성 사용자만 인덱스
CREATE INDEX idx_active_users_email
ON users(email)
WHERE status = 'active';

-- 인덱스 크기 감소 + 검색 속도 향상!
```

---

## 요약

### B-트리가 빠른 이유

```
1. 디스크 접근 최소화
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - 한 노드에 수백 개의 키
   - 한 번의 디스크 I/O로 많은 키 읽기
   - 깊이 감소: log_base(키 개수)

2. 균형 보장
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - 항상 균형 유지
   - 최악의 경우도 O(log n) 보장
   - 모든 리프 노드가 같은 깊이

3. 순차 접근 효율
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - 정렬된 키
   - 범위 검색 최적화
   - B+트리: 리프 노드 연결로 더 빠름

4. 캐시 친화적
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - 상위 노드는 메모리에 캐싱
   - 실제 디스크 접근은 더 적음
```

### 성능 비교 요약

| 작업 | 인덱스 없음 | B-트리 인덱스 | 차이 |
|------|------------|--------------|------|
| **검색 (100만 행)** | 300ms | 0.03ms | **10,000배** |
| **범위 검색** | 전체 스캔 | log n + 결과 수 | **매우 빠름** |
| **정렬** | O(n log n) | 이미 정렬됨 | **정렬 불필요** |
| **MIN/MAX** | 전체 스캔 | O(log n) | **10,000배** |

---

## 추가 학습 자료

- [B-Tree Visualization](https://www.cs.usfca.edu/~galles/visualization/BTree.html)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [Use The Index, Luke!](https://use-the-index-luke.com/)

---

## 다음 학습

- [인덱싱 전략](indexing.md)
- [쿼리 최적화](query-optimization.md)
- [데이터베이스 내부 구조](database-internals.md)

---

*Last updated: 2026-01-05*
