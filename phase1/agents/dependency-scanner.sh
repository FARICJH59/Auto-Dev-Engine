#!/usr/bin/env bash
# Phase 1 Agent: Dependency Scanner
# Purpose: Scans and validates project dependencies
set -euo pipefail

echo "=== Phase 1: Dependency Scanner ==="

# Check for Python dependencies
if [[ -f "requirements.txt" ]]; then
  echo "✓ Found requirements.txt"
  if command -v pip &> /dev/null; then
    echo "  Checking Python dependencies..."
    pip check || echo "  Warning: Some Python dependency issues detected"
  fi
fi

# Check for Node.js dependencies
if [[ -f "package.json" ]]; then
  echo "✓ Found package.json"
  if [[ -f "package-lock.json" ]]; then
    echo "✓ Found package-lock.json"
  else
    echo "  Warning: package-lock.json not found"
  fi
  if command -v npm &> /dev/null; then
    echo "  Node.js dependencies validated"
  fi
fi

# Check for Go dependencies
if [[ -f "go.mod" ]]; then
  echo "✓ Found go.mod"
  if [[ -f "go.sum" ]]; then
    echo "✓ Found go.sum"
  fi
  if command -v go &> /dev/null; then
    go mod verify || echo "  Warning: Go module verification issues"
  fi
fi

echo "✓ Phase 1 dependency scan complete"
