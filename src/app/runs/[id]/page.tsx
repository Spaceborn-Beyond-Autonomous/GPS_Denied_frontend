'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import type { Run, RunEvent, RunResult } from '@/types';

interface TelemetrySample {
  timestamp?: string;
  topic?: string;
  type?: string;
  data?: { position?: { x: number; y: number }; coverage?: number; latitude?: number; longitude?: number };
}

export default function RunDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const runId = String(params.id);
  const tab = searchParams.get('tab') || 'live';
  const [run, setRun] = useState<Run | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetrySample | null>(null);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/runs/${runId}`).then((response) => response.json()),
      fetch(`/api/runs/${runId}/result`).then((response) => response.json()),
      fetch(`/api/runs/${runId}/events`).then((response) => response.json()),
    ]).then(([runResponse, resultResponse, eventResponse]) => {
      if (!runResponse.data) throw new Error(runResponse.error || 'Run not found.');
      setRun(runResponse.data);
      setResult(resultResponse.data || null);
      setEvents(eventResponse.data || []);
    }).catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Unable to load run.'));
  }, [runId]);

  useEffect(() => {
    const stream = new EventSource(`/api/runs/${runId}/stream`);
    stream.addEventListener('telemetry', (event) => setTelemetry(JSON.parse((event as MessageEvent).data)));
    stream.onerror = () => stream.close();
    return () => stream.close();
  }, [runId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const position = telemetry?.data?.position;
    if (!canvas || !position) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#1e293b';
    context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    context.fillStyle = '#22d3ee';
    context.beginPath();
    context.arc(canvas.width / 2 + position.x * 10, canvas.height / 2 - position.y * 10, 5, 0, Math.PI * 2);
    context.fill();
  }, [telemetry]);

  if (error) return <div role="alert" className="glass-panel rounded-lg p-6 text-sm text-rose-300">{error}</div>;
  if (!run) return <div className="glass-panel rounded-lg p-6 text-sm text-slate-500 animate-pulse">Loading run data...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-panel rounded-lg p-5">
        <div className="flex flex-wrap items-center gap-3"><span className="font-mono text-xs font-bold text-slate-500">{run.id}</span><span className="rounded-full border border-slate-700 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-300">{run.status}</span></div>
        <h1 className="mt-3 text-lg font-bold text-white">{run.stack_name} {run.stack_version}</h1>
        <p className="mt-1 text-xs text-slate-400">{run.scenario_name} · {run.started_at || 'Awaiting backend timestamp'}</p>
      </div>
      {tab === 'live' && <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]"><div className="glass-panel rounded-lg p-5"><h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Live simulator state</h2><canvas ref={canvasRef} width={640} height={360} className="h-auto w-full border border-slate-800 bg-slate-950" />{telemetry ? <p className="mt-3 font-mono text-[10px] text-slate-500">{telemetry.topic} · {telemetry.timestamp}</p> : <p className="mt-3 text-xs text-slate-500">Waiting for ROS telemetry...</p>}</div><div className="glass-panel rounded-lg p-5 space-y-4"><Metric label="Map coverage" value={telemetry?.data?.coverage === undefined ? '--' : `${(telemetry.data.coverage * 100).toFixed(1)}%`} /><Metric label="Position" value={telemetry?.data?.position ? `${telemetry.data.position.x.toFixed(2)}, ${telemetry.data.position.y.toFixed(2)}` : '--'} /><Metric label="GPS" value={telemetry?.data?.latitude === undefined ? '--' : `${telemetry.data.latitude}, ${telemetry.data.longitude}`} /></div></div>}
      {tab === 'score' && <section className="glass-panel rounded-lg p-5"><h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Backend result</h2><pre className="overflow-auto text-xs text-slate-300">{JSON.stringify(result, null, 2)}</pre></section>}
      {(tab === 'timeline' || tab === 'logs') && <section className="glass-panel rounded-lg p-5"><h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Backend events</h2><div className="space-y-2 font-mono text-xs text-slate-400">{events.length ? events.map((event, index) => <p key={`${event.timestamp}-${event.event_type}-${index}`}>{event.timestamp} {event.event_type} {event.description}</p>) : <p>Waiting for backend events...</p>}</div></section>}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 font-mono text-sm text-white">{value}</p></div>;
}
