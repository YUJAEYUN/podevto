# Replication - 복제와 고가용성

> "하나의 DB가 여러 개로"

## 🎯 핵심 개념

### 복제란?

Master DB의 데이터를 Replica(Slave) DB로 복사

```
Master (쓰기)
  ↓ 복제
Replica 1 (읽기)
Replica 2 (읽기)
Replica 3 (읽기)
```

## 📚 복제의 목적

### 1. 읽기 성능 향상

```
Application
  ├→ Master (쓰기)
  ├→ Replica 1 (읽기)
  ├→ Replica 2 (읽기)
  └→ Replica 3 (읽기)

읽기 부하 분산 ✅
```

### 2. 고가용성 (HA)

```
Master 장애 💥
  ↓ Failover
Replica → New Master ✅
```

### 3. 백업

```
Replica에서 백업 (Master 부하 없음)
```

## 💡 복제 방식

### 1. 비동기 복제 (Asynchronous)

```
Application → Master (COMMIT 즉시 응답 ✅)
                ↓ 나중에
              Replica (복제)

장점: 빠름
단점: 복제 지연 (Replication Lag)
```

### 2. 동기 복제 (Synchronous)

```
Application → Master (쓰기)
                ↓ 대기...
              Replica (복제 완료)
                ↓
            Master (COMMIT 응답)

장점: 데이터 일관성
단점: 느림
```

### 3. 준동기 복제 (Semi-Synchronous)

```
1개 이상의 Replica 복제 완료 시 응답
(타협안)
```

## 🔍 복제 지연 문제

### 문제 상황

```sql
-- Master에 쓰기
INSERT INTO users VALUES (100, 'Alice');
COMMIT;

-- 즉시 Replica에서 읽기
SELECT * FROM users WHERE id = 100;
-- 아직 복제 안 됨! NULL 반환 😢
```

### 해결 방법

1. **Master에서 읽기** (일시적으로)
2. **복제 완료 대기** (애플리케이션)
3. **타임스탬프 체크** (버전 확인)

## ⚡ MySQL 복제 설정

### Master 설정

```ini
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = ROW
```

### Replica 설정

```sql
CHANGE MASTER TO
  MASTER_HOST='master_host',
  MASTER_USER='repl_user',
  MASTER_PASSWORD='password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=107;

START SLAVE;
```

## 🔗 다음 학습

- [08-Partitioning-Sharding.md](./08-Partitioning-Sharding.md)

---

**"복제는 성능과 안정성의 기본"**
