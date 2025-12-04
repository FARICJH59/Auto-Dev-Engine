#!/bin/bash
#
# ADE Fusion Stack Security Check Script
# Portable security checks using Node for version validation
#
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "ADE Fusion Stack Security Check"
echo "========================================"

# Check Node.js version using Node itself for semver comparison
REQUIRED_NODE_MAJOR=20
CURRENT_NODE_VERSION=$(node -v | sed 's/v//')
CURRENT_NODE_MAJOR=$(echo "$CURRENT_NODE_VERSION" | cut -d. -f1)

echo -e "\n${YELLOW}Checking Node.js version...${NC}"
if [ "$CURRENT_NODE_MAJOR" -ge "$REQUIRED_NODE_MAJOR" ]; then
    echo -e "${GREEN}✓ Node.js version ${CURRENT_NODE_VERSION} meets requirement (>=${REQUIRED_NODE_MAJOR}.0.0)${NC}"
else
    echo -e "${RED}✗ Node.js version ${CURRENT_NODE_VERSION} does not meet requirement (>=${REQUIRED_NODE_MAJOR}.0.0)${NC}"
    exit 1
fi

# Check pnpm version if available
echo -e "\n${YELLOW}Checking pnpm version...${NC}"
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    REQUIRED_PNPM_MAJOR=9
    PNPM_MAJOR=$(echo "$PNPM_VERSION" | cut -d. -f1)
    if [ "$PNPM_MAJOR" -ge "$REQUIRED_PNPM_MAJOR" ]; then
        echo -e "${GREEN}✓ pnpm version ${PNPM_VERSION} meets requirement (>=${REQUIRED_PNPM_MAJOR}.0.0)${NC}"
    else
        echo -e "${YELLOW}! pnpm version ${PNPM_VERSION} may not meet all requirements (>=${REQUIRED_PNPM_MAJOR}.0.0)${NC}"
    fi
else
    echo -e "${YELLOW}! pnpm not found - using npm fallback${NC}"
fi

# Run npm audit for dependencies
echo -e "\n${YELLOW}Running security audit...${NC}"

# Determine package manager
if command -v pnpm &> /dev/null && [ -f "pnpm-lock.yaml" ]; then
    PKG_MANAGER="pnpm"
else
    PKG_MANAGER="npm"
fi

echo "Using package manager: ${PKG_MANAGER}"

# Run audit (allow failure for reporting purposes, but capture exit code)
set +e
if [ "$PKG_MANAGER" = "pnpm" ]; then
    pnpm audit --audit-level=high
    AUDIT_EXIT=$?
else
    npm audit --audit-level=high
    AUDIT_EXIT=$?
fi
set -e

if [ $AUDIT_EXIT -eq 0 ]; then
    echo -e "${GREEN}✓ No high or critical vulnerabilities found${NC}"
else
    echo -e "${YELLOW}! Security audit found issues (exit code: ${AUDIT_EXIT})${NC}"
    # Don't fail the build for audit issues in development
    if [ "${CI:-false}" = "true" ] && [ "${AUDIT_STRICT:-false}" = "true" ]; then
        echo -e "${RED}✗ Failing build due to security audit issues${NC}"
        exit $AUDIT_EXIT
    fi
fi

# Check for .env files that shouldn't be committed
echo -e "\n${YELLOW}Checking for sensitive files...${NC}"
SENSITIVE_FILES=(".env" ".env.local" ".env.production" "*.pem" "*.key" "credentials.json" "service-account.json")
FOUND_SENSITIVE=0

for pattern in "${SENSITIVE_FILES[@]}"; do
    if find . -name "$pattern" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | grep -q .; then
        echo -e "${YELLOW}! Found potentially sensitive files matching: ${pattern}${NC}"
        FOUND_SENSITIVE=1
    fi
done

if [ $FOUND_SENSITIVE -eq 0 ]; then
    echo -e "${GREEN}✓ No sensitive files detected in repository${NC}"
fi

# Summary
echo -e "\n========================================"
echo -e "${GREEN}Security check completed${NC}"
echo "========================================"

exit 0
