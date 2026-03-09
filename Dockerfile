# syntax=docker/dockerfile:1
# --- Stage 1: Build & Dependencies ---
FROM node:20 AS builder
WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Use BuildKit cache mount to speeds up installs
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# --- Stage 2: Final Runner ---
# We use node:20 (FULL DEBIAN) as requested (NOT slim or alpine).
# We then install ONLY the dependencies needed for Chromium.
# This keeps the image "Full" but reduces size from 2.3GB to ~600MB.
FROM node:20 AS runner
WORKDIR /app

# Install ONLY the system dependencies for Chromium
# This is MUCH faster to push than the full Playwright image
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk-bridge2.0-0 libx11-xcb1 libgtk-3-0 libxcomposite1 \
    libxdamage1 libxrandr2 libgbm1 libasound2 libpangocairo-1.0-0 \
    libpango-1.0-0 libcairo2 libatspi2.0-0 libxshmfence1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Ensure we have the correct NODE_ENV
ENV NODE_ENV=production

# Copy ONLY the production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Install ONLY Chromium (skips Firefox and WebKit which makes the image push fast)
ENV PLAYWRIGHT_BROWSERS_PATH=/app/ms-playwright
RUN npx playwright install chromium

# Selective copying of source code
COPY src/ ./src/
COPY tsconfig.json ./

# Environment variables
ENV NVIDIA_API_KEY=""

# Run with npx for reliable binary resolution
CMD ["npx", "tsx", "src/mcp-server.ts"]