#!/bin/bash
# scripts/bootstrap/health_check.sh
# Standalone health check script for Seiling Buidlbox services

set -e

# Load shared configuration and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared_config.sh"

# Load environment if .env exists
if [ -f ".env" ]; then
  set -a; source ".env"; set +a
fi

# Additional color for compatibility
BLUE='\033[0;34m'

# Function to check individual service health
check_service_health() {
  local service_name=$1
  local container_name="seiling-$service_name"
  local port=$2
  local endpoint=${3:-/}
  local max_retries=${4:-3}
  local retry_count=0
  local service_host="${BASE_DOMAIN_NAME:-localhost}"
  
  # First check if container is running
  if ! docker ps --filter "name=$container_name" --filter "status=running" -q | grep -q .; then
    echo "✗ $service_name: Container not running"
    return 1
  fi
  
  # Simple connectivity check with fallbacks
  while [ $retry_count -lt $max_retries ]; do
    # Try basic HTTP connectivity
    if command -v curl >/dev/null 2>&1; then
      if curl -s --connect-timeout 5 --max-time 10 "http://$service_host:$port$endpoint" >/dev/null 2>&1; then
        echo "✓ $service_name: Healthy (http://$service_host:$port)"
        return 0
      fi
    elif command -v wget >/dev/null 2>&1; then
      if wget -q --timeout=5 --tries=1 -O /dev/null "http://$service_host:$port$endpoint" >/dev/null 2>&1; then
        echo "✓ $service_name: Healthy (http://$service_host:$port)"
        return 0
      fi
    fi
    
    retry_count=$((retry_count + 1))
    if [ $retry_count -lt $max_retries ]; then
      sleep 3
    fi
  done
  
  # If connectivity check failed, check Docker's health status
  container_status=$(docker ps --filter "name=$container_name" --format "{{.Status}}")
  if echo "$container_status" | grep -q "healthy"; then
    echo "✓ $service_name: Docker reports healthy (http://$service_host:$port)"
    return 0
  elif echo "$container_status" | grep -q "health: starting"; then
    echo "⏳ $service_name: Still starting up (this is normal)"
    return 2  # Special return code for "starting"
  else
    echo "⚠ $service_name: May be working but connection check failed"
    return 1
  fi
}

# Function to check database service health
check_database_health() {
  local service_name=$1
  local container_name="seiling-$service_name"
  
  if ! docker ps --filter "name=$container_name" --filter "status=running" -q | grep -q .; then
    echo "✗ $service_name: Container not running"
    return 1
  fi
  
  case $service_name in
    "postgres")
      if docker exec $container_name pg_isready -U postgres >/dev/null 2>&1; then
        echo "✓ postgres: Database ready"
        return 0
      fi
      ;;
    "redis")
      container_status=$(docker ps --filter "name=$container_name" --format "{{.Status}}")
      if echo "$container_status" | grep -q "healthy"; then
        echo "✓ redis: Docker reports healthy"
        return 0
      fi
      ;;
    "neo4j")
      container_status=$(docker ps --filter "name=$container_name" --format "{{.Status}}")
      if echo "$container_status" | grep -q "healthy"; then
        echo "✓ neo4j: Docker reports healthy (http://${BASE_DOMAIN_NAME:-localhost}:${NEO4J_HTTP_PORT:-7474})"
        return 0
      fi
      ;;
  esac
  
  container_status=$(docker ps --filter "name=$container_name" --format "{{.Status}}")
  if echo "$container_status" | grep -q "healthy"; then
    echo "✓ $service_name: Docker reports healthy"
    return 0
  elif echo "$container_status" | grep -q "health: starting"; then
    echo "⏳ $service_name: Still starting up"
    return 2
  else
    echo "⚠ $service_name: Database not ready yet"
    return 1
  fi
}

# Main health check function
run_health_check() {
  local quick_mode=${1:-false}
  local max_retries=3
  
  if [ "$quick_mode" = "true" ]; then
    max_retries=2
  fi
  
  print_status "=== Service Health Check ==="
  
  # Show container status first
  echo ""
  echo "Container Status:"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=seiling-" || true
  echo ""
  
  failed_services=()
  starting_services=()
  
  echo "Service Health:"
  
  # Check HTTP services
  services_to_check=(
    "n8n:${N8N_PORT:-5001}:/"
    "openwebui:${OPENWEBUI_PORT:-5002}:/"
    "flowise:${FLOWISE_PORT:-5003}:/"
    "sei-mcp-server:${MCP_SERVER_PORT:-5004}:/"
    "cambrian-agent:${CAMBRIAN_AGENT_PORT:-5006}:/"
    "qdrant:${QDRANT_PORT:-6333}:/"
    "eliza:${ELIZA_PORT:-5005}:/"
  )
  
  # Only check Ollama if enabled
  if [[ "${ENABLE_OLLAMA:-no}" =~ ^(yes|y|true|1)$ ]]; then
    services_to_check+=("ollama:${OLLAMA_PORT:-11434}:/")
  fi
  
  for service_info in "${services_to_check[@]}"; do
    IFS=':' read -r service_name port endpoint <<< "$service_info"
    if check_service_health "$service_name" "$port" "$endpoint" "$max_retries"; then
      continue  # Service is healthy
    else
      case $? in
        1) failed_services+=("$service_name") ;;
        2) starting_services+=("$service_name") ;;
      esac
    fi
  done
  
  # Check database services
  database_services=("postgres" "redis" "neo4j")
  for db_service in "${database_services[@]}"; do
    # Check if service is enabled (skip if not running)
    if docker ps --filter "name=seiling-$db_service" --filter "status=running" -q | grep -q .; then
      if check_database_health "$db_service"; then
        continue  # Database is healthy
      else
        case $? in
          1) failed_services+=("$db_service") ;;
          2) starting_services+=("$db_service") ;;
        esac
      fi
    fi
  done
  
  echo ""
  
  # Summary
  if [ ${#failed_services[@]} -gt 0 ]; then
    print_warning "Services with issues: ${failed_services[*]}"
    print_warning "Check individual service logs with: docker logs <container-name>"
    print_warning "Example: docker logs seiling-n8n"
  fi
  
  if [ ${#starting_services[@]} -gt 0 ]; then
    print_status "Services still starting: ${starting_services[*]}"
    print_status "These services are normal and should be ready shortly."
  fi
  
  if [ ${#failed_services[@]} -eq 0 ] && [ ${#starting_services[@]} -eq 0 ]; then
    print_status "All services are healthy and running correctly."
  fi
  
  return ${#failed_services[@]}
}

# Command line interface
case "${1:-}" in
  "quick")
    run_health_check true
    ;;
  "full"|"")
    run_health_check false
    ;;
  "help"|"-h"|"--help")
    echo "Usage: $0 [quick|full|help]"
    echo "  quick: Fast health check with fewer retries"
    echo "  full:  Complete health check with full retries (default)"
    echo "  help:  Show this help message"
    ;;
  *)
    print_error "Unknown option: $1"
    echo "Use '$0 help' for usage information"
    exit 1
    ;;
esac 