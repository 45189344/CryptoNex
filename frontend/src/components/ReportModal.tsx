import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, Printer, Download, Copy, Shield, 
  FileText, CheckCircle2, AlertTriangle, Layers, Info 
} from 'lucide-react';

export const ReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, attribution, wallet, graph } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isReportModalOpen || !attribution || !wallet) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyJSON = () => {
    const reportData = {
      reportId: `CRX-REP-${wallet.address.slice(2, 8).toUpperCase()}-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      targetWallet: {
        address: wallet.address,
        blockchain: wallet.blockchain,
        statistics: wallet.statistics,
      },
      attribution: attribution.mostLikelyVasp,
      rankings: attribution.rankings,
      riskIndicators: attribution.riskIndicators,
      graphSummary: {
        totalNodes: graph?.nodes.length || 0,
        totalEdges: graph?.edges.length || 0,
      },
      methodology: attribution.scoringWeights,
      disclaimer: attribution.disclaimer
    };

    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-lg bg-white border border-slate-300 flex flex-col shadow-modal overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header & Controls */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-slate-900 text-white flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Investigation Intelligence Dossier
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                Official Law Enforcement & Compliance Probabilistic Report
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-xs font-mono text-slate-700 font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copied ? 'JSON Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto print:p-0 print:bg-white print:text-black">
          {/* Official Banner */}
          <div className="border border-slate-300 rounded-md p-4 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Report Reference</span>
              <span className="font-bold text-slate-900">
                CRX-REP-{wallet.address.slice(2, 8).toUpperCase()}-{Date.now().toString().slice(-6)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Classification</span>
              <span className="font-bold text-amber-800">OFFICIAL RECORD // LAW ENFORCEMENT & COMPLIANCE</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Timestamp</span>
              <span className="text-slate-800 font-medium">{new Date().toUTCString()}</span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 border-b border-slate-300 pb-1">
              1. Executive Attribution Summary
            </h4>
            <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3">
              <p className="text-xs text-slate-800 leading-relaxed">
                Automated multi-hop graph traversal and 5-factor behavioral heuristic scoring have identified{' '}
                <strong className="text-slate-900 font-bold">{attribution.mostLikelyVasp.vasp.name}</strong> as the most likely associated Virtual Asset Service Provider (VASP) for subject wallet{' '}
                <code className="text-slate-900 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">{wallet.address}</code> with an attribution probability of{' '}
                <strong className="text-emerald-800 font-extrabold">{attribution.mostLikelyVasp.score}%</strong> (Confidence Rating: {attribution.mostLikelyVasp.confidence}).
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-3 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] block">Primary VASP</span>
                  <span className="font-bold text-slate-900">{attribution.mostLikelyVasp.vasp.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Score</span>
                  <span className="font-bold text-emerald-800">{attribution.mostLikelyVasp.score}%</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Topology Distance</span>
                  <span className="font-bold text-slate-900">{attribution.mostLikelyVasp.evidence.shortestHopDistance} Hop(s)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Volume Channel</span>
                  <span className="font-bold text-blue-900">{attribution.mostLikelyVasp.evidence.volumeOverlapETH} ETH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Candidate Rankings Leaderboard */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 border-b border-slate-300 pb-1">
              2. Candidate VASP Probabilistic Rankings
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-700 text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Rank</th>
                    <th className="p-2.5">VASP Name</th>
                    <th className="p-2.5">Type / Jurisdiction</th>
                    <th className="p-2.5">Score</th>
                    <th className="p-2.5">Confidence</th>
                    <th className="p-2.5">Shortest Hop</th>
                    <th className="p-2.5">Volume Overlap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {attribution.rankings.map((r) => (
                    <tr key={r.vasp.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold">#{r.rank}</td>
                      <td className="p-2.5 font-bold text-slate-900">{r.vasp.name}</td>
                      <td className="p-2.5 text-slate-600">{r.vasp.type} ({r.vasp.country})</td>
                      <td className="p-2.5 font-bold text-slate-900">{r.score}%</td>
                      <td className="p-2.5 font-semibold">{r.confidence}</td>
                      <td className="p-2.5">{r.evidence.shortestHopDistance} Hop(s)</td>
                      <td className="p-2.5">{r.evidence.volumeOverlapETH} ETH</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Target Wallet Forensic Telemetry */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 border-b border-slate-300 pb-1">
              3. Target Wallet Forensic Statistics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Total Volume</span>
                <span className="font-bold text-slate-900">{wallet.statistics.totalVolumeETH} ETH</span>
              </div>
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Transfers (In/Out)</span>
                <span className="font-bold text-slate-900">
                  {wallet.statistics.incomingTransactions} IN / {wallet.statistics.outgoingTransactions} OUT
                </span>
              </div>
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Unique Counterparties</span>
                <span className="font-bold text-slate-900">{wallet.statistics.uniqueCounterparties}</span>
              </div>
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Velocity</span>
                <span className="font-bold text-slate-900">{wallet.statistics.velocityPerHour} tx/hr</span>
              </div>
            </div>
          </div>

          {/* Section 4: Behavioral & Compliance Risk Indicators */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 border-b border-slate-300 pb-1">
              4. Behavioral Risk & Intelligence Indicators
            </h4>
            <div className="space-y-2">
              {attribution.riskIndicators.map((ind) => (
                <div key={ind.id} className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">{ind.title} ({ind.severity}): </span>
                    <span className="text-slate-600">{ind.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Methodology & Mandatory Compliance Disclaimers */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 border-b border-slate-300 pb-1">
              5. Methodology & Legal Compliance Disclaimers
            </h4>
            <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2 text-[11px] text-slate-700 leading-relaxed">
              <p>
                <strong>PROBABILISTIC ATTRIBUTION:</strong> This report is generated through mathematical graph topology analysis, on-chain clustering, and behavioral heuristics. It represents probabilistic attribution, NOT proof of wallet ownership or natural person identification.
              </p>
              <p>
                <strong>COMPLIANCE BOUNDARIES:</strong> The platform does not store or process natural person PII. All cluster data is segregated into Publicly Verified Registries vs Demo Simulations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
