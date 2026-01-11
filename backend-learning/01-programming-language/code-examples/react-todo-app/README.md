# React TODO App - 핵심 개념 학습용

React의 핵심 개념을 모두 담은 간단한 TODO 애플리케이션입니다.

## 포함된 React 핵심 개념

### 1. **useState** - 상태 관리
- `TodoInput`: 입력 상태 관리
- `TodoApp`: 필터 상태 관리

### 2. **useEffect** - 부수 효과
- `useTodos`: localStorage 동기화

### 3. **Custom Hook** - 로직 재사용
- `useTodos`: TODO 관련 모든 로직 캡슐화

### 4. **useMemo** - 계산 캐싱
- 필터링된 TODO 목록 메모이제이션

### 5. **useCallback** - 함수 메모이제이션
- 이벤트 핸들러 최적화

### 6. **React.memo** - 리렌더링 최적화
- `TodoItem`, `TodoList` 컴포넌트

### 7. **TypeScript** - 타입 안정성
- 모든 컴포넌트와 함수에 타입 정의

### 8. **컴포넌트 분리** - 재사용성
- 단일 책임 원칙에 따른 컴포넌트 분리

## 프로젝트 구조

```
react-todo-app/
├── src/
│   ├── App.tsx                # 메인 앱 컴포넌트
│   ├── main.tsx              # 엔트리 포인트
│   ├── types.ts              # TypeScript 타입 정의
│   ├── hooks/
│   │   └── useTodos.ts       # Custom Hook
│   └── components/
│       ├── TodoInput.tsx     # 입력 컴포넌트
│       ├── TodoList.tsx      # 리스트 컴포넌트
│       ├── TodoItem.tsx      # 항목 컴포넌트
│       └── FilterButtons.tsx # 필터 버튼
├── package.json
├── tsconfig.json
└── index.html
```

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 주요 기능

- ✅ TODO 추가
- ✅ TODO 완료/미완료 토글
- ✅ TODO 삭제
- ✅ 필터링 (전체/진행중/완료)
- ✅ localStorage 자동 저장

## 학습 포인트

### 1. Custom Hook (`useTodos`)
```typescript
// 로직 재사용과 관심사 분리
const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
```

### 2. 불변성 유지
```typescript
// ✓ 올바른 방법 (spread 연산자)
setTodos(prev => [...prev, newTodo]);

// ✗ 잘못된 방법
todos.push(newTodo);
setTodos(todos);
```

### 3. useCallback으로 최적화
```typescript
// 함수 메모이제이션으로 불필요한 리렌더링 방지
const handleToggle = useCallback((id: number) => {
    setTodos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
}, []);
```

### 4. useMemo로 계산 최적화
```typescript
// 필터링 결과를 캐싱
const filteredTodos = useMemo(() => {
    return todos.filter(/* ... */);
}, [todos, filter]);
```

### 5. React.memo로 컴포넌트 최적화
```typescript
// Props가 변경되지 않으면 리렌더링 안함
const TodoItem = React.memo(({ todo, onToggle, onDelete }) => {
    // ...
});
```

## 코드 실습 가이드

1. **useState 연습**: `TodoInput.tsx`에서 입력 상태 관리 확인
2. **useEffect 연습**: `useTodos.ts`에서 localStorage 동기화 확인
3. **Custom Hook 연습**: `useTodos.ts`를 다른 프로젝트에도 재사용 가능
4. **최적화 연습**: React DevTools Profiler로 리렌더링 확인

## 확장 아이디어

- [ ] TODO 수정 기능
- [ ] 우선순위 설정
- [ ] 마감일 설정
- [ ] 카테고리 분류
- [ ] 검색 기능
- [ ] 드래그 앤 드롭 정렬
