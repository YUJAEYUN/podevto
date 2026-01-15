# Hash Table - 해시 테이블

> "O(1) 마법의 비밀"

## 🎯 핵심 개념

### 해시 함수
```python
# 문자열 → 숫자 (인덱스)
def hash(key):
    return sum(ord(c) for c in key) % 10

hash("alice")  # 7
hash("bob")    # 1
```

### 해시 테이블 구조
```
Index  Data
  0    None
  1    ("bob", 25)
  2    None
  3    None
  4    None
  5    None
  6    None
  7    ("alice", 30)
  8    None
  9    None
```

## 💡 충돌 해결

### 1. Chaining (연결 리스트)
```python
class HashTable:
    def __init__(self, size=10):
        self.size = size
        self.table = [[] for _ in range(size)]
    
    def put(self, key, value):
        index = hash(key) % self.size
        # 같은 인덱스에 리스트로 저장
        self.table[index].append((key, value))
    
    def get(self, key):
        index = hash(key) % self.size
        for k, v in self.table[index]:
            if k == key:
                return v
        return None
```

### 2. Open Addressing (선형 탐사)
```python
def put(self, key, value):
    index = hash(key) % self.size
    
    # 빈 자리 찾을 때까지
    while self.table[index] is not None:
        index = (index + 1) % self.size
    
    self.table[index] = (key, value)
```

## ⚡ 시간 복잡도

| 연산 | 평균 | 최악 |
|------|------|------|
| 삽입 | O(1) | O(n) |
| 검색 | O(1) | O(n) |
| 삭제 | O(1) | O(n) |

**최악의 경우**: 모든 키가 같은 인덱스 (충돌)

## 💻 실무 사용

### Python
```python
# dict
user_ages = {}
user_ages["alice"] = 30  # O(1)
age = user_ages["alice"]  # O(1)

# set
unique_ids = set()
unique_ids.add(1)  # O(1)
if 1 in unique_ids:  # O(1)
    print("exists")
```

### Java
```java
// HashMap
Map<String, Integer> userAges = new HashMap<>();
userAges.put("alice", 30);
int age = userAges.get("alice");

// HashSet
Set<Integer> uniqueIds = new HashSet<>();
uniqueIds.add(1);
boolean exists = uniqueIds.contains(1);
```

## 🎯 사용 사례

1. **캐시**: Key-Value 저장
2. **중복 체크**: Set 사용
3. **카운팅**: `map[key] = count`
4. **그룹핑**: `map[category] = [items]`

---

**"해시테이블은 거의 모든 곳에 사용된다"**
