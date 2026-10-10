import React from 'react';
import { ShieldAlert, Building2, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';
import { VaspComplianceAlert as VaspComplianceAlertType } from '../types';

interface Props {
  alert?: VaspComplianceAlertType;
}

export const VaspComplianceAlert: React.FC<Props> = ({ alert }) => {
  if (!alert || !alert.recommended) return null;

  const isCritical = alert.riskLevel === 'CRITICAL';

  return (
    <div className={`p-5 rounded-lg border transition-all ${
      isCritical 
        ? 'bg-red-50/80 border-red-300 text-red-950' 
        : 'bg-orange-50/80 border-orange-300 text-orange-950'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-md shrink-0 ${
            isCritical ? 'bg-red-900 text-white' : 'bg-orange-800 text-white'
          }`}>
            <ShieldAlert className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wide">
                VASP Compliance Review Recommended
              </h3>
              <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${
                isCritical 
                  ? 'bg-red-200 text-red-900 border-red-400' 
                  : 'bg-orange-200 text-orange-900 border-orange-400'
              }`}>
                {alert.riskLevel} RISK ADVISORY
              </span>
            </div>

            <p className="text-xs leading-relaxed font-sans text-slate-800 max-w-2xl">
              Subject wallet exhibits concentrated transaction volume and topological proximity to{' '}
              <strong className="font-semibold text-slate-950">{alert.probableVasp}</strong> settlement infrastructure. Recommended for enhanced review under FATF Travel Rule and institutional AML triage standards.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 shrink-0 bg-white/70 backdrop-blur-xs p-3 rounded-md border border-slate-200 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Probable VASP:</span>
            <span className="font-bold text-slate-900">{alert.probableVasp}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Attribution Score:</span>
            <span className="font-bold text-blue-900">{alert.attributionScore}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Evidence Strength:</span>
            <span className="font-semibold text-emerald-800 text-[11px]">{alert.evidenceStrength}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-600 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
          <span>Notice: Platform advisory only. Does not automatically freeze, block, or disable accounts or assets.</span>
        </div>
        <span className="font-semibold text-slate-700">Protocol: Enhanced Due Diligence (EDD)</span>
      </div>
    </div>
  );
};
