#!/bin/bash
# Detect Vercel Project Script
# This script auto-detects the correct Vercel production project and outputs
# the projectId and orgId for configuration.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI is not installed. Please install it with: npm i -g vercel"
        exit 1
    fi
    log_info "Vercel CLI is installed"
}

# Check if VERCEL_TOKEN is set
check_vercel_token() {
    if [ -z "$VERCEL_TOKEN" ]; then
        log_warning "VERCEL_TOKEN environment variable is not set"
        log_info "Please set VERCEL_TOKEN or login with 'vercel login'"
        return 1
    fi
    log_info "VERCEL_TOKEN is set"
    return 0
}

# Get repository name from git
get_repo_name() {
    local remote_url
    remote_url=$(git -C "$PROJECT_ROOT" config --get remote.origin.url 2>/dev/null || echo "")
    
    if [ -z "$remote_url" ]; then
        log_warning "Could not detect git remote origin"
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
    
    log_info "Searching for Vercel projects matching: $repo_name"
    
    # List projects using Vercel CLI
    local projects_json
    if check_vercel_token; then
        projects_json=$(vercel project ls --token "$VERCEL_TOKEN" 2>/dev/null || echo "")
    else
        projects_json=$(vercel project ls 2>/dev/null || echo "")
    fi
    
    if [ -z "$projects_json" ]; then
        log_error "Could not retrieve Vercel projects. Please ensure you're logged in."
        return 1
    fi
    
    echo "$projects_json"
}

# Check for .vercel directory and project.json
check_local_vercel_config() {
    local vercel_dir="$PROJECT_ROOT/.vercel"
    local project_json="$vercel_dir/project.json"
    
    if [ -f "$project_json" ]; then
        log_info "Found existing .vercel/project.json"
        
        local project_id=$(grep -o '"projectId"[[:space:]]*:[[:space:]]*"[^"]*"' "$project_json" | cut -d'"' -f4)
        local org_id=$(grep -o '"orgId"[[:space:]]*:[[:space:]]*"[^"]*"' "$project_json" | cut -d'"' -f4)
        
        if [ -n "$project_id" ] && [ -n "$org_id" ]; then
            log_success "Detected projectId: $project_id"
            log_success "Detected orgId: $org_id"
            echo "PROJECT_ID=$project_id"
            echo "ORG_ID=$org_id"
            return 0
        fi
    fi
    
    log_warning "No local .vercel configuration found"
    return 1
}

# Check vercel.json for existing configuration
check_vercel_json() {
    local vercel_json="$PROJECT_ROOT/vercel.json"
    
    if [ -f "$vercel_json" ]; then
        log_info "Found vercel.json"
        
        local project_id=$(grep -o '"projectId"[[:space:]]*:[[:space:]]*"[^"]*"' "$vercel_json" | cut -d'"' -f4)
        local org_id=$(grep -o '"orgId"[[:space:]]*:[[:space:]]*"[^"]*"' "$vercel_json" | cut -d'"' -f4)
        
        if [ -n "$project_id" ] && [ -n "$org_id" ]; then
            log_success "vercel.json projectId: $project_id"
            log_success "vercel.json orgId: $org_id"
            echo "PROJECT_ID=$project_id"
            echo "ORG_ID=$org_id"
            return 0
        else
            log_warning "vercel.json exists but projectId or orgId is empty"
        fi
    fi
    
    return 1
}

# Main detection logic
main() {
    log_info "Starting Vercel project detection..."
    echo ""
    
    check_vercel_cli
    
    local repo_name
    repo_name=$(get_repo_name)
    
    if [ -n "$repo_name" ]; then
        log_info "Repository name: $repo_name"
    fi
    
    echo ""
    log_info "Checking existing configurations..."
    
    # First, check vercel.json
    if check_vercel_json; then
        echo ""
        log_success "Vercel project detected from vercel.json"
        return 0
    fi
    
    echo ""
    
    # Then check .vercel/project.json
    if check_local_vercel_config; then
        echo ""
        log_success "Vercel project detected from .vercel/project.json"
        log_info "Consider updating vercel.json with these values for consistency"
        return 0
    fi
    
    echo ""
    log_warning "No Vercel project configuration found locally"
    log_info "To set up Vercel project:"
    log_info "  1. Run 'vercel link' to connect to an existing project"
    log_info "  2. Or run 'vercel' to create a new project"
    log_info "  3. Then run this script again or use scripts/setup-vercel.sh"
    
    return 1
}

main "$@"
