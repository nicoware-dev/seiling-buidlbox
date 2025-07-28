#!/bin/bash
# scripts/bootstrap/cleanup_docker.sh
# Clean up Docker containers, images, and volumes for Seiling Buidlbox

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}🐳 Docker Cleanup for Seiling Buidlbox${NC}"
    echo "======================================"
}

# Parse command line arguments
CLEAN_VOLUMES=false
CLEAN_IMAGES=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --volumes)
            CLEAN_VOLUMES=true
            shift
            ;;
        --images)
            CLEAN_IMAGES=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --volumes    Also remove Docker volumes (DESTRUCTIVE)"
            echo "  --images     Also remove Docker images"
            echo "  --force      Don't ask for confirmation"
            echo "  -h, --help   Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Basic cleanup (containers only)"
            echo "  $0 --volumes          # Cleanup including volumes (DATA LOSS!)"
            echo "  $0 --images --force   # Cleanup images without confirmation"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_header

# Confirmation
if [ "$FORCE" = "false" ]; then
    echo ""
    print_status "This will:"
    echo "  • Stop all Seiling containers"
    echo "  • Remove stopped Seiling containers"
    echo "  • Remove orphaned containers"
    
    if [ "$CLEAN_VOLUMES" = "true" ]; then
        print_warning "  • Remove ALL Seiling volumes (PERMANENT DATA LOSS!)"
    fi
    
    if [ "$CLEAN_IMAGES" = "true" ]; then
        echo "  • Remove Seiling Docker images"
    fi
    
    echo ""
    read -p "Are you sure you want to continue? [y/N]: " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        print_status "Cleanup cancelled."
        exit 0
    fi
fi

print_status "Starting Docker cleanup..."

# Stop all Seiling containers
print_status "Stopping Seiling containers..."
docker ps -a --filter "name=seiling-" -q | xargs -r docker stop

# Remove all Seiling containers
print_status "Removing Seiling containers..."
docker ps -a --filter "name=seiling-" -q | xargs -r docker rm

# Remove orphaned containers with project label
print_status "Removing orphaned containers..."
docker container prune -f --filter "label=com.docker.compose.project=seiling-buidlbox" || true

# Clean up volumes if requested
if [ "$CLEAN_VOLUMES" = "true" ]; then
    print_warning "Removing Seiling volumes (DATA WILL BE LOST)..."
    docker volume ls -q --filter "name=seiling-buidlbox_" | xargs -r docker volume rm
fi

# Clean up images if requested
if [ "$CLEAN_IMAGES" = "true" ]; then
    print_status "Removing Seiling Docker images..."
    
    # Remove images by repository pattern
    docker images --filter "reference=0xn1c0/*" -q | xargs -r docker rmi -f || true
    docker images --filter "reference=flowiseai/flowise" -q | xargs -r docker rmi -f || true
    docker images --filter "reference=n8nio/n8n" -q | xargs -r docker rmi -f || true
    docker images --filter "reference=ghcr.io/open-webui/open-webui" -q | xargs -r docker rmi -f || true
    docker images --filter "reference=ollama/ollama" -q | xargs -r docker rmi -f || true
    docker images --filter "reference=postgres:16-alpine" -q | xargs -r docker rmi -f || true
    docker images --filter "reference=redis:7-alpine" -q | xargs -r docker rmi -f || true
    docker images --filter "reference=qdrant/qdrant" -q | xargs -r docker rmi -f || true
    docker images --filter "reference=neo4j:5.15-community" -q | xargs -r docker rmi -f || true
    docker images --filter "reference=traefik:v3.0" -q | xargs -r docker rmi -f || true
fi

# General Docker cleanup
print_status "Running general Docker cleanup..."
docker system prune -f

# Show final status
print_status "Cleanup completed!"
echo ""
print_status "Current Docker status:"
echo "  Containers: $(docker ps -a | wc -l) total, $(docker ps | wc -l) running"
echo "  Images: $(docker images | wc -l) total"
echo "  Volumes: $(docker volume ls | wc -l) total"

if [ "$CLEAN_VOLUMES" = "true" ]; then
    echo ""
    print_warning "Volumes were removed - you'll need to reconfigure services on next startup"
fi

echo ""
print_status "Ready for fresh deployment! Run: ./bootstrap.sh" 