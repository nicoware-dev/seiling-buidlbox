@echo off
echo ========================================
echo Sei Nodes - Development Setup
echo ========================================

echo [1/5] Stopping any running n8n processes...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 >nul
echo ✓ Processes stopped

echo [2/5] Building Sei nodes...
cd /d "%~dp0n8n-nodes-sei"
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✓ Build completed

echo [3/5] Packing Sei nodes...
call npm pack
if errorlevel 1 (
    echo ❌ Pack failed
    pause
    exit /b 1
)
echo ✓ Package created

echo [4/5] Installing Sei nodes globally...
call npm install -g n8n-nodes-sei-0.1.0.tgz
if errorlevel 1 (
    echo ❌ Global installation failed
    pause
    exit /b 1
)
echo ✓ Globally installed

echo [5/5] Starting n8n...
cd /d "%~dp0"
set N8N_RUNNERS_ENABLED=true
set N8N_COMMUNITY_PACKAGES=n8n-nodes-sei

echo.
echo ========================================
echo n8n STARTING (Development Mode)...
echo ========================================
echo 🌐 Access: http://localhost:5678
echo 🔍 Search for "Sei" in the node palette
echo.
echo Your Sei nodes should appear as:
echo - Sei Transaction Builder
echo - Sei Transaction Executor  
echo - Sei Explorer
echo.
echo 🛑 Press Ctrl+C to stop n8n
echo.

n8n start

echo.
echo n8n has stopped.
pause 