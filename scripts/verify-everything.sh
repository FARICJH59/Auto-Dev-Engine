#!/usr/bin/env bash
# verify-everything.sh - Run all verification checks without deploying
# Runs env-bootstrap and preflight-vercel, reports status
# Exit codes: 0 = all checks pass, non-zero = failure
# Idempotent: Safe to run multiple times

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[verify-everything] Starting verification pipeline"
echo "=============================================="
echo ""

# Step 1: Load environment
echo "[verify-everything] Step 1: Loading environment..."
# shellcheck source=/dev/null
source "$SCRIPT_DIR/env-bootstrap.sh"

# Step 2: Run preflight checks (if VERCEL_DOMAIN is set)
echo ""
echo "[verify-everything] Step 2: Running preflight checks..."

if [[ -z "${VERCEL_DOMAIN:-}" ]]; then
    echo "[verify-everything] ⚠ VERCEL_DOMAIN not set, skipping Vercel preflight checks"
    echo "[verify-everything] Set VERCEL_DOMAIN in .env or environment to enable DNS/SSL checks"
else
    if ! "$SCRIPT_DIR/preflight-vercel.sh" "$VERCEL_DOMAIN"; then
        echo ""
        echo "[verify-everything] ✗ Preflight checks failed"
        exit 1
    fi
fi

echo ""
echo "=============================================="
echo "[verify-everything] ✓ All verification checks passed"
echo "[verify-everything] Note: This script does NOT auto-deploy"
echo "[verify-everything] Run run-all.sh to verify and deploy"
exit 0
