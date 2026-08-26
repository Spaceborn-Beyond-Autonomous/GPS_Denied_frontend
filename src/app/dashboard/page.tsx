'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Play, Server, AlertCircle, Volume2, TrendingUp, Cpu, Gauge } from 'lucide-react';
import { Run } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  
  // Filter out running, queued, passed, failed, error from mock runs
  const [recentRuns, setRecentRuns] = useState<Run[]>([]);
  useEffect(() => { fetch('/api/runs?limit=5').then((response) => response.json()).then((result: { data?: Run[] }) => setRecentRuns(result.data || [])).catch(() => setRecentRuns([])); }, []);

  const completedRuns = recentRuns.filter((run) => run.score !== null);
  const averageScore = completedRuns.length ? completedRuns.reduce((sum, run) => sum + (run.score || 0), 0) / completedRuns.length : 0;
  const passRate = completedRuns.length ? (completedRuns.filter((run) => run.status === 'Passed').length / completedRuns.length) * 100 : 0;

  const kpis = [
    { name: 'Runs This Month', value: `${recentRuns.length}`, change: 'Loaded from backend', icon: Play, isPositive: true },
    { name: 'Pass Rate %', value: `${passRate.toFixed(1)}%`, change: 'Calculated from loaded runs', icon: Gauge, isPositive: passRate >= 80 },
    { name: 'Avg Score', value: `${averageScore.toFixed(1)} / 100`, change: 'Calculated from loaded runs', icon: TrendingUp, isPositive: true },
    { name: 'Sim-Minutes', value: 'Unavailable', change: 'Backend quota data required', icon: Cpu, isPositive: false }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Passed':
        return 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60';
      case 'Failed':
        return 'bg-rose-950/40 text-rose-400 border border-rose-800/60';
      case 'Running':
        return 'bg-amber-950/40 text-amber-400 border border-amber-800/60';
      case 'Queued':
        return 'bg-slate-850 text-slate-400 border border-slate-700/60';
      case 'Error':
        return 'bg-purple-950/40 text-purple-400 border border-purple-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 4 KPI Cards - Glassmorphic Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div 
            key={kpi.name} 
            className="glass-panel glass-panel-hover p-5 rounded-lg flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-12 h-12 bg-white/2 rounded-full blur-xl group-hover:bg-white/5 transition-all" />
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{kpi.name}</p>
                <p className="text-2xl font-bold text-white mt-2 font-sans tracking-tight">{kpi.value}</p>
              </div>
              <kpi.icon className="h-4.5 w-4.5 text-slate-650 group-hover:text-slate-400 transition-colors mt-0.5" />
            </div>
            
            <div className="flex items-center gap-1.5 mt-4">
              <span className={`text-[10px] font-bold ${kpi.isPositive ? 'text-emerald-450' : 'text-slate-500'}`}>
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Left column (70% width on large screens), Right column (30% width) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left Side Content (Dashboard main content) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Mobile Launch Button (only visible under lg viewports) */}
          <div className="block lg:hidden">
            <Link 
              href="/new-test-run" 
              className="flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-lg text-sm transition-all shadow-lg active:scale-[0.98] duration-150"
            >
              <Play className="h-4 w-4 fill-current text-slate-950" />
              + Launch New Test Run
            </Link>
          </div>

          {/* Recent Simulation Runs Table */}
          <div className="glass-panel rounded-lg overflow-hidden">
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white tracking-tight">Recent Simulation Runs</h3>
              <Link href="/runs" className="text-xs font-semibold text-slate-450 hover:text-slate-200 transition-colors flex items-center gap-1 group">
                View all runs
                <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* Table wrapper for horizontal scroll on mobile */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 text-slate-500 font-medium border-b border-slate-800/60 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Run ID</th>
                    <th className="p-4">Stack + Version</th>
                    <th className="p-4">Scenario</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {recentRuns.map((run) => (
                    <tr 
                      key={run.id}
                      onClick={() => {
                        const tabQuery = run.status === 'Running' ? 'live' : 'score';
                        router.push(`/runs/${run.id}?tab=${tabQuery}`);
                      }}
                      className="hover:bg-slate-800/20 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-bold text-white tracking-wide">{run.id}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-200 group-hover:text-white">{run.stack_name}</div>
                        <div className="text-[10px] text-slate-550 mt-0.5 font-mono">{run.stack_version}</div>
                      </td>
                      <td className="p-4 text-slate-400">{run.scenario_name}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(run.status)}`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-200 text-sm">
                        {run.score !== null ? run.score : '--'}
                      </td>
                      <td className="p-4 text-slate-450 font-mono">{run.duration}</td>
                      <td className="p-4 text-slate-500 font-medium">{run.started_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Horizontal Swipe Indicator for Mobile */}
            <div className="block md:hidden text-center py-3 border-t border-slate-800/60 text-[10px] text-slate-550 font-medium bg-slate-950/20">
              Swipe horizontally to view full simulation data
            </div>
          </div>

          {/* Benchmark Score Trend SVG Graph Card */}
          <div className="glass-panel rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4.5 w-4.5 text-slate-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">Benchmark Score Trend (Over Time per Stack)</h3>
            </div>

            {/* Custom SVG Line Chart with Gradients */}
            <div className="w-full relative bg-slate-950/40 rounded border border-slate-850 p-4">
              <div className="absolute top-4 right-4 flex gap-4 text-[9px] font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="text-slate-400">SlamCore_Nav</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 text-slate-400" />
                  <span className="text-slate-400">Cartographer_Base</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-slate-400">ArucoLocalizer</span>
                </div>
              </div>

              <svg 
                className="w-full h-48 overflow-visible mt-6"
                viewBox="0 0 600 200" 
                preserveAspectRatio="none"
              >
                {/* SVG Definitions for Gradients */}
                <defs>
                  <linearGradient id="gradient-slam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="gradient-carto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="gradient-aruco" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="180" x2="600" y2="180" stroke="#1e293b" strokeWidth="1" />

                {/* Area under curves */}
                {/* SlamCore Area */}
                <path
                  d="M 20 120 L 120 110 L 220 95 L 320 85 L 420 50 L 520 40 L 580 25 L 580 180 L 20 180 Z"
                  fill="url(#gradient-slam)"
                />
                {/* Cartographer Area */}
                <path
                  d="M 20 70 L 120 68 L 220 62 L 320 65 L 420 55 L 520 58 L 580 40 L 580 180 L 20 180 Z"
                  fill="url(#gradient-carto)"
                />
                {/* Aruco Area */}
                <path
                  d="M 20 90 L 120 95 L 220 88 L 320 92 L 420 82 L 520 84 L 580 75 L 580 180 L 20 180 Z"
                  fill="url(#gradient-aruco)"
                />

                {/* Y Axis Labels */}
                <text x="-10" y="25" fill="#475569" className="text-[9px] text-right font-bold">100</text>
                <text x="-10" y="65" fill="#475569" className="text-[9px] text-right font-bold">80</text>
                <text x="-10" y="105" fill="#475569" className="text-[9px] text-right font-bold">60</text>
                <text x="-10" y="145" fill="#475569" className="text-[9px] text-right font-bold">40</text>
                <text x="-10" y="185" fill="#475569" className="text-[9px] text-right font-bold">20</text>

                {/* Graph Paths */}
                {/* SlamCore_Nav: rising from 72 to 94.2 */}
                <path
                  d="M 20 120 L 120 110 L 220 95 L 320 85 L 420 50 L 520 40 L 580 25"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                
                {/* Cartographer_Base: constant around 85-89.6 */}
                <path
                  d="M 20 70 L 120 68 L 220 62 L 320 65 L 420 55 L 520 58 L 580 40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="2"
                />

                {/* ArucoLocalizer: fluctuating around 80-84.2 */}
                <path
                  d="M 20 90 L 120 95 L 220 88 L 320 92 L 420 82 L 520 84 L 580 75"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Graph Dots */}
                <circle cx="580" cy="25" r="4" fill="#22d3ee" className="animate-pulse" />
                <circle cx="580" cy="40" r="4" fill="#10b981" />
                <circle cx="580" cy="75" r="4" fill="#fbbf24" />
              </svg>
              
              {/* X Axis Labels */}
              <div className="flex justify-between text-[9px] font-bold text-slate-500 mt-2 px-1">
                <span>Oct 01</span>
                <span>Oct 05</span>
                <span>Oct 10</span>
                <span>Oct 15</span>
                <span>Oct 20</span>
                <span>Oct 24</span>
              </div>
              
              {/* Overlay Indicator Text */}
              <div className="mt-4 text-center">
                <span className="inline-flex bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-semibold px-3 py-1.5 rounded shadow shadow-slate-950">
                  Score Trend Graph Overlay: Oct 1 - Oct 24
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side Panel (Desktop Quick Actions + Status) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Desktop Launch Button */}
          <div className="hidden lg:block">
            <Link 
              href="/new-test-run" 
              className="flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-lg text-sm shadow-md hover:scale-[1.01] hover:shadow-white/5 active:scale-[0.99] transition-all duration-200"
            >
              + Launch New Test Run
            </Link>
          </div>

          {/* Worker Pool System Status Card */}
          <div className="glass-panel rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Server className="h-4.5 w-4.5 text-slate-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">System Status</h4>
              </div>
            </div>
            
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-350">
                  <span>Worker Pool</span>
                  <span className="font-bold text-white">14 / 20 Available</span>
                </div>
                {/* Progress bar (6 utilized, so 30% filled) */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-850">
                  <div 
                    className="bg-slate-400 h-full rounded-full" 
                    style={{ width: '30%' }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-400 font-medium">Average Queue Wait</span>
                <span className="font-bold text-white font-mono">~1m 15s</span>
              </div>
            </div>
          </div>

          {/* Announcements Card */}
          <div className="glass-panel rounded-lg p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <Volume2 className="h-4.5 w-4.5 text-slate-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Announcements</h4>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold text-white tracking-tight">v1.8 Core Simulator Launched</p>
              <p className="text-[11px] text-slate-450 leading-relaxed font-medium">
                Improved LIDAR noise models and dynamic indoor obstacle rendering are now live.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
