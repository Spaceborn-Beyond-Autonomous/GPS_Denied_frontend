import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/controllers/authController';
import { backendRequest, backendUrl } from '@/lib/backend';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    if (backendUrl) {
      const backendResponse = await backendRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const result = await backendResponse!.json();
      if (!backendResponse!.ok) return NextResponse.json({ error: result.message || 'Unable to sign in.' }, { status: backendResponse!.status });
      const response = NextResponse.json({ user: result.user });
      response.cookies.set('spaceborn_session', result.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
      return response;
    }

    const result = authenticateUser(email, password);
    const response = NextResponse.json({ user: result.user });
    response.cookies.set('spaceborn_session', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign in.';
    const status = message === 'Invalid email or password.' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}