# Data Structures & Algorithms - 사고력의 기초

> "알고리즘은 코딩테스트가 아니라 문제 해결 능력이다"

## 🎯 학습 목표

- **시간/공간 복잡도를 직관적**으로 이해
- **적절한 자료구조를 선택**할 수 있는 판단력
- **실무 문제를 알고리즘적 사고**로 해결하는 능력

## 📊 학습 우선순위

```
1. 기본 자료구조와 복잡도 (40%)
   - 배열, 연결리스트, 스택, 큐, 해시테이블

2. 정렬/탐색 알고리즘 (30%)
   - Quick, Merge, Binary Search

3. 동적 프로그래밍/그리디 (20%)
   - Memoization, Tabulation

4. 고급 자료구조 (10%)
   - 트리, 그래프, Heap
```

## 📂 학습 경로

### Phase 1: Fundamentals (1주차)

- [01-Complexity-Analysis.md](./fundamentals/01-Complexity-Analysis.md) - Big-O 표기법
- [02-Array-LinkedList.md](./fundamentals/02-Array-LinkedList.md) - 배열 vs 연결리스트
- [03-Stack-Queue.md](./fundamentals/03-Stack-Queue.md) - 스택과 큐
- [04-Hash-Table.md](./fundamentals/04-Hash-Table.md) - 해시테이블
- [05-Tree-Basics.md](./fundamentals/05-Tree-Basics.md) - 트리 기초

### Phase 2: Deep Dive (2주차)

- [01-Sorting-Algorithms.md](./deep-dive/01-Sorting-Algorithms.md) - 정렬 알고리즘 비교
- [02-Binary-Search-Tree.md](./deep-dive/02-Binary-Search-Tree.md) - BST, AVL, Red-Black
- [03-Graph-Algorithms.md](./deep-dive/03-Graph-Algorithms.md) - BFS, DFS, Dijkstra
- [04-Dynamic-Programming.md](./deep-dive/04-Dynamic-Programming.md) - DP 패턴
- [05-Greedy-Algorithms.md](./deep-dive/05-Greedy-Algorithms.md) - 탐욕 알고리즘
- [06-Heap-Priority-Queue.md](./deep-dive/06-Heap-Priority-Queue.md) - 힙

### Phase 3: Practice (지속적)

- [01-LeetCode-Patterns.md](./practice/01-LeetCode-Patterns.md) - 문제 패턴
- [02-Implementation-Guide.md](./practice/02-Implementation-Guide.md) - 구현 가이드
- [03-Common-Mistakes.md](./practice/03-Common-Mistakes.md) - 흔한 실수
- [04-Interview-Prep.md](./practice/04-Interview-Prep.md) - 면접 준비

### Phase 4: Real-World

- [01-Redis-Data-Structures.md](./real-world/01-Redis-Data-Structures.md) - Redis 자료구조
- [02-Database-Indexes.md](./real-world/02-Database-Indexes.md) - DB 인덱스 (B+Tree)
- [03-LRU-Cache.md](./real-world/03-LRU-Cache.md) - 캐시 구현
- [04-Rate-Limiter.md](./real-world/04-Rate-Limiter.md) - 속도 제한

## 🔍 핵심 질문들

### 자료구조
1. **왜 배열이 아니라 연결리스트를 쓰는가?**
   - 삽입/삭제가 빈번할 때

2. **왜 해시테이블은 O(1)인가?**
   - 직접 주소 계산 (해시 함수)

3. **왜 트리는 O(log n)인가?**
   - 각 단계에서 절반씩 제거

### 알고리즘
1. **왜 Quick Sort가 평균적으로 빠른가?**
   - 캐시 효율성, In-place 정렬

2. **왜 동적 프로그래밍을 쓰는가?**
   - 중복 계산 제거 (Memoization)

3. **왜 BFS vs DFS를 선택하는가?**
   - 최단 경로 vs 모든 경로 탐색

## 💡 실무 연결

### 1. 배열 vs 연결리스트

```java
// ArrayList (배열 기반)
List<String> arrayList = new ArrayList<>();
arrayList.add("item");  // O(1) 평균, O(n) 최악 (resize)
arrayList.get(5);       // O(1) - 인덱스 접근

// LinkedList (연결리스트 기반)
List<String> linkedList = new LinkedList<>();
linkedList.add("item");  // O(1)
linkedList.get(5);       // O(n) - 순차 접근

// 실무 선택:
// - 읽기가 많음 → ArrayList
// - 삽입/삭제가 많음 → LinkedList (드물게 사용)
```

### 2. 해시테이블 (HashMap)

```java
// 사용자 캐싱
Map<String, User> userCache = new HashMap<>();
userCache.put(userId, user);  // O(1)
User user = userCache.get(userId);  // O(1)

// 중복 체크
Set<String> uniqueEmails = new HashSet<>();
if (uniqueEmails.contains(email)) {
    throw new DuplicateException();  // O(1)
}
```

### 3. 우선순위 큐 (Heap)

```java
// 작업 스케줄링 (우선순위 기반)
PriorityQueue<Task> taskQueue = new PriorityQueue<>(
    (a, b) -> a.priority - b.priority
);

taskQueue.offer(new Task(priority: 5));  // O(log n)
Task nextTask = taskQueue.poll();        // O(log n)

// 실무 사용:
// - 이벤트 스케줄러
// - Dijkstra 알고리즘
// - Huffman 코딩
```

### 4. LRU 캐시 (HashMap + Doubly Linked List)

```java
class LRUCache {
    private Map<Integer, Node> cache;
    private int capacity;
    private Node head, tail;

    public int get(int key) {
        if (!cache.containsKey(key)) return -1;

        Node node = cache.get(key);
        moveToHead(node);  // 최근 사용으로 표시
        return node.value;
    }

    public void put(int key, int value) {
        if (cache.size() >= capacity) {
            // 가장 오래된 항목 제거
            cache.remove(tail.prev.key);
            removeNode(tail.prev);
        }
        // 새 항목 추가
        Node node = new Node(key, value);
        cache.put(key, node);
        addToHead(node);
    }
}

// 실무 사용:
// - Redis LRU eviction
// - 브라우저 캐시
// - OS 페이지 교체
```

## 📈 학습 진행도 체크리스트

### Week 1: Fundamentals
- [ ] Big-O를 직관적으로 이해한다 (O(1) ~ O(n²))
- [ ] 배열과 연결리스트의 트레이드오프를 설명할 수 있다
- [ ] 스택과 큐의 실무 사용 사례를 안다
- [ ] 해시테이블의 충돌 해결 방법을 이해한다
- [ ] 이진 트리를 순회할 수 있다 (In/Pre/Post-order)

### Week 2: Deep Dive
- [ ] Quick Sort와 Merge Sort를 비교할 수 있다
- [ ] BST, AVL, Red-Black Tree의 차이를 이해한다
- [ ] BFS와 DFS를 구현할 수 있다
- [ ] 동적 프로그래밍 문제를 접근할 수 있다
- [ ] Dijkstra 알고리즘을 이해한다

### Week 3+: Practice
- [ ] 백준/프로그래머스 문제를 주 3회 풀고 있다
- [ ] LeetCode Easy 문제를 편하게 푼다
- [ ] LeetCode Medium 문제를 접근할 수 있다
- [ ] 코딩테스트 패턴을 익혔다 (투포인터, 슬라이딩 윈도우 등)

## 🎓 추천 학습 흐름

```
Day 1-2: Big-O와 배열/연결리스트
   ↓
Day 3-4: 스택/큐/해시테이블
   ↓
Day 5-7: 트리 (BST, 순회)
   ↓
Day 8-10: 정렬 알고리즘
   ↓
Day 11-13: 그래프 (BFS, DFS)
   ↓
Day 14-16: 동적 프로그래밍 기초
   ↓
Day 17~: 주 3회 코딩테스트 (꾸준히)
```

## 💻 코딩테스트 전략

### 1. 문제 접근 순서

```
1. 이해 (5분)
   - 입력/출력 예제 확인
   - 제약 조건 파악 (시간/공간 복잡도)

2. 접근 방법 (10분)
   - 브루트포스부터 생각
   - 최적화 방법 고민
   - 자료구조 선택

3. 구현 (20분)
   - 간단한 케이스부터
   - Edge case 고려

4. 테스트 (5분)
   - 예제 입력 테스트
   - Edge case 테스트
```

### 2. 문제 유형별 패턴

```
배열:
- 투 포인터 (Two Pointers)
- 슬라이딩 윈도우 (Sliding Window)
- 누적 합 (Prefix Sum)

문자열:
- 해시맵 사용
- 투 포인터
- KMP (고급)

트리:
- 재귀 (DFS)
- 레벨 순회 (BFS)
- 분할 정복

그래프:
- BFS (최단 경로)
- DFS (모든 경로)
- Union-Find (연결 요소)

DP:
- Top-down (Memoization)
- Bottom-up (Tabulation)
- 상태 정의가 핵심
```

### 3. 시간 복잡도 목표

```
n ≤ 10: O(n!) - 브루트포스
n ≤ 20: O(2ⁿ) - 백트래킹
n ≤ 500: O(n³) - 3중 반복문
n ≤ 5,000: O(n²) - 2중 반복문
n ≤ 1,000,000: O(n log n) - 정렬
n ≤ 10,000,000: O(n) - 선형 탐색
```

## 🔗 실무 자료구조 매핑

### Redis 자료구조
```
String      → 단순 값
Hash        → HashMap
List        → LinkedList (Doubly)
Set         → HashSet
Sorted Set  → Skip List (B+Tree 유사)
```

### Java Collections
```
ArrayList   → Dynamic Array
LinkedList  → Doubly Linked List
HashMap     → Hash Table (Chaining)
TreeMap     → Red-Black Tree
PriorityQueue → Binary Heap
```

### Database 인덱스
```
Primary Key → B+Tree (클러스터드 인덱스)
Index       → B+Tree (세컨더리 인덱스)
Full-Text   → Inverted Index (역색인)
Geo         → R-Tree
```

## 🧪 실습 프로젝트

### 1. Redis 클론 만들기
```python
# 기본 자료구조 구현
class MiniRedis:
    def __init__(self):
        self.strings = {}  # String
        self.lists = {}    # List
        self.sets = {}     # Set
        self.hashes = {}   # Hash

    def set(self, key, value):
        self.strings[key] = value

    def get(self, key):
        return self.strings.get(key)

    def lpush(self, key, *values):
        if key not in self.lists:
            self.lists[key] = []
        self.lists[key] = list(values) + self.lists[key]

    # ... 더 구현
```

### 2. LRU 캐시 라이브러리
```java
// HashMap + Doubly Linked List
public class LRUCache<K, V> {
    private final int capacity;
    private final Map<K, Node<K, V>> cache;
    private final Node<K, V> head, tail;

    // get, put, remove 구현
}
```

### 3. 간단한 검색 엔진
```python
# Inverted Index (역색인)
class SearchEngine:
    def __init__(self):
        self.index = {}  # word → [doc_ids]

    def index_document(self, doc_id, text):
        words = text.split()
        for word in words:
            if word not in self.index:
                self.index[word] = []
            self.index[word].append(doc_id)

    def search(self, query):
        words = query.split()
        # 모든 단어를 포함하는 문서 찾기
        results = set(self.index.get(words[0], []))
        for word in words[1:]:
            results &= set(self.index.get(word, []))
        return list(results)
```

## 📚 추천 학습 자료

### 온라인 저지
- **백준** (BOJ) - 한국어, 단계별 학습
- **프로그래머스** - 카카오 기출, 레벨별
- **LeetCode** - 글로벌 표준, 패턴 학습

### 책
- **Cracking the Coding Interview** (McDowell)
- **알고리즘 문제 해결 전략** (구종만)
- **Introduction to Algorithms** (CLRS) - 고급

### 시각화
- **visualgo.net** - 알고리즘 애니메이션
- **algorithm-visualizer.org**

## 🎯 주 3회 코딩테스트 루틴

```
월요일: 백준 실버 1문제 + 프로그래머스 Lv.2 1문제
수요일: LeetCode Easy 2문제
금요일: LeetCode Medium 1문제 (도전)

+ 주말에 못 푼 문제 복습
+ 새로운 패턴 발견 시 문서화
```

## 🔗 다음 단계

알고리즘 학습은 지속적으로 하되:
1. 실제 프로젝트에 적용해보기
2. 오픈소스 자료구조 코드 읽기 (Redis, Java Collections)
3. 시스템 설계에서 자료구조 활용 (예: Rate Limiter)

---

**"알고리즘은 코딩테스트를 위한 것이 아니라, 문제를 단순화하는 사고력이다"**
