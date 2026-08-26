import { NextRequest, NextResponse } from 'next/server';
import { backendRequest, backendUrl, proxyBackendResponse } from '@/lib/backend';

export async function GET(request: NextRequest) {
    if (backendUrl) return proxyBackendResponse((await backendRequest(`/api/v1/stacks${request.nextUrl.search}`))!, (value) => {
        const result = value as { data?: Array<Record<string, unknown>> };
        return { ...result, data: (result.data || []).map((item) => {
            const stackId = String(item.id || item._id || item.name || 'stack');
            const versions = Array.isArray(item.versions) && item.versions.length > 0
                ? item.versions
                : [{ id: `${stackId}-${item.version || 'latest'}`, stack_id: stackId, version: item.version, image_digest: item.imageDigest || '', submitted_date: item.createdAt, best_score: item.historicalBestScore || null, run_count: item.totalEvaluatedRuns || 0, last_run_status: item.lastRunStatus === 'Pending' ? 'Queued' : item.lastRunStatus, manifest_yaml: item.manifestYaml || '' }];
            const tags = Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === 'string') : [];
            return { ...item, id: stackId, tags: Array.from(new Set(tags)), versions: versions.map((version, index) => ({ ...version, id: String(version.id || version._id || `${stackId}-${version.version || index}`), stack_id: stackId })) };
        }) };
    });
    return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
}

export async function POST(request: NextRequest) {
    if (backendUrl) {
        const body = await request.json();
        const version = body.versions?.[0];
        const response = await backendRequest('/api/v1/stacks', { method: 'POST', body: JSON.stringify({
            name: body.name, version: version?.version, rosVersion: body.tags?.find((tag: string) => tag.startsWith('ROS')) || 'ROS 2 Humble',
            tags: body.tags, imageDigest: version?.image_digest, manifestYaml: version?.manifest_yaml, isActive: true,
        }) });
        return NextResponse.json(await response!.json(), { status: response!.status });
    }
    return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
}