import React from 'react';
import { ShieldCheck, Activity, Database } from 'lucide-react';

const QuorumValidator = ({ blocks = [] }) => {
  const witnesses = [
    { name: 'Node 01', label: 'Witness Node 01' },
    { name: 'Node 02', label: 'Witness Node 02' },
    { name: 'Node 03', label: 'Witness Node 03' },
  ];

  return (
    <div className="bg-[#11141d] border border-white/5 rounded-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Digital Quorum Status</h3>
        <span className="text-[10px] text-emerald-500 font-mono">Consensus: Active (3/3)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {witnesses.map((w) => (
          <div
            key={w.name}
            className="bg-black/20 border border-white/5 p-6 rounded-md group hover:border-emerald-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{w.name}</span>
              <span className="text-[10px] font-semibold text-emerald-500 flex items-center">
                <div className="w-1 h-1 rounded-full bg-emerald-500 mr-1 animate-pulse"></div>
                Active
              </span>
            </div>
            <p className="text-[15px] font-semibold text-white leading-tight">{w.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuorumValidator;
