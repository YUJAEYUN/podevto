# 프로세스와 CPU의 실체

## CPU는 하나인데 어떻게 여러 프로세스가 동시에 실행될까?

### 핵심: 시분할 (Time Sharing)

실제로는 **동시에 실행되는 게 아니라 엄청 빠르게 번갈아 가며 실행**됩니다.

```
현실 세계 비유: 요리사 한 명이 여러 요리를 동시에
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────────────────────────┐
│ 요리사 1명 (= CPU 1개)                  │
│                                        │
│ 요리 3가지를 동시에? 불가능!            │
│                                        │
│ 실제로 하는 일:                         │
│ 00:00 → 파스타 볶기 (5초)              │
│ 00:05 → 스테이크 굽기 (5초)            │
│ 00:10 → 샐러드 만들기 (5초)            │
│ 00:15 → 파스타 볶기 (5초)              │
│ 00:20 → 스테이크 뒤집기 (5초)          │
│ 00:25 → 샐러드 완성 (5초)              │
│ ...                                    │
│                                        │
│ → 손님 입장: 세 요리가 "동시에" 완성!   │
│ → 실제: 요리사는 한 번에 하나씩만 함    │
└────────────────────────────────────────┘

CPU도 똑같이 작동:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

시간 0ms   → 프로세스 A 실행 (10ms)
시간 10ms  → 프로세스 B 실행 (10ms)
시간 20ms  → 프로세스 C 실행 (10ms)
시간 30ms  → 프로세스 A 실행 (10ms)
시간 40ms  → 프로세스 B 실행 (10ms)
...

→ 사용자 입장: 모든 프로그램이 "동시에" 실행
→ 실제: CPU는 한 번에 하나씩만 실행
```

### 실제 CPU 동작 (1초 동안)

```
CPU Core 1개, 프로세스 3개 가정:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

0ms ─────────────────────────────────── 1000ms
│    │    │    │    │    │    │    │
│ A  │ B  │ C  │ A  │ B  │ C  │ A  │ ...
│10ms│10ms│10ms│10ms│10ms│10ms│10ms│

프로세스 A:
- 10ms 동안 실행
- CPU 빼앗김
- 대기
- 다시 10ms 실행
- ...

→ 1초에 약 100번 교체
→ 사용자는 전혀 느끼지 못함 (너무 빠름)
```

### 실제 측정 가능한 예제

```python
# process_example.py
import time
import os

print(f"내 PID: {os.getpid()}")

count = 0
start = time.time()

# 1억 번 계산
for i in range(100_000_000):
    count += 1

end = time.time()
print(f"걸린 시간: {end - start:.2f}초")
```

```bash
# 프로세스 1개만 실행
$ python process_example.py
내 PID: 1234
걸린 시간: 3.21초

# 프로세스 4개 동시 실행 (CPU 1개)
$ python process_example.py &
$ python process_example.py &
$ python process_example.py &
$ python process_example.py &

# 각 프로세스 실행 시간
프로세스 1234: 12.45초  ← 4배 느려짐!
프로세스 1235: 12.38초
프로세스 1236: 12.51초
프로세스 1237: 12.42초

→ CPU를 4개가 나눠 쓰기 때문
→ 각자는 1/4 시간만 CPU 사용
```

---

## 프로세스란 정확히 무엇인가?

### 프로세스 = 실행 중인 프로그램의 "상태"

프로세스는 단순히 실행 파일이 아닙니다. **실행 중인 프로그램의 모든 정보**를 의미합니다.

```
프로그램 vs 프로세스:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

프로그램:
- 하드디스크에 저장된 파일
- 실행 가능한 코드
- 예: /usr/bin/python

프로세스:
- 메모리에 로드된 프로그램
- 실행 중인 상태
- CPU 레지스터 값
- 메모리 내용
- 열린 파일들
- 네트워크 연결
- ...

비유:
프로그램 = 요리 레시피 (책)
프로세스 = 실제 요리하는 중 (냄비, 재료, 진행 상황)
```

### 프로세스가 가지는 실제 정보

```
프로세스의 구성 요소:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 메모리 공간:
┌─────────────────────────┐
│ Stack (스택)             │  ← 함수 호출, 지역 변수
├─────────────────────────┤
│ ↓ (성장 방향)            │
│                         │
│ ↑ (성장 방향)            │
├─────────────────────────┤
│ Heap (힙)               │  ← 동적 할당 (new, malloc)
├─────────────────────────┤
│ Data (데이터)            │  ← 전역 변수
├─────────────────────────┤
│ Text (코드)             │  ← 실행 코드
└─────────────────────────┘

2. CPU 레지스터:
- PC (Program Counter): 다음 실행할 명령어 주소
- SP (Stack Pointer): 스택의 현재 위치
- 범용 레지스터: 계산 중인 값들
- 상태 레지스터: CPU 상태 플래그

3. 파일 디스크립터:
- 열린 파일 목록
- 네트워크 소켓
- 파이프, 디바이스 등

4. 프로세스 메타데이터:
- PID (Process ID)
- PPID (Parent PID)
- 사용자 ID
- 우선순위
- 실행 시간
- 메모리 사용량
```

### 실제 프로세스 정보 확인

```bash
# 프로세스 상세 정보 보기
$ cat /proc/1234/status

Name:   python3
State:  R (running)
Pid:    1234
PPid:   1000
Uid:    1000
Gid:    1000
VmSize:  50000 kB    ← 가상 메모리 크기
VmRSS:   20000 kB    ← 실제 물리 메모리 사용량
Threads: 1

# 프로세스 메모리 맵 보기
$ cat /proc/1234/maps

00400000-00500000 r-xp 00000000 08:01 12345  /usr/bin/python3  ← 코드 영역
00600000-00610000 rw-p 00100000 08:01 12345  /usr/bin/python3  ← 데이터 영역
01000000-02000000 rw-p 00000000 00:00 0      [heap]           ← 힙
7fff0000-7fff1000 rw-p 00000000 00:00 0      [stack]          ← 스택

# 프로세스가 연 파일들 보기
$ ls -l /proc/1234/fd

0 -> /dev/pts/0        ← stdin (표준 입력)
1 -> /dev/pts/0        ← stdout (표준 출력)
2 -> /dev/pts/0        ← stderr (표준 에러)
3 -> /tmp/data.txt     ← 열린 파일
4 -> socket:[54321]    ← 네트워크 소켓
```

---

## 컨텍스트 스위칭 (Context Switch)

CPU가 프로세스를 바꿀 때 일어나는 일

### 1단계: 현재 프로세스 상태 저장

```
프로세스 A 실행 중:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CPU 레지스터:
PC (Program Counter) = 0x00401234
SP (Stack Pointer)   = 0x7fff0000
AX (범용 레지스터)    = 42
BX (범용 레지스터)    = 100
...

↓ 타이머 인터럽트 발생! (10ms 지남)

OS가 개입:
"프로세스 A의 시간이 끝났다!"

1. CPU 레지스터 값을 메모리에 저장
   프로세스 A의 PCB에 저장:
   {
     PC: 0x00401234,
     SP: 0x7fff0000,
     AX: 42,
     BX: 100,
     ...
   }

2. 스케줄러가 다음 프로세스 선택
   "프로세스 B를 실행할 차례"
```

### 2단계: 다음 프로세스 상태 복원

```
프로세스 B로 전환:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 프로세스 B의 PCB에서 레지스터 값 읽기
   {
     PC: 0x00405678,
     SP: 0x7fff8000,
     AX: 99,
     BX: 200,
     ...
   }

2. CPU 레지스터에 복원
   PC = 0x00405678  ← B가 멈췄던 위치
   SP = 0x7fff8000
   AX = 99
   BX = 200

3. 프로세스 B 실행 재개
   → B는 자신이 멈췄던 걸 모름!
   → 계속 실행 중이라고 생각함
```

### PCB (Process Control Block)

운영체제가 각 프로세스의 정보를 저장하는 자료구조

```c
// 리눅스 커널의 task_struct (단순화)
struct task_struct {
    // 프로세스 식별
    pid_t pid;
    pid_t ppid;

    // 상태
    long state;  // RUNNING, SLEEPING, STOPPED, ...

    // 스케줄링
    int priority;
    unsigned long cpu_time;

    // 메모리
    struct mm_struct *mm;  // 메모리 맵

    // CPU 레지스터 (저장된 값)
    struct pt_regs *regs;

    // 파일
    struct files_struct *files;  // 열린 파일들

    // 네임스페이스 (컨테이너!)
    struct nsproxy *nsproxy;

    // cgroups (리소스 제한!)
    struct cgroups *cgroups;

    // 부모-자식 관계
    struct task_struct *parent;
    struct list_head children;
};
```

---

## 실제 예제: 프로세스가 CPU를 나눠 쓰는 모습

### 데모 프로그램

```python
# cpu_monitor.py
import os
import time
import psutil

pid = os.getpid()
process = psutil.Process(pid)

print(f"PID: {pid}")
print("CPU 사용률 측정 중... (Ctrl+C로 종료)")

while True:
    # 현재 CPU 사용률
    cpu_percent = process.cpu_percent(interval=0.1)

    # 누적 CPU 시간
    cpu_times = process.cpu_times()

    print(f"CPU: {cpu_percent:5.1f}% | "
          f"User: {cpu_times.user:.2f}s | "
          f"System: {cpu_times.system:.2f}s")

    time.sleep(1)
```

### 실험 1: 프로세스 1개만 실행

```bash
$ python cpu_monitor.py

PID: 1234
CPU 사용률 측정 중...
CPU:   2.1% | User: 0.05s | System: 0.02s
CPU:   1.8% | User: 0.07s | System: 0.03s
CPU:   2.0% | User: 0.09s | System: 0.04s

→ CPU 거의 사용 안 함 (대부분 sleep)
```

### 실험 2: CPU 집약적 작업

```python
# cpu_intensive.py
import time

start = time.time()
count = 0

# 무한 루프 (CPU 100% 사용)
while time.time() - start < 10:
    count += 1

print(f"10초 동안 {count:,} 번 계산")
```

```bash
# CPU 1개 시스템에서 실행
$ python cpu_intensive.py

10초 동안 계산...
→ 1,234,567,890 번 계산

# 동시에 4개 실행
$ python cpu_intensive.py &  # PID 1001
$ python cpu_intensive.py &  # PID 1002
$ python cpu_intensive.py &  # PID 1003
$ python cpu_intensive.py &  # PID 1004

# top 명령으로 확인
$ top

PID   CPU%  TIME+
1001  25.0  2.5s   ← 각각 25%씩 사용
1002  25.0  2.5s   ← CPU를 공평하게 분배
1003  25.0  2.5s
1004  25.0  2.5s
```

---

## PID는 왜 그렇게 많은가?

### 프로세스는 생각보다 작은 단위

```
일반적인 오해:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"프로그램 1개 = 프로세스 1개"

실제:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chrome 브라우저 1개 실행 → 프로세스 수십 개!

왜?
- 탭마다 프로세스 (격리)
- GPU 프로세스
- 네트워크 프로세스
- 확장 프로그램별 프로세스
- ...
```

### 실제 확인

```bash
# Chrome 실행 후 프로세스 확인
$ ps aux | grep chrome

USER  PID   COMMAND
user  1234  /opt/google/chrome/chrome
user  1235  /opt/google/chrome/chrome --type=renderer
user  1236  /opt/google/chrome/chrome --type=renderer
user  1237  /opt/google/chrome/chrome --type=renderer
user  1238  /opt/google/chrome/chrome --type=gpu-process
user  1239  /opt/google/chrome/chrome --type=utility
...
(수십 개)

→ Chrome 1개 = 프로세스 수십 개
```

### 시스템 전체 프로세스

```bash
# 전체 프로세스 개수
$ ps aux | wc -l
342

# 주요 프로세스들
$ ps aux | head -20

PID   COMMAND
1     /sbin/init              ← 첫 번째 프로세스
2     [kthreadd]              ← 커널 스레드
100   /lib/systemd/systemd-journald  ← 로그
150   /usr/sbin/sshd          ← SSH 서버
200   /usr/bin/dbus-daemon    ← 프로세스 간 통신
250   /usr/sbin/cron          ← 스케줄러
...

→ 운영체제가 동작하려면 수백 개 프로세스 필요
```

### 프로세스 계층 구조

```bash
# 프로세스 트리 보기
$ pstree -p

systemd(1)─┬─systemd-journal(100)
           ├─systemd-udevd(150)
           ├─sshd(200)─┬─sshd(1000)───bash(1001)───python(1002)
           │           └─sshd(1010)───bash(1011)
           ├─dockerd(300)─┬─containerd(301)
           │              ├─docker-proxy(400)
           │              └─container1(500)─┬─nginx(501)
           │                                ├─nginx(502)
           │                                └─nginx(503)
           └─chrome(600)─┬─chrome(601)
                         ├─chrome(602)
                         └─chrome(603)

→ 모든 프로세스는 부모-자식 관계
→ 최상위: systemd (PID 1)
```

---

## 컨테이너 = 프로세스 그룹

### 컨테이너의 실체

컨테이너는 **하나의 프로세스가 아니라 여러 프로세스의 묶음**입니다.

```
Docker 컨테이너 실행:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$ docker run -d nginx

호스트에서 보면:
$ ps aux | grep nginx

PID   COMMAND
5000  nginx: master process
5001  nginx: worker process
5002  nginx: worker process
5003  nginx: worker process

→ 컨테이너 1개 = 프로세스 4개

컨테이너 안에서 보면:
$ docker exec <container> ps aux

PID   COMMAND
1     nginx: master process     ← PID 1!
2     nginx: worker process
3     nginx: worker process
4     nginx: worker process

→ Namespace 덕분에 다르게 보임
```

### 복잡한 애플리케이션

```
Node.js 앱 + PostgreSQL 컨테이너:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

호스트 시스템:
PID 1000  [컨테이너 A]
  ├─ 1001  node server.js
  ├─ 1002  node worker.js
  └─ 1003  node scheduler.js

PID 2000  [컨테이너 B]
  ├─ 2001  postgres: checkpointer
  ├─ 2002  postgres: background writer
  ├─ 2003  postgres: walwriter
  ├─ 2004  postgres: autovacuum launcher
  └─ 2005  postgres: stats collector

→ 컨테이너 2개 = 프로세스 8개
→ 각 컨테이너의 프로세스들은 격리됨
```

### 실제 측정

```bash
# 컨테이너 실행
$ docker run -d --name web nginx
$ docker run -d --name db postgres

# 컨테이너의 프로세스 확인
$ docker top web

PID    COMMAND
5000   nginx: master process nginx -g daemon off;
5001   nginx: worker process
5002   nginx: worker process

$ docker top db

PID    COMMAND
6000   postgres
6001   postgres: checkpointer
6002   postgres: background writer
6003   postgres: walwriter
6004   postgres: autovacuum launcher
6005   postgres: stats collector

# 호스트에서 확인 (같은 프로세스!)
$ ps aux | grep -E "5000|6000"

root  5000  nginx: master process
root  5001  nginx: worker process
root  5002  nginx: worker process
postgres 6000  postgres
postgres 6001  postgres: checkpointer
postgres 6002  postgres: background writer
...

→ 컨테이너 = 특별한 프로세스들의 그룹
```

---

## 운영체제의 역할

### OS는 교통 정리를 하는 경찰

```
CPU = 도로 1차선
프로세스 = 차량들
OS = 교통 경찰

교통 경찰이 하는 일:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 스케줄링 (누가 먼저 갈지 결정)
   "A 차량, 10초 가세요"
   "B 차량, 10초 가세요"
   "C 차량, 10초 가세요"
   → 공평하게 배분

2. 메모리 관리 (주차 공간 할당)
   "A에게 100MB 할당"
   "B에게 200MB 할당"
   "메모리 부족하면 스왑"

3. 격리 (차량끼리 충돌 방지)
   "A는 자기 차선만"
   "B는 자기 차선만"
   → Namespace로 격리

4. 리소스 제한 (속도 제한)
   "A는 최대 시속 50km"
   "B는 최대 시속 30km"
   → cgroups로 제한
```

### CPU 스케줄러

리눅스의 CFS (Completely Fair Scheduler)

```
스케줄링 알고리즘:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

프로세스 A: CPU 10ms 사용
프로세스 B: CPU 30ms 사용
프로세스 C: CPU 5ms 사용

스케줄러가 계산:
"A가 가장 적게 썼네, A에게 기회!"

→ A 실행 (10ms)

다시 계산:
A: 20ms, B: 30ms, C: 5ms
"C가 가장 적게 썼네, C에게 기회!"

→ C 실행 (10ms)

다시 계산:
A: 20ms, B: 30ms, C: 15ms
"C가 가장 적게 썼네... 아니 A도 적네, A 먼저!"

→ A 실행 (10ms)

...

결과: 모든 프로세스가 공평하게 CPU 사용
```

---

## 정리: CPU 하나에서 여러 프로세스가 실행되는 원리

```
┌─────────────────────────────────────────────────────┐
│                    전체 그림                         │
└─────────────────────────────────────────────────────┘

하드웨어 레벨:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌────────┐
│  CPU   │ ← 물리적으로 1개
└───┬────┘
    │ 매 10ms마다 타이머 인터럽트
    ↓

운영체제 레벨:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────────────────────┐
│   OS 스케줄러                 │
│   "다음은 누구 차례?"          │
└──────────────────────────────┘
         │
    ┌────┴─────┬─────┬─────┐
    ↓          ↓     ↓     ↓
┌───────┐  ┌───────┐ ┌───────┐ ┌───────┐
│PCB: A │  │PCB: B │ │PCB: C │ │PCB: D │
│PID:100│  │PID:200│ │PID:300│ │PID:400│
│PC:0x..│  │PC:0x..│ │PC:0x..│ │PC:0x..│
│Regs:..│  │Regs:..│ │Regs:..│ │Regs:..│
└───────┘  └───────┘ └───────┘ └───────┘

시간 축:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0ms     10ms    20ms    30ms    40ms
├───────┼───────┼───────┼───────┼───────>
│   A   │   B   │   C   │   D   │   A   │ ...
└───────┴───────┴───────┴───────┴───────┘

각 프로세스 관점:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
프로세스 A: "나는 계속 실행 중이야!"
  (실제로는 10ms 실행, 30ms 대기, 10ms 실행, ...)

프로세스 B: "나도 계속 실행 중!"
  (실제로는 10ms 대기, 10ms 실행, 30ms 대기, ...)

→ 각 프로세스는 자신만 실행 중이라고 착각
→ OS가 환상을 만들어줌
```

---

## 핵심 개념 정리

### 1. CPU는 한 번에 하나만 실행

```
✗ 동시에 여러 개 실행 (X)
✓ 엄청 빠르게 번갈아가며 실행 (O)

속도가 워낙 빠라서 (ms 단위) 사용자는 구별 못함
```

### 2. 프로세스 = 실행 상태

```
프로그램 (하드디스크):
- 그냥 파일
- 실행 코드

프로세스 (메모리):
- 로드된 프로그램
- CPU 레지스터 상태
- 메모리 내용
- 열린 파일들
- 네트워크 연결
- ...

→ "상태"를 전부 저장하기 때문에
→ 언제든 멈췄다가 재개 가능
```

### 3. 컨텍스트 스위칭

```
프로세스 전환 과정:
1. 현재 프로세스 상태 저장 (PCB에)
2. 다음 프로세스 상태 복원 (PCB에서)
3. 실행 재개

→ 매우 빠름 (수 마이크로초)
→ 1초에 수백~수천 번 일어남
```

### 4. PID는 작은 단위

```
프로세스는 생각보다 작은 개념:
- 브라우저 탭 하나 = 프로세스 하나
- 백그라운드 스레드 = 프로세스 하나
- 헬퍼 프로그램 = 프로세스 하나

→ 현대 시스템: 수백~수천 개 프로세스 일반적
→ 전혀 이상하지 않음
```

### 5. 컨테이너 = 격리된 프로세스 그룹

```
컨테이너 1개 = 프로세스 여러 개

Namespace로 격리:
- 서로를 볼 수 없음
- 자신만의 세계에 있다고 생각

cgroups로 제한:
- CPU, 메모리 사용량 제한
- 다른 프로세스에 영향 안 줌

→ 독립적으로 실행되는 환경
```

---

## 실습: 직접 확인하기

### 실습 1: 컨텍스트 스위칭 관찰

```python
# context_switch.py
import os
import time

def work(name, duration):
    """CPU를 많이 사용하는 작업"""
    start = time.time()
    count = 0

    while time.time() - start < duration:
        count += 1

        # 100만 번마다 출력
        if count % 1_000_000 == 0:
            print(f"{name} (PID {os.getpid()}): {count:,} 번 실행")

    return count

if __name__ == "__main__":
    import sys

    name = sys.argv[1] if len(sys.argv) > 1 else "Process"
    total = work(name, 10)

    print(f"\n{name} 완료: 총 {total:,} 번 실행")
```

```bash
# 터미널 1
$ python context_switch.py "프로세스-A"

# 터미널 2
$ python context_switch.py "프로세스-B"

# 터미널 3
$ python context_switch.py "프로세스-C"

# 터미널 4 (모니터링)
$ watch -n 0.5 'ps aux | grep python | grep -v grep'

# 관찰 결과:
프로세스-A (PID 1000): CPU 33%
프로세스-B (PID 1001): CPU 33%
프로세스-C (PID 1002): CPU 33%

→ 세 프로세스가 CPU를 공평하게 나눠 씀
```

### 실습 2: 프로세스 정보 탐색

```bash
# 현재 실행 중인 프로세스 확인
$ ps aux

# 특정 프로세스의 메모리 맵
$ cat /proc/1234/maps

# 특정 프로세스가 연 파일들
$ ls -l /proc/1234/fd

# 프로세스 트리
$ pstree -p

# 실시간 모니터링
$ top
$ htop  # 더 보기 좋음
```

### 실습 3: 컨테이너 = 프로세스 확인

```bash
# Docker 컨테이너 실행
$ docker run -d --name test nginx

# 컨테이너의 프로세스
$ docker top test

# 호스트에서 같은 프로세스 확인
$ ps aux | grep nginx

# 프로세스의 네임스페이스 확인
$ ls -l /proc/<PID>/ns/

pid -> pid:[4026532...]    ← PID namespace
net -> net:[4026532...]    ← Network namespace
mnt -> mnt:[4026532...]    ← Mount namespace
...

→ 일반 프로세스와 다른 네임스페이스!
```

---

## 추가 학습

- [컨테이너 기초](container-basics.md)
- [Linux 스케줄러 상세](linux-scheduler.md)
- [메모리 관리](memory-management.md)

---

*Last updated: 2026-01-09*
