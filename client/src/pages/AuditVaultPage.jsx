import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuditVault from '../components/AuditVault';
import { Database, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : window.location.origin;

export default function AuditVaultPage() {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [integrityReport, setIntegrityReport] = useState(null);

  const fetchVault = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/vault?_t=${Date.now()}`, {
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
      const res = await axios.get(`${API_BASE}/vault/verify?_t=${Date.now()}`, {
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
    const interval = setInterval(() => {
      // Only fetch if the tab is visible — saves Supabase credits
      if (document.visibilityState === 'visible') {
        fetchVault();
      }
    }, 60000); // Every 60 seconds instead of every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        
        {/* Institutional Vault Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-slate-900 rounded-lg shadow-lg">
                <Database className="text-white w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">
                Audit Vault
              </h1>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
              ISO 20022 Cryptographic Preservation Layer
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={verifyIntegrity}
              disabled={isVerifying}
              className="px-6 py-3 bg-white border border-slate-200 hover:border-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 shadow-sm active:scale-95"
            >
              {isVerifying ? (
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <ShieldCheck className={`w-4 h-4 ${integrityReport?.valid ? 'text-green-600' : 'text-slate-400'}`} />
              )}
              {integrityReport ? (integrityReport.valid ? 'Integrity Verified' : 'Integrity Failed') : 'Verify Vault Integrity'}
            </button>

            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

            <div className="px-5 py-3 bg-green-50 border border-green-100 rounded-xl shadow-sm">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest leading-none">Global Sync Active</span>
               </div>
            </div>
          </div>
        </div>

        {/* Protocol Context Feature Card */}
        <div className="institution-card p-10 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
            <Database size={160} className="text-slate-900" />
          </div>
          
          <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
            <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 flex-shrink-0">
               <ShieldCheck className="text-slate-900 w-8 h-8" />
            </div>
            <div className="flex-grow text-center lg:text-left">
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-3">Autonomous Evidence Preservation</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                The Connex Audit Vault captures and seals high-fidelity transaction metadata traditionally lost in legacy banking hops. 
                By preserving a cryptographically signed hash of the multi-institutional payload, we establish <strong>mathematical finality</strong> for every participant in the network.
              </p>
            </div>
            <div className="text-center lg:text-right px-8 py-4 border-l border-slate-100 hidden lg:block">
              <p className="text-5xl font-bold text-slate-900 tracking-tighter tabular-nums">{blocks.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Vaulted Records</p>
            </div>
          </div>
        </div>

        {/* Vault Data Feed */}
        {error ? (
          <div className="bg-red-50 border border-red-100 p-12 rounded-2xl text-center">
            <AlertTriangle className="text-red-600 w-12 h-12 mx-auto mb-6" />
            <p className="text-sm font-bold text-red-700 uppercase tracking-widest">{error}</p>
          </div>
        ) : isLoading && blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <RefreshCw className="w-10 h-10 animate-spin mb-6 text-blue-600" />
            <p className="text-[10px] font-bold tracking-widest uppercase">Consulting Witness Ledger...</p>
          </div>
        ) : (
          <div className="relative">
            <AuditVault blocks={blocks} />
          </div>
        )}

      </div>
    </div>
  );
}
