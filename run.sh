#!/usr/bin/env bash
# Carrboro Weather Dashboard Launcher
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8080

# Check if port 8080 is already running
PID=$(lsof -ti :$PORT 2>/dev/null)
if [ -n "$PID" ]; then
  echo "Stopping existing server on port $PORT (PID $PID)..."
  kill "$PID" 2>/dev/null || true
  sleep 1
fi

echo "Starting Carrboro Weather Server on port $PORT..."
python3 "$DIR/server.py" "$PORT" &
SERVER_PID=$!
echo "Server started with PID $SERVER_PID"
sleep 1

# Open in browser if xdg-open exists
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://localhost:$PORT" >/dev/null 2>&1 &
fi

echo "Carrboro Weather Dashboard is running at http://localhost:$PORT"
