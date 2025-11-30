# GitLab Integration

Auto-Dev-Engine GitLab integration uses GitLab CI/CD to automate development workflows.

## Overview

The GitLab integration provides:
- Automated CI/CD pipelines
- Merge request automation
- Container registry integration
- Security scanning
- Code quality reports

## Setup

### Prerequisites

- A GitLab repository (gitlab.com or self-hosted)
- GitLab CI/CD enabled (enabled by default)
- GitLab Runner configured (shared runners available on gitlab.com)

### Installation

1. Copy `.gitlab-ci.yml` from this directory to your repository root
2. Customize the pipeline stages and jobs based on your needs
3. Configure CI/CD variables in GitLab project settings
4. Commit and push the changes

### Configuration Files

#### `.gitlab-ci.yml`
Main CI/CD pipeline configuration with multiple stages.

## Pipeline Structure

### Stages

1. **build** - Compile and build the project
2. **test** - Run unit and integration tests
3. **quality** - Code quality and security checks
4. **deploy** - Deploy to various environments

### Jobs

Each stage contains specific jobs that can run in parallel:

- **build:app** - Build application
- **test:unit** - Unit tests
- **test:integration** - Integration tests
- **quality:lint** - Code linting
- **quality:security** - Security scanning
- **deploy:staging** - Deploy to staging
- **deploy:production** - Deploy to production

## CI/CD Variables

Configure the following variables in GitLab:

Settings → CI/CD → Variables

### Required Variables

- `CI_REGISTRY_USER` - Container registry username (auto-provided)
- `CI_REGISTRY_PASSWORD` - Container registry password (auto-provided)
- `CI_REGISTRY_IMAGE` - Container registry image path (auto-provided)

### Optional Variables

- `DEPLOY_TOKEN` - Token for deployment operations
- `NPM_TOKEN` - For publishing npm packages
- `DOCKER_HUB_USER` - Docker Hub username
- `DOCKER_HUB_TOKEN` - Docker Hub access token

## Pipeline Features

### Caching

GitLab CI/CD supports caching to speed up builds:

```yaml
cache:
  paths:
    - node_modules/
    - .npm/
```

### Artifacts

Save build outputs and test results:

```yaml
artifacts:
  paths:
    - dist/
  expire_in: 1 week
```

### Docker Integration

Build and push Docker images to GitLab Container Registry:

```yaml
services:
  - docker:dind

variables:
  DOCKER_DRIVER: overlay2
```

## Merge Request Integration

### Automatic Pipelines

Pipelines automatically run on:
- Merge requests
- Commits to branches
- Tags

### Merge Request Widgets

View pipeline status, test coverage, and code quality directly in merge requests.

## Advanced Features

### Parallel Execution

Run tests in parallel to reduce pipeline time:

```yaml
test:parallel:
  parallel: 3
```

### Manual Jobs

Require manual approval for deployments:

```yaml
deploy:production:
  when: manual
```

### Environment Management

Track deployments across environments:

```yaml
environment:
  name: production
  url: https://example.com
```

## Security Scanning

GitLab provides built-in security scanning:

- **SAST** - Static Application Security Testing
- **Dependency Scanning** - Check for vulnerable dependencies
- **Container Scanning** - Scan Docker images
- **License Compliance** - Check license compatibility

## Troubleshooting

### Common Issues

1. **Runner not available**: Ensure GitLab Runner is configured and enabled
2. **Pipeline timeout**: Increase timeout in job configuration
3. **Cache issues**: Clear cache using CI/CD settings
4. **Permission errors**: Check repository access tokens and variables

### Debug Mode

Enable debug output:

```yaml
variables:
  CI_DEBUG_TRACE: "true"
```

## Best Practices

1. Use pipeline includes for reusability
2. Implement proper caching strategies
3. Use artifacts wisely to reduce storage
4. Set appropriate timeout values
5. Use protected variables for sensitive data

## Additional Resources

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [GitLab CI/CD YAML Reference](https://docs.gitlab.com/ee/ci/yaml/)
- [GitLab CI/CD Examples](https://docs.gitlab.com/ee/ci/examples/)
