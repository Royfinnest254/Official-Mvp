package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

type EventRequest struct {
	InstitutionA string `json:"institution_a"`
	InstitutionB string `json:"institution_b"`
	EventType    string `json:"event_type"`
	TxRefHash    string `json:"tx_ref_hash"`
	Timestamp    string `json:"timestamp"`
}

type ProofBundle struct {
	BundleID     string   `json:"bundle_id"`
	ChainHash    string   `json:"chain_hash"`
	PrevHash     string   `json:"prev_hash"`
	Signatures   []string `json:"signatures"`
	Status       string   `json:"status"`
	Timestamp    int64    `json:"issued_at"`
}

var (
	prevHash       string
	hashLock       sync.RWMutex
	supabaseClient *supabase.Client
	httpClient     *http.Client // Persistent Pool
)

func init() {
	_ = godotenv.Load()
	
	// INNOVATION: Persistent Transport Pooling for Absolute Performance
	tr := &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 100,
		IdleConnTimeout:     90 * time.Second,
	}
	httpClient = &http.Client{
		Transport: tr,
		Timeout:   150 * time.Millisecond, // Strict institutional SLA
	}
}

func main() {
	// Initialize Supabase
	sbURL := os.Getenv("SUPABASE_URL")
	sbKey := os.Getenv("SUPABASE_SERVICE_KEY")
	client, err := supabase.NewClient(sbURL, sbKey, nil)
	if err == nil {
		supabaseClient = client
	}

	// Prime Cache (Hardcoded for first start)
	prevHash = "0000000000000000000000000000000000000000000000000000000000000000"

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "active",
			"engine":    "Go Ultra-Latency",
			"prev_hash": prevHash[:8],
		})
	})

	http.HandleFunc("/v1/events", handleEvent)

	port := os.Getenv("PORT")
	if port == "" { port = "3000" }
	log.Printf("Connex Production Gateway live on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleEvent(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	
	var req EventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid payload", 400)
		return
	}

	hashLock.RLock()
	currentPrevHash := prevHash
	hashLock.RUnlock()

	// 1. Compute Hashing (Engine Innovation Layer)
	h := sha256.New()
	eventData, _ := json.Marshal(map[string]interface{}{
		"ins_a": req.InstitutionA,
		"ins_b": req.InstitutionB,
		"ref":   req.TxRefHash,
		"prev":  currentPrevHash,
	})
	h.Write(eventData)
	chainHash := hex.EncodeToString(h.Sum(nil))

	// 2. Parallel Coordination (Ultra-Latency Pool)
	nodeURLs := []string{
		os.Getenv("NODE_1_URL"),
		os.Getenv("NODE_2_URL"),
		os.Getenv("NODE_3_URL"),
	}

	resultsChan := make(chan string, 3)
	var wg sync.WaitGroup

	for _, url := range nodeURLs {
		if url == "" { continue }
		wg.Add(1)
		go func(nodeURL string) {
			defer wg.Done()
			reqBody, _ := json.Marshal(map[string]string{"hash": chainHash})
			resp, err := httpClient.Post(nodeURL+"/sign", "application/json", bytes.NewBuffer(reqBody))
			if err == nil && resp.StatusCode == 200 {
				defer resp.Body.Close()
				var sigResp struct {
					Signature string `json:"signature"`
				}
				if err := json.NewDecoder(resp.Body).Decode(&sigResp); err == nil {
					resultsChan <- sigResp.Signature
				}
				io.Copy(ioutil.Discard, resp.Body)
			}
		}(url)
	}

	wg.Wait()
	close(resultsChan)

	var signatures []string
	for sig := range resultsChan {
		signatures = append(signatures, sig)
	}

	// Consensus Check (2 of 3)
	if len(signatures) < 2 {
		http.Error(w, "Consensus Failure: 2-of-3 threshold not met", http.StatusServiceUnavailable)
		return
	}

	// 3. NON-BLOCKING Persistent Audit (FIRE AND FORGET)
	go func() {
		if supabaseClient != nil {
			dbRecord := map[string]interface{}{
				"bundle_id":     "cx-" + uuid.New().String()[:8],
				"event_id":      uuid.New().String(),
				"institution_a": req.InstitutionA,
				"institution_b": req.InstitutionB,
				"event_type":    req.EventType,
				"tx_ref_hash":   req.TxRefHash,
				"chain_hash":    chainHash,
				"prev_hash":     currentPrevHash,
				"event_ts":      req.Timestamp,
			}
			supabaseClient.From("coordination_records").Insert(dbRecord, false, "", "", "").Execute()
		}
	}()

	// 4. Update Cache Locally (0ms)
	hashLock.Lock()
	prevHash = chainHash
	hashLock.Unlock()

	totalTime := time.Since(start)
	log.Printf("⚡ [CORE_PERF] Handled in %v", totalTime)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Coordination-Time", totalTime.String())
	json.NewEncoder(w).Encode(ProofBundle{
		BundleID:  "cx-" + uuid.New().String()[:8],
		ChainHash: chainHash,
		PrevHash:  currentPrevHash,
		Signatures: signatures,
		Status:    "QUORUM_REACHED",
		Timestamp: time.Now().UnixMilli(),
	})
}
