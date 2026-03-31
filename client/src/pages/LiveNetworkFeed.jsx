import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowRight, ShieldAlert, CheckCircle2, Zap, AlertTriangle, Clock } from 'lucide-react';

const API_KEY = 'connex_secret_mvp_2026';
const API_BASE_URL = 'https://official-mvp-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  }
});

export default function LiveNetworkFeed({ onNavigateToDispute }) {
  const [recentTx, setRecentTx] = useState([]);
  const [stats, setStats] = useState({ total: 0, disputes: 0, tps: 5.1 });
  const [newIds, setNewIds] = useState(new Set());
  const [filterMode, setFilterMode] = useState('ALL'); 
  const [error, setError] = useState(null);
  const prevIdsRef = useRef(new Set());

  // Use a ref to track component mount status to prevent updates on unmounted component
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const fetchRecent = async () => {
      try {
        console.log("Fetching live feed...");
        const [recentRes, statsRes] = await Promise.all([
          api.get(`/tx/recent?_t=${Date.now()}`),
          api.get(`/tx/stats?_t=${Date.now()}`)
        ]);
        
        if (!isMounted.current) return;

        const evts = recentRes.data?.events || [];
        const globalStats = statsRes.data || { total: 0, disputes: 0, tps: 5.0 };
        
        // Update Stats first
        setStats({
          total: globalStats.total || 0,
          disputes: globalStats.disputes || 0,
          tps: globalStats.tps || 5.0
        });

        // Detect new arrivals for highlights
        if (evts.length > 0) {
          const currentIds = new Set(evts.map(e => e.id));
          const fresh = new Set();
          currentIds.forEach(id => {
            if (prevIdsRef.current && !prevIdsRef.current.has(id)) fresh.add(id);
          });
          
          if (fresh.size > 0) {
            setNewIds(fresh);
            // Auto-clear highlight after delay
            setTimeout(() => {
              if (isMounted.current) setNewIds(new Set());
            }, 1800);
          }
          prevIdsRef.current = currentIds;
        }
        
        setRecentTx(evts);
        setError(null);
      } catch (err) {
        console.error("Dashboard API Error:", err);
        if (isMounted.current) {
          setError(err.message || "Failed to sync with Connex Ledger");
        }
      }
    };
    
    fetchRecent();
    const interval = setInterval(() => {
      // Only fetch if the tab is visible — saves Supabase credits
      if (document.visibilityState === 'visible') {
        fetchRecent();
      }
    }, 30000); // Every 30 seconds instead of every 2.5s
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  // Filter logic
  const filteredTx = recentTx.filter(tx => {
    if (filterMode === 'ALL') return true;
    return tx.event_type === 'REJECT' || tx.event_type === 'DISPUTE';
  });

  return (
    <div className="bg-background min-h-screen pb-20 transition-colors duration-700">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 relative z-10">
        {/* Header and Stats */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-glow-blue">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Live Network</h1>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Real-time coordination across global nodes</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow lg:max-w-4xl">
             <motion.div whileHover={{ y: -2 }} className="glass-panel p-5 rounded-2xl glow-border">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Packets</p>
               <p className="text-2xl font-black text-white tabular-nums">{(stats.total || 0).toLocaleString()}</p>
             </motion.div>
             
             <motion.button 
               whileHover={{ y: -2, scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => setFilterMode(filterMode === 'DISPUTES' ? 'ALL' : 'DISPUTES')}
               className={`p-5 rounded-2xl border transition-all text-left ${filterMode === 'DISPUTES' ? 'bg-danger/10 border-danger/40 ring-1 ring-danger/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'glass-panel glow-border'}`}
             >
               <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${filterMode === 'DISPUTES' ? 'text-danger' : 'text-slate-500'}`}>Disputes</p>
               <div className="flex items-center justify-between">
                 <p className={`text-2xl font-black tabular-nums ${filterMode === 'DISPUTES' ? 'text-danger' : 'text-white'}`}>{stats.disputes || 0}</p>
                 <AlertTriangle className={`w-4 h-4 ${filterMode === 'DISPUTES' ? 'text-danger animate-pulse' : 'text-slate-600'}`} />
               </div>
             </motion.button>

             <div className="glass-panel p-5 rounded-2xl glow-border">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Throughput</p>
               <div className="flex items-center gap-2">
                 <p className="text-2xl font-black text-white">{(stats.tps || 5.0).toFixed(1)}</p>
                 <span className="text-[10px] font-black text-primary/60">TPS</span>
               </div>
             </div>

             <div className="glass-panel p-5 rounded-2xl glow-border relative overflow-hidden group">
               <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Node Status</p>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-success shadow-glow-emerald animate-pulse"></div>
                 <span className="text-sm font-black text-success uppercase tracking-tighter">Operational</span>
               </div>
             </div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl flex items-center gap-4 text-xs font-bold uppercase tracking-widest"
          >
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>Diagnostic Alert: {error}</span>
          </motion.div>
        )}

        {/* Ledger Feed Table */}
        <div className="glass-panel rounded-3xl glow-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] border-b border-white/5">
                <tr>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5">Institution Flow</th>
                  <th className="px-8 py-5">Evidence Hash</th>
                  <th className="px-8 py-5 text-center">Consensus</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredTx.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Zap className="w-10 h-10 text-primary animate-pulse" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing with Connex Ledger...</p>
                      </div>
                    </td>
                  </tr>
                )}
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredTx.map((tx) => {
                    const isDisputed = tx.event_type === 'REJECT' || tx.event_type === 'DISPUTE';
                    const isNew = newIds.has(tx.id);
                    return (
                      <motion.tr
                        key={tx.id}
                        layout
                        initial={isNew ? { opacity: 0, scale: 0.98, backgroundColor: 'rgba(56, 189, 248, 0.05)' } : false}
                        animate={{ opacity: 1, scale: 1, backgroundColor: 'transparent' }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`group hover:bg-white/[0.02] transition-colors ${isDisputed ? 'bg-danger/[0.02]' : ''}`}
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-[11px] font-mono font-black text-slate-500">
                             {tx.event_ts ? new Date(parseInt(tx.event_ts)).toLocaleTimeString([], { hour12: false }) : 'LIVE'}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-surface-elevated rounded-lg border border-white/5 text-[11px] font-black text-white uppercase tracking-tighter transition-all group-hover:border-primary/30">
                              {(tx.institution_a || '').replace('_KE', '')}
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" />
                            <span className="px-3 py-1 bg-surface-elevated rounded-lg border border-white/5 text-[11px] font-black text-white uppercase tracking-tighter transition-all group-hover:border-primary/30">
                              {(tx.institution_b || '').replace('_KE', '')}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-primary/70 transition-colors">
                            {tx.tx_ref_hash ? tx.tx_ref_hash.trim().substring(0, 12) : 'N/A'}...
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            {isDisputed ? (
                              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-danger/10 border border-danger/30 text-[10px] font-black text-danger uppercase tracking-tighter shadow-glow-emerald">
                                <ShieldAlert className="w-3 h-3" /> Failed
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-[10px] font-black text-success uppercase tracking-tighter shadow-glow-emerald">
                                <CheckCircle2 className="w-3 h-3" /> Validated
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right text-xs">
                          <button
                            onClick={() => onNavigateToDispute(tx.tx_ref_hash)}
                            className={`font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95 ${
                              isDisputed 
                                ? 'bg-danger text-white hover:bg-danger/80 shadow-lg shadow-danger/20' 
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {isDisputed ? 'Investigate' : 'Verify'}
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
