# Auto-Dev-Engine

> Auto-Dev-Engine with RuggedSiloCustomAgent

## Overview

Auto-Dev-Engine is an automated development engine designed to streamline software development workflows using GitHub Actions.

## Getting Started

### Prerequisites

- [GitHub CLI](https://cli.github.com/) installed
- GitHub account with appropriate permissions

### Setup Instructions

1. Install the GitHub CLI if not already installed:
   - Visit https://cli.github.com/ for installation instructions

2. Authenticate with GitHub:
   ```bash
   gh auth login
   ```

3. Create a new repository (if starting fresh):
   ```bash
   # Replace 'my-auto-dev-engine' with your desired repository name
   gh repo create my-auto-dev-engine --public --description "Auto-Dev-Engine with RuggedSiloCustomAgent"
   ```

## Features

- Automated deployment workflows with GitHub Actions
- Integration with Vercel and Google Cloud Platform
- Continuous integration and deployment pipelines

## GitHub Actions

This repository includes GitHub Actions workflows located in `.github/workflows/`:

- `main.yml` - Master deployment workflow for deploying to Vercel and Google Cloud Platform (runs on push to main branch)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
