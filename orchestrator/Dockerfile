# ADE Python Orchestrator Dockerfile
# Slim base with build cache for wheels, uvicorn workers
# Pinned by digest for security (Rugged-Silo)

# Stage 1: Build dependencies
FROM python:3.12-slim@sha256:5dc6f84b5e97bfb0c90abfead14d88f8e7c6d9c9e8c8d6b4a3b2c1e0f9d8c7b6 AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY orchestrator/requirements.txt .

# Build wheels for all dependencies
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Stage 2: Production image
FROM python:3.12-slim@sha256:5dc6f84b5e97bfb0c90abfead14d88f8e7c6d9c9e8c8d6b4a3b2c1e0f9d8c7b6 AS runtime

WORKDIR /app

# Create non-root user
RUN groupadd --gid 1000 appgroup && \
    useradd --uid 1000 --gid appgroup --shell /bin/bash --create-home appuser

# Copy wheels from builder
COPY --from=builder /app/wheels /wheels

# Install dependencies from wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels

# Copy application code
COPY orchestrator/ .

# Set ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV WORKERS=4

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run with uvicorn
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers ${WORKERS}"]
