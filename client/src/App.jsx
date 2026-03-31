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
    <div className="min-h-screen flex flex-col bg-background text-slate-300 antialiased font-sans">
      {/* Enterprise Glass Header */}
      <header className="glass-header">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setActiveTab('process')}>
             <div className="relative">
                <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all opacity-0 group-hover:opacity-100"></div>
                <img src={logo} alt="Connex Cx Logo" className="h-10 w-auto relative z-10 filter brightness-110" />
             </div>
             <div className="flex flex-col justify-center">
                <span className="text-lg font-black text-white leading-tight tracking-tighter uppercase italic">Connex</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] leading-tight">Evidence Layer v1.0</span>
             </div>
          </div>

          <nav className="hidden md:flex items-center space-x-2 text-xs font-bold uppercase tracking-widest">
             <button 
                onClick={() => setActiveTab('process')}
                className={`px-5 py-2 rounded-full transition-all duration-300 ${activeTab === 'process' ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-blue' : 'text-slate-500 hover:text-slate-300'}`}
             >
               Protocol
             </button>
             <button 
                onClick={() => setActiveTab('health')}
                className={`px-5 py-2 rounded-full transition-all duration-300 ${activeTab === 'health' ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-blue' : 'text-slate-500 hover:text-slate-300'}`}
             >
               Network
             </button>
             <button 
                onClick={() => setActiveTab('disputes')}
                className={`px-5 py-2 rounded-full transition-all duration-300 ${activeTab === 'disputes' ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-blue' : 'text-slate-500 hover:text-slate-300'}`}
             >
               Disputes
             </button>
             <button 
                onClick={() => setActiveTab('reports')}
                className={`px-5 py-2 rounded-full transition-all duration-300 ${activeTab === 'reports' ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-blue' : 'text-slate-500 hover:text-slate-300'}`}
             >
               Vault
             </button>
          </nav>

          <div className="flex items-center space-x-6">
             <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Admin Terminal</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                  <span className="text-[9px] text-success/80 font-bold uppercase tracking-tight">Secured Connection</span>
                </div>
             </div>
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary p-[1px]">
                <div className="h-full w-full rounded-xl bg-background flex items-center justify-center text-white font-black text-xs">
                  RC
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        {activeTab === 'process' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md text-center p-8 glass-panel rounded-3xl glow-border">
              <h2 className="text-xl font-bold text-white mb-2">Protocol Briefing</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                The Connex Protocol documentation is being synchronized with the latest v1.0 specifications.
              </p>
            </div>
          </div>
        )}
        {activeTab === 'disputes' && <DisputePortal initialTxId={initialTxId} />}
        {activeTab === 'health' && <LiveNetworkFeed onNavigateToDispute={navigateToDispute} />}
        {activeTab === 'reports' && <AuditVaultPage />}
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-white/5 py-8 bg-surface">
         <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] gap-8">
            <div className="flex items-center space-x-4">
               <span className="text-slate-400">&copy; 2026 CONNEX TECHNOLOGIES</span>
               <div className="h-3 w-px bg-white/10"></div>
               <span>FOUNDED BY <strong className="text-white">ROY CHUMBA</strong></span>
            </div>
            <div className="flex items-center space-x-8">
                <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary"></div> ISO 20022</span>
                <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary"></div> PCI-DSS TIER 1</span>
                <span className="text-primary/50">BUILD 1.0.0-PROD</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

export default App;
