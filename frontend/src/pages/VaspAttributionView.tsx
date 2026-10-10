import React from 'react';
import { useApp } from '../context/AppContext';
import { VaspAttributionCard } from '../components/VaspAttributionCard';
import { RiskAssessmentCard } from '../components/RiskAssessmentCard';
import { RiskIndicators } from '../components/RiskIndicators';
import { InvestigationTimeline } from '../components/InvestigationTimeline';
import { Target, FileText, ArrowRight, ShieldAlert } from 'lucide-react';

export const VaspAttributionView: React.FC = () => {
  const { setActiveTab, setIsReportModalOpen, timeline, attribution } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-700" />
            VASP Attribution & Risk Assessment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Probabilistic ranking, heuristic risk assessment, and evidence evaluation against known Virtual Asset Service Providers
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('risk-alerts')}
            className="px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>Risk Center</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Export Case Dossier</span>
          </button>
        </div>
      </div>

      <VaspAttributionCard />

      <RiskAssessmentCard />

      <RiskIndicators />

      <InvestigationTimeline timeline={timeline || attribution?.timeline} />

      <div className="p-6 rounded-lg gov-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Want to inspect the underlying mathematical proof?</h4>
          <p className="text-xs text-slate-500 mt-0.5">Explore the 5-factor breakdown (Graph Proximity, Volume, Frequency, Behavioral, Temporal).</p>
        </div>
        <button
          onClick={() => setActiveTab('evidence')}
          className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
        >
          <span>Open Evidence Matrix</span>
          <ArrowRight className="h-3.5 w-3.5 text-blue-700" />
        </button>
      </div>
    </div>
  );
};
