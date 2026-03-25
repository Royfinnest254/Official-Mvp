import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowRight, ShieldAlert, CheckCircle2, Zap, AlertTriangle, Clock } from 'lucide-react';

const API_KEY = 'connex_secret_mvp_2026';
const API_BASE_URL = 'https://official-mvp.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  }
});

export default function LiveNetworkFeed({ onNavigateToDispute }) {
  const [recentTx, setRecentTx] = useState([]);
  const [stats, setStats] = useState({ total: 0, disputes: 0, tps: 5.0 });
  const [newIds, setNewIds] = useState(new Set());
  const [filterMode, setFilterMode] = useState('ALL'); 
  const [error, setError] = useState(null);
  const prevIdsRef = useRef(new Set());

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/tx/recent');
        const evts = res.data.events || [];
        const statsRes = await api.get('/tx/stats');
        const globalStats = statsRes.data;
        
        const currentIds = new Set(evts.map(e => e.id));
        const fresh = new Set();
        currentIds.forEach(id => {
          if (!prevIdsRef.current.has(id)) fresh.add(id);
        });
        setNewIds(fresh);
        prevIdsRef.current = currentIds;
        
        if (fresh.size > 0) {
          setTimeout(() => setNewIds(new Set()), 1500);
        }
        
        setRecentTx(evts);
        setStats({
          total: globalStats.total,
          disputes: globalStats.disputes,
          tps: globalStats.tps || 5.0,
        });
        setError(null);
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError(err.message || "Failed to reach Connex API");
      }
    };
    
    fetchRecent();
    const interval = setInterval(fetchRecent, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-4 md:py-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                Live Network Feed
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1">Real-time coordination across Bank A and Bank B</p>
            </div>
          </div>
          
          {error && (
            <div className="mt-2 mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-[10px] md:text-xs font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>DIAGNOSTIC: {error}</span>
            </div>
          )}
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 md:px-5 md:py-3">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Events</p>
              <p className="text-lg md:text-2xl font-bold text-slate-800 tabular-nums">{stats.total.toLocaleString()}</p>
            </div>
            <button 
              onClick={() => setFilterMode(filterMode === 'DISPUTES' ? 'ALL' : 'DISPUTES')}
              className={`text-left rounded-lg p-3 md:px-5 md:py-3 transition-all ${
                filterMode === 'DISPUTES' 
                ? 'bg-red-50 border-2 border-red-500 ring-2 ring-red-50 shadow-sm' 
                : 'bg-slate-50 border border-slate-200 hover:border-red-300'
              }`}
            >
              <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1 ${filterMode === 'DISPUTES' ? 'text-red-600' : 'text-slate-400'}`}>
                {filterMode === 'DISPUTES' ? 'Filtering: Disputes' : 'Total Disputes'}
              </p>
              <div className="flex items-center gap-2">
                <p className={`text-lg md:text-2xl font-bold tabular-nums ${filterMode === 'DISPUTES' ? 'text-red-700' : 'text-red-600'}`}>{stats.disputes}</p>
                <AlertTriangle className={`w-3 h-3 md:w-4 md:h-4 ${filterMode === 'DISPUTES' ? 'text-red-600 animate-bounce' : 'text-red-500 animate-pulse'}`} />
              </div>
            </button>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 md:px-5 md:py-3">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Throughput (TPS)</p>
              <div className="flex items-center gap-2">
                <p className="text-lg md:text-2xl font-bold text-slate-800">{stats.tps.toFixed(1)}</p>
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 md:px-5 md:py-3">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Network Status</p>
              <div className="flex items-center text-emerald-600 font-bold text-sm md:text-lg gap-2">
                <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-emerald-500"></span>
                </span>
                LIVE
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="md:hidden divide-y divide-slate-100">
            {recentTx.length === 0 && (
              <div className="px-6 py-16 text-center text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                Waiting for traffic...
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {recentTx
                .filter(tx => filterMode === 'ALL' || tx.event_type === 'REJECT' || tx.event_type === 'DISPUTE')
                .map((tx) => {
                  const isDisputed = tx.event_type === 'REJECT' || tx.event_type === 'DISPUTE';
                  const isNew = newIds.has(tx.id);
                  return (
                    <motion.div
                      key={tx.id}
                      initial={isNew ? { opacity: 0, x: -10 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 ${isDisputed ? 'bg-red-50/50' : 'bg-white'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(parseInt(tx.event_ts)).toLocaleTimeString()}
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
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{tx.institution_a.replace('_KE', '')}</span>
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{tx.institution_b.replace('_KE', '')}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-900">{tx.tx_ref_hash.substring(0, 12)}...</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigateToDispute(tx.tx_ref_hash)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                            isDisputed ? 'bg-red-600 text-white active:bg-red-700' : 'bg-slate-100 text-slate-600 active:bg-slate-200'
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

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Transaction Flow</th>
                  <th className="px-5 py-3.5">Customer TX ID</th>
                  <th className="px-5 py-3.5">Connex Chain Hash</th>
                  <th className="px-5 py-3.5 text-center">Consensus</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTx.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                      <Clock className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                      Waiting for live network traffic...
                    </td>
                  </tr>
                )}
                <AnimatePresence mode="popLayout">
                  {recentTx
                    .filter(tx => filterMode === 'ALL' || tx.event_type === 'REJECT' || tx.event_type === 'DISPUTE')
                    .map((tx) => {
                    const isDisputed = tx.event_type === 'REJECT' || tx.event_type === 'DISPUTE';
                    const isNew = newIds.has(tx.id);
                    return (
                      <motion.tr
                        key={tx.id}
                        initial={isNew ? { opacity: 0, y: -20, backgroundColor: isDisputed ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.08)' } : false}
                        animate={{ opacity: 1, y: 0, backgroundColor: isDisputed && isNew ? 'rgba(239,68,68,0.06)' : 'transparent' }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={`hover:bg-slate-50/80 transition-colors ${isDisputed ? 'bg-red-50/40' : ''}`}
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 font-mono text-xs">
                          {new Date(parseInt(tx.event_ts)).toLocaleTimeString()}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">{tx.institution_a.replace('_KE', '')}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">{tx.institution_b.replace('_KE', '')}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900 font-mono text-sm">
                          {tx.tx_ref_hash}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-slate-400">
                          {tx.chain_hash ? tx.chain_hash.substring(0, 16) + '...' : '—'}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          {isDisputed ? (
                            <motion.span
                              initial={isNew ? { scale: 1.3 } : false}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3, type: 'spring' }}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200"
                            >
                              <ShieldAlert className="w-3 h-3 mr-1" /> DISPUTED
                            </motion.span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> VERIFIED
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          {isDisputed ? (
                            <motion.button
                              initial={isNew ? { scale: 0.8 } : false}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
                              onClick={() => onNavigateToDispute(tx.tx_ref_hash)}
                              className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md shadow-sm transition-colors"
                            >
                              Resolve Dispute
                            </motion.button>
                          ) : (
                            <button
                              onClick={() => onNavigateToDispute(tx.tx_ref_hash)}
                              className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              View proof
                            </button>
                          )}
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
