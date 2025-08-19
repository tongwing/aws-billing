#!/bin/bash

# Frontend start script for AWS Billing Dashboard
# This script starts the React development server with hot reload

echo "Starting AWS Billing Dashboard Frontend..."
echo "=================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if the backend is running
echo "🔍 Checking backend connectivity..."
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo "✅ Backend is running on port 8000"
else
    echo "⚠️  Backend not detected on port 8000"
    echo "   Make sure to start the backend first:"
    echo "   cd ../backend && ./start.sh"
    echo ""
fi

# Set environment variables for the React app
# Auto-detect external IP for API URL if not set
if [ -z "$REACT_APP_API_URL" ]; then
    EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null)
    if [ -n "$EXTERNAL_IP" ]; then
        export REACT_APP_API_URL=http://$EXTERNAL_IP:8000/api
    else
        export REACT_APP_API_URL=http://localhost:8000/api
    fi
fi
export BROWSER=none  # Prevent automatic browser opening
export HOST=0.0.0.0  # Bind to all interfaces for external access
export PORT=3000     # Force port 3000

echo "🚀 Starting React development server..."
echo "   Frontend will be available at:"
echo "   - Local: http://localhost:3000"
echo "   - Network: http://0.0.0.0:3000"
echo "   - External: http://$(curl -s ifconfig.me 2>/dev/null):3000"
echo "   API endpoint: $REACT_APP_API_URL"
echo "   Press Ctrl+C to stop"
echo ""

# Start the React development server with hot reload
# Note: Webpack deprecation warnings are harmless and can be ignored
npm start