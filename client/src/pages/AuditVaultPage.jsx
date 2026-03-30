import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuditVault from '../components/AuditVault';
import { Database, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

const API_BASE = 'https://official-mvp-production.up.railway.app';

export default function AuditVaultPage() {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [integrityReport, setIntegrityReport] = useState(null);

  const fetchVault = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/vault`, {
        headers: { 'x-api-key': 'connex_secret_mvp_2026' }
      });
      // Sort blocks by number descending for the feed
      const sortedBlocks = res.data.blocks.sort((a, b) => b.block_number - a.block_number);
      setBlocks(sortedBlocks);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch vault:', err);
      setError('Unable to sync with Evidence Vault. Check API connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const res = await axios.get(`${API_BASE}/vault/verify`, {
        headers: { 'x-api-key': 'connex_secret_mvp_2026' }
      });
      setIntegrityReport(res.data);
      setTimeout(() => setIntegrityReport(null), 5000); // Clear report after 5s
    } catch (err) {
      console.error('Integrity check failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    fetchVault();
    const interval = setInterval(fetchVault, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0a0c10] min-h-screen p-4 md:p-8 text-white font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        
        {/* Vault Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3">
              <Database className="text-blue-500 w-6 h-6" />
              CONNEX EVIDENCE VAULT
            </h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">
              Autonomous Post-Facto Preservation Layer
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={verifyIntegrity}
              disabled={isVerifying}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-2 group"
            >
              {isVerifying ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className={`w-3.5 h-3.5 ${integrityReport?.valid ? 'text-emerald-500' : 'text-slate-400 group-hover:text-blue-400'}`} />
              )}
              {integrityReport ? (integrityReport.valid ? 'INTEGRITY VERIFIED' : 'INTEGRITY FAILED') : 'RUN INTEGRITY CHECK'}
            </button>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Live Sync Active</span>
               </div>
            </div>
          </div>
        </div>

        {/* Impact Message */}
        <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-center gap-6">
          <div className="p-3 bg-blue-600 rounded-xl">
             <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-bold mb-1">ISO 20022 Data Preservation</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              This vault captures and seals rich transaction metadata that is often lost or truncated in legacy inter-bank hops. 
              By storing a signed hash of the full payload, we provide <strong>Instant Audit Finality</strong> for all participants.
            </p>
          </div>
          <div className="text-right hidden lg:block">
            <p className="text-2xl font-black text-white">{blocks.length}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Traces Sealed</p>
          </div>
        </div>

        {/* Main Vault Content */}
        {error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-2xl text-center">
            <AlertTriangle className="text-rose-500 w-8 h-8 mx-auto mb-4" />
            <p className="text-sm font-bold text-rose-500">{error}</p>
          </div>
        ) : isLoading && blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-600">
            <RefreshCw className="w-8 h-8 animate-spin mb-4 opacity-20" />
            <p className="text-xs font-bold tracking-widest uppercase">Initializing Vault Connection...</p>
          </div>
        ) : (
          <AuditVault blocks={blocks} />
        )}

      </div>
    </div>
  );
}
