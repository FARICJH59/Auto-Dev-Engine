#!/usr/bin/env bash
# deploy-vercel.sh - Deploy to Vercel production
# Uses VERCEL_PROJECT and VERCEL_TOKEN from environment
# Exit codes: 0 = success, non-zero = failure
# Idempotent: Safe to run multiple times (will create new deployment)

set -euo pipefail

echo "[deploy-vercel] Starting Vercel production deployment"
echo "=============================================="

# Check required environment variables
if [[ -z "${VERCEL_TOKEN:-}" ]]; then
    echo "[deploy-vercel] ERROR: VERCEL_TOKEN environment variable not set"
    exit 1
fi

# Build command arguments
# Using array to properly handle arguments
VERCEL_ARGS=(--prod --confirm)

if [[ -n "${VERCEL_PROJECT:-}" ]]; then
    echo "[deploy-vercel] Deploying project: $VERCEL_PROJECT"
else
    echo "[deploy-vercel] Deploying current directory (no VERCEL_PROJECT set)"
fi

echo "[deploy-vercel] Running: vercel ${VERCEL_ARGS[*]}"
echo ""

# Run deployment
DEPLOY_OUTPUT=$(vercel "${VERCEL_ARGS[@]}" --token="$VERCEL_TOKEN" 2>&1) || {
    EXIT_CODE=$?
    echo "[deploy-vercel] ✗ Deployment failed with exit code: $EXIT_CODE"
    echo "[deploy-vercel] Output:"
    echo "$DEPLOY_OUTPUT"
    exit $EXIT_CODE
}

# Extract deployment URL (usually the last URL in output)
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -1 || echo "")

echo ""
echo "=============================================="
echo "[deploy-vercel] ✓ Deployment completed"
if [[ -n "$DEPLOY_URL" ]]; then
    echo "[deploy-vercel] Deploy URL: $DEPLOY_URL"
fi
echo "[deploy-vercel] Exit code: 0"
exit 0
