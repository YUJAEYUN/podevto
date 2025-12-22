# MCP 서버 구현 가이드

> TypeScript와 Python으로 MCP 서버 만들기

## 개요

이 문서에서는 MCP 서버를 직접 구현하는 방법을 단계별로 설명합니다. 공식 SDK를 사용하여 TypeScript와 Python 두 가지 언어로 구현 방법을 다룹니다.

---

## 개발 환경 설정

### TypeScript 환경

```bash
# 프로젝트 초기화
mkdir my-mcp-server
cd my-mcp-server
npm init -y

# TypeScript 및 MCP SDK 설치
npm install @modelcontextprotocol/sdk
npm install -D typescript @types/node

# tsconfig.json 생성
npx tsc --init
```

**tsconfig.json 권장 설정:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

**package.json 수정:**
```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "my-mcp-server": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Python 환경

```bash
# 프로젝트 디렉토리 생성
mkdir my-mcp-server
cd my-mcp-server

# 가상 환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# MCP SDK 설치
pip install mcp
```

---

## 기본 MCP 서버 구조

### TypeScript 기본 템플릿

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MCP 서버 기본 구조 (TypeScript)                   │
│                                                                     │
│   my-mcp-server/                                                    │
│   ├── package.json                                                  │
│   ├── tsconfig.json                                                 │
│   ├── src/                                                          │
│   │   ├── index.ts          ← 메인 진입점                           │
│   │   ├── tools/            ← Tool 구현                             │
│   │   │   └── weather.ts                                            │
│   │   ├── resources/        ← Resource 구현                         │
│   │   │   └── config.ts                                             │
│   │   └── prompts/          ← Prompt 구현                           │
│   │       └── templates.ts                                          │
│   └── dist/                 ← 빌드 결과물                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### src/index.ts - 기본 서버

```typescript
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 서버 인스턴스 생성
const server = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0",
});

// ============================================
// Tools 정의
// ============================================

// 간단한 인사 도구
server.tool(
  "greet",
  "사용자에게 인사합니다",
  {
    name: z.string().describe("인사할 대상의 이름"),
  },
  async ({ name }) => {
    return {
      content: [
        {
          type: "text",
          text: `안녕하세요, ${name}님! 반갑습니다.`,
        },
      ],
    };
  }
);

// 계산 도구
server.tool(
  "calculate",
  "두 숫자를 계산합니다",
  {
    operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("연산 종류"),
    a: z.number().describe("첫 번째 숫자"),
    b: z.number().describe("두 번째 숫자"),
  },
  async ({ operation, a, b }) => {
    let result: number;

    switch (operation) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        if (b === 0) {
          return {
            content: [{ type: "text", text: "오류: 0으로 나눌 수 없습니다." }],
            isError: true,
          };
        }
        result = a / b;
        break;
    }

    return {
      content: [
        {
          type: "text",
          text: `${a} ${operation} ${b} = ${result}`,
        },
      ],
    };
  }
);

// ============================================
// Resources 정의
// ============================================

server.resource(
  "config://app/settings",
  "앱 설정 정보",
  async () => {
    const settings = {
      theme: "dark",
      language: "ko",
      version: "1.0.0",
    };

    return {
      contents: [
        {
          uri: "config://app/settings",
          mimeType: "application/json",
          text: JSON.stringify(settings, null, 2),
        },
      ],
    };
  }
);

// ============================================
// Prompts 정의
// ============================================

server.prompt(
  "code_review",
  "코드 리뷰를 요청하는 프롬프트",
  {
    language: z.string().describe("프로그래밍 언어"),
    code: z.string().describe("리뷰할 코드"),
  },
  async ({ language, code }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `다음 ${language} 코드를 리뷰해주세요. 개선점, 버그, 보안 이슈를 찾아주세요.\n\n\`\`\`${language}\n${code}\n\`\`\``,
          },
        },
      ],
    };
  }
);

// ============================================
// 서버 시작
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP 서버가 시작되었습니다.");
}

main().catch(console.error);
```

---

## Python 구현

### 기본 서버 구조

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MCP 서버 기본 구조 (Python)                      │
│                                                                     │
│   my-mcp-server/                                                    │
│   ├── pyproject.toml                                                │
│   ├── src/                                                          │
│   │   └── my_mcp_server/                                            │
│   │       ├── __init__.py                                           │
│   │       └── server.py     ← 메인 서버                             │
│   └── venv/                                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### server.py - Python 기본 서버

```python
#!/usr/bin/env python3

import asyncio
import json
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
    Resource,
    Prompt,
    PromptMessage,
    GetPromptResult,
)

# 서버 인스턴스 생성
server = Server("my-mcp-server")

# ============================================
# Tools 정의
# ============================================

@server.list_tools()
async def list_tools() -> list[Tool]:
    """사용 가능한 도구 목록 반환"""
    return [
        Tool(
            name="greet",
            description="사용자에게 인사합니다",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "인사할 대상의 이름"
                    }
                },
                "required": ["name"]
            }
        ),
        Tool(
            name="calculate",
            description="두 숫자를 계산합니다",
            inputSchema={
                "type": "object",
                "properties": {
                    "operation": {
                        "type": "string",
                        "enum": ["add", "subtract", "multiply", "divide"],
                        "description": "연산 종류"
                    },
                    "a": {"type": "number", "description": "첫 번째 숫자"},
                    "b": {"type": "number", "description": "두 번째 숫자"}
                },
                "required": ["operation", "a", "b"]
            }
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """도구 실행"""

    if name == "greet":
        user_name = arguments.get("name", "사용자")
        return [TextContent(
            type="text",
            text=f"안녕하세요, {user_name}님! 반갑습니다."
        )]

    elif name == "calculate":
        op = arguments["operation"]
        a = arguments["a"]
        b = arguments["b"]

        if op == "add":
            result = a + b
        elif op == "subtract":
            result = a - b
        elif op == "multiply":
            result = a * b
        elif op == "divide":
            if b == 0:
                return [TextContent(type="text", text="오류: 0으로 나눌 수 없습니다.")]
            result = a / b
        else:
            return [TextContent(type="text", text=f"알 수 없는 연산: {op}")]

        return [TextContent(
            type="text",
            text=f"{a} {op} {b} = {result}"
        )]

    return [TextContent(type="text", text=f"알 수 없는 도구: {name}")]


# ============================================
# Resources 정의
# ============================================

@server.list_resources()
async def list_resources() -> list[Resource]:
    """사용 가능한 리소스 목록 반환"""
    return [
        Resource(
            uri="config://app/settings",
            name="앱 설정",
            description="앱 설정 정보",
            mimeType="application/json"
        )
    ]


@server.read_resource()
async def read_resource(uri: str) -> str:
    """리소스 읽기"""
    if uri == "config://app/settings":
        settings = {
            "theme": "dark",
            "language": "ko",
            "version": "1.0.0"
        }
        return json.dumps(settings, indent=2, ensure_ascii=False)

    raise ValueError(f"알 수 없는 리소스: {uri}")


# ============================================
# Prompts 정의
# ============================================

@server.list_prompts()
async def list_prompts() -> list[Prompt]:
    """사용 가능한 프롬프트 목록 반환"""
    return [
        Prompt(
            name="code_review",
            description="코드 리뷰를 요청하는 프롬프트",
            arguments=[
                {"name": "language", "description": "프로그래밍 언어", "required": True},
                {"name": "code", "description": "리뷰할 코드", "required": True}
            ]
        )
    ]


@server.get_prompt()
async def get_prompt(name: str, arguments: dict | None) -> GetPromptResult:
    """프롬프트 가져오기"""
    if name == "code_review":
        language = arguments.get("language", "unknown") if arguments else "unknown"
        code = arguments.get("code", "") if arguments else ""

        return GetPromptResult(
            messages=[
                PromptMessage(
                    role="user",
                    content=TextContent(
                        type="text",
                        text=f"다음 {language} 코드를 리뷰해주세요.\n\n```{language}\n{code}\n```"
                    )
                )
            ]
        )

    raise ValueError(f"알 수 없는 프롬프트: {name}")


# ============================================
# 서버 시작
# ============================================

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())
```

---

## 실전 예제: 날씨 MCP 서버

### 외부 API를 활용한 실제 서버 구현

```typescript
// src/weather-server.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "weather-mcp-server",
  version: "1.0.0",
});

// 날씨 API 호출 함수 (예: OpenWeatherMap)
async function fetchWeather(city: string): Promise<{
  temp: number;
  description: string;
  humidity: number;
}> {
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!API_KEY) {
    throw new Error("OPENWEATHER_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=kr`
  );

  if (!response.ok) {
    throw new Error(`날씨 정보를 가져올 수 없습니다: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    temp: data.main.temp,
    description: data.weather[0].description,
    humidity: data.main.humidity,
  };
}

// 현재 날씨 조회 도구
server.tool(
  "get_weather",
  "특정 도시의 현재 날씨를 조회합니다",
  {
    city: z.string().describe("도시 이름 (예: Seoul, Tokyo, New York)"),
  },
  async ({ city }) => {
    try {
      const weather = await fetchWeather(city);

      return {
        content: [
          {
            type: "text",
            text: `📍 ${city} 날씨 정보\n` +
                  `🌡️ 온도: ${weather.temp}°C\n` +
                  `☁️ 상태: ${weather.description}\n` +
                  `💧 습도: ${weather.humidity}%`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `날씨 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// 여러 도시 날씨 비교 도구
server.tool(
  "compare_weather",
  "여러 도시의 날씨를 비교합니다",
  {
    cities: z.array(z.string()).describe("비교할 도시 목록"),
  },
  async ({ cities }) => {
    try {
      const results = await Promise.all(
        cities.map(async (city) => {
          const weather = await fetchWeather(city);
          return { city, ...weather };
        })
      );

      const comparison = results
        .map((r) => `${r.city}: ${r.temp}°C (${r.description})`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `🌍 도시별 날씨 비교\n\n${comparison}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `날씨 비교 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

---

## Claude Desktop에 MCP 서버 연결

### 설정 파일 위치

```
┌─────────────────────────────────────────────────────────────────────┐
│                Claude Desktop 설정 파일 위치                         │
│                                                                     │
│   macOS:                                                            │
│   ~/Library/Application Support/Claude/claude_desktop_config.json  │
│                                                                     │
│   Windows:                                                          │
│   %APPDATA%\Claude\claude_desktop_config.json                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 설정 예시

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/dist/index.js"],
      "env": {
        "OPENWEATHER_API_KEY": "your-api-key-here"
      }
    },
    "python-server": {
      "command": "python",
      "args": ["/path/to/server.py"]
    }
  }
}
```

### 설정 옵션 설명

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MCP 서버 설정 옵션                               │
│                                                                     │
│   필수 옵션:                                                         │
│   ─────────────────────────────────────────                         │
│   • command: 실행할 명령어 (node, python, npx 등)                   │
│   • args: 명령어 인자 배열                                          │
│                                                                     │
│   선택 옵션:                                                         │
│   ─────────────────────────────────────────                         │
│   • env: 환경 변수 객체                                             │
│   • cwd: 작업 디렉토리                                              │
│                                                                     │
│   예시:                                                              │
│   ─────────────────────────────────────────                         │
│   {                                                                 │
│     "my-server": {                                                  │
│       "command": "npx",                                             │
│       "args": ["-y", "@myorg/mcp-server"],                         │
│       "env": {                                                      │
│         "API_KEY": "secret",                                        │
│         "DEBUG": "true"                                             │
│       },                                                            │
│       "cwd": "/home/user/projects"                                  │
│     }                                                               │
│   }                                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 에러 처리 패턴

### 안전한 도구 구현

```typescript
server.tool(
  "safe_operation",
  "안전하게 처리되는 작업",
  {
    input: z.string(),
  },
  async ({ input }) => {
    try {
      // 입력 검증
      if (!input || input.trim().length === 0) {
        return {
          content: [{ type: "text", text: "입력값이 비어있습니다." }],
          isError: true,
        };
      }

      // 실제 작업 수행
      const result = await someOperation(input);

      return {
        content: [{ type: "text", text: result }],
      };

    } catch (error) {
      // 에러 로깅 (stderr로 출력)
      console.error("Operation failed:", error);

      // 사용자 친화적 에러 메시지 반환
      return {
        content: [
          {
            type: "text",
            text: `작업 실패: ${error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}`,
          },
        ],
        isError: true,
      };
    }
  }
);
```

---

## 디버깅 및 테스트

### MCP Inspector 사용

```bash
# MCP Inspector 설치 및 실행
npx @modelcontextprotocol/inspector node dist/index.js
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MCP Inspector 기능                              │
│                                                                     │
│   • 서버가 제공하는 Tools, Resources, Prompts 목록 확인             │
│   • 각 도구를 직접 호출하여 테스트                                   │
│   • JSON-RPC 메시지 송수신 로그 확인                                │
│   • 실시간 디버깅                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 로깅 패턴

```typescript
// stderr를 사용한 로깅 (stdout은 MCP 통신에 사용됨)
function log(message: string) {
  console.error(`[${new Date().toISOString()}] ${message}`);
}

server.tool("debug_tool", "디버깅용 도구", {}, async () => {
  log("도구가 호출되었습니다.");

  // ... 작업 수행

  log("작업이 완료되었습니다.");

  return {
    content: [{ type: "text", text: "완료" }],
  };
});
```

---

## 배포 체크리스트

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MCP 서버 배포 체크리스트                           │
│                                                                     │
│   □ package.json에 bin 필드 설정                                    │
│   □ 첫 줄에 shebang (#!/usr/bin/env node) 추가                     │
│   □ 필요한 환경변수 문서화                                          │
│   □ 에러 처리 및 로깅 구현                                          │
│   □ MCP Inspector로 테스트 완료                                     │
│   □ README.md 작성 (설치 및 사용법)                                 │
│   □ 라이선스 파일 추가                                               │
│   □ npm publish 또는 GitHub 릴리스                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 카카오 PlayMCP 등록 준비

### 공모전 제출 요구사항

```
┌─────────────────────────────────────────────────────────────────────┐
│                  카카오 PlayMCP 공모전 체크리스트                     │
│                                                                     │
│   서비스 안정성:                                                     │
│   ─────────────────────────────────────────                         │
│   □ 모든 도구에 에러 처리 구현                                       │
│   □ 입력값 유효성 검증                                               │
│   □ 타임아웃 처리                                                    │
│   □ 재시도 로직 (필요시)                                             │
│                                                                     │
│   편의성:                                                            │
│   ─────────────────────────────────────────                         │
│   □ 명확한 도구 설명 (description)                                  │
│   □ 파라미터 설명 (describe)                                        │
│   □ 직관적인 응답 형식                                               │
│   □ 한국어 지원                                                      │
│                                                                     │
│   창의성:                                                            │
│   ─────────────────────────────────────────                         │
│   □ 독창적인 아이디어                                                │
│   □ 실용적인 사용 사례                                               │
│   □ 기존에 없는 기능                                                 │
│                                                                     │
│   제출:                                                              │
│   ─────────────────────────────────────────                         │
│   □ PlayMCP 웹사이트에서 서버 등록                                   │
│   □ 심사 통과                                                        │
│   □ 서비스 전체 공개 설정                                            │
│   □ 응모하기 버튼 클릭                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 참고 자료

- [MCP TypeScript SDK 문서](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Python SDK 문서](https://github.com/modelcontextprotocol/python-sdk)
- [MCP 서버 예제들](https://github.com/modelcontextprotocol/servers)
- [카카오 PlayMCP](https://b.kakao.com/views/PlayMCP)

---

*마지막 업데이트: 2025-12-22*
