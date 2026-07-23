# ===== Stage 1: Builder =====
FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy đúng package và lockfile
COPY package.json yarn.lock ./

# Cài toàn bộ dependencies
RUN yarn install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN yarn build

# ===== Stage 2: Runtime =====
FROM node:20-alpine

WORKDIR /app

# Copy package và lockfile
COPY package.json yarn.lock ./

# Chỉ cài production dependencies
RUN yarn install --production --frozen-lockfile

# Copy file build
COPY --from=builder /app/dist ./dist

# Nếu dùng ConfigModule.forRoot() đọc .env trong container thì giữ dòng này
COPY --from=builder /app/.env ./

EXPOSE 8000

CMD ["yarn", "start:prod"]