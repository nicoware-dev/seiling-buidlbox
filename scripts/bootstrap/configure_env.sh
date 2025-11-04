#!/bin/bash
# scripts/bootstrap/configure_env.sh
set -e

# Get script directory and load shared configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load shared configuration first
if [ -f "$SCRIPT_DIR/shared_config.sh" ]; then
    source "$SCRIPT_DIR/shared_config.sh"
    # Also try to load any existing bootstrap config
    load_bootstrap_config || true
else
    # Fallback if shared config not available
    print_success() { echo "[SUCCESS] $1"; }
    print_error() { echo "[ERROR] $1" >&2; }
    print_warning() { echo "[WARNING] $1"; }
    print_info() { echo "[INFO] $1"; }
    print_status() { echo "[INFO] $1"; }
    print_mode_aware() { 
        local level="$1"; local message="$2"
        case "$level" in
            "success") print_success "$message" ;;
            "error") print_error "$message" ;;
            "warning") print_warning "$message" ;;
            "info") print_info "$message" ;;
            *) echo "$message" ;;
        esac
    }
fi

# Source shared env file for OS/PKG_MANAGER
envfile="/tmp/seiling_bootstrap_env"
if [ -f "$envfile" ]; then
  source "$envfile"
fi

ENV_FILE=".env"

# If .env exists, ask if user wants to reconfigure (skip in auto mode only)
if [ -f "$ENV_FILE" ]; then
  if [ "$AUTO_MODE" = "true" ]; then
    print_mode_aware "info" "$ENV_FILE already exists. Auto mode: reconfiguring automatically."
  else
    print_mode_aware "info" "$ENV_FILE already exists."
    if [ "$TEST_MODE" = "true" ]; then
      print_mode_aware "info" "Test mode: You can test the configuration process"
    fi
    read -p "Do you want to reconfigure the environment? [y/N]: " reconfig
    if [[ ! "$reconfig" =~ ^[Yy]$ ]]; then
      print_mode_aware "info" "Skipping environment configuration."
      exit 0
    fi
  fi
fi

if [ "$TEST_MODE" = "true" ]; then
  print_mode_aware "info" "Test mode: Would write .env to $ENV_FILE (pwd: $(pwd))"
else
  print_mode_aware "info" "Writing .env to $ENV_FILE (pwd: $(pwd))"
fi

# Handle profile selection based on mode
if [ "$AUTO_MODE" = "true" ]; then
  # Auto mode: use default profile automatically
  PROFILE="default"
  print_mode_aware "info" "Auto mode: Using '$PROFILE' profile"
else
  # Interactive mode (including test mode): show profile menu
  if [ "$TEST_MODE" = "true" ]; then
    print_mode_aware "info" "Test mode: Interactive configuration (deployment will be mocked)"
  fi
  
  # Always use the simple, reliable menu approach
  PROFILES=("default" "local-dev" "remote" "full" "full-local" "custom")
  PROFILE_DESCRIPTIONS=(
    "Quick start with all defaults (recommended for testing)"
    "Local development setup (no domain required, lightweight)"
    "Remote production setup (requires domain configuration)"
    "Full remote setup with Ollama (requires domain and resources)"
    "Full local setup with Ollama (no domain, more resources needed)"
    "Custom interactive configuration (full control)"
  )

  echo ""
  echo "┌─────────────────────────────────────────────────────────────────┐"
  echo "│                    SEILING SETUP PROFILES                      │"
  echo "└─────────────────────────────────────────────────────────────────┘"
  echo ""
  
  for i in "${!PROFILES[@]}"; do
    number=$((i + 1))
    echo "$number) ${PROFILES[$i]}"
    echo "   ${PROFILE_DESCRIPTIONS[$i]}"
    echo ""
  done

  while true; do
    read -p "Select a setup profile (1-${#PROFILES[@]}) [default: 1]: " choice
    choice=${choice:-1}
    
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#PROFILES[@]}" ]; then
      PROFILE="${PROFILES[$((choice - 1))]}"
      print_mode_aware "info" "Selected profile: $PROFILE"
      break
    else
      print_mode_aware "warning" "Invalid choice. Please select 1-${#PROFILES[@]}"
    fi
  done
fi

# Handle profiles that use defaults
if [[ "$PROFILE" == "default" ]]; then
  print_status "Using default profile - all settings will use defaults, no prompts."
  MAIN_DOMAIN="localhost"
  USE_DEFAULTS=true
elif [[ "$PROFILE" == "local-dev" ]]; then
  print_status "Using local-dev profile - lightweight setup with defaults."
  MAIN_DOMAIN="localhost"
  USE_DEFAULTS=true
else
  USE_DEFAULTS=false
fi

# Main domain logic for interactive profiles
if [[ "$USE_DEFAULTS" == "false" ]]; then
  if [[ "$PROFILE" == "full-local" ]]; then
    MAIN_DOMAIN="localhost"
    print_status "Full-local profile selected. Domain set to 'localhost'."
  else
    read -p "Enter your main domain (e.g., seiling.domain.xyz) [default: seiling.domain.xyz]: " MAIN_DOMAIN
    MAIN_DOMAIN=${MAIN_DOMAIN:-seiling.domain.xyz}
    if [ "$TEST_MODE" = "true" ]; then
      print_mode_aware "info" "Test mode: Would use domain '$MAIN_DOMAIN'"
    fi
  fi
fi

# Service enable/disable variables
SERVICES=(
  TRAEFIK
  CADDY
  CLOUDFLARED
  OLLAMA
  N8N
  OPENWEBUI
  FLOWISE
  SEI_MCP
  SEI_MCP_V2
  ELIZA
  CAMBRIAN
  CAPTAIN
  OS
  BUILDER
  AUDITOR
  POSTGRES
  REDIS
  QDRANT
  NEO4J
  LANGFUSE
  PROMETHEUS
  SEARXNG
  SUPABASE
  KOKORO
)

# Function to set service enable status (compatible with older bash)
set_service_enable() {
  local service="$1"
  local value="$2"
  eval "ENABLE_${service}=\"${value}\""
}

# Function to get service enable status
get_service_enable() {
  local service="$1"
  eval "echo \$ENABLE_${service}"
}

if [[ "$PROFILE" == "custom" ]]; then
  for svc in "${SERVICES[@]}"; do
    default="y"
    if [[ "$svc" == "OLLAMA" || "$svc" == "TRAEFIK" ]]; then
      default="n"
    fi
    read -p "Enable $svc? [y/n, default: $default]: " yn
    yn=${yn:-$default}
    if [[ "$yn" =~ ^[Yy]$ ]]; then
      set_service_enable "$svc" "yes"
      if [ "$TEST_MODE" = "true" ]; then
        print_mode_aware "debug" "Test mode: Would enable $svc"
      fi
    else
      set_service_enable "$svc" "no"
      if [ "$TEST_MODE" = "true" ]; then
        print_mode_aware "debug" "Test mode: Would disable $svc"
      fi
    fi
  done
else
  # Set sensible defaults for each profile
  for svc in "${SERVICES[@]}"; do
    case "$PROFILE" in
      default|local-dev)
        if [[ "$svc" == "TRAEFIK" || "$svc" == "OLLAMA" ]]; then
          set_service_enable "$svc" "no"
        else
          set_service_enable "$svc" "yes"
        fi
        ;;
      remote)
        if [[ "$svc" == "OLLAMA" ]]; then
          set_service_enable "$svc" "no"
        else
          set_service_enable "$svc" "yes"
        fi
        ;;
      full)
        set_service_enable "$svc" "yes"
        ;;
      full-local)
        if [[ "$svc" == "TRAEFIK" || "$svc" == "CADDY" || "$svc" == "CLOUDFLARED" ]]; then
          set_service_enable "$svc" "no"
        else
          set_service_enable "$svc" "yes"
        fi
        ;;
    esac
  done
fi

# Reverse proxy selection (interactive profiles only; force disabled for full-local)
if [[ "$PROFILE" == "full-local" ]]; then
  set_service_enable "TRAEFIK" "no"
  set_service_enable "CADDY" "no"
  set_service_enable "CLOUDFLARED" "no"
elif [[ "$PROFILE" == "full" || "$PROFILE" == "remote" || "$PROFILE" == "custom" ]]; then
  echo ""
  echo "Reverse proxy selection:"
  echo "1) Traefik (80/443/8080)"
  echo "2) Caddy (80/443)"
  echo "3) None"
  read -p "Choose proxy [default: 1]: " PROXY_CHOICE
  PROXY_CHOICE=${PROXY_CHOICE:-1}
  case "$PROXY_CHOICE" in
    1)
      set_service_enable "TRAEFIK" "yes"
      set_service_enable "CADDY" "no"
      ;;
    2)
      set_service_enable "TRAEFIK" "no"
      set_service_enable "CADDY" "yes"
      ;;
    3|*)
      set_service_enable "TRAEFIK" "no"
      set_service_enable "CADDY" "no"
      ;;
  esac

  read -p "Enable Cloudflared tunnel? [y/N]: " CF_CHOICE
  if [[ "$CF_CHOICE" =~ ^[Yy]$ ]]; then
    set_service_enable "CLOUDFLARED" "yes"
  else
    set_service_enable "CLOUDFLARED" "no"
  fi
fi

# Prompt for secrets and credentials
if [[ "$USE_DEFAULTS" == "true" ]]; then
  print_status "Using default credentials for quick setup..."
  OPENAI_API_KEY="sk-proj-your_openai_api_key_here"
  SEI_PRIVATE_KEY="0xyour_sei_private_key_here"
  POSTGRES_PASSWORD="seiling123"
  N8N_ENCRYPTION_KEY="seiling-encryption-key"
  N8N_USER_MANAGEMENT_JWT_SECRET="seiling-jwt-secret"
  WEBUI_SECRET_KEY="seiling-webui-secret"
  FLOWISE_PASSWORD="seiling123"
  
  print_warning "REMINDER: Update your API keys and private key in .env after setup!"
else
  read -p "OpenAI API Key [default: sk-proj-your_openai_api_key_here]: " OPENAI_API_KEY
  OPENAI_API_KEY=${OPENAI_API_KEY:-sk-proj-your_openai_api_key_here}
  if [ "$TEST_MODE" = "true" ]; then
    print_mode_aware "debug" "Test mode: Would use OpenAI API Key: ${OPENAI_API_KEY:0:15}..."
  fi
  
  echo ""
  print_status "Sei Private Key Options:"
  echo "1. Enter existing private key"
  echo "2. Generate new wallet automatically"
  echo "3. Use default placeholder"
  read -p "Choose option (1-3) [default: 3]: " key_option
  key_option=${key_option:-3}
  
  case $key_option in
    1)
      read -p "Enter your Sei Private Key: " SEI_PRIVATE_KEY
      SEI_PRIVATE_KEY=${SEI_PRIVATE_KEY:-0xyour_sei_private_key_here}
      if [ "$TEST_MODE" = "true" ]; then
        print_mode_aware "debug" "Test mode: Would use provided private key: ${SEI_PRIVATE_KEY:0:10}..."
      fi
      ;;
    2)
      if [ "$TEST_MODE" = "true" ]; then
        print_status "Test mode: Would generate new wallet..."
        SEI_PRIVATE_KEY="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12"
        print_mode_aware "debug" "Test mode: Mock generated private key: ${SEI_PRIVATE_KEY:0:10}..."
      else
        print_status "Generating new wallet..."
        if [ -f "scripts/bootstrap/generate_wallet.sh" ]; then
          # Run wallet generator in non-interactive mode and capture the private key
          TEMP_OUTPUT=$(bash scripts/bootstrap/generate_wallet.sh --non-interactive 2>&1)
          
          if [ $? -eq 0 ]; then
            SEI_PRIVATE_KEY=$(echo "$TEMP_OUTPUT" | grep "Private Key:" | sed 's/.*Private Key: //')
            if [[ -n "$SEI_PRIVATE_KEY" && "$SEI_PRIVATE_KEY" != "0x" && ${#SEI_PRIVATE_KEY} -ge 66 ]]; then
              print_status "Generated wallet with private key: ${SEI_PRIVATE_KEY:0:10}..."
            else
              print_warning "Wallet generation succeeded but private key extraction failed"
              print_warning "Output was: $TEMP_OUTPUT"
              SEI_PRIVATE_KEY="0xyour_sei_private_key_here"
            fi
          else
            print_warning "Wallet generation failed with error: $TEMP_OUTPUT"
            SEI_PRIVATE_KEY="0xyour_sei_private_key_here"
          fi
        else
          print_warning "Wallet generator not found, using default placeholder"
          SEI_PRIVATE_KEY="0xyour_sei_private_key_here"
        fi
      fi
      ;;
    3|*)
      SEI_PRIVATE_KEY="0xyour_sei_private_key_here"
      if [ "$TEST_MODE" = "true" ]; then
        print_mode_aware "debug" "Test mode: Would use default placeholder private key"
      fi
      ;;
  esac
  
  read -p "Postgres Password [default: seiling123]: " POSTGRES_PASSWORD
  POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-seiling123}
  if [ "$TEST_MODE" = "true" ]; then
    print_mode_aware "debug" "Test mode: Would use Postgres password: $POSTGRES_PASSWORD"
  fi
  
  read -p "n8n Encryption Key [default: seiling-encryption-key]: " N8N_ENCRYPTION_KEY
  N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY:-seiling-encryption-key}
  read -p "n8n JWT Secret [default: seiling-jwt-secret]: " N8N_USER_MANAGEMENT_JWT_SECRET
  N8N_USER_MANAGEMENT_JWT_SECRET=${N8N_USER_MANAGEMENT_JWT_SECRET:-seiling-jwt-secret}
  read -p "WebUI Secret Key [default: seiling-webui-secret]: " WEBUI_SECRET_KEY
  WEBUI_SECRET_KEY=${WEBUI_SECRET_KEY:-seiling-webui-secret}
  read -p "Flowise Password [default: seiling123]: " FLOWISE_PASSWORD
  FLOWISE_PASSWORD=${FLOWISE_PASSWORD:-seiling123}
  
  if [ "$TEST_MODE" = "true" ]; then
    print_mode_aware "info" "Test mode: All credentials collected successfully (no actual configuration written)"
  fi
fi

# Auto-generate subdomains
if [[ "$PROFILE" == "local-dev" || "$PROFILE" == "full-local" || "$PROFILE" == "default" ]]; then
  # For local profiles, we don't need domain settings - services use localhost
  BASE_DOMAIN_FOR_ENV="localhost"
else
  # For remote profiles, use the provided domain
  BASE_DOMAIN_FOR_ENV="$MAIN_DOMAIN"
fi

# Allow manual override of subdomains in custom mode (only for non-local profiles)
if [[ "$PROFILE" == "custom" && "$MAIN_DOMAIN" != "localhost" ]]; then
  read -p "n8n subdomain [default: n8n]: " N8N_SUBDOMAIN_INPUT
  N8N_SUBDOMAIN_CUSTOM=${N8N_SUBDOMAIN_INPUT:-}
  read -p "OpenWebUI subdomain [default: chat]: " OPENWEBUI_SUBDOMAIN_INPUT
  OPENWEBUI_SUBDOMAIN_CUSTOM=${OPENWEBUI_SUBDOMAIN_INPUT:-}
  read -p "Flowise subdomain [default: flowise]: " FLOWISE_SUBDOMAIN_INPUT
  FLOWISE_SUBDOMAIN_CUSTOM=${FLOWISE_SUBDOMAIN_INPUT:-}
  read -p "Ollama subdomain [default: ollama]: " OLLAMA_SUBDOMAIN_INPUT
  OLLAMA_SUBDOMAIN_CUSTOM=${OLLAMA_SUBDOMAIN_INPUT:-}
  read -p "Sei MCP subdomain [default: mcp]: " SEI_MCP_SUBDOMAIN_INPUT
  SEI_MCP_SUBDOMAIN_CUSTOM=${SEI_MCP_SUBDOMAIN_INPUT:-}
  read -p "Eliza subdomain [default: eliza]: " ELIZA_SUBDOMAIN_INPUT
  ELIZA_SUBDOMAIN_CUSTOM=${ELIZA_SUBDOMAIN_INPUT:-}
  read -p "Cambrian subdomain [default: cambrian]: " CAMBRIAN_SUBDOMAIN_INPUT
  CAMBRIAN_SUBDOMAIN_CUSTOM=${CAMBRIAN_SUBDOMAIN_INPUT:-}
fi

# Secret generation function
generate_secret() {
  local length=${1:-32}
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 "$length" | tr -d '\n' | head -c "$length"
  elif command -v date >/dev/null 2>&1; then
    date +%s | sha256sum | base64 | head -c "$length"
  else
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w "$length" | head -n 1
  fi
}

# Generate secrets for new services if not already set
if [ "$TEST_MODE" != "true" ]; then
  # Langfuse secrets
  if [ -z "$LANGFUSE_NEXTAUTH_SECRET" ]; then
    LANGFUSE_NEXTAUTH_SECRET=$(generate_secret 32)
    print_status "Generated LANGFUSE_NEXTAUTH_SECRET"
  fi
  if [ -z "$LANGFUSE_SALT" ]; then
    LANGFUSE_SALT=$(generate_secret 32)
    print_status "Generated LANGFUSE_SALT"
  fi
  if [ -z "$LANGFUSE_ENCRYPTION_KEY" ]; then
    LANGFUSE_ENCRYPTION_KEY=$(generate_secret 32)
    print_status "Generated LANGFUSE_ENCRYPTION_KEY"
  fi
  if [ -z "$CLICKHOUSE_PASSWORD" ]; then
    CLICKHOUSE_PASSWORD=$(generate_secret 32)
    print_status "Generated CLICKHOUSE_PASSWORD"
  fi
  if [ -z "$MINIO_ROOT_PASSWORD" ]; then
    MINIO_ROOT_PASSWORD=$(generate_secret 32)
    print_status "Generated MINIO_ROOT_PASSWORD"
  fi
  
  # Prometheus/Grafana secrets
  if [ -z "$GRAFANA_ADMIN_PASSWORD" ]; then
    GRAFANA_ADMIN_PASSWORD=$(generate_secret 32)
    print_status "Generated GRAFANA_ADMIN_PASSWORD"
  fi
  
  # SearXNG secret
  if [ -z "$SEARXNG_SECRET_KEY" ]; then
    SEARXNG_SECRET_KEY=$(generate_secret 32)
    print_status "Generated SEARXNG_SECRET_KEY"
  fi
  
  # Supabase secrets
  if [ -z "$SUPABASE_JWT_SECRET" ]; then
    SUPABASE_JWT_SECRET=$(generate_secret 64)
    print_status "Generated SUPABASE_JWT_SECRET"
  fi
  if [ -z "$SUPABASE_ANON_KEY" ]; then
    # Generate a JWT-like key (simplified)
    SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.$(generate_secret 32)"
    print_status "Generated SUPABASE_ANON_KEY"
  fi
  if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.$(generate_secret 32)"
    print_status "Generated SUPABASE_SERVICE_ROLE_KEY"
  fi
  if [ -z "$SUPABASE_DASHBOARD_PASSWORD" ]; then
    SUPABASE_DASHBOARD_PASSWORD=$(generate_secret 32)
    print_status "Generated SUPABASE_DASHBOARD_PASSWORD"
  fi
  if [ -z "$SUPABASE_POOLER_TENANT_ID" ]; then
    SUPABASE_POOLER_TENANT_ID=$(generate_secret 16 | tr '[:upper:]' '[:lower:]')
    print_status "Generated SUPABASE_POOLER_TENANT_ID"
  fi
fi

# Write to .env
env_content="# Generated by configure_env.sh
BASE_DOMAIN_NAME=$BASE_DOMAIN_FOR_ENV
PROFILE=$PROFILE

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=seiling

# Redis Configuration
REDIS_PASSWORD=$POSTGRES_PASSWORD

# n8n Configuration
N8N_ENCRYPTION_KEY=$N8N_ENCRYPTION_KEY
N8N_USER_MANAGEMENT_JWT_SECRET=$N8N_USER_MANAGEMENT_JWT_SECRET
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
DB_TYPE=postgresdb

# Service Secrets
WEBUI_SECRET_KEY=$WEBUI_SECRET_KEY
FLOWISE_PASSWORD=$FLOWISE_PASSWORD
FLOWISE_USERNAME=admin

# API Keys
OPENAI_API_KEY=$OPENAI_API_KEY
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

# Sei Network
SEI_PRIVATE_KEY=$SEI_PRIVATE_KEY
RPC_URL=https://sei-rpc.polkachu.com

# Logging & Debug
LOG_LEVEL=info
DEBUG=false
ENVIRONMENT=development

# Service Ports (customize if needed)
N8N_PORT=5001
OPENWEBUI_PORT=5002
FLOWISE_PORT=5003
MCP_SERVER_PORT=5004
MCP_SERVER_V2_PORT=3334
ELIZA_PORT=5005
CAMBRIAN_AGENT_PORT=5006
POSTGRES_PORT=5432
AUDITOR_DB_PORT=5433
REDIS_PORT=6379
QDRANT_PORT=6333
NEO4J_HTTP_PORT=7474
NEO4J_BOLT_PORT=7687
OLLAMA_PORT=11434
TRAEFIK_PORT=8080
BUILDER_PORT=3002
AUDITOR_WEB_PORT=3003
SEILING_OS_SERVER_PORT=3737
SEILING_OS_UI_PORT=5174

# Expanded Capabilities Configuration
# Langfuse
LANGFUSE_NEXTAUTH_SECRET=$LANGFUSE_NEXTAUTH_SECRET
LANGFUSE_SALT=$LANGFUSE_SALT
LANGFUSE_ENCRYPTION_KEY=$LANGFUSE_ENCRYPTION_KEY
CLICKHOUSE_PASSWORD=$CLICKHOUSE_PASSWORD
MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD
LANGFUSE_PORT=8004

# Prometheus/Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=$GRAFANA_ADMIN_PASSWORD
GRAFANA_PORT=8005

# SearXNG
SEARXNG_SECRET_KEY=$SEARXNG_SECRET_KEY
SEARXNG_BASE_URL=http://localhost:8080/
SEARXNG_PORT=8006

# Supabase
SUPABASE_DB_PASSWORD=${SUPABASE_DB_PASSWORD:-postgres}
SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DASHBOARD_USERNAME=admin
SUPABASE_DASHBOARD_PASSWORD=$SUPABASE_DASHBOARD_PASSWORD
SUPABASE_POOLER_TENANT_ID=$SUPABASE_POOLER_TENANT_ID
SUPABASE_DEFAULT_ORG=\"Default Organization\"
SUPABASE_DEFAULT_PROJECT=\"Default Project\"
SUPABASE_KONG_PORT=8000
SUPABASE_STUDIO_PORT=8007

# Kokoro/Chatterbox
VOICE_MODEL=whisper
CHATTERBOX_API_KEY=
CHATTERBOX_PORT=3008
KOKORO_PORT=3080

# Caddy
N8N_HOSTNAME=:8001
WEBUI_HOSTNAME=:8002
CAPTAIN_HOSTNAME=:8003
LANGFUSE_HOSTNAME=:8004
GRAFANA_HOSTNAME=:8005
SEARXNG_HOSTNAME=:8006
LETSENCRYPT_EMAIL=${LETSENCRYPT_EMAIL:-}

# Cloudflared (optional)
CLOUDFLARED_TUNNEL_TOKEN=${CLOUDFLARED_TUNNEL_TOKEN:-}
"

if [ "$TEST_MODE" = "true" ]; then
  print_mode_aware "info" "Test mode: Would write the following configuration to $ENV_FILE:"
  print_mode_aware "debug" "--- START OF .env CONTENT ---"
  echo "$env_content"
else
  echo "$env_content" > $ENV_FILE
  # Add optional variables with empty values if not present
  for var in OPENROUTER_API_KEY ELIZA_SERVER_AUTH_TOKEN EVM_CHAINS BIRDEYE_API_KEY DISCORD_APPLICATION_ID DISCORD_API_TOKEN REMOTE_CHARACTER_URLS OLLAMA_SMALL_MODEL OLLAMA_MEDIUM_MODEL OLLAMA_LARGE_MODEL OLLAMA_EMBEDDING_MODEL; do
    if ! grep -q "^$var=" "$ENV_FILE"; then
      echo "$var=" >> "$ENV_FILE"
    fi
  done
  # Only add ENABLE_* variables in auto/default mode
  if [[ "$PROFILE" == "default" || "$PROFILE" == "local-dev" ]]; then
    for svc in TRAEFIK OLLAMA N8N OPENWEBUI FLOWISE SEI_MCP ELIZA CAMBRIAN POSTGRES REDIS QDRANT NEO4J LANGFUSE PROMETHEUS CADDY CLOUDFLARED SEARXNG SUPABASE KOKORO; do
      case "$svc" in
        OLLAMA|TRAEFIK)
          echo "ENABLE_${svc}=no" >> "$ENV_FILE"
          ;;
        *)
          echo "ENABLE_${svc}=yes" >> "$ENV_FILE"
          ;;
      esac
    done
  fi
fi

# Handle custom subdomains and service variables
if [ "$TEST_MODE" = "true" ]; then
  # In test mode, just show what would be written
  if [[ "$PROFILE" == "custom" && "$MAIN_DOMAIN" != "localhost" ]]; then
    print_mode_aware "debug" "Test mode: Would add custom subdomain configurations"
    for var in N8N_SUBDOMAIN OPENWEBUI_SUBDOMAIN FLOWISE_SUBDOMAIN OLLAMA_SUBDOMAIN SEI_MCP_SUBDOMAIN ELIZA_SUBDOMAIN CAMBRIAN_SUBDOMAIN; do
      eval "custom_val=\$${var}_CUSTOM"
      if [[ -n "$custom_val" ]]; then
        print_mode_aware "debug" "  $var=$custom_val"
      fi
    done
  fi
  
  print_mode_aware "debug" "Test mode: Would add service enable variables:"
  for svc in "${SERVICES[@]}"; do
    print_mode_aware "debug" "  ENABLE_${svc}=$(get_service_enable "$svc")"
  done
  print_mode_aware "debug" "--- END OF .env CONTENT ---"
  
  print_status "Test mode: .env configuration validated successfully. No file written."
else
  # Add custom subdomains only if they were set
  if [[ "$PROFILE" == "custom" && "$MAIN_DOMAIN" != "localhost" ]]; then
    if [[ -n "$N8N_SUBDOMAIN_CUSTOM" ]]; then
      echo "N8N_SUBDOMAIN=$N8N_SUBDOMAIN_CUSTOM" >> $ENV_FILE
    fi
    if [[ -n "$OPENWEBUI_SUBDOMAIN_CUSTOM" ]]; then
      echo "OPENWEBUI_SUBDOMAIN=$OPENWEBUI_SUBDOMAIN_CUSTOM" >> $ENV_FILE
    fi
    if [[ -n "$FLOWISE_SUBDOMAIN_CUSTOM" ]]; then
      echo "FLOWISE_SUBDOMAIN=$FLOWISE_SUBDOMAIN_CUSTOM" >> $ENV_FILE
    fi
    if [[ -n "$OLLAMA_SUBDOMAIN_CUSTOM" ]]; then
      echo "OLLAMA_SUBDOMAIN=$OLLAMA_SUBDOMAIN_CUSTOM" >> $ENV_FILE
    fi
    if [[ -n "$SEI_MCP_SUBDOMAIN_CUSTOM" ]]; then
      echo "SEI_MCP_SUBDOMAIN=$SEI_MCP_SUBDOMAIN_CUSTOM" >> $ENV_FILE
    fi
    if [[ -n "$ELIZA_SUBDOMAIN_CUSTOM" ]]; then
      echo "ELIZA_SUBDOMAIN=$ELIZA_SUBDOMAIN_CUSTOM" >> $ENV_FILE
    fi
    if [[ -n "$CAMBRIAN_SUBDOMAIN_CUSTOM" ]]; then
      echo "CAMBRIAN_SUBDOMAIN=$CAMBRIAN_SUBDOMAIN_CUSTOM" >> $ENV_FILE
    fi
    echo "" >> $ENV_FILE
  fi

  # Only write ENABLE_* variables in custom/interactive mode
  if [[ "$PROFILE" == "custom" || "$PROFILE" == "remote" || "$PROFILE" == "full" || "$PROFILE" == "full-local" ]]; then
    for svc in "${SERVICES[@]}"; do
      echo "ENABLE_${svc}=$(get_service_enable "$svc")" >> $ENV_FILE
    done
  fi

  print_status "$ENV_FILE configuration written. You can edit $ENV_FILE to change settings."
fi

# Additional helpful information
echo ""
if [ "$TEST_MODE" = "true" ]; then
  print_status "Test mode: Configuration validation complete! Next steps (if this were real):"
  echo "• Would run 'docker-compose up -d' to start services"
  echo "• Would access services at http://${BASE_DOMAIN_FOR_ENV}:<port>"
  
  if [[ "$USE_DEFAULTS" == "true" || "$SEI_PRIVATE_KEY" == "0xyour_sei_private_key_here" ]]; then
    echo ""
    print_mode_aware "info" "Test mode: Would remind user to generate a new Sei wallet"
  fi
  
  if [[ "$OPENAI_API_KEY" == "sk-proj-your_openai_api_key_here" ]]; then
    echo ""
    print_mode_aware "info" "Test mode: Would remind user to update OpenAI API key"
  fi
else
  print_status "Configuration complete! Next steps:"
  echo "• Run 'docker-compose up -d' to start services"
  echo "• Access services at http://${BASE_DOMAIN_FOR_ENV}:<port>"

  if [[ "$USE_DEFAULTS" == "true" || "$SEI_PRIVATE_KEY" == "0xyour_sei_private_key_here" ]]; then
    echo ""
    print_warning "To generate a new Sei wallet:"
    echo "• Run: bash scripts/bootstrap/generate_wallet.sh"
    echo "• Or manually update SEI_PRIVATE_KEY in .env"
  fi

  if [[ "$OPENAI_API_KEY" == "sk-proj-your_openai_api_key_here" ]]; then
    echo ""
    print_warning "Don't forget to update your OpenAI API key in .env!"
  fi
fi

exit 0
