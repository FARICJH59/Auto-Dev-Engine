# ADE Inventory Agent Service Dockerfile
# Multi-stage build with pnpm and distroless Node.js 22
# Optimized for performance and security (Rugged-Silo)

# Stage 1: Build dependencies
FROM node:22-slim@sha256:a4b757cd491c7f0b57f57951f35f4e85b7e1ad54dbffca4cf62f32f0f8b35d62 AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.14.2 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json ./
COPY services/shared-sdk/package.json ./services/shared-sdk/
COPY services/inventory-agent/package.json ./services/inventory-agent/

# Fetch dependencies (cached layer)
RUN pnpm fetch --prod

# Copy source files
COPY services/shared-sdk/ ./services/shared-sdk/
COPY services/inventory-agent/ ./services/inventory-agent/

# Install and build
RUN pnpm install --offline --prod
RUN pnpm --filter @ade/shared-sdk build
RUN pnpm --filter @ade/inventory-agent build

# Stage 2: Production image
FROM gcr.io/distroless/nodejs22-debian12@sha256:d1f9ec8e59d7f5e6a79e51b7c52dc21c60a1e7e3a5a96e3a3d6f6d0e5e9e8e9e AS runtime

WORKDIR /app

# Copy built application
COPY --from=builder /app/services/shared-sdk/dist/ ./services/shared-sdk/dist/
COPY --from=builder /app/services/shared-sdk/package.json ./services/shared-sdk/
COPY --from=builder /app/services/inventory-agent/dist/ ./services/inventory-agent/dist/
COPY --from=builder /app/services/inventory-agent/package.json ./services/inventory-agent/
COPY --from=builder /app/node_modules/ ./node_modules/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8082

# Expose port
EXPOSE 8082

# Run the application
CMD ["services/inventory-agent/dist/index.js"]
