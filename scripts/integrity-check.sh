#!/usr/bin/env bash
# scripts/integrity-check.sh
# Lightweight integrity checks for Rugged-Silo compatibility package.
set -euo pipefail

info(){ printf "\e[1;34m[INFO]\e[0m %s\n" "$*"; }
warn(){ printf "\e[1;33m[WARN]\e[0m %s\n" "$*"; }
error(){ printf "\e[1;31m[ERROR]\e[0m %s\n" "$*"; exit 1; }

# 1) Ensure we are in repo root
if [ ! -d ".git" ]; then
  error "Not in a git repository root."
fi

# 2) Manifest syntax check (if jq present)
MANIFEST="compatibility/compatibility-manifest.json"
if [ -f "$MANIFEST" ]; then
  if command -v jq >/dev/null 2>&1; then
    if ! jq empty "$MANIFEST" >/dev/null 2>&1; then
      error "compatibility-manifest.json is invalid JSON."
    else
      info "Manifest JSON valid."
    fi
  else
    warn "jq not installed - skipping manifest JSON validation."
  fi
else
  warn "Manifest file missing: $MANIFEST"
fi

# 3) Do not modify Cloud Run configs (detect common filenames)
CANDIDATES=("deploy/kubernetes" "deploy/cloudrun" "deploy/terraform" "cloudrun" "gcloud" "cloud-run" "cloudrun.yaml")
for c in "${CANDIDATES[@]}"; do
  if git ls-files --error-unmatch "$c" >/dev/null 2>&1; then
    warn "Detected existing Cloud Run/K8s related path in repo: $c (no action taken)."
  fi
done

info "Integrity checks completed. This script does NOT modify infra."
exit 0
