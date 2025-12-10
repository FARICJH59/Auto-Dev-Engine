#!/usr/bin/env bash
# Phase 1 Agent: Structure Validator
# Purpose: Validates the project structure and configuration files
set -euo pipefail

echo "=== Phase 1: Structure Validator ==="

# Check for README
if [[ -f "README.md" ]]; then
  echo "✓ README.md found"
else
  echo "  Warning: README.md not found"
fi

# Check for LICENSE
if [[ -f "LICENSE" ]] || [[ -f "LICENSE.md" ]]; then
  echo "✓ LICENSE found"
else
  echo "  Warning: LICENSE not found"
fi

# Check for .gitignore
if [[ -f ".gitignore" ]]; then
  echo "✓ .gitignore found"
else
  echo "  Warning: .gitignore not found"
fi

# Check for CI/CD configuration
if [[ -d ".github/workflows" ]]; then
  echo "✓ GitHub Actions workflows directory found"
  WORKFLOW_COUNT=$(find .github/workflows -name "*.yml" -o -name "*.yaml" | wc -l)
  echo "  Found $WORKFLOW_COUNT workflow file(s)"
fi

echo "✓ Phase 1 structure validation complete"
