#!/bin/bash
# scripts/bootstrap/deploy_services.sh
# Remove set -e to handle Docker Compose warnings gracefully
# set -e

# Source shared env file for OS/PKG_MANAGER
envfile="/tmp/seiling_bootstrap_env"
if [ -f "$envfile" ]; then
  source "$envfile"
fi

# Load bootstrap configuration if available
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/shared_config.sh" ]; then
    source "$SCRIPT_DIR/shared_config.sh"
    # Load any existing bootstrap config
    load_bootstrap_config || true
fi

# Debug: Show current AUTO_MODE value
echo "DEBUG: AUTO_MODE='$AUTO_MODE'"

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

# Check for Windows line endings in ENV_PATH and convert if needed
if grep -q $'\r' ".env"; then
  print_warning ".env contains Windows (CRLF) line endings. Attempting to convert to Unix (LF) line endings."
  if command -v dos2unix >/dev/null 2>&1; then
    dos2unix ".env"
    print_status ".env converted to Unix (LF) line endings using dos2unix."
  else
    sed -i 's/\r$//' ".env"
    print_status ".env converted to Unix (LF) line endings using sed."
  fi
fi

# Print contents of .env for debugging
print_status "Contents of .env before sourcing:"
cat ".env"

if [ ! -s ".env" ]; then
  print_error ".env is missing or empty. Aborting."
  exit 1
fi

# Load .env
set -a; source ".env"; set +a

# Load shared configuration for Docker validation
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/shared_config.sh" ]; then
    source "$SCRIPT_DIR/shared_config.sh"
    
    # Validate Docker environment before deployment
    print_status "Validating Docker environment..."
    if ! validate_docker_environment; then
        print_error "Docker environment validation failed. Cannot deploy services."
        exit 1
    fi
fi

# Print values of ENABLE_ELIZA and ENABLE_CAMBRIAN for debugging
print_status "After sourcing: ENABLE_ELIZA='$ENABLE_ELIZA', ENABLE_CAMBRIAN='$ENABLE_CAMBRIAN'"

DOCKER_DIR="docker"
SERVICES_DIR="$DOCKER_DIR/services"
COMPOSE_FILE="docker-compose.yml"

# Function to map ENABLE_* variable to actual compose file base name (compatible with older bash)
get_service_file_base() {
  local service="$1"
  case "$service" in
    TRAEFIK) echo "traefik" ;;
    OLLAMA) echo "ollama" ;;
    N8N) echo "n8n" ;;
    OPENWEBUI) echo "openwebui" ;;
    FLOWISE) echo "flowise" ;;
    SEI_MCP) echo "sei-mcp-server" ;;
    ELIZA) echo "eliza" ;;
    CAMBRIAN) echo "cambrian" ;;
    POSTGRES) echo "postgres" ;;
    REDIS) echo "redis" ;;
    QDRANT) echo "qdrant" ;;
    NEO4J) echo "neo4j" ;;
    *) echo "" ;;
  esac
}

SERVICES=(
  TRAEFIK
  OLLAMA
  N8N
  OPENWEBUI
  FLOWISE
  SEI_MCP
  ELIZA
  CAMBRIAN
  POSTGRES
  REDIS
  QDRANT
  NEO4J
)

COMPOSE_FILES=("$COMPOSE_FILE")
INCLUDED_SERVICE_FILES=()
for svc in "${SERVICES[@]}"; do
  enable_var="ENABLE_${svc}"
  enable_val="${!enable_var}"
  print_status "DEBUG: $enable_var = '$enable_val'"
  if [[ "$enable_val" =~ ^(yes|y|true|1)$ ]]; then
    file_base="$(get_service_file_base "$svc")"
    svc_file="$SERVICES_DIR/docker-compose.$file_base.yml"
    if [ -f "$svc_file" ]; then
      COMPOSE_FILES+=("$svc_file")
      INCLUDED_SERVICE_FILES+=("$svc_file")
    else
      print_warning "Compose file for $svc not found: $svc_file"
    fi
  fi
done

# Debug: print included compose files
print_status "Including the following compose files:"
for f in "${COMPOSE_FILES[@]}"; do
  echo "  $f"
done

if [ ${#INCLUDED_SERVICE_FILES[@]} -eq 0 ]; then
  print_error "No enabled service compose files found. Please check your .env and docker/services folder. Exiting."
  exit 1
fi

# Get the correct Docker Compose command
DOCKER_COMPOSE_BASE=""
if command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE_BASE="docker-compose"
elif docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_BASE="docker compose"
else
    print_error "Neither docker-compose nor 'docker compose' plugin found"
    exit 1
fi

# Compose up command
print_status "Starting services with Docker Compose ($DOCKER_COMPOSE_BASE)..."
if [ "$AUTO_MODE" != "true" ]; then
  print_status "Note: First run may take several minutes to download Docker images"
fi
COMPOSE_CMD="$DOCKER_COMPOSE_BASE"
for f in "${COMPOSE_FILES[@]}"; do
  COMPOSE_CMD+=" -f $f"
done
COMPOSE_CMD+=" up -d --remove-orphans"

# Compose down/logs commands for menu
COMPOSE_DOWN_CMD="$DOCKER_COMPOSE_BASE"
COMPOSE_LOGS_CMD="$DOCKER_COMPOSE_BASE"
for f in "${COMPOSE_FILES[@]}"; do
  COMPOSE_DOWN_CMD+=" -f $f"
  COMPOSE_LOGS_CMD+=" -f $f"
done
COMPOSE_DOWN_CMD+=" down"
COMPOSE_LOGS_CMD+=" logs --tail=20"

# Check if services are already running
if docker compose ps | grep -q 'Up'; then
  print_status "Some services are already running."
  if [ "$AUTO_MODE" = "true" ]; then
    print_status "Auto mode: Restarting services automatically."
    eval $COMPOSE_DOWN_CMD 2>&1
    sleep 5
    print_status "Starting services..."
    eval $COMPOSE_CMD 2>&1
    COMPOSE_EXIT=$?
    # Wait longer for services to start in auto mode
    print_status "Waiting for services to initialize..."
    sleep 30
    # Check if any containers exist (more robust detection)
    container_count=$(docker compose ps -q | wc -l)
    print_status "DEBUG: Found $container_count containers after deployment"
    if [ "$container_count" -eq 0 ]; then
      print_error "No containers were created. Check logs above."
      exit 1
    fi
    print_status "Services started successfully ($container_count containers running)."
  else
    read -p "Do you want to restart services? [y/N]: " restart_services
    if [[ "$restart_services" =~ ^[Yy]$ ]]; then
      print_status "Restarting services..."
      eval $COMPOSE_DOWN_CMD 2>&1
      sleep 5
      print_status "Starting services..."
      eval $COMPOSE_CMD 2>&1
      # Check if any containers are running
      container_count=$(docker compose ps -q | wc -l)
      print_status "DEBUG: Found $container_count containers after restart"
      if [ "$container_count" -eq 0 ]; then
        print_error "No containers were created. Check logs above."
        exit 1
      fi
      print_status "Services started successfully ($container_count containers running)."
    fi
  fi
else
  print_status "No services running. Starting all services..."
  eval $COMPOSE_CMD 2>&1
  COMPOSE_EXIT=$?
  sleep 20
  # Check if services started successfully
  container_count=$(docker compose ps -q | wc -l)
  print_status "DEBUG: Found $container_count containers after fresh start"
  if [ "$container_count" -eq 0 ]; then
    print_error "No containers were created. Check logs above."
    exit 1
  fi
  print_status "Services started successfully ($container_count containers running)."
fi

# Print access info
print_status "Access URLs:"
echo "  OpenWebUI: http://${BASE_DOMAIN_NAME:-localhost}:${OPENWEBUI_PORT:-5002}"
echo "  n8n: http://${BASE_DOMAIN_NAME:-localhost}:${N8N_PORT:-5001}"
echo "  Flowise: http://${BASE_DOMAIN_NAME:-localhost}:${FLOWISE_PORT:-5003}"
echo "  Ollama: http://${BASE_DOMAIN_NAME:-localhost}:${OLLAMA_PORT:-11434}"
echo "  Sei MCP: http://${BASE_DOMAIN_NAME:-localhost}:${MCP_SERVER_PORT:-5004}"
echo "  Eliza: http://${BASE_DOMAIN_NAME:-localhost}:${ELIZA_PORT:-5005}"
echo "  Cambrian: http://${BASE_DOMAIN_NAME:-localhost}:${CAMBRIAN_AGENT_PORT:-5006}"
echo "  PostgreSQL: ${BASE_DOMAIN_NAME:-localhost}:${POSTGRES_PORT:-5432}"
echo "  Redis: ${BASE_DOMAIN_NAME:-localhost}:${REDIS_PORT:-6379}"
echo "  Qdrant: http://${BASE_DOMAIN_NAME:-localhost}:${QDRANT_PORT:-6333}"
echo "  Neo4j: http://${BASE_DOMAIN_NAME:-localhost}:${NEO4J_HTTP_PORT:-7474}"

print_status "Default Credentials:"
echo "  Flowise: admin / $FLOWISE_PASSWORD"
echo "  PostgreSQL: postgres / $POSTGRES_PASSWORD"
echo "  Neo4j: neo4j / seiling123"
echo "  Redis: (password: seiling123)"

deploy_menu() {
  while true; do
    echo -e "\n${GREEN}Service Management Menu${NC}"
    echo "1. Start Services"
    echo "2. Stop Services"
    echo "3. Check Health"
    echo "4. Show Logs"
    echo "5. Troubleshoot Issues"
    echo "6. Exit"
    read -p "Select option (1-6): " choice
    case $choice in
      1)
        eval $COMPOSE_CMD
        print_status "Services started."
        ;;
      2)
        eval $COMPOSE_DOWN_CMD
        print_status "Services stopped."
        ;;
      3)
        bash "scripts/bootstrap/health_check.sh" quick
        ;;
      4)
        eval $COMPOSE_LOGS_CMD
        ;;
      5)
        print_status "Running troubleshooting script..."
        bash "scripts/bootstrap/troubleshoot.sh"
        ;;
      6)
        print_status "Exiting."
        break
        ;;
      *)
        print_warning "Invalid option."
        ;;
    esac
  done
}

# Only show interactive menu if not in auto mode
if [ "$AUTO_MODE" != "true" ]; then
  deploy_menu
fi

# Clean up shared env file
if [ -f "$envfile" ]; then
  rm -f "$envfile"
fi

exit 0
