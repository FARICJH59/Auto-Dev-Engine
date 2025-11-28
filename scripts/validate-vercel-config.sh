#!/bin/bash
# Validate Vercel Configuration Script
# This script validates that the Vercel configuration is consistent
# across all configuration files and environment variables.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ERRORS=$((ERRORS + 1))
}

# Extract JSON values using basic shell tools
extract_json_value() {
    local file="$1"
    local key="$2"
    grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" "$file" 2>/dev/null | head -1 | cut -d'"' -f4
}

# Validate vercel.json exists and has required fields
validate_vercel_json() {
    local vercel_json="$PROJECT_ROOT/vercel.json"
    
    log_info "Validating vercel.json..."
    
    if [ ! -f "$vercel_json" ]; then
        log_error "vercel.json not found at $vercel_json"
        return 1
    fi
    
    # Check for valid JSON (basic check)
    if ! grep -q "^{" "$vercel_json"; then
        log_error "vercel.json does not appear to be valid JSON"
        return 1
    fi
    
    local project_id=$(extract_json_value "$vercel_json" "projectId")
    local org_id=$(extract_json_value "$vercel_json" "orgId")
    
    if [ -z "$project_id" ]; then
        log_warning "vercel.json: projectId is empty (required for consistent deployments)"
    else
        log_success "vercel.json: projectId is set ($project_id)"
    fi
    
    if [ -z "$org_id" ]; then
        log_warning "vercel.json: orgId is empty (required for consistent deployments)"
    else
        log_success "vercel.json: orgId is set ($org_id)"
    fi
    
    return 0
}

# Validate .vercel/project.json if it exists
validate_vercel_project_json() {
    local project_json="$PROJECT_ROOT/.vercel/project.json"
    
    log_info "Validating .vercel/project.json..."
    
    if [ ! -f "$project_json" ]; then
        log_info ".vercel/project.json not found (this is normal for fresh clones)"
        return 0
    fi
    
    local project_id=$(extract_json_value "$project_json" "projectId")
    local org_id=$(extract_json_value "$project_json" "orgId")
    
    if [ -z "$project_id" ]; then
        log_error ".vercel/project.json: projectId is empty"
    else
        log_success ".vercel/project.json: projectId is set ($project_id)"
    fi
    
    if [ -z "$org_id" ]; then
        log_error ".vercel/project.json: orgId is empty"
    else
        log_success ".vercel/project.json: orgId is set ($org_id)"
    fi
    
    return 0
}

# Validate consistency between vercel.json and .vercel/project.json
validate_consistency() {
    local vercel_json="$PROJECT_ROOT/vercel.json"
    local project_json="$PROJECT_ROOT/.vercel/project.json"
    
    log_info "Checking configuration consistency..."
    
    if [ ! -f "$vercel_json" ] || [ ! -f "$project_json" ]; then
        log_info "Skipping consistency check (missing files)"
        return 0
    fi
    
    local vj_project_id=$(extract_json_value "$vercel_json" "projectId")
    local vj_org_id=$(extract_json_value "$vercel_json" "orgId")
    local pj_project_id=$(extract_json_value "$project_json" "projectId")
    local pj_org_id=$(extract_json_value "$project_json" "orgId")
    
    # Only check consistency if both have values
    if [ -n "$vj_project_id" ] && [ -n "$pj_project_id" ]; then
        if [ "$vj_project_id" != "$pj_project_id" ]; then
            log_error "Project ID mismatch: vercel.json ($vj_project_id) != .vercel/project.json ($pj_project_id)"
        else
            log_success "Project IDs are consistent"
        fi
    fi
    
    if [ -n "$vj_org_id" ] && [ -n "$pj_org_id" ]; then
        if [ "$vj_org_id" != "$pj_org_id" ]; then
            log_error "Org ID mismatch: vercel.json ($vj_org_id) != .vercel/project.json ($pj_org_id)"
        else
            log_success "Org IDs are consistent"
        fi
    fi
    
    return 0
}

# Validate environment variables
validate_environment() {
    log_info "Validating environment variables..."
    
    if [ -n "$VERCEL_TOKEN" ]; then
        log_success "VERCEL_TOKEN is set"
    else
        log_warning "VERCEL_TOKEN is not set (required for CI/CD deployments)"
    fi
    
    if [ -n "$VERCEL_ORG_ID" ]; then
        log_success "VERCEL_ORG_ID is set"
    else
        log_info "VERCEL_ORG_ID is not set (optional, can be in vercel.json)"
    fi
    
    if [ -n "$VERCEL_PROJECT_ID" ]; then
        log_success "VERCEL_PROJECT_ID is set"
    else
        log_info "VERCEL_PROJECT_ID is not set (optional, can be in vercel.json)"
    fi
    
    return 0
}

# Validate GitHub Actions workflow
validate_github_workflow() {
    local workflow="$PROJECT_ROOT/.github/workflows/main.yml"
    
    log_info "Validating GitHub Actions workflow..."
    
    if [ ! -f "$workflow" ]; then
        log_warning "Main workflow not found at $workflow"
        return 0
    fi
    
    if grep -q "VERCEL_TOKEN" "$workflow"; then
        log_success "Workflow references VERCEL_TOKEN secret"
    else
        log_warning "Workflow does not reference VERCEL_TOKEN"
    fi
    
    if grep -q "VERCEL_ORG_ID\|VERCEL_PROJECT_ID" "$workflow"; then
        log_success "Workflow references Vercel project secrets"
    else
        log_info "Workflow does not explicitly reference VERCEL_ORG_ID or VERCEL_PROJECT_ID (may be using vercel.json)"
    fi
    
    return 0
}

# Print summary
print_summary() {
    echo ""
    echo "========================================"
    echo "Validation Summary"
    echo "========================================"
    
    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}All checks passed!${NC}"
    else
        if [ $ERRORS -gt 0 ]; then
            echo -e "${RED}Errors: $ERRORS${NC}"
        fi
        if [ $WARNINGS -gt 0 ]; then
            echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
        fi
    fi
    
    echo "========================================"
    
    return $ERRORS
}

# Main validation
main() {
    echo "========================================"
    echo "Vercel Configuration Validator"
    echo "========================================"
    echo ""
    
    validate_vercel_json
    echo ""
    
    validate_vercel_project_json
    echo ""
    
    validate_consistency
    echo ""
    
    validate_environment
    echo ""
    
    validate_github_workflow
    
    print_summary
    
    exit $ERRORS
}

main "$@"
