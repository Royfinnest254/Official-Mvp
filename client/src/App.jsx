import React, { useState } from 'react';
import DisputePortal from './pages/DisputePortal';
import LiveNetworkFeed from './pages/LiveNetworkFeed';
// import AuditReports from './pages/AuditReports';
// import HowItWorks from './pages/HowItWorks';
import AuditVaultPage from './pages/AuditVaultPage';
import logo from './assets/connex-logo.png';
import { ShieldCheck } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('process'); // Default to Process for newcomers
  const [initialTxId, setInitialTxId] = useState('');

  const navigateToDispute = (txId) => {
    setInitialTxId(txId);
    setActiveTab('disputes');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Institutional Solid Header */}
      <header className="institution-header shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setActiveTab('process')}>
             <div className="bg-slate-900 p-2 rounded-lg">
                <ShieldCheck className="text-white w-6 h-6" />
             </div>
             <div className="flex flex-col justify-center">
                <span className="text-xl font-bold text-slate-900 leading-tight tracking-tight uppercase">Connex</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-tight">Forensic Evidence Layer</span>
             </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1 text-xs font-bold uppercase tracking-widest">
             {[
               { id: 'process', name: 'Protocol' },
               { id: 'health', name: 'Network' },
               { id: 'disputes', name: 'Disputes' },
               { id: 'reports', name: 'Vault' }
             ].map((tab) => (
               <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 rounded-md transition-all duration-200 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
               >
                 {tab.name}
               </button>
             ))}
          </nav>

          <div className="flex items-center space-x-6">
             <div className="hidden lg:flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                  <span className="text-[10px] text-slate-900 font-black uppercase tracking-widest">System Active</span>
                </div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Main Gateway Node</span>
             </div>
             <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-bold text-xs">
               RC
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-6 py-10">
        {activeTab === 'process' && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="max-w-xl w-full p-12 bg-white border border-slate-200 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Protocol Operational Briefing</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                The Connex Clearing and Settlement Protocol provides a cryptographically secured evidence layer for inter-institutional payment coordination. This system is currently synchronized with the latest v1.0 forensic specifications.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Standard</p>
                  <p className="text-sm font-bold text-slate-900">ISO 20022 Compliance</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Finality</p>
                  <p className="text-sm font-bold text-slate-900">Immediate Evidence Seal</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'disputes' && <DisputePortal initialTxId={initialTxId} />}
        {activeTab === 'health' && <LiveNetworkFeed onNavigateToDispute={navigateToDispute} />}
        {activeTab === 'reports' && <AuditVaultPage />}
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
               <span className="text-slate-900">&copy; 2026 CONNEX TECHNOLOGIES</span>
               <div className="h-3 w-px bg-slate-200"></div>
               <span>SECURED FEDERATED LEDGER</span>
            </div>
            <div className="flex items-center space-x-10 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-2 italic">Institutional Grade Stability</span>
                <div className="flex gap-4">
                  <span className="text-slate-900">PCI-DSS</span>
                  <span className="text-slate-900">SOC2 COMPLIANT</span>
                  <span className="text-slate-400">BUILD 1.0.4-PRD</span>
                </div>
            </div>
         </div>
      </footer>
    </div>
  );
}

export default App;
