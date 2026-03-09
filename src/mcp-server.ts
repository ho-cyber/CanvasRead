import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { CanvasObserver, ScrapeEvent } from "./services/canvas-observer.js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { Request, Response } from "express";

// Load environment variables from .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const server = new Server(
    {
        name: "canvas-read-server",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

const ScrapeWebsiteSchema = z.object({
    url: z.string().url().describe("The URL of the website to scrape (3D or 2D)"),
    selector: z.string().optional().describe("Optional CSS selector for the canvas element"),
    interactionMode: z.enum(["passive", "active"]).optional().default("active").describe("Interaction mode: 'active' for clicking/scrolling, 'passive' for change detection"),
});

// Rate limiting state - Strict for Demo
const SCRAPE_LIMIT = 2; // Reduced from 3
const WINDOW_MS = 60 * 60 * 1000; // 1 hour (increased from 10 mins)
const domainScrapes = new Map<string, number[]>();

function checkRateLimit(url: string): { allowed: boolean; waitTimeMinutes?: number } {
    try {
        const hostname = new URL(url).hostname;
        const now = Date.now();
        let timestamps = domainScrapes.get(hostname) || [];

        // Filter out old timestamps
        timestamps = timestamps.filter(ts => now - ts < WINDOW_MS);

        if (timestamps.length >= SCRAPE_LIMIT) {
            const oldest = timestamps[0];
            const waitTimeMinutes = Math.ceil((WINDOW_MS - (now - oldest)) / 60000);
            return { allowed: false, waitTimeMinutes };
        }

        timestamps.push(now);
        domainScrapes.set(hostname, timestamps);
        return { allowed: true };
    } catch (e) {
        return { allowed: true };
    }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "scrape_website",
                description: "Scrapes a website (3D WebGL or standard HTML), extracts semantic scene context, detects states, and generates a final AI summary. Best for understanding the content and behavior of complex visual sites.",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: { type: "string" },
                        selector: { type: "string" },
                        interactionMode: { type: "string", enum: ["passive", "active"] },
                    },
                    required: ["url"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "scrape_website") {
        throw new Error(`Unknown tool: ${request.params.name}`);
    }

    const { url, selector, interactionMode } = ScrapeWebsiteSchema.parse(request.params.arguments);

    // Check rate limit
    const rateLimit = checkRateLimit(url);
    if (!rateLimit.allowed) {
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `Rate limit exceeded for domain: ${new URL(url).hostname}. Please wait ${rateLimit.waitTimeMinutes} more minutes before scraping this site again.`,
                },
            ],
        };
    }

    const observer = new CanvasObserver();
    let finalResult: any = null;
    const progressLogs: string[] = [];

    try {
        const result = await new Promise((resolve, reject) => {
            observer.start(
                url,
                (event: ScrapeEvent) => {
                    if (event.type === 'progress') {
                        progressLogs.push(event.data.message);
                    } else if (event.type === 'done') {
                        resolve(event.data);
                    } else if (event.type === 'error') {
                        reject(new Error(event.data.message));
                    }
                },
                selector,
                interactionMode
            ).catch(reject);
        });

        finalResult = result;

        return {
            content: [
                {
                    type: "text",
                    text: `Scrape successful for: ${url}\n\n--- Semantic Scene Document ---\n${finalResult.sceneDocument}\n\n--- Execution Logs ---\n${progressLogs.join("\n")}`,
                },
            ],
        };
    } catch (error: any) {
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `Scrape failed: ${error.message}\n\n--- Logs ---\n${progressLogs.join("\n")}`,
                },
            ],
        };
    }
});

// ... (previous request handlers stay the same)

async function main() {
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : null;

    if (PORT) {
        // SSE Mode (Cloud/Render)
        const app = express();
        let transport: SSEServerTransport | null = null;

        app.get("/sse", async (req: Request, res: Response) => {
            console.error("New SSE connection established");
            transport = new SSEServerTransport("/messages", res);
            await server.connect(transport);
        });

        app.post("/messages", async (req: Request, res: Response) => {
            if (transport) {
                await transport.handlePostMessage(req, res);
            } else {
                res.status(400).send("No active SSE session");
            }
        });

        app.listen(PORT, "0.0.0.0", () => {
            console.error(`CanvasRead MCP Server running on SSE at http://0.0.0.0:${PORT}`);
            console.error(`SSE endpoint: http://0.0.0.0:${PORT}/sse`);
            console.error(`Message endpoint: http://0.0.0.0:${PORT}/messages`);
        });
    } else {
        // Stdio Mode (Local)
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("CanvasRead MCP Server running on stdio");
    }
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
