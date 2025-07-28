#!/bin/bash
# scripts/bootstrap/ui/status.sh
# Enhanced status messages and formatting components

# Enhanced colors and formatting
STATUS_SUCCESS='\033[0;32m'     # Green
STATUS_ERROR='\033[0;31m'       # Red
STATUS_WARNING='\033[1;33m'     # Bold Yellow
STATUS_INFO='\033[0;36m'        # Cyan
STATUS_DEBUG='\033[0;90m'       # Dark Gray
STATUS_HEADER='\033[1;34m'      # Bold Blue
STATUS_HIGHLIGHT='\033[1;37m'   # Bold White
NC='\033[0m'

# Icons
ICON_SUCCESS="✓"
ICON_ERROR="✗"
ICON_WARNING="⚠"
ICON_INFO="ℹ"
ICON_DEBUG="◦"
ICON_ARROW="→"
ICON_BULLET="•"
ICON_STEP="►"

# Box drawing characters
BOX_HORIZONTAL="─"
BOX_VERTICAL="│"
BOX_TOP_LEFT="┌"
BOX_TOP_RIGHT="┐"
BOX_BOTTOM_LEFT="└"
BOX_BOTTOM_RIGHT="┘"
BOX_CROSS="┼"
BOX_T_DOWN="┬"
BOX_T_UP="┴"
BOX_T_LEFT="┤"
BOX_T_RIGHT="├"

# Enhanced status message functions
print_success() {
    echo -e "${STATUS_SUCCESS}${ICON_SUCCESS}${NC} $1"
}

print_error() {
    echo -e "${STATUS_ERROR}${ICON_ERROR}${NC} $1" >&2
}

print_warning() {
    echo -e "${STATUS_WARNING}${ICON_WARNING}${NC} $1"
}

print_info() {
    echo -e "${STATUS_INFO}${ICON_INFO}${NC} $1"
}

print_debug() {
    echo -e "${STATUS_DEBUG}${ICON_DEBUG}${NC} $1"
}

print_step() {
    echo -e "${STATUS_HEADER}${ICON_STEP}${NC} $1"
}

# Header and section formatting
print_header() {
    local title="$1"
    local width=${2:-80}
    
    echo ""
    echo -e "${STATUS_HEADER}${BOX_TOP_LEFT}$(printf "%*s" $((width-2)) "" | tr ' ' "$BOX_HORIZONTAL")${BOX_TOP_RIGHT}${NC}"
    
    # Center the title
    local title_length=${#title}
    local padding=$(((width - title_length - 2) / 2))
    local title_line="$(printf "%*s" $padding "")$title$(printf "%*s" $((width - title_length - padding - 2)) "")"
    
    echo -e "${STATUS_HEADER}${BOX_VERTICAL}${STATUS_HIGHLIGHT}${title_line}${STATUS_HEADER}${BOX_VERTICAL}${NC}"
    echo -e "${STATUS_HEADER}${BOX_BOTTOM_LEFT}$(printf "%*s" $((width-2)) "" | tr ' ' "$BOX_HORIZONTAL")${BOX_BOTTOM_RIGHT}${NC}"
    echo ""
}

print_section() {
    local title="$1"
    echo ""
    echo -e "${STATUS_HEADER}${BOX_HORIZONTAL}${BOX_HORIZONTAL} ${title} ${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${BOX_HORIZONTAL}${NC}"
    echo ""
}

# Indented messages
print_indent() {
    local level=${1:-1}
    local message="$2"
    local indent=""
    
    for ((i=0; i<level; i++)); do
        indent+="  "
    done
    
    echo -e "${indent}${STATUS_INFO}${ICON_BULLET}${NC} ${message}"
}

# Key-value pairs
print_key_value() {
    local key="$1"
    local value="$2"
    local width=${3:-20}
    
    printf "${STATUS_INFO}%-${width}s${NC} ${STATUS_HIGHLIGHT}%s${NC}\n" "$key:" "$value"
}

# Lists
print_list_item() {
    local item="$1"
    local status=${2:-""}
    local indent=${3:-0}
    
    local prefix=""
    for ((i=0; i<indent; i++)); do
        prefix+="  "
    done
    
    case "$status" in
        "success")
            echo -e "${prefix}${STATUS_SUCCESS}${ICON_SUCCESS}${NC} ${item}"
            ;;
        "error")
            echo -e "${prefix}${STATUS_ERROR}${ICON_ERROR}${NC} ${item}"
            ;;
        "warning")
            echo -e "${prefix}${STATUS_WARNING}${ICON_WARNING}${NC} ${item}"
            ;;
        *)
            echo -e "${prefix}${STATUS_INFO}${ICON_BULLET}${NC} ${item}"
            ;;
    esac
}

# Code blocks
print_code_block() {
    local code="$1"
    local title=${2:-""}
    
    if [ -n "$title" ]; then
        echo -e "${STATUS_DEBUG}┌─ $title${NC}"
    else
        echo -e "${STATUS_DEBUG}┌─────────${NC}"
    fi
    
    while IFS= read -r line; do
        echo -e "${STATUS_DEBUG}│${NC} ${line}"
    done <<< "$code"
    
    echo -e "${STATUS_DEBUG}└─────────${NC}"
}

# Tables
print_table_header() {
    local headers="$1"
    local widths="$2"
    
    IFS='|' read -ra header_array <<< "$headers"
    IFS='|' read -ra width_array <<< "$widths"
    
    # Top border
    printf "${STATUS_HEADER}${BOX_TOP_LEFT}"
    for i in "${!width_array[@]}"; do
        printf "%*s" "${width_array[$i]}" "" | tr ' ' "$BOX_HORIZONTAL"
        if [ "$i" -lt $((${#width_array[@]} - 1)) ]; then
            printf "${BOX_T_DOWN}"
        fi
    done
    printf "${BOX_TOP_RIGHT}${NC}\n"
    
    # Header row
    printf "${STATUS_HEADER}${BOX_VERTICAL}"
    for i in "${!header_array[@]}"; do
        printf "${STATUS_HIGHLIGHT}%-${width_array[$i]}s${STATUS_HEADER}" "${header_array[$i]}"
        printf "${BOX_VERTICAL}"
    done
    printf "${NC}\n"
    
    # Separator
    printf "${STATUS_HEADER}${BOX_T_RIGHT}"
    for i in "${!width_array[@]}"; do
        printf "%*s" "${width_array[$i]}" "" | tr ' ' "$BOX_HORIZONTAL"
        if [ "$i" -lt $((${#width_array[@]} - 1)) ]; then
            printf "${BOX_CROSS}"
        fi
    done
    printf "${BOX_T_LEFT}${NC}\n"
}

print_table_row() {
    local row="$1"
    local widths="$2"
    local status=${3:-""}
    
    IFS='|' read -ra row_array <<< "$row"
    IFS='|' read -ra width_array <<< "$widths"
    
    local color=""
    case "$status" in
        "success") color="${STATUS_SUCCESS}" ;;
        "error") color="${STATUS_ERROR}" ;;
        "warning") color="${STATUS_WARNING}" ;;
        *) color="${STATUS_INFO}" ;;
    esac
    
    printf "${STATUS_HEADER}${BOX_VERTICAL}${color}"
    for i in "${!row_array[@]}"; do
        printf "%-${width_array[$i]}s" "${row_array[$i]}"
        printf "${STATUS_HEADER}${BOX_VERTICAL}${color}"
    done
    printf "${NC}\n"
}

print_table_footer() {
    local widths="$1"
    
    IFS='|' read -ra width_array <<< "$widths"
    
    printf "${STATUS_HEADER}${BOX_BOTTOM_LEFT}"
    for i in "${!width_array[@]}"; do
        printf "%*s" "${width_array[$i]}" "" | tr ' ' "$BOX_HORIZONTAL"
        if [ "$i" -lt $((${#width_array[@]} - 1)) ]; then
            printf "${BOX_T_UP}"
        fi
    done
    printf "${BOX_BOTTOM_RIGHT}${NC}\n"
}

# Summary boxes
print_summary_box() {
    local title="$1"
    local content="$2"
    local status=${3:-"info"}
    
    local color
    case "$status" in
        "success") color="${STATUS_SUCCESS}" ;;
        "error") color="${STATUS_ERROR}" ;;
        "warning") color="${STATUS_WARNING}" ;;
        *) color="${STATUS_INFO}" ;;
    esac
    
    local width=60
    
    echo ""
    echo -e "${color}${BOX_TOP_LEFT}$(printf "%*s" $((width-2)) "" | tr ' ' "$BOX_HORIZONTAL")${BOX_TOP_RIGHT}${NC}"
    
    # Title
    local title_padding=$(((width - ${#title} - 2) / 2))
    local title_line="$(printf "%*s" $title_padding "")$title$(printf "%*s" $((width - ${#title} - title_padding - 2)) "")"
    echo -e "${color}${BOX_VERTICAL}${STATUS_HIGHLIGHT}${title_line}${color}${BOX_VERTICAL}${NC}"
    
    # Separator
    echo -e "${color}${BOX_T_RIGHT}$(printf "%*s" $((width-2)) "" | tr ' ' "$BOX_HORIZONTAL")${BOX_T_LEFT}${NC}"
    
    # Content
    while IFS= read -r line; do
        local content_padding=$((width - ${#line} - 2))
        echo -e "${color}${BOX_VERTICAL}${NC} ${line}$(printf "%*s" $content_padding "")${color}${BOX_VERTICAL}${NC}"
    done <<< "$content"
    
    echo -e "${color}${BOX_BOTTOM_LEFT}$(printf "%*s" $((width-2)) "" | tr ' ' "$BOX_HORIZONTAL")${BOX_BOTTOM_RIGHT}${NC}"
    echo ""
}

# URL and command formatting
print_url() {
    local label="$1"
    local url="$2"
    echo -e "${STATUS_INFO}${label}:${NC} ${STATUS_HIGHLIGHT}${url}${NC}"
}

print_command() {
    local command="$1"
    echo -e "${STATUS_DEBUG}$ ${STATUS_HIGHLIGHT}${command}${NC}"
}

# ASCII Art banner
print_banner() {
    local text="$1"
    local color=${2:-$STATUS_HEADER}
    
    echo ""
    echo -e "${color}"
    case "${text^^}" in
        "SEILING")
            cat << 'EOF'
 ███████ ███████ ██ ██      ██ ███    ██  ██████  
 ██      ██      ██ ██      ██ ████   ██ ██       
 ███████ █████   ██ ██      ██ ██ ██  ██ ██   ███ 
      ██ ██      ██ ██      ██ ██  ██ ██ ██    ██ 
 ███████ ███████ ██ ███████ ██ ██   ████  ██████  
EOF
            ;;
        "SUCCESS")
            cat << 'EOF'
 ███████ ██    ██  ██████  ██████ ███████ ███████ ███████ 
 ██      ██    ██ ██      ██      ██      ██      ██      
 ███████ ██    ██ ██      ██      █████   ███████ ███████ 
      ██ ██    ██ ██      ██      ██           ██      ██ 
 ███████  ██████   ██████  ██████ ███████ ███████ ███████ 
EOF
            ;;
        "ERROR")
            cat << 'EOF'
 ███████ ██████  ██████   ██████  ██████  
 ██      ██   ██ ██   ██ ██    ██ ██   ██ 
 █████   ██████  ██████  ██    ██ ██████  
 ██      ██   ██ ██   ██ ██    ██ ██   ██ 
 ███████ ██   ██ ██   ██  ██████  ██   ██ 
EOF
            ;;
        *)
            echo "$text"
            ;;
    esac
    echo -e "${NC}"
    echo ""
}

# Test function for status components
test_status_components() {
    echo "Testing Status Components"
    echo "========================"
    
    print_header "SEILING BUIDLBOX BOOTSTRAP"
    
    print_section "Status Messages"
    print_success "Success message"
    print_error "Error message"
    print_warning "Warning message"
    print_info "Info message"
    print_debug "Debug message"
    print_step "Step message"
    
    print_section "Lists and Indentation"
    print_list_item "Normal item"
    print_list_item "Success item" "success"
    print_list_item "Error item" "error"
    print_list_item "Warning item" "warning"
    print_indent 1 "Indented item level 1"
    print_indent 2 "Indented item level 2"
    
    print_section "Key-Value Pairs"
    print_key_value "Profile" "default"
    print_key_value "Domain" "localhost"
    print_key_value "Services" "n8n, openwebui, flowise"
    
    print_section "URLs and Commands"
    
    # Construct URLs based on local vs remote mode
    if [ "${BASE_DOMAIN_NAME:-localhost}" = "localhost" ]; then
        # Local mode: use ports
        print_url "OpenWebUI" "http://localhost:${OPENWEBUI_PORT:-5002}"
        print_url "n8n" "http://localhost:${N8N_PORT:-5001}"
    else
        # Remote mode: use subdomains with HTTPS
        print_url "OpenWebUI" "https://${OPENWEBUI_SUBDOMAIN:-chat}.${BASE_DOMAIN_NAME}"
        print_url "n8n" "https://${N8N_SUBDOMAIN:-n8n}.${BASE_DOMAIN_NAME}"
    fi
    print_command "docker compose up -d"
    print_command "./bootstrap.sh -auto -test"
    
    print_section "Table Example"
    print_table_header "Service|Port|Status" "15|8|10"
    # Construct table rows based on local vs remote mode
    if [ "${BASE_DOMAIN_NAME:-localhost}" = "localhost" ]; then
        # Local mode: show ports
        print_table_row "n8n|${N8N_PORT:-5001}|Running" "15|8|10" "success"
        print_table_row "OpenWebUI|${OPENWEBUI_PORT:-5002}|Running" "15|8|10" "success"
    else
        # Remote mode: show subdomains
        print_table_row "n8n|${N8N_SUBDOMAIN:-n8n}.${BASE_DOMAIN_NAME}|Running" "15|8|10" "success"
        print_table_row "OpenWebUI|${OPENWEBUI_SUBDOMAIN:-chat}.${BASE_DOMAIN_NAME}|Running" "15|8|10" "success"
    fi
    print_table_row "Flowise|3001|Error" "15|8|10" "error"
    print_table_footer "15|8|10"
    
    print_section "Code Block"
    print_code_block "#!/bin/bash
echo 'Hello World'
exit 0" "Example Script"
    
    print_section "Summary Boxes"
    print_summary_box "SUCCESS" "Bootstrap completed successfully!
All services are running." "success"
    
    print_summary_box "WARNING" "Some services failed to start.
Check the logs for details." "warning"
    
    print_section "Banners"
    print_banner "SUCCESS" "$STATUS_SUCCESS"
    
    echo "Status component tests complete!"
} 