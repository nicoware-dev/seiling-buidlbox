#!/bin/bash
# scripts/bootstrap/test_ui.sh
# Comprehensive UI component test script

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load shared configuration and UI components
if [ -f "$SCRIPT_DIR/shared_config.sh" ]; then
    source "$SCRIPT_DIR/shared_config.sh"
else
    echo "ERROR: shared_config.sh not found"
    exit 1
fi

# Override error handling for test script
set -e
trap 'echo "Test failed at line $LINENO"' ERR

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test execution wrapper
run_ui_test() {
    local test_name="$1"
    local test_function="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    print_step "Testing: $test_name"
    
    if $test_function; then
        print_success "$test_name - PASSED"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        print_error "$test_name - FAILED"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Test functions for each component
test_status_components() {
    print_section "Status Component Test"
    
    # Test basic status messages
    print_success "This is a success message"
    print_error "This is an error message"
    print_warning "This is a warning message"
    print_info "This is an info message"
    print_debug "This is a debug message"
    print_step "This is a step message"
    
    sleep 1
    
    # Test formatting
    print_key_value "Test Key" "Test Value"
    print_list_item "Test list item"
    print_list_item "Success item" "success"
    print_list_item "Error item" "error"
    print_indent 1 "Indented message"
    
    return 0
}

test_progress_components() {
    print_section "Progress Component Test"
    
    # Test basic progress bar
    print_info "Testing basic progress bar:"
    for i in {0..10}; do
        show_progress $i 10 30 "Loading"
        sleep 0.1
    done
    
    # Test step progress
    print_info "Testing step progress:"
    show_step_progress 3 5 "Environment Configuration"
    
    sleep 1
    return 0
}

test_spinner_components() {
    print_section "Spinner Component Test"
    
    # Test basic spinner
    print_info "Testing spinner (3 seconds):"
    start_spinner "Processing data" 1 &
    local spinner_pid=$!
    sleep 3
    stop_spinner $spinner_pid "success" "Data processing complete"
    
    # Test spinner with command
    print_info "Testing command with spinner:"
    with_spinner "sleep 2" "Running test command" 5
    
    return 0
}

test_menu_components() {
    print_section "Menu Component Test"
    
    # Show profile menu (for display testing)
    print_info "Displaying profile menu (visual test):"
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
    
    sleep 2
    return 0
}

test_table_components() {
    print_section "Table Component Test"
    
    print_info "Testing table formatting:"
    print_table_header "Service|Port|Status|Description" "15|8|10|25"
    print_table_row "n8n|5678|Running|Workflow automation" "15|8|10|25" "success"
    print_table_row "OpenWebUI|3000|Running|Chat interface" "15|8|10|25" "success"
    print_table_row "Flowise|3001|Error|Visual AI builder" "15|8|10|25" "error"
    print_table_row "Eliza|3010|Starting|AI agent framework" "15|8|10|25" "warning"
    print_table_footer "15|8|10|25"
    
    return 0
}

test_summary_boxes() {
    print_section "Summary Box Test"
    
    print_summary_box "SUCCESS" "All UI components are working correctly!
Tests completed successfully." "success"
    
    print_summary_box "INFO" "This is an informational message box.
Multiple lines are supported." "info"
    
    print_summary_box "WARNING" "This is a warning message box.
Please check the details." "warning"
    
    return 0
}

test_banners() {
    print_section "Banner Test"
    
    print_banner "SEILING" "$STATUS_HEADER"
    print_banner "SUCCESS" "$STATUS_SUCCESS"
    
    return 0
}

test_bootstrap_modes() {
    print_section "Bootstrap Mode Test"
    
    # Test configuration functions
    print_info "Testing configuration functions:"
    
    # Test mode checking
    if is_auto_mode; then
        print_info "Running in AUTO mode"
    else
        print_info "Not in AUTO mode"
    fi
    
    if is_test_mode; then
        print_info "Running in TEST mode"
    else
        print_info "Not in TEST mode"
    fi
    
    # Test mock command
    print_info "Testing mock command execution:"
    mock_command "echo" "This would be executed"
    
    # Test execute with output
    print_info "Testing execute with output:"
    execute_with_output "sleep 1" "Simulating process" false
    
    return 0
}

test_error_handling() {
    print_section "Error Handling Test"
    
    print_info "Testing error handling (will not actually fail):"
    
    # Simulate error handling test without actually failing
    print_mode_aware "error" "Simulated error message"
    print_mode_aware "warning" "Simulated warning message"
    print_mode_aware "success" "Error handling test complete"
    
    return 0
}

# Interactive test menu
show_test_menu() {
    while true; do
        clear
        print_header "SEILING BUIDLBOX UI TEST SUITE"
        
        echo ""
        echo "Select a test to run:"
        echo ""
        echo "  1) Status Components Test"
        echo "  2) Progress Components Test"
        echo "  3) Spinner Components Test"
        echo "  4) Menu Components Test"
        echo "  5) Table Components Test"
        echo "  6) Summary Boxes Test"
        echo "  7) Banner Test"
        echo "  8) Bootstrap Modes Test"
        echo "  9) Error Handling Test"
        echo " 10) Run All Tests"
        echo " 11) Exit"
        echo ""
        
        read -p "Enter your choice (1-11): " choice
        
        case $choice in
            1) run_ui_test "Status Components" test_status_components ;;
            2) run_ui_test "Progress Components" test_progress_components ;;
            3) run_ui_test "Spinner Components" test_spinner_components ;;
            4) run_ui_test "Menu Components" test_menu_components ;;
            5) run_ui_test "Table Components" test_table_components ;;
            6) run_ui_test "Summary Boxes" test_summary_boxes ;;
            7) run_ui_test "Banners" test_banners ;;
            8) run_ui_test "Bootstrap Modes" test_bootstrap_modes ;;
            9) run_ui_test "Error Handling" test_error_handling ;;
            10) run_all_tests ;;
            11) break ;;
            *) print_warning "Invalid choice. Please select 1-11." ;;
        esac
        
        if [ "$choice" != "11" ]; then
            echo ""
            read -p "Press Enter to continue..."
        fi
    done
}

# Run all tests
run_all_tests() {
    clear
    print_header "RUNNING ALL UI COMPONENT TESTS"
    
    # Reset counters
    TOTAL_TESTS=0
    PASSED_TESTS=0
    FAILED_TESTS=0
    
    # Run all tests
    run_ui_test "Status Components" test_status_components
    run_ui_test "Progress Components" test_progress_components
    run_ui_test "Spinner Components" test_spinner_components
    run_ui_test "Menu Components" test_menu_components
    run_ui_test "Table Components" test_table_components
    run_ui_test "Summary Boxes" test_summary_boxes
    run_ui_test "Banners" test_banners
    run_ui_test "Bootstrap Modes" test_bootstrap_modes
    run_ui_test "Error Handling" test_error_handling
    
    # Show results
    print_section "TEST RESULTS"
    print_key_value "Total Tests" "$TOTAL_TESTS"
    print_key_value "Passed" "$PASSED_TESTS"
    print_key_value "Failed" "$FAILED_TESTS"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        print_summary_box "ALL TESTS PASSED" "🎉 All UI components are working correctly!
The test suite completed successfully." "success"
    else
        print_summary_box "SOME TESTS FAILED" "❌ $FAILED_TESTS out of $TOTAL_TESTS tests failed.
Please review the output above." "error"
    fi
}

# Automated test mode
run_automated_tests() {
    print_header "AUTOMATED UI COMPONENT TESTS"
    print_info "Running in automated mode..."
    
    # Set quiet mode for cleaner automated output
    QUIET_MODE=false
    
    run_all_tests
    
    # Return appropriate exit code
    if [ $FAILED_TESTS -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# Main execution
main() {
    # Parse command line arguments
    AUTO_RUN=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -auto|--auto)
                AUTO_RUN=true
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  -auto, --auto    Run all tests automatically"
                echo "  -h, --help       Show this help message"
                echo ""
                echo "Interactive mode (default): Shows a menu to select individual tests"
                echo "Automated mode (-auto): Runs all tests and exits with status code"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Check if UI components are available
    if [ ! -f "$SCRIPT_DIR/ui/status.sh" ]; then
        print_error "UI components not found. Please ensure all UI scripts are in $SCRIPT_DIR/ui/"
        exit 1
    fi
    
    # Run tests
    if [ "$AUTO_RUN" = true ]; then
        run_automated_tests
    else
        show_test_menu
        print_info "UI test suite completed. Goodbye!"
    fi
}

# Run main function
main "$@" 