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
	Message     string `json:"message"`
	Version     string `json:"version"`
	Environment string `json:"environment"`
	GoVersion   string `json:"go_version"`
	OS          string `json:"os"`
	Arch        string `json:"arch"`
	Timestamp   string `json:"timestamp"`
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

	fmt.Println("==================================================")
	fmt.Printf("🚀 Go server starting on port %s\n", port)
	fmt.Printf("📝 Go version: %s\n", runtime.Version())
	fmt.Printf("💻 OS/Arch: %s/%s\n", runtime.GOOS, runtime.GOARCH)
	fmt.Printf("🖥️  CPUs: %d\n", runtime.NumCPU())
	fmt.Println("==================================================")
	fmt.Println("\nAvailable endpoints:")
	fmt.Println("  GET  /")
	fmt.Println("  GET  /health")
	fmt.Println("  GET  /api/info")
	fmt.Println("==================================================")

	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Printf("%s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)

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

	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	info := map[string]interface{}{
		"service":       "Go REST API",
		"version":       "1.0.0",
		"go_version":    runtime.Version(),
		"os":            runtime.GOOS,
		"arch":          runtime.GOARCH,
		"num_cpu":       runtime.NumCPU(),
		"num_goroutine": runtime.NumGoroutine(),
		"memory": map[string]interface{}{
			"alloc_mb":       m.Alloc / 1024 / 1024,
			"total_alloc_mb": m.TotalAlloc / 1024 / 1024,
			"sys_mb":         m.Sys / 1024 / 1024,
		},
		"uptime": time.Since(startTime).String(),
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
