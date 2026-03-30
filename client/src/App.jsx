import React, { useState } from 'react';
import DisputePortal from './pages/DisputePortal';
import LiveNetworkFeed from './pages/LiveNetworkFeed';
// import AuditReports from './pages/AuditReports';
// import HowItWorks from './pages/HowItWorks';
import AuditVaultPage from './pages/AuditVaultPage';
import logo from './assets/connex-logo.png';

function App() {
  const [activeTab, setActiveTab] = useState('process'); // Default to Process for newcomers
  const [initialTxId, setInitialTxId] = useState('');

  const navigateToDispute = (txId) => {
    setInitialTxId(txId);
    setActiveTab('disputes');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Enterprise Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('process')}>
             <img src={logo} alt="Connex Cx Logo" className="h-9 w-auto" />
             <div className="flex flex-col justify-center">
                <span className="text-sm font-black text-slate-900 leading-tight tracking-tight uppercase italic">Connex</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Evidence Layer v1.0</span>
             </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1 text-sm font-semibold">
             <button 
                onClick={() => setActiveTab('process')}
                className={`px-4 transition-all py-5 border-b-2 text-[11px] uppercase tracking-wider ${activeTab === 'process' ? 'text-blue-700 border-blue-700' : 'text-slate-400 hover:text-slate-600 border-transparent'}`}
             >
               How it Works
             </button>
             <button 
                onClick={() => setActiveTab('health')}
                className={`px-4 transition-all py-5 border-b-2 text-[11px] uppercase tracking-wider ${activeTab === 'health' ? 'text-blue-700 border-blue-700' : 'text-slate-400 hover:text-slate-600 border-transparent'}`}
             >
               Live Network
             </button>
             <button 
                onClick={() => setActiveTab('disputes')}
                className={`px-4 transition-all py-5 border-b-2 text-[11px] uppercase tracking-wider ${activeTab === 'disputes' ? 'text-blue-700 border-blue-700' : 'text-slate-400 hover:text-slate-600 border-transparent'}`}
             >
               Dispute Resolution
             </button>
             <button 
                onClick={() => setActiveTab('reports')}
                className={`px-4 transition-all py-5 border-b-2 text-[11px] uppercase tracking-wider ${activeTab === 'reports' ? 'text-blue-700 border-blue-700' : 'text-slate-400 hover:text-slate-600 border-transparent'}`}
             >
               Evidence Vault
             </button>
          </nav>

          <div className="flex items-center space-x-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800">Operational Admin</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">System Secure</span>
                </div>
             </div>
             <div className="h-9 w-9 rounded-xl bg-blue-600 shadow-lg shadow-blue-100 flex items-center justify-center text-white font-black text-xs">
               RC
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        {activeTab === 'process' && (
          <div className="p-12 text-center text-slate-500 font-medium">
            How It Works documentation is currently being updated. Please view the Live Network.
          </div>
        )}
        {activeTab === 'disputes' && <DisputePortal initialTxId={initialTxId} />}
        {activeTab === 'health' && <LiveNetworkFeed onNavigateToDispute={navigateToDispute} />}
        {activeTab === 'reports' && <AuditVaultPage />}
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-200 py-5 bg-white">
         <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between text-slate-400 text-[11px] font-medium gap-4">
            <div className="flex items-center space-x-2">
               <span>&copy; 2026 CONNEX Technologies.</span>
               <span className="text-slate-300">|</span>
               <span>Founded by <strong className="text-slate-600">Roy Chumba</strong></span>
            </div>
            <div className="flex items-center space-x-6">
                <span>ISO 20022 Compliant</span>
                <span>PCI-DSS Tier 1 Verified</span>
                <span className="text-slate-300">v1.0.0</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

export default App;
