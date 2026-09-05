#!/usr/bin/env bash
# ==============================================================================
# Namma Space - Environment Setup Script
# Installs dependencies for Frontend and Backend services.
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "==> Setting up Namma Space repository at: $PROJECT_ROOT"

# 1. Frontend dependencies
echo ""
echo "--> Installing Frontend dependencies (React + Vite + Three.js)..."
cd "$PROJECT_ROOT/frontend"
npm install

# 2. Backend dependencies
echo ""
echo "--> Installing Backend dependencies (Node.js + Express + TypeScript)..."
cd "$PROJECT_ROOT/backend"
npm install

# 3. Python environment check
echo ""
echo "--> Checking Python environment for 3D Reconstruction..."
if command -v python3 &>/dev/null; then
    PYTHON_VER=$(python3 --version)
    echo "    Found $PYTHON_VER"
    echo "    To set up Python reconstruction virtual environment, run:"
    echo "    cd reconstruction && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
else
    echo "    [Warning] python3 not found on PATH. Please install Python 3.10+ for CV reconstruction."
fi

echo ""
echo "==> Setup completed successfully!"
echo "    Run './scripts/run_dev.sh' to launch development servers."
