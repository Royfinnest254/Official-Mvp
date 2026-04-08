import React, { useState } from 'react';
import axios from 'axios';
import { Search, ShieldCheck, Clock, Server, CheckCircle2, AlertCircle, Copy, Check, Download, ExternalLink } from 'lucide-react';

const API_KEY = 'connex_secret_mvp_2026';
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
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
       setTimeout(() => handleSearch(), 100);
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
        setError('No verifiable coordination records found for this Resource Reference.');
      }
    } catch (err) {
      setError('Internal Audit Engine Error: Linkage to immutable ledger failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyProofBundle = (event) => {
    const proof = JSON.stringify(event, null, 2);
    navigator.clipboard.writeText(proof);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Investigative Workbench</h1>
           <p className="text-xs text-secondary font-medium">Verify forensic evidence and resolve institutional clearing disputes.</p>
        </div>
      </div>

      {/* Resource Search Bar (Sub-Header) */}
      <div className="aws-portal-card p-6 bg-white">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#eaeded] rounded-[2px] text-sm focus:ring-1 focus:ring-accent outline-none"
              placeholder="Track Transaction ID (e.g. TX-XXXXXX)..."
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="aws-button-primary disabled:opacity-50 min-w-[140px]"
          >
            {loading ? 'Scanning...' : 'Verify Evidence'}
          </button>
        </form>
      </div>

      {error && (
        <div className="aws-portal-card border-l-4 border-l-danger p-5 flex items-center gap-3 bg-red-50/30">
          <AlertCircle className="h-4 w-4 text-danger flex-shrink-0" />
          <p className="text-xs font-bold text-danger uppercase tracking-tight">{error}</p>
        </div>
      )}

      {events.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-[#f2f3f3] p-3 border border-[#eaeded] rounded-[2px]">
             <h2 className="text-[11px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-success" />
               Forensic Evidence Reports ({events.length})
             </h2>
          </div>
          
          {events.map((event) => {
             const consensusMet = [event.sig_node_1, event.sig_node_2, event.sig_node_3].filter(s => s && s !== 'NODE_OFFLINE').length >= 2;

             return (
              <div key={event.id} className="aws-portal-card overflow-hidden">
                {/* Protocol Context Header */}
                <div className="bg-[#fbfbfb] px-6 py-3 flex justify-between items-center border-b border-[#eaeded]">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-widest ${
                      event.event_type === 'REJECT' ? 'bg-danger text-white' : 'bg-accent text-white'
                    }`}>
                      {event.event_type}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-secondary">BUNDLE: {event.bundle_id}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
                    <Clock size={14} className="text-slate-300" />
                    {new Date(parseInt(event.event_ts)).toLocaleString()}
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-12 gap-10">
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                      {/* Consensus Summary Card */}
                      <div className={`p-6 rounded-[2px] border-l-4 ${consensusMet ? 'bg-[#f4faff] border-l-accent' : 'bg-red-50 border-l-danger'}`}>
                         <h3 className="text-[11px] font-bold uppercase tracking-widest text-secondary mb-3 flex items-center gap-2">
                            <CheckCircle2 size={14} className={consensusMet ? 'text-success' : 'text-danger'} />
                            Resolution Verdict
                         </h3>
                         <p className="text-sm font-medium leading-relaxed">
                           {consensusMet 
                             ? event.event_type === 'REJECT'
                                ? `Protocol consensus reached. Clearing was REJECTED by ${event.institution_b}. Integrity of the rejection signal verified via witness quorum.`
                                : `Protocol consensus reached. Funds successfully cleared from ${event.institution_a} to ${event.institution_b}. Transaction finalized and sealed.`
                             : `CRITICAL INTEGRITY FAILURE. Witness quorum could not be established. Mathematical proof of clearing is incomplete.`}
                         </p>
                      </div>

                      {/* Route Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5">Debit Entity</p>
                          <p className="text-lg font-bold tracking-tight">{event.institution_a}</p>
                        </div>
                        <div className="text-right sm:text-left">
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5">Credit Entity</p>
                          <p className="text-lg font-bold tracking-tight">{event.institution_b}</p>
                        </div>
                      </div>

                      {/* Diagnostic Hash Data */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resource Forensic Chain Hash</label>
                           <div className="font-mono text-[11px] p-3 bg-[#fbfbfb] border border-[#eaeded] rounded-[2px] break-all leading-relaxed text-slate-900 font-bold">
                              {event.chain_hash}
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Linked Predecessor Hash</label>
                           <div className="font-mono text-[11px] p-3 bg-white border border-[#eaeded] rounded-[2px] break-all leading-relaxed text-slate-400 italic">
                              {event.prev_hash}
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Witness Quorum Sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                      <div className="aws-portal-card p-5 space-y-4 bg-white">
                        <h4 className="text-[11px] font-bold text-secondary uppercase tracking-wider border-b border-[#eaeded] pb-2">Witness Consensus</h4>
                        <div className="space-y-3">
                          {['sig_node_1', 'sig_node_2', 'sig_node_3'].map((sigKey, i) => {
                            const isValid = event[sigKey] && event[sigKey] !== 'NODE_OFFLINE';
                            return (
                              <div key={sigKey} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                  <Server size={14} className={isValid ? 'text-accent' : 'text-slate-300'} />
                                  <span className="text-[11px] font-bold text-secondary">Node {i+1}</span>
                                </div>
                                {isValid ? <ShieldCheck size={14} className="text-success" /> : <Clock size={14} className="text-slate-200" />}
                              </div>
                            );
                          })}
                        </div>
                        <div className="pt-2">
                           <div className={`text-[10px] font-black uppercase text-center py-1.5 rounded-[2px] border ${consensusMet ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                              {consensusMet ? 'QUORUM MET' : 'UNSECURED'}
                           </div>
                        </div>
                      </div>

                      <div className="p-5 border border-dashed border-[#eaeded] rounded-[2px] space-y-3">
                         <h5 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Download size={14} className="text-slate-400" /> ACTIONS
                         </h5>
                         <button 
                           onClick={() => copyProofBundle(event)}
                           className="w-full text-left text-[11px] font-bold text-accent hover:underline flex items-center justify-between"
                         >
                           {copied ? 'Proof Copied!' : 'Copy Forensic Proof'}
                           <Copy size={12} />
                         </button>
                         <button className="w-full text-left text-[11px] font-bold text-secondary hover:text-primary flex items-center justify-between">
                           Export Compliance PDF
                           <ExternalLink size={12} />
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
             );
          })}
        </div>
      )}
      
      {events.length === 0 && !error && !loading && (
        <div className="aws-portal-card p-32 text-center border-dashed border-[#eaeded]">
           <div className="w-16 h-16 bg-[#fbfbfb] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#eaeded]">
              <ShieldCheck className="w-8 h-8 text-slate-200" />
           </div>
           <h3 className="text-lg font-bold mb-2">Immutable Protocol Audit</h3>
           <p className="text-secondary max-w-sm mx-auto text-xs font-medium leading-relaxed italic">
             Enter a transaction reference hash for a complete witness verification report and clearing finality proof.
           </p>
        </div>
      )}
    </div>
  );
}
