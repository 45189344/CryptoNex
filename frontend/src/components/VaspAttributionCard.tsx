import React from 'react';
import { useApp } from '../context/AppContext';
import { Target, ShieldCheck, AlertTriangle, ArrowRight, ExternalLink, Activity, Info, Award } from 'lucide-react';

export const VaspAttributionCard: React.FC = () => {
  const { attribution, isAnalyzing, targetAddress, selectedPreset, selectedNetwork, maxHops, setActiveTab } = useApp();

  if (isAnalyzing) {
    return (
      <div className="p-8 rounded-lg gov-card flex flex-col items-center justify-center min-h-[320px] text-center">
        <div className="relative mb-4">
          <div className="h-12 w-12 rounded-full border-3 border-blue-200 border-t-blue-700 animate-spin" />
          <Target className="h-5 w-5 text-blue-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h4 className="text-base font-bold text-slate-900 mb-1">
          Computing Multi-Factor VASP Attribution
        </h4>
        <p className="text-xs text-slate-500 max-w-md font-mono">
          Traversing multi-hop graph topology, cluster matching, and calculating weighted behavioral scores...
        </p>
      </div>
    );
  }

  // Stale state validation: Ensure displayed attribution strictly corresponds to currently targeted wallet
  const isMatchingWallet = attribution && attribution.walletAddress.toLowerCase() === targetAddress.toLowerCase();

  if (!attribution || !isMatchingWallet) {
    return (
      <div className="p-8 rounded-lg gov-card text-center text-slate-500">
        <Target className="h-10 w-10 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">
          {!attribution ? 'No subject wallet analyzed yet.' : 'Analysis state refreshing for current wallet...'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Click "Run Analysis" to compute probabilistic VASP attribution for <span className="font-mono text-slate-700 font-semibold">{targetAddress.slice(0, 10)}...{targetAddress.slice(-8)}</span>.
        </p>
      </div>
    );
  }

  const { mostLikelyVasp, rankings, disclaimer } = attribution;

  return (
    <div className="space-y-4">
      {/* Benchmark Expectation vs Actual Analysis Result Banner */}
      {selectedPreset && (
        <div className="p-3.5 rounded-md bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Award className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Benchmark Verification Dossier ({selectedPreset.id.toUpperCase()})
              </div>
              <div className="text-xs font-semibold text-slate-200">
                {selectedPreset.name.split(':')[0]}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Benchmark Expected: <strong className="text-amber-300">{selectedPreset.primaryVaspExpected || selectedPreset.expectedVasp} ~{selectedPreset.expectedScore}%</strong>
            </span>
            <span className="text-slate-500">vs</span>
            <span className="px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-600 font-bold">
              Actual Analysis: <strong className="text-white">{mostLikelyVasp.vasp.name} {mostLikelyVasp.score}%</strong>
            </span>
          </div>
        </div>
      )}

      {/* Hero: Primary Probable Associated VASP */}
      <div className="p-6 rounded-lg gov-card relative border-l-4 border-l-blue-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* VASP Primary Entity Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-900 font-bold flex items-center gap-1.5">
                <Target className="h-4 w-4 text-blue-700" />
                Probable VASP Association:
              </span>
              {mostLikelyVasp.isDemoAttribution ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-bold">
                  DEMO SIMULATION CLUSTER
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-700" /> VERIFIED PUBLIC REGISTRY
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {mostLikelyVasp.vasp.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                  {mostLikelyVasp.vasp.type}
                </span>
                <span className="text-xs font-mono text-slate-600 hidden sm:inline">
                  📍 {mostLikelyVasp.vasp.country}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              {mostLikelyVasp.vasp.description}
            </p>
          </div>

          {/* Large Attribution Score Card */}
          <div className="flex items-center gap-5 bg-slate-50 p-4 rounded-md border border-slate-200 shrink-0">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900">
                {mostLikelyVasp.score}%
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Attribution Score
              </span>
            </div>

            <div className="h-10 w-[1px] bg-slate-300" />

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-600 font-medium">Confidence:</span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  mostLikelyVasp.confidence === 'HIGH'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : mostLikelyVasp.confidence === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-200 text-slate-800'
                }`}>
                  {mostLikelyVasp.confidence}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                {mostLikelyVasp.evidence.shortestHopDistance === 1 ? 'Direct 1-Hop Ingestion' : `${mostLikelyVasp.evidence.shortestHopDistance}-Hop Topology`}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Highlights Metric Grid */}
        <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px] font-medium">Direct Interactions</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {mostLikelyVasp.evidence.directInteractionsCount} transfers
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px] font-medium">Volume Channel</span>
            <span className="font-mono font-bold text-blue-900 text-sm">
              {mostLikelyVasp.evidence.volumeOverlapETH} ETH ({mostLikelyVasp.evidence.volumeOverlapPercent}%)
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px] font-medium">Shortest Topology Distance</span>
            <span className="font-mono font-bold text-emerald-800 text-sm">
              {mostLikelyVasp.evidence.shortestHopDistance} Hop{mostLikelyVasp.evidence.shortestHopDistance > 1 ? 's' : ''}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span className="text-slate-500 block text-[11px] font-medium">Matched Cluster Nodes</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {mostLikelyVasp.evidence.matchedClusters.length} addresses
            </span>
          </div>
        </div>
      </div>

      {/* Comparative VASP Leaderboard */}
      <div className="p-6 rounded-lg gov-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-700" />
              Candidate VASP Ranking Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative probabilistic distribution across all analyzed candidate clusters
            </p>
          </div>
          <button
            onClick={() => setActiveTab('evidence')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
          >
            <span>Inspect 5-Factor Matrix</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {rankings.map((item) => (
            <div
              key={item.vasp.id}
              className={`p-3.5 rounded-md border transition-colors ${
                item.rank === 1
                  ? 'bg-blue-50/50 border-blue-200'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`h-5 w-5 rounded flex items-center justify-center font-mono font-bold text-xs ${
                    item.rank === 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.rank}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 text-sm mr-2">{item.vasp.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {item.vasp.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-base text-slate-900">{item.score}%</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    item.confidence === 'HIGH' 
                      ? 'bg-emerald-100 text-emerald-900' 
                      : item.confidence === 'MEDIUM' 
                        ? 'bg-amber-100 text-amber-900' 
                        : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.confidence}
                  </span>
                </div>
              </div>

              {/* Progress meter */}
              <div className="w-full bg-slate-100 rounded h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded transition-all duration-500 ${
                    item.rank === 1 
                      ? 'bg-blue-700' 
                      : item.rank === 2 
                        ? 'bg-slate-700' 
                        : 'bg-slate-400'
                  }`}
                  style={{ width: `${Math.max(4, item.score)}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[11px] font-mono text-slate-500">
                <span>Hop Distance: {item.evidence.shortestHopDistance === 0 ? 'No direct path' : `${item.evidence.shortestHopDistance} hop(s)`}</span>
                <span>Volume Overlap: {item.evidence.volumeOverlapETH} ETH</span>
                <span>Interactions: {item.evidence.totalInteractionsCount} txs</span>
              </div>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer Pill */}
        <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
