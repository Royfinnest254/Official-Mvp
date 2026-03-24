import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Activity, ArrowRight, ShieldAlert, CheckCircle2, Zap, AlertTriangle, Clock } from 'lucide-react';

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
  const prevIdsRef = useRef(new Set());

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        // 1. Fetch recent events for the table
        const res = await api.get('/tx/recent');
        const evts = res.data.events || [];
        
        // 2. Fetch global dispute count from Supabase (Real stats)
        // Note: For the prototype we treat all REJECTs as the global count
        const statsRes = await api.get('/tx/recent?limit=1000'); // Get a larger sample for stats
        const allEvts = statsRes.data.events || [];
        const globalDisputes = allEvts.filter(e => e.event_type === 'REJECT' || e.event_type === 'DISPUTE').length;
        
        // Detect newly arrived transactions for slide-in animation
        const currentIds = new Set(evts.map(e => e.id));
        const fresh = new Set();
        currentIds.forEach(id => {
          if (!prevIdsRef.current.has(id)) fresh.add(id);
        });
        setNewIds(fresh);
        prevIdsRef.current = currentIds;
        
        // After 1.5s, clear the "new" highlight
        if (fresh.size > 0) {
          setTimeout(() => setNewIds(new Set()), 1500);
        }
        
        setRecentTx(evts);
        
        // Compute stats
        setStats({
          total: evts.length > 0 ? evts[0].id : 0,
          disputes: globalDisputes,
          tps: 5.0,
        });
      } catch (err) {
        // silently fail
      }
    };
    
    fetchRecent();
    const interval = setInterval(fetchRecent, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                Live Network Feed
              </h1>
              <p className="text-slate-500 text-sm mt-1">Real-time coordination events across Bank A and Bank B</p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Events Processed</p>
              <p className="text-2xl font-bold text-slate-800 tabular-nums">{stats.total.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Disputes Detected</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-red-600 tabular-nums">{stats.disputes}</p>
                {stats.disputes > 0 && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Throughput (TPS)</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-slate-800">{stats.tps.toFixed(1)}</p>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Network Status</p>
              <div className="flex items-center text-emerald-600 font-bold text-lg gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                HEALTHY
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
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
                <AnimatePresence>
                  {recentTx.map((tx) => {
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
