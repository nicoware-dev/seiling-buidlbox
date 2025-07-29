#!/bin/bash
set -e

# Seiling Buidlbox Bootstrap Script
# 
# Quick Start: ./bootstrap.sh (interactive mode)
# Auto Mode: ./bootstrap.sh -auto (non-interactive with defaults)
# Test Mode: ./bootstrap.sh -test (mock deployment for testing)
# Combined: ./bootstrap.sh -auto -test (test auto mode without deployment)
# Remote: curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash
#
# The script will guide you through:
# 1. Repository setup (clone if needed)
# 2. OS detection and dependency installation
# 3. Project setup and Git submodules
# 4. Environment configuration (with optional wallet generation)
# 5. Service deployment with Docker Compose

# Repository configuration
REPO_URL="https://github.com/nicoware-dev/seiling-buidlbox.git"
PROJECT_DIR="seiling-buidlbox"
REPO_BRANCH="main"

# Initialize default values for CLI flags
TEST_MODE=false
AUTO_MODE=false
QUIET_MODE=false

# Colors for basic output (before shared config is loaded)
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Basic fallback functions (will be replaced when shared config is loaded)
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }
print_header() { echo -e "\n${GREEN}=== $1 ===${NC}\n"; }

# Function to check if we're running from within the repository
is_in_repository() {
    [ -d ".git" ] && [ -f "bootstrap.sh" ] && [ -d "scripts/bootstrap" ]
}

# Function to install git if needed (minimal installation before repo cloning)
ensure_git_available() {
    if command -v git >/dev/null 2>&1; then
        return 0
    fi
    
    print_info "Git not found. Attempting to install git..."
    
    # Detect OS for package manager
    local pkg_manager=""
    if command -v apt-get >/dev/null 2>&1; then
        pkg_manager="apt"
    elif command -v yum >/dev/null 2>&1; then
        pkg_manager="yum"
    elif command -v dnf >/dev/null 2>&1; then
        pkg_manager="dnf"
    elif command -v brew >/dev/null 2>&1; then
        pkg_manager="brew"
    elif command -v pacman >/dev/null 2>&1; then
        pkg_manager="pacman"
    else
        print_error "No supported package manager found."
        print_error "Please install git manually and then re-run the bootstrap script:"
        echo ""
        echo "  Ubuntu/Debian: sudo apt update && sudo apt install git"
        echo "  CentOS/RHEL:   sudo yum install git"
        echo "  Fedora:        sudo dnf install git"
        echo "  macOS:         brew install git"
        echo "  Arch Linux:    sudo pacman -S git"
        echo "  Windows:       Download from https://git-scm.com/"
        echo ""
        echo "Then run: curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash"
        exit 1
    fi
    
    # Check for sudo/root permissions and provide guidance
    local sudo_cmd=""
    local needs_sudo=false
    
    if [ "$EUID" -eq 0 ]; then
        print_info "Running as root - installing git directly"
        sudo_cmd=""
    elif command -v sudo >/dev/null 2>&1; then
        print_info "Using sudo to install git"
        sudo_cmd="sudo"
        needs_sudo=true
    else
        print_error "Git installation requires root privileges, but sudo is not available."
        print_error "Please run as root or install sudo first:"
        echo ""
        echo "Option 1 - Run as root:"
        echo "  sudo su -"
        echo "  curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash"
        echo ""
        echo "Option 2 - Install git manually:"
        case "$pkg_manager" in
            apt) echo "  apt update && apt install git" ;;
            yum) echo "  yum install git" ;;
            dnf) echo "  dnf install git" ;;
            pacman) echo "  pacman -S git" ;;
        esac
        echo ""
        exit 1
    fi
    
    # Try to install git
    local install_success=false
    case "$pkg_manager" in
        apt)
            print_info "Installing git via apt..."
            if $sudo_cmd apt-get update -qq 2>/dev/null && $sudo_cmd apt-get install -y git 2>/dev/null; then
                install_success=true
            fi
            ;;
        yum)
            print_info "Installing git via yum..."
            if $sudo_cmd yum install -y git 2>/dev/null; then
                install_success=true
            fi
            ;;
        dnf)
            print_info "Installing git via dnf..."
            if $sudo_cmd dnf install -y git 2>/dev/null; then
                install_success=true
            fi
            ;;
        brew)
            print_info "Installing git via brew..."
            if brew install git 2>/dev/null; then
                install_success=true
            fi
            ;;
        pacman)
            print_info "Installing git via pacman..."
            if $sudo_cmd pacman -S --noconfirm git 2>/dev/null; then
                install_success=true
            fi
            ;;
    esac
    
    # Verify git installation
    if command -v git >/dev/null 2>&1 && [ "$install_success" = true ]; then
        print_success "Git installed successfully."
        return 0
    fi
    
    # Installation failed - provide helpful error message
    print_error "Failed to install git automatically."
    
    if [ "$needs_sudo" = true ]; then
        print_error "This may be due to insufficient permissions or sudo configuration."
        echo ""
        echo "Please try one of these options:"
        echo ""
        echo "Option 1 - Run with sudo (recommended):"
        echo "  curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | sudo bash"
        echo ""
        echo "Option 2 - Install git manually first:"
        case "$pkg_manager" in
            apt) echo "  sudo apt update && sudo apt install git" ;;
            yum) echo "  sudo yum install git" ;;
            dnf) echo "  sudo dnf install git" ;;
            pacman) echo "  sudo pacman -S git" ;;
        esac
        echo "  Then re-run: curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash"
        echo ""
        echo "Option 3 - Run as root:"
        echo "  sudo su -"
        echo "  curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash"
    else
        echo ""
        echo "Please install git manually:"
        case "$pkg_manager" in
            apt) echo "  apt update && apt install git" ;;
            yum) echo "  yum install git" ;;
            dnf) echo "  dnf install git" ;;
            pacman) echo "  pacman -S git" ;;
            brew) echo "  brew install git" ;;
        esac
        echo "Then re-run the bootstrap script."
    fi
    echo ""
    exit 1
}

# Function to setup repository (clone if needed)
setup_repository() {
    if is_in_repository; then
        print_info "Running from within repository, continuing with existing setup."
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        return 0
    fi
    
    print_header "Repository Setup"
    
    # Ensure git is available before attempting to clone
    ensure_git_available
    
    # Check if project directory already exists
    if [ -d "$PROJECT_DIR" ]; then
        if [ -d "$PROJECT_DIR/.git" ]; then
            print_info "Repository directory '$PROJECT_DIR' already exists."
            cd "$PROJECT_DIR"
            
            # Check if it's the correct repository
            if git remote get-url origin 2>/dev/null | grep -q "seiling-buidlbox"; then
                print_info "Updating existing repository..."
                if ! git fetch origin "$REPO_BRANCH" >/dev/null 2>&1; then
                    print_warning "Failed to fetch updates, continuing with existing version."
                else
                    git reset --hard "origin/$REPO_BRANCH" >/dev/null 2>&1 || print_warning "Failed to update, continuing with existing version."
                fi
            else
                print_error "Directory '$PROJECT_DIR' exists but is not the correct repository."
                exit 1
            fi
        else
            print_error "Directory '$PROJECT_DIR' exists but is not a git repository."
            print_info "Please remove it or choose a different directory."
            exit 1
        fi
    else
        print_info "Cloning repository..."
        
        if ! git clone --branch "$REPO_BRANCH" --depth 1 "$REPO_URL" "$PROJECT_DIR"; then
            print_error "Failed to clone repository from $REPO_URL"
            print_info "Please check your internet connection and try again."
            exit 1
        fi
        
        print_success "Repository cloned successfully."
        cd "$PROJECT_DIR"
    fi
    
    # Set SCRIPT_DIR for the cloned/existing repository
    SCRIPT_DIR="$(pwd)"
    
    # Verify we have the necessary files
    if [ ! -f "bootstrap.sh" ] || [ ! -d "scripts/bootstrap" ]; then
        print_error "Repository appears to be incomplete. Missing bootstrap files."
        exit 1
    fi
    
    print_success "Repository setup complete."
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -test|--test)
                TEST_MODE=true
                export TEST_MODE
                shift
                ;;
            -auto|--auto)
                AUTO_MODE=true
                export AUTO_MODE
                shift
                ;;
            -quiet|--quiet)
                QUIET_MODE=true
                export QUIET_MODE
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Export variables for child scripts
    export TEST_MODE AUTO_MODE QUIET_MODE
}

# Show help message
show_help() {
    cat << 'EOF'
Seiling Buidlbox Bootstrap Script

USAGE:
    ./bootstrap.sh [OPTIONS]

REMOTE USAGE:
    # Interactive setup (recommended)
    curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash
    
    # Automatic setup with defaults
    curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash -s -- -auto
    
    # If you get permission errors, run with sudo:
    curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | sudo bash

OPTIONS:
    -test, --test     Run in test mode (mock deployment, no actual services started)
    -auto, --auto     Run in automatic mode (non-interactive, use defaults)
    -quiet, --quiet   Run in quiet mode (minimal output)
    -h, --help        Show this help message

EXAMPLES:
    ./bootstrap.sh                  Interactive setup with user prompts
    ./bootstrap.sh -auto            Automatic setup with default configuration
    ./bootstrap.sh -test            Test mode - validate setup without deployment
    ./bootstrap.sh -auto -test      Test automatic mode without actual deployment
    ./bootstrap.sh -auto -quiet     Silent automatic setup

MODES:
    Interactive (default): User selects profile and provides input
    Auto (-auto): Uses 'default' profile with placeholder credentials
    Test (-test): Simulates all operations without actual deployment
    Quiet (-quiet): Minimal output, errors only

The script sets up a complete Seiling development environment including:
- Docker services (n8n, OpenWebUI, Flowise, Eliza, Cambrian, etc.)
- Database systems (PostgreSQL, Redis, Qdrant, Neo4j)
- Environment configuration and wallet generation
- Health monitoring and troubleshooting tools
EOF
}

show_welcome() {
    # Always show ASCII art unless in quiet mode
    if [ "$QUIET_MODE" != "true" ]; then
        clear
        echo ""
        if [ -f "ASCII-ART.TXT" ]; then
            cat ASCII-ART.TXT
        else
            echo -e "${GREEN}"
            echo "  ███████╗███████╗██╗██╗     ██╗███╗   ██╗ ██████╗ "
            echo "  ██╔════╝██╔════╝██║██║     ██║████╗  ██║██╔════╝ "
            echo "  ███████╗█████╗  ██║██║     ██║██╔██╗ ██║██║  ███╗"
            echo "  ╚════██║██╔══╝  ██║██║     ██║██║╚██╗██║██║   ██║"
            echo "  ███████║███████╗██║███████╗██║██║ ╚████║╚██████╔╝"
            echo "  ╚══════╝╚══════╝╚═╝╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ "
            echo -e "${NC}"
        fi
        echo ""
    fi
    
    # Skip interactive parts in auto or quiet mode
    if [ "$QUIET_MODE" = "true" ] || [ "$AUTO_MODE" = "true" ]; then
        return
    fi
    
    print_header "Welcome to Seiling Buidlbox Bootstrap Setup!"
    
    echo "This script will set up your complete Seiling development environment:"
    echo "  🔍 Detect your operating system and install dependencies"
    echo "  📦 Set up project structure and Git submodules"
    echo "  ⚙️  Configure environment variables and generate wallets"
    echo "  🚀 Deploy all services with Docker Compose"
    echo ""
    
    if [ "$TEST_MODE" = "true" ]; then
        print_warning "Running in TEST MODE - no actual deployment will occur"
    fi
    
    print_info "Quick Start: Select 'default' profile for fastest setup"
    print_info "Custom Setup: Choose specific profiles for targeted configurations"
    echo ""
    
    read -p "Press Enter to continue..."
    echo ""
}

# Main execution function
main() {
    # Parse command line arguments first
    parse_args "$@"
    
    # Export variables immediately after parsing
    export TEST_MODE AUTO_MODE QUIET_MODE
    
    # Setup repository (clone if needed)
    setup_repository
    
    # Now we should be in the correct directory with all files
    # Get script directory and bootstrap directory
    SCRIPT_DIR="$(pwd)"
    BOOTSTRAP_DIR="$SCRIPT_DIR/scripts/bootstrap"
    
    # Load shared configuration and UI components after we're in the repo
    if [ -f "$BOOTSTRAP_DIR/shared_config.sh" ]; then
        source "$BOOTSTRAP_DIR/shared_config.sh"
    else
        print_warning "Shared configuration not found, using basic functions"
    fi
    
    # Set up bootstrap environment
    export BOOTSTRAP_START_TIME=$(date +%s)
    
    # Save configuration for child scripts (if function exists)
    if command -v save_bootstrap_config >/dev/null 2>&1; then
        save_bootstrap_config
    fi
    
    # Set up error handling (if function exists)
    if command -v setup_error_handling >/dev/null 2>&1; then
        setup_error_handling
    fi
    
    # Show configuration summary (if function exists)
    if command -v print_config_summary >/dev/null 2>&1; then
        print_config_summary
    fi
    
    # Show welcome message (unless in auto/quiet mode)
    show_welcome
    
    # Execute bootstrap steps with progress tracking
    # Use execute_with_output if available, otherwise fallback to direct execution
    if command -v execute_with_output >/dev/null 2>&1 && command -v start_bootstrap_step >/dev/null 2>&1; then
        start_bootstrap_step "OS Detection"
        if ! execute_with_output "bash '$BOOTSTRAP_DIR/detect_os.sh'" "Detecting operating system"; then
            print_error "OS detection failed. Exiting."
            exit 1
        fi

        start_bootstrap_step "Dependency Installation"
        if ! execute_with_output "bash '$BOOTSTRAP_DIR/install_deps.sh'" "Installing dependencies"; then
            print_error "Dependency installation failed. Exiting."
            exit 1
        fi

        # Validate environment after dependencies are installed (if function exists)
        if command -v validate_bootstrap_environment >/dev/null 2>&1; then
            if ! validate_bootstrap_environment; then
                print_error "Environment validation failed after dependency installation. Please check the installation."
                exit 1
            fi
        fi

        start_bootstrap_step "Project Setup"
        if ! execute_with_output "bash '$BOOTSTRAP_DIR/project_setup.sh'" "Setting up project structure"; then
            print_error "Project setup failed. Exiting."
            exit 1
        fi

        start_bootstrap_step "Environment Configuration"
        if ! execute_with_output "bash '$BOOTSTRAP_DIR/configure_env.sh'" "Configuring environment"; then
            print_error "Environment configuration failed. Exiting."
            exit 1
        fi

        start_bootstrap_step "Service Deployment"
        if [ "$AUTO_MODE" = "true" ]; then
            # Calculate default timeout based on profile
            local default_timeout=1800  # 30 minutes for non-default profiles
            if [ "${PROFILE:-}" = "default" ]; then
                default_timeout=0  # Unlimited timeout for default profile
            fi
            local deploy_timeout=${DEPLOY_TIMEOUT:-$default_timeout}
            
            if [ "$deploy_timeout" = "0" ]; then
                print_info "Deploying services (no timeout limit - reliable for any connection speed)..."
            else
                local timeout_mins=$((deploy_timeout / 60))
                print_info "Deploying services (this may take up to ${timeout_mins} minutes on first run)..."
            fi
            
            if [ -n "${DEPLOY_TIMEOUT:-}" ] && [ "${DEPLOY_TIMEOUT}" != "$default_timeout" ]; then
                if [ "$DEPLOY_TIMEOUT" = "0" ]; then
                    print_info "Using custom unlimited timeout (DEPLOY_TIMEOUT=0)"
                else
                    local custom_mins=$((DEPLOY_TIMEOUT / 60))
                    print_info "Using custom timeout: ${DEPLOY_TIMEOUT}s (${custom_mins} minutes)"
                fi
            fi
        fi
        if ! execute_with_output "bash '$BOOTSTRAP_DIR/deploy_services.sh'" "Deploying services"; then
            print_error "Service deployment failed. Exiting."
            exit 1
        fi
    else
        # Fallback execution without fancy progress tracking
        print_step "Detecting operating system..."
        if ! bash "$BOOTSTRAP_DIR/detect_os.sh"; then
            print_error "OS detection failed. Exiting."
            exit 1
        fi

        print_step "Installing dependencies..."
        if ! bash "$BOOTSTRAP_DIR/install_deps.sh"; then
            print_error "Dependency installation failed. Exiting."
            exit 1
        fi

        # Validate environment after dependencies are installed (if function exists)
        if command -v validate_bootstrap_environment >/dev/null 2>&1; then
            if ! validate_bootstrap_environment; then
                print_error "Environment validation failed after dependency installation. Please check the installation."
                exit 1
            fi
        fi

        print_step "Setting up project structure..."
        if ! bash "$BOOTSTRAP_DIR/project_setup.sh"; then
            print_error "Project setup failed. Exiting."
            exit 1
        fi

        print_step "Configuring environment..."
        if ! bash "$BOOTSTRAP_DIR/configure_env.sh"; then
            print_error "Environment configuration failed. Exiting."
            exit 1
        fi

        print_step "Deploying services..."
        if ! bash "$BOOTSTRAP_DIR/deploy_services.sh"; then
            print_error "Service deployment failed. Exiting."
            exit 1
        fi
    fi

    # Calculate total time
    local end_time=$(date +%s)
    local total_time=$((end_time - BOOTSTRAP_START_TIME))
    local minutes=$((total_time / 60))
    local seconds=$((total_time % 60))
    
    # Show completion message
    if [ "$TEST_MODE" = "true" ]; then
        if command -v print_summary_box >/dev/null 2>&1; then
            print_summary_box "TEST COMPLETE" "Bootstrap test completed successfully!
All validation checks passed.
Total time: ${minutes}m ${seconds}s" "success"
        else
            print_success "Bootstrap test completed successfully!"
            print_info "All validation checks passed."
            print_info "Total time: ${minutes}m ${seconds}s"
        fi
        
        if [ "$AUTO_MODE" = "true" ]; then
            print_success "Auto test mode completed - all systems validated"
        else
            print_success "Test mode completed - configuration and setup validated"
        fi
    else
        if command -v print_summary_box >/dev/null 2>&1; then
            print_summary_box "BOOTSTRAP COMPLETE" "All services are up and running!
Setup completed successfully.
Total time: ${minutes}m ${seconds}s" "success"
        else
            print_success "BOOTSTRAP COMPLETE"
            print_success "All services are up and running!"
            print_info "Setup completed successfully."
            print_info "Total time: ${minutes}m ${seconds}s"
        fi
        
        print_header "Next Steps"
        
        # Construct URLs based on local vs remote mode
        if [ "${BASE_DOMAIN_NAME:-localhost}" = "localhost" ]; then
            # Local mode: use ports
            echo "OpenWebUI: http://localhost:${OPENWEBUI_PORT:-5002}"
            echo "n8n: http://localhost:${N8N_PORT:-5001}"
            echo "Flowise: http://localhost:${FLOWISE_PORT:-5003}"
        else
            # Remote mode: use subdomains with HTTPS
            echo "OpenWebUI: https://${OPENWEBUI_SUBDOMAIN:-chat}.${BASE_DOMAIN_NAME}"
            echo "n8n: https://${N8N_SUBDOMAIN:-n8n}.${BASE_DOMAIN_NAME}"
            echo "Flowise: https://${FLOWISE_SUBDOMAIN:-flowise}.${BASE_DOMAIN_NAME}"
        fi
        echo ""
        echo "$ docker compose ps  # Check service status"
        echo "$ bash scripts/bootstrap/health_check.sh  # Run health check"
        echo "$ bash scripts/bootstrap/troubleshoot.sh  # If you encounter issues"
    fi
    
    # Cleanup (if function exists)
    if command -v cleanup_bootstrap_config >/dev/null 2>&1; then
        cleanup_bootstrap_config
    fi
}

# Run main function with all arguments
main "$@" 