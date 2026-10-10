import React from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import { 
  LayoutDashboard, Search, Wallet, ArrowLeftRight, 
  Network, Target, FileCode, FolderGit2, Building2, Sliders,
  ShieldAlert, CheckCircle2, ChevronRight, ClipboardList
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, targetAddress, attribution, isAnalyzing } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Wallet', icon: Search },
    { id: 'overview', label: 'Wallet Overview', icon: Wallet },
    { id: 'transactions', label: 'Transactions Ledger', icon: ArrowLeftRight },
    { id: 'graph', label: 'Transaction Graph', icon: Network, badge: 'Interactive' },
    { id: 'attribution', label: 'VASP Attribution', icon: Target, badge: attribution ? `${attribution.mostLikelyVasp.score}%` : undefined },
    { id: 'evidence', label: 'Evidence & Logic', icon: FileCode },
    { 
      id: 'risk-alerts', 
      label: 'Risk & Alerts', 
      icon: ShieldAlert, 
      badge: attribution?.riskAssessment ? attribution.riskAssessment.riskLevel : undefined 
    },
    { id: 'investigations', label: 'Investigation Cases', icon: FolderGit2 },
    { id: 'audit-trail', label: 'Audit Trail', icon: ClipboardList },
    { id: 'vasp-registry', label: 'VASP Registry', icon: Building2 },
    { id: 'settings', label: 'Scoring Weights', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      {/* Navigation Links */}
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Investigation Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-900 font-semibold border-l-4 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                  isActive 
                    ? 'bg-blue-200/70 text-blue-900' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Target Active Wallet Card */}
      <div className="pt-4 border-t border-slate-200">
        <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1.5">
            <span className="font-mono uppercase font-semibold text-[10px]">Active Subject</span>
            {isAnalyzing ? (
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" /> Analyzing...
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Indexed
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-slate-900 font-semibold truncate bg-white px-2 py-1 rounded border border-slate-200 mb-2">
            {targetAddress ? `${targetAddress.slice(0, 10)}...${targetAddress.slice(-8)}` : 'No wallet selected'}
          </div>
          {attribution && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
              <span className="text-slate-500 text-[11px]">Attributed VASP:</span>
              <span className="font-semibold text-emerald-800 text-xs">
                {attribution.mostLikelyVasp.vasp.name} ({attribution.mostLikelyVasp.score}%)
              </span>
            </div>
          )}
        </div>

        {/* Regulatory & SIH Disclaimer snippet */}
        <div className="mt-3 px-1 text-[10px] text-slate-500 leading-tight">
          <span className="font-semibold text-slate-700">Legal Notice:</span> Probabilistic attribution based on on-chain topology and behavioral patterns.
        </div>
      </div>
    </aside>
  );
};
