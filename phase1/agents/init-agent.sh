#!/usr/bin/env bash
# Phase 1 Agent: Repository Initialization
# Purpose: Initializes the repository structure and validates basic setup
set -euo pipefail

echo "=== Phase 1: Initialization Agent ==="
echo "Checking repository structure..."

# Validate we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "ERROR: Not in a git repository"
  exit 1
fi

# Check for required directories
REQUIRED_DIRS=("scripts" "docs" "phase1" "phase2" "phase3")
for dir in "${REQUIRED_DIRS[@]}"; do
  if [[ ! -d "$dir" ]]; then
    echo "Creating directory: $dir"
    mkdir -p "$dir"
  fi
done

echo "✓ Phase 1 initialization complete"
echo "Repository structure validated successfully"
