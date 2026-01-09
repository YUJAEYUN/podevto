# 격리(Isolation)란 무엇인가?

## 격리의 의미

**격리(Isolation)** = 서로 영향을 주지 않도록 분리하는 것

```
실생활 비유: 아파트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

격리가 안 된 경우 (원룸 쉐어하우스):
┌─────────────────────────────────────┐
│    하나의 큰 방                      │
│                                     │
│  👤 A   👤 B   👤 C                 │
│                                     │
│  - A의 물건을 B가 만짐               │
│  - C가 큰 소리 내면 모두 방해됨       │
│  - 냉장고를 누가 다 먹으면 다 곤란    │
│  - 화장실 사용 충돌                  │
│  - 프라이버시 없음                   │
└─────────────────────────────────────┘

격리가 된 경우 (각자 방):
┌──────────┬──────────┬──────────┐
│ 101호    │ 102호    │ 103호    │
│          │          │          │
│  👤 A    │  👤 B    │  👤 C    │
│          │          │          │
│ - 자기 물건만 사용                │
│ - 소음이 들리지 않음               │
│ - 각자 냉장고                     │
│ - 독립적인 생활                   │
│ - 프라이버시 보장                 │
└──────────┴──────────┴──────────┘
```

---

## 격리가 없으면 발생하는 실제 문제들

### 문제 1: 포트 충돌

가장 흔한 문제입니다.

```
격리 없이 실행:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$ python web_app_A.py
서버 시작: 포트 8080 ✓

$ python web_app_B.py
에러! 포트 8080이 이미 사용 중입니다!
→ 실행 불가 ✗

문제:
- 두 앱이 같은 포트 사용
- 한 번에 하나만 실행 가능
- 개발자가 수동으로 포트 변경 필요
```

```python
# web_app_A.py
from flask import Flask
app = Flask(__name__)

@app.route('/')
def home():
    return "App A"

if __name__ == '__main__':
    app.run(port=8080)  # 포트 8080 사용
```

```python
# web_app_B.py
from flask import Flask
app = Flask(__name__)

@app.route('/')
def home():
    return "App B"

if __name__ == '__main__':
    app.run(port=8080)  # 같은 포트 8080!
    # 에러 발생: Address already in use
```

**격리된 환경 (컨테이너):**

```bash
# 격리된 네트워크 네임스페이스
$ docker run -d -p 8081:8080 app-a
$ docker run -d -p 8082:8080 app-b

→ 각 컨테이너 내부에서는 포트 8080 사용
→ 외부에서는 8081, 8082로 접근
→ 충돌 없음! ✓
```

---

### 문제 2: 파일 시스템 충돌

```
격리 없이 실행:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

프로그램 A:
/tmp/data.txt에 "Hello from A" 저장

프로그램 B:
/tmp/data.txt에 "Hello from B" 저장
→ A의 파일을 덮어씀!

프로그램 A:
/tmp/data.txt 읽기
→ "Hello from B"가 나옴 (내 데이터가 아님!)
→ 예상치 못한 동작, 버그 발생
```

```python
# program_a.py
# 중요한 데이터를 파일에 저장
with open('/tmp/data.txt', 'w') as f:
    f.write('User ID: 12345\nPassword: secret123')

# 나중에 읽기
with open('/tmp/data.txt', 'r') as f:
    data = f.read()
    print(data)
    # 예상: User ID: 12345...
    # 실제: ???
```

```python
# program_b.py
# 같은 파일 이름 사용 (우연히 or 악의적으로)
with open('/tmp/data.txt', 'w') as f:
    f.write('Malicious data!')
```

**격리된 환경:**

```bash
# 컨테이너 A
$ docker exec container-a cat /tmp/data.txt
User ID: 12345
Password: secret123

# 컨테이너 B
$ docker exec container-b cat /tmp/data.txt
Malicious data!

→ 각자의 파일 시스템
→ 서로 영향 없음 ✓
```

---

### 문제 3: 의존성 충돌 (Dependency Hell)

매우 흔하고 골치 아픈 문제입니다.

```
격리 없이 실행:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

프로젝트 A:
- Python 3.8 필요
- Django 2.2 필요
- numpy 1.18 필요

프로젝트 B:
- Python 3.10 필요
- Django 4.0 필요
- numpy 1.22 필요

문제:
→ Python 버전이 다름
→ 라이브러리 버전이 다름
→ 동시에 실행 불가능!
```

#### 실제 시나리오

```bash
# 프로젝트 A 설치
$ pip install Django==2.2
Successfully installed Django-2.2

# 프로젝트 A 실행
$ python project_a/manage.py runserver
✓ 정상 동작

# 프로젝트 B 설치
$ pip install Django==4.0
Successfully installed Django-4.0
→ Django 2.2가 4.0으로 업그레이드됨

# 프로젝트 A 다시 실행
$ python project_a/manage.py runserver
Error: Django 4.0은 이 코드와 호환되지 않습니다!
→ 프로젝트 A 망가짐 ✗

# 프로젝트 B는 동작
$ python project_b/manage.py runserver
✓ 정상 동작

문제:
- 두 프로젝트를 동시에 유지 불가능
- 하나를 실행하면 다른 하나가 망가짐
- 매번 재설치 필요 (시간 낭비)
```

**격리된 환경:**

```bash
# 컨테이너 A
FROM python:3.8
RUN pip install Django==2.2

# 컨테이너 B
FROM python:3.10
RUN pip install Django==4.0

→ 각자의 Python, 각자의 라이브러리
→ 완전히 독립적
→ 동시 실행 가능 ✓
```

---

### 문제 4: 프로세스 간섭

```
격리 없이 실행:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

프로그램 A:
$ ps aux  # 모든 프로세스 보임
1234  systemd
1235  sshd
1236  my_app_a
1237  my_app_b        ← 다른 프로그램 보임
1238  database
...

→ A는 B의 프로세스를 볼 수 있음
→ A가 악의적이면 B를 kill 할 수 있음!

$ kill -9 1237  # B 프로그램 강제 종료
→ B가 갑자기 죽음
```

```python
# malicious_program.py
import os
import signal

# 시스템의 모든 프로세스 스캔
for pid in range(1, 10000):
    try:
        # 프로세스 이름 확인
        with open(f'/proc/{pid}/cmdline', 'r') as f:
            cmdline = f.read()

        # 경쟁사 프로그램 발견!
        if 'competitor_app' in cmdline:
            print(f"경쟁사 앱 발견! PID: {pid}")
            os.kill(pid, signal.SIGKILL)  # 강제 종료!
            print(f"프로세스 {pid} 종료됨")
    except:
        pass
```

**격리된 환경:**

```bash
# 컨테이너 A 안에서
$ docker exec container-a ps aux
PID   CMD
1     my_app_a
2     my_worker

→ 자기 프로세스만 보임
→ 다른 컨테이너의 프로세스는 안 보임
→ kill 할 수 없음 ✓
```

---

### 문제 5: 메모리 침범 (보안 문제)

격리가 없으면 보안이 매우 취약합니다.

```
격리 없는 환경의 보안 취약점:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

프로그램 A (악성):
/etc/passwd 파일 읽기 시도
→ 성공! 모든 사용자 정보 탈취

/var/log/app_b/secret.log 읽기
→ 성공! 다른 앱의 로그 훔침

rm -rf / 실행
→ 시스템 전체 삭제 가능!
```

```python
# hacker_script.py
import os

# 시스템 비밀번호 파일 읽기
try:
    with open('/etc/shadow', 'r') as f:
        passwords = f.read()
        print("비밀번호 해시 탈취 성공!")
        print(passwords)
except PermissionError:
    print("권한 없음 (다행)")

# 다른 앱의 설정 파일 읽기
try:
    with open('/app/other_app/config.yaml', 'r') as f:
        config = f.read()
        print("다른 앱의 설정 탈취 성공!")
        print(config)
except FileNotFoundError:
    print("파일 없음")
```

**격리된 환경:**

```bash
# 컨테이너 안에서
$ docker exec malicious-container cat /etc/shadow
cat: /etc/shadow: No such file or directory

→ 호스트 시스템의 파일을 볼 수 없음
→ 다른 컨테이너의 파일도 볼 수 없음
→ 보안 강화 ✓
```

---

### 문제 6: 리소스 독점

```
격리 (리소스 제한) 없이 실행:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

프로그램 A:
- 메모리 무제한 사용
- 버그로 인해 메모리 누수 발생
- 1GB → 2GB → 4GB → 8GB → 16GB
- 시스템 메모리 전부 소진!

결과:
→ 프로그램 B, C, D 모두 메모리 부족
→ 시스템 전체가 느려짐
→ OOM Killer가 무작위로 프로세스 종료
→ 전체 시스템 다운 가능
```

```python
# memory_hog.py
# 메모리를 계속 할당 (메모리 누수 시뮬레이션)
data = []
while True:
    # 10MB씩 계속 할당
    data.append('x' * 10_000_000)
    print(f"메모리 사용량: {len(data) * 10} MB")
    # 해제하지 않음!
```

```bash
# 실행하면...
$ python memory_hog.py
메모리 사용량: 10 MB
메모리 사용량: 20 MB
메모리 사용량: 30 MB
...
메모리 사용량: 15900 MB
메모리 사용량: 15910 MB

# 시스템 전체 메모리 16GB
→ 거의 다 소진
→ 다른 프로그램들이 메모리 부족으로 멈춤
→ 시스템이 매우 느려짐
→ 최악의 경우 시스템 다운
```

**격리 + 리소스 제한:**

```bash
# 메모리 512MB로 제한
$ docker run --memory="512m" memory-hog

메모리 사용량: 10 MB
메모리 사용량: 20 MB
...
메모리 사용량: 510 MB
Killed  ← 메모리 제한 도달, 컨테이너만 종료

→ 이 컨테이너만 종료
→ 호스트 시스템은 안전
→ 다른 컨테이너들은 정상 동작 ✓
```

---

### 문제 7: 환경 변수 충돌

```
격리 없이 실행:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# .bashrc 또는 시스템 환경 변수
export DATABASE_URL="postgresql://prod_server/db"

프로그램 A:
DATABASE_URL 환경 변수 읽기
→ "postgresql://prod_server/db"
→ 프로덕션 DB에 연결
→ 실수로 프로덕션 데이터 삭제! ✗

프로그램 B:
DATABASE_URL을 변경해야 함
→ export DATABASE_URL="postgresql://dev_server/db"
→ A의 환경도 바뀜!
→ A가 개발 DB에 연결됨 (의도하지 않음)
```

```python
# app_a.py
import os

db_url = os.getenv('DATABASE_URL')
print(f"연결: {db_url}")

# 데이터베이스 작업
# 만약 프로덕션 DB라면 위험!
```

```bash
# 터미널 1
$ export DATABASE_URL="postgresql://prod/db"
$ python app_a.py
연결: postgresql://prod/db  ← 프로덕션!

# 터미널 2 (같은 셸)
$ export DATABASE_URL="postgresql://dev/db"
$ python app_b.py
연결: postgresql://dev/db  ← 개발

# 터미널 1에서 다시 실행
$ python app_a.py
연결: postgresql://dev/db  ← 바뀜! 위험!
```

**격리된 환경:**

```yaml
# docker-compose.yml
services:
  app-a:
    environment:
      - DATABASE_URL=postgresql://prod/db

  app-b:
    environment:
      - DATABASE_URL=postgresql://dev/db

→ 각 컨테이너는 자신만의 환경 변수
→ 서로 영향 없음 ✓
```

---

## 실제 사례: 격리 없이 발생한 사고

### 사례 1: Netflix의 카오스 엔지니어링

Netflix는 격리의 중요성을 깨닫고 "Chaos Monkey"를 만들었습니다.

```
문제 상황:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

서버 1대에 여러 서비스 실행 (격리 없음):
- 비디오 스트리밍
- 추천 시스템
- 사용자 인증
- 결제 시스템

비디오 스트리밍에 버그 발생:
→ CPU 100% 사용
→ 다른 서비스들도 느려짐
→ 전체 서버 마비
→ 사용자는 아무것도 할 수 없음

해결책:
→ 마이크로서비스 + 컨테이너
→ 각 서비스를 격리
→ 하나가 망가져도 다른 서비스는 정상
```

### 사례 2: 공유 호스팅의 악몽

```
격리 안 된 공유 호스팅:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

서버 1대에 100개 웹사이트 호스팅
→ 한 사이트가 해킹당함
→ 해커가 서버의 다른 파일 접근 가능
→ 100개 사이트 모두 해킹당함

실제 사례:
- 2010년대 초반 저가 호스팅 업체들에서 빈번
- 한 고객의 보안 사고가 다른 고객에게 영향
- 업체 신뢰도 추락
```

---

## 격리의 종류

### 1. 네트워크 격리

```
격리 없음:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
모든 앱이 같은 네트워크
→ 앱 A가 앱 B의 포트로 접속 가능
→ 트래픽 스니핑 가능
→ 중간자 공격 가능

격리됨:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
각 컨테이너는 자신만의 네트워크
→ 명시적으로 연결하지 않으면 통신 불가
→ 보안 강화
```

```bash
# Docker 네트워크 격리
$ docker network create app-network
$ docker run --network app-network app-a
$ docker run --network app-network app-b
$ docker run --network other-network app-c

→ app-a와 app-b는 통신 가능
→ app-c는 격리됨 (다른 네트워크)
```

### 2. 파일 시스템 격리

```
격리 없음:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
모든 앱이 같은 파일 시스템
→ /tmp, /var, /etc 공유
→ 파일 덮어쓰기
→ 설정 충돌

격리됨:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
각 컨테이너는 자신만의 파일 시스템
→ / 루트부터 독립
→ 호스트나 다른 컨테이너 파일 볼 수 없음
→ 안전
```

### 3. 프로세스 격리

```
격리 없음:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
$ ps aux
→ 모든 프로세스 보임
→ 다른 프로세스 조작 가능
→ 보안 위험

격리됨:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
$ docker exec container ps aux
→ 자기 프로세스만 보임
→ PID 1부터 시작하는 것처럼 보임
→ 다른 프로세스 건드릴 수 없음
```

### 4. 사용자 격리

```
격리 없음:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
컨테이너 내부 root = 호스트 root
→ 컨테이너 탈출 시 호스트 root 권한
→ 매우 위험

격리됨 (User Namespace):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
컨테이너 내부 root (UID 0)
→ 호스트에서는 일반 사용자 (UID 1000)
→ 탈출해도 제한된 권한
→ 피해 최소화
```

---

## 격리 실습

### 실습 1: 포트 충돌 경험

```bash
# 격리 없이 (실패)
$ python -m http.server 8000 &
$ python -m http.server 8000 &
# 에러: Address already in use

# 격리해서 (성공)
$ docker run -d -p 8001:8000 python:3.9 python -m http.server
$ docker run -d -p 8002:8000 python:3.9 python -m http.server
# 둘 다 정상 실행!
```

### 실습 2: 파일 시스템 격리

```bash
# 호스트에 파일 생성
$ echo "호스트 파일" > /tmp/test.txt

# 컨테이너 A
$ docker run -it --name container-a ubuntu bash
root@container-a:/# echo "컨테이너 A" > /tmp/test.txt
root@container-a:/# cat /tmp/test.txt
컨테이너 A

# 컨테이너 B
$ docker run -it --name container-b ubuntu bash
root@container-b:/# cat /tmp/test.txt
cat: /tmp/test.txt: No such file or directory
# 파일이 없음! 각자의 파일 시스템

# 호스트에서 확인
$ cat /tmp/test.txt
호스트 파일
# 호스트 파일도 그대로 존재
```

### 실습 3: 프로세스 격리

```bash
# 호스트
$ ps aux | wc -l
342  # 342개 프로세스

# 컨테이너 안에서
$ docker run -it ubuntu bash
root@container:/# ps aux
PID   CMD
1     bash
10    ps
# 딱 2개만 보임!
```

### 실습 4: 리소스 제한

```python
# memory_test.py
import time

data = []
try:
    while True:
        data.append('x' * 10_000_000)  # 10MB
        print(f"메모리: {len(data) * 10} MB")
        time.sleep(0.5)
except KeyboardInterrupt:
    print("종료")
```

```bash
# 제한 없이 실행 (위험!)
$ python memory_test.py
메모리: 10 MB
메모리: 20 MB
...
메모리: 15900 MB  # 시스템 메모리 거의 소진

# 제한해서 실행 (안전!)
$ docker run --memory="512m" -it python:3.9 python memory_test.py
메모리: 10 MB
메모리: 20 MB
...
메모리: 510 MB
Killed  # 컨테이너만 종료, 호스트는 안전
```

---

## 격리가 주는 이점 정리

```
격리의 핵심 이점:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 안정성 (Stability)
   ✓ 한 앱의 문제가 다른 앱에 영향 안 줌
   ✓ 한 서비스가 다운되어도 다른 서비스는 정상

2. 보안 (Security)
   ✓ 앱 간 데이터 접근 차단
   ✓ 해킹당해도 피해 범위 최소화
   ✓ 권한 격리

3. 이식성 (Portability)
   ✓ 개발 환경 = 테스트 환경 = 운영 환경
   ✓ "내 컴퓨터에선 되는데" 문제 해결
   ✓ 어디서든 동일하게 실행

4. 효율성 (Efficiency)
   ✓ 리소스 제한으로 공정한 분배
   ✓ 한 앱이 시스템 전체 독점 방지
   ✓ 여러 앱을 안전하게 같은 서버에서 실행

5. 개발 편의성 (Development)
   ✓ 의존성 충돌 없음
   ✓ 여러 버전 동시 실행 가능
   ✓ 깔끔한 환경 관리
```

---

## 격리 vs 비격리 비교표

```
┌─────────────────┬────────────────┬──────────────────┐
│     항목        │  격리 없음      │   격리됨         │
├─────────────────┼────────────────┼──────────────────┤
│ 포트 충돌       │ 발생 ✗         │ 없음 ✓           │
│ 파일 충돌       │ 발생 ✗         │ 없음 ✓           │
│ 의존성 충돌     │ 발생 ✗         │ 없음 ✓           │
│ 보안            │ 취약 ✗         │ 강화 ✓           │
│ 리소스 독점     │ 가능 ✗         │ 제한 가능 ✓      │
│ 동시 실행       │ 제한적 ✗       │ 자유로움 ✓       │
│ 개발 편의성     │ 복잡 ✗         │ 간단 ✓           │
│ 배포            │ 어려움 ✗       │ 쉬움 ✓           │
└─────────────────┴────────────────┴──────────────────┘
```

---

## 결론

**격리 = 각자의 독립된 공간**

```
격리가 없으면:
- 서로 간섭
- 충돌 발생
- 보안 취약
- 관리 어려움

격리가 있으면:
- 독립적 실행
- 충돌 없음
- 보안 강화
- 관리 쉬움

→ 현대 소프트웨어 개발에 필수!
```

컨테이너의 격리는 단순히 "분리"가 아니라, **안전하고 효율적으로 여러 애플리케이션을 실행하기 위한 핵심 메커니즘**입니다.

---

## 다음 학습

- [컨테이너 기초](container-basics.md)
- [프로세스 이해하기](process-deep-dive.md)
- [Docker 실습](docker.md)

---

*Last updated: 2026-01-09*
