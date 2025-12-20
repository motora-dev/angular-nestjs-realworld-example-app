FROM node:24.11.0-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.19.0

# Copy package.json and other configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/client/package.json ./apps/client/
COPY packages/error-code/package.json ./packages/error-code/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/markdown/package.json ./packages/markdown/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build only the client
ARG BUILD_CONFIGURATION=production
ENV BUILD_CONFIGURATION=${BUILD_CONFIGURATION}
RUN echo "BUILD_CONFIGURATION=$BUILD_CONFIGURATION"  # デバッグ用
RUN pnpm run build --filter=@monorepo/client

# Production stage
FROM node:24.11.0-slim AS runner

WORKDIR /app

# Copy necessary files from builder stage
COPY --from=builder /app/apps/client/dist/client ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the SSR server
CMD ["node", "server/server.mjs"]

