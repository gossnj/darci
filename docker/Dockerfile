# Multi-stage build for DARCI on Fly.io
FROM node:16-alpine AS dcli-downloader

ARG DCLI_VERSION=0.9.0
ARG PLATFORM=x86_64-unknown-linux-musl

# Download and extract dcli tools
ADD https://github.com/mikechambers/dcli/releases/download/v${DCLI_VERSION}/dcli_${PLATFORM}_v${DCLI_VERSION}.zip /tmp/dcli.zip

RUN apk add --no-cache unzip && \
    unzip /tmp/dcli.zip -d /usr/local/bin && \
    rm /tmp/dcli.zip && \
    chmod +x /usr/local/bin/dcli*

# Build stage for dependencies
FROM node:16-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json ./
COPY server/package.json ./server/
COPY client-web/package.json ./client-web/
COPY shared/package.json ./shared/

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Install client dependencies and build
WORKDIR /app/client-web
RUN npm ci && npm run build

# Production stage
FROM node:16-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache unzip

# Copy dcli tools from downloader stage
COPY --from=dcli-downloader /usr/local/bin/dcli* /usr/local/bin/

# Create app directory and data directory
WORKDIR /app
RUN mkdir -p /data

# Copy server files and dependencies
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY shared/ ./shared/

# Copy built client files
COPY --from=builder /app/client-web/build ./client-web/build

# Copy docker entrypoint
COPY docker/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Set working directory to server
WORKDIR /app/server

# Expose port
EXPOSE 8080

# Start the application
ENTRYPOINT ["/app/docker-entrypoint.sh"]
