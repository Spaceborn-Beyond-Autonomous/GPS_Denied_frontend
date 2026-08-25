'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Map as MapIcon,
  Tv,
  Award,
  Terminal as TerminalIcon,
  Video,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  mockRuns, 
  mockRunResult8041, 
  mockRunEvents, 
  mockScenarios 
} from '@/data/mockData';

function RunDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const runId = params.id as string;
  const tab = searchParams.get('tab') || 'live';

  // Get Run info from mock data
  const initialRun = mockRuns.find(r => r.id === runId) || mockRuns[0];
  const [run, setRun] = useState(initialRun);

  // Simulation Running States
  const [isSimRunning, setIsSimRunning] = useState(run.status === 'Running');
  const [elapsedSeconds, setElapsedSeconds] = useState(342); // starts at 5m 42s
  const [isPlaying, setIsPlaying] = useState(run.status === 'Running');
  const [playSpeed, setPlaySpeed] = useState(1);
  const [liveMapCoverage, setLiveMapCoverage] = useState(64.8);
  const [liveGoals, setLiveGoals] = useState(14);
  const [liveCollisions, setLiveCollisions] = useState(0);

  // Tab 3: Timeline filter state
  const [timelineFilter, setTimelineFilter] = useState('All');

  // Canvases references
  const pointCloudCanvasRef = useRef<HTMLCanvasElement>(null);
  const rgbCanvasRef = useRef<HTMLCanvasElement>(null);
  const depthCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);

  const animationFrameRef = useRef<number | null>(null);
  const rotationAngleRef = useRef(0);
  const corridorOffsetRef = useRef(0);

  // Simulated live updates for active runs
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimRunning && isPlaying) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1 * playSpeed;
          if (next >= 900) { // Max 15 mins (900 seconds)
            setIsSimRunning(false);
            setIsPlaying(false);
            setRun(prevRun => ({ ...prevRun, status: 'Passed', score: 82 }));
            return 900;
          }
          return next;
        });
        
        // Randomly update telemetry metrics
        setLiveMapCoverage(prev => Math.min(95, prev + parseFloat((Math.random() * 0.04).toFixed(2))));
        if (Math.random() > 0.82) {
          setLiveGoals(prev => Math.min(20, prev + 1));
        }
        if (Math.random() > 0.995) {
          setLiveCollisions(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSimRunning, isPlaying, playSpeed]);

  // Master rendering animation loop (RGB, Depth, Map, Point Cloud)
  useEffect(() => {
    const render = () => {
      // 1. ROTATING POINT CLOUD CANVAS
      const cloudCanvas = pointCloudCanvasRef.current;
      if (cloudCanvas) {
        const ctx = cloudCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, cloudCanvas.width, cloudCanvas.height);
          const cx = cloudCanvas.width / 2;
          const cy = cloudCanvas.height / 2;

          // Generate static structured scan points (rotated)
          rotationAngleRef.current += isPlaying ? 0.0035 * playSpeed : 0.0006;
          const cosAngle = Math.cos(rotationAngleRef.current);
          const sinAngle = Math.sin(rotationAngleRef.current);

          // Draw ground ring
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
          ctx.lineWidth = 1;
          for (let radius = 20; radius < 120; radius += 30) {
            ctx.beginPath();
            ctx.ellipse(cx, cy + 15, radius, radius * 0.4, 0, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Generate a scanning dot field
          for (let i = 0; i < 300; i++) {
            // Coordinate math
            const angle = (i * 2.39996) + rotationAngleRef.current; // Golden angle spiral
            const radius = Math.sqrt(i) * 5.8;
            const px = cx + Math.cos(angle) * radius;
            const py = (cy + 15) + Math.sin(angle) * radius * 0.4 - (Math.sin(angle * 3) * 8);

            const depthAlpha = Math.max(0.1, 1 - (radius / 150));
            ctx.fillStyle = i % 8 === 0 
              ? `rgba(244, 63, 94, ${depthAlpha * 0.8})` // Red critical clusters
              : i % 3 === 0 
                ? `rgba(34, 211, 238, ${depthAlpha * 0.9})` // Cyan scan lines
                : `rgba(255, 255, 255, ${depthAlpha * 0.4})`; // White points

            ctx.beginPath();
            ctx.arc(px, py, i % 9 === 0 ? 2 : 1.2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Grid scan crosshair
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
          ctx.beginPath();
          ctx.moveTo(cx, 10); ctx.lineTo(cx, cloudCanvas.height - 10);
          ctx.moveTo(10, cy); ctx.lineTo(cloudCanvas.width - 10, cy);
          ctx.stroke();
        }
      }

      // 2. RGB CAMERA CORRIDOR SIMULATION CANVAS
      const rgbCanvas = rgbCanvasRef.current;
      if (rgbCanvas) {
        const ctx = rgbCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
          const w = rgbCanvas.width;
          const h = rgbCanvas.height;

          // Increment offset to simulate moving forward
          if (isPlaying) {
            corridorOffsetRef.current = (corridorOffsetRef.current + 1 * playSpeed) % 40;
          }

          // Draw background dark walls
          ctx.fillStyle = '#020617';
          ctx.fillRect(0, 0, w, h);

          // Draw wireframe corridor perspective lines
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          // Corners to center (200, 100)
          ctx.moveTo(0, 0); ctx.lineTo(w / 2, h / 2);
          ctx.moveTo(w, 0); ctx.lineTo(w / 2, h / 2);
          ctx.moveTo(0, h); ctx.lineTo(w / 2, h / 2);
          ctx.moveTo(w, h); ctx.lineTo(w / 2, h / 2);
          ctx.stroke();

          // Draw moving floor gridlines
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
          ctx.lineWidth = 1;
          for (let dist = corridorOffsetRef.current; dist < 300; dist += 40) {
            const scale = dist / 300;
            const cx1 = (w / 2) * (1 - scale);
            const cy1 = (h / 2) * (1 - scale);
            const cx2 = w - (w / 2) * (1 - scale);
            const cy2 = h - (h / 2) * (1 - scale);

            ctx.strokeRect(cx1, cy1, cx2 - cx1, cy2 - cy1);
          }

          // Draw simulated robotic rack obstacle (box)
          const boxDist = (150 - (corridorOffsetRef.current * 3.5)) % 300;
          if (boxDist > 20) {
            const boxScale = boxDist / 300;
            const bx = w / 2 - 25 * boxScale;
            const by = h / 2 - 10 * boxScale;
            const bw = 50 * boxScale;
            const bh = 45 * boxScale;

            // Draw obstacle body
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)';
            ctx.strokeRect(bx, by, bw, bh);

            // Draw rack grid lines inside box
            ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
            ctx.beginPath();
            ctx.moveTo(bx, by + bh / 3); ctx.lineTo(bx + bw, by + bh / 3);
            ctx.moveTo(bx, by + (bh * 2) / 3); ctx.lineTo(bx + bw, by + (bh * 2) / 3);
            ctx.stroke();

            // Tracking reticle on target obstacle
            if (boxDist < 120) {
              ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)'; // Red lock reticle
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              // Top-left bracket
              ctx.moveTo(bx - 4, by - 4); ctx.lineTo(bx + 4, by - 4);
              ctx.moveTo(bx - 4, by - 4); ctx.lineTo(bx - 4, by + 4);
              // Bottom-right bracket
              ctx.moveTo(bx + bw + 4, by + bh + 4); ctx.lineTo(bx + bw - 4, by + bh + 4);
              ctx.moveTo(bx + bw + 4, by + bh + 4); ctx.lineTo(bx + bw + 4, by + bh - 4);
              ctx.stroke();

              // Reticle Lock label
              ctx.fillStyle = '#f43f5e';
              ctx.font = 'bold 7px sans-serif';
              ctx.fillText('SLAM LOCK: WAREHOUSE_GRID_RACK', bx, by - 8);
            }
          }

          // HUD details overlay
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 7px font-mono, monospace';
          ctx.fillText(`CAM RGB | REC ●`, 10, 15);
          ctx.fillText(`FPS: 30.0 | TIME: ${formatTime(elapsedSeconds)}`, 10, h - 10);
          ctx.fillText(`SLAM STATUS: TARGETING ACTIVE`, w - 110, 15);
        }
      }

      // 3. DEPTH CAMERA GRADIENT SIMULATION CANVAS
      const depthCanvas = depthCanvasRef.current;
      if (depthCanvas) {
        const ctx = depthCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
          const w = depthCanvas.width;
          const h = depthCanvas.height;

          // Draw background deep blue (representing far range)
          ctx.fillStyle = '#030712';
          ctx.fillRect(0, 0, w, h);

          // Perspective lines
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(w / 2, h / 2);
          ctx.moveTo(w, 0); ctx.lineTo(w / 2, h / 2);
          ctx.moveTo(0, h); ctx.lineTo(w / 2, h / 2);
          ctx.moveTo(w, h); ctx.lineTo(w / 2, h / 2);
          ctx.stroke();

          // Draw corridor depth bands (yellow to cyan)
          for (let dist = corridorOffsetRef.current; dist < 300; dist += 40) {
            const scale = dist / 300;
            const cx1 = (w / 2) * (1 - scale);
            const cy1 = (h / 2) * (1 - scale);
            const cx2 = w - (w / 2) * (1 - scale);
            const cy2 = h - (h / 2) * (1 - scale);

            // Interpolate depth colors (hot colors near, cold colors far)
            const colorHue = 240 - (scale * 180); // 240 (blue) to 60 (yellow)
            ctx.strokeStyle = `hsla(${colorHue}, 90%, 50%, 0.45)`;
            ctx.strokeRect(cx1, cy1, cx2 - cx1, cy2 - cy1);
          }

          // Draw Box Obstacle (Depth mapping)
          const boxDist = (150 - (corridorOffsetRef.current * 3.5)) % 300;
          if (boxDist > 20) {
            const boxScale = boxDist / 300;
            const bx = w / 2 - 25 * boxScale;
            const by = h / 2 - 10 * boxScale;
            const bw = 50 * boxScale;
            const bh = 45 * boxScale;

            // Box color changes depending on distance
            const boxHue = 220 - (boxScale * 160); // closer = warmer (yellow/orange)
            ctx.fillStyle = `hsla(${boxHue}, 85%, 45%, 0.65)`;
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeStyle = `hsla(${boxHue}, 90%, 60%, 0.8)`;
            ctx.strokeRect(bx, by, bw, bh);
          }

          // HUD overlays
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 7px font-mono, monospace';
          ctx.fillText(`DEPTH MAP | RANGE [0.4m - 5.0m]`, 10, 15);
          ctx.fillText(`GRID LOCKS ACTIVE`, w - 85, 15);
        }
      }

      // 4. PROGRESSIVE OCCUPANCY GRID MAP CANVAS
      const mapCanvas = mapCanvasRef.current;
      if (mapCanvas) {
        const ctx = mapCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
          const w = mapCanvas.width;
          const h = mapCanvas.height;
          const cx = w / 2;
          const cy = h / 2;

          // Draw grid pattern (radar grid)
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
          ctx.lineWidth = 0.5;
          for (let x = 10; x < w; x += 15) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
          }
          for (let y = 10; y < h; y += 15) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
          }

          // Render walls that reveal as elapsedSeconds increases
          const revealPercent = Math.min(1, elapsedSeconds / totalDurationSeconds);
          ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
          
          // Draw wall obstacles (revealed in progression)
          if (revealPercent > 0.1) ctx.fillRect(cx - 60, cy - 35, 15, 70); // left wall block
          if (revealPercent > 0.4) ctx.fillRect(cx + 35, cy - 25, 20, 50); // right wall block
          if (revealPercent > 0.6) ctx.fillRect(cx - 20, cy - 50, 40, 10); // top wall block

          // Draw traveled route trace line
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(cx - 80, cy + 40);
          
          const maxPoints = Math.round(revealPercent * 100);
          for (let p = 0; p < maxPoints; p++) {
            const rx = (cx - 80) + (p * 1.5);
            const ry = (cy + 40) - (Math.sin(p * 0.1) * 20) - (p * 0.2);
            ctx.lineTo(rx, ry);
          }
          ctx.stroke();

          // Current robot position marker
          const rx = (cx - 80) + (maxPoints * 1.5);
          const ry = (cy + 40) - (Math.sin(maxPoints * 0.1) * 20) - (maxPoints * 0.2);
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Pulse glow around robot
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(rx, ry, 6 + Math.sin(Date.now() * 0.005) * 2, 0, Math.PI * 2);
          ctx.stroke();

          // HUD details
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 7px font-mono, monospace';
          ctx.fillText(`OCCUPANCY GRID | /map`, 10, 15);
          ctx.fillText(`COV: ${liveMapCoverage.toFixed(1)}%`, w - 55, 15);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playSpeed, elapsedSeconds, liveMapCoverage]);

  // Convert seconds to MM:SS format
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}m ${s}s`;
  };

  // Timeline Phase highlights
  const totalDurationSeconds = 900; // 15 mins
  const phasePercent = (elapsedSeconds / totalDurationSeconds) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header Card: Summary & Controls */}
      <div className="glass-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-500">SIMULATION RUN</span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
              run.status === 'Passed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800' :
              run.status === 'Failed' ? 'bg-rose-950/40 text-rose-400 border border-rose-800' :
              'bg-amber-950/40 text-amber-400 border border-amber-800'
            }`}>
              {run.status}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {run.id}: {run.stack_name} v{run.stack_version} Evaluation
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Scenario: <strong className="text-slate-300">{run.scenario_name}</strong> · Launch Date: {run.started_at} · Seed: <code className="text-slate-350 font-mono bg-slate-950 px-1 py-0.5 rounded">{run.seed}</code>
          </p>
        </div>

        {/* Tab Selection Row */}
        <div className="flex bg-slate-950/50 border border-slate-850 p-1 rounded-md text-xs font-semibold self-start md:self-center">
          {[
            { id: 'live', label: 'Live Viewer', icon: Tv },
            { id: 'score', label: 'Score Reports', icon: Award },
            { id: 'timeline', label: 'Timelines', icon: Clock },
            { id: 'logs', label: 'Run Logs', icon: TerminalIcon },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(`/runs/${runId}?tab=${item.id}`)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                tab === item.id 
                  ? 'bg-white text-slate-950 font-extrabold shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panel Contents */}
      
      {/* 1. Live Viewer Tab */}
      {tab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Main 2x2 Screen Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 border border-slate-850 rounded-lg p-4">
              
              {/* Box 1: RGB Camera Feed */}
              <div className="relative aspect-video bg-slate-900 border border-slate-800 rounded overflow-hidden flex flex-col justify-between p-3 group">
                <canvas 
                  ref={rgbCanvasRef} 
                  width={320} 
                  height={180} 
                  className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                />
                
                {/* scanline screen overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/2 to-transparent pointer-events-none w-full h-full animate-scanline z-10" />

                <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-slate-450 font-bold uppercase select-none w-full">
                  <span className="bg-slate-950/75 px-1.5 py-0.5 rounded">RGB Camera Feed</span>
                  <span className="bg-slate-950/75 px-1.5 py-0.5 rounded">/camera/rgb/image_raw</span>
                </div>

                <div className="relative z-10 self-start mt-auto flex gap-1 text-[8px] font-bold font-mono">
                  <span className="px-1.5 py-0.5 bg-slate-950/80 text-emerald-400 rounded uppercase">30 FPS</span>
                  <span className="px-1.5 py-0.5 bg-slate-950/80 text-slate-350 rounded uppercase">1080p</span>
                </div>
              </div>

              {/* Box 2: Depth View Map */}
              <div className="relative aspect-video bg-slate-900 border border-slate-800 rounded overflow-hidden flex flex-col justify-between p-3 group">
                <canvas 
                  ref={depthCanvasRef} 
                  width={320} 
                  height={180} 
                  className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/2 to-transparent pointer-events-none w-full h-full animate-scanline z-10" />

                <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-slate-455 font-bold uppercase select-none w-full">
                  <span className="bg-slate-950/75 px-1.5 py-0.5 rounded">Depth View Map</span>
                  <span className="bg-slate-950/75 px-1.5 py-0.5 rounded">/camera/depth/image_rect</span>
                </div>

                <div className="relative z-10 self-start mt-auto flex gap-1 text-[8px] font-bold font-mono">
                  <span className="px-1.5 py-0.5 bg-slate-950/80 text-cyan-405 rounded uppercase">DEPTH ACTIVE</span>
                </div>
              </div>

              {/* Box 3: Occupancy Grid Map */}
              <div className="relative aspect-video bg-slate-900 border border-slate-800 rounded overflow-hidden flex flex-col justify-between p-3 group">
                <canvas 
                  ref={mapCanvasRef} 
                  width={320} 
                  height={180} 
                  className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                />

                <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-slate-450 font-bold uppercase select-none w-full">
                  <span className="bg-slate-950/75 px-1.5 py-0.5 rounded">Occupancy Grid</span>
                  <span className="bg-slate-950/75 px-1.5 py-0.5 rounded">/map2d_occupancy</span>
                </div>

                <div className="relative z-10 self-start mt-auto flex gap-1 text-[8px] font-bold font-mono">
                  <span className="px-1.5 py-0.5 bg-slate-950/80 text-emerald-400 rounded uppercase">SLAM ONLINE</span>
                  <span className="px-1.5 py-0.5 bg-slate-950/80 text-slate-450 rounded uppercase">Res: 0.05m</span>
                </div>
              </div>

              {/* Box 4: 3D Point Cloud Canvas */}
              <div className="relative aspect-video bg-slate-900 border border-slate-800 rounded overflow-hidden flex flex-col justify-between p-3 group">
                <canvas 
                  ref={pointCloudCanvasRef} 
                  width={320} 
                  height={180} 
                  className="absolute inset-0 w-full h-full z-0"
                />

                <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-slate-450 font-bold uppercase select-none w-full">
                  <span className="bg-slate-950/75 px-1.5 py-0.5 rounded">3D Point Cloud</span>
                  <span className="bg-slate-950/75 px-1.5 py-0.5 rounded">/velodyne_points</span>
                </div>

                <div className="relative z-10 self-start mt-auto flex gap-1 text-[8px] font-bold font-mono">
                  <span className="px-1.5 py-0.5 bg-slate-950/80 text-cyan-400 rounded uppercase">Orbit-Rotate View</span>
                </div>
              </div>

            </div>

            {/* Playback Controls Panel */}
            <div className="glass-panel rounded-lg p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Control Buttons */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setElapsedSeconds(0)}
                    className="p-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 rounded text-slate-450 hover:text-white cursor-pointer transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-md active:scale-95"
                  >
                    {isPlaying ? <Pause className="h-4.5 w-4.5 fill-current text-slate-950" /> : <Play className="h-4.5 w-4.5 fill-current translate-x-0.5 text-slate-950" />}
                  </button>
                  <span className="text-xs font-mono text-white font-bold select-none">
                    {formatTime(elapsedSeconds)} / 15m 00s
                  </span>
                </div>

                {/* Play Speed Multiplier pills */}
                <div className="flex gap-1.5 bg-slate-950 border border-slate-850 p-1 rounded text-[10px] font-bold select-none">
                  {[1, 2, 5, 10].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaySpeed(speed)}
                      className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                        playSpeed === speed ? 'bg-slate-800 text-white font-extrabold shadow' : 'text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      {speed}x Realtime
                    </button>
                  ))}
                </div>
              </div>

              {/* GPS Jamming Progression Timeline bar */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">GPS Jamming & Degradation Timeline</span>
                <div className="h-8 bg-slate-950 border border-slate-850 rounded overflow-hidden flex relative z-0 shadow-inner">
                  {/* Phase 1 */}
                  <div className="flex-1 bg-slate-800/10 border-r border-slate-850 flex items-center justify-center text-[10px] text-slate-450 font-bold select-none px-2 truncate">
                    Phase 1: GPS Nominal (0-5m)
                  </div>
                  {/* Phase 2 */}
                  <div className="flex-1 bg-cyan-950/10 border-r border-slate-850 flex items-center justify-center text-[10px] text-cyan-405 font-bold select-none px-2 truncate">
                    Phase 2: Hybrid Assist (5-10m)
                  </div>
                  {/* Phase 3 */}
                  <div className="flex-1 bg-rose-950/5 flex items-center justify-center text-[10px] text-rose-455 font-bold select-none px-2 truncate">
                    Phase 3: Denied Environment (10-15m)
                  </div>

                  {/* Red playhead tracking line overlay */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 shadow-lg shadow-rose-500/50 transition-all duration-100"
                    style={{ left: `${phasePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Rail: Info & Telemetry Cards */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Card 1: Run Details */}
            <div className="glass-panel rounded-lg p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-405 border-b border-slate-800/80 pb-2">Run Information</h4>
              
              <div className="space-y-3.5 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-450">Run ID</span>
                  <span className="text-white font-extrabold">{run.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-450">Status</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    run.status === 'Running' ? 'bg-amber-950/40 text-amber-400 border border-amber-800/60' : 'bg-slate-950 border border-slate-800 text-white'
                  }`}>
                    {run.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Current Phase</span>
                  <span className="text-white font-bold">
                    {elapsedSeconds < 300 ? 'Phase 1: Nominal' : elapsedSeconds < 600 ? 'Phase 2: Hybrid' : 'Phase 3: Denied'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Elapsed Time</span>
                  <span className="text-white font-bold font-mono">{formatTime(elapsedSeconds)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-450">GPS Satellite Count</span>
                  <span className={`font-bold font-mono ${elapsedSeconds > 600 ? 'text-rose-400' : elapsedSeconds > 300 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {elapsedSeconds > 600 ? '0 (Loss)' : elapsedSeconds > 300 ? '3 (Weak)' : '12 (Strong)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Telemetry Metrics */}
            <div className="glass-panel rounded-lg p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-405 border-b border-slate-800/80 pb-2">Live Telemetry Metrics</h4>
              
              <div className="space-y-4 text-xs font-medium">
                <div>
                  <div className="flex justify-between text-slate-450">
                    <span>TF Tree Status</span>
                    <span className="text-emerald-400 font-extrabold">OK (0.01s latency)</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-450 mb-1">
                    <span>Estimated Map Coverage</span>
                    <span className="text-white font-bold">{liveMapCoverage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-955 rounded-full h-1 mt-1.5 overflow-hidden border border-slate-850">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${liveMapCoverage}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-450">
                    <span>Goals Reached</span>
                    <span className="text-white font-bold">{liveGoals} / 20 Targets</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-450">
                    <span>Collisions Detected</span>
                    <span className={`font-bold ${liveCollisions > 0 ? 'text-rose-400' : 'text-slate-350'}`}>
                      {liveCollisions} Warnings
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Control actions */}
            <div className="space-y-3">
              {isSimRunning && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSimRunning(false);
                    setIsPlaying(false);
                    setRun(prev => ({ ...prev, status: 'Failed', score: 42 }));
                  }}
                  className="w-full py-2.5 bg-rose-955/40 text-rose-405 border border-rose-900/60 hover:bg-rose-900/20 text-xs font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-99"
                >
                  ✕ Cancel Running Simulation
                </button>
              )}
              <button
                type="button"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors hover:shadow-md hover:shadow-white/2"
              >
                <Download className="h-3.5 w-3.5" />
                Download Raw Rosbag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Score Reports Tab */}
      {tab === 'score' && (
        <div className="space-y-6">
          {/* Top Panel: Big Score & Metadata card */}
          <div className="glass-panel rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/3 rounded-full blur-2xl pointer-events-none" />

            {/* Left box: Big Score Badge */}
            <div className="bg-slate-950 border border-emerald-800/80 rounded-lg p-5 text-center min-w-[180px] w-full md:w-auto shadow-inner">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-1">PASSED</span>
              <span className="text-4xl font-extrabold text-white block">{run.score || 82} / 100</span>
              <span className="text-[9px] text-slate-500 font-semibold block mt-1">Meets criteria threshold (&gt;80)</span>
            </div>

            {/* Mid section details */}
            <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
              <h4 className="text-base font-bold text-white leading-snug">
                {run.id}: {run.stack_name} v{run.stack_version} Validation Report
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                An automatic validation run executed across the Warehouse GPS-Denial Standard environment. The navigation stack demonstrated solid transition capabilities but encountered mild drift on exploration bounds.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5 text-[10px] font-bold text-slate-500 mt-2">
                <span>Date: {run.started_at}</span>
                <span>•</span>
                <span>Duration: {run.duration}</span>
                <span>•</span>
                <span>Tested By: CI Pipeline Agent</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="shrink-0 flex gap-2">
              <button 
                type="button" 
                onClick={() => router.push('/new-test-run')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors hover:shadow"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Compare to Previous Run
              </button>
            </div>
          </div>

          {/* Performance Profile details */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            
            {/* Bar charts profile */}
            <div className="lg:col-span-6 glass-panel rounded-lg p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-2">Detailed Performance Profile</h4>
              
              <div className="space-y-4.5">
                {[
                  { name: 'Localization Continuity', val: mockRunResult8041.category_scores.localization },
                  { name: 'SLAM Map Quality', val: mockRunResult8041.category_scores.slam },
                  { name: 'GPS-Denial Transition', val: mockRunResult8041.category_scores.transition },
                  { name: 'Navigation Performance', val: mockRunResult8041.category_scores.navigation },
                  { name: 'Exploration Completeness', val: mockRunResult8041.category_scores.exploration },
                  { name: 'Safety (Obstacle Avoidance)', val: mockRunResult8041.category_scores.safety },
                ].map((category) => (
                  <div key={category.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-350">
                      <span>{category.name}</span>
                      <span className="font-extrabold text-white">{category.val}%</span>
                    </div>
                    <div className="w-full bg-slate-955 rounded-full h-2 mt-1 overflow-hidden border border-slate-850">
                      <div className="bg-slate-405 h-full rounded-full" style={{ width: `${category.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trajectory Overlay Map */}
            <div className="lg:col-span-4 glass-panel rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-2">Trajectory Comparison Map</h4>
                
                {/* SVG Route vs Ground truth */}
                <div className="bg-slate-950/60 border border-slate-850 rounded p-4 mt-4 flex items-center justify-center min-h-[160px] relative">
                  <svg className="w-40 h-40 text-slate-800" viewBox="0 0 100 100">
                    <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                    
                    {/* Ground truth route (green solid) */}
                    <path 
                      d="M 50 80 Q 20 70 30 45 T 80 40" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="1.8"
                    />

                    {/* Estimated route (red dashed showing drift) */}
                    <path 
                      d="M 50 80 Q 18 73 34 40 T 74 36" 
                      fill="none" 
                      stroke="#f43f5e" 
                      strokeWidth="1.5" 
                      strokeDasharray="2.5 2.5"
                    />
                  </svg>
                  
                  <span className="absolute bottom-2 text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                    [Grayscale Spatial Overlay Plot: Estimated Odometry Route vs Ground Truth]
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wide">
                <div className="flex items-center gap-1.5 text-slate-450">
                  <span className="h-0.5 w-4 bg-emerald-500" />
                  Ground Truth
                </div>
                <div className="flex items-center gap-1.5 text-slate-450">
                  <span className="h-0.5 w-4 border-t-2 border-dashed border-rose-500" />
                  Odom Est
                </div>
              </div>
            </div>
          </div>

          {/* Section: System Diagnostics */}
          <div className="glass-panel rounded-lg p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-2">
              System Diagnostics & Errors ({mockRunResult8041.error_codes.length})
            </h4>

            <div className="space-y-2.5 text-xs font-medium">
              {mockRunResult8041.error_codes.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded border flex gap-3 ${
                    item.severity === 'critical' 
                      ? 'bg-rose-955/30 border-rose-900/60 text-rose-300 shadow shadow-rose-950/20' 
                      : 'bg-amber-955/20 border-amber-900/50 text-amber-300 shadow shadow-amber-950/20'
                  }`}
                >
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <span className="font-extrabold uppercase text-[9px] border-b border-current pb-0.5">{item.code}</span>
                    <p className="text-[11px] font-medium leading-relaxed mt-1 text-slate-350">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Export artifacts cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Export Compilation Artifacts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Raw ROS Bagfile', desc: 'Topic topics & TF data', size: mockRunResult8041.artifact_refs.bag.size, file: mockRunResult8041.artifact_refs.bag.name },
                { title: 'H.264 Video Feed', desc: 'Composite view records', size: mockRunResult8041.artifact_refs.video.size, file: mockRunResult8041.artifact_refs.video.name },
                { title: 'Occupancy Map', desc: 'Final mapped 2D GeoTIFF', size: mockRunResult8041.artifact_refs.map.size, file: mockRunResult8041.artifact_refs.map.name },
                { title: 'Diagnostics Log', desc: 'Console prints & error CSV', size: mockRunResult8041.artifact_refs.log.size, file: mockRunResult8041.artifact_refs.log.name },
              ].map((artifact) => (
                <div key={artifact.title} className="glass-panel glass-panel-hover rounded-lg p-4 flex flex-col justify-between min-h-[110px] group">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white tracking-wide">{artifact.title}</h5>
                    <p className="text-[10px] text-slate-450 leading-normal">{artifact.desc}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 font-mono">{artifact.size}</span>
                    <button type="button" className="text-slate-450 hover:text-white p-1 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Timelines Tab */}
      {tab === 'timeline' && (
        <div className="space-y-6">
          {/* Timeline filter options */}
          <div className="glass-panel p-4 rounded-lg flex flex-wrap gap-2 text-xs font-semibold">
            <span className="text-slate-400 self-center mr-2">Filter Events:</span>
            {['All Events', 'Phase Transition', 'Loop Closure', 'TF Error', 'Goal Reached', 'Collision Alert'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setTimelineFilter(opt)}
                className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  (opt === 'All Events' && timelineFilter === 'All Events') || (opt !== 'All Events' && timelineFilter === opt)
                    ? 'bg-white text-slate-950 border-white font-bold'
                    : 'bg-slate-950/50 text-slate-400 border-slate-850 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Interactive Timeline Event Log table */}
          <div className="glass-panel rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 text-slate-550 font-medium border-b border-slate-800/60 uppercase tracking-wider text-[10px]">
                    <th className="p-4 w-28">Timestamp</th>
                    <th className="p-4 w-44">Event Type</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 w-28 text-center">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {mockRunEvents
                    .filter((ev) => {
                      if (timelineFilter === 'All Events' || timelineFilter === 'All') return true;
                      
                      // Map filter values to event types
                      if (timelineFilter === 'Phase Transition') return ev.event_type === 'PHASE_TRANSITION';
                      if (timelineFilter === 'Loop Closure') return ev.event_type === 'LOOP_CLOSURE';
                      if (timelineFilter === 'TF Error') return ev.event_type === 'TF_DELAY_WARN';
                      if (timelineFilter === 'Goal Reached') return ev.event_type === 'GOAL_REACHED';
                      if (timelineFilter === 'Collision Alert') return ev.event_type === 'COLLISION';
                      return true;
                    })
                    .map((ev, idx) => {
                      const sevColors = {
                        INFO: 'bg-slate-950/50 text-slate-400 border-slate-850',
                        SUCCESS: 'bg-emerald-955/30 text-emerald-400 border-emerald-900/45',
                        WARNING: 'bg-amber-955/20 text-amber-400 border-amber-900/35',
                        CRITICAL: 'bg-rose-955/30 text-rose-400 border-rose-900/50',
                      };
                      return (
                        <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-200">{ev.timestamp}</td>
                          <td className="p-4 font-mono">
                            <span className="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-[9px] font-semibold uppercase">
                              {ev.event_type}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300 leading-normal">{ev.description}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${sevColors[ev.severity]}`}>
                              {ev.severity}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Simulation Run Logs Tab */}
      {tab === 'logs' && (
        <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-[400px] shadow-2xl relative">
          
          {/* Scanline terminal layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/1 to-transparent pointer-events-none w-full h-full animate-scanline z-10" />

          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 font-semibold select-none z-20">
            <span className="flex items-center gap-1.5 font-mono">
              <TerminalIcon className="h-4 w-4 text-slate-500" />
              ros2_run_stdout.log
            </span>
            <span className="font-mono text-[9px] bg-slate-950 px-2 py-0.5 rounded text-slate-550 border border-slate-850">
              ASCII text · {run.id}
            </span>
          </div>

          {/* Console Text Window */}
          <div className="flex-1 p-5 font-mono text-[11px] text-slate-350 overflow-y-auto leading-relaxed bg-black space-y-1.5 selection:bg-slate-800 z-20">
            <p className="text-slate-550">[2024-10-24 12:00:01] [launch]: Starting headlessly with Docker instance {run.worker_pod_id}</p>
            <p className="text-slate-550">[2024-10-24 12:00:02] [launch]: ROS_DOMAIN_ID=42 namespaced prefix={run.id.toLowerCase()}</p>
            <p className="text-slate-550">[2024-10-24 12:00:03] [launch]: Loading SDF world definition: warehouse.sdf</p>
            <p className="text-slate-400">[2024-10-24 12:00:05] [gazebo]: Headless simulation rendering loaded successfully (GPU schedule mig-1/3)</p>
            <p className="text-slate-400">[2024-10-24 12:00:06] [gazebo]: Spawned model &apos;husky_a200&apos; at x=0.0 y=0.0 z=0.1 yaw=0.0</p>
            <p className="text-slate-200">[2024-10-24 12:00:08] [launch]: Pulling customer container registry.spaceborn.io/robotics-org/slam-nav-stack:{run.stack_version}...</p>
            <p className="text-slate-200">[2024-10-24 12:00:15] [launch]: Customer stack container initialized successfully.</p>
            <p className="text-slate-550">[2024-10-24 12:00:16] [checks]: Checking network ROS domain bindings...</p>
            <p className="text-emerald-450">[2024-10-24 12:00:17] [checks]: VERIFICATION CHECK 1: Subscribed sensor topic contracts matching [OK]</p>
            <p className="text-emerald-450">[2024-10-24 12:00:18] [checks]: VERIFICATION CHECK 2: Output cmd_vel / TwistStamped publisher active [OK]</p>
            <p className="text-emerald-450">[2024-10-24 12:00:18] [checks]: VERIFICATION CHECK 3: TF tree map -&gt; odom -&gt; base_link single publisher active [OK]</p>
            <p className="text-slate-205">[2024-10-24 12:00:20] [jamming_ctrl]: Starting GPS denial state machine. Triggered Phase 1: GPS Nominal.</p>
            <p className="text-slate-350">[2024-10-24 12:05:00] [jamming_ctrl]: State machine state transition: Phase 1 -&gt; Phase 2: Hybrid Assist.</p>
            <p className="text-amber-400">[2024-10-24 12:05:00] [/gps/fix]: GPS signal degradation initiated. Spoofing bounds error: &plusmn;50m. Satellites: 3</p>
            <p className="text-amber-400">[2024-10-24 12:08:10] [/tf]: WARNING - TF transform latency high on /base_link to /odom. Latched 0.051s.</p>
            <p className="text-slate-200">[2024-10-24 12:08:14] [rtabmap]: Loop closure optimizer triggered. Adjusted drift by 0.12m.</p>
            <p className="text-slate-350">[2024-10-24 12:10:00] [jamming_ctrl]: State machine state transition: Phase 2 -&gt; Phase 3: Denied Environment.</p>
            <p className="text-rose-400">[2024-10-24 12:10:00] [/gps/fix]: CRITICAL - Absolute GPS signal loss triggered. Satellites: 0</p>
            <p className="text-slate-200">[2024-10-24 12:11:42] [rtabmap]: Inertial propagation fallback online using IMU data.</p>
            <p className="text-slate-550">[2024-10-24 12:15:00] [launch]: Simulation run completion reached automatically.</p>
            <p className="text-emerald-405">[2024-10-24 12:15:02] [scoring]: Scoring report compiled successfully. Passed score: 82/100.</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default function RunDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400 font-semibold animate-pulse space-y-2">
        <div className="h-6 w-6 rounded-full border-2 border-slate-700 border-t-slate-400 animate-spin" />
        <span>Loading Simulation Run Observables...</span>
      </div>
    }>
      <RunDetailContent />
    </Suspense>
  );
}
