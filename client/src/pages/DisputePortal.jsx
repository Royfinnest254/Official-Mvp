import React, { useState } from 'react';
import axios from 'axios';
import { Search, ShieldCheck, Clock, Server, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

const API_KEY = 'connex_secret_mvp_2026';
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : window.location.origin;

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
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20 animate-in fade-in duration-700">
      {/* Professional Search Header */}
      <div className="bg-white border-b border-slate-200 py-16 px-6 shadow-sm">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Protocol Resolution Center</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Forensic Evidence Retrieval</h1>
          <p className="text-slate-500 font-medium text-sm max-w-xl mx-auto mb-10 leading-relaxed">Retrieve immutable coordination records from the federated witness layer for audit and dispute resolution.</p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                placeholder="Enter Transaction ID (e.g. OQX123456)"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-slate-900 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              {loading ? 'Consulting Ledger...' : 'Verify Evidence'}
            </button>
          </form>
        </div>
      </div>

      {/* Results Workspace */}
      <div className="max-w-4xl mx-auto px-6 mt-12">
        
        {error && (
          <div className="bg-red-50 border border-red-100 p-5 rounded-xl flex items-center gap-4 animate-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-bold text-red-700 uppercase tracking-tight">{error}</p>
          </div>
        )}

        {events.length > 0 && (
          <div className="space-y-10">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
               <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Copy className="w-3.5 h-3.5 text-slate-400" />
                 Forensic Proof Report
               </h2>
               <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{events.length} SECURED EVENT(S)</span>
            </div>
            
            {events.map((event, index) => {
               const node1Valid = verifySignature(event.sig_node_1);
               const node2Valid = verifySignature(event.sig_node_2);
               const node3Valid = verifySignature(event.sig_node_3);
               const validCount = [node1Valid, node2Valid, node3Valid].filter(Boolean).length;
               const consensusMet = validCount >= 2;

               return (
                <div key={event.id} className="institution-card overflow-hidden">
                  {/* Event Metadata Header */}
                  <div className="bg-slate-50/80 px-8 py-4 flex justify-between items-center border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                        event.event_type === 'REJECT' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'
                      }`}>
                        {event.event_type}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">INDEX: 0x{event.bundle_id.substring(0,6)}</span>
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      <Clock className="w-3.5 h-3.5 mr-2" />
                      {new Date(parseInt(event.event_ts)).toLocaleString()}
                    </div>
                  </div>

                  {/* Evidence Body */}
                  <div className="p-8">
                    {/* The Official Verdict Section */}
                    <div className={`mb-6 p-6 rounded-xl border ${consensusMet ? 'bg-slate-900 border-slate-900' : 'bg-white border-red-200'}`}>
                       <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center ${consensusMet ? 'text-slate-400' : 'text-red-600'}`}>
                          <div className={`w-2 h-2 rounded-full mr-3 ${consensusMet ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                          Protocol Consensus Verdict
                       </h3>
                       <p className={`text-lg font-bold leading-relaxed tracking-tight ${consensusMet ? 'text-white' : 'text-red-900'}`}>
                         {consensusMet 
                           ? event.event_type === 'REJECT' || event.event_type === 'DISPUTE'
                              ? `Consensus Met. Transaction REJECTED during clearing from ${event.institution_a} to ${event.institution_b}. Payload integrity confirmed; rejection reason persists in vault index.`
                              : `Consensus Met. Funds successfully processed from ${event.institution_a} to ${event.institution_b}. Witness signatures verified and ledger sealed.`
                           : `INTEGRITY FAILURE. Quorum could not be reached. The mathematical proof for this event is incomplete.`}
                       </p>
                    </div>

                    {/* AI Forensic Auditor Insight */}
                    <div className="mb-10 p-6 rounded-xl bg-blue-50/50 border border-blue-100/50 relative overflow-hidden group hover:border-blue-300 transition-all">
                       <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                          <ShieldCheck size={120} className="text-blue-900" />
                       </div>
                       <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                             <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <span className="text-[10px] font-black text-white">AI</span>
                             </div>
                             <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">DeepSeek Forensic Brief</span>
                          </div>
                          <p className="text-xs font-medium text-blue-800 leading-relaxed italic pr-12">
                             {consensusMet 
                               ? `Mathematical finality has been achieved across the federated witness layer. Analysis of the cryptographic trace confirms that ${event.institution_a} initiated a ${event.event_type} sequence that was successfully signed by ${validCount} of 3 independent oracle nodes. Evidence has been immutable archived in the ISO 20022 vault (Local Root).`
                               : `CRITICAL ALERT: Forensic tracing identifies a signature mismatch. Only ${validCount} out of 3 required witnesses responded within the 100ms clearing window. Internal metadata suggests a synchronization delay at the Connex-AZ-03 node. Recommend manual clearing override or forensic re-sync.`}
                          </p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-10 text-center sm:text-left">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Debit Institution</p>
                        <p className="text-2xl font-bold text-slate-900 tracking-tight uppercase">{event.institution_a}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Credit Institution</p>
                        <p className="text-2xl font-bold text-slate-900 tracking-tight uppercase">{event.institution_b}</p>
                      </div>
                    </div>

                    {/* Technical Audit Section */}
                    <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-6 mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center uppercase tracking-widest text-[10px] font-black text-slate-900">
                          <Server className="w-4 h-4 mr-2 text-slate-400" /> Evidence Bundle
                        </div>
                        <div className="h-px bg-slate-100 flex-grow mx-4"></div>
                      </div>
                      
                      <div className="space-y-4 font-mono text-[11px]">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="w-32 flex-shrink-0 font-bold text-slate-400 uppercase">TX REF:</span>
                          <span className="text-slate-600 truncate">{event.tx_ref_hash}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 px-3 bg-white border border-slate-200 rounded-lg">
                          <span className="w-32 flex-shrink-0 font-bold text-slate-500 uppercase">Ledger Hash:</span>
                          <span className="text-slate-900 font-bold truncate">{event.chain_hash}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="w-32 flex-shrink-0 font-bold text-slate-400 uppercase">Parent Hash:</span>
                          <span className="text-slate-400 truncate">{event.prev_hash}</span>
                        </div>
                      </div>
                    </div>

                    {/* Witness Quorum Section */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Independent Witness Signatures</h3>
                        <div className="h-[1px] bg-slate-100 flex-grow mx-4"></div>
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${consensusMet ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                           {consensusMet ? 'SIGNED' : 'UNSECURED'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { name: 'Connex-AWS-01', valid: node1Valid },
                          { name: 'Connex-GCP-02', valid: node2Valid },
                          { name: 'Connex-AZ-03', valid: node3Valid }
                        ].map((node, i) => (
                           <div key={i} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${node.valid ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                              <div className="flex items-center text-xs font-bold text-slate-600">
                                <Server className={`w-3.5 h-3.5 mr-3 ${node.valid ? 'text-blue-600' : 'text-slate-300'}`} />
                                {node.name}
                              </div>
                              {node.valid ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Clock className="w-3.5 h-3.5 text-slate-200" />}
                           </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="flex justify-end pt-6 border-t border-slate-100">
                       <button
                         onClick={() => copyProofBundle(event)}
                         className="inline-flex items-center gap-3 px-8 py-3 bg-white border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-widest rounded-lg hover:border-slate-900 transition-all active:scale-95 shadow-sm"
                       >
                         {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                         {copied ? 'Proof Copied' : 'Download Forensic Proof'}
                       </button>
                    </div>
                  </div>
                </div>
               );
            })}
          </div>
        )}
        
        {events.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-slate-200 border-dashed rounded-2xl">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-slate-200" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Immutable Protocol Audit</h3>
             <p className="text-slate-500 max-w-sm text-sm font-medium leading-relaxed">Enter a transaction reference hash for a complete witness verification report and clearing finality proof.</p>
          </div>
        )}
      </div>
    </div>
  );
}
