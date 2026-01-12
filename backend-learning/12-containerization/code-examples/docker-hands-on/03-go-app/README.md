# Go 애플리케이션 멀티 스테이지 빌드

## 🎯 학습 목표

- Go 애플리케이션 컨테이너화
- 멀티 스테이지 빌드의 위력
- 이미지 크기 최적화 (1GB → 10MB!)
- Static 바이너리 빌드

## 📝 실습 내용

Go로 작성된 REST API를 Docker로 컨테이너화하고, 멀티 스테이지 빌드로 이미지 크기를 극적으로 줄입니다.

## 🏗️ 프로젝트 구조

```
03-go-app/
├── README.md
├── go.mod
├── go.sum
├── main.go
├── Dockerfile.bad
├── Dockerfile.good
└── Dockerfile.scratch
```

## 📦 Step 1: Go 애플리케이션 생성

### main.go
```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"
	"time"
)

type Response struct {
	Message     string            `json:"message"`
	Version     string            `json:"version"`
	Environment string            `json:"environment"`
	GoVersion   string            `json:"go_version"`
	OS          string            `json:"os"`
	Arch        string            `json:"arch"`
	Timestamp   string            `json:"timestamp"`
}

type HealthResponse struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Timestamp string `json:"timestamp"`
	Uptime    string `json:"uptime"`
}

var startTime = time.Now()

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/api/info", infoHandler)

	fmt.Println("=" + "="*48)
	fmt.Printf("🚀 Go server starting on port %s\n", port)
	fmt.Printf("📝 Go version: %s\n", runtime.Version())
	fmt.Printf("💻 OS/Arch: %s/%s\n", runtime.GOOS, runtime.GOARCH)
	fmt.Println("=" + "="*48)

	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := Response{
		Message:     "Hello from Go! 🐹",
		Version:     "1.0.0",
		Environment: getEnv("ENV", "development"),
		GoVersion:   runtime.Version(),
		OS:          runtime.GOOS,
		Arch:        runtime.GOARCH,
		Timestamp:   time.Now().Format(time.RFC3339),
	}

	json.NewEncoder(w).Encode(response)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	uptime := time.Since(startTime).String()

	response := HealthResponse{
		Status:    "healthy",
		Service:   "go-api",
		Timestamp: time.Now().Format(time.RFC3339),
		Uptime:    uptime,
	}

	json.NewEncoder(w).Encode(response)
}

func infoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	info := map[string]interface{}{
		"service":      "Go REST API",
		"version":      "1.0.0",
		"go_version":   runtime.Version(),
		"os":           runtime.GOOS,
		"arch":         runtime.GOARCH,
		"num_cpu":      runtime.NumCPU(),
		"num_goroutine": runtime.NumGoroutine(),
		"endpoints": []string{
			"GET  /",
			"GET  /health",
			"GET  /api/info",
		},
	}

	json.NewEncoder(w).Encode(info)
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
```

### go.mod
```go
module go-docker-app

go 1.21
```

## 🐳 Step 2: Dockerfile 작성

### ❌ Dockerfile.bad (나쁜 예)
```dockerfile
FROM golang:1.21

WORKDIR /app

COPY . .

RUN go build -o main .

EXPOSE 8080

CMD ["./main"]

# 문제점:
# - 이미지 크기: ~1GB (Go SDK 전체 포함)
# - 빌드 도구까지 포함
# - 불필요한 파일 많음
```

### ✅ Dockerfile.good (멀티 스테이지)
```dockerfile
# ==================== Build Stage ====================
FROM golang:1.21-alpine AS builder

WORKDIR /app

# 의존성 다운로드 (캐싱)
COPY go.mod go.sum* ./
RUN go mod download

# 소스 복사 및 빌드
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# ==================== Runtime Stage ====================
FROM alpine:latest

# 보안 업데이트 및 CA 인증서
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# 빌드된 바이너리만 복사
COPY --from=builder /app/main .

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["./main"]

# 결과: 이미지 크기 ~15MB (99% 감소!)
```

### 🚀 Dockerfile.scratch (최소 이미지)
```dockerfile
# ==================== Build Stage ====================
FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum* ./
RUN go mod download

COPY . .

# Static 바이너리 빌드
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -a \
    -installsuffix cgo \
    -ldflags="-w -s" \
    -o main .

# ==================== Runtime Stage ====================
FROM scratch

# CA 인증서 복사 (HTTPS 통신용)
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# 바이너리만 복사
COPY --from=builder /app/main /main

EXPOSE 8080

CMD ["/main"]

# 결과: 이미지 크기 ~8MB (최소!)
```

## 🛠️ Step 3: 빌드 및 비교

### 나쁜 예 빌드
```bash
docker build -f Dockerfile.bad -t go-app:bad .
docker images go-app:bad
# SIZE: ~1.0GB ❌
```

### 좋은 예 빌드
```bash
docker build -f Dockerfile.good -t go-app:good .
docker images go-app:good
# SIZE: ~15MB ✅ (99% 감소!)
```

### 최소 이미지 빌드
```bash
docker build -f Dockerfile.scratch -t go-app:scratch .
docker images go-app:scratch
# SIZE: ~8MB 🚀 (99.2% 감소!)
```

### 크기 비교
```bash
docker images | grep go-app

# REPOSITORY   TAG      SIZE
# go-app       bad      1.0GB   ← 나쁜 예
# go-app       good     15MB    ← 좋은 예 (67배 작음)
# go-app       scratch  8MB     ← 최고 (125배 작음!)
```

## 🧪 실행 및 테스트

```bash
# 실행
docker run -d --name go-app-good -p 8080:8080 go-app:good

# 테스트
curl http://localhost:8080
curl http://localhost:8080/health
curl http://localhost:8080/api/info

# Health check 확인
docker inspect go-app-good | grep -A 5 Health
```

## 📊 성능 비교

```bash
# 이미지 크기 비교
docker images | grep go-app

# 빌드 시간 비교
time docker build -f Dockerfile.bad -t go-app:bad .
# real: 2m 30s

time docker build -f Dockerfile.good -t go-app:good .
# real: 1m 45s

time docker build -f Dockerfile.scratch -t go-app:scratch .
# real: 1m 40s

# 메모리 사용량
docker stats go-app-good --no-stream
# MEM USAGE: ~10MB

# scratch 이미지는 shell이 없음
docker exec go-app-scratch ls
# Error: executable file not found in $PATH

# alpine 이미지는 shell 사용 가능
docker exec go-app-good ls
# main
```

## 💡 멀티 스테이지 빌드의 장점

### 1. 극적인 크기 감소
```
Before: 1.0GB (Go SDK + 빌드 도구)
After:  8MB   (바이너리만)

절약: 992MB (99.2% 감소)
```

### 2. 보안 향상
```
✅ 빌드 도구 제거 (컴파일러, git 등)
✅ 불필요한 라이브러리 제거
✅ 공격 표면 최소화
✅ scratch 이미지: shell도 없음
```

### 3. 빠른 배포
```
1GB 이미지 pull: 2-3분
8MB 이미지 pull:  5-10초

속도: 20배 빠름!
```

## 🧹 정리

```bash
docker stop go-app-good
docker rm go-app-good
docker rmi go-app:bad go-app:good go-app:scratch
```

## ✅ 체크리스트

- [ ] Go 앱 컨테이너화
- [ ] 멀티 스테이지 빌드 이해
- [ ] Static 바이너리 빌드
- [ ] scratch 이미지 사용
- [ ] 이미지 크기 99% 감소 확인
- [ ] CGO_ENABLED=0 의미 이해

## 🎓 학습 포인트

### CGO_ENABLED=0
- C 라이브러리 의존성 제거
- 완전한 static 바이너리 생성
- scratch 이미지에서 실행 가능

### LDFLAGS="-w -s"
- `-w`: 디버그 정보 제거
- `-s`: 심볼 테이블 제거
- 바이너리 크기 추가 감소

### scratch 이미지
- 빈 이미지 (아무것도 없음)
- shell, ls, cat 등 없음
- 최소 크기, 최대 보안

## 🎯 다음 단계

- [멀티 스테이지 심화](../04-multi-stage/README.md)
- [마이크로서비스](../05-compose-microservices/README.md)
