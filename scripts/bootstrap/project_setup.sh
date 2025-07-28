#!/bin/bash
# scripts/bootstrap/project_setup.sh
set -e

# Load shared configuration and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared_config.sh"

# Source shared env file for OS/PKG_MANAGER
envfile="/tmp/seiling_bootstrap_env"
if [ -f "$envfile" ]; then
  source "$envfile"
fi

REPO_URL="https://github.com/nicoware-dev/seiling-buidlbox.git"
PROJECT_DIR="seiling-buidlbox"

# If running inside a git repo, skip cloning prompt and continue with existing setup
if [ -d .git ]; then
  print_mode_aware "info" "Repository already exists, continuing with existing setup."
  
  # Check/init submodules if needed
  if [ -f .gitmodules ]; then
    if git submodule status | grep -q '^-' ; then
      print_mode_aware "info" "Initializing git submodules..."
      if [ "$TEST_MODE" = "true" ]; then
        print_mode_aware "info" "TEST MODE: Would initialize submodules"
      else
        git submodule update --init --recursive
      fi
    else
      print_mode_aware "info" "Git submodules already initialized."
    fi
  else
    print_mode_aware "info" "No submodules to initialize."
  fi
  print_mode_aware "success" "Project setup complete."
  exit 0
fi

# Check if project directory exists and is a git repo
if [ -d "$PROJECT_DIR/.git" ]; then
  print_mode_aware "info" "Project repository already present. Skipping clone."
  cd "$PROJECT_DIR"
  # Check if submodules are initialized
  if [ -f .gitmodules ]; then
    if git submodule status | grep -q '^-' ; then
      print_mode_aware "info" "Initializing git submodules..."
      if [ "$TEST_MODE" = "true" ]; then
        print_mode_aware "info" "TEST MODE: Would initialize submodules"
      else
        git submodule update --init --recursive
      fi
    else
      print_mode_aware "info" "Git submodules already initialized."
    fi
  else
    print_mode_aware "info" "No submodules to initialize."
  fi
  print_mode_aware "success" "Project setup complete."
  exit 0
fi

# Clone if not present
print_mode_aware "info" "Project not found. Cloning repository automatically..."
if git clone "$REPO_URL" "$PROJECT_DIR"; then
  print_status "Repository cloned."
else
  print_error "Failed to clone repository."
  exit 1
fi
cd "$PROJECT_DIR"

# Initialize submodules if needed
if [ -f .gitmodules ]; then
  print_status "Initializing git submodules..."
  git submodule update --init --recursive
else
  print_status "No submodules to initialize."
fi

print_status "Project setup complete."
exit 0 