import React, { useState } from 'react';
import { Send, AlertTriangle, RefreshCw, PlusCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ControlPanel = ({ onPostEvent, onUpdateStatus, loading }) => {
  const [txId, setTxId] = useState(`TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  const [amount, setAmount] = useState(50000);
  const [currency, setCurrency] = useState('KES');
  const [fromBank, setFromBank] = useState('KCB_KE');
  const [toBank, setToBank] = useState('STANBIC_UG');

  const handleSubmit = (e) => {
    e.preventDefault();
    onPostEvent({ txId, amount: Number(amount), currency, fromBank, toBank, status: 'PENDING' });
    // Reset TX ID for next one
    setTxId(`TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  };

  return (
    <div className="space-y-6 sticky top-8">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card p-6 border-primary/20 bg-primary/5"
      >
        <h3 className="text-lg font-bold flex items-center mb-6">
          <Send className="mr-2 text-primary" size={20} />
          RECORD COORDINATION
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest">TRANSACTION ID</label>
            <input 
              type="text" 
              value={txId} 
              onChange={(e) => setTxId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">AMOUNT</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">CURRENCY</label>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white focus:outline-none"
              >
                <option value="KES">KES</option>
                <option value="UGX">UGX</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">FROM BANK</label>
              <input 
                value={fromBank} 
                onChange={(e) => setFromBank(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">TO BANK</label>
              <input 
                value={toBank} 
                onChange={(e) => setToBank(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center py-3 bg-primary text-background font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin mr-2" size={20} /> : <PlusCircle className="mr-2" size={20} />}
            COMMIT TO CHAIN
          </button>
        </form>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 border-accent/20 bg-accent/5"
      >
        <h3 className="text-lg font-bold flex items-center mb-6 text-accent">
          <AlertTriangle className="mr-2" size={20} />
          DISPUTE CENTER
        </h3>
        
        <p className="text-xs text-slate-400 mb-4">
          Inject a dispute against any active transaction to test the verification gap survival.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => onUpdateStatus('DISPUTED', 'Recipient bank reports non-receipt')}
            disabled={loading}
            className="w-full flex items-center justify-center py-3 bg-accent/20 border border-accent/40 text-accent font-bold rounded-lg hover:bg-accent/30 transition-all"
          >
            <AlertTriangle className="mr-2" size={20} />
            REPORT DISPUTE
          </button>
          
          <button 
            onClick={() => onUpdateStatus('CONFIRMED', 'Transaction verified by recipient bank')}
            disabled={loading}
            className="w-full flex items-center justify-center py-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 font-bold rounded-lg hover:bg-emerald-500/30 transition-all"
          >
            <CheckCircle className="mr-2" size={20} />
            CONFIRM SETTLEMENT
          </button>
        </div>
      </motion.div>

      <div className="text-center p-4">
        <p className="text-[10px] text-slate-600 font-mono tracking-tighter uppercase">
          CONNEX CRYPTOGRAPHIC ENGINE v1.0.0
        </p>
      </div>
    </div>
  );
};

export default ControlPanel;
