#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

NODE_ENV="${NODE_ENV:-production}"
LSAS_ENABLED="${LSAS_ENABLED:-true}"
PULSE_ENABLED="${PULSE_ENABLED:-true}"
PARSO_ENABLED="${PARSO_ENABLED:-true}"
GEMINI_ENABLED="${GEMINI_ENABLED:-true}"

mkdir -p logs

run_agent() {
  local name="$1"
  local script="$2"
  local enabled="$3"
  local logfile="logs/${name,,}.log"

  if [ "${enabled}" != "true" ]; then
    echo "${name}: skipped" | tee -a "${logfile}"
    return 0
  fi

  echo "${name}: starting" | tee -a "${logfile}"
  if node "${script}" >> "${logfile}" 2>&1; then
    echo "${name}: success" | tee -a "${logfile}"
  else
    echo "${name}: failed" | tee -a "${logfile}"
  fi
}

# Deterministic order
run_agent "LSAS" "agents/lsas/lsas-agent.js" "${LSAS_ENABLED}"
run_agent "Pulse" "agents/pulse/pulse-agent.js" "${PULSE_ENABLED}"
run_agent "Parso" "agents/parso/parso-agent.js" "${PARSO_ENABLED}"
run_agent "Gemini" "agents/gemini/gemini-agent.js" "${GEMINI_ENABLED}"

# Summary
printf "\nAgent execution summary:\n"
for agent in LSAS Pulse Parso Gemini; do
  log_file="logs/${agent,,}.log"
  if [[ -f "${log_file}" ]]; then
    if grep -qiE "error|failed" "${log_file}"; then
      status="❌ failed"
    else
      status="✅ success"
    fi
  else
    status="⚪ skipped"
  fi
  printf '%-8s | %s\n' "${agent}" "${status}"
done
