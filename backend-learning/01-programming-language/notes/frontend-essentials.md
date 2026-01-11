# JavaScript, TypeScript, React 실무 필수 핵심

## JavaScript 핵심

### 1. 호이스팅 (Hoisting)

**실행 전에 변수/함수를 메모리에 등록**

```javascript
호이스팅의 실제 원리:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

코드가 "올라가는" 게 아니라
JavaScript 엔진이 2단계로 실행:

1. Creation Phase (생성 단계):
   - 변수/함수를 메모리에 등록

2. Execution Phase (실행 단계):
   - 코드를 한 줄씩 실행

// 이 코드를
console.log(x);  // undefined
var x = 5;

// 엔진은 이렇게 처리:
// [Creation Phase]
// x: undefined (메모리 등록)

// [Execution Phase]
// console.log(x) → undefined
// x = 5 → 값 할당
```

#### 타입별 호이스팅

```javascript
// var - undefined로 초기화
console.log(name);  // undefined
var name = "John";

// let/const - TDZ (Temporal Dead Zone)
console.log(age);   // ReferenceError!
let age = 30;

// function 선언 - 전체 함수 저장
greet();  // "Hello!" (정상 동작!)
function greet() {
    console.log("Hello!");
}

// function expression - 변수처럼 동작
sayBye();  // TypeError!
var sayBye = function() {
    console.log("Bye!");
};
```

**실무 팁:**
```javascript
// ✓ 좋은 코드
const name = "John";
let age = 30;
console.log(name, age);

// ✗ 나쁜 코드
console.log(x);  // 헷갈림!
var x = 5;
```

---

### 2. 클로저 (Closure)

**함수 + 선언될 당시의 렉시컬 환경**

```javascript
클로저의 핵심:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

외부 함수가 종료되어도
내부 함수가 외부 변수를 참조 중이면
→ 가비지 컬렉션 안됨
→ 메모리에 계속 살아있음!

function outer() {
    const secret = "password";  // outer의 지역 변수

    return function inner() {
        console.log(secret);  // outer 변수 접근!
    };
}

const myFunc = outer();  // outer 종료됨
myFunc();  // "password" - 여전히 접근 가능!

[메모리 상태]
outer 함수: 종료됨 (접근 불가)
secret 변수: 메모리에 살아있음 (inner가 참조 중)
inner 함수: myFunc로 살아있음
```

#### 실무 활용 예시

```javascript
// 1. Private 변수 (캡슐화)
function createCounter() {
    let count = 0;  // private 변수

    return {
        increment: () => ++count,
        decrement: () => --count,
        getCount: () => count
    };
}

const counter = createCounter();
counter.increment();  // 1
counter.increment();  // 2
console.log(counter.count);  // undefined (접근 불가!)

// 2. 함수 팩토리
function multiply(x) {
    return function(y) {
        return x * y;
    };
}

const double = multiply(2);
const triple = multiply(3);
console.log(double(5));  // 10
console.log(triple(5));  // 15

// 3. React의 useState (클로저 활용)
function useState(initialValue) {
    let state = initialValue;  // 클로저!

    function setState(newValue) {
        state = newValue;
        render();  // 리렌더링
    }

    return [state, setState];
}
```

**주의사항:**
```javascript
// 메모리 누수 조심!
function createHeavyObject() {
    const hugeArray = new Array(1000000).fill("data");

    return function() {
        console.log("Hello");
        // hugeArray를 안 쓰는데 메모리에 유지됨!
    };
}

// 해결: 필요한 것만 참조
function createHeavyObject() {
    const hugeArray = new Array(1000000).fill("data");
    const result = hugeArray.length;  // 필요한 값만 추출

    return function() {
        console.log(result);  // 작은 값만 참조
        // hugeArray는 GC됨!
    };
}
```

---

### 3. this 바인딩

**this는 "어떻게 호출되었는지"에 따라 결정됨**

```javascript
this 바인딩 규칙:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 기본 바인딩: 전역 객체 (strict mode에서는 undefined)
2. 암시적 바인딩: 메서드를 호출한 객체
3. 명시적 바인딩: call, apply, bind
4. new 바인딩: 새로 생성된 객체
5. 화살표 함수: 렉시컬 this (상위 스코프)
```

#### 실무 예시

```javascript
// 1. 일반 함수 vs 화살표 함수
const user = {
    name: "John",

    // 일반 함수
    greet: function() {
        console.log(`Hello, ${this.name}`);
    },

    // 화살표 함수
    greetArrow: () => {
        console.log(`Hello, ${this.name}`);
    },

    // 메서드 안에서 콜백
    delayedGreet: function() {
        // 잘못된 방법
        setTimeout(function() {
            console.log(this.name);  // undefined!
        }, 1000);

        // 올바른 방법 1: 화살표 함수
        setTimeout(() => {
            console.log(this.name);  // "John"
        }, 1000);

        // 올바른 방법 2: bind
        setTimeout(function() {
            console.log(this.name);  // "John"
        }.bind(this), 1000);
    }
};

user.greet();       // "Hello, John"
user.greetArrow();  // "Hello, undefined" (화살표는 user 안 봄)

// 2. 이벤트 리스너
button.addEventListener('click', function() {
    console.log(this);  // button 요소
});

button.addEventListener('click', () => {
    console.log(this);  // window (렉시컬 this)
});

// 3. 클래스에서
class Component {
    constructor() {
        this.state = { count: 0 };

        // bind 필요 (일반 메서드)
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState({ count: this.state.count + 1 });
    }

    // 또는 화살표 함수로 정의 (bind 불필요)
    handleClickArrow = () => {
        this.setState({ count: this.state.count + 1 });
    }
}
```

---

### 4. Promise와 async/await

**비동기 처리의 핵심**

```javascript
Promise의 3가지 상태:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Pending (대기): 비동기 작업 진행 중
2. Fulfilled (이행): 작업 성공
3. Rejected (거부): 작업 실패
```

#### 기본 사용

```javascript
// Promise 생성
const fetchUser = new Promise((resolve, reject) => {
    setTimeout(() => {
        const user = { id: 1, name: "John" };
        resolve(user);  // 성공
        // reject(new Error("Failed"));  // 실패
    }, 1000);
});

// Promise 사용
fetchUser
    .then(user => {
        console.log(user);
        return fetch(`/api/posts/${user.id}`);
    })
    .then(response => response.json())
    .then(posts => console.log(posts))
    .catch(error => console.error(error))
    .finally(() => console.log("완료"));

// async/await (더 읽기 쉬움)
async function getUserPosts() {
    try {
        const user = await fetchUser;
        const response = await fetch(`/api/posts/${user.id}`);
        const posts = await response.json();
        console.log(posts);
    } catch (error) {
        console.error(error);
    } finally {
        console.log("완료");
    }
}
```

#### Promise.all과 대안들

```javascript
// Promise.all - 모두 성공해야 함
const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
]);
// 하나라도 실패하면 즉시 reject

// Promise.allSettled - 모든 결과 받기
const results = await Promise.allSettled([
    fetchUser(),
    fetchPosts(),
    fetchComments()
]);

results.forEach(result => {
    if (result.status === 'fulfilled') {
        console.log("성공:", result.value);
    } else {
        console.log("실패:", result.reason);
    }
});

// Promise.race - 가장 빠른 것만
const fastest = await Promise.race([
    fetch('/api/server1'),
    fetch('/api/server2'),
    fetch('/api/server3')
]);

// Promise.any - 하나라도 성공하면 OK
const any = await Promise.any([
    fetch('/api/backup1'),
    fetch('/api/backup2'),
    fetch('/api/backup3')
]);
```

**실무 패턴:**
```javascript
// 에러 처리
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('HTTP error');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch:", error);
        return null;  // 기본값 반환
    }
}

// 재시도
async function fetchWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            console.log(`재시도 ${i + 1}...`);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

// 타임아웃
function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), ms);
    });
    return Promise.race([promise, timeout]);
}

await withTimeout(fetch('/api/slow'), 3000);
```

---

### 5. 배열 메서드 (실무 필수!)

```javascript
실무에서 매일 쓰는 메서드:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

map:    배열 변환 (새 배열 반환)
filter: 조건에 맞는 것만 (새 배열)
reduce: 하나의 값으로 축약
find:   조건에 맞는 첫 요소
some:   하나라도 만족하면 true
every:  모두 만족하면 true
```

#### 실전 예시

```javascript
const users = [
    { id: 1, name: "John", age: 25, active: true },
    { id: 2, name: "Jane", age: 30, active: false },
    { id: 3, name: "Bob", age: 35, active: true }
];

// map - 변환
const names = users.map(user => user.name);
// ["John", "Jane", "Bob"]

const userCards = users.map(user => ({
    ...user,
    displayName: `${user.name} (${user.age}세)`
}));

// filter - 필터링
const activeUsers = users.filter(user => user.active);
// [{ id: 1, ... }, { id: 3, ... }]

const adults = users.filter(user => user.age >= 30);

// reduce - 집계
const totalAge = users.reduce((sum, user) => sum + user.age, 0);
// 90

const userById = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
}, {});
// { 1: {...}, 2: {...}, 3: {...} }

// find - 검색
const user = users.find(u => u.id === 2);
// { id: 2, name: "Jane", ... }

// some - 존재 여부
const hasInactive = users.some(user => !user.active);
// true

// every - 전체 확인
const allAdults = users.every(user => user.age >= 18);
// true

// 체이닝
const activeUserNames = users
    .filter(user => user.active)
    .map(user => user.name)
    .sort();
// ["Bob", "John"]
```

**실무 패턴:**
```javascript
// React에서 리스트 렌더링
function UserList({ users }) {
    return (
        <ul>
            {users
                .filter(user => user.active)
                .map(user => (
                    <li key={user.id}>{user.name}</li>
                ))
            }
        </ul>
    );
}

// 데이터 변환
const apiResponse = await fetch('/api/users').then(r => r.json());
const transformedData = apiResponse.data.map(item => ({
    id: item.user_id,
    name: item.full_name,
    email: item.email_address
}));

// 그룹화
const usersByAge = users.reduce((groups, user) => {
    const age = user.age;
    if (!groups[age]) groups[age] = [];
    groups[age].push(user);
    return groups;
}, {});
// { 25: [...], 30: [...], 35: [...] }
```

---

### 6. 구조 분해 할당과 스프레드

```javascript
// 객체 구조 분해
const user = { id: 1, name: "John", age: 25 };
const { name, age } = user;
console.log(name, age);  // "John" 25

// 기본값
const { role = "user" } = user;
console.log(role);  // "user"

// 이름 변경
const { name: userName } = user;
console.log(userName);  // "John"

// 배열 구조 분해
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(first);  // 1
console.log(rest);   // [3, 4, 5]

// 함수 매개변수
function greet({ name, age }) {
    console.log(`${name} is ${age} years old`);
}
greet(user);

// 스프레드 연산자
const original = { a: 1, b: 2 };
const copy = { ...original };  // 얕은 복사
const extended = { ...original, c: 3 };  // { a: 1, b: 2, c: 3 }
const overridden = { ...original, b: 10 };  // { a: 1, b: 10 }

// 배열 스프레드
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];  // [1, 2, 3, 4, 5]
const merged = [...arr1, ...arr2];

// Rest 파라미터
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4);  // 10
```

**React에서 활용:**
```javascript
// Props 전달
const userProps = { name: "John", age: 25, email: "john@example.com" };
<UserCard {...userProps} />

// State 업데이트 (불변성 유지)
const [user, setUser] = useState({ name: "John", age: 25 });

// ✓ 올바른 방법
setUser({ ...user, age: 26 });

// ✗ 잘못된 방법
user.age = 26;  // 직접 수정 금지!
setUser(user);

// 배열 업데이트
const [todos, setTodos] = useState([...]);

// 추가
setTodos([...todos, newTodo]);

// 삭제
setTodos(todos.filter(t => t.id !== deletedId));

// 수정
setTodos(todos.map(t =>
    t.id === updatedId ? { ...t, completed: true } : t
));
```

---

## TypeScript 핵심

### 1. 기본 타입

```typescript
타입의 종류:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

원시 타입: string, number, boolean, null, undefined
배열: number[], Array<number>
객체: { name: string; age: number }
함수: (x: number) => number
특수: any, unknown, never, void
```

#### 기본 사용

```typescript
// 기본 타입
let name: string = "John";
let age: number = 25;
let isActive: boolean = true;

// 배열
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["John", "Jane"];

// 객체
let user: { name: string; age: number } = {
    name: "John",
    age: 25
};

// 함수
function add(a: number, b: number): number {
    return a + b;
}

const multiply = (a: number, b: number): number => a * b;

// Optional
function greet(name: string, greeting?: string): string {
    return `${greeting || "Hello"}, ${name}`;
}

// 유니온 타입
let id: string | number;
id = 123;
id = "abc";

// 리터럴 타입
let status: "pending" | "success" | "error";
status = "success";  // OK
// status = "loading";  // Error!

// 타입 별칭
type User = {
    id: number;
    name: string;
    email: string;
};

type ID = string | number;
```

---

### 2. Interface vs Type

```typescript
언제 무엇을 쓸까?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Interface:
- 객체 모양 정의
- 확장 가능 (extends)
- 선언 병합 가능
- 클래스 구현 가능

Type:
- 모든 타입 정의 가능
- 유니온, 인터섹션
- 유틸리티 타입
- Mapped Types
```

#### 실전 비교

```typescript
// Interface - 객체 구조
interface User {
    id: number;
    name: string;
    email: string;
}

// 확장
interface AdminUser extends User {
    role: "admin";
    permissions: string[];
}

// 선언 병합
interface User {
    createdAt: Date;  // 자동으로 합쳐짐
}

// Type - 더 유연함
type ID = string | number;

type User = {
    id: ID;
    name: string;
    email: string;
};

// 인터섹션
type AdminUser = User & {
    role: "admin";
    permissions: string[];
};

// 유니온
type Status = "pending" | "success" | "error";

// 조건부 타입
type IsString<T> = T extends string ? true : false;

// Mapped Type
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
```

**실무 권장:**
```typescript
// ✓ Interface 사용
interface Props {
    title: string;
    onSubmit: (data: FormData) => void;
}

// ✓ Type 사용
type Status = "idle" | "loading" | "success" | "error";
type RequestState = {
    status: Status;
    data: User | null;
    error: Error | null;
};

// React Component Props
interface ButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    variant?: "primary" | "secondary";
}

function Button({ children, onClick, variant = "primary" }: ButtonProps) {
    return <button onClick={onClick}>{children}</button>;
}
```

---

### 3. 제네릭 (Generics)

**타입을 파라미터화**

```typescript
제네릭의 목적:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

재사용 가능한 타입 안전 코드
타입을 함수처럼 전달
```

#### 기본 사용

```typescript
// 제네릭 함수
function identity<T>(value: T): T {
    return value;
}

identity<number>(123);  // number
identity<string>("hello");  // string
identity(true);  // boolean (타입 추론)

// 배열 다루기
function getFirst<T>(arr: T[]): T | undefined {
    return arr[0];
}

const first = getFirst([1, 2, 3]);  // number
const firstStr = getFirst(["a", "b"]);  // string

// 제네릭 인터페이스
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

type UserResponse = ApiResponse<User>;
type PostsResponse = ApiResponse<Post[]>;

// 제네릭 타입
type Nullable<T> = T | null;
type Optional<T> = T | undefined;

let user: Nullable<User> = null;
let post: Optional<Post> = undefined;

// 제약 조건
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const user = { name: "John", age: 25 };
getProperty(user, "name");  // OK
// getProperty(user, "email");  // Error!
```

**실무 예시:**
```typescript
// API 함수
async function fetchData<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return response.json();
}

const user = await fetchData<User>('/api/user');
const posts = await fetchData<Post[]>('/api/posts');

// React 상태
function useState<T>(initialValue: T): [T, (value: T) => void] {
    // ...
}

const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);

// 재사용 가능한 컴포넌트
interface ListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
    return (
        <ul>
            {items.map(item => (
                <li key={keyExtractor(item)}>
                    {renderItem(item)}
                </li>
            ))}
        </ul>
    );
}

// 사용
<List<User>
    items={users}
    renderItem={user => <span>{user.name}</span>}
    keyExtractor={user => user.id.toString()}
/>
```

---

### 4. Utility Types (실무 필수!)

```typescript
자주 쓰는 Utility Types:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Partial<T>     - 모든 속성을 optional로
Required<T>    - 모든 속성을 required로
Readonly<T>    - 모든 속성을 readonly로
Pick<T, K>     - 특정 속성만 선택
Omit<T, K>     - 특정 속성 제외
Record<K, T>   - 키-값 매핑
```

#### 실전 활용

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

// Partial - 일부만 업데이트
function updateUser(id: number, updates: Partial<User>) {
    // updates는 { name?: string; email?: string; ... }
}
updateUser(1, { name: "Jane" });  // OK
updateUser(1, { age: 26 });  // OK

// Pick - 필요한 것만
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }

// Omit - 제외
type UserWithoutId = Omit<User, "id">;
// { name: string; email: string; age: number }

// Record - 딕셔너리
type UserMap = Record<number, User>;
const users: UserMap = {
    1: { id: 1, name: "John", ... },
    2: { id: 2, name: "Jane", ... }
};

type StatusMessages = Record<Status, string>;
const messages: StatusMessages = {
    pending: "대기 중...",
    success: "성공!",
    error: "실패!"
};

// Readonly - 불변
const config: Readonly<Config> = {
    apiUrl: "https://api.example.com",
    timeout: 5000
};
// config.apiUrl = "...";  // Error!

// ReturnType - 함수 반환 타입 추출
function getUser() {
    return { id: 1, name: "John" };
}
type UserType = ReturnType<typeof getUser>;
// { id: number; name: string }

// Parameters - 함수 파라미터 타입 추출
function createUser(name: string, age: number) {
    // ...
}
type CreateUserParams = Parameters<typeof createUser>;
// [string, number]
```

**React 실무:**
```typescript
// Props에서 일부만 사용
interface ButtonProps {
    variant: "primary" | "secondary";
    size: "small" | "medium" | "large";
    disabled: boolean;
    onClick: () => void;
}

// IconButton은 size를 제외
type IconButtonProps = Omit<ButtonProps, "size">;

// Form 데이터
interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

// 생성 시에는 id, createdAt 제외
type CreateUserInput = Omit<User, "id" | "createdAt">;

// 업데이트 시에는 일부만
type UpdateUserInput = Partial<CreateUserInput>;
```

---

## React 핵심

### 1. 컴포넌트와 Props

```typescript
컴포넌트의 원칙:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Props는 읽기 전용 (불변)
2. 순수 함수처럼 동작
3. 같은 Props → 같은 결과
```

#### 기본 구조

```typescript
// Props 타입 정의
interface UserCardProps {
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
    onEdit?: () => void;
    className?: string;
}

// 함수 컴포넌트
function UserCard({ user, onEdit, className }: UserCardProps) {
    return (
        <div className={className}>
            <img src={user.avatar || "/default.png"} alt={user.name} />
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            {onEdit && <button onClick={onEdit}>수정</button>}
        </div>
    );
}

// children 사용
interface CardProps {
    title: string;
    children: React.ReactNode;
}

function Card({ title, children }: CardProps) {
    return (
        <div className="card">
            <h2>{title}</h2>
            <div>{children}</div>
        </div>
    );
}

// 사용
<Card title="User Info">
    <UserCard user={user} />
</Card>
```

**Props 전달 패턴:**
```typescript
// Props 펼치기
const userProps = { name: "John", email: "john@example.com" };
<UserCard user={userProps} />

// 또는
<UserCard {...{ user: userProps, onEdit: handleEdit }} />

// 조건부 Props
<UserCard
    user={user}
    {...(isEditable && { onEdit: handleEdit })}
/>

// Default Props (함수 매개변수)
function Button({
    variant = "primary",
    size = "medium",
    children
}: ButtonProps) {
    // ...
}
```

---

### 2. useState - 상태 관리

```typescript
useState의 핵심:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 컴포넌트의 "기억"
2. 상태 변경 → 리렌더링
3. 불변성 유지 필수!
```

#### 기본 사용

```typescript
// 간단한 상태
const [count, setCount] = useState(0);
const [name, setName] = useState("");
const [isOpen, setIsOpen] = useState(false);

// 타입 지정
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);

// 초기값이 복잡한 경우 (함수 사용)
const [state, setState] = useState(() => {
    const saved = localStorage.getItem("state");
    return saved ? JSON.parse(saved) : initialState;
});

// 함수형 업데이트 (이전 값 기반)
const [count, setCount] = useState(0);

// ✓ 좋은 방법
setCount(prev => prev + 1);
setCount(prev => prev + 1);  // 정확하게 +2

// ✗ 나쁜 방법
setCount(count + 1);
setCount(count + 1);  // +2가 아니라 +1!
```

**실무 패턴:**
```typescript
// 객체 상태 업데이트
const [user, setUser] = useState({
    name: "John",
    age: 25,
    email: "john@example.com"
});

// ✓ 올바른 방법 (불변성 유지)
setUser({ ...user, age: 26 });
setUser(prev => ({ ...prev, age: 26 }));

// ✗ 잘못된 방법
user.age = 26;  // 직접 수정 금지!
setUser(user);

// 배열 상태
const [todos, setTodos] = useState<Todo[]>([]);

// 추가
setTodos([...todos, newTodo]);
setTodos(prev => [...prev, newTodo]);

// 삭제
setTodos(todos.filter(t => t.id !== deletedId));

// 수정
setTodos(todos.map(t =>
    t.id === updatedId ? { ...t, completed: true } : t
));

// 토글
setTodos(todos.map(t =>
    t.id === toggledId ? { ...t, completed: !t.completed } : t
));

// Form 상태 관리
const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
    }));
};
```

---

### 3. useEffect - 부수 효과

```typescript
useEffect의 역할:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

렌더링 "후"에 실행되는 코드
- API 호출
- 구독 (subscription)
- DOM 조작
- 타이머
```

#### 기본 패턴

```typescript
// 1. 마운트 시 한 번만 (의존성 [])
useEffect(() => {
    console.log("컴포넌트 마운트!");

    // Cleanup (언마운트 시)
    return () => {
        console.log("컴포넌트 언마운트!");
    };
}, []);

// 2. 특정 값 변경 시
useEffect(() => {
    console.log("userId 변경:", userId);
    fetchUser(userId);
}, [userId]);

// 3. 매 렌더링마다 (권장 안함)
useEffect(() => {
    console.log("렌더링됨");
});

// 4. API 호출
useEffect(() => {
    async function fetchData() {
        try {
            const response = await fetch(`/api/user/${userId}`);
            const data = await response.json();
            setUser(data);
        } catch (error) {
            setError(error);
        }
    }

    fetchData();
}, [userId]);

// 5. 구독 패턴
useEffect(() => {
    const subscription = api.subscribe(userId, data => {
        setData(data);
    });

    return () => {
        subscription.unsubscribe();  // Cleanup!
    };
}, [userId]);

// 6. 타이머
useEffect(() => {
    const timer = setInterval(() => {
        setCount(c => c + 1);
    }, 1000);

    return () => clearInterval(timer);  // Cleanup!
}, []);
```

**실무 주의사항:**
```typescript
// ✗ 무한 루프 주의!
const [count, setCount] = useState(0);

useEffect(() => {
    setCount(count + 1);  // 리렌더링 → useEffect 실행 → 무한 루프!
}, [count]);

// ✓ 올바른 방법
useEffect(() => {
    const timer = setInterval(() => {
        setCount(c => c + 1);  // 함수형 업데이트
    }, 1000);

    return () => clearInterval(timer);
}, []);  // 빈 배열!

// ✗ async를 직접 사용하면 안됨
useEffect(async () => {  // Error!
    const data = await fetchData();
}, []);

// ✓ 내부에서 async 함수 정의
useEffect(() => {
    async function loadData() {
        const data = await fetchData();
        setData(data);
    }
    loadData();
}, []);

// 또는 IIFE
useEffect(() => {
    (async () => {
        const data = await fetchData();
        setData(data);
    })();
}, []);
```

---

### 4. useMemo와 useCallback - 최적화

```typescript
최적화 Hook:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useMemo: 계산 결과를 메모이제이션
useCallback: 함수를 메모이제이션
```

#### useMemo - 비싼 계산 캐싱

```typescript
// ✗ 매 렌더링마다 재계산 (비효율)
function UserList({ users }) {
    const sortedUsers = users.sort((a, b) =>
        a.name.localeCompare(b.name)
    );  // 렌더링마다 정렬!

    return <div>{sortedUsers.map(...)}</div>;
}

// ✓ useMemo로 최적화
function UserList({ users }) {
    const sortedUsers = useMemo(() => {
        console.log("정렬 실행!");
        return users.sort((a, b) => a.name.localeCompare(b.name));
    }, [users]);  // users가 바뀔 때만 재계산

    return <div>{sortedUsers.map(...)}</div>;
}

// 복잡한 필터링
const filteredItems = useMemo(() => {
    return items
        .filter(item => item.category === selectedCategory)
        .filter(item => item.price >= minPrice)
        .sort((a, b) => b.rating - a.rating);
}, [items, selectedCategory, minPrice]);

// 객체/배열 생성
const config = useMemo(() => ({
    theme: isDark ? "dark" : "light",
    fontSize: size
}), [isDark, size]);
```

#### useCallback - 함수 메모이제이션

```typescript
// ✗ 매 렌더링마다 새 함수 생성
function Parent() {
    const [count, setCount] = useState(0);

    const handleClick = () => {  // 렌더링마다 새 함수!
        console.log("clicked");
    };

    return <Child onClick={handleClick} />;
    // Child는 매번 리렌더링됨 (props 변경으로 인식)
}

// ✓ useCallback으로 최적화
function Parent() {
    const [count, setCount] = useState(0);

    const handleClick = useCallback(() => {
        console.log("clicked");
    }, []);  // 한 번만 생성!

    return <Child onClick={handleClick} />;
    // Child는 불필요한 리렌더링 안됨
}

// 상태 업데이트 함수
const handleDelete = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
}, []);  // setItems는 안정적이라 의존성 불필요

// 외부 값 사용
const handleSubmit = useCallback((data: FormData) => {
    api.submit(userId, data);
}, [userId]);  // userId 변경 시에만 재생성
```

**언제 사용할까?**
```typescript
// useMemo 사용 시기:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 비싼 계산 (정렬, 필터링, 복잡한 연산)
2. 참조 동등성이 중요한 경우
3. 성능 문제가 실제로 있을 때

// useCallback 사용 시기:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 자식 컴포넌트에 props로 전달
2. useEffect의 의존성
3. 다른 Hook의 의존성

// 주의: 과도한 최적화는 오히려 해로움!
// 실제 성능 문제가 있을 때만 사용
```

---

### 5. Custom Hooks

```typescript
Custom Hook의 장점:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 로직 재사용
2. 코드 분리
3. 테스트 용이
4. 가독성 향상
```

#### 실무 예시

```typescript
// 1. API 호출
function useFetch<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(url);
                const json = await response.json();
                setData(json);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [url]);

    return { data, loading, error };
}

// 사용
function UserProfile({ userId }: { userId: number }) {
    const { data: user, loading, error } = useFetch<User>(
        `/api/users/${userId}`
    );

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>에러: {error.message}</div>;

    return <div>{user?.name}</div>;
}

// 2. Form 관리
function useForm<T>(initialValues: T) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

    const handleChange = (name: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
    };

    return { values, errors, setErrors, handleChange, reset };
}

// 사용
function LoginForm() {
    const { values, handleChange, reset } = useForm({
        email: "",
        password: ""
    });

    return (
        <form>
            <input
                value={values.email}
                onChange={e => handleChange("email", e.target.value)}
            />
            <input
                value={values.password}
                onChange={e => handleChange("password", e.target.value)}
            />
        </form>
    );
}

// 3. LocalStorage 동기화
function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue] as const;
}

// 사용
function App() {
    const [theme, setTheme] = useLocalStorage("theme", "light");
    const [user, setUser] = useLocalStorage<User | null>("user", null);

    return <div>...</div>;
}

// 4. Debounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// 사용 (검색 입력)
function SearchBox() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (debouncedSearchTerm) {
            // API 호출 (500ms 후)
            searchAPI(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm]);

    return (
        <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
    );
}
```

---

### 6. 리렌더링 최적화

```typescript
리렌더링이 발생하는 경우:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. State 변경
2. Props 변경
3. 부모 컴포넌트 리렌더링
4. Context 값 변경
```

#### React.memo

```typescript
// ✗ 부모가 리렌더링되면 자식도 리렌더링
function Child({ name }: { name: string }) {
    console.log("Child 렌더링!");
    return <div>{name}</div>;
}

function Parent() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
            <Child name="John" />  {/* count 변경마다 리렌더링! */}
        </div>
    );
}

// ✓ React.memo로 최적화
const Child = React.memo(({ name }: { name: string }) => {
    console.log("Child 렌더링!");
    return <div>{name}</div>;
});

// Props가 같으면 리렌더링 안됨!

// 커스텀 비교 함수
const Child = React.memo(
    ({ user }: { user: User }) => {
        return <div>{user.name}</div>;
    },
    (prevProps, nextProps) => {
        // true 반환 → 리렌더링 안함
        // false 반환 → 리렌더링
        return prevProps.user.id === nextProps.user.id;
    }
);
```

**최적화 체크리스트:**
```typescript
// 1. 불필요한 상태 제거
// ✗ 나쁜 예
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [fullName, setFullName] = useState("");  // 불필요!

useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✓ 좋은 예
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const fullName = `${firstName} ${lastName}`;  // 계산으로 충분!

// 2. 상태 끌어올리기 최소화
// ✗ 나쁜 예 (전체가 리렌더링)
function App() {
    const [query, setQuery] = useState("");  // 검색어

    return (
        <div>
            <SearchBox query={query} onChange={setQuery} />
            <ExpensiveComponent />  {/* query 변경마다 리렌더링! */}
            <AnotherExpensiveComponent />
        </div>
    );
}

// ✓ 좋은 예 (분리)
function SearchSection() {
    const [query, setQuery] = useState("");  // 여기로 이동!

    return <SearchBox query={query} onChange={setQuery} />;
}

function App() {
    return (
        <div>
            <SearchSection />
            <ExpensiveComponent />  {/* 리렌더링 안됨! */}
            <AnotherExpensiveComponent />
        </div>
    );
}

// 3. Key 제대로 사용
// ✗ 나쁜 예
{items.map((item, index) => (
    <Item key={index} {...item} />  // index는 안정적이지 않음!
))}

// ✓ 좋은 예
{items.map(item => (
    <Item key={item.id} {...item} />  // 고유 ID 사용!
))}
```

---

## 실무 종합 예시

### 완전한 TODO 앱

```typescript
// types.ts
interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
}

type Filter = "all" | "active" | "completed";

// hooks/useTodos.ts
function useTodos() {
    const [todos, setTodos] = useLocalStorage<Todo[]>("todos", []);
    const [filter, setFilter] = useState<Filter>("all");

    const addTodo = useCallback((text: string) => {
        const newTodo: Todo = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date()
        };
        setTodos(prev => [...prev, newTodo]);
    }, [setTodos]);

    const toggleTodo = useCallback((id: number) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    }, [setTodos]);

    const deleteTodo = useCallback((id: number) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    }, [setTodos]);

    const filteredTodos = useMemo(() => {
        switch (filter) {
            case "active":
                return todos.filter(t => !t.completed);
            case "completed":
                return todos.filter(t => t.completed);
            default:
                return todos;
        }
    }, [todos, filter]);

    return {
        todos: filteredTodos,
        filter,
        setFilter,
        addTodo,
        toggleTodo,
        deleteTodo
    };
}

// components/TodoApp.tsx
function TodoApp() {
    const { todos, filter, setFilter, addTodo, toggleTodo, deleteTodo } = useTodos();

    return (
        <div>
            <h1>TODO List</h1>
            <TodoInput onAdd={addTodo} />
            <FilterButtons current={filter} onChange={setFilter} />
            <TodoList
                todos={todos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
            />
        </div>
    );
}

// components/TodoInput.tsx
interface TodoInputProps {
    onAdd: (text: string) => void;
}

function TodoInput({ onAdd }: TodoInputProps) {
    const [text, setText] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd(text);
            setText("");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="새 할 일..."
            />
            <button type="submit">추가</button>
        </form>
    );
}

// components/TodoList.tsx
interface TodoListProps {
    todos: Todo[];
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}

const TodoList = React.memo(({ todos, onToggle, onDelete }: TodoListProps) => {
    return (
        <ul>
            {todos.map(todo => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    );
});

// components/TodoItem.tsx
interface TodoItemProps {
    todo: Todo;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}

const TodoItem = React.memo(({ todo, onToggle, onDelete }: TodoItemProps) => {
    return (
        <li>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
                {todo.text}
            </span>
            <button onClick={() => onDelete(todo.id)}>삭제</button>
        </li>
    );
});
```

---

## 핵심 정리

### JavaScript 필수 5가지

```
1. 호이스팅: var 쓰지 말고 let/const
2. 클로저: 함수 + 렉시컬 환경 = Private 변수 가능
3. this: 화살표 함수로 해결
4. Promise/async-await: 비동기는 이것만
5. 배열 메서드: map, filter, reduce 마스터
```

### TypeScript 필수 5가지

```
1. 기본 타입: 항상 타입 명시
2. Interface vs Type: 객체는 Interface, 나머지는 Type
3. 제네릭: 재사용 가능한 타입
4. Utility Types: Partial, Pick, Omit 활용
5. 타입 추론: 불필요한 타입 명시 줄이기
```

### React 필수 5가지

```
1. useState: 불변성 유지 (spread 연산자)
2. useEffect: 의존성 배열 정확히
3. useMemo/useCallback: 필요할 때만
4. Custom Hooks: 로직 재사용
5. React.memo: 불필요한 리렌더링 방지
```

---

## 실무 체크리스트

### JavaScript

```
✓ var 대신 const/let 사용
✓ 화살표 함수로 this 문제 해결
✓ async/await로 비동기 처리
✓ map/filter/reduce로 배열 다루기
✓ 구조 분해 할당과 스프레드 연산자 활용
```

### TypeScript

```
✓ any 사용 최소화
✓ 타입 추론 활용
✓ 제네릭으로 재사용 가능한 코드 작성
✓ Utility Types 적극 활용
✓ strict 모드 활성화
```

### React

```
✓ 상태 최소화 (계산 가능한 값은 상태로 안 만듦)
✓ 불변성 유지 (직접 수정 금지)
✓ Key prop 올바르게 사용
✓ useEffect 의존성 배열 정확히
✓ 과도한 최적화 피하기 (실제 문제가 있을 때만)
```

---

*Last updated: 2026-01-11*
