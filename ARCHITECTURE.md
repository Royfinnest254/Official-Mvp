# Connex MVP Architecture

This document describes the dual-server architecture used in the Connex MVP for high-performance cryptographic coordination and forensic auditing.

## 1. System Components

### 1.1 Go Production Gateway (`cmd/gateway/`)
- **Purpose**: High-throughput, low-latency coordination of clearing events.
- **Language**: Go
- **Concurrency**: Uses Goroutines for parallel witness signing and asynchronous database writes.
- **Performance**: Targeted sub-100ms coordination latency.
- **Auth**: Currently enforces protocol-level consistency but relies on external firewalls or future middleware for authentication (PoC mode).

### 1.2 Node.js API Server (`index.js`)
- **Purpose**: Production API for the management portal, dashboard stats, and Prometheus metrics.
- **Language**: JavaScript (Node.js/Express)
- **Features**: 
  - API Key Authentication (`x-api-key`).
  - Dual-client Supabase daisy-chaining.
  - Prometheus monitoring integration.

### 1.3 Witness Nodes (`cmd/witness/`)
- **Purpose**: Independent cryptographic signing entities.
- **Protocol**: Ed25519 signatures.
- **Threshold**: Requires 2-of-3 quorum for a coordination event to be considered "sealed".

## 2. Daisy-Chain Data Architecture
The system supports a dual-Supabase setup to overcome data tier limits without downtime:
- **Legacy Project**: Historical read-only data.
- **Current Project**: Live writes and recent history.
The `lib/db.js` layer automatically aggregates results from both projects for global visibility.

## 3. Security & Integrity Layer
- **Chain Hashing**: Each record is linked to the previous record's hash, forming an immutable ledger.
- **Signatures**: Every "sealed" event contains cryptographic proofs from the witness quorum.
- **Secrets Management**: All sensitive keys (Supabase Service Keys, Witness Private Keys, API Keys) are managed via environment variables and never hardcoded.

## 4. Benchmark Tools
Located in `cmd/benchmark/`, this tool simulates high-load traffic against the Go Gateway to verify performance SLAs and chain integrity under concurrency.
