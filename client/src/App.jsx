import React, { useState } from 'react';
import DisputePortal from './pages/DisputePortal';
import LiveNetworkFeed from './pages/LiveNetworkFeed';
import AuditVaultPage from './pages/AuditVaultPage';
import logo from './assets/connex-logo.svg';
import { Search, Bell, HelpCircle, Settings, Menu, ChevronRight, Activity, ShieldAlert, Database } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('health');
  const [initialTxId, setInitialTxId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const navigateToDispute = (txId) => {
    setInitialTxId(txId);
    setActiveTab('disputes');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateToDispute(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const navItems = [
    { id: 'health', name: 'Live Protocol Feed', icon: Activity },
    { id: 'reports', name: 'Evidence Vault', icon: Database },
    { id: 'disputes', name: 'Dispute Investigation', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-[#f2f3f3] text-[#16191f] antialiased">
      {/* AWS Global Header */}
      <header className="aws-header">
        <div className="flex items-center gap-4 w-[240px] shrink-0 border-r border-slate-700 h-full mr-4">
           <img src={logo} className="h-7 w-7 brightness-0 invert" alt="CX" />
           <span className="font-bold text-sm tracking-tight uppercase">Connex <span className="font-light opacity-50">Console</span></span>
        </div>
        
        <div className="flex-grow max-w-2xl">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-highlight transition-colors" />
            <input 
              type="text" 
              placeholder="Track Transaction ID (TX-XXXX)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#39495d] text-sm border-none rounded-[2px] py-1.5 pl-10 pr-4 text-white placeholder:text-slate-400 focus:ring-1 focus:ring-highlight transition-all"
            />
          </form>
        </div>

        <div className="flex items-center gap-5 ml-auto">
          <div className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer px-2 py-1 rounded transition-colors duration-150">
             <HelpCircle className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer px-2 py-1 rounded transition-colors duration-150">
             <Settings className="w-4 h-4" />
          </div>
          <div className="h-5 w-px bg-slate-700 mx-2"></div>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 px-2 py-1 rounded transition-colors duration-150">
             <div className="h-6 w-6 rounded-full bg-highlight flex items-center justify-center text-[10px] font-bold text-primary">OP</div>
             <span className="text-xs font-bold text-slate-300 tracking-tight">Operator</span>
          </div>
        </div>
      </header>

      {/* AWS Sidebar Navigation */}
      <aside className="aws-sidebar">
        <div className="p-4 border-b border-[#eaeded]">
          <h2 className="text-[11px] font-bold text-secondary uppercase tracking-wider">Services</h2>
        </div>
        <nav className="py-2">
           {navItems.map((item) => (
             <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all relative ${
                  activeTab === item.id 
                    ? 'text-accent font-bold bg-[#f1faff]' 
                    : 'text-secondary hover:bg-[#f1faff] hover:text-[#16191f]'
                }`}
             >
                {activeTab === item.id && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-accent"></div>}
                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-accent' : ''}`} />
                {item.name}
             </button>
           ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#eaeded]">
           <div className="bg-[#f2f3f3] p-3 rounded-[3px] border border-[#eaeded]">
              <p className="text-[10px] font-bold text-secondary uppercase mb-1">Status</p>
              <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 bg-success rounded-full"></div>
                 <span className="text-[11px] font-bold">Network Operational</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main AWS Style Content Area */}
      <main className="aws-content-area">
        <div className="px-10 py-8">
           {/* Breadcrumbs */}
           <div className="flex items-center gap-2 text-xs text-secondary mb-6 font-medium">
              <span>Connex System</span>
              <ChevronRight className="w-3 h-3" />
              <span className="capitalize">{activeTab.replace('health', 'Protocol Feed').replace('reports', 'Audit Vault')}</span>
           </div>

           <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             {activeTab === 'disputes' && <DisputePortal initialTxId={initialTxId} />}
             {activeTab === 'health' && <LiveNetworkFeed onNavigateToDispute={navigateToDispute} />}
             {activeTab === 'reports' && <AuditVaultPage />}
           </div>
        </div>
      </main>
    </div>
  );
}

export default App;
