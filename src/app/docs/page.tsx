'use client';

import React from 'react';
import { 
  FileCode, 
  Terminal, 
  Settings, 
  Activity, 
  Info,
  GitBranch,
  BookOpen
} from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Introduction Banner */}
      <div className="glass-panel p-6 space-y-3 rounded-lg relative overflow-hidden">
        {/* scanline visual highlight overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/2 to-transparent pointer-events-none w-full h-full animate-scanline z-10" />

        <div className="flex items-center gap-2 relative z-25">
          <BookOpen className="h-5 w-5 text-slate-400" />
          <h3 className="text-base font-extrabold text-white tracking-tight">Developer Integration Guide</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl relative z-25 font-medium">
          Learn how to containerize your navigation/SLAM stacks and connect them to the SpaceBorn simulation-as-a-service evaluation pipeline. Run repeatable GPS-denial scenario matrices directly from your local terminal or CI/CD pipelines.
        </p>
      </div>

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Customer Integration Contract */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <FileCode className="h-4.5 w-4.5 text-slate-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Manifest definition (stack.yaml)</h4>
          </div>

          <p className="text-xs text-slate-450 leading-normal font-medium">
            To submit your autonomy stack for simulation evaluation, you must bundle a valid `stack.yaml` manifest in your image root path.
          </p>

          {/* YAML Fenced Code block */}
          <div className="relative overflow-hidden rounded bg-slate-950 border border-slate-850 p-4">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/2 to-transparent pointer-events-none w-full h-full animate-scanline z-10" />
            <pre className="text-[10px] font-mono leading-relaxed text-slate-300 overflow-x-auto relative z-20">
{`stack_name: acme-nav-stack
version: 1.4.0
cmd_vel_type: TwistStamped     # geometry_msgs/Twist or TwistStamped
capabilities: [slam, navigation, exploration]
ros_distro: humble

resource_requests:
  cpu: 4
  memory_gb: 8
  gpu: false                   # scheduled to worker nodes accordingly
startup_timeout_s: 60`}
            </pre>
          </div>
        </div>

        {/* Section 2: Command Line Utility CLI */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <Terminal className="h-4.5 w-4.5 text-slate-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. SpaceBorn CLI Reference</h4>
          </div>

          <p className="text-xs text-slate-455 leading-normal font-medium">
            Interact with the simulation pool using our terminal binary to submit stacks, monitor live test runs, or fetch logs.
          </p>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submit container stack</span>
              <div className="relative overflow-hidden rounded bg-slate-950 border border-slate-850 p-3.5">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/2 to-transparent pointer-events-none w-full h-full animate-scanline z-10" />
                <pre className="font-mono text-[9px] text-slate-350 select-all relative z-20">
                  spaceborn-cli submit --image acme/nav-stack:v1.4.0 --token &lt;API_KEY&gt;
                </pre>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Get simulation status</span>
              <div className="relative overflow-hidden rounded bg-slate-950 border border-slate-855 p-3.5">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/2 to-transparent pointer-events-none w-full h-full animate-scanline z-10" />
                <pre className="font-mono text-[9px] text-slate-355 select-all relative z-20">
                  spaceborn-cli status RUN-8042 --token &lt;API_KEY&gt;
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: CI/CD Pipeline integration (Full width) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-lg space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <GitBranch className="h-4.5 w-4.5 text-slate-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. GitHub Actions CI Pipeline Integration Example</h4>
          </div>

          <p className="text-xs text-slate-455 leading-relaxed font-medium">
            Automate test runs with every push by adding this step to your GitHub Actions configuration file (`.github/workflows/main.yml`).
          </p>

          {/* GitHub Actions Code Block */}
          <div className="relative overflow-hidden rounded bg-slate-950 border border-slate-850 p-4">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/2 to-transparent pointer-events-none w-full h-full animate-scanline z-10" />
            <pre className="text-[10px] font-mono leading-relaxed text-slate-300 overflow-x-auto relative z-20">
{`name: Autonomous Eval Pipeline

on:
  push:
    branches: [ main ]

jobs:
  validate-navigation:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Build & Publish Autonomy Container
        run: |
          docker build -t acme-org/slam-stack:\${{ github.sha }} .
          docker push registry.spaceborn.io/acme-org/slam-stack:\${{ github.sha }}

      - name: Trigger SpaceBorn Benchmark
        run: |
          curl -X POST https://api.spaceborn.io/v1/runs \\
            -H "Authorization: Bearer \${{ secrets.SPACEBORN_API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d '{
              "stack_version_id": "\${{ github.sha }}",
              "scenario_id": "scen-1",
              "config": { "timeout": 1800, "seed_type": "fixed", "seed": "0x4F3B9A2" }
            }'`}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
