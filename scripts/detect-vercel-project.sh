#!/bin/bash
# Detect Vercel Project Script
# This script auto-detects the correct Vercel production project and outputs
# the projectId and orgId for configuration.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Source shared utilities
source "$SCRIPT_DIR/vercel-utils.sh"

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        vercel_log_error "Vercel CLI is not installed. Please install it with: npm i -g vercel"
        exit 1
    fi
    vercel_log_info "Vercel CLI is installed"
}

# Check if VERCEL_TOKEN is set
check_vercel_token() {
    if [ -z "$VERCEL_TOKEN" ]; then
        vercel_log_warning "VERCEL_TOKEN environment variable is not set"
        vercel_log_info "Please set VERCEL_TOKEN or login with 'vercel login'"
        return 1
    fi
    vercel_log_info "VERCEL_TOKEN is set"
    return 0
}

# Get repository name from git
get_repo_name() {
    local remote_url
    remote_url=$(git -C "$PROJECT_ROOT" config --get remote.origin.url 2>/dev/null || echo "")
    
    if [ -z "$remote_url" ]; then
        vercel_log_warning "Could not detect git remote origin"
        echo ""
        return
    fi
    
    # Extract repo name from URL (handles both HTTPS and SSH URLs)
    local repo_name
    repo_name=$(basename -s .git "$remote_url")
    echo "$repo_name"
}

# List all Vercel projects and find matching production project
detect_production_project() {
    local repo_name="$1"
    
    vercel_log_info "Searching for Vercel projects matching: $repo_name"
    
    # List projects using Vercel CLI
    local projects_json
    local vercel_output
    if check_vercel_token; then
        vercel_output=$(vercel project ls --token "$VERCEL_TOKEN" 2>&1) || {
            vercel_log_warning "Vercel CLI returned an error: $vercel_output"
            echo ""
            return 1
        }
    else
        vercel_output=$(vercel project ls 2>&1) || {
            vercel_log_warning "Vercel CLI returned an error: $vercel_output"
            echo ""
            return 1
        }
    fi
    
    echo "$vercel_output"
}

# Check for .vercel directory and project.json
check_local_vercel_config() {
    local vercel_dir="$PROJECT_ROOT/.vercel"
    local project_json="$vercel_dir/project.json"
    
    if [ -f "$project_json" ]; then
        vercel_log_info "Found existing .vercel/project.json"
        
        local project_id=$(extract_json_value "$project_json" "projectId")
        local org_id=$(extract_json_value "$project_json" "orgId")
        
        if [ -n "$project_id" ] && [ -n "$org_id" ]; then
            vercel_log_success "Detected projectId: $project_id"
            vercel_log_success "Detected orgId: $org_id"
            echo "PROJECT_ID=$project_id"
            echo "ORG_ID=$org_id"
            return 0
        fi
    fi
    
    vercel_log_warning "No local .vercel configuration found"
    return 1
}

# Check vercel.json for existing configuration
check_vercel_json() {
    local vercel_json="$PROJECT_ROOT/vercel.json"
    
    if [ -f "$vercel_json" ]; then
        vercel_log_info "Found vercel.json"
        
        local project_id=$(extract_json_value "$vercel_json" "projectId")
        local org_id=$(extract_json_value "$vercel_json" "orgId")
        
        if [ -n "$project_id" ] && [ -n "$org_id" ]; then
            vercel_log_success "vercel.json projectId: $project_id"
            vercel_log_success "vercel.json orgId: $org_id"
            echo "PROJECT_ID=$project_id"
            echo "ORG_ID=$org_id"
            return 0
        else
            vercel_log_warning "vercel.json exists but projectId or orgId is empty"
        fi
    fi
    
    return 1
}

# Main detection logic
main() {
    vercel_log_info "Starting Vercel project detection..."
    echo ""
    
    check_vercel_cli
    
    local repo_name
    repo_name=$(get_repo_name)
    
    if [ -n "$repo_name" ]; then
        vercel_log_info "Repository name: $repo_name"
    fi
    
    echo ""
    vercel_log_info "Checking existing configurations..."
    
    # First, check vercel.json
    if check_vercel_json; then
        echo ""
        vercel_log_success "Vercel project detected from vercel.json"
        return 0
    fi
    
    echo ""
    
    # Then check .vercel/project.json
    if check_local_vercel_config; then
        echo ""
        vercel_log_success "Vercel project detected from .vercel/project.json"
        vercel_log_info "Consider updating vercel.json with these values for consistency"
        return 0
    fi
    
    echo ""
    vercel_log_warning "No Vercel project configuration found locally"
    vercel_log_info "To set up Vercel project:"
    vercel_log_info "  1. Run 'vercel link' to connect to an existing project"
    vercel_log_info "  2. Or run 'vercel' to create a new project"
    vercel_log_info "  3. Then run this script again or use scripts/setup-vercel.sh"
    
    return 1
}

main "$@"
