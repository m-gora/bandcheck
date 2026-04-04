# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Build arguments (declare early for better caching)
ARG VITE_API_BASE_URL
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_AUDIENCE
ARG VITE_TURNSTILE_KEY

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN
ENV VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID
ENV VITE_AUTH0_AUDIENCE=$VITE_AUTH0_AUDIENCE
ENV VITE_TURNSTILE_KEY=$VITE_TURNSTILE_KEY

# Copy package files first (better layer caching)
COPY package.json bun.lock* ./

# Install dependencies (this layer is cached unless package files change)
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM nginx:1.29-alpine

# Update Alpine packages to fix known OS CVEs
RUN apk upgrade --no-cache

# Create a non-root user/group with UID/GID > 10000
RUN addgroup -g 10001 app \
    && adduser -u 10001 -G app -S -D -H app

# Copy custom nginx configs
COPY k8s/nginx-main.conf /etc/nginx/nginx.conf
COPY k8s/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage and set ownership
COPY --from=builder /app/dist /usr/share/nginx/html
RUN chown -R 10001:10001 /usr/share/nginx/html

USER 10001

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
