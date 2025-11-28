#!/usr/bin/env bash
# deploy-cloudrun.sh - Cloud Run deployment placeholder
# This script intentionally does NOT modify Cloud Run or Gemini container configs
# It serves as a safe placeholder in the deployment pipeline
# Idempotent: Safe to run multiple times (no-op)

set -euo pipefail

echo "[deploy-cloudrun] Cloud Run Deployment Placeholder"
echo "=============================================="
echo ""
echo "[deploy-cloudrun] ⚠ Cloud Run deployment is intentionally NOT executed"
echo "[deploy-cloudrun] This script exists as a safe placeholder."
echo "[deploy-cloudrun] Cloud Run Gemini container configs remain untouched."
echo ""

# If GCP_PROJECT is set and gcloud is available, print suggestion
if [[ -n "${GCP_PROJECT:-}" ]]; then
    echo "[deploy-cloudrun] GCP_PROJECT is set: $GCP_PROJECT"
    
    if command -v gcloud &>/dev/null; then
        echo ""
        echo "[deploy-cloudrun] To manually deploy to Cloud Run, you could run:"
        echo ""
        echo "  gcloud run deploy SERVICE_NAME \\"
        echo "    --project=$GCP_PROJECT \\"
        echo "    --region=REGION \\"
        echo "    --image=IMAGE_URL \\"
        echo "    --platform=managed"
        echo ""
        echo "[deploy-cloudrun] Note: This is a suggestion only. This script does NOT execute deploys."
    else
        echo "[deploy-cloudrun] gcloud CLI not found in PATH"
    fi
else
    echo "[deploy-cloudrun] GCP_PROJECT not set in environment"
fi

echo ""
echo "=============================================="
echo "[deploy-cloudrun] ✓ Placeholder complete (no changes made)"
exit 0
