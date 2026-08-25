import { NextResponse } from 'next/server';
import { mockRunResult8041 } from '@/data/mockData';
import { apiError } from '@/lib/api';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    return id === mockRunResult8041.run_id
        ? NextResponse.json({ data: mockRunResult8041 })
        : apiError(`Result not found for run: ${id}`, 404);
}