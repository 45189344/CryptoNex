import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Layers, Landmark } from 'lucide-react';
import { PresetWallet } from '../types';

export const WalletSearch: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { 
    targetAddress, setTargetAddress, maxHops, setMaxHops, 
    runAnalysis, isAnalyzing, analysisStep, presets, loadPreset, 
    analysisError, selectedCaseId, selectedNetwork
  } = useApp();

  const [inputVal, setInputVal] = useState<string>(targetAddress);

  // Sync input value whenever targetAddress changes from presets or external navigation
  React.useEffect(() => {
    setInputVal(targetAddress);
  }, [targetAddress]);

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(inputVal.trim());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidAddress && !isAnalyzing) {
      const cleanAddr = inputVal.trim().toLowerCase();
      setTargetAddress(cleanAddr);
      const match = presets.find(p => p.address.toLowerCase() === cleanAddr);
      runAnalysis(cleanAddr, maxHops, match?.id || null, selectedNetwork);
    }
  };

  const getStepText = (step: number) => {
    switch (step) {
      case 1: return 'Analyzing wallet & ingesting transactions...';
      case 2: return 'Building transaction graph & mapping hops...';
      case 3: return 'Evaluating VASP candidates & cluster signatures...';
      case 4: return 'Calculating five-factor attribution score...';
      case 5: return 'Finalizing explainable risk assessment...';
      default: return 'Processing analysis pipeline...';
    }
  };

  return (
    <div className={`w-full ${compact ? '' : 'p-6 rounded-lg gov-card'}`}>
      {/* Main Search Bar */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Address Input Container */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              value={inputVal}
              disabled={isAnalyzing}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter Target EVM Address (0x...)"
              className="w-full pl-10 pr-10 py-2.5 rounded-md gov-input text-slate-900 placeholder-slate-400 font-mono text-xs sm:text-sm shadow-subtle disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            {inputVal && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                {isValidAddress ? (
                  <span title="Valid EVM Address Format">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </span>
                ) : (
                  <span title="Invalid Hexadecimal Address">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Hop Depth Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-300 shrink-0">
            <Layers className="h-4 w-4 text-slate-500" />
            <span className="text-xs text-slate-700 font-mono font-medium">Depth:</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((hop) => (
                <button
                  type="button"
                  key={hop}
                  disabled={isAnalyzing}
                  onClick={() => setMaxHops(hop)}
                  className={`px-2.5 py-1 text-xs rounded font-mono font-semibold transition-colors ${
                    maxHops === hop
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {hop} Hop{hop > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={!isValidAddress || isAnalyzing}
            className="px-5 py-2.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 min-w-[140px]"
          >
            {isAnalyzing ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search className="h-3.5 w-3.5" />
                <span>Run Analysis</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Live Analysis Progress Bar */}
        {isAnalyzing && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md animate-pulse">
            <div className="flex items-center justify-between text-xs text-blue-900 font-medium mb-1.5">
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                {getStepText(analysisStep)}
              </span>
              <span className="font-mono text-blue-700">Step {analysisStep || 1}/5</span>
            </div>
            <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-1.5 transition-all duration-300"
                style={{ width: `${Math.min(100, (analysisStep || 1) * 20)}%` }}
              />
            </div>
          </div>
        )}

        {/* Validation Error Message */}
        {analysisError && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span className="font-medium">{analysisError}</span>
          </div>
        )}
      </form>

      {/* Preset Investigation Cases */}
      {!compact && presets.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5 text-blue-700" />
              Benchmark Investigation Cases:
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Select to Clear & Analyze</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {presets.map((p) => {
              const isSelected = selectedCaseId === p.id || targetAddress.toLowerCase() === p.address.toLowerCase();
              return (
                <button
                  key={p.id || p.address}
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    setInputVal(p.address);
                    loadPreset(p);
                  }}
                  className={`p-3 text-left rounded-md transition-all group relative cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                    isSelected
                      ? 'bg-blue-50/80 border-2 border-blue-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-blue-700 text-white">
                        ACTIVE
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1 pr-12">
                    <span className={`text-xs font-bold transition-colors ${
                      isSelected ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-700'
                    }`}>
                      {p.name.split(':')[0]}
                    </span>
                  </div>
                  <div className="mb-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-semibold inline-block">
                      Expected: {p.primaryVaspExpected || p.expectedVasp} ~{p.expectedScore}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-slate-500 truncate flex items-center justify-between">
                    <span>{p.address.slice(0, 10)}...{p.address.slice(-8)}</span>
                    <span className="text-slate-400 font-sans">{p.hopsToVasp || p.defaultHopDepth || 1} Hop</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
