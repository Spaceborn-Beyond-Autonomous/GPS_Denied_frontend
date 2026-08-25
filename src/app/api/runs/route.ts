import { NextRequest, NextResponse } from 'next/server';
import { mockRuns, mockScenarios, mockStacks } from '@/data/mockData';
import { apiError, getNextRunId } from '@/lib/api';
import type { Run } from '@/types';

export function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim().toLowerCase();
    const runs = mockRuns.filter((run) => {
        const matchesStatus = !status || status === 'All' || run.status === status;
        const matchesSearch = !search || [run.id, run.stack_name, run.scenario_name]
            .some((value) => value.toLowerCase().includes(search));
        return matchesStatus && matchesSearch;
    });

    return NextResponse.json({ data: runs, count: runs.length });
}

export async function POST(request: NextRequest) {
    let body: {
        stack_version_id?: string;
        scenario_id?: string;
        started_by?: string;
        config?: { seed_type?: 'fixed' | 'random'; seed?: string; timeout?: number };
    };

    try {
        body = await request.json();
    } catch {
        return apiError('Request body must be valid JSON', 400);
    }

    if (!body.stack_version_id || !body.scenario_id) {
        return apiError('stack_version_id and scenario_id are required', 400);
    }

    const stack = mockStacks.find((item) => item.versions.some((version) => version.id === body.stack_version_id));
    const version = stack?.versions.find((item) => item.id === body.stack_version_id);
    const scenario = mockScenarios.find((item) => item.id === body.scenario_id);

    if (!stack || !version) return apiError(`Stack version not found: ${body.stack_version_id}`, 404);
    if (!scenario) return apiError(`Scenario not found: ${body.scenario_id}`, 404);

    const run: Run = {
        id: getNextRunId(),
        org_id: 'org-1',
        stack_name: stack.name,
        stack_version: version.version,
        stack_version_id: version.id,
        scenario_id: scenario.id,
        scenario_name: scenario.name,
        status: 'Queued',
        score: null,
        duration: '--',
        started_by: body.started_by || 'API',
        started_at: new Date().toISOString(),
        seed: body.config?.seed_type === 'random' ? `0x${Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase()}` : body.config?.seed || '0x4F3B9A2',
        worker_pod_id: `pod-${getNextRunId().replace('RUN-', '')}-api`,
    };

    mockRuns.unshift(run);
    return NextResponse.json({ data: run }, { status: 201 });
}