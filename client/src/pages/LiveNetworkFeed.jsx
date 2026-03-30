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
          api.get('/tx/recent'),
          api.get('/tx/stats')
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
    const interval = setInterval(fetchRecent, 2500); // Slightly slower to be safe
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
    <div className="bg-[#f8fafc] min-h-screen pb-12 transition-colors duration-500">
      {/* Header section with Stats Bar */}
      <div className="bg-white border-b border-slate-200 py-4 md:py-6 px-4 md:px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg shadow-blue-200 shadow-lg">
                  <Activity className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                Live Network Feed
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">Real-time coordination across Bank A and Bank B</p>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
               LEDGER CONNECTED
            </div>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-[10px] md:text-xs font-mono flex items-center gap-2 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>DIAGNOSTIC: {error}</span>
            </motion.div>
          )}
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:px-5 md:py-3 transition-all hover:border-blue-200">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Events</p>
              <p className="text-lg md:text-2xl font-bold text-slate-800 tabular-nums">{(stats.total || 0).toLocaleString()}</p>
            </div>
            
            <button 
              onClick={() => setFilterMode(filterMode === 'DISPUTES' ? 'ALL' : 'DISPUTES')}
              className={`text-left rounded-xl p-3 md:px-5 md:py-3 transition-all ${
                filterMode === 'DISPUTES' 
                ? 'bg-red-50 border-2 border-red-500 ring-2 ring-red-50 shadow-md transform scale-[1.02]' 
                : 'bg-slate-50 border border-slate-200 hover:border-red-300'
              }`}
            >
              <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1 ${filterMode === 'DISPUTES' ? 'text-red-600' : 'text-slate-400'}`}>
                {filterMode === 'DISPUTES' ? 'Filtering: Disputes' : 'Total Disputes'}
              </p>
              <div className="flex items-center gap-2">
                <p className={`text-lg md:text-2xl font-bold tabular-nums ${filterMode === 'DISPUTES' ? 'text-red-700' : 'text-red-600'}`}>{stats.disputes || 0}</p>
                <AlertTriangle className={`w-3 h-3 md:w-4 md:h-4 ${filterMode === 'DISPUTES' ? 'text-red-600 animate-bounce' : 'text-red-500'}`} />
              </div>
            </button>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:px-5 md:py-3">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Throughput (TPS)</p>
              <div className="flex items-center gap-2">
                <p className="text-lg md:text-2xl font-bold text-slate-800">{(stats.tps || 5.0).toFixed(1)}</p>
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:px-5 md:py-3 group overflow-hidden">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Network Status</p>
              <div className="flex items-center text-emerald-600 font-bold text-sm md:text-lg gap-2">
                LIVE
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
          
          {/* Mobile view (< 768px) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredTx.length === 0 && (
              <div className="px-6 py-16 text-center text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No transactions matching filter.</p>
              </div>
            )}
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredTx.map((tx) => {
                  const isDisputed = tx.event_type === 'REJECT' || tx.event_type === 'DISPUTE';
                  const isNew = newIds.has(tx.id);
                  return (
                    <motion.div
                      key={tx.id}
                      initial={isNew ? { opacity: 0, x: -10, backgroundColor: 'rgba(59,130,246,0.05)' } : false}
                      animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                      exit={{ opacity: 0, x: 10 }}
                      className={`p-4 border-l-4 ${isDisputed ? 'border-l-red-500 bg-red-50/20' : 'border-l-blue-500 bg-white'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                          {tx.event_ts ? new Date(parseInt(tx.event_ts)).toLocaleTimeString() : 'LIVE'}
                        </span>
                        {isDisputed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-800 border border-red-200">
                            <ShieldAlert className="w-2.5 h-2.5 mr-1" /> DISPUTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> VERIFIED
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">{(tx.institution_a || 'BANK').replace('_KE', '')}</span>
                          <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">{(tx.institution_b || 'BANK').replace('_KE', '')}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-900 flex-shrink-0">{(tx.tx_ref_hash || '').substring(0, 8)}...</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigateToDispute(tx.tx_ref_hash)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all transform active:scale-95 ${
                            isDisputed ? 'bg-red-600 text-white shadow-red-100 shadow-md' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isDisputed ? 'Resolve Dispute' : 'View Proof'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>

          {/* Desktop Table view (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-4">Timestamp</th>
                  <th className="px-5 py-4">Transaction Flow</th>
                  <th className="px-5 py-4">Customer TX ID</th>
                  <th className="px-5 py-4">Connex Chain Hash</th>
                  <th className="px-5 py-4 text-center">Consensus</th>
                  <th className="px-5 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTx.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-slate-400">
                      <Clock className="w-10 h-10 mx-auto mb-4 text-slate-200" />
                      <p className="text-lg font-medium text-slate-300">Synchronizing with ledger...</p>
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
                        initial={isNew ? { opacity: 0, y: -10, backgroundColor: isDisputed ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.05)' } : false}
                        animate={{ opacity: 1, y: 0, backgroundColor: isDisputed ? 'rgba(239,68,68,0.02)' : 'transparent' }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className={`hover:bg-slate-50/50 transition-colors group ${isDisputed ? 'bg-red-50/30' : ''}`}
                      >
                        <td className="px-5 py-4 whitespace-nowrap text-slate-400 font-mono text-xs font-bold">
                          {tx.event_ts ? new Date(parseInt(tx.event_ts)).toLocaleTimeString() : '...'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-700 px-2 py-0.5 rounded text-xs font-bold transition-colors">{(tx.institution_a || '').replace('_KE', '')}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                            <span className="bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-700 px-2 py-0.5 rounded text-xs font-bold transition-colors">{(tx.institution_b || '').replace('_KE', '')}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900 font-mono text-sm tracking-tight">
                          {tx.tx_ref_hash ? tx.tx_ref_hash.trim() : 'N/A'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-mono text-[10px] text-slate-400">
                          {tx.chain_hash ? tx.chain_hash.substring(0, 16) + '...' : 'PENDING'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          {isDisputed ? (
                            <motion.span
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200"
                            >
                              <ShieldAlert className="w-3 h-3 mr-1" /> DISPUTED
                            </motion.span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> VERIFIED
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => onNavigateToDispute(tx.tx_ref_hash)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all transform active:scale-95 ${
                              isDisputed 
                                ? 'text-white bg-red-600 hover:bg-red-700 shadow-sm' 
                                : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {isDisputed ? 'Resolve Dispute' : 'View Proof'}
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
