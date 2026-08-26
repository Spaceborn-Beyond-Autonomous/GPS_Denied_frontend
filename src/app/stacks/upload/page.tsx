'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileCode, Check, Layers, AlertCircle, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function UploadStackPage() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState('Cartographer_SLAM_V4');
  const [version, setVersion] = useState('v1.0.0');
  const [digest, setDigest] = useState('sha255:4f3b9a2c1d4e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a');
  const [manifestYaml, setManifestYaml] = useState(`apiVersion: spaceborn/v1beta1
kind: NavigationStack
metadata:
  name: "cartographer-slam-v4"
spec:
  entrypoint: "/opt/ros/humble/setup.bash && roslaunch cartographer_slam_v4 navigation.launch"
  resource_requests:
    cpu: 4
    memory_gb: 8
    gpu: false
`);

  // Selected tags state
  const availableTags = ['ROS 2 Humble', 'SLAM', 'LIDAR-3D', 'Fiducial-Nav', 'ROS 2 Iron', 'LIDAR-2D', 'Visual-Odometry'];
  const [selectedTags, setSelectedTags] = useState<string[]>(['ROS 2 Humble', 'SLAM']);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const stackId = `stk-custom-${Date.now()}`;
    const newStack = {
      id: stackId,
      org_id: 'org-1',
      name,
      tags: selectedTags,
      versions: [
        {
          id: `ver-${Date.now()}`,
          stack_id: stackId,
          version,
          image_digest: digest,
          submitted_date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          best_score: null,
          run_count: 0,
          last_run_status: 'Queued',
          manifest_yaml: manifestYaml,
        }
      ]
    };

    const response = await fetch('/api/stacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStack),
    });
    if (!response.ok) {
      console.error('Failed to register stack through API', await response.text());
      return;
    }

    router.push('/stacks');
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/stacks" 
          className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-slate-450 hover:text-white border border-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Register Navigation Stack</h3>
          <p className="text-[10px] text-slate-500 font-medium">Submit a new containerized navigation algorithm stack version.</p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Form panel (60% width) */}
        <form onSubmit={handleRegister} className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-5 rounded-lg space-y-5">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 pb-2.5 border-b border-slate-800/80">Stack Details</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stack Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Stack Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. MyROS2Planner"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-250 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                />
              </div>

              {/* Version */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Initial Version</label>
                <input 
                  type="text" 
                  value={version} 
                  onChange={(e) => setVersion(e.target.value)}
                  required
                  placeholder="e.g. v1.0.0"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-250 placeholder-slate-600 focus:outline-none focus:border-slate-700 font-mono"
                />
              </div>
            </div>

            {/* Docker Image Digest */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Docker Image Digest (SHA256)</label>
              <input 
                type="text" 
                value={digest} 
                onChange={(e) => setDigest(e.target.value)}
                required
                placeholder="sha256:..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-250 placeholder-slate-600 focus:outline-none focus:border-slate-700 font-mono text-[10px]"
              />
            </div>

            {/* Tags Multi-select Pills */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Navigation Stack Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-2.5 py-1.5 rounded border text-[9px] font-bold uppercase transition-all tracking-wider cursor-pointer select-none ${
                        selected
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-extrabold'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Manifest YAML Editor */}
          <div className="glass-panel p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-cyan-400" />
                <h4 className="text-xs uppercase tracking-wider text-slate-400">Stack Manifest YAML</h4>
              </div>
              <span className="text-[9px] text-slate-500 font-mono font-bold">manifest.yaml</span>
            </div>

            <div className="space-y-1.5">
              <textarea 
                rows={6}
                value={manifestYaml} 
                onChange={(e) => setManifestYaml(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded p-4 text-[10px] text-slate-300 font-mono focus:outline-none focus:border-slate-700 leading-relaxed"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link 
              href="/stacks" 
              className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-250 text-xs font-bold rounded cursor-pointer transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 text-xs font-extrabold rounded shadow transition-all cursor-pointer active:scale-99 hover:scale-[1.01]"
            >
              Register Navigation Stack
            </button>
          </div>
        </form>

        {/* Guidelines / Dropzone Sidebar (40% width) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-lg space-y-5">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 pb-2.5 border-b border-slate-800/80">Guidelines</h4>

            {/* Docker Registry note */}
            <div className="flex gap-3 p-1.5">
              <Cpu className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-300 block">Docker Image Verification</span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  Ensure the image has been pushed to the private registry at <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[9px] border border-slate-850">registry.spaceborn.io/stacks</code>. The verification agent queries this repository to download files.
                </p>
              </div>
            </div>

            {/* Mock Drag & Drop Dropzone */}
            <div className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-955/20 rounded-lg p-5 flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer transition-colors group">
              <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-400 group-hover:text-white transition-colors">
                <Upload className="h-3.5 w-3.5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-350 block">Upload Manifest Bundle</span>
                <span className="text-[9px] text-slate-550 font-medium block">Drag workspace archive or .yaml directly (Max 25MB)</span>
              </div>
            </div>

            {/* Resource warning */}
            <div className="flex gap-3 bg-slate-950/50 border border-slate-800 p-3.5 rounded-lg text-[10px] font-medium text-slate-500 leading-relaxed">
              <AlertCircle className="h-4.5 w-4.5 text-slate-500 shrink-0 mt-0.5" />
              <p>
                SpaceBorn clusters run simulated environments in highly parallel pods. If resource limits are not defined in manifest files, defaults will apply: 2 CPUs, 4GB Memory, and No GPU acceleration.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
