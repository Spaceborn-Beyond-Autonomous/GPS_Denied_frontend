'use client';

import { useEffect, useState } from 'react';
import { Building2, Mail, ShieldCheck, UserRound } from 'lucide-react';

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  organization: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load profile.');
        setUser(result.user);
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load profile.');
      });
  }, []);

  if (error) {
    return <div role="alert" className="glass-panel rounded-lg border-rose-500/30 p-6 text-sm text-rose-300">{error}</div>;
  }

  if (!user) {
    return <div className="glass-panel rounded-lg p-6 text-sm text-slate-500 animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="glass-panel rounded-lg p-6 sm:p-8">
        <div className="flex flex-col gap-5 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
            <UserRound className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-400">Operator profile</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">{user.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{user.id}</p>
          </div>
        </div>

        <div className="grid gap-4 pt-6 sm:grid-cols-2">
          <ProfileDetail icon={<Mail />} label="Email address" value={user.email} />
          <ProfileDetail icon={<Building2 />} label="Organization" value={user.organization} />
          <ProfileDetail icon={<ShieldCheck />} label="Access" value="Authenticated operator" />
        </div>
      </div>
    </div>
  );
}

function ProfileDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <span className="text-cyan-400">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-3 break-words text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}