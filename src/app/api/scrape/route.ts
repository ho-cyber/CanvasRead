import { NextRequest, NextResponse } from 'next/server';
import { CanvasObserver, ScrapeEvent } from '@/services/canvas-observer';

// Simple in-memory rate limiting for demo
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 50;
const ipCache = new Map<string, { count: number; firstRequest: number }>();

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const userLimit = ipCache.get(ip);

    if (userLimit) {
        if (now - userLimit.firstRequest < RATE_LIMIT_WINDOW) {
            if (userLimit.count >= MAX_REQUESTS) {
                const waitTime = Math.ceil((RATE_LIMIT_WINDOW - (now - userLimit.firstRequest)) / 60000);
                return NextResponse.json({
                    error: `Demo limit exceeded. Please wait ${waitTime} minutes or host your own CanvasRead instance.`
                }, { status: 429 });
            }
            userLimit.count++;
        } else {
            ipCache.set(ip, { count: 1, firstRequest: now });
        }
    } else {
        ipCache.set(ip, { count: 1, firstRequest: now });
    }

    const { url, selector } = await req.json();

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const observer = new CanvasObserver();

    const stream = new ReadableStream({
        async start(controller) {
            const onEvent = (event: ScrapeEvent) => {
                controller.enqueue(JSON.stringify(event) + '\n');
            };

            await observer.start(url, onEvent, selector);
            controller.close();
        },
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'application/x-ndjson' },
    });
}
