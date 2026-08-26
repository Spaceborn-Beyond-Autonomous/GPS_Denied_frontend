import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/controllers/authController';
import { backendRequest, backendUrl } from '@/lib/backend';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const organization = typeof body.organization === 'string' ? body.organization.trim() : '';

    if (!name || !email || !organization || password.length < 8) {
      return NextResponse.json(
        { error: 'Name, organization, email, and a password of at least 8 characters are required.' },
        { status: 400 },
      );
    }

    if (backendUrl) {
      const backendResponse = await backendRequest('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, organization }),
      });
      const result = await backendResponse!.json();
      if (!backendResponse!.ok) return NextResponse.json({ error: result.message || 'Unable to create account.' }, { status: backendResponse!.status });
      const response = NextResponse.json({ user: result.user }, { status: 201 });
      response.cookies.set('spaceborn_session', result.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
      return response;
    }

    const result = registerUser({ name, email, password, organization });
    const response = NextResponse.json({ user: result.user }, { status: 201 });
    response.cookies.set('spaceborn_session', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 *  sevenDays,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create account.';
    const status = message.includes('already exists') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

const sevenDays = 7;