#!/bin/bash
# Master Deployment Script
# Handles deployment to Vercel and other services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

# Check required environment variables
check_env_vars() {
    log_info "Checking environment variables..."
    
    local missing_vars=0
    
    if [ -z "$VERCEL_TOKEN" ]; then
        log_error "VERCEL_TOKEN is not set"
        missing_vars=1
    fi
    
    # Optional: Check for GCP variables if GCP deployment is needed
    if [ -n "$GCP_PROJECT_ID" ]; then
        log_info "GCP_PROJECT_ID is set: $GCP_PROJECT_ID"
    fi
    
    if [ $missing_vars -eq 1 ]; then
        log_error "Missing required environment variables"
        exit 1
    fi
    
    log_success "All required environment variables are set"
}

# Deploy to Vercel
deploy_vercel() {
    log_info "Starting Vercel deployment..."
    
    # Install Vercel CLI if not present
    if ! command -v vercel &> /dev/null; then
        log_info "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Check if we have vercel.json with project configuration
    if [ -f "vercel.json" ]; then
        local project_id=$(grep -o '"projectId"[[:space:]]*:[[:space:]]*"[^"]*"' vercel.json 2>/dev/null | cut -d'"' -f4 || echo "")
        local org_id=$(grep -o '"orgId"[[:space:]]*:[[:space:]]*"[^"]*"' vercel.json 2>/dev/null | cut -d'"' -f4 || echo "")
        
        if [ -n "$project_id" ] && [ -n "$org_id" ]; then
            log_info "Using project configuration from vercel.json"
        else
            log_warning "vercel.json found but projectId or orgId is empty"
            log_info "Will use environment variables or linked project"
        fi
    fi
    
    # Set production flag based on branch
    local prod_flag=""
    local branch="${GITHUB_REF_NAME:-main}"
    
    if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
        prod_flag="--prod"
        log_info "Deploying to production (branch: $branch)"
    else
        log_info "Deploying preview (branch: $branch)"
    fi
    
    # Run Vercel deployment
    vercel deploy $prod_flag --yes --token "$VERCEL_TOKEN"
    
    log_success "Vercel deployment completed"
}

# Main deployment orchestrator
main() {
    echo "========================================"
    echo "Master Deployment Script"
    echo "========================================"
    echo ""
    
    check_env_vars
    
    # Run Vercel deployment
    deploy_vercel
    
    echo ""
    log_success "All deployments completed successfully!"
}

main "$@"
