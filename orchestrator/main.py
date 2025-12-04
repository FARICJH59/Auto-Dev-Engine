"""
ADE Fusion Stack Orchestrator
Main FastAPI application for coordinating services
"""

import os
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx

app = FastAPI(
    title="ADE Orchestrator",
    description="Orchestrates ADE Fusion Stack services",
    version="1.0.0"
)

# Service endpoints (configured via environment)
SERVICE_ENDPOINTS = {
    "project-generator": os.getenv("PROJECT_GENERATOR_URL", "http://localhost:8080"),
    "vision-agent": os.getenv("VISION_AGENT_URL", "http://localhost:8081"),
    "inventory-agent": os.getenv("INVENTORY_AGENT_URL", "http://localhost:8082"),
}


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
    services: Dict[str, str] = {}


class OrchestrateRequest(BaseModel):
    action: str
    params: Dict[str, Any] = {}


class OrchestrateResponse(BaseModel):
    success: bool
    action: str
    result: Dict[str, Any]
    timestamp: str


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "ADE Orchestrator is running", "version": "1.0.0"}


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint with service status"""
    services_status = {}
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        for service_name, endpoint in SERVICE_ENDPOINTS.items():
            try:
                response = await client.get(f"{endpoint}/health")
                if response.status_code == 200:
                    services_status[service_name] = "healthy"
                else:
                    services_status[service_name] = "unhealthy"
            except Exception:
                services_status[service_name] = "unreachable"
    
    return HealthResponse(
        status="healthy",
        service="orchestrator",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat(),
        services=services_status
    )


@app.post("/orchestrate", response_model=OrchestrateResponse)
async def orchestrate(request: OrchestrateRequest):
    """
    Orchestrate actions across services
    """
    action = request.action
    params = request.params
    
    result = {}
    
    if action == "generate-project":
        # Forward to project generator
        result = {"status": "project generation initiated", "params": params}
    
    elif action == "analyze-image":
        # Forward to vision agent
        result = {"status": "image analysis initiated", "params": params}
    
    elif action == "get-inventory":
        # Forward to inventory agent
        result = {"status": "inventory fetch initiated", "params": params}
    
    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {action}")
    
    return OrchestrateResponse(
        success=True,
        action=action,
        result=result,
        timestamp=datetime.utcnow().isoformat()
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
