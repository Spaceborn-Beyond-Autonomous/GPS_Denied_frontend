import { NextResponse } from 'next/server';
import { backendRequest, backendUrl, proxyBackendResponse } from '@/lib/backend';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!backendUrl) return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
    const response = await backendRequest(`/api/v1/runs/${encodeURIComponent(id)}`);
    return proxyBackendResponse(response!, (value) => {
        const result = value as { data?: { logs?: string[] } };
        const events = (result.data?.logs || []).map((description, index) => ({ run_id: id, timestamp: '', event_type: 'SIMULATOR_LOG', description, severity: 'INFO' }));
        return { data: events, count: events.length };
    });
}