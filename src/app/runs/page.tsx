'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Download, 
  BarChart4, 
  X,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { Run } from '@/types';

function RunsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  // States
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [runs, setRuns] = useState<Run[]>([]);
  
  // Update local query state if search param changes (e.g. via header search submit)
  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== 'All') params.set('status', statusFilter);
    if (searchQuery) params.set('search', searchQuery);
    fetch(`/api/runs?${params.toString()}`)
      .then((response) => response.json())
      .then((result: { data?: Run[] }) => setRuns(result.data || []))
      .catch(() => setRuns([]));
  }, [statusFilter, searchQuery]);
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);

  // Status Filter options
  const filterOptions = ['All', 'Queued', 'Running', 'Passed', 'Failed', 'Error'];

  // Handle Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>, runsToSelect: Run[]) => {
    if (e.target.checked) {
      setSelectedRunIds(runsToSelect.map(r => r.id));
    } else {
      setSelectedRunIds([]);
    }
  };

  // Handle Select Individual
  const handleSelectIndividual = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.checked) {
      setSelectedRunIds(prev => [...prev, id]);
    } else {
      setSelectedRunIds(prev => prev.filter(item => item !== id));
    }
  };

  // Get filtered runs
  const filteredRuns = runs.filter(run => {
    const matchesStatus = statusFilter === 'All' || run.status === statusFilter;
    const matchesSearch = run.stack_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          run.scenario_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          run.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Simple Mock Pagination (6 runs per page)
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredRuns.length / itemsPerPage) || 1;
  const paginatedRuns = filteredRuns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Passed':
        return 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60';
      case 'Failed':
        return 'bg-rose-950/40 text-rose-400 border border-rose-800/60';
      case 'Running':
        return 'bg-amber-950/40 text-amber-400 border border-amber-800/60';
      case 'Queued':
        return 'bg-slate-855 text-slate-400 border border-slate-700/60';
      case 'Error':
        return 'bg-purple-950/40 text-purple-400 border border-purple-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  // Get detailed information of runs selected for comparison
  const comparedRuns = runs.filter(r => selectedRunIds.includes(r.id));

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Table Toolbar: Filter chips & Search input */}
      <div className="glass-panel p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                setStatusFilter(opt);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full border transition-all ${
                (opt === 'All' && statusFilter === 'All') || (opt !== 'All' && statusFilter === opt)
                  ? 'bg-white text-slate-950 border-white font-bold'
                  : 'bg-slate-950/50 text-slate-400 border-slate-850 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              {opt === 'All' ? 'All Runs' : opt}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by stack name..."
            className="w-full bg-slate-950 border border-slate-850 rounded-md py-1.5 pl-9 pr-4 text-xs text-slate-250 placeholder-slate-550 focus:outline-none focus:border-slate-700"
          />
        </div>
      </div>

      {/* Main Runs Table Container */}
      <div className="glass-panel rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-500 font-medium border-b border-slate-800/60 uppercase tracking-wider text-[10px]">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={paginatedRuns.length > 0 && paginatedRuns.every(r => selectedRunIds.includes(r.id))}
                    onChange={(e) => handleSelectAll(e, paginatedRuns)}
                    className="accent-slate-100 rounded bg-slate-900 border-slate-800 h-3.5 w-3.5"
                  />
                </th>
                <th className="p-4">Run ID</th>
                <th className="p-4">Stack + Version</th>
                <th className="p-4">Scenario</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Score</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Started By</th>
                <th className="p-4">Started At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {paginatedRuns.length > 0 ? (
                paginatedRuns.map((run) => (
                  <tr 
                    key={run.id}
                    className={`hover:bg-slate-800/20 transition-colors ${
                      selectedRunIds.includes(run.id) ? 'bg-slate-800/15' : ''
                    }`}
                  >
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedRunIds.includes(run.id)}
                        onChange={(e) => handleSelectIndividual(e, run.id)}
                        className="accent-slate-100 rounded bg-slate-900 border-slate-800 h-3.5 w-3.5"
                      />
                    </td>
                    <td 
                      onClick={() => {
                        const tabQuery = run.status === 'Running' ? 'live' : 'score';
                        router.push(`/runs/${run.id}?tab=${tabQuery}`);
                      }}
                      className="p-4 font-bold text-white tracking-wide hover:underline cursor-pointer"
                    >
                      {run.id}
                    </td>
                    <td 
                      onClick={() => {
                        const tabQuery = run.status === 'Running' ? 'live' : 'score';
                        router.push(`/runs/${run.id}?tab=${tabQuery}`);
                      }}
                      className="p-4 cursor-pointer"
                    >
                      <div className="font-semibold text-slate-200">{run.stack_name}</div>
                      <div className="text-[10px] text-slate-550 mt-0.5 font-mono">{run.stack_version}</div>
                    </td>
                    <td className="p-4 text-slate-350">{run.scenario_name}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(run.status)}`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-200 text-sm">
                      {run.score !== null ? run.score : '--'}
                    </td>
                    <td className="p-4 text-slate-450 font-mono">{run.duration}</td>
                    <td className="p-4 text-slate-450">{run.started_by}</td>
                    <td className="p-4 text-slate-500 font-medium">{run.started_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 text-xs font-semibold">
                    No matching simulation runs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Horizontal Swipe Indicator for Mobile */}
        <div className="block md:hidden text-center py-3 border-t border-slate-800/60 text-[10px] text-slate-500 font-medium bg-slate-950/20">
          Swipe horizontally to view full simulation data
        </div>
      </div>

      {/* Table Footer: Action buttons & Pagination */}
      <div className="glass-panel p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Selected Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={selectedRunIds.length < 2}
            onClick={() => setCompareModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-bold transition-all ${
              selectedRunIds.length >= 2
                ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-750 cursor-pointer'
                : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
            }`}
          >
            <BarChart4 className="h-3.5 w-3.5" />
            Compare Selected
          </button>
          <button
            type="button"
            disabled={selectedRunIds.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-bold transition-all ${
              selectedRunIds.length > 0
                ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-750 cursor-pointer'
                : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            disabled={selectedRunIds.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-bold transition-all ${
              selectedRunIds.length > 0
                ? 'bg-rose-950/40 text-rose-455 border-rose-900/65 hover:bg-rose-900/20 cursor-pointer'
                : 'bg-slate-950 text-slate-650 border-slate-900 cursor-not-allowed'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-slate-450">
          <span className="font-semibold">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredRuns.length)} of {filteredRuns.length} runs
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={`p-1.5 rounded border border-slate-800 focus:outline-none ${
                currentPage === 1 ? 'text-slate-650 cursor-not-allowed' : 'text-slate-350 hover:bg-slate-850 cursor-pointer'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="h-7 w-7 rounded bg-white text-slate-950 flex items-center justify-center font-extrabold shadow">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={`p-1.5 rounded border border-slate-800 focus:outline-none ${
                currentPage === totalPages ? 'text-slate-650 cursor-not-allowed' : 'text-slate-350 hover:bg-slate-850 cursor-pointer'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Run Comparison Modal (Active when Compare Selected clicked) */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" 
            onClick={() => setCompareModalOpen(false)}
          />
          {/* Modal box */}
          <div className="glass-panel rounded-lg max-w-3xl w-full relative z-10 overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                <BarChart4 className="h-4 w-4 text-slate-400" />
                Comparison Report ({comparedRuns.length} Runs Selected)
              </h3>
              <button 
                onClick={() => setCompareModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 overflow-x-auto space-y-6">
              <div className="grid grid-cols-3 gap-6 text-xs">
                {/* Column Headers */}
                <div className="space-y-4.5 font-bold text-slate-500 uppercase tracking-wider py-4 border-r border-slate-800/80 pr-4 mt-16 text-[9px]">
                  <div>Scenario</div>
                  <div>Status</div>
                  <div>Final Score</div>
                  <div>Duration</div>
                  <div>RNG Seed</div>
                  <div>Execution Pod</div>
                </div>

                {/* Compared run columns */}
                {comparedRuns.slice(0, 2).map((run) => (
                  <div key={run.id} className="bg-slate-950/60 border border-slate-850 rounded-lg p-5 space-y-4.5 hover:border-slate-700 transition-colors">
                    <div className="font-extrabold text-white text-sm border-b border-slate-800/80 pb-2.5 flex justify-between items-center">
                      <span>{run.id}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{run.stack_name} ({run.stack_version})</span>
                    </div>
                    <div className="truncate font-semibold text-slate-200">{run.scenario_name}</div>
                    <div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(run.status)}`}>
                        {run.status}
                      </span>
                    </div>
                    <div className="text-white font-extrabold text-lg tracking-tight">
                      {run.score !== null ? `${run.score} / 100` : '--'}
                    </div>
                    <div className="text-slate-350 font-medium font-mono">{run.duration}</div>
                    <div className="text-slate-450 font-mono text-[10px]">{run.seed}</div>
                    <div className="text-slate-500 font-mono text-[10px] truncate" title={run.worker_pod_id}>{run.worker_pod_id}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-855 flex justify-end bg-slate-950/60">
              <button
                type="button"
                onClick={() => setCompareModalOpen(false)}
                className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold rounded cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function RunsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 rounded-full border-2 border-slate-700 border-t-slate-400 animate-spin" />
      </div>
    }>
      <RunsContent />
    </Suspense>
  );
}
