import { NextRequest, NextResponse } from 'next/server';
import { mockScenarios } from '@/data/mockData';

export function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('search')?.trim().toLowerCase();
    const difficulty = request.nextUrl.searchParams.get('difficulty');
    const scenarios = mockScenarios.filter((scenario) => {
        const matchesQuery = !query || [scenario.name, scenario.description, scenario.sensor_suite]
            .some((value) => value.toLowerCase().includes(query));
        const matchesDifficulty = !difficulty || scenario.difficulty === difficulty;
        return matchesQuery && matchesDifficulty;
    });

    return NextResponse.json({ data: scenarios, count: scenarios.length });
}