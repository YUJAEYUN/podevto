# Process와 Thread

> "프로세스는 집, 쓰레드는 집에 사는 사람"

## 🎯 핵심 개념

### 프로세스 (Process)
- **독립적인 실행 단위**
- 자신만의 메모리 공간
- 다른 프로세스와 격리됨

### 쓰레드 (Thread)  
- **프로세스 내의 실행 흐름**
- 프로세스의 메모리 공유
- 가벼움 (Context Switching 비용 적음)

## 📦 메모리 구조

### 프로세스 메모리
```
┌─────────────────┐
│   Stack         │ ← 지역 변수, 함수 호출
├─────────────────┤
│   Heap          │ ← 동적 할당 (malloc, new)
├─────────────────┤
│   Data          │ ← 전역 변수, static
├─────────────────┤
│   Code (Text)   │ ← 실행 코드
└─────────────────┘
```

### 멀티쓰레드 메모리
```
Thread 1          Thread 2
Stack             Stack
  ↓                 ↓
┌─────────────────┐
│   Stack (T1)    │
│   Stack (T2)    │
├─────────────────┤
│   Heap (공유)   │ ← 쓰레드들이 공유
├─────────────────┤
│   Data (공유)   │
├─────────────────┤
│   Code (공유)   │
└─────────────────┘
```

## 💻 코드 예제

### 프로세스 생성 (fork)
```c
#include <unistd.h>
#include <stdio.h>

int main() {
    pid_t pid = fork();
    
    if (pid == 0) {
        // 자식 프로세스
        printf("Child: PID=%d\n", getpid());
    } else {
        // 부모 프로세스
        printf("Parent: PID=%d, Child PID=%d\n", getpid(), pid);
    }
    
    return 0;
}
```

### 쓰레드 생성 (pthread)
```c
#include <pthread.h>
#include <stdio.h>

void* thread_func(void* arg) {
    printf("Thread: %ld\n", pthread_self());
    return NULL;
}

int main() {
    pthread_t thread;
    pthread_create(&thread, NULL, thread_func, NULL);
    pthread_join(thread, NULL);
    
    return 0;
}
```

## ⚖️ 비교

| 특징 | 프로세스 | 쓰레드 |
|------|---------|--------|
| 메모리 | 독립적 | 공유 |
| 생성 비용 | 높음 | 낮음 |
| Context Switching | 느림 | 빠름 |
| 안전성 | 높음 (격리) | 낮음 (공유) |
| 통신 | IPC 필요 | 직접 접근 |

## 💡 실무 선택

### 프로세스를 선택할 때
```
✅ 안정성이 중요 (크래시 격리)
✅ 보안이 중요
✅ 예: 브라우저 탭, Nginx Worker
```

### 쓰레드를 선택할 때
```
✅ 데이터 공유가 많음
✅ 빠른 생성/전환 필요
✅ 예: 웹 서버 요청 처리, DB 연결 풀
```

## 🔗 다음 학습

- [../deep-dive/01-Context-Switching.md](../deep-dive/01-Context-Switching.md)

---

**"프로세스는 안전하지만 무겁고, 쓰레드는 가볍지만 조심해야 한다"**
