const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches the latest record in the chain.
 */
async function getLatestBlock() {
  const { data, error } = await supabase
    .from('coordination_records')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data || null;
}

/**
 * Updates the transaction status by adding a new record to the chain.
 */
async function insertBlock(blockData) {
  const { data, error } = await supabase
    .from('coordination_records')
    .insert([blockData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetches the full chain of records.
 */
async function getChain() {
  const { data, error } = await supabase
    .from('coordination_records')
    .select('*')
    .order('id', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetches history for a specific transaction ID.
 */
async function getTxHistory(txId) {
  const { data, error } = await supabase
    .from('coordination_records')
    .select('*')
    .eq('tx_ref_hash', txId)
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
}

module.exports = {
  supabase,
  getLatestBlock,
  insertBlock,
  getChain,
  getTxHistory
};
