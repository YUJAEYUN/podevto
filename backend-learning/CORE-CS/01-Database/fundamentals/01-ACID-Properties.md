# ACID Properties - 왜 필요한가?

> "ACID가 없으면 데이터베이스가 아니라 그냥 파일 시스템이다"

## 🎯 학습 목표

- ACID 각 속성이 해결하는 **실제 문제** 이해
- 각 속성이 **깨졌을 때** 어떤 일이 발생하는지 파악
- 실무에서 ACID를 **어떻게 활용**하는지 이해

## 📚 ACID란?

ACID는 데이터베이스 트랜잭션이 안전하게 수행되도록 보장하는 4가지 속성:

```
A - Atomicity    (원자성)
C - Consistency  (일관성)
I - Isolation    (격리성)
D - Durability   (지속성)
```

## 🔍 1. Atomicity (원자성)

### 정의
**"All or Nothing"** - 트랜잭션의 모든 연산이 완전히 수행되거나, 전혀 수행되지 않아야 함

### 왜 필요한가?

#### 실제 문제 상황
```sql
-- 계좌 이체: A → B에게 1000원 송금
BEGIN TRANSACTION;
    UPDATE accounts SET balance = balance - 1000 WHERE id = 'A';  -- 성공
    -- 여기서 서버 크래시 발생! 💥
    UPDATE accounts SET balance = balance + 1000 WHERE id = 'B';  -- 실행 안 됨
COMMIT;
```

**문제**: A의 돈은 빠져나갔는데 B에게 들어오지 않음 → 돈이 증발!

### Atomicity가 보장하면?
```
서버 크래시 발생
    ↓
DB는 자동으로 ROLLBACK
    ↓
A 계좌는 원래대로 복구됨
    ↓
일관성 유지 ✅
```

### 내부 구조: 어떻게 구현되는가?

#### 1. Transaction Log (트랜잭션 로그)
```
[LOG]
1. BEGIN TRANSACTION TX-1234
2. OLD VALUE: accounts[A].balance = 5000
3. NEW VALUE: accounts[A].balance = 4000
4. (서버 크래시)
```

복구 시:
```
1. 로그를 읽음
2. COMMIT 기록이 없음을 확인
3. OLD VALUE로 되돌림 (UNDO)
```

#### 2. Write-Ahead Logging (WAL)
```
규칙: 실제 데이터 변경 전에 로그를 먼저 디스크에 기록
```

```
[시간 순서]
1. 로그에 기록 (디스크에 flush)
2. 메모리의 데이터 변경
3. COMMIT 로그 기록
4. 나중에 디스크에 실제 데이터 기록
```

### 코드 예제

#### ❌ Atomicity가 없는 경우
```python
def transfer_money(from_account, to_account, amount):
    # 1. 출금
    from_balance = get_balance(from_account)
    set_balance(from_account, from_balance - amount)

    # 여기서 크래시 발생하면? → 돈 증발!

    # 2. 입금
    to_balance = get_balance(to_account)
    set_balance(to_account, to_balance + amount)
```

#### ✅ Atomicity가 보장되는 경우
```python
def transfer_money(from_account, to_account, amount):
    with db.transaction():  # 트랜잭션 시작
        # 1. 출금
        from_balance = get_balance(from_account)
        set_balance(from_account, from_balance - amount)

        # 2. 입금
        to_balance = get_balance(to_account)
        set_balance(to_account, to_balance + amount)

    # COMMIT 또는 ROLLBACK 자동 처리
```

## 🔍 2. Consistency (일관성)

### 정의
트랜잭션이 실행되기 전후로 **데이터베이스의 제약 조건**이 항상 만족되어야 함

### 왜 필요한가?

#### 제약 조건의 예
```sql
-- 1. NOT NULL 제약
CREATE TABLE users (
    id INT PRIMARY KEY,
    email VARCHAR(255) NOT NULL  -- 반드시 존재해야 함
);

-- 2. UNIQUE 제약
CREATE TABLE users (
    email VARCHAR(255) UNIQUE  -- 중복 불가
);

-- 3. CHECK 제약
CREATE TABLE accounts (
    balance DECIMAL CHECK (balance >= 0)  -- 잔액은 음수 불가
);

-- 4. FOREIGN KEY 제약
CREATE TABLE orders (
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)  -- users에 존재하는 id만 가능
);
```

#### 실제 문제 상황
```sql
-- 잔액이 음수가 되는 것을 막아야 함
BEGIN TRANSACTION;
    UPDATE accounts SET balance = balance - 1000 WHERE id = 'A';
    -- 만약 balance가 500이었다면? → -500이 됨!
COMMIT;
```

### Consistency가 보장하면?
```sql
BEGIN TRANSACTION;
    UPDATE accounts SET balance = balance - 1000 WHERE id = 'A';
    -- CHECK 제약 위반!
    -- DB가 자동으로 ROLLBACK
ROLLBACK;  -- 트랜잭션 취소
```

### 비즈니스 로직 제약

데이터베이스 제약만으로는 부족할 때:

```java
@Transactional
public void transferMoney(String fromId, String toId, int amount) {
    Account from = accountRepository.findById(fromId);
    Account to = accountRepository.findById(toId);

    // 비즈니스 제약: 잔액 확인
    if (from.getBalance() < amount) {
        throw new InsufficientFundsException();  // 롤백 발생
    }

    from.withdraw(amount);
    to.deposit(amount);

    accountRepository.save(from);
    accountRepository.save(to);

    // COMMIT - 모든 제약 조건이 만족됨
}
```

## 🔍 3. Isolation (격리성)

### 정의
동시에 실행되는 트랜잭션들이 **서로 영향을 주지 않도록** 격리되어야 함

### 왜 필요한가?

#### 실제 문제 상황: Dirty Read
```sql
-- Transaction A
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 'A';
-- 아직 COMMIT 안 함

-- Transaction B (동시 실행)
BEGIN;
SELECT balance FROM accounts WHERE id = 'A';  -- 1000을 읽음
COMMIT;

-- Transaction A
ROLLBACK;  -- 취소!

-- 결과: B는 실제로 존재하지 않는 값(1000)을 읽음
```

#### 실제 문제 상황: Lost Update
```sql
-- 초기 balance = 100

-- Transaction A
BEGIN;
balance = SELECT balance FROM accounts WHERE id = 'A';  -- 100
balance = balance + 50;  -- 150

-- Transaction B (동시 실행)
BEGIN;
balance = SELECT balance FROM accounts WHERE id = 'A';  -- 100
balance = balance + 30;  -- 130

-- Transaction A
UPDATE accounts SET balance = 150 WHERE id = 'A';
COMMIT;

-- Transaction B
UPDATE accounts SET balance = 130 WHERE id = 'A';  -- A의 +50이 사라짐!
COMMIT;

-- 최종 balance = 130 (올바른 값: 180)
```

### Isolation이 보장하면?

#### 격리 수준 (Isolation Level)
```
┌─────────────────────┬──────────────┬──────────────┬─────────────┐
│ Isolation Level     │ Dirty Read   │ Non-Repeatable│ Phantom Read│
├─────────────────────┼──────────────┼──────────────┼─────────────┤
│ Read Uncommitted    │ 발생 가능    │ 발생 가능    │ 발생 가능   │
│ Read Committed      │ 방지 ✅      │ 발생 가능    │ 발생 가능   │
│ Repeatable Read     │ 방지 ✅      │ 방지 ✅      │ 발생 가능   │
│ Serializable        │ 방지 ✅      │ 방지 ✅      │ 방지 ✅     │
└─────────────────────┴──────────────┴──────────────┴─────────────┘
```

**트레이드오프**: 격리 수준이 높을수록 안전하지만, 동시성 성능은 낮아짐

### 실무 예제: 좌석 예약 시스템
```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public boolean reserveSeat(int seatId, int userId) {
    Seat seat = seatRepository.findById(seatId);

    if (!seat.isAvailable()) {
        return false;  // 이미 예약됨
    }

    // 다른 트랜잭션은 이 seat을 읽을 수 없음 (락 획득)
    seat.setAvailable(false);
    seat.setUserId(userId);

    seatRepository.save(seat);
    return true;
}
```

## 🔍 4. Durability (지속성)

### 정의
트랜잭션이 **성공적으로 커밋되면**, 그 결과는 **영구적**으로 반영되어야 함

### 왜 필요한가?

#### 실제 문제 상황
```sql
BEGIN TRANSACTION;
    UPDATE accounts SET balance = balance + 1000 WHERE id = 'A';
COMMIT;  -- "성공했습니다!" 메시지 출력

-- 사용자: "입금 완료!"

-- 1초 후 서버 크래시 💥
-- 재부팅 후 확인해보니 balance가 원래대로?
-- 사용자: "내 돈 어디갔어??"
```

### Durability가 보장하면?
```
COMMIT 시점에:
    1. 트랜잭션 로그를 디스크에 기록 (fsync)
    2. "성공" 응답

서버 크래시 후:
    1. 재부팅
    2. 트랜잭션 로그 읽기
    3. 커밋된 트랜잭션 재적용 (REDO)
    4. 데이터 복구 ✅
```

### 내부 구조: WAL (Write-Ahead Logging)

#### WAL의 3가지 규칙
```
1. 로그가 먼저 디스크에 기록되어야 함
2. 트랜잭션은 로그가 안전하게 기록된 후 COMMIT
3. 실제 데이터는 나중에 디스크에 기록 (배치 처리)
```

#### 시간 순서
```
[메모리]                    [디스크]

1. 데이터 변경
   balance: 100 → 200

2. 로그 생성
   [TX-1: balance=200]

3. 로그 flush                → [LOG] TX-1: balance=200 ✅

4. COMMIT                   → [LOG] COMMIT TX-1 ✅

5. 사용자에게 "성공" 응답

6. (나중에) 실제 데이터      → [DATA] balance=200
```

#### 크래시 시나리오

**시나리오 1: 로그 기록 후, COMMIT 전 크래시**
```
[LOG]
TX-1234: balance = 100 → 200
(크래시)

복구 후:
- COMMIT 로그가 없음
- ROLLBACK (UNDO)
```

**시나리오 2: COMMIT 후, 실제 데이터 기록 전 크래시**
```
[LOG]
TX-1234: balance = 100 → 200
COMMIT TX-1234
(크래시)

[DATA]
balance = 100  (아직 안 바뀜)

복구 후:
- COMMIT 로그 발견
- 로그를 읽어서 재적용 (REDO)
- balance = 200 ✅
```

## 🔗 ACID 속성들의 관계

```
Atomicity + Durability
    ↓
트랜잭션은 완전히 성공하거나 완전히 실패하며,
성공한 트랜잭션은 영구적으로 반영됨

Isolation + Consistency
    ↓
동시에 실행되는 트랜잭션들이 서로 간섭하지 않으며,
모든 제약 조건이 항상 만족됨
```

## 💡 실무에서의 ACID

### 언제 ACID가 필요한가?

✅ **필요한 경우**:
- 금융 시스템 (계좌 이체, 결제)
- 재고 관리 (주문, 출고)
- 예약 시스템 (좌석, 호텔)
- 회원 가입 (이메일 중복 체크)

❌ **불필요한 경우**:
- 로그 수집 (약간의 손실 허용)
- 통계 데이터 (근사값 허용)
- 캐시 데이터 (휘발성)

### ACID vs BASE (NoSQL)

```
ACID (관계형 DB)
- 강한 일관성
- 낮은 가용성
- 금융, 결제 시스템

BASE (NoSQL)
- 최종 일관성 (Eventually Consistent)
- 높은 가용성
- SNS, 로그, 분석 시스템
```

## 🎯 체크리스트

- [ ] ACID 각 속성을 예제 없이 설명할 수 있다
- [ ] Atomicity가 없을 때 발생하는 문제를 설명할 수 있다
- [ ] WAL의 동작 원리를 그림으로 그릴 수 있다
- [ ] Isolation Level의 트레이드오프를 이해한다
- [ ] Durability를 보장하기 위한 디스크 flush를 이해한다
- [ ] 실무에서 ACID가 필요한 상황을 구분할 수 있다

## 🔗 다음 학습

- [02-Normalization.md](./02-Normalization.md) - 데이터 일관성을 위한 정규화
- [03-Transaction-Basics.md](./03-Transaction-Basics.md) - 트랜잭션 명령어
- [../deep-dive/03-Transaction-Isolation.md](../deep-dive/03-Transaction-Isolation.md) - 격리 수준 깊이 파기

---

**"ACID를 이해하면 왜 NoSQL이 등장했는지도 이해할 수 있다"**
