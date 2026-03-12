#!/bin/bash

echo "=== Blood on the Clocktower Storyteller Setup ==="

# Function to gracefully shutdown servers
shutdown_servers() {
    echo ""
    echo "Shutting down servers..."
    if [ ! -z "$SERVER_PID" ]; then
        echo "Stopping WebSocket server (PID $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null
        wait $SERVER_PID 2>/dev/null
    fi
    if [ ! -z "$HTTP_PID" ]; then
        echo "Stopping HTTP server (PID $HTTP_PID)..."
        kill $HTTP_PID 2>/dev/null
        wait $HTTP_PID 2>/dev/null
    fi
    echo "All servers stopped."
    exit 0
}

# Function to kill processes using specific ports
kill_port_processes() {
    local port=$1
    local port_name=$2
    
    echo "Checking for processes using $port_name port $port..."
    
    # Find and kill processes using the port
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "Found processes using $port_name port: $pids"
        echo "Killing existing processes..."
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 2
    else
        echo "No processes found using $port_name port $port"
    fi
}

# Set up trap for graceful shutdown
trap shutdown_servers SIGINT SIGTERM

# 1. Check for Node.js
if ! command -v node &> /dev/null
then
    echo "Node.js could not be found. Please install Node.js first: https://nodejs.org/"
    exit
fi

# 2. Initialize npm if needed
if [ ! -f package.json ]; then
    echo "Initializing npm..."
    npm init -y
fi

# 3. Install WebSocket library
echo "Installing ws library..."
npm install ws

# 4. Determine local IP
if [ -z "$1" ]; then
    echo "No IP parameter provided, trying to auto-detect..."
    IP=$(ipconfig getifaddr en0)
    if [ -z "$IP" ]; then
        IP=$(ipconfig getifaddr en1)
    fi
    if [ -z "$IP" ]; then
        echo "Could not auto-detect IP. Please provide it manually:"
        echo "./setup.sh <your_local_IP>"
        exit 1
    fi
else
    IP=$1
    echo "Using provided IP: $IP"
fi

echo "Detected IP: $IP"
echo "This IP will be injected into display.html and controller.html"
echo ""
echo "⚠️  SECURITY WARNING: This will replace YOUR_IP placeholder with your actual IP"
echo "   Do NOT commit these files to version control with real IP addresses!"
echo "   Use YOUR_IP placeholder for public repositories"
echo ""

# 5. Inject IP into index.html and controller.html
for FILE in display.html controller.html; do
    if [ -f "$FILE" ]; then
        echo "Updating WebSocket URL in $FILE..."
        
        # Check if file contains YOUR_IP placeholder
        if grep -q "YOUR_IP" "$FILE"; then
            echo "✅ $FILE already uses YOUR_IP placeholder - safe to proceed"
        else
            echo "❌ ERROR: $FILE contains hardcoded IP address!"
            echo "   Please replace with YOUR_IP placeholder before running setup"
            echo "   Current setup script will NOT modify files with hardcoded IPs"
            echo "   Skipping $FILE..."
            continue
        fi
        
        # Backup original file
        cp "$FILE" "$FILE.bak"
        # Replace line with ws URL
        sed -i '' "s|const ws = new WebSocket('ws://YOUR_IP:8080');|const ws = new WebSocket('ws://$IP:8080');|" "$FILE"
        echo "✅ Updated $FILE with IP: $IP"
    else
        echo "Warning: $FILE not found, skipping..."
    fi
done


# 6. Clean up any existing processes on our ports
echo "Cleaning up existing processes..."
kill_port_processes 8080 "WebSocket"
kill_port_processes 8000 "HTTP"

# 7. Start WebSocket server in background
echo "Starting WebSocket server..."
node server.js &
SERVER_PID=$!
echo "Server running with PID $SERVER_PID"

# 8. Start HTTP server for hosting HTML files
echo "Starting local HTTP server at http://$IP:8000"
npx http-server . -p 8000 &
HTTP_PID=$!
echo "HTTP server running with PID $HTTP_PID"

echo ""
echo "Setup complete!"
echo "TV Display URL: http://$IP:8000/display.html"
echo "Controller URL: http://$IP:8000/controller.html"
echo "Keep this terminal open while playing."
echo "Press Ctrl+C to gracefully stop both servers."

# Wait for servers to finish (keeps script running)
wait