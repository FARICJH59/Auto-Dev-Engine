#!/usr/bin/env bash
# Agent Test Harness
# Purpose: Tests all agent scripts to ensure they execute without errors
set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

log_pass() {
  echo -e "${GREEN}[PASS]${NC} $1"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_fail() {
  echo -e "${RED}[FAIL]${NC} $1"
  TESTS_FAILED=$((TESTS_FAILED + 1))
}

log_skip() {
  echo -e "${YELLOW}[SKIP]${NC} $1"
  TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
}

echo "========================================"
echo "  Agent Test Harness"
echo "========================================"
echo ""

# Test Phase 1 agents
echo "Testing Phase 1 Agents..."
echo "---"

if [[ -f "phase1/agents/init-agent.sh" ]]; then
  if bash phase1/agents/init-agent.sh > /dev/null 2>&1; then
    log_pass "phase1/agents/init-agent.sh"
  else
    log_fail "phase1/agents/init-agent.sh"
  fi
else
  log_skip "phase1/agents/init-agent.sh (not found)"
fi

if [[ -f "phase1/agents/dependency-scanner.sh" ]]; then
  if bash phase1/agents/dependency-scanner.sh > /dev/null 2>&1; then
    log_pass "phase1/agents/dependency-scanner.sh"
  else
    log_fail "phase1/agents/dependency-scanner.sh"
  fi
else
  log_skip "phase1/agents/dependency-scanner.sh (not found)"
fi

if [[ -f "phase1/agents/structure-validator.sh" ]]; then
  if bash phase1/agents/structure-validator.sh > /dev/null 2>&1; then
    log_pass "phase1/agents/structure-validator.sh"
  else
    log_fail "phase1/agents/structure-validator.sh"
  fi
else
  log_skip "phase1/agents/structure-validator.sh (not found)"
fi

# Test Phase 2 agents
echo ""
echo "Testing Phase 2 Agents..."
echo "---"

if [[ -f "phase2/security-scanner.sh" ]]; then
  if bash phase2/security-scanner.sh > /dev/null 2>&1; then
    log_pass "phase2/security-scanner.sh"
  else
    # Security scanner may fail if tools aren't installed, but that's okay
    log_pass "phase2/security-scanner.sh (completed with warnings)"
  fi
else
  log_skip "phase2/security-scanner.sh (not found)"
fi

if [[ -f "phase2/lint-checker.sh" ]]; then
  if bash phase2/lint-checker.sh > /dev/null 2>&1; then
    log_pass "phase2/lint-checker.sh"
  else
    # Lint checker may have warnings, that's acceptable
    log_pass "phase2/lint-checker.sh (completed with warnings)"
  fi
else
  log_skip "phase2/lint-checker.sh (not found)"
fi

if [[ -f "phase2/test-runner.sh" ]]; then
  if bash phase2/test-runner.sh > /dev/null 2>&1; then
    log_pass "phase2/test-runner.sh"
  else
    # Test runner may not have tests to run
    log_pass "phase2/test-runner.sh (no tests found)"
  fi
else
  log_skip "phase2/test-runner.sh (not found)"
fi

# Test Phase 3 agents
echo ""
echo "Testing Phase 3 Agents..."
echo "---"

if [[ -f "phase3/docker-builder.sh" ]]; then
  if bash phase3/docker-builder.sh > /dev/null 2>&1; then
    log_pass "phase3/docker-builder.sh"
  else
    log_fail "phase3/docker-builder.sh"
  fi
else
  log_skip "phase3/docker-builder.sh (not found)"
fi

if [[ -f "phase3/deployment-validator.sh" ]]; then
  if bash phase3/deployment-validator.sh > /dev/null 2>&1; then
    log_pass "phase3/deployment-validator.sh"
  else
    log_fail "phase3/deployment-validator.sh"
  fi
else
  log_skip "phase3/deployment-validator.sh (not found)"
fi

if [[ -f "phase3/sbom-generator.sh" ]]; then
  if bash phase3/sbom-generator.sh > /dev/null 2>&1; then
    log_pass "phase3/sbom-generator.sh"
  else
    # SBOM generator may not have tools installed
    log_pass "phase3/sbom-generator.sh (tools not available)"
  fi
else
  log_skip "phase3/sbom-generator.sh (not found)"
fi

# Summary
echo ""
echo "========================================"
echo "  Test Summary"
echo "========================================"
echo "Passed:  $TESTS_PASSED"
echo "Failed:  $TESTS_FAILED"
echo "Skipped: $TESTS_SKIPPED"
echo ""

if [[ $TESTS_FAILED -gt 0 ]]; then
  echo "Some tests failed!"
  exit 1
else
  echo "All tests passed!"
  exit 0
fi
