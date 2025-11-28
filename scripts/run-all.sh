#!/usr/bin/env bash
# run-all.sh - Orchestrator: verify then deploy
# Runs verify-everything.sh and if successful, runs deploy-vercel.sh
# Fail-fast behavior: stops on first failure
# Idempotent: Safe to run multiple times

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[run-all] Starting deployment orchestration"
echo "=============================================="
echo ""

# Step 1: Run verification
echo "[run-all] Step 1: Running verification..."
if ! "$SCRIPT_DIR/verify-everything.sh"; then
    echo ""
    echo "[run-all] ✗ Verification failed - aborting deployment"
    echo "[run-all] Diagnostics:"
    echo "  - Check VERCEL_DOMAIN is correctly set"
    echo "  - Check DNS is pointing to Vercel (76.76.21.21)"
    echo "  - Check Vercel CLI is authenticated (vercel login)"
    exit 1
fi

# Step 2: Deploy to Vercel
echo ""
echo "[run-all] Step 2: Deploying to Vercel..."
if ! "$SCRIPT_DIR/deploy-vercel.sh"; then
    echo ""
    echo "[run-all] ✗ Vercel deployment failed"
    echo "[run-all] Diagnostics:"
    echo "  - Check VERCEL_TOKEN is set and valid"
    echo "  - Check VERCEL_PROJECT is correct (if set)"
    echo "  - Check Vercel project configuration"
    exit 1
fi

echo ""
echo "=============================================="
echo "[run-all] ✓ Deployment orchestration complete"
exit 0
