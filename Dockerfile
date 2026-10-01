FROM node:24-trixie-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run build

FROM node:24-trixie-slim AS production-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:24-trixie-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends dumb-init \
    && rm -rf /var/lib/apt/lists/*
COPY --from=production-deps /app/node_modules ./node_modules
COPY package.json ./
COPY --from=builder /app/dist ./dist
USER node
ENTRYPOINT ["dumb-init", "--"]

# Run compiled migrations with production dependencies, without build tools.
FROM runtime AS migrate
CMD ["node", "node_modules/typeorm/cli.js", "migration:run", "-d", "dist/config/typeorm.config.js"]

FROM runtime AS app
EXPOSE 5000
CMD ["node", "dist/src/main.js"]
