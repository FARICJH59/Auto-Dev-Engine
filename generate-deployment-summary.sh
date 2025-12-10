#!/bin/bash

# Generate Deployment Summary Script
# This script retrieves Vercel deployment information and generates a comprehensive report

set -e

# Configuration
PROJECT_NAME="${VERCEL_PROJECT:-auto-dev-engine-2qxj}"
LIMIT="${DEPLOYMENT_LIMIT:-1}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for required commands
REQUIRED_COMMANDS=("vercel" "jq" "tree" "git")
for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if ! command -v "$cmd" &> /dev/null; then
        echo -e "${RED}Error: Required command '$cmd' is not installed.${NC}"
        echo -e "Please install $cmd before running this script."
        exit 1
    fi
done

echo -e "${BLUE}Starting deployment summary generation...${NC}"

# Get the latest production deployment
echo -e "${GREEN}Fetching latest production deployment...${NC}"
DEPLOYMENT_INFO=$(vercel deployments list --project "$PROJECT_NAME" --limit "$LIMIT" --prod --json 2>&1)

if [ $? -ne 0 ] || [ -z "$DEPLOYMENT_INFO" ]; then
    echo -e "${RED}Error: Failed to fetch deployments. Make sure you're authenticated with Vercel.${NC}"
    exit 1
fi

# Parse deployment information
DEPLOYMENT_ID=$(echo "$DEPLOYMENT_INFO" | jq -r '.[0].uid')
DEPLOYMENT_URL=$(echo "$DEPLOYMENT_INFO" | jq -r '.[0].url')
DEPLOYMENT_ENV=$(echo "$DEPLOYMENT_INFO" | jq -r '.[0].target')

if [ -z "$DEPLOYMENT_ID" ] || [ "$DEPLOYMENT_ID" = "null" ]; then
    echo -e "${RED}Error: No production deployments found for project '$PROJECT_NAME'${NC}"
    exit 1
fi

echo "Deployment ID: $DEPLOYMENT_ID"
echo "URL: $DEPLOYMENT_URL"
echo "Environment: $DEPLOYMENT_ENV"

# Pull environment variables
echo -e "${GREEN}Pulling environment variables...${NC}"
echo -e "${YELLOW}Warning: Environment variables may contain sensitive information.${NC}"

ENV_FILE=".env.vercel"
if [ -f ".env" ]; then
    echo -e "${YELLOW}Note: Using .env.vercel to avoid overwriting existing .env file${NC}"
    vercel env pull "$ENV_FILE" --project "$PROJECT_NAME"
else
    ENV_FILE=".env"
    vercel env pull "$ENV_FILE" --project "$PROJECT_NAME"
fi

# Fetch latest git information
echo -e "${GREEN}Fetching git information...${NC}"
if ! git fetch origin 2>/dev/null; then
    echo -e "${YELLOW}Warning: Could not fetch from git remote. Continuing...${NC}"
fi

# Generate repository tree
echo -e "${GREEN}Generating repository tree...${NC}"
if ! tree -L 3 > repo-tree.txt 2>/dev/null; then
    echo -e "${YELLOW}Warning: Could not generate tree. Creating basic directory listing...${NC}"
    find . -maxdepth 3 -type d -not -path '*/\.*' | sort > repo-tree.txt
fi

# Inspect deployment metadata
echo -e "${GREEN}Inspecting deployment metadata...${NC}"
vercel inspect "$DEPLOYMENT_ID" --meta > deployment-meta.txt

# Generate deployment summary
echo -e "${GREEN}Generating deployment summary...${NC}"

# Read file contents and escape for heredoc
TREE_CONTENT=$(cat repo-tree.txt)
ENV_CONTENT=$(cat "$ENV_FILE")
META_CONTENT=$(cat deployment-meta.txt)

cat > DEPLOYMENT_SUMMARY.md << 'EOF_OUTER'
## Deployment Report

Deployment URL: EOF_URL
Deployment ID: EOF_ID
Environment: EOF_ENV

Repository Tree:
```
EOF_TREE
```

Environment Variables:
```
EOF_ENV_CONTENT
```

Deployment Metadata:
```
EOF_META
```
EOF_OUTER

# Replace placeholders
sed -i "s|EOF_URL|$DEPLOYMENT_URL|g" DEPLOYMENT_SUMMARY.md
sed -i "s|EOF_ID|$DEPLOYMENT_ID|g" DEPLOYMENT_SUMMARY.md
sed -i "s|EOF_ENV|$DEPLOYMENT_ENV|g" DEPLOYMENT_SUMMARY.md
sed -i "/EOF_TREE/r repo-tree.txt" DEPLOYMENT_SUMMARY.md
sed -i "/EOF_TREE/d" DEPLOYMENT_SUMMARY.md
sed -i "/EOF_ENV_CONTENT/r $ENV_FILE" DEPLOYMENT_SUMMARY.md
sed -i "/EOF_ENV_CONTENT/d" DEPLOYMENT_SUMMARY.md
sed -i "/EOF_META/r deployment-meta.txt" DEPLOYMENT_SUMMARY.md
sed -i "/EOF_META/d" DEPLOYMENT_SUMMARY.md

echo -e "${BLUE}Deployment summary generated: DEPLOYMENT_SUMMARY.md${NC}"

echo -e "${GREEN}Done!${NC}"
