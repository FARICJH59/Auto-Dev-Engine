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
description: >
  A high-level custom agent designed to orchestrate complex workflows for the Rugged-Silo Auto-Dev-Engine.
  This agent integrates multiple sub-agents including LLM agents, loop agents, and sequential agents to handle
  story generation, critique, revision, grammar and tone checks, and conditional regeneration workflows.
---

# RuggedSiloCustomAgent

## Overview
RuggedSiloCustomAgent provides a comprehensive orchestration layer for multi-stage workflows. It is intended
for scenarios where complex conditional logic, dynamic agent selection, and advanced state management are required.

This agent:
- Orchestrates multiple LLM sub-agents (`story_generator`, `critic`, `reviser`, `grammar_check`, `tone_check`)
- Handles iterative loops and sequential processing
- Implements conditional execution based on runtime state
- Stores results in `ctx.session.state` for use by downstream agents
- Supports dynamic regeneration of outputs if certain conditions (e.g., negative tone) are met

## Usage
1. Instantiate the agent with the required LLM sub-agents.
2. Use the `Runner` to execute the workflow asynchronously.
3. Monitor the `ctx.session.state` to track workflow progress and outputs.
4. Integrate with other parts of the Auto-Dev-Engine, Vercel deployments, or GitHub Actions workflows.

## Notes
- Ensure all LLM sub-agents are properly instantiated with the correct `output_key` to maintain state consistency.
- This agent is designed to be used as part of the Rugged-Silo system and assumes session management via `InMemorySessionService` or equivalent.
- Conditional logic is implemented based on session state values such as `tone_check_result` or other workflow-specific keys.
