# Multi-stage build for DARCI on Fly.io
FROM node:16-alpine AS dcli-downloader

ARG DCLI_VERSION=0.99.9
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

# Copy all source files
COPY . /app/

# Install server dependencies
WORKDIR /app/server
RUN npm install --omit=dev

# Install client dependencies and build
WORKDIR /app/client-web
RUN ls -la && cat package.json && npm install && npm run build

# Production stage
FROM node:16-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache unzip curl
RUN apk add --no-cache sqlite

# Install Supercronic
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.29/supercronic-linux-amd64 \
    SUPERCRONIC=supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=cd48d45c4b10f3f0bfdd3a57d054cd05ac96812b

RUN curl -fsSLO "$SUPERCRONIC_URL" \
 && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
 && chmod +x "${SUPERCRONIC}" \
 && mv "${SUPERCRONIC}" "/usr/local/bin/${SUPERCRONIC}" \
 && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic

# Copy dcli tools from downloader stage
COPY --from=dcli-downloader /usr/local/bin/dcli* /usr/local/bin/

# Create app directory
WORKDIR /app

# Copy server files and dependencies
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY shared/ ./shared/

# Copy shared module into server's node_modules
RUN rm -f /app/server/node_modules/shared && cp -r /app/shared /app/server/node_modules/

# Copy built client files
COPY --from=builder /app/client-web/build ./client-web/build

# Copy docker entrypoint and crontab
COPY docker/docker-entrypoint.sh ./docker-entrypoint.sh
COPY docker/cron-entrypoint.sh ./docker-cron-entrypoint.sh
COPY crontab /app/crontab
RUN chmod +x ./docker-entrypoint.sh ./docker-cron-entrypoint.sh

# Expose port
EXPOSE 8080

# Start the application
ENTRYPOINT ["/app/docker-entrypoint.sh"]
