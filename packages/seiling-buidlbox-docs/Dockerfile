FROM node:18-alpine

# Install GitBook CLI globally
RUN npm install -g gitbook-cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy documentation source
COPY . .

# Install GitBook plugins
RUN gitbook install

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000 || exit 1

# Start GitBook server
CMD ["gitbook", "serve", "--port", "4000", "--host", "0.0.0.0"] 