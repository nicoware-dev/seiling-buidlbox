#!/bin/bash
# scripts/bootstrap/generate_wallet.sh
set -e

# Parse command line arguments
NON_INTERACTIVE=false
QUIET=false
TEST_MODE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --non-interactive)
      NON_INTERACTIVE=true
      shift
      ;;
    --quiet)
      QUIET=true
      shift
      ;;
    --test)
      TEST_MODE=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    if [[ "$QUIET" != "true" ]]; then
        echo -e "${GREEN}[INFO]${NC} $1"
    fi
}
print_warning() {
    if [[ "$QUIET" != "true" ]]; then
        echo -e "${YELLOW}[WARNING]${NC} $1"
    fi
}
print_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}
print_info() {
    if [[ "$QUIET" != "true" ]]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

if [[ "$NON_INTERACTIVE" != "true" ]]; then
    print_status "Sei Network Wallet Generator"
    echo "=============================="
fi

# Test mode - check available tools and exit
if [[ "$TEST_MODE" == "true" ]]; then
    echo "=== Wallet Generator Test Mode ==="
    echo "OS: $(uname -s)"
    echo "Available tools:"
    
    if command -v openssl >/dev/null 2>&1; then
        echo "✓ openssl: $(openssl version)"
        TEST_KEY=$(openssl rand -hex 4 2>/dev/null)
        if [[ -n "$TEST_KEY" ]]; then
            echo "  - Random generation test: ✓ ($TEST_KEY)"
        else
            echo "  - Random generation test: ✗"
        fi
    else
        echo "✗ openssl: Not found"
    fi
    
    if [ -f /dev/urandom ]; then
        echo "✓ /dev/urandom: Available"
        if command -v xxd >/dev/null 2>&1; then
            echo "✓ xxd: Available"
            TEST_RAND=$(head -c 4 /dev/urandom 2>/dev/null | xxd -p -c 4 2>/dev/null)
            if [[ -n "$TEST_RAND" ]]; then
                echo "  - Random generation test: ✓ ($TEST_RAND)"
            else
                echo "  - Random generation test: ✗"
            fi
        else
            echo "✗ xxd: Not found"
        fi
    else
        echo "✗ /dev/urandom: Not available"
    fi
    
    if command -v python3 >/dev/null 2>&1; then
        echo "✓ python3: $(python3 --version)"
        PYTHON_TEST=$(python3 -c "import secrets; print(secrets.token_hex(4))" 2>/dev/null)
        if [[ -n "$PYTHON_TEST" ]]; then
            echo "  - Random generation test: ✓ ($PYTHON_TEST)"
        else
            echo "  - Random generation test: ✗"
        fi
    else
        echo "✗ python3: Not found"
    fi
    
    echo "=========================="
    exit 0
fi

# Generate wallet using OpenSSL (most reliable cross-platform method)
if command -v openssl >/dev/null 2>&1; then
    print_status "Using OpenSSL for wallet generation..."
    
    # Generate private key (32 bytes = 64 hex chars)
    PRIVATE_KEY="0x$(openssl rand -hex 32 2>/dev/null)"
    
    if [[ -z "$PRIVATE_KEY" || "$PRIVATE_KEY" == "0x" ]]; then
        print_error "Failed to generate private key with OpenSSL"
        print_error "OpenSSL command failed. Trying fallback methods..."
        PRIVATE_KEY=""
    else
        # Generate public key (simplified - hash of private key)
        PUBLIC_KEY="0x$(echo "$PRIVATE_KEY" | openssl dgst -sha256 2>/dev/null | cut -d' ' -f2)"
        
        # Generate address (first 20 bytes of public key hash)
        ADDRESS="0x$(echo "$PUBLIC_KEY" | openssl dgst -sha256 2>/dev/null | cut -d' ' -f2 | head -c 40)"
    fi
fi

# Fallback to /dev/urandom if OpenSSL failed
if [[ -z "$PRIVATE_KEY" ]] && [ -f /dev/urandom ] && command -v xxd >/dev/null 2>&1; then
    print_status "Using /dev/urandom for wallet generation..."
    
    # Generate private key using urandom
    PRIVATE_KEY="0x$(head -c 32 /dev/urandom 2>/dev/null | xxd -p -c 32 2>/dev/null)"
    
    if [[ -z "$PRIVATE_KEY" || "$PRIVATE_KEY" == "0x" ]]; then
        print_error "Failed to generate private key with /dev/urandom"
        PRIVATE_KEY=""
    else
        # Generate public key (simplified)
        if command -v sha256sum >/dev/null 2>&1; then
            PUBLIC_KEY="0x$(echo "$PRIVATE_KEY" | sha256sum | cut -d' ' -f1)"
            ADDRESS="0x$(echo "$PUBLIC_KEY" | sha256sum | cut -d' ' -f1 | head -c 40)"
        else
            # Fallback for systems without sha256sum
            PUBLIC_KEY="0x$(echo "$PRIVATE_KEY" | openssl dgst -sha256 2>/dev/null | cut -d' ' -f2)"
            ADDRESS="0x$(echo "$PUBLIC_KEY" | openssl dgst -sha256 2>/dev/null | cut -d' ' -f2 | head -c 40)"
        fi
    fi
fi

# Final fallback to Python
if [[ -z "$PRIVATE_KEY" ]] && command -v python3 >/dev/null 2>&1; then
    print_status "Using Python for wallet generation..."
    
    WALLET_DATA=$(python3 -c "
import secrets
import hashlib
import sys

try:
    # Generate private key (32 bytes)
    private_key_bytes = secrets.token_bytes(32)
    private_key = '0x' + private_key_bytes.hex()

    # Simple public key generation
    public_key_hash = hashlib.sha256(private_key_bytes).digest()
    public_key = '0x' + public_key_hash.hex()

    # Generate address (first 20 bytes)
    address_hash = hashlib.sha256(public_key_hash).digest()
    address = '0x' + address_hash[:20].hex()

    print(f'{private_key}|{public_key}|{address}')
except Exception as e:
    print(f'ERROR: {e}', file=sys.stderr)
    exit(1)
" 2>/dev/null)

    if [ $? -eq 0 ] && [ -n "$WALLET_DATA" ]; then
        PRIVATE_KEY=$(echo "$WALLET_DATA" | cut -d'|' -f1)
        PUBLIC_KEY=$(echo "$WALLET_DATA" | cut -d'|' -f2)
        ADDRESS=$(echo "$WALLET_DATA" | cut -d'|' -f3)
        
        if [[ -z "$PRIVATE_KEY" || "$PRIVATE_KEY" == "0x" ]]; then
            print_error "Python wallet generation returned empty private key."
            PRIVATE_KEY=""
        fi
    else
        print_error "Python wallet generation failed."
        PRIVATE_KEY=""
    fi
fi

# Final check - if no method worked
if [[ -z "$PRIVATE_KEY" ]]; then
    print_error "No suitable random generation method found or all methods failed."
    print_error "Tried: OpenSSL, /dev/urandom, Python3"
    print_error "Please ensure one of these tools is properly installed:"
    print_error "  - OpenSSL (preferred)"
    print_error "  - /dev/urandom + xxd"
    print_error "  - Python3 with secrets module"
    if [[ "$TEST_MODE" != "true" ]]; then
        print_error "Run with --test flag to diagnose available tools"
    fi
    exit 1
fi

# Validate that we have a proper private key
if [[ -z "$PRIVATE_KEY" || "${#PRIVATE_KEY}" -lt 66 ]]; then
    print_error "Generated private key is invalid or too short: $PRIVATE_KEY"
    exit 1
fi

# Display results
if [[ "$NON_INTERACTIVE" != "true" ]]; then
    echo ""
    print_status "Wallet Generated Successfully!"
    echo "=============================="
    echo ""
fi

print_info "Private Key: $PRIVATE_KEY"
if [[ "$NON_INTERACTIVE" != "true" ]]; then
    print_info "Public Key:  $PUBLIC_KEY"
    print_info "Address:     $ADDRESS"
    echo ""

    print_warning "IMPORTANT SECURITY NOTES:"
    echo "• Keep your private key SECRET and SECURE"
    echo "• Never share your private key with anyone"
    echo "• Back up your private key in a safe place"
    echo "• This wallet is for DEVELOPMENT/TESTING purposes"
    echo "• For production, use a hardware wallet or secure key management"
    echo ""
fi

# Handle .env file saving
if [[ "$NON_INTERACTIVE" == "true" ]]; then
    # In non-interactive mode, just output the private key and exit
    # The calling script will handle saving it
    exit 0
else
    # Interactive mode - ask user
    read -p "Do you want to add this private key to your .env file? [y/N]: " save_to_env

    if [[ "$save_to_env" =~ ^[Yy]$ ]]; then
        ENV_FILE=".env"
        
        if [ -f "$ENV_FILE" ]; then
            # Update existing .env file
            if grep -q "^SEI_PRIVATE_KEY=" "$ENV_FILE"; then
                # Replace existing key
                sed -i.bak "s/^SEI_PRIVATE_KEY=.*/SEI_PRIVATE_KEY=$PRIVATE_KEY/" "$ENV_FILE"
                print_status "Updated SEI_PRIVATE_KEY in $ENV_FILE"
            else
                # Add new key
                echo "SEI_PRIVATE_KEY=$PRIVATE_KEY" >> "$ENV_FILE"
                print_status "Added SEI_PRIVATE_KEY to $ENV_FILE"
            fi
        else
            # Create new .env file
            echo "SEI_PRIVATE_KEY=$PRIVATE_KEY" > "$ENV_FILE"
            print_status "Created $ENV_FILE with SEI_PRIVATE_KEY"
        fi
        
        print_status "Private key saved to $ENV_FILE"
    else
        print_info "Private key not saved. Remember to copy it manually if needed."
    fi

    echo ""
    print_status "Wallet generation complete!"
fi

exit 0 