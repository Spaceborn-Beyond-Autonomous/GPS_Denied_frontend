import { NextResponse } from 'next/server';
import { backendRequest, backendUrl, proxyBackendResponse } from '@/lib/backend';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!backendUrl) return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
    const response = await backendRequest(`/api/v1/runs/${encodeURIComponent(id)}`);
    return proxyBackendResponse(response!, (value) => {
        const result = value as { data?: { runId?: string; score?: number | null; status?: string } };
        if (!result.data?.score) return { data: null };
        return { data: { run_id: result.data.runId || id, overall_score: result.data.score, pass_fail: result.data.status || 'Running', category_scores: { localization: 0, slam: 0, transition: 0, navigation: 0, exploration: 0, safety: 0 }, error_codes: [], artifact_refs: { bag: { name: '', size: '' }, video: { name: '', size: '' }, map: { name: '', size: '' }, log: { name: '', size: '' } } } };
    });
}