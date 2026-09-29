FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS migrate
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends dumb-init \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app /app
USER node
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "migration:run"]

FROM node:24-bookworm-slim AS app
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends dumb-init \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 5000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main.js"]
