# Auto-Dev-Engine Compatibility Contract

This document defines the compatibility contract between Auto-Dev-Engine (ADE), Rugged-Silo, and Vercel deployments.

## Overview

The Auto-Dev-Engine system is a multi-layer platform consisting of:

| Layer | Platform | Purpose |
|-------|----------|---------|
| Frontend | Vercel | User interface and web application |
| Backend | Google Cloud Run | AI agents, prompt panel, workflow automation |
| CI/CD | GitHub Actions | Automated testing, validation, deployment |

## Vercel Project IDs

| Type | Project ID |
|------|------------|
| Primary | `auto-dev-engine-2qxj` |
| Alternate | `auto-dev-engine-aoug` |

## Repository

- **Repo**: `FARICJH59/Auto-Dev-Engine`
- **Branch Policy**: All changes must go through pull request review

## Cloud Run Services

### Rugged-Silo

The Rugged-Silo layer provides:

- Agentic workflow automation
- Prompt-panel execution
- Secure revision-based rollouts
- Gemini 2.0/3 containerized execution

## SAFE MODE Rules

**SAFE MODE** is the core principle governing all infrastructure changes:

1. **No Automatic Overwriting**: Cloud Run service configs are never overwritten automatically
2. **Append or Version Only**: New files are added; existing files are versioned
3. **PR Review Required**: All changes must go through pull request review

## Compatibility Validation

### Automated Checks

The following automated checks run on every pull request:

1. **JSON Validation**: Ensures `compatibility-manifest.json` is valid
2. **Cloud Run Detection**: Identifies any Cloud Run config modifications
3. **Integrity Check**: Runs `scripts/integrity-check.sh` for safety validation

### Manual Verification

Before merging any PR that affects compatibility:

1. Verify Vercel project IDs match the manifest
2. Confirm Cloud Run service names are unchanged
3. Review any infrastructure-related changes

## Update Procedure

To update compatibility settings:

1. Fork or branch from `main`
2. Update `compatibility-manifest.json` with new values
3. Run `scripts/integrity-check.sh` locally
4. Create a pull request for review
5. Merge only after CI passes and PR is approved

## Files in This Directory

| File | Purpose |
|------|---------|
| `README.compat.md` | Human-readable compatibility contract (this file) |
| `compatibility-manifest.json` | Machine-readable manifest for automation |

## Related Files

| Path | Purpose |
|------|---------|
| `scripts/integrity-check.sh` | Safety and validation script |
| `.github/workflows/compatibility-check.yml` | CI workflow for compatibility validation |

## Contact

For questions or issues regarding compatibility:

1. Create an issue in the repository
2. Reference this compatibility contract
3. Tag relevant maintainers
