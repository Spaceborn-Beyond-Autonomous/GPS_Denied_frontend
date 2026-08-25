import { NextResponse } from 'next/server';
import { mockRuns } from '@/data/mockData';
import { apiError } from '@/lib/api';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const run = mockRuns.find((item) => item.id === id);
    return run ? NextResponse.json({ data: run }) : apiError(`Run not found: ${id}`, 404);
}