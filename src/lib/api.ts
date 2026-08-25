import { NextResponse } from 'next/server';

export function apiError(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}

export function getNextRunId() {
    return `RUN-${Math.max(0, ...mockRunIds()) + 1}`;
}

function mockRunIds() {
    return mockRuns.map((run) => Number(run.id.replace('RUN-', ''))).filter(Number.isFinite);
}

import { mockRuns } from '@/data/mockData';