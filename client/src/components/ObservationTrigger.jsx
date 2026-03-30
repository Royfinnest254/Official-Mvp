import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const ObservationTrigger = ({ onPostEvent, onUpdateStatus, loading }) => {
  const [txId, setTxId] = useState(`AUDIT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  const [amount, setAmount] = useState(50000);
  const [currency, setCurrency] = useState('KES');
  const [fromBank, setFromBank] = useState('KCB_KE');
  const [toBank, setToBank] = useState('EQUITY_KE');

  const handleSubmit = (e) => {
    e.preventDefault();
    onPostEvent({ txId, amount: Number(amount), currency, fromBank, toBank, status: 'PENDING' });
    setTxId(`AUDIT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  };

  return (
    <div className="space-y-6 sticky top-8">
      <div className="tech-card p-6 border-t-2 border-t-primary">
        <h3 className="text-sm font-semibold text-white mb-6">
          Audit Capture Control
        </h3>
        <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">
          Simulate an observed settlement event. CONNEX will extract metadata and seal it into the witness vault.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="tech-label">Audit Reference</label>
            <input 
              type="text" 
              value={txId} 
              onChange={(e) => setTxId(e.target.value)}
              className="tech-input w-full font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-[9px]">Entry Point</label>
              <select 
                value={fromBank} 
                onChange={(e) => setFromBank(e.target.value)}
                className="tech-input w-full appearance-none"
              >
                <option value="KCB_KE">Bank A</option>
                <option value="EQUITY_KE">Bank B</option>
                <option value="COOP_KE">Bank C</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-[9px]">Exit Point</label>
              <select 
                value={toBank} 
                onChange={(e) => setToBank(e.target.value)}
                className="tech-input w-full appearance-none"
              >
                <option value="EQUITY_KE">Bank B</option>
                <option value="COOP_KE">Bank C</option>
                <option value="STANBIC_KE">Bank D</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="tech-label text-[9px]">Observed Metadata (Amount)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="tech-input w-full"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 tech-button bg-primary text-white font-semibold py-2.5 hover:bg-blue-600 transition-colors shadow-sm text-[10px]"
          >
            {loading ? <RefreshCw className="animate-spin inline mr-2" size={14} /> : 'Sync to CONNEX'}
          </button>
        </form>
      </div>

      <div className="tech-card p-6 border-t-2 border-t-slate-700">
        <h3 className="text-sm font-semibold text-white mb-4">
          Evidence Dispute
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Manually flag a reconciliation gap detected during settlement observation.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={() => onUpdateStatus('DISPUTED', 'Manual intervention: settlement discrepancy observed')}
            disabled={loading}
            className="w-full tech-button border border-border-subtle bg-surface hover:bg-slate-800 text-slate-300 py-2 text-[10px]"
          >
            Flag Discrepancy
          </button>
          
          <button 
            onClick={() => onUpdateStatus('CONFIRMED', 'Audit cleared: no settlement gap found')}
            disabled={loading}
            className="w-full tech-button border border-border-subtle bg-surface hover:bg-slate-800 text-slate-300 py-2 text-[10px]"
          >
            Clear Audit Gap
          </button>
        </div>
      </div>

      <div className="px-2">
        <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest leading-loose text-center">
          Connex Protocol Node v1.0.4<br/>
          Cryptographic Integrity Active
        </p>
      </div>
    </div>
  );
};

export default ObservationTrigger;
