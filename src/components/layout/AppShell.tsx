'use client';

import React, { useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { X } from 'lucide-react';

interface AppProps {
  children: React.ReactNode;
}

// Separate component to handle search parameter logic under a Suspense boundary
function DynamicHeaderTitle({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'live';

  const getHeaderTitle = () => {
    if (pathname === '/dashboard') return 'Nav-Testing Dashboard';
    if (pathname === '/new-test-run') return 'New Test Run Wizard';
    if (pathname === '/runs') return 'Simulation Run Logs';
    if (pathname.startsWith('/runs/')) {
      if (tab === 'live') return 'Live Simulation Feed Viewer';
      if (tab === 'score') return 'Simulation Post-Run Score Report';
      if (tab === 'timeline') return 'Interactive Event Log Timeline';
      return 'Simulation Run Logs';
    }
    if (pathname === '/scenarios') return 'Simulation Scenarios Catalog';
    if (pathname === '/leaderboard') return 'Performance Navigation Leaderboard';
    if (pathname === '/stacks') return 'Navigation Stacks Library';
    if (pathname === '/org-settings') return 'Organisation Settings';
    if (pathname === '/docs') return 'Developer Integration Guide';
    return 'SpaceBorn Nav-Testing';
  };

  return (
    <h2 className="text-lg font-bold text-white tracking-tight truncate max-w-[200px] md:max-w-md animate-fade-in">
      {getHeaderTitle()}
    </h2>
  );
}

// Fallback skeleton header title during suspension
function HeaderTitleFallback() {
  return (
    <h2 className="text-lg font-bold text-slate-400 tracking-tight truncate max-w-[200px] md:max-w-md animate-pulse">
      SpaceBorn Nav-Testing
    </h2>
  );
}

// Fallback sidebar layout during suspension
function SidebarFallback() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white">SpaceBorn</h1>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block mt-0.5 animate-pulse">
          LOADING SYSTEM...
        </span>
      </div>
      <div className="flex-1 px-4 py-6 bg-slate-900/50" />
    </aside>
  );
}

export default function AppShell({ children }: AppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getSearchPlaceholder = () => {
    if (pathname === '/stacks') return 'Search submitted stacks...';
    if (pathname === '/runs' || pathname === '/dashboard') return 'Search tests, stacks...';
    return 'Search tests, catalogs...';
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar (lg and up) - wrapped in Suspense */}
      <div className="hidden lg:flex lg:flex-shrink-0 h-full">
        <Suspense fallback={<SidebarFallback />}>
          <Sidebar />
        </Suspense>
      </div>

      {/* Mobile Drawer Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sliding Panel */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-slate-900 focus:outline-none transition-transform duration-300 transform translate-x-0">
            {/* Render Sidebar inside mobile view - wrapped in Suspense */}
            <div className="h-full">
              <Suspense fallback={<SidebarFallback />}>
                <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header - titleNode uses Suspense */}
        <Header 
          titleNode={
            <Suspense fallback={<HeaderTitleFallback />}>
              <DynamicHeaderTitle pathname={pathname} />
            </Suspense>
          } 
          onMenuClick={() => setSidebarOpen(true)} 
          searchPlaceholder={getSearchPlaceholder()}
          systemStatus="online"
        />

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
