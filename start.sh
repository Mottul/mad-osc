#!/usr/bin/env bash
# Build the PWA (if needed) and start the mad-osc bridge, which serves the
# control surface and prints a QR code to open it on your phone.
#
# Usage:
#   ./start.sh                 # build if missing, then start
#   ./start.sh --rebuild       # force a fresh build
#   MADMAPPER_HOST=192.168.1.50 ./start.sh   # remote MadMapper host
#
# Env vars (all optional): HTTP_PORT (8080), MADMAPPER_HOST (127.0.0.1),
# OSC_OUT_PORT (8000), OSC_IN_PORT (9000).

set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required (https://nodejs.org). Node 18+ recommended." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "==> Installing dependencies..."
  npm install
fi

if [ "${1:-}" = "--rebuild" ] || [ ! -f packages/app/dist/index.html ]; then
  echo "==> Building the PWA..."
  npm run build
fi

echo "==> Starting bridge..."
exec npm -w @mad-osc/bridge run start
