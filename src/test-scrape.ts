import { CanvasObserver, ScrapeEvent } from './services/canvas-observer';

async function test() {
    const observer = new CanvasObserver();

    const url = 'file:///Users/dhruv/Desktop/Coding/CanvasRead/test.html';

    console.log(`Starting observation on ${url}`);

    await observer.start(url, (event: ScrapeEvent) => {
        if (event.type === 'progress') {
            console.log(`[PROGRESS] ${event.data.message}`);
        } else if (event.type === 'snap') {
            const tokens = event.data.totalTokens;
            console.log(`[SNAP #${event.data.snapCount}] Tokens: ${tokens}`);
            console.log(JSON.stringify(event.data.analysis, null, 2));
        } else if (event.type === 'error') {
            console.error(`[ERROR] ${event.data.message}`);
        } else if (event.type === 'done') {
            console.log(`[DONE] ${event.data.message}`);
        }
    });
}

test().catch(console.error);
