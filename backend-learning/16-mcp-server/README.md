# MCP (Model Context Protocol) 완벽 가이드

> AI와 외부 시스템을 연결하는 표준 프로토콜 마스터하기

## 📚 학습 목표

이 폴더는 다음을 학습하기 위한 자료입니다:
- MCP(Model Context Protocol)가 무엇이고 왜 필요한지 이해
- MCP 서버를 직접 구현할 수 있는 능력
- TypeScript와 Python으로 실전 MCP 서버 개발
- Claude Desktop 및 다른 AI 도구와 연동
- 카카오 PlayMCP 공모전 준비

---

## 🎯 MCP란 무엇인가?

```
MCP = AI 모델과 외부 세계를 연결하는 "USB 포트"

기존 방식:
• OpenAI Function Calling
• Anthropic Tool Use
• LangChain Tools
→ 각자 다른 방식, 재사용 불가

MCP 방식:
• 표준 프로토콜 (JSON-RPC 2.0 기반)
• 한 번 만들면 모든 호환 AI에서 사용 가능
• 커뮤니티 MCP 서버 바로 활용
```

### 핵심 가치

- **표준화**: 모든 AI 모델이 같은 방식으로 통신
- **재사용성**: 한 번 만든 서버를 여러 프로젝트에서 사용
- **확장성**: 커뮤니티가 만든 서버를 쉽게 추가
- **간편함**: 복잡한 통합 코드 불필요

---

## 🗺️ 학습 로드맵

### 📖 권장 학습 순서

```
1. MCP 기초 개념 이해
   ↓
2. MCP 서버 구현 실습
   ↓
3. Claude Desktop 연동
   ↓
4. 실전 프로젝트 개발
```

---

## 📚 문서 가이드

### 1️⃣ [mcp-fundamentals.md](notes/mcp-fundamentals.md) ⭐
**필수 | 학습 시간: 2-3시간 | 난이도: ★★☆☆☆**

MCP의 모든 개념을 처음부터 끝까지 배웁니다.

**배우는 것:**
- MCP가 왜 필요한가? (기존 방식의 문제점)
- MCP 아키텍처 (Host, Client, Server)
- 3가지 핵심 기능:
  - **Tools**: AI가 실행하는 함수 (메시지 전송, DB 수정 등)
  - **Resources**: AI가 읽는 데이터 (파일, API 응답 등)
  - **Prompts**: 재사용 가능한 프롬프트 템플릿
- 통신 방식 (STDIO, HTTP+SSE)
- MCP 생태계 (지원 클라이언트, 인기 서버)

**왜 중요한가:**
```
MCP를 이해하지 못하면:
❌ "AI가 외부 도구를 어떻게 쓰는지 모름"
❌ "왜 MCP가 LangChain보다 나은지 모름"
❌ "서버 구현 시 무엇을 만들어야 할지 모름"

MCP를 이해하면:
✅ AI 도구 연동의 표준 방식 이해
✅ 재사용 가능한 AI 컴포넌트 제작 가능
✅ 커뮤니티 서버 활용 및 기여 가능
```

**완료 기준:**
- [ ] MCP의 3가지 역할 (Host/Client/Server) 설명 가능
- [ ] Tools vs Resources vs Prompts 차이 이해
- [ ] JSON-RPC 2.0 기반 통신 방식 이해
- [ ] STDIO Transport가 무엇인지 설명 가능

**실습:**
- 기존 MCP 서버 설치 및 Claude Desktop에 연결
- `@modelcontextprotocol/server-filesystem` 테스트
- Tools 호출 과정 관찰

---

### 2️⃣ [mcp-server-implementation.md](notes/mcp-server-implementation.md) ⭐⭐
**필수 | 학습 시간: 4-6시간 | 난이도: ★★★★☆**

실제로 MCP 서버를 만드는 방법을 배웁니다.

**배우는 것:**
- TypeScript & Python 개발 환경 설정
- 기본 MCP 서버 구조
- Tools 구현 (함수 정의, 입력 검증, 에러 처리)
- Resources 구현 (데이터 읽기, URI 스킴)
- Prompts 구현 (템플릿 생성)
- 실전 예제: 날씨 API 서버
- Claude Desktop 설정 파일 작성
- 디버깅 (MCP Inspector)
- 배포 체크리스트

**왜 중요한가:**
```
이 문서가 핵심입니다!

개념만 알고 구현 못 하면:
❌ "머릿속엔 있는데 코드로 못 만듦"
❌ "AI에게 도구를 어떻게 줘야 할지 모름"

구현까지 마스터하면:
✅ 자신만의 AI 도구 제작 가능
✅ 회사 업무 자동화 MCP 서버 개발
✅ 카카오 PlayMCP 공모전 참가 가능
✅ 포트폴리오에 추가할 프로젝트
```

**완료 기준:**
- [ ] TypeScript 또는 Python으로 기본 서버 생성 가능
- [ ] Tool 함수 구현 및 스키마 정의 가능
- [ ] Claude Desktop에 서버 연결 성공
- [ ] MCP Inspector로 테스트 완료
- [ ] 외부 API 연동 서버 구현 가능

**실습:**
1. **Hello World 서버** (30분)
   - 간단한 greet 도구 구현
   - Claude Desktop에 연결
   - "안녕하세요" 테스트

2. **날씨 서버** (2시간)
   - OpenWeatherMap API 연동
   - get_weather, compare_weather 도구 구현
   - 에러 처리 추가

3. **실전 프로젝트** (3-4시간)
   - 자신의 아이디어로 서버 개발
   - 예시:
     - 슬랙 메시지 전송 서버
     - 노션 페이지 관리 서버
     - GitHub Issue 관리 서버
     - PostgreSQL 쿼리 서버

---

## 🚀 학습 경로별 가이드

### 🎓 초보자 경로 (처음 MCP 접하는 분)

**Week 1: 개념 이해**
```
Day 1-2 (4시간):
- mcp-fundamentals.md 정독
- 용어 정리 (Host, Client, Server, Tools, Resources, Prompts)
- 기존 MCP 서버 설치 및 테스트

Day 3-4 (4시간):
- MCP 생태계 탐색
- @modelcontextprotocol/server-filesystem 분석
- Claude Desktop에서 파일 읽기 실습
```

**Week 2: 기초 구현**
```
Day 5-7 (8시간):
- mcp-server-implementation.md 학습
- TypeScript 환경 설정
- Hello World 서버 구현
- Claude Desktop 연결 테스트
```

**Week 3: 실전 프로젝트**
```
Day 8-14 (16시간):
- 날씨 서버 구현 (외부 API 연동)
- 에러 처리 패턴 적용
- MCP Inspector로 디버깅
- 자신만의 아이디어 서버 개발
```

**총 학습 시간: 30-40시간**

---

### 💼 경험자 경로 (OpenAI Function Calling 경험 있는 분)

**Day 1 (3시간):**
- mcp-fundamentals.md 빠르게 훑기
- MCP vs OpenAI Function Calling 비교 섹션 집중
- JSON-RPC 2.0 통신 방식 이해

**Day 2-3 (6시간):**
- mcp-server-implementation.md 실습
- 기존 Function Calling 코드를 MCP로 변환
- TypeScript SDK 심화 학습

**Day 4-5 (8시간):**
- 실전 프로젝트 개발
- 기존 AI 도구를 MCP 서버로 리팩토링
- 성능 최적화 및 에러 처리

**총 학습 시간: 15-20시간**

---

## 💡 실습 프로젝트 아이디어

### 🔰 초급 (1-2시간)

```
1. 계산기 서버
   - Tools: add, subtract, multiply, divide
   - 기본 수학 연산

2. 인사말 서버
   - Tools: greet, farewell
   - 다국어 인사말

3. 시간 서버
   - Tools: get_current_time, convert_timezone
   - 타임존 변환
```

### 🔶 중급 (3-5시간)

```
1. 날씨 서버
   - Tools: get_weather, forecast
   - OpenWeatherMap API 연동

2. 번역 서버
   - Tools: translate, detect_language
   - Google Translate API 또는 Papago

3. 메모 서버
   - Tools: save_memo, list_memos, delete_memo
   - Resources: memo://all
   - JSON 파일로 저장
```

### 🔺 고급 (8-12시간)

```
1. Slack 통합 서버
   - Tools: send_message, create_channel, invite_user
   - Resources: slack://channels, slack://users
   - Slack API 연동

2. GitHub 관리 서버
   - Tools: create_issue, create_pr, merge_pr
   - Resources: github://repo/issues
   - GitHub REST API

3. 데이터베이스 서버
   - Tools: execute_query, create_table
   - Resources: db://tables, db://schema
   - PostgreSQL 연동

4. 노션 서버
   - Tools: create_page, update_page
   - Resources: notion://database
   - Notion API
```

---

## 🏆 카카오 PlayMCP 공모전 준비

### 공모전 개요

- **주최**: 카카오
- **상금**: 총 1,000만원 (1등 500만원)
- **마감**: 2025년 2월 28일
- **심사 기준**: 서비스 안정성, 편의성, 창의성

### 체크리스트

```
□ 서비스 안정성
  □ 모든 도구에 try-catch 에러 처리
  □ 입력값 유효성 검증 (Zod 스키마)
  □ 타임아웃 처리
  □ 네트워크 에러 재시도 로직

□ 편의성
  □ 명확한 도구 설명 (한국어)
  □ 파라미터 설명 (describe)
  □ 직관적인 응답 형식 (이모지 활용)
  □ 에러 메시지 사용자 친화적

□ 창의성
  □ 독창적인 아이디어
  □ 실용적인 사용 사례
  □ 기존에 없는 기능
  □ 한국 사용자 맞춤 (카카오 API 등)

□ 제출
  □ PlayMCP 웹사이트 등록
  □ 심사 통과
  □ 서비스 공개 설정
  □ 응모하기 버튼 클릭
```

### 추천 아이디어 (한국 특화)

```
1. 카카오톡 메시지 서버
   - 카카오톡 API 연동
   - 친구 목록 조회, 메시지 전송
   - ⭐ 차별점: 한국인이 가장 많이 쓰는 메신저

2. 배달의민족 주문 서버
   - 매장 검색, 메뉴 조회
   - 주문 내역 확인
   - ⭐ 차별점: 한국 음식 배달 문화

3. 네이버 블로그 관리 서버
   - 포스트 작성, 수정, 삭제
   - 댓글 관리
   - ⭐ 차별점: 네이버 생태계 활용

4. 지하철 실시간 정보 서버
   - 노선도 조회, 실시간 도착 정보
   - 최적 경로 추천
   - ⭐ 차별점: 한국 대중교통 특화
```

---

## 🛠️ 개발 환경 설정

### TypeScript (권장)

```bash
# 1. Node.js 설치 (v18 이상)
node --version

# 2. 프로젝트 생성
mkdir my-mcp-server && cd my-mcp-server
npm init -y

# 3. 의존성 설치
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node

# 4. TypeScript 설정
npx tsc --init

# 5. 빌드 및 실행
npm run build
node dist/index.js
```

### Python

```bash
# 1. Python 설치 (3.10 이상)
python --version

# 2. 가상 환경 생성
python -m venv venv
source venv/bin/activate  # macOS/Linux

# 3. MCP SDK 설치
pip install mcp

# 4. 실행
python server.py
```

### Claude Desktop 설치

```
1. https://claude.ai/download 접속
2. 운영체제에 맞는 버전 다운로드
3. 설치 및 실행
4. 설정 파일 위치:
   - macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
   - Windows: %APPDATA%\Claude\claude_desktop_config.json
```

---

## 🔧 디버깅 도구

### MCP Inspector (필수!)

```bash
# 설치 불필요, npx로 바로 실행
npx @modelcontextprotocol/inspector node dist/index.js

# 기능:
# • 서버가 제공하는 Tools, Resources, Prompts 목록 확인
# • 각 도구를 직접 호출하여 테스트
# • JSON-RPC 메시지 송수신 로그 확인
# • 실시간 디버깅
```

### 로깅 패턴

```typescript
// stdout은 MCP 통신에 사용되므로 stderr로 로깅
function log(message: string) {
  console.error(`[${new Date().toISOString()}] ${message}`);
}

// 사용 예시
log("서버 시작됨");
log("도구 호출: get_weather");
log(`에러 발생: ${error.message}`);
```

---

## 📊 학습 체크리스트

### Phase 1: 개념 이해 (1주차)
- [ ] mcp-fundamentals.md 완독
- [ ] MCP Host/Client/Server 역할 이해
- [ ] Tools, Resources, Prompts 차이 이해
- [ ] 기존 MCP 서버 테스트 (filesystem 등)

### Phase 2: 기초 구현 (2주차)
- [ ] mcp-server-implementation.md 완독
- [ ] TypeScript 또는 Python 환경 설정
- [ ] Hello World 서버 구현
- [ ] Claude Desktop에 연결 성공
- [ ] MCP Inspector로 테스트

### Phase 3: 실전 프로젝트 (3-4주차)
- [ ] 날씨 서버 구현 (외부 API 연동)
- [ ] 자신만의 아이디어 서버 개발
- [ ] 에러 처리 및 로깅 완성
- [ ] README 작성 (사용법 문서화)

### Phase 4: 배포 및 공유 (5주차)
- [ ] npm 패키지로 배포 또는 GitHub 공개
- [ ] 카카오 PlayMCP 등록 (선택)
- [ ] 커뮤니티에 공유

---

## 🎯 학습 목표 달성 기준

이 내용을 마스터하면:

### 기술 역량
- [ ] MCP 서버를 처음부터 끝까지 구현 가능
- [ ] TypeScript/Python으로 AI 도구 개발 가능
- [ ] 외부 API를 AI와 연동 가능
- [ ] 에러 처리 및 디버깅 능숙

### 응용 능력
- [ ] 회사 업무를 AI로 자동화할 수 있는 아이디어 도출
- [ ] Claude, GPT 등 다양한 AI에 적용 가능
- [ ] 커뮤니티 MCP 서버를 분석하고 개선 가능

### 포트폴리오
- [ ] GitHub에 MCP 서버 프로젝트 공개
- [ ] 카카오 PlayMCP 공모전 참가 (선택)
- [ ] 블로그/노션에 학습 과정 정리

---

## 🔗 추가 학습 자료

### 공식 문서
- [MCP 공식 사이트](https://modelcontextprotocol.io/)
- [MCP GitHub](https://github.com/modelcontextprotocol)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Python SDK](https://github.com/modelcontextprotocol/python-sdk)

### 커뮤니티
- [MCP Discord](https://discord.gg/mcp-community)
- [카카오 PlayMCP](https://b.kakao.com/views/PlayMCP)
- [Awesome MCP Servers](https://github.com/modelcontextprotocol/awesome-mcp-servers)

### 영상 자료
- [Anthropic MCP 소개 영상](https://www.youtube.com/watch?v=xxx)
- [MCP 서버 만들기 튜토리얼](https://www.youtube.com/watch?v=xxx)

---

## 💬 자주 묻는 질문 (FAQ)

### Q1: MCP와 LangChain의 차이는?

```
LangChain:
• Python/JavaScript 라이브러리
• 프레임워크에 종속적
• 각 AI 모델마다 다른 연동 방식

MCP:
• 표준 프로토콜 (언어 독립적)
• 프레임워크 독립적
• 모든 호환 AI에서 동일하게 동작
```

### Q2: TypeScript vs Python 어느 것으로 시작?

```
TypeScript (권장):
• 공식 SDK가 더 완성도 높음
• Claude Desktop 예제 대부분 TypeScript
• npm 생태계 활용 쉬움

Python:
• Python 익숙한 분들에게 추천
• 데이터 분석, ML 연동 시 유리
```

### Q3: 서버를 배포해야 하나?

```
로컬 개발:
• STDIO Transport 사용
• Claude Desktop에서 바로 실행
• 배포 불필요

원격 사용:
• HTTP+SSE Transport 필요
• AWS Lambda, Vercel 등 배포
• 여러 사용자 공유 시 필요
```

### Q4: 비용은 얼마나 드나?

```
개발:
• MCP SDK: 무료 (오픈소스)
• Claude Desktop: 무료

운영:
• 로컬 서버: 무료
• 외부 API: API 제공사 정책 따름
• 원격 배포: 서버 비용 발생 (선택)
```

---

## 🎉 학습 완료 후

축하합니다! 이제 당신은:

✅ MCP의 모든 개념을 이해했습니다
✅ AI 도구를 직접 만들 수 있습니다
✅ Claude, GPT 등에 외부 기능 연동 가능합니다
✅ 업무 자동화 AI 시스템 구축 가능합니다

### 다음 단계

1. **실전 프로젝트 개발**
   - 회사 업무 자동화 서버
   - 개인 생산성 도구
   - 카카오 PlayMCP 공모전 참가

2. **커뮤니티 기여**
   - GitHub에 서버 공개
   - 블로그에 튜토리얼 작성
   - Awesome MCP Servers에 추가

3. **고급 주제**
   - HTTP+SSE Transport 구현
   - 멀티 클라이언트 지원
   - 성능 최적화

---

**시작일:** ________

**목표 완료일:** ________

**실제 완료일:** ________

---

*마지막 업데이트: 2026-01-13*
