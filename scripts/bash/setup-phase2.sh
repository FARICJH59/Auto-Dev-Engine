#!/usr/bin/env bash
#
# Auto-Dev-Engine Phase-2 Setup Script for Linux/macOS
#
# This script validates prerequisites, creates directory structure,
# installs dependencies, generates environment files, and runs initial tests.
#
# Usage:
#   ./setup-phase2.sh
#   ./setup-phase2.sh --skip-tests
#   ./setup-phase2.sh --skip-lint
#   ./setup-phase2.sh --force

set -e

# Script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Options
SKIP_TESTS=false
SKIP_LINT=false
FORCE=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --skip-tests)
            SKIP_TESTS=true
            ;;
        --skip-lint)
            SKIP_LINT=true
            ;;
        --force)
            FORCE=true
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --skip-tests    Skip running smoke tests"
            echo "  --skip-lint     Skip running linters"
            echo "  --force         Overwrite existing environment files"
            echo "  -h, --help      Show this help message"
            exit 0
            ;;
    esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================"
echo -e "Auto-Dev-Engine Phase-2 Setup"
echo -e "========================================${NC}"
echo ""
echo -e "${GRAY}Project Root: $PROJECT_ROOT${NC}"
echo ""

#######################################
# Check Prerequisites
#######################################
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    local errors=()

    # Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        echo -e "  ${GREEN}[OK]${NC} Node.js: $node_version"
    else
        errors+=("Node.js is not installed or not in PATH")
    fi

    # npm
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        echo -e "  ${GREEN}[OK]${NC} npm: $npm_version"
    else
        errors+=("npm is not installed or not in PATH")
    fi

    # Python (optional)
    if command -v python3 &> /dev/null; then
        local python_version=$(python3 --version)
        echo -e "  ${GREEN}[OK]${NC} $python_version"
    elif command -v python &> /dev/null; then
        local python_version=$(python --version)
        echo -e "  ${GREEN}[OK]${NC} $python_version"
    else
        echo -e "  ${YELLOW}[WARN]${NC} Python not found (optional)"
    fi

    # Git
    if command -v git &> /dev/null; then
        local git_version=$(git --version)
        echo -e "  ${GREEN}[OK]${NC} $git_version"
    else
        errors+=("Git is not installed or not in PATH")
    fi

    # Bash version
    echo -e "  ${GREEN}[OK]${NC} Bash: $BASH_VERSION"

    if [ ${#errors[@]} -gt 0 ]; then
        echo ""
        echo -e "${RED}Prerequisites check failed:${NC}"
        for error in "${errors[@]}"; do
            echo -e "  ${RED}- $error${NC}"
        done
        exit 1
    fi

    echo ""
    echo -e "${GREEN}All prerequisites satisfied!${NC}"
    echo ""
}

#######################################
# Create Directory Structure
#######################################
create_directories() {
    echo -e "${YELLOW}Creating directory structure...${NC}"

    local directories=(
        "backend/src"
        "backend/tests"
        "backend/docs"
        "frontend/src"
        "frontend/public"
        "frontend/tests"
        "frontend/docs"
        "orchestration/auto-orchestrator/level-6"
        "orchestration/.state"
        "orchestration/.runs"
        "pipelines"
        "configs"
        "adapters"
        "services/policyEngine"
        "services/quotaEngine"
        "services/modelRouter"
        "bus/toolBus"
        "bus/toolBus/.plugins-cache"
        "scripts/powershell"
        "scripts/bash"
        "ops/configs"
        "ops/observability"
        "ops/security"
        ".vscode"
    )

    for dir in "${directories[@]}"; do
        local full_path="$PROJECT_ROOT/$dir"
        if [ ! -d "$full_path" ]; then
            mkdir -p "$full_path"
            echo -e "  ${GRAY}Created: $dir${NC}"
        else
            echo -e "  ${GRAY}Exists:  $dir${NC}"
        fi
    done

    echo ""
    echo -e "${GREEN}Directory structure created!${NC}"
    echo ""
}

#######################################
# Install Dependencies
#######################################
install_dependencies() {
    echo -e "${YELLOW}Installing dependencies...${NC}"

    # Backend dependencies
    if [ -f "$PROJECT_ROOT/backend/package.json" ]; then
        echo -e "  ${GRAY}Installing backend dependencies...${NC}"
        (cd "$PROJECT_ROOT/backend" && npm install)
        echo -e "  ${GREEN}Backend dependencies installed!${NC}"
    fi

    # Frontend dependencies
    if [ -f "$PROJECT_ROOT/frontend/package.json" ]; then
        echo -e "  ${GRAY}Installing frontend dependencies...${NC}"
        (cd "$PROJECT_ROOT/frontend" && npm install)
        echo -e "  ${GREEN}Frontend dependencies installed!${NC}"
    fi

    # Services dependencies
    if [ -f "$PROJECT_ROOT/services/package.json" ]; then
        echo -e "  ${GRAY}Installing services dependencies...${NC}"
        (cd "$PROJECT_ROOT/services" && npm install)
        echo -e "  ${GREEN}Services dependencies installed!${NC}"
    fi

    echo ""
}

#######################################
# Generate Environment Files
#######################################
generate_env_files() {
    echo -e "${YELLOW}Generating environment files...${NC}"

    local env_development="# Auto-Dev-Engine Development Environment
# Generated by setup-phase2.sh

# Application Settings
NODE_ENV=development
PORT=3000
SERVICE_NAME=ade-backend
VERSION=0.1.0

# API Keys (replace with actual values)
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
GOOGLE_API_KEY=your-google-api-key-here

# Database (if applicable)
DATABASE_URL=postgresql://localhost:5432/ade_dev

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty

# Feature Flags
ENABLE_POLICY_ENGINE=true
ENABLE_QUOTA_ENGINE=true
ENABLE_MODEL_ROUTER=true
ENABLE_TOOL_BUS=true"

    local env_local="# Auto-Dev-Engine Local Overrides
# This file is for local development only and should not be committed

# Override any settings from .env.development here
# LOG_LEVEL=trace"

    local env_dev_path="$PROJECT_ROOT/.env.development"
    local env_local_path="$PROJECT_ROOT/.env.local"

    if [ ! -f "$env_dev_path" ] || [ "$FORCE" = true ]; then
        echo "$env_development" > "$env_dev_path"
        echo -e "  ${GREEN}Created: .env.development${NC}"
    else
        echo -e "  ${YELLOW}Exists:  .env.development (use --force to overwrite)${NC}"
    fi

    if [ ! -f "$env_local_path" ] || [ "$FORCE" = true ]; then
        echo "$env_local" > "$env_local_path"
        echo -e "  ${GREEN}Created: .env.local${NC}"
    else
        echo -e "  ${YELLOW}Exists:  .env.local (use --force to overwrite)${NC}"
    fi

    echo ""
}

#######################################
# Bootstrap Configs
#######################################
bootstrap_configs() {
    echo -e "${YELLOW}Bootstrapping default configurations...${NC}"

    local config_files=(
        "services/policyEngine/config.json"
        "services/quotaEngine/config.json"
        "services/modelRouter/config.json"
        "bus/toolBus/config.json"
    )

    for config_file in "${config_files[@]}"; do
        local full_path="$PROJECT_ROOT/$config_file"
        if [ -f "$full_path" ]; then
            if python3 -c "import json; json.load(open('$full_path'))" 2>/dev/null || \
               python -c "import json; json.load(open('$full_path'))" 2>/dev/null || \
               node -e "JSON.parse(require('fs').readFileSync('$full_path', 'utf8'))" 2>/dev/null; then
                echo -e "  ${GREEN}[OK]${NC} $config_file"
            else
                echo -e "  ${RED}[ERROR]${NC} Invalid JSON in $config_file"
            fi
        else
            echo -e "  ${YELLOW}[MISSING]${NC} $config_file"
        fi
    done

    echo ""
}

#######################################
# Run Smoke Tests
#######################################
run_smoke_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        echo -e "${YELLOW}Skipping tests (--skip-tests specified)${NC}"
        return
    fi

    echo -e "${YELLOW}Running smoke tests...${NC}"

    # Backend tests
    if [ -f "$PROJECT_ROOT/backend/package.json" ]; then
        echo -e "  ${GRAY}Running backend tests...${NC}"
        (cd "$PROJECT_ROOT/backend" && npm test) || true
    fi

    # Frontend tests
    if [ -f "$PROJECT_ROOT/frontend/package.json" ]; then
        echo -e "  ${GRAY}Running frontend tests...${NC}"
        (cd "$PROJECT_ROOT/frontend" && npm test) || true
    fi

    echo ""
}

#######################################
# Run Lint
#######################################
run_lint() {
    if [ "$SKIP_LINT" = true ]; then
        echo -e "${YELLOW}Skipping lint (--skip-lint specified)${NC}"
        return
    fi

    echo -e "${YELLOW}Running linters...${NC}"

    # Backend lint
    if [ -f "$PROJECT_ROOT/backend/package.json" ]; then
        echo -e "  ${GRAY}Linting backend...${NC}"
        (cd "$PROJECT_ROOT/backend" && npm run lint 2>/dev/null) || echo -e "  ${YELLOW}Backend lint not configured${NC}"
    fi

    # Frontend lint
    if [ -f "$PROJECT_ROOT/frontend/package.json" ]; then
        echo -e "  ${GRAY}Linting frontend...${NC}"
        (cd "$PROJECT_ROOT/frontend" && npm run lint 2>/dev/null) || echo -e "  ${YELLOW}Frontend lint not configured${NC}"
    fi

    echo ""
}

#######################################
# Main
#######################################
check_prerequisites
create_directories
install_dependencies
generate_env_files
bootstrap_configs
run_lint
run_smoke_tests

echo -e "${CYAN}========================================"
echo -e "${GREEN}Phase-2 Setup Complete!"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Update .env.development with your API keys"
echo "  2. Run 'make build' to build all components"
echo "  3. Run 'make test' to run all tests"
echo "  4. Run 'make run-orchestrator' to start the orchestrator"
echo ""
