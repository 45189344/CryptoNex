import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, AlertTriangle, Info, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { RiskIndicator } from '../types';

export const RiskIndicators: React.FC = () => {
  const { attribution, isAnalyzing } = useApp();

  if (isAnalyzing || !attribution) return null;

  const indicators = attribution.riskIndicators;

  const getSeverityBadge = (severity: RiskIndicator['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: 'bg-red-50 text-red-900 border-red-300', iconColor: 'text-red-700', icon: AlertOctagon };
      case 'HIGH':
        return { bg: 'bg-orange-50 text-orange-900 border-orange-300', iconColor: 'text-orange-700', icon: AlertTriangle };
      case 'MEDIUM':
        return { bg: 'bg-amber-50 text-amber-900 border-amber-300', iconColor: 'text-amber-700', icon: AlertTriangle };
      default:
        return { bg: 'bg-blue-50 text-blue-900 border-blue-300', iconColor: 'text-blue-700', icon: Info };
    }
  };

  return (
    <div className="p-6 rounded-lg gov-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-700" />
            Behavioral & Compliance Risk Indicators
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated heuristic detection of non-standard settlement patterns
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
          Indicators Only
        </span>
      </div>

      {indicators.length === 0 ? (
        <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>No critical behavioral anomalies or sanctioned mixer proximity detected in analyzed activity.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {indicators.map((ind) => {
            const style = getSeverityBadge(ind.severity);
            const Icon = style.icon;
            const indicatorName = ind.indicator || ind.title;
            const reasonText = ind.reason || ind.description;
            const evidenceText = ind.supportingEvidence || ind.description;

            return (
              <div
                key={ind.id}
                className="p-4 rounded-md bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 shrink-0 ${style.iconColor}`} />
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {indicatorName}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${style.bg}`}>
                      {ind.severity}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Reason</span>
                      <p className="text-slate-700 leading-relaxed font-sans text-xs">
                        {reasonText}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/80">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Supporting Evidence</span>
                      <p className="text-slate-900 font-mono text-[11px] bg-white p-2 rounded border border-slate-200 mt-0.5 leading-normal break-words">
                        {evidenceText}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Category: {ind.category || 'HEURISTIC'}</span>
                  <span>Observable On-Chain Fact</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compliance Note */}
      <div className="text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200 leading-tight">
        <span className="font-semibold text-slate-800">Compliance Statement:</span> Risk indicators are evidence-based analytical signals derived from observed blockchain ledger facts. They do not constitute proof of criminal misconduct.
      </div>
    </div>
  );
};
