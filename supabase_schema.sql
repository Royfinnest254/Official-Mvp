-- Connex MVP Supabase Schema (Aligned with PRD v0.1)

-- Primary chain table
DROP TABLE IF EXISTS public.coordination_records CASCADE;

CREATE TABLE public.coordination_records (
  id            BIGSERIAL PRIMARY KEY,
  bundle_id     VARCHAR(32)  NOT NULL UNIQUE,
  event_id      UUID         NOT NULL UNIQUE,
  institution_a VARCHAR(64)  NOT NULL,
  institution_b VARCHAR(64)  NOT NULL,
  event_type    VARCHAR(16)  NOT NULL CHECK (event_type IN ('INITIATE', 'CONFIRM', 'REJECT', 'REVERSE')),
  tx_ref_hash   VARCHAR(64)  NOT NULL,
  chain_hash    CHAR(64)     NOT NULL,
  prev_hash     CHAR(64)     NOT NULL UNIQUE,
  sig_node_1    TEXT         NOT NULL,
  sig_node_2    TEXT         NOT NULL,
  sig_node_3    TEXT         NOT NULL,
  latency_ms    INTEGER,
  event_ts      BIGINT       NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Immutable Ledger Enforcement (Stronger than RULES)
CREATE OR REPLACE FUNCTION prevent_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Blockchain Integrity Violation: Modification of sealed records is prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_prevent_update
BEFORE UPDATE ON public.coordination_records
FOR EACH ROW EXECUTE FUNCTION prevent_mutation();

CREATE TRIGGER tr_prevent_delete
BEFORE DELETE ON public.coordination_records
FOR EACH ROW EXECUTE FUNCTION prevent_mutation();

-- Index for fast lookup of transaction history and chain state
CREATE INDEX idx_records_bundle_id ON public.coordination_records(bundle_id);
CREATE INDEX idx_records_tx_hash ON public.coordination_records(tx_ref_hash);
CREATE INDEX idx_records_institutions ON public.coordination_records(institution_a, institution_b);
CREATE INDEX idx_records_ts ON public.coordination_records(event_ts DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.coordination_records ENABLE ROW LEVEL SECURITY;

-- Service Role access
CREATE POLICY "Service Role can manage records" 
ON public.coordination_records FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Anonymous read access (Public Verification)
CREATE POLICY "Anyone can read records" 
ON public.coordination_records FOR SELECT 
TO anon, authenticated
USING (true);
