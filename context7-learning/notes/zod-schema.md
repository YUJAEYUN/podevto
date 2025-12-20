# Zod 스키마 vs TypeScript Interface

## 개요

Context7 코드를 분석하다가 발견한 Zod 라이브러리 사용 패턴 정리.

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

const { object } = await generateObject({
  model: 'openai/gpt-4.1',
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});
```

---

## TypeScript Interface (컴파일 타임 검증)

```typescript
interface Recipe {
  name: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
}

// 컴파일 시점에만 타입 체크
const recipe: Recipe = JSON.parse(apiResponse); // 런타임에 검증 없음!
```

**한계점**: TypeScript 타입은 컴파일 후 **완전히 사라진다**. 런타임에는 아무런 보호가 없음.

---

## Zod (런타임 검증)

```typescript
const RecipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
  steps: z.array(z.string()),
});

// 런타임에 실제로 데이터 검증
const recipe = RecipeSchema.parse(apiResponse); // 잘못된 데이터면 에러 발생!
```

---

## 핵심 차이점

| 구분 | TypeScript Interface | Zod |
|------|---------------------|-----|
| **검증 시점** | 컴파일 타임만 | 컴파일 + **런타임** |
| **외부 데이터** | 믿고 써야 함 | 실제 검증 가능 |
| **에러 메시지** | 없음 (런타임) | 상세한 에러 제공 |
| **타입 추론** | 수동 정의 | `z.infer<typeof Schema>`로 자동 추출 |

---

## Context7에서 Zod를 쓰는 이유

```typescript
const { object } = await generateObject({
  model: 'openai/gpt-4.1',
  schema: z.object({ ... }),  // AI가 이 스키마에 맞는 응답을 생성
  prompt: 'Generate a lasagna recipe.',
});
```

AI 모델의 응답은 **외부 데이터**다. TypeScript만으로는 AI가 정말 올바른 형식으로 응답했는지 보장할 수 없다. Zod 스키마를 사용하면:

1. AI에게 **원하는 구조를 명확히 전달**
2. 응답이 스키마와 맞는지 **런타임에 검증**
3. TypeScript 타입도 **자동으로 추론**

---

## 핵심 원칙

> **"외부에서 오는 데이터는 절대 믿지 마라"** → Zod가 이 문제를 해결한다.

- API 응답
- 사용자 입력
- AI 모델 출력
- 파일에서 읽은 데이터

이런 외부 데이터는 항상 런타임 검증이 필요하다.
