# Deployment Summary Generator

This repository includes a script to generate comprehensive deployment summaries for Vercel deployments.

## Prerequisites

Before running the deployment summary script, ensure you have the following installed:

- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)
- [jq](https://stedolan.github.io/jq/) - Command-line JSON processor
- [tree](http://mama.indstate.edu/users/ice/tree/) - Directory listing command
- Git

## Setup

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Install jq (if not already installed):
   ```bash
   # On Ubuntu/Debian
   sudo apt-get install jq
   
   # On macOS
   brew install jq
   ```

4. Install tree (if not already installed):
   ```bash
   # On Ubuntu/Debian
   sudo apt-get install tree
   
   # On macOS
   brew install tree
   ```

## Usage

### Basic Usage

Run the script with default settings (uses project: auto-dev-engine-2qxj):

```bash
./generate-deployment-summary.sh
```

### Custom Project

To generate a summary for a different Vercel project:

```bash
VERCEL_PROJECT=your-project-name ./generate-deployment-summary.sh
```

### Custom Deployment Limit

To fetch more than one deployment:

```bash
DEPLOYMENT_LIMIT=5 ./generate-deployment-summary.sh
```

## Output

The script generates the following files:

- `DEPLOYMENT_SUMMARY.md` - Main deployment report containing:
  - Deployment URL
  - Deployment ID
  - Environment (production, preview, etc.)
  - Repository tree structure
  - Environment variables
  - Deployment metadata

- `repo-tree.txt` - Repository directory structure (up to 3 levels deep)
- `deployment-meta.txt` - Raw deployment metadata from Vercel
- `.env` or `.env.vercel` - Environment variables from Vercel project (uses `.env.vercel` if `.env` already exists)

**Important Security Notes:**
- All generated files are excluded from Git via `.gitignore`
- The `.env`/`.env.vercel` file and `DEPLOYMENT_SUMMARY.md` may contain sensitive information (API keys, secrets, etc.)
- **Never commit these files to version control**
- Review the generated files before sharing them to ensure no sensitive data is exposed
- Consider using a secure method to share deployment summaries if they contain sensitive information
- The script will use `.env.vercel` instead of `.env` if an existing `.env` file is detected to prevent accidental overwrites

## Environment Variables

The script supports the following environment variables:

- `VERCEL_PROJECT` - The Vercel project name (default: auto-dev-engine-2qxj)
- `DEPLOYMENT_LIMIT` - Number of deployments to fetch (default: 1)

## Script Workflow

1. Fetches the latest production deployment from Vercel
2. Extracts deployment ID, URL, and environment target
3. Pulls environment variables from the Vercel project
4. Fetches latest Git information
5. Generates a repository tree structure
6. Retrieves deployment metadata
7. Compiles all information into a comprehensive markdown report

## Troubleshooting

### Authentication Issues

If you encounter authentication errors, make sure you're logged in to Vercel:

```bash
vercel whoami
```

If not logged in, run:

```bash
vercel login
```

### Missing Commands

If commands like `jq` or `tree` are not found, install them using your package manager as described in the Setup section.

### Project Not Found

Ensure the project name is correct and you have access to it:

```bash
vercel projects list
```

## Integration with CI/CD

This script can be integrated into GitHub Actions or other CI/CD pipelines. Make sure to:

1. Set the `VERCEL_TOKEN` secret in your CI environment
2. Install required dependencies (jq, tree) in your CI runner
3. Run the script as part of your deployment workflow

Example GitHub Actions step:

```yaml
- name: Generate Deployment Summary
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  run: |
    npm install -g vercel
    sudo apt-get update && sudo apt-get install -y jq tree
    ./generate-deployment-summary.sh
```
