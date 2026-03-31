import React, { useState } from 'react';
import axios from 'axios';
import { Search, ShieldCheck, Clock, Server, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

const API_KEY = 'connex_secret_mvp_2026';
// We are querying the production cloud directly!
const API_BASE_URL = 'https://official-mvp-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  }
});

export default function DisputePortal({ initialTxId }) {
  const [txId, setTxId] = useState(initialTxId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (initialTxId) {
       setTxId(initialTxId);
       // Auto-trigger search when navigating from Live Feed
       setTimeout(async () => {
         try {
           const response = await api.get(`/tx/${initialTxId.trim()}`);
           if (response.data.events && response.data.events.length > 0) {
             setEvents(response.data.events);
           }
         } catch (err) { console.error(err); }
       }, 100);
    }
  }, [initialTxId]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!txId.trim()) return;

    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const response = await api.get(`/tx/${txId.trim()}`);
      if (response.data.events && response.data.events.length > 0) {
        setEvents(response.data.events);
      } else {
        setError('No verifiable coordination records found for this Transaction ID.');
      }
    } catch (err) {
      setError('System error while connecting to the immutable ledger.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifySignature = (sig) => {
    return sig && sig.length > 20 && sig !== 'NODE_OFFLINE';
  };

  const copyProofBundle = (event) => {
    const proof = `CONNEX PROOF BUNDLE\n` +
      `========================\n` +
      `Transaction ID: ${event.tx_ref_hash}\n` +
      `Bundle ID: ${event.bundle_id}\n` +
      `Timestamp: ${new Date(parseInt(event.event_ts)).toLocaleString()}\n` +
      `Event Type: ${event.event_type}\n` +
      `Sending Institution: ${event.institution_a}\n` +
      `Receiving Institution: ${event.institution_b}\n` +
      `========================\n` +
      `Chain Hash: ${event.chain_hash}\n` +
      `Previous Hash: ${event.prev_hash}\n` +
      `========================\n` +
      `Witness Node 1 (AWS): ${event.sig_node_1 || 'N/A'}\n` +
      `Witness Node 2 (GCP): ${event.sig_node_2 || 'N/A'}\n` +
      `Witness Node 3 (Azure): ${event.sig_node_3 || 'N/A'}\n` +
      `========================\n` +
      `Verified by CONNEX Technologies | connex.co.ke`;
    navigator.clipboard.writeText(proof);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-background min-h-screen text-slate-300 pb-20 transition-colors duration-700">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Search Header */}
      <div className="glass-header !static py-16 px-6">
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">Resolution Center</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">Verify the immutable cryptographic evidence layer</p>
          </motion.div>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-primary/50" />
              </div>
              <input
                type="text"
                className="block w-full pl-14 pr-6 py-4 bg-surface/50 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-2xl backdrop-blur-md"
                placeholder="Enter Transaction ID (e.g. OQX123456)"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-primary text-background font-black uppercase tracking-widest rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-glow-blue whitespace-nowrap"
            >
              {loading ? 'Decrypting...' : 'Verify Proof'}
            </motion.button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 mt-12 relative z-10">
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-danger/10 border border-danger/20 p-5 rounded-2xl flex items-center gap-4"
          >
            <AlertCircle className="h-6 w-6 text-danger" />
            <p className="text-sm font-bold text-danger uppercase tracking-wider">{error}</p>
          </motion.div>
        )}

        {events.length > 0 && (
          <div className="space-y-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Live Verification Report</h2>
               <span className="text-[10px] font-mono text-slate-500 uppercase">{events.length} RECORD(S) FOUND</span>
            </div>
            
            {events.map((event, index) => {
               const node1Valid = verifySignature(event.sig_node_1);
               const node2Valid = verifySignature(event.sig_node_2);
               const node3Valid = verifySignature(event.sig_node_3);
               const validCount = [node1Valid, node2Valid, node3Valid].filter(Boolean).length;
               const consensusMet = validCount >= 2;

               return (
                <motion.div 
                  key={event.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-panel group rounded-3xl glow-border overflow-hidden"
                >
                  {/* Event Header */}
                  <div className="bg-white/5 px-8 py-5 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center space-x-4">
                      <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/20">
                        {event.event_type}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">ID: {event.bundle_id}</span>
                    </div>
                    <div className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 mr-2 text-primary/50" />
                      {new Date(parseInt(event.event_ts)).toLocaleString()}
                    </div>
                  </div>

                  {/* Event Body */}
                  <div className="p-8">
                    {/* The Official Verdict Section */}
                    <div className={`mb-10 p-6 rounded-2xl border ${consensusMet ? 'bg-primary/5 border-primary/20 shadow-glow-blue' : 'bg-danger/5 border-danger/20'}`}>
                       <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 animate-pulse ${consensusMet ? 'bg-primary shadow-glow-blue' : 'bg-danger'}`}></div>
                          Network Ledger Verdict
                       </h3>
                       <p className="text-xl text-white font-medium leading-relaxed tracking-tight">
                         {consensusMet 
                           ? event.event_type === 'REJECT' || event.event_type === 'DISPUTE'
                              ? `Consensus confirmed. Transaction FAILED on departure from ${event.institution_a} to ${event.institution_b}. Funds remain locked at source.`
                              : `Consensus active. Funds successfully cleared ${event.institution_a} and were settled at ${event.institution_b}. Integrity verified.`
                           : `UNABLE TO VERIFY. The witness quorum could not reach mathematical agreement. Escalation required.`}
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-10 text-center sm:text-left">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Origin</p>
                        <p className="text-2xl font-black text-white tracking-tighter uppercase italic">{event.institution_a}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Destination</p>
                        <p className="text-2xl font-black text-white tracking-tighter uppercase italic">{event.institution_b}</p>
                      </div>
                    </div>

                    {/* Cryptographic Proof Section */}
                    <div className="bg-surface/50 rounded-2xl border border-white/5 p-6 mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center uppercase tracking-widest text-[10px] font-black text-primary">
                          <ShieldCheck className="w-4 h-4 mr-2" /> Proof Chain
                        </div>
                        <div className="h-px bg-white/5 flex-grow mx-4"></div>
                      </div>
                      
                      <div className="space-y-4 font-mono text-[11px]">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="w-32 flex-shrink-0 font-black text-slate-600 uppercase">TX REF:</span>
                          <span className="text-slate-400 break-all">{event.tx_ref_hash}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="w-32 flex-shrink-0 font-black text-primary uppercase">LEDGER HASH:</span>
                          <span className="text-white font-black break-all">{event.chain_hash}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="w-32 flex-shrink-0 font-black text-slate-600 uppercase">HISTORY:</span>
                          <span className="text-slate-500 break-all">{event.prev_hash}</span>
                        </div>
                      </div>
                    </div>

                    {/* Witness Quorum Section */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Witness Quorum (2-of-3)</h3>
                        <div className="h-[2px] bg-white/5 flex-grow mx-4"></div>
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${consensusMet ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'}`}>
                           {consensusMet ? 'VALID' : 'UNSECURED'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { name: 'AWS Node', valid: node1Valid },
                          { name: 'GCP Node', valid: node2Valid },
                          { name: 'Azure Node', valid: node3Valid }
                        ].map((node, i) => (
                           <div key={i} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${node.valid ? 'bg-success/5 border-success/20' : 'bg-surface border-white/5'}`}>
                              <div className="flex items-center text-xs font-bold text-slate-400">
                                <Server className={`w-3.5 h-3.5 mr-3 ${node.valid ? 'text-success' : 'text-slate-600'}`} />
                                {node.name}
                              </div>
                              {node.valid ? <CheckCircle2 className="w-4 h-4 text-success" /> : <div className="w-2 h-2 rounded-full bg-slate-800"></div>}
                           </div>
                        ))}
                      </div>
                    </div>

                    {/* Copy Proof Bundle Button */}
                    <div className="flex justify-end">
                       <motion.button
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         onClick={() => copyProofBundle(event)}
                         className="inline-flex items-center gap-3 px-8 py-3 bg-white text-background text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-2xl"
                       >
                         {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                         {copied ? 'Proof Copied' : 'Extract Proof Bundle'}
                       </motion.button>
                    </div>
                  </div>
                </motion.div>
               );
            })}
          </div>
        )}
        
        {events.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-32 text-center glass-panel rounded-3xl glow-border border-dashed">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-primary/40" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Immutable Search Active</h3>
             <p className="text-slate-500 max-w-sm text-sm font-medium leading-relaxed">Enter a transaction reference hash from the network feed to retrieve its cryptographic payload.</p>
          </div>
        )}
      </div>
    </div>
  );
}
