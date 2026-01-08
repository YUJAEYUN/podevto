# N+1 쿼리 문제 (N+1 Query Problem)

> 데이터베이스 성능을 저해하는 가장 흔한 안티패턴

## 개요

**N+1 쿼리 문제**는 데이터를 가져오기 위해 1개의 초기 쿼리 실행 후, N개의 추가 쿼리를 실행하는 비효율적인 데이터 접근 패턴입니다.

### 핵심 아이디어

```
"1개의 쿼리로 충분한 작업에 N+1개의 쿼리를 실행하는 것"

┌─────────────────────────────────────────────────────────────┐
│                    N+1 쿼리 문제 시각화                      │
│                                                             │
│   1번 쿼리: 모든 카테고리 조회                               │
│       SELECT * FROM categories                              │
│              ↓                                              │
│       [Cat1] [Cat2] [Cat3] ... [CatN]                       │
│         ↓      ↓      ↓          ↓                          │
│       쿼리2  쿼리3  쿼리4  ... 쿼리N+1                        │
│                                                             │
│   총 쿼리 수: 1 + N = N+1개 😱                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 왜 문제인가?

### 흔한 오해

```
❌ "많은 작은 쿼리가 하나의 큰 쿼리보다 효율적이다"

✅ 실제로는 정반대!
─────────────────────────────────────────
• 각 쿼리마다 네트워크 왕복(Round-trip) 발생
• 데이터베이스 연결 오버헤드 누적
• DB 최적화(인덱스, 캐시 등)를 제대로 활용 못함
```

### 성능 영향

| 상황 | 쿼리 수 | 예상 소요 시간 |
|------|---------|----------------|
| N+1 방식 (17개 카테고리, 800개 항목) | 18번 | ~1초 이상 |
| JOIN 사용 (동일 데이터) | 1번 | ~0.16초 |
| **성능 향상** | - | **약 10배** |

---

## 구체적인 예시

### 테이블 구조

```
┌─────────────────┐       ┌─────────────────┐
│   categories    │       │     items       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ category_id (FK)│
│ name            │       │ id (PK)         │
│ description     │       │ name            │
└─────────────────┘       │ price           │
                          └─────────────────┘
```

### 문제가 되는 코드 (N+1)

```php
// 1번째 쿼리: 모든 카테고리 가져오기
$categories = DB::query("SELECT * FROM categories");

// N번의 추가 쿼리: 각 카테고리별 아이템 조회
foreach ($categories as $category) {
    // 이 쿼리가 카테고리 수만큼 실행됨!
    $items = DB::query(
        "SELECT * FROM items WHERE category_id = ?",
        [$category['id']]
    );

    echo $category['name'] . ": " . count($items) . " items\n";
}
```

### 실행되는 쿼리들

```sql
-- 1번 쿼리
SELECT * FROM categories;

-- 2번 쿼리 (카테고리 1)
SELECT * FROM items WHERE category_id = 1;

-- 3번 쿼리 (카테고리 2)
SELECT * FROM items WHERE category_id = 2;

-- 4번 쿼리 (카테고리 3)
SELECT * FROM items WHERE category_id = 3;

-- ... (계속)

-- N+1번 쿼리 (카테고리 N)
SELECT * FROM items WHERE category_id = N;
```

---

## 해결 방법

### 1. JOIN을 사용한 단일 쿼리

```sql
SELECT
    c.id AS category_id,
    c.name AS category_name,
    i.id AS item_id,
    i.name AS item_name,
    i.price
FROM categories c
LEFT JOIN items i ON c.id = i.category_id
ORDER BY c.name, i.name;
```

```
결과 예시:
─────────────────────────────────────────
category_id | category_name | item_id | item_name
──────────────────────────────────────────
1           | Electronics   | 101     | Phone
1           | Electronics   | 102     | Laptop
2           | Books         | 201     | Novel
2           | Books         | 202     | Textbook
...
```

### 2. 애플리케이션에서 데이터 구조화

```php
// 단일 JOIN 쿼리 실행
$results = DB::query("
    SELECT c.id AS category_id, c.name AS category_name,
           i.id AS item_id, i.name AS item_name
    FROM categories c
    LEFT JOIN items i ON c.id = i.category_id
    ORDER BY c.name, i.name
");

// 결과를 카테고리별로 그룹화
$categories = [];
foreach ($results as $row) {
    $catId = $row['category_id'];

    if (!isset($categories[$catId])) {
        $categories[$catId] = [
            'name' => $row['category_name'],
            'items' => []
        ];
    }

    if ($row['item_id'] !== null) {
        $categories[$catId]['items'][] = [
            'id' => $row['item_id'],
            'name' => $row['item_name']
        ];
    }
}
```

### 3. Eager Loading (ORM 사용 시)

```php
// Laravel Eloquent 예시

// ❌ N+1 문제 발생
$categories = Category::all();
foreach ($categories as $category) {
    echo $category->items->count(); // 각각 쿼리 실행
}

// ✅ Eager Loading으로 해결
$categories = Category::with('items')->get();
foreach ($categories as $category) {
    echo $category->items->count(); // 추가 쿼리 없음
}
```

```javascript
// Prisma (JavaScript/TypeScript) 예시

// ❌ N+1 문제 발생
const categories = await prisma.category.findMany();
for (const cat of categories) {
    const items = await prisma.item.findMany({
        where: { categoryId: cat.id }
    });
}

// ✅ Include로 해결
const categories = await prisma.category.findMany({
    include: { items: true }
});
```

---

## 해결 방법 비교

```
┌────────────────────────────────────────────────────────────────┐
│                    해결 방법 비교                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  방법 1: JOIN 사용                                             │
│  ─────────────────                                             │
│  장점: 가장 효율적, 단일 쿼리                                   │
│  단점: 결과 데이터 중복 (카테고리 정보 반복)                     │
│                                                                │
│  방법 2: 두 번의 쿼리 (IN 절 사용)                              │
│  ─────────────────────────────                                 │
│  SELECT * FROM categories;                                     │
│  SELECT * FROM items WHERE category_id IN (1, 2, 3, ...);      │
│                                                                │
│  장점: 데이터 중복 없음, 메모리 효율적                          │
│  단점: 두 번의 쿼리 필요                                        │
│                                                                │
│  방법 3: ORM Eager Loading                                     │
│  ─────────────────────────                                     │
│  장점: 코드가 간결, 자동 최적화                                 │
│  단점: ORM 의존성, 내부 동작 이해 필요                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## N+1 문제 탐지 방법

### 1. Laravel에서 자동 탐지

```php
// AppServiceProvider.php
use Illuminate\Database\Eloquent\Model;

public function boot()
{
    // 프로덕션이 아닐 때 N+1 감지 시 예외 발생
    Model::preventLazyLoading(!app()->isProduction());
}
```

### 2. 쿼리 로깅으로 확인

```php
// Laravel
DB::listen(function ($query) {
    Log::info($query->sql);
    Log::info($query->time . 'ms');
});
```

```javascript
// Prisma
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
```

### 3. 의심 패턴 식별

```
N+1 의심 징후:
─────────────────────────────────────────
✓ 동일한 쿼리가 반복적으로 실행됨
✓ 읽은 행 수 >> 반환된 행 수
✓ 루프 안에서 쿼리 실행
✓ 페이지 로딩이 데이터 증가에 비례해 느려짐
```

---

## 다양한 상황별 해결책

### GraphQL에서의 N+1

```javascript
// DataLoader 사용으로 해결
const itemLoader = new DataLoader(async (categoryIds) => {
    const items = await db.items.findMany({
        where: { categoryId: { in: categoryIds } }
    });

    // categoryId별로 그룹화하여 반환
    return categoryIds.map(id =>
        items.filter(item => item.categoryId === id)
    );
});

// resolver에서 사용
const resolvers = {
    Category: {
        items: (category) => itemLoader.load(category.id)
    }
};
```

### API 설계에서 고려사항

```
❌ 피해야 할 패턴:
─────────────────────────────────────────
GET /categories
→ 각 카테고리마다 GET /categories/{id}/items 호출

✅ 권장하는 패턴:
─────────────────────────────────────────
GET /categories?include=items
→ 한 번의 요청으로 모든 데이터 반환
```

---

## 핵심 정리

1. **N+1 문제는 성능의 적**
   - 1개 쿼리로 충분한 작업에 N+1개 쿼리 실행
   - 네트워크 왕복이 누적되어 심각한 성능 저하

2. **JOIN 또는 Eager Loading 사용**
   - SQL JOIN으로 단일 쿼리 작성
   - ORM에서는 with(), include() 등 활용

3. **루프 안에서 쿼리 피하기**
   - 반복문 내 DB 호출은 N+1의 신호
   - 미리 필요한 데이터를 한 번에 로드

4. **모니터링 도구 활용**
   - 쿼리 로깅으로 패턴 확인
   - ORM 자동 탐지 기능 활성화

5. **설계 단계에서 고려**
   - API 설계 시 연관 데이터 포함 옵션 제공
   - GraphQL에서는 DataLoader 패턴 적용

---

## 참고 자료

- [What is the N+1 Query Problem and How to Solve It | PlanetScale](https://planetscale.com/blog/what-is-n-1-query-problem-and-how-to-solve-it)
- [Eager Loading in Laravel | Laravel Documentation](https://laravel.com/docs/eloquent-relationships#eager-loading)
- [DataLoader | GraphQL Best Practices](https://github.com/graphql/dataloader)

---

## N+1 문제의 본질

### ⚠️ 중요한 이해

**N+1 문제는 ORM의 문제가 아니라 코드 설계 문제입니다.**

```typescript
// ❌ Raw SQL에서도 N+1 발생!
const users = await db.query('SELECT * FROM users');

for (const user of users) {
  const posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
  // ↑ 반복문 안에서 쿼리 → N+1 문제!
  user.posts = posts;
}

// ❌ ORM에서도 N+1 발생!
const users = await userRepository.find();

for (const user of users) {
  user.posts = await postRepository.find({ where: { userId: user.id } });
  // ↑ 반복문 안에서 쿼리 → N+1 문제!
}
```

**핵심:** 반복문 안에서 데이터베이스 쿼리를 실행하는 것이 문제입니다.

### ORM이 N+1을 더 쉽게 만드는 이유

ORM은 쿼리를 감추기 때문에 문제를 발견하기 어렵습니다.

```typescript
// Raw SQL - 쿼리가 보임 (문제 발견 쉬움)
for (const user of users) {
  const posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
  // ↑ "어? 반복문 안에서 SELECT 하네?" → 눈에 띔
}

// ORM - 쿼리가 안 보임 (문제 발견 어려움)
for (const user of users) {
  user.posts = await user.getPosts();
  // ↑ 쿼리처럼 안 보여서 모르고 지나침!
}
```

---

## 서브쿼리 vs JOIN vs IN 절

### 서브쿼리는 N+1 해결 방법이 아니다

**SELECT 절의 서브쿼리:**
```sql
-- 각 게시글마다 서브쿼리 실행 (N+1과 비슷)
SELECT
  id,
  title,
  (SELECT name FROM users WHERE id = posts.user_id) as author_name
FROM posts;
```

- 게시글 10개 → 서브쿼리 10번 실행
- 네트워크 왕복은 1번이지만, DB 내부에서는 N번 실행

**WHERE 절의 서브쿼리 (IN 절):**
```sql
-- 이건 N+1 해결 방법 맞음!
SELECT * FROM posts
WHERE user_id IN (SELECT id FROM users WHERE active = true);
```

### 해결 방법 상세 비교

**1. JOIN (한 번의 쿼리)**
```typescript
const result = await db.query(`
  SELECT users.*, posts.*
  FROM users
  LEFT JOIN posts ON posts.user_id = users.id
`);

// 장점: 쿼리 1번, DB 최적화 가능
// 단점: 데이터 중복 (사용자가 게시글 수만큼 반복)
```

**2. IN 절 (쿼리 2번)**
```typescript
// 쿼리 1: 사용자 조회
const users = await db.query('SELECT * FROM users');
const userIds = users.map(u => u.id);

// 쿼리 2: 게시글 한 번에 조회
const posts = await db.query(
  'SELECT * FROM posts WHERE user_id IN (?)',
  [userIds]
);

// 메모리에서 그룹화
const postsMap = posts.reduce((acc, post) => {
  if (!acc[post.user_id]) acc[post.user_id] = [];
  acc[post.user_id].push(post);
  return acc;
}, {});

users.forEach(user => {
  user.posts = postsMap[user.id] || [];
});

// 장점: 데이터 중복 없음, 깔끔한 구조
// 단점: 쿼리 2번 (네트워크 왕복 2회)
```

**3. SELECT 절 서브쿼리 (집계만 가능)**
```sql
-- 게시글 개수만 필요할 때
SELECT
  id,
  name,
  (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as post_count
FROM users;

-- 장점: 결과 깔끔, 집계 값만 필요할 때 적합
-- 단점: 상세 정보는 못 가져옴, DB 내부에서 N번 실행
```

### 권장 사항

| 상황 | 추천 방법 | 이유 |
|------|-----------|------|
| 1:1 관계 | JOIN | 데이터 중복 적음 |
| 1:Many (적은 수) | JOIN | 한 번에 처리 |
| 1:Many (많은 수) | IN 절 (쿼리 2번) | 데이터 중복 방지 |
| 집계 값만 필요 | 서브쿼리 | COUNT, SUM 등 |

---

## TypeScript/Node.js 예시

### N+1 문제 발생 코드

```typescript
// ❌ N+1 문제 (최악)
async function getBlogPosts() {
  // 쿼리 1번
  const posts = await db.query('SELECT * FROM posts LIMIT 10');

  // 쿼리 2~11번
  for (const post of posts) {
    const author = await db.query(
      'SELECT name, avatar FROM users WHERE id = ?',
      [post.user_id]
    );
    post.authorName = author.name;
    post.authorAvatar = author.avatar;
  }

  return posts;
}
// 총 11번 쿼리!
```

### 해결 방법 1: JOIN

```typescript
// ✅ JOIN 사용
async function getBlogPostsWithJoin() {
  const posts = await db.query(`
    SELECT
      posts.*,
      users.name as author_name,
      users.avatar as author_avatar
    FROM posts
    LEFT JOIN users ON users.id = posts.user_id
    LIMIT 10
  `);

  return posts;
}
// 쿼리 1번!
```

### 해결 방법 2: IN 절

```typescript
// ✅ IN 절 사용 (권장)
async function getBlogPostsWithIn() {
  // 쿼리 1: 게시글 조회
  const posts = await db.query('SELECT * FROM posts LIMIT 10');
  const userIds = [...new Set(posts.map(p => p.user_id))];

  // 쿼리 2: 작성자들 한 번에 조회
  const users = await db.query(
    'SELECT id, name, avatar FROM users WHERE id IN (?)',
    [userIds]
  );

  // 메모리에서 매핑
  const userMap = new Map(users.map(u => [u.id, u]));
  posts.forEach(post => {
    const author = userMap.get(post.user_id);
    post.authorName = author?.name;
    post.authorAvatar = author?.avatar;
  });

  return posts;
}
// 쿼리 2번!
```

### TypeORM 예시

```typescript
// ❌ N+1 발생
const users = await userRepository.find();

for (const user of users) {
  user.posts = await postRepository.find({
    where: { userId: user.id }
  });
}

// ✅ relations 사용
const users = await userRepository.find({
  relations: ['posts'] // JOIN으로 한 번에 가져옴
});

// ✅ QueryBuilder 사용
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post')
  .getMany();
```

---

## 다른 I/O 작업에서도 동일한 패턴

N+1 문제는 데이터베이스만의 문제가 아닙니다. 반복문 안에서 I/O 작업을 하는 모든 상황에서 발생합니다.

### API 호출에서의 N+1

```typescript
// ❌ N+1 (API 버전)
const users = await fetchUsers(); // API 호출 1번

for (const user of users) {
  user.avatar = await fetchAvatar(user.id); // API 호출 N번
}

// ✅ 해결
const users = await fetchUsers();
const userIds = users.map(u => u.id);
const avatars = await fetchAvatarsBatch(userIds); // API 호출 1번 (배치)
```

### 파일 I/O에서의 N+1

```typescript
// ❌ N+1 (파일 I/O 버전)
const files = ['a.txt', 'b.txt', 'c.txt'];

for (const file of files) {
  const content = await fs.readFile(file); // 파일 읽기 N번
  console.log(content);
}

// ✅ 해결 (병렬 처리)
const contents = await Promise.all(
  files.map(file => fs.readFile(file))
);
```

---

## 마무리

**N+1 문제 체크리스트:**
- [ ] 반복문 안에서 `await db.query()` 실행하는가?
- [ ] 반복문 안에서 `await repository.find()` 실행하는가?
- [ ] ORM의 lazy loading을 사용하는가?
- [ ] 쿼리 로그에서 같은 패턴이 반복되는가?

**하나라도 해당되면 N+1 문제를 의심하세요!**

---

*마지막 업데이트: 2026-01-08*
