const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches the latest block in the chain to determine the prevHash and block_number.
 * @returns {Promise<Object|null>} - The latest block or null if chain is empty.
 */
async function getLatestBlock() {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .order('block_number', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    throw error;
  }
  return data || null;
}

/**
 * Updates the transaction status by adding a new block to the chain.
 * @param {Object} blockData - The block object to insert.
 * @returns {Promise<Object>} - The inserted block.
 */
async function insertBlock(blockData) {
  const { data, error } = await supabase
    .from('blocks')
    .insert([blockData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetches the full chain of blocks.
 * @returns {Promise<Array>} - Array of blocks in reverse chronological order.
 */
async function getChain() {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .order('block_number', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetches all blocks for a specific transaction ID.
 * @param {string} txId - The transaction ID.
 * @returns {Promise<Array>} - Array of blocks for the transaction.
 */
async function getTxHistory(txId) {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('tx_id', txId)
    .order('block_number', { ascending: true });

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
