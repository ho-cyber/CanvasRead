import { chromium, Browser } from 'playwright';
import { getChangedBoundingBox, BoundingBox } from '../utils/image-diff';
import { analyzeCrop, generateFinalSummary } from './ollama.service';
import sharp from 'sharp';

export interface ScrapeEvent {
    type: 'snap' | 'progress' | 'error' | 'done';
    data: any;
}

export class CanvasObserver {
    private browser: Browser | null = null;
    private lastFrame: Buffer | null = null;

    async start(url: string, onEvent: (event: ScrapeEvent) => void, selector?: string, interactionMode: 'passive' | 'active' = 'active') {
        try {
            this.browser = await chromium.launch({
                headless: true,
                args: [
                    '--use-gl=angle',
                    '--use-angle=metal'
                ]
            });
            const context = await this.browser.newContext({
                viewport: { width: 1280, height: 720 },
            });
            const page = await context.newPage();

            onEvent({ type: 'progress', data: { message: `Navigating to ${url}...` } });
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

            let targetSelector = selector || 'canvas';
            onEvent({ type: 'progress', data: { message: `Detecting canvas (${targetSelector})...` } });

            let element: any;
            try {
                element = await page.waitForSelector(targetSelector, { state: 'attached', timeout: 15000 });
            } catch (e) {
                if (!selector) {
                    onEvent({ type: 'progress', data: { message: 'Auto-detecting primary canvas...' } });
                    element = (await page.$$('canvas'))[0];
                }
            }

            if (!element) {
                onEvent({ type: 'progress', data: { message: 'No canvas detected. Falling back to full page capture...' } });
                element = await page.waitForSelector('body', { state: 'attached' });
                if (!element) {
                    throw new Error('No suitable element or body found to capture.');
                }
            }

            // Allow extra time for models and textures to fully render
            await page.waitForTimeout(2000);

            onEvent({ type: 'progress', data: { message: 'Capturing baseline full-frame for static UI...' } });

            // Full Frame Scan
            const baselineScreenshot = await element.screenshot();
            this.lastFrame = baselineScreenshot;

            const extractPageText = async () => {
                return await page.evaluate(() => {
                    const text = document.body.innerText || '';
                    return text.length > 5000 ? text.substring(0, 5000) + '...[truncated]' : text;
                });
            };

            const baselineText = await extractPageText();

            onEvent({ type: 'progress', data: { message: 'Analyzing baseline static frame...' } });
            const baselineAnalysis = await analyzeCrop(baselineScreenshot, 'Full-screen static UI scan', baselineText);
            let snapCount = 1;
            onEvent({ type: 'snap', data: { analysis: baselineAnalysis, snapCount, totalTokens: 1000, context: 'Baseline' } });

            const statesDiscovered: any[] = [
                {
                    trigger: 'Initial Load',
                    state: baselineAnalysis.detected_state,
                    description: baselineAnalysis.scene_description,
                    interactable_elements: baselineAnalysis.interactable_elements || []
                }
            ];

            if (interactionMode === 'active' && baselineAnalysis.interactable_elements?.length > 0) {
                onEvent({ type: 'progress', data: { message: `Active mode enabled. Found ${baselineAnalysis.interactable_elements.length} interactable elements. Beginning exploration...` } });

                // For safety and speed, interact with a max of 3 elements during this scraping session
                const elementsToClick = baselineAnalysis.interactable_elements.slice(0, 3);

                for (let i = 0; i < elementsToClick.length; i++) {
                    const el = elementsToClick[i];
                    onEvent({ type: 'progress', data: { message: `Clicking element: ${el.name} (${el.type})...` } });

                    try {
                        const [x, y, w, h] = el.coordinates;
                        const centerX = x + w / 2;
                        const centerY = y + h / 2;

                        const canvasBox = await element.boundingBox();
                        if (canvasBox) {
                            await page.mouse.click(canvasBox.x + centerX, canvasBox.y + centerY);
                            await page.waitForTimeout(2000); // Wait for animations/state changes

                            const newScreenshot = await element.screenshot();
                            const newPageText = await extractPageText();
                            const clickAnalysis = await analyzeCrop(newScreenshot, `State after clicking '${el.name}'`, newPageText);

                            snapCount++;
                            onEvent({ type: 'snap', data: { analysis: clickAnalysis, snapCount, totalTokens: snapCount * 1000, context: `Clicked ${el.name}` } });

                            statesDiscovered.push({
                                trigger: `Clicked ${el.name}`,
                                state: clickAnalysis.detected_state,
                                description: clickAnalysis.scene_description,
                                interactable_elements: clickAnalysis.interactable_elements || []
                            });
                        }
                    } catch (err) {
                        onEvent({ type: 'progress', data: { message: `Failed to interact with ${el.name}: ${err}` } });
                    }
                }

                // Scroll down test
                onEvent({ type: 'progress', data: { message: `Scrolling down to check for more content...` } });
                await page.evaluate(() => window.scrollBy(0, window.innerHeight));
                await page.waitForTimeout(2000);

                const scrollScreenshot = await page.screenshot();
                const scrollPageText = await extractPageText();
                const scrollAnalysis = await analyzeCrop(scrollScreenshot, `State after scrolling down`, scrollPageText);
                snapCount++;
                onEvent({ type: 'snap', data: { analysis: scrollAnalysis, snapCount, totalTokens: snapCount * 1000, context: `Scrolled down` } });

                statesDiscovered.push({
                    trigger: `Scrolled down`,
                    state: scrollAnalysis.detected_state,
                    description: scrollAnalysis.scene_description,
                    interactable_elements: scrollAnalysis.interactable_elements || []
                });

            } else {
                onEvent({ type: 'progress', data: { message: 'Starting dynamic change detection (Passive Mode)...' } });
                let frameCount = 0;
                const MAX_SNAPS = 12;

                while (frameCount < 40 && snapCount < MAX_SNAPS) {
                    const currentScreenshot = await element.screenshot();

                    if (this.lastFrame) {
                        const boundingBox = await getChangedBoundingBox(this.lastFrame, currentScreenshot, 30);

                        if (boundingBox && boundingBox.width > 30 && boundingBox.height > 30) {
                            onEvent({ type: 'progress', data: { message: `Change detected at box: x:${boundingBox.x}, y:${boundingBox.y}. Analyzing crop...` } });

                            const crop = await this.getCrop(currentScreenshot, boundingBox);
                            const passivePageText = await extractPageText();
                            const analysis = await analyzeCrop(crop, `Dynamic change crop at x:${boundingBox.x}, y:${boundingBox.y}, w:${boundingBox.width}, h:${boundingBox.height}`, passivePageText);

                            snapCount++;
                            onEvent({ type: 'snap', data: { analysis, snapCount, totalTokens: snapCount * 600, context: 'Passive dynamic change' } });

                            statesDiscovered.push({
                                trigger: `Auto-detected change`,
                                state: analysis.detected_state,
                                description: analysis.scene_description,
                                interactable_elements: analysis.interactable_elements || []
                            });

                            if (snapCount >= MAX_SNAPS) break;

                            await page.waitForTimeout(2000);
                            this.lastFrame = await element.screenshot();
                        } else {
                            this.lastFrame = currentScreenshot;
                        }
                    } else {
                        this.lastFrame = currentScreenshot;
                    }

                    frameCount++;
                    await page.waitForTimeout(800);
                }
            }

            onEvent({ type: 'progress', data: { message: 'Generating final AI semantic summary...' } });
            const finalAiSummary = await generateFinalSummary(statesDiscovered);

            // Build Final Scene Document
            const sceneDocument = `
Scene: ${baselineAnalysis.scene_description}
States discovered: ${statesDiscovered.length}
${statesDiscovered.map((s, i) => `  [State ${i + 1}] ${s.trigger ? `(Trigger: ${s.trigger}) ` : ''}— ${s.state}: ${s.description}`).join('\n')}
Interactions available: ${baselineAnalysis.interactable_elements?.map((e: any) => e.name).join(', ') || 'None'}

--- Final AI Summary ---
${finalAiSummary}
            `.trim();

            onEvent({ type: 'done', data: { message: 'Scrape completed.', sceneDocument, finalAiSummary } });
        } catch (error: any) {
            onEvent({ type: 'error', data: { message: error.message } });
        } finally {
            if (this.browser) await this.browser.close();
            this.lastFrame = null;
        }
    }

    private async getCrop(buffer: Buffer, box: BoundingBox): Promise<Buffer> {
        return sharp(buffer)
            .extract({ left: box.x, top: box.y, width: box.width, height: box.height })
            .toBuffer();
    }
}
