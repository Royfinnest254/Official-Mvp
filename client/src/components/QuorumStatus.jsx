import React from 'react';
import { ShieldCheck, Activity, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const QuorumStatus = ({ blocks = [] }) => {
  const witnesses = [
    { name: 'CBK', label: 'Central Bank of Kenya', icon: ShieldCheck, color: 'text-primary' },
    { name: 'BoU', label: 'Bank of Uganda', icon: Database, color: 'text-secondary' },
    { name: 'IFC', label: 'International Finance Corp', icon: Activity, color: 'text-accent' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {witnesses.map((w, i) => (
        <motion.div
          key={w.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-6 flex items-center space-x-4"
        >
          <div className={`p-3 rounded-lg bg-white/5 ${w.color}`}>
            <w.icon size={24} />
          </div>
          <div>
            <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider">{w.name}</h3>
            <p className="text-lg font-bold text-white">{w.label}</p>
            <div className="flex items-center mt-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="text-xs text-emerald-500 font-medium">WITNESS ONLINE</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuorumStatus;
