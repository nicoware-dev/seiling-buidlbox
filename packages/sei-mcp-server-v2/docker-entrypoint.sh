#!/bin/sh
# docker-entrypoint.sh for Sei MCP Server

set -e

# Check if service is enabled
if [ "$ENABLE_SEI_MCP" != "yes" ] && [ "$ENABLE_SEI_MCP" != "true" ]; then
    echo "Sei MCP Server disabled by ENABLE_SEI_MCP=$ENABLE_SEI_MCP"
    sleep infinity
fi

echo "Starting Sei MCP Server..."
echo "Working directory: $(pwd)"
echo "Available files:"
ls -la /app/

# Check for built files and start appropriately
if [ -f "/app/build/http-server.js" ]; then
    echo "Found built HTTP server, starting in HTTP mode..."
    echo "File details:"
    ls -la /app/build/http-server.js
    exec node build/http-server.js
elif [ -f "/app/build/index.js" ]; then
    echo "Found built index, starting in STDIO mode..."
    echo "File details:"
    ls -la /app/build/index.js
    exec node build/index.js
else
    echo "ERROR: No built files found in /app/build/"
    echo "Contents of /app/build/:"
    ls -la /app/build/ || echo "build directory does not exist"
    echo "Contents of /app/:"
    ls -la /app/
    exit 1
fi 