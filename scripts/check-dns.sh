#!/usr/bin/env bash
# check-dns.sh - Check DNS configuration for Vercel domain
# Usage: ./check-dns.sh DOMAIN
# Exit codes: 0 = OK, 2 = DNS not properly configured
# Idempotent: Safe to run multiple times

set -euo pipefail

DOMAIN="${1:-}"

if [[ -z "$DOMAIN" ]]; then
    echo "[check-dns] ERROR: Domain argument required"
    echo "Usage: $0 DOMAIN"
    exit 2
fi

echo "[check-dns] Checking DNS configuration for $DOMAIN"

VERCEL_IP="76.76.21.21"
DNS_OK=0

# Query public resolvers for A records
echo "[check-dns] Querying public DNS resolvers (8.8.8.8, 1.1.1.1)..."

for resolver in 8.8.8.8 1.1.1.1; do
    echo "[check-dns] Checking resolver $resolver..."
    
    # Query A record
    A_RECORDS=$(dig +short @"$resolver" A "$DOMAIN" 2>/dev/null || true)
    echo "[check-dns]   A records from $resolver: ${A_RECORDS:-none}"
    
    if echo "$A_RECORDS" | grep -q "$VERCEL_IP"; then
        echo "[check-dns]   ✓ Found Vercel IP $VERCEL_IP in A records"
        DNS_OK=1
    fi
    
    # Query CNAME record
    CNAME_RECORDS=$(dig +short @"$resolver" CNAME "$DOMAIN" 2>/dev/null || true)
    echo "[check-dns]   CNAME records from $resolver: ${CNAME_RECORDS:-none}"
    
    if echo "$CNAME_RECORDS" | grep -qi "vercel"; then
        echo "[check-dns]   ✓ Found Vercel in CNAME records"
        DNS_OK=1
    fi
done

# Query authoritative nameservers
echo "[check-dns] Querying authoritative nameservers..."
NS_SERVERS=$(dig +short NS "$DOMAIN" 2>/dev/null | head -2 || true)

for ns in $NS_SERVERS; do
    echo "[check-dns] Checking authoritative NS $ns..."
    
    # Query A record from authoritative NS
    A_AUTH=$(dig +short @"$ns" A "$DOMAIN" 2>/dev/null || true)
    echo "[check-dns]   A records from $ns: ${A_AUTH:-none}"
    
    if echo "$A_AUTH" | grep -q "$VERCEL_IP"; then
        echo "[check-dns]   ✓ Found Vercel IP $VERCEL_IP in authoritative A records"
        DNS_OK=1
    fi
    
    # Query CNAME record from authoritative NS
    CNAME_AUTH=$(dig +short @"$ns" CNAME "$DOMAIN" 2>/dev/null || true)
    echo "[check-dns]   CNAME records from $ns: ${CNAME_AUTH:-none}"
    
    if echo "$CNAME_AUTH" | grep -qi "vercel"; then
        echo "[check-dns]   ✓ Found Vercel in authoritative CNAME records"
        DNS_OK=1
    fi
done

# Summary
echo ""
if [[ $DNS_OK -eq 1 ]]; then
    echo "[check-dns] ✓ DNS is properly configured for Vercel"
    exit 0
else
    echo "[check-dns] ✗ DNS is NOT properly configured for Vercel"
    echo "[check-dns] Expected: A record pointing to $VERCEL_IP OR CNAME pointing to *.vercel-dns.com"
    exit 2
fi
