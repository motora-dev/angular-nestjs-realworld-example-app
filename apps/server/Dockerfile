FROM node:24.11.0-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.19.0

# Install required system dependencies
RUN apt-get update && \
    apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and other configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/error-code/package.json ./packages/error-code/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/markdown/package.json ./packages/markdown/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/database/package.json ./packages/database/package.json
COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/prisma.config.ts ./packages/database/prisma.config.ts

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build only the server
RUN pnpm run build --filter=@monorepo/server

# Production stage
FROM node:24.11.0-slim AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.19.0

# Install required system dependencies for production
RUN apt-get update && \
    apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json files for pnpm install (production dependencies only)
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/server/package.json ./apps/server/
COPY --from=builder /app/packages/error-code/package.json ./packages/error-code/
COPY --from=builder /app/packages/database/package.json ./packages/database/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy dist from builder
COPY --from=builder /app/apps/server/dist ./apps/server/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Set working directory to server
WORKDIR /app/apps/server

# Start the server
CMD ["node", "dist/main.js"]
