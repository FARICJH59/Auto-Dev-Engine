#!/usr/bin/env bash
# env-bootstrap.sh - Load environment variables from .env file if present
# Idempotent: Safe to run multiple times
# Exports: VERCEL_TOKEN, VERCEL_PROJECT, VERCEL_DOMAIN, GCP_PROJECT (optional)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"

# Load .env file if it exists
if [[ -f "$ENV_FILE" ]]; then
    echo "[env-bootstrap] Loading environment from $ENV_FILE"
    # Read and export each line that looks like VAR=value
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
        # Remove leading/trailing whitespace from key
        key=$(echo "$key" | xargs)
        # Skip if key is empty after trimming
        [[ -z "$key" ]] && continue
        # Export the variable (value keeps quotes if present)
        export "$key"="$value"
    done < "$ENV_FILE"
else
    echo "[env-bootstrap] No .env file found at $ENV_FILE, using existing environment"
fi

# Export expected variables (use existing values or empty string)
export VERCEL_TOKEN="${VERCEL_TOKEN:-}"
export VERCEL_PROJECT="${VERCEL_PROJECT:-}"
export VERCEL_DOMAIN="${VERCEL_DOMAIN:-}"
export GCP_PROJECT="${GCP_PROJECT:-}"

echo "[env-bootstrap] Environment loaded:"
echo "  VERCEL_TOKEN: ${VERCEL_TOKEN:+(set)}"
echo "  VERCEL_PROJECT: ${VERCEL_PROJECT:-(not set)}"
echo "  VERCEL_DOMAIN: ${VERCEL_DOMAIN:-(not set)}"
echo "  GCP_PROJECT: ${GCP_PROJECT:-(not set)}"
