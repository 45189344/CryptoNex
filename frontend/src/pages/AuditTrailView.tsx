import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { AuditLogEntry } from '../types';
import { 
  ClipboardList, Search, RefreshCw, Filter, ShieldCheck, 
  Clock, Download, CheckCircle2, User, ArrowUpDown 
} from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAuditTrail();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  const actionTypes = [
    'ALL',
    'Wallet analyzed',
    'Case created',
    'Wallet flagged',
    'Evidence generated',
    'Submission prepared',
    'Case status updated'
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesAction = selectedAction === 'ALL' || log.action.toLowerCase() === selectedAction.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.caseId && log.caseId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.targetWallet && log.targetWallet.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.analyst && log.analyst.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesAction && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Action', 'Case ID', 'Target Wallet', 'Analyst', 'Status', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.action}"`,
      l.caseId || '',
      l.targetWallet || '',
      l.analyst,
      l.status,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CRYPTO-NEX-Audit-Trail-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('flagged')) return 'bg-orange-50 text-orange-900 border-orange-200';
    if (act.includes('case')) return 'bg-blue-50 text-blue-900 border-blue-200';
    if (act.includes('evidence')) return 'bg-indigo-50 text-indigo-900 border-indigo-200';
    if (act.includes('submission')) return 'bg-emerald-50 text-emerald-900 border-emerald-200';
    if (act.includes('analyzed')) return 'bg-slate-100 text-slate-800 border-slate-300';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-900 mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
            <span>FORENSIC ACCOUNTABILITY & AUDIT DISPATCH</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System & Investigation Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable tracking of forensic analyses, wallet flags, dossier exports, and case status transitions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-lg gov-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by wallet, case ID, analyst, or keyword..."
            className="w-full pl-9 pr-3 py-2 rounded-md gov-input text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-md bg-white border border-slate-300 text-xs font-mono font-medium text-slate-800 cursor-pointer"
          >
            {actionTypes.map((a) => (
              <option key={a} value={a}>
                {a === 'ALL' ? 'All Forensic Actions' : a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-lg gov-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-mono uppercase font-bold text-slate-700 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-blue-700" />
            Audit Ledger ({filteredLogs.length} Records)
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Tamper-Evident Forensic Sequence
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs font-mono text-slate-500">
            Loading audit records...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-xs font-mono text-slate-500">
            No audit records matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp (UTC)</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target / Reference</th>
                  <th className="p-3">Investigator / User</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {log.caseId ? (
                        <span className="font-bold text-blue-900 block">{log.caseId}</span>
                      ) : null}
                      {log.targetWallet ? (
                        <span className="text-[11px] text-slate-600 block">
                          {log.targetWallet.slice(0, 10)}...{log.targetWallet.slice(-6)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap text-slate-700 flex items-center gap-1.5">
                      <User className="h-3 w-3 text-slate-400" />
                      <span>{log.analyst}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-sans text-xs max-w-xs truncate" title={log.details}>
                      {log.details || '-'}
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
