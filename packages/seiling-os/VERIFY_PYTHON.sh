#!/bin/bash
# Verification script - run this after installing Python

echo "Checking Python installation..."
echo ""

# Check python
if command -v python &> /dev/null; then
    echo "✅ Python found:"
    python --version
else
    echo "❌ Python not found in PATH"
    echo "   Try using 'py' instead:"
    py --version 2>/dev/null || echo "   'py' also not found - Python may not be installed"
fi

echo ""

# Check pip
if command -v pip &> /dev/null; then
    echo "✅ pip found:"
    pip --version
else
    echo "❌ pip not found"
    echo "   Try using 'py -m pip' instead:"
    py -m pip --version 2>/dev/null || echo "   pip not available"
fi

echo ""
echo "If Python is installed, you can now proceed with setup commands."

