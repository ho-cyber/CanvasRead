export interface InteractableElement {
    name: string;
    type: string;
    coordinates: [number, number, number, number]; // [x, y, w, h]
}

export interface ExtractionResult {
    scene_description: string;
    detected_state: string;
    interactable_elements: InteractableElement[];
}

import fs from 'fs';
import path from 'path';

export async function analyzeCrop(
    imageBuffer: Buffer,
    context?: string,
    pageText?: string
): Promise<ExtractionResult> {
    const base64Image = imageBuffer.toString('base64');
    const prompt = `
    Analyze this section of a website or 3D application.
    You are a structural data extraction engine. You MUST output your findings in STRICT JSON format.
    
    CRITICAL INSTRUCTIONS:
    - Identify the overall scene, the current state, and any interactable elements.
    - Return ONLY a valid JSON object.
    - DO NOT include ANY introductory or explanatory text (e.g., "The image shows...").
    - DO NOT use markdown code blocks.
    - Ensure all coordinates are [x, y, w, h].
    
    REQUIRED STRUCTURE:
    {
      "scene_description": "Prose describing the visual rendering and layout.",
      "detected_state": "Short state name.",
      "interactable_elements": [
        { "name": "Element name", "type": "button | icon | component", "coordinates": [x, y, w, h] }
      ]
    }

    ${context ? `Context: ${context}\n` : ''}
    ${pageText ? `DOM Visible Text (use this for accuracy): ${pageText}\n` : ''}
    `.trim();

    try {
        const payload = {
            model: "meta/llama-3.2-90b-vision-instruct",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }
            ],
            max_tokens: 16384,
            temperature: 0.20,
            top_p: 0.95,
            top_k: 20,
            presence_penalty: 0,
            repetition_penalty: 1,
            stream: false
        };

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`NVIDIA API Error: ${response.status} - ${errBody}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        let responseText = content.trim();
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

        if (jsonMatch && jsonMatch[1]) {
            responseText = jsonMatch[1].trim();
        } else {
            const startIdx = responseText.indexOf('{');
            const endIdx = responseText.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1) {
                responseText = responseText.substring(startIdx, endIdx + 1);
            } else {
                console.warn('No JSON found in response, using heuristic fallback.');
                return {
                    scene_description: content.trim(),
                    detected_state: "Analysis (Natural Language)",
                    interactable_elements: []
                };
            }
        }

        try {
            return JSON.parse(responseText) as ExtractionResult;
        } catch (e) {
            console.error('JSON Parse failed even after extraction. Content:', responseText);
            return {
                scene_description: responseText.substring(0, 500),
                detected_state: "Parse Error",
                interactable_elements: []
            };
        }
    } catch (error) {
        console.error('NVIDIA vision analysis failed:', error);
        return { scene_description: "", detected_state: "Error", interactable_elements: [] };
    }
}

export async function generateFinalSummary(states: any[]): Promise<string> {
    const prompt = `
    You are an AI tasked with generating a final concise summary of a 3D website based on the discovered states during a scraping session.
    Here is the JSON data representing the states we discovered:
    ${JSON.stringify(states, null, 2)}
    
    Please provide a concise summary of what this website is, what it is doing, and a summary of all the important elements and interactions available, based on the JSON data provided. Do not invent any details not present in the JSON.
    `.trim();

    try {
        const payload = {
            model: "meta/llama-3.2-90b-vision-instruct",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 4096,
            temperature: 0.50,
            top_p: 0.95,
            top_k: 20,
            presence_penalty: 0,
            repetition_penalty: 1,
            stream: false
        };

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`NVIDIA API Error: ${response.status} - ${errBody}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('NVIDIA summary generation failed:', error);
        return "Failed to generate final summary.";
    }
}

export async function generateAccessibilityReport(states: any[]): Promise<string> {
    const prompt = `
    You are an AI Accessibility and SEO expert.
    Based on the following JSON data representing the states and extracted elements of a 3D website, generate a comprehensive accessibility report and SEO-friendly fallback transcript.
    Your output MUST be formatted in Markdown.
    It should include:
    1. A clear, readable transcript of the 3D scene's contents and purpose.
    2. Suggested "alt" text descriptions for the scene and major interactive elements.
    3. Suggested ARIA labels for any buttons or interactive elements detected.
    
    JSON Data:
    ${JSON.stringify(states, null, 2)}
    `.trim();

    try {
        const payload = {
            model: "meta/llama-3.2-90b-vision-instruct",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 4096,
            temperature: 0.50,
            top_p: 0.95,
            top_k: 20
        };

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`NVIDIA API Error: ${response.status}`);
        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('NVIDIA accessibility generation failed:', error);
        return "Failed to generate accessibility report.";
    }
}

export async function runQATest(states: any[], query: string): Promise<{ pass: boolean, reasoning: string }> {
    const prompt = `
    You are an automated visual QA testing AI for a 3D website.
    You will be provided with JSON data representing the extracted state of the 3D scene, and a natural language QA test assertion.
    You must evaluate whether the assertion is TRUE or FALSE based ONLY on the provided JSON data.

    Assertion: "${query}"
    
    JSON Data:
    ${JSON.stringify(states, null, 2)}
    
    Return your response strictly as a JSON object with this exact structure:
    {
        "pass": true or false,
        "reasoning": "A concise explanation of why the test passed or failed based on the data."
    }
    Do not wrap the JSON in markdown code blocks.
    `.trim();

    try {
        const payload = {
            model: "meta/llama-3.2-90b-vision-instruct",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1024,
            temperature: 0.20,
            top_p: 0.95,
            top_k: 20
        };

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`NVIDIA API Error: ${response.status}`);
        const data = await response.json();
        let content = data.choices[0].message.content.trim();

        // Cleanup markdown if present
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            content = jsonMatch[1].trim();
        } else {
            const startIdx = content.indexOf('{');
            const endIdx = content.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1) {
                content = content.substring(startIdx, endIdx + 1);
            }
        }

        return JSON.parse(content);
    } catch (error) {
        console.error('NVIDIA QA test failed:', error);
        return { pass: false, reasoning: "API Request failed." };
    }
}

export async function generateCloningSpec(states: any[], videoAnalysis?: string): Promise<string> {
    const prompt = `
    You are an expert 3D Creative Technologist and Lead Technical Architect specializing in React Three Fiber (R3F), Drei, and GLSL Shaders.
    
    CONTEXT:
    You are analyzing a 3D website to provide a high-fidelity cloning specification.
    
    ${videoAnalysis ? `MOTION ANALYSIS DATA (extracted from video recording):
    ${videoAnalysis}
    ` : ''}
    
    RAW EXTRACTED DATA (Scene Graph & Visual Analysis):
    ${JSON.stringify(states, null, 2)}
    
    YOUR OUTPUT STRUCTURE:
    
    1. ARCHITECTURAL OVERVIEW
    - Summarize the overall aesthetic, lighting setup, and camera perspective.
    - Define the core "vibe" (e.g., minimalist, high-octane racing, liquid-organic).
    
    2. SCENE COMPONENT HIERARCHY
    - List the major R3F components needed (e.g., <Environment />, <Float />, <ScrollControls />, <ContactShadows />).
    - Group items by their parent/child relationship detected in the scene graph.
    
    3. ASSETS & GEOMETRY
    - Specify required geometries (Box, Sphere, custom GLB paths if mentioned).
    - Detail material properties (roughness, metalness, transparency, color).
    
    4. ANIMATION & SHADER STRATEGY
    - Integrate the Motion Analysis if provided. Describe the motion logic including easing functions and timings.
    - If scrollytelling is detected, explain how 'useScroll' or 'useFrame' should map transitions.
    - If the analysis mentions waves, particles, or liquid, provide a "GLSL Blueprint" describing the vertex and fragment shader uniforms and logic needed.
    
    5. INTERACTION LOGIC
    - Detail how clicking/hovering on identified elements (from the coordinates) should trigger state changes in R3F.
    
    6. DETERMINISTIC SYSTEM PROMPT FOR CODE GEN
    - Provide a final "Mega-Prompt" that a developer can copy-paste. This prompt should explicitly tell the coding AI: "Do not use placeholders," "Write the full GLSL," and "Initialize a clean R3F boilerplate."
    
    IMPORTANT: Be technical, concise, and deterministic. Use R3F terminology throughout.
    `.trim();

    try {
        const payload = {
            model: "meta/llama-3.2-90b-vision-instruct",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 8192,
            temperature: 0.40,
            top_p: 0.95
        };

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`NVIDIA API Error: ${response.status}`);
        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('NVIDIA cloning spec generation failed:', error);
        return "Failed to generate cloning specification.";
    }
}

export async function analyzeVideo(videoPath: string, heroBox?: { x: number, y: number, width: number, height: number }): Promise<string> {
    const tempDir = path.dirname(videoPath);
    const frameBase = path.join(tempDir, `frames_${Date.now()}`);
    if (!fs.existsSync(frameBase)) fs.mkdirSync(frameBase);

    try {
        // Extract 3 key frames (start, mid, end of the recording)
        // If heroBox is provided, crop the video first
        const { execSync } = require('child_process');

        let sourceVideo = videoPath;
        if (heroBox && heroBox.width > 0 && heroBox.height > 0) {
            const croppedVideo = path.join(tempDir, `cropped_${Date.now()}.webm`);
            try {
                // Ensure dimensions are even (FFmpeg requirement for some codecs)
                const w = Math.floor(heroBox.width / 2) * 2;
                const h = Math.floor(heroBox.height / 2) * 2;
                const x = Math.floor(heroBox.x / 2) * 2;
                const y = Math.floor(heroBox.y / 2) * 2;

                console.log(`Cropping video to hero: ${w}x${h} at ${x},${y}`);
                execSync(`ffmpeg -i "${videoPath}" -filter:v "crop=${w}:${h}:${x}:${y}" -c:a copy "${croppedVideo}"`);
                sourceVideo = croppedVideo;
            } catch (cropErr) {
                console.error('Video cropping failed, using original:', cropErr);
            }
        }

        execSync(`ffmpeg -i "${sourceVideo}" -vf "fps=1/2" -vframes 3 "${frameBase}/frame_%d.jpg"`);

        const frameFiles = fs.readdirSync(frameBase)
            .filter((f: string) => f.endsWith('.jpg'))
            .sort();

        if (frameFiles.length === 0) return "Could not extract frames for video analysis.";

        // Analyze each frame individually (NVIDIA Vision API supports 1 image per request)
        const perFrameDescriptions: string[] = [];

        for (let i = 0; i < frameFiles.length; i++) {
            const buffer = fs.readFileSync(path.join(frameBase, frameFiles[i]));
            // Removed space after comma
            const dataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;

            const framePrompt = `You are a Motion Designer analyzing frame ${i + 1} of ${frameFiles.length} from a 3D website recording.
Describe what you see in this frame. Focus on:
- Object positions, rotations, and visual effects
- Lighting conditions and color palette
- Any particles, waves, or dynamic visual elements
- UI overlays and their positioning
Be concise and technical.`;

            const payload = {
                model: "meta/llama-3.2-90b-vision-instruct",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: framePrompt },
                            { type: "image_url", image_url: { url: dataUrl } }
                        ]
                    }
                ],
                max_tokens: 512,
                temperature: 0.15
            };

            try {
                const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errBody = await response.text();
                    console.error(`Frame ${i + 1} analysis failed (${response.status}):`, errBody);
                    continue;
                }
                const data = await response.json();
                perFrameDescriptions.push(`[Frame ${i + 1}]: ${data.choices[0].message.content.trim()}`);
            } catch (frameErr) {
                console.error(`Frame ${i + 1} request error:`, frameErr);
            }
        }

        if (perFrameDescriptions.length === 0) return "Frame analysis returned no results.";

        // Synthesize a unified Motion Spec from per-frame descriptions (text-only call)
        const synthesisPrompt = `You are a Motion Designer synthesizing animation data.
Below are descriptions of ${perFrameDescriptions.length} sequential frames captured from a 3D website while a cursor moved across the screen.

${perFrameDescriptions.join('\n\n')}

TASK: Compare the frames and produce a concise "Motion Spec":
1. What changed between frames? (object movement, color shifts, particle flow)
2. Estimated easing (linear, ease-in-out, elastic, spring)
3. Estimated timing per transition
4. Trigger type (auto-play loop, hover-reactive, scroll-bound)
5. Any shader effects (glow, distortion, wave displacement)

Output a technical spec a React Three Fiber developer can implement.`;

        const synthPayload = {
            model: "meta/llama-3.2-90b-vision-instruct",
            messages: [{ role: "user", content: synthesisPrompt }],
            max_tokens: 1024,
            temperature: 0.2
        };

        const synthResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(synthPayload)
        });

        if (!synthResponse.ok) {
            console.error('Synthesis call failed:', await synthResponse.text());
            return perFrameDescriptions.join('\n\n');
        }

        const synthData = await synthResponse.json();
        return synthData.choices[0].message.content.trim();

    } catch (error) {
        console.error('Video analysis failed:', error);
        return "Animation analysis unavailable due to processing error.";
    } finally {
        try {
            if (fs.existsSync(frameBase)) {
                fs.rmSync(frameBase, { recursive: true, force: true });
            }
        } catch (e) { }
    }
}
