#!/bin/bash
# ============================================================
# integrity-check.sh
# Auto-Dev-Engine Integrity Check Script
# ============================================================
# This script performs non-destructive safety checks to ensure
# compatibility between Auto-Dev-Engine, Rugged-Silo, and Vercel.
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# Manifest path
MANIFEST_PATH="$REPO_ROOT/compatibility/compatibility-manifest.json"

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# ============================================================
# Helper Functions
# ============================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

# ============================================================
# Check 1: JSON Validation
# ============================================================
check_json_validity() {
    log_info "Checking JSON validity of compatibility manifest..."
    
    if [ ! -f "$MANIFEST_PATH" ]; then
        log_error "Manifest file not found: $MANIFEST_PATH"
        return 1
    fi
    
    if command -v jq &> /dev/null; then
        if jq empty "$MANIFEST_PATH" 2>/dev/null; then
            log_pass "Compatibility manifest is valid JSON"
            return 0
        else
            log_error "Compatibility manifest contains invalid JSON"
            return 1
        fi
    elif command -v python3 &> /dev/null; then
        if python3 -c "import json; json.load(open('$MANIFEST_PATH'))" 2>/dev/null; then
            log_pass "Compatibility manifest is valid JSON"
            return 0
        else
            log_error "Compatibility manifest contains invalid JSON"
            return 1
        fi
    else
        log_warn "Neither jq nor python3 available for JSON validation"
        return 0
    fi
}

# ============================================================
# Check 2: Cloud Run File Detection
# ============================================================
check_cloud_run_files() {
    log_info "Checking for Cloud Run configuration files in staged changes..."
    
    # Patterns that indicate Cloud Run configurations
    CLOUD_RUN_PATTERNS=(
        "cloudrun*.yaml"
        "cloudrun*.yml"
        "service.yaml"
        "cloud-run*.yaml"
        "cloud-run*.yml"
        "*.service.yaml"
        "*.service.yml"
        "run.googleapis.com"
    )
    
    # Check if we're in a git repository
    if [ -d "$REPO_ROOT/.git" ]; then
        # Get list of changed files (staged and unstaged)
        CHANGED_FILES=$(git -C "$REPO_ROOT" diff --name-only HEAD 2>/dev/null || echo "")
        STAGED_FILES=$(git -C "$REPO_ROOT" diff --cached --name-only 2>/dev/null || echo "")
        
        ALL_CHANGES="$CHANGED_FILES $STAGED_FILES"
        
        CLOUD_RUN_FOUND=false
        for pattern in "${CLOUD_RUN_PATTERNS[@]}"; do
            for file in $ALL_CHANGES; do
                if [[ "$file" == *"$pattern"* ]] || [[ "$file" =~ cloudrun|cloud-run|service\.yaml ]]; then
                    log_warn "Detected potential Cloud Run config change: $file"
                    CLOUD_RUN_FOUND=true
                fi
            done
        done
        
        if [ "$CLOUD_RUN_FOUND" = false ]; then
            log_pass "No Cloud Run configuration files detected in changes"
        else
            log_warn "Cloud Run files detected - ensure SAFE MODE rules are followed"
        fi
    else
        log_warn "Not a git repository - skipping change detection"
    fi
    
    return 0
}

# ============================================================
# Check 3: Required Fields in Manifest
# ============================================================
check_manifest_fields() {
    log_info "Checking required fields in compatibility manifest..."
    
    if [ ! -f "$MANIFEST_PATH" ]; then
        log_error "Manifest file not found"
        return 1
    fi
    
    REQUIRED_FIELDS=(
        ".version"
        ".project.name"
        ".project.repository"
        ".vercel.primaryProjectId"
        ".cloudRun.safeMode.enabled"
    )
    
    if command -v jq &> /dev/null; then
        for field in "${REQUIRED_FIELDS[@]}"; do
            VALUE=$(jq -r "$field" "$MANIFEST_PATH" 2>/dev/null)
            if [ "$VALUE" = "null" ] || [ -z "$VALUE" ]; then
                log_error "Missing required field: $field"
            else
                log_pass "Field $field is present"
            fi
        done
    elif command -v python3 &> /dev/null; then
        python3 << EOF
import json
import sys

required_paths = [
    ["version"],
    ["project", "name"],
    ["project", "repository"],
    ["vercel", "primaryProjectId"],
    ["cloudRun", "safeMode", "enabled"]
]

with open("$MANIFEST_PATH") as f:
    data = json.load(f)

for path in required_paths:
    current = data
    field_name = ".".join(path)
    try:
        for key in path:
            current = current[key]
        print(f"PASS: {field_name}")
    except (KeyError, TypeError):
        print(f"FAIL: {field_name}")
        sys.exit(1)
EOF
        if [ $? -eq 0 ]; then
            log_pass "All required fields present"
        else
            log_error "Missing required fields"
        fi
    else
        log_warn "Cannot validate fields without jq or python3"
    fi
    
    return 0
}

# ============================================================
# Check 4: SAFE MODE Verification
# ============================================================
check_safe_mode() {
    log_info "Verifying SAFE MODE is enabled..."
    
    if [ ! -f "$MANIFEST_PATH" ]; then
        log_error "Manifest file not found"
        return 1
    fi
    
    if command -v jq &> /dev/null; then
        SAFE_MODE=$(jq -r '.cloudRun.safeMode.enabled' "$MANIFEST_PATH" 2>/dev/null)
        if [ "$SAFE_MODE" = "true" ]; then
            log_pass "SAFE MODE is enabled"
            return 0
        else
            log_error "SAFE MODE is not enabled - this violates the compatibility contract"
            return 1
        fi
    elif command -v python3 &> /dev/null; then
        SAFE_MODE=$(python3 -c "import json; print(json.load(open('$MANIFEST_PATH'))['cloudRun']['safeMode']['enabled'])" 2>/dev/null)
        if [ "$SAFE_MODE" = "True" ]; then
            log_pass "SAFE MODE is enabled"
            return 0
        else
            log_error "SAFE MODE is not enabled - this violates the compatibility contract"
            return 1
        fi
    else
        log_warn "Cannot verify SAFE MODE without jq or python3"
    fi
    
    return 0
}

# ============================================================
# Check 5: Compatibility Files Exist
# ============================================================
check_compatibility_files() {
    log_info "Checking that all compatibility files exist..."
    
    FILES_TO_CHECK=(
        "$REPO_ROOT/compatibility/compatibility-manifest.json"
        "$REPO_ROOT/compatibility/README.compat.md"
    )
    
    for file in "${FILES_TO_CHECK[@]}"; do
        if [ -f "$file" ]; then
            log_pass "File exists: $(basename "$file")"
        else
            log_error "Missing required file: $file"
        fi
    done
    
    return 0
}

# ============================================================
# Main Execution
# ============================================================

echo "============================================================"
echo "Auto-Dev-Engine Integrity Check"
echo "============================================================"
echo ""

# Run all checks
check_compatibility_files
check_json_validity
check_manifest_fields
check_safe_mode
check_cloud_run_files

echo ""
echo "============================================================"
echo "Summary"
echo "============================================================"
echo -e "Checks Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks Failed: ${RED}$CHECKS_FAILED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "${RED}Integrity check FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}Integrity check PASSED${NC}"
    exit 0
fi
