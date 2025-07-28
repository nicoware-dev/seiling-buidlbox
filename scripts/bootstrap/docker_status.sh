#!/bin/bash
# scripts/bootstrap/docker_status.sh
# Show current Docker status for Seiling Buidlbox services

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}🐳 Seiling Buidlbox Docker Status${NC}"
    echo "================================="
}

print_section() {
    echo -e "\n${YELLOW}$1${NC}"
    echo "$(printf '%*s' ${#1} '' | tr ' ' '-')"
}

print_header

# Show running containers
print_section "Running Containers"
running_containers=$(docker ps --filter "name=seiling-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | tail -n +2)
if [ -z "$running_containers" ]; then
    echo "No Seiling containers running"
else
    echo "Name                    Status              Ports"
    echo "----                    ------              -----"
    echo "$running_containers"
fi

# Show all containers (including stopped)
print_section "All Seiling Containers"
all_containers=$(docker ps -a --filter "name=seiling-" --format "table {{.Names}}\t{{.Status}}" | tail -n +2)
if [ -z "$all_containers" ]; then
    echo "No Seiling containers found"
else
    echo "Name                    Status"
    echo "----                    ------"
    echo "$all_containers"
fi

# Show volumes
print_section "Seiling Volumes"
volumes=$(docker volume ls --filter "name=seiling-buidlbox" --format "table {{.Name}}\t{{.Driver}}" | tail -n +2)
if [ -z "$volumes" ]; then
    echo "No Seiling volumes found"
else
    echo "$volumes"
fi

# Show networks
print_section "Seiling Networks"
networks=$(docker network ls --filter "name=seiling" --format "table {{.Name}}\t{{.Driver}}" | tail -n +2)
if [ -z "$networks" ]; then
    echo "No Seiling networks found"
else
    echo "$networks"
fi

# Show any orphaned containers
print_section "Potential Issues"
orphaned=$(docker ps -a --filter "label=com.docker.compose.project=seiling-buidlbox" --filter "status=exited" --format "{{.Names}}" | grep -v "seiling-" || true)
if [ -n "$orphaned" ]; then
    echo -e "${RED}Orphaned containers found:${NC}"
    echo "$orphaned"
    echo -e "${YELLOW}Run: bash scripts/bootstrap/cleanup_docker.sh${NC}"
else
    echo -e "${GREEN}No orphaned containers detected${NC}"
fi

# Check for containers with weird names
weird_names=$(docker ps -a --filter "name=seiling-" --format "{{.Names}}" | grep -E "^[a-f0-9]+_seiling-" || true)
if [ -n "$weird_names" ]; then
    echo -e "${RED}Containers with prefixed names detected:${NC}"
    echo "$weird_names"
    echo -e "${YELLOW}This indicates naming conflicts. Run cleanup and redeploy.${NC}"
else
    echo -e "${GREEN}All container names are clean${NC}"
fi

echo "" 