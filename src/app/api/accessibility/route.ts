import { NextRequest, NextResponse } from 'next/server';
import { generateAccessibilityReport } from '@/services/ollama.service';

export async function POST(req: NextRequest) {
    try {
        const { states } = await req.json();

        if (!states || !Array.isArray(states)) {
            return NextResponse.json({ error: 'Valid states array is required' }, { status: 400 });
        }

        const report = await generateAccessibilityReport(states);

        return NextResponse.json({ report });
    } catch (error: any) {
        console.error('Accessibility API Error:', error);
        return NextResponse.json({ error: 'Failed to generate accessibility report' }, { status: 500 });
    }
}
