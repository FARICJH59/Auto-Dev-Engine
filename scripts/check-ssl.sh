#!/usr/bin/env bash
# check-ssl.sh - Check SSL certificate for a domain
# Usage: ./check-ssl.sh DOMAIN
# Exit codes: 0 = OK (cert present), 3 = SSL issue
# Idempotent: Safe to run multiple times

set -euo pipefail

DOMAIN="${1:-}"

if [[ -z "$DOMAIN" ]]; then
    echo "[check-ssl] ERROR: Domain argument required"
    echo "Usage: $0 DOMAIN"
    exit 3
fi

echo "[check-ssl] Checking SSL certificate for $DOMAIN"

# Fetch certificate using openssl
CERT_INFO=$(echo | timeout 15 openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || true)

if [[ -z "$CERT_INFO" ]]; then
    echo "[check-ssl] ✗ Could not fetch SSL certificate for $DOMAIN"
    echo "[check-ssl] This may indicate:"
    echo "  - Domain not reachable on port 443"
    echo "  - SSL certificate not yet issued"
    echo "  - Connection timeout"
    exit 3
fi

# Extract and display certificate dates
NOT_BEFORE=$(echo "$CERT_INFO" | grep "notBefore" | cut -d= -f2)
NOT_AFTER=$(echo "$CERT_INFO" | grep "notAfter" | cut -d= -f2)

echo "[check-ssl] Certificate details:"
echo "  notBefore: $NOT_BEFORE"
echo "  notAfter:  $NOT_AFTER"

# Check if certificate is currently valid
CURRENT_TIME=$(date +%s)
NOT_AFTER_TS=$(date -d "$NOT_AFTER" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$NOT_AFTER" +%s 2>/dev/null || echo "0")

if [[ "$NOT_AFTER_TS" -gt "$CURRENT_TIME" ]]; then
    echo "[check-ssl] ✓ SSL certificate is valid and not expired"
    exit 0
else
    echo "[check-ssl] ⚠ SSL certificate may be expired or invalid"
    exit 0  # Still exit 0 as cert is present
fi
