# ORM과 SQL Injection

**학습 날짜:** 2026-01-08

## 목차
1. [ORM이란?](#orm이란)
2. [ORM 내부 구현 원리](#orm-내부-구현-원리)
3. [SQL Injection 방어 메커니즘](#sql-injection-방어-메커니즘)
4. [Raw SQL vs ORM 비교](#raw-sql-vs-orm-비교)

---

## ORM이란?

**ORM (Object-Relational Mapping) = 객체(코드) ↔ 관계형 DB 사이의 번역기**

```
JavaScript 객체          ORM          SQL Database
─────────────────    ─────────    ───────────────
user.findAll()   →   번역기   →   SELECT * FROM users
user.create()    →   번역기   →   INSERT INTO users
```

---

## ORM 내부 구현 원리

### 1. 쿼리 빌더 패턴 (메서드 체이닝)

```javascript
class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.wheres = [];
    this.selects = ['*'];
  }

  select(columns) {
    this.selects = columns;
    return this; // 체이닝을 위해 자기 자신 반환
  }

  where(column, value) {
    this.wheres.push({ column, value });
    return this;
  }

  toSQL() {
    // SQL 문자열을 조립
    let sql = `SELECT ${this.selects.join(', ')} FROM ${this.table}`;

    if (this.wheres.length > 0) {
      const conditions = this.wheres
        .map(w => `${w.column} = ?`)
        .join(' AND ');
      sql += ` WHERE ${conditions}`;
    }

    return sql;
  }

  async execute() {
    const sql = this.toSQL();
    const params = this.wheres.map(w => w.value);
    return db.query(sql, params); // 파라미터 바인딩
  }
}

// 사용 예시
const query = new QueryBuilder('users')
  .select(['name', 'email'])
  .where('age', 25)
  .where('city', 'Seoul');

console.log(query.toSQL());
// 출력: SELECT name, email FROM users WHERE age = ? AND city = ?
```

### 2. 메타데이터와 데코레이터 활용

```typescript
// 데코레이터로 테이블 정보 저장
function Entity(tableName: string) {
  return function(target: any) {
    target.tableName = tableName;
  };
}

function Column(type: string) {
  return function(target: any, propertyKey: string) {
    if (!target.constructor.columns) {
      target.constructor.columns = [];
    }
    target.constructor.columns.push({
      name: propertyKey,
      type: type
    });
  };
}

@Entity('users')
class User {
  @Column('int')
  id: number;

  @Column('varchar')
  name: string;

  @Column('varchar')
  email: string;
}

// ORM이 메타데이터를 읽어서 SQL 생성
function createTable(EntityClass: any) {
  const tableName = EntityClass.tableName;
  const columns = EntityClass.columns
    .map(col => `${col.name} ${col.type}`)
    .join(', ');

  const sql = `CREATE TABLE ${tableName} (${columns})`;
  return sql;
  // 출력: CREATE TABLE users (id int, name varchar, email varchar)
}
```

### 핵심 원리

ORM은 마법이 아니라 **문자열 조립기 + 메타데이터 관리자**입니다.

1. **메타데이터 수집**: 데코레이터/클래스 정보로 테이블 구조 파악
2. **쿼리 빌더**: 메서드 체이닝으로 SQL 문자열 조립
3. **문자열 템플릿**: 결국 SQL은 문자열이므로 조립만 하면 됨
4. **파라미터 바인딩**: SQL Injection 방지를 위해 값과 쿼리 분리
5. **결과 매핑**: DB 결과(행)를 객체로 변환

---

## SQL Injection 방어 메커니즘

### SQL Injection 공격 원리

```javascript
// ❌ 위험한 코드 (문자열 결합)
const userInput = "admin' OR '1'='1"; // 해커가 입력

const sql = `SELECT * FROM users WHERE username = '${userInput}'`;
console.log(sql);
// 결과: SELECT * FROM users WHERE username = 'admin' OR '1'='1'
//      → 모든 사용자 정보 노출!
```

### 방어 방법 1: 이스케이프 (Escaping)

```javascript
// 위험한 입력
const userInput = "admin' OR '1'='1";

// 이스케이프 처리 (모든 '를 ''로 변경)
const escaped = userInput.replace(/'/g, "''");
// 결과: "admin'' OR ''1''=''1"

// SQL 실행
const sql = `SELECT * FROM users WHERE username = '${escaped}'`;
// 실제 쿼리: SELECT * FROM users WHERE username = 'admin'' OR ''1''=''1'
// → 이건 그냥 문자열로 취급됨 (공격 실패)
```

**SQL에서 따옴표 규칙:**
- `'` (작은따옴표 1개) = 문자열의 시작/끝
- `''` (작은따옴표 2개) = 문자 `'` 그 자체

```sql
-- 예시
SELECT * FROM users WHERE name = 'O''Brien';
-- 실제 검색: O'Brien
```

### 방어 방법 2: 파라미터 바인딩 (Prepared Statement) ⭐ ORM이 사용

```javascript
// 위험한 입력
const userInput = "admin' OR '1'='1";

// SQL과 데이터를 완전히 분리
const sql = 'SELECT * FROM users WHERE username = ?';
const params = [userInput];

// DB 드라이버가 내부적으로 처리:
// 1단계: SQL 구조 파싱 및 컴파일
//   - WHERE username = ? (여기서 ?는 값이 들어갈 자리)
// 2단계: 파라미터를 데이터로만 처리
//   - ? 자리에 데이터를 안전하게 바인딩
//   - 이때 자동으로 이스케이프 + 타입 검증

db.query(sql, params);
```

**핵심:** SQL 구조와 데이터를 분리해서 **데이터가 절대 SQL 명령어가 될 수 없음**

### ORM이 안전한 이유

```typescript
// ORM 사용
const userInput = "admin' OR '1'='1";

userRepository.findOne({
  where: { username: userInput }
});

// ORM이 내부적으로 하는 일:
// 1. SQL 생성: SELECT * FROM users WHERE username = ?
// 2. 파라미터 바인딩: [userInput]
// 3. 자동으로 이스케이프 처리
```

**ORM은 항상 파라미터 바인딩을 사용**하기 때문에 안전합니다.

---

## Raw SQL vs ORM 비교

### 결과 형태 차이

**Raw SQL - 일반 객체:**
```javascript
const result = await db.query('SELECT * FROM users WHERE id = 1');
const user = result[0];

console.log(user);
// {
//   id: 1,
//   firstName: 'John',
//   lastName: 'Doe',
//   email: 'john@example.com'
// }

console.log(user.constructor.name); // 'Object'
user.getFullName(); // ❌ 에러! 메서드 없음
```

**ORM - 클래스 인스턴스:**
```typescript
const user = await userRepository.findOne({ where: { id: 1 } });

console.log(user);
// User {
//   id: 1,
//   firstName: 'John',
//   lastName: 'Doe',
//   email: 'john@example.com',
//   getFullName: [Function],
//   posts: [...]
// }

console.log(user.constructor.name); // 'User'
console.log(user instanceof User); // true
user.getFullName(); // ✅ 'John Doe'
```

### ORM 래핑의 이점

| 기능 | Raw SQL (일반 객체) | ORM (래핑된 인스턴스) |
|------|---------------------|----------------------|
| **메서드** | ❌ 없음 | ✅ 비즈니스 로직 포함 가능 |
| **타입 안정성** | ❌ 없음 (any 같음) | ✅ 강력한 타입 체크 |
| **관계 데이터** | ❌ 수동 JOIN/매핑 | ✅ 자동 로드 |
| **데이터 변환** | ❌ 수동 (Date, JSON 등) | ✅ 자동 변환 |
| **IDE 지원** | ❌ 자동완성 없음 | ✅ 자동완성/타입힌트 |
| **일관성** | ❌ 형태가 다를 수 있음 | ✅ 항상 같은 인스턴스 |

### 장단점 비교

**ORM 장점:**
- ✅ 타입 안전성 (TypeScript)
- ✅ SQL Injection 자동 방지
- ✅ 데이터베이스 독립성
- ✅ 객체 지향적 코드
- ✅ 관계 관리 쉬움
- ✅ 빠른 개발 속도

**ORM 단점:**
- ❌ 성능 오버헤드
- ❌ 복잡한 쿼리 작성 어려움
- ❌ 러닝 커브
- ❌ N+1 문제 발생 가능

**Raw SQL 장점:**
- ✅ 성능 최적화 가능
- ✅ 복잡한 쿼리 작성 가능
- ✅ DB 특화 기능 사용
- ✅ 러닝 커브 낮음

**Raw SQL 단점:**
- ❌ SQL Injection 수동 방어 필요
- ❌ 타입 안전성 없음
- ❌ 보일러플레이트 코드
- ❌ 데이터베이스 종속성

---

## 실무 조합 전략

```typescript
// 일반적인 CRUD는 ORM
const user = await userRepository.save({
  name: 'John',
  email: 'john@example.com'
});

// 복잡한 분석 쿼리는 Raw SQL
const stats = await connection.query(`
  SELECT
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as count,
    AVG(price) as avg_price
  FROM orders
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY date
  ORDER BY date
`);
```

**결론:** ORM과 Raw SQL은 대립 관계가 아닌 **상황에 따라 선택하는 도구**입니다. 대부분의 프로젝트에서는 **ORM을 기본으로 사용하되, 필요시 Raw SQL을 혼용**하는 것이 최선입니다.

---

## 참고 자료
- TypeORM 공식 문서: https://typeorm.io/
- Sequelize 공식 문서: https://sequelize.org/
- OWASP SQL Injection: https://owasp.org/www-community/attacks/SQL_Injection
