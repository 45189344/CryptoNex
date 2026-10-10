import React from 'react';
import { useApp } from '../context/AppContext';
import { RiskAssessmentCard } from '../components/RiskAssessmentCard';
import { RiskIndicators } from '../components/RiskIndicators';
import { InvestigationTimeline } from '../components/InvestigationTimeline';
import { ShieldAlert, AlertTriangle, FileText, Send, Flag, CheckCircle2 } from 'lucide-react';

export const RiskAlertsView: React.FC = () => {
  const { 
    attribution, 
    wallet, 
    timeline,
    openEvidencePackage, 
    openAuthoritySubmission,
    flagWalletForInvestigation,
    isFlagging,
    flagSuccessMessage
  } = useApp();

  if (!attribution || !wallet) {
    return (
      <div className="p-8 rounded-lg gov-card text-center text-slate-500 font-mono text-xs">
        <ShieldAlert className="h-10 w-10 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">No subject wallet analyzed yet.</p>
        <p className="text-xs text-slate-500 mt-1">Analyze a wallet to generate the Suspicious Activity Risk Score and forensic indicators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-900 mb-1">
            <ShieldAlert className="h-3.5 w-3.5 text-blue-700" />
            <span>INSTITUTIONAL RISK ASSESSMENT & FORENSIC TRIAGE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Risk Detection & Compliance Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evidence-based suspicious activity scoring, observable behavioral indicators, and investigation escalation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => flagWalletForInvestigation()}
            disabled={isFlagging}
            className="px-3.5 py-2 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Flag className="h-3.5 w-3.5 text-amber-400" />
            <span>{isFlagging ? 'Flagging...' : 'Flag Wallet'}</span>
          </button>

          <button
            onClick={() => openEvidencePackage()}
            className="px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-blue-700" />
            <span>Evidence Package</span>
          </button>

          <button
            onClick={() => openAuthoritySubmission()}
            className="px-3.5 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Authority Submission</span>
          </button>
        </div>
      </div>

      {flagSuccessMessage && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          <span>{flagSuccessMessage}</span>
        </div>
      )}

      {/* Main Risk Assessment Card */}
      <RiskAssessmentCard />

      {/* Evidence-Based Risk Indicators */}
      <RiskIndicators />

      {/* Chronological Investigation Timeline */}
      <InvestigationTimeline timeline={timeline} />
    </div>
  );
};
