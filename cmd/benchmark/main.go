// Package main is the Connex development benchmark tool.
//
// It spawns 3 witness nodes and the gateway binary locally, fires a
// configurable number of sequential coordination events, then reports
// latency statistics. This tool targets the Go Gateway binary directly
// (not the Node.js API server) to measure pure consensus throughput.
//
// Prerequisites:
//   - Run `go build -o gateway.exe gateway.go` first.
//   - Run `go build -o witness.exe ./cmd/witness/` first.
//   - Set API_KEY in your environment (must match gateway config).
//
// Usage:
//
//	API_KEY=your_key go run ./cmd/benchmark/
//
// Environment variables:
//
//	API_KEY    - API key sent in x-api-key header (REQUIRED).
//	ITERATIONS - Number of events to fire (default: 20).
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"time"
)

const gatewayURL = "http://localhost:3000"

// benchmarkKey is a deterministic test key used ONLY for local benchmarks.
// It must never be used in any environment that connects to a real database.
const benchmarkKey = "0000000000000000000000000000000100000000000000000000000000000001"

func main() {
	apiKey := os.Getenv("API_KEY")
	if apiKey == "" {
		log.Fatal("API_KEY environment variable is required (must match the gateway's API_KEY setting).")
	}

	iterations := 20
	if iterStr := os.Getenv("ITERATIONS"); iterStr != "" {
		if n, err := strconv.Atoi(iterStr); err == nil && n > 0 {
			iterations = n
		}
	}

	fmt.Printf("🚀 Starting Connex Benchmark (%d iterations)...\n", iterations)

	// 1. Start 3 Witness Nodes using the benchmark test key.
	witnessPorts := []string{"8001", "8002", "8003"}
	var witnessCmds []*exec.Cmd

	for i, port := range witnessPorts {
		cmd := exec.Command(".\\witness.exe")
		cmd.Env = append(os.Environ(),
			fmt.Sprintf("PORT=%s", port),
			fmt.Sprintf("NODE_ID=%d", i+1),
			// Using the same key per node is fine for a local benchmark
			// because we are not testing key uniqueness here, only latency.
			fmt.Sprintf("PRIVATE_KEY=%s", benchmarkKey),
		)
		if err := cmd.Start(); err != nil {
			log.Fatalf("Failed to start witness %d: %v", i+1, err)
		}
		witnessCmds = append(witnessCmds, cmd)
	}

	// Ensure all child processes are cleaned up on exit.
	defer func() {
		for _, cmd := range witnessCmds {
			if cmd.Process != nil {
				cmd.Process.Kill()
			}
		}
	}()

	// 2. Wait for witnesses to accept connections.
	fmt.Println("⏳ Waiting for Witness Nodes...")
	for _, port := range witnessPorts {
		for attempt := 0; attempt < 20; attempt++ {
			resp, err := http.Get(fmt.Sprintf("http://localhost:%s/health", port))
			if err == nil && resp.StatusCode == 200 {
				resp.Body.Close()
				break
			}
			if attempt == 19 {
				log.Fatalf("Witness on port %s never became ready after 4s", port)
			}
			time.Sleep(200 * time.Millisecond)
		}
	}

	// 3. Start the Gateway.
	gatewayCmd := exec.Command(".\\gateway.exe")
	gatewayCmd.Env = append(os.Environ(),
		"PORT=3000",
		"NODE_1_URL=http://localhost:8001",
		"NODE_2_URL=http://localhost:8002",
		"NODE_3_URL=http://localhost:8003",
		// Supabase is mocked in benchmark mode — DB writes are fire-and-forget
		// and will silently fail, which is intentional for a pure latency test.
		"SUPABASE_URL=http://localhost:54321",
		"SUPABASE_SERVICE_KEY=mock-benchmark-only",
	)
	if err := gatewayCmd.Start(); err != nil {
		log.Fatalf("Failed to start gateway: %v", err)
	}
	defer gatewayCmd.Process.Kill()

	fmt.Println("⏳ Waiting for Gateway...")
	for attempt := 0; attempt < 20; attempt++ {
		resp, err := http.Get(gatewayURL + "/health")
		if err == nil && resp.StatusCode == 200 {
			fmt.Println("✅ All systems GO!")
			resp.Body.Close()
			break
		}
		if attempt == 19 {
			log.Fatal("Gateway never became ready after 10s")
		}
		time.Sleep(500 * time.Millisecond)
	}

	// 4. Execute benchmark requests.
	httpClient := &http.Client{Timeout: 5 * time.Second}
	var totalDuration time.Duration
	successCount := 0
	conflictCount := 0

	fmt.Printf("⚡ Firing %d events...\n", iterations)

	for i := 0; i < iterations; i++ {
		payload := map[string]interface{}{
			"institution_a": "MPESA",
			"institution_b": "KCB",
			"event_type":    "INITIATE",
			// Use a unique tx_ref_hash per iteration so each event is distinct.
			"tx_ref_hash": fmt.Sprintf("bench_tx_%d_%d", i+1, time.Now().UnixNano()),
			"amount":      1500.25 + float64(i)*100.50,
			"currency":    "KES",
			"timestamp":   fmt.Sprintf("%d", time.Now().UnixMilli()),
		}
		body, _ := json.Marshal(payload)

		req, _ := http.NewRequest("POST", gatewayURL+"/v1/events", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("x-api-key", apiKey) // Required — gateway enforces auth on all event routes.

		start := time.Now()
		resp, err := httpClient.Do(req)
		duration := time.Since(start)

		if resp != nil {
			resp.Body.Close()
		}

		switch {
		case err == nil && resp.StatusCode == 200:
			totalDuration += duration
			successCount++
			fmt.Printf("   [%02d] ✅ %v\n", i+1, duration)
		case resp != nil && resp.StatusCode == 409:
			// 409 Conflict means another request updated the chain tip first.
			// This is correct behaviour — the chain was NOT forked. The caller
			// should retry with a fresh GET to /health to get the current tip.
			conflictCount++
			fmt.Printf("   [%02d] ⚠️  Chain conflict (retry needed) — %v\n", i+1, duration)
		default:
			status := "network error"
			if resp != nil {
				status = fmt.Sprintf("HTTP %d", resp.StatusCode)
			}
			fmt.Printf("   [%02d] ❌ FAILED (%s) — %v\n", i+1, status, err)
		}

		// Sequential delay reduces artificial chain conflicts in this single-threaded test.
		time.Sleep(50 * time.Millisecond)
	}

	// 5. Report.
	fmt.Println("\n--- BENCHMARK RESULTS ---")
	fmt.Printf("Iterations:      %d\n", iterations)
	fmt.Printf("Successes:       %d\n", successCount)
	fmt.Printf("Chain Conflicts: %d (chain integrity preserved — see BUG-3 fix notes)\n", conflictCount)
	fmt.Printf("Failures:        %d\n", iterations-successCount-conflictCount)

	if successCount > 0 {
		avg := totalDuration / time.Duration(successCount)
		fmt.Printf("Average Latency: %v\n", avg)
		if avg < 100*time.Millisecond {
			fmt.Println("✅ TARGET MET: Sub-100ms confirmed.")
		} else {
			fmt.Println("⚠️  TARGET MISSED: Average exceeds 100ms SLA.")
		}
	} else {
		fmt.Println("❌ BENCHMARK FAILED: 0 successes. Check API_KEY and gateway startup logs.")
	}
}
