import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowRight, ShieldCheck, Zap, Cpu, Search, Filter, RefreshCw, ChevronRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// API key is sourced from the build-time environment — never hardcode secrets in source.
const API_KEY = import.meta.env.VITE_API_KEY;
const API_BASE_URL = window.location.hostname === 'localhost'
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3000')
  : window.location.origin;

// Supabase Realtime Client — uses the PUBLIC anon key (respects RLS).
// The service role key must NEVER be used in frontend code.
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  }
});

export default function LiveNetworkFeed({ onNavigateToDispute }) {
  const [recentTx, setRecentTx] = useState([]);
  const [stats, setStats] = useState({ total: 0, disputes: 0, tps: 0, latency: 42 });
  const [newIds, setNewIds] = useState(new Set());
  const [filterMode, setFilterMode] = useState('ALL'); 
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const fetchRecent = async () => {
      try {
        const [recentRes, statsRes] = await Promise.all([
          api.get(`/tx/recent?_t=${Date.now()}`),
          api.get(`/tx/stats?_t=${Date.now()}`)
        ]);
        
        if (!isMounted.current) return;
        setStats(statsRes.data || { total: 0, disputes: 0, tps: 0, latency: 42 });
        setRecentTx(recentRes.data?.events || []);
      } catch (err) {
        if (isMounted.current) setError(err.message);
      }
    };
    
    fetchRecent();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'coordination_records' }, (payload) => {
        if (!isMounted.current) return;
        const newRecord = payload.new;
        setStats(prev => ({ ...prev, total: prev.total + 1, latency: newRecord.latency_ms || prev.latency }));
        setRecentTx(prev => [newRecord, ...prev].slice(0, 50));
        setNewIds(new Set([newRecord.id]));
        setTimeout(() => { if (isMounted.current) setNewIds(new Set()); }, 2000);
      })
      .subscribe();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchRecent();
    }, 5000);

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const filteredTx = recentTx.filter(tx => (filterMode === 'ALL' || tx.event_type === 'REJECT'));

  return (
    <div className="space-y-6">
      {/* Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Network Throughput', value: `${stats.tps.toFixed(1)} TPS`, icon: Activity, color: 'text-accent' },
          { label: 'Clearing Latency', value: `${stats.latency}ms`, icon: Zap, color: 'text-success' },
          { label: 'Witness Quorum', value: '3 / 3', icon: Cpu, color: 'text-secondary' },
          { label: 'Evidence Sealed', value: stats.total.toLocaleString(), icon: ShieldCheck, color: 'text-secondary' }
        ].map((stat, i) => (
          <div key={i} className="aws-portal-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="aws-portal-card overflow-hidden">
        <div className="px-6 py-4 bg-[#f2f3f3] border-b border-[#eaeded] flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-secondary" />
            Live Protocol Evidence Stream
          </h2>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setFilterMode(filterMode === 'DISPUTES' ? 'ALL' : 'DISPUTES')}
                className={`px-3 py-1.5 rounded-[2px] text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filterMode === 'DISPUTES' ? 'bg-danger text-white' : 'bg-white border border-[#eaeded] text-secondary hover:bg-slate-50'
                }`}
             >
               {filterMode === 'DISPUTES' ? 'Showing Disputes' : 'Filter Disputes'}
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#eaeded]">
                <th className="px-6 py-3 text-[11px] font-bold text-secondary uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-[11px] font-bold text-secondary uppercase tracking-wider">Protocol Route</th>
                <th className="px-6 py-3 text-[11px] font-bold text-secondary uppercase tracking-wider">Evidence Bundle</th>
                <th className="px-6 py-3 text-[11px] font-bold text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[11px] font-bold text-secondary uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeded]">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredTx.map((tx) => {
                  const isDisputed = tx.event_type === 'REJECT';
                  return (
                    <motion.tr 
                      key={tx.id} 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-[#f1faff] transition-colors group ${isDisputed ? 'bg-red-50/50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[11px] font-mono text-secondary">
                          {new Date(parseInt(tx.event_ts)).toLocaleTimeString([], { hour12: false })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight">
                           <span className="px-2 py-0.5 bg-white border border-[#eaeded] rounded-[2px]">{tx.institution_a.split('_')[0]}</span>
                           <ArrowRight className="w-3 h-3 text-slate-300" />
                           <span className="px-2 py-0.5 bg-white border border-[#eaeded] rounded-[2px]">{tx.institution_b.split('_')[0]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[11px] font-mono text-accent">
                          {tx.bundle_id}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-widest ${
                          isDisputed ? 'bg-danger text-white' : 'bg-success text-white'
                        }`}>
                          {isDisputed ? 'Integrity Dispute' : 'Consensus Met'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onNavigateToDispute(tx.tx_ref_hash)}
                          className="text-accent text-[11px] font-bold hover:underline transition-all"
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
            <div className="p-20 text-center">
              <RefreshCw className="w-8 h-8 text-accent mx-auto mb-4 animate-spin" />
              <p className="text-xs font-bold text-secondary uppercase tracking-widest">Synchronizing Protocol Lifecycle...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
