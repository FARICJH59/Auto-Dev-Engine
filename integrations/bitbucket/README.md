# Bitbucket Integration

Auto-Dev-Engine Bitbucket integration leverages Bitbucket Pipelines for CI/CD automation.

## Overview

The Bitbucket integration provides:
- Automated CI/CD with Bitbucket Pipelines
- Pull request automation
- Deployment pipelines
- Jira integration support
- Docker image building

## Setup

### Prerequisites

- A Bitbucket repository
- Bitbucket Pipelines enabled (enable in repository settings)
- Bitbucket account with appropriate permissions

### Installation

1. Copy `bitbucket-pipelines.yml` from this directory to your repository root
2. Enable Pipelines in your Bitbucket repository settings
3. Configure repository variables for secrets
4. Commit and push the changes

### Configuration Files

#### `bitbucket-pipelines.yml`
Main pipeline configuration with build, test, and deployment stages.

## Pipeline Structure

### Default Pipeline

Runs on every push to any branch:
- Install dependencies
- Build project
- Run tests
- Perform code quality checks

### Branch-Specific Pipelines

- **main**: Full CI/CD with production deployment
- **develop**: CI/CD with staging deployment
- **feature/\***: CI only

### Pull Request Pipeline

Runs on pull requests with additional checks:
- Code review automation
- Test coverage reports
- Security scanning

### Tag Pipeline

Triggers on version tags for releases:
- Create release artifacts
- Publish packages
- Deploy to production

## Repository Variables

Configure in Bitbucket: Repository Settings → Repository variables

### Required Variables

- `BITBUCKET_REPO_OWNER` - Repository owner (auto-provided)
- `BITBUCKET_REPO_SLUG` - Repository name (auto-provided)
- `BITBUCKET_COMMIT` - Commit hash (auto-provided)

### Optional Variables (Secured)

- `DEPLOY_TOKEN` - Deployment authentication token
- `NPM_TOKEN` - NPM publishing token
- `DOCKER_HUB_USER` - Docker Hub username
- `DOCKER_HUB_PASSWORD` - Docker Hub password
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

## Pipeline Features

### Caching

Speed up builds by caching dependencies:

```yaml
definitions:
  caches:
    npm: ~/.npm
```

### Services

Use Docker services in your pipeline:

```yaml
services:
  - docker
  - postgres
  - redis
```

### Parallel Steps

Run multiple steps in parallel:

```yaml
parallel:
  - step:
      name: Unit Tests
      script:
        - npm test
  - step:
      name: Integration Tests
      script:
        - npm run test:integration
```

### Artifacts

Share files between steps:

```yaml
artifacts:
  - dist/**
  - coverage/**
```

## Docker Integration

### Building Docker Images

Build and push Docker images:

```yaml
step:
  name: Build Docker Image
  services:
    - docker
  script:
    - docker build -t myapp:latest .
    - docker push myapp:latest
```

### Using Docker Images

Use specific Docker images for steps:

```yaml
step:
  image: node:18
  script:
    - npm install
    - npm test
```

## Deployments

### Deployment Environments

Configure deployment targets:

```yaml
step:
  name: Deploy to Production
  deployment: production
  script:
    - npm run deploy
```

### Conditional Deployments

Deploy only when conditions are met:

```yaml
step:
  name: Deploy
  trigger: manual
  script:
    - npm run deploy
```

## Jira Integration

### Automatic Issue Transitions

Bitbucket can automatically update Jira issues:

1. Link your Bitbucket repository to Jira
2. Use issue keys in commit messages (e.g., "PROJ-123")
3. Issues update automatically based on pipeline results

### Smart Commits

Use smart commits to:
- Transition issues
- Add comments
- Log work time

Example: `PROJ-123 #done Fixed the bug`

## Advanced Features

### Custom Pipes

Use Atlassian Pipes for common tasks:

```yaml
- pipe: atlassian/aws-s3-deploy:1.1.0
  variables:
    AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
    S3_BUCKET: 'my-bucket'
    LOCAL_PATH: 'dist'
```

### Matrix Builds

Test across multiple configurations:

```yaml
definitions:
  steps:
    - step: &test-step
        name: Test
        script:
          - npm test
        
pipelines:
  default:
    - parallel:
        - step:
            <<: *test-step
            name: Test Node 16
            image: node:16
        - step:
            <<: *test-step
            name: Test Node 18
            image: node:18
```

### Scheduled Pipelines

Run pipelines on a schedule:

```yaml
pipelines:
  custom:
    nightly-build:
      - step:
          name: Nightly Build
          script:
            - npm run build
```

Configure schedule in Bitbucket UI: Repository Settings → Schedules

## Troubleshooting

### Common Issues

1. **Pipeline not starting**: Check that Pipelines is enabled in repository settings
2. **Build minutes exceeded**: Upgrade your Bitbucket plan or optimize pipeline
3. **Docker service issues**: Ensure Docker is enabled and service is specified
4. **Variable not found**: Verify secured variables are configured correctly

### Debug Mode

Enable debug output:

```yaml
options:
  max-time: 10
  debug: true
```

### Pipeline Logs

Access detailed logs in Bitbucket:
- Navigate to Pipelines in your repository
- Click on the specific build
- View step-by-step execution logs

## Best Practices

1. **Use caching** to speed up builds
2. **Keep steps small** and focused
3. **Use parallel execution** when possible
4. **Implement proper error handling**
5. **Secure sensitive data** with repository variables
6. **Monitor build minutes** usage
7. **Use Atlassian Pipes** for common tasks

## Limitations

- Build time: 50 minutes per step (default)
- Concurrent builds: Depends on plan
- Build minutes: Monthly limit based on plan
- Memory: 4GB per step (can be increased to 8GB)

## Additional Resources

- [Bitbucket Pipelines Documentation](https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/)
- [Bitbucket Pipes](https://bitbucket.org/product/features/pipelines/integrations)
- [YAML Configuration Reference](https://support.atlassian.com/bitbucket-cloud/docs/configure-bitbucket-pipelinesyml/)
