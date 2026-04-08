package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"
)

func main() {
	fmt.Println("🚀 Starting Connex High-Performance Benchmark...")

	// 1. Start 3 Witness Nodes
	witnessPorts := []string{"8001", "8002", "8003"}
	var witnessCmds []*exec.Cmd

	for i, port := range witnessPorts {
		cmd := exec.Command(".\\witness.exe")
		cmd.Env = append(os.Environ(), fmt.Sprintf("PORT=%s", port), fmt.Sprintf("NODE_ID=%d", i+1))
		cmd.Env = append(cmd.Env, "PRIVATE_KEY=0000000000000000000000000000000000000000000000000000000000000001")
		err := cmd.Start()
		if err != nil {
			log.Fatalf("Failed to start witness %d: %v", i+1, err)
		}
		witnessCmds = append(witnessCmds, cmd)
	}

	// Wait for witnesses
	fmt.Println("⏳ Waiting for Witnesses to be ready (binaries)...")
	for _, port := range witnessPorts {
		for i := 0; i < 10; i++ {
			resp, err := http.Get(fmt.Sprintf("http://localhost:%s/health", port))
			if err == nil && resp.StatusCode == 200 {
				resp.Body.Close()
				break
			}
			time.Sleep(200 * time.Millisecond)
		}
	}

	// 2. Start the Gateway
	gatewayCmd := exec.Command(".\\gateway.exe")
	gatewayCmd.Env = append(os.Environ(),
		"PORT=3000",
		"NODE_1_URL=http://localhost:8001",
		"NODE_2_URL=http://localhost:8002",
		"NODE_3_URL=http://localhost:8003",
		"SUPABASE_URL=http://localhost:54321",
		"SUPABASE_SERVICE_KEY=mock",
	)
	err := gatewayCmd.Start()
	if err != nil {
		log.Fatalf("Failed to start gateway: %v", err)
	}
	defer gatewayCmd.Process.Kill()
	for _, cmd := range witnessCmds {
		defer cmd.Process.Kill()
	}

	fmt.Println("⏳ Waiting for Gateway to be ready...")
	for i := 0; i < 10; i++ {
		resp, err := http.Get("http://localhost:3000/health")
		if err == nil && resp.StatusCode == 200 {
			fmt.Println("✅ All systems GO!")
			resp.Body.Close()
			break
		}
		time.Sleep(500 * time.Millisecond)
	}

	// 3. Run Benchmark
	iterations := 20
	var totalDuration time.Duration
	successCount := 0

	fmt.Printf("⚡ Executing %d coordination events...\n", iterations)

	for i := 0; i < iterations; i++ {
		payload := map[string]string{
			"institution_a": "MPESA",
			"institution_b": "KCB",
			"event_type":    "INITIATE",
			"tx_ref_hash":   "hash_test_123",
			"timestamp":     fmt.Sprintf("%d", time.Now().UnixMilli()),
		}
		body, _ := json.Marshal(payload)

		start := time.Now()
		resp, err := http.Post("http://localhost:3000/v1/events", "application/json", bytes.NewBuffer(body))
		duration := time.Since(start)

		if err == nil && resp.StatusCode == 200 {
			totalDuration += duration
			successCount++
			fmt.Printf("   Event %d: %v\n", i+1, duration)
		} else {
			status := "unknown"
			if resp != nil {
				status = fmt.Sprintf("%d", resp.StatusCode)
			}
			fmt.Printf("   Event %d: FAILED (Status: %s, Err: %v)\n", i+1, status, err)
		}
		if resp != nil {
			resp.Body.Close()
		}
		time.Sleep(50 * time.Millisecond)
	}

	// 4. Report Results
	if successCount > 0 {
		avg := totalDuration / time.Duration(successCount)
		fmt.Println("\n--- BENCHMARK RESULTS ---")
		fmt.Printf("Average Coordination Latency: %v\n", avg)
		fmt.Printf("Success Rate: %d/%d\n", successCount, iterations)

		if avg < 100*time.Millisecond {
			fmt.Println("✅ TARGET MET: Sub-100ms confirmed.")
		} else {
			fmt.Println("⚠️  TARGET MISSED.")
		}
	} else {
		fmt.Println("❌ BENCHMARK FAILED: 0 success.")
	}
}
