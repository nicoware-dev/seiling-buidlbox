# Quick Start Guide

> **Get Seiling Buidlbox Running in 5 Minutes**

## Prerequisites

### System Requirements
- **4GB+ RAM** minimum
- **10GB+ Storage** for all services
- **Internet connection** for downloading dependencies

### Auto-Installed Dependencies
The bootstrap script automatically installs:
- **Git** (if not present)
- **Docker & Docker Compose** (latest version)
- **Python3** and other system dependencies

#### Platform-Specific Notes
- **Linux/macOS**: Fully automated installation from official repositories
- **Windows**: Automated via Chocolatey/winget package managers
- **WSL**: Recommended for Windows users (best experience)

### Required Credentials
- **OpenAI API Key**: `sk-proj-...` (for ElizaOS and Cambrian agents)
- **Sei Private Key**: `0x...` (for blockchain operations)

## Installation

### Option 1: One-Line Install (Recommended)
```bash
# Interactive setup with prompts
curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash

# Automatic setup with defaults (no prompts)
curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash -s -- -auto

# If you get permission errors, run with sudo:
curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | sudo bash
```

> **Note**: 
> - If you encounter permission errors (especially on fresh VMs), run the command with `sudo` to allow automatic installation of dependencies like Git and Docker.
> - Dependency installation may take 5-15 minutes on fresh VMs as it downloads and installs Docker, Python, and other packages. The script has no timeout for this step to ensure reliability.

### Option 2: Local Clone
```bash
git clone https://github.com/nicoware-dev/seiling-buidlbox.git
cd seiling-buidlbox
./bootstrap.sh
```

### Option 3: Windows-Specific Setup

#### Windows with WSL 2 (Recommended)
```bash
# Install WSL 2 first (if not already installed)
wsl --install

# Then run in WSL 2 Ubuntu
curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash
```

#### Windows with Git Bash/PowerShell
```bash
# In Git Bash or PowerShell (run as Administrator for first-time setup)
curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash
```

#### Windows Package Manager Prerequisites
For best results, install a package manager first:
```powershell
# Install Chocolatey (recommended)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Or use built-in winget (Windows 10 1809+ / Windows 11)
winget --version
```

## Setup Process

### 1. Select Profile
When prompted, choose:
- **default**: Quick setup with all defaults (recommended)
- **local-dev**: Local development setup
- **remote**: Production with domain
- **custom**: Full customization

### 2. Enter Credentials
```bash
OpenAI API Key: sk-proj-your_key_here
Sei Private Key: 0xyour_private_key_here
```
> **Note**: The script can generate a Sei wallet if you don't have one

### 3. Wait for Deployment
The script will automatically:
- Install dependencies (Docker, Git)
- Create `.env` configuration file
- Start all services via Docker Compose
- Run health checks
- Show access URLs

## Access Your Platform

### Main Services
After deployment completes:

| Service | URL | Purpose |
|---------|-----|---------|
| **OpenWebUI** | http://localhost:5002 | Primary chat interface |
| **n8n** | http://localhost:5001 | Workflow builder |
| **Flowise** | http://localhost:5003 | Agent builder |
| **ElizaOS** | http://localhost:5005 | AI framework |
| **Cambrian** | http://localhost:5006 | Multi-modal agents |
| **Sei MCP** | http://localhost:5004 | Blockchain operations |

### Default Credentials
- **Flowise**: admin / seiling123
- **Neo4j**: neo4j / seiling123
- **All database passwords**: seiling123

## Quick Test

### 1. Test OpenWebUI
1. Open http://localhost:5002
2. Try chatting with the AI
3. Verify it responds

### 2. Test n8n Workflows
1. Open http://localhost:5001
2. Create a new workflow
3. Add a simple HTTP trigger

### 3. Test Flowise Agents
1. Open http://localhost:5003
2. Login with admin / seiling123
3. Create a simple chatflow

## Health Monitoring

### Check Service Health
```bash
# Quick health check for all services
bash scripts/bootstrap/health_check.sh quick

# Full health check with retries
bash scripts/bootstrap/health_check.sh full

# Check specific service logs
docker logs seiling-<service-name>
```

### Available Services
```bash
# View all running services
docker compose ps

# Check service status
bash scripts/bootstrap/health_check.sh quick
```

## Common Issues

### Docker Not Running
```bash
# Linux
sudo systemctl start docker

# Windows/Mac
# Start Docker Desktop
```

### Permission Issues
```bash
# Make scripts executable
chmod +x bootstrap.sh
chmod +x scripts/bootstrap/*.sh
```

### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :5678

# Kill conflicting process
sudo kill -9 <PID>
```

### Service Won't Start
```bash
# Check specific service logs
docker logs seiling-<service-name>

# Restart specific service
docker restart seiling-<service-name>

# Restart all services
docker compose restart
```

### API Key Issues
```bash
# Edit environment file
nano .env

# Add missing keys:
# OPENAI_API_KEY=sk-proj-your_key
# SEI_PRIVATE_KEY=0xyour_key

# Restart affected services
docker compose restart
```

## Troubleshooting

### Automated Diagnostics
```bash
# Run full diagnostic
bash scripts/bootstrap/troubleshoot.sh

# Generate new wallet if needed
bash scripts/bootstrap/generate_wallet.sh
```

### Manual Fixes
```bash
# View all logs
docker compose logs

# Reset everything (WARNING: loses data)
docker compose down -v
./bootstrap.sh

# Update services
docker compose pull
docker compose up -d
```

## Next Steps

1. **Explore OpenWebUI**: Start chatting with AI agents
2. **Build n8n Workflows**: Create automation workflows
3. **Create Flowise Agents**: Build custom conversational agents
4. **Try ElizaOS**: Advanced AI interactions
5. **Use Sei MCP**: Blockchain operations

## Need Help?

- **Health Check**: `bash scripts/bootstrap/health_check.sh quick`
- **Troubleshoot**: `bash scripts/bootstrap/troubleshoot.sh`
- **View Logs**: `docker compose logs`
- **Reset System**: `docker compose down -v && ./bootstrap.sh`

---

**You're ready to build AI agents on Sei Network!** 🚀 