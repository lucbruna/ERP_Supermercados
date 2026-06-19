FROM node:20-alpine AS builder
WORKDIR /app
COPY packages/backend/rh-service/package*.json ./
RUN npm ci
COPY packages/backend/rh-service/ .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 3002
CMD ["node", "dist/main"]
