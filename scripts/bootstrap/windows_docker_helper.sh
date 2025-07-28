#!/bin/bash
# scripts/bootstrap/windows_docker_helper.sh
# Windows-specific Docker Desktop installation and management functions

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
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Wait for Docker daemon to be ready (Windows-specific with longer timeout)
wait_for_docker_daemon_windows() {
    local timeout=${1:-180}  # Default 3 minutes for Windows
    local counter=0
    
    print_status "Waiting for Docker Desktop to be ready (this may take up to 3 minutes)..."
    while [ $counter -lt $timeout ]; do
        if docker info >/dev/null 2>&1; then
            print_status "Docker Desktop is ready!"
            return 0
        fi
        sleep 3
        counter=$((counter + 3))
        
        # Progress feedback every 30 seconds
        if [ $((counter % 30)) -eq 0 ] && [ $counter -lt $timeout ]; then
            print_status "Still waiting for Docker Desktop... (${counter}s elapsed)"
        fi
    done
    echo ""
    print_error "Docker Desktop failed to start within $timeout seconds"
    return 1
}

# Start Docker Desktop on Windows if installed but not running
start_docker_desktop_windows() {
    print_status "Attempting to start Docker Desktop..."
    
    # Common Docker Desktop installation paths on Windows
    local docker_desktop_paths=(
        "/c/Program Files/Docker/Docker/Docker Desktop.exe"
        "/c/Users/$USER/AppData/Local/Docker/Docker Desktop.exe"
        "/c/Program Files (x86)/Docker/Docker/Docker Desktop.exe"
    )
    
    # Try to find and start Docker Desktop executable
    for path in "${docker_desktop_paths[@]}"; do
        if [ -f "$path" ]; then
            print_status "Starting Docker Desktop via: $path"
            "$path" &
            wait_for_docker_daemon_windows 180
            return $?
        fi
    done
    
    # Fallback: try PowerShell if available
    if command -v powershell.exe >/dev/null 2>&1; then
        print_status "Starting Docker Desktop via PowerShell..."
        powershell.exe -Command "Start-Process 'Docker Desktop'" 2>/dev/null &
        wait_for_docker_daemon_windows 180
        return $?
    fi
    
    # Fallback: try cmd if available
    if command -v cmd.exe >/dev/null 2>&1; then
        print_status "Starting Docker Desktop via cmd..."
        cmd.exe /c "start \"Docker Desktop\" \"C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe\"" 2>/dev/null &
        wait_for_docker_daemon_windows 180
        return $?
    fi
    
    print_error "Could not start Docker Desktop automatically."
    print_info "Please start Docker Desktop manually from the Start menu and wait for it to be ready."
    print_info "Then re-run this script."
    return 1
}

# Install Docker Desktop for Windows using available package managers
install_docker_desktop_windows() {
    print_status "Installing Docker Desktop for Windows..."
    
    # Check if Docker Desktop is already installed but not in PATH
    if [ -f "/c/Program Files/Docker/Docker/Docker Desktop.exe" ] || [ -f "/c/Users/$USER/AppData/Local/Docker/Docker Desktop.exe" ]; then
        print_status "Docker Desktop appears to be installed. Attempting to start..."
        start_docker_desktop_windows
        return $?
    fi
    
    # Try Chocolatey first (most reliable)
    if command -v choco >/dev/null 2>&1; then
        print_status "Using Chocolatey to install Docker Desktop..."
        if choco install docker-desktop -y; then
            print_status "Docker Desktop installed via Chocolatey. Starting..."
            start_docker_desktop_windows
            return $?
        else
            print_warning "Chocolatey installation failed, trying alternative methods..."
        fi
    fi
    
    # Try winget (built into Windows 10/11)
    if command -v winget >/dev/null 2>&1; then
        print_status "Using winget to install Docker Desktop..."
        if winget install Docker.DockerDesktop --accept-package-agreements --accept-source-agreements --silent; then
            print_status "Docker Desktop installed via winget. Starting..."
            start_docker_desktop_windows
            return $?
        else
            print_warning "winget installation failed, falling back to manual instructions..."
        fi
    fi
    
    # If automated installation fails, provide clear manual instructions
    print_warning "Automatic Docker Desktop installation failed."
    print_info ""
    print_info "Please install Docker Desktop manually:"
    print_info "1. Download from: https://www.docker.com/products/docker-desktop/"
    print_info "2. Run the installer as Administrator"
    print_info "3. Enable WSL 2 backend when prompted (recommended)"
    print_info "4. Restart your computer if prompted"
    print_info "5. Start Docker Desktop from the Start menu"
    print_info "6. Re-run this bootstrap script"
    print_info ""
    print_info "Alternative: Install via package manager:"
    print_info "  Chocolatey: choco install docker-desktop"
    print_info "  winget: winget install Docker.DockerDesktop"
    print_info ""
    return 1
}

# Check if package managers are available and suggest installation
check_windows_package_managers() {
    local has_package_manager=false
    
    if command -v choco >/dev/null 2>&1; then
        print_status "✓ Chocolatey package manager available"
        has_package_manager=true
    fi
    
    if command -v winget >/dev/null 2>&1; then
        print_status "✓ winget package manager available"
        has_package_manager=true
    fi
    
    if [ "$has_package_manager" = false ]; then
        print_warning "No package managers found. Consider installing Chocolatey for easier automation:"
        print_info "Install Chocolatey: https://chocolatey.org/install"
        print_info "Or use built-in winget (Windows 10 1809+ / Windows 11)"
    fi
    
    return 0
}

# Install a package using available Windows package managers
install_windows_package() {
    local package_name="$1"
    local choco_name="$2"
    local winget_name="$3"
    
    if command -v choco >/dev/null 2>&1; then
        print_status "Installing $package_name via Chocolatey..."
        if choco install "$choco_name" -y; then
            print_status "$package_name installed successfully via Chocolatey"
            return 0
        else
            print_warning "Chocolatey installation of $package_name failed"
        fi
    fi
    
    if command -v winget >/dev/null 2>&1; then
        print_status "Installing $package_name via winget..."
        if winget install "$winget_name" --accept-package-agreements --accept-source-agreements --silent; then
            print_status "$package_name installed successfully via winget"
            return 0
        else
            print_warning "winget installation of $package_name failed"
        fi
    fi
    
    return 1
}

# Comprehensive Windows Docker setup function
setup_docker_windows() {
    print_status "Setting up Docker on Windows..."
    
    # Check for package managers
    check_windows_package_managers
    
    # Check if Docker command exists
    if ! command -v docker >/dev/null 2>&1; then
        print_status "Docker not found. Installing Docker Desktop..."
        if ! install_docker_desktop_windows; then
            return 1
        fi
    else
        print_status "Docker command found"
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_status "Docker daemon not running. Attempting to start Docker Desktop..."
        if ! start_docker_desktop_windows; then
            return 1
        fi
    else
        print_status "Docker daemon is already running"
    fi
    
    # Verify Docker Compose is available
    if command -v docker-compose >/dev/null 2>&1; then
        print_status "✓ docker-compose command available"
    elif docker compose version >/dev/null 2>&1; then
        print_status "✓ docker compose plugin available"
    else
        print_error "Neither docker-compose nor 'docker compose' plugin found"
        print_info "This should be included with Docker Desktop. Please reinstall Docker Desktop."
        return 1
    fi
    
    print_status "✓ Docker is ready and operational on Windows"
    return 0
} 