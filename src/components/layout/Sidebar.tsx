'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Activity, 
  Map, 
  Trophy, 
  Layers,
  Tv,
  Award,
  Clock,
  Terminal,
  Settings
} from 'lucide-react';
import { mockUser } from '@/data/mockData';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'live';

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Test Run', href: '/new-test-run', icon: PlusCircle },
    { name: 'Runs', href: '/runs', icon: Activity },
    { name: 'Scenarios', href: '/scenarios', icon: Map },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Stacks', href: '/stacks', icon: Layers },
  ];

  // Helper to check if item is active
  const isItemActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  // Helper to extract run ID if we are on a run detail page
  const getRunId = () => {
    const match = pathname.match(/^\/runs\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  };

  const runId = getRunId();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/dashboard" className="block focus:outline-none" onClick={onCloseMobile}>
          <h1 className="text-xl font-bold tracking-tight text-white">SpaceBorn</h1>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block mt-0.5">
            NAV-TESTING PLATFORM
          </span>
        </Link>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        {menuItems.map((item) => {
          const active = isItemActive(item.href);
          const isRuns = item.name === 'Runs';
          
          return (
            <div key={item.name} className="space-y-1">
              <Link
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group ${
                  active 
                    ? 'bg-slate-800 text-white border-l-2 border-slate-400' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 shrink-0 ${
                  active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                {item.name}
              </Link>

              {/* Nested Navigation for Run Details */}
              {isRuns && runId && (
                <div className="pl-6 pr-2 py-1.5 space-y-1 border-l border-slate-800 ml-5 mt-1">
                  {[
                    { name: 'Live Viewer', value: 'live', icon: Tv },
                    { name: 'Score Reports', value: 'score', icon: Award },
                    { name: 'Timelines', value: 'timeline', icon: Clock },
                    { name: 'Run Logs', value: 'logs', icon: Terminal },
                  ].map((subItem) => {
                    const isSubActive = activeTab === subItem.value;
                    return (
                      <Link
                        key={subItem.value}
                        href={`/runs/${runId}?tab=${subItem.value}`}
                        onClick={onCloseMobile}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all ${
                          isSubActive
                            ? 'bg-slate-800 text-white font-semibold'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                        }`}
                      >
                        <subItem.icon className={`h-3.5 w-3.5 ${
                          isSubActive ? 'text-white' : 'text-slate-600'
                        }`} />
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-white select-none">
            GG
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{mockUser.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{mockUser.title}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
