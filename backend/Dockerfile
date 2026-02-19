# ─────────────────────────────────────────────
#  Agent-CRM  — Backend Dockerfile
#  Base: Node 20 LTS (Alpine for small image)
# ─────────────────────────────────────────────

FROM node:20-alpine AS base

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# ─── Dependencies ────────────────────────────
FROM base AS deps

# Copy only package files first (layer caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# ─── Production Image ─────────────────────────
FROM base AS production

ENV NODE_ENV=production
ENV PORT=5000

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodeuser -u 1001

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=nodeuser:nodejs . .

# Create uploads directory and assign permissions
RUN mkdir -p uploads && chown -R nodeuser:nodejs uploads

# Switch to non-root user
USER nodeuser

# Expose backend port
EXPOSE 5000

# Use dumb-init as PID 1 to handle signals correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
