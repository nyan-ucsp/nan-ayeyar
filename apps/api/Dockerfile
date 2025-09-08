# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
# OS deps for sharp and prisma
RUN apk add --no-cache libc6-compat python3 make g++ vips-dev openssl openssl-dev
COPY package.json package-lock.json* ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm npm ci || npm install

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Create storage directory
RUN mkdir -p storage

EXPOSE 3001
CMD ["node", "dist/index.js"]
