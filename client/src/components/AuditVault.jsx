import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, ShieldCheck, Database } from 'lucide-react';

const AuditVault = ({ blocks = [] }) => {
  if (blocks.length === 0) {
    return (
      <div className="institution-card p-24 text-center border-dashed border-slate-300">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Database className="text-slate-200 w-8 h-8" />
        </div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">Awaiting Synchronized Metadata Capture...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Forensic Archive
        </h2>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vault Status: Immutable</span>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {blocks.map((block, index) => (
            <motion.div 
              key={block.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.05 }}
              className="institution-card group overflow-hidden hover:border-slate-400 transition-all"
            >
              <div className="flex flex-col lg:flex-row">
                <div className="flex-grow p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-slate-900 tracking-tight">Trace #{block.block_number}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter ${
                        block.status === 'DISPUTED' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'
                      }`}>
                        {block.status === 'DISPUTED' ? 'Gap Flagged' : 'Audit Sealed'}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">Protocol ID</span>
                        <span className="font-mono font-bold text-slate-900">{block.tx_id.substring(0, 12)}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                         <span className="text-slate-400 font-bold uppercase tracking-widest">Settlement Value</span>
                         <span className="font-bold text-slate-900 text-sm">KSH {block.payload.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cryptographic Signature</span>
                    <div className="font-mono text-[10px] leading-relaxed text-slate-500 bg-slate-50 border border-slate-100 p-4 rounded-lg break-all tracking-tighter group-hover:bg-white group-hover:border-blue-100 transition-all">
                      {block.block_hash}
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Witness Quorum</span>
                      <div className="flex flex-wrap gap-2">
                        {block.signatures.map((sig, i) => (
                          <span key={i} className="flex items-center px-2 py-0.5 rounded bg-green-50 border border-green-100 text-[9px] font-bold text-green-700 uppercase tracking-tighter">
                            <CheckCircle2 size={10} className="mr-1.5" />
                            {sig.witness.replace('Node', 'Wtn')}
                          </span>
                        ))}
                      </div>
                     </div>
                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} className="text-slate-300" />
                        Archived {new Date(block.created_at).toISOString().replace('T', ' ').split('.')[0]}
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
