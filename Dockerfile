# syntax=docker/dockerfile:1

############################
# 1. Base image
############################
FROM node:22-alpine AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1


############################
# 2. Install dependencies
############################
FROM base AS deps

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./

RUN npm ci


############################
# 3. Build application
############################
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


############################
# 4. Production runtime
############################
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# copy required files
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node_modules/.bin/next", "start"]
