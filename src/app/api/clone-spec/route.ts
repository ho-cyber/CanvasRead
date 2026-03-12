import { NextResponse } from 'next/server';
import { generateCloningSpec } from '@/services/ollama.service';

export async function POST(req: Request) {
    try {
        const { states, videoAnalysis } = await req.json();
        if (!states || !Array.isArray(states)) {
            return NextResponse.json({ error: 'Missing or invalid states data' }, { status: 400 });
        }

        const spec = await generateCloningSpec(states, videoAnalysis);
        return NextResponse.json({ spec });
    } catch (error: any) {
        console.error('Clone spec API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
