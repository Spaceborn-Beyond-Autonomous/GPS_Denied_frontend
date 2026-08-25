'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, HelpCircle, Layers, Play, Award, CheckCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { mockStacks } from '@/data/mockData';
import { Stack } from '@/types';

function StacksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // State to track expanded stack cards
  const [expandedStackIds, setExpandedStackIds] = useState<string[]>(['stk-1']);
  const [stacks, setStacks] = useState<Stack[]>(mockStacks);

  // Load custom stacks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('spaceborn_custom_stacks');
      if (stored) {
        const custom = JSON.parse(stored);
        if (Array.isArray(custom)) {
          setStacks([...custom, ...mockStacks]);
        }
      }
    } catch (err) {
      console.error('Failed to load custom stacks', err);
    }
  }, []);

  const kpis = [
    { name: 'Total Registered Stacks', value: `${stacks.length} Active`, desc: 'ROS 2 Humble / Iron supported' },
    { name: 'Peak Scenario Score', value: '94.2 / 100', desc: 'SlamCore_Nav v2.1.0-rc3' },
    { name: 'System Total Run Count', value: '1,420 Executed', desc: '+84 this week' },
  ];

  const toggleExpand = (id: string) => {
    setExpandedStackIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Passed':
        return 'text-emerald-400 font-bold';
      case 'Failed':
        return 'text-rose-400 font-bold';
      default:
        return 'text-slate-400 font-bold';
    }
  };

  // Filter based on URL search query (from global search)
  const filteredStacks = stacks.filter(stk => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      stk.name.toLowerCase().includes(query) ||
      stk.tags.some(t => t.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-bold text-white tracking-tight hidden sm:block">
          Navigation Stacks Library
        </h3>
        
        <button
          type="button"
          onClick={() => router.push('/stacks/upload')}
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 text-xs font-bold rounded shadow transition-all shrink-0 self-start sm:self-center cursor-pointer active:scale-99 hover:scale-[1.01]"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload New Stack
        </button>
      </div>

      {/* Search active notification */}
      {searchQuery && (
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-slate-355">
          <span>
            Filtering by search: <strong className="text-white">"{searchQuery}"</strong>
          </span>
          <button 
            onClick={() => router.push('/stacks')}
            className="text-[10px] font-extrabold text-cyan-400 hover:underline uppercase"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div 
            key={kpi.name} 
            className="glass-panel glass-panel-hover p-5 rounded-lg flex flex-col justify-between"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{kpi.name}</p>
              <p className="text-2xl font-bold text-white mt-2 font-sans tracking-tight">{kpi.value}</p>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">
              {kpi.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Main Stacks List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-tight">Submitted Navigation Stacks</h3>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Showing {filteredStacks.length} stacks
          </span>
        </div>

        {/* Stack Items Cards */}
        <div className="space-y-4">
          {filteredStacks.map((stack) => {
            const isExpanded = expandedStackIds.includes(stack.id);
            const latestVer = stack.versions[0];
            
            return (
              <div 
                key={stack.id} 
                className="glass-panel rounded-lg overflow-hidden"
              >
                {/* Header of Stack Card */}
                <div 
                  onClick={() => toggleExpand(stack.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-slate-800/30 select-none"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-base font-extrabold text-white tracking-wide">{stack.name}</h4>
                    
                    {/* Latest version tag */}
                    {latestVer && (
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        latestVer.last_run_status === 'Failed' 
                          ? 'bg-rose-950/40 text-rose-405 border border-rose-900/60'
                          : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60'
                      }`}>
                        {latestVer.version}
                      </span>
                    )}

                    {/* Meta tags */}
                    {stack.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2 py-0.5 bg-slate-905/60 border border-slate-800 rounded text-[9px] font-bold text-slate-400 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions & toggle */}
                  <div className="flex items-center gap-4 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => router.push(`/runs?search=${stack.name}`)}
                      className="px-3 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded cursor-pointer transition-colors"
                    >
                      View Runs
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/new-test-run')}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-950 text-xs font-extrabold rounded flex items-center gap-1 cursor-pointer transition-all active:scale-99 hover:scale-[1.01]"
                    >
                      Re-run Latest
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpand(stack.id)}
                      className="text-slate-500 hover:text-slate-300 p-1 rounded cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && latestVer && (
                  <div className="px-5 pb-5 pt-1.5 border-t border-slate-805 bg-slate-950/20 space-y-5">
                    {/* Metric counts grid */}
                    <div className="grid grid-cols-3 gap-6 py-1 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Evaluated Runs</span>
                        <span className="text-sm font-bold text-white mt-1 block">
                          {stack.versions.reduce((acc, ver) => acc + ver.run_count, 0)} runs
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Historical Best Score</span>
                        <span className="text-sm font-extrabold text-white mt-1 block">
                          {latestVer.best_score ? `${latestVer.best_score} / 100` : '--'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Last Run Status</span>
                        <span className={`text-sm mt-1 block flex items-center gap-1.5 ${getStatusStyle(latestVer.last_run_status)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            latestVer.last_run_status === 'Passed' ? 'bg-emerald-500' : latestVer.last_run_status === 'Failed' ? 'bg-rose-500' : 'bg-slate-400'
                          }`} />
                          {latestVer.last_run_status}
                        </span>
                      </div>
                    </div>

                    {/* Version History Table */}
                    <div className="space-y-2.5">
                      <h5 className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
                        Version Submission History
                      </h5>
                      
                      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-900/60 text-slate-500 font-medium border-b border-slate-800 uppercase tracking-wider text-[9px]">
                              <th className="p-3">Version</th>
                              <th className="p-3">Image Digest</th>
                              <th className="p-3">Submitted Date</th>
                              <th className="p-3">Best Score</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {stack.versions.map((ver) => (
                              <tr key={ver.id} className="hover:bg-slate-900/40 text-slate-350 transition-colors">
                                <td className="p-3 font-bold text-white">{ver.version}</td>
                                <td className="p-3 font-mono text-[9px] text-slate-500 truncate max-w-[200px]" title={ver.image_digest}>
                                  {ver.image_digest.slice(0, 32)}...
                                </td>
                                <td className="p-3 text-slate-400">{ver.submitted_date}</td>
                                <td className="p-3 font-bold text-slate-200">
                                  {ver.best_score ? `${ver.best_score} / 100` : '--'}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => router.push(`/runs/${ver.last_run_status === 'Failed' ? 'RUN-8040' : 'RUN-8041'}?tab=score`)}
                                    className="text-xs text-slate-400 hover:text-white font-semibold transition-colors flex items-center gap-1.5 justify-end ml-auto cursor-pointer"
                                  >
                                    Verify Results
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
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
            );
          })}
        </div>
      </div>

      {filteredStacks.length === 0 && (
        <div className="text-center py-12 bg-slate-900/30 border border-slate-800 rounded-lg">
          <p className="text-slate-500 font-medium">No stacks match your search query.</p>
        </div>
      )}

    </div>
  );
}

export default function StacksPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 rounded-full border-2 border-slate-700 border-t-slate-400 animate-spin" />
      </div>
    }>
      <StacksContent />
    </Suspense>
  );
}

