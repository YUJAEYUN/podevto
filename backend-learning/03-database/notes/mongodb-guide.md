# MongoDB 완벽 가이드

## MongoDB란?

**MongoDB**는 가장 인기 있는 **NoSQL Document Database**입니다. JSON과 유사한 BSON(Binary JSON) 형식으로 데이터를 저장합니다.

```
MongoDB 특징
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 유연한 스키마 (Schema-less)
✅ JSON 형태의 문서 저장
✅ 수평 확장 용이 (Sharding)
✅ 빠른 읽기/쓰기
✅ 강력한 쿼리 언어
✅ 집계 파이프라인 (Aggregation)
```

---

## MongoDB vs PostgreSQL

### 데이터 구조 비교

```
PostgreSQL (관계형)          MongoDB (문서형)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Database                     Database
  └─ Table                     └─ Collection
      └─ Row                       └─ Document
          └─ Column                    └─ Field

users 테이블                  users 컬렉션
┌────┬──────┬────────┐       {
│ id │ name │ email  │         "_id": ObjectId("..."),
├────┼──────┼────────┤         "name": "John",
│ 1  │ John │ john@..│         "email": "john@..."
│ 2  │ Jane │ jane@..│       }
└────┴──────┴────────┘
```

---

## 설치

### macOS (Homebrew)

```bash
# MongoDB Community Edition 설치
brew tap mongodb/brew
brew install mongodb-community

# 시작
brew services start mongodb-community

# 중지
brew services stop mongodb-community

# MongoDB Shell 실행
mongosh
```

### Ubuntu

```bash
# MongoDB 공식 GPG 키 추가
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/mongodb-server-7.0.gpg

# MongoDB 저장소 추가
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 설치
sudo apt update
sudo apt install -y mongodb-org

# 시작
sudo systemctl start mongod
sudo systemctl enable mongod  # 부팅 시 자동 시작

# 상태 확인
sudo systemctl status mongod
```

### Docker

```bash
# MongoDB 실행 (포트 27017)
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7

# 접속
docker exec -it mongodb mongosh -u admin -p password
```

---

## 기본 CRUD 작업

### 데이터베이스와 컬렉션

```javascript
// 데이터베이스 선택 (없으면 자동 생성)
use myapp

// 현재 데이터베이스 확인
db

// 모든 데이터베이스 목록
show dbs

// 현재 DB의 모든 컬렉션
show collections

// 컬렉션 생성 (첫 문서 삽입 시 자동 생성됨)
db.createCollection("users")
```

### Create (생성)

```javascript
// 단일 문서 삽입
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  created_at: new Date()
})

// 반환값
{
  acknowledged: true,
  insertedId: ObjectId("507f1f77bcf86cd799439011")
}

// 여러 문서 삽입
db.users.insertMany([
  { name: "Jane Smith", email: "jane@example.com", age: 25 },
  { name: "Bob Johnson", email: "bob@example.com", age: 35 },
  { name: "Alice Brown", email: "alice@example.com", age: 28 }
])
```

### Read (조회)

```javascript
// 모든 문서 조회
db.users.find()

// 조건부 조회
db.users.find({ age: 30 })

// 여러 조건 (AND)
db.users.find({
  age: { $gte: 25 },  // age >= 25
  name: "John Doe"
})

// OR 조건
db.users.find({
  $or: [
    { age: { $lt: 25 } },
    { age: { $gt: 35 } }
  ]
})

// 특정 필드만 선택 (Projection)
db.users.find(
  { age: { $gte: 25 } },
  { name: 1, email: 1, _id: 0 }  // name, email만 (id 제외)
)

// 단일 문서 조회
db.users.findOne({ email: "john@example.com" })

// 정렬
db.users.find().sort({ age: 1 })  // 오름차순 (1: ASC, -1: DESC)

// 페이지네이션
db.users.find()
  .skip(10)   // 10개 건너뛰기
  .limit(5)   // 5개만 조회

// 개수 세기
db.users.countDocuments({ age: { $gte: 25 } })
```

### Update (수정)

```javascript
// 단일 문서 수정
db.users.updateOne(
  { email: "john@example.com" },  // 필터
  { $set: { age: 31 } }            // 수정 내용
)

// 여러 문서 수정
db.users.updateMany(
  { age: { $lt: 30 } },
  { $set: { status: "young" } }
)

// 필드 증가
db.users.updateOne(
  { email: "john@example.com" },
  { $inc: { age: 1 } }  // age를 1 증가
)

// 배열에 항목 추가
db.users.updateOne(
  { email: "john@example.com" },
  { $push: { hobbies: "reading" } }
)

// 배열에서 항목 제거
db.users.updateOne(
  { email: "john@example.com" },
  { $pull: { hobbies: "reading" } }
)

// 필드 제거
db.users.updateOne(
  { email: "john@example.com" },
  { $unset: { status: "" } }
)

// upsert (없으면 삽입, 있으면 수정)
db.users.updateOne(
  { email: "new@example.com" },
  { $set: { name: "New User", age: 20 } },
  { upsert: true }
)

// 문서 전체 교체
db.users.replaceOne(
  { email: "john@example.com" },
  { name: "John Doe", email: "john@example.com", age: 32 }
)
```

### Delete (삭제)

```javascript
// 단일 문서 삭제
db.users.deleteOne({ email: "john@example.com" })

// 여러 문서 삭제
db.users.deleteMany({ age: { $lt: 20 } })

// 모든 문서 삭제
db.users.deleteMany({})

// 컬렉션 삭제
db.users.drop()
```

---

## 쿼리 연산자

### 비교 연산자

```javascript
// $eq: 같음
db.users.find({ age: { $eq: 30 } })
// 또는 간단히
db.users.find({ age: 30 })

// $ne: 같지 않음
db.users.find({ age: { $ne: 30 } })

// $gt, $gte: 크다, 크거나 같다
db.users.find({ age: { $gt: 25 } })
db.users.find({ age: { $gte: 25 } })

// $lt, $lte: 작다, 작거나 같다
db.users.find({ age: { $lt: 35 } })
db.users.find({ age: { $lte: 35 } })

// $in: 배열에 포함
db.users.find({ age: { $in: [25, 30, 35] } })

// $nin: 배열에 포함되지 않음
db.users.find({ age: { $nin: [25, 30, 35] } })
```

### 논리 연산자

```javascript
// $and
db.users.find({
  $and: [
    { age: { $gte: 25 } },
    { age: { $lte: 35 } }
  ]
})

// $or
db.users.find({
  $or: [
    { age: { $lt: 25 } },
    { age: { $gt: 35 } }
  ]
})

// $not
db.users.find({
  age: { $not: { $gte: 30 } }
})

// $nor: 모든 조건이 거짓
db.users.find({
  $nor: [
    { age: { $lt: 25 } },
    { status: "inactive" }
  ]
})
```

### 배열 연산자

```javascript
// $all: 배열이 모든 요소 포함
db.users.find({
  hobbies: { $all: ["reading", "coding"] }
})

// $elemMatch: 배열 요소가 조건 만족
db.users.find({
  scores: {
    $elemMatch: { $gte: 80, $lt: 90 }
  }
})

// $size: 배열 크기
db.users.find({
  hobbies: { $size: 3 }
})
```

### 필드 존재 여부

```javascript
// $exists: 필드 존재 여부
db.users.find({ phone: { $exists: true } })

// $type: 필드 타입 확인
db.users.find({ age: { $type: "number" } })
db.users.find({ age: { $type: "string" } })
```

---

## 인덱스

### 인덱스 생성

```javascript
// 단일 필드 인덱스
db.users.createIndex({ email: 1 })  // 1: 오름차순, -1: 내림차순

// 복합 인덱스
db.users.createIndex({ name: 1, age: -1 })

// 고유 인덱스
db.users.createIndex({ email: 1 }, { unique: true })

// 텍스트 인덱스 (전문 검색)
db.articles.createIndex({ title: "text", content: "text" })

// TTL 인덱스 (자동 삭제)
db.sessions.createIndex(
  { created_at: 1 },
  { expireAfterSeconds: 3600 }  // 1시간 후 자동 삭제
)
```

### 인덱스 관리

```javascript
// 모든 인덱스 조회
db.users.getIndexes()

// 인덱스 삭제
db.users.dropIndex("email_1")

// 모든 인덱스 삭제 (_id 제외)
db.users.dropIndexes()

// 쿼리 실행 계획 확인
db.users.find({ email: "john@example.com" }).explain("executionStats")
```

---

## Aggregation Pipeline

MongoDB의 강력한 데이터 집계 기능입니다.

### 기본 파이프라인

```javascript
// $match: 필터링
db.orders.aggregate([
  { $match: { status: "completed" } }
])

// $group: 그룹화
db.orders.aggregate([
  {
    $group: {
      _id: "$user_id",                // 그룹 키
      total: { $sum: "$amount" },     // 합계
      count: { $sum: 1 },             // 개수
      avg: { $avg: "$amount" }        // 평균
    }
  }
])

// $sort: 정렬
db.orders.aggregate([
  { $group: { _id: "$user_id", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } }  // 총 금액 내림차순
])

// $limit, $skip: 페이지네이션
db.orders.aggregate([
  { $sort: { created_at: -1 } },
  { $skip: 10 },
  { $limit: 5 }
])

// $project: 필드 선택
db.orders.aggregate([
  {
    $project: {
      user_id: 1,
      amount: 1,
      year: { $year: "$created_at" }  // 날짜에서 연도 추출
    }
  }
])
```

### 복잡한 집계 예시

```javascript
// 월별 매출 통계
db.orders.aggregate([
  // 1. completed 주문만 필터링
  { $match: { status: "completed" } },

  // 2. 연도-월로 그룹화
  {
    $group: {
      _id: {
        year: { $year: "$created_at" },
        month: { $month: "$created_at" }
      },
      total_revenue: { $sum: "$amount" },
      order_count: { $sum: 1 },
      avg_order: { $avg: "$amount" }
    }
  },

  // 3. 날짜 순 정렬
  { $sort: { "_id.year": 1, "_id.month": 1 } },

  // 4. 필드 재구성
  {
    $project: {
      _id: 0,
      year: "$_id.year",
      month: "$_id.month",
      total_revenue: 1,
      order_count: 1,
      avg_order: { $round: ["$avg_order", 2] }
    }
  }
])
```

### $lookup (JOIN)

```javascript
// 사용자와 주문 조인
db.users.aggregate([
  {
    $lookup: {
      from: "orders",             // 조인할 컬렉션
      localField: "_id",          // 로컬 필드
      foreignField: "user_id",    // 외래 필드
      as: "orders"                // 결과 배열 이름
    }
  },
  {
    $project: {
      name: 1,
      email: 1,
      order_count: { $size: "$orders" },
      total_spent: { $sum: "$orders.amount" }
    }
  }
])
```

---

## Node.js에서 MongoDB 사용

### 설치

```bash
npm install mongodb
```

### 연결

```javascript
const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    console.log("MongoDB 연결 성공");

    const db = client.db("myapp");
    const users = db.collection("users");

    // CRUD 작업 수행
    await users.insertOne({ name: "John", email: "john@example.com" });

  } finally {
    await client.close();
  }
}

main().catch(console.error);
```

### Express API 예시

```javascript
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db, users;

// 서버 시작 시 DB 연결
async function connectDB() {
  await client.connect();
  db = client.db("myapp");
  users = db.collection("users");
  console.log("MongoDB 연결 성공");
}

// GET /api/users - 사용자 목록 조회
app.get('/api/users', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const userList = await users
      .find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .toArray();

    const total = await users.countDocuments();

    res.json({
      success: true,
      data: userList,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:id - 특정 사용자 조회
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await users.findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users - 사용자 생성
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, age } = req.body;

    // 이메일 중복 확인
    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Email already exists"
      });
    }

    const result = await users.insertOne({
      name,
      email,
      age,
      created_at: new Date()
    });

    res.status(201).json({
      success: true,
      data: { _id: result.insertedId, name, email, age }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/users/:id - 사용자 수정
app.patch('/api/users/:id', async (req, res) => {
  try {
    const { name, age } = req.body;

    const result = await users.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: { name, age, updated_at: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({ success: true, message: "User updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/users/:id - 사용자 삭제
app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await users.deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 서버 시작
connectDB().then(() => {
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
});
```

---

## 데이터 모델링

### Embedding (임베딩)

관련 데이터를 한 문서에 포함시킵니다.

```javascript
// 사용자와 주문을 하나의 문서로
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john@example.com",
  "orders": [
    {
      "order_id": "ORD001",
      "product": "Laptop",
      "amount": 1000,
      "date": ISODate("2024-01-01")
    },
    {
      "order_id": "ORD002",
      "product": "Mouse",
      "amount": 20,
      "date": ISODate("2024-01-05")
    }
  ]
}
```

**장점**:
- 한 번의 쿼리로 모든 데이터 조회
- 빠른 읽기 성능

**단점**:
- 문서 크기 제한 (16MB)
- 주문 수가 많으면 문서가 커짐

**언제 사용?**
- 1:1, 1:Few 관계
- 함께 조회되는 데이터
- 데이터 변경이 드문 경우

### Referencing (참조)

관련 데이터를 별도 문서로 분리하고 참조합니다.

```javascript
// users 컬렉션
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john@example.com"
}

// orders 컬렉션
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("507f1f77bcf86cd799439011"),
  "product": "Laptop",
  "amount": 1000,
  "date": ISODate("2024-01-01")
}
```

**장점**:
- 문서 크기 제한 없음
- 데이터 중복 없음

**단점**:
- 여러 쿼리 필요 (또는 $lookup)
- JOIN 비용

**언제 사용?**
- 1:Many, Many:Many 관계
- 독립적으로 조회되는 데이터
- 데이터 변경이 빈번한 경우

---

## 트랜잭션

MongoDB 4.0+에서 다중 문서 트랜잭션을 지원합니다.

```javascript
const session = client.startSession();

try {
  await session.withTransaction(async () => {
    const accounts = db.collection('accounts');

    // A 계좌에서 차감
    await accounts.updateOne(
      { _id: "A" },
      { $inc: { balance: -100 } },
      { session }
    );

    // B 계좌에 추가
    await accounts.updateOne(
      { _id: "B" },
      { $inc: { balance: 100 } },
      { session }
    );
  });

  console.log("Transaction committed");

} catch (error) {
  console.error("Transaction aborted:", error);
  throw error;

} finally {
  await session.endSession();
}
```

**주의사항**:
- 트랜잭션은 성능 저하 유발
- 가능하면 단일 문서 업데이트로 해결
- Sharded 환경에서는 더 복잡

---

## Sharding (샤딩)

MongoDB의 수평 확장 방법입니다.

```
Sharding 구조
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

         Mongos (라우터)
              ↓
    ┌─────────┼─────────┐
Shard 1    Shard 2    Shard 3
users      users      users
1-1000   1001-2000  2001-3000
```

### Shard Key 선택

```javascript
// 나쁜 예: 순차적 증가 (_id)
// → 모든 쓰기가 마지막 shard로 집중

// 좋은 예: 균등 분산되는 키
sh.shardCollection("myapp.users", { email: "hashed" })

// 복합 키
sh.shardCollection("myapp.orders", { user_id: 1, created_at: 1 })
```

---

## 성능 최적화

### 1. 인덱스 활용

```javascript
// 쿼리에 사용되는 필드에 인덱스
db.users.createIndex({ email: 1 })

// 복합 쿼리는 복합 인덱스
db.users.createIndex({ status: 1, created_at: -1 })

// 실행 계획 확인
db.users.find({ email: "john@example.com" })
  .explain("executionStats")
```

### 2. Projection 사용

```javascript
// ❌ 나쁜 예: 모든 필드 조회
db.users.find()

// ✅ 좋은 예: 필요한 필드만
db.users.find({}, { name: 1, email: 1, _id: 0 })
```

### 3. 적절한 데이터 모델

```javascript
// ❌ 나쁜 예: 무한 증가하는 배열
{
  user_id: 1,
  posts: [/* 수천 개의 게시물 */]  // 16MB 제한 위험
}

// ✅ 좋은 예: 참조 사용
// users
{ _id: 1, name: "John" }

// posts
{ _id: 1, user_id: 1, title: "..." }
{ _id: 2, user_id: 1, title: "..." }
```

### 4. 커넥션 풀링

```javascript
const client = new MongoClient(uri, {
  maxPoolSize: 50,        // 최대 연결 수
  minPoolSize: 10,        // 최소 연결 수
  maxIdleTimeMS: 30000    // 유휴 연결 타임아웃
});
```

---

## 백업 및 복구

### mongodump / mongorestore

```bash
# 전체 데이터베이스 백업
mongodump --uri="mongodb://localhost:27017" --out=/backup

# 특정 데이터베이스 백업
mongodump --db=myapp --out=/backup

# 복구
mongorestore --uri="mongodb://localhost:27017" /backup

# 특정 컬렉션만 복구
mongorestore --db=myapp --collection=users /backup/myapp/users.bson
```

### mongoexport / mongoimport

```bash
# JSON으로 export
mongoexport --db=myapp --collection=users --out=users.json

# CSV로 export
mongoexport --db=myapp --collection=users --type=csv --fields=name,email --out=users.csv

# import
mongoimport --db=myapp --collection=users --file=users.json
```

---

## 실무 팁

### 1. _id 커스터마이징

```javascript
// 기본 ObjectId 대신 커스텀 ID
db.users.insertOne({
  _id: "user_12345",  // 커스텀 ID
  name: "John"
})

// UUID 사용
const { v4: uuidv4 } = require('uuid');
db.users.insertOne({
  _id: uuidv4(),
  name: "John"
})
```

### 2. 스키마 검증

```javascript
// 컬렉션 생성 시 스키마 정의
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        email: {
          bsonType: "string",
          pattern: "^.+@.+$",
          description: "must be a valid email"
        },
        age: {
          bsonType: "int",
          minimum: 0,
          maximum: 120
        }
      }
    }
  }
})
```

### 3. Change Streams (실시간 모니터링)

```javascript
// 컬렉션 변경 감지
const changeStream = db.collection('users').watch();

changeStream.on('change', (change) => {
  console.log('Change detected:', change);

  if (change.operationType === 'insert') {
    console.log('New user:', change.fullDocument);
  }
});
```

---

## MongoDB vs 관계형 DB 선택 가이드

```
MongoDB 선택
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 유연한 스키마 필요
✅ 빠른 읽기/쓰기
✅ 수평 확장 필수
✅ JSON 형태 데이터
✅ 비정형 데이터

예: 소셜 미디어, 로그, IoT, 실시간 앱

PostgreSQL 선택
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 복잡한 쿼리 (JOIN)
✅ ACID 트랜잭션 필수
✅ 데이터 무결성 중요
✅ 관계형 데이터
✅ 복잡한 집계

예: 금융, 전자상거래, ERP, CRM
```

---

## 추가 학습 자료

- [MongoDB Official Docs](https://docs.mongodb.com/)
- [MongoDB University (무료 강좌)](https://university.mongodb.com/)
- [MongoDB Schema Design Best Practices](https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design)

---

## 다음 학습

- [Redis 완벽 가이드](redis-guide.md)
- [관계형 vs NoSQL](relational-vs-nosql.md)
- [데이터 모델링](data-modeling.md)

---

*Last updated: 2026-01-05*
