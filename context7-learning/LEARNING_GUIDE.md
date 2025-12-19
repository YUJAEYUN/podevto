# Context7 오픈소스 학습 가이드

> 개발할 때 자주 사용했던 Context7의 내부 구현체와 생태계를 분석한 학습 자료

## 📚 학습 자료

### Notes (개념 정리)
- [MCP 프로토콜 이해하기](notes/mcp-protocol.md) - MCP란 무엇인가, 왜 필요한가
- [아키텍처 분석](notes/architecture.md) - Context7 전체 시스템 구조
- [생태계 분석](notes/ecosystem.md) - Upstash, MCP 생태계에서의 위치

### Code Examples (코드 분석)
- [MCP 서버 구조](code-examples/mcp-server-structure.md) - index.ts, api.ts 상세 분석
- [SDK 사용법](code-examples/sdk-usage.md) - SDK 사용 예제 및 내부 구조

---

## 프로젝트 개요

### 기본 정보
- **프로젝트명**: Context7
- **GitHub**: https://github.com/upstash/context7
- **라이선스**: MIT
- **언어**: TypeScript
- **개발사**: Upstash

### Context7이 해결하는 문제

```
❌ LLM 없이 코딩할 때의 문제점:
─────────────────────────────
- LLM의 학습 데이터가 오래됨 (1-2년 전)
- 존재하지 않는 API를 환각 (hallucination)
- 구버전 라이브러리 기준으로 답변

✅ Context7 사용 시:
─────────────────────
- 최신 문서를 LLM 컨텍스트에 직접 주입
- 실제 존재하는 API만 참조
- 버전별 정확한 문서 제공
```

### 핵심 동작 원리

```
┌─────────────────────────────────────────────────────────────────────┐
│                         사용자 Prompt                                │
│  "Next.js에서 middleware로 JWT 인증하는 방법 use context7"           │
└─────────────────────────────────┬───────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    MCP Client (Cursor, Claude Code 등)              │
│                                                                     │
│  1. "use context7" 감지                                             │
│  2. Context7 MCP 서버의 tool 호출                                   │
└─────────────────────────────────┬───────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Context7 MCP Server                              │
│                    (@upstash/context7-mcp)                          │
│                                                                     │
│  Tool 1: resolve-library-id                                         │
│    → "Next.js" 검색 → "/vercel/next.js" 반환                        │
│                                                                     │
│  Tool 2: get-library-docs                                           │
│    → /vercel/next.js의 middleware 관련 문서 fetch                   │
└─────────────────────────────────┬───────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Context7 Backend API                             │
│                    (https://context7.com/api)                       │
│                                                                     │
│  - 라이브러리 검색 API                                              │
│  - 문서 제공 API                                                    │
│  - (이 부분은 비공개 - 크롤링/파싱 엔진)                            │
└─────────────────────────────────┬───────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    LLM에게 전달되는 최종 컨텍스트                    │
│                                                                     │
│  [사용자 질문] + [Next.js 최신 middleware 문서 & 코드 예제]         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 프로젝트 구조

### 모노레포 구조

```
context7/
├── packages/
│   ├── mcp/              ← MCP 서버 (핵심)
│   ├── sdk/              ← JavaScript/TypeScript SDK
│   └── tools-ai-sdk/     ← Vercel AI SDK 통합
├── docs/                 ← 문서
├── i18n/                 ← 다국어 README
├── package.json          ← 루트 (pnpm workspace)
└── pnpm-workspace.yaml
```

### 패키지별 역할

| 패키지 | npm 이름 | 역할 |
|--------|----------|------|
| `packages/mcp` | `@upstash/context7-mcp` | MCP 서버 - LLM 클라이언트와 통신 |
| `packages/sdk` | `@upstash/context7-sdk` | HTTP API를 직접 호출하는 SDK |
| `packages/tools-ai-sdk` | `@upstash/context7-tools-ai-sdk` | Vercel AI SDK와 통합 |

---

## 핵심 컴포넌트 분석

### 1. MCP 서버 (`packages/mcp`)

**MCP (Model Context Protocol)란?**

Anthropic이 만든 프로토콜로, LLM 클라이언트(Cursor, Claude Code 등)와 외부 도구를 연결하는 표준

```
┌──────────────────┐     MCP Protocol     ┌──────────────────┐
│  MCP Client      │ ←──────────────────→ │  MCP Server      │
│  (Cursor 등)     │     (JSON-RPC)       │  (Context7)      │
└──────────────────┘                      └──────────────────┘
```

**Context7 MCP 서버 진입점 (`src/index.ts`)**

```typescript
// MCP 서버 생성
const server = new McpServer({
  name: "Context7",
  version: "1.0.13",
});

// Tool 1: 라이브러리 ID 검색
server.registerTool("resolve-library-id", {
  inputSchema: {
    libraryName: z.string()  // 예: "react", "next.js"
  },
}, async ({ libraryName }) => {
  // Context7 API 호출 → 라이브러리 목록 반환
  const results = await searchLibraries(libraryName);
  return formatSearchResults(results);
});

// Tool 2: 문서 가져오기
server.registerTool("get-library-docs", {
  inputSchema: {
    context7CompatibleLibraryID: z.string(),  // 예: "/vercel/next.js"
    mode: z.enum(["code", "info"]).optional(),
    topic: z.string().optional(),
    page: z.number().optional(),
  },
}, async ({ context7CompatibleLibraryID, mode, topic, page }) => {
  // Context7 API 호출 → 문서 텍스트 반환
  const docs = await fetchLibraryDocumentation(
    context7CompatibleLibraryID,
    mode,
    { topic, page }
  );
  return docs;
});
```

**Transport 방식**

| Transport | 용도 | 설정 |
|-----------|------|------|
| **stdio** | 로컬 실행 (npx) | `npx @upstash/context7-mcp` |
| **http** | 원격 서버 | `https://mcp.context7.com/mcp` |

```typescript
if (transportType === "http") {
  // Express 서버로 HTTP 엔드포인트 제공
  const app = express();
  app.all("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport();
    await server.connect(transport);
  });
} else {
  // stdio로 직접 통신 (npx 실행 시)
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

### 2. API 통신 (`src/lib/api.ts`)

**라이브러리 검색**

```typescript
const CONTEXT7_API_BASE_URL = "https://context7.com/api";

export async function searchLibraries(query: string): Promise<SearchResponse> {
  const url = new URL(`${CONTEXT7_API_BASE_URL}/v2/search`);
  url.searchParams.set("query", query);

  const response = await fetch(url, { headers });
  return await response.json();
}
```

**문서 가져오기**

```typescript
export async function fetchLibraryDocumentation(
  libraryId: string,  // "/vercel/next.js"
  docMode: "code" | "info",
  options: { page?, limit?, topic? }
): Promise<string | null> {

  // libraryId 파싱: "/vercel/next.js" → { username: "vercel", library: "next.js" }
  const { username, library, tag } = parseLibraryId(libraryId);

  // API 엔드포인트 구성
  // → https://context7.com/api/v2/docs/code/vercel/next.js?topic=middleware
  const url = `${CONTEXT7_API_BASE_URL}/v2/docs/${docMode}/${username}/${library}`;

  const response = await fetch(url);
  return await response.text();
}
```

### 3. SDK (`packages/sdk`)

MCP 없이 직접 API를 호출하고 싶을 때 사용

```typescript
import { Context7 } from "@upstash/context7-sdk";

const client = new Context7({ apiKey: "ctx7sk_..." });

// 라이브러리 검색
const results = await client.searchLibrary("react");

// 문서 가져오기
const docs = await client.getDocs("/facebook/react", {
  mode: "code",
  topic: "hooks",
});
```

---

## 데이터 흐름

### 1. 라이브러리 검색 흐름

```
사용자: "React hooks 사용법 알려줘 use context7"
                    ↓
MCP Client가 resolve-library-id 호출
  → libraryName: "React"
                    ↓
Context7 API: GET /v2/search?query=React
                    ↓
응답:
{
  "results": [
    {
      "id": "/facebook/react",
      "title": "React",
      "description": "A JavaScript library for building user interfaces",
      "totalSnippets": 1500,
      "trustScore": 95,
      "versions": ["v18.3.1", "v19.0.0"]
    },
    {
      "id": "/reactjs/react.dev",
      "title": "React Documentation",
      ...
    }
  ]
}
```

### 2. 문서 가져오기 흐름

```
MCP Client가 get-library-docs 호출
  → context7CompatibleLibraryID: "/facebook/react"
  → mode: "code"
  → topic: "hooks"
                    ↓
Context7 API: GET /v2/docs/code/facebook/react?topic=hooks&type=txt
                    ↓
응답 (plain text):
"""
# React Hooks

## useState
useState is a React Hook that lets you add a state variable...

```jsx
const [count, setCount] = useState(0);
```

## useEffect
useEffect is a React Hook that lets you synchronize...
"""
```

---

## 기술 스택

### 의존성 분석

```
@upstash/context7-mcp 의존성:
├── @modelcontextprotocol/sdk  ← MCP 프로토콜 구현
├── express                    ← HTTP 서버 (http transport용)
├── commander                  ← CLI 파싱
├── zod                        ← 스키마 검증
└── undici                     ← HTTP 클라이언트 (프록시 지원)
```

### 빌드 시스템

| 도구 | 역할 |
|------|------|
| **pnpm** | 패키지 매니저 (monorepo workspace) |
| **TypeScript** | 타입 시스템 |
| **tsup** | SDK 번들링 |
| **tsc** | MCP 서버 컴파일 |
| **changeset** | 버전 관리 & 릴리스 |

---

## 아키텍처 특징

### 1. 공개된 부분 vs 비공개 부분

```
┌─────────────────────────────────────────────────────────────┐
│                     공개 (이 저장소)                         │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   MCP Server    │  │      SDK        │  │  AI SDK     │ │
│  │   (packages/mcp)│  │  (packages/sdk) │  │   Tools     │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘ │
│           │                    │                   │        │
│           └────────────────────┼───────────────────┘        │
│                                ↓                            │
└────────────────────────────────┼────────────────────────────┘
                                 │ HTTPS API 호출
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│                     비공개 (Upstash 인프라)                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   API Backend   │  │  Parsing Engine │  │  Crawling   │ │
│  │                 │  │                 │  │   Engine    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Vector DB     │  │  Rate Limiting  │                  │
│  │   (Upstash?)    │  │  & Auth         │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 2. 심플한 MCP 서버 구조

Context7 MCP 서버는 매우 가볍습니다:

```
packages/mcp/src/
├── index.ts          ← 진입점, MCP 서버 설정, Tool 등록
└── lib/
    ├── api.ts        ← Context7 API 호출 (fetch)
    ├── types.ts      ← 타입 정의
    ├── utils.ts      ← 포매팅 유틸
    └── encryption.ts ← 헤더 생성
```

**핵심 코드량**: 약 400줄 (index.ts + api.ts)

### 3. 확장 가능한 설계

```typescript
// 새로운 Tool 추가가 간단함
server.registerTool("my-new-tool", {
  inputSchema: { ... },
}, async (params) => {
  // 구현
});
```

---

## 기여 포인트

### 공개된 코드에서 기여 가능한 부분

1. **MCP 서버 개선**
   - 새로운 Tool 추가
   - 에러 처리 개선
   - Transport 옵션 추가

2. **SDK 개선**
   - 새로운 API 엔드포인트 지원
   - 타입 개선
   - 테스트 추가

3. **문서/번역**
   - i18n/ 폴더에 새 언어 추가
   - 설치 가이드 개선

4. **MCP 클라이언트 통합**
   - 새로운 에디터 지원 문서 추가

### GitHub Issues 확인

```
https://github.com/upstash/context7/issues
```

---

## 로컬 개발

```bash
# 클론
git clone https://github.com/upstash/context7.git
cd context7

# 의존성 설치
pnpm install

# 빌드
pnpm build

# MCP 서버 로컬 실행 (stdio)
node packages/mcp/dist/index.js --transport stdio

# HTTP 서버로 실행
node packages/mcp/dist/index.js --transport http --port 3000

# SDK 테스트
pnpm --filter @upstash/context7-sdk test
```

---

## 학습 로드맵

### 1단계: MCP 프로토콜 이해
- [MCP 공식 문서](https://modelcontextprotocol.io/)
- Context7 MCP 서버 코드 읽기 (`packages/mcp/src/index.ts`)

### 2단계: API 통신 분석
- `packages/mcp/src/lib/api.ts` 분석
- Context7 API 엔드포인트 이해

### 3단계: SDK 구조 분석
- `packages/sdk/src/client.ts` 분석
- Command 패턴 이해

### 4단계: 실제 사용
- Cursor 또는 Claude Code에 설치
- 실제 개발 시 사용해보기

### 5단계: 기여
- 간단한 이슈부터 시작
- 문서 개선 또는 번역

---

## 핵심 파일 참조

| 파일 | 역할 |
|------|------|
| `packages/mcp/src/index.ts` | MCP 서버 메인, Tool 등록 |
| `packages/mcp/src/lib/api.ts` | Context7 API 호출 |
| `packages/mcp/src/lib/types.ts` | 타입 정의 |
| `packages/sdk/src/client.ts` | SDK 클라이언트 |
| `packages/sdk/src/commands/get-docs/index.ts` | getDocs 명령 구현 |
| `packages/tools-ai-sdk/src/tools/` | Vercel AI SDK 도구들 |

---

*마지막 업데이트: 2025-12-19*
