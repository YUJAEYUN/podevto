# Context7 MCP 서버 코드 분석

## 진입점 (index.ts)

### 전체 구조

```typescript
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express from "express";
import { Command } from "commander";

// 1. CLI 옵션 파싱
const program = new Command()
  .option("--transport <stdio|http>", "transport type", "stdio")
  .option("--port <number>", "port for HTTP transport", "3000")
  .option("--api-key <key>", "API key for authentication")
  .parse(process.argv);

// 2. MCP 서버 생성
const server = new McpServer({
  name: "Context7",
  version: "1.0.13",
});

// 3. Tool 등록
server.registerTool("resolve-library-id", { ... });
server.registerTool("get-library-docs", { ... });

// 4. Transport 연결
async function main() {
  if (transportType === "http") {
    // Express 서버로 HTTP 제공
  } else {
    // stdio로 직접 통신
  }
}

main();
```

## Tool 1: resolve-library-id

라이브러리 이름으로 Context7 ID 검색

```typescript
server.registerTool(
  "resolve-library-id",
  {
    title: "Resolve Context7 Library ID",
    description: `Resolves a package/product name to a Context7-compatible library ID...`,
    inputSchema: {
      libraryName: z
        .string()
        .describe("Library name to search for"),
    },
  },
  async ({ libraryName }) => {
    // 1. API 호출
    const searchResponse = await searchLibraries(libraryName);

    // 2. 결과 없으면 에러 메시지
    if (!searchResponse.results || searchResponse.results.length === 0) {
      return {
        content: [{
          type: "text",
          text: searchResponse.error || "Failed to retrieve library data",
        }],
      };
    }

    // 3. 결과 포매팅
    const resultsText = formatSearchResults(searchResponse);

    return {
      content: [{
        type: "text",
        text: `Available Libraries:\n\n${resultsText}`,
      }],
    };
  }
);
```

## Tool 2: get-library-docs

라이브러리 문서 가져오기

```typescript
server.registerTool(
  "get-library-docs",
  {
    title: "Get Library Docs",
    description: "Fetches up-to-date documentation for a library...",
    inputSchema: {
      context7CompatibleLibraryID: z
        .string()
        .describe("Exact Context7-compatible library ID (e.g., '/mongodb/docs')"),
      mode: z
        .enum(["code", "info"])
        .optional()
        .default("code")
        .describe("Documentation mode: 'code' for API, 'info' for guides"),
      topic: z
        .string()
        .optional()
        .describe("Topic to focus on (e.g., 'hooks', 'routing')"),
      page: z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional()
        .describe("Page number for pagination"),
    },
  },
  async ({ context7CompatibleLibraryID, mode = "code", page = 1, topic }) => {
    // 1. API 호출
    const docs = await fetchLibraryDocumentation(
      context7CompatibleLibraryID,
      mode,
      { page, limit: 10, topic }
    );

    // 2. 결과 없으면 안내 메시지
    if (!docs) {
      return {
        content: [{
          type: "text",
          text: "Documentation not found. Use 'resolve-library-id' first.",
        }],
      };
    }

    // 3. 문서 반환
    return {
      content: [{
        type: "text",
        text: docs,
      }],
    };
  }
);
```

## API 호출 (api.ts)

### searchLibraries

```typescript
const CONTEXT7_API_BASE_URL = "https://context7.com/api";

export async function searchLibraries(
  query: string,
  clientIp?: string,
  apiKey?: string
): Promise<SearchResponse> {
  try {
    // 1. URL 구성
    const url = new URL(`${CONTEXT7_API_BASE_URL}/v2/search`);
    url.searchParams.set("query", query);

    // 2. 헤더 생성 (인증, IP 등)
    const headers = generateHeaders(clientIp, apiKey);

    // 3. API 호출
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response, apiKey);
      return { results: [], error: errorMessage };
    }

    return await response.json();
  } catch (error) {
    return { results: [], error: `Error: ${error}` };
  }
}
```

### fetchLibraryDocumentation

```typescript
export async function fetchLibraryDocumentation(
  libraryId: string,      // "/vercel/next.js"
  docMode: "code" | "info",
  options: { page?, limit?, topic? } = {}
): Promise<string | null> {
  try {
    // 1. libraryId 파싱
    const { username, library, tag } = parseLibraryId(libraryId);
    // "/vercel/next.js" → { username: "vercel", library: "next.js" }

    // 2. URL 구성
    let urlPath = `${CONTEXT7_API_BASE_URL}/v2/docs/${docMode}/${username}/${library}`;
    if (tag) urlPath += `/${tag}`;  // 버전이 있으면 추가

    const url = new URL(urlPath);
    url.searchParams.set("type", "txt");
    if (options.topic) url.searchParams.set("topic", options.topic);
    if (options.page) url.searchParams.set("page", options.page.toString());

    // 3. API 호출
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return await parseErrorResponse(response);
    }

    // 4. 텍스트 반환
    const text = await response.text();
    if (!text || text === "No content available") {
      return `No ${docMode} documentation available.`;
    }
    return text;
  } catch (error) {
    return `Error fetching documentation: ${error}`;
  }
}
```

### parseLibraryId 헬퍼

```typescript
function parseLibraryId(libraryId: string): {
  username: string;
  library: string;
  tag?: string;
} {
  // "/vercel/next.js" → "vercel/next.js"
  const cleaned = libraryId.startsWith("/") ? libraryId.slice(1) : libraryId;

  // "vercel/next.js" → ["vercel", "next.js"]
  const parts = cleaned.split("/");

  if (parts.length < 2) {
    throw new Error(`Invalid library ID: ${libraryId}`);
  }

  return {
    username: parts[0],    // "vercel"
    library: parts[1],     // "next.js"
    tag: parts[2],         // undefined 또는 "v14.3.0"
  };
}
```

## Transport 설정

### stdio 모드

```typescript
if (transportType === "stdio") {
  const apiKey = cliOptions.apiKey || process.env.CONTEXT7_API_KEY;
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error("Context7 MCP Server running on stdio");
}
```

### HTTP 모드

```typescript
if (transportType === "http") {
  const app = express();
  app.use(express.json());

  // CORS 설정
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
    // ...
    next();
  });

  // MCP 엔드포인트
  app.all("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  // 헬스체크
  app.get("/ping", (req, res) => {
    res.json({ status: "ok", message: "pong" });
  });

  app.listen(port);
  console.error(`Server running on http://localhost:${port}/mcp`);
}
```

## 타입 정의 (types.ts)

```typescript
export interface SearchResult {
  id: string;                    // "/facebook/react"
  title: string;                 // "React"
  description: string;           // "A JavaScript library..."
  branch: string;                // "main"
  lastUpdateDate: string;        // "2024-01-15"
  state: DocumentState;          // "finalized"
  totalTokens: number;           // 150000
  totalSnippets: number;         // 1500
  stars?: number;                // 220000
  trustScore?: number;           // 95
  benchmarkScore?: number;       // 87
  versions?: string[];           // ["v18.3.1", "v19.0.0"]
}

export interface SearchResponse {
  error?: string;
  results: SearchResult[];
}

export type DocumentState = "initial" | "finalized" | "error" | "delete";

export const DOCUMENTATION_MODES = {
  CODE: "code",
  INFO: "info",
} as const;

export type DocumentationMode = "code" | "info";
```
