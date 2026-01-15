# Graph Algorithms - BFS, DFS

> "그래프 탐색의 두 기둥"

## 🎯 BFS (너비 우선 탐색)

### 개념
- **큐(Queue)** 사용
- **레벨 순서**로 탐색
- **최단 경로** 찾기

### 구현
```python
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    
    while queue:
        node = queue.popleft()
        print(node)
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```

### 예제: 최단 경로
```python
def shortest_path(graph, start, end):
    queue = deque([(start, [start])])
    visited = {start}
    
    while queue:
        node, path = queue.popleft()
        
        if node == end:
            return path
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    
    return None
```

## 🎯 DFS (깊이 우선 탐색)

### 개념
- **스택(Stack) 또는 재귀** 사용
- **깊이 우선**으로 탐색
- **모든 경로** 탐색

### 구현 (재귀)
```python
def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(node)
    print(node)
    
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
```

### 구현 (스택)
```python
def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            print(node)
            
            for neighbor in graph[node]:
                if neighbor not in visited:
                    stack.append(neighbor)
```

## ⚖️ BFS vs DFS

| 특징 | BFS | DFS |
|------|-----|-----|
| 자료구조 | 큐 | 스택/재귀 |
| 메모리 | 많음 | 적음 |
| 최단 경로 | ✅ | ❌ |
| 모든 경로 | ❌ | ✅ |
| 사이클 감지 | ❌ | ✅ |

## 💻 실전 사용

### 1. 미로 최단 경로 (BFS)
```python
def maze_shortest_path(maze, start, end):
    rows, cols = len(maze), len(maze[0])
    queue = deque([(start, 0)])  # (position, distance)
    visited = {start}
    
    directions = [(0,1), (1,0), (0,-1), (-1,0)]
    
    while queue:
        (r, c), dist = queue.popleft()
        
        if (r, c) == end:
            return dist
        
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if (0 <= nr < rows and 0 <= nc < cols and
                maze[nr][nc] == 0 and (nr, nc) not in visited):
                visited.add((nr, nc))
                queue.append(((nr, nc), dist + 1))
    
    return -1
```

### 2. 사이클 감지 (DFS)
```python
def has_cycle(graph):
    def dfs(node, visited, rec_stack):
        visited.add(node)
        rec_stack.add(node)
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                if dfs(neighbor, visited, rec_stack):
                    return True
            elif neighbor in rec_stack:
                return True  # 사이클 발견!
        
        rec_stack.remove(node)
        return False
    
    visited = set()
    for node in graph:
        if node not in visited:
            if dfs(node, visited, set()):
                return True
    
    return False
```

## 🔗 다음 학습

- [04-Dynamic-Programming.md](./04-Dynamic-Programming.md)

---

**"BFS는 최단 경로, DFS는 모든 경로"**
