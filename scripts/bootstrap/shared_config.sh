#!/bin/bash
# scripts/bootstrap/shared_config.sh
# Shared configuration system for bootstrap scripts

# Configuration file path
BOOTSTRAP_CONFIG_FILE="/tmp/seiling_bootstrap_config"

# Default values
DEFAULT_TEST_MODE=false
DEFAULT_AUTO_MODE=false
DEFAULT_PROFILE="default"
DEFAULT_USE_DEFAULTS=false
DEFAULT_QUIET_MODE=false

# Set bootstrap configuration variables (preserve if already set)
TEST_MODE=${TEST_MODE:-$DEFAULT_TEST_MODE}
AUTO_MODE=${AUTO_MODE:-$DEFAULT_AUTO_MODE}
PROFILE=${PROFILE:-$DEFAULT_PROFILE}
USE_DEFAULTS=${USE_DEFAULTS:-$DEFAULT_USE_DEFAULTS}
QUIET_MODE=${QUIET_MODE:-$DEFAULT_QUIET_MODE}

# Export variables for child scripts
export TEST_MODE AUTO_MODE PROFILE USE_DEFAULTS QUIET_MODE

# Load UI components
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_DIR="$SCRIPT_DIR/ui"

# Source UI components if available
if [ -f "$UI_DIR/status.sh" ]; then
    source "$UI_DIR/status.sh"
else
    # Fallback to basic functions if UI components not available
    print_success() { echo "[SUCCESS] $1"; }
    print_error() { echo "[ERROR] $1" >&2; }
    print_warning() { echo "[WARNING] $1"; }
    print_info() { echo "[INFO] $1"; }
    print_debug() { echo "[DEBUG] $1"; }
    print_step() { echo "[STEP] $1"; }
    print_header() { echo "=== $1 ==="; }
    print_section() { echo "--- $1 ---"; }
    print_status() { echo "[INFO] $1"; }  # Alias for print_info
fi

# Ensure print_status is available (common alias for print_info)
if ! type print_status >/dev/null 2>&1; then
    print_status() { print_info "$1"; }
fi

if [ -f "$UI_DIR/progress.sh" ]; then
    source "$UI_DIR/progress.sh"
fi

if [ -f "$UI_DIR/spinner.sh" ]; then
    source "$UI_DIR/spinner.sh"
fi

if [ -f "$UI_DIR/menu.sh" ]; then
    source "$UI_DIR/menu.sh"
fi

# Save bootstrap configuration to shared file
save_bootstrap_config() {
    cat > "$BOOTSTRAP_CONFIG_FILE" <<EOF
export TEST_MODE=$TEST_MODE
export AUTO_MODE=$AUTO_MODE
export PROFILE=$PROFILE
export USE_DEFAULTS=$USE_DEFAULTS
export QUIET_MODE=$QUIET_MODE
export BOOTSTRAP_START_TIME=${BOOTSTRAP_START_TIME:-$(date +%s)}
EOF
    
    if [ "$QUIET_MODE" != "true" ]; then
        print_debug "Bootstrap configuration saved to $BOOTSTRAP_CONFIG_FILE"
    fi
}

# Load bootstrap configuration from shared file
load_bootstrap_config() {
    if [ -f "$BOOTSTRAP_CONFIG_FILE" ]; then
        source "$BOOTSTRAP_CONFIG_FILE"
        if [ "$QUIET_MODE" != "true" ]; then
            print_debug "Bootstrap configuration loaded from $BOOTSTRAP_CONFIG_FILE"
        fi
        return 0
    else
        if [ "$QUIET_MODE" != "true" ]; then
            print_debug "No bootstrap configuration file found, using defaults"
        fi
        return 1
    fi
}

# Clean up configuration file
cleanup_bootstrap_config() {
    if [ -f "$BOOTSTRAP_CONFIG_FILE" ]; then
        rm -f "$BOOTSTRAP_CONFIG_FILE"
        if [ "$QUIET_MODE" != "true" ]; then
            print_debug "Bootstrap configuration cleaned up"
        fi
    fi
}

# Check if running in test mode
is_test_mode() {
    [ "$TEST_MODE" = "true" ]
}

# Check if running in auto mode
is_auto_mode() {
    [ "$AUTO_MODE" = "true" ]
}

# Check if running in quiet mode
is_quiet_mode() {
    [ "$QUIET_MODE" = "true" ]
}

# Print messages based on mode
print_mode_aware() {
    local level="$1"
    local message="$2"
    
    # Skip debug messages in auto mode unless explicitly requested
    if [ "$level" = "debug" ] && [ "$AUTO_MODE" = "true" ] && [ "$QUIET_MODE" != "false" ]; then
        return
    fi
    
    # Skip all messages in quiet mode except errors
    if [ "$QUIET_MODE" = "true" ] && [ "$level" != "error" ]; then
        return
    fi
    
    case "$level" in
        "success") print_success "$message" ;;
        "error") print_error "$message" ;;
        "warning") print_warning "$message" ;;
        "info") print_info "$message" ;;
        "debug") print_debug "$message" ;;
        "step") print_step "$message" ;;
        *) echo "$message" ;;
    esac
}

# Enhanced error handling
handle_bootstrap_error() {
    local exit_code=$?
    local script_name=$(basename "$0")
    local line_number=${1:-"unknown"}
    
    print_mode_aware "error" "Error in $script_name at line $line_number (exit code: $exit_code)"
    
    if [ "$TEST_MODE" = "true" ]; then
        print_mode_aware "info" "Test mode: Error simulation complete"
        cleanup_bootstrap_config
        exit 0
    else
        print_mode_aware "error" "Bootstrap process failed. Check the logs above for details."
        cleanup_bootstrap_config
        exit $exit_code
    fi
}

# Set up error handling
setup_error_handling() {
    set -eE  # Exit on error and inherit ERR trap
    trap 'handle_bootstrap_error $LINENO' ERR
}

# Validate bootstrap environment
validate_bootstrap_environment() {
    local errors=()
    
    # Check for required tools
    local required_tools=("git")
    
    if [ "$TEST_MODE" != "true" ]; then
        # In test mode, we don't need actual tools
        for tool in "${required_tools[@]}"; do
            if ! command -v "$tool" >/dev/null 2>&1; then
                errors+=("Required tool '$tool' not found")
            fi
        done
        
        # Enhanced Docker validation
        if ! validate_docker_environment; then
            errors+=("Docker environment validation failed")
        fi
    fi
    
    # Report errors
    if [ ${#errors[@]} -gt 0 ]; then
        print_mode_aware "error" "Environment validation failed:"
        for error in "${errors[@]}"; do
            print_mode_aware "error" "  - $error"
        done
        return 1
    fi
    
    print_mode_aware "success" "Environment validation passed"
    return 0
}

# Enhanced Docker environment validation
validate_docker_environment() {
    print_mode_aware "info" "Validating Docker environment..."
    
    # Check if Docker command exists
    if ! command -v docker >/dev/null 2>&1; then
        print_mode_aware "error" "Docker command not found. Run dependency installation first."
        return 1
    fi
    
    # Check if Docker daemon is accessible
    if ! docker info >/dev/null 2>&1; then
        print_mode_aware "warning" "Docker daemon not accessible. Attempting to start..."
        
        if ! ensure_docker_daemon_running; then
            print_mode_aware "error" "Failed to start Docker daemon"
            return 1
        fi
    fi
    
    # Check Docker Compose availability
    if ! validate_docker_compose; then
        print_mode_aware "error" "Docker Compose not available"
        return 1
    fi
    
    print_mode_aware "success" "Docker environment is ready"
    return 0
}

# Ensure Docker daemon is running
ensure_docker_daemon_running() {
    # Source OS detection if available
    if [ -f "/tmp/seiling_bootstrap_env" ]; then
        source "/tmp/seiling_bootstrap_env"
    fi
    
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker info >/dev/null 2>&1; then
            print_mode_aware "success" "Docker daemon is running"
            return 0
        fi
        
        print_mode_aware "info" "Attempt $attempt/$max_attempts: Starting Docker daemon..."
        
        if [[ "$OS" == "macos" ]]; then
            # macOS: Try to start Docker Desktop
            if [ -d "/Applications/Docker.app" ]; then
                open /Applications/Docker.app >/dev/null 2>&1
                if wait_for_docker_daemon 60; then
                    return 0
                fi
            else
                print_mode_aware "error" "Docker Desktop not found on macOS"
                return 1
            fi
        elif [[ "$OS" == "linux" || "$OS" == "wsl" ]]; then
            # Linux: Try to start Docker service
            if command -v systemctl >/dev/null 2>&1; then
                if sudo systemctl start docker >/dev/null 2>&1; then
                    if wait_for_docker_daemon 30; then
                        return 0
                    fi
                fi
            else
                print_mode_aware "error" "Cannot start Docker service - systemctl not available"
                return 1
            fi
        else
            print_mode_aware "error" "Unknown OS for Docker daemon management: $OS"
            return 1
        fi
        
        attempt=$((attempt + 1))
        if [ $attempt -le $max_attempts ]; then
            print_mode_aware "warning" "Docker daemon start attempt failed. Retrying in 5 seconds..."
            sleep 5
        fi
    done
    
    print_mode_aware "error" "Failed to start Docker daemon after $max_attempts attempts"
    return 1
}

# Wait for Docker daemon to become ready
wait_for_docker_daemon() {
    local timeout=${1:-60}
    local counter=0
    local check_interval=2
    
    print_mode_aware "info" "Waiting for Docker daemon (timeout: ${timeout}s)..."
    
    while [ $counter -lt $timeout ]; do
        if docker info >/dev/null 2>&1; then
            print_mode_aware "success" "Docker daemon is ready!"
            return 0
        fi
        
        sleep $check_interval
        counter=$((counter + check_interval))
        
        # Show progress every 10 seconds
        if [ $((counter % 10)) -eq 0 ]; then
            print_mode_aware "debug" "Still waiting for Docker daemon... (${counter}s elapsed)"
        fi
    done
    
    print_mode_aware "error" "Docker daemon not ready after ${timeout}s timeout"
    return 1
}

# Validate Docker Compose availability
validate_docker_compose() {
    if command -v docker-compose >/dev/null 2>&1; then
        print_mode_aware "debug" "docker-compose standalone command available"
        return 0
    elif docker compose version >/dev/null 2>&1; then
        print_mode_aware "debug" "docker compose plugin available"
        return 0
    else
        print_mode_aware "error" "Neither docker-compose nor 'docker compose' plugin found"
        return 1
    fi
}

# Get the correct Docker Compose command
get_docker_compose_cmd() {
    if command -v docker-compose >/dev/null 2>&1; then
        echo "docker-compose"
    elif docker compose version >/dev/null 2>&1; then
        echo "docker compose"
    else
        return 1
    fi
}

# Mock function for test mode
mock_command() {
    local command="$1"
    shift
    local args=("$@")
    
    if [ "$TEST_MODE" = "true" ]; then
        print_mode_aware "debug" "MOCK: $command ${args[*]}"
        return 0
    else
        "$command" "${args[@]}"
    fi
}

# Execute with appropriate output handling
execute_with_output() {
    local command="$1"
    local description="$2"
    local show_spinner=${3:-true}
    
    if [ "$TEST_MODE" = "true" ]; then
        # In test mode, actually execute some scripts but mock others
        case "$command" in
            *"configure_env.sh"*)
                # Execute environment configuration for interactive testing
                print_mode_aware "info" "TEST MODE: Executing (interactive): $command"
                eval "$command"
                return $?
                ;;
            *"project_setup.sh"*)
                # Execute project setup for interactive testing  
                print_mode_aware "info" "TEST MODE: Executing (interactive): $command"
                eval "$command"
                return $?
                ;;
            *"deploy_services.sh"*)
                # Mock deployment for safety
                print_mode_aware "info" "TEST MODE: Would execute (deployment mocked): $command"
                sleep 0.5
                return 0
                ;;
            *"detect_os.sh"*|*"install_deps.sh"*)
                # Mock OS detection and dependency installation for speed
                print_mode_aware "info" "TEST MODE: Would execute (mocked): $command"
                sleep 0.3
                return 0
                ;;
            *)
                # Mock other scripts by default
                print_mode_aware "info" "TEST MODE: Would execute: $command"
                sleep 0.5
                return 0
                ;;
        esac
    fi
    
    # Regular execution for non-test mode
    if [ "$AUTO_MODE" = "true" ] && [ "$show_spinner" = "true" ] && command -v with_spinner >/dev/null 2>&1; then
        # Use spinner in auto mode for better UX, but check for long-running commands
        case "$command" in
            *"install_deps.sh"*)
                # Dependency installation can take a very long time (Docker installation)
                # Especially on fresh VMs downloading packages from repositories
                # Use unlimited timeout for reliability
                print_mode_aware "info" "$description (no timeout limit)"
                eval "$command"
                return $?
                ;;
            *"deploy_services.sh"*)
                # Service deployment can take a very long time on first run (image pulls)
                # This accounts for ~4GB of Docker images being downloaded
                # For 'default' profile, use unlimited timeout to ensure reliability
                # Users can override with DEPLOY_TIMEOUT environment variable
                local default_timeout=1800  # 30 minutes for non-default profiles
                if [ "${PROFILE:-}" = "default" ]; then
                    default_timeout=0  # Unlimited timeout for default profile
                fi
                local deploy_timeout=${DEPLOY_TIMEOUT:-$default_timeout}
                
                # If DEPLOY_TIMEOUT is set to 0, skip spinner entirely (unlimited time)
                if [ "$deploy_timeout" = "0" ]; then
                    print_mode_aware "info" "$description (no timeout limit)"
                    eval "$command"
                    return $?
                else
                    with_spinner "$command" "$description" "$deploy_timeout"
                    return $?
                fi
                ;;
            *)
                # Default timeout for other commands
                with_spinner "$command" "$description"
                return $?
                ;;
        esac
    else
        # Regular execution with appropriate output
        if [ "$QUIET_MODE" != "true" ]; then
            print_mode_aware "info" "$description"
        fi
        
        if [ "$QUIET_MODE" = "true" ]; then
            eval "$command" >/dev/null 2>&1
        else
            eval "$command"
        fi
        return $?
    fi
}

# Progress tracking
BOOTSTRAP_STEPS=("OS Detection" "Install Dependencies" "Project Setup" "Environment Configuration" "Service Deployment")
CURRENT_STEP=0

start_bootstrap_step() {
    local step_name="$1"
    CURRENT_STEP=$((CURRENT_STEP + 1))
    
    if [ "$QUIET_MODE" != "true" ]; then
        if command -v show_step_progress >/dev/null 2>&1; then
            show_step_progress "$CURRENT_STEP" "${#BOOTSTRAP_STEPS[@]}" "$step_name"
        else
            print_step "Step $CURRENT_STEP/${#BOOTSTRAP_STEPS[@]}: $step_name"
        fi
    fi
}

# Configuration summary
print_config_summary() {
    if [ "$QUIET_MODE" = "true" ]; then
        return
    fi
    
    print_section "Bootstrap Configuration"
    print_key_value "Mode" "$([ "$TEST_MODE" = "true" ] && echo "Test" || echo "Normal")$([ "$AUTO_MODE" = "true" ] && echo " + Auto" || "")"
    print_key_value "Profile" "$PROFILE"
    print_key_value "Quiet Mode" "$QUIET_MODE"
    
    if [ "$TEST_MODE" = "true" ]; then
        print_warning "Running in TEST MODE - no actual deployment will occur"
    fi
    
    if [ "$AUTO_MODE" = "true" ]; then
        print_info "Running in AUTO MODE - using default settings"
    fi
}

# Cleanup function for script exit
cleanup_on_exit() {
    cleanup_bootstrap_config
}

# Register cleanup on script exit
trap cleanup_on_exit EXIT

# Don't auto-load configuration on source - let the main script control this 