import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Database, ChevronRight, X, Clock, Fingerprint, Lock, Activity, ArrowRight } from 'lucide-react';

const AuditVault = ({ blocks = [], verifyingId = null, verifiedIds = new Set(), failedIds = new Set() }) => {
  const [selectedBlock, setSelectedBlock] = useState(null);

  if (blocks.length === 0) {
    return (
      <div className="aws-portal-card p-24 text-center border-dashed border-[#eaeded]">
        <Database className="text-slate-300 w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-secondary text-sm font-bold uppercase tracking-wider">Awaiting Synchronized Metadata Capture...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="aws-portal-card overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-[#f2f3f3] border-b border-[#eaeded] px-6 py-3">
          <div className="col-span-1 text-[11px] font-bold text-secondary uppercase tracking-wider">Index</div>
          <div className="col-span-3 text-[11px] font-bold text-secondary uppercase tracking-wider">Resource ID (Bundle)</div>
          <div className="col-span-3 text-[11px] font-bold text-secondary uppercase tracking-wider">Transaction Chain Hash</div>
          <div className="col-span-3 text-[11px] font-bold text-secondary uppercase tracking-wider">Validation Status</div>
          <div className="col-span-2 text-[11px] font-bold text-secondary uppercase tracking-wider text-right">Captured At</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#eaeded]">
          <AnimatePresence mode="popLayout">
            {blocks.map((block) => {
              const isVerifying = verifyingId === block.id;
              const isVerified = verifiedIds.has(block.id);
              const isFailed = failedIds.has(block.id);
              const isSelected = selectedBlock?.id === block.id;

              return (
                <motion.div 
                  key={block.id}
                  layout
                  onClick={() => setSelectedBlock(block)}
                  className={`grid grid-cols-12 px-6 py-4 cursor-pointer transition-all hover:bg-[#f1faff] group items-center ${
                    isSelected ? 'bg-[#f1faff]' : isVerifying ? 'bg-blue-50/50' : isFailed ? 'bg-red-50/50' : ''
                  }`}
                >
                  <div className="col-span-1 text-sm font-mono text-secondary">#{block.id}</div>
                  <div className="col-span-3 flex items-center gap-2">
                    <span className="text-accent font-bold text-sm tracking-tight hover:underline">{block.bundle_id}</span>
                  </div>
                  <div className="col-span-3">
                    <code className="text-[11px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 group-hover:border-accent group-hover:text-accent transition-colors">
                      {block.chain_hash.substring(0, 16)}...
                    </code>
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                     {isFailed ? (
                       <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-danger text-white text-[9px] font-black uppercase tracking-widest">
                         <X size={10} strokeWidth={4} /> Integrity Breach
                       </div>
                     ) : isVerified ? (
                       <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-success text-white text-[9px] font-black uppercase tracking-widest">
                         <ShieldCheck size={10} strokeWidth={4} /> Verified
                       </div>
                     ) : isVerifying ? (
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-[10px] font-bold text-accent uppercase tracking-widest animate-pulse">Scanning...</span>
                       </div>
                     ) : (
                       <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-slate-100 border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                         <Lock size={10} /> Sealed
                       </div>
                     )}
                  </div>
                  <div className="col-span-2 text-right text-[11px] font-medium text-slate-500 font-mono">
                    {new Date(parseInt(block.event_ts)).toLocaleTimeString([], { hour12: false })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* AWS Style Detail Drawer */}
      <AnimatePresence>
        {selectedBlock && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-[50px] bottom-0 w-[480px] bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.1)] z-50 border-l border-[#eaeded] flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#eaeded] bg-[#f2f3f3]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-secondary" />
                <h3 className="font-bold text-sm">Resource Details</h3>
              </div>
              <button onClick={() => setSelectedBlock(null)} className="p-1.5 hover:bg-slate-200 rounded transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-grow overflow-y-auto p-8 space-y-8">
              <section className="space-y-4">
                <h4 className="text-[11px] font-bold text-secondary uppercase tracking-wider">Forensic Metadata</h4>
                <div className="aws-portal-card p-5 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary font-medium uppercase text-[10px] tracking-tight">Record Index</span>
                    <span className="font-mono text-slate-900">#{selectedBlock.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary font-medium uppercase text-[10px] tracking-tight">Bundle ID</span>
                    <span className="font-bold text-accent">{selectedBlock.bundle_id}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary font-medium uppercase text-[10px] tracking-tight">Transaction Ref</span>
                    <span className="font-mono text-slate-900 group">{selectedBlock.tx_ref_hash}</span>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[11px] font-bold text-secondary uppercase tracking-wider">Protocol Evidence</h4>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Target Chain Hash</label>
                    <div className="font-mono text-[11px] p-3 bg-slate-50 border border-slate-100 rounded break-all leading-relaxed text-slate-600">
                      {selectedBlock.chain_hash}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Linked Parent Hash</label>
                    <div className="font-mono text-[11px] p-3 bg-slate-50 border border-slate-100 rounded break-all leading-relaxed text-slate-400 italic">
                      {selectedBlock.prev_hash}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[11px] font-bold text-secondary uppercase tracking-wider">Witness Quorum Signatures</h4>
                <div className="grid grid-cols-1 gap-2">
                  {['sig_node_1', 'sig_node_2', 'sig_node_3'].map((sigKey, i) => (
                    <div key={sigKey} className="flex items-center gap-3 p-3 border border-[#eaeded] rounded-[2px] bg-[#fbfbfb]">
                      <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                         <Fingerprint className="w-3.5 h-3.5 text-secondary" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-[9px] font-bold text-secondary uppercase mb-0.5 tracking-tighter">Evidence Witness Node {i+1}</p>
                        <p className="text-[10px] font-mono truncate text-slate-900">{selectedBlock[sigKey]}</p>
                      </div>
                      <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-4 bg-slate-900 rounded-[3px] text-white space-y-3">
                 <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-highlight" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-highlight">Forensic Sealing Complete</span>
                 </div>
                 <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                   This record has been cryptographically secured in the Connex Audit Vault with 2-of-3 witness consensus. 
                   Any retroactive modification to this block will result in a global linkage failure.
                 </p>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditVault;
