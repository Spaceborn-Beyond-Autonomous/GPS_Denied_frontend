import { NextRequest, NextResponse } from 'next/server';
import { revokeToken } from '@/controllers/authController';
import { backendUrl } from '@/lib/backend';

export async function POST(request: NextRequest) {
  if (backendUrl) {
    await fetch(`${backendUrl}/api/v1/auth/logout`, { method: 'POST' }).catch(() => undefined);
  }
  revokeToken(request.cookies.get('spaceborn_session')?.value);
  const response = NextResponse.json({ success: true });
  response.cookies.delete('spaceborn_session');
  return response;
}