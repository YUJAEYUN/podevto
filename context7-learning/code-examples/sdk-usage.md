# Context7 SDK 사용법

## SDK 설치

```bash
npm install @upstash/context7-sdk
# 또는
pnpm add @upstash/context7-sdk
```

## 기본 사용법

### 클라이언트 초기화

```typescript
import { Context7 } from "@upstash/context7-sdk";

// API Key 직접 전달
const client = new Context7({
  apiKey: "ctx7sk_your_api_key_here"
});

// 또는 환경변수 사용 (CONTEXT7_API_KEY)
const client = new Context7();
```

### 라이브러리 검색

```typescript
const results = await client.searchLibrary("react");

console.log(results);
// {
//   results: [
//     {
//       id: "/facebook/react",
//       title: "React",
//       description: "A JavaScript library for building user interfaces",
//       totalSnippets: 1500,
//       trustScore: 95,
//       versions: ["v18.3.1", "v19.0.0"]
//     },
//     ...
//   ]
// }
```

### 문서 가져오기 - JSON 형식

```typescript
// 코드 문서 (기본)
const codeDocs = await client.getDocs("/facebook/react", {
  mode: "code",
  topic: "hooks"
});

// 정보 문서
const infoDocs = await client.getDocs("/facebook/react", {
  mode: "info",
  topic: "architecture"
});
```

### 문서 가져오기 - 텍스트 형식

```typescript
const textDocs = await client.getDocs("/facebook/react", {
  format: "txt",
  topic: "hooks"
});

console.log(textDocs);
// {
//   content: "# React Hooks\n\n## useState\n...",
//   pagination: {
//     page: 1,
//     limit: 10,
//     totalPages: 5,
//     hasNext: true,
//     hasPrev: false
//   },
//   totalTokens: 15000
// }
```

### 페이지네이션

```typescript
// 첫 페이지
const page1 = await client.getDocs("/vercel/next.js", {
  format: "txt",
  topic: "routing",
  page: 1
});

// 다음 페이지
if (page1.pagination.hasNext) {
  const page2 = await client.getDocs("/vercel/next.js", {
    format: "txt",
    topic: "routing",
    page: 2
  });
}
```

### 특정 버전 문서

```typescript
// 버전 지정
const docs = await client.getDocs("/vercel/next.js/v14.3.0", {
  mode: "code",
  topic: "app-router"
});
```

## SDK 내부 구조

### Command 패턴

SDK는 Command 패턴으로 구현됨

```typescript
// packages/sdk/src/commands/command.ts
export abstract class Command<TResult> {
  protected request: RequestConfig;
  protected endpoint: string;

  constructor(request: RequestConfig, endpoint: string) {
    this.request = request;
    this.endpoint = endpoint;
  }

  abstract exec(client: Requester): Promise<TResult>;
}
```

### GetDocsCommand 예시

```typescript
// packages/sdk/src/commands/get-docs/index.ts
export class GetDocsCommand extends Command<DocsResponse> {
  constructor(libraryId: string, options?: GetDocsOptions) {
    // libraryId 파싱
    const cleaned = libraryId.startsWith("/") ? libraryId.slice(1) : libraryId;
    const [owner, repo] = cleaned.split("/");

    // 엔드포인트 구성
    const mode = options?.mode || "code";
    const endpoint = `v2/docs/${mode}/${owner}/${repo}`;

    // 쿼리 파라미터
    const queryParams: QueryParams = {};
    if (options?.topic) queryParams.topic = options.topic;
    if (options?.page) queryParams.page = options.page;

    super({ method: "GET", query: queryParams }, endpoint);
  }

  async exec(client: Requester): Promise<DocsResponse> {
    const { result, headers } = await client.request({
      method: "GET",
      path: [this.endpoint],
      query: this.request.query,
    });

    return result;
  }
}
```

### HTTP 클라이언트

```typescript
// packages/sdk/src/http/index.ts
export class HttpClient implements Requester {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: HttpConfig) {
    this.baseUrl = config.baseUrl;
    this.headers = {
      Authorization: `Bearer ${config.apiKey}`,
      ...config.headers,
    };
  }

  async request<T>(options: RequestOptions): Promise<{ result: T; headers: ResponseHeaders }> {
    const url = new URL(options.path.join("/"), this.baseUrl);

    // 쿼리 파라미터 추가
    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      method: options.method,
      headers: this.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Context7Error(`Request failed: ${response.status}`);
    }

    const result = await response.json();
    return { result, headers: this.parseHeaders(response.headers) };
  }
}
```

## 타입 정의

```typescript
// 설정
interface Context7Config {
  apiKey?: string;
}

// 검색 응답
interface SearchLibraryResponse {
  results: LibraryResult[];
}

interface LibraryResult {
  id: string;
  title: string;
  description: string;
  totalSnippets: number;
  trustScore?: number;
  benchmarkScore?: number;
  versions?: string[];
}

// getDocs 옵션
interface GetDocsOptions {
  mode?: "code" | "info";
  format?: "json" | "txt";
  topic?: string;
  page?: number;
  limit?: number;
  version?: string;
}

// 텍스트 문서 응답
interface TextDocsResponse {
  content: string;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  totalTokens: number;
}

// 코드 문서 응답 (JSON)
interface CodeDocsResponse {
  snippets: CodeSnippet[];
  pagination: Pagination;
}

interface CodeSnippet {
  title: string;
  code: string;
  language: string;
  description?: string;
}
```

## 에러 처리

```typescript
import { Context7, Context7Error } from "@upstash/context7-sdk";

try {
  const client = new Context7({ apiKey: "invalid_key" });
  const docs = await client.getDocs("/facebook/react");
} catch (error) {
  if (error instanceof Context7Error) {
    console.error("Context7 API Error:", error.message);
    // "Invalid API key" 또는 "Rate limited" 등
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## 실제 사용 예시

### Next.js API Route에서 사용

```typescript
// app/api/docs/route.ts
import { Context7 } from "@upstash/context7-sdk";
import { NextResponse } from "next/server";

const client = new Context7();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const library = searchParams.get("library");
  const topic = searchParams.get("topic");

  if (!library) {
    return NextResponse.json({ error: "library required" }, { status: 400 });
  }

  try {
    const docs = await client.getDocs(library, {
      format: "txt",
      topic: topic || undefined,
    });

    return NextResponse.json(docs);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

### RAG 시스템과 통합

```typescript
import { Context7 } from "@upstash/context7-sdk";
import { OpenAI } from "openai";

const context7 = new Context7();
const openai = new OpenAI();

async function answerWithDocs(question: string, library: string) {
  // 1. 관련 문서 가져오기
  const docs = await context7.getDocs(library, {
    format: "txt",
    topic: extractTopic(question), // 질문에서 토픽 추출
  });

  // 2. LLM에게 컨텍스트와 함께 질문
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant. Use this documentation:\n\n${docs.content}`,
      },
      {
        role: "user",
        content: question,
      },
    ],
  });

  return response.choices[0].message.content;
}

// 사용
const answer = await answerWithDocs(
  "How do I use useState in React?",
  "/facebook/react"
);
```
