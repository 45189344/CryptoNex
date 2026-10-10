import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeftRight, Search, Filter, ArrowDownLeft, 
  ArrowUpRight, Copy, ExternalLink, ShieldCheck 
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { transactions, wallet } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  if (!wallet || transactions.length === 0) {
    return (
      <div className="p-8 rounded-lg gov-card text-center text-slate-500">
        <ArrowLeftRight className="h-10 w-10 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">No transactions loaded. Run a wallet analysis to populate ledger.</p>
      </div>
    );
  }

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredTxs = transactions.filter((tx) => {
    const isInc = tx.toAddress.toLowerCase() === wallet.address.toLowerCase();
    if (directionFilter === 'IN' && !isInc) return false;
    if (directionFilter === 'OUT' && isInc) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        tx.txHash.toLowerCase().includes(term) ||
        tx.fromAddress.toLowerCase().includes(term) ||
        tx.toAddress.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-blue-700" />
            On-Chain Transaction Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {filteredTxs.length} of {transactions.length} indexed transactions for subject wallet
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 border border-slate-200 rounded-md p-0.5 text-xs font-mono">
            <button
              onClick={() => setDirectionFilter('ALL')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${directionFilter === 'ALL' ? 'bg-white text-blue-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setDirectionFilter('IN')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${directionFilter === 'IN' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Inbound
            </button>
            <button
              onClick={() => setDirectionFilter('OUT')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${directionFilter === 'OUT' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Outbound
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by Transaction Hash or Counterparty Address..."
          className="w-full pl-10 pr-4 py-2 rounded-md gov-input text-slate-900 placeholder-slate-400 font-mono text-xs shadow-subtle"
        />
      </div>

      {/* Transactions Table */}
      <div className="rounded-lg gov-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">Direction</th>
                <th className="p-3">Tx Hash</th>
                <th className="p-3">From Address</th>
                <th className="p-3">To Address</th>
                <th className="p-3">Value (ETH)</th>
                <th className="p-3">Block / Gas</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredTxs.map((tx) => {
                const isIncoming = tx.toAddress.toLowerCase() === wallet.address.toLowerCase();
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    {/* Direction Badge */}
                    <td className="p-3">
                      {isIncoming ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                          <ArrowDownLeft className="h-3 w-3 text-emerald-700" /> IN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-bold">
                          <ArrowUpRight className="h-3 w-3 text-blue-700" /> OUT
                        </span>
                      )}
                    </td>

                    {/* Hash */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                        <span>{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}</span>
                        <button
                          onClick={() => handleCopy(tx.txHash)}
                          className="text-slate-400 hover:text-slate-700"
                          title="Copy Tx Hash"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    {/* From */}
                    <td className="p-3">
                      <span className={tx.fromAddress.toLowerCase() === wallet.address.toLowerCase() ? 'text-blue-900 font-bold' : 'text-slate-700'}>
                        {tx.fromAddress.slice(0, 8)}...{tx.fromAddress.slice(-6)}
                      </span>
                    </td>

                    {/* To */}
                    <td className="p-3">
                      <span className={tx.toAddress.toLowerCase() === wallet.address.toLowerCase() ? 'text-blue-900 font-bold' : 'text-slate-700'}>
                        {tx.toAddress ? `${tx.toAddress.slice(0, 8)}...${tx.toAddress.slice(-6)}` : 'Contract Creation'}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{tx.value.toFixed(4)} {tx.token}</span>
                      <span className="block text-[10px] text-slate-500">~${(tx.value * 3450).toFixed(2)} USD</span>
                    </td>

                    {/* Block / Gas */}
                    <td className="p-3 text-slate-600">
                      <div className="font-semibold text-slate-800">#{tx.blockNumber}</div>
                      <div className="text-[10px] text-slate-500">{tx.gasPriceGwei || 20} Gwei</div>
                    </td>

                    {/* Timestamp */}
                    <td className="p-3 text-slate-600 text-[11px]">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
