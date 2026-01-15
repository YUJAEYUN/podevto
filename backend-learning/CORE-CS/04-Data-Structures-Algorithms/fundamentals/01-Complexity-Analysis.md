# Big-O 복잡도 분석

> "알고리즘의 효율성을 수치로 표현"

## 🎯 시간 복잡도

### O(1) - 상수 시간
```python
def get_first(arr):
    return arr[0]  # 항상 1번
```

### O(log n) - 로그 시간
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# n=1000 → 약 10번 비교
# n=1000000 → 약 20번 비교
```

### O(n) - 선형 시간
```python
def find_max(arr):
    max_val = arr[0]
    for num in arr:  # n번
        if num > max_val:
            max_val = num
    return max_val
```

### O(n log n) - 선형 로그 시간
```python
def merge_sort(arr):
    # 병합 정렬
    # 최선/평균/최악 모두 O(n log n)
    pass
```

### O(n²) - 제곱 시간
```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):       # n번
        for j in range(n-i-1):  # n번
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
```

### O(2ⁿ) - 지수 시간
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)  # 지수적 증가
```

## 📊 복잡도 비교

```
n=100일 때:
O(1):       1
O(log n):   7
O(n):       100
O(n log n): 700
O(n²):      10,000
O(2ⁿ):      1,267,650,600,228,229,401,496,703,205,376 😱
```

## 💡 실전 팁

### 1. 반복문 카운트
```python
# O(n)
for i in range(n):
    print(i)

# O(n²)
for i in range(n):
    for j in range(n):
        print(i, j)

# O(n log n)
for i in range(n):
    j = 1
    while j < n:
        print(i, j)
        j *= 2  # 로그
```

### 2. 최악의 경우 고려
```python
# 평균 O(1), 최악 O(n)
def hash_search(hash_map, key):
    return hash_map.get(key)
    # 충돌 시 O(n)
```

## 🎯 목표 복잡도

```
n ≤ 10:       O(n!) 브루트포스
n ≤ 20:       O(2ⁿ) 백트래킹
n ≤ 500:      O(n³)
n ≤ 5,000:    O(n²)
n ≤ 1,000,000: O(n log n) 정렬
n ≤ 10,000,000: O(n) 선형
```

---

**"알고리즘 선택은 복잡도 분석에서 시작한다"**
