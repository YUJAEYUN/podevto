# Operating System - 시스템의 기반

> "OS를 이해하면 컴퓨터가 어떻게 돌아가는지 보인다"

## 🎯 학습 목표

- **프로세스와 쓰레드의 차이**를 메모리 구조 레벨에서 이해
- **메모리 관리와 가상 메모리**의 동작 원리 파악
- **동시성 문제를 해결**할 수 있는 능력

## 📊 학습 우선순위

```
1. 프로세스와 쓰레드 (35%)
   - 컨텍스트 스위칭, 동기화

2. 메모리 관리 (35%)
   - 가상 메모리, 페이징, 세그먼테이션

3. 파일 시스템 (20%)
   - inode, 디스크 I/O

4. I/O와 시스템 콜 (10%)
   - Blocking/Non-blocking, Sync/Async
```

## 📂 학습 경로

### Phase 1: Fundamentals (1주차)

- [01-Process-Thread.md](./fundamentals/01-Process-Thread.md) - 프로세스 vs 쓰레드
- [02-Memory-Basics.md](./fundamentals/02-Memory-Basics.md) - 메모리 구조
- [03-CPU-Scheduling.md](./fundamentals/03-CPU-Scheduling.md) - 스케줄링 알고리즘
- [04-Synchronization.md](./fundamentals/04-Synchronization.md) - 동기화 기법
- [05-File-System-Basics.md](./fundamentals/05-File-System-Basics.md) - 파일 시스템 기초

### Phase 2: Deep Dive (2주차)

- [01-Context-Switching.md](./deep-dive/01-Context-Switching.md) - 컨텍스트 스위칭 비용
- [02-Virtual-Memory.md](./deep-dive/02-Virtual-Memory.md) - 가상 메모리
- [03-Paging-Segmentation.md](./deep-dive/03-Paging-Segmentation.md) - 페이징과 세그먼테이션
- [04-Deadlock.md](./deep-dive/04-Deadlock.md) - 데드락 발생과 해결
- [05-IO-Models.md](./deep-dive/05-IO-Models.md) - I/O 모델
- [06-System-Calls.md](./deep-dive/06-System-Calls.md) - 시스템 콜
- [07-IPC.md](./deep-dive/07-IPC.md) - 프로세스 간 통신

### Phase 3: Practice (3주차)

- [01-Simple-Shell.md](./practice/01-Simple-Shell.md) - 간단한 쉘 구현
- [02-Memory-Pool.md](./practice/02-Memory-Pool.md) - 메모리 풀
- [03-Producer-Consumer.md](./practice/03-Producer-Consumer.md) - 생산자-소비자 문제
- [04-Thread-Pool.md](./practice/04-Thread-Pool.md) - 쓰레드 풀 구현

### Phase 4: Resources

- [Books.md](./resources/Books.md) - 추천 도서 (공룡책 등)
- [Linux-Kernel.md](./resources/Linux-Kernel.md) - 리눅스 커널 코드
- [Tools.md](./resources/Tools.md) - 시스템 분석 도구
- [Post-Mortems.md](./resources/Post-Mortems.md) - 시스템 장애 사례

## 🔍 핵심 질문들

### 프로세스와 쓰레드
1. **왜 프로세스는 독립적이고 쓰레드는 공유하는가?**
   - 메모리 구조의 차이

2. **왜 컨텍스트 스위칭은 비용이 비싼가?**
   - 레지스터, 캐시 초기화

3. **왜 멀티쓰레드를 사용하는가?**
   - 컨텍스트 스위칭 비용 절감, 메모리 공유

### 메모리
1. **왜 가상 메모리를 사용하는가?**
   - 물리 메모리보다 큰 프로그램 실행 가능
   - 프로세스 격리

2. **왜 페이징을 사용하는가?**
   - 외부 단편화 해결
   - 메모리 관리 단순화

3. **왜 TLB가 필요한가?**
   - 페이지 테이블 접근 비용 줄임

## 💡 실무 시나리오

### 시나리오 1: 메모리 누수
```python
# 문제: 메모리 사용량이 계속 증가

class Cache:
    def __init__(self):
        self.data = {}

    def set(self, key, value):
        self.data[key] = value  # 계속 쌓임, 삭제 안 함

# 해결: LRU 캐시로 제한
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cache = OrderedDict()
        self.capacity = capacity

    def set(self, key, value):
        if len(self.cache) >= self.capacity:
            self.cache.popitem(last=False)  # 가장 오래된 것 삭제
        self.cache[key] = value
```

### 시나리오 2: 데드락 발생
```java
// 문제: 데드락 발생
Thread A:
    lock(mutex1)
    lock(mutex2)

Thread B:
    lock(mutex2)  // A가 mutex1을 잡고 대기
    lock(mutex1)  // B가 mutex2를 잡고 대기 → 데드락!

// 해결: 일관된 순서로 락 획득
Thread A:
    lock(mutex1)
    lock(mutex2)

Thread B:
    lock(mutex1)  // 같은 순서
    lock(mutex2)
```

### 시나리오 3: CPU 100% 사용
```bash
# 문제: 애플리케이션이 CPU 100% 사용

# 진단:
top -p <pid>  # CPU 사용률 확인
strace -p <pid>  # 시스템 콜 추적

# 발견: 무한 루프
while True:
    check_condition()  # Busy waiting

# 해결: Sleep 추가
while True:
    check_condition()
    time.sleep(0.01)  # CPU 양보
```

## 📈 학습 진행도 체크리스트

### Week 1: Fundamentals
- [ ] 프로세스와 쓰레드의 차이를 메모리 구조로 설명할 수 있다
- [ ] 스택, 힙, 데이터, 코드 영역을 이해한다
- [ ] CPU 스케줄링 알고리즘을 비교할 수 있다
- [ ] Mutex, Semaphore, Monitor의 차이를 설명할 수 있다
- [ ] 데드락 발생 조건 4가지를 나열할 수 있다

### Week 2: Deep Dive
- [ ] 컨텍스트 스위칭 과정을 설명할 수 있다
- [ ] 가상 메모리와 페이징을 그림으로 그릴 수 있다
- [ ] 페이지 교체 알고리즘을 비교할 수 있다
- [ ] I/O 모델 4가지를 구분할 수 있다
- [ ] 시스템 콜의 동작 원리를 이해한다

### Week 3: Practice
- [ ] fork()와 exec()를 사용해봤다
- [ ] pthread로 멀티쓰레드 프로그램을 작성했다
- [ ] 생산자-소비자 문제를 구현했다
- [ ] strace/ltrace로 시스템 콜을 추적했다

## 🎓 추천 학습 흐름

```
Day 1-2: 프로세스와 쓰레드 기초
   ↓
Day 3-4: 메모리 구조와 가상 메모리
   ↓
Day 5-7: 동기화 기법과 데드락
   ↓
Day 8-10: CPU 스케줄링과 컨텍스트 스위칭
   ↓
Day 11-13: 페이징과 페이지 교체
   ↓
Day 14-16: I/O 모델과 시스템 콜
   ↓
Day 17-19: 실습 (쉘 구현)
   ↓
Day 20-21: xv6 커널 코드 읽기
```

## 🔗 다음 단계

OS 학습 완료 후:
1. [Data Structures & Algorithms](../04-Data-Structures-Algorithms/README.md)
2. 또는 Linux Kernel 소스코드 깊이 파기

## 💬 학습 팁

### 1. 리눅스 명령어로 확인
```bash
# 프로세스 확인
ps aux
pstree

# 메모리 사용량
free -h
vmstat 1

# CPU 사용률
top
htop

# 파일 디스크립터
lsof -p <pid>

# 시스템 콜 추적
strace -p <pid>
```

### 2. /proc 파일 시스템
```bash
# 프로세스 정보
cat /proc/<pid>/status
cat /proc/<pid>/maps  # 메모리 맵

# 시스템 정보
cat /proc/cpuinfo
cat /proc/meminfo
```

### 3. xv6 운영체제 코드 읽기
- MIT에서 교육용으로 만든 유닉스 계열 OS
- 전체 코드가 10,000줄 미만
- 실제 동작하는 OS
- https://github.com/mit-pdos/xv6-public

### 4. 추천 도서
- **Operating System Concepts** (Silberschatz) - 공룡책
- **Modern Operating Systems** (Tanenbaum)
- **The Linux Programming Interface** (Kerrisk)

---

**"OS를 이해하면 Docker와 Kubernetes가 무엇을 추상화했는지 보인다"**
