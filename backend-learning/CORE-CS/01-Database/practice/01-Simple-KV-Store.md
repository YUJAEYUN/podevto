# Simple Key-Value Store - 직접 구현하기

> "데이터베이스를 만들어보며 내부 동작 원리를 완벽히 이해한다"

## 🎯 학습 목표

- **WAL (Write-Ahead Logging)** 직접 구현
- **LSM-Tree** 구조 이해
- **크래시 복구** 메커니즘 구현
- **데이터베이스 내부 동작** 원리 체득

## 📚 프로젝트 개요

### 구현할 기능

```python
store = SimpleKV()

# 기본 연산
store.put("key1", "value1")   # 저장
value = store.get("key1")      # 조회
store.delete("key1")           # 삭제

# 영속성
store.close()                  # 저장
store = SimpleKV()             # 재시작 (데이터 복구됨)
```

### 아키텍처

```
┌──────────────────────────────────────┐
│ SimpleKV                             │
├──────────────────────────────────────┤
│ MemTable (in-memory)                 │
│  - 최근 쓰기 데이터                    │
│  - 빠른 읽기/쓰기                      │
├──────────────────────────────────────┤
│ WAL (Write-Ahead Log)                │
│  - 크래시 복구용                       │
│  - 디스크에 순차 기록                  │
├──────────────────────────────────────┤
│ SSTable (Sorted String Table)        │
│  - 디스크에 정렬된 데이터               │
│  - 주기적으로 MemTable flush          │
└──────────────────────────────────────┘
```

## 🔧 Phase 1: In-Memory KV Store (기초)

### 목표
메모리에만 저장하는 간단한 구현

### 구현

```python
# simple_kv_v1.py
class SimpleKV:
    def __init__(self):
        self.data = {}

    def put(self, key, value):
        """키-값 저장"""
        self.data[key] = value

    def get(self, key):
        """키로 값 조회"""
        return self.data.get(key)

    def delete(self, key):
        """키 삭제"""
        if key in self.data:
            del self.data[key]

    def scan(self, start_key, end_key):
        """범위 검색"""
        result = []
        for key in sorted(self.data.keys()):
            if start_key <= key <= end_key:
                result.append((key, self.data[key]))
        return result


# 테스트
if __name__ == '__main__':
    store = SimpleKV()

    # 저장
    store.put("apple", "red")
    store.put("banana", "yellow")
    store.put("cherry", "red")

    # 조회
    print(store.get("apple"))  # 'red'

    # 범위 검색
    print(store.scan("a", "c"))
    # [('apple', 'red'), ('banana', 'yellow')]

    # 삭제
    store.delete("banana")
    print(store.get("banana"))  # None
```

### 문제점
- **프로그램 종료 시 데이터 손실** 😢
- 영속성 없음

---

## 🔧 Phase 2: WAL 추가 (영속성)

### 목표
Write-Ahead Log로 크래시 복구 지원

### WAL 구조

```
# wal.log (텍스트 파일)
PUT apple red 1704067200
PUT banana yellow 1704067201
DELETE banana 1704067202
PUT cherry red 1704067203
```

### 구현

```python
# simple_kv_v2.py
import json
import os
import time

class SimpleKV:
    def __init__(self, db_dir="./data"):
        self.db_dir = db_dir
        self.wal_file = os.path.join(db_dir, "wal.log")
        self.data = {}

        # 디렉토리 생성
        os.makedirs(db_dir, exist_ok=True)

        # WAL 복구
        self._replay_wal()

    def _write_wal(self, operation, key, value=None):
        """WAL에 기록"""
        with open(self.wal_file, 'a') as f:
            log_entry = {
                'op': operation,
                'key': key,
                'value': value,
                'timestamp': time.time()
            }
            f.write(json.dumps(log_entry) + '\n')

    def _replay_wal(self):
        """크래시 복구: WAL 재적용"""
        if not os.path.exists(self.wal_file):
            return

        print(f"Recovering from WAL...")
        with open(self.wal_file, 'r') as f:
            for line in f:
                if line.strip():
                    entry = json.loads(line)
                    if entry['op'] == 'PUT':
                        self.data[entry['key']] = entry['value']
                    elif entry['op'] == 'DELETE':
                        self.data.pop(entry['key'], None)

        print(f"Recovered {len(self.data)} keys")

    def put(self, key, value):
        """키-값 저장 (WAL에 먼저 기록)"""
        self._write_wal('PUT', key, value)  # WAL 먼저!
        self.data[key] = value

    def get(self, key):
        """키로 값 조회"""
        return self.data.get(key)

    def delete(self, key):
        """키 삭제"""
        if key in self.data:
            self._write_wal('DELETE', key)  # WAL 먼저!
            del self.data[key]

    def close(self):
        """종료"""
        print(f"Closing database. Total keys: {len(self.data)}")


# 테스트
if __name__ == '__main__':
    # 첫 실행
    store = SimpleKV()
    store.put("apple", "red")
    store.put("banana", "yellow")
    store.close()

    # 재시작 (데이터 복구됨!)
    store = SimpleKV()
    print(store.get("apple"))    # 'red' ✅
    print(store.get("banana"))   # 'yellow' ✅
```

### 테스트: 크래시 복구

```python
# crash_test.py
import sys

store = SimpleKV()
store.put("key1", "value1")
store.put("key2", "value2")

# 강제 크래시! (close() 호출 안 함)
sys.exit(1)

# 재시작
# store = SimpleKV()
# print(store.get("key1"))  # 'value1' ✅ 복구됨!
```

---

## 🔧 Phase 3: SSTable 추가 (LSM-Tree)

### 목표
MemTable이 가득 차면 디스크에 SSTable로 flush

### LSM-Tree 구조

```
Write Path:
1. MemTable에 쓰기
2. MemTable 가득 참 (예: 1000개)
3. SSTable로 flush
4. MemTable 초기화

Read Path:
1. MemTable 확인
2. 없으면 SSTable 확인 (최신 → 오래된 순)
```

### 구현

```python
# simple_kv_v3.py
import json
import os
import time

class SimpleKV:
    def __init__(self, db_dir="./data", memtable_size=1000):
        self.db_dir = db_dir
        self.wal_file = os.path.join(db_dir, "wal.log")
        self.memtable = {}
        self.memtable_size = memtable_size
        self.sstables = []  # SSTable 파일 목록

        os.makedirs(db_dir, exist_ok=True)

        # 기존 SSTable 로드
        self._load_sstables()

        # WAL 복구
        self._replay_wal()

    def _load_sstables(self):
        """기존 SSTable 파일 목록 로드"""
        for filename in sorted(os.listdir(self.db_dir)):
            if filename.startswith("sstable_") and filename.endswith(".json"):
                filepath = os.path.join(self.db_dir, filename)
                self.sstables.append(filepath)
        self.sstables.reverse()  # 최신 파일이 앞으로

    def _flush_memtable(self):
        """MemTable을 SSTable로 flush"""
        if not self.memtable:
            return

        # SSTable 파일명 (타임스탬프)
        timestamp = int(time.time() * 1000)
        sstable_file = os.path.join(self.db_dir, f"sstable_{timestamp}.json")

        # 정렬된 데이터를 파일에 기록
        sorted_data = dict(sorted(self.memtable.items()))
        with open(sstable_file, 'w') as f:
            json.dump(sorted_data, f)

        # SSTable 목록에 추가 (최신이 앞)
        self.sstables.insert(0, sstable_file)

        # MemTable 초기화
        self.memtable.clear()

        # WAL 초기화
        if os.path.exists(self.wal_file):
            os.remove(self.wal_file)

        print(f"Flushed MemTable to {sstable_file}")

    def _write_wal(self, operation, key, value=None):
        """WAL에 기록"""
        with open(self.wal_file, 'a') as f:
            log_entry = {
                'op': operation,
                'key': key,
                'value': value,
                'timestamp': time.time()
            }
            f.write(json.dumps(log_entry) + '\n')

    def _replay_wal(self):
        """WAL 재적용"""
        if not os.path.exists(self.wal_file):
            return

        print("Recovering from WAL...")
        with open(self.wal_file, 'r') as f:
            for line in f:
                if line.strip():
                    entry = json.loads(line)
                    if entry['op'] == 'PUT':
                        self.memtable[entry['key']] = entry['value']
                    elif entry['op'] == 'DELETE':
                        self.memtable[entry['key']] = None  # 삭제 마커

        print(f"Recovered {len(self.memtable)} keys")

    def put(self, key, value):
        """키-값 저장"""
        # WAL에 먼저 기록
        self._write_wal('PUT', key, value)

        # MemTable에 저장
        self.memtable[key] = value

        # MemTable이 가득 차면 flush
        if len(self.memtable) >= self.memtable_size:
            self._flush_memtable()

    def get(self, key):
        """키로 값 조회"""
        # 1. MemTable 확인 (최신 데이터)
        if key in self.memtable:
            value = self.memtable[key]
            return None if value is None else value  # 삭제 마커 처리

        # 2. SSTable 확인 (최신 → 오래된 순)
        for sstable_file in self.sstables:
            with open(sstable_file, 'r') as f:
                data = json.load(f)
                if key in data:
                    value = data[key]
                    return None if value is None else value

        return None

    def delete(self, key):
        """키 삭제 (삭제 마커 사용)"""
        self._write_wal('DELETE', key)
        self.memtable[key] = None  # 삭제 마커

    def compact(self):
        """Compaction: 여러 SSTable 병합"""
        if len(self.sstables) < 2:
            return

        print(f"Compacting {len(self.sstables)} SSTables...")

        # 모든 SSTable 읽기
        merged_data = {}
        for sstable_file in reversed(self.sstables):  # 오래된 것부터
            with open(sstable_file, 'r') as f:
                data = json.load(f)
                merged_data.update(data)

        # 삭제 마커 제거
        merged_data = {k: v for k, v in merged_data.items() if v is not None}

        # 새 SSTable 생성
        timestamp = int(time.time() * 1000)
        new_sstable = os.path.join(self.db_dir, f"sstable_{timestamp}_compacted.json")

        sorted_data = dict(sorted(merged_data.items()))
        with open(new_sstable, 'w') as f:
            json.dump(sorted_data, f)

        # 기존 SSTable 삭제
        for sstable_file in self.sstables:
            os.remove(sstable_file)

        self.sstables = [new_sstable]
        print(f"Compacted to {new_sstable}")

    def close(self):
        """종료"""
        self._flush_memtable()
        print(f"Database closed")


# 테스트
if __name__ == '__main__':
    store = SimpleKV(memtable_size=3)  # 작은 크기로 테스트

    # 데이터 저장 (자동 flush 발생)
    store.put("key1", "value1")
    store.put("key2", "value2")
    store.put("key3", "value3")  # flush 발생!
    store.put("key4", "value4")
    store.put("key5", "value5")
    store.put("key6", "value6")  # flush 발생!

    # 조회 (MemTable + SSTable)
    print(store.get("key1"))  # SSTable에서 읽음
    print(store.get("key6"))  # MemTable에서 읽음

    # Compaction
    store.compact()

    store.close()
```

---

## 🎯 고급 기능 추가

### 1. Bloom Filter (존재 확인 최적화)

```python
class BloomFilter:
    def __init__(self, size=1000):
        self.size = size
        self.bits = [False] * size

    def add(self, key):
        for seed in [0, 1, 2]:
            index = hash((key, seed)) % self.size
            self.bits[index] = True

    def might_contain(self, key):
        for seed in [0, 1, 2]:
            index = hash((key, seed)) % self.size
            if not self.bits[index]:
                return False  # 확실히 없음!
        return True  # 있을 수도 있음

# SSTable마다 Bloom Filter 유지
# 키가 없는 SSTable은 건너뛰기 → 성능 향상!
```

### 2. 범위 검색

```python
def scan(self, start_key, end_key):
    """범위 검색"""
    result = {}

    # MemTable 스캔
    for key, value in self.memtable.items():
        if start_key <= key <= end_key and value is not None:
            result[key] = value

    # SSTable 스캔
    for sstable_file in self.sstables:
        with open(sstable_file, 'r') as f:
            data = json.load(f)
            for key, value in data.items():
                if start_key <= key <= end_key and value is not None:
                    if key not in result:  # 최신 데이터 우선
                        result[key] = value

    return sorted(result.items())
```

### 3. 통계 정보

```python
def stats(self):
    """DB 통계"""
    return {
        'memtable_keys': len(self.memtable),
        'sstable_count': len(self.sstables),
        'total_size_mb': sum(
            os.path.getsize(f) for f in self.sstables
        ) / (1024 * 1024)
    }
```

---

## 🧪 종합 테스트

```python
# test_simple_kv.py
import unittest
import shutil
import os

class TestSimpleKV(unittest.TestCase):
    def setUp(self):
        self.db_dir = "./test_data"
        if os.path.exists(self.db_dir):
            shutil.rmtree(self.db_dir)
        self.store = SimpleKV(db_dir=self.db_dir, memtable_size=3)

    def tearDown(self):
        self.store.close()
        if os.path.exists(self.db_dir):
            shutil.rmtree(self.db_dir)

    def test_basic_operations(self):
        # PUT
        self.store.put("key1", "value1")
        self.store.put("key2", "value2")

        # GET
        self.assertEqual(self.store.get("key1"), "value1")
        self.assertEqual(self.store.get("key2"), "value2")

        # DELETE
        self.store.delete("key1")
        self.assertIsNone(self.store.get("key1"))

    def test_persistence(self):
        # 데이터 저장
        self.store.put("persistent", "data")
        self.store.close()

        # 재시작
        new_store = SimpleKV(db_dir=self.db_dir)
        self.assertEqual(new_store.get("persistent"), "data")
        new_store.close()

    def test_flush(self):
        # MemTable flush 테스트
        for i in range(10):
            self.store.put(f"key{i}", f"value{i}")

        # 모두 조회 가능해야 함
        for i in range(10):
            self.assertEqual(self.store.get(f"key{i}"), f"value{i}")

    def test_compaction(self):
        # 여러 SSTable 생성
        for i in range(10):
            self.store.put(f"key{i}", f"value{i}")

        initial_sstables = len(self.store.sstables)

        # Compaction
        self.store.compact()

        # SSTable 개수 감소
        self.assertLess(len(self.store.sstables), initial_sstables)

        # 데이터는 유지
        self.assertEqual(self.store.get("key5"), "value5")

if __name__ == '__main__':
    unittest.main()
```

---

## 📊 성능 벤치마크

```python
# benchmark.py
import time
import random
import string

def random_string(length=10):
    return ''.join(random.choices(string.ascii_letters, k=length))

def benchmark_writes(store, count=10000):
    start = time.time()

    for i in range(count):
        key = f"key_{i}"
        value = random_string(100)
        store.put(key, value)

    elapsed = time.time() - start
    print(f"Write {count} keys: {elapsed:.2f}s ({count/elapsed:.0f} ops/sec)")

def benchmark_reads(store, count=10000):
    start = time.time()

    for i in range(count):
        key = f"key_{random.randint(0, count-1)}"
        store.get(key)

    elapsed = time.time() - start
    print(f"Read {count} keys: {elapsed:.2f}s ({count/elapsed:.0f} ops/sec)")

if __name__ == '__main__':
    store = SimpleKV(memtable_size=1000)

    print("=== Benchmark ===")
    benchmark_writes(store, 10000)
    benchmark_reads(store, 10000)

    store.close()
```

---

## 🎯 학습 체크리스트

- [ ] Phase 1: In-Memory KV Store 구현
- [ ] Phase 2: WAL 추가 및 크래시 복구 테스트
- [ ] Phase 3: SSTable + LSM-Tree 구현
- [ ] Compaction 기능 추가
- [ ] 단위 테스트 작성
- [ ] 성능 벤치마크 실행
- [ ] Bloom Filter 추가 (선택)

## 🔗 다음 단계

- Redis 소스코드 읽기 (`dict.c`, `ziplist.c`)
- RocksDB/LevelDB 문서 읽기
- 실제 DB와 성능 비교

---

**"직접 만들어보면 DB가 더 이상 블랙박스가 아니다"**
