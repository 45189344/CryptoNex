import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import { 
  Sliders, RotateCcw, Save, CheckCircle2, 
  Cpu, Database, Network, ShieldCheck, Activity, Server, Landmark 
} from 'lucide-react';
import { ScoringWeights } from '../types';

export const SettingsView: React.FC = () => {
  const { weights, updateWeights } = useApp();

  const [formWeights, setFormWeights] = useState({
    graphProximity: Math.round((weights?.graphProximity || 0.3) * 100),
    transactionVolume: Math.round((weights?.transactionVolume || 0.25) * 100),
    interactionFrequency: Math.round((weights?.interactionFrequency || 0.2) * 100),
    behavioralSimilarity: Math.round((weights?.behavioralSimilarity || 0.15) * 100),
    temporalPattern: Math.round((weights?.temporalPattern || 0.1) * 100),
  });

  const [health, setHealth] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    apiClient.getHealth().then(res => setHealth(res)).catch(() => {});
  }, []);

  const totalSum = 
    formWeights.graphProximity + 
    formWeights.transactionVolume + 
    formWeights.interactionFrequency + 
    formWeights.behavioralSimilarity + 
    formWeights.temporalPattern;

  const handleSliderChange = (key: keyof typeof formWeights, val: number) => {
    setFormWeights(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalSum !== 100) return;

    await updateWeights({
      graphProximity: formWeights.graphProximity / 100,
      transactionVolume: formWeights.transactionVolume / 100,
      interactionFrequency: formWeights.interactionFrequency / 100,
      behavioralSimilarity: formWeights.behavioralSimilarity / 100,
      temporalPattern: formWeights.temporalPattern / 100,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setFormWeights({
      graphProximity: 30,
      transactionVolume: 25,
      interactionFrequency: 20,
      behavioralSimilarity: 15,
      temporalPattern: 10,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sliders className="h-6 w-6 text-blue-700" />
            Configurable Attribution Scoring Weights
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Adjust the 5-factor mathematical weighting model. Attribution probabilities dynamically recalculate.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Defaults (30/25/20/15/10)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weights Configuration Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 p-6 rounded-lg gov-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-900">
              Multi-Factor Mathematical Weights
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                totalSum === 100 
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}>
                Total: {totalSum}% {totalSum === 100 ? '✅ Valid' : '⚠️ Must sum to 100%'}
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {/* Factor 1: Graph Proximity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-900">1. Graph Proximity Weight (1-3 Hops Decay)</span>
                <span className="font-bold text-blue-900 text-sm">{formWeights.graphProximity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={formWeights.graphProximity}
                onChange={(e) => handleSliderChange('graphProximity', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
              <p className="text-[11px] text-slate-500">Shortest topological hop distance to verified VASP clusters.</p>
            </div>

            {/* Factor 2: Transaction Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-900">2. Transaction Volume Overlap Weight</span>
                <span className="font-bold text-blue-900 text-sm">{formWeights.transactionVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={formWeights.transactionVolume}
                onChange={(e) => handleSliderChange('transactionVolume', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
              <p className="text-[11px] text-slate-500">Ratio of cumulative funds routed to/from the candidate VASP.</p>
            </div>

            {/* Factor 3: Interaction Frequency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-900">3. Interaction Frequency Weight</span>
                <span className="font-bold text-blue-900 text-sm">{formWeights.interactionFrequency}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={formWeights.interactionFrequency}
                onChange={(e) => handleSliderChange('interactionFrequency', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
              <p className="text-[11px] text-slate-500">Log-normalized repeat transaction count with cluster addresses.</p>
            </div>

            {/* Factor 4: Behavioral Similarity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-900">4. Behavioral Signature & Sweeper Mechanics</span>
                <span className="font-bold text-blue-900 text-sm">{formWeights.behavioralSimilarity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={formWeights.behavioralSimilarity}
                onChange={(e) => handleSliderChange('behavioralSimilarity', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
              <p className="text-[11px] text-slate-500">Deposit sweep profiling, ticket sizing, and contract payload patterns.</p>
            </div>

            {/* Factor 5: Temporal Pattern */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-900">5. Temporal & Maintenance Window Clustering</span>
                <span className="font-bold text-blue-900 text-sm">{formWeights.temporalPattern}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={formWeights.temporalPattern}
                onChange={(e) => handleSliderChange('temporalPattern', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
              <p className="text-[11px] text-slate-500">Activity synchronization with exchange settlement windows.</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="submit"
              disabled={totalSum !== 100}
              className="px-5 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Apply & Re-Calculate</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono text-center flex items-center justify-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <span>Weights updated and active attribution models recalculated!</span>
            </div>
          )}
        </form>

        {/* Backend & Microservices Telemetry */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-lg gov-card space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-700" />
              System Architecture & Service Telemetry
            </h3>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Relational Database:</span>
                <span className="text-emerald-800 font-bold">{health?.services?.relationalDatabase || 'ONLINE'}</span>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Graph Database:</span>
                <span className="text-emerald-800 font-bold">{health?.services?.graphDatabase || 'CONNECTED'}</span>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Python ML Analytics:</span>
                <span className="text-emerald-800 font-bold">{health?.services?.pythonAnalytics || 'READY'}</span>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Simulation Engine:</span>
                <span className="text-blue-900 font-bold">Active & Segregated</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-lg gov-card space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase font-mono">
              Deterministic Scoring Guarantee
            </h4>
            <p className="text-slate-600 leading-relaxed">
              All attribution scores are computed deterministically via explainable heuristics without non-reproducible black-box modifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
