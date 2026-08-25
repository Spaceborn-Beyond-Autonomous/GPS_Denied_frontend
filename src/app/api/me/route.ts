import { NextResponse } from 'next/server';
import { mockOrg, mockUser } from '@/data/mockData';

export function GET() {
    return NextResponse.json({ user: mockUser, organization: mockOrg });
}