FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Use PostgreSQL schema for production builds
RUN if [ -f prisma/schema.postgres.prisma ]; then \
      cp prisma/schema.postgres.prisma prisma/schema.prisma; \
      rm -rf prisma/migrations; \
      mkdir -p prisma/migrations; \
    fi

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application (standalone mode)
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install OpenSSL and Prisma CLI for migrations
RUN apk add --no-cache openssl openssl-dev
RUN npm install -g prisma@5.19.1

# Copy necessary files from builder
# Note: Next.js standalone mode includes minimal node_modules in .next/standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN mkdir -p ./prisma
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma
RUN if [ -f /app/prisma/schema.postgres.prisma ]; then cp /app/prisma/schema.postgres.prisma ./prisma/schema.postgres.prisma; fi
COPY --from=builder /app/package.json ./package.json
RUN mkdir -p ./prisma/migrations

# Ensure Prisma is available (standalone mode may not include it)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

EXPOSE 3003

ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

# Run migrations and start server
# Note: Running migrations before starting ensures DB is ready
# If migrations don't exist, create them first
CMD ["sh", "-c", "if [ ! -f prisma/migrations/migration_lock.toml ]; then npx prisma migrate dev --name init --create-only && npx prisma migrate deploy; else npx prisma migrate deploy; fi && node server.js"]
