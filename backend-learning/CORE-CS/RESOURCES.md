# 학습 리소스 모음

> "좋은 자료는 학습 속도를 10배 빠르게 한다"

## 📚 추천 도서

### Database

#### 1. Database Internals (Alex Petrov)
**난이도**: ⭐⭐⭐⭐☆
**추천 이유**: 데이터베이스가 실제로 어떻게 구현되는지 깊이 다룸
```
주요 내용:
- B-Tree 구조 상세
- LSM-Tree
- MVCC 구현
- 복제와 일관성
```

#### 2. Designing Data-Intensive Applications (Martin Kleppmann)
**난이도**: ⭐⭐⭐⭐☆
**추천 이유**: 분산 시스템과 데이터베이스의 트레이드오프
```
주요 내용:
- 복제 (Replication)
- 파티셔닝 (Partitioning)
- 트랜잭션
- 분산 시스템의 문제들
```

#### 3. High Performance MySQL (Baron Schwartz)
**난이도**: ⭐⭐⭐☆☆
**추천 이유**: MySQL 실무 최적화
```
주요 내용:
- InnoDB 아키텍처
- 인덱스 최적화
- 쿼리 최적화
- 복제 설정
```

---

### Network

#### 1. TCP/IP Illustrated, Volume 1 (Richard Stevens)
**난이도**: ⭐⭐⭐⭐☆
**추천 이유**: TCP/IP의 바이블
```
주요 내용:
- 패킷 구조 상세
- TCP 내부 동작
- 라우팅 프로토콜
```

#### 2. Computer Networking: A Top-Down Approach (Kurose & Ross)
**난이도**: ⭐⭐⭐☆☆
**추천 이유**: 네트워크 교과서, 실습 포함
```
주요 내용:
- 애플리케이션 계층
- 전송 계층 (TCP/UDP)
- 네트워크 계층
- Wireshark 실습
```

---

### Operating System

#### 1. Operating System Concepts (Silberschatz) - 공룡책
**난이도**: ⭐⭐⭐☆☆
**추천 이유**: OS 교과서 표준
```
주요 내용:
- 프로세스 관리
- 메모리 관리
- 파일 시스템
- 동기화
```

#### 2. Modern Operating Systems (Tanenbaum)
**난이도**: ⭐⭐⭐⭐☆
**추천 이유**: 더 깊이 있는 내용
```
주요 내용:
- UNIX/Linux 내부
- 분산 시스템
- 보안
```

#### 3. The Linux Programming Interface (Kerrisk)
**난이도**: ⭐⭐⭐⭐☆
**추천 이유**: 리눅스 시스템 프로그래밍 레퍼런스
```
주요 내용:
- 시스템 콜 상세
- 프로세스, 쓰레드
- IPC
- 네트워크 프로그래밍
```

---

### 알고리즘

#### 1. Cracking the Coding Interview (Gayle McDowell)
**난이도**: ⭐⭐⭐☆☆
**추천 이유**: 코딩 면접 준비 필수
```
주요 내용:
- 자료구조 정리
- 알고리즘 패턴
- 189개 면접 문제
```

#### 2. Introduction to Algorithms (CLRS)
**난이도**: ⭐⭐⭐⭐⭐
**추천 이유**: 알고리즘 교과서 (대학원 수준)
```
주요 내용:
- 정렬, 탐색
- 그래프 알고리즘
- 동적 프로그래밍
- NP 문제
```

---

## 🌐 온라인 강의

### Database

#### 1. CMU 15-445: Database Systems
**링크**: https://15445.courses.cs.cmu.edu
**난이도**: ⭐⭐⭐⭐☆
**추천 이유**: 최고의 DB 강의
```
- Andy Pavlo 교수
- 스토리지, 인덱스, 쿼리 최적화
- 실습 프로젝트 포함
```

#### 2. Stanford CS145: Data Management
**링크**: https://cs145-fa19.github.io
**난이도**: ⭐⭐⭐☆☆
```
- SQL, 관계형 모델
- 트랜잭션
- NoSQL
```

---

### Network

#### 1. Stanford CS144: Introduction to Computer Networking
**링크**: https://cs144.github.io
**난이도**: ⭐⭐⭐☆☆
**추천 이유**: TCP/IP 스택 직접 구현
```
- 프로젝트: TCP 구현
- 라우터 구현
```

---

### Operating System

#### 1. MIT 6.S081: Operating System Engineering
**링크**: https://pdos.csail.mit.edu/6.S081/
**난이도**: ⭐⭐⭐⭐☆
**추천 이유**: xv6 커널 구현
```
- xv6 운영체제 (교육용)
- 시스템 콜 추가
- 파일 시스템 구현
```

#### 2. KOCW 이화여대 반효경 교수 운영체제
**링크**: http://www.kocw.net/home/search/kemView.do?kemId=1046323
**난이도**: ⭐⭐⭐☆☆
**추천 이유**: 한국어, 명강의
```
- 프로세스, 메모리
- 동기화
- 가상 메모리
```

---

## 📝 RFC 문서 (필독)

### Network

#### RFC 793 - TCP
**중요도**: ⭐⭐⭐⭐⭐
```
- TCP 프로토콜 정의
- 3-Way Handshake
- 흐름 제어, 혼잡 제어
```

#### RFC 2616 - HTTP/1.1
**중요도**: ⭐⭐⭐⭐⭐
```
- HTTP 메서드
- 상태 코드
- 헤더
```

#### RFC 7540 - HTTP/2
**중요도**: ⭐⭐⭐⭐☆
```
- 멀티플렉싱
- 서버 푸시
- 헤더 압축
```

#### RFC 9000 - QUIC
**중요도**: ⭐⭐⭐☆☆
```
- UDP 기반 전송 프로토콜
- HTTP/3의 기반
```

---

## 🔍 오픈소스 코드 읽기

### Database

#### 1. PostgreSQL
**추천 경로**: `src/backend/storage/`
**난이도**: ⭐⭐⭐⭐☆
```
주요 파일:
- src/backend/storage/buffer/bufmgr.c (버퍼 관리)
- src/backend/storage/page/bufpage.c (페이지 관리)
- src/backend/access/nbtree/ (B+Tree 구현)
```

#### 2. SQLite
**추천 이유**: 단일 파일, 코드가 깔끔
**난이도**: ⭐⭐⭐☆☆
```
주요 파일:
- btree.c (B+Tree)
- vdbe.c (가상 머신)
- pager.c (페이저)
```

#### 3. Redis
**추천 경로**: `src/`
**난이도**: ⭐⭐☆☆☆
```
주요 파일:
- dict.c (HashMap)
- adlist.c (Doubly Linked List)
- ziplist.c (압축 리스트)
- t_zset.c (Sorted Set - Skip List)
```

---

### Network

#### 1. nginx
**추천 경로**: `src/core/`, `src/http/`
**난이도**: ⭐⭐⭐⭐☆
```
주요 파일:
- ngx_connection.c (연결 관리)
- ngx_http_request.c (HTTP 요청 처리)
- ngx_event.c (이벤트 루프)
```

---

### Operating System

#### 1. xv6 (MIT)
**추천 이유**: 교육용 유닉스 계열 OS, 코드가 짧고 명확
**난이도**: ⭐⭐⭐☆☆
```
주요 파일:
- proc.c (프로세스 관리)
- vm.c (가상 메모리)
- fs.c (파일 시스템)
- syscall.c (시스템 콜)

전체 코드: ~10,000줄
```

#### 2. Linux Kernel (일부만)
**추천 경로**: `kernel/`, `mm/`, `fs/`
**난이도**: ⭐⭐⭐⭐⭐
```
주요 파일:
- kernel/sched/core.c (스케줄러)
- mm/page_alloc.c (페이지 할당)
- fs/ext4/ (파일 시스템)
```

---

## 💥 장애 회고록 (Post-Mortems)

### Database 장애

#### 1. 카카오 데이터센터 장애 (2022.10)
**링크**: https://tech.kakao.com/2022/11/07/22-데이터센터-장애
**배우는 것**:
- 단일 장애점 (SPOF)
- 복구 시간 (RTO)
- 백업의 중요성

#### 2. 우아한형제들 DB 복제 지연
**배우는 것**:
- 복제 지연 (Replication Lag)
- Read Replica 문제
- 모니터링 중요성

#### 3. AWS RDS 장애
**배우는 것**:
- 클라우드 의존성
- Multi-AZ 설정
- Failover 메커니즘

---

### Network 장애

#### 1. Facebook BGP 장애 (2021.10)
**링크**: https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/
**배우는 것**:
- BGP 프로토콜
- DNS 의존성
- 물리적 접근 중요성

#### 2. Cloudflare CDN 장애
**배우는 것**:
- 정규표현식 재앙
- CPU 100% 사용
- 배포 프로세스

#### 3. AWS Route53 DNS 장애
**배우는 것**:
- DNS의 중요성
- TTL 설정
- 캐싱 전략

---

### OS/시스템 장애

#### 1. Linux OOM Killer
**배우는 것**:
- 메모리 누수 감지
- OOM Killer 동작 원리
- 메모리 모니터링

#### 2. CPU 100% 버그
**배우는 것**:
- Busy waiting 문제
- strace 사용법
- 프로파일링

---

## 🛠️ 도구 모음

### Database 도구

#### 1. EXPLAIN / EXPLAIN ANALYZE
```sql
-- PostgreSQL
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- MySQL
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
```

#### 2. pg_stat_statements (PostgreSQL)
```sql
-- 느린 쿼리 찾기
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

#### 3. MySQL Slow Query Log
```bash
# my.cnf 설정
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# 분석
mysqldumpslow /var/log/mysql/slow.log
```

---

### Network 도구

#### 1. Wireshark
**용도**: 패킷 캡처 및 분석
```bash
# 설치
brew install wireshark  # macOS
sudo apt install wireshark  # Ubuntu

# CLI 버전 (tshark)
tshark -i eth0 -f "port 80"
```

#### 2. tcpdump
```bash
# HTTP 트래픽 캡처
sudo tcpdump -i any -w capture.pcap port 80

# 특정 IP만
sudo tcpdump -i any host 192.168.1.100

# 결과 읽기
tcpdump -r capture.pcap
```

#### 3. curl
```bash
# 상세 정보
curl -v https://example.com

# 타이밍 정보
curl -w "@curl-format.txt" -o /dev/null -s https://example.com

# curl-format.txt:
time_namelookup:  %{time_namelookup}s\n
time_connect:     %{time_connect}s\n
time_starttransfer: %{time_starttransfer}s\n
time_total:       %{time_total}s\n
```

#### 4. netstat / ss
```bash
# 연결 상태 확인
netstat -tan
ss -tan

# 특정 포트
netstat -tlnp | grep 8080

# 연결 수 카운트
ss -tan | grep ESTABLISHED | wc -l
```

---

### OS 도구

#### 1. strace
```bash
# 시스템 콜 추적
strace -p <pid>

# 시스템 콜 통계
strace -c python script.py

# 특정 시스템 콜만
strace -e open,read python script.py
```

#### 2. top / htop
```bash
# CPU, 메모리 사용률
top
htop  # 더 보기 좋음

# 특정 프로세스만
top -p <pid>
```

#### 3. ps
```bash
# 모든 프로세스
ps aux

# 트리 구조
ps auxf
pstree

# 특정 프로세스
ps aux | grep python
```

#### 4. /proc 파일 시스템
```bash
# 프로세스 정보
cat /proc/<pid>/status
cat /proc/<pid>/maps  # 메모리 맵
cat /proc/<pid>/fd/   # 파일 디스크립터

# 시스템 정보
cat /proc/cpuinfo
cat /proc/meminfo
```

#### 5. lsof
```bash
# 열린 파일 확인
lsof -p <pid>

# 특정 포트 사용 프로세스
lsof -i :8080

# 특정 파일을 사용하는 프로세스
lsof /path/to/file
```

---

## 🎥 유튜브 채널

### 한국어

#### 1. 쉬운코드
**추천 영상**: 데이터베이스, 네트워크 시리즈
**난이도**: ⭐⭐☆☆☆

#### 2. 널널한 개발자
**추천 영상**: 네트워크 기초
**난이도**: ⭐⭐☆☆☆

---

### 영어

#### 1. Hussein Nasser
**추천 영상**: Database internals, Backend Engineering
**난이도**: ⭐⭐⭐☆☆

#### 2. Computerphile
**추천 영상**: CS 기초 개념
**난이도**: ⭐⭐☆☆☆

---

## 📱 블로그 & 웹사이트

### 필독 블로그

#### 1. Cloudflare Blog
**링크**: https://blog.cloudflare.com
**추천 이유**: 네트워크, 보안, 장애 회고록

#### 2. Netflix Tech Blog
**링크**: https://netflixtechblog.com
**추천 이유**: 대규모 시스템 아키텍처

#### 3. 우아한형제들 기술 블로그
**링크**: https://techblog.woowahan.com
**추천 이유**: 한국어, 실무 경험

#### 4. 카카오 기술 블로그
**링크**: https://tech.kakao.com
**추천 이유**: 대규모 시스템, 장애 대응

---

### 시각화 도구

#### 1. visualgo.net
**용도**: 알고리즘 애니메이션
**추천**: 정렬, 트리, 그래프

#### 2. algorithm-visualizer.org
**용도**: 알고리즘 시각화

---

## 🎯 학습 순서 추천

```
1단계: 교과서로 기초 다지기
   - Database: Database Internals
   - Network: Computer Networking
   - OS: Operating System Concepts

2단계: 온라인 강의로 심화
   - CMU 15-445 (Database)
   - Stanford CS144 (Network)
   - MIT 6.S081 (OS)

3단계: 오픈소스 코드 읽기
   - PostgreSQL, Redis
   - nginx
   - xv6

4단계: 장애 회고록 분석
   - 10개 이상 읽고 정리

5단계: 실습 프로젝트
   - Key-Value Store
   - HTTP Server
   - Thread Pool
```

---

**"좋은 자료를 선택하는 것도 실력이다"**
