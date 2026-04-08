import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuditVault from '../components/AuditVault';
import { Database, ShieldCheck, RefreshCw, AlertTriangle, FileText, Download, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : window.location.origin;

const API_KEY = 'connex_secret_mvp_2026';

export default function AuditVaultPage() {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Forensic Walk State
  const [verifyingId, setVerifyingId] = useState(null);
  const [verifiedIds, setVerifiedIds] = useState(new Set());
  const [failedIds, setFailedIds] = useState(new Set());
  const [report, setReport] = useState(null);

  const fetchVault = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/vault?_t=${Date.now()}`, {
        headers: { 'x-api-key': API_KEY }
      });
      // AWS Standard: Sort by ID descending (Latest first)
      const sortedBlocks = res.data.blocks.sort((a, b) => b.id - a.id);
      setBlocks(sortedBlocks);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch vault:', err);
      setError('Unable to sync with Evidence Vault. Check API connection.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * INNOVATION: The Forensic Walk
   * Sequentially verifies blocks from oldest to newest for the user to "see" the math.
   */
  const runForensicWalk = async () => {
    setIsVerifying(true);
    setVerifiedIds(new Set());
    setFailedIds(new Set());
    setReport(null);

    try {
      // 1. Get the authoritative forensic report from the backend
      const res = await axios.get(`${API_BASE}/vault/verify?_t=${Date.now()}`, {
        headers: { 'x-api-key': API_KEY }
      });
      const data = res.data;

      // 2. Simulate the sequential walk (Oldest to Newest)
      const walkSequence = [...blocks].sort((a, b) => a.id - b.id);
      
      for (const block of walkSequence) {
        setVerifyingId(block.id);
        
        // Wait 250ms for visual "auditing" effect
        await new Promise(r => setTimeout(r, 250));

        const failure = data.failures.find(f => f.id === block.id);
        if (failure) {
          setFailedIds(prev => new Set([...prev, block.id]));
          // If a failure is found, we might want to stop or continue
        } else {
          setVerifiedIds(prev => new Set([...prev, block.id]));
        }
      }

      setReport(data);
      setVerifyingId(null);
    } catch (err) {
      console.error('Forensic walk failed:', err);
      setError('Internal Audit Engine Error');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    fetchVault();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isVerifying) {
        fetchVault();
      }
    }, 15000); 
    return () => clearInterval(interval);
  }, [isVerifying]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Evidence Vault</h1>
           <p className="text-xs text-secondary font-medium">Manage and verify cryptographically sealed protocol records.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={runForensicWalk}
             disabled={isVerifying}
             className="aws-button-primary flex items-center gap-2"
           >
             {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
             {isVerifying ? 'Running Forensic Walk...' : 'Run Forensic Integrity Walk'}
           </button>
           <button className="px-4 py-2 bg-white border border-[#eaeded] rounded-[2px] text-xs font-bold hover:bg-[#f2f3f3] transition-colors flex items-center gap-2">
              <Download className="w-3.5 h-3.5" />
              Export Records
           </button>
        </div>
      </div>

      {/* Forensic Report Summary */}
      <AnimatePresence>
        {report && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`aws-portal-card border-l-4 p-6 ${report.valid ? 'border-l-success' : 'border-l-danger'}`}
          >
            <div className="flex items-start gap-4">
               <div className={`p-2 rounded-full ${report.valid ? 'bg-green-100' : 'bg-red-100'}`}>
                  {report.valid ? <ShieldCheck className="text-success" size={20} /> : <AlertTriangle className="text-danger" size={20} />}
               </div>
               <div className="flex-grow">
                  <h3 className="text-sm font-bold uppercase tracking-tight mb-1">
                    {report.valid ? 'Forensic Consensus Verified' : 'Integrity Breach Detected'}
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed">
                    {report.valid 
                      ? `Global chain integrity score: ${report.integrityScore}%. All ${report.blocksChecked} records match their cryptographic fingerprints and parent linkages.`
                      : `Critical Alert: ${report.failures.length} records failed mathematical validation. The chain of custody has been compromised.`
                    }
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-black tabular-nums">{report.integrityScore}%</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Integrity Score</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vault Statistics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
         {[
           { label: 'Total Vaulted Records', value: blocks.length, icon: Database, color: 'text-accent' },
           { label: 'Quorum Participants', value: '3 Nodes', icon: FileText, color: 'text-secondary' },
           { label: 'Compliance Level', value: 'ISO 20022', icon: ShieldCheck, color: 'text-success' }
         ].map((stat, i) => (
           <div key={i} className="aws-portal-card p-5 flex items-center gap-4">
              <div className="p-3 bg-[#f2f3f3] rounded-[2px]">
                 <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">{stat.label}</p>
                 <p className="text-lg font-bold">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Search and Filters */}
      <div className="aws-portal-card p-4 flex flex-wrap items-center gap-4 bg-white">
          <div className="relative flex-grow max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Find resource by Bundle ID..."
              className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-[#eaeded] rounded-[2px] focus:ring-1 focus:ring-accent outline-none"
            />
          </div>
          <button className="px-3 py-2 bg-white border border-[#eaeded] rounded-[2px] text-xs font-medium hover:bg-[#f2f3f3] flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            Clear Filters
          </button>
          <div className="ml-auto flex items-center gap-2">
             <span className="text-[10px] font-bold text-secondary uppercase">Page 1 of 1</span>
          </div>
      </div>

      {/* Main Vault Feed */}
      {error ? (
        <div className="aws-portal-card p-20 text-center border-red-100 bg-red-50/30">
          <AlertTriangle className="text-danger w-8 h-8 mx-auto mb-4" />
          <p className="text-xs font-bold text-danger uppercase tracking-widest">{error}</p>
        </div>
      ) : isLoading && blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-4 text-accent" />
          <p className="text-[10px] font-bold tracking-widest uppercase">Consulting Witness Ledger...</p>
        </div>
      ) : (
        <AuditVault 
          blocks={blocks} 
          verifyingId={verifyingId}
          verifiedIds={verifiedIds}
          failedIds={failedIds}
        />
      )}
      
    </div>
  );
}
