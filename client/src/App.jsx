import React, { useState } from 'react';
import DisputePortal from './pages/DisputePortal';
import LiveNetworkFeed from './pages/LiveNetworkFeed';
import logo from './assets/connex-logo.png';

function App() {
  const [activeTab, setActiveTab] = useState('disputes');
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
          <div className="flex items-center space-x-3">
             <img src={logo} alt="Connex Cx Logo" className="h-9 w-auto" />
             <div className="flex flex-col justify-center">
                <span className="text-sm font-bold text-slate-900 leading-tight tracking-tight">CONNEX Technologies</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider leading-tight">Enterprise Coordination Portal</span>
             </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1 text-sm font-semibold">
             <button 
                onClick={() => setActiveTab('disputes')}
                className={`px-4 transition-colors py-5 border-b-2 ${activeTab === 'disputes' ? 'text-blue-700 border-blue-700' : 'text-slate-500 hover:text-slate-800 border-transparent'}`}
             >
               Dispute Resolution
             </button>
             <button 
                onClick={() => setActiveTab('health')}
                className={`px-4 transition-colors py-5 border-b-2 ${activeTab === 'health' ? 'text-blue-700 border-blue-700' : 'text-slate-500 hover:text-slate-800 border-transparent'}`}
             >
               Live Network Feed
             </button>
             <button 
                onClick={() => setActiveTab('reports')}
                className={`px-4 transition-colors py-5 border-b-2 ${activeTab === 'reports' ? 'text-blue-700 border-blue-700' : 'text-slate-500 hover:text-slate-800 border-transparent'}`}
             >
               Audit Reports
             </button>
          </nav>

          <div className="flex items-center space-x-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800">Bank Administrator</span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">● Secure Session</span>
             </div>
             <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">
               BA
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        {activeTab === 'disputes' && <DisputePortal initialTxId={initialTxId} />}
        {activeTab === 'health' && <LiveNetworkFeed onNavigateToDispute={navigateToDispute} />}
        {activeTab === 'reports' && (
           <div className="container mx-auto px-6 py-12 text-center text-slate-500">
             <p className="text-lg font-medium">Audit Reports Module</p>
             <p className="text-sm mt-2">Generate PDF compliance reports for standard regulatory audits.</p>
           </div>
        )}
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
