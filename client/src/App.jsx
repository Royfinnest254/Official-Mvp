import React, { useState } from 'react';
import DisputePortal from './pages/DisputePortal';
import logo from './assets/connex-logo.svg';

function App() {
  const [activeTab, setActiveTab] = useState('disputes');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Enterprise Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <img src={logo} alt="Cx Logo" className="w-8 h-8" />
             <div className="flex flex-col justify-center">
                <span className="text-sm font-bold text-slate-900 leading-tight">Connex Technologies</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider leading-tight">Enterprise Portal</span>
             </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
             <button 
                onClick={() => setActiveTab('disputes')}
                className={`transition-colors py-5 border-b-2 ${activeTab === 'disputes' ? 'text-blue-700 border-blue-700' : 'text-slate-500 hover:text-slate-800 border-transparent'}`}
             >
               Dispute Resolution
             </button>
             <button 
                onClick={() => setActiveTab('reports')}
                className={`transition-colors py-5 border-b-2 ${activeTab === 'reports' ? 'text-blue-700 border-blue-700' : 'text-slate-500 hover:text-slate-800 border-transparent'}`}
             >
               Audit Reports
             </button>
             <button 
                onClick={() => setActiveTab('health')}
                className={`transition-colors py-5 border-b-2 ${activeTab === 'health' ? 'text-blue-700 border-blue-700' : 'text-slate-500 hover:text-slate-800 border-transparent'}`}
             >
               Network Health
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
        {activeTab === 'disputes' && <DisputePortal />}
        {activeTab === 'reports' && (
           <div className="container mx-auto px-6 py-12 text-center text-slate-500">
             <p className="text-lg font-medium">Audit Reports Module Placeholder</p>
             <p className="text-sm mt-2">Generate PDF compliance reports for standard regulatory audits.</p>
           </div>
        )}
        {activeTab === 'health' && (
           <div className="container mx-auto px-6 py-12 text-center text-slate-500">
             <p className="text-lg font-medium">Network Infrastructure Monitoring</p>
             <p className="text-sm mt-2">View latency and uptime for Witness Nodes (AWS, GCP, Azure).</p>
           </div>
        )}
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-200 py-6 bg-white">
         <div className="container mx-auto px-6 flex flex-wrap items-center justify-between text-slate-500 text-[11px] font-medium gap-4">
            <div>&copy; 2026 Connex Technologies. Infrastructure for Kenyan Financial Corridors.</div>
            <div className="flex items-center space-x-6">
                <span>ISO 20022 Compliant</span>
                <span>PCI-DSS Tier 1 Status: Verified</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

export default App;
