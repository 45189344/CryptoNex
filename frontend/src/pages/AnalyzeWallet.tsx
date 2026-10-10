import React from 'react';
import { useApp } from '../context/AppContext';
import { WalletSearch } from '../components/WalletSearch';
import { VaspAttributionCard } from '../components/VaspAttributionCard';
import { RiskAssessmentCard } from '../components/RiskAssessmentCard';
import { 
  Search, ShieldCheck, Cpu, Network, Target, 
  CheckCircle2, ArrowRight, Sparkles, Activity 
} from 'lucide-react';

export const AnalyzeWallet: React.FC = () => {
  const { isAnalyzing, analysisStep, attribution, setActiveTab, targetAddress } = useApp();

  const isMatchingWallet = attribution && attribution.walletAddress.toLowerCase() === targetAddress.toLowerCase();

  const steps = [
    { num: 1, label: 'Address Validation & Checksum Verification', icon: ShieldCheck },
    { num: 2, label: 'On-Chain Ingestion & Counterparty Extraction', icon: Search },
    { num: 3, label: 'Multi-Hop Transaction Graph Construction', icon: Network },
    { num: 4, label: 'VASP Cluster Matching & Behavioral Profiling', icon: Cpu },
    { num: 5, label: '5-Factor Weighted Probabilistic Scoring', icon: Target },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Deep Wallet Analysis & Attribution Pipeline
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Execute automated multi-hop traversal and behavioral cluster matching against known VASP registries
        </p>
      </div>

      <WalletSearch />

      {/* Pipeline Execution Progress */}
      {isAnalyzing && (
        <div className="p-6 rounded-lg gov-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-mono uppercase text-blue-900 font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-700 animate-pulse" />
              Automated Pipeline Execution in Progress
            </span>
            <span className="text-xs font-mono text-slate-600 font-medium">
              Step {analysisStep} of 5
            </span>
          </div>

          <div className="space-y-2">
            {steps.map((s) => {
              const Icon = s.icon;
              const isDone = analysisStep > s.num;
              const isCurrent = analysisStep === s.num;
              return (
                <div
                  key={s.num}
                  className={`p-3 rounded-md border flex items-center justify-between transition-colors ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                      : isCurrent
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded flex items-center justify-center font-mono text-xs font-bold ${
                      isDone 
                        ? 'bg-emerald-700 text-white' 
                        : isCurrent 
                          ? 'bg-blue-700 text-white' 
                          : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.num}
                    </div>
                    <span className="text-xs">{s.label}</span>
                  </div>

                  {isCurrent && (
                    <div className="h-4 w-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results View */}
      {!isAnalyzing && attribution && isMatchingWallet && (
        <div className="space-y-6">
          <VaspAttributionCard />

          <RiskAssessmentCard />

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setActiveTab('graph')}
              className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Network className="h-3.5 w-3.5 text-blue-700" />
              <span>Explore Graph Visualization</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
