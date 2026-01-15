# Transaction Log Analyzer - 트랜잭션 로그 분석 도구

> "WAL 로그를 분석하여 DB 동작 이해하기"

## 🎯 학습 목표

- **WAL 로그 구조** 이해
- **트랜잭션 추적** 구현
- **크래시 복구 시뮬레이션**
- **REDO/UNDO 로그 분석**

## 📚 프로젝트 개요

PostgreSQL 또는 MySQL의 WAL 로그를 분석하는 도구

```python
analyzer = TransactionLogAnalyzer('wal.log')

# 트랜잭션 목록
analyzer.list_transactions()

# 특정 트랜잭션 분석
analyzer.analyze_transaction('TX-1234')

# 복구 시뮬레이션
analyzer.simulate_recovery()
```

## 🔧 구현

```python
# transaction_log_analyzer.py
import json
from datetime import datetime
from collections import defaultdict

class TransactionLogAnalyzer:
    def __init__(self, log_file):
        self.log_file = log_file
        self.entries = []
        self.transactions = defaultdict(list)
        self._load_log()

    def _load_log(self):
        """로그 파일 로드"""
        with open(self.log_file, 'r') as f:
            for line in f:
                if line.strip():
                    entry = json.loads(line)
                    self.entries.append(entry)

                    # 트랜잭션별 그룹화
                    if 'tx_id' in entry:
                        self.transactions[entry['tx_id']].append(entry)

    def list_transactions(self):
        """트랜잭션 목록"""
        for tx_id, entries in self.transactions.items():
            status = 'COMMITTED' if any(e['op'] == 'COMMIT' for e in entries) else 'ABORTED'
            print(f"TX {tx_id}: {len(entries)} operations, {status}")

    def analyze_transaction(self, tx_id):
        """특정 트랜잭션 분석"""
        entries = self.transactions.get(tx_id, [])
        if not entries:
            print(f"Transaction {tx_id} not found")
            return

        print(f"\n=== Transaction {tx_id} ===")
        for entry in entries:
            timestamp = datetime.fromtimestamp(entry['timestamp'])
            print(f"{timestamp}: {entry['op']} {entry.get('key', '')}")

    def simulate_recovery(self):
        """크래시 복구 시뮬레이션"""
        print("\n=== Recovery Simulation ===")

        # REDO: 커밋된 트랜잭션
        committed_txs = {tx_id for tx_id, entries in self.transactions.items()
                        if any(e['op'] == 'COMMIT' for e in entries)}

        # UNDO: 커밋 안 된 트랜잭션
        aborted_txs = set(self.transactions.keys()) - committed_txs

        print(f"REDO: {len(committed_txs)} transactions")
        for tx_id in committed_txs:
            print(f"  - {tx_id}")

        print(f"\nUNDO: {len(aborted_txs)} transactions")
        for tx_id in aborted_txs:
            print(f"  - {tx_id}")

# 테스트
if __name__ == '__main__':
    # WAL 생성
    with open('test_wal.log', 'w') as f:
        logs = [
            {'tx_id': 'TX-1', 'op': 'BEGIN', 'timestamp': 1704067200.0},
            {'tx_id': 'TX-1', 'op': 'UPDATE', 'key': 'key1', 'value': 'value1', 'timestamp': 1704067201.0},
            {'tx_id': 'TX-1', 'op': 'COMMIT', 'timestamp': 1704067202.0},
            {'tx_id': 'TX-2', 'op': 'BEGIN', 'timestamp': 1704067203.0},
            {'tx_id': 'TX-2', 'op': 'UPDATE', 'key': 'key2', 'value': 'value2', 'timestamp': 1704067204.0},
            # TX-2는 COMMIT 없음 (크래시)
        ]
        for log in logs:
            f.write(json.dumps(log) + '\n')

    # 분석
    analyzer = TransactionLogAnalyzer('test_wal.log')
    analyzer.list_transactions()
    analyzer.analyze_transaction('TX-1')
    analyzer.simulate_recovery()
```

## 🎯 체크리스트

- [ ] WAL 로그 파싱
- [ ] 트랜잭션 그룹화
- [ ] 복구 시뮬레이션
- [ ] 통계 정보 출력

---

**"로그를 분석하면 DB 내부가 보인다"**
