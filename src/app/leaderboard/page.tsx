'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowRight, ExternalLink } from 'lucide-react';
import { mockLeaderboard, mockScenarios } from '@/data/mockData';

export default function LeaderboardPage() {
  const router = useRouter();

  // States
  const [selectedScenarioId, setSelectedScenarioId] = useState('scen-1');
  const [leaderboardScope, setLeaderboardScope] = useState<'org' | 'global'>('org');

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedScenarioId(e.target.value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top filter row: Dropdown and Toggles */}
      <div className="glass-panel p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Scenario Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium select-none">Scenario:</span>
          <select
            value={selectedScenarioId}
            onChange={handleScenarioChange}
            className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-xs text-slate-205 focus:outline-none focus:border-slate-700"
          >
            {mockScenarios.map((scen) => (
              <option key={scen.id} value={scen.id}>
                {scen.name}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle switch for Org vs Global Scope */}
        <div className="flex bg-slate-950/50 border border-slate-850 p-1 rounded-md text-xs font-semibold self-start sm:self-center select-none">
          <button
            type="button"
            onClick={() => setLeaderboardScope('org')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              leaderboardScope === 'org' 
                ? 'bg-white text-slate-950 font-extrabold shadow' 
                : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            My Org Stacks
          </button>
          <button
            type="button"
            onClick={() => setLeaderboardScope('global')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              leaderboardScope === 'global' 
                ? 'bg-white text-slate-950 font-extrabold shadow' 
                : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            All Global Orgs
          </button>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="glass-panel rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-500 font-medium border-b border-slate-800/60 uppercase tracking-wider text-[10px]">
                <th className="p-4 w-24">Rank</th>
                <th className="p-4">Stack Name</th>
                <th className="p-4">Version</th>
                <th className="p-4">Overall Score</th>
                <th className="p-4">Pass Rate %</th>
                <th className="p-4">Tested Date</th>
                <th className="p-4 w-28 text-right">Verify Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {mockLeaderboard.map((row) => {
                const isTopThree = ['1st', '2nd', '3rd'].includes(row.rank);
                
                return (
                  <tr 
                    key={row.rank} 
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    {/* Rank with Gold/Silver/Bronze indicators */}
                    <td className="p-4 font-bold text-slate-200">
                      <div className="flex items-center gap-2">
                        {isTopThree && (
                          <span 
                            className="h-2 w-2 rounded-full shrink-0 animate-pulse-glow" 
                            style={{ backgroundColor: row.badgeColor }}
                          />
                        )}
                        <span>{row.rank}</span>
                      </div>
                    </td>

                    {/* Stack name */}
                    <td className="p-4 font-bold text-white">{row.stackName}</td>
                    
                    {/* Version */}
                    <td className="p-4 font-mono text-slate-450">{row.version}</td>
                    
                    {/* Score */}
                    <td className="p-4 font-extrabold text-slate-200 text-sm">{row.score} / 100</td>
                    
                    {/* Pass rate */}
                    <td className="p-4 text-slate-300 font-semibold">{row.passRate}</td>
                    
                    {/* Date */}
                    <td className="p-4 text-slate-500 font-medium">{row.date}</td>
                    
                    {/* Actions link to verify */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => router.push(`/runs/RUN-8041?tab=score`)}
                        className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded transition-colors ml-auto flex items-center justify-end cursor-pointer"
                        aria-label={`Verify results for ${row.stackName} ${row.version}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
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
}
