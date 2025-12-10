#!/usr/bin/env bash
# Phase 2 Agent: Lint Checker
# Purpose: Runs linting tools on the codebase
set -euo pipefail

echo "=== Phase 2: Lint Checker ==="

# Shellcheck for shell scripts
if command -v shellcheck &> /dev/null; then
  echo "Running shellcheck on shell scripts..."
  find . -type f -name "*.sh" -not -path "*/node_modules/*" -not -path "*/.git/*" | while read -r script; do
    echo "  Checking: $script"
    shellcheck "$script" || echo "  Shellcheck issues found in $script"
  done
else
  echo "  Note: shellcheck not installed"
fi

# YAML lint
if command -v yamllint &> /dev/null; then
  echo "Running yamllint on YAML files..."
  find . -type f \( -name "*.yml" -o -name "*.yaml" \) -not -path "*/node_modules/*" -not -path "*/.git/*" | while read -r yaml; do
    echo "  Checking: $yaml"
    yamllint "$yaml" || echo "  YAML issues found in $yaml"
  done
else
  echo "  Note: yamllint not installed"
fi

# Kubernetes manifest validation
if command -v kubeconform &> /dev/null; then
  echo "Running kubeconform on Kubernetes manifests..."
  find . -type f \( -name "*.yml" -o -name "*.yaml" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.github/*" | while read -r manifest; do
    if grep -q "apiVersion:" "$manifest" 2>/dev/null; then
      echo "  Validating: $manifest"
      kubeconform "$manifest" || echo "  Validation issues in $manifest"
    fi
  done
else
  echo "  Note: kubeconform not installed"
fi

echo "✓ Phase 2 linting complete"
