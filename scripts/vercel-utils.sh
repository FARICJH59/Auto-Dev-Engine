#!/bin/bash
# Shared Vercel Utilities
# Common functions used across Vercel management scripts

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
vercel_log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

vercel_log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

vercel_log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

vercel_log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Extract JSON string values
# Uses jq if available, falls back to grep/cut with error handling
# NOTE: This function is designed for string values only (like projectId, orgId)
# Usage: extract_json_value <file> <key>
extract_json_value() {
    local file="$1"
    local key="$2"
    
    if [ ! -f "$file" ]; then
        return 1
    fi
    
    # Try jq first if available
    if command -v jq &> /dev/null; then
        jq -r ".$key // empty" "$file" 2>/dev/null
        return $?
    fi
    
    # Fallback to grep/cut - only handles string values in quotes
    local value
    value=$(grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" "$file" 2>/dev/null | head -1 | cut -d'"' -f4)
    echo "$value"
}

# Validate JSON file structure
# Uses jq if available, falls back to Python, then basic checks
# Usage: validate_json_file <file>
validate_json_file() {
    local file="$1"
    
    if [ ! -f "$file" ]; then
        return 1
    fi
    
    # Try jq first
    if command -v jq &> /dev/null; then
        jq empty "$file" 2>/dev/null
        return $?
    fi
    
    # Try Python json module
    if command -v python3 &> /dev/null; then
        python3 -m json.tool "$file" > /dev/null 2>&1
        return $?
    fi
    
    if command -v python &> /dev/null; then
        python -m json.tool "$file" > /dev/null 2>&1
        return $?
    fi
    
    # Basic structure check as last resort
    if grep -q "^{" "$file" && grep -q "}$" "$file"; then
        return 0
    fi
    
    return 1
}

# Update JSON string value in file
# Uses jq if available, falls back to sed with backup
# NOTE: This function is designed for string values only
# Usage: update_json_value <file> <key> <value>
update_json_value() {
    local file="$1"
    local key="$2"
    local value="$3"
    
    if [ ! -f "$file" ]; then
        return 1
    fi
    
    # Escape special characters in value for safety
    # Escape backslashes first, then quotes
    local escaped_value
    escaped_value=$(printf '%s' "$value" | sed 's/\\/\\\\/g; s/"/\\"/g')
    
    # Try jq first (handles escaping automatically)
    if command -v jq &> /dev/null; then
        local temp_file=$(mktemp)
        jq --arg val "$value" ".$key = \$val" "$file" > "$temp_file" 2>/dev/null && mv "$temp_file" "$file"
        return $?
    fi
    
    # Fallback to sed with backup
    local backup_file="${file}.bak"
    cp "$file" "$backup_file"
    
    # Use escaped value in sed replacement
    sed -i "s/\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"$key\": \"$escaped_value\"/" "$file"
    
    # Verify the update was successful
    if validate_json_file "$file"; then
        rm -f "$backup_file"
        return 0
    else
        # Restore from backup if update failed
        mv "$backup_file" "$file"
        return 1
    fi
}

# Get project root directory
get_project_root() {
    local script_dir="$1"
    if [ -z "$script_dir" ]; then
        script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    fi
    dirname "$script_dir"
}

# Check if running in CI environment
is_ci_environment() {
    [ -n "$CI" ] || [ -n "$GITHUB_ACTIONS" ] || [ -n "$VERCEL" ]
}
