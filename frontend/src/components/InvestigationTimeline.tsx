import React from 'react';
import { 
  Clock, CheckCircle2, ShieldAlert, FileText, Send, 
  Search, Network, Target, Cpu, Activity, AlertCircle 
} from 'lucide-react';
import { TimelineEvent } from '../types';

interface Props {
  timeline?: TimelineEvent[];
}

export const InvestigationTimeline: React.FC<Props> = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-6 rounded-lg gov-card text-center text-slate-500 font-mono text-xs">
        <Clock className="h-6 w-6 mx-auto text-slate-400 mb-2" />
        <span>No chronological investigation milestones recorded yet.</span>
      </div>
    );
  }

  const getEventIcon = (eventType: TimelineEvent['eventType']) => {
    switch (eventType) {
      case 'WALLET_SUBMITTED':
        return { icon: Search, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'BLOCKCHAIN_PROCESSED':
        return { icon: Cpu, color: 'text-slate-700 bg-slate-100 border-slate-300' };
      case 'GRAPH_GENERATED':
      case 'MULTI_HOP_COMPLETED':
        return { icon: Network, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'VASP_ATTRIBUTION_COMPLETED':
        return { icon: Target, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'RISK_ASSESSMENT_COMPLETED':
        return { icon: Activity, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'WALLET_FLAGGED':
        return { icon: ShieldAlert, color: 'text-orange-700 bg-orange-50 border-orange-200' };
      case 'EVIDENCE_PACKAGE_GENERATED':
        return { icon: FileText, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'SUBMISSION_PREPARED':
        return { icon: Send, color: 'text-emerald-800 bg-emerald-100 border-emerald-300' };
      case 'CASE_STATUS_UPDATED':
        return { icon: CheckCircle2, color: 'text-blue-800 bg-blue-100 border-blue-300' };
      default:
        return { icon: Clock, color: 'text-slate-700 bg-slate-100 border-slate-300' };
    }
  };

  return (
    <div className="p-6 rounded-lg gov-card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-700" />
            Investigation & Analysis Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological forensic audit sequence with immutable timestamps
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
          {timeline.length} Recorded Milestones
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
        {timeline.map((event, idx) => {
          const style = getEventIcon(event.eventType);
          const Icon = style.icon;
          return (
            <div key={event.id || idx} className="relative group">
              {/* Timeline marker icon */}
              <div className={`absolute -left-6 top-0.5 h-6 w-6 rounded-full border flex items-center justify-center shadow-2xs ${style.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200 hover:border-slate-300 transition-colors space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {event.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(event.timestamp).toLocaleString()} ({new Date(event.timestamp).toISOString().slice(11, 19)} UTC)
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {event.description}
                </p>

                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="pt-1.5 flex flex-wrap gap-2 text-[10px] font-mono text-slate-500">
                    {Object.entries(event.metadata).map(([k, v]) => (
                      <span key={k} className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {k}: <strong className="text-slate-800">{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
