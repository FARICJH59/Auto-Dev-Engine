# Git Platform Integrations

This directory contains integration configurations and documentation for Auto-Dev-Engine to work with various Git platforms.

## Supported Platforms

### GitHub
GitHub integration allows Auto-Dev-Engine to work seamlessly with GitHub repositories using GitHub Actions.

- **Location**: `github/`
- **Documentation**: [GitHub Integration Guide](github/README.md)
- **Features**:
  - Automated workflows with GitHub Actions
  - Pull request automation
  - Issue tracking integration
  - Code review automation

### GitLab
GitLab integration enables Auto-Dev-Engine to leverage GitLab CI/CD pipelines.

- **Location**: `gitlab/`
- **Documentation**: [GitLab Integration Guide](gitlab/README.md)
- **Features**:
  - CI/CD pipeline automation
  - Merge request automation
  - Issue board integration
  - Container registry support

### Bitbucket
Bitbucket integration provides support for Bitbucket Pipelines and repositories.

- **Location**: `bitbucket/`
- **Documentation**: [Bitbucket Integration Guide](bitbucket/README.md)
- **Features**:
  - Bitbucket Pipelines automation
  - Pull request workflows
  - Jira integration support
  - Repository webhooks

## Getting Started

Choose your Git platform and follow the corresponding integration guide:

1. Navigate to the platform-specific directory
2. Read the README.md file for detailed setup instructions
3. Copy the provided configuration files to your repository
4. Customize the configuration based on your needs

## Configuration

Each platform has its own configuration format:

- **GitHub**: `.github/workflows/` YAML files
- **GitLab**: `.gitlab-ci.yml` file
- **Bitbucket**: `bitbucket-pipelines.yml` file

## Support

For issues or questions about integrations, please refer to the platform-specific documentation or open an issue in this repository.
