#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { homedir } from "os";

const DATA_DIR = path.join(homedir(), "recall-learning");
const TOPICS_DIR = path.join(DATA_DIR, "topics");

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(TOPICS_DIR)) {
    fs.mkdirSync(TOPICS_DIR, { recursive: true });
  }
}

interface Topic {
  id: string;
  name: string;
  summary: string;
  myExplanation: string;
  learnedAt: string;
  nextReview: string;
  reviewCount: number;
  reviewHistory: { date: string; remembered: boolean }[];
}

function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getTopicPath(id: string): string {
  return path.join(TOPICS_DIR, `${id}.json`);
}

function saveTopic(topic: Topic): void {
  ensureDirectories();
  fs.writeFileSync(getTopicPath(topic.id), JSON.stringify(topic, null, 2));
}

function loadTopic(id: string): Topic | null {
  const filePath = getTopicPath(id);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function loadAllTopics(): Topic[] {
  ensureDirectories();
  if (!fs.existsSync(TOPICS_DIR)) {
    return [];
  }
  const files = fs.readdirSync(TOPICS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    const content = fs.readFileSync(path.join(TOPICS_DIR, f), "utf-8");
    return JSON.parse(content);
  });
}

function calculateNextReview(reviewCount: number): string {
  const intervals = [1, 3, 7, 14, 30];
  const interval = intervals[Math.min(reviewCount, intervals.length - 1)];
  const next = new Date();
  next.setDate(next.getDate() + interval);
  return next.toISOString().split("T")[0];
}

const server = new McpServer({
  name: "recall-mcp",
  version: "1.0.0",
});

server.tool(
  "save_topic",
  "학습한 내용을 저장합니다. 토픽 이름, 요약, 본인만의 설명을 저장합니다.",
  {
    name: z.string().describe("토픽 이름 (예: N+1 문제, MCP Transport)"),
    summary: z.string().describe("학습 내용 요약"),
    myExplanation: z.string().describe("본인만의 한 줄 설명"),
  },
  async ({ name, summary, myExplanation }) => {
    const id = generateId(name);
    const existing = loadTopic(id);

    if (existing) {
      existing.summary = summary;
      existing.myExplanation = myExplanation;
      saveTopic(existing);
      return {
        content: [
          {
            type: "text",
            text: `"${name}" 토픽이 업데이트되었습니다.\n\n다음 복습일: ${existing.nextReview}`,
          },
        ],
      };
    }

    const today = new Date().toISOString().split("T")[0];
    const topic: Topic = {
      id,
      name,
      summary,
      myExplanation,
      learnedAt: today,
      nextReview: calculateNextReview(0),
      reviewCount: 0,
      reviewHistory: [],
    };

    saveTopic(topic);

    return {
      content: [
        {
          type: "text",
          text: `"${name}" 토픽이 저장되었습니다!\n\n📝 내 정리: ${myExplanation}\n📅 다음 복습일: ${topic.nextReview}\n\n저장 위치: ~/recall-learning/topics/${id}.json`,
        },
      ],
    };
  }
);

server.tool(
  "list_topics",
  "저장된 모든 학습 토픽 목록을 조회합니다.",
  {},
  async () => {
    const topics = loadAllTopics();

    if (topics.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "저장된 토픽이 없습니다. save_topic으로 학습 내용을 저장해보세요!",
          },
        ],
      };
    }

    const list = topics
      .sort((a, b) => new Date(b.learnedAt).getTime() - new Date(a.learnedAt).getTime())
      .map((t, i) => `${i + 1}. **${t.name}**\n   - 학습일: ${t.learnedAt}\n   - 복습 횟수: ${t.reviewCount}회\n   - 다음 복습: ${t.nextReview}`)
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `📚 저장된 토픽 (${topics.length}개)\n\n${list}`,
        },
      ],
    };
  }
);

server.tool(
  "get_topic",
  "특정 토픽의 상세 정보를 조회합니다.",
  {
    name: z.string().describe("조회할 토픽 이름"),
  },
  async ({ name }) => {
    const id = generateId(name);
    const topic = loadTopic(id);

    if (!topic) {
      const allTopics = loadAllTopics();
      const suggestions = allTopics
        .filter((t) => t.name.toLowerCase().includes(name.toLowerCase()) || t.id.includes(id))
        .map((t) => t.name);

      return {
        content: [
          {
            type: "text",
            text: suggestions.length > 0
              ? `"${name}" 토픽을 찾을 수 없습니다.\n\n비슷한 토픽: ${suggestions.join(", ")}`
              : `"${name}" 토픽을 찾을 수 없습니다.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `📖 **${topic.name}**\n\n` +
            `**내 정리:** ${topic.myExplanation}\n\n` +
            `**요약:**\n${topic.summary}\n\n` +
            `---\n` +
            `- 학습일: ${topic.learnedAt}\n` +
            `- 복습 횟수: ${topic.reviewCount}회\n` +
            `- 다음 복습: ${topic.nextReview}`,
        },
      ],
    };
  }
);

async function main() {
  ensureDirectories();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[Recall MCP] 서버가 시작되었습니다.");
  console.error(`[Recall MCP] 데이터 저장 위치: ${DATA_DIR}`);
}

main().catch((error) => {
  console.error("[Recall MCP] 서버 시작 실패:", error);
  process.exit(1);
});
