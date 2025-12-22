#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 서버 인스턴스 생성
const server = new McpServer({
  name: "recall-mcp",
  version: "1.0.0",
});

// Hello World Tool - 연결 테스트용
server.tool(
  "greet",
  "연결 테스트를 위한 인사 도구",
  {
    name: z.string().describe("인사할 이름"),
  },
  async ({ name }) => {
    return {
      content: [
        {
          type: "text",
          text: `안녕하세요, ${name}님! Recall MCP 서버가 정상 작동 중입니다.`,
        },
      ],
    };
  }
);

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[Recall MCP] 서버가 시작되었습니다.");
}

main().catch((error) => {
  console.error("[Recall MCP] 서버 시작 실패:", error);
  process.exit(1);
});
