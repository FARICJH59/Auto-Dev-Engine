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
name: RuggedSiloCustomAgent
description: |
  The RuggedSiloCustomAgent is a high-level custom orchestrator agent for the Auto-Dev-Engine project.
  It coordinates multiple sub-agents for multi-cloud deployment automation, Vercel preflight checks,
  and Cloud Run integration. This agent ensures workflows are executed sequentially or conditionally
  based on runtime evaluation, maintaining state across steps in a secure and idempotent manner.

  Usage:
  1. Include this agent in your repository under .github/agents/
  2. Merge into the default branch (main) via a pull request
  3. Instantiate the Python RuggedSiloCustomAgent class to run workflows
  4. Supports extensible sub-agents for LLM tasks, DNS/SSL checks, deployment orchestration

  Key Features:
  - Conditional branching for deployment logic
  - State management across sub-agents
  - Full multi-cloud orchestration with fail-fast execution
  - Seamless integration with GitHub Actions, Vercel, and Cloud Run
---
# RuggedSiloCustomAgent

This agent implements the high-level orchestration logic for the Rugged-Silo workflow in Auto-Dev-Engine.
It leverages BaseAgent from ADK to run sub-agents (LLMs, checks, deployments) and manages session state.

It is intended to be extended as needed for project-specific orchestration, deployment automation, and advanced client workflows.
