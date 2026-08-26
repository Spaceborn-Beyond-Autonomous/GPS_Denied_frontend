import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserForToken } from '@/controllers/authController';
import { backendRequest, backendUrl } from '@/lib/backend';

export async function GET() {
    if (backendUrl) {
        const backendResponse = await backendRequest('/api/v1/auth/me');
        const result = await backendResponse!.json();
        const response = NextResponse.json({ user: result.data || result.user, error: result.message }, { status: backendResponse!.status });
        if (backendResponse!.status === 401) response.cookies.delete('spaceborn_session');
        return response;
    }
    const token = (await cookies()).get('spaceborn_session')?.value;
    const user = getUserForToken(token);

    if (!user) {
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    return NextResponse.json({ user });
}