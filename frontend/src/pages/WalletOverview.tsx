import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet as WalletIcon, Copy, ExternalLink, ArrowDownLeft, 
  ArrowUpRight, Users, Activity, Clock, ShieldAlert, CheckCircle2, ArrowRight 
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const WalletOverview: React.FC = () => {
  const { wallet, targetAddress, setActiveTab, attribution } = useApp();
  const [copied, setCopied] = useState(false);

  if (!wallet || wallet.address.toLowerCase() !== targetAddress.toLowerCase()) {
    return (
      <div className="p-8 rounded-lg gov-card text-center text-slate-500">
        <WalletIcon className="h-10 w-10 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">No subject wallet loaded. Please perform an analysis first.</p>
      </div>
    );
  }

  const { statistics } = wallet;

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const flowData = [
    { name: 'Incoming Volume', value: statistics.incomingTransactions, color: '#15803d' },
    { name: 'Outgoing Volume', value: statistics.outgoingTransactions, color: '#1d4ed8' },
  ];

  return (
    <div className="space-y-6">
      {/* Wallet Identity Banner */}
      <div className="p-6 rounded-lg gov-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-bold uppercase">
                {wallet.blockchain} EVM SUBJECT
              </span>
              <span className="text-xs text-slate-500">Indexed & Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-base sm:text-xl font-bold text-slate-900 break-all">
                {wallet.address}
              </h2>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-1 shrink-0 border border-slate-300 transition-colors shadow-xs"
                title="Copy Address"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Risk Rating Badge */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-md border border-slate-200 self-start lg:self-auto">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Suspicious Activity Risk Score</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {attribution?.riskAssessment?.riskScore ?? wallet.riskScore ?? 25} <span className="text-xs font-normal text-slate-500">/ 100</span>
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div className="text-xs font-mono">
              <span className="font-semibold text-slate-900 block">
                {attribution?.riskAssessment?.riskLevel || ((wallet.riskScore || 25) >= 60 ? 'HIGH' : 'LOW')}
              </span>
              <span className="text-[10px] text-slate-500">Heuristic rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <div className="p-4 rounded-lg gov-card space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-500 font-medium">
            <span>Aggregate Volume</span>
            <Activity className="h-4 w-4 text-blue-700" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {statistics.totalVolumeETH} ETH
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            ~${statistics.totalVolumeUSD.toLocaleString()} USD
          </div>
        </div>

        {/* Transactions Breakdown */}
        <div className="p-4 rounded-lg gov-card space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-500 font-medium">
            <span>Transfer Count</span>
            <Users className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {statistics.totalTransactions} TXs
          </div>
          <div className="text-[11px] font-mono text-slate-600 flex items-center gap-2">
            <span className="text-emerald-800 font-semibold">↓ {statistics.incomingTransactions} In</span>
            <span className="text-blue-900 font-semibold">↑ {statistics.outgoingTransactions} Out</span>
          </div>
        </div>

        {/* Unique Counterparties */}
        <div className="p-4 rounded-lg gov-card space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-500 font-medium">
            <span>Counterparties</span>
            <Users className="h-4 w-4 text-slate-700" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {statistics.uniqueCounterparties} Wallets
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Direct 1-Hop Peers
          </div>
        </div>

        {/* Velocity & Span */}
        <div className="p-4 rounded-lg gov-card space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-500 font-medium">
            <span>Velocity</span>
            <Clock className="h-4 w-4 text-amber-700" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {statistics.velocityPerHour} tx/hr
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Span: {statistics.activeDaysSpan} Active Day(s)
          </div>
        </div>
      </div>

      {/* Deep Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Timeline Card */}
        <div className="lg:col-span-7 p-6 rounded-lg gov-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-700" />
            Activity Span & Execution Timelines
          </h3>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">First Recorded On-Chain Activity:</span>
              <span className="font-semibold text-slate-900">{new Date(statistics.firstActivity).toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Most Recent Transaction:</span>
              <span className="font-semibold text-slate-900">{new Date(statistics.lastActivity).toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Average Transaction Ticket Size:</span>
              <span className="font-bold text-blue-900">{statistics.avgTransactionValue} ETH</span>
            </div>

            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Peak Single Transaction Value:</span>
              <span className="font-bold text-emerald-800">{statistics.maxTransactionValue} ETH</span>
            </div>
          </div>
        </div>

        {/* Flow Distribution Donut Chart */}
        <div className="lg:col-span-5 p-6 rounded-lg gov-card space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
            Inflow vs Outflow Ratio
          </h3>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={flowData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {flowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around text-xs font-mono pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-700" />
              <span className="text-slate-700 font-medium">Inbound ({statistics.incomingTransactions})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-700" />
              <span className="text-slate-700 font-medium">Outbound ({statistics.outgoingTransactions})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
