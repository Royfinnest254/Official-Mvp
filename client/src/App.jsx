import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Database, RefreshCw, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import QuorumValidator from './components/QuorumValidator';
import AuditVault from './components/AuditVault';
import ObservationTrigger from './components/ObservationTrigger';
import NetworkVisual from './components/NetworkVisual';
import logo from './assets/logo.svg';

const API_KEY = 'connex_secret_mvp_2026';
const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  }
});

function App() {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ health: 'checking...', vaultSecure: true });
  const [appError, setAppError] = useState(null);

  const syncVault = async () => {
    try {
      const response = await api.get('/vault');
      setEvidence(response.data.blocks);
      
      const healthRes = await api.get('/health');
      const verifyRes = await api.get('/vault/verify');
      
      setStats({
        health: healthRes.data.status,
        vaultSecure: verifyRes.data.valid,
        traceCount: response.data.blocks?.length || 0
      });
    } catch (error) {
      console.error('Failed to sync vault:', error);
      setAppError('Vault sync failed: Connection to nodes lost.');
      setStats(prev => ({ ...prev, health: 'OFFLINE', vaultSecure: false }));
    }
  };

  useEffect(() => {
    syncVault();
    const interval = setInterval(syncVault, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCaptureObservation = async (payload) => {
    setLoading(true);
    try {
      await api.post('/observations', payload);
      await syncVault();
    } catch (error) {
      setAppError('Failed to capture observation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFlagDiscrepancy = async (status, reason) => {
    if (evidence.length === 0) return;
    const latestTraceId = evidence[0].tx_id;
    setLoading(true);
    try {
      await api.patch(`/observations/${latestTraceId}/status`, { status, reason });
      await syncVault();
    } catch (error) {
      setAppError('Failed to flag discrepancy: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-300 antialiased font-sans">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#11141d] sticky top-0 z-50">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <img src={logo} alt="Connex" className="w-6 h-6" />
             <div className="flex items-baseline space-x-2">
                <span className="text-sm font-bold text-white">Connex Observer</span>
                <span className="text-[10px] text-slate-600 font-medium">Digital CCTV Layer</span>
             </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-[13px] font-medium">
             <a href="#" className="text-blue-500">Monitoring</a>
             <a href="#" className="text-slate-400 hover:text-white transition-colors">Evidence Ledger</a>
             <a href="#" className="text-slate-400 hover:text-white transition-colors">Network Health</a>
             <a href="#" className="text-slate-400 hover:text-white transition-colors">Audit Logs</a>
          </nav>

          <div className="flex items-center space-x-4">
             <div className="flex items-center text-[11px] font-medium">
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${stats.vaultSecure ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                <span className={stats.vaultSecure ? 'text-emerald-500' : 'text-rose-500'}>
                   {stats.vaultSecure ? 'Vault Secured' : 'Vault Compromised'}
                </span>
             </div>
             <button onClick={syncVault} className="p-1.5 text-slate-500 hover:text-white transition-colors">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-8 space-y-8">
        <AnimatePresence>
          {appError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-md text-sm flex justify-between items-center"
            >
              <span>{appError}</span>
              <button onClick={() => setAppError(null)} className="text-rose-500 hover:text-white">&times;</button>
            </motion.div>
          )}
        </AnimatePresence>

        <NetworkVisual />
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-8">
            <QuorumValidator blocks={evidence} />
            <AuditVault blocks={evidence} />
          </div>

          <div className="xl:col-span-1">
            <ObservationTrigger 
              onPostEvent={handleCaptureObservation} 
              onUpdateStatus={handleFlagDiscrepancy}
              loading={loading}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 bg-[#0b0e14]">
         <div className="container mx-auto px-6 flex flex-wrap items-center justify-between text-slate-600 text-[11px] font-medium gap-4">
            <div>&copy; 2026 Connex Technologies. Built for Kenya-Uganda Financial Corridor.</div>
            <div className="flex items-center space-x-6 text-slate-500">
                <span>Compliance: ISO 20022</span>
                <span>System Status: {stats.health}</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

export default App;
