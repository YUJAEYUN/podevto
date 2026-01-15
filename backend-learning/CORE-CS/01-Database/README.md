# Database - 가장 먼저 깊이 파기

> "데이터베이스는 모든 백엔드 시스템의 심장이다"

## 🎯 학습 목표

단순히 SQL을 작성하는 것을 넘어서:
- 데이터베이스가 **내부적으로 어떻게 동작**하는지 이해
- **왜 이런 설계를 했는지** 트레이드오프 파악
- 성능 문제가 발생했을 때 **원인을 분석**하고 해결할 수 있는 능력

## 📊 학습 우선순위

```
1. 관계형 DB 내부 동작 원리 (40%)
   - 스토리지 엔진, 인덱스 구조

2. 트랜잭션과 동시성 제어 (30%)
   - ACID, 격리 수준, MVCC

3. 쿼리 최적화와 성능 (20%)
   - 실행 계획, N+1 문제

4. NoSQL 기본 개념 (10%)
   - CAP 정리, 언제 NoSQL을 쓰는가
```

## 📂 학습 경로

### Phase 1: Fundamentals (1주차)
기초를 탄탄히 다지는 단계

- [01-ACID-Properties.md](./fundamentals/01-ACID-Properties.md) - 왜 ACID가 필요한가?
- [02-Normalization.md](./fundamentals/02-Normalization.md) - 정규화와 비정규화
- [03-Transaction-Basics.md](./fundamentals/03-Transaction-Basics.md) - 트랜잭션 기초
- [04-Index-Basics.md](./fundamentals/04-Index-Basics.md) - 인덱스가 뭐길래?
- [05-SQL-Fundamentals.md](./fundamentals/05-SQL-Fundamentals.md) - SQL 제대로 이해하기

### Phase 2: Deep Dive (2주차)
깊이 있게 파고드는 단계

- [01-BTree-BPlusTree.md](./deep-dive/01-BTree-BPlusTree.md) - 인덱스 내부 구조
- [02-MVCC.md](./deep-dive/02-MVCC.md) - 다중 버전 동시성 제어
- [03-Transaction-Isolation.md](./deep-dive/03-Transaction-Isolation.md) - 격리 수준 완벽 이해
- [04-WAL-and-Recovery.md](./deep-dive/04-WAL-and-Recovery.md) - 장애 복구 메커니즘
- [05-Query-Optimizer.md](./deep-dive/05-Query-Optimizer.md) - 쿼리 실행 계획
- [06-Locking-Mechanisms.md](./deep-dive/06-Locking-Mechanisms.md) - 락과 동시성
- [07-Replication.md](./deep-dive/07-Replication.md) - 복제와 고가용성
- [08-Partitioning-Sharding.md](./deep-dive/08-Partitioning-Sharding.md) - 데이터 분산

### Phase 3: Practice (3주차)
직접 구현하며 이해하는 단계

- [01-Simple-KV-Store.md](./practice/01-Simple-KV-Store.md) - Key-Value 스토리지 구현
- [02-SQL-Parser.md](./practice/02-SQL-Parser.md) - 간단한 SQL 파서
- [03-Transaction-Log.md](./practice/03-Transaction-Log.md) - 트랜잭션 로그 분석 도구
- [04-Query-Profiler.md](./practice/04-Query-Profiler.md) - 쿼리 프로파일러
- [05-N-Plus-One-Detector.md](./practice/05-N-Plus-One-Detector.md) - N+1 문제 탐지기

### Phase 4: Resources
실무 사례와 깊은 자료

- [Books.md](./resources/Books.md) - 추천 도서
- [Papers-RFCs.md](./resources/Papers-RFCs.md) - 논문과 RFC
- [Open-Source.md](./resources/Open-Source.md) - 읽어볼 오픈소스 코드
- [Post-Mortems.md](./resources/Post-Mortems.md) - 장애 회고록
- [Blogs-Articles.md](./resources/Blogs-Articles.md) - 고급 블로그 글

## 🔍 핵심 질문들 ("왜?"를 3번 물어보기)

### 인덱스
1. **왜 인덱스를 사용하는가?**
   - 전체 테이블 스캔은 O(n), 인덱스는 O(log n)

2. **왜 B+Tree를 사용하는가?**
   - 디스크 기반 시스템에 최적화 (높이가 낮고, 범위 검색 빠름)

3. **왜 모든 컬럼에 인덱스를 걸지 않는가?**
   - Write 성능 저하, 저장 공간 낭비

### 트랜잭션
1. **왜 트랜잭션이 필요한가?**
   - 데이터 일관성 보장 (돈이 사라지면 안 됨)

2. **왜 격리 수준이 여러 개인가?**
   - 일관성과 성능의 트레이드오프

3. **왜 MVCC를 사용하는가?**
   - 읽기와 쓰기가 서로 블록하지 않아 동시성 향상

### 복제와 분산
1. **왜 복제(Replication)를 하는가?**
   - 고가용성, 읽기 성능 향상

2. **왜 샤딩(Sharding)을 하는가?**
   - 단일 서버의 한계 극복

3. **왜 분산 시스템은 어려운가?**
   - CAP 정리: 일관성, 가용성, 분할 내성 중 2개만 선택 가능

## 💡 실무 시나리오

### 시나리오 1: 느린 쿼리 개선
```sql
-- 문제: 1000만 건의 users 테이블에서 검색이 느림
SELECT * FROM users WHERE email = 'user@example.com';

-- 분석:
-- 1. EXPLAIN으로 실행 계획 확인
-- 2. email 컬럼에 인덱스가 없음을 발견
-- 3. 전체 테이블 스캔 (Full Table Scan) 발생

-- 해결:
CREATE INDEX idx_users_email ON users(email);

-- 결과: 10초 → 0.01초
```

### 시나리오 2: N+1 쿼리 문제
```java
// 문제: N+1 쿼리 발생
List<User> users = userRepository.findAll(); // 1번
for (User user : users) {
    List<Order> orders = user.getOrders(); // N번
}

// 해결: JOIN FETCH 사용
@Query("SELECT u FROM User u JOIN FETCH u.orders")
List<User> findAllWithOrders();
```

### 시나리오 3: 데드락 발생
```sql
-- Transaction A
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- Transaction B (동시 실행)
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 2;
UPDATE accounts SET balance = balance + 50 WHERE id = 1;
COMMIT;

-- 결과: Deadlock!
-- 해결: 일관된 순서로 락 획득 (id 오름차순)
```

## 📈 학습 진행도 체크리스트

### Week 1: Fundamentals
- [ ] ACID 각 속성을 예제로 설명할 수 있다
- [ ] 정규화 1NF~BCNF를 구분할 수 있다
- [ ] 트랜잭션 BEGIN, COMMIT, ROLLBACK을 사용할 수 있다
- [ ] 인덱스가 쿼리 성능에 미치는 영향을 이해한다
- [ ] EXPLAIN을 사용해 실행 계획을 분석할 수 있다

### Week 2: Deep Dive
- [ ] B+Tree 구조를 그림으로 그릴 수 있다
- [ ] MVCC 동작 원리를 설명할 수 있다
- [ ] 트랜잭션 격리 수준별 발생 가능한 문제를 나열할 수 있다
- [ ] WAL의 역할을 설명할 수 있다
- [ ] 쿼리 옵티마이저가 실행 계획을 선택하는 과정을 이해한다
- [ ] Row-level lock vs Table-level lock 차이를 설명할 수 있다

### Week 3: Practice
- [ ] 간단한 Key-Value 스토리지를 구현했다
- [ ] SQL 파서의 기본 동작을 이해한다
- [ ] 실제 프로젝트에서 N+1 문제를 해결했다
- [ ] PostgreSQL 또는 MySQL 소스코드 일부를 읽어봤다
- [ ] 실무 장애 회고록 5개 이상을 분석했다

## 🎓 추천 학습 흐름

```
Day 1-2: ACID와 트랜잭션 기초
   ↓
Day 3-4: 인덱스 기초와 EXPLAIN
   ↓
Day 5-7: B+Tree 구조 깊이 이해
   ↓
Day 8-10: MVCC와 격리 수준
   ↓
Day 11-13: 쿼리 최적화 실습
   ↓
Day 14-16: WAL과 복구 메커니즘
   ↓
Day 17-19: 복제와 샤딩
   ↓
Day 20-21: 실습 프로젝트 (KV Store)
```

## 🔗 다음 단계

Database 학습이 어느 정도 완료되면:
1. [Network 학습](../02-Network/README.md)으로 이동
2. 또는 Database를 더 깊이 파기 (PostgreSQL 소스코드 읽기)
3. 실제 프로젝트에 적용해보기

## 💬 학습 팁

### 1. 실제 DB로 실험하기
- Docker로 PostgreSQL/MySQL 띄우기
- 대용량 데이터 생성 (100만 건 이상)
- 인덱스 있을 때 vs 없을 때 성능 비교

### 2. 소스코드 읽기
- PostgreSQL: `src/backend/storage/`
- MySQL: `storage/innobase/`
- SQLite: 전체 (작아서 읽기 좋음)

### 3. 장애 회고록 분석
- "왜 이런 장애가 발생했을까?"
- "어떻게 감지했을까?"
- "어떻게 해결했을까?"
- "재발 방지책은?"

---

**"데이터베이스를 깊이 이해하면, 다른 분산 시스템도 쉽게 이해할 수 있다"**
