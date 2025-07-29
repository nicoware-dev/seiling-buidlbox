#!/bin/bash
# scripts/bootstrap/fix_services.sh
set -e

# Load shared configuration and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared_config.sh"

# Get compose files being used
COMPOSE_FILES=()
if [ -f "docker-compose.yml" ]; then
    COMPOSE_FILES+=("-f" "docker-compose.yml")
fi

# Add service compose files
SERVICES_DIR="docker/services"
if [ -d "$SERVICES_DIR" ]; then
    for service_file in "$SERVICES_DIR"/*.yml; do
        if [ -f "$service_file" ]; then
            COMPOSE_FILES+=("-f" "$service_file")
        fi
    done
fi

print_status "Fixing service issues..."

print_warning "This will reset PostgreSQL data and restart all services"
read -p "Continue? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    print_status "Cancelled"
    exit 0
fi

# Stop all services
print_status "Stopping all services..."
docker compose "${COMPOSE_FILES[@]}" down

# Remove PostgreSQL volume to reset database
print_status "Removing PostgreSQL volume to reset database..."
docker volume rm seiling_postgres_data 2>/dev/null || true

# Remove sei-mcp-server volume if it exists
print_status "Removing Sei MCP server volume..."
docker volume rm seiling_sei_mcp_storage 2>/dev/null || true

# Clean up any orphaned containers
print_status "Cleaning up orphaned containers..."
docker container prune -f

# Start PostgreSQL first and wait for it to be ready
print_status "Starting PostgreSQL service..."
docker compose "${COMPOSE_FILES[@]}" up -d postgres

print_status "Waiting for PostgreSQL to be ready..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker compose "${COMPOSE_FILES[@]}" exec postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_status "PostgreSQL is ready!"
        break
    fi
    sleep 2
    counter=$((counter + 2))
    echo -n "."
done
echo

if [ $counter -ge $timeout ]; then
    print_error "PostgreSQL failed to start within $timeout seconds"
    exit 1
fi

# Start remaining services
print_status "Starting all services..."
docker compose "${COMPOSE_FILES[@]}" up -d

print_status "Waiting for services to start..."
sleep 10

# Check service status
print_status "Service status:"
docker compose "${COMPOSE_FILES[@]}" ps

print_status "Checking service logs for errors..."
print_warning "Sei MCP Server logs:"
docker compose "${COMPOSE_FILES[@]}" logs --tail=5 sei-mcp-server

print_warning "n8n logs:"
docker compose "${COMPOSE_FILES[@]}" logs --tail=5 n8n

print_status "Fix complete! Services should now be running properly."
print_status "You can monitor logs with: docker compose logs -f" 