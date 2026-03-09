# syntax=docker/dockerfile:1
# --- Stage 1: Build & Dependencies ---
FROM node:20 AS builder
WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
COPY tsconfig.mcp.json ./

# Install ALL dependencies (including dev) for compilation
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source and build the mcp server to JS
COPY src/ ./src/
RUN npm run build:mcp

# --- Stage 2: Final Runner ---
FROM node:20 AS runner
WORKDIR /app

# Install ONLY the system dependencies for Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk-bridge2.0-0 libx11-xcb1 libgtk-3-0 libxcomposite1 \
    libxdamage1 libxrandr2 libgbm1 libasound2 libpangocairo-1.0-0 \
    libpango-1.0-0 libcairo2 libatspi2.0-0 libxshmfence1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Ensure we have the correct NODE_ENV
ENV NODE_ENV=production

# Copy only production files
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

# Install Chromium (Playwright needs this)
ENV PLAYWRIGHT_BROWSERS_PATH=/app/ms-playwright
RUN npx playwright install chromium

# Environment variables
ENV NVIDIA_API_KEY=""
ENV PORT=10000

EXPOSE 10000

# Run the compiled JS with Node directly (much more stable)
CMD ["node", "dist/mcp-server.js"]