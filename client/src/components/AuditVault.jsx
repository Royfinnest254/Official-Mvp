import React from 'react';
import { CheckCircle } from 'lucide-react';

const AuditVault = ({ blocks = [] }) => {
  if (blocks.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-panel rounded-[2rem] p-24 text-center glow-border border-dashed"
      >
        <p className="text-slate-500 text-sm font-black uppercase tracking-[0.3em] italic">Observation stream active. Awaiting metadata capture...</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Evidence Stream</h2>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-success shadow-glow-emerald"></div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vault Integrity: Secured</span>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {blocks.map((block, index) => (
            <motion.div 
              key={block.id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel group rounded-3xl glow-border overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Info Column */}
                <div className="flex-grow p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-black text-white tracking-tighter italic">Trace #{block.block_number}</span>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-tighter ${
                        block.status === 'DISPUTED' ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-success/10 border-success/30 text-success'
                      }`}>
                        {block.status === 'DISPUTED' ? 'Flagged Gap' : 'Sealed Evidence'}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-black uppercase tracking-widest">Event ID</span>
                        <span className="font-mono font-bold text-primary">{block.tx_id.substring(0, 12)}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                         <span className="text-slate-500 font-black uppercase tracking-widest">Observed Value</span>
                         <span className="font-black text-white text-sm">{block.payload.amount.toLocaleString()} {block.payload.currency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Cryptographic Hash</span>
                    <div className="font-mono text-[10px] leading-relaxed text-slate-400 bg-background/50 border border-white/5 p-4 rounded-xl break-all tracking-tighter group-hover:border-primary/20 transition-all">
                      {block.block_hash}
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 block">Consensus Witnesses</span>
                      <div className="flex flex-wrap gap-3">
                        {block.signatures.map((sig, i) => (
                          <span key={i} className="flex items-center px-2 py-1 rounded-lg bg-success/5 border border-success/20 text-[9px] font-black text-success uppercase tracking-tighter">
                            <CheckCircle size={10} className="mr-1.5" />
                            {sig.witness}
                          </span>
                        ))}
                      </div>
                     </div>
                     <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} className="text-slate-700" />
                        Sealed {new Date(block.created_at).toISOString().replace('T', ' ').split('.')[0]}
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuditVault;
