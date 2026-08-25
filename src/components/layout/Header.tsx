'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, Bell, Layers, Map, Activity, X } from 'lucide-react';
import { mockScenarios, mockStacks, mockRuns } from '@/data/mockData';
import { Scenario, Stack, Run } from '@/types';
import Link from 'next/link';

interface HeaderProps {
  titleNode: React.ReactNode;
  onMenuClick: () => void;
  searchPlaceholder?: string;
  systemStatus?: 'online' | 'offline';
}

export default function Header({ 
  titleNode, 
  onMenuClick, 
  searchPlaceholder = 'Search tests, stacks...',
  systemStatus = 'online'
}: HeaderProps) {
  const router = useRouter();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>(mockScenarios);
  const [stacks, setStacks] = useState<Stack[]>(mockStacks);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Load custom scenarios & stacks from localStorage on mount/focus
  useEffect(() => {
    try {
      const storedScen = localStorage.getItem('spaceborn_custom_scenarios');
      if (storedScen) {
        const customScen = JSON.parse(storedScen);
        if (Array.isArray(customScen)) {
          setScenarios([...customScen, ...mockScenarios]);
        }
      }
      const storedStk = localStorage.getItem('spaceborn_custom_stacks');
      if (storedStk) {
        const customStk = JSON.parse(storedStk);
        if (Array.isArray(customStk)) {
          setStacks([...customStk, ...mockStacks]);
        }
      }
    } catch (err) {
      console.error('Failed to load local storage for search', err);
    }
  }, [showDropdown]); // Reload when search panel opens

  // Click outside listener to dismiss search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items based on searchQuery
  const query = searchQuery.toLowerCase().trim();
  
  const matchedStacks = query 
    ? stacks.filter(s => s.name.toLowerCase().includes(query) || s.tags.some(t => t.toLowerCase().includes(query))).slice(0, 3)
    : [];
    
  const matchedScenarios = query
    ? scenarios.filter(s => s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)).slice(0, 3)
    : [];
    
  const matchedRuns = query
    ? mockRuns.filter(r => r.id.toLowerCase().includes(query) || r.stack_name.toLowerCase().includes(query) || r.scenario_name.toLowerCase().includes(query)).slice(0, 3)
    : [];

  const hasResults = matchedStacks.length > 0 || matchedScenarios.length > 0 || matchedRuns.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setShowDropdown(false);
    // Route to runs list with search filter by default
    router.push(`/runs?search=${encodeURIComponent(query)}`);
  };

  const handleItemClick = (href: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 select-none">
      {/* Title & Hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          type="button"
          className="lg:hidden text-slate-400 hover:text-white focus:outline-none p-1.5 rounded-md hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        {titleNode}
      </div>

      {/* Right Search + Status + Notification controls */}
      <div className="flex items-center gap-4">
        {/* Search Bar - hidden on mobile, visible on tablet/desktop */}
        <div ref={searchRef} className="relative hidden md:block w-64 lg:w-80">
          <form onSubmit={handleSearchSubmit}>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 pl-10 pr-8 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 font-semibold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowDropdown(false);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Floating Search Results Dropdown */}
          {showDropdown && searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-md shadow-2xl z-50 max-h-96 overflow-y-auto p-2 space-y-3 font-semibold text-xs animate-fade-in">
              {hasResults ? (
                <>
                  {/* Category: Stacks */}
                  {matchedStacks.length > 0 && (
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Layers className="h-3 w-3 text-slate-500" />
                        Navigation Stacks
                      </span>
                      {matchedStacks.map(stack => (
                        <div
                          key={stack.id}
                          onClick={() => handleItemClick(`/stacks?search=${encodeURIComponent(stack.name)}`)}
                          className="px-2.5 py-1.5 rounded hover:bg-slate-800/60 cursor-pointer text-slate-300 hover:text-white transition-colors"
                        >
                          <div className="font-bold text-[11px]">{stack.name}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5 font-medium truncate">
                            Tags: {stack.tags.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category: Scenarios */}
                  {matchedScenarios.length > 0 && (
                    <div className="space-y-1 border-t border-slate-800/60 pt-2">
                      <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Map className="h-3 w-3 text-slate-500" />
                        Environmental Scenarios
                      </span>
                      {matchedScenarios.map(scen => (
                        <div
                          key={scen.id}
                          onClick={() => handleItemClick(`/scenarios?search=${encodeURIComponent(scen.name)}`)}
                          className="px-2.5 py-1.5 rounded hover:bg-slate-800/60 cursor-pointer text-slate-300 hover:text-white transition-colors"
                        >
                          <div className="font-bold text-[11px]">{scen.name}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5 font-medium truncate">
                            {scen.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category: Runs */}
                  {matchedRuns.length > 0 && (
                    <div className="space-y-1 border-t border-slate-800/60 pt-2">
                      <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Activity className="h-3 w-3 text-slate-500" />
                        Simulation Runs
                      </span>
                      {matchedRuns.map(run => (
                        <div
                          key={run.id}
                          onClick={() => handleItemClick(`/runs/${run.id}?tab=${run.status === 'Running' ? 'live' : 'score'}`)}
                          className="px-2.5 py-1.5 rounded hover:bg-slate-800/60 cursor-pointer text-slate-300 hover:text-white transition-colors flex justify-between items-center"
                        >
                          <div>
                            <div className="font-bold text-[11px] text-white flex items-center gap-1.5">
                              {run.id}
                              <span className="text-[9px] text-slate-500 font-mono">({run.stack_name})</span>
                            </div>
                            <div className="text-[9px] text-slate-550 mt-0.5 font-mono truncate">
                              {run.scenario_name}
                            </div>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                            run.status === 'Passed' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/50' :
                            run.status === 'Failed' ? 'bg-rose-950/20 text-rose-400 border-rose-900/50' :
                            run.status === 'Running' ? 'bg-amber-950/20 text-amber-400 border-amber-900/50' :
                            'bg-slate-800/40 text-slate-400 border-slate-700/50'
                          }`}>
                            {run.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-center pt-2 border-t border-slate-800/60 text-[9px] text-slate-500 uppercase tracking-widest">
                    Press <span className="text-white font-mono border border-slate-800 bg-slate-950 px-1 py-0.5 rounded">Enter</span> to search all runs
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-slate-500 text-[11px]">
                  No matching stacks, scenarios, or runs found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* System Status Pill */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-[10px] font-medium tracking-wide">
          <span className={`h-1.5 w-1.5 rounded-full ${
            systemStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
          }`} />
          <span className="text-slate-400">
            {systemStatus === 'online' ? 'System OK' : 'System Offline'}
          </span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 relative focus:outline-none"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
        </button>
      </div>
    </header>
  );
}

