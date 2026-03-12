import { CanvasObserver, ScrapeEvent } from './services/canvas-observer';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function runAnalysis() {
    const url = 'https://landonorris.com';
    console.log(`Starting full analysis of ${url}...`);

    const observer = new CanvasObserver();

    try {
        await observer.start(
            url,
            (event: ScrapeEvent) => {
                if (event.type === 'progress') {
                    console.log(`[PROGRESS] ${event.data.message}`);
                } else if (event.type === 'snap') {
                    console.log(`[SNAP #${event.data.snapCount}] Context: ${event.data.context}`);
                    console.log('Analysis:', JSON.stringify(event.data.analysis, null, 2));
                } else if (event.type === 'done') {
                    console.log('\n--- FINAL SUMMARY ---');
                    console.log(event.data.finalAiSummary);
                    console.log('\n--- SCENE DOCUMENT ---');
                    console.log(event.data.sceneDocument);
                    process.exit(0);
                } else if (event.type === 'error') {
                    console.error(`[ERROR] ${event.data.message}`);
                    process.exit(1);
                }
            },
            undefined, // Auto-detect canvas
            'active'   // Use active mode for scrolling/interacting
        );
    } catch (err) {
        console.error('Fatal error during analysis:', err);
        process.exit(1);
    }
}

runAnalysis();
