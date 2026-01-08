# NestJS 아키텍처

**학습 날짜:** 2026-01-08

## 목차
1. [NestJS란?](#nestjs란)
2. [Express/Fastify와의 관계](#expressfastify와의-관계)
3. [Node.js 생태계 호환성](#nodejs-생태계-호환성)
4. [NestJS의 레이어 구조](#nestjs의-레이어-구조)

---

## NestJS란?

**NestJS = Express 또는 Fastify 위에 구축된 프레임워크**

```
┌─────────────────────────────┐
│   NestJS Framework          │ ← 데코레이터, DI, 모듈 시스템
├─────────────────────────────┤
│   Express 또는 Fastify      │ ← HTTP 어댑터 레이어
├─────────────────────────────┤
│   Node.js Runtime           │ ← 기본 런타임
└─────────────────────────────┘
```

---

## Express/Fastify와의 관계

### NestJS는 "추상화 레이어"

**Express/Fastify가 하는 일:**
- HTTP 요청/응답 처리
- 라우팅
- 미들웨어 실행

**NestJS가 추가하는 것:**
- 구조화된 아키텍처 (모듈, 컨트롤러, 서비스)
- 의존성 주입 (DI)
- 데코레이터 (@Controller, @Get 등)
- TypeScript 완전 지원
- 엔터프라이즈 패턴

### Express와 NestJS 비교

**Express (Low-level, 자유로움):**
```javascript
// 구조가 없음, 개발자가 모든 것을 결정
const express = require('express');
const app = express();

app.get('/users', (req, res) => {
  // 비즈니스 로직, DB 접근, 응답 모두 여기에
  const users = db.query('SELECT * FROM users');
  res.json(users);
});

app.listen(3000);
```

**NestJS (High-level, 구조화됨):**
```typescript
// 계층 구조 강제 (Controller → Service → Repository)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {} // DI

  @Get()
  findAll() {
    return this.usersService.findAll(); // 계층 분리
  }
}

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  findAll() {
    return this.usersRepository.find();
  }
}
```

### 비유

```
Express = 자동차 엔진
NestJS = 완성된 자동차 (엔진 + 차체 + 시스템)
```

- **Express**: 엔진만 제공, 나머지는 직접 조립
- **NestJS**: 엔진(Express)을 사용하되, 차체 구조(아키텍처)를 제공

---

## Node.js 생태계 호환성

### "완벽한 호환성"의 의미

NestJS는 Express/Fastify 위에서 동작하므로, **기존 Node.js 생태계와 100% 호환**됩니다.

#### 1. Express/Fastify 미들웨어 직접 사용

```typescript
// Express 미들웨어 그대로 사용
import * as helmet from 'helmet';
import * as cors from 'cors';

const app = await NestFactory.create(AppModule);
app.use(helmet());  // Express 미들웨어 그대로 사용
app.use(cors());
await app.listen(3000);
```

#### 2. npm 생태계의 모든 패키지 사용 가능

```typescript
// 일반 Node.js 라이브러리 사용
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { createClient } from 'redis';

// NestJS에서 그대로 사용
const hash = await bcrypt.hash(password, 10);
const token = jwt.sign(payload, secret);
```

#### 3. Express 객체에 직접 접근 가능

```typescript
@Get()
findAll(@Req() req: Request, @Res() res: Response) {
  // Express의 req, res 객체 직접 사용
  console.log(req.headers);
  res.status(200).json({ data: 'OK' });
}
```

#### 4. 기존 Express 앱을 점진적으로 마이그레이션 가능

```typescript
// 기존 Express 라우터를 NestJS에 마운트
const expressRouter = express.Router();
expressRouter.get('/legacy', (req, res) => res.send('old route'));

app.use('/api', expressRouter);
```

### 핵심 포인트

NestJS는 **추상화 레이어**일 뿐, 실제 HTTP 처리는 Express/Fastify가 담당하기 때문에:

- ✅ Express 생태계의 수천 개 미들웨어를 모두 사용 가능
- ✅ Node.js의 모든 라이브러리를 제약 없이 사용 가능
- ✅ 기존 코드를 버리지 않고 NestJS로 전환 가능
- ✅ 필요시 NestJS 레이어를 우회하고 Express를 직접 사용 가능

---

## NestJS의 레이어 구조

### 구조 다이어그램

```
┌──────────────────────────────────────────┐
│             Client (HTTP)                │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│           Controllers                    │ ← 라우팅, 요청 검증
│   @Controller(), @Get(), @Post()        │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│            Services                      │ ← 비즈니스 로직
│   @Injectable()                          │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│          Repositories                    │ ← 데이터 접근
│   TypeORM, Prisma 등                     │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│           Database                       │
└──────────────────────────────────────────┘
```

### 실제 코드 예시

```typescript
// Module: 모든 것을 묶음
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

// Controller: HTTP 요청 처리
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}

// Service: 비즈니스 로직
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }
}

// Entity: 데이터 모델
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}
```

---

## NestJS의 핵심 개념

### 1. 의존성 주입 (Dependency Injection)

```typescript
// ❌ 의존성을 직접 생성 (Express 방식)
class UsersController {
  private usersService = new UsersService(); // 직접 생성

  getUsers() {
    return this.usersService.findAll();
  }
}

// ✅ 의존성 주입 (NestJS 방식)
@Controller('users')
class UsersController {
  constructor(private usersService: UsersService) {} // 주입받음

  @Get()
  getUsers() {
    return this.usersService.findAll();
  }
}
```

**장점:**
- 테스트 쉬움 (Mock 주입 가능)
- 결합도 낮음
- 재사용성 높음

### 2. 모듈 시스템

```typescript
// 기능별로 모듈 분리
@Module({
  imports: [UsersModule, AuthModule, PostsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**장점:**
- 코드 조직화
- 지연 로딩 가능
- 팀 협업 쉬움

### 3. 데코레이터

```typescript
@Controller('users')    // 라우트 정의
export class UsersController {
  @Get(':id')           // HTTP 메서드
  @UseGuards(AuthGuard) // 가드 적용
  findOne(@Param('id') id: string) { // 파라미터 추출
    return { id };
  }
}
```

**장점:**
- 선언적 프로그래밍
- 메타데이터 기반
- 가독성 향상

---

## Express와 NestJS 언제 사용할까?

### Express 선택

```
✅ 빠른 프로토타입
✅ 작은 프로젝트
✅ 자유로운 구조 원함
✅ 최소한의 추상화 원함
```

### NestJS 선택

```
✅ 대규모 애플리케이션
✅ 팀 프로젝트 (구조화 필요)
✅ TypeScript 전용 프로젝트
✅ 엔터프라이즈 패턴 필요
✅ 유지보수성 중요
```

---

## 정리

**NestJS의 본질:**
- Express/Fastify를 **버리는 것이 아니라 감싸는 것**
- HTTP 처리는 Express/Fastify가, 아키텍처는 NestJS가 담당
- 기존 생태계와 100% 호환되면서 구조를 제공

**핵심 차이:**
```
Express: "어떻게 만들지" 자유
NestJS: "어떻게 만들지" 가이드 제공
```

---

## 참고 자료

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [Express 공식 문서](https://expressjs.com/)
- [Fastify 공식 문서](https://www.fastify.io/)
