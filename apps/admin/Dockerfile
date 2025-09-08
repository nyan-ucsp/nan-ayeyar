# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
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
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY package.json ./
EXPOSE 3002
CMD ["npm", "start"]