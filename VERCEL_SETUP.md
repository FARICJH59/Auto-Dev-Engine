# Vercel Deployment Setup

This document describes how to configure Vercel deployment for this project.

## Overview

The project uses Vercel for hosting and deployment. Configuration is managed through:
- `vercel.json` - Project configuration with projectId and orgId
- `.github/workflows/main.yml` - GitHub Actions workflow for automated deployments
- `scripts/` - Helper scripts for managing Vercel configuration

## Initial Setup

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Link Your Project

Run the setup script to link your local repository to a Vercel project:

```bash
./scripts/setup-vercel.sh --link
```

This will:
1. Prompt you to log in to Vercel (if not already logged in)
2. Let you select an existing project or create a new one
3. Create `.vercel/project.json` with your project configuration
4. Update `vercel.json` with the projectId and orgId

### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

| Secret Name | Description |
|------------|-------------|
| `VERCEL_TOKEN` | Your Vercel API token (get from https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel organization/team ID (from setup script output) |
| `VERCEL_PROJECT_ID` | Your Vercel project ID (from setup script output) |

To add secrets:
1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret

## Available Scripts

### `scripts/detect-vercel-project.sh`

Detects the current Vercel project configuration from local files.

```bash
./scripts/detect-vercel-project.sh
```

### `scripts/validate-vercel-config.sh`

Validates that your Vercel configuration is consistent and complete.

```bash
./scripts/validate-vercel-config.sh
```

### `scripts/setup-vercel.sh`

Helps set up and configure the Vercel project.

```bash
# Link to Vercel project and sync configuration
./scripts/setup-vercel.sh --link

# Sync configuration from .vercel/project.json to vercel.json
./scripts/setup-vercel.sh --sync

# Show GitHub secrets setup instructions
./scripts/setup-vercel.sh --secrets
```

## Configuration Files

### `vercel.json`

The main Vercel configuration file. Contains:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "projectId": "your-project-id",
  "orgId": "your-org-id",
  "framework": null,
  "buildCommand": null,
  "devCommand": null,
  "installCommand": null,
  "outputDirectory": null
}
```

### `.vercel/project.json`

Created by `vercel link`. Contains project and org IDs. This file is in `.gitignore` and is recreated by the deployment process.

## Deployment

### Automatic Deployment

Pushes to the `main` branch automatically trigger deployment via GitHub Actions.

### Manual Deployment

To deploy manually:

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## Troubleshooting

### "Project not found" errors

1. Run `./scripts/validate-vercel-config.sh` to check your configuration
2. Ensure `vercel.json` has valid `projectId` and `orgId`
3. Verify GitHub secrets are set correctly

### Configuration conflicts

If you have multiple Vercel projects or configuration conflicts:

1. Run `./scripts/detect-vercel-project.sh` to identify current configuration
2. Use `./scripts/setup-vercel.sh --link` to re-link to the correct project
3. Ensure `vercel.json` is updated with the correct IDs

### CI/CD failures

1. Check that `VERCEL_TOKEN` secret is valid and not expired
2. Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` match your vercel.json
3. Review the GitHub Actions logs for specific error messages
