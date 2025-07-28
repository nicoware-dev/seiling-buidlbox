#!/bin/bash
# scripts/bootstrap/troubleshoot.sh
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}
print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔧 Seiling Buidlbox Troubleshooting Script"
echo "=========================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    print_error ".env file not found. Run './bootstrap.sh' first."
    exit 1
fi

# Load .env
set -a; source ".env"; set +a

print_status "Checking system status..."

# Load shared configuration for enhanced Docker validation
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/shared_config.sh" ]; then
    source "$SCRIPT_DIR/shared_config.sh"
    
    # Use enhanced Docker validation
    print_status "Validating Docker environment..."
    if ! validate_docker_environment; then
        print_error "Docker environment validation failed. Please check Docker installation."
        exit 1
    fi
else
    # Fallback to basic Docker checks
    if ! command -v docker >/dev/null 2>&1; then
        print_error "Docker not found. Please install Docker first."
        exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon not running. Please start Docker."
        exit 1
    fi

    print_status "✓ Docker is running"

    # Check Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose not found. Please install Docker Compose."
        exit 1
    fi

    print_status "✓ Docker Compose is available"
fi

# Check containers
print_status "Checking container status..."
echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=seiling-"
echo ""

# Check for failed containers
failed_containers=$(docker ps -a --filter "name=seiling-" --filter "status=exited" --format "{{.Names}}")
if [ -n "$failed_containers" ]; then
    print_warning "Found failed containers: $failed_containers"
    
    for container in $failed_containers; do
        echo "--- Logs for $container ---"
        docker logs --tail=10 "$container"
        echo ""
    done
fi

# Check service health using dedicated health check script
print_status "Checking service health..."
bash "scripts/bootstrap/health_check.sh" quick

echo ""
print_status "Diagnostic complete. Choose an action:"

echo "1. View detailed logs"
echo "2. Restart all services"
echo "3. Restart specific service"
echo "4. Reset database"
echo "5. Fix common issues"
echo "6. Exit"

read -p "Select option (1-6): " choice

case $choice in
    1)
        echo "Available services:"
        echo "- seiling-openwebui"
        echo "- seiling-n8n"
        echo "- seiling-flowise"
        echo "- seiling-sei-mcp-server"
        echo "- seiling-postgres"
        echo "- seiling-redis"
        read -p "Enter service name: " service
        docker logs --tail=50 "$service"
        ;;
    2)
        print_status "Restarting all services..."
        docker compose down
        sleep 5
        docker compose up -d
        print_status "Services restarted. Wait 30 seconds and check status."
        ;;
    3)
        read -p "Enter service name (e.g., openwebui, n8n, flowise): " service
        container_name="seiling-$service"
        print_status "Restarting $container_name..."
        docker restart "$container_name"
        print_status "Service restarted."
        ;;
    4)
        print_warning "This will delete all database data. Are you sure? [y/N]"
        read -p "Confirm: " confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            print_status "Resetting database..."
            docker compose down
            docker volume rm seiling-buidlbox_postgres_data 2>/dev/null || true
            docker compose up -d postgres
            sleep 10
            docker compose up -d
            print_status "Database reset complete."
        fi
        ;;
    5)
        print_status "Applying common fixes..."
        
        # Fix line endings if on Windows
        if command -v dos2unix >/dev/null 2>&1; then
            dos2unix .env 2>/dev/null || true
            dos2unix scripts/bootstrap/*.sh 2>/dev/null || true
            print_status "✓ Fixed line endings"
        fi
        
        # Fix permissions
        chmod +x bootstrap.sh 2>/dev/null || true
        chmod +x scripts/bootstrap/*.sh 2>/dev/null || true
        print_status "✓ Fixed permissions"
        
        # Pull latest images
        print_status "Pulling latest images..."
        docker compose pull
        
        # Restart services
        print_status "Restarting services..."
        docker compose down
        docker compose up -d
        
        print_status "Common fixes applied."
        ;;
    6)
        print_status "Exiting."
        exit 0
        ;;
    *)
        print_warning "Invalid option."
        ;;
esac 