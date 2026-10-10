import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Activity, FileText, Cpu, ChevronDown, Landmark } from 'lucide-react';
import { BlockchainNetwork } from '../types';

export const Navbar: React.FC = () => {
  const { selectedNetwork, setSelectedNetwork, setIsReportModalOpen, attribution } = useApp();

  const networks: { id: BlockchainNetwork; name: string; color: string }[] = [
    { id: 'ethereum', name: 'Ethereum Mainnet', color: 'bg-blue-600' },
    { id: 'polygon', name: 'Polygon PoS', color: 'bg-purple-600' },
    { id: 'arbitrum', name: 'Arbitrum One', color: 'bg-sky-600' },
    { id: 'bsc', name: 'BNB Smart Chain', color: 'bg-amber-600' },
  ];

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
      {/* Brand & Agency Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-sm">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900">
                CRYPTO-NEX
              </span>
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono hidden sm:block">
              Financial Intelligence & Automated VASP Attribution
            </p>
          </div>
        </div>
      </div>

      {/* Center Institutional Status Badge */}
      <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-600"></span>
          <span className="font-medium text-slate-700">ML Engine Active</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1 text-slate-600">
          <Cpu className="h-3.5 w-3.5 text-slate-500" />
          <span>Multi-Hop Topology</span>
        </div>
        <span className="text-slate-300">|</span>
        <span className="text-[11px] font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
          Probabilistic v1.0
        </span>
      </div>

      {/* Right Controls & Network Selector */}
      <div className="flex items-center gap-3">
        {/* Network Selector */}
        <div className="relative">
          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value as BlockchainNetwork)}
            aria-label="Blockchain Network Selection"
            className="appearance-none bg-white border border-slate-300 rounded-md pl-7 pr-8 py-1.5 text-xs text-slate-800 font-mono hover:border-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer shadow-sm"
          >
            {networks.map((net) => (
              <option key={net.id} value={net.id}>
                {net.name}
              </option>
            ))}
          </select>
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className={`inline-block h-2 w-2 rounded-full ${networks.find(n => n.id === selectedNetwork)?.color}`} />
          </div>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
        </div>

        {/* Generate Report Button */}
        <button
          onClick={() => setIsReportModalOpen(true)}
          disabled={!attribution}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export Intelligence Report</span>
          <span className="sm:hidden">Report</span>
        </button>
      </div>
    </header>
  );
};
