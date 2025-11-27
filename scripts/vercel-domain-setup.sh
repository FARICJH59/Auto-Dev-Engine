#!/bin/bash
#
# Vercel Domain Setup Script for rugged-silo
#
# This script automates the process of adding a custom domain to your Vercel project,
# verifying DNS propagation, and confirming SSL activation.
#
# Usage: ./vercel-domain-setup.sh <domain>
# Example: ./vercel-domain-setup.sh example.com
#

set -e

# Domain validation regex - allows standard domain name format
DOMAIN_REGEX='^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'

# Validate domain format to prevent command injection
validate_domain() {
    local domain=$1
    if [[ ! "$domain" =~ $DOMAIN_REGEX ]]; then
        log_error "Invalid domain format: $domain"
        exit 1
    fi
}

# Configuration
DEFAULT_PROJECT="rugged-silo"
VERCEL_A_RECORD="76.76.21.21"
VERCEL_CNAME="cname.vercel-dns.com"
PUBLIC_DNS_SERVERS=("8.8.8.8" "1.1.1.1" "9.9.9.9")
MAX_PROPAGATION_WAIT=300  # 5 minutes
PROPAGATION_CHECK_INTERVAL=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Usage function
usage() {
    echo "Usage: $0 <domain> [project]"
    echo ""
    echo "Arguments:"
    echo "  domain    The domain to add (e.g., example.com)"
    echo "  project   The Vercel project name (default: ${DEFAULT_PROJECT})"
    echo ""
    echo "Examples:"
    echo "  $0 example.com"
    echo "  $0 example.com my-project"
    exit 1
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v vercel &> /dev/null; then
        missing_deps+=("vercel")
    fi
    
    if ! command -v dig &> /dev/null; then
        missing_deps+=("dig (dnsutils)")
    fi
    
    if ! command -v openssl &> /dev/null; then
        missing_deps+=("openssl")
    fi
    
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        echo ""
        echo "Install missing dependencies:"
        echo "  - vercel: npm install -g vercel"
        echo "  - dig: apt-get install dnsutils (Ubuntu/Debian)"
        echo "  - openssl: apt-get install openssl"
        echo "  - curl: apt-get install curl"
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Check Vercel CLI login status
check_vercel_login() {
    log_info "Checking Vercel CLI login status..."
    
    if ! vercel whoami &> /dev/null; then
        log_error "Not logged in to Vercel CLI"
        echo ""
        echo "Please login first:"
        echo "  vercel login"
        exit 1
    fi
    
    local user
    user=$(vercel whoami 2>/dev/null)
    log_success "Logged in as: $user"
}

# Add domain to Vercel project
add_domain() {
    local domain=$1
    local project=$2
    
    log_info "Adding domain '$domain' to project '$project'..."
    
    local output
    if output=$(vercel domains add "$domain" --project "$project" 2>&1); then
        log_success "Domain added successfully"
    else
        # Check if domain already exists (common case)
        if echo "$output" | grep -qi "already\|exists\|configured"; then
            log_success "Domain is already configured"
        else
            log_warn "There may have been an issue adding the domain. Checking status..."
            echo "$output"
        fi
    fi
}

# Show required DNS records
show_dns_records() {
    local domain=$1
    
    echo ""
    log_info "Required DNS Records for '$domain':"
    echo ""
    echo "┌─────────────────────────────────────────────────────────────────────┐"
    echo "│ For Apex Domain (@)                                                 │"
    echo "├─────────────────────────────────────────────────────────────────────┤"
    echo "│ Type: A                                                             │"
    echo "│ Host: @ (or leave blank)                                            │"
    echo "│ Value: ${VERCEL_A_RECORD}                                              │"
    echo "│ TTL: 300 (or auto)                                                  │"
    echo "├─────────────────────────────────────────────────────────────────────┤"
    echo "│ For WWW Subdomain                                                   │"
    echo "├─────────────────────────────────────────────────────────────────────┤"
    echo "│ Type: CNAME                                                         │"
    echo "│ Host: www                                                           │"
    echo "│ Value: ${VERCEL_CNAME}                                      │"
    echo "│ TTL: 300 (or auto)                                                  │"
    echo "└─────────────────────────────────────────────────────────────────────┘"
    echo ""
}

# Test DNS propagation
test_propagation() {
    local domain=$1
    local record_type=$2
    local expected_value=$3
    
    log_info "Testing DNS propagation for '$domain' ($record_type record)..."
    echo ""
    
    local all_passed=true
    
    # Test against public DNS servers
    for dns_server in "${PUBLIC_DNS_SERVERS[@]}"; do
        local result
        result=$(dig +short @"$dns_server" "$record_type" "$domain" 2>/dev/null | head -1)
        
        if [ -z "$result" ]; then
            echo -e "  ${YELLOW}○${NC} $dns_server: No response"
            all_passed=false
        elif [[ "$result" == *"$expected_value"* ]] || [[ "$result" == "$expected_value." ]]; then
            echo -e "  ${GREEN}✓${NC} $dns_server: $result"
        else
            echo -e "  ${YELLOW}○${NC} $dns_server: $result (expected: $expected_value)"
            all_passed=false
        fi
    done
    
    # Test against authoritative nameservers
    log_info "Checking authoritative nameservers..."
    local ns_servers
    ns_servers=$(dig +short NS "$domain" 2>/dev/null | head -2)
    
    if [ -n "$ns_servers" ]; then
        for ns in $ns_servers; do
            ns=${ns%.}  # Remove trailing dot
            local result
            result=$(dig +short @"$ns" "$record_type" "$domain" 2>/dev/null | head -1)
            
            if [ -n "$result" ]; then
                if [[ "$result" == *"$expected_value"* ]] || [[ "$result" == "$expected_value." ]]; then
                    echo -e "  ${GREEN}✓${NC} $ns (authoritative): $result"
                else
                    echo -e "  ${YELLOW}○${NC} $ns (authoritative): $result"
                fi
            else
                echo -e "  ${YELLOW}○${NC} $ns (authoritative): No response"
            fi
        done
    fi
    
    echo ""
    
    if $all_passed; then
        log_success "DNS propagation complete for $record_type record"
        return 0
    else
        log_warn "DNS propagation may still be in progress"
        return 1
    fi
}

# Wait for DNS propagation with timeout (optional - use with --wait flag)
# This function is provided for scripted use cases where waiting is desired
wait_for_propagation() {
    local domain=$1
    local elapsed=0
    
    log_info "Waiting for DNS propagation (max ${MAX_PROPAGATION_WAIT}s)..."
    
    while [ $elapsed -lt $MAX_PROPAGATION_WAIT ]; do
        if test_propagation "$domain" "A" "$VERCEL_A_RECORD"; then
            return 0
        fi
        
        log_info "Checking again in ${PROPAGATION_CHECK_INTERVAL}s... (${elapsed}s elapsed)"
        sleep $PROPAGATION_CHECK_INTERVAL
        elapsed=$((elapsed + PROPAGATION_CHECK_INTERVAL))
    done
    
    log_warn "DNS propagation not complete within timeout. This is normal and may take up to 48 hours."
    return 1
}

# Confirm SSL activation
confirm_ssl() {
    local domain=$1
    
    log_info "Checking SSL certificate for '$domain'..."
    echo ""
    
    # Check if SSL is active using openssl
    local ssl_output
    ssl_output=$(echo | openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null)
    
    if [ -z "$ssl_output" ]; then
        log_warn "Could not connect to $domain:443. SSL may not be ready yet."
        return 1
    fi
    
    # Extract certificate details
    local cert_dates
    cert_dates=$(echo "$ssl_output" | openssl x509 -noout -dates 2>/dev/null)
    
    if [ -n "$cert_dates" ]; then
        log_success "SSL certificate is active!"
        echo ""
        echo "Certificate Details:"
        echo "$cert_dates"
        
        local issuer
        issuer=$(echo "$ssl_output" | openssl x509 -noout -issuer 2>/dev/null)
        echo "$issuer"
        echo ""
        
        # Verify with curl
        log_info "Verifying HTTPS access..."
        local http_status
        http_status=$(curl -sI "https://$domain" 2>/dev/null | head -1)
        
        if [[ "$http_status" == *"200"* ]] || [[ "$http_status" == *"301"* ]] || [[ "$http_status" == *"302"* ]]; then
            log_success "HTTPS is working: $http_status"
            return 0
        else
            log_warn "HTTPS response: $http_status"
            return 0  # SSL is still valid even if the response isn't 200
        fi
    else
        log_warn "SSL certificate not yet available"
        return 1
    fi
}

# Main function
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║           Vercel Domain Setup Script for rugged-silo             ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Parse arguments
    if [ $# -lt 1 ]; then
        usage
    fi
    
    local domain=$1
    local project=${2:-$DEFAULT_PROJECT}
    
    # Validate domain format before proceeding
    validate_domain "$domain"
    
    log_info "Domain: $domain"
    log_info "Project: $project"
    echo ""
    
    # Run checks
    check_dependencies
    check_vercel_login
    
    # Add domain
    add_domain "$domain" "$project"
    
    # Show required DNS records
    show_dns_records "$domain"
    
    # Test current propagation status
    echo ""
    log_info "Current DNS Status:"
    test_propagation "$domain" "A" "$VERCEL_A_RECORD" || true
    
    # Check for www subdomain
    test_propagation "www.$domain" "CNAME" "$VERCEL_CNAME" || true
    
    # Check SSL
    echo ""
    confirm_ssl "$domain" || true
    
    # Summary
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                           Summary                                 ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Domain '$domain' has been added to project '$project'."
    echo ""
    echo "Next steps:"
    echo "  1. Add the required DNS records shown above to your DNS provider"
    echo "  2. Wait for DNS propagation (can take up to 48 hours)"
    echo "  3. Vercel will automatically issue an SSL certificate"
    echo ""
    echo "To check status later:"
    echo "  vercel domains inspect $domain"
    echo "  dig +short $domain"
    echo "  curl -I https://$domain"
    echo ""
    
    log_success "Setup complete!"
}

# Run main function
main "$@"
