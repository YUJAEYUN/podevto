# CQRS 패턴 (Command Query Responsibility Segregation)

**학습 날짜:** 2026-01-08

## 목차
1. [CQRS란?](#cqrs란)
2. [CQRS가 필요한 이유](#cqrs가-필요한-이유)
3. [데이터베이스 동기화](#데이터베이스-동기화)
4. [실무 구현 예시](#실무-구현-예시)
5. [트레이드오프](#트레이드오프)

---

## CQRS란?

**CQRS = Command Query Responsibility Segregation (명령과 조회의 책임 분리)**

### ⚠️ 중요한 오해

CQRS는 **"동시 실행"이 아니라 "책임 분리"**입니다.
**Node.js의 I/O 병렬 처리와는 완전히 다른 개념**입니다.

```
Node.js I/O 병렬 처리 (동시성)
─────────────────────────────
여러 작업을 동시에 실행

CQRS (아키텍처 패턴)
─────────────────────────────
읽기와 쓰기를 다른 방식으로 처리
```

### 기본 구조

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌──────────────┐                    ┌──────────────┐
│ Command API  │                    │  Query API   │
│ (쓰기 전용)   │                    │  (읽기 전용)  │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       ▼                                   ▼
┌──────────────┐                    ┌──────────────┐
│ PostgreSQL   │───── Event ───────>│  MongoDB     │
│ (쓰기 DB)    │      Bus           │  (읽기 DB)   │
│              │    (Kafka)         │              │
│ 정규화됨     │                    │  비정규화됨  │
│ ACID 보장    │                    │  빠른 조회   │
└──────────────┘                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │    Redis     │
                                    │   (캐시)     │
                                    │  초고속 조회 │
                                    └──────────────┘
```

---

## CQRS가 필요한 이유

### 1. 읽기와 쓰기의 성능 특성이 다름

```typescript
// 전통적 방식 (하나의 모델)
class BlogService {
  async getPostWithComments(postId: number) {
    // 복잡한 JOIN 쿼리 (느림!)
    return this.db.query(`
      SELECT
        p.*,
        u.name as author_name,
        u.avatar as author_avatar,
        c.*,
        cu.name as commenter_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN comments c ON c.post_id = p.id
      LEFT JOIN users cu ON c.user_id = cu.id
      WHERE p.id = ${postId}
    `); // 매번 JOIN 계산 (비효율)
  }
}

// CQRS 방식
class BlogQueryService {
  async getPostWithComments(postId: number) {
    // 읽기 DB에는 이미 합쳐진 데이터 저장
    return this.readDB.get(`post:${postId}:full`);
    // {
    //   id: 1,
    //   title: '...',
    //   author: { name: 'John', avatar: '...' },  // 이미 합쳐짐!
    //   comments: [
    //     { text: '...', commenter: { name: 'Jane' } }
    //   ]
    // }
  }
}

// 성능 비교:
// 전통적: 매번 3개 테이블 JOIN (100ms)
// CQRS: Redis에서 바로 조회 (1ms) - 100배 빠름!
```

### 2. 읽기와 쓰기의 빈도가 다름

```typescript
// 현실 시나리오: 블로그 포스트
// - 읽기: 초당 10,000번 (조회수)
// - 쓰기: 하루 10번 (새 글 작성)

// 전통적 방식: 같은 DB에서 처리 (병목 발생)
class BlogService {
  async getPost(id: number) {
    return this.db.query('SELECT * FROM posts WHERE id = ?', [id]);
    // 10,000 req/s → DB 과부하!
  }
}

// CQRS: 읽기는 캐시/복제 DB, 쓰기는 메인 DB
class BlogQueryService {
  // 읽기 전용 복제본 여러 개 (스케일 아웃)
  async getPost(id: number) {
    return this.readReplica.get(`post:${id}`); // Redis 캐시
    // 10,000 req/s도 거뜬함!
  }
}

class BlogCommandService {
  // 쓰기는 메인 DB 하나 (일관성 보장)
  async createPost(data: CreatePostDto) {
    return this.primaryDB.insert('posts', data);
    // 하루 10번 → 여유로움
  }
}
```

### 3. 읽기와 쓰기의 데이터 구조가 다름

```typescript
// 쓰기 모델 (정규화, 엄격)
interface OrderWriteModel {
  userId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt: Date;
  status: 'pending' | 'confirmed' | 'shipped';
}

// 읽기 모델 (비정규화, 빠름)
interface OrderReadModel {
  orderId: number;
  customerName: string;      // users 테이블에서 가져옴
  customerEmail: string;
  productName: string;        // products 테이블에서 가져옴
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;         // 미리 계산됨!
  estimatedDelivery: string;  // 미리 계산됨!
  status: string;
  orderDate: string;
}

// 조회 시 JOIN 불필요 → 엄청 빠름!
```

### 4. 읽기와 쓰기의 일관성 요구사항이 다름

```typescript
// 쓰기: 강한 일관성 필요 (돈 관련!)
class PaymentCommandService {
  async processPayment(orderId: number, amount: number) {
    await this.db.transaction(async (tx) => {
      // ACID 트랜잭션 필수!
      await tx.update('accounts', { balance: balance - amount });
      await tx.insert('payments', { orderId, amount });
      // 둘 다 성공하거나 둘 다 실패 (원자성)
    });
  }
}

// 읽기: 약한 일관성 허용 (몇 초 지연 괜찮음)
class OrderQueryService {
  async getOrderHistory(userId: number) {
    // 약간 오래된 데이터여도 OK
    return this.readCache.get(`user:${userId}:orders`);
    // 실시간이 아니어도 됨 (Eventually Consistent)
  }
}
```

---

## 데이터베이스 동기화

### 동기화 흐름

```
쓰기 요청 → PostgreSQL (쓰기 DB) → 이벤트 발행 → MongoDB/Redis (읽기 DB)
                ↓                        ↓                    ↓
            트랜잭션 보장           메시지 큐              빠른 조회
```

### 방법 1: 이벤트 기반 동기화 (가장 일반적)

```typescript
// 1단계: 쓰기 DB에 저장 + 이벤트 발행
class UserCommandService {
  constructor(
    private writeDB: PostgreSQL,
    private eventBus: EventBus
  ) {}

  async createUser(data: CreateUserDto) {
    // 1. PostgreSQL에 저장 (쓰기 DB)
    const user = await this.writeDB.transaction(async (tx) => {
      const newUser = await tx.insert('users', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: await hash(data.password),
        createdAt: new Date()
      });

      // 2. 이벤트 발행 (같은 트랜잭션 내)
      await tx.insert('outbox_events', {
        eventType: 'UserCreated',
        payload: JSON.stringify({
          userId: newUser.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email
        }),
        createdAt: new Date()
      });

      return newUser;
    });

    // 3. 트랜잭션 성공 후 메시지 큐에 발행
    await this.eventBus.publish('UserCreated', {
      userId: user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email
    });

    return { userId: user.id };
  }
}

// 2단계: 이벤트 수신 + 읽기 DB 업데이트
class UserEventHandler {
  constructor(
    private readDB: MongoDB,
    private cache: Redis
  ) {}

  @EventHandler('UserCreated')
  async onUserCreated(event: UserCreatedEvent) {
    // MongoDB에 비정규화된 형태로 저장
    await this.readDB.collection('users').insertOne({
      _id: event.userId,
      fullName: `${event.firstName} ${event.lastName}`, // 미리 합침
      email: event.email,
      profileUrl: `/users/${event.userId}`,
      postCount: 0,
      followerCount: 0,
      createdAt: new Date()
    });

    // Redis 캐시에도 저장
    await this.cache.set(
      `user:${event.userId}`,
      JSON.stringify({
        id: event.userId,
        fullName: `${event.firstName} ${event.lastName}`,
        email: event.email
      }),
      'EX', 3600 // 1시간 TTL
    );

    console.log(`✅ User ${event.userId} synchronized to read DB`);
  }
}

// 3단계: 읽기 서비스는 읽기 DB만 사용
class UserQueryService {
  constructor(
    private readDB: MongoDB,
    private cache: Redis
  ) {}

  async getUser(userId: number) {
    // 1차: Redis 캐시 확인
    const cached = await this.cache.get(`user:${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2차: MongoDB에서 조회
    const user = await this.readDB.collection('users').findOne({ _id: userId });

    // 캐시에 저장
    if (user) {
      await this.cache.set(`user:${userId}`, JSON.stringify(user), 'EX', 3600);
    }

    return user;
  }
}
```

### 방법 2: Outbox Pattern (트랜잭션 보장)

```typescript
// 문제: 이벤트 발행이 실패하면?
await this.writeDB.insert('users', data); // ✅ 성공
await this.eventBus.publish('UserCreated', event); // ❌ 실패!
// → PostgreSQL에는 있는데 MongoDB에는 없음!

// 해결: Outbox 테이블 사용
class UserCommandService {
  async createUser(data: CreateUserDto) {
    await this.writeDB.transaction(async (tx) => {
      // 1. users 테이블에 삽입
      const user = await tx.insert('users', data);

      // 2. outbox 테이블에 이벤트 저장 (같은 트랜잭션!)
      await tx.insert('outbox_events', {
        aggregateId: user.id,
        eventType: 'UserCreated',
        payload: JSON.stringify({ userId: user.id, ...data }),
        processed: false,
        createdAt: new Date()
      });

      // 둘 다 성공하거나 둘 다 실패 (원자성 보장!)
    });
  }
}

// 별도 워커: Outbox 이벤트를 읽어서 발행
class OutboxProcessor {
  @Cron('*/1 * * * * *') // 1초마다 실행
  async processOutbox() {
    const events = await this.writeDB.query(
      'SELECT * FROM outbox_events WHERE processed = false ORDER BY created_at LIMIT 100'
    );

    for (const event of events) {
      try {
        // 메시지 큐에 발행
        await this.eventBus.publish(event.eventType, JSON.parse(event.payload));

        // 처리 완료 표시
        await this.writeDB.update('outbox_events',
          { id: event.id },
          { processed: true, processedAt: new Date() }
        );
      } catch (error) {
        console.error('Failed to process event:', error);
        // 다음 사이클에 재시도
      }
    }
  }
}
```

### 동기화 지연 문제 해결

```typescript
// 문제: 쓰기 직후 읽기 시 데이터 없음
await commandService.createUser(data); // PostgreSQL에 저장
const user = await queryService.getUser(userId); // MongoDB에서 조회
// → null! (아직 동기화 안됨)

// 해결책 1: 쓰기 후 쓰기 DB에서 직접 읽기
class UserCommandService {
  async createUser(data: CreateUserDto) {
    const user = await this.writeDB.insert('users', data);

    // 이벤트 발행
    await this.eventBus.publish('UserCreated', user);

    // 방금 생성한 데이터 반환 (쓰기 DB에서)
    return {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`, // 직접 조합
      email: user.email
    };
  }
}

// 해결책 2: 읽기 서비스에 fallback
class UserQueryService {
  async getUser(userId: number) {
    // 1차: 읽기 DB 시도
    let user = await this.readDB.findOne({ _id: userId });

    // 2차: 없으면 쓰기 DB에서 조회 (fallback)
    if (!user) {
      const writeUser = await this.writeDB.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (writeUser) {
        // 즉석에서 변환
        user = {
          id: writeUser.id,
          fullName: `${writeUser.firstName} ${writeUser.lastName}`,
          email: writeUser.email
        };
      }
    }

    return user;
  }
}
```

---

## 실무 구현 예시

### NestJS + TypeORM + MongoDB + Redis

```typescript
// Command (쓰기)
@Injectable()
export class CreateUserCommand {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventBus: EventBus,
  ) {}

  async execute(dto: CreateUserDto) {
    const user = this.userRepository.create(dto);
    await this.userRepository.save(user);

    // 이벤트 발행
    this.eventBus.publish(new UserCreatedEvent(user.id, dto));

    return { userId: user.id };
  }
}

// Query (읽기)
@Injectable()
export class GetUserQuery {
  constructor(
    @InjectConnection('mongodb')
    private mongoConnection: Connection,
    @Inject('REDIS_CLIENT')
    private redis: Redis,
  ) {}

  async execute(userId: string) {
    // 캐시 확인
    const cached = await this.redis.get(`user:${userId}`);
    if (cached) return JSON.parse(cached);

    // MongoDB 조회
    const user = await this.mongoConnection
      .collection('users')
      .findOne({ _id: userId });

    if (user) {
      await this.redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
    }

    return user;
  }
}

// Event Handler
@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  constructor(
    @InjectConnection('mongodb')
    private mongoConnection: Connection,
  ) {}

  async handle(event: UserCreatedEvent) {
    await this.mongoConnection.collection('users').insertOne({
      _id: event.userId,
      fullName: `${event.firstName} ${event.lastName}`,
      email: event.email,
      createdAt: new Date(),
    });
  }
}
```

---

## 트레이드오프

### 장점

```
✅ 읽기 성능 극대화 (캐시, 비정규화, 복제)
✅ 쓰기 안정성 극대화 (트랜잭션, 검증)
✅ 독립적 스케일링 (읽기만 늘리기 가능)
✅ 목적에 맞는 DB 선택 (읽기: MongoDB, 쓰기: PostgreSQL)
```

### 단점

```
❌ 복잡도 증가 (읽기 DB, 쓰기 DB 따로 관리)
❌ 데이터 일관성 지연 (Eventual Consistency)
❌ 인프라 비용 증가 (DB 2배, 메시지 큐 필요)
❌ 디버깅 어려움
```

### 언제 사용할까?

**CQRS 사용:**
```
✅ 읽기/쓰기 비율이 극단적 (100:1 이상)
✅ 복잡한 조회 쿼리가 많음
✅ 높은 성능 필요
✅ 대규모 트래픽
예: 전자상거래, SNS, 뉴스 사이트
```

**CQRS 불필요:**
```
❌ 단순 CRUD 애플리케이션
❌ 트래픽 적음
❌ 팀 규모 작음
❌ 실시간 일관성 필수
예: 사내 관리 시스템, 작은 블로그
```

---

## 참고 자료

- [CQRS Pattern | Microsoft Docs](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Event Sourcing Pattern | Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)
- [NestJS CQRS Module](https://docs.nestjs.com/recipes/cqrs)
