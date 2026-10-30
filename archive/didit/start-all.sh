#!/bin/bash

# Script to start both Didit proxy server and Expo app

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all processes..."
    # Kill proxy server
    pkill -f "node.*proxy.js" 2>/dev/null
    # Kill Expo
    pkill -f "expo start" 2>/dev/null
    lsof -ti:8081,8082,8083,3001 | xargs kill -9 2>/dev/null
    echo "All processes stopped."
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

echo "🚀 Starting Didit Proxy Server and Expo App..."
echo ""

# Start proxy server in background
echo "📡 Starting proxy server on port 3001..."
cd "$SCRIPT_DIR/server"
node proxy.js > /tmp/proxy.log 2>&1 &
PROXY_PID=$!
sleep 3

# Check if proxy started successfully by checking if port is listening
if ! lsof -i:3001 > /dev/null 2>&1; then
    echo "❌ Failed to start proxy server (port 3001 not listening)"
    echo "Check /tmp/proxy.log for details"
    cat /tmp/proxy.log
    exit 1
fi

echo "✅ Proxy server started (PID: $PROXY_PID)"
echo "   Health check: http://192.168.7.57:3001/health"
echo ""

# Start Expo app
echo "📱 Starting Expo app..."
cd "$SCRIPT_DIR"
npx expo start -c
