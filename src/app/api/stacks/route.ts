import { NextRequest, NextResponse } from 'next/server';
import { mockStacks } from '@/data/mockData';

export function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('search')?.trim().toLowerCase();
    const stacks = mockStacks.filter((stack) =>
        !query || stack.name.toLowerCase().includes(query) || stack.tags.some((tag) => tag.toLowerCase().includes(query)),
    );

    return NextResponse.json({ data: stacks, count: stacks.length });
}