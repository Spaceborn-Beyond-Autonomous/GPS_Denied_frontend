'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, HelpCircle, MapPin, Radio, Compass } from 'lucide-react';
import { mockScenarios } from '@/data/mockData';
import { Scenario } from '@/types';

function ScenariosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [scenarios, setScenarios] = useState<Scenario[]>(mockScenarios);

  // Load custom scenarios from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('spaceborn_custom_scenarios');
      if (stored) {
        const custom = JSON.parse(stored);
        if (Array.isArray(custom)) {
          // Prepend custom scenarios to mock ones
          setScenarios([...custom, ...mockScenarios]);
        }
      }
    } catch (err) {
      console.error('Failed to load custom scenarios', err);
    }
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-emerald-450 border-emerald-800/60 bg-emerald-950/20';
      case 'Medium':
        return 'text-amber-400 border-amber-800/60 bg-amber-950/20';
      case 'Hard':
        return 'text-orange-400 border-orange-800/60 bg-orange-950/20';
      case 'Expert':
        return 'text-rose-400 border-rose-800/60 bg-rose-950/20';
      case 'Custom':
        return 'text-slate-400 border-slate-800 bg-slate-950/40';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800/20';
    }
  };

  // Filter based on search query (from global search)
  const filteredScenarios = scenarios.filter(scen => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      scen.name.toLowerCase().includes(query) ||
      scen.description.toLowerCase().includes(query) ||
      scen.difficulty.toLowerCase().includes(query) ||
      scen.sensor_suite.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      
      {/* Page Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white tracking-tight">Select Environmental Scenario</h3>
          <p className="text-xs text-slate-400">
            Choose certified matrix scenarios mapped with calibrated dynamic obstacle profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/scenarios/upload')}
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 text-xs font-bold rounded shadow transition-all shrink-0 self-start sm:self-center cursor-pointer active:scale-99 hover:scale-[1.01]"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload Custom Scenario YAML
        </button>
      </div>

      {/* Search active notification */}
      {searchQuery && (
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-slate-300">
          <span>
            Filtering by search: <strong className="text-white">"{searchQuery}"</strong>
          </span>
          <button 
            onClick={() => router.push('/scenarios')}
            className="text-[10px] font-extrabold text-cyan-400 hover:underline uppercase"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map((scen) => (
          <div
            key={scen.id}
            className="glass-panel glass-panel-hover p-5 rounded-lg flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-3.5">
              {/* Card Header & Title */}
              <div className="flex items-start justify-between gap-4">
                <h4 className="text-sm font-bold text-white tracking-tight">{scen.name}</h4>
                <span className="text-[9px] text-slate-500 font-mono select-none bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {scen.version}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {scen.description}
              </p>
            </div>

            {/* Bottom details & Visualizations */}
            <div className="mt-5 space-y-4">
              
              {/* Technical info tags */}
              <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-wider">
                <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-850 rounded text-slate-400">
                  {scen.duration}
                </span>
                <span className={`px-2.5 py-0.5 border rounded ${getDifficultyColor(scen.difficulty)}`}>
                  {scen.difficulty}
                </span>
              </div>

              {/* Sparkline Signal Loss Curve Preview */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                  Signal Loss Curve Preview
                </span>
                
                <div className="h-10 w-full bg-slate-900/80 border border-slate-800 rounded p-1 flex items-end gap-1 select-none">
                  {scen.jamming_profile && scen.jamming_profile.map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-cyan-500/60 rounded-t hover:bg-cyan-400 transition-colors"
                      style={{ height: `${Math.max(8, val)}%` }}
                      title={`Time-step ${idx + 1}: ${val}% loss`}
                    />
                  ))}
                </div>
              </div>

              {/* Hidden details toggled or disclosed in small font */}
              <div className="grid grid-cols-2 gap-3 pt-2.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-800/60">
                <div className="space-y-0.5">
                  <span>Sensor Suite</span>
                  <p className="text-[10px] text-slate-400 font-medium truncate uppercase" title={scen.sensor_suite}>
                    {scen.sensor_suite.split(',')[0]}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span>Goal Spec</span>
                  <p className="text-[10px] text-slate-400 font-medium truncate uppercase" title={scen.goal_definition}>
                    {scen.goal_definition}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredScenarios.length === 0 && (
        <div className="text-center py-12 bg-slate-900/30 border border-slate-800 rounded-lg">
          <p className="text-slate-500 font-medium">No scenarios match your search query.</p>
        </div>
      )}

    </div>
  );
}

export default function ScenariosPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 rounded-full border-2 border-slate-700 border-t-slate-400 animate-spin" />
      </div>
    }>
      <ScenariosContent />
    </Suspense>
  );
}

