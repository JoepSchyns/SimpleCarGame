# Multi-stage build for SimpleCarGame
FROM node:18-alpine AS node-base

# Install dependencies for the socket server
WORKDIR /app/socket
COPY scg/js/socket/package*.json ./
RUN npm install express socket.io

# Main image with PHP and Node.js
FROM php:8.1-cli-alpine3.18

# Install Node.js in the PHP image
COPY --from=node:18-alpine /usr/lib /usr/lib
COPY --from=node:18-alpine /usr/local/lib /usr/local/lib
COPY --from=node:18-alpine /usr/local/include /usr/local/include
COPY --from=node:18-alpine /usr/local/bin /usr/local/bin

# Install supervisor to run multiple processes
RUN apk add --no-cache supervisor

# Set working directory
WORKDIR /app

# Copy the game files
COPY scg/ /app/scg/

# Copy node_modules for socket server
COPY --from=node-base /app/socket/node_modules /app/scg/js/socket/node_modules

# Set proper working directory for Node.js
ENV NODE_PATH=/app/scg/js/socket/node_modules

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisord.conf
RUN mkdir -p /var/log/supervisor

# Expose ports
EXPOSE 8080 8000

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
