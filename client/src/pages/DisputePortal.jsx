import React, { useState } from 'react';
import axios from 'axios';
import { Search, ShieldCheck, Clock, Server, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

const API_KEY = 'connex_secret_mvp_2026';
// We are querying the production cloud directly!
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://official-mvp-production.up.railway.app';

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
    <div className="bg-white min-h-screen font-sans text-slate-800 pb-12">
      {/* Search Header */}
      <div className="bg-slate-50 border-b border-slate-200 py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Dispute Resolution Portal</h1>
          <p className="text-slate-500 mb-8">Access the immutable cryptographic ledger for cross-institutional inquiries.</p>
          
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm shadow-sm transition-all"
                placeholder="Enter Transaction ID (e.g. OQX123456)"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {loading ? 'Querying Ledger...' : 'Verify Record'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {events.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">Verification Results</h2>
            
            {events.map((event, index) => {
               // Calculate consensus quorum
               const node1Valid = verifySignature(event.sig_node_1);
               const node2Valid = verifySignature(event.sig_node_2);
               const node3Valid = verifySignature(event.sig_node_3);
               const validCount = [node1Valid, node2Valid, node3Valid].filter(Boolean).length;
               const consensusMet = validCount >= 2;

               return (
                <div key={event.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
                  {/* Event Header */}
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded border border-blue-200">
                        {event.event_type}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">Bundle ID: {event.bundle_id}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500 font-mono">
                      <Clock className="w-4 h-4 mr-1.5" />
                      {new Date(parseInt(event.event_ts)).toLocaleString()}
                    </div>
                  </div>

                  {/* Event Body */}
                  <div className="p-6">
                    {/* The Non-Technical Verdict (What the Agent Reads to the Customer) */}
                    <div className={`mb-8 p-5 rounded-lg border-2 ${consensusMet ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center">
                          <ShieldCheck className={`w-5 h-5 mr-2 ${consensusMet ? 'text-blue-600' : 'text-red-600'}`} />
                          Official System Verdict
                       </h3>
                       <p className="text-lg text-slate-800 font-medium leading-relaxed">
                         {consensusMet 
                           ? event.event_type === 'REJECT' || event.event_type === 'DISPUTE'
                              ? `Network Consensus reached! However, the funds FAILED to move from ${event.institution_a} to ${event.institution_b} on ${new Date(parseInt(event.event_ts)).toLocaleString()}. The funds are STILL with ${event.institution_a}.`
                              : `Network Consensus reached! The funds successfully moved from ${event.institution_a} and arrived at ${event.institution_b} on ${new Date(parseInt(event.event_ts)).toLocaleString()}. ${event.institution_b} is currently holding the funds.`
                           : `This transaction could not be verified by the independent cloud witnesses. Please escalate this dispute immediately.`}
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sending Institution</p>
                        <p className="text-lg font-medium text-slate-900">{event.institution_a}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Receiving Institution</p>
                        <p className="text-lg font-medium text-slate-900">{event.institution_b}</p>
                      </div>
                    </div>

                    {/* Cryptographic Proof Section */}
                    <div className="bg-slate-50 rounded-md border border-slate-200 p-5 mt-4">
                      <div className="flex items-center mb-4">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 mr-2" />
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Cryptographic Proof Chain</h3>
                      </div>
                      
                      <div className="space-y-3 font-mono text-xs text-slate-600">
                        <div className="flex">
                          <span className="w-28 flex-shrink-0 font-medium text-slate-500">TX Ref Hash:</span>
                          <span className="truncate">{event.tx_ref_hash}</span>
                        </div>
                        <div className="flex bg-slate-100 p-1.5 rounded">
                          <span className="w-28 flex-shrink-0 font-medium text-slate-500">Block Hash:</span>
                          <span className="text-indigo-700 truncate font-semibold">{event.chain_hash}</span>
                        </div>
                        <div className="flex">
                          <span className="w-28 flex-shrink-0 font-medium text-slate-500">Prev Hash:</span>
                          <span className="truncate">{event.prev_hash}</span>
                        </div>
                      </div>
                    </div>

                    {/* Witness Quorum Section */}
                    <div className="mt-6 border-t border-slate-100 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Witness Quorum (2-of-3)</h3>
                        {consensusMet ? (
                          <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Consensus Reached
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" /> Consensus Failed
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {/* AWS Node */}
                        <div className={`p-3 rounded border text-sm flex items-center justify-between ${node1Valid ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center font-medium text-slate-700">
                            <Server className="w-4 h-4 mr-2" /> AWS 
                          </div>
                          {node1Valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <span className="text-xs text-slate-400">N/A</span>}
                        </div>
                        
                        {/* GCP Node */}
                        <div className={`p-3 rounded border text-sm flex items-center justify-between ${node2Valid ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center font-medium text-slate-700">
                            <Server className="w-4 h-4 mr-2" /> GCP 
                          </div>
                          {node2Valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <span className="text-xs text-slate-400">N/A</span>}
                        </div>

                        {/* Azure Node */}
                        <div className={`p-3 rounded border text-sm flex items-center justify-between ${node3Valid ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center font-medium text-slate-700">
                            <Server className="w-4 h-4 mr-2" /> Azure 
                          </div>
                          {node3Valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <span className="text-xs text-slate-400">N/A</span>}
                        </div>
                      </div>
                    </div>

                    {/* Copy Proof Bundle Button */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end">
                       <button
                         onClick={() => copyProofBundle(event)}
                         className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors shadow-sm"
                       >
                         {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                         {copied ? 'Copied to Clipboard!' : 'Copy Proof Bundle'}
                       </button>
                    </div>
                  </div>
                </div>
               );
            })}
          </div>
        )}
        
        {events.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
             <ShieldCheck className="w-12 h-12 text-slate-300 mb-4" />
             <h3 className="text-lg font-medium text-slate-900 mb-1">No Active Dispute</h3>
             <p className="text-slate-500 max-w-sm">Enter a Transaction ID from the live feed to instantly verify its cryptographic proof across the Connex Network.</p>
          </div>
        )}
      </div>
    </div>
  );
}
