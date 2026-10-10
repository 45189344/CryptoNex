import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, ExternalLink, ShieldCheck, AlertTriangle, Target, Network } from 'lucide-react';

export const NodeDetailModal: React.FC = () => {
  const { inspectedNode, setInspectedNode, runAnalysis, setActiveTab } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!inspectedNode) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(inspectedNode.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyzeAsTarget = () => {
    const addr = inspectedNode.address;
    setInspectedNode(null);
    runAnalysis(addr);
    setActiveTab('overview');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-lg bg-white border border-slate-300 p-6 space-y-5 shadow-modal relative animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-700" />
            <h3 className="text-base font-bold text-slate-900">Node Forensics & Attribution Data</h3>
          </div>
          <button
            onClick={() => setInspectedNode(null)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Address & Copy */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase font-semibold text-slate-600">On-Chain Subject Address</label>
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-slate-50 border border-slate-200">
            <span className="font-mono text-xs text-slate-900 font-semibold truncate flex-1">{inspectedNode.address}</span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
              title="Copy Address"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Node Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[10px] block uppercase font-medium">Hop Distance</span>
            <span className="font-bold text-emerald-800 text-sm">{inspectedNode.hop} Hop(s) from Subject</span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[10px] block uppercase font-medium">Topology Role</span>
            <span className="font-bold text-slate-900 text-sm">{inspectedNode.type}</span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[10px] block uppercase font-medium">Total Flow Volume</span>
            <span className="font-bold text-blue-900 text-sm">{inspectedNode.totalVolume.toFixed(4)} ETH</span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[10px] block uppercase font-medium">Interactions Count</span>
            <span className="font-bold text-slate-900 text-sm">{inspectedNode.txCount} txs</span>
          </div>
        </div>

        {/* VASP Details if matched */}
        {inspectedNode.isVASP && (
          <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                VASP Entity: {inspectedNode.vaspName}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                {inspectedNode.isDemoData ? 'DEMO SIMULATION' : 'VERIFIED PUBLIC'}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              This address cluster is mapped to {inspectedNode.vaspName} centralized custody infrastructure.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            onClick={() => setInspectedNode(null)}
            className="px-4 py-2 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleAnalyzeAsTarget}
            className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Target className="h-3.5 w-3.5" />
            <span>Set as New Target</span>
          </button>
        </div>
      </div>
    </div>
  );
};
