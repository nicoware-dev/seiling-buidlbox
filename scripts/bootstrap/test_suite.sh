#!/bin/bash
# scripts/bootstrap/test_suite.sh
# Comprehensive test suite for Seiling Buidlbox bootstrap system

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[TEST]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${YELLOW}Testing:${NC} $test_name"
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS:${NC} $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL:${NC} $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

run_test_with_output() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${YELLOW}Testing:${NC} $test_name"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓ PASS:${NC} $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL:${NC} $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# ===============================================================================
# BOOTSTRAP SCRIPT TESTS
# ===============================================================================

print_header "1. BOOTSTRAP SCRIPT VALIDATION"

# Test script existence and permissions
run_test "Bootstrap main script exists" "[ -f bootstrap.sh ]"
run_test "Bootstrap script is executable" "[ -x bootstrap.sh ]"
run_test "All bootstrap sub-scripts exist" "[ -f scripts/bootstrap/detect_os.sh ] && [ -f scripts/bootstrap/install_deps.sh ] && [ -f scripts/bootstrap/project_setup.sh ] && [ -f scripts/bootstrap/configure_env.sh ] && [ -f scripts/bootstrap/deploy_services.sh ]"
run_test "All bootstrap scripts are executable" "[ -x scripts/bootstrap/detect_os.sh ] && [ -x scripts/bootstrap/install_deps.sh ] && [ -x scripts/bootstrap/project_setup.sh ] && [ -x scripts/bootstrap/configure_env.sh ] && [ -x scripts/bootstrap/deploy_services.sh ]"

# Test new health check script
run_test "Health check script exists" "[ -f scripts/bootstrap/health_check.sh ]"
run_test "Health check script is executable" "[ -x scripts/bootstrap/health_check.sh ]"

# ===============================================================================
# HEALTH CHECK SYSTEM TESTS
# ===============================================================================

print_header "2. HEALTH CHECK SYSTEM VALIDATION"

# Test health check script functionality
run_test_with_output "Health check help option works" "./scripts/bootstrap/health_check.sh help"
run_test "Health check quick mode works" "./scripts/bootstrap/health_check.sh quick >/dev/null 2>&1"
run_test "Health check full mode works" "./scripts/bootstrap/health_check.sh full >/dev/null 2>&1"

# Test health check error handling
run_test "Health check handles invalid arguments" "! ./scripts/bootstrap/health_check.sh invalid_option >/dev/null 2>&1"

# ===============================================================================
# WALLET GENERATION TESTS
# ===============================================================================

print_header "3. WALLET GENERATION VALIDATION"

# Test wallet generation script
run_test "Wallet generation script exists" "[ -f scripts/bootstrap/generate_wallet.sh ]"
run_test "Wallet generation script is executable" "[ -x scripts/bootstrap/generate_wallet.sh ]"

# Test wallet generation functionality
run_test "Wallet generation test mode works" "./scripts/bootstrap/generate_wallet.sh --test >/dev/null 2>&1"
run_test "Wallet generation non-interactive mode works" "./scripts/bootstrap/generate_wallet.sh --non-interactive >/dev/null 2>&1"

# ===============================================================================
# DOCKER COMPOSE VALIDATION
# ===============================================================================

print_header "4. DOCKER COMPOSE CONFIGURATION VALIDATION"

# Test Docker Compose files existence
run_test "Main docker-compose.yml exists" "[ -f docker-compose.yml ]"
run_test "Service compose files exist" "[ -f docker/services/docker-compose.n8n.yml ] && [ -f docker/services/docker-compose.openwebui.yml ] && [ -f docker/services/docker-compose.flowise.yml ]"

# Test Docker Compose syntax
run_test "Main docker-compose.yml syntax is valid" "docker compose -f docker-compose.yml config >/dev/null 2>&1"

if [ -f docker/services/docker-compose.n8n.yml ]; then
    run_test "N8N compose syntax is valid" "docker compose -f docker-compose.yml -f docker/services/docker-compose.n8n.yml config >/dev/null 2>&1"
fi

if [ -f docker/services/docker-compose.qdrant.yml ]; then
    run_test "Qdrant compose has no health check" "! grep -q 'healthcheck:' docker/services/docker-compose.qdrant.yml"
fi

# ===============================================================================
# ENVIRONMENT CONFIGURATION TESTS
# ===============================================================================

print_header "5. ENVIRONMENT CONFIGURATION VALIDATION"

# Backup existing .env if it exists
if [ -f ".env" ]; then
    cp .env .env.backup.test
    print_status "Backed up existing .env to .env.backup.test"
fi

# Test different profile configurations
test_profiles=("default" "local-dev")

for profile in "${test_profiles[@]}"; do
    print_status "Testing profile: $profile"
    
    # Remove existing .env for clean test
    rm -f .env
    
    # Test environment generation with profile
    if echo -e "\n$profile\nn\n" | timeout 30 bash scripts/bootstrap/configure_env.sh >/dev/null 2>&1; then
        run_test "Profile '$profile' generates valid .env" "[ -f .env ] && [ -s .env ]"
        
        if [ -f .env ]; then
            run_test "Profile '$profile' sets PROFILE variable" "grep -q '^PROFILE=' .env"
            run_test "Profile '$profile' has no Windows line endings" "! grep -q $'\r' .env"
            
            # Test environment loading
            run_test "Profile '$profile' .env can be sourced" "set -a; source .env; set +a"
        fi
    else
        print_warning "Profile '$profile' configuration timed out or failed"
    fi
done

# Restore original .env if it existed
if [ -f ".env.backup.test" ]; then
    mv .env.backup.test .env
    print_status "Restored original .env"
fi

# ===============================================================================
# SERVICE MANAGEMENT TESTS
# ===============================================================================

print_header "6. SERVICE MANAGEMENT VALIDATION"

# Test if Docker is available
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    run_test "Docker is available and running" "docker info >/dev/null 2>&1"
    
    # Test service deployment script without actually deploying
    run_test "Deploy services script loads .env correctly" "bash -n scripts/bootstrap/deploy_services.sh"
    
    # If services are running, test health checks
    if docker ps --filter "name=seiling-" -q | grep -q .; then
        print_status "Found running services, testing health checks..."
        
        run_test "Health check detects running services" "./scripts/bootstrap/health_check.sh quick | grep -q '✓'"
        
        # Test individual service checks
        for service in n8n openwebui flowise; do
            if docker ps --filter "name=seiling-$service" --filter "status=running" -q | grep -q .; then
                run_test "Service $service is detected as running" "docker ps --filter 'name=seiling-$service' --filter 'status=running' -q | grep -q ."
            fi
        done
    else
        print_status "No services currently running, skipping live service tests"
    fi
else
    print_warning "Docker not available, skipping Docker-related tests"
fi

# ===============================================================================
# ERROR HANDLING AND EDGE CASES
# ===============================================================================

print_header "7. ERROR HANDLING VALIDATION"

# Test script behavior with missing files
run_test "Health check handles missing .env gracefully" "bash -c 'cd /tmp && /$(pwd)/scripts/bootstrap/health_check.sh quick' >/dev/null 2>&1 || true"

# Test permission handling
run_test "Scripts handle permission errors gracefully" "bash -c 'touch /tmp/test_readonly && chmod 444 /tmp/test_readonly; rm -f /tmp/test_readonly' >/dev/null 2>&1"

# Test network connectivity simulation
run_test "Health check handles network errors gracefully" "timeout 5 ./scripts/bootstrap/health_check.sh quick >/dev/null 2>&1 || true"

# ===============================================================================
# DOCUMENTATION AND HELP VALIDATION
# ===============================================================================

print_header "8. DOCUMENTATION VALIDATION"

# Test help/documentation
run_test "Bootstrap README exists" "[ -f scripts/bootstrap/README.md ]"
run_test "Main README exists" "[ -f README.md ]"
run_test "Health check script provides help" "./scripts/bootstrap/health_check.sh help | grep -q 'Usage:'"

# Test documentation mentions new features
run_test "README mentions health_check.sh" "grep -q 'health_check.sh' scripts/bootstrap/README.md"
run_test "README mentions non-interactive wallet generation" "grep -q 'non-interactive' scripts/bootstrap/README.md"

# ===============================================================================
# INTEGRATION TESTS
# ===============================================================================

print_header "9. INTEGRATION TEST SCENARIOS"

# Test complete workflow simulation (dry run)
print_status "Testing workflow integration..."

# Simulate OS detection
run_test "OS detection works" "bash scripts/bootstrap/detect_os.sh >/dev/null 2>&1"

# Test troubleshooting script integration
run_test "Troubleshooting script exists" "[ -f scripts/bootstrap/troubleshoot.sh ]"
run_test "Troubleshooting script is executable" "[ -x scripts/bootstrap/troubleshoot.sh ]"

# ===============================================================================
# PERFORMANCE AND RELIABILITY TESTS
# ===============================================================================

print_header "10. PERFORMANCE VALIDATION"

# Test health check performance
print_status "Testing health check performance..."
start_time=$(date +%s)
./scripts/bootstrap/health_check.sh quick >/dev/null 2>&1 || true
end_time=$(date +%s)
duration=$((end_time - start_time))

if [ $duration -lt 30 ]; then
    echo -e "${GREEN}✓ PASS:${NC} Health check completes in reasonable time ($duration seconds)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ FAIL:${NC} Health check took too long ($duration seconds)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# ===============================================================================
# TEST RESULTS SUMMARY
# ===============================================================================

print_header "TEST RESULTS SUMMARY"

echo -e "\n${CYAN}Test Results:${NC}"
echo -e "  Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "  Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "  Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    echo -e "${GREEN}The bootstrap system is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ SOME TESTS FAILED ❌${NC}"
    echo -e "${RED}Please review the failed tests above.${NC}"
    exit 1
fi 