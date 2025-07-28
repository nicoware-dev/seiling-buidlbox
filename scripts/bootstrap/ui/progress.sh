#!/bin/bash
# scripts/bootstrap/ui/progress.sh
# Progress bar and progress indicator components

# Colors for progress bars
PROGRESS_COLOR='\033[0;36m'  # Cyan
PROGRESS_FILL='█'
PROGRESS_EMPTY='░'
PROGRESS_BRACKET_COLOR='\033[0;37m'  # White
NC='\033[0m'

# Simple progress bar
# Usage: show_progress <current> <total> [width] [label]
show_progress() {
    local current=$1
    local total=$2
    local width=${3:-50}
    local label=${4:-"Progress"}
    
    local filled=$((current * width / total))
    local empty=$((width - filled))
    local percentage=$((current * 100 / total))
    
    # Clear line and move to beginning
    printf "\r\033[K"
    
    # Print label and bracket
    printf "${PROGRESS_BRACKET_COLOR}${label}: [${NC}"
    
    # Print filled portion
    printf "${PROGRESS_COLOR}"
    for ((i=0; i<filled; i++)); do
        printf "${PROGRESS_FILL}"
    done
    
    # Print empty portion
    printf "\033[0;90m"  # Dark gray
    for ((i=0; i<empty; i++)); do
        printf "${PROGRESS_EMPTY}"
    done
    
    # Print closing bracket and percentage
    printf "${PROGRESS_BRACKET_COLOR}] ${percentage}%%${NC}"
    
    # Add newline if complete
    if [ "$current" -eq "$total" ]; then
        printf "\n"
    fi
}

# Step progress indicator
# Usage: show_step_progress <current_step> <total_steps> <step_name>
show_step_progress() {
    local current=$1
    local total=$2
    local step_name=$3
    
    printf "\n${PROGRESS_COLOR}► Step ${current}/${total}:${NC} ${step_name}\n"
    show_progress "$current" "$total" 30 "Overall"
}

# Multi-line progress with details
# Usage: show_detailed_progress <current> <total> <main_label> <detail_text>
show_detailed_progress() {
    local current=$1
    local total=$2
    local main_label=$3
    local detail_text=$4
    
    # Save cursor position
    printf "\033[s"
    
    # Show main progress
    show_progress "$current" "$total" 40 "$main_label"
    
    # Show detail on next line
    printf "\n\033[0;90m${detail_text}${NC}"
    
    # Restore cursor for next update
    printf "\033[u"
}

# Indeterminate progress (for unknown duration tasks)
# Usage: start_indeterminate_progress <label> & PID=$!; ...; stop_indeterminate_progress $PID
start_indeterminate_progress() {
    local label=${1:-"Working"}
    local chars="▏▎▍▌▋▊▉█"
    local i=0
    
    while true; do
        printf "\r\033[K${PROGRESS_COLOR}${label}... "
        
        # Animate progress bar
        for ((j=0; j<8; j++)); do
            if [ $((i % 16)) -eq $j ] || [ $((i % 16)) -eq $((15-j)) ]; then
                printf "${chars:$j:1}"
            else
                printf " "
            fi
        done
        printf "${NC}"
        
        sleep 0.1
        i=$((i + 1))
    done
}

stop_indeterminate_progress() {
    local pid=$1
    kill $pid 2>/dev/null
    wait $pid 2>/dev/null
    printf "\r\033[K"
}

# Progress bar with ETA
# Usage: show_progress_with_eta <current> <total> <start_time> [label]
show_progress_with_eta() {
    local current=$1
    local total=$2
    local start_time=$3
    local label=${4:-"Progress"}
    
    local elapsed=$(($(date +%s) - start_time))
    local rate=$(( current > 0 ? elapsed * total / current : 0 ))
    local eta=$(( rate > elapsed ? rate - elapsed : 0 ))
    
    # Format ETA
    local eta_formatted
    if [ $eta -lt 60 ]; then
        eta_formatted="${eta}s"
    elif [ $eta -lt 3600 ]; then
        eta_formatted="$((eta/60))m $((eta%60))s"
    else
        eta_formatted="$((eta/3600))h $((eta%3600/60))m"
    fi
    
    show_progress "$current" "$total" 30 "$label"
    printf " ETA: ${eta_formatted}"
}

# Test function for progress components
test_progress_components() {
    echo "Testing Progress Components"
    echo "=========================="
    
    echo -e "\n1. Basic Progress Bar:"
    for i in {0..20}; do
        show_progress $i 20 40 "Loading"
        sleep 0.05
    done
    
    echo -e "\n2. Step Progress:"
    steps=("OS Detection" "Dependency Install" "Project Setup" "Configuration" "Deployment")
    for i in "${!steps[@]}"; do
        show_step_progress $((i+1)) ${#steps[@]} "${steps[$i]}"
        sleep 0.5
    done
    
    echo -e "\n3. Indeterminate Progress (3 seconds):"
    start_indeterminate_progress "Analyzing system" &
    progress_pid=$!
    sleep 3
    stop_indeterminate_progress $progress_pid
    echo "✓ Analysis complete"
    
    echo -e "\n4. Progress with ETA:"
    start_time=$(date +%s)
    for i in {0..15}; do
        show_progress_with_eta $i 15 $start_time "Installing"
        sleep 0.1
    done
    
    echo -e "\nProgress component tests complete!"
} 