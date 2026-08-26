'use client';

import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Key, 
  Users, 
  Plus, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Trash2,
  Server
} from 'lucide-react';

interface Workspace {
  organization?: string;
}

export default function OrgSettingsPage() {
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; email: string; role: string; status: string }>>([]);

  const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; token: string; created: string; status: string; visible: boolean }>>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    fetch('/api/organization').then((response) => response.json()).then((result: { user?: Workspace; team?: Array<{ id: string; name: string; email: string; role: string; status: string }>; apiKeys?: Array<{ id: string; name: string; token: string; created: string; status: string }> }) => { setWorkspace(result.user || null); setTeamMembers(result.team || []); setApiKeys((result.apiKeys || []).map((key) => ({ ...key, visible: false }))); }).catch(() => setWorkspace(null));
  }, []);

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleCopy = (id: string, token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleToggleVisible = (id: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, visible: !k.visible } : k));
  };

  const handleRevokeKey = async (id: string) => {
    await fetch('/api/organization/api-keys', { method: 'DELETE' });
    setApiKeys(prev => prev.filter(k => k.id !== id));
  };

  const handleGenerateKey = async () => {
    const response = await fetch('/api/organization/api-keys', { method: 'POST' });
    if (!response.ok) return;
    const result = await response.json();
    if (result.apiKey) setApiKeys([{ id: 'current', name: 'Simulator API Key', token: result.apiKey, created: new Date().toISOString(), status: 'Active', visible: false }]);
  };

  const quotaPercent = 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* KPI Info row: Tier and Quota usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Billing details */}
        <div className="glass-panel glass-panel-hover p-5 rounded-lg flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Plan Tier</span>
            <span className="text-xl font-bold text-white mt-1 block">{workspace?.organization || 'Workspace'}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">
            Billed annually · Auto-renews Sep 2027
          </p>
        </div>

        {/* Quotas Progress bar usage */}
        <div className="glass-panel p-5 rounded-lg md:col-span-2 space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monthly Simulation minutes</span>
              <span className="text-white font-bold">Quota unavailable</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 mt-2.5 overflow-hidden border border-slate-850">
              <div 
                className="bg-slate-350 h-full rounded-full" 
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            Usage data is provided by the backend workspace service.
          </p>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left Column: Team Management */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-lg overflow-hidden">
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-slate-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Management</h4>
              </div>
              <button 
                type="button" 
                className="flex items-center gap-1 px-2.5 py-1 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded cursor-pointer transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Member
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 text-slate-500 font-medium border-b border-slate-800/60 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Name</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-800/25 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{member.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{member.email}</div>
                      </td>
                      <td className="p-4 text-slate-350 font-bold">{member.role}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-955/30 text-emerald-450 border border-emerald-900/50 uppercase tracking-wider">
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: API Keys Issuance */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Key className="h-4.5 w-4.5 text-slate-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">API Credentials</h4>
              </div>
              <button 
                type="button"
                onClick={handleGenerateKey}
                className="text-[10px] font-extrabold text-slate-350 hover:text-white uppercase tracking-wider cursor-pointer"
              >
                + New Key
              </button>
            </div>

            <div className="space-y-4">
              {apiKeys.length > 0 ? (
                apiKeys.map((k) => (
                  <div key={k.id} className="bg-slate-955/40 border border-slate-850 p-4 rounded-lg space-y-3 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white tracking-wide">{k.name}</span>
                      <span className="text-[9px] text-slate-500 font-medium">Created: {k.created}</span>
                    </div>
                    
                    {/* API Token display box */}
                    <div className="flex items-center justify-between gap-2 bg-slate-950 border border-slate-850 rounded px-2.5 py-2">
                      <code className="text-[10px] font-mono text-slate-300 select-all truncate max-w-[150px]">
                        {k.visible ? k.token : '••••••••••••••••••••••••••••••••'}
                      </code>
                      
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleVisible(k.id)}
                          className="text-slate-500 hover:text-slate-300 p-1 rounded cursor-pointer"
                        >
                          {k.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(k.id, k.token)}
                          className="text-slate-500 hover:text-slate-300 p-1 rounded cursor-pointer"
                        >
                          {copiedKeyId === k.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRevokeKey(k.id)}
                          className="text-rose-500/80 hover:text-rose-400 p-1 rounded cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 text-xs py-4">No active API keys found.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
