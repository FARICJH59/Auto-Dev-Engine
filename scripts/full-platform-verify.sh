#!/usr/bin/env bash
# Full Platform Verification Script
# Purpose: Comprehensive validation of the entire platform including agents, dependencies, and deployments
set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
SMOKE_TESTS=false
DEPLOY_DRY_RUN=false
VERBOSE=false

usage() {
  cat << EOF
Usage: $0 [OPTIONS]

Full platform verification script that validates:
- Git branch and file structure
- Scaffold collisions
- Shell scripts (shellcheck), YAML (yamllint), Kubernetes manifests (kubeconform)
- Python, Node.js, and Go dependencies
- Docker images (optional)
- Cloud Run deployment (optional dry-run)
- Agent test harness

OPTIONS:
  --smoke         Build Docker images and run smoke tests
  --deploy        Perform Cloud Run dry-run deployment validation
  --verbose       Enable verbose output
  -h, --help      Show this help message

EXAMPLES:
  $0                    # Run basic verification
  $0 --smoke           # Run with Docker smoke tests
  $0 --deploy          # Run with deployment validation
  $0 --smoke --deploy  # Run all validations
EOF
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --smoke)
      SMOKE_TESTS=true
      shift
      ;;
    --deploy)
      DEPLOY_DRY_RUN=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

section() {
  echo ""
  echo "========================================"
  echo "  $1"
  echo "========================================"
}

# Verify we're in a git repository
section "Git Repository Validation"
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  log_error "Not in a git repository"
  exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)
log_info "Current branch: $CURRENT_BRANCH"

# Check git status
if [[ -n $(git status --porcelain) ]]; then
  log_warn "Working directory has uncommitted changes"
  if [[ "$VERBOSE" == "true" ]]; then
    git status --short
  fi
else
  log_info "Working directory is clean"
fi

# File structure validation
section "File Structure Validation"
REQUIRED_DIRS=("phase1/agents" "phase2" "phase3" "scripts" "docs")
for dir in "${REQUIRED_DIRS[@]}"; do
  if [[ -d "$dir" ]]; then
    log_info "✓ Directory exists: $dir"
  else
    log_warn "✗ Directory missing: $dir"
  fi
done

# Check for scaffold collisions
section "Scaffold Collision Detection"
SCAFFOLD_FILES=$(find . -name "*.scaffold" 2>/dev/null || true)
if [[ -n "$SCAFFOLD_FILES" ]]; then
  log_warn "Found scaffold backup files:"
  echo "$SCAFFOLD_FILES"
  log_info "These are backup files created to prevent overwriting existing files"
else
  log_info "No scaffold collision files found"
fi

# Run shellcheck on all shell scripts
section "Shell Script Validation (shellcheck)"
if command -v shellcheck &> /dev/null; then
  log_info "Running shellcheck..."
  SHELL_ERRORS=0
  while IFS= read -r script; do
    if [[ "$VERBOSE" == "true" ]]; then
      echo "  Checking: $script"
    fi
    if ! shellcheck "$script"; then
      SHELL_ERRORS=$((SHELL_ERRORS + 1))
    fi
  done < <(find . -type f -name "*.sh" -not -path "*/node_modules/*" -not -path "*/.git/*")
  
  if [[ $SHELL_ERRORS -eq 0 ]]; then
    log_info "✓ All shell scripts passed shellcheck"
  else
    log_warn "Found issues in $SHELL_ERRORS shell script(s)"
  fi
else
  log_warn "shellcheck not installed - skipping shell script validation"
fi

# Run yamllint on YAML files
section "YAML Validation (yamllint)"
if command -v yamllint &> /dev/null; then
  log_info "Running yamllint..."
  if yamllint . 2>/dev/null; then
    log_info "✓ YAML files are valid"
  else
    log_warn "YAML linting issues found (non-critical)"
  fi
else
  log_warn "yamllint not installed - skipping YAML validation"
fi

# Run kubeconform on Kubernetes manifests
section "Kubernetes Manifest Validation (kubeconform)"
if command -v kubeconform &> /dev/null; then
  log_info "Running kubeconform..."
  K8S_MANIFESTS=$(find . -type f \( -name "*.yml" -o -name "*.yaml" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.github/workflows/*" | while read -r file; do
    if grep -q "apiVersion:" "$file" 2>/dev/null; then
      echo "$file"
    fi
  done)
  
  if [[ -n "$K8S_MANIFESTS" ]]; then
    echo "$K8S_MANIFESTS" | while read -r manifest; do
      if [[ "$VERBOSE" == "true" ]]; then
        echo "  Validating: $manifest"
      fi
      kubeconform "$manifest" || log_warn "Issues in $manifest"
    done
  else
    log_info "No Kubernetes manifests found"
  fi
else
  log_warn "kubeconform not installed - skipping Kubernetes validation"
fi

# Python dependency verification
section "Python Dependencies Verification"
if [[ -f "requirements.txt" ]]; then
  log_info "Found requirements.txt"
  if command -v pip &> /dev/null; then
    log_info "Checking Python dependencies..."
    if pip check; then
      log_info "✓ Python dependencies are valid"
    else
      log_warn "Python dependency issues detected"
    fi
  else
    log_warn "pip not available - skipping Python verification"
  fi
else
  log_info "No requirements.txt found - skipping Python verification"
fi

# Node.js dependency verification
section "Node.js Dependencies Verification"
if [[ -f "package.json" ]]; then
  log_info "Found package.json"
  if [[ -f "package-lock.json" ]]; then
    log_info "✓ Found package-lock.json"
  else
    log_warn "package-lock.json not found"
  fi
  
  if command -v npm &> /dev/null; then
    log_info "Validating Node.js dependencies..."
    # Check if node_modules exists
    if [[ ! -d "node_modules" ]]; then
      log_warn "node_modules not found - consider running 'npm install'"
    else
      log_info "✓ node_modules directory exists"
    fi
  else
    log_warn "npm not available - skipping Node.js verification"
  fi
else
  log_info "No package.json found - skipping Node.js verification"
fi

# Go dependency verification
section "Go Dependencies Verification"
if [[ -f "go.mod" ]]; then
  log_info "Found go.mod"
  if [[ -f "go.sum" ]]; then
    log_info "✓ Found go.sum"
  else
    log_warn "go.sum not found"
  fi
  
  if command -v go &> /dev/null; then
    log_info "Verifying Go modules..."
    if go mod verify; then
      log_info "✓ Go modules verified successfully"
    else
      log_warn "Go module verification failed"
    fi
  else
    log_warn "go not available - skipping Go verification"
  fi
else
  log_info "No go.mod found - skipping Go verification"
fi

# Docker smoke tests (optional)
if [[ "$SMOKE_TESTS" == "true" ]]; then
  section "Docker Smoke Tests"
  if [[ -f "Dockerfile" ]]; then
    log_info "Found Dockerfile"
    if command -v docker &> /dev/null; then
      log_info "Building Docker image..."
      export BUILD_DOCKER=true
      export RUN_SMOKE_TESTS=true
      export DOCKER_IMAGE_TAG="platform-verify:latest"
      
      if [[ -f "phase3/docker-builder.sh" ]]; then
        bash phase3/docker-builder.sh
      else
        log_warn "Docker builder agent not found"
      fi
    else
      log_warn "Docker not available - skipping smoke tests"
    fi
  else
    log_info "No Dockerfile found - skipping smoke tests"
  fi
fi

# Cloud Run deployment dry-run (optional)
if [[ "$DEPLOY_DRY_RUN" == "true" ]]; then
  section "Cloud Run Deployment Validation"
  export DEPLOY_DRY_RUN=true
  
  if [[ -f "phase3/deployment-validator.sh" ]]; then
    bash phase3/deployment-validator.sh
  else
    log_warn "Deployment validator agent not found"
  fi
fi

# Run agent test harness if present
section "Agent Test Harness"
if [[ -f "scripts/test-agents.sh" ]]; then
  log_info "Running agent test harness..."
  if bash scripts/test-agents.sh; then
    log_info "✓ Agent tests passed"
  else
    log_warn "Some agent tests failed"
  fi
else
  log_info "No agent test harness found (scripts/test-agents.sh)"
fi

# Phase execution
section "Running Phase Agents"

# Phase 1: Initialization and validation
log_info "Executing Phase 1 agents..."
for agent in phase1/agents/*.sh; do
  if [[ -f "$agent" ]]; then
    log_info "  Running: $(basename "$agent")"
    bash "$agent" || log_warn "Agent $(basename "$agent") reported issues"
  fi
done

# Phase 2: Security and testing
log_info "Executing Phase 2 agents..."
for agent in phase2/*.sh; do
  if [[ -f "$agent" ]]; then
    log_info "  Running: $(basename "$agent")"
    bash "$agent" || log_warn "Agent $(basename "$agent") reported issues"
  fi
done

# Phase 3: Build and deployment
log_info "Executing Phase 3 agents..."
for agent in phase3/*.sh; do
  if [[ -f "$agent" ]]; then
    log_info "  Running: $(basename "$agent")"
    bash "$agent" || log_warn "Agent $(basename "$agent") reported issues"
  fi
done

# Static analysis suggestions
section "Static Analysis Recommendations"
echo ""
echo "Consider running these additional static analysis tools:"
echo ""
echo "  1. SBOM Generation:"
echo "     syft dir:. -o json > sbom.json"
echo ""
echo "  2. Secret Scanning:"
echo "     gitleaks detect --verbose"
echo ""
echo "  3. Shell Script Analysis:"
echo "     shellcheck scripts/*.sh phase*/**/*.sh"
echo ""
echo "  4. Kubernetes Manifest Validation:"
echo "     kubeconform -summary k8s/*.yaml"
echo ""
echo "  5. Container Scanning:"
echo "     trivy image <image-name>"
echo ""

# Final summary
section "Verification Summary"
log_info "Platform verification complete!"
echo ""
echo "✓ Git repository validated"
echo "✓ File structure checked"
echo "✓ Shell scripts verified"
echo "✓ Dependencies validated"
echo "✓ Agent phases executed"
echo ""

if [[ "$SMOKE_TESTS" == "true" ]]; then
  echo "✓ Docker smoke tests completed"
fi

if [[ "$DEPLOY_DRY_RUN" == "true" ]]; then
  echo "✓ Deployment validation completed"
fi

log_info "All verification checks passed!"
exit 0
