---
# Fill in the fields below to create a basic custom agent for your repository.
# The Copilot CLI can be used for local testing: https://gh.io/customagents/cli
# To make this agent available, merge this file into the default repository branch.
# For format details, see: https://gh.io/customagents/config

name:
description:
---

# My Agent

Describe what your agent does here...---
---
name: RuggedSiloCustomAgent
description: >
  A high-level orchestration agent for the Rugged-Silo platform. This agent
  automates the full DevOps pipeline including environment bootstrapping, 
  Vercel deployment, optional Cloud Run deployment, GitHub Actions workflow 
  generation, DNS and SSL preflight checks, and session state management. 
  It coordinates multiple sub-agents to ensure client projects deploy 
  autonomously with fail-safe checks and conditional workflow logic.

# Optional metadata
version: 1.0
author: FARICJH59
repository: https://github.com/your-username/auto-dev-engine
license: Apache-2.0

# Usage instructions (can be picked up by Copilot CLI)
usage: |
  1. Install the Copilot CLI: https://gh.io/customagents/cli
  2. Place the Rugged-Silo Python implementation in /agents/implementation/
  3. Run locally with: copilot agent run RuggedSiloCustomAgent
  4. Use the session state to provide inputs, e.g., project name, domain, and GitHub repo.
  5. Monitor logs to verify preflight, deployment, and workflow execution.

# Tags help with categorization inside Copilot
tags: [devops, automation, multi-cloud, Vercel, CloudRun, GitHubActions, Rugged-Silo]

---
# Notes
# This agent orchestrates multiple LLM and automation sub-agents, manages conditional 
# logic, and maintains persistent session state. Ensure the Python implementation 
# exists in the repository for execution.
