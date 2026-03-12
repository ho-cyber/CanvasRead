import { chromium, Browser } from 'playwright';
import { getChangedBoundingBox, BoundingBox } from '@/utils/image-diff';
import { analyzeCrop, generateFinalSummary, analyzeVideo } from './ollama.service';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface ScrapeEvent {
    type: 'snap' | 'progress' | 'error' | 'done';
    data: any;
}

export class CanvasObserver {
    private browser: Browser | null = null;
    private lastFrame: Buffer | null = null;

    private async simulateCursorMovement(page: any, durationMs: number) {
        const startTime = Date.now();
        const viewport = page.viewportSize();
        if (!viewport) return;

        // Lissajous curve parameters for smooth screen coverage
        const A = viewport.width / 2.5;
        const B = viewport.height / 2.5;
        const centerX = viewport.width / 2;
        const centerY = viewport.height / 2;

        while (Date.now() - startTime < durationMs) {
            const elapsed = (Date.now() - startTime) / 1000;
            // x = A * sin(at + delta), y = B * sin(bt)
            const x = centerX + A * Math.sin(2 * Math.PI * 0.5 * elapsed);
            const y = centerY + B * Math.sin(2 * Math.PI * 0.3 * elapsed + Math.PI / 4);

            await page.mouse.move(x, y);
            await page.waitForTimeout(50); // High frequency updates for smooth motion
        }
    }

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
                recordVideo: {
                    dir: '/tmp/canvas-videos',
                    size: { width: 1280, height: 720 }
                }
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
                return await page.evaluate(`() => {
                    const docText = document.body.innerText || '';
                    return docText.length > 5000 ? docText.substring(0, 5000) + '...[truncated]' : docText;
                }`);
            };

            const extractDOMUI = async () => {
                return await page.evaluate(`() => {
                    function serialize(node, depth = 0) {
                        if (depth > 10 || !node) return null;
                        if (node.nodeType === 3) { // TEXT_NODE
                            const trimmed = node.textContent ? node.textContent.trim() : "";
                            return trimmed ? trimmed : null;
                        }
                        if (node.nodeType !== 1) return null; // ELEMENT_NODE

                        const tagName = node.tagName.toLowerCase();
                        if (['script', 'style', 'canvas', 'noscript', 'meta', 'link'].includes(tagName)) return null;

                        const rect = node.getBoundingClientRect();
                        if (rect.width === 0 || rect.height === 0 || node.style.display === 'none' || node.style.visibility === 'hidden') return null;

                        const children = [];
                        const nodes = node.childNodes;
                        for (let i = 0; i < nodes.length; i++) {
                            const child = serialize(nodes[i], depth + 1);
                            if (child) children.push(child);
                        }

                        if (children.length === 0 && (!node.textContent || !node.textContent.trim()) && tagName !== 'img') return null;

                        const classList = Array.from(node.classList);
                        return {
                            tag: tagName,
                            id: node.id || undefined,
                            classes: classList.length > 0 ? classList : undefined,
                            type: node.type || undefined,
                            src: node.src || undefined,
                            alt: node.alt || undefined,
                            href: node.href || undefined,
                            children: children.length > 0 ? children : undefined
                        };
                    }
                    return serialize(document.body);
                }`);
            };

            const baselineText = await extractPageText() as string;
            const baselineDOM = await extractDOMUI();

            // ==========================================
            // PHASE 1: JAVASCRIPT CONTEXT INJECTION
            // Attempt to find a THREE.js scene natively
            // ==========================================
            onEvent({ type: 'progress', data: { message: 'Attempting JavaScript Context Injection for native 3D extraction...' } });

            let nativeSceneGraph = null;
            try {
                nativeSceneGraph = await page.evaluate(`() => {
                    function findS(obj, depth = 0) {
                        if (depth > 5 || !obj) return null;
                        if (obj.isScene) return obj;

                        const keys = Object.keys(obj);
                        for (const key of keys) {
                            try {
                                const val = obj[key];
                                if (val && val.isScene) return val;
                                if (val && typeof val === 'object' && !Array.isArray(val) && val !== window) {
                                    if (depth < 2) {
                                        const found = findS(val, depth + 1);
                                        if (found) return found;
                                    }
                                }
                            } catch (e) { }
                        }

                        try {
                            const canvas = document.querySelector('canvas');
                            if (canvas) {
                                const r3fRoots = Object.keys(canvas).find(k => k.startsWith('__reactFiber$'));
                                if (canvas[r3fRoots]) {
                                    return { isR3FCanvas: true, type: 'React Three Fiber Context' };
                                }
                            }
                        } catch (e) { }

                        return null;
                    }

                    function serializeN(node) {
                        return {
                            name: node.name || 'Unnamed',
                            type: node.type,
                            position: node.position ? { x: node.position.x, y: node.position.y, z: node.position.z } : undefined,
                            children: node.children ? node.children.map(c => serializeN(c)) : [],
                            hasMaterial: !!node.material,
                            hasGeometry: !!node.geometry
                        };
                    }

                    const scene = findS(window);

                    if (scene && scene.isScene) {
                        return serializeN(scene);
                    } else if (scene && scene.isR3FCanvas) {
                        return { error: "R3F canvas detected, but internal scene graph is currently obfuscated by React Fiber." };
                    }

                    return null;
                }`);
            } catch (err: any) {
                onEvent({ type: 'progress', data: { message: `JS Injection failed or was blocked: ${err.message}` } });
            }

            let snapCount = 1;
            let baselineAnalysis;
            const statesDiscovered: any[] = [];

            // Unify Vision, DOM, and Native 3D Data
            onEvent({ type: 'progress', data: { message: 'Analyzing baseline static frame using Vision...' } });
            baselineAnalysis = await analyzeCrop(baselineScreenshot, 'Full-screen static UI scan', baselineText);

            const combinedContext: any = {
                htmlOverlays: baselineDOM
            };

            if (nativeSceneGraph && !(nativeSceneGraph as any).error) {
                onEvent({ type: 'progress', data: { message: '✅ Native THREE.Scene found! Integrating into baseline context...' } });
                combinedContext.sceneGraph = nativeSceneGraph;
            } else if ((nativeSceneGraph as any)?.error) {
                onEvent({ type: 'progress', data: { message: `Native scan note: ${(nativeSceneGraph as any).error}` } });
            }

            onEvent({
                type: 'snap', data: {
                    analysis: baselineAnalysis,
                    snapCount,
                    totalTokens: 1000,
                    context: 'Comprehensive Baseline (Vision + DOM + 3D)',
                    rawGraph: combinedContext
                }
            });

            statesDiscovered.push({
                trigger: 'Initial Load',
                state: baselineAnalysis.detected_state,
                description: baselineAnalysis.scene_description + (combinedContext.sceneGraph ? '\n- Native 3D Graph included' : '') + '\n- DOM UI serialized',
                interactable_elements: baselineAnalysis.interactable_elements || []
            });

            if (interactionMode === 'active') {
                onEvent({ type: 'progress', data: { message: `Simulating cursor exploration for 3D interaction (6s)...` } });
                // Simulate mouse movement to trigger hover shaders/animations
                await this.simulateCursorMovement(page, 6000);

                onEvent({ type: 'progress', data: { message: `Exploring website narrative (Scroll + DOM + Vision)...` } });

                // 1. Interaction Round (Click identified elements)
                if (baselineAnalysis.interactable_elements?.length > 0) {
                    const elementsToClick = baselineAnalysis.interactable_elements.slice(0, 3);
                    for (let i = 0; i < elementsToClick.length; i++) {
                        const el = elementsToClick[i];
                        onEvent({ type: 'progress', data: { message: `Interacting with: ${el.name}...` } });

                        try {
                            const [x, y, w, h] = el.coordinates;
                            const centerX = x + w / 2;
                            const centerY = y + h / 2;
                            const canvasBox = await element.boundingBox();

                            if (canvasBox) {
                                await page.mouse.click(canvasBox.x + centerX, canvasBox.y + centerY);
                                await page.waitForTimeout(2000);

                                snapCount++;
                                const interactionScreenshot = await element.screenshot();
                                const interactionDOM = await extractDOMUI();
                                const intersectionText = await extractPageText() as string;
                                const interactionAnalysis = await analyzeCrop(interactionScreenshot, `State after clicking ${el.name}`, intersectionText);

                                const interactionContext = {
                                    htmlOverlays: interactionDOM,
                                    sceneGraph: await page.evaluate(`() => {
                                        function findS(obj) {
                                            if (!obj || typeof obj !== 'object') return null;
                                            if (obj.isScene) return obj;
                                            return null;
                                        }
                                        function serializeN(node) {
                                            return {
                                                name: node.name || 'Unnamed',
                                                type: node.type,
                                                position: node.position ? { x: node.position.x, y: node.position.y, z: node.position.z } : undefined,
                                                children: node.children ? node.children.map(c => serializeN(c)) : [],
                                                hasMaterial: !!node.material,
                                                hasGeometry: !!node.geometry
                                            };
                                        }
                                        const scene = findS(window);
                                        if (scene) {
                                            return serializeN(scene);
                                        }
                                        return null;
                                    }`)
                                };

                                onEvent({
                                    type: 'snap', data: {
                                        analysis: interactionAnalysis,
                                        snapCount,
                                        totalTokens: snapCount * 1000,
                                        context: `Interact: ${el.name}`,
                                        rawGraph: interactionContext
                                    }
                                });

                                statesDiscovered.push({
                                    trigger: `Click: ${el.name}`,
                                    state: interactionAnalysis.detected_state,
                                    description: interactionAnalysis.scene_description,
                                    interactable_elements: interactionAnalysis.interactable_elements || []
                                });
                            }
                        } catch (err) { }
                    }
                }

                // 2. Scrolling Round (Capturing narrative flow across ALL scrollable containers)
                onEvent({ type: 'progress', data: { message: `Discovering scrollable sections on page...` } });

                // Find all meaningful scrollable containers (not just window)
                let scrollTargets: { selector: string, label: string }[] = [{ selector: '__window__', label: 'Main Window' }];
                try {
                    const discovered = await page.evaluate(`(() => {
                        const targets = [];
                        const seen = new Set();
                        targets.push({ selector: '__window__', label: 'Main Window' });

                        const candidates = document.querySelectorAll('*');
                        for (const el of candidates) {
                            const style = window.getComputedStyle(el);
                            const overflowY = style.overflowY;
                            const overflowX = style.overflowX;
                            const hasVScroll = (overflowY === 'scroll' || overflowY === 'auto') && el.scrollHeight > el.clientHeight + 20;
                            const hasHScroll = (overflowX === 'scroll' || overflowX === 'auto') && el.scrollWidth > el.clientWidth + 20;
                            if (!hasVScroll && !hasHScroll) continue;
                            if (el.clientHeight < 80 || el.clientWidth < 80) continue;

                            let sel = '';
                            if (el.id) {
                                sel = '#' + el.id;
                            } else if (el.className && typeof el.className === 'string') {
                                const cls = el.className.trim().split(/\\s+/).slice(0, 2).join('.');
                                if (cls) sel = el.tagName.toLowerCase() + '.' + cls;
                            } else {
                                sel = el.tagName.toLowerCase();
                            }
                            if (!sel || seen.has(sel)) continue;
                            seen.add(sel);
                            targets.push({ selector: sel, label: 'Section: ' + sel });
                        }
                        return targets;
                    })()`);
                    if (Array.isArray(discovered) && discovered.length > 0) {
                        scrollTargets = discovered as { selector: string, label: string }[];
                    }
                } catch (discoverErr: any) {
                    onEvent({ type: 'progress', data: { message: `Section discovery failed, falling back to window scroll: ${discoverErr.message}` } });
                }

                onEvent({ type: 'progress', data: { message: `Found ${scrollTargets.length} scrollable target(s). Starting scroll extraction...` } });


                for (const target of scrollTargets) {
                    const steps = 3; // Scroll each container in 3 increments
                    for (let step = 1; step <= steps; step++) {
                        onEvent({ type: 'progress', data: { message: `Scrolling [${target.label}] — step ${step}/${steps}...` } });
                        try {
                            if (target.selector === '__window__') {
                                await page.evaluate(`(s) => window.scrollTo({ top: document.body.scrollHeight * (s / ${steps}), behavior: 'smooth' })`, step);
                            } else {
                                await page.evaluate(`(args) => {
                                    const el = document.querySelector(args.sel);
                                    if (el) el.scrollTop = el.scrollHeight * (args.step / args.steps);
                                }`, { sel: target.selector, step, steps });
                            }
                            await page.waitForTimeout(2000); // Allow scroll-linked animations to settle

                            snapCount++;
                            const scrollScreenshot = await page.screenshot();
                            const scrollDOM = await extractDOMUI();
                            const scrollText = await extractPageText() as string;
                            const scrollAnalysis = await analyzeCrop(scrollScreenshot, `${target.label} — Step ${step}`, scrollText);

                            const scrollContext = {
                                htmlOverlays: scrollDOM,
                                sceneGraph: await page.evaluate(`() => {
                                    function findS(obj) {
                                        if (!obj || typeof obj !== 'object') return null;
                                        if (obj.isScene) return obj;
                                        return null;
                                    }
                                    function serializeN(node) {
                                        return {
                                            name: node.name || 'Unnamed',
                                            type: node.type,
                                            position: node.position ? { x: node.position.x, y: node.position.y, z: node.position.z } : undefined,
                                            children: node.children ? node.children.map(c => serializeN(c)) : [],
                                            hasMaterial: !!node.material,
                                            hasGeometry: !!node.geometry
                                        };
                                    }
                                    const scene = findS(window);
                                    if (scene) return serializeN(scene);
                                    return null;
                                }`)
                            };

                            onEvent({
                                type: 'snap', data: {
                                    analysis: scrollAnalysis,
                                    snapCount,
                                    totalTokens: snapCount * 1000,
                                    context: `${target.label} — Scroll ${step}`,
                                    rawGraph: scrollContext
                                }
                            });

                            statesDiscovered.push({
                                trigger: `${target.label} Scroll ${step}`,
                                state: scrollAnalysis.detected_state,
                                description: scrollAnalysis.scene_description,
                                interactable_elements: scrollAnalysis.interactable_elements || []
                            });
                        } catch (scrollErr: any) {
                            onEvent({ type: 'progress', data: { message: `Scroll step failed for [${target.label}]: ${scrollErr.message}` } });
                        }
                    }

                    // Reset scroll position before moving to next container
                    try {
                        if (target.selector === '__window__') {
                            await page.evaluate(`() => window.scrollTo({ top: 0, behavior: 'instant' })`);
                        } else {
                            await page.evaluate(`(sel) => { const el = document.querySelector(sel); if (el) el.scrollTop = 0; }`, target.selector);
                        }
                        await page.waitForTimeout(500);
                    } catch (_) { }
                }

            } else {
                onEvent({ type: 'progress', data: { message: 'Starting dynamic change detection (Passive Mode)...' } });
                let frameCount = 0;
                const MAX_SNAPS = 12;

                while (frameCount < 40 && snapCount < MAX_SNAPS) {
                    const currentScreenshot = await element.screenshot();

                    if (this.lastFrame) {
                        try {
                            const boundingBox = await getChangedBoundingBox(this.lastFrame, currentScreenshot, 30);

                            // Check if the change is a massive background animation (e.g. moving waves)
                            let isMassiveChange = false;
                            if (boundingBox) {
                                const boxArea = boundingBox.width * boundingBox.height;
                                const maxAllowedArea = 1280 * 720 * 0.7; // Ignore changes > 70% of screen to avoid API timeouts
                                isMassiveChange = boxArea > maxAllowedArea;
                            }

                            if (boundingBox && boundingBox.width > 30 && boundingBox.height > 30) {
                                if (isMassiveChange) {
                                    onEvent({ type: 'progress', data: { message: 'Massive background animation detected. Ignoring to save tokens and prevent API errors.' } });
                                    this.lastFrame = currentScreenshot; // Update baseline to new animation state
                                } else {
                                    onEvent({ type: 'progress', data: { message: `Change detected at box: x:${boundingBox.x}, y:${boundingBox.y}. Analyzing crop...` } });

                                    const crop = await this.getCrop(currentScreenshot, boundingBox);
                                    const passivePageText = await extractPageText() as string;
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
                                }
                            } else {
                                this.lastFrame = currentScreenshot;
                            }
                        } catch (err: any) {
                            onEvent({ type: 'progress', data: { message: `Skipping problematic frame analysis: ${err.message}` } });
                        }
                    } else {
                        this.lastFrame = currentScreenshot;
                    }

                    frameCount++;
                    await page.waitForTimeout(800);
                }
            }

            // Capture Video Path before closing
            onEvent({ type: 'progress', data: { message: 'Finalizing video recording...' } });
            await page.waitForTimeout(1000); // Buffer
            const videoPath = await page.video()?.path();

            let videoAnalysis = "";
            if (videoPath) {
                onEvent({ type: 'progress', data: { message: 'Analyzing motion and animations via Video NIM (Hero Focused)...' } });

                // Estimate hero box (either the element itself or top of page)
                const heroBox = await page.evaluate(`() => {
                    const hero = document.querySelector('section[class*="hero"], div[class*="hero"], #hero, .hero') || document.querySelector('canvas');
                    if (hero) {
                        const rec = hero.getBoundingClientRect();
                        return { x: Math.max(0, rec.x), y: Math.max(0, rec.y), width: rec.width, height: rec.height };
                    }
                    return { x: 0, y: 0, width: 1280, height: 720 }; // Fallback
                }`) as { x: number, y: number, width: number, height: number };

                videoAnalysis = await analyzeVideo(videoPath, heroBox);
            }

            onEvent({ type: 'progress', data: { message: 'Generating final AI semantic summary...' } });
            const finalAiSummary = await generateFinalSummary(statesDiscovered);

            // Build Final Scene Document
            const sceneDocument = `
Scene: ${baselineAnalysis.scene_description}
States discovered: ${statesDiscovered.length}
${statesDiscovered.map((s, i) => `  [State ${i + 1}] ${s.trigger ? `(Trigger: ${s.trigger}) ` : ''}— ${s.state}: ${s.description}`).join('\n')}
Interactions available: ${baselineAnalysis.interactable_elements?.map((e: any) => e.name).join(', ') || 'None'}

--- Final Animation & Motion Analysis ---
${videoAnalysis || "No video analysis available."}

--- Final AI Summary ---
${finalAiSummary}
            `.trim();

            onEvent({ type: 'done', data: { message: 'Scrape completed.', sceneDocument, finalAiSummary, videoAnalysis } });
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
