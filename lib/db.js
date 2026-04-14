const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Client A: Legacy (History)
const legacyUrl = process.env.LEGACY_SUPABASE_URL;
const legacyKey = process.env.LEGACY_SUPABASE_SERVICE_KEY;

// Client B: Current (New Writes)
const currentUrl = process.env.SUPABASE_URL;
const currentKey = process.env.SUPABASE_SERVICE_KEY;

// Logic to handle missing environment variables gracefully
if (!currentUrl || !currentKey) {
  console.error('❌ CRITICAL: Missing primary Supabase configuration (SUPABASE_URL/SUPABASE_SERVICE_KEY).');
}
if (!legacyUrl || !legacyKey) {
  console.warn('⚠️  WARNING: Missing legacy Supabase configuration. Dual-client features will be limited.');
}

const supabaseLegacy = (legacyUrl && legacyKey) ? createClient(legacyUrl, legacyKey) : null;
const supabaseCurrent = (currentUrl && currentKey) ? createClient(currentUrl, currentKey) : null;

// Export the primary client as 'supabase' to minimize breaking changes,
// but internally we manage both.
const supabase = supabaseCurrent;

/**
 * Fetches the latest record in the entire daisy-chained ledger.
 */
async function getLatestBlock() {
  let data = null;

  // Check Current project first
  if (supabaseCurrent) {
    const { data: currentData, error } = await supabaseCurrent
      .from('coordination_records')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    data = currentData;
  }

  // If new project is empty or not configured, fall back to Legacy project
  if (!data && supabaseLegacy) {
    const { data: legacyData, error: legacyError } = await supabaseLegacy
      .from('coordination_records')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (legacyError && legacyError.code !== 'PGRST116') throw legacyError;
    data = legacyData;
  }

  return data || null;
}

/**
 * Writes a new block. Always targets the Current project.
 */
async function insertBlock(blockData) {
  if (!supabaseCurrent) {
    throw new Error('Database Write Failure: Primary Supabase client is not configured.');
  }

  const { data, error } = await supabaseCurrent
    .from('coordination_records')
    .insert([blockData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetches the full chain of records across both projects.
 */
async function getChain(limit = 100) {
  let combinedRows = [];

  // 1. Fetch from Current
  if (supabaseCurrent) {
    const { data: currentData, error: currentError } = await supabaseCurrent
      .from('coordination_records')
      .select('*')
      .order('id', { ascending: false })
      .limit(limit);

    if (currentError) throw currentError;
    combinedRows = currentData || [];
  }

  // 2. If we need more rows to fill the limit, fetch from Legacy
  if (combinedRows.length < limit && supabaseLegacy) {
    const remainingLimit = limit - combinedRows.length;
    const { data: legacyData, error: legacyError } = await supabaseLegacy
      .from('coordination_records')
      .select('*')
      .order('id', { ascending: false })
      .limit(remainingLimit);
    
    if (legacyError) throw legacyError;
    combinedRows = combinedRows.concat(legacyData || []);
  }

  return combinedRows;
}

/**
 * Fetches history for a specific transaction ID across both projects.
 */
async function getTxHistory(txId) {
  // Check both projects concurrently (if configured)
  const jobs = [];
  if (supabaseCurrent) {
    jobs.push(supabaseCurrent.from('coordination_records').select('*').eq('tx_ref_hash', txId).order('id', { ascending: true }));
  } else {
    jobs.push(Promise.resolve({ data: [], error: null }));
  }

  if (supabaseLegacy) {
    jobs.push(supabaseLegacy.from('coordination_records').select('*').eq('tx_ref_hash', txId).order('id', { ascending: true }));
  } else {
    jobs.push(Promise.resolve({ data: [], error: null }));
  }

  const [currentRes, legacyRes] = await Promise.all(jobs);

  if (currentRes.error) throw currentRes.error;
  if (legacyRes.error) throw legacyRes.error;

  // Combine and return (Legacy first, then Current)
  return (legacyRes.data || []).concat(currentRes.data || []);
}

/**
 * Validates the cryptographic seam between the Legacy and Current projects.
 * Essential for the Daisy-Chain architecture to guarantee global integrity.
 */
async function validateDaisyChainLink() {
  if (!supabaseLegacy || !supabaseCurrent) return { status: 'PARTIAL_CONFIG', valid: null };

  const [legacyTail, currentHead] = await Promise.all([
    supabaseLegacy.from('coordination_records').select('chain_hash').order('id', { ascending: false }).limit(1).single(),
    supabaseCurrent.from('coordination_records').select('prev_hash').order('id', { ascending: true }).limit(1).single()
  ]);

  // If both have data, check the link
  if (legacyTail.data && currentHead.data) {
    const isValid = legacyTail.data.chain_hash === currentHead.data.prev_hash;
    if (!isValid) {
      console.error('❌ DAISY-CHAIN INTEGRITY FAILURE: Seam mismatch detected between projects.');
    } else {
      console.log('✅ DAISY-CHAIN INTEGRITY VERIFIED: Projects are correctly linked.');
    }
    return { status: 'LINKED', valid: isValid };
  }

  return { status: 'EMPTY_CHAIN', valid: true };
}

module.exports = {
  supabase, // Default to current for legacy calls
  supabaseLegacy,
  supabaseCurrent,
  getLatestBlock,
  insertBlock,
  getChain,
  getTxHistory,
  validateDaisyChainLink
};
