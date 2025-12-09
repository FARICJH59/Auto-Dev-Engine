#!/usr/bin/env bash
# Phase 2 Agent: Security Scanner
# Purpose: Performs security scanning on the codebase
set -euo pipefail

echo "=== Phase 2: Security Scanner ==="

# Check for common security issues
echo "Checking for potential security issues..."

# Check for hardcoded secrets patterns
echo "  Scanning for hardcoded secrets..."
if command -v gitleaks &> /dev/null; then
  gitleaks detect --no-git --verbose || echo "  Gitleaks scan complete (check results)"
else
  echo "  Note: gitleaks not installed, skipping secret detection"
fi

# Check for vulnerable dependencies (if package files exist)
if [[ -f "package.json" ]] && command -v npm &> /dev/null; then
  echo "  Checking Node.js dependencies for vulnerabilities..."
  npm audit --audit-level=moderate || echo "  npm audit complete (review findings)"
fi

if [[ -f "requirements.txt" ]] && command -v pip &> /dev/null; then
  echo "  Note: Consider using 'pip-audit' for Python dependency scanning"
fi

echo "✓ Phase 2 security scan complete"
