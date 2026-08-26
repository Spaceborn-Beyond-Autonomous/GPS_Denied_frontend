import { NextResponse } from 'next/server';
import { backendRequest, backendUrl, proxyBackendResponse } from '@/lib/backend';

export async function GET() {
    if (!backendUrl) return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 503 });
    const response = await backendRequest('/api/v1/scores');
    return proxyBackendResponse(response!, (value) => {
        const result = value as { data?: Array<Record<string, unknown>> };
        const data = (result.data || []).map((score, index) => ({
            rank: `${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'}`,
            stackName: (score.stackId as Record<string, unknown>)?.name || 'Unknown stack',
            version: (score.stackId as Record<string, unknown>)?.version || 'unknown',
            score: score.overallScore,
            passRate: score.status === 'Passed' ? '100%' : '0%',
            date: score.executedAt,
            badgeColor: index < 3 ? ['#D4AF37', '#C0C0C0', '#CD7F32'][index] : '',
        }));
        return { data, count: data.length };
    });
}