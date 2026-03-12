import { NextRequest, NextResponse } from 'next/server';
import { runQATest } from '@/services/ollama.service';

export async function POST(req: NextRequest) {
    try {
        const { states, query } = await req.json();

        if (!states || !Array.isArray(states) || !query) {
            return NextResponse.json({ error: 'Valid states array and query are required' }, { status: 400 });
        }

        const result = await runQATest(states, query);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('QA API Error:', error);
        return NextResponse.json({ error: 'Failed to run QA test' }, { status: 500 });
    }
}
