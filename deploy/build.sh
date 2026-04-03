#!/bin/bash
set -e

# ─── MelodyPath Production Build ─────────────────────────────────────────────
# This script builds the frontend for deployment.
# Output: apps/web/dist/ (ready to serve as static files)

cd "$(dirname "$0")/.."

echo "=== MelodyPath Production Build ==="
echo ""

# Install dependencies
echo "→ Installing dependencies..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Run tests
echo "→ Running music-theory tests..."
pnpm --filter @melodypath/music-theory run test

# Build frontend
echo "→ Building frontend (production)..."
pnpm --filter @melodypath/web run build

echo ""
echo "=== Build complete ==="
echo ""
echo "Output: apps/web/dist/"
echo "Size:   $(du -sh apps/web/dist/ | cut -f1)"
echo ""
echo "To deploy:"
echo "  1. Copy apps/web/dist/ to your server"
echo "  2. Configure nginx (see deploy/nginx-subpath.conf)"
echo "  3. Visit https://dannygrande.com/music"
echo ""
echo "Quick test locally:"
echo "  cd apps/web && pnpm preview"
