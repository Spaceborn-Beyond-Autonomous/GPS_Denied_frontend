import { NextRequest, NextResponse } from 'next/server';
import { backendRequest, backendUrl } from '@/lib/backend';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!backendUrl) return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
  const response = await backendRequest(`/api/v1/runs/${encodeURIComponent(id)}/stream`);
  return new Response(response!.body, { status: response!.status, headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } });
}