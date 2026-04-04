# TECHNICAL SPECIFICATIONS: CONNEX MVP STABILIZATION

**Technical Reference | 2026-03-31**
**Architecture Release: v1.0.4-PRD**

---

## 1. Institutional Design System (Visual Tokens)

The Connex visual architecture has been standardized to eliminate "AI-generated" glassmorphism and glow effects, replacing them with a solid, high-fidelity institutional palette.

- **Background Palette**:
  - `bg-slate-50`: Global background (Light Mode).
  - `bg-white`: Component surfaces.
  - `bg-slate-900`: Active tab state, solid headers, and primary buttons.
- **Typography**:
  - **Font**: Inter / Sans-serif (System Optimized).
  - **Sizing**: 10px-11px for metadata; 14px for primary reading; 24px-36px for headings.
  - **Tone**: Professional, uppercase, and wide-letter spacing for metadata and headers.
- **Visual Atomic Elements**:
  - `border-slate-100`: Subtle dividers.
  - `text-slate-400`: Inactive metadata labels.
  - `text-slate-900`: High-contrast body text.

## 2. Server-Side Protocol (Express 5 Compatibility)

The Node.js gateway has been updated to the latest Express 5 routing standard to prevent production crashes on deployment.

- **Wildcard Protocol**: Transitioned from the legacy `(.*)` syntax to the named wildcard parameter `/*path`.
- **Environment Awareness**: 
  - `PORT`: Dynamic port binding for Railway deployment.
  - `0.0.0.0`: Host binding ensured for cloud observability.
- **Security Headers**: `x-api-key` validation for all forensic endpoints (`connex_secret_mvp_2026`).

## 3. Forensic Coordination Layer (Evidence Logic)

Every transaction coordination event follows a rigorous 2-of-3 signature threshold to establish mathematical finality.

### 3.1 Witness Consensus Engine
- **Quorum Threshold**: $Q \ge 2/3$.
- **Witness Nodes**: Independent AWS, GCP, and Azure signing oracles.
- **Signature Payload**: Cryptographic hash of the $(Amount + Currency + Origin + Destination + Timestamp + PrevHash)$ bundle.

### 3.2 AI Auditor Narrative Engine (DeepSeek)
- **Logic Mapping**: 
  - **Success**: Case-matched narrative for confirmed settlement finality.
  - **Breach**: Case-matched narrative for quorum failures and sync latency identification.

## 4. Database Schema (Supabase / ISO 20022 Alignment)

The evidence vault is structured for multi-institutional data preservation.

- **Audit Vault Table**:
  - `id`: UUID (Primary Key).
  - `block_number`: Incremental sequence.
  - `block_hash`: SHA-256 evidence seal.
  - `signatures`: JSON-encoded witness quorum signatures.
  - `status`: [CONFIRM, REJECT, DISPUTE, PENDING].

---

**Technical Compilation by Antigravity AI**
**Specifications ID: CONNEX-2026-TECH**
