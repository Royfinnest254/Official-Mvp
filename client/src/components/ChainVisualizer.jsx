import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Hash, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const ChainVisualizer = ({ blocks = [] }) => {
  if (blocks.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <Database size={48} className="text-slate-700 mb-4" />
          <p className="text-slate-500 font-mono">WAITING FOR GENESIS BLOCK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Link size={20} className="mr-2 text-primary" />
          CRYPTOGRAPHIC HASH CHAIN
        </h2>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono border border-primary/20">
          GENESIS: {blocks[blocks.length - 1]?.created_at ? new Date(blocks[blocks.length - 1].created_at).toLocaleDateString() : 'N/A'}
        </span>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-secondary/50 to-transparent"></div>

        <AnimatePresence mode="popLayout">
          {blocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative pl-14 pb-8 last:pb-0"
            >
              {/* Block Indicator */}
              <div className={`absolute left-0 top-0 w-14 h-14 flex items-center justify-center rounded-xl glass-card z-10 ${
                block.status === 'DISPUTED' ? 'border-accent/40 bg-accent/5' : 'border-primary/40 bg-primary/5'
              }`}>
                <span className="text-lg font-mono font-bold">{block.block_number}</span>
              </div>

              {/* Block Content */}
              <div className="glass-card p-5 group hover:border-white/20 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center">
                    {block.status === 'DISPUTED' ? (
                      <AlertCircle className="text-accent mr-2" size={18} />
                    ) : (
                      <CheckCircle2 className="text-emerald-500 mr-2" size={18} />
                    )}
                    <span className={`font-bold tracking-tight ${block.status === 'DISPUTED' ? 'text-accent' : 'text-emerald-500'}`}>
                      {block.status}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-slate-400 font-mono">
                    <Clock size={14} className="mr-1" />
                    {new Date(block.created_at).toLocaleTimeString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block">PAYLOAD DATA</label>
                    <div className="bg-black/20 rounded p-3 text-sm font-mono border border-white/5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">TX_ID:</span>
                        <span className="text-white">{block.tx_id}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-slate-400">VALUE:</span>
                        <span className="text-primary">{block.payload.amount} {block.payload.currency}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-slate-400">CORRIDOR:</span>
                        <span className="text-slate-300">{block.payload.fromBank} → {block.payload.toBank}</span>
                      </div>
                      {block.payload.reason && (
                        <div className="mt-2 pt-2 border-t border-white/5 text-accent text-xs">
                           {block.payload.reason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block">CRYPTOGRAPHIC PROOF</label>
                    <div className="bg-black/20 rounded p-3 text-[11px] font-mono border border-white/5 relative overflow-hidden">
                      <div className="flex items-center text-primary/80 mb-2">
                        <Hash size={12} className="mr-1" />
                        BLOCK_HASH
                      </div>
                      <div className="text-slate-300 break-all mb-3 leading-tight">
                        {block.block_hash}
                      </div>

                      <div className="flex items-center text-secondary/80 mb-1">
                        <Link size={12} className="mr-1" />
                        PREV_HASH
                      </div>
                      <div className="text-slate-500 truncate">
                        {block.prev_hash}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest mr-2">WITNESS QUORUM:</div>
                   {block.signatures.map((sig, i) => (
                     <div key={i} className="flex items-center px-2 py-1 rounded bg-white/5 border border-white/10" title={sig.witness}>
                        <ShieldCheck size={12} className="text-emerald-500 mr-1" />
                        <span className="text-[10px] font-mono text-slate-300">{sig.witness}</span>
                     </div>
                   ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChainVisualizer;
