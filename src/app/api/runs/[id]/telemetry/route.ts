import { NextRequest, NextResponse } from 'next/server';
import { backendRequest, backendUrl, proxyBackendResponse } from '@/lib/backend';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!backendUrl) return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
  const response = await backendRequest(`/api/v1/runs/${encodeURIComponent(id)}/telemetry`, { method: 'PATCH', body: JSON.stringify(await request.json()) });
  return proxyBackendResponse(response!);
}