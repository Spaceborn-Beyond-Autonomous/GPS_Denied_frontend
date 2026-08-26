import { cookies } from 'next/headers';

export const backendUrl = process.env.BACKEND_API_URL?.replace(/\/$/, '');

export async function backendRequest(path: string, init: RequestInit = {}) {
  if (!backendUrl) return null;
  const token = (await cookies()).get('spaceborn_session')?.value;
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(`${backendUrl}${path}`, { ...init, headers, cache: 'no-store' });
}

export async function proxyBackendResponse(response: Response, transform?: (value: unknown) => unknown) {
  const value = await response.json();
  return Response.json(transform ? transform(value) : value, { status: response.status });
}