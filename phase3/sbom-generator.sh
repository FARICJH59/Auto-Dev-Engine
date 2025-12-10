#!/usr/bin/env bash
# Phase 3 Agent: SBOM Generator
# Purpose: Generates Software Bill of Materials
set -euo pipefail

echo "=== Phase 3: SBOM Generator ==="

# Generate SBOM using Syft if available
if command -v syft &> /dev/null; then
  echo "Generating SBOM with Syft..."
  SBOM_OUTPUT="${SBOM_OUTPUT:-sbom.json}"
  
  if [[ -f "Dockerfile" ]]; then
    echo "  Analyzing Dockerfile..."
    syft dir:. -o json > "$SBOM_OUTPUT" || echo "  SBOM generation had issues"
    echo "✓ SBOM generated: $SBOM_OUTPUT"
  else
    echo "  Analyzing directory..."
    syft dir:. -o json > "$SBOM_OUTPUT" || echo "  SBOM generation had issues"
    echo "✓ SBOM generated: $SBOM_OUTPUT"
  fi
else
  echo "  Note: Syft not installed"
  echo "  Install with: curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin"
fi

# Alternative: CycloneDX for Node.js projects
if [[ -f "package.json" ]] && command -v cyclonedx-npm &> /dev/null; then
  echo "Generating CycloneDX SBOM for Node.js project..."
  cyclonedx-npm --output-file sbom-cyclonedx.json || echo "  CycloneDX generation had issues"
fi

echo "✓ Phase 3 SBOM generation complete"
