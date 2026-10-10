import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { VASP, VASPAddress } from '../types';
import { 
  Building2, ShieldCheck, Database, Search, 
  ExternalLink, Filter, CheckCircle2, AlertTriangle, Globe 
} from 'lucide-react';

export const VaspRegistryView: React.FC = () => {
  const [vasps, setVasps] = useState<VASP[]>([]);
  const [addresses, setAddresses] = useState<VASPAddress[]>([]);
  const [selectedVaspId, setSelectedVaspId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    apiClient.getVasps().then(res => {
      setVasps(res);
      if (res.length > 0) setSelectedVaspId(res[0].id);
    });
    apiClient.getVaspAddresses().then(res => setAddresses(res));
  }, []);

  const filteredVasps = vasps.filter(v => {
    if (typeFilter !== 'ALL' && v.type !== typeFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return v.name.toLowerCase().includes(term) || v.country.toLowerCase().includes(term);
    }
    return true;
  });

  const selectedVasp = vasps.find(v => v.id === selectedVaspId);
  const vaspClusterAddresses = addresses.filter(a => a.vaspId === selectedVaspId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-700" />
          Known VASP & Address Cluster Registry
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Catalog of verified Virtual Asset Service Providers, known hot/cold wallet clusters, and heuristic address profiles
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search VASP by name or jurisdiction..."
            className="w-full pl-10 pr-4 py-2 rounded-md gov-input text-xs text-slate-900 font-mono shadow-subtle"
          />
        </div>

        <div className="flex bg-slate-100 border border-slate-200 rounded-md p-0.5 text-xs font-mono shrink-0">
          {['ALL', 'CEX', 'DEX', 'MIXER_HIGH_RISK'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded font-semibold transition-colors ${typeFilter === t ? 'bg-white text-blue-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* VASP Entity List */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredVasps.map((vasp) => {
            const isSelected = vasp.id === selectedVaspId;
            const clusterCount = addresses.filter(a => a.vaspId === vasp.id).length;
            return (
              <button
                key={vasp.id}
                onClick={() => setSelectedVaspId(vasp.id)}
                className={`w-full text-left p-4 rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">{vasp.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                    {vasp.type}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 font-mono mb-2">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  <span>{vasp.country}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] font-mono">
                  <span className="text-slate-500">Clusters: {clusterCount} indexed</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    vasp.riskRating === 'SANCTIONED' ? 'bg-red-50 text-red-900 border border-red-200' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  }`}>
                    {vasp.riskRating} RISK
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected VASP Detailed Cluster Registry */}
        <div className="lg:col-span-7 space-y-4">
          {selectedVasp && (
            <div className="p-6 rounded-lg gov-card space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedVasp.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">{selectedVasp.description}</p>
                </div>
                {selectedVasp.website && (
                  <a
                    href={selectedVasp.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-mono text-blue-700 hover:text-blue-900 font-semibold self-start"
                  >
                    <span>Website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Cluster Addresses Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-900 flex items-center gap-1.5">
                    <Database className="h-4 w-4 text-blue-700" />
                    Mapped Address Clusters ({vaspClusterAddresses.length})
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-md">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="p-2.5">Address</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Classification</th>
                        <th className="p-2.5">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {vaspClusterAddresses.map((addr) => (
                        <tr key={addr.id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-900 font-bold font-mono">
                            {addr.address.slice(0, 10)}...{addr.address.slice(-6)}
                          </td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-medium">
                              {addr.addressType}
                            </span>
                          </td>
                          <td className="p-2.5">
                            {addr.isDemoData ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                                DEMO SIMULATION
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-bold">
                                VERIFIED PUBLIC
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900">
                            {(addr.confidence * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
