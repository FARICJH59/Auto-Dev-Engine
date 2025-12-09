#!/usr/bin/env bash
# Safe Scaffold Apply Script
# Purpose: Safely applies scaffold templates with collision detection and backup
set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
  echo -e "${BLUE}[DEBUG]${NC} $1"
}

section() {
  echo ""
  echo "========================================"
  echo "  $1"
  echo "========================================"
}

# Parse arguments
DRY_RUN=false
FORCE=false
SCAFFOLD_DIR="."

usage() {
  cat << EOF
Usage: $0 [OPTIONS]

Safely applies scaffold templates with automatic collision detection and backup.
When a file exists, creates a *.scaffold backup instead of overwriting.

OPTIONS:
  --dry-run       Show what would be done without making changes
  --force         Overwrite existing files (creates backups)
  --dir DIR       Scaffold source directory (default: current directory)
  -h, --help      Show this help message

EXAMPLES:
  $0                          # Apply scaffolds from current directory
  $0 --dry-run               # Preview changes without applying
  $0 --force                 # Force apply (with backups)
  $0 --dir ./templates       # Apply from specific directory
EOF
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --dir)
      SCAFFOLD_DIR="$2"
      shift 2
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

section "Safe Scaffold Application"

# Validate we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  log_error "Not in a git repository"
  exit 1
fi

log_info "Working directory: $(pwd)"
log_info "Scaffold directory: $SCAFFOLD_DIR"

if [[ "$DRY_RUN" == "true" ]]; then
  log_warn "DRY RUN MODE - No changes will be made"
fi

# Track statistics
FILES_CREATED=0
FILES_BACKED_UP=0
COLLISIONS_DETECTED=0

# Function to safely apply a file
safe_apply_file() {
  local source_file="$1"
  local target_file="$2"
  
  # Check if target file already exists
  if [[ -f "$target_file" ]]; then
    COLLISIONS_DETECTED=$((COLLISIONS_DETECTED + 1))
    
    # Create backup with .scaffold extension
    local backup_file="${target_file}.scaffold"
    
    if [[ "$DRY_RUN" == "true" ]]; then
      log_warn "Would create backup: $backup_file (collision detected)"
      return
    fi
    
    if [[ "$FORCE" == "true" ]]; then
      log_warn "Collision detected: $target_file"
      log_info "Creating backup: $backup_file"
      cp "$target_file" "$backup_file"
      cp "$source_file" "$target_file"
      FILES_BACKED_UP=$((FILES_BACKED_UP + 1))
      log_info "✓ Applied with backup: $target_file"
    else
      log_warn "File exists: $target_file"
      log_info "Creating scaffold template: $backup_file"
      cp "$source_file" "$backup_file"
      FILES_BACKED_UP=$((FILES_BACKED_UP + 1))
      log_info "✓ Created scaffold backup (original preserved)"
    fi
  else
    # No collision, safe to create
    if [[ "$DRY_RUN" == "true" ]]; then
      log_info "Would create: $target_file"
      return
    fi
    
    # Ensure parent directory exists
    local parent_dir=$(dirname "$target_file")
    mkdir -p "$parent_dir"
    
    cp "$source_file" "$target_file"
    FILES_CREATED=$((FILES_CREATED + 1))
    log_info "✓ Created: $target_file"
  fi
}

# Function to make scripts executable
make_executable() {
  local file="$1"
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log_debug "Would make executable: $file"
    return
  fi
  
  if [[ -f "$file" ]] && [[ "$file" == *.sh ]]; then
    chmod +x "$file"
    log_debug "Made executable: $file"
  fi
}

# Create directory structure
section "Creating Directory Structure"

REQUIRED_DIRS=(
  "phase1/agents"
  "phase2"
  "phase3"
  "scripts"
  "docs"
  ".github/workflows"
)

for dir in "${REQUIRED_DIRS[@]}"; do
  if [[ ! -d "$dir" ]]; then
    if [[ "$DRY_RUN" == "true" ]]; then
      log_info "Would create directory: $dir"
    else
      mkdir -p "$dir"
      log_info "✓ Created directory: $dir"
    fi
  else
    log_debug "Directory exists: $dir"
  fi
done

# Apply scaffold files
section "Applying Scaffold Files"

# This script assumes scaffold files are already in place
# In a real scaffold system, you would copy from a template directory

# Example: Apply configuration files
if [[ -f "$SCAFFOLD_DIR/scaffold-templates/.gitignore.template" ]]; then
  safe_apply_file "$SCAFFOLD_DIR/scaffold-templates/.gitignore.template" ".gitignore"
fi

# Make all shell scripts executable
section "Setting Script Permissions"

for script in scripts/*.sh phase*/**/*.sh phase*/*.sh; do
  if [[ -f "$script" ]]; then
    make_executable "$script"
  fi
done

# Check for existing scaffold backups
section "Scaffold Collision Report"

EXISTING_SCAFFOLDS=$(find . -name "*.scaffold" 2>/dev/null || true)
if [[ -n "$EXISTING_SCAFFOLDS" ]]; then
  log_warn "Found existing scaffold backup files:"
  echo "$EXISTING_SCAFFOLDS" | while read -r file; do
    echo "  - $file"
  done
  echo ""
  log_info "These files are backups created to prevent overwriting."
  log_info "Review and manually merge changes if needed."
else
  log_info "No scaffold collision files found"
fi

# Summary
section "Application Summary"

echo ""
echo "Statistics:"
echo "  Files created: $FILES_CREATED"
echo "  Files backed up: $FILES_BACKED_UP"
echo "  Collisions detected: $COLLISIONS_DETECTED"
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
  log_warn "DRY RUN completed - no changes were made"
  log_info "Run without --dry-run to apply changes"
else
  log_info "Scaffold application complete!"
  
  if [[ $COLLISIONS_DETECTED -gt 0 ]]; then
    echo ""
    log_warn "⚠ Collision Safety Report"
    echo "  $COLLISIONS_DETECTED file collision(s) were safely handled"
    echo "  Original files were preserved"
    echo "  Review *.scaffold files for new scaffold content"
  fi
fi

exit 0
