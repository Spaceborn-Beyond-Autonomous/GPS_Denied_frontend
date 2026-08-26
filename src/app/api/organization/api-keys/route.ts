import { NextResponse } from 'next/server';
import { backendRequest, backendUrl } from '@/lib/backend';

export async function POST() {
  if (!backendUrl) return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
  const response = await backendRequest('/api/v1/auth/generate-api-key', { method: 'POST' });
  return NextResponse.json(await response!.json(), { status: response!.status });
}

export async function DELETE() {
  if (!backendUrl) return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
  const response = await backendRequest('/api/v1/auth/api-keys/current', { method: 'DELETE' });
  return new NextResponse(null, { status: response!.status });
}