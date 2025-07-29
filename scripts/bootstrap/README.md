# Bootstrap Scripts

This directory contains the bootstrap scripts for Seiling Buidlbox setup.

## Quick Start

```bash
# Run the main bootstrap script
./bootstrap.sh

# Select "default" profile for fastest setup with all defaults
```

## Architecture Overview

The bootstrap system uses a modular approach with clear separation of concerns:

- **Orchestration**: `bootstrap.sh` coordinates the entire setup process
- **Configuration**: `configure_env.sh` handles environment setup and profiles
- **Deployment**: `deploy_services.sh` focuses solely on Docker service management
- **Health Monitoring**: `health_check.sh` provides centralized service health checking
- **Troubleshooting**: `troubleshoot.sh` provides diagnostic and repair tools

## Available Scripts

### `bootstrap.sh` (Main Script)
The main bootstrap orchestrator that runs all setup steps:
1. OS detection (`detect_os.sh`)
2. Dependency installation (`install_deps.sh`) 
3. Project setup (`project_setup.sh`)
4. Environment configuration (`configure_env.sh`)
5. Service deployment (`deploy_services.sh`)

### `configure_env.sh`
Environment configuration with multiple profiles:

- **`default`**: Quick start with all defaults (no prompts)
- **`local-dev`**: Local development setup (no domain, no Ollama)
- **`remote`**: Remote production setup (requires domain)
- **`full`**: Full remote setup with Ollama
- **`full-local`**: Full local setup with Ollama
- **`custom`**: Interactive configuration for all options

Features:
- **Non-interactive wallet generation**: Prevents hanging during automated setup
- **Port configuration**: All services support custom ports via environment variables
- **Domain flexibility**: Supports both localhost and custom domain configurations

### `deploy_services.sh`
Streamlined Docker Compose service deployment and management:

**Key Features:**
- **Focused responsibility**: Only handles Docker service deployment and management
- **Service management menu**: Interactive options for start/stop/logs/troubleshooting
- **Flexible composition**: Dynamically includes only enabled services
- **Environment variable support**: All ports and domains configurable via `.env`

**Service Management Menu:**
1. Start Services
2. Stop Services  
3. Check Health (calls `health_check.sh`)
4. Show Logs
5. Troubleshoot Issues
6. Exit

### `health_check.sh` (New)
Dedicated service health monitoring script with comprehensive checking:

```bash
# Quick health check (faster, fewer retries)
./scripts/bootstrap/health_check.sh quick

# Full health check (comprehensive, more retries) 
./scripts/bootstrap/health_check.sh full

# Show help
./scripts/bootstrap/health_check.sh help
```

**Features:**
- **Standalone operation**: Can be run independently from any script
- **Two modes**: Quick (2 retries) for menu use, Full (3 retries) for deployment
- **Comprehensive coverage**: HTTP services, databases, and special service types
- **Smart detection**: Only checks services that are actually enabled
- **Consistent output**: Unified health check formatting across all scripts
- **Return codes**: Proper exit codes for scripting integration

**Supported Services:**
- **HTTP Services**: n8n, OpenWebUI, Flowise, Sei MCP Server, Cambrian Agent, Qdrant, Eliza
- **Databases**: PostgreSQL (with `pg_isready`), Redis, Neo4j
- **Optional Services**: Ollama (only checked if enabled)

### `generate_wallet.sh`
Standalone Sei Network wallet generator with enhanced reliability:

```bash
# Generate a new wallet interactively
bash scripts/bootstrap/generate_wallet.sh

# Generate wallet non-interactively (for automation)
bash scripts/bootstrap/generate_wallet.sh --non-interactive

# Test wallet generation methods
bash scripts/bootstrap/generate_wallet.sh --test
```

**Features:**
- **Non-interactive mode**: Prevents hanging when called from other scripts
- **Multiple generation methods**: Node.js, Python, OpenSSL with graceful fallbacks
- **Enhanced validation**: Private key length and format verification
- **Windows compatibility**: Multiple fallback methods for Git Bash/MinGW
- **Security warnings**: Clear guidance on proper key management

### `troubleshoot.sh`
Enhanced diagnostic and repair tool:

**Diagnostic Features:**
- **Integrated health checking**: Uses `health_check.sh` for consistent results
- **Container status monitoring**: Shows detailed container information
- **Failed container analysis**: Automatic log collection for failed services
- **System requirement validation**: Docker, Docker Compose availability

**Repair Options:**
1. View detailed logs
2. Restart all services
3. Restart specific service
4. Reset database
5. Fix common issues (line endings, permissions, image updates)

## Wallet Generation

The wallet generator supports multiple methods with enhanced reliability:

1. **Node.js + secp256k1** (preferred, if available)
2. **Python + secrets module** (fallback)  
3. **OpenSSL + random bytes** (last resort)

### Security Notes

⚠️ **Important**: Generated wallets are for development/testing purposes only.

- Keep private keys secure and secret
- Never share private keys in code or logs
- For production, use hardware wallets or secure key management
- Back up private keys safely and securely
- Use the `--non-interactive` flag for automated deployments

## Configuration Profiles

### Default Profile
- Uses all default settings
- No interactive prompts  
- Sets up local development environment
- Uses placeholder credentials (update manually)
- **Recommended for quickstart**

### Custom Profile
- Interactive prompts for all settings
- Choose individual services to enable/disable
- Custom subdomain configuration for production
- Wallet generation options
- Port and domain customization

## Environment Variables

All configuration is stored in `.env` file. Key variables:

### Core Configuration
```bash
# Profile and domain
PROFILE=default
BASE_DOMAIN_NAME=localhost

# Credentials (update these!)
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
SEI_PRIVATE_KEY=0xyour_sei_private_key_here
```

### Service Toggles
```bash
ENABLE_N8N=yes
ENABLE_OPENWEBUI=yes
ENABLE_ELIZA=yes
ENABLE_CAMBRIAN=yes
ENABLE_FLOWISE=yes
# ... etc
```

### Port Configuration
```bash
N8N_PORT=5001
OPENWEBUI_PORT=5002
FLOWISE_PORT=5003
MCP_SERVER_PORT=5004
ELIZA_PORT=5005
CAMBRIAN_AGENT_PORT=5006
# ... etc
```

## Troubleshooting

### Quick Health Check
```bash
# Fast health check for all services
./scripts/bootstrap/health_check.sh quick

# Comprehensive health check with retries
./scripts/bootstrap/health_check.sh full
```

### Common Issues

#### Wallet Generation Hanging
- **Cause**: Interactive prompts during automated setup
- **Solution**: Scripts now use `--non-interactive` flag automatically
- **Manual fix**: Run `bash scripts/bootstrap/generate_wallet.sh --non-interactive`

#### Health Checks Showing Unhealthy Services
- **Cause**: Services may still be starting up
- **Solution**: Wait 30-60 seconds and re-run health check
- **Check**: Review individual service logs: `docker logs seiling-<service-name>`

#### Port Conflicts
- **Cause**: Another service using required ports
- **Solution**: Configure custom ports in `.env` file
- **Check**: Use `netstat -an | grep <port>` to identify conflicts

#### Docker Issues
- **Cause**: Docker daemon not running or insufficient permissions
- **Solution**: Start Docker Desktop or run `sudo systemctl start docker`
- **Check**: Run `docker info` to verify Docker is accessible

### Manual Recovery
```bash
# Complete environment reset
rm .env
./bootstrap.sh

# Service-specific restart
docker restart seiling-<service-name>

# Full service reset
docker compose down
docker compose up -d
```

## Script Dependencies

```
bootstrap.sh
├── detect_os.sh
├── install_deps.sh  
├── project_setup.sh
├── configure_env.sh
│   └── generate_wallet.sh (--non-interactive)
└── deploy_services.sh
    ├── health_check.sh (full mode)
    └── troubleshoot.sh
        └── health_check.sh (quick mode)
```

The modular design ensures each script has a single responsibility while maintaining seamless integration. 