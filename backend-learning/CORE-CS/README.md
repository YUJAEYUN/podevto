# 코어 CS 지식 - T자형 인재의 깊이 파기

> "기초가 탄탄해야 새로운 기술도 빠르게 습득할 수 있다"

## 📚 학습 철학

### T자형 인재 전략
- **넓이보다 깊이부터**: 하나의 영역을 압도적으로 깊게 파면, 그 깊이가 자연스럽게 주변 영역과의 맥락을 형성
- **"왜?"를 3번 물어보기**: 표면적인 지식이 아닌 본질적인 이해
- **실전 연결**: RFC, 오픈소스 코드, 장애 회고록을 통한 실무 맥락 학습

## 🎯 학습 비중 (코어 CS 40%)

```
1. Database        (40%) - 가장 먼저 깊이 파기 추천
2. Network         (30%) - 백엔드 필수 지식
3. Operating System(20%) - 시스템 이해의 기반
4. DS & Algorithms (10%) - 코딩테스트 + 사고력
```

## 📂 폴더 구조

```
CORE-CS/
├── 01-Database/
│   ├── fundamentals/     # 기초 개념
│   ├── deep-dive/        # 깊이 파기
│   ├── practice/         # 실습 프로젝트
│   └── resources/        # RFC, 장애 회고록, 오픈소스
│
├── 02-Network/
│   ├── fundamentals/
│   ├── deep-dive/
│   ├── practice/
│   └── resources/
│
├── 03-Operating-System/
│   ├── fundamentals/
│   ├── deep-dive/
│   ├── practice/
│   └── resources/
│
└── 04-Data-Structures-Algorithms/
    ├── fundamentals/
    ├── deep-dive/
    ├── practice/
    └── resources/
```

## 🗓️ 추천 학습 로드맵

### Phase 1: Database 집중 (3주)
- **Week 1**: Fundamentals (ACID, 정규화, 트랜잭션)
- **Week 2**: Deep Dive (B+Tree, MVCC, WAL)
- **Week 3**: Practice (Key-Value Store 구현)

### Phase 2: Network 집중 (3주)
- **Week 4**: Fundamentals (TCP/IP, HTTP)
- **Week 5**: Deep Dive (패킷 분석, 프로토콜 내부)
- **Week 6**: Practice (HTTP 서버 구현)

### Phase 3: OS 집중 (2주)
- **Week 7**: Fundamentals (프로세스, 메모리)
- **Week 8**: Deep Dive + Practice (쉘 구현)

### Phase 4: 알고리즘 (지속적)
- 주 3회 꾸준히 (백준, 프로그래머스)

## 📖 학습 사이클

각 주제마다 다음 사이클을 반복:

```
1. 개념 학습 (이론서, 강의)
   ↓
2. 손으로 구현 (코드로 직접 짜보기)
   ↓
3. 실전 연결 (장애 회고록, RFC)
   ↓
4. 정리 및 공유 (문서화, 블로그)
```

## 💡 효과적인 학습 팁

### 1. DFS(깊이 우선 탐색) 학습
```
❌ 넓고 얕게: DB, 네트워크, OS 모두 개념만 훑기
✅ 좁고 깊게: DB부터 2주간 집중 → 인덱스 내부구조까지 파기
```

### 2. "왜?"를 3번 물어보기
```
Q1: MySQL은 왜 B+Tree를 쓰나?
A1: 범위 검색이 빠르고 디스크 I/O를 줄일 수 있어서

Q2: 왜 B-Tree가 아니라 B+Tree인가?
A2: 리프 노드가 연결리스트로 연결되어 있어서 순차 접근이 빠름

Q3: 왜 리프 노드만 데이터를 가지고 있나?
A3: 내부 노드는 키만 저장하여 더 많은 키를 메모리에 올릴 수 있음
```

### 3. 오픈소스 코드 읽기
- PostgreSQL storage engine
- Linux kernel 일부
- Redis 자료구조 구현

### 4. 장애 회고록 분석
- 카카오/네이버 DB 장애 사례
- AWS/GCP 네트워크 장애
- 메모리 누수 디버깅 사례

## 🎓 각 영역별 가이드

- [01. Database - 가장 먼저 깊이 파기](./01-Database/README.md)
- [02. Network - 백엔드 필수 지식](./02-Network/README.md)
- [03. Operating System - 시스템의 기반](./03-Operating-System/README.md)
- [04. Data Structures & Algorithms - 사고력의 기초](./04-Data-Structures-Algorithms/README.md)

## 📊 학습 진척도 체크리스트

### Database
- [ ] ACID 속성을 코드로 설명할 수 있다
- [ ] B+Tree 구조를 그림으로 그릴 수 있다
- [ ] MVCC 동작 원리를 설명할 수 있다
- [ ] N+1 쿼리 문제를 해결할 수 있다
- [ ] 트랜잭션 격리 수준의 트레이드오프를 설명할 수 있다

### Network
- [ ] 3-Way Handshake를 그림으로 그릴 수 있다
- [ ] HTTP/1.1과 HTTP/2의 차이를 설명할 수 있다
- [ ] TCP 흐름 제어/혼잡 제어를 설명할 수 있다
- [ ] HTTPS 인증서 동작 원리를 설명할 수 있다
- [ ] L4와 L7 로드밸런서의 차이를 설명할 수 있다

### Operating System
- [ ] 프로세스와 쓰레드의 차이를 설명할 수 있다
- [ ] 가상 메모리와 페이징을 설명할 수 있다
- [ ] 데드락 발생 조건과 해결 방법을 설명할 수 있다
- [ ] 컨텍스트 스위칭 비용을 이해하고 있다
- [ ] I/O 모델(Blocking/Non-blocking)을 설명할 수 있다

### Data Structures & Algorithms
- [ ] Big-O 표기법을 직관적으로 이해하고 있다
- [ ] 해시테이블 충돌 해결 방법을 구현할 수 있다
- [ ] 이진 탐색 트리를 구현할 수 있다
- [ ] BFS/DFS를 활용한 문제를 풀 수 있다
- [ ] 동적 프로그래밍 문제를 접근할 수 있다

---

## 🚀 시작하기

1. **Database부터 시작 추천**: 백엔드 개발자에게 가장 중요한 영역
2. **3주 집중**: 하나의 영역을 3주간 집중적으로 학습
3. **매일 기록**: 학습한 내용을 문서화하고 learnlog-mcp에 저장
4. **실습 프로젝트**: 이론만으로는 부족, 반드시 구현해보기

**"화려한 기술 스택보다는 탄탄한 기초와 문제 해결 능력"**
