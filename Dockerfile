# Multi-stage build for SimpleCarGame
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY scg/package*.json ./
RUN npm ci

# Copy frontend source
COPY scg/ ./

# Build frontend with Vite
RUN npm run build

# Stage 2: Backend server
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY server/package*.json ./
RUN npm ci --only=production

# Stage 3: Production image
FROM node:18-alpine

# Install supervisor to run multiple processes
RUN apk add --no-cache supervisor

WORKDIR /app

# Copy backend files and dependencies
COPY --from=backend-builder /app/backend/node_modules ./server/node_modules
COPY server/ ./server/

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./public

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisord.conf
RUN mkdir -p /var/log/supervisor

# Environment
ENV NODE_ENV=production
ENV PORT=8000

# Expose ports
EXPOSE 8000

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
