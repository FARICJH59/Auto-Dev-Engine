# GitHub Integration

Auto-Dev-Engine GitHub integration leverages GitHub Actions to automate development workflows.

## Overview

The GitHub integration provides automated workflows for:
- Continuous Integration (CI)
- Continuous Deployment (CD)
- Pull Request automation
- Code quality checks
- Security scanning

## Setup

### Prerequisites

- A GitHub repository
- GitHub Actions enabled (enabled by default for most repositories)
- Appropriate repository permissions

### Installation

1. Copy the workflow files from this directory to your repository's `.github/workflows/` directory
2. Customize the workflows based on your project needs
3. Commit and push the changes to your repository

### Configuration Files

#### `auto-dev-ci.yml`
Main CI workflow that runs on every push and pull request.

#### `auto-dev-release.yml`
Handles automated releases and deployments.

## Workflow Examples

### Basic CI Workflow

The provided `auto-dev-ci.yml` includes:
- Code checkout
- Dependency installation
- Build process
- Test execution
- Code quality checks

### Release Workflow

The `auto-dev-release.yml` handles:
- Version tagging
- Release notes generation
- Artifact publishing
- Deployment automation

## Environment Variables

Configure the following secrets in your GitHub repository settings:

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- `DEPLOY_TOKEN` - (Optional) Token for deployment operations
- `NPM_TOKEN` - (Optional) For publishing npm packages

## Permissions

The workflows require the following permissions:
- `contents: read` - Read repository contents
- `pull-requests: write` - Comment on pull requests
- `issues: write` - Update issues
- `checks: write` - Create check runs

## Triggers

Workflows are triggered by:
- `push` - Code pushed to the repository
- `pull_request` - Pull request opened, synchronized, or reopened
- `release` - Release published
- `workflow_dispatch` - Manual trigger

## Advanced Configuration

### Matrix Builds

Test across multiple versions or platforms:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [14, 16, 18]
```

### Conditional Execution

Run jobs only when certain conditions are met:

```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

## Troubleshooting

### Common Issues

1. **Workflow not running**: Check that GitHub Actions is enabled in repository settings
2. **Permission errors**: Verify the workflow has necessary permissions
3. **Secret not found**: Ensure secrets are properly configured in repository settings

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
