package main

import (
	"crypto/ed25519"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
)

type SignRequest struct {
	Hash string `json:"hash"`
}

type SignResponse struct {
	NodeID    int    `json:"node_id"`
	Signature string `json:"signature"`
	PublicKey string `json:"public_key"`
}

func main() {
	nodeIDStr := os.Getenv("NODE_ID")
	if nodeIDStr == "" { nodeIDStr = "1" }
	nodeID, _ := strconv.Atoi(nodeIDStr)

	// Use a hardcoded 64-byte seed for the test witness
	seed := make([]byte, 32)
	for i := range seed { seed[i] = byte(nodeID) }
	privateKey := ed25519.NewKeyFromSeed(seed)
	publicKey := privateKey.Public().(ed25519.PublicKey)

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	http.HandleFunc("/sign", func(w http.ResponseWriter, r *http.Request) {
		var req SignRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid", 400)
			return
		}
		sig := ed25519.Sign(privateKey, []byte(req.Hash))
		json.NewEncoder(w).Encode(SignResponse{
			NodeID:    nodeID,
			Signature: hex.EncodeToString(sig),
			PublicKey: hex.EncodeToString(publicKey),
		})
	})

	port := os.Getenv("PORT")
	if port == "" { port = strconv.Itoa(8000 + nodeID) }
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
