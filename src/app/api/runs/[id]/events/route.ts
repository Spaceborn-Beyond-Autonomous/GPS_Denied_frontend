import { NextResponse } from 'next/server';
import { mockRunEvents } from '@/data/mockData';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const events = mockRunEvents.filter((event) => event.run_id === id);
    return NextResponse.json({ data: events, count: events.length });
}