# Rugged-Silo ↔ Auto-Dev-Engine Compatibility Contract

Purpose
-------
This file documents the compatibility contract between the Rugged-Silo Cloud Run / Gemini containers
and the Auto-Dev-Engine GitHub + Vercel frontend deployment stack. It is **informational** and can
be used by automation to sanity-check integrations.

Key Principles
--------------
- SAFE MODE: Do not overwrite cloud-run/gemini container configs.
- This contract contains authoritative IDs, expected project names, and integration notes.

Projects / IDs (update with actual values)
-----------------------------------------
- GitHub repo: FARICJH59/Auto-Dev-Engine
- Vercel project primary: auto-dev-engine-2qxj
- Vercel alternate: auto-dev-engine-aoug
- Preferred Vercel production project: auto-dev-engine-2qxj
- Cloud Run services: (e.g., hospital-backend, auto-dev-engine-gpt5) — DO NOT MODIFY here

Notes for operators
-------------------
- Keep this document in sync with the Vercel dashboard and Cloud Run console.
- The automation scripts in /scripts must treat Cloud Run revisions as immutable and never delete or override revisions automatically.

Change procedure
----------------
1. Update the `compatibility/compatibility-manifest.json` with new IDs.
2. Run `./scripts/integrity-check.sh` locally.
3. Open a PR and request at least one reviewer with infra access.
