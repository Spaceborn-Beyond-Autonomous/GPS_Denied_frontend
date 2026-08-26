import { NextRequest, NextResponse } from 'next/server';
import { backendRequest, backendUrl, proxyBackendResponse } from '@/lib/backend';

export async function GET(request: NextRequest) {
    if (backendUrl) return proxyBackendResponse((await backendRequest(`/api/v1/runs${request.nextUrl.search}`))!, (value) => {
        const result = value as { data?: Array<Record<string, unknown>> };
        return { ...result, data: (result.data || []).map((item) => ({ ...item, id: item.id || item.runId, stack_name: item.stack_name || item.stackName, stack_version: item.stack_version || item.stackVersion, scenario_name: item.scenario_name || item.scenario, started_by: item.started_by || item.startedBy, started_at: item.started_at || item.createdAt, org_id: item.org_id || 'org-1', stack_version_id: item.stack_version_id || '', scenario_id: item.scenario_id || '' })) };
    });
    return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
}

export async function POST(request: NextRequest) {
    if (backendUrl) {
        const body = await request.json();
        const response = await backendRequest('/api/v1/runs', { method: 'POST', body: JSON.stringify({
            stackName: body.stackName || body.stack_version_id, stackVersion: body.stackVersion || 'latest', scenario: body.scenario || body.scenario_id,
        }) });
        return NextResponse.json(await response!.json(), { status: response!.status });
    }
    return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
}