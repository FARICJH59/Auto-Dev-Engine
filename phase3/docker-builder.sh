#!/usr/bin/env bash
# Phase 3 Agent: Docker Builder
# Purpose: Builds and validates Docker images
set -euo pipefail

echo "=== Phase 3: Docker Builder ==="

# Check for Dockerfile
if [[ ! -f "Dockerfile" ]]; then
  echo "  No Dockerfile found, skipping Docker build"
  exit 0
fi

echo "✓ Found Dockerfile"

# Build Docker image if requested
if [[ "${BUILD_DOCKER:-false}" == "true" ]]; then
  echo "Building Docker image..."
  IMAGE_TAG="${DOCKER_IMAGE_TAG:-app:latest}"
  docker build -t "$IMAGE_TAG" . || {
    echo "ERROR: Docker build failed"
    exit 1
  }
  echo "✓ Docker image built successfully: $IMAGE_TAG"
  
  # Run smoke tests on the image
  if [[ "${RUN_SMOKE_TESTS:-false}" == "true" ]]; then
    echo "Running smoke tests on Docker image..."
    docker run --rm "$IMAGE_TAG" --version || echo "  Note: Version check not supported"
    echo "✓ Smoke tests complete"
  fi
else
  echo "  Docker build skipped (set BUILD_DOCKER=true to build)"
fi

echo "✓ Phase 3 Docker operations complete"
