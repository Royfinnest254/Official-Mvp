import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, LayoutDashboard, Database, RefreshCw, Lock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import QuorumStatus from './components/QuorumStatus';
import ChainVisualizer from './components/ChainVisualizer';
import ControlPanel from './components/ControlPanel';

const API_KEY = 'connex_secret_mvp_2026'; // For MVP purposes, this is fine
const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  }
});

function App() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ health: 'checking...', chainValid: true });

  const fetchChain = async () => {
    try {
      const response = await api.get('/chain');
      setBlocks(response.data.blocks);
      
      const healthRes = await api.get('/health'); // Health is public
      const verifyRes = await api.get('/chain/verify');
      
      setStats({
        health: healthRes.data.status,
        chainValid: verifyRes.data.valid,
        blockCount: response.data.blocks.length
      });
    } catch (error) {
      console.error('Failed to fetch chain:', error);
    }
  };

  useEffect(() => {
    fetchChain();
    const interval = setInterval(fetchChain, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handlePostEvent = async (payload) => {
    setLoading(true);
    try {
      await api.post('/events', payload);
      await fetchChain();
    } catch (error) {
      alert('Failed to post event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status, reason) => {
    if (blocks.length === 0) return;
    
    // For demo, we update the status of the LATEST transaction
    const latestTxId = blocks[0].tx_id;
    
    setLoading(true);
    try {
      await api.patch(`/events/${latestTxId}/status`, { status, reason });
      await fetchChain();
    } catch (error) {
      alert('Failed to update status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                 <Shield className="text-background" size={24} />
             </div>
             <div>
                <h1 className="text-xl font-black tracking-tighter">CONNEX</h1>
                <p className="text-[10px] text-slate-500 font-mono tracking-widest leading-none">EVIDENCE LAYER</p>
             </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
             <a href="#" className="flex items-center text-primary text-sm font-medium">
                <LayoutDashboard size={18} className="mr-2" />
                DASHBOARD
             </a>
             <a href="#" className="flex items-center text-slate-400 text-sm font-medium hover:text-white transition-colors">
                <Database size={18} className="mr-2" />
                EXPLORER
             </a>
             <a href="#" className="flex items-center text-slate-400 text-sm font-medium hover:text-white transition-colors">
                <Lock size={18} className="mr-2" />
                VERIFIER
             </a>
          </nav>

          <div className="flex items-center space-x-4">
             <div className={`px-3 py-1.5 rounded-full border text-[10px] font-mono flex items-center transition-colors ${
               stats.chainValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-accent/10 border-accent/20 text-accent'
             }`}>
                <Zap size={10} className="mr-1.5" />
                CHAIN {stats.chainValid ? 'VERIFIED' : 'TAMPERED'}
             </div>
             <button onClick={fetchChain} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            {/* Stats Summary */}
            <QuorumStatus blocks={blocks} />

            {/* Chain View */}
            <ChainVisualizer blocks={blocks} />
          </div>

          <div className="xl:col-span-1">
            <ControlPanel 
              onPostEvent={handlePostEvent} 
              onUpdateStatus={handleUpdateStatus}
              loading={loading}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
         <div className="container mx-auto px-6 flex flex-wrap items-center justify-between text-slate-500 text-[10px] font-mono uppercase tracking-widest gap-4">
            <div>&copy; 2026 CONNEX TECHNOLOGIES. KENYA-UGANDA CORRIDOR.</div>
            <div className="flex items-center space-x-6">
                <a href="#" className="hover:text-primary transition-colors">ISO 20022 COMPLIANT</a>
                <a href="#" className="hover:text-primary transition-colors">QUORUM VERIFIED</a>
                <a href="#" className="hover:text-primary transition-colors">SYSTEM STATUS: {stats.health}</a>
            </div>
         </div>
      </footer>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
}

export default App;
