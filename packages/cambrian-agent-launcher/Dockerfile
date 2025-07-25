# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# If you need private npm, uncomment the next line:
# COPY .npmrc .npmrc
RUN npm ci --prefer-offline --no-audit

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Set a non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app ./

# Set environment variables for Next.js
ENV PORT=3000
EXPOSE 3000

# Allow port override at runtime
CMD ["sh", "-c", "PORT=${PORT} npm run start"]

USER nextjs 