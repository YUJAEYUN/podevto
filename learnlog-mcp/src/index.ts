#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { homedir } from "os";

const DATA_DIR = path.join(homedir(), "learnlog");
const PROMPTS_DIR = path.join(DATA_DIR, "prompts");

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROMPTS_DIR)) {
    fs.mkdirSync(PROMPTS_DIR, { recursive: true });
  }
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getPromptFilePath(date: string): string {
  return path.join(PROMPTS_DIR, `${date}.json`);
}

interface PromptEntry {
  prompt: string;
  timestamp: string;
}

function loadPrompts(date: string): PromptEntry[] {
  const filePath = getPromptFilePath(date);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function savePrompt(date: string, prompt: string): void {
  ensureDirectories();
  const prompts = loadPrompts(date);
  prompts.push({
    prompt,
    timestamp: new Date().toISOString(),
  });
  fs.writeFileSync(getPromptFilePath(date), JSON.stringify(prompts, null, 2));
}

const server = new McpServer({
  name: "learnlog-mcp",
  version: "1.0.0",
});

server.tool(
  "save_prompt",
  `사용자의 질문(프롬프트)을 로컬에 저장합니다.
중요: 사용자가 학습 관련 질문을 할 때마다 이 도구를 호출하여 프롬프트를 저장하세요.
저장만 하고 사용자에게 별도로 알리지 않아도 됩니다.`,
  {
    prompt: z.string().describe("사용자가 입력한 질문/프롬프트"),
  },
  async ({ prompt }) => {
    const today = getToday();
    savePrompt(today, prompt);
    return {
      content: [{ type: "text", text: "저장됨" }],
    };
  }
);

server.tool(
  "get_today_prompts",
  "오늘 했던 질문들을 조회합니다. 사용자가 '오늘 뭐 공부했지?', '오늘 뭐 물어봤지?' 같은 요청을 할 때 사용합니다.",
  {},
  async () => {
    const today = getToday();
    const prompts = loadPrompts(today);

    if (prompts.length === 0) {
      return {
        content: [{ type: "text", text: "오늘 저장된 질문이 없습니다." }],
      };
    }

    const list = prompts
      .map((p, i) => {
        const time = new Date(p.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
        return `${i + 1}. [${time}] ${p.prompt}`;
      })
      .join("\n");

    return {
      content: [{ type: "text", text: `📝 오늘의 질문 (${prompts.length}개)\n\n${list}` }],
    };
  }
);

server.tool(
  "get_prompts_by_date",
  "특정 날짜에 했던 질문들을 조회합니다.",
  {
    date: z.string().describe("조회할 날짜 (YYYY-MM-DD 형식)"),
  },
  async ({ date }) => {
    const prompts = loadPrompts(date);

    if (prompts.length === 0) {
      return {
        content: [{ type: "text", text: `${date}에 저장된 질문이 없습니다.` }],
      };
    }

    const list = prompts
      .map((p, i) => {
        const time = new Date(p.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
        return `${i + 1}. [${time}] ${p.prompt}`;
      })
      .join("\n");

    return {
      content: [{ type: "text", text: `📝 ${date}의 질문 (${prompts.length}개)\n\n${list}` }],
    };
  }
);

server.tool(
  "get_recent_prompts",
  "최근 며칠간의 질문들을 조회합니다.",
  {
    days: z.number().optional().describe("조회할 일수 (기본값: 7)"),
  },
  async ({ days = 7 }) => {
    ensureDirectories();
    const results: { date: string; count: number }[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const prompts = loadPrompts(dateStr);
      if (prompts.length > 0) {
        results.push({ date: dateStr, count: prompts.length });
      }
    }

    if (results.length === 0) {
      return {
        content: [{ type: "text", text: `최근 ${days}일간 저장된 질문이 없습니다.` }],
      };
    }

    const list = results
      .map((r) => `• ${r.date}: ${r.count}개 질문`)
      .join("\n");

    const total = results.reduce((sum, r) => sum + r.count, 0);

    return {
      content: [{ type: "text", text: `📊 최근 ${days}일간 학습 기록\n\n${list}\n\n총 ${total}개 질문` }],
    };
  }
);

async function main() {
  ensureDirectories();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[LearnLog] 서버 시작");
  console.error(`[LearnLog] 저장 위치: ${DATA_DIR}`);
}

main().catch((error) => {
  console.error("[LearnLog] 오류:", error);
  process.exit(1);
});
