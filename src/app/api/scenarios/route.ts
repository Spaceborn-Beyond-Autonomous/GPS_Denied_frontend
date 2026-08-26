import { NextRequest, NextResponse } from 'next/server';
import { backendRequest, backendUrl, proxyBackendResponse } from '@/lib/backend';

export async function GET(request: NextRequest) {
    if (backendUrl) return proxyBackendResponse((await backendRequest(`/api/v1/scenarios${request.nextUrl.search}`))!, (value) => {
        const result = value as { data?: Array<Record<string, unknown>> };
        return { ...result, data: (result.data || []).map((item) => ({ ...item, id: item.id || item._id, name: item.name || item.title, difficulty: item.difficulty === 'DEV' ? 'Custom' : item.difficulty, sensor_suite: item.sensor_suite || item.sensorSuite, goal_definition: item.goal_definition || item.goalSpec, jamming_profile: item.jamming_profile || item.signalLossCurve, world_file_ref: item.world_file_ref || 'warehouse.sdf' })) };
    });
    return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
}

export async function POST(request: NextRequest) {
    if (backendUrl) {
        const body = await request.json();
        const response = await backendRequest('/api/v1/scenarios', { method: 'POST', body: JSON.stringify({
            title: body.name, version: body.version, description: body.description, duration: body.duration,
            difficulty: body.difficulty === 'Custom' ? 'DEV' : String(body.difficulty).toUpperCase(),
            sensorSuite: body.sensor_suite, goalSpec: body.goal_definition, signalLossCurve: body.jamming_profile, isCustomYaml: true,
        }) });
        return NextResponse.json(await response!.json(), { status: response!.status });
    }
    return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
}