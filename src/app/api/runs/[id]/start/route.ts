import { NextRequest, NextResponse } from 'next/server';
import { backendRequest, backendUrl, proxyBackendResponse } from '@/lib/backend';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!backendUrl) return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
  const response = await backendRequest(`/api/v1/runs/${encodeURIComponent(id)}/start`, { method: 'POST' });
  return proxyBackendResponse(response!);
}