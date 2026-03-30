import React from 'react';
import { CheckCircle } from 'lucide-react';

const AuditVault = ({ blocks = [] }) => {
  if (blocks.length === 0) {
    return (
      <div className="bg-[#11141d] border border-white/5 p-16 text-center rounded-md">
        <p className="text-slate-500 text-sm italic">Observation stream is active. Waiting for metadata capture...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-slate-400">CONNEX EVIDENCE VAULT</h2>
        <span className="text-[11px] font-medium text-slate-600">Vault Integrity: Secured</span>
      </div>

      <div className="space-y-4">
        {blocks.map((block) => (
          <div key={block.id} className="bg-[#11141d] border border-white/5 rounded-md overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Info Column */}
              <div className="flex-grow p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-white">Trace #{block.block_number}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      block.status === 'DISPUTED' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {block.status === 'DISPUTED' ? 'Flagged Gap' : 'Sealed Evidence'}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-medium uppercase tracking-tighter">Event ID</span>
                      <span className="font-mono text-slate-300">{block.tx_id.substring(0, 10)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                       <span className="text-slate-500 font-medium uppercase tracking-tighter">Observed Value</span>
                       <span className="font-bold text-white">{block.payload.amount.toLocaleString()} {block.payload.currency}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-[9px]">Hash Proof</span>
                  <div className="font-mono text-[9px] leading-relaxed text-slate-500 bg-black/20 p-3 rounded break-all tracking-tighter">
                    {block.block_hash}
                  </div>
                </div>

                <div className="space-y-4">
                   <div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-[9px]">Proof Signatures</span>
                    <div className="text-[10px] font-medium text-slate-400 flex flex-wrap gap-x-2 mt-1">
                      {block.signatures.map((sig, i) => (
                        <span key={i} className="flex items-center text-emerald-500/70">
                          <CheckCircle size={8} className="mr-1" />
                          {sig.witness}
                        </span>
                      ))}
                    </div>
                   </div>
                   <div className="text-[10px] text-slate-600 font-medium italic">
                      Sealed at {new Date(block.created_at).toISOString().replace('T', ' ').split('.')[0]}
                   </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditVault;
