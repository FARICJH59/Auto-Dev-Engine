#!/bin/bash
# Setup Vercel Project Script
# This script helps set up and configure Vercel project for consistent deployments.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Source shared utilities
source "$SCRIPT_DIR/vercel-utils.sh"

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        vercel_log_error "Vercel CLI is not installed."
        vercel_log_info "Installing Vercel CLI globally..."
        npm install -g vercel
    fi
    vercel_log_success "Vercel CLI is available"
}

# Update vercel.json with projectId and orgId
update_vercel_json_file() {
    local project_id="$1"
    local org_id="$2"
    local vercel_json="$PROJECT_ROOT/vercel.json"
    
    if [ ! -f "$vercel_json" ]; then
        vercel_log_info "Creating vercel.json..."
        cat > "$vercel_json" << EOF
{
  "\$schema": "https://openapi.vercel.sh/vercel.json",
  "projectId": "$project_id",
  "orgId": "$org_id",
  "framework": null,
  "buildCommand": null,
  "devCommand": null,
  "installCommand": null,
  "outputDirectory": null
}
EOF
        vercel_log_success "Created vercel.json with project configuration"
    else
        vercel_log_info "Updating vercel.json..."
        
        # Use shared utility for safer JSON updates
        if update_json_value "$vercel_json" "projectId" "$project_id" && \
           update_json_value "$vercel_json" "orgId" "$org_id"; then
            vercel_log_success "Updated vercel.json with project configuration"
        else
            vercel_log_error "Failed to update vercel.json"
            return 1
        fi
    fi
}

# Link to existing Vercel project
link_project() {
    vercel_log_info "Linking to Vercel project..."
    
    cd "$PROJECT_ROOT"
    
    local link_output
    if [ -n "$VERCEL_TOKEN" ]; then
        link_output=$(vercel link --yes --token "$VERCEL_TOKEN" 2>&1) || {
            vercel_log_warning "Could not auto-link: $link_output"
            vercel_log_info "Running interactive mode..."
            vercel link
        }
    else
        vercel link
    fi
    
    vercel_log_success "Project linked successfully"
}

# Sync configuration from .vercel/project.json to vercel.json
sync_config() {
    local project_json="$PROJECT_ROOT/.vercel/project.json"
    
    if [ ! -f "$project_json" ]; then
        vercel_log_warning ".vercel/project.json not found. Run 'vercel link' first."
        return 1
    fi
    
    local project_id=$(extract_json_value "$project_json" "projectId")
    local org_id=$(extract_json_value "$project_json" "orgId")
    
    if [ -z "$project_id" ] || [ -z "$org_id" ]; then
        vercel_log_error "Could not extract projectId or orgId from .vercel/project.json"
        return 1
    fi
    
    vercel_log_info "Found projectId: $project_id"
    vercel_log_info "Found orgId: $org_id"
    
    update_vercel_json_file "$project_id" "$org_id"
    
    return 0
}

# Show GitHub secrets instructions
show_github_secrets_instructions() {
    local project_json="$PROJECT_ROOT/.vercel/project.json"
    
    echo ""
    echo "========================================"
    echo "GitHub Repository Secrets Setup"
    echo "========================================"
    echo ""
    
    if [ -f "$project_json" ]; then
        local project_id=$(extract_json_value "$project_json" "projectId")
        local org_id=$(extract_json_value "$project_json" "orgId")
        
        echo "Add the following secrets to your GitHub repository:"
        echo ""
        echo "  VERCEL_TOKEN     = <your-vercel-token>"
        echo "  VERCEL_ORG_ID    = $org_id"
        echo "  VERCEL_PROJECT_ID = $project_id"
        echo ""
        echo "To get a Vercel token:"
        echo "  1. Go to https://vercel.com/account/tokens"
        echo "  2. Create a new token"
        echo "  3. Copy the token value"
        echo ""
        echo "To add secrets to GitHub:"
        echo "  1. Go to your repository on GitHub"
        echo "  2. Navigate to Settings > Secrets and variables > Actions"
        echo "  3. Click 'New repository secret'"
        echo "  4. Add each secret with the values above"
    else
        echo "Link your project first to get the project and org IDs:"
        echo "  ./scripts/setup-vercel.sh --link"
    fi
    
    echo "========================================"
}

# Main setup logic
main() {
    echo "========================================"
    echo "Vercel Project Setup"
    echo "========================================"
    echo ""
    
    check_vercel_cli
    
    case "${1:-}" in
        --link)
            link_project
            sync_config
            show_github_secrets_instructions
            ;;
        --sync)
            sync_config
            show_github_secrets_instructions
            ;;
        --secrets)
            show_github_secrets_instructions
            ;;
        --help)
            echo "Usage: $0 [OPTION]"
            echo ""
            echo "Options:"
            echo "  --link     Link to Vercel project and sync configuration"
            echo "  --sync     Sync configuration from .vercel/project.json to vercel.json"
            echo "  --secrets  Show GitHub secrets setup instructions"
            echo "  --help     Show this help message"
            echo ""
            echo "Without options, the script will attempt to sync if linked,"
            echo "or prompt to link if not."
            ;;
        *)
            if [ -f "$PROJECT_ROOT/.vercel/project.json" ]; then
                vercel_log_info "Found existing .vercel/project.json, syncing configuration..."
                sync_config
                show_github_secrets_instructions
            else
                vercel_log_info "No Vercel project linked. Starting link process..."
                link_project
                sync_config
                show_github_secrets_instructions
            fi
            ;;
    esac
    
    echo ""
    vercel_log_success "Setup complete!"
    vercel_log_info "Run './scripts/validate-vercel-config.sh' to validate your configuration"
}

main "$@"
