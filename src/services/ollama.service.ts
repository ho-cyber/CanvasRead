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

export async function analyzeCrop(
    imageBuffer: Buffer,
    context?: string,
    pageText?: string
): Promise<ExtractionResult> {
    const base64Image = imageBuffer.toString('base64');
    const prompt = `
    Analyze this section of a website or 3D application.
    You are an AI tasked with generating a semantic scene description for a Model Context Protocol (MCP) server.
    Identify the overall scene, the current state, and any interactable elements (buttons, sliders, 3D model parts, links, etc.).
    Return ONLY a JSON object with the following structure:
    {
      "scene_description": "High-level prose describing what is rendering (e.g. 'A 3D configurator for Nike sneakers with a white background', or 'A blog post about web scraping')",
      "detected_state": "A short name for this specific view or state (e.g., 'Default view', 'Color picker open', 'Scanned halfway down page')",
      "interactable_elements": [
        {
          "name": "Name or text of the element",
          "type": "button | slider | model_part | link | etc",
          "coordinates": [x, y, w, h]
        }
      ]
    }
    No narrative, no markdown code blocks, just pure JSON.
    ${context ? `Context for this snap: ${context}\n` : ''}
    ${pageText ? `Additionally, here is the visible text extracted from the webpage DOM. You MUST use this to accurately extract copy, headlines, read text, and identify descriptions if they are present:\n\n---\n${pageText}\n---\n` : ''}
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
            temperature: 0.60,
            top_p: 0.95,
            top_k: 20,
            presence_penalty: 0,
            repetition_penalty: 1,
            stream: false,
            // NVIDIA specific
            chat_template_kwargs: { enable_thinking: true }
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
            // Fallback: try to find first { and last }
            const startIdx = responseText.indexOf('{');
            const endIdx = responseText.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1) {
                responseText = responseText.substring(startIdx, endIdx + 1);
            }
        }

        console.log('--- RAW NVIDIA API RESPONSE ---');
        console.log(content.trim());
        console.log('--- EXTRACTED JSON ---');
        console.log(responseText);
        console.log('---------------------------');

        return JSON.parse(responseText) as ExtractionResult;
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
            model: "meta/llama-3.2-90b-vision-instruct", // Using the same model for consistency, it handles text-only prompts fine
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
