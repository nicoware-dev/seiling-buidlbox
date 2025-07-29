#!/bin/bash
# scripts/bootstrap/detect_os.sh
set -e

# Load shared configuration and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared_config.sh"

# OS detection
OS="unknown"
PKG_MANAGER=""
if [ "$(uname)" = "Darwin" ]; then
  OS="macos"
  PKG_MANAGER="brew"
  print_status "Detected macOS."
elif grep -qi microsoft /proc/version 2>/dev/null; then
  OS="wsl"
  print_status "Detected Windows Subsystem for Linux (WSL)."
  # Detect underlying Linux distro
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" =~ (ubuntu|debian) ]]; then
      PKG_MANAGER="apt"
    elif [[ "$ID" =~ (centos|rhel|fedora) ]]; then
      PKG_MANAGER="yum"
    fi
  fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
  OS="windows"
  PKG_MANAGER="choco"
  print_status "Detected Windows (Git Bash/MSYS2)."
  print_warning "This script is designed for Linux/WSL. Some features may not work on Windows."
elif [ -f /etc/os-release ]; then
  . /etc/os-release
  if [[ "$ID" =~ (ubuntu|debian) ]]; then
    OS="linux"
    PKG_MANAGER="apt"
    print_status "Detected Linux (Debian/Ubuntu)."
  elif [[ "$ID" =~ (centos|rhel|fedora) ]]; then
    OS="linux"
    PKG_MANAGER="yum"
    print_status "Detected Linux (CentOS/RHEL/Fedora)."
  else
    print_warning "Unknown Linux distribution. Attempting to use apt."
    OS="linux"
    PKG_MANAGER="apt"
  fi
else
  print_error "Unsupported OS. This script supports Linux, macOS, WSL, and Windows (Git Bash)."
  exit 1
fi

# WSL check
if [[ "$OS" == "wsl" ]]; then
  if ! grep -qi microsoft /proc/version; then
    print_warning "You are on Windows but not running under WSL. Please use WSL for this script."
  fi
fi

# Export for later scripts
export OS
export PKG_MANAGER

# Write to shared env file
SHARED_ENV_FILE="/tmp/seiling_bootstrap_env"
echo "export OS=\"$OS\"" > "$SHARED_ENV_FILE"
echo "export PKG_MANAGER=\"$PKG_MANAGER\"" >> "$SHARED_ENV_FILE"

print_status "OS detection complete: OS=$OS, PKG_MANAGER=$PKG_MANAGER (saved to $SHARED_ENV_FILE)"
exit 0 