import { NextResponse } from 'next/server';
import { backendRequest, backendUrl } from '@/lib/backend';

export async function GET() {
  if (!backendUrl) return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
  const [me, team, keys] = await Promise.all([
    backendRequest('/api/v1/auth/me'),
    backendRequest('/api/v1/auth/team'),
    backendRequest('/api/v1/auth/api-keys'),
  ]);
  const meResult = await me!.json();
  const teamResult = await team!.json();
  const keysResult = await keys!.json();
  return NextResponse.json({ user: meResult.data, team: teamResult.data || [], apiKeys: keysResult.data || [] });
}