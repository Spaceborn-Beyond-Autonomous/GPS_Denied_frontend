import { NextRequest, NextResponse } from 'next/server';
import { backendRequest, backendUrl, proxyBackendResponse } from '@/lib/backend';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (backendUrl) {
    const response = await backendRequest(`/api/v1/runs/${encodeURIComponent(id)}`);
    return proxyBackendResponse(response!);
  }

  return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
}