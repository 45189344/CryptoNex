import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { 
  FileCode, CheckCircle2, ShieldAlert, Cpu, 
  TrendingUp, Clock, Network, BarChart3, Sliders, ExternalLink 
} from 'lucide-react';

export const EvidenceBreakdown: React.FC = () => {
  const { attribution, isAnalyzing, setActiveTab } = useApp();

  if (isAnalyzing || !attribution) {
    return (
      <div className="p-8 rounded-lg gov-card text-center text-slate-500">
        <FileCode className="h-10 w-10 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">Analyze a wallet to inspect attribution evidence and factor breakdown.</p>
      </div>
    );
  }

  const { mostLikelyVasp } = attribution;
  const { factors, matchedClusters } = mostLikelyVasp.evidence;

  // Radar Chart Data format
  const radarData = [
    { factor: 'Graph Proximity', score: Math.round(factors.graphProximity.score * 100), fullMark: 100 },
    { factor: 'Volume Overlap', score: Math.round(factors.transactionVolume.score * 100), fullMark: 100 },
    { factor: 'Interaction Freq', score: Math.round(factors.interactionFrequency.score * 100), fullMark: 100 },
    { factor: 'Behavior Signature', score: Math.round(factors.behavioralSimilarity.score * 100), fullMark: 100 },
    { factor: 'Temporal Window', score: Math.round(factors.temporalPattern.score * 100), fullMark: 100 },
  ];

  const factorList = [
    {
      key: 'graphProximity',
      title: '1. Graph Proximity',
      weight: '30%',
      icon: Network,
      color: 'text-blue-700',
      data: factors.graphProximity,
    },
    {
      key: 'transactionVolume',
      title: '2. Transaction Volume Overlap',
      weight: '25%',
      icon: TrendingUp,
      color: 'text-emerald-700',
      data: factors.transactionVolume,
    },
    {
      key: 'interactionFrequency',
      title: '3. Interaction Frequency',
      weight: '20%',
      icon: BarChart3,
      color: 'text-slate-800',
      data: factors.interactionFrequency,
    },
    {
      key: 'behavioralSimilarity',
      title: '4. Behavioral Similarity',
      weight: '15%',
      icon: Cpu,
      color: 'text-slate-700',
      data: factors.behavioralSimilarity,
    },
    {
      key: 'temporalPattern',
      title: '5. Temporal Alignment',
      weight: '10%',
      icon: Clock,
      color: 'text-amber-700',
      data: factors.temporalPattern,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="p-6 rounded-lg gov-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="h-5 w-5 text-blue-700" />
              Explainable AI: 5-Factor Attribution Evidence Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Mathematical rationale and counterparty metrics driving the {mostLikelyVasp.score}% attribution score for {mostLikelyVasp.vasp.name}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start md:self-auto shadow-xs"
          >
            <Sliders className="h-3.5 w-3.5 text-blue-700" />
            <span>Customize Factor Weights</span>
          </button>
        </div>

        {/* Radar & Summary Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Radar Chart Container */}
          <div className="lg:col-span-5 h-64 bg-slate-50 rounded-md border border-slate-200 p-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="factor" stroke="#475569" tick={{ fill: '#334155', fontSize: 10, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar name={mostLikelyVasp.vasp.name} dataKey="score" stroke="#1d4ed8" fill="#2563eb" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Findings Summary */}
          <div className="lg:col-span-7 space-y-3">
            <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-xs font-mono font-bold uppercase text-blue-900">
                Behavioral Pattern Analysis:
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {mostLikelyVasp.evidence.behavioralPatternSummary}
              </p>
            </div>

            <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-xs font-mono font-bold uppercase text-emerald-900">
                Temporal & Settlement Window:
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {mostLikelyVasp.evidence.temporalAlignmentWindow}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Factors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {factorList.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="p-5 rounded-lg gov-card space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-xs font-bold font-mono text-slate-900">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Weight: {item.weight}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.data.explanation}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Raw Factor Score:</span>
                  <span className="font-bold text-slate-900">{(item.data.score * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Weighted Contribution:</span>
                  <span className="font-bold text-blue-900">+{(item.data.weightedScore * 100).toFixed(1)} pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Matched Known Address Clusters Table */}
      <div className="p-6 rounded-lg gov-card space-y-4">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          Matched VASP Address Clusters ({matchedClusters.length})
        </h4>

        {matchedClusters.length === 0 ? (
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
            No direct or multi-hop cluster addresses recorded for this candidate.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Cluster Address</th>
                  <th className="p-3">Address Role</th>
                  <th className="p-3">Hop Distance</th>
                  <th className="p-3">Flow Volume</th>
                  <th className="p-3">Transfers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {matchedClusters.map((cluster, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-900 font-semibold flex items-center gap-1.5">
                      <span>{cluster.clusterAddress}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] border border-slate-200 text-slate-700 font-medium">
                        {cluster.addressType}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-emerald-800">
                      {cluster.hopDistance} Hop{cluster.hopDistance > 1 ? 's' : ''}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      {cluster.flowValueETH.toFixed(4)} ETH
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {cluster.txCount} txs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
