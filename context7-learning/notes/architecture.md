# Context7 아키텍처 분석

## 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              공개 영역                                   │
│                        (GitHub: upstash/context7)                       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     packages/mcp                                 │   │
│  │                  (@upstash/context7-mcp)                        │   │
│  │                                                                  │   │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │   │
│  │   │  index.ts   │    │   api.ts    │    │  types.ts   │        │   │
│  │   │  (진입점)   │ →  │  (API 호출) │    │  (타입)     │        │   │
│  │   └─────────────┘    └─────────────┘    └─────────────┘        │   │
│  │                                                                  │   │
│  │   Tools:                                                         │   │
│  │   - resolve-library-id                                           │   │
│  │   - get-library-docs                                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     packages/sdk                                 │   │
│  │                  (@upstash/context7-sdk)                        │   │
│  │                                                                  │   │
│  │   - Context7 클래스 (HTTP 클라이언트)                           │   │
│  │   - searchLibrary(), getDocs() 메서드                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  packages/tools-ai-sdk                           │   │
│  │              (@upstash/context7-tools-ai-sdk)                   │   │
│  │                                                                  │   │
│  │   - Vercel AI SDK 통합                                          │   │
│  │   - Agent 시스템 프롬프트                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ HTTPS API 호출
                                    │ https://context7.com/api/v2/...
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                              비공개 영역                                 │
│                          (Upstash 인프라)                               │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ API Server  │  │  Crawling   │  │   Parsing   │  │  Vector DB  │   │
│  │             │  │   Engine    │  │   Engine    │  │  (검색)     │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
│  - 라이브러리 문서 크롤링                                               │
│  - 코드 스니펫 추출                                                     │
│  - 의미 검색 (semantic search)                                         │
│  - Rate limiting & Auth                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## 패키지별 상세 분석

### 1. packages/mcp (MCP 서버)

**핵심 파일 구조**

```
packages/mcp/
├── src/
│   ├── index.ts          # 진입점, MCP 서버 설정
│   └── lib/
│       ├── api.ts        # Context7 API 호출
│       ├── types.ts      # 타입 정의
│       ├── utils.ts      # 포매팅 유틸
│       └── encryption.ts # 헤더 생성
├── package.json
└── tsconfig.json
```

**index.ts 핵심 구조**

```typescript
// 1. MCP 서버 생성
const server = new McpServer({
  name: "Context7",
  version: "1.0.13",
});

// 2. Tool 등록 (resolve-library-id)
server.registerTool("resolve-library-id", { ... });

// 3. Tool 등록 (get-library-docs)
server.registerTool("get-library-docs", { ... });

// 4. Transport 설정 (stdio 또는 http)
if (transportType === "http") {
  // Express 서버
} else {
  // stdio 연결
}
```

**의존성**

| 패키지 | 역할 |
|--------|------|
| `@modelcontextprotocol/sdk` | MCP 프로토콜 구현 |
| `express` | HTTP 서버 |
| `commander` | CLI 파싱 |
| `zod` | 스키마 검증 |
| `undici` | HTTP 클라이언트 (프록시 지원) |

### 2. packages/sdk (JavaScript SDK)

**핵심 파일 구조**

```
packages/sdk/
├── src/
│   ├── client.ts         # Context7 클래스
│   ├── commands/
│   │   ├── command.ts    # Command 베이스 클래스
│   │   ├── get-docs/     # getDocs 명령
│   │   └── search-library/  # searchLibrary 명령
│   ├── http/
│   │   └── index.ts      # HTTP 클라이언트
│   └── error/
│       └── index.ts      # 에러 처리
└── package.json
```

**Command 패턴 사용**

```typescript
// 각 API 호출을 Command 객체로 추상화
class GetDocsCommand extends Command<DocsResponse> {
  constructor(libraryId: string, options?: GetDocsOptions) {
    const endpoint = `v2/docs/${mode}/${owner}/${repo}`;
    super({ method: "GET", query: queryParams }, endpoint);
  }

  async exec(client: Requester): Promise<DocsResponse> {
    const { result } = await client.request({ ... });
    return result;
  }
}
```

### 3. packages/tools-ai-sdk (Vercel AI SDK 통합)

**용도**: Vercel AI SDK와 함께 사용할 때 Context7 도구 제공

```typescript
import { context7Tools } from "@upstash/context7-tools-ai-sdk";

// Vercel AI SDK의 generateText와 함께 사용
const result = await generateText({
  model: openai("gpt-4"),
  tools: context7Tools,
  prompt: "Next.js에서 middleware 사용법",
});
```

## API 엔드포인트

### 공개 API (https://context7.com/api)

| 엔드포인트 | 설명 |
|------------|------|
| `GET /v2/search?query=...` | 라이브러리 검색 |
| `GET /v2/docs/code/{owner}/{repo}` | 코드 문서 조회 |
| `GET /v2/docs/info/{owner}/{repo}` | 정보 문서 조회 |

### 요청/응답 예시

**검색 요청**

```
GET https://context7.com/api/v2/search?query=react
Authorization: Bearer ctx7sk_...
```

**검색 응답**

```json
{
  "results": [
    {
      "id": "/facebook/react",
      "title": "React",
      "description": "A JavaScript library for building user interfaces",
      "totalSnippets": 1500,
      "trustScore": 95,
      "benchmarkScore": 87,
      "versions": ["v18.3.1", "v19.0.0"]
    }
  ]
}
```

**문서 요청**

```
GET https://context7.com/api/v2/docs/code/facebook/react?topic=hooks&type=txt
```

**문서 응답** (plain text)

```
# React Hooks

## useState
useState is a React Hook that lets you add state...

## useEffect
useEffect is a React Hook that lets you synchronize...
```

## 코드 흐름 분석

### resolve-library-id 호출 시

```
1. MCP Client → Tool 호출
   { name: "resolve-library-id", arguments: { libraryName: "react" } }

2. index.ts의 registerTool 핸들러 실행
   → searchLibraries("react") 호출

3. api.ts의 searchLibraries 함수
   → fetch("https://context7.com/api/v2/search?query=react")

4. 응답 파싱 후 formatSearchResults로 포매팅

5. MCP Client에게 결과 반환
   { content: [{ type: "text", text: "..." }] }
```

### get-library-docs 호출 시

```
1. MCP Client → Tool 호출
   { name: "get-library-docs", arguments: {
     context7CompatibleLibraryID: "/facebook/react",
     mode: "code",
     topic: "hooks"
   }}

2. index.ts의 registerTool 핸들러 실행
   → fetchLibraryDocumentation("/facebook/react", "code", { topic: "hooks" })

3. api.ts의 fetchLibraryDocumentation 함수
   → parseLibraryId("/facebook/react")
     → { username: "facebook", library: "react" }
   → fetch("https://context7.com/api/v2/docs/code/facebook/react?topic=hooks")

4. 응답 텍스트를 그대로 반환

5. MCP Client에게 결과 반환
   { content: [{ type: "text", text: "# React Hooks\n\n..." }] }
```

## 설계 특징

### 1. Thin Client 패턴

MCP 서버는 단순히 API를 호출하는 **얇은 레이어**

```
모든 복잡한 로직은 백엔드에:
- 문서 크롤링
- 파싱 & 인덱싱
- 의미 검색
- 캐싱

MCP 서버는 단순히:
- Tool 정의
- API 호출
- 결과 포매팅
```

### 2. 두 가지 문서 모드

| 모드 | 용도 | 예시 |
|------|------|------|
| `code` | API 레퍼런스, 코드 예제 | 함수 시그니처, 사용 예시 |
| `info` | 개념 설명, 가이드 | 아키텍처 설명, 튜토리얼 |

### 3. 페이지네이션 지원

```typescript
// 첫 페이지
await getDocs("/vercel/next.js", { topic: "routing", page: 1 });

// 정보가 부족하면 다음 페이지
await getDocs("/vercel/next.js", { topic: "routing", page: 2 });
```

### 4. 버전 지원

```typescript
// 특정 버전 문서
await getDocs("/vercel/next.js/v14.3.0", { topic: "routing" });
```
