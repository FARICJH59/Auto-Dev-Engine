#!/usr/bin/env bash
# deploy.sh — One-click deploy for AUTO-DEV-ENGINE agents + LSAS + Pulse + Parso + Gemini
# Dispatches GitHub workflow, waits for it to complete, prints Cloud Run URL, and shows logs on failure.
set -euo pipefail

# -------------------------------
# Config / environment (override via env or export)
# -------------------------------
GITHUB_REPO="${GITHUB_REPO:-FARICJH59/AUTO-DEV-ENGINE}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"
WORKFLOW_FILE="${WORKFLOW_FILE:-ci.yml}"
SERVICE_NAME="${SERVICE_NAME:-auto-dev-engine}"
NODE_ENV="${NODE_ENV:-production}"
LSAS_ENABLED="${LSAS_ENABLED:-true}"
PULSE_ENABLED="${PULSE_ENABLED:-true}"
PARSO_ENABLED="${PARSO_ENABLED:-true}"
GEMINI_ENABLED="${GEMINI_ENABLED:-true}"
ALLOW_UNAUTH="${ALLOW_UNAUTH:-false}"

MAX_WAIT_SECONDS="${MAX_WAIT_SECONDS:-1800}"
POLL_INTERVAL="${POLL_INTERVAL:-10}"

log() {
  printf '%s %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"
}
die() {
  log "ERROR: $*"
  exit "${2:-1}"
}
check_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}
trap 'log "Interrupted or error occurred. Exiting."; exit 1' INT TERM

# Prereqs
log "Checking prerequisites..."
check_cmd gh
check_cmd gcloud
check_cmd date
check_cmd sleep

log "Deploying AUTO-DEV-ENGINE to Cloud Run..."
log "Repo: $GITHUB_REPO, Branch: $GITHUB_BRANCH, Workflow: $WORKFLOW_FILE"
log "NODE_ENV: $NODE_ENV"
log "LSAS: $LSAS_ENABLED, Pulse: $PULSE_ENABLED, Parso: $PARSO_ENABLED, Gemini: $GEMINI_ENABLED"
log "Allow Unauthenticated (workflow input): $ALLOW_UNAUTH"

# Dispatch workflow
RUN_ID=""
log "Dispatching workflow '$WORKFLOW_FILE'..."
if RUN_ID=$(gh workflow run "$WORKFLOW_FILE" \
  -R "$GITHUB_REPO" \
  -f ref="$GITHUB_BRANCH" \
  -f NODE_ENV="$NODE_ENV" \
  -f LSAS_ENABLED="$LSAS_ENABLED" \
  -f PULSE_ENABLED="$PULSE_ENABLED" \
  -f PARSO_ENABLED="$PARSO_ENABLED" \
  -f GEMINI_ENABLED="$GEMINI_ENABLED" \
  -f ALLOW_UNAUTHENTICATED="$ALLOW_UNAUTH" \
  --json databaseId --jq '.databaseId' 2>/dev/null || true); then
    :
fi

if [[ -z "${RUN_ID:-}" || "${RUN_ID}" == "null" ]]; then
  log "Run ID not found from dispatch response, fetching most recent run..."
  sleep 1
  RUN_ID=$(gh run list -R "$GITHUB_REPO" --workflow="$WORKFLOW_FILE" --branch="$GITHUB_BRANCH" --limit 1 --json databaseId --jq '.[0].databaseId' 2>/dev/null || true)
fi

if [[ -z "${RUN_ID:-}" || "${RUN_ID}" == "null" ]]; then
  die "Failed to determine workflow run ID after dispatch. Aborting." 2
fi

log "Workflow dispatched with run ID: $RUN_ID"

# Wait for workflow
log "Waiting for workflow completion (timeout ${MAX_WAIT_SECONDS}s)..."
start_ts=$(date +%s)
while true; do
  status=$(gh run view "$RUN_ID" -R "$GITHUB_REPO" --json status --jq '.status' 2>/dev/null || true)
  now_ts=$(date +%s)
  elapsed=$((now_ts - start_ts))
  log "Status: ${status:-pending} (elapsed ${elapsed}s)"
  if [[ "$status" == "completed" ]]; then break; fi
  if (( elapsed >= MAX_WAIT_SECONDS )); then
    gh run view "$RUN_ID" -R "$GITHUB_REPO" --log --limit 200 || true
    gh run list -R "$GITHUB_REPO" --workflow="$WORKFLOW_FILE" --branch="$GITHUB_BRANCH" --limit 5 || true
    die "Workflow did not complete within ${MAX_WAIT_SECONDS}s." 3
  fi
  sleep "$POLL_INTERVAL"
done

conclusion=$(gh run view "$RUN_ID" -R "$GITHUB_REPO" --json conclusion --jq '.conclusion' 2>/dev/null || true)
log "Conclusion: ${conclusion:-unknown}"
if [[ "$conclusion" != "success" ]]; then
  gh run view "$RUN_ID" -R "$GITHUB_REPO" --log --limit 500 || true
  die "Workflow run concluded with: ${conclusion:-${conclusion}} (non-success)." 4
fi

# Cloud Run URL
log "Fetching Cloud Run service URL for '$SERVICE_NAME'..."
[[ -n "${GCP_PROJECT_ID:-}" && -n "${GCP_REGION:-}" && -n "${GCP_SA_KEY:-}" ]] || die "GCP_PROJECT_ID, GCP_REGION, and GCP_SA_KEY required." 5
echo "$GCP_SA_KEY" | gcloud auth activate-service-account --key-file=- >/dev/null 2>&1 || die "gcloud auth failed."
gcloud config set project "$GCP_PROJECT_ID" >/dev/null 2>&1 || die "Failed to set GCP project."
CLOUD_RUN_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$GCP_REGION" --format='value(status.url)' 2>/dev/null || true)
[[ -n "$CLOUD_RUN_URL" ]] || { gcloud run services list --region "$GCP_REGION"; die "Could not determine Cloud Run URL." 6; }
log "Deployment complete! Cloud Run URL: $CLOUD_RUN_URL"
printf 'CLOUD_RUN_URL=%s\n' "$CLOUD_RUN_URL" > /dev/stderr
exit 0
