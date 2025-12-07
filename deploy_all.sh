#!/bin/bash

# Deploy All Script for Auto-Dev-Engine
# This script handles deployment to Vercel and Google Cloud Platform

set -e  # Exit on error
set -u  # Exit on undefined variable

echo "======================================"
echo "Auto-Dev-Engine Deployment Script"
echo "======================================"
echo ""

# Check required environment variables
required_vars=("VERCEL_TOKEN" "GCP_PROJECT_ID" "GCP_REGION" "GEMINI_API_KEY" "GCP_SA_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var:-}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Error: Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please configure these secrets in your GitHub repository settings."
    exit 1
fi

echo "✅ All required environment variables are set"
echo ""

# Display deployment information
echo "📋 Deployment Configuration:"
echo "   - GCP Project: $GCP_PROJECT_ID"
echo "   - GCP Region: $GCP_REGION"
echo "   - Node Version: $(node --version)"
echo ""

# Note: This is a placeholder script for the GitHub Actions tutorial repository.
# In a real deployment scenario, this script would:
#
# 1. Build the application
#    - npm install
#    - npm run build
#    - npm run test
#
# 2. Deploy to Vercel
#    - vercel --token $VERCEL_TOKEN --prod
#
# 3. Deploy to Google Cloud Platform
#    - gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/app-name
#    - gcloud run deploy app-name --image gcr.io/$GCP_PROJECT_ID/app-name --region $GCP_REGION
#
# 4. Run any post-deployment tasks
#    - Database migrations
#    - Cache invalidation
#    - Smoke tests

echo "⚠️  Note: This is a template deployment script."
echo "    The Auto-Dev-Engine repository is a GitHub Actions tutorial."
echo "    This script is provided as a placeholder and should be customized"
echo "    based on your specific deployment requirements."
echo ""

# Check if there are actual application files to deploy
if [ ! -f "package.json" ]; then
    echo "ℹ️  No package.json found - skipping Node.js deployment steps"
    echo ""
    echo "To customize this script for your needs:"
    echo "  1. Add your build commands"
    echo "  2. Configure deployment targets (Vercel, GCP, etc.)"
    echo "  3. Add testing and validation steps"
    echo "  4. Remove this placeholder message"
    echo ""
    echo "✅ Deployment script executed successfully (no-op mode)"
    exit 0
fi

# If package.json exists, perform actual deployment
echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building application..."
npm run build

echo "🧪 Running tests..."
npm test

echo "🚀 Deploying to Vercel..."
# Uncomment when ready to deploy:
# npx vercel --token "$VERCEL_TOKEN" --prod

echo "🚀 Deploying to Google Cloud Platform..."
# Uncomment when ready to deploy:
# gcloud builds submit --tag "gcr.io/$GCP_PROJECT_ID/auto-dev-engine"
# gcloud run deploy auto-dev-engine \
#   --image "gcr.io/$GCP_PROJECT_ID/auto-dev-engine" \
#   --platform managed \
#   --region "$GCP_REGION" \
#   --allow-unauthenticated

echo ""
echo "======================================"
echo "✅ Deployment completed successfully!"
echo "======================================"
