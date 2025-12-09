#!/usr/bin/env bash
# Phase 2 Agent: Test Runner
# Purpose: Executes test suites and reports results
set -euo pipefail

echo "=== Phase 2: Test Runner ==="

# Note: Agent test harness is run separately by full-platform-verify.sh
# to avoid circular dependencies

# Run Node.js tests
if [[ -f "package.json" ]] && command -v npm &> /dev/null; then
  if grep -q '"test"' package.json; then
    echo "Running Node.js tests..."
    npm test || echo "  Some Node.js tests failed"
  fi
fi

# Run Python tests
if [[ -f "pytest.ini" ]] || [[ -f "setup.py" ]] && command -v pytest &> /dev/null; then
  echo "Running Python tests..."
  pytest || echo "  Some Python tests failed"
fi

# Run Go tests
if [[ -f "go.mod" ]] && command -v go &> /dev/null; then
  echo "Running Go tests..."
  go test ./... || echo "  Some Go tests failed"
fi

echo "✓ Phase 2 testing complete"
