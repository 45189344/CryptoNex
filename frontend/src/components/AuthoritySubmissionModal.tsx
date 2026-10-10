import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import { 
  X, Send, CheckCircle2, Download, Copy, Printer, 
  ShieldAlert, Landmark, FileText, AlertTriangle, Info, Edit3 
} from 'lucide-react';

export const AuthoritySubmissionModal: React.FC = () => {
  const { 
    isAuthorityModalOpen, 
    setIsAuthorityModalOpen, 
    activeAuthoritySubmission, 
    setActiveAuthoritySubmission 
  } = useApp();

  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthorityModalOpen || !activeAuthoritySubmission) return null;

  const sub = activeAuthoritySubmission;

  const handleToggleStatus = async (newStatus: 'Draft' | 'Prepared') => {
    setIsUpdating(true);
    try {
      const updated = await apiClient.prepareAuthoritySubmission(sub.caseId, {
        analystNotes: notes || sub.analystNotes,
        markPrepared: newStatus === 'Prepared'
      });
      setActiveAuthoritySubmission(updated);
      setSuccessMessage(`Submission status updated to "${newStatus}".`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update submission status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(sub, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sub, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${sub.submissionId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-lg bg-white border border-slate-300 flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-blue-900 text-white flex items-center justify-center">
              <Landmark className="h-5 w-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Prepare Authority Submission
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  sub.submissionStatus === 'Prepared'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  Submission Status: {sub.submissionStatus}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                Institutional Export Dossier for Designated Regulatory & Law Enforcement Channels
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
              <span>Export</span>
            </button>
            <button
              onClick={() => setIsAuthorityModalOpen(false)}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto text-xs font-sans">
          {/* Status Bar */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-500 text-[11px]">Submission ID:</span>
                <span className="font-bold text-slate-900">{sub.submissionId}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-500 text-[11px]">Associated Case ID:</span>
                <span className="font-bold text-blue-900">{sub.caseId}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {sub.submissionStatus === 'Draft' ? (
                <button
                  onClick={() => handleToggleStatus('Prepared')}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mark as Prepared</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleStatus('Draft')}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <Edit3 className="h-4 w-4 text-slate-500" />
                  <span>Revert to Draft</span>
                </button>
              )}
            </div>
          </div>

          {successMessage && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 font-mono text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Structured Submission Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Target Wallet</span>
              <span className="font-bold text-slate-900 break-all">{sub.targetWallet}</span>
            </div>

            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Blockchain & Network</span>
              <span className="font-bold text-blue-900 uppercase">{sub.blockchain} EVM</span>
            </div>

            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Risk Level & Score</span>
              <span className="font-bold text-slate-900">
                {sub.riskLevel} ({sub.riskScore} / 100 Suspicious Activity Risk Score)
              </span>
            </div>

            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Probable VASP Candidate</span>
              <span className="font-bold text-emerald-800">
                {sub.probableVasp} ({sub.attributionScore}% Attribution Score)
              </span>
            </div>
          </div>

          {/* Graph Evidence Summary */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs">
            <h4 className="font-bold text-slate-900 uppercase">Graph Forensics Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
              <div>Nodes: <strong>{sub.graphEvidence.totalNodes}</strong></div>
              <div>Flow Edges: <strong>{sub.graphEvidence.totalEdges}</strong></div>
              <div>Shortest Hop: <strong>{sub.graphEvidence.shortestHop} Hop(s)</strong></div>
              <div>Matched Clusters: <strong>{sub.graphEvidence.matchedClusterCount} Addresses</strong></div>
            </div>
          </div>

          {/* Supporting Transactions (Top 5) */}
          <div className="space-y-2 font-mono text-xs">
            <h4 className="font-bold text-slate-900 uppercase">Supporting Transactions ({sub.supportingTransactions.length})</h4>
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-2">TX Hash</th>
                    <th className="p-2">From</th>
                    <th className="p-2">To</th>
                    <th className="p-2">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {sub.supportingTransactions.slice(0, 5).map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 text-blue-900 font-bold">{tx.txHash.slice(0, 14)}...</td>
                      <td className="p-2 text-slate-600">{tx.fromAddress.slice(0, 10)}...</td>
                      <td className="p-2 text-slate-600">{tx.toAddress.slice(0, 10)}...</td>
                      <td className="p-2 font-bold text-slate-900">{tx.value} {tx.token}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Indicators */}
          <div className="space-y-2 font-mono text-xs">
            <h4 className="font-bold text-slate-900 uppercase">Evidentiary Risk Indicators</h4>
            <div className="space-y-1.5">
              {sub.riskIndicators.map((ind) => (
                <div key={ind.id} className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900">{ind.indicator || ind.title}: </span>
                    <span className="text-slate-600 font-sans">{ind.reason || ind.description}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 shrink-0">
                    {ind.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Analyst Notes */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase font-bold text-slate-800 block">
              Investigator / Analyst Legal Notes
            </label>
            <textarea
              value={notes || sub.analystNotes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add regulatory reference or agency notes for this submission dossier..."
              className="w-full p-2.5 rounded-md gov-input text-slate-900 font-mono text-xs"
            />
          </div>

          {/* MVP Disclaimer Note */}
          <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-950 font-mono text-[11px] leading-relaxed flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
            <p>
              <strong>Submission Scope Notice:</strong> In this current deployment, this workflow validates and prepares a structured submission dossier for export to authorized law enforcement and compliance registries. Direct automated external dispatch is subject to official agency API clearance. Platform does not directly freeze or block wallets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
