import React from 'react';
import { useApp } from '../context/AppContext';
import { TransactionGraph } from '../components/TransactionGraph';
import { Network, HelpCircle, Layers, ShieldCheck } from 'lucide-react';

export const GraphView: React.FC = () => {
  const { wallet } = useApp();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Network className="h-6 w-6 text-blue-700" />
            Interactive Multi-Hop Transaction Graph
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Radial topology visualization of target wallet flows across 1-Hop, 2-Hop, and 3-Hop VASP clusters
          </p>
        </div>

        <div className="text-[11px] font-mono text-slate-600 bg-white px-3 py-1.5 rounded-md border border-slate-200 self-start sm:self-auto shadow-subtle">
          Tip: Click any node to inspect forensics & re-focus target
        </div>
      </div>

      {/* Main Fullscreen Graph Canvas */}
      <TransactionGraph fullscreen={true} />
    </div>
  );
};
