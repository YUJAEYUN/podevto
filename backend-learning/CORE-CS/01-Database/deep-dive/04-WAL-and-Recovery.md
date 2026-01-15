# WAL and Recovery - Write-Ahead Logging

> "크래시가 나도 데이터는 살아남는다"

## 🎯 핵심 개념

### WAL이란?

**Write-Ahead Logging**: 실제 데이터 변경 **전에** 로그를 먼저 기록

```
1. 트랜잭션 시작
2. 변경사항을 로그에 기록 (디스크 flush)  ← WAL
3. 메모리의 데이터 변경
4. COMMIT 로그 기록 (디스크 flush)
5. 사용자에게 "성공" 응답
6. 나중에 실제 데이터 페이지를 디스크에 기록
```

## 📚 WAL의 3가지 규칙

### 1. Log First
```
반드시 로그가 먼저 디스크에 기록되어야 함
```

### 2. Force on Commit
```
COMMIT 시 로그를 디스크에 강제로 flush
```

### 3. No Force on Data
```
실제 데이터는 나중에 천천히 기록해도 됨
```

## 💡 왜 WAL을 사용하는가?

### 1. 성능 향상

**WAL 없이**:
```
UPDATE 100개 → 100개 페이지를 랜덤하게 디스크에 기록
→ 매우 느림 (랜덤 I/O)
```

**WAL 사용**:
```
UPDATE 100개 → 로그에 순차적으로 기록
→ 빠름 (순차 I/O)
→ 실제 데이터는 나중에 배치로 기록
```

### 2. 크래시 복구

```
1. 서버 크래시 💥
2. 재부팅
3. WAL 로그 읽기
4. COMMIT된 트랜잭션 재적용 (REDO)
5. COMMIT 안 된 트랜잭션 취소 (UNDO)
6. 데이터 복구 완료 ✅
```

## 🔍 WAL 레코드 구조

```
[LSN | TX ID | Type | Data]

예:
[100 | TX-1 | BEGIN | ]
[101 | TX-1 | UPDATE | accounts[1].balance = 1000]
[102 | TX-1 | UPDATE | accounts[2].balance = 500]
[103 | TX-1 | COMMIT | ]
```

- **LSN** (Log Sequence Number): 로그 순서 번호
- **TX ID**: 트랜잭션 ID
- **Type**: BEGIN, UPDATE, COMMIT, ROLLBACK 등
- **Data**: 변경 내용

## 🔄 복구 과정

### REDO (재실행)

```sql
-- 크래시 전
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
COMMIT;  -- 로그에만 기록됨
-- 디스크에 쓰기 전 크래시! 💥

-- 복구 시
1. WAL 로그 읽기: COMMIT 발견
2. REDO: UPDATE 다시 실행
3. 데이터 복구 ✅
```

### UNDO (취소)

```sql
-- 크래시 전
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
-- COMMIT 전 크래시! 💥

-- 복구 시
1. WAL 로그 읽기: COMMIT 없음
2. UNDO: 변경사항 취소
3. 트랜잭션 롤백 ✅
```

## 💻 PostgreSQL의 WAL

### WAL 파일 확인

```bash
# WAL 파일 위치
ls -lh /var/lib/postgresql/data/pg_wal/

# 예:
000000010000000000000001  (16MB)
000000010000000000000002
000000010000000000000003
```

### WAL 설정

```sql
-- postgresql.conf

# WAL 레벨
wal_level = replica  # minimal, replica, logical

# 체크포인트 간격
checkpoint_timeout = 5min

# WAL 버퍼 크기
wal_buffers = 16MB

# 동기화 방식
fsync = on  # 반드시 on (성능 vs 안정성)
synchronous_commit = on
```

## 📊 Checkpoint

**Checkpoint**: 메모리의 Dirty Page를 디스크에 기록

```
시간 →
[WAL] [WAL] [WAL] [Checkpoint!] [WAL] [WAL] [Checkpoint!]
           ↓                            ↓
      디스크에 쓰기                  디스크에 쓰기

복구 시: 마지막 Checkpoint부터 REDO
```

### Checkpoint의 역할

1. **메모리 해제**: Dirty Page를 디스크에 쓰고 메모리 해제
2. **복구 시간 단축**: 마지막 Checkpoint부터만 REDO
3. **WAL 파일 정리**: 오래된 WAL 파일 삭제 가능

## ⚡ 성능 최적화

### 1. Group Commit

```
여러 트랜잭션의 COMMIT을 한 번에 flush

TX1 COMMIT ┐
TX2 COMMIT ├→ 한 번에 디스크 flush
TX3 COMMIT ┘

성능 향상!
```

### 2. WAL Archiving (백업)

```sql
-- postgresql.conf
archive_mode = on
archive_command = 'cp %p /archive/%f'

-- WAL 파일을 별도 위치에 보관
→ PITR (Point-In-Time Recovery) 가능
```

## 🎯 실무 팁

### 1. fsync 설정

```sql
-- ❌ 위험: fsync = off (빠르지만 크래시 시 데이터 손실)
-- ✅ 안전: fsync = on (느리지만 안전)

-- 타협: synchronous_commit = off
-- COMMIT은 빠르지만, 크래시 시 일부 데이터 손실 가능
```

### 2. WAL 모니터링

```sql
-- WAL 생성 속도 확인
SELECT pg_current_wal_lsn();

-- WAL 파일 개수
SELECT count(*) FROM pg_ls_waldir();
```

## 🔗 다음 학습

- [01-ACID-Properties.md](../fundamentals/01-ACID-Properties.md)
- [05-Query-Optimizer.md](./05-Query-Optimizer.md)

---

**"WAL 덕분에 크래시가 나도 데이터는 안전하다"**
