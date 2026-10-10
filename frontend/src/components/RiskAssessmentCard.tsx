import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, AlertTriangle, AlertOctagon, CheckCircle2, 
  FileText, Send, Flag, Info, Activity, Layers, ArrowRight 
} from 'lucide-react';
import { VaspComplianceAlert } from './VaspComplianceAlert';

export const RiskAssessmentCard: React.FC = () => {
  const { 
    attribution, 
    wallet, 
    isAnalyzing, 
    flagWalletForInvestigation, 
    isFlagging, 
    flagSuccessMessage,
    openEvidencePackage,
    openAuthoritySubmission,
    targetAddress
  } = useApp();

  if (isAnalyzing || !attribution || attribution.walletAddress.toLowerCase() !== targetAddress.toLowerCase()) return null;

  const assessment = attribution.riskAssessment || {
    riskScore: wallet?.riskScore || 45,
    riskLevel: ((wallet?.riskScore || 45) >= 80 ? 'CRITICAL' : (wallet?.riskScore || 45) >= 60 ? 'HIGH' : (wallet?.riskScore || 45) >= 30 ? 'MEDIUM' : 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    label: 'Suspicious Activity Risk Score' as const,
    scoreBreakdown: [],
    disclaimer: 'Risk and attribution results are analytical assessments based on available blockchain evidence and should not be interpreted as definitive proof of ownership, fraud, or criminal activity.',
    evaluatedAt: new Date().toISOString()
  };

  const { riskScore, riskLevel, scoreBreakdown, vaspComplianceAlert, disclaimer } = assessment;

  // Institutional Risk Level Colors
  const getRiskStyle = (level: typeof riskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          badgeBg: 'bg-red-100 text-red-950 border-red-300',
          barColor: 'bg-red-800',
          borderAccent: 'border-l-red-800',
          textColor: 'text-red-900',
          icon: AlertOctagon,
          summary: 'Elevated anomaly signals and/or exposure to high-risk privacy or mixing infrastructure.'
        };
      case 'HIGH':
        return {
          badgeBg: 'bg-orange-100 text-orange-950 border-orange-300',
          barColor: 'bg-orange-700',
          borderAccent: 'border-l-orange-700',
          textColor: 'text-orange-900',
          icon: AlertTriangle,
          summary: 'Multiple concurrent risk indicators detected across velocity, volume, and multi-hop routing.'
        };
      case 'MEDIUM':
        return {
          badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
          barColor: 'bg-amber-600',
          borderAccent: 'border-l-amber-600',
          textColor: 'text-amber-900',
          icon: AlertTriangle,
          summary: 'Moderate behavioral variation from baseline retail parameters observed.'
        };
      case 'LOW':
      default:
        return {
          badgeBg: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          barColor: 'bg-emerald-700',
          borderAccent: 'border-l-emerald-700',
          textColor: 'text-emerald-900',
          icon: CheckCircle2,
          summary: 'No critical anomalies identified. Typical on-chain interaction patterns.'
        };
    }
  };

  const style = getRiskStyle(riskLevel);
  const LevelIcon = style.icon;

  return (
    <div className="space-y-4">
      {/* VASP Compliance Alert if applicable */}
      {vaspComplianceAlert && <VaspComplianceAlert alert={vaspComplianceAlert} />}

      {/* Main Institutional Risk Assessment Panel */}
      <div className={`p-6 rounded-lg gov-card space-y-6 border-l-4 ${style.borderAccent}`}>
        {/* Header & Score Gauge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-blue-700" />
                Heuristic Risk Assessment
              </span>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${style.badgeBg}`}>
                <LevelIcon className="h-3 w-3" />
                RISK LEVEL: {riskLevel}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Suspicious Activity Risk Score
            </h2>

            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              {style.summary}
            </p>
          </div>

          {/* Large Institutional Score Meter Card */}
          <div className="flex items-center gap-5 bg-slate-50 p-4 rounded-md border border-slate-200 shrink-0">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900">
                {riskScore} <span className="text-xs font-mono text-slate-500 font-normal">/ 100</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block mt-0.5">
                Risk Score
              </span>
            </div>

            <div className="h-12 w-[1px] bg-slate-300" />

            <div className="space-y-1 min-w-[140px]">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                <span>Rating:</span>
                <span className={`font-bold ${style.textColor}`}>{riskLevel}</span>
              </div>

              {/* Visual Score Meter */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${style.barColor}`} 
                  style={{ width: `${Math.max(6, riskScore)}%` }}
                />
              </div>

              <div className="text-[9px] font-mono text-slate-500 flex justify-between">
                <span>0 (Low)</span>
                <span>100 (Critical)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Prominent Flag for Investigation + Package + Submission */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => flagWalletForInvestigation()}
              disabled={isFlagging}
              className="px-4 py-2 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Flag className="h-4 w-4 text-amber-400" />
              <span>{isFlagging ? 'Flagging Wallet...' : 'Flag Wallet for Investigation'}</span>
            </button>

            <button
              onClick={() => openEvidencePackage()}
              className="px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="h-4 w-4 text-blue-700" />
              <span>Generate Evidence Package</span>
            </button>

            <button
              onClick={() => openAuthoritySubmission()}
              className="px-3.5 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 text-blue-200" />
              <span>Prepare Authority Submission</span>
            </button>
          </div>

          {/* Instant confirmation notice */}
          {flagSuccessMessage && (
            <div className="px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>{flagSuccessMessage}</span>
            </div>
          )}
        </div>

        {/* Explainable Factor Breakdown (Observable signals in application data) */}
        {scoreBreakdown && scoreBreakdown.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-blue-700" />
              Explainable Risk Score Factor Attribution
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {scoreBreakdown.map((f, idx) => (
                <div key={idx} className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-900">{f.name}</span>
                    <span className="font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                      {f.score} / {f.maxScore} pts
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>Signal: <strong className="text-slate-800">{f.signal}</strong></span>
                  </div>

                  <p className="text-xs text-slate-600 font-mono leading-relaxed pt-1 border-t border-slate-200/80">
                    {f.observedEvidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mandatory Regulatory Disclaimer */}
        <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
          <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-800">Regulatory & Forensics Disclaimer:</strong> {disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
