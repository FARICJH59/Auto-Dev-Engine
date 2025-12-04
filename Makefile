# Auto-Dev-Engine Makefile
# Phase-2 Build and Development Tasks

.PHONY: all setup-phase2 install build test lint clean run-orchestrator \
        backend-install backend-build backend-test backend-lint \
        frontend-install frontend-build frontend-test frontend-lint \
        services-install help

# Default target
all: install build test

#######################################
# Setup
#######################################

## setup-phase2: Run the Phase-2 setup script
setup-phase2:
ifeq ($(OS),Windows_NT)
	powershell -ExecutionPolicy Bypass -File ./scripts/powershell/setup-phase2.ps1
else
	bash ./scripts/bash/setup-phase2.sh
endif

## install: Install all dependencies
install: backend-install frontend-install services-install
	@echo "All dependencies installed!"

#######################################
# Backend
#######################################

## backend-install: Install backend dependencies
backend-install:
	cd backend && npm install

## backend-build: Build the backend
backend-build:
	cd backend && npm run build

## backend-test: Run backend tests
backend-test:
	cd backend && npm test

## backend-lint: Lint backend code
backend-lint:
	cd backend && npm run lint

## backend-dev: Run backend in development mode
backend-dev:
	cd backend && npm run dev

#######################################
# Frontend
#######################################

## frontend-install: Install frontend dependencies
frontend-install:
	cd frontend && npm install

## frontend-build: Build the frontend
frontend-build:
	cd frontend && npm run build

## frontend-test: Run frontend tests
frontend-test:
	cd frontend && npm test

## frontend-lint: Lint frontend code
frontend-lint:
	cd frontend && npm run lint

## frontend-dev: Run frontend in development mode
frontend-dev:
	cd frontend && npm run dev

#######################################
# Services
#######################################

## services-install: Install services dependencies
services-install:
	cd services && npm install

## services-build: Build services
services-build:
	cd services && npm run build

## services-test: Run services tests
services-test:
	cd services && npm test

#######################################
# All Components
#######################################

## build: Build all components
build: backend-build frontend-build services-build
	@echo "All components built!"

## test: Run all tests
test: backend-test frontend-test
	@echo "All tests passed!"

## lint: Lint all code
lint: backend-lint frontend-lint
	@echo "All linting complete!"

#######################################
# Orchestrator
#######################################

## run-orchestrator: Start the Level-6 orchestrator
run-orchestrator:
	@echo "Starting Level-6 Auto-Orchestrator..."
	@echo "Orchestrator CLI not yet implemented. See orchestration/auto-orchestrator/level-6/README.md"

## orchestrator-status: Check orchestrator status
orchestrator-status:
	@echo "Checking orchestrator status..."
	@echo "Status: Not running (CLI not yet implemented)"

## orchestrator-graph: Display execution graph
orchestrator-graph:
	@echo "Execution graph visualization not yet implemented."
	@echo "See orchestration/auto-orchestrator/level-6/README.md for graph documentation."

#######################################
# Utility
#######################################

## clean: Clean build artifacts
clean:
	rm -rf backend/dist backend/coverage
	rm -rf frontend/dist frontend/coverage
	rm -rf services/dist services/coverage
	rm -rf node_modules
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	rm -rf services/node_modules
	@echo "Cleaned all build artifacts and dependencies!"

## clean-build: Clean only build artifacts (keep node_modules)
clean-build:
	rm -rf backend/dist backend/coverage
	rm -rf frontend/dist frontend/coverage
	rm -rf services/dist services/coverage
	@echo "Cleaned build artifacts!"

## validate-configs: Validate all configuration files
validate-configs:
	@echo "Validating configuration files..."
	@node -e "JSON.parse(require('fs').readFileSync('services/policyEngine/config.json', 'utf8'))" && echo "  ✓ policyEngine/config.json"
	@node -e "JSON.parse(require('fs').readFileSync('services/quotaEngine/config.json', 'utf8'))" && echo "  ✓ quotaEngine/config.json"
	@node -e "JSON.parse(require('fs').readFileSync('services/modelRouter/config.json', 'utf8'))" && echo "  ✓ modelRouter/config.json"
	@node -e "JSON.parse(require('fs').readFileSync('bus/toolBus/config.json', 'utf8'))" && echo "  ✓ toolBus/config.json"
	@echo "All configurations valid!"

#######################################
# Help
#######################################

## help: Show this help message
help:
	@echo "Auto-Dev-Engine Phase-2 Makefile"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /'
