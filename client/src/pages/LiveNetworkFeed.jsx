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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Institutional Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Network Throughput', value: `${(stats.tps || 5.0).toFixed(1)} TPS`, sub: 'Real-time sync', icon: Activity, color: 'text-blue-600' },
          { label: 'Clearing Latency', value: '42ms', sub: 'P99 percentile', icon: Zap, color: 'text-emerald-600' },
          { label: 'Witness Quorum', value: '3 / 3', sub: 'Nodes operational', icon: Cpu, color: 'text-slate-900' },
          { label: 'Evidence Sealed', value: (stats.total || 0).toLocaleString(), sub: 'Validated today', icon: ShieldCheck, color: 'text-slate-900' }
        ].map((stat, i) => (
          <div key={i} className="institution-card p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tighter">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Ledger Feed Table */}
      <div className="institution-card overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            Live Protocol Evidence Stream
          </h2>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setFilterMode(filterMode === 'DISPUTES' ? 'ALL' : 'DISPUTES')}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${filterMode === 'DISPUTES' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
             >
               {filterMode === 'DISPUTES' ? 'Showing Disputes' : 'Filter Disputes'}
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route (Origin → Dest)</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evidence Hash</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quorum Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredTx.map((tx) => {
                  const isDisputed = tx.event_type === 'REJECT' || tx.event_type === 'DISPUTE';
                  return (
                    <motion.tr 
                      key={tx.id} 
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-slate-50 transition-colors group ${isDisputed ? 'bg-red-50/30' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <span className="text-[11px] font-bold text-slate-500 font-mono italic">
                          {tx.event_ts ? new Date(parseInt(tx.event_ts)).toLocaleTimeString([], { hour12: false }) : 'LIVE'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                           <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-800 uppercase tracking-tighter">
                             {(tx.institution_a || '').replace('_KE', '')}
                           </span>
                           <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                           <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-800 uppercase tracking-tighter">
                             {(tx.institution_b || '').replace('_KE', '')}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[11px] font-mono font-medium text-slate-400 group-hover:text-blue-600 transition-colors">
                          {tx.tx_ref_hash ? tx.tx_ref_hash.trim().substring(0, 15) : 'N/A'}...
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          isDisputed ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isDisputed ? 'bg-red-600' : 'bg-green-600'}`}></div>
                          {isDisputed ? 'Integrity Dispute' : 'Consensus Met'}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => onNavigateToDispute(tx.tx_ref_hash)}
                          className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded border transition-all ${
                            isDisputed ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' : 'text-slate-400 border-slate-200 hover:text-slate-900 hover:border-slate-400'
                          }`}
                        >
                          {isDisputed ? 'Investigate' : 'Audit'}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredTx.length === 0 && (
            <div className="p-24 text-center">
              <Activity className="w-10 h-10 text-slate-200 mx-auto mb-4 animate-pulse" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Synchronizing Protocol Lifecycle...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
