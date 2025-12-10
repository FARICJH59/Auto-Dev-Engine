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
NC='\033[0m' # No Color

echo -e "${BLUE}Starting deployment summary generation...${NC}"

# Get the latest production deployment
echo -e "${GREEN}Fetching latest production deployment...${NC}"
vercel deployments list --project "$PROJECT_NAME" --limit "$LIMIT" --prod --json | jq -r '.[0] | .uid + " " + .url + " " + .target' | while read id url env; do
    echo "Deployment ID: $id"
    echo "URL: $url"
    echo "Environment: $env"
    
    # Pull environment variables
    echo -e "${GREEN}Pulling environment variables...${NC}"
    vercel env pull .env --project "$PROJECT_NAME"
    
    # Fetch latest git information
    echo -e "${GREEN}Fetching git information...${NC}"
    git fetch origin
    git checkout $(git rev-parse --abbrev-ref HEAD)
    
    # Generate repository tree
    echo -e "${GREEN}Generating repository tree...${NC}"
    tree -L 3 > repo-tree.txt
    
    # Inspect deployment metadata
    echo -e "${GREEN}Inspecting deployment metadata...${NC}"
    vercel inspect $id --meta > deployment-meta.txt
    
    # Generate deployment summary
    echo -e "${GREEN}Generating deployment summary...${NC}"
    cat > DEPLOYMENT_SUMMARY.md << EOF
## Deployment Report

Deployment URL: $url
Deployment ID: $id
Environment: $env

Repository Tree:
\`\`\`
$(cat repo-tree.txt)
\`\`\`

Environment Variables:
\`\`\`
$(cat .env)
\`\`\`

Deployment Metadata:
\`\`\`
$(cat deployment-meta.txt)
\`\`\`
EOF
    
    echo -e "${BLUE}Deployment summary generated: DEPLOYMENT_SUMMARY.md${NC}"
done

echo -e "${GREEN}Done!${NC}"
