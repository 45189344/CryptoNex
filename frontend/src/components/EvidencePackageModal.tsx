import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, Copy, Download, Printer, FileText, CheckCircle2, 
  ShieldAlert, Network, Target, Activity, Layers, Landmark, Database 
} from 'lucide-react';

export const EvidencePackageModal: React.FC = () => {
  const { 
    isEvidenceModalOpen, 
    setIsEvidenceModalOpen, 
    activeEvidencePackage 
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'graph' | 'attribution' | 'risk'>('overview');

  if (!isEvidenceModalOpen || !activeEvidencePackage) return null;

  const pkg = activeEvidencePackage;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(pkg, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pkg, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${pkg.packageId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl max-h-[90vh] rounded-lg bg-white border border-slate-300 flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-slate-900 text-white flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Forensic Evidence Package
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-bold border border-blue-200">
                  {pkg.packageId}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                Official Law Enforcement & Compliance Evidentiary Dossier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-xs font-mono text-slate-700 font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-blue-700" />
              <span>Download</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={() => setIsEvidenceModalOpen(false)}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0 overflow-x-auto">
          {[
            { id: 'overview', label: '1. Summary & Metadata' },
            { id: 'transactions', label: `2. Transactions (${pkg.transactionHashes.length})` },
            { id: 'graph', label: '3. Graph Telemetry' },
            { id: 'attribution', label: '4. VASP 5-Factor Breakdown' },
            { id: 'risk', label: `5. Risk Indicators (${pkg.riskIndicators.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-mono font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-700 text-blue-900 font-bold bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto font-sans text-xs">
          {/* Official Banner */}
          <div className="border border-slate-300 rounded-md p-3.5 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Subject Wallet</span>
              <span className="font-bold text-slate-900 break-all">{pkg.targetWallet}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Blockchain Network</span>
              <span className="font-bold text-blue-900 uppercase">{pkg.blockchain} EVM</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Classification</span>
              <span className="font-bold text-amber-800">{pkg.caseMetadata.classification}</span>
            </div>
          </div>

          {/* Tab 1: Summary & Metadata */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Primary VASP</span>
                  <span className="text-sm font-bold text-slate-900">{pkg.attributionScores.primaryVasp}</span>
                </div>
                <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Attribution Score</span>
                  <span className="text-sm font-bold text-emerald-800">{pkg.attributionScores.score}%</span>
                </div>
                <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Total Volume</span>
                  <span className="text-sm font-bold text-slate-900">{pkg.transactionSummary.totalVolumeETH} ETH</span>
                </div>
                <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Max Hop Depth</span>
                  <span className="text-sm font-bold text-slate-900">{pkg.hopDepth} Hops</span>
                </div>
              </div>

              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-800">
                  Analyst Forensic Observations
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-mono">
                  {pkg.analystNotes}
                </p>
              </div>

              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2 font-mono text-[11px]">
                <span className="text-slate-500 uppercase font-bold block">Telemetry Telemetry Stats</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700">
                  <div>Transfers: <strong>{pkg.transactionSummary.totalTransactions}</strong></div>
                  <div>Inflows: <strong>{pkg.senderReceiverInfo.totalIncoming}</strong></div>
                  <div>Outflows: <strong>{pkg.senderReceiverInfo.totalOutgoing}</strong></div>
                  <div>Counterparties: <strong>{pkg.senderReceiverInfo.uniqueCounterparties}</strong></div>
                  <div>Avg Ticket: <strong>{pkg.transactionSummary.avgTransactionValue} ETH</strong></div>
                  <div>Velocity: <strong>{pkg.transactionSummary.velocityPerHour} tx/hr</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Transactions & Hashes */}
          {activeTab === 'transactions' && (
            <div className="space-y-3">
              <div className="overflow-x-auto border border-slate-200 rounded-md">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">TX Hash</th>
                      <th className="p-2.5">From</th>
                      <th className="p-2.5">To</th>
                      <th className="p-2.5">Value (ETH)</th>
                      <th className="p-2.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {pkg.transactionHashes.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-blue-900 break-all">{t.txHash}</td>
                        <td className="p-2.5 text-slate-600 truncate max-w-[120px]">{t.fromAddress}</td>
                        <td className="p-2.5 text-slate-600 truncate max-w-[120px]">{t.toAddress}</td>
                        <td className="p-2.5 font-bold text-slate-900">{t.value} {t.token}</td>
                        <td className="p-2.5 text-slate-500 text-[10px]">{new Date(t.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Graph Telemetry */}
          {activeTab === 'graph' && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Total Nodes Mapped</span>
                  <span className="text-lg font-bold text-slate-900">{pkg.transactionGraphSummary.totalNodes}</span>
                </div>
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Directed Flow Edges</span>
                  <span className="text-lg font-bold text-slate-900">{pkg.transactionGraphSummary.totalEdges}</span>
                </div>
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Intermediary Relays</span>
                  <span className="text-lg font-bold text-amber-800">{pkg.transactionGraphSummary.intermediaryCount}</span>
                </div>
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">VASP Nodes Matched</span>
                  <span className="text-lg font-bold text-emerald-800">{pkg.transactionGraphSummary.vaspNodeCount}</span>
                </div>
              </div>

              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-xs font-sans text-slate-700 leading-relaxed">
                <strong className="font-mono text-slate-900 block mb-1">Graph Traversal Summary:</strong>
                Multi-hop BFS algorithm traversed up to {pkg.hopDepth} hops from target wallet {pkg.targetWallet}. The reconstructed topology isolates non-custodial intermediary clusters and maps terminal settlement paths into identified exchange deposit sweepers.
              </div>
            </div>
          )}

          {/* Tab 4: VASP Attribution Candidates & 5-Factor */}
          {activeTab === 'attribution' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200 rounded-md font-mono">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Rank</th>
                      <th className="p-2.5">VASP Candidate</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Score</th>
                      <th className="p-2.5">Confidence</th>
                      <th className="p-2.5">Shortest Hop</th>
                      <th className="p-2.5">Volume Overlap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {pkg.vaspAttributionCandidates.map((c) => (
                      <tr key={c.rank} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold">#{c.rank}</td>
                        <td className="p-2.5 font-bold text-slate-900">{c.vaspName}</td>
                        <td className="p-2.5 text-slate-600">{c.vaspType}</td>
                        <td className="p-2.5 font-bold text-blue-900">{c.score}%</td>
                        <td className="p-2.5">{c.confidence}</td>
                        <td className="p-2.5">{c.shortestHop} Hop(s)</td>
                        <td className="p-2.5">{c.volumeOverlapETH} ETH</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 5-Factor Evidence Summary */}
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs">
                <h4 className="font-bold text-slate-900 uppercase">5-Factor Attribution Evidence Matrix</h4>
                <div className="space-y-1.5 text-slate-700">
                  <div>1. Graph Proximity (30%): {pkg.fiveFactorEvidenceBreakdown.graphProximity.explanation}</div>
                  <div>2. Volume Overlap (25%): {pkg.fiveFactorEvidenceBreakdown.transactionVolume.explanation}</div>
                  <div>3. Interaction Frequency (20%): {pkg.fiveFactorEvidenceBreakdown.interactionFrequency.explanation}</div>
                  <div>4. Behavioral Similarity (15%): {pkg.fiveFactorEvidenceBreakdown.behavioralSimilarity.explanation}</div>
                  <div>5. Temporal Pattern (10%): {pkg.fiveFactorEvidenceBreakdown.temporalPattern.explanation}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Risk Indicators */}
          {activeTab === 'risk' && (
            <div className="space-y-3 font-mono text-xs">
              {pkg.riskIndicators.length === 0 ? (
                <div className="p-4 rounded-md bg-slate-50 text-slate-500 text-center">
                  No active risk indicators flagged.
                </div>
              ) : (
                pkg.riskIndicators.map((ind) => (
                  <div key={ind.id} className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ind.indicator || ind.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        ind.severity === 'CRITICAL' ? 'bg-red-100 text-red-900 border-red-300' :
                        ind.severity === 'HIGH' ? 'bg-orange-100 text-orange-900 border-orange-300' :
                        ind.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                        'bg-blue-100 text-blue-900 border-blue-300'
                      }`}>
                        {ind.severity}
                      </span>
                    </div>
                    <div className="text-slate-700 text-xs font-sans">
                      <strong>Reason:</strong> {ind.reason || ind.description}
                    </div>
                    <div className="text-slate-900 text-[11px] bg-white p-2 rounded border border-slate-200">
                      <strong>Supporting Evidence:</strong> {ind.supportingEvidence || ind.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Legal Notice */}
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-500 font-mono leading-tight">
            <strong>Evidentiary Notice:</strong> This dossier represents automated cryptographic forensics and probabilistic graph heuristics. It does not constitute proof of natural person identity or criminal wrongdoing.
          </div>
        </div>
      </div>
    </div>
  );
};
