# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy sources
COPY . .

# Build
RUN npm run build

# ---- Runtime stage ----
FROM nginx:alpine AS runner

# Copy build output to nginx html dir
COPY --from=builder /app/dist /usr/share/nginx/html
# Ensure public assets like icon.png/logo.png are present
COPY --from=builder /app/public /usr/share/nginx/html

# Basic nginx config: serve SPA fallback
RUN printf '\
server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


