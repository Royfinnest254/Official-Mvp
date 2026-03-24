import React from 'react';
import { motion } from 'framer-motion';

const NetworkVisual = () => {
  return (
    <div className="bg-[#11141d] border border-white/5 p-12 rounded-lg overflow-hidden relative min-h-[400px]">
      <div className="absolute top-6 left-6 flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Digital CCTV Logic</span>
      </div>

      <svg width="100%" height="100%" viewBox="0 0 800 400" className="mx-auto">
        {/* Inverted Triangle Lines */}
        <line x1="200" y1="80" x2="600" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1="200" y1="80" x2="400" y2="320" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="600" y1="80" x2="400" y2="320" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Transmission Animation (Top Level) */}
        <motion.circle
          r="4"
          fill="#3b82f6"
          initial={{ cx: 200, cy: 80, opacity: 0 }}
          animate={{
            cx: [200, 400, 600],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Evidence Fall Animation (Downwards to Connex) */}
        <motion.circle
          r="3"
          fill="#10b981"
          initial={{ cx: 400, cy: 80, opacity: 0 }}
          animate={{
            cy: [80, 320],
            opacity: [0, 1, 0.8, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: 2,
            ease: "easeIn"
          }}
        />

        {/* Nodes */}
        {/* CONNEX Vault (Bottom Apex) */}
        <g transform="translate(400, 320)">
          <circle r="22" fill="#0b0e14" stroke="#10b981" strokeWidth="2" />
          <motion.circle
            r="30"
            fill="transparent"
            stroke="#10b981"
            strokeWidth="1"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <text y="45" textAnchor="middle" fill="#10b981" className="text-[11px] font-bold uppercase tracking-wider">Audit Vault</text>
          <text y="58" textAnchor="middle" fill="#475569" className="text-[9px] font-medium tracking-tight">Passive Evidence Accumulator</text>
        </g>

        {/* Bank A (Top Left) */}
        <g transform="translate(200, 80)">
          <circle r="18" fill="#11141d" stroke="#334155" strokeWidth="2" />
          <text y="-30" textAnchor="middle" fill="#f8fafc" className="text-[11px] font-bold">Institution A (KCB)</text>
          <text y="-42" textAnchor="middle" fill="#475569" className="text-[9px] font-medium uppercase tracking-tighter">Observation Point</text>
        </g>

        {/* Bank B (Top Right) */}
        <g transform="translate(600, 80)">
          <circle r="18" fill="#11141d" stroke="#334155" strokeWidth="2" />
          <text y="-30" textAnchor="middle" fill="#f8fafc" className="text-[11px] font-bold">Institution B (Equity)</text>
          <text y="-42" textAnchor="middle" fill="#475569" className="text-[9px] font-medium uppercase tracking-tighter">Observation Point</text>
        </g>

        {/* Label */}
        <text x="400" y="30" textAnchor="middle" fill="#475569" className="text-[10px] italic">
          Transaction metadata falling into the immutable audit layer
        </text>
      </svg>
    </div>
  );
};

export default NetworkVisual;
