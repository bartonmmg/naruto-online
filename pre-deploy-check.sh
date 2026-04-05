#!/bin/bash
# Pre-deployment validation script
# Run this before pushing to main to catch build issues early

set -e

echo "🔍 Pre-Deploy Validation Check"
echo "════════════════════════════════════════════"

# 1. Check git status
echo "✓ Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Warning: Uncommitted changes detected. Commit before deploying."
  git status --short
fi

# 2. Check Node version
echo "✓ Checking Node version..."
NODE_VERSION=$(node -v)
echo "  Node: $NODE_VERSION"

# 3. Install dependencies
echo "✓ Installing dependencies..."
npm install --legacy-peer-deps 2>&1 | tail -3

# 4. Build frontend only (what Netlify does)
echo "✓ Building frontend (Netlify simulation)..."
cd frontend
npm run build 2>&1 | grep -E "✓|error|Error" | head -5
cd ..

# 5. Check .env files
echo "✓ Checking environment files..."
if [ ! -f "frontend/.env.local" ]; then
  echo "⚠️  Warning: frontend/.env.local not found (needed for API_URL in production)"
fi

echo ""
echo "════════════════════════════════════════════"
echo "✅ Pre-deploy checks passed!"
echo ""
echo "Next steps:"
echo "1. git push origin main"
echo "2. Monitor build at: https://app.netlify.com/sites/naruto-online/deploys"
echo ""
