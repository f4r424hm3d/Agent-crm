# ─────────────────────────────────────────────
#  Agent-CRM  — Frontend Dockerfile (multi-stage)
#  Stage 1: Build React/Vite app
#  Stage 2: Serve with Nginx (tiny final image)
# ─────────────────────────────────────────────

# ─── Stage 1: Build ──────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy all source files
COPY . .

# Build production bundle
RUN npm run build

# ─── Stage 2: Serve ──────────────────────────
FROM nginx:stable-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config for the frontend SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
