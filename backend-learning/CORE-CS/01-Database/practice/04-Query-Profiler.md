# Query Profiler - 쿼리 프로파일러

> "느린 쿼리를 찾아내고 최적화하기"

## 🎯 학습 목표

- **쿼리 실행 시간 측정**
- **EXPLAIN 자동 분석**
- **느린 쿼리 감지**
- **최적화 제안**

## 📚 프로젝트 개요

```python
profiler = QueryProfiler(connection)

with profiler.profile():
    cursor.execute("SELECT * FROM users WHERE age > 20")

profiler.report()
# Query executed in 0.250s
# Suggestion: Add index on 'age'
```

## 🔧 구현

```python
# query_profiler.py
import time
import psycopg2

class QueryProfiler:
    def __init__(self, connection):
        self.conn = connection
        self.queries = []

    def profile(self):
        return self

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time
        self.queries.append({
            'sql': self._get_last_query(),
            'time': elapsed
        })

    def _get_last_query(self):
        # 실제로는 cursor를 모니터링해야 함
        return "SELECT ..."

    def report(self):
        """프로파일링 결과"""
        print("\n=== Query Profile ===")
        for i, query in enumerate(self.queries):
            print(f"\nQuery {i+1}:")
            print(f"  SQL: {query['sql']}")
            print(f"  Time: {query['time']:.3f}s")

            if query['time'] > 1.0:
                print(f"  ⚠️ Slow query detected!")

# 테스트
if __name__ == '__main__':
    conn = psycopg2.connect("dbname=test")
    profiler = QueryProfiler(conn)

    with profiler.profile():
        cur = conn.cursor()
        cur.execute("SELECT * FROM users")

    profiler.report()
```

## 🎯 체크리스트

- [ ] 쿼리 실행 시간 측정
- [ ] EXPLAIN 자동 실행
- [ ] 느린 쿼리 감지 (임계값)
- [ ] 최적화 제안

---

**"측정하지 않으면 최적화할 수 없다"**
