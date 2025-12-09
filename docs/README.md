# DevOps Automation Scaffold Documentation

## Overview

This DevOps automation scaffold provides a complete, production-ready CI/CD pipeline with comprehensive validation, security scanning, and deployment automation capabilities.

## Architecture

The system is organized into three phases:

### Phase 1: Initialization and Validation
Located in `phase1/agents/`

- **init-agent.sh**: Validates repository structure and creates required directories
- **dependency-scanner.sh**: Scans and validates Python, Node.js, and Go dependencies
- **structure-validator.sh**: Validates project files (README, LICENSE, .gitignore, etc.)

### Phase 2: Security and Testing
Located in `phase2/`

- **security-scanner.sh**: Performs security scanning including secret detection (Gitleaks) and dependency audits
- **lint-checker.sh**: Runs code quality tools (shellcheck, yamllint, kubeconform)
- **test-runner.sh**: Executes test suites for multiple platforms

### Phase 3: Build and Deployment
Located in `phase3/`

- **docker-builder.sh**: Builds Docker images and runs smoke tests
- **deployment-validator.sh**: Validates deployment configurations (Kubernetes, Cloud Run, Helm)
- **sbom-generator.sh**: Generates Software Bill of Materials using Syft

## Core Scripts

### Full Platform Verification
`scripts/full-platform-verify.sh`

Comprehensive validation script that orchestrates all phases and provides detailed reporting.

**Usage:**
```bash
./scripts/full-platform-verify.sh [OPTIONS]

Options:
  --smoke         Build Docker images and run smoke tests
  --deploy        Perform Cloud Run dry-run deployment validation
  --verbose       Enable verbose output
  -h, --help      Show help message
```

**Features:**
- Git repository and branch validation
- File structure checking
- Scaffold collision detection
- Shell script validation (shellcheck)
- YAML linting (yamllint)
- Kubernetes manifest validation (kubeconform)
- Python, Node.js, and Go dependency verification
- Optional Docker image building and smoke testing
- Optional Cloud Run deployment dry-run
- Agent test harness execution
- Static analysis recommendations

### Safe Scaffold Apply
`scripts/safe_apply_scaffold.sh`

Safely applies scaffold templates with automatic collision detection and backup creation.

**Usage:**
```bash
./scripts/safe_apply_scaffold.sh [OPTIONS]

Options:
  --dry-run       Preview changes without applying
  --force         Force apply with backups of existing files
  --dir DIR       Scaffold source directory
  -h, --help      Show help message
```

**Safety Features:**
- Collision detection: automatically detects existing files
- Backup creation: creates `*.scaffold` backup files instead of overwriting
- Git validation: ensures you're in a git repository
- Statistics reporting: tracks files created, backed up, and collisions detected

### Agent Test Harness
`scripts/test-agents.sh`

Tests all agent scripts to ensure they execute without errors.

## GitHub Actions Workflows

### Full Platform CI Validation
`.github/workflows/full-platform-ci-validation.yml`

Comprehensive CI/CD workflow that validates the entire platform.

**Triggered by:**
- Push to main, develop, or copilot/** branches
- Pull requests to main or develop
- Manual workflow dispatch

**Jobs:**
1. **validate-structure**: Validates directory structure and checks for scaffold collisions
2. **lint-and-validate**: Runs shellcheck, yamllint, and kubeconform
3. **dependency-check**: Verifies Python, Node.js, and Go dependencies
4. **security-scan**: Runs Gitleaks and Trivy vulnerability scanning
5. **generate-sbom**: Generates Software Bill of Materials
6. **run-agents**: Executes all phase agents
7. **full-verification**: Runs the complete verification script
8. **summary**: Generates validation summary

### Auto Scaffold Apply
`.github/workflows/auto-scaffold-apply.yml`

Manually dispatched workflow for applying scaffold templates.

**Features:**
- Dry-run mode for previewing changes
- Force apply mode with automatic backups
- Safe apply mode (default)
- Automatic verification workflow triggering
- Collision reporting

## Agent Orchestration Diagram

See `docs/diagram.mmd` for a complete Mermaid diagram showing the agent orchestration flow.

The diagram visualizes:
- All three phases and their agents
- Decision points and branching logic
- Optional features (--smoke, --deploy flags)
- Error handling paths
- Complete verification flow

## Supported Languages and Tools

### Languages
- **Python**: Requirements validation with pip
- **Node.js**: Package integrity checking with npm
- **Go**: Module verification with go mod

### Security Tools
- **Gitleaks**: Secret scanning
- **Trivy**: Vulnerability scanning
- **npm audit**: Node.js dependency security

### Linting and Validation
- **shellcheck**: Shell script analysis
- **yamllint**: YAML file validation
- **kubeconform**: Kubernetes manifest validation

### Build and Deployment
- **Docker**: Container image building and testing
- **Google Cloud Run**: Deployment validation
- **Helm**: Chart linting and validation

### SBOM Generation
- **Syft**: Software Bill of Materials generation
- **CycloneDX**: Alternative SBOM format for Node.js

## Integration Guide

### For ML Projects
The scaffold supports ML-specific dependencies and workflows:
- Python requirements.txt validation
- Jupyter notebook integration (via file structure)
- Model artifact validation (extensible)

### For IoT Projects
Supports IoT development patterns:
- Cross-platform dependency management
- Embedded system configurations
- Device deployment validation

### For Traditional Web Applications
Full support for modern web stacks:
- Node.js/npm ecosystem
- Frontend and backend validation
- Containerization and deployment

### For Client-Specific Projects
Easily customizable for specific client needs:
- Add custom agents to any phase directory
- Extend verification script with custom checks
- Add client-specific workflows

## Best Practices

### File Collision Handling
When scaffold files would overwrite existing files:
1. Original files are preserved
2. New scaffold content is saved as `*.scaffold` files
3. Manual review and merge is required
4. Delete `.scaffold` files after merging

### Sequential Commits
The scaffold supports both:
- **Sequential commits**: Commit changes after each phase for better tracking
- **Single commit**: Commit all changes at once for simpler history

Use `scripts/safe_apply_scaffold.sh` with git commits after each major change.

### Security Considerations
- Never commit secrets to the repository
- Review Gitleaks findings immediately
- Update vulnerable dependencies promptly
- Regularly regenerate SBOMs
- Monitor security scan results in CI

### Extending the System
To add custom agents:
1. Create new shell script in appropriate phase directory
2. Follow naming convention: `descriptive-name.sh`
3. Make script executable: `chmod +x script.sh`
4. Add error handling: `set -euo pipefail`
5. Test with agent test harness

## Static Analysis Recommendations

The verification script suggests running these additional tools:

1. **SBOM Generation**: `syft dir:. -o json > sbom.json`
2. **Secret Scanning**: `gitleaks detect --verbose`
3. **Shell Analysis**: `shellcheck scripts/*.sh phase*/**/*.sh`
4. **K8s Validation**: `kubeconform -summary k8s/*.yaml`
5. **Container Scanning**: `trivy image <image-name>`

## Troubleshooting

### Shellcheck Errors
If shellcheck reports errors:
- Review the specific line mentioned in the error
- Fix quoting issues: use `"$variable"` instead of `$variable`
- Address undefined variables
- Fix command substitution syntax

### YAML Linting Issues
Most YAML linting warnings are non-critical:
- Trailing spaces: Remove extra whitespace
- Line length: Split long lines if possible
- Document start: Add `---` at file beginning (optional)

### Agent Test Failures
If agent tests fail:
1. Run the specific agent manually to see detailed output
2. Check that required tools are installed
3. Verify file permissions (scripts should be executable)
4. Review agent logs for specific errors

### Workflow Failures
For CI/CD workflow failures:
1. Check the workflow run logs in GitHub Actions
2. Verify all required secrets are configured
3. Ensure branch protection rules aren't blocking commits
4. Check for syntax errors in workflow YAML

## Maintenance

### Regular Tasks
- Update agent scripts as tools evolve
- Keep security scanning tools up to date
- Review and update dependency validators
- Regenerate SBOMs periodically
- Update documentation for new features

### Version Control
- Tag stable releases of the scaffold
- Document breaking changes
- Maintain changelog for scaffold updates
- Use semantic versioning for scaffold versions

## Support and Contribution

This scaffold is designed to be self-documenting and maintainable. For issues or enhancements:
1. Review this documentation first
2. Check agent scripts for inline comments
3. Review workflow files for configuration details
4. Extend the system following established patterns

## License

This scaffold inherits the license of the parent repository.
