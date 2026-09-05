#!/usr/bin/env bash
# ==============================================================================
# Namma Space - Dev Runner Script
# Launches both Frontend (Vite) and Backend (Node.js API) simultaneously.
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Starting Namma Space Development Environment..."

# Trap CTRL+C and kill background processes
trap 'kill $(jobs -p) 2>/dev/null' EXIT

# Start backend
echo "--> Starting Backend API on http://localhost:5001..."
cd "$PROJECT_ROOT/backend"
npm run dev &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 1

# Start frontend
echo "--> Starting 3D Web Viewer on Vite dev server..."
cd "$PROJECT_ROOT/frontend"
npm run dev

# Wait for background jobs
wait $BACKEND_PID
