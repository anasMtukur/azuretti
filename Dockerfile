# 1. DEPENDENCIES
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --prefer-offline --no-audit

# 2. BUILDER
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 5. MIGRATOR (db-init only)
FROM node:20-alpine AS migrator
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY drizzle.config.ts ./
COPY scripts/ ./scripts/ 
COPY src/db/ ./src/db/
CMD ["npm", "run", "db:setup"]

# 3. RUNTIME (PRODUCTION DEFAULT)
# Docker defaults to this stage if no target is specified
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

RUN chown -R nextjs:nextjs /app
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]

# 4. DEVELOPMENT (ONLY CALLED VIA OVERRIDE)
FROM node:20-alpine AS development
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV WATCHPACK_POLLING=true 
CMD ["npm", "run", "dev"]
