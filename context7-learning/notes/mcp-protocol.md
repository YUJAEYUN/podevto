# MCP (Model Context Protocol) 이해하기

## MCP란?

**MCP = Model Context Protocol**

Anthropic이 만든 프로토콜로, LLM 클라이언트와 외부 도구/데이터 소스를 연결하는 **표준 인터페이스**

```
┌─────────────────┐                      ┌─────────────────┐
│   MCP Client    │  ←── MCP Protocol ──→│   MCP Server    │
│                 │      (JSON-RPC)      │                 │
│  - Cursor       │                      │  - Context7     │
│  - Claude Code  │                      │  - GitHub       │
│  - VS Code      │                      │  - Filesystem   │
│  - Windsurf     │                      │  - Database     │
└─────────────────┘                      └─────────────────┘
```

## 왜 MCP가 필요한가?

### MCP 없이

```
각 LLM 클라이언트가 각 도구마다 별도 통합 필요

Cursor ──── GitHub 통합
      ├──── Jira 통합
      └──── Slack 통합

Claude Code ──── GitHub 통합 (또 만들어야 함)
           ├──── Jira 통합 (또 만들어야 함)
           └──── Slack 통합 (또 만들어야 함)

→ N개 클라이언트 × M개 도구 = N×M 개의 통합 필요
```

### MCP 사용 시

```
모든 클라이언트가 표준 프로토콜로 통신

Cursor ────────┐
Claude Code ───┼──── MCP Protocol ────┬── GitHub MCP Server
VS Code ───────┤                      ├── Jira MCP Server
Windsurf ──────┘                      └── Slack MCP Server

→ N + M 개의 구현만 필요
```

## MCP 핵심 개념

### 1. Tools (도구)

LLM이 호출할 수 있는 **함수**

```typescript
// Context7의 Tool 예시
server.registerTool("resolve-library-id", {
  inputSchema: {
    libraryName: z.string()
  },
}, async ({ libraryName }) => {
  // 라이브러리 검색 로직
  return { content: [...] };
});
```

### 2. Resources (리소스)

LLM이 읽을 수 있는 **데이터**

```typescript
// 파일 시스템 MCP 서버의 Resource 예시
server.registerResource("file://project/README.md", {
  mimeType: "text/markdown",
}, async () => {
  return { content: fs.readFileSync("README.md") };
});
```

### 3. Prompts (프롬프트)

미리 정의된 **템플릿**

```typescript
server.registerPrompt("code-review", {
  arguments: { code: z.string() }
}, ({ code }) => {
  return `Review this code:\n${code}`;
});
```

## Transport 방식

### stdio (Standard I/O)

로컬에서 프로세스로 실행

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

```
┌──────────────┐     stdin/stdout     ┌──────────────┐
│  MCP Client  │ ←──────────────────→ │  MCP Server  │
│  (Cursor)    │                      │  (Node.js)   │
└──────────────┘                      └──────────────┘
```

### HTTP (Streamable HTTP)

원격 서버로 연결

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

```
┌──────────────┐       HTTPS          ┌──────────────┐
│  MCP Client  │ ←──────────────────→ │  MCP Server  │
│  (Cursor)    │                      │  (Cloud)     │
└──────────────┘                      └──────────────┘
```

## MCP 메시지 형식

MCP는 **JSON-RPC 2.0** 기반

### Request

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "resolve-library-id",
    "arguments": {
      "libraryName": "react"
    }
  }
}
```

### Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Found: /facebook/react"
      }
    ]
  }
}
```

## Context7에서의 MCP 활용

```
사용자: "React hooks 설명해줘 use context7"
                    ↓
1. MCP Client가 "use context7" 인식
                    ↓
2. resolve-library-id Tool 호출
   → params: { libraryName: "React" }
   → result: "/facebook/react"
                    ↓
3. get-library-docs Tool 호출
   → params: { context7CompatibleLibraryID: "/facebook/react", topic: "hooks" }
   → result: "# React Hooks\n\n## useState..."
                    ↓
4. 문서가 LLM 컨텍스트에 추가됨
                    ↓
5. LLM이 최신 문서 기반으로 답변
```

## 참고 자료

- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [MCP GitHub](https://github.com/modelcontextprotocol)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
