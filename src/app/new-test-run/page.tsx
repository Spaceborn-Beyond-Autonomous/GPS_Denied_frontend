'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  ArrowLeft, 
  Check, 
  Upload, 
  AlertTriangle, 
  HelpCircle,
  FileCode,
  Info
} from 'lucide-react';
import { mockScenarios } from '@/data/mockData';

export default function NewTestRunPage() {
  const router = useRouter();
  
  // State for Wizard Step
  const [step, setStep] = useState(1);
  
  // Step 1: Select Stack states
  const [stackTab, setStackTab] = useState<'docker' | 'bag' | 'params'>('docker');
  const [dockerUrl, setDockerUrl] = useState('registry.spaceborn.io/robotics-org/slam-nav-stack');
  const [dockerTag, setDockerTag] = useState('v2.1.0-rc3');
  
  // Start with a valid YAML layout so the user is NOT blocked at step 1 by default
  const [yamlContent, setYamlContent] = useState(
    `apiVersion: spaceborn/v1beta1\nkind: NavigationStack\nmetadata:\n  name: "slamcore-nav-stack"\nspec:\n  entrypoint: "/opt/ros/noetic/setup.bash && roslaunch slam_nav navigation.launch"`
  );
  const [yamlError, setYamlError] = useState<string | null>(null);

  // File Upload states & refs
  const [tarFileName, setTarFileName] = useState<string | null>(null);
  const [bagFileName, setBagFileName] = useState<string | null>(null);
  
  const tarFileInputRef = useRef<HTMLInputElement>(null);
  const bagFileInputRef = useRef<HTMLInputElement>(null);

  const handleTarUploadClick = () => {
    tarFileInputRef.current?.click();
  };

  const handleTarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTarFileName(file.name);
    }
  };

  const handleBagUploadClick = () => {
    bagFileInputRef.current?.click();
  };

  const handleBagFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBagFileName(file.name);
    }
  };

  // Step 2: Select Scenario states
  const [selectedScenarioId, setSelectedScenarioId] = useState('scen-1');

  // Step 3: Configure states
  const [timeout, setTimeoutVal] = useState('1800');
  const [seedType, setSeedType] = useState<'fixed' | 'random'>('fixed');
  const [seedValue, setSeedValue] = useState('0x4F3B9A2');
  const [sendEmail, setSendEmail] = useState(true);
  const [triggerWebhook, setTriggerWebhook] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://api.internal-robotics.org/webhooks/simulation-callback');
  const [liveConsole, setLiveConsole] = useState(true);

  // Parse YAML changes for live validation
  useEffect(() => {
    if (yamlContent.includes('name: "invalid-spaces-slug"')) {
      setYamlError('Constraint Error: spaces not allowed');
    } else if (yamlContent.includes('name: ""') || yamlContent.includes('name: null') || !yamlContent.includes('name:')) {
      setYamlError('Constraint Error: name is required');
    } else {
      setYamlError(null);
    }
  }, [yamlContent]);

  const selectedScenario = mockScenarios.find(s => s.id === selectedScenarioId) || mockScenarios[0];

  // Submit Handler
  const handleLaunch = () => {
    // Generate a new mock run ID in the 8000s
    const newRunId = 'RUN-8043';
    
    // Redirect to the newly created live run!
    router.push(`/runs/${newRunId}?tab=live&launched=true`);
  };

  const getStepCircleClass = (s: number) => {
    if (step === s) return 'bg-white text-slate-950 font-bold border-white scale-110';
    if (step > s) return 'bg-slate-800 text-white font-bold border-slate-700';
    return 'bg-slate-950 text-slate-500 border-slate-855';
  };

  const getStepTextClass = (s: number) => {
    if (step === s) return 'text-white font-extrabold scale-102';
    if (step > s) return 'text-slate-350';
    return 'text-slate-550';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Hidden File Input Nodes */}
      <input 
        type="file" 
        ref={tarFileInputRef} 
        onChange={handleTarFileChange} 
        accept=".tar,.gz"
        className="hidden" 
      />
      <input 
        type="file" 
        ref={bagFileInputRef} 
        onChange={handleBagFileChange} 
        accept=".bag,.mcap"
        className="hidden" 
      />

      {/* Wizard Progress Bar */}
      <div className="glass-panel rounded-lg p-5">
        <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-950/80 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-slate-300 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />

          {[
            { num: 1, label: 'Select Stack' },
            { num: 2, label: 'Select Scenario' },
            { num: 3, label: 'Configure' },
            { num: 4, label: 'Review & Launch' },
          ].map((item) => (
            <div key={item.num} className="flex flex-col items-center gap-2.5 relative z-10 select-none">
              <span className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs transition-all duration-300 ${getStepCircleClass(item.num)}`}>
                {step > item.num ? <Check className="h-4 w-4 stroke-[3]" /> : item.num}
              </span>
              <span className={`text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${getStepTextClass(item.num)}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Panel Container */}
      <div className="glass-panel rounded-lg p-6 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
        
        {/* Subtle scanline visual overlay on form panel */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-955/1 to-transparent pointer-events-none w-full h-full animate-scanline z-10" />

        {/* Step contents wrapper to position above scanlines */}
        <div className="relative z-20 flex-1 flex flex-col justify-between">
          
          {/* Step 1: Select/Upload Stack */}
          {step === 1 && (
            <div className="space-y-6 flex-1 animate-fade-in">
              {/* Tabs for Submission Type */}
              <div className="flex border-b border-slate-800/80 gap-6 text-sm font-semibold pb-0.5">
                {[
                  { id: 'docker', label: 'Docker Image Registry' },
                  { id: 'bag', label: 'Upload Bag File (.tar)' },
                  { id: 'params', label: 'Parameter Overrides' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStackTab(tab.id as any)}
                    className={`pb-3 relative transition-colors cursor-pointer ${
                      stackTab === tab.id 
                        ? 'text-white font-extrabold' 
                        : 'text-slate-455 hover:text-slate-205'
                    }`}
                  >
                    {tab.label}
                    {stackTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-300" />
                    )}
                  </button>
                ))}
              </div>

              {/* Docker Submission Tab Panel */}
              {stackTab === 'docker' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-450">Docker Image Registry URL</label>
                      <input
                        type="text"
                        value={dockerUrl}
                        onChange={(e) => setDockerUrl(e.target.value)}
                        placeholder="registry.spaceborn.io/robotics-org/stack-name"
                        className="w-full bg-slate-950 border border-slate-850 rounded-md py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Image Tag</label>
                      <input
                        type="text"
                        value={dockerTag}
                        onChange={(e) => setDockerTag(e.target.value)}
                        placeholder="latest"
                        className="w-full bg-slate-950 border border-slate-855 rounded-md py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                      />
                    </div>
                  </div>

                  {/* Interactive Drag & Drop Tar Area */}
                  <div 
                    onClick={handleTarUploadClick}
                    className="border border-dashed border-slate-800 bg-slate-955/40 rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-955/65 hover:border-slate-700 cursor-pointer transition-colors group"
                  >
                    <Upload className="h-8 w-8 text-slate-550 group-hover:text-slate-350 transition-colors" />
                    <span className="text-xs font-bold text-slate-300">
                      {tarFileName ? `Selected File: ${tarFileName}` : 'OR drag & drop compiled .tar image directly'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Max file size: 2GB (YAML validation will automatically trigger)</span>
                  </div>

                  {/* stack.yaml Editor & Validation */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <FileCode className="h-4 w-4 text-slate-405" />
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-450">stack.yaml Manifest Auto-Preview & Validation</label>
                    </div>
                    
                    <div className="relative font-mono text-[11px] bg-slate-950 border border-slate-855 rounded-md overflow-hidden p-4">
                      {/* Live editable manifest code block */}
                      <textarea
                        value={yamlContent}
                        onChange={(e) => setYamlContent(e.target.value)}
                        rows={5}
                        className="w-full bg-transparent text-slate-200 focus:outline-none resize-none overflow-y-auto leading-relaxed focus:ring-0 border-0 p-0"
                        spellCheck={false}
                      />

                      {/* Constraint Error Label Overlay */}
                      {yamlError && (
                        <div className="absolute top-8.5 right-4 bg-rose-955/80 border border-rose-800 text-[10px] font-bold text-rose-400 px-2 py-0.5 rounded shadow shadow-rose-950 animate-pulse">
                          {yamlError}
                        </div>
                      )}
                    </div>
                    
                    {/* Tip for User to interact with the code */}
                    <p className="text-[10px] text-slate-500 italic font-medium">
                      💡 Tip: Edit the name value inside the manifest box (e.g. change it to `invalid-spaces-slug`) to trigger validation checks!
                    </p>
                  </div>
                </div>
              )}

              {/* Bag Submission Tab Panel */}
              {stackTab === 'bag' && (
                <div 
                  onClick={handleBagUploadClick}
                  className="flex flex-col items-center justify-center min-h-[220px] text-center space-y-4 border border-dashed border-slate-800 bg-slate-955/40 rounded-lg p-8 hover:bg-slate-950/60 hover:border-slate-700 cursor-pointer transition-colors group animate-fade-in"
                >
                  <div className="h-12 w-12 rounded-full bg-slate-950/80 flex items-center justify-center border border-slate-855 group-hover:border-slate-700 transition-colors">
                    <Upload className="h-5 w-5 text-slate-455 group-hover:text-slate-205 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">
                      {bagFileName ? `Selected File: ${bagFileName}` : 'Upload Pre-recorded ROS 2 Bagfile (.tar / .mcap)'}
                    </p>
                    <p className="text-[10px] text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                      Submit recorded sensor topics (`/tf`, `/odom`, `/gps/fix`) to run against scenario benchmarks offline.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); handleBagUploadClick(); }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded border border-slate-700 cursor-pointer transition-colors"
                  >
                    Select File
                  </button>
                </div>
              )}

              {/* Parameter Overrides Tab Panel */}
              {stackTab === 'params' && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-955/65 border border-slate-850 p-3 rounded font-medium">
                    Use the platform's reference navigation stack (Gazebo Husky + RTAB-Map SLAM + Nav2) but override specific tunable parameters.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455 flex items-center gap-1">
                        Grid/RayTracing
                        <HelpCircle className="h-3 w-3 text-slate-550" />
                      </label>
                      <select className="w-full bg-slate-955 border border-slate-850 rounded py-2 px-3 text-xs text-slate-205 focus:outline-none focus:border-slate-750">
                        <option value="true">True (Reference Default)</option>
                        <option value="false">False (Raytracing Disabled)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455 flex items-center gap-1">
                        Vis/MaxDepth (meters)
                        <HelpCircle className="h-3 w-3 text-slate-555" />
                      </label>
                      <input 
                        type="number" 
                        defaultValue={4.0} 
                        className="w-full bg-slate-955 border border-slate-855 rounded py-2 px-3 text-xs text-slate-205 focus:outline-none focus:border-slate-750"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Scenario */}
          {step === 2 && (
            <div className="space-y-6 flex-1 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white tracking-tight">Select Target Simulation Scenario</h3>
                <p className="text-xs text-slate-400">Choose from the validated environmental configurations. Each dictates distinct signal denial curves.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-1">
                {mockScenarios.map((scen) => {
                  const isSelected = selectedScenarioId === scen.id;
                  const difficultyColors = {
                    Easy: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/20',
                    Medium: 'text-amber-400 border-amber-800/60 bg-amber-950/20',
                    Hard: 'text-orange-400 border-orange-800/60 bg-orange-950/20',
                    Expert: 'text-rose-400 border-rose-800/60 bg-rose-950/20',
                    Custom: 'text-slate-455 border-slate-805 bg-slate-950/40',
                  };
                  
                  return (
                    <div
                      key={scen.id}
                      onClick={() => setSelectedScenarioId(scen.id)}
                      className={`bg-slate-950 border rounded-lg p-4 flex flex-col justify-between min-h-[160px] cursor-pointer hover:border-slate-650 transition-all relative ${
                        isSelected ? 'border-white ring-1 ring-white shadow shadow-white/5' : 'border-slate-850'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 bg-cyan-500 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                          SELECTED
                        </span>
                      )}

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-white pr-12 truncate">{scen.name}</h4>
                        <p className="text-[10px] text-slate-450 line-clamp-3 leading-relaxed font-medium">{scen.description}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-1.5 text-[9px] font-bold">
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-455">
                            {scen.duration}
                          </span>
                          <span className={`px-2 py-0.5 border rounded uppercase ${difficultyColors[scen.difficulty]}`}>
                            {scen.difficulty}
                          </span>
                        </div>
                        
                        {/* Signal loss graph placeholder preview */}
                        <div className="w-12 h-6 flex items-end gap-0.5 bg-slate-900/60 border border-slate-855 rounded p-1">
                          {scen.jamming_profile.slice(0, 5).map((val, idx) => (
                            <span 
                              key={idx} 
                              className="flex-1 bg-slate-600 rounded-t"
                              style={{ height: `${Math.max(10, val)}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Configure */}
          {step === 3 && (
            <div className="space-y-6 flex-1 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white tracking-tight">Simulation Parameter Configuration</h3>
                <p className="text-xs text-slate-400">Tweak performance thresholds, seeds, and execution behavior before starting.</p>
              </div>

              <div className="space-y-5 max-h-[300px] overflow-y-auto pr-1">
                
                {/* Timeout limit */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-455 block">Simulation Timeout Threshold</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={timeout}
                      onChange={(e) => setTimeoutVal(e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-850 rounded py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                    />
                    <span className="text-xs text-slate-455 font-medium">seconds (30 minutes max scenario duration limit)</span>
                  </div>
                </div>

                {/* Seed Configuration */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-450 block">Pseudorandom (RNG) Seed</label>
                  <div className="flex gap-6 text-xs font-semibold select-none">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-350 hover:text-white">
                      <input
                        type="radio"
                        checked={seedType === 'fixed'}
                        onChange={() => setSeedType('fixed')}
                        className="accent-slate-105"
                      />
                      Fixed Seed
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-355 hover:text-white">
                      <input
                        type="radio"
                        checked={seedType === 'random'}
                        onChange={() => setSeedType('random')}
                        className="accent-slate-105"
                      />
                      Randomly Seed Every Execution
                    </label>
                  </div>
                  {seedType === 'fixed' && (
                    <input
                      type="text"
                      value={seedValue}
                      onChange={(e) => setSeedValue(e.target.value)}
                      className="w-48 bg-slate-950 border border-slate-850 rounded py-2 px-3 text-xs font-mono text-slate-205 focus:outline-none focus:border-slate-700"
                    />
                  )}
                </div>

                {/* Notifications Preferences */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-450 block">Notification Preferences</label>
                  <div className="space-y-2.5">
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-355 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        className="accent-slate-105 h-4 w-4 rounded border-slate-800"
                      />
                      Send email report upon test completion
                    </label>
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-355 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={triggerWebhook}
                        onChange={(e) => setTriggerWebhook(e.target.checked)}
                        className="accent-slate-105 h-4 w-4 rounded border-slate-800"
                      />
                      Trigger outward POST Webhook URL
                    </label>
                  </div>
                  {triggerWebhook && (
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full bg-slate-955 border border-slate-850 rounded py-2 px-3 text-xs text-slate-205 focus:outline-none focus:border-slate-700"
                    />
                  )}
                </div>

                {/* Toggle switch for live teleop console stream */}
                <div className="border border-slate-855 bg-slate-955/40 rounded-lg p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Real-time Live View Console Webstream</label>
                    <p className="text-[10px] text-slate-500 font-medium leading-normal">Slightly increases latency, but renders dynamic 3D stack telemetry in viewport</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLiveConsole(!liveConsole)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer ${
                      liveConsole ? 'bg-white' : 'bg-slate-800'
                    }`}
                  >
                    <div 
                      className={`h-5 w-5 rounded-full bg-slate-950 transition-transform ${
                        liveConsole ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Step 4: Review & Launch */}
          {step === 4 && (
            <div className="space-y-6 flex-1 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white tracking-tight">Review Configuration & Launch Simulation</h3>
                <p className="text-xs text-slate-400">Please confirm your parameters. Initiating a run immediately occupies worker queue resources.</p>
              </div>

              <div className="space-y-4">
                {/* Parameter summary list */}
                <div className="bg-slate-955/60 border border-slate-850 rounded-lg divide-y divide-slate-850 text-xs font-semibold">
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-550">Selected Stack:</span>
                    <span className="text-white font-extrabold">
                      {tarFileName ? `Local Tar Image: ${tarFileName}` : `SlamCore_Nav (Tag: ${dockerTag})`}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-550">Scenario:</span>
                    <span className="text-white font-extrabold">
                      {selectedScenario.name} (Est. Duration: {selectedScenario.duration})
                    </span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-550">Timeout limit:</span>
                    <span className="text-white font-extrabold">{timeout} seconds ({Math.round(parseInt(timeout)/60)}m)</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-550">RNG Seed Configuration:</span>
                    <span className="text-white font-extrabold font-mono">
                      {seedType === 'fixed' ? `Fixed (${seedValue})` : 'Random'}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-550">Active Hooks:</span>
                    <span className="text-white font-bold">
                      {[
                        sendEmail ? 'Email Report' : null,
                        triggerWebhook ? 'Webhook Callback API' : null
                      ].filter(Boolean).join(' + ') || 'None'}
                    </span>
                  </div>
                </div>

                {/* Resource Warning Message Box */}
                <div className="border border-slate-850 bg-slate-955/40 rounded-lg p-4 flex gap-3 shadow shadow-slate-950/20">
                  <AlertTriangle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white tracking-wider uppercase">Resource Allotment Warning</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      Estimated Cost: {selectedScenario.duration === 'Variable' ? '15' : selectedScenario.duration.replace('m', '')} Sim-Minutes. This will be deducted from your organization's remaining 7,550 monthly allocation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Bottom Button Bar */}
          <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between mt-6">
            <div className="text-xs text-slate-500 font-medium animate-fade-in">
              {step === 1 && yamlError && (
                <span className="text-rose-400 font-bold animate-pulse">{yamlError}</span>
              )}
              {step === 1 && !yamlError && (
                <span className="text-emerald-450 font-bold">✓ stack.yaml validation passed</span>
              )}
              {step === 2 && (
                <span className="font-semibold">Selected: <strong className="text-white font-bold">{selectedScenario.name}</strong></span>
              )}
            </div>
            
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-205 text-xs font-bold rounded cursor-pointer transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              )}
              {step === 1 && (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-755 text-slate-205 text-xs font-bold rounded cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && yamlError !== null}
                  className={`px-5 py-2 text-xs font-bold rounded cursor-pointer transition-all ${
                    step === 1 && yamlError !== null
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-855'
                      : 'bg-white text-slate-950 hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.99] font-extrabold'
                  }`}
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLaunch}
                  className="flex items-center gap-1.5 px-6 py-2 bg-white text-slate-950 hover:bg-slate-100 text-xs font-extrabold rounded shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  Launch Simulation Run 🚀
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
