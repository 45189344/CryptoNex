import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import { InvestigationCase, CaseStatus } from '../types';
import { 
  FolderGit2, Plus, FileText, CheckCircle2, 
  Clock, Tag, AlertCircle, Save, ExternalLink, 
  Search, Filter, Send, RefreshCw, ShieldAlert, Activity 
} from 'lucide-react';

export const InvestigationsView: React.FC = () => {
  const { 
    targetAddress, 
    attribution, 
    wallet, 
    setIsReportModalOpen, 
    runAnalysis, 
    setActiveTab,
    openEvidencePackage,
    openAuthoritySubmission
  } = useApp();

  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Case Form State
  const [caseTitle, setCaseTitle] = useState('');
  const [investigatorNotes, setInvestigatorNotes] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [tagInput, setTagInput] = useState('VASP-Attribution, SIH-2026');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getInvestigations();
      setCases(data);
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (caseId: string, newStatus: CaseStatus) => {
    try {
      const updated = await apiClient.updateInvestigation(caseId, { status: newStatus });
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: updated.status, updatedAt: updated.updatedAt } : c));
    } catch (err) {
      console.error('Failed to update case status:', err);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle.trim() || !targetAddress) return;

    setIsSaving(true);
    try {
      const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
      const primaryVasp = attribution?.mostLikelyVasp.vasp.name || 'Unassigned';
      const attrScore = attribution?.mostLikelyVasp.score || 0;
      const riskScore = attribution?.riskAssessment?.riskScore || wallet?.riskScore || 50;
      const riskLevel = attribution?.riskAssessment?.riskLevel || 'MEDIUM';

      const newCase = await apiClient.createInvestigation({
        walletAddress: targetAddress,
        caseTitle: caseTitle.trim(),
        investigatorNotes: investigatorNotes.trim(),
        priority,
        tags,
        primaryVaspCandidate: primaryVasp,
        attributionScore: attrScore,
        riskScore,
        riskLevel,
        status: 'Open'
      });
      setCases(prev => [newCase, ...prev]);
      setCaseTitle('');
      setInvestigatorNotes('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to create case:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const availableStatuses: CaseStatus[] = ['Open', 'Under Review', 'Escalated', 'Submitted', 'Resolved'];

  const filteredCases = cases.filter((c) => {
    const statusNorm = c.status ? c.status.toLowerCase() : 'open';
    const matchesStatus = statusFilter === 'ALL' || statusNorm === statusFilter.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.primaryVaspCandidate && c.primaryVaspCandidate.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const s = (status || 'open').toLowerCase();
    switch (s) {
      case 'escalated':
        return 'bg-red-50 text-red-900 border-red-300 font-bold';
      case 'under review':
      case 'in_review':
        return 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
      case 'submitted':
        return 'bg-indigo-50 text-indigo-900 border-indigo-300 font-semibold';
      case 'resolved':
      case 'completed':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold';
      case 'open':
      default:
        return 'bg-blue-50 text-blue-900 border-blue-300 font-semibold';
    }
  };

  const getRiskBadge = (level?: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-950 border-red-300 font-bold';
      case 'HIGH':
        return 'bg-orange-100 text-orange-950 border-orange-300 font-bold';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-950 border-amber-300 font-semibold';
      case 'LOW':
      default:
        return 'bg-emerald-100 text-emerald-950 border-emerald-300 font-medium';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-900 mb-1">
            <FolderGit2 className="h-3.5 w-3.5 text-blue-700" />
            <span>LAW ENFORCEMENT & COMPLIANCE REGISTRY</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Investigation Case Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track flagged cryptocurrency wallets, maintain investigator hypotheses, and prepare structured evidentiary dossiers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCases}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>Export Case Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Create Form & Case Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Case Form */}
        <div className="lg:col-span-4 p-6 rounded-lg gov-card space-y-4 self-start">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-700" />
            Open New Case Dossier
          </h3>

          <form onSubmit={handleCreateCase} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="text-slate-600 block mb-1 font-semibold">Subject Address</label>
              <input
                type="text"
                value={targetAddress}
                readOnly
                className="w-full p-2.5 rounded-md bg-slate-50 border border-slate-300 text-slate-900 font-semibold truncate"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-semibold">Case Title / Reference *</label>
              <input
                type="text"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                placeholder="e.g. Case Ref: 2026-NEX-0112 (VASP Tracing)"
                required
                className="w-full p-2.5 rounded-md gov-input text-slate-900 placeholder-slate-400 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full p-2.5 rounded-md bg-white border border-slate-300 text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full p-2.5 rounded-md gov-input text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-semibold">Investigator Hypotheses & Forensic Notes</label>
              <textarea
                value={investigatorNotes}
                onChange={(e) => setInvestigatorNotes(e.target.value)}
                rows={3}
                placeholder="Record peel-chain patterns, VASP attribution insights, and counterparty clusters..."
                className="w-full p-2.5 rounded-md gov-input text-slate-900 placeholder-slate-400 leading-relaxed font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving || !caseTitle.trim()}
              className="w-full py-2.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving Case...' : 'Save Case Dossier'}</span>
            </button>

            {saveSuccess && (
              <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 text-center flex items-center justify-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                <span>Case Dossier saved successfully!</span>
              </div>
            )}
          </form>
        </div>

        {/* Expanded Case Registry List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-lg gov-card flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Case ID, wallet, or VASP..."
                className="w-full pl-9 pr-3 py-2 rounded-md gov-input text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-md bg-white border border-slate-300 text-xs font-mono font-medium text-slate-800 cursor-pointer"
              >
                <option value="ALL">All Case Statuses</option>
                <option value="Open">Status: Open</option>
                <option value="Under Review">Status: Under Review</option>
                <option value="Escalated">Status: Escalated</option>
                <option value="Submitted">Status: Submitted</option>
                <option value="Resolved">Status: Resolved</option>
              </select>
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-3">
            {loading ? (
              <div className="p-10 rounded-lg gov-card text-center text-slate-500 font-mono text-xs">
                Loading case registry...
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="p-10 rounded-lg gov-card text-center text-slate-500 font-mono text-xs">
                No investigation cases found matching filter criteria.
              </div>
            ) : (
              filteredCases.map((c) => (
                <div 
                  key={c.id} 
                  className="p-5 rounded-lg gov-card hover:border-slate-300 transition-all space-y-3"
                >
                  {/* Top Row: Case ID, Title, Status & Priority */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {c.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {c.caseTitle}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status Dropdown */}
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value as CaseStatus)}
                        className={`text-[10px] font-mono font-bold px-2 py-1 rounded border cursor-pointer ${getStatusBadge(c.status)}`}
                      >
                        {availableStatuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                        c.priority === 'HIGH' ? 'bg-red-50 text-red-900 border-red-200' : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {c.priority}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Metrics Grid (Required by Section 4) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs pt-1">
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Target Wallet</span>
                      <span className="font-semibold text-slate-900 truncate block text-[11px]" title={c.walletAddress}>
                        {c.walletAddress.slice(0, 8)}...{c.walletAddress.slice(-6)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Network / Hop</span>
                      <span className="font-semibold text-slate-900 text-[11px]">
                        {c.network || c.blockchain || 'ethereum'} ({c.hopDepth || 2}-Hop)
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Probable VASP</span>
                      <span className="font-bold text-slate-900 text-[11px]">
                        {c.primaryVaspCandidate || 'Unassigned'} ({c.attributionScore ? `${c.attributionScore}%` : 'N/A'})
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Risk Assessment</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-slate-900 text-[11px]">
                          {c.riskScore !== undefined ? `${c.riskScore}/100` : 'N/A'}
                        </span>
                        {c.riskLevel && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border ${getRiskBadge(c.riskLevel)}`}>
                            {c.riskLevel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Investigator Notes */}
                  {c.investigatorNotes && (
                    <p className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50/50 p-2.5 rounded border border-slate-100">
                      {c.investigatorNotes}
                    </p>
                  )}

                  {/* Actions & Timestamps Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(c.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEvidencePackage(c)}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                      >
                        <FileText className="h-3 w-3 text-blue-700" />
                        <span>Evidence Package</span>
                      </button>

                      <button
                        onClick={() => openAuthoritySubmission(c)}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Send className="h-3 w-3 text-blue-700" />
                        <span>Authority Submission</span>
                      </button>

                      <button
                        onClick={() => {
                          runAnalysis(c.walletAddress);
                          setActiveTab('overview');
                        }}
                        className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 px-1 cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
