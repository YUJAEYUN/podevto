# B-Tree와 B+Tree - 인덱스의 핵심

> "왜 HashMap이 아니라 B+Tree를 사용할까?"

## 🎯 학습 목표

- B-Tree와 B+Tree의 **구조와 동작 원리** 완벽 이해
- **왜 디스크 기반 DB는 B+Tree를 사용**하는지 파악
- 실제로 **인덱스가 어떻게 동작**하는지 시각화

## 🤔 왜 B+Tree인가?

### 질문: 왜 HashMap이 아닌가?

HashMap은 O(1)로 가장 빠른데, 왜 O(log n)인 B+Tree를 쓸까?

#### HashMap의 문제점
```
1. 범위 검색 불가능
   - WHERE age BETWEEN 20 AND 30 ❌
   - 모든 키를 확인해야 함 O(n)

2. 순서 정렬 불가능
   - ORDER BY name ❌
   - 별도 정렬 필요 O(n log n)

3. 디스크 I/O 비효율
   - 랜덤 액세스 (Random Access)
   - 데이터가 흩어져 있음
```

#### B+Tree의 장점
```
1. 범위 검색 효율적 ✅
   - 리프 노드가 연결리스트
   - 순차 접근 (Sequential Access)

2. 정렬된 데이터 ✅
   - ORDER BY가 빠름

3. 디스크 I/O 최적화 ✅
   - 높이가 낮음 (보통 3~4)
   - 한 번에 많은 키를 읽음
```

## 📚 B-Tree 구조

### 기본 개념

B-Tree는 **균형 잡힌 다진 탐색 트리** (Balanced Multi-way Search Tree)

```
특징:
1. 모든 리프 노드가 같은 높이
2. 각 노드는 여러 개의 키를 가짐
3. 각 노드는 (키 개수 + 1)개의 자식을 가짐
```

### B-Tree의 Order (차수)

**Order m**: 각 노드가 최대 m개의 자식을 가질 수 있음

```
Order 3 B-Tree:
- 최대 3개의 자식
- 최대 2개의 키
- 최소 ceil(m/2) = 2개의 자식 (루트 제외)
```

### B-Tree 예제 (Order 3)

```
         [10, 20]
        /    |    \
      /      |      \
   [5,7]  [12,15]  [25,30]
```

**특징**:
- 각 노드에 **데이터도 함께 저장**
- 중간 노드에서도 데이터 검색 가능

### B-Tree 검색 과정

```
목표: 15를 찾기

         [10, 20]
        /    |    \
      /      |      \
   [5,7]  [12,15]  [25,30]
            └─── 여기서 발견! ✅

과정:
1. 루트: 10 < 15 < 20 → 가운데 자식
2. [12, 15]: 15 발견!
```

### B-Tree 삽입 과정

#### 케이스 1: 노드에 공간이 있는 경우
```
초기:
      [10, 20]

삽입: 15

결과:
      [10, 15, 20]  ✅
```

#### 케이스 2: 노드가 가득 찬 경우 (Split)
```
초기:
      [10, 20]  (최대 2개)

삽입: 15

1. 임시로 삽입
   [10, 15, 20]  (3개, 초과!)

2. 중간 값을 부모로 올림
         [15]
        /    \
     [10]    [20]  ✅
```

## 📚 B+Tree 구조

### B-Tree vs B+Tree 핵심 차이

```
B-Tree:
- 모든 노드에 데이터 저장
- 중간 노드에서도 검색 종료 가능

B+Tree:
- 리프 노드에만 데이터 저장
- 중간 노드는 키만 저장 (인덱스 역할)
- 리프 노드가 연결리스트로 연결됨
```

### B+Tree 구조 (Order 3)

```
           [10, 20]           ← 내부 노드 (키만 저장)
          /    |    \
        /      |      \
     [10]    [20]    [30]     ← 리프 노드 (데이터 저장)
       ↓       ↓       ↓
    (5,7,10)(12,15,20)(25,30,35)
       ↔       ↔       ↔       ← 연결리스트
```

**핵심**:
1. 내부 노드: 키만 저장 → 더 많은 키를 메모리에 올림
2. 리프 노드: 실제 데이터 (또는 데이터 포인터)
3. 리프 노드 연결: 범위 검색 최적화

### B+Tree 검색 과정

```
목표: 15를 찾기

           [10, 20]
          /    |    \
        /      |      \
     [10]    [20]    [30]
       ↓       ↓       ↓
    (5,7,10)(12,15,20)(25,30,35)
              └─── 여기서 발견! ✅

과정:
1. 루트: 10 < 15 < 20 → 가운데 자식
2. 리프: [12, 15, 20] 중 15 발견!
```

### B+Tree 범위 검색

```
목표: 12 <= key <= 30 범위 검색

           [10, 20]
          /    |    \
        /      |      \
     [10]    [20]    [30]
       ↓       ↓       ↓
    (5,7,10)(12,15,20)(25,30,35)
              └────→─────→      연결리스트 따라가기

과정:
1. 12를 찾음 (이진 탐색)
2. 연결리스트를 따라 30까지 순차 접근
3. 결과: [12, 15, 20, 25, 30] ✅

시간 복잡도: O(log n) + O(k)  (k = 결과 개수)
```

## 💾 디스크 I/O 최적화

### 왜 B+Tree가 디스크에 유리한가?

#### 디스크의 특성
```
1. 블록 단위 읽기
   - 한 번에 4KB~16KB 읽음
   - 1바이트만 필요해도 4KB를 읽음

2. Sequential Access vs Random Access
   - 순차: 100 MB/s
   - 랜덤: 1 MB/s (100배 느림!)

3. 디스크 Seek Time
   - 헤드 이동 시간: 5~10ms
   - 메모리 접근: 100ns (10만 배 차이!)
```

#### B+Tree의 최적화

**1. 높이가 낮음**
```
예: 1억 건의 레코드, Order 100 B+Tree

높이 계산:
- 레벨 1 (루트): 1 노드
- 레벨 2: 100 노드
- 레벨 3: 10,000 노드
- 레벨 4: 1,000,000 노드
- 레벨 5: 100,000,000 레코드

높이 = 5 → 최대 5번의 디스크 I/O로 검색 완료!
```

**2. 한 노드에 많은 키 저장**
```
Order가 클수록:
- 더 많은 키를 한 번에 읽음
- 높이가 낮아짐
- 디스크 I/O 횟수 감소

예: 4KB 페이지
- 키 크기: 20 bytes
- 포인터: 8 bytes
- 한 노드에 저장 가능: 4096 / 28 ≈ 146개
```

**3. 리프 노드 연결리스트**
```
범위 검색 시:
1. 시작 지점 찾기: O(log n) - 랜덤 액세스
2. 연결리스트 따라가기: O(k) - 순차 액세스

순차 액세스는 100배 빠름!
```

## 🔬 실제 DB에서의 구현

### MySQL InnoDB B+Tree

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    INDEX idx_age (age)
);
```

#### 1. 클러스터드 인덱스 (Primary Key)

```
B+Tree 구조:
           [100, 500]
          /     |     \
        /       |       \
   [1,50,100] [200,300,500] [600,700,800]
       ↓          ↓              ↓
    실제 레코드  실제 레코드     실제 레코드
```

**특징**:
- 리프 노드에 **전체 레코드** 저장
- Primary Key 순서로 물리적 정렬

#### 2. 세컨더리 인덱스 (age)

```
B+Tree 구조:
           [30, 50]
          /    |    \
        /      |      \
   [20,25,30] [35,40,50] [55,60,65]
       ↓          ↓            ↓
    PK값 저장   PK값 저장    PK값 저장
   [5,12,45]  [23,78,90]   [2,34,56]
```

**특징**:
- 리프 노드에 **Primary Key 값** 저장
- 실제 데이터는 클러스터드 인덱스를 다시 검색해야 함

#### 세컨더리 인덱스 검색 과정
```sql
SELECT * FROM users WHERE age = 25;

1. age 인덱스에서 25 검색 (B+Tree)
   → PK = 12 발견

2. PK 인덱스에서 12 검색 (B+Tree)
   → 실제 레코드 반환

총 2번의 B+Tree 검색!
```

### PostgreSQL B+Tree

PostgreSQL도 유사하지만 차이점:

```
1. Heap File + Index
   - 데이터는 Heap에 저장 (순서 없음)
   - 인덱스는 Heap의 물리적 위치(TID) 저장

2. MVCC와 통합
   - 각 버전마다 인덱스 엔트리 필요
   - VACUUM으로 정리
```

## 💡 실무 최적화

### 1. 인덱스 선택도 (Selectivity)

```sql
-- 나쁜 예: 선택도가 낮음
CREATE INDEX idx_gender ON users(gender);  ❌
-- gender는 보통 'M', 'F' 2개 → 절반씩

-- 좋은 예: 선택도가 높음
CREATE INDEX idx_email ON users(email);  ✅
-- email은 대부분 고유 → 정확히 1건
```

**선택도 = 고유 값 개수 / 전체 레코드 개수**
- 1에 가까울수록 좋음 (고유 값이 많음)
- 0에 가까우면 인덱스 효과 없음

### 2. 복합 인덱스 (Composite Index)

```sql
CREATE INDEX idx_name_age ON users(name, age);
```

#### B+Tree 구조
```
         [('Alice', 30), ('John', 25)]
        /                              \
   [('Alice', 20)]                  [('John', 30)]
   [('Alice', 25)]                  [('Tom', 40)]
   [('Alice', 30)]                  [('Tom', 50)]
```

**규칙**:
- 첫 번째 컬럼으로 정렬
- 같은 값이면 두 번째 컬럼으로 정렬

#### 복합 인덱스 활용
```sql
-- ✅ 인덱스 사용
SELECT * FROM users WHERE name = 'Alice';
SELECT * FROM users WHERE name = 'Alice' AND age = 25;

-- ❌ 인덱스 사용 안 됨 (첫 번째 컬럼 없음)
SELECT * FROM users WHERE age = 25;
```

### 3. 커버링 인덱스 (Covering Index)

```sql
-- 인덱스: idx_age_name (age, name)

SELECT name FROM users WHERE age = 25;
```

**동작**:
```
1. age 인덱스에서 25 검색
2. 리프 노드에 name도 저장되어 있음
3. 테이블 조회 없이 바로 반환! ✅

→ "Index-Only Scan"
→ 디스크 I/O 감소
```

## 🧪 실습: B+Tree 직접 시각화

### Python으로 B+Tree 구현
```python
class BPlusTreeNode:
    def __init__(self, order):
        self.order = order
        self.keys = []
        self.children = []
        self.is_leaf = True
        self.next = None  # 리프 노드 연결

    def insert(self, key):
        # 삽입 로직
        pass

    def split(self):
        # 분할 로직
        mid = len(self.keys) // 2
        new_node = BPlusTreeNode(self.order)
        new_node.keys = self.keys[mid:]
        self.keys = self.keys[:mid]
        return new_node

class BPlusTree:
    def __init__(self, order=3):
        self.root = BPlusTreeNode(order)
        self.order = order

    def search(self, key):
        node = self.root
        # 루트부터 리프까지 탐색
        while not node.is_leaf:
            for i, k in enumerate(node.keys):
                if key < k:
                    node = node.children[i]
                    break
            else:
                node = node.children[-1]

        # 리프 노드에서 검색
        if key in node.keys:
            return node.keys.index(key)
        return None

    def range_search(self, start, end):
        # 시작 지점 찾기
        node = self.root
        # ... (생략)

        # 연결리스트 따라가기
        results = []
        while node:
            for key in node.keys:
                if start <= key <= end:
                    results.append(key)
                elif key > end:
                    return results
            node = node.next
        return results
```

### MySQL에서 B+Tree 확인
```sql
-- 인덱스 구조 확인
EXPLAIN SELECT * FROM users WHERE id = 100;

-- 인덱스 통계
SHOW INDEX FROM users;

-- InnoDB 페이지 정보
SELECT * FROM INFORMATION_SCHEMA.INNODB_BUFFER_PAGE;
```

## 🎯 체크리스트

- [ ] B-Tree와 B+Tree의 차이를 설명할 수 있다
- [ ] B+Tree가 디스크 I/O에 유리한 이유 3가지를 설명할 수 있다
- [ ] B+Tree의 높이 계산을 할 수 있다
- [ ] 범위 검색이 빠른 이유를 설명할 수 있다
- [ ] 클러스터드 인덱스와 세컨더리 인덱스의 차이를 이해한다
- [ ] 복합 인덱스의 동작 원리를 이해한다
- [ ] 커버링 인덱스의 효과를 설명할 수 있다

## 🔗 다음 학습

- [02-MVCC.md](./02-MVCC.md) - 동시성 제어
- [06-Locking-Mechanisms.md](./06-Locking-Mechanisms.md) - 락 메커니즘

---

**"B+Tree를 이해하면 인덱스 최적화가 직관적으로 보인다"**
