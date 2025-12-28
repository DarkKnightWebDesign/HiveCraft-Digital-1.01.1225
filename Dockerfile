# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build client (React/Vite) and server
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start server (the built server is in dist/index.js)
CMD ["node", "dist/index.js"]
