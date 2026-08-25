import { NextResponse } from 'next/server';
import { mockLeaderboard } from '@/data/mockData';

export function GET() {
    return NextResponse.json({ data: mockLeaderboard, count: mockLeaderboard.length });
}