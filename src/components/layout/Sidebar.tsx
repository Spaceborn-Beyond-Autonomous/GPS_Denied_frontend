'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  Settings,
  LogOut,
  UserRound
} from 'lucide-react';

interface SidebarUser {
  name: string;
  email: string;
  title?: string;
  organization?: string;
}

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'live';
  const [user, setUser] = useState<SidebarUser | null>(null);

  useEffect(() => {
    fetch('/api/me')
      .then((response) => response.ok ? response.json() : null)
      .then((result: { user?: SidebarUser } | null) => {
        if (result?.user) setUser(result.user);
      })
      .catch(() => undefined);
  }, []);

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

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/signup');
    router.refresh();
  };

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
        <Link href="/profile" onClick={onCloseMobile} className={`flex items-center gap-3 rounded-md p-2 -m-2 transition-colors hover:bg-slate-800/60 ${pathname === '/profile' ? 'bg-slate-800/60' : ''}`}>
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-white select-none">
            <UserRound className="h-4 w-4 text-slate-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Loading operator'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.title || user?.organization || 'Account'}</p>
          </div>
        </Link>
        <button type="button" onClick={handleSignOut} className="mt-3 flex w-full items-center gap-2 rounded-md px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300">
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
