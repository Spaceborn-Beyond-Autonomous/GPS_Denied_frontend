'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Copy, Check, FileCode, Play, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UploadScenarioPage() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState('Custom Lab Run');
  const [version, setVersion] = useState('v1.0.0-dev');
  const [description, setDescription] = useState('YAML-configured custom test run with localized signal attenuation coefficients.');
  const [duration, setDuration] = useState('15m');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Custom'>('Custom');
  const [worldFileRef, setWorldFileRef] = useState('sandbox_custom.sdf');
  const [sensorSuite, setSensorSuite] = useState('Intel RealSense D435i, 3D LiDAR, IMU');
  const [goalDefinition, setGoalDefinition] = useState('Custom path execution, avoid static obstructions');

  // Jamming Profile state (10 data points)
  const [jammingProfile, setJammingProfile] = useState<number[]>([0, 15, 30, 45, 60, 60, 40, 20, 10, 0]);

  const [copied, setCopied] = useState(false);
  const [yamlConfig, setYamlConfig] = useState('');

  // Generate YAML string dynamically based on state
  useEffect(() => {
    const yaml = `apiVersion: spaceborn/v1beta1
kind: EnvironmentalScenario
metadata:
  name: "${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"
  version: "${version}"
spec:
  displayName: "${name}"
  description: "${description.replace(/"/g, '\\"')}"
  durationLimit: "${duration}"
  difficultyGrade: "${difficulty}"
  worldReferenceFile: "${worldFileRef}"
  sensorSuiteRequirements:
    manifest: "${sensorSuite.replace(/"/g, '\\"')}"
  objectiveCriteria:
    definition: "${goalDefinition.replace(/"/g, '\\"')}"
  signalDegradationProfile:
    timesteps: 10
    lossCurve: [${jammingProfile.join(', ')}]
`;
    setYamlConfig(yaml);
  }, [name, version, description, duration, difficulty, worldFileRef, sensorSuite, goalDefinition, jammingProfile]);

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(yamlConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSliderChange = (index: number, val: number) => {
    const updated = [...jammingProfile];
    updated[index] = val;
    setJammingProfile(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const newScenario = {
      id: `scen-custom-${Date.now()}`,
      name,
      version,
      description,
      duration,
      difficulty,
      world_file_ref: worldFileRef,
      jamming_profile: jammingProfile,
      goal_definition: goalDefinition,
      sensor_suite: sensorSuite,
    };

    const response = await fetch('/api/scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newScenario),
    });
    if (!response.ok) {
      console.error('Failed to save scenario through API', await response.text());
      return;
    }

    router.push('/scenarios');
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/scenarios" 
          className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Upload Custom Scenario YAML</h3>
          <p className="text-[10px] text-slate-500 font-medium">Configure and register a localized obstacle/denial test profile.</p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Form Fields (60% / col-span-6) */}
        <form onSubmit={handleSave} className="lg:col-span-6 space-y-6">
          
          <div className="glass-panel p-5 rounded-lg space-y-5">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 pb-2.5 border-b border-slate-800/80">Scenario Metadata</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Scenario Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Subterranean Cavern Maze"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-250 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                />
              </div>

              {/* Version */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Configuration Version</label>
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

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Detailed Description</label>
              <textarea 
                rows={3}
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Detail the layout, dynamic obstacle profiles, lighting features, etc..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-250 placeholder-slate-600 focus:outline-none focus:border-slate-700 leading-relaxed font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Max Run Duration</label>
                <input 
                  type="text" 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  placeholder="e.g. 15m"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-250 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Difficulty Grade</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-250 focus:outline-none focus:border-slate-700"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {/* World File Ref */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SDF World File</label>
                <input 
                  type="text" 
                  value={worldFileRef} 
                  onChange={(e) => setWorldFileRef(e.target.value)}
                  required
                  placeholder="e.g. subt_maze.sdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-250 placeholder-slate-600 focus:outline-none focus:border-slate-700 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Jamming Profile Visual Editor */}
          <div className="glass-panel p-5 rounded-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <h4 className="text-xs uppercase tracking-wider text-slate-400">Signal Loss Curve Configurator</h4>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Drag sliders to adjust 10-step profile</span>
            </div>

            {/* Sparkline preview matching inputs */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Curve Preview</span>
              <div className="h-20 w-full bg-slate-950/80 border border-slate-800 rounded p-1 flex items-end gap-1.5 select-none">
                {jammingProfile.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-cyan-500/60 rounded-t hover:bg-cyan-400 transition-all flex flex-col justify-end"
                    style={{ height: `${Math.max(8, val)}%` }}
                    title={`Step ${idx + 1}: ${val}% loss`}
                  >
                    <span className="text-[7px] text-white text-center font-mono font-bold block mb-1">
                      {val > 25 ? `${val}%` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Slider grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 pt-2 text-[9px] text-center font-mono text-slate-400">
              {jammingProfile.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-2 bg-slate-900/30 p-1.5 rounded border border-slate-800">
                  <span className="font-bold text-slate-500">T-{idx+1}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={val}
                    onChange={(e) => handleSliderChange(idx, parseInt(e.target.value))}
                    className="h-16 accent-cyan-400 cursor-pointer orientation-vertical"
                    style={{ writingMode: 'bt-lr', appearance: 'slider-vertical' } as any}
                  />
                  <span className="font-bold text-white text-[10px]">{val}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Configuration Specs */}
          <div className="glass-panel p-5 rounded-lg space-y-4">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 pb-2.5 border-b border-slate-800/80">Environmental Specs</h4>
            
            <div className="space-y-4">
              {/* Sensor Requirements */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Required Sensor Suite Manifest</label>
                <input 
                  type="text" 
                  value={sensorSuite} 
                  onChange={(e) => setSensorSuite(e.target.value)}
                  required
                  placeholder="e.g. Intel RealSense D435i RGB-D, Velodyne VLP-16 LiDAR, Tactical IMU"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-255 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                />
              </div>

              {/* Objective Definition */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Goal / Objective Spec</label>
                <input 
                  type="text" 
                  value={goalDefinition} 
                  onChange={(e) => setGoalDefinition(e.target.value)}
                  required
                  placeholder="e.g. Patrol loop, reach 15 waypoints, maintain lidar localization"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-255 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link 
              href="/scenarios" 
              className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded cursor-pointer transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 text-xs font-extrabold rounded shadow transition-all cursor-pointer active:scale-99 hover:scale-[1.01]"
            >
              Save Custom Scenario
            </button>
          </div>

        </form>

        {/* YAML Preview Sidebar (40% / col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-lg flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-cyan-400" />
                <h4 className="text-xs uppercase tracking-wider text-slate-400">YAML Manifest Preview</h4>
              </div>
              <button
                type="button"
                onClick={handleCopyYaml}
                className="flex items-center gap-1 text-[10px] font-extrabold text-slate-400 hover:text-white uppercase tracking-wider bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy YAML
                  </>
                )}
              </button>
            </div>

            {/* Readonly YAML Code Editor Box */}
            <div className="relative flex-1 bg-slate-900 border border-slate-800 rounded overflow-hidden">
              <pre className="p-4 text-[10px] font-mono text-slate-300 overflow-y-auto leading-relaxed select-all h-[420px] max-h-[500px]">
                {yamlConfig}
              </pre>
            </div>

            {/* Mock Drag & Drop Dropzone */}
            <div className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-955/20 rounded-lg p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors group">
              <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-400 group-hover:text-white transition-colors">
                <Upload className="h-3.5 w-3.5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-300 block">Drag & Drop Config File</span>
                <span className="text-[9px] text-slate-500 font-medium block">Accepts .yaml, .sdf world descriptions (Max 10MB)</span>
              </div>
            </div>

            {/* Tip info panel */}
            <div className="flex items-start gap-2.5 bg-slate-950/50 border border-slate-800 p-3.5 rounded-lg text-[10px] font-medium text-slate-500 leading-relaxed">
              <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <p>
                SpaceBorn environmental templates translate dynamic obstacle profiles and electromagnetic fields into standardized inputs for ROS 2 launch interfaces. Verify world nodes in Gazebo/Ignition before deploying to parallel hardware nodes.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
