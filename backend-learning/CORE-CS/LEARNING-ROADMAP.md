# 코어 CS 학습 로드맵 (3개월)

> "T자형 인재의 깊이를 만드는 12주 여정"

## 🎯 전체 목표

3개월 동안 **Database를 중심으로 깊이 파고**, 나머지 영역들을 연결하여 **코어 CS 지식의 완성**

## 📅 주차별 계획

### Month 1: Database + 자료구조 (4주)

#### Week 1: Database Fundamentals
**목표**: ACID, 트랜잭션, 인덱스 기초 완벽 이해

```
월: ACID Properties 학습 + 실습
화: Normalization (정규화) 학습
수: Transaction Basics + 코딩테스트 1문제
목: Index Basics + EXPLAIN 실습
금: SQL Fundamentals + 코딩테스트 1문제
토: 주간 복습 + 정리
일: 코딩테스트 1문제 + 자유 학습
```

**학습 자료**:
- [01-ACID-Properties.md](./01-Database/fundamentals/01-ACID-Properties.md)
- [02-Normalization.md](./01-Database/fundamentals/02-Normalization.md)
- [03-Transaction-Basics.md](./01-Database/fundamentals/03-Transaction-Basics.md)
- [04-Index-Basics.md](./01-Database/fundamentals/04-Index-Basics.md)

**실습**:
```sql
-- Docker로 PostgreSQL 실행
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres

-- 트랜잭션 실습
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- 인덱스 성능 비교
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
CREATE INDEX idx_email ON users(email);
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

**체크포인트**:
- [ ] ACID를 예제 없이 설명할 수 있다
- [ ] 트랜잭션 격리 수준을 이해한다
- [ ] EXPLAIN으로 실행 계획을 분석할 수 있다

---

#### Week 2: Database Deep Dive (T자의 깊이)
**목표**: B+Tree, MVCC 등 내부 동작 원리 이해

```
월: B+Tree 구조 학습 (그림 그리기)
화: B+Tree 코드로 구현 시작
수: MVCC 학습 + 코딩테스트
목: Transaction Isolation Levels 깊이 파기
금: WAL과 Recovery + 코딩테스트
토: B+Tree 구현 완성
일: 주간 복습 + PostgreSQL 소스코드 읽기
```

**학습 자료**:
- [01-BTree-BPlusTree.md](./01-Database/deep-dive/01-BTree-BPlusTree.md)
- [02-MVCC.md](./01-Database/deep-dive/02-MVCC.md)
- [03-Transaction-Isolation.md](./01-Database/deep-dive/03-Transaction-Isolation.md)
- [04-WAL-and-Recovery.md](./01-Database/deep-dive/04-WAL-and-Recovery.md)

**실습**:
```python
# B+Tree 간단 구현
class BPlusTreeNode:
    def __init__(self, order):
        self.order = order
        self.keys = []
        self.children = []
        self.is_leaf = True
        self.next = None

# PostgreSQL 소스코드 읽기
# src/backend/storage/page/bufpage.c
# src/backend/access/nbtree/
```

**체크포인트**:
- [ ] B+Tree를 그림으로 그릴 수 있다
- [ ] MVCC 동작 원리를 설명할 수 있다
- [ ] Dirty Read, Non-Repeatable Read, Phantom Read를 구분할 수 있다

---

#### Week 3: Database Practice + 자료구조
**목표**: 실습 프로젝트 + 자료구조 기초

```
월: Simple Key-Value Store 설계
화: Key-Value Store 구현 (1)
수: Key-Value Store 구현 (2) + 코딩테스트
목: 자료구조: 배열/연결리스트/스택/큐
금: 자료구조: 해시테이블 + 코딩테스트
토: Key-Value Store 완성 + 테스트
일: 자료구조: 트리 기초 + 코딩테스트
```

**실습**:
```python
# Key-Value Store with LSM-Tree
class SimpleKV:
    def __init__(self):
        self.memtable = {}  # In-memory
        self.sstables = []  # On-disk

    def put(self, key, value):
        self.memtable[key] = value
        if len(self.memtable) > 1000:
            self.flush_to_disk()

    def get(self, key):
        # 1. Check memtable
        if key in self.memtable:
            return self.memtable[key]
        # 2. Check sstables
        for sstable in reversed(self.sstables):
            if key in sstable:
                return sstable[key]
        return None
```

**체크포인트**:
- [ ] Key-Value Store를 구현했다
- [ ] LSM-Tree의 개념을 이해한다
- [ ] 기본 자료구조의 시간복잡도를 안다

---

#### Week 4: Database 종합 + 알고리즘
**목표**: Database 학습 정리 + 알고리즘 시작

```
월: Query Optimizer 학습
화: Locking Mechanisms 학습
수: N+1 쿼리 문제 해결 + 코딩테스트
목: 정렬 알고리즘 (Quick, Merge, Heap)
금: 이진 탐색 + 코딩테스트
토: Database 장애 회고록 3개 분석
일: Database 학습 정리 문서 작성 + 코딩테스트
```

**장애 회고록 읽기**:
- 카카오 DB 장애 사례
- 우아한형제들 DB 복제 지연 사례
- AWS RDS 장애 분석

**체크포인트**:
- [ ] 쿼리 실행 계획을 분석할 수 있다
- [ ] N+1 문제를 해결할 수 있다
- [ ] 정렬 알고리즘을 비교할 수 있다

---

### Month 2: Network + OS (4주)

#### Week 5: Network Fundamentals
**목표**: TCP/IP, HTTP 기초 완벽 이해

```
월: OSI 7계층, TCP/IP 4계층
화: IP 주소, 라우팅 기초
수: TCP 기초 + 코딩테스트
목: UDP와 사용 사례
금: HTTP 기초 (메서드, 상태 코드) + 코딩테스트
토: Wireshark로 패킷 캡처 실습
일: curl로 HTTP 분석 + 코딩테스트
```

**실습**:
```bash
# Wireshark 패킷 캡처
sudo tcpdump -i any -w capture.pcap port 80
wireshark capture.pcap

# curl 상세 분석
curl -v https://example.com
curl -w "@curl-format.txt" https://example.com
```

**체크포인트**:
- [ ] OSI 7계층을 그림으로 그릴 수 있다
- [ ] TCP와 UDP의 차이를 설명할 수 있다
- [ ] HTTP 메서드의 의미를 이해한다

---

#### Week 6: Network Deep Dive
**목표**: TCP 내부 동작 원리 깊이 파기

```
월: 3-Way Handshake (그림 그리기)
화: TCP 흐름 제어 (슬라이딩 윈도우)
수: TCP 혼잡 제어 + 코딩테스트
목: HTTP/1.1 vs HTTP/2 vs HTTP/3
금: HTTPS, TLS/SSL + 코딩테스트
토: HTTP 서버 직접 구현 (1)
일: HTTP 서버 구현 (2) + 코딩테스트
```

**실습**:
```python
# 간단한 HTTP 서버 (소켓 프로그래밍)
import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind(('0.0.0.0', 8080))
server_socket.listen(5)

while True:
    client_socket, addr = server_socket.accept()
    request = client_socket.recv(1024).decode()

    # HTTP 응답 작성
    response = "HTTP/1.1 200 OK\r\n"
    response += "Content-Type: text/html\r\n"
    response += "\r\n"
    response += "<h1>Hello, World!</h1>"

    client_socket.send(response.encode())
    client_socket.close()
```

**체크포인트**:
- [ ] 3-Way Handshake를 그릴 수 있다
- [ ] HTTP/2의 멀티플렉싱을 이해한다
- [ ] HTTPS 인증서 동작을 설명할 수 있다

---

#### Week 7: OS Fundamentals
**목표**: 프로세스, 메모리 기초

```
월: 프로세스 vs 쓰레드
화: 메모리 구조 (스택, 힙, 데이터, 코드)
수: CPU 스케줄링 알고리즘 + 코딩테스트
목: 동기화 기법 (Mutex, Semaphore)
금: 데드락 발생과 해결 + 코딩테스트
토: 멀티쓰레드 프로그램 실습
일: strace로 시스템 콜 추적 + 코딩테스트
```

**실습**:
```bash
# 프로세스 확인
ps aux | grep python
pstree

# 시스템 콜 추적
strace -c python script.py
strace -p <pid>

# 멀티쓰레드 실습
# pthread를 사용한 생산자-소비자 문제
```

**체크포인트**:
- [ ] 프로세스와 쓰레드의 메모리 구조를 그릴 수 있다
- [ ] 데드락 발생 조건 4가지를 안다
- [ ] Mutex와 Semaphore의 차이를 설명할 수 있다

---

#### Week 8: OS Deep Dive + Network Practice
**목표**: 가상 메모리, I/O 모델 이해

```
월: 컨텍스트 스위칭 비용
화: 가상 메모리, 페이징
수: 페이지 교체 알고리즘 + 코딩테스트
목: I/O 모델 (Blocking, Non-blocking, Async)
금: DNS 동작 원리 + 코딩테스트
토: 간단한 쉘 프로그램 구현
일: 로드밸런서 학습 + 코딩테스트
```

**실습**:
```c
// 간단한 쉘 구현
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    char command[100];
    while (1) {
        printf("myshell> ");
        fgets(command, 100, stdin);

        pid_t pid = fork();
        if (pid == 0) {
            // 자식 프로세스: 명령 실행
            execlp(command, command, NULL);
        } else {
            // 부모 프로세스: 대기
            wait(NULL);
        }
    }
}
```

**체크포인트**:
- [ ] 가상 메모리를 그림으로 설명할 수 있다
- [ ] I/O 모델 4가지를 구분할 수 있다
- [ ] fork()와 exec()의 차이를 안다

---

### Month 3: 통합 및 실전 (4주)

#### Week 9: 알고리즘 집중
**목표**: 그래프, 동적 프로그래밍

```
월: BFS/DFS 알고리즘
화: Dijkstra, Bellman-Ford
수: 동적 프로그래밍 기초 + 코딩테스트
목: DP 패턴 (Memoization, Tabulation)
금: 그리디 알고리즘 + 코딩테스트
토: LeetCode Medium 3문제 도전
일: 주간 복습 + 코딩테스트
```

**체크포인트**:
- [ ] BFS로 최단 경로를 찾을 수 있다
- [ ] DP 문제를 접근할 수 있다
- [ ] LeetCode Medium을 풀 수 있다

---

#### Week 10: 실무 프로젝트
**목표**: 배운 내용을 실제 프로젝트에 적용

```
월: 프로젝트 주제 선정 (LRU 캐시, Rate Limiter 등)
화: 프로젝트 설계 (자료구조 선택)
수: 프로젝트 구현 (1) + 코딩테스트
목: 프로젝트 구현 (2)
금: 프로젝트 구현 (3) + 코딩테스트
토: 프로젝트 완성 + 테스트
일: 프로젝트 문서화 + 코딩테스트
```

**프로젝트 아이디어**:
1. **LRU 캐시 라이브러리** (HashMap + Doubly Linked List)
2. **Rate Limiter** (Token Bucket, Sliding Window)
3. **간단한 HTTP 로드밸런서** (Round Robin, Least Connection)
4. **Mini Redis** (String, List, Hash, Set 구현)

**체크포인트**:
- [ ] 실무에 사용 가능한 프로젝트를 완성했다
- [ ] 자료구조 선택 이유를 설명할 수 있다
- [ ] 시간/공간 복잡도를 분석했다

---

#### Week 11: 장애 회고록 및 RFC 분석
**목표**: 실전 경험 간접 학습

```
월: DB 장애 회고록 5개 분석
화: 네트워크 장애 회고록 5개 분석
수: RFC 읽기 (TCP, HTTP) + 코딩테스트
목: 오픈소스 코드 읽기 (PostgreSQL)
금: 오픈소스 코드 읽기 (Redis) + 코딩테스트
토: 학습 정리 및 블로그 작성
일: 코딩테스트 + 자유 학습
```

**장애 회고록 목록**:
- 카카오 데이터센터 장애
- 네이버 DB 장애
- Facebook BGP 장애 (2021)
- Cloudflare CDN 장애
- AWS Route53 장애

**체크포인트**:
- [ ] 10개 이상의 장애 회고록을 분석했다
- [ ] RFC 문서를 읽고 이해했다
- [ ] 오픈소스 코드를 읽을 수 있다

---

#### Week 12: 종합 정리 및 면접 준비
**목표**: 배운 내용 정리 + 면접 대비

```
월: Database 핵심 개념 정리
화: Network 핵심 개념 정리
수: OS 핵심 개념 정리 + 코딩테스트
목: 알고리즘 핵심 패턴 정리
금: 모의 면접 (기술 질문) + 코딩테스트
토: 포트폴리오 정리
일: 전체 복습 + 코딩테스트
```

**면접 준비 질문**:
```
Database:
- ACID를 설명하고, 각 속성이 깨지면 어떤 문제가 발생하나?
- B+Tree를 사용하는 이유는?
- MVCC는 어떻게 동작하나?
- N+1 쿼리 문제를 해결한 경험은?

Network:
- 3-Way Handshake를 설명해주세요
- HTTP/1.1과 HTTP/2의 차이는?
- HTTPS는 어떻게 보안을 보장하나?
- TCP 흐름 제어와 혼잡 제어의 차이는?

OS:
- 프로세스와 쓰레드의 차이는?
- 가상 메모리를 사용하는 이유는?
- 데드락을 어떻게 해결할 수 있나?
- Blocking I/O와 Non-blocking I/O의 차이는?

알고리즘:
- HashMap의 시간복잡도가 O(1)인 이유는?
- Quick Sort와 Merge Sort의 차이는?
- 동적 프로그래밍은 언제 사용하나?
```

**체크포인트**:
- [ ] 핵심 개념을 예제 없이 설명할 수 있다
- [ ] 실무 경험을 기술 용어로 설명할 수 있다
- [ ] 코딩테스트를 안정적으로 통과할 수 있다

---

## 📊 주간 루틴

### 매일 (월~일)
```
기본 루틴:
- 전날 학습 내용 10분 복습
- 새로운 내용 학습 (1~2시간)
- 실습/코드 작성 (1시간)
- learnlog-mcp에 학습 기록

코딩테스트 (주 3회: 수, 금, 일):
- 백준/프로그래머스/LeetCode 각 1문제
- 풀이 시간: 30분~1시간
- 못 풀어도 30분 고민 후 해설 확인
```

### 주말
```
토요일:
- 주간 실습 프로젝트 완성
- 오픈소스 코드 읽기
- 장애 회고록 분석

일요일:
- 주간 학습 정리 및 문서화
- 다음 주 계획 수립
- 코딩테스트 복습
```

## 🎯 3개월 후 목표 체크리스트

### Database (T자의 깊이)
- [ ] B+Tree를 코드로 구현할 수 있다
- [ ] MVCC 동작 원리를 그림으로 설명할 수 있다
- [ ] PostgreSQL 소스코드 일부를 읽을 수 있다
- [ ] 쿼리 최적화를 실전에서 할 수 있다
- [ ] 10개 이상의 DB 장애 회고록을 분석했다

### Network
- [ ] 3-Way Handshake를 패킷 레벨에서 설명할 수 있다
- [ ] HTTP 서버를 소켓 프로그래밍으로 구현했다
- [ ] Wireshark로 패킷을 분석할 수 있다
- [ ] HTTP/1.1, HTTP/2, HTTP/3의 차이를 설명할 수 있다

### OS
- [ ] 프로세스와 쓰레드의 메모리 구조를 그릴 수 있다
- [ ] 가상 메모리와 페이징을 설명할 수 있다
- [ ] 멀티쓰레드 프로그램을 작성할 수 있다
- [ ] strace로 시스템 콜을 분석할 수 있다

### 알고리즘
- [ ] LeetCode Medium을 안정적으로 풀 수 있다
- [ ] 기본 자료구조를 직접 구현할 수 있다
- [ ] 실무 문제에 적절한 자료구조를 선택할 수 있다
- [ ] 주 3회 코딩테스트를 3개월 지속했다

## 💡 학습 팁

### 1. DFS(깊이 우선 탐색) 학습
```
❌ 잘못된 방법:
Week 1: DB 기초 → Network 기초 → OS 기초 → 알고리즘 기초
(모두 얕게만 학습)

✅ 올바른 방법:
Week 1-4: Database 집중 (깊이 파기)
Week 5-8: Network + OS (연결)
Week 9-12: 통합 및 실전
```

### 2. "왜?"를 3번 물어보기
```
예: B+Tree 학습 시

Q1: 왜 B+Tree를 쓰는가?
A1: 범위 검색이 빠르고 디스크 I/O를 줄일 수 있어서

Q2: 왜 디스크 I/O를 줄일 수 있는가?
A2: 높이가 낮고, 한 노드에 많은 키를 저장할 수 있어서

Q3: 왜 높이가 낮은가?
A3: 각 노드가 여러 자식을 가지는 다진 트리이기 때문
```

### 3. 실습 → 이론 → 실습 사이클
```
1. 간단한 예제로 시작 (실습)
2. 동작 원리 학습 (이론)
3. 직접 구현 (실습)
4. 오픈소스 코드 읽기 (실전)
```

### 4. 학습 기록 (learnlog-mcp 활용)
```
매일:
- 오늘 배운 핵심 개념 3가지
- 이해 안 되는 부분
- 내일 학습 계획

주말:
- 이번 주 요약
- 어려웠던 점
- 다음 주 목표
```

## 🚀 시작하기

1. **Day 1부터 시작**: [Database Week 1](./01-Database/fundamentals/01-ACID-Properties.md)
2. **learnlog-mcp 준비**: 학습 기록 시작
3. **Docker 설치**: PostgreSQL, MySQL 실습 환경
4. **코딩테스트 계정**: 백준, 프로그래머스, LeetCode

---

**"3개월 후, 당신은 코어 CS 지식으로 무장한 T자형 개발자가 되어 있을 것입니다"**
