# SOLID 원칙

**학습 날짜:** 2026-01-08

객체지향 설계의 5가지 핵심 원칙으로, 유지보수하기 쉽고 확장 가능한 코드를 작성하기 위한 가이드라인입니다.

---

## S - Single Responsibility Principle (단일 책임 원칙)

**"한 클래스는 하나의 책임만 가져야 한다"**

### ❌ 나쁜 예시 (여러 책임)

```typescript
class User {
  name: string;
  email: string;

  // 책임 1: 사용자 데이터 관리
  updateEmail(email: string) {
    this.email = email;
  }

  // 책임 2: 데이터베이스 저장
  saveToDatabase() {
    const db = new Database();
    db.query(`INSERT INTO users VALUES ('${this.name}', '${this.email}')`);
  }

  // 책임 3: 이메일 발송
  sendWelcomeEmail() {
    const smtp = new SMTPClient();
    smtp.send(this.email, 'Welcome!');
  }

  // 책임 4: 데이터 검증
  validate() {
    if (!this.email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}
```

### ✅ 좋은 예시 (단일 책임)

```typescript
// 책임 1: 사용자 데이터만 관리
class User {
  name: string;
  email: string;

  updateEmail(email: string) {
    this.email = email;
  }
}

// 책임 2: 데이터베이스 저장
class UserRepository {
  save(user: User) {
    const db = new Database();
    db.query(`INSERT INTO users VALUES ('${user.name}', '${user.email}')`);
  }
}

// 책임 3: 이메일 발송
class EmailService {
  sendWelcomeEmail(email: string) {
    const smtp = new SMTPClient();
    smtp.send(email, 'Welcome!');
  }
}

// 책임 4: 검증
class UserValidator {
  validate(user: User) {
    if (!user.email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}
```

---

## O - Open/Closed Principle (개방/폐쇄 원칙)

**"확장에는 열려있고, 수정에는 닫혀있어야 한다"**

### ❌ 나쁜 예시 (수정이 필요)

```typescript
class PaymentProcessor {
  processPayment(amount: number, type: string) {
    if (type === 'credit-card') {
      console.log(`Processing ${amount} via Credit Card`);
    } else if (type === 'paypal') {
      console.log(`Processing ${amount} via PayPal`);
    } else if (type === 'bitcoin') {
      console.log(`Processing ${amount} via Bitcoin`);
    }
    // 새 결제 수단 추가하려면? → 이 클래스를 직접 수정해야 함! (위험)
  }
}
```

### ✅ 좋은 예시 (확장 가능)

```typescript
// 인터페이스 정의
interface PaymentMethod {
  process(amount: number): void;
}

// 각 결제 수단을 별도 클래스로
class CreditCardPayment implements PaymentMethod {
  process(amount: number) {
    console.log(`Processing ${amount} via Credit Card`);
  }
}

class PayPalPayment implements PaymentMethod {
  process(amount: number) {
    console.log(`Processing ${amount} via PayPal`);
  }
}

// 프로세서는 수정 없이 확장 가능
class PaymentProcessor {
  processPayment(amount: number, method: PaymentMethod) {
    method.process(amount);
  }
}

// 새 결제 수단 추가 (기존 코드 수정 없이!)
class KakaoPayPayment implements PaymentMethod {
  process(amount: number) {
    console.log(`Processing ${amount} via KakaoPay`);
  }
}

const processor = new PaymentProcessor();
processor.processPayment(300, new KakaoPayPayment()); // ✅ 동작!
```

---

## L - Liskov Substitution Principle (리스코프 치환 원칙)

**"부모 클래스를 자식 클래스로 치환해도 동작해야 한다"**

### ❌ 나쁜 예시 (치환 불가)

```typescript
class Bird {
  fly() {
    console.log('Flying...');
  }
}

class Sparrow extends Bird {
  fly() {
    console.log('Sparrow flying');
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error('Penguins cannot fly!'); // ❌ 부모와 다른 동작!
  }
}

// 사용
function makeBirdFly(bird: Bird) {
  bird.fly(); // 모든 Bird는 날 수 있다고 가정
}

makeBirdFly(new Sparrow()); // ✅ OK
makeBirdFly(new Penguin()); // ❌ 에러 발생! (치환 불가)
```

### ✅ 좋은 예시 (치환 가능)

```typescript
// 더 정확한 추상화
class Bird {
  eat() {
    console.log('Eating...');
  }
}

class FlyingBird extends Bird {
  fly() {
    console.log('Flying...');
  }
}

class Sparrow extends FlyingBird {
  fly() {
    console.log('Sparrow flying');
  }
}

class Penguin extends Bird {
  swim() {
    console.log('Penguin swimming');
  }
}

// 사용
function makeFlyingBirdFly(bird: FlyingBird) {
  bird.fly(); // FlyingBird만 받음
}

makeFlyingBirdFly(new Sparrow()); // ✅ OK
// makeFlyingBirdFly(new Penguin()); // 컴파일 에러 (타입이 안 맞음)
```

---

## I - Interface Segregation Principle (인터페이스 분리 원칙)

**"클라이언트가 사용하지 않는 인터페이스에 의존하면 안 된다"**

### ❌ 나쁜 예시 (비대한 인터페이스)

```typescript
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  getSalary(): number;
}

// 사람 노동자
class HumanWorker implements Worker {
  work() { console.log('Working...'); }
  eat() { console.log('Eating lunch...'); }
  sleep() { console.log('Sleeping...'); }
  getSalary() { return 50000; }
}

// 로봇 노동자
class RobotWorker implements Worker {
  work() { console.log('Working 24/7...'); }
  eat() { throw new Error('Robots do not eat'); } // ❌ 불필요한 구현 강제
  sleep() { throw new Error('Robots do not sleep'); } // ❌
  getSalary() { return 0; }
}
```

### ✅ 좋은 예시 (분리된 인터페이스)

```typescript
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

interface Payable {
  getSalary(): number;
}

// 사람은 필요한 것만 구현
class HumanWorker implements Workable, Eatable, Sleepable, Payable {
  work() { console.log('Working...'); }
  eat() { console.log('Eating lunch...'); }
  sleep() { console.log('Sleeping...'); }
  getSalary() { return 50000; }
}

// 로봇도 필요한 것만 구현
class RobotWorker implements Workable {
  work() { console.log('Working 24/7...'); }
  // eat, sleep 구현 불필요! ✅
}
```

---

## D - Dependency Inversion Principle (의존성 역전 원칙)

**"구체적인 것이 아닌 추상화에 의존해야 한다"**

### ❌ 나쁜 예시 (구체 클래스에 의존)

```typescript
class MySQLDatabase {
  connect() {
    console.log('Connecting to MySQL...');
  }
  query(sql: string) {
    console.log(`MySQL Query: ${sql}`);
  }
}

class UserService {
  private db: MySQLDatabase; // ❌ 구체 클래스에 직접 의존

  constructor() {
    this.db = new MySQLDatabase();
  }

  getUser(id: number) {
    this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// 문제: PostgreSQL로 바꾸려면 UserService 전체 수정 필요!
```

### ✅ 좋은 예시 (추상화에 의존)

```typescript
// 추상화 (인터페이스)
interface Database {
  connect(): void;
  query(sql: string): void;
}

// 구체 구현 1
class MySQLDatabase implements Database {
  connect() {
    console.log('Connecting to MySQL...');
  }
  query(sql: string) {
    console.log(`MySQL Query: ${sql}`);
  }
}

// 구체 구현 2
class PostgreSQLDatabase implements Database {
  connect() {
    console.log('Connecting to PostgreSQL...');
  }
  query(sql: string) {
    console.log(`PostgreSQL Query: ${sql}`);
  }
}

// 고수준 모듈이 추상화에 의존
class UserService {
  private db: Database; // ✅ 인터페이스에 의존

  constructor(database: Database) { // 의존성 주입
    this.db = database;
  }

  getUser(id: number) {
    this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// 사용 (DB 교체 쉬움!)
const mysqlService = new UserService(new MySQLDatabase());
const postgresService = new UserService(new PostgreSQLDatabase());
// UserService 코드 수정 없이 DB 변경 가능! ✅
```

---

## SOLID 원칙 요약

| 원칙 | 핵심 | 목적 |
|------|------|------|
| **S** | 한 클래스는 한 가지 일만 | 변경 이유를 하나로 제한 |
| **O** | 확장은 쉽게, 수정은 안 함 | 기존 코드 건드리지 않고 기능 추가 |
| **L** | 자식이 부모를 대체 가능 | 상속 관계의 일관성 유지 |
| **I** | 필요한 인터페이스만 구현 | 불필요한 의존성 제거 |
| **D** | 구체가 아닌 추상에 의존 | 결합도 낮추고 유연성 증가 |

---

## 실무에서 SOLID 적용

```typescript
// SOLID를 모두 적용한 예시
// S: 각 클래스가 하나의 책임
// O: 새 결제 수단 추가 시 확장만
// L: PaymentMethod 어디든 치환 가능
// I: 필요한 메서드만 정의
// D: 추상 인터페이스에 의존

interface PaymentMethod { // I, D
  process(amount: number): void;
}

class StripePayment implements PaymentMethod { // S
  process(amount: number) {
    console.log(`Stripe: ${amount}`);
  }
}

class PaymentProcessor { // S, D
  constructor(private method: PaymentMethod) {} // 의존성 주입

  execute(amount: number) { // L
    this.method.process(amount);
  }
}

// O: 새 결제 수단 추가 (기존 코드 수정 없이)
class TossPayment implements PaymentMethod {
  process(amount: number) {
    console.log(`Toss: ${amount}`);
  }
}
```

---

## 마무리

**SOLID는 완벽한 답이 아니라 가이드라인입니다.** 상황에 따라 유연하게 적용하세요!

- 과도한 추상화는 오히려 복잡성을 증가시킵니다
- 실용적인 균형을 찾는 것이 중요합니다
- 작은 프로젝트에서는 모든 원칙을 엄격히 지킬 필요 없습니다

---

## 참고 자료

- [SOLID Principles | Wikipedia](https://en.wikipedia.org/wiki/SOLID)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles in TypeScript](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
