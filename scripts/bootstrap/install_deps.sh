#!/bin/bash
# scripts/bootstrap/install_deps.sh
set -e

# Source shared env file for OS/PKG_MANAGER
envfile="/tmp/seiling_bootstrap_env"
if [ -f "$envfile" ]; then
  source "$envfile"
fi

# Colors for output
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

# Check for root or sudo (skip on Windows)
SUDO=""
if [[ "$OS" == "windows" ]]; then
  print_status "Running on Windows/Git Bash - skipping sudo checks."
elif [ "$EUID" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
    print_status "Using sudo for privileged commands."
  else
    print_error "This script requires root privileges or sudo. Please run as root or install sudo."
    exit 1
  fi
else
  SUDO=""
  print_status "Running as root."
fi

# Use OS/PKG_MANAGER from environment
if [ -z "$OS" ] || [ -z "$PKG_MANAGER" ]; then
  print_error "OS or PKG_MANAGER not set. Please run detect_os.sh first."
  exit 1
fi

# Wait for Docker daemon to be ready
wait_for_docker_daemon() {
    local timeout=${1:-60}
    local counter=0
    
    print_status "Waiting for Docker daemon to be ready..."
    while [ $counter -lt $timeout ]; do
        if docker info >/dev/null 2>&1; then
            print_status "Docker daemon is ready!"
            return 0
        fi
        sleep 2
        counter=$((counter + 2))
        printf "."
    done
    echo ""
    print_error "Docker daemon failed to start within $timeout seconds"
    return 1
}

# Install Docker Engine for Linux VPS/servers using official repositories
install_docker_engine_linux() {
    print_status "Installing Docker Engine for Linux server environment..."
    
    # Detect Linux distribution
    local distro_id=""
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        distro_id="$ID"
    fi
    
    if [[ "$distro_id" =~ (ubuntu|debian) ]]; then
        print_status "Installing Docker Engine for Ubuntu/Debian..."
        
        # Remove old versions
        $SUDO apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
        
        # Update package index and install prerequisites
        $SUDO apt-get update
        $SUDO apt-get install -y ca-certificates curl gnupg lsb-release
        
        # Add Docker's official GPG key
        $SUDO mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/$distro_id/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        
        # Add Docker repository
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$distro_id $(lsb_release -cs) stable" | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker Engine
        $SUDO apt-get update
        $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        
    elif [[ "$distro_id" =~ (centos|rhel|fedora) ]]; then
        print_status "Installing Docker Engine for CentOS/RHEL/Fedora..."
        
        # Remove old versions
        $SUDO yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine 2>/dev/null || true
        
        # Install prerequisites
        $SUDO yum install -y yum-utils
        
        # Add Docker repository
        $SUDO yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        
        # Install Docker Engine
        $SUDO yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        
    else
        print_warning "Unknown Linux distribution. Attempting fallback installation..."
        # Fallback to package manager detection
        if [[ "$PKG_MANAGER" == "apt" ]]; then
            $SUDO apt-get update
            $SUDO apt-get install -y docker.io docker-compose
        elif [[ "$PKG_MANAGER" == "yum" ]]; then
            $SUDO yum install -y docker docker-compose
        else
            print_error "Cannot install Docker on this Linux distribution: $distro_id"
            return 1
        fi
    fi
    
    # Enable and start Docker service
    if command -v systemctl >/dev/null 2>&1; then
        $SUDO systemctl enable docker
        $SUDO systemctl start docker
        print_status "Docker service enabled and started"
    else
        print_warning "systemctl not available. You may need to start Docker manually."
    fi
    
    # Add current user to docker group (avoid needing sudo for docker commands)
    if [ -n "$SUDO" ] && [ "$USER" != "root" ]; then
        $SUDO usermod -aG docker $USER
        print_status "Added user '$USER' to docker group"
        print_warning "Please log out and back in for group changes to take effect, or run 'newgrp docker'"
    fi
    
    # Wait for Docker daemon to be ready
    wait_for_docker_daemon 30
    
    print_status "Docker Engine installation completed successfully"
    return 0
}

# Install Docker Desktop for macOS local development
install_docker_desktop_macos() {
    print_status "Installing Docker Desktop for macOS..."
    
    if ! command -v brew >/dev/null 2>&1; then
        print_error "Homebrew not found. Please install Homebrew first."
        return 1
    fi
    
    # Install Docker Desktop using Homebrew Cask
    brew install --cask docker
    
    print_status "Starting Docker Desktop..."
    open /Applications/Docker.app
    
    # Wait for Docker Desktop to start (it takes longer than Docker Engine)
    wait_for_docker_daemon 120
    
    print_status "Docker Desktop installation completed successfully"
    return 0
}

# Ensure Docker is ready (install if needed, start daemon if needed)
ensure_docker_ready() {
    # Check if Docker command exists
    if ! command -v docker >/dev/null 2>&1; then
        print_status "Docker not found. Installing Docker..."
        
        if [[ "$OS" == "macos" ]]; then
            install_docker_desktop_macos
        elif [[ "$OS" == "windows" ]]; then
            install_docker_desktop_windows
        elif [[ "$OS" == "linux" || "$OS" == "wsl" ]]; then
            install_docker_engine_linux
        else
            print_error "Unsupported OS for automatic Docker installation: $OS"
            return 1
        fi
    else
        print_status "Docker command found"
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_status "Docker daemon not running. Attempting to start..."
        
        if [[ "$OS" == "macos" ]]; then
            # Try to start Docker Desktop on macOS
            if [ -d "/Applications/Docker.app" ]; then
                print_status "Starting Docker Desktop..."
                open /Applications/Docker.app
                wait_for_docker_daemon 120
            else
                print_error "Docker Desktop not found. Please install Docker Desktop for macOS."
                return 1
            fi
        elif [[ "$OS" == "windows" ]]; then
            # Try to start Docker Desktop on Windows
            start_docker_desktop_windows
        elif [[ "$OS" == "linux" || "$OS" == "wsl" ]]; then
            # Try to start Docker service on Linux
            if command -v systemctl >/dev/null 2>&1; then
                print_status "Starting Docker service..."
                $SUDO systemctl start docker
                wait_for_docker_daemon 30
            else
                print_error "Docker daemon not running and cannot start it automatically."
                return 1
            fi
        fi
    else
        print_status "Docker daemon is already running"
    fi
    
    # Verify Docker Compose is available
    if command -v docker-compose >/dev/null 2>&1; then
        print_status "docker-compose command available"
    elif docker compose version >/dev/null 2>&1; then
        print_status "docker compose plugin available"
    else
        print_error "Neither docker-compose nor 'docker compose' plugin found"
        return 1
    fi
    
    print_status "Docker is ready and operational"
    return 0
}

# Load Windows Docker helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ "$OS" == "windows" ]] && [ -f "$SCRIPT_DIR/windows_docker_helper.sh" ]; then
    source "$SCRIPT_DIR/windows_docker_helper.sh"
fi

# Different dependency lists for different OS types
if [[ "$OS" == "windows" ]]; then
  # Windows-specific dependency installation and setup
  print_status "Setting up Windows environment..."
  
  # Check and install Git (prerequisite for cloning repo remotely)
  if ! command -v git >/dev/null 2>&1; then
    print_status "Git not found. Attempting to install..."
    if ! install_windows_package "Git" "git" "Git.Git"; then
      print_error "Failed to install Git automatically."
      print_info "Please install Git manually from: https://git-scm.com/download/win"
      print_info "After installation, restart this script."
      exit 1
    fi
  else
    print_status "✓ git already installed"
  fi
  
  # Check and install Python
  if ! command -v python3 >/dev/null 2>&1 && ! command -v python >/dev/null 2>&1; then
    print_status "Python not found. Attempting to install..."
    if ! install_windows_package "Python" "python" "Python.Python.3"; then
      print_warning "Failed to install Python automatically."
      print_info "Please install Python manually from: https://www.python.org/downloads/"
      print_info "After installation, restart this script."
      # Don't exit - Python is not strictly required for Docker setup
    fi
  else
    if command -v python3 >/dev/null 2>&1; then
      print_status "✓ python3 available"
    elif command -v python >/dev/null 2>&1; then
      print_status "✓ python available"
    fi
  fi
  
  # Handle Docker installation and setup using our specialized Windows functions
  print_status "Setting up Docker on Windows..."
  if ! setup_docker_windows; then
    print_error "Docker setup failed. Please check the instructions above."
    exit 1
  fi
  
  print_status "✅ All Windows dependencies installed and verified successfully."
  print_info "Windows environment is ready for Seiling Buidlbox deployment."
  exit 0
fi

# Linux/macOS/WSL dependencies
REQUIRED_PKG=("curl" "git" "python3")

# Add python3-pip for Linux distributions
if [[ "$OS" != "macos" ]]; then
  REQUIRED_PKG+=("python3-pip")
fi

# Function to install regular packages (non-Docker)
install_pkg() {
  PKG_NAME="$1"
  if [[ "$PKG_MANAGER" == "apt" ]]; then
    $SUDO apt-get update -y
    $SUDO apt-get install -y "$PKG_NAME"
  elif [[ "$PKG_MANAGER" == "yum" ]]; then
    $SUDO yum install -y "$PKG_NAME"
  elif [[ "$PKG_MANAGER" == "brew" ]]; then
    brew install "$PKG_NAME"
  else
    print_error "Unknown package manager: $PKG_MANAGER. Cannot install $PKG_NAME."
    exit 1
  fi
}

# Install regular dependencies first
for pkg in "${REQUIRED_PKG[@]}"; do
  # Special case for python3-pip on macOS
  if [[ "$pkg" == "python3-pip" && "$OS" == "macos" ]]; then
    if ! command -v pip3 >/dev/null 2>&1; then
      print_status "Installing python3 (includes pip3)..."
      brew install python3
    else
      print_status "pip3 already installed."
    fi
    continue
  fi
  
  # Special case for python3-pip on yum
  if [[ "$pkg" == "python3-pip" && "$PKG_MANAGER" == "yum" ]]; then
    if ! command -v pip3 >/dev/null 2>&1; then
      print_status "Installing python3-pip..."
      $SUDO yum install -y python3-pip || $SUDO yum install -y python36-pip
    else
      print_status "pip3 already installed."
    fi
    continue
  fi
  
  # Special case for python3-pip on apt
  if [[ "$pkg" == "python3-pip" && "$PKG_MANAGER" == "apt" ]]; then
    if ! command -v pip3 >/dev/null 2>&1; then
      print_status "Installing python3-pip..."
      $SUDO apt-get install -y python3-pip
    else
      print_status "pip3 already installed."
    fi
    continue
  fi
  
  # Regular package installation
  if ! command -v $pkg >/dev/null 2>&1; then
    print_status "Installing $pkg..."
    install_pkg "$pkg"
  else
    print_status "$pkg already installed."
  fi
done

# Handle Docker installation and setup separately
print_status "Setting up Docker..."
ensure_docker_ready

print_status "All dependencies installed and verified successfully."
exit 0
