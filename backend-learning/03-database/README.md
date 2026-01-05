# 03. 데이터베이스 (Databases)

> 백엔드 개발자가 반드시 알아야 할 데이터베이스 기초부터 고급 개념까지

## 📚 학습 목표

- 관계형 데이터베이스(RDBMS)와 NoSQL의 차이점 이해
- SQL 쿼리 작성 및 최적화
- 데이터베이스 설계 원칙 (정규화, 인덱싱)
- ACID 속성과 트랜잭션 관리
- ORM 사용법과 안티패턴 이해
- 데이터베이스 확장(스케일링) 전략

---

## 📖 학습 내용

### 1. 데이터베이스 기초
- [데이터베이스 개념](notes/database-fundamentals.md)
- [관계형 vs NoSQL](notes/relational-vs-nosql.md)
- [SQL 기초](notes/sql-basics.md)

### 2. 관계형 데이터베이스 (RDBMS)
- [PostgreSQL 완벽 가이드](notes/postgresql-guide.md)
- [MySQL/MariaDB](notes/mysql-guide.md)
- [데이터 모델링](notes/data-modeling.md)
- [정규화](notes/normalization.md)

### 3. NoSQL 데이터베이스
- [MongoDB (Document DB)](notes/mongodb-guide.md)
- [Redis (Key-Value)](notes/redis-guide.md)
- [NoSQL 선택 가이드](notes/nosql-selection.md)

### 4. 핵심 개념
- [ACID 속성](notes/acid-properties.md)
- [트랜잭션](notes/transactions.md)
- [인덱싱](notes/indexing.md)
- [N+1 쿼리 문제](notes/n-plus-1-query-problem.md) ✅

### 5. 성능 최적화
- [쿼리 최적화](notes/query-optimization.md)
- [인덱스 전략](notes/index-strategies.md)
- [데이터베이스 프로파일링](notes/database-profiling.md)

### 6. ORM (Object-Relational Mapping)
- [ORM 개념과 장단점](notes/orm-fundamentals.md)
- [Prisma 가이드](notes/prisma-guide.md)
- [Sequelize 가이드](notes/sequelize-guide.md)

### 7. 확장성 (Scaling)
- [Replication (복제)](notes/replication.md)
- [Sharding (샤딩)](notes/sharding.md)
- [CAP 정리](notes/cap-theorem.md)

---

## 🎯 학습 순서 (권장)

```
1단계: 기초
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
데이터베이스 개념 → SQL 기초 → PostgreSQL/MySQL
         ↓
2단계: 설계
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
데이터 모델링 → 정규화 → ACID/트랜잭션
         ↓
3단계: 최적화
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
인덱싱 → N+1 문제 → 쿼리 최적화
         ↓
4단계: NoSQL & 확장
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MongoDB/Redis → Replication → Sharding
```

---

## 💻 실습 예제

### [code-examples/](code-examples/)
- SQL 쿼리 예제
- PostgreSQL/MySQL 실습
- ORM 사용 예제 (Prisma, Sequelize)
- MongoDB CRUD 예제
- 인덱싱 성능 비교

---

## 📊 데이터베이스 선택 가이드

### 언제 관계형 DB를 사용하나?

```
✓ 데이터 간 관계가 복잡한 경우
✓ 트랜잭션이 중요한 경우 (금융, 결제)
✓ 데이터 일관성이 최우선인 경우
✓ 복잡한 쿼리와 집계가 필요한 경우

예: 전자상거래, 은행 시스템, ERP
```

### 언제 NoSQL을 사용하나?

```
✓ 대용량 데이터 처리
✓ 빠른 읽기/쓰기가 필요한 경우
✓ 스키마가 자주 변경되는 경우
✓ 수평 확장이 필요한 경우

예: 실시간 분석, 로그, 세션 저장, 캐시
```

### 주요 데이터베이스 비교

| DB | 타입 | 장점 | 단점 | 사용 예시 |
|---|---|---|---|---|
| **PostgreSQL** | RDBMS | 강력한 기능, JSON 지원 | 설정 복잡 | 범용 앱, 분석 |
| **MySQL** | RDBMS | 빠름, 생태계 큼 | 기능 제한적 | 웹 앱, WordPress |
| **MongoDB** | Document | 유연한 스키마 | 트랜잭션 제한 | 콘텐츠 관리, 카탈로그 |
| **Redis** | Key-Value | 매우 빠름 | 메모리 제약 | 캐시, 세션, 실시간 |
| **Cassandra** | Column | 높은 쓰기 성능 | 복잡한 쿼리 어려움 | 로그, 시계열 |

---

## 🛠️ 필수 도구

### GUI 클라이언트
- **DBeaver** - 범용 DB 클라이언트 (무료, 추천!)
- **pgAdmin** - PostgreSQL 전용
- **MySQL Workbench** - MySQL 전용
- **MongoDB Compass** - MongoDB 전용
- **Redis Insight** - Redis 전용

### CLI 도구
```bash
# PostgreSQL
psql -U username -d database

# MySQL
mysql -u username -p database

# MongoDB
mongosh

# Redis
redis-cli
```

### 모니터링
- **pg_stat_statements** - PostgreSQL 쿼리 분석
- **EXPLAIN ANALYZE** - 쿼리 실행 계획
- **Slow Query Log** - 느린 쿼리 추적

---

## 📚 추천 학습 자료

### 공식 문서
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Redis Documentation](https://redis.io/documentation)

### 온라인 강의
- [SQL 기초 - 생활코딩](https://opentutorials.org/course/3884)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [MongoDB University](https://university.mongodb.com/)

### 도서
- 『SQL 첫걸음』 - 아사이 아츠시
- 『Real MySQL』 - 이성욱
- 『MongoDB in Action』
- 『Designing Data-Intensive Applications』 - Martin Kleppmann

### 대화형 학습
- [SQLBolt](https://sqlbolt.com/) - SQL 연습
- [PostgreSQL Exercises](https://pgexercises.com/)
- [MongoDB University](https://learn.mongodb.com/)

---

## ✅ 학습 체크리스트

### 기초
- [ ] SQL SELECT, INSERT, UPDATE, DELETE 작성 가능
- [ ] JOIN (INNER, LEFT, RIGHT) 이해
- [ ] WHERE, GROUP BY, HAVING 사용 가능
- [ ] 집계 함수 (COUNT, SUM, AVG) 활용

### 중급
- [ ] 인덱스를 언제, 어떻게 사용하는지 이해
- [ ] N+1 쿼리 문제 해결 가능
- [ ] 트랜잭션과 ACID 속성 이해
- [ ] 정규화 (1NF~3NF) 개념 파악

### 고급
- [ ] 쿼리 최적화 및 EXPLAIN 분석
- [ ] Replication과 Sharding 차이 이해
- [ ] NoSQL과 RDBMS 트레이드오프 파악
- [ ] ORM 사용과 Raw SQL 선택 기준 이해

---

## 🔗 다음 단계

데이터베이스를 이해했다면 다음 주제로 넘어가세요:
- [04. API 설계](../04-api-design/)
- [05. 캐싱](../05-caching/)
- [07. 인증/인가](../07-authentication/)

---

## 📝 노트

이 섹션의 학습 노트는 [notes/](notes/) 폴더에서 확인할 수 있습니다.

---

*roadmap.sh/backend 기반 학습 자료*
