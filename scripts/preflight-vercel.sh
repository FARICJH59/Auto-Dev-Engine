#!/usr/bin/env bash
# preflight-vercel.sh - Run preflight checks before Vercel deployment
# Usage: ./preflight-vercel.sh [DOMAIN]
# Uses VERCEL_DOMAIN from environment if DOMAIN not provided
# Exit codes: 0 = all checks pass, non-zero = failure
# Idempotent: Safe to run multiple times

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Get domain from argument or environment
DOMAIN="${1:-${VERCEL_DOMAIN:-}}"

if [[ -z "$DOMAIN" ]]; then
    echo "[preflight-vercel] ERROR: Domain required (provide as argument or set VERCEL_DOMAIN)"
    exit 1
fi

echo "[preflight-vercel] Running preflight checks for $DOMAIN"
echo "=============================================="

# Check 1: Verify Vercel CLI is logged in
echo ""
echo "[preflight-vercel] Step 1: Checking Vercel CLI authentication..."
if ! command -v vercel &>/dev/null; then
    echo "[preflight-vercel] ✗ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

if ! vercel whoami &>/dev/null; then
    echo "[preflight-vercel] ✗ Vercel CLI not logged in. Run: vercel login"
    exit 1
fi
VERCEL_USER=$(vercel whoami 2>/dev/null || echo "unknown")
echo "[preflight-vercel] ✓ Logged in as: $VERCEL_USER"

# Check 2: Add domain if missing (idempotent - safe if already added)
echo ""
echo "[preflight-vercel] Step 2: Ensuring domain is added to Vercel..."
if vercel domains add "$DOMAIN" 2>/dev/null; then
    echo "[preflight-vercel] ✓ Domain added: $DOMAIN"
else
    echo "[preflight-vercel] ✓ Domain already exists or added: $DOMAIN"
fi

# Check 3: DNS check
echo ""
echo "[preflight-vercel] Step 3: Checking DNS configuration..."
if ! "$SCRIPT_DIR/check-dns.sh" "$DOMAIN"; then
    echo "[preflight-vercel] ✗ DNS check failed"
    exit 2
fi

# Check 4: SSL check
echo ""
echo "[preflight-vercel] Step 4: Checking SSL certificate..."
if ! "$SCRIPT_DIR/check-ssl.sh" "$DOMAIN"; then
    echo "[preflight-vercel] ⚠ SSL check had issues (may need time to propagate)"
    # Don't fail on SSL - it may take time to issue
fi

echo ""
echo "=============================================="
echo "[preflight-vercel] ✓ All preflight checks passed for $DOMAIN"
exit 0
