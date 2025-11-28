#!/usr/bin/env bash
# autopilot.sh - High-level wrapper for autonomous deployment
# Sources env-bootstrap and calls run-all.sh
# Logs start/end timestamps for auditing
# Idempotent: Safe to run multiple times

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Log start timestamp
START_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "=============================================="
echo "[autopilot] Rugged-Silo Autonomous Pipeline"
echo "=============================================="
echo "[autopilot] Start time: $START_TIME"
echo ""

# Source environment bootstrap (loads .env variables)
echo "[autopilot] Sourcing environment..."
# shellcheck source=/dev/null
source "$SCRIPT_DIR/env-bootstrap.sh"

# Run the full orchestration
echo ""
echo "[autopilot] Starting orchestration..."
EXIT_CODE=0
"$SCRIPT_DIR/run-all.sh" || EXIT_CODE=$?

# Log end timestamp
END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo ""
echo "=============================================="
echo "[autopilot] End time: $END_TIME"

if [[ $EXIT_CODE -eq 0 ]]; then
    echo "[autopilot] ✓ Autonomous pipeline completed successfully"
else
    echo "[autopilot] ✗ Autonomous pipeline failed with exit code: $EXIT_CODE"
fi

echo "=============================================="
exit $EXIT_CODE
