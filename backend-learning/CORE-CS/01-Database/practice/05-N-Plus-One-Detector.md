# N+1 Query Detector - N+1 문제 탐지기

> "숨어있는 N+1 쿼리를 자동으로 찾아낸다"

## 🎯 학습 목표

- **N+1 문제 자동 감지**
- **쿼리 패턴 분석**
- **최적화 제안**

## 📚 N+1 문제란?

```python
# ❌ N+1 문제
users = User.objects.all()  # 1번 쿼리
for user in users:
    orders = user.orders.all()  # N번 쿼리 (100명이면 100번!)

# ✅ 해결
users = User.objects.prefetch_related('orders')  # 2번 쿼리 (1 + 1)
```

## 🔧 구현

```python
# n_plus_one_detector.py
from collections import defaultdict
import re

class NPlusOneDetector:
    def __init__(self, threshold=10):
        self.threshold = threshold
        self.queries = defaultdict(int)
        self.enabled = False

    def monitor(self):
        return self

    def __enter__(self):
        self.enabled = True
        self.queries.clear()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.enabled = False
        self._analyze()

    def log_query(self, query):
        """쿼리 로깅 (DB 드라이버 hook)"""
        if not self.enabled:
            return

        # 쿼리 정규화 (파라미터 제거)
        normalized = self._normalize_query(query)
        self.queries[normalized] += 1

    def _normalize_query(self, query):
        """쿼리 정규화"""
        # 숫자를 ?로 치환
        query = re.sub(r'\d+', '?', query)
        # 문자열을 ?로 치환
        query = re.sub(r"'[^']*'", '?', query)
        return query

    def _analyze(self):
        """N+1 분석"""
        print("\n=== N+1 Query Analysis ===")

        for query, count in self.queries.items():
            if count > self.threshold:
                print(f"\n⚠️ Potential N+1 detected!")
                print(f"  Query: {query}")
                print(f"  Executed {count} times")
                print(f"  Suggestion: Use JOIN or prefetch_related()")

# 테스트
if __name__ == '__main__':
    detector = NPlusOneDetector(threshold=5)

    with detector.monitor():
        # 시뮬레이션: N+1 문제
        detector.log_query("SELECT * FROM users")
        for i in range(10):
            detector.log_query(f"SELECT * FROM orders WHERE user_id = {i}")

    # 출력:
    # ⚠️ Potential N+1 detected!
    #   Query: SELECT * FROM orders WHERE user_id = ?
    #   Executed 10 times
```

## 🎯 체크리스트

- [ ] 쿼리 로깅 구현
- [ ] 쿼리 정규화
- [ ] N+1 패턴 감지
- [ ] 최적화 제안

---

**"N+1은 성능의 가장 큰 적"**
