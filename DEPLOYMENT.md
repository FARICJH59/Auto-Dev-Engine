# Phase 3: Full-Stack Deployment Guide

This guide covers the deployment automation setup for the Auto-Dev-Engine platform using GitHub Actions, Google Cloud Run, and Vercel.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [1. Google Cloud Platform Setup](#1-google-cloud-platform-setup)
  - [2. Vercel Setup](#2-vercel-setup)
  - [3. GitHub Secrets Configuration](#3-github-secrets-configuration)
- [Deployment Workflows](#deployment-workflows)
- [Manual Deployment](#manual-deployment)
- [Monitoring and Observability](#monitoring-and-observability)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Phase 3 implements full-stack deployment automation with:

- **Backend Orchestrator** → Deployed to Google Cloud Run
- **Frontend Dashboard** → Deployed to Vercel
- **CI/CD Pipeline** → Automated via GitHub Actions
- **Agent Matrix** → Parallel execution of agents (Phase 1)

## 🏗️ Architecture

```
GitHub Repository
├── orchestrator/              # Backend (Node.js Express)
│   ├── src/
│   │   └── pipeline.js       # Main orchestrator
│   ├── Dockerfile            # Cloud Run container
│   └── package.json
│
├── frontend/                  # Frontend (Next.js React)
│   ├── pages/
│   │   └── index.js         # Main dashboard
│   ├── vercel.json          # Vercel configuration
│   └── package.json
│
└── .github/workflows/
    ├── run-agents.yml       # Phase 1: Agent matrix execution
    ├── deploy-cloud-run.yml # Phase 3: Backend deployment
    └── deploy-vercel.yml    # Phase 3: Frontend deployment
```

## ✅ Prerequisites

Before deploying, ensure you have:

1. **Google Cloud Platform Account**
   - Active GCP project
   - Billing enabled
   - Cloud Run API enabled
   - Container Registry API enabled

2. **Vercel Account**
   - Vercel account (free tier works)
   - Organization created (or personal account)

3. **GitHub Repository**
   - Admin access to the repository
   - Ability to configure secrets

## 🚀 Setup Instructions

### 1. Google Cloud Platform Setup

#### Step 1.1: Create GCP Project

```bash
# Create a new project (or use existing)
gcloud projects create auto-dev-engine --name="Auto-Dev-Engine"

# Set as default project
gcloud config set project auto-dev-engine
```

#### Step 1.2: Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

#### Step 1.3: Create Service Account

```bash
# Create service account
gcloud iam service-accounts create ade-deployer \
    --description="Auto-Dev-Engine Deployment Service Account" \
    --display-name="ADE Deployer"

# Grant necessary permissions
gcloud projects add-iam-policy-binding auto-dev-engine \
    --member="serviceAccount:ade-deployer@auto-dev-engine.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding auto-dev-engine \
    --member="serviceAccount:ade-deployer@auto-dev-engine.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding auto-dev-engine \
    --member="serviceAccount:ade-deployer@auto-dev-engine.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create ade-key.json \
    --iam-account=ade-deployer@auto-dev-engine.iam.gserviceaccount.com
```

#### Step 1.4: Create Gemini API Key (Optional)

If using Google's Gemini API:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Save the key securely

### 2. Vercel Setup

#### Step 2.1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2.2: Login and Link Project

```bash
# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Link or create project
vercel link
```

#### Step 2.3: Get Vercel Tokens

```bash
# Get your Vercel token from: https://vercel.com/account/tokens
# Create a new token with appropriate permissions

# Get Organization ID and Project ID
vercel project ls
```

From the project settings page (`https://vercel.com/<org>/<project>/settings`):
- Organization ID: Found in the org settings
- Project ID: Found in the project settings

### 3. GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

#### Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `GCP_PROJECT_ID` | Your GCP project ID | `auto-dev-engine` |
| `GCP_SA_KEY` | Service account key JSON | `{entire JSON content}` |
| `GCP_REGION` | Cloud Run deployment region | `us-central1` |
| `VERCEL_TOKEN` | Vercel deployment token | `vercel_token_...` |
| `VERCEL_ORG_ID` | Vercel organization ID | `team_...` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `prj_...` |
| `GEMINI_API_KEY` | Google Gemini API key (optional) | `AIza...` |
| `CLOUD_RUN_URL` | Cloud Run service URL (set after first deploy) | `https://ade-orchestrator-...run.app` |

#### Adding Secrets

```bash
# Using GitHub CLI (gh)
gh secret set GCP_PROJECT_ID --body "auto-dev-engine"
gh secret set GCP_SA_KEY < ade-key.json
gh secret set GCP_REGION --body "us-central1"
gh secret set VERCEL_TOKEN --body "your-vercel-token"
gh secret set VERCEL_ORG_ID --body "team_xxxxx"
gh secret set VERCEL_PROJECT_ID --body "prj_xxxxx"
gh secret set GEMINI_API_KEY --body "your-api-key"
```

Or add them manually through the GitHub web interface.

## 🔄 Deployment Workflows

### Automatic Deployment

Deployments are triggered automatically on push to `main` branch:

1. **Backend Deployment** (`deploy-cloud-run.yml`)
   - Triggers on changes to `orchestrator/**`
   - Builds Docker image
   - Pushes to Google Container Registry
   - Deploys to Cloud Run

2. **Frontend Deployment** (`deploy-vercel.yml`)
   - Triggers on changes to `frontend/**`
   - Builds Next.js application
   - Deploys to Vercel production

3. **Agent Execution** (`run-agents.yml`)
   - Triggers on push/PR
   - Runs agent matrix in parallel
   - Aggregates results

### Manual Deployment

Trigger deployments manually using workflow dispatch:

```bash
# Using GitHub CLI
gh workflow run deploy-cloud-run.yml
gh workflow run deploy-vercel.yml
gh workflow run run-agents.yml
```

Or through the GitHub Actions UI:
1. Go to **Actions** tab
2. Select the workflow
3. Click **Run workflow**

## 📊 Monitoring and Observability

### Cloud Run (Backend)

**Access Logs:**
```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=ade-orchestrator" --limit 50

# Follow logs in real-time
gcloud alpha run services logs tail ade-orchestrator --region=us-central1
```

**Metrics:**
- GCP Console → Cloud Run → ade-orchestrator → Metrics
- Monitor: Request count, latency, error rate, memory usage

### Vercel (Frontend)

**Access Analytics:**
1. Go to Vercel Dashboard
2. Select project: `ade-frontend`
3. View Analytics, Logs, and Deployments

**Deployment URL:**
- Production: `https://ade-frontend.vercel.app` (or your custom domain)

### GitHub Actions

**Monitor Workflows:**
1. Go to **Actions** tab in GitHub
2. View workflow runs, logs, and artifacts
3. Check deployment summaries

## 🛠️ Troubleshooting

### Common Issues

#### 1. Cloud Run Deployment Fails

**Problem:** Authentication errors or permission denied

**Solution:**
```bash
# Verify service account permissions
gcloud projects get-iam-policy auto-dev-engine \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:ade-deployer@*"

# Re-create service account key if needed
gcloud iam service-accounts keys create new-key.json \
    --iam-account=ade-deployer@auto-dev-engine.iam.gserviceaccount.com
```

#### 2. Vercel Deployment Fails

**Problem:** Token or project ID issues

**Solution:**
```bash
# Verify Vercel CLI is logged in
vercel whoami

# Re-link project
cd frontend
vercel link --yes

# Test manual deployment
vercel --prod
```

#### 3. Frontend Can't Connect to Backend

**Problem:** CORS or API URL misconfiguration

**Solution:**
1. Update `CLOUD_RUN_URL` secret with correct URL
2. Redeploy frontend: `gh workflow run deploy-vercel.yml`
3. Verify Cloud Run allows unauthenticated access
4. Check Cloud Run logs for CORS errors

#### 4. Build Failures

**Problem:** Missing dependencies or build errors

**Solution:**
```bash
# Test local build
cd orchestrator
npm install
npm start

cd ../frontend
npm install
npm run build
```

### Testing Deployments

**Backend Health Check:**
```bash
curl https://ade-orchestrator-xxxxx.run.app/health
curl https://ade-orchestrator-xxxxx.run.app/status
curl https://ade-orchestrator-xxxxx.run.app/agents
```

**Frontend Check:**
```bash
curl https://ade-frontend.vercel.app
```

**Local Testing:**
```bash
# Backend
cd orchestrator
npm install
npm start
# Access at http://localhost:8080

# Frontend
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
# Access at http://localhost:3000
```

## 📝 Environment Variables

### Backend (Cloud Run)

Set in `deploy-cloud-run.yml`:
- `NODE_ENV=production`
- `GCP_PROJECT_ID` (from secrets)
- `GCP_REGION` (from secrets)
- `GEMINI_API_KEY` (from secrets, stored in Secret Manager)

### Frontend (Vercel)

Set in Vercel dashboard or `vercel.json`:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_ENV=production`

## 🔐 Security Best Practices

1. **Never commit secrets** to the repository
2. **Use GitHub Secrets** for all sensitive data
3. **Rotate service account keys** regularly
4. **Enable Cloud Run authentication** for production (if needed)
5. **Use Secret Manager** for GCP secrets
6. **Monitor access logs** regularly
7. **Keep dependencies updated** with Dependabot

## 📚 Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Next.js Documentation](https://nextjs.org/docs)

## 🆘 Support

For issues or questions:
1. Check workflow logs in GitHub Actions
2. Review Cloud Run logs in GCP Console
3. Check Vercel deployment logs
4. Create an issue in the repository

---

**Phase 3 Deployment Complete! 🚀**
