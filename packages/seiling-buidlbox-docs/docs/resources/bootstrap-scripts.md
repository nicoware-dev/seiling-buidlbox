# Bootstrap Scripts

> **One-command deployment system**

The bootstrap script handles everything from dependency installation to service deployment with a single command.

## Main Script

### bootstrap.sh
**Purpose**: One-command setup for entire system

```bash
./bootstrap.sh
# Follow prompts to configure and deploy
```

**What it does**:
1. Detects your operating system
2. Installs Docker and dependencies
3. Clones/sets up project
4. Configures environment
5. Deploys all services
6. Runs health checks

## Script Components

### Core Scripts
| Script | Purpose | When Used |
|--------|---------|-----------|
| `detect_os.sh` | OS detection | Automatic |
| `install_deps.sh` | Install Docker, Git | Automatic |
| `configure_env.sh` | Create .env file | Automatic |
| `deploy_services.sh` | Start Docker services | Automatic |

### Utility Scripts
| Script | Purpose | Usage |
|--------|---------|-------|
| `health_check.sh` | Check service status | Manual |
| `generate_wallet.sh` | Create Sei wallet | Manual |
| `troubleshoot.sh` | Diagnose problems | Manual |

## Configuration Profiles

### default (Recommended)
- No prompts, uses all defaults
- Fastest setup
- Good for most users

### local-dev
- Lightweight development setup
- Few prompts for basic options

### remote
- Production setup with domain
- SSL certificates via Traefik

### custom
- Full interactive configuration
- Choose all options manually

## Usage Examples

### Quick Setup
```bash
# Automatic setup with defaults
./bootstrap.sh
# Select "default" when prompted
```

### Custom Setup
```bash
# Interactive configuration
./bootstrap.sh
# Select "custom" for full control
```

### Health Monitoring
```bash
# Quick health check
bash scripts/bootstrap/health_check.sh quick

# Full health check
bash scripts/bootstrap/health_check.sh full
```

### Troubleshooting
```bash
# Diagnose issues
bash scripts/bootstrap/troubleshoot.sh

# Generate new wallet
bash scripts/bootstrap/generate_wallet.sh
```

## Environment Configuration

### Automatic Generation
The bootstrap script creates `.env` file automatically based on:
- Selected profile
- User inputs (API keys, domain)
- System detection (OS, available ports)

### Profile Comparison
| Setting | default | local-dev | remote | custom |
|---------|---------|-----------|--------|--------|
| Prompts | None | Few | Some | All |
| Domain | localhost | localhost | Required | Choice |
| SSL | No | No | Yes | Choice |
| Ollama | No | No | Optional | Choice |

## Script Features

### Error Handling
- Fails fast on errors
- Clear error messages
- Recovery suggestions
- Automatic retries

### Cross-Platform
- **Linux**: Native support
- **macOS**: Full compatibility
- **Windows**: WSL recommended
- **WSL**: Optimized experience

### Non-Interactive Mode
```bash
# Automated deployment (CI/CD)
curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash -s -- -auto
```

## Common Issues

### Permission Errors
```bash
# Make executable
chmod +x bootstrap.sh
chmod +x scripts/bootstrap/*.sh
```

### Docker Issues
```bash
# Start Docker daemon
sudo systemctl start docker  # Linux
# Or restart Docker Desktop   # Windows/Mac
```

### Network Issues
```bash
# Check connectivity
curl -I https://github.com
ping google.com
```

### Resource Issues
```bash
# Check available resources
free -h    # RAM
df -h      # Disk space
```

## Advanced Usage

### Environment Override
```bash
# Set custom variables before running
export OPENAI_API_KEY=your_key
export SEI_PRIVATE_KEY=0xyour_key
./bootstrap.sh
```

### Partial Deployment
```bash
# Skip dependency installation
export SKIP_DEPS=true
./bootstrap.sh
```

### Debug Mode
```bash
# Verbose output
bash -x bootstrap.sh
```

## Manual Operations

### Reset System
```bash
# Complete reset
docker compose down -v
rm .env
./bootstrap.sh
```

### Update Services
```bash
# Update Docker images
docker compose pull
docker compose up -d
```

### Service Management
```bash
# Individual service control
docker restart seiling-<service>
docker logs seiling-<service>
```

---

**The bootstrap script is designed to be foolproof.** Just run it and everything works automatically. 