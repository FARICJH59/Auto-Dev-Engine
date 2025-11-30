---
# Fill in the fields below to create a basic custom agent for your repository.
# The Copilot CLI can be used for local testing: https://gh.io/customagents/cli
# To make this agent available, merge this file into the default repository branch.
# For format details, see: https://gh.io/customagents/config

name:
description:
---

# My Agent

Describe what your agent does here...
---
name: RuggedSiloCustomAgent
description: |
  The RuggedSiloCustomAgent is the high-level orchestration agent for the Auto-Dev-Engine
  implementing the full Rugged-Silo workflow. It coordinates sub-agents for LLM planning,
  critique loops, DNS/SSL validation, Vercel deployment, and Cloud Run deployment.

  Core features:
    • Multi-stage plan → critique → revision loops
    • DNS + SSL readiness check
    • Vercel deployment pipeline
   
