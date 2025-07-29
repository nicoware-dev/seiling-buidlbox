#!/bin/bash
# scripts/bootstrap/ui/menu.sh
# Enhanced menu and selection components

# Colors for menus
MENU_HEADER_COLOR='\033[1;36m'    # Bold Cyan
MENU_ITEM_COLOR='\033[0;37m'      # White
MENU_SELECTED_COLOR='\033[1;33m'  # Bold Yellow
MENU_DISABLED_COLOR='\033[0;90m'  # Dark Gray
MENU_BORDER_COLOR='\033[0;34m'    # Blue
NC='\033[0m'

# Menu result global variable
MENU_RESULT=""

# Simple menu with numbered options
# Usage: show_menu "Title" "option1|option2|option3" [default_index]
show_menu() {
    local title="$1"
    local options_string="$2"
    local default_index=${3:-1}
    
    IFS='|' read -ra options <<< "$options_string"
    
    echo ""
    echo -e "${MENU_HEADER_COLOR}┌─ $title ─┐${NC}"
    
    for i in "${!options[@]}"; do
        local number=$((i + 1))
        local marker=""
        if [ "$number" -eq "$default_index" ]; then
            marker="${MENU_SELECTED_COLOR}► ${NC}"
        else
            marker="  "
        fi
        echo -e "${marker}${MENU_ITEM_COLOR}$number) ${options[$i]}${NC}"
    done
    
    echo -e "${MENU_HEADER_COLOR}└─────────────────────┘${NC}"
    echo ""
    
    while true; do
        read -p "Select option (1-${#options[@]}) [default: $default_index]: " choice
        choice=${choice:-$default_index}
        
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#options[@]}" ]; then
            MENU_RESULT="${options[$((choice - 1))]}"
            echo -e "${MENU_SELECTED_COLOR}Selected: $MENU_RESULT${NC}"
            return $((choice - 1))
        else
            echo -e "${MENU_DISABLED_COLOR}Invalid choice. Please select 1-${#options[@]}${NC}"
        fi
    done
}

# Profile selection menu with descriptions
# Usage: show_profile_menu
show_profile_menu() {
    local profiles=("default" "local-dev" "remote" "full" "full-local" "custom")
    local descriptions=(
        "Quick start with all defaults (recommended for testing)"
        "Local development setup (no domain required, lightweight)"
        "Remote production setup (requires domain configuration)"
        "Full remote setup with Ollama (requires domain and resources)"
        "Full local setup with Ollama (no domain, more resources needed)"
        "Custom interactive configuration (full control)"
    )
    
    echo ""
    echo -e "${MENU_HEADER_COLOR}┌─────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${MENU_HEADER_COLOR}│                    SEILING SETUP PROFILES                      │${NC}"
    echo -e "${MENU_HEADER_COLOR}└─────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    for i in "${!profiles[@]}"; do
        local number=$((i + 1))
        echo -e "${MENU_ITEM_COLOR}$number) ${MENU_SELECTED_COLOR}${profiles[$i]}${NC}"
        echo -e "   ${MENU_DISABLED_COLOR}${descriptions[$i]}${NC}"
        echo ""
    done
    
    while true; do
        read -p "Select a setup profile (1-${#profiles[@]}) [default: 1]: " choice
        choice=${choice:-1}
        
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#profiles[@]}" ]; then
            MENU_RESULT="${profiles[$((choice - 1))]}"
            echo -e "${MENU_SELECTED_COLOR}Selected profile: $MENU_RESULT${NC}"
            return $((choice - 1))
        else
            echo -e "${MENU_DISABLED_COLOR}Invalid choice. Please select 1-${#profiles[@]}${NC}"
        fi
    done
}

# Yes/No confirmation with custom message
# Usage: confirm "Are you sure?" [default_yes]
confirm() {
    local message="$1"
    local default_yes=${2:-false}
    
    local prompt
    if [ "$default_yes" = true ]; then
        prompt="[Y/n]"
        local default="y"
    else
        prompt="[y/N]"
        local default="n"
    fi
    
    echo ""
    echo -e "${MENU_ITEM_COLOR}$message${NC}"
    read -p "Continue? $prompt: " response
    response=${response:-$default}
    
    case "$response" in
        [Yy]|[Yy][Ee][Ss])
            echo -e "${MENU_SELECTED_COLOR}✓ Confirmed${NC}"
            return 0
            ;;
        *)
            echo -e "${MENU_DISABLED_COLOR}✗ Cancelled${NC}"
            return 1
            ;;
    esac
}

# Service selection menu with checkboxes
# Usage: show_service_menu [preset_services]
show_service_menu() {
    local preset_services=${1:-"TRAEFIK,N8N,OPENWEBUI,FLOWISE,SEI_MCP,ELIZA,CAMBRIAN,POSTGRES,REDIS,QDRANT,NEO4J"}
    
    local services=("TRAEFIK" "OLLAMA" "N8N" "OPENWEBUI" "FLOWISE" "SEI_MCP" "ELIZA" "CAMBRIAN" "POSTGRES" "REDIS" "QDRANT" "NEO4J")
    local descriptions=(
        "Reverse proxy and SSL termination"
        "Local LLM inference server"
        "Workflow automation platform"
        "Chat interface for AI models"
        "Visual AI workflow builder"
        "Sei blockchain MCP server"
        "AI agent framework"
        "Cambrian AI agent launcher"
        "PostgreSQL database"
        "Redis cache/message broker"
        "Vector database for embeddings"
        "Graph database"
    )
    
    # Parse preset services
    IFS=',' read -ra enabled_services <<< "$preset_services"
    local selected=()
    
    for service in "${services[@]}"; do
        if [[ " ${enabled_services[*]} " =~ " ${service} " ]]; then
            selected+=(true)
        else
            selected+=(false)
        fi
    done
    
    echo ""
    echo -e "${MENU_HEADER_COLOR}┌─────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${MENU_HEADER_COLOR}│                    SERVICE SELECTION                           │${NC}"
    echo -e "${MENU_HEADER_COLOR}└─────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    echo -e "${MENU_DISABLED_COLOR}Use space to toggle, enter to confirm, 'a' for all, 'n' for none${NC}"
    echo ""
    
    local current_index=0
    local max_index=$((${#services[@]} - 1))
    
    while true; do
        # Clear screen area
        printf "\033[${#services[@]}A"
        
        # Display services
        for i in "${!services[@]}"; do
            printf "\r\033[K"
            
            local checkbox
            if [ "${selected[$i]}" = true ]; then
                checkbox="${MENU_SELECTED_COLOR}[✓]${NC}"
            else
                checkbox="${MENU_DISABLED_COLOR}[ ]${NC}"
            fi
            
            local highlight=""
            local reset=""
            if [ "$i" -eq "$current_index" ]; then
                highlight="${MENU_SELECTED_COLOR}► "
                reset="${NC}"
            else
                highlight="  "
                reset=""
            fi
            
            echo -e "${highlight}${checkbox} ${MENU_ITEM_COLOR}${services[$i]}${reset}"
            echo -e "    ${MENU_DISABLED_COLOR}${descriptions[$i]}${NC}"
        done
        
        # Read key
        read -rsn1 key
        case "$key" in
            $'\x1b')  # Arrow keys
                read -rsn2 key
                case "$key" in
                    '[A') current_index=$(( current_index > 0 ? current_index - 1 : max_index )) ;;
                    '[B') current_index=$(( current_index < max_index ? current_index + 1 : 0 )) ;;
                esac
                ;;
            ' ')  # Space to toggle
                if [ "${selected[$current_index]}" = true ]; then
                    selected[$current_index]=false
                else
                    selected[$current_index]=true
                fi
                ;;
            'a'|'A')  # Select all
                for i in "${!selected[@]}"; do
                    selected[$i]=true
                done
                ;;
            'n'|'N')  # Select none
                for i in "${!selected[@]}"; do
                    selected[$i]=false
                done
                ;;
            $'\n'|$'\r')  # Enter to confirm
                break
                ;;
        esac
    done
    
    # Build result
    local result_services=()
    for i in "${!services[@]}"; do
        if [ "${selected[$i]}" = true ]; then
            result_services+=("${services[$i]}")
        fi
    done
    
    MENU_RESULT=$(IFS=','; echo "${result_services[*]}")
    echo ""
    echo -e "${MENU_SELECTED_COLOR}Selected services: $MENU_RESULT${NC}"
    echo ""
}

# Progress menu showing current step
# Usage: show_progress_menu <current_step> <total_steps> <step_names>
show_progress_menu() {
    local current_step=$1
    local total_steps=$2
    local step_names="$3"
    
    IFS='|' read -ra steps <<< "$step_names"
    
    echo ""
    echo -e "${MENU_HEADER_COLOR}┌─ BOOTSTRAP PROGRESS ─┐${NC}"
    
    for i in "${!steps[@]}"; do
        local step_num=$((i + 1))
        local status_icon
        local color
        
        if [ "$step_num" -lt "$current_step" ]; then
            status_icon="✓"
            color="${MENU_SELECTED_COLOR}"
        elif [ "$step_num" -eq "$current_step" ]; then
            status_icon="►"
            color="${MENU_HEADER_COLOR}"
        else
            status_icon="○"
            color="${MENU_DISABLED_COLOR}"
        fi
        
        echo -e "  ${color}${status_icon} ${steps[$i]}${NC}"
    done
    
    echo -e "${MENU_HEADER_COLOR}└─────────────────────┘${NC}"
    echo ""
    
    # Progress bar
    local progress=$((current_step * 100 / total_steps))
    local filled=$((progress / 5))  # 20 chars max
    local empty=$((20 - filled))
    
    printf "Progress: ["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] %d%%\n" "$progress"
    echo ""
}

# Interactive text input with validation
# Usage: get_input "Prompt" [default_value] [validation_pattern]
get_input() {
    local prompt="$1"
    local default_value="$2"
    local validation_pattern="$3"
    
    while true; do
        if [ -n "$default_value" ]; then
            read -p "$prompt [default: $default_value]: " input
            input=${input:-$default_value}
        else
            read -p "$prompt: " input
        fi
        
        if [ -z "$validation_pattern" ] || [[ "$input" =~ $validation_pattern ]]; then
            MENU_RESULT="$input"
            return 0
        else
            echo -e "${MENU_DISABLED_COLOR}Invalid input. Please try again.${NC}"
        fi
    done
}

# Test function for menu components
test_menu_components() {
    echo "Testing Menu Components"
    echo "======================"
    
    echo -e "\n1. Simple Menu:"
    show_menu "Test Menu" "Option A|Option B|Option C" 2
    echo "Selected: $MENU_RESULT"
    
    echo -e "\n2. Confirmation Dialog:"
    if confirm "Do you want to continue with the test?" true; then
        echo "User confirmed"
    else
        echo "User cancelled"
    fi
    
    echo -e "\n3. Text Input:"
    get_input "Enter your name" "John Doe"
    echo "Input received: $MENU_RESULT"
    
    echo -e "\n4. Progress Menu:"
    steps="OS Detection|Install Dependencies|Setup Project|Configure Environment|Deploy Services"
    show_progress_menu 3 5 "$steps"
    
    echo -e "\n5. Profile Selection:"
    show_profile_menu
    echo "Selected profile: $MENU_RESULT"
    
    echo -e "\nMenu component tests complete!"
} 