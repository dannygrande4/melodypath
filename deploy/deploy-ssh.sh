#!/bin/bash
set -e

# ─── Deploy to dannygrande.com via SSH ────────────────────────────────────────
# Edit these variables for your server:
SERVER_USER="${DEPLOY_USER:-danny}"
SERVER_HOST="${DEPLOY_HOST:-dannygrande.com}"
SERVER_PATH="${DEPLOY_PATH:-/var/www/melodypath/dist}"

cd "$(dirname "$0")/.."

# Build first
echo "→ Building..."
bash deploy/build.sh

echo ""
echo "→ Deploying to ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}"
echo ""

# Sync the dist folder
rsync -avz --delete \
  apps/web/dist/ \
  "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"

echo ""
echo "=== Deployed ==="
echo "Visit: https://dannygrande.com/music"
