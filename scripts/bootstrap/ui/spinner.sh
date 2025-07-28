#!/bin/bash
# scripts/bootstrap/ui/spinner.sh
# Spinner and loading animation components

# Colors for spinners
SPINNER_COLOR='\033[0;36m'  # Cyan
SUCCESS_COLOR='\033[0;32m'  # Green
ERROR_COLOR='\033[0;31m'    # Red
NC='\033[0m'

# Spinner styles
SPINNER_STYLES=(
    "|/-\\"
    "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
    "◐◓◑◒"
    "▁▃▄▅▆▇█▇▆▅▄▃"
    "⣾⣽⣻⢿⡿⣟⣯⣷"
    "🌍🌎🌏"
    "⚪⚫"
    "⬆⬇"
)

# Current spinner PID (global for cleanup)
SPINNER_PID=""

# Simple spinner
# Usage: start_spinner [message] [style_index] & SPINNER_PID=$!
start_spinner() {
    local message=${1:-"Loading"}
    local style_index=${2:-0}
    local delay=0.1
    
    # Get spinner characters
    local spinner_chars="${SPINNER_STYLES[$style_index]}"
    local spinner_length=${#spinner_chars}
    
    local i=0
    while true; do
        local char="${spinner_chars:$((i % spinner_length)):1}"
        printf "\r${SPINNER_COLOR}${char}${NC} ${message}..."
        sleep $delay
        i=$((i + 1))
    done
}

# Stop spinner with result
# Usage: stop_spinner $SPINNER_PID [success|error] [message]
stop_spinner() {
    local pid=$1
    local result=${2:-"success"}
    local message=${3:-""}
    
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null
        wait "$pid" 2>/dev/null
    fi
    
    printf "\r\033[K"  # Clear line
    
    if [ "$result" = "success" ]; then
        printf "${SUCCESS_COLOR}✓${NC} ${message}\n"
    elif [ "$result" = "error" ]; then
        printf "${ERROR_COLOR}✗${NC} ${message}\n"
    else
        printf "${SPINNER_COLOR}◉${NC} ${message}\n"
    fi
}

# Spinner with timeout
# Usage: spinner_with_timeout <command> <timeout_seconds> [message]
spinner_with_timeout() {
    local command="$1"
    local timeout=$2
    local message=${3:-"Processing"}
    
    # Start spinner in background
    start_spinner "$message" 1 &
    local spinner_pid=$!
    
    # Run command with timeout
    if timeout "$timeout" bash -c "$command" >/dev/null 2>&1; then
        stop_spinner $spinner_pid "success" "$message completed"
        return 0
    else
        stop_spinner $spinner_pid "error" "$message failed or timed out"
        return 1
    fi
}

# Multi-spinner for multiple tasks
# Usage: start_multi_spinner "Task1|Task2|Task3" [completed_mask]
start_multi_spinner() {
    local tasks_string="$1"
    local completed_mask=${2:-"000"}  # Binary mask for completed tasks
    
    IFS='|' read -ra tasks <<< "$tasks_string"
    local task_count=${#tasks[@]}
    
    printf "\n"
    for i in "${!tasks[@]}"; do
        local status_char
        if [ "${completed_mask:$i:1}" = "1" ]; then
            status_char="${SUCCESS_COLOR}✓${NC}"
        else
            status_char="${SPINNER_COLOR}◉${NC}"
        fi
        printf "  $status_char ${tasks[$i]}\n"
    done
    printf "\033[${task_count}A"  # Move cursor up
}

# Update multi-spinner
update_multi_spinner() {
    local tasks_string="$1"
    local completed_mask="$2"
    local current_task=${3:-0}
    
    IFS='|' read -ra tasks <<< "$tasks_string"
    local task_count=${#tasks[@]}
    
    for i in "${!tasks[@]}"; do
        printf "\r\033[K"  # Clear line
        
        local status_char
        if [ "${completed_mask:$i:1}" = "1" ]; then
            status_char="${SUCCESS_COLOR}✓${NC}"
        elif [ "$i" -eq "$current_task" ]; then
            # Animate current task
            local spinner_chars="|/-\\"
            local char_index=$(($(date +%s) % 4))
            local char="${spinner_chars:$char_index:1}"
            status_char="${SPINNER_COLOR}${char}${NC}"
        else
            status_char="${SPINNER_COLOR}◉${NC}"
        fi
        
        printf "  $status_char ${tasks[$i]}"
        if [ "$i" -lt $((task_count - 1)) ]; then
            printf "\n"
        fi
    done
    
    if [ "$current_task" -lt $((task_count - 1)) ]; then
        printf "\033[${task_count}A"  # Move cursor up
    fi
}

# Dots animation
# Usage: start_dots_animation [message] & PID=$!
start_dots_animation() {
    local message=${1:-"Working"}
    local max_dots=3
    local i=0
    
    while true; do
        local dots=""
        for ((j=0; j<(i % (max_dots + 1)); j++)); do
            dots+="."
        done
        
        printf "\r\033[K${SPINNER_COLOR}${message}${dots}${NC}"
        sleep 0.5
        i=$((i + 1))
    done
}

# Breathing animation
# Usage: start_breathing_animation [message] [color] & PID=$!
start_breathing_animation() {
    local message=${1:-"Waiting"}
    local color=${2:-$SPINNER_COLOR}
    local chars="⬜⬛"
    local i=0
    
    while true; do
        local char_index=$((i % 2))
        local char="${chars:$char_index:1}"
        printf "\r${color}${char}${NC} ${message}"
        sleep 1
        i=$((i + 1))
    done
}

# Execute command with spinner
# Usage: with_spinner "command to run" "Loading message" [timeout]
with_spinner() {
    local command="$1"
    local message=${2:-"Processing"}
    local timeout=${3:-30}
    
    # Start spinner
    start_spinner "$message" 1 &
    local spinner_pid=$!
    
    # Create temporary files for command output
    local stdout_file=$(mktemp)
    local stderr_file=$(mktemp)
    
    # Run command
    local exit_code=0
    if timeout "$timeout" bash -c "$command" >"$stdout_file" 2>"$stderr_file"; then
        stop_spinner $spinner_pid "success" "$message completed"
    else
        exit_code=$?
        if [ $exit_code -eq 124 ]; then
            stop_spinner $spinner_pid "error" "$message timed out after ${timeout}s"
            echo "TIMEOUT: Command exceeded ${timeout} seconds timeout"
            echo "Consider increasing DEPLOY_TIMEOUT environment variable"
        else
            stop_spinner $spinner_pid "error" "$message failed (exit code: $exit_code)"
        fi
        
        # Show error output if available
        if [ -s "$stderr_file" ]; then
            echo "Error output:"
            cat "$stderr_file" | head -10
        fi
        
        # Show stdout too for debugging
        if [ -s "$stdout_file" ]; then
            echo "Standard output (last 10 lines):"
            tail -10 "$stdout_file"
        fi
    fi
    
    # Cleanup
    rm -f "$stdout_file" "$stderr_file"
    return $exit_code
}

# Test function for spinner components
test_spinner_components() {
    echo "Testing Spinner Components"
    echo "========================="
    
    echo -e "\n1. Basic Spinners (different styles):"
    for i in {0..3}; do
        echo "Style $i:"
        start_spinner "Loading style $i" $i &
        local pid=$!
        sleep 2
        stop_spinner $pid "success" "Style $i complete"
    done
    
    echo -e "\n2. Spinner with Timeout:"
    spinner_with_timeout "sleep 1" 3 "Testing timeout"
    
    echo -e "\n3. Multi-task Spinner:"
    tasks="OS Detection|Install Dependencies|Setup Project|Configure Environment|Deploy Services"
    start_multi_spinner "$tasks" "00000"
    
    for i in {0..4}; do
        sleep 1
        local mask=""
        for j in {0..4}; do
            if [ $j -le $i ]; then
                mask+="1"
            else
                mask+="0"
            fi
        done
        update_multi_spinner "$tasks" "$mask" $((i + 1))
    done
    printf "\n"
    
    echo -e "\n4. Dots Animation (3 seconds):"
    start_dots_animation "Processing data" &
    local dots_pid=$!
    sleep 3
    stop_spinner $dots_pid "success" "Data processing complete"
    
    echo -e "\n5. Command with Spinner:"
    with_spinner "sleep 1.5" "Running test command" 5
    
    echo -e "\nSpinner component tests complete!"
} 