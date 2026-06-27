# syntax=docker/dockerfile:1

############################
# Base image
############################
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install minimal system deps
RUN apk add --no-cache libc6-compat

############################
# Install dependencies
############################
COPY package.json package-lock.json* ./

RUN npm ci

############################
# Copy application
############################
COPY . .

############################
# Create non-root user
############################
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

USER nodeuser

EXPOSE 3000

CMD ["node", "server.js"]
