#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Auto-Dev-Engine Phase-2 Setup Script for Windows/PowerShell

.DESCRIPTION
    This script validates prerequisites, creates directory structure,
    installs dependencies, generates environment files, and runs initial tests.

.EXAMPLE
    ./setup-phase2.ps1
    ./setup-phase2.ps1 -SkipTests
    ./setup-phase2.ps1 -Verbose
#>

[CmdletBinding()]
param(
    [switch]$SkipTests,
    [switch]$SkipLint,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ScriptRoot = $PSScriptRoot
$ProjectRoot = (Resolve-Path "$ScriptRoot/../..").Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Auto-Dev-Engine Phase-2 Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

#region Prerequisites Check
function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    $errors = @()

    # Node.js
    try {
        $nodeVersion = node --version 2>$null
        Write-Host "  [OK] Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        $errors += "Node.js is not installed or not in PATH"
    }

    # npm
    try {
        $npmVersion = npm --version 2>$null
        Write-Host "  [OK] npm: $npmVersion" -ForegroundColor Green
    } catch {
        $errors += "npm is not installed or not in PATH"
    }

    # Python (optional)
    try {
        $pythonVersion = python --version 2>$null
        Write-Host "  [OK] Python: $pythonVersion" -ForegroundColor Green
    } catch {
        Write-Host "  [WARN] Python not found (optional)" -ForegroundColor Yellow
    }

    # Git
    try {
        $gitVersion = git --version 2>$null
        Write-Host "  [OK] Git: $gitVersion" -ForegroundColor Green
    } catch {
        $errors += "Git is not installed or not in PATH"
    }

    # PowerShell version
    $psVersion = $PSVersionTable.PSVersion
    Write-Host "  [OK] PowerShell: $psVersion" -ForegroundColor Green

    if ($errors.Count -gt 0) {
        Write-Host ""
        Write-Host "Prerequisites check failed:" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "  - $error" -ForegroundColor Red
        }
        exit 1
    }

    Write-Host ""
    Write-Host "All prerequisites satisfied!" -ForegroundColor Green
    Write-Host ""
}
#endregion

#region Directory Creation
function New-Directories {
    Write-Host "Creating directory structure..." -ForegroundColor Yellow
    
    $directories = @(
        "backend/src",
        "backend/tests",
        "backend/docs",
        "frontend/src",
        "frontend/public",
        "frontend/tests",
        "frontend/docs",
        "orchestration/auto-orchestrator/level-6",
        "orchestration/.state",
        "orchestration/.runs",
        "pipelines",
        "configs",
        "adapters",
        "services/policyEngine",
        "services/quotaEngine",
        "services/modelRouter",
        "bus/toolBus",
        "bus/toolBus/.plugins-cache",
        "scripts/powershell",
        "scripts/bash",
        "ops/configs",
        "ops/observability",
        "ops/security",
        ".vscode"
    )

    foreach ($dir in $directories) {
        $fullPath = Join-Path $ProjectRoot $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Host "  Created: $dir" -ForegroundColor Gray
        } else {
            Write-Host "  Exists:  $dir" -ForegroundColor DarkGray
        }
    }

    Write-Host ""
    Write-Host "Directory structure created!" -ForegroundColor Green
    Write-Host ""
}
#endregion

#region Install Dependencies
function Install-Dependencies {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    
    # Backend dependencies
    $backendPath = Join-Path $ProjectRoot "backend"
    if (Test-Path (Join-Path $backendPath "package.json")) {
        Write-Host "  Installing backend dependencies..." -ForegroundColor Gray
        Push-Location $backendPath
        npm install
        Pop-Location
        Write-Host "  Backend dependencies installed!" -ForegroundColor Green
    }

    # Frontend dependencies
    $frontendPath = Join-Path $ProjectRoot "frontend"
    if (Test-Path (Join-Path $frontendPath "package.json")) {
        Write-Host "  Installing frontend dependencies..." -ForegroundColor Gray
        Push-Location $frontendPath
        npm install
        Pop-Location
        Write-Host "  Frontend dependencies installed!" -ForegroundColor Green
    }

    # Services dependencies
    $servicesPath = Join-Path $ProjectRoot "services"
    if (Test-Path (Join-Path $servicesPath "package.json")) {
        Write-Host "  Installing services dependencies..." -ForegroundColor Gray
        Push-Location $servicesPath
        npm install
        Pop-Location
        Write-Host "  Services dependencies installed!" -ForegroundColor Green
    }

    Write-Host ""
}
#endregion

#region Environment Files
function New-EnvironmentFiles {
    Write-Host "Generating environment files..." -ForegroundColor Yellow

    $envDevelopment = @"
# Auto-Dev-Engine Development Environment
# Generated by setup-phase2.ps1

# Application Settings
NODE_ENV=development
PORT=3000
SERVICE_NAME=ade-backend
VERSION=0.1.0

# API Keys (replace with actual values)
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
GOOGLE_API_KEY=your-google-api-key-here

# Database (if applicable)
DATABASE_URL=postgresql://localhost:5432/ade_dev

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty

# Feature Flags
ENABLE_POLICY_ENGINE=true
ENABLE_QUOTA_ENGINE=true
ENABLE_MODEL_ROUTER=true
ENABLE_TOOL_BUS=true
"@

    $envLocal = @"
# Auto-Dev-Engine Local Overrides
# This file is for local development only and should not be committed

# Override any settings from .env.development here
# LOG_LEVEL=trace
"@

    $envDevPath = Join-Path $ProjectRoot ".env.development"
    $envLocalPath = Join-Path $ProjectRoot ".env.local"

    if (-not (Test-Path $envDevPath) -or $Force) {
        Set-Content -Path $envDevPath -Value $envDevelopment
        Write-Host "  Created: .env.development" -ForegroundColor Green
    } else {
        Write-Host "  Exists:  .env.development (use -Force to overwrite)" -ForegroundColor Yellow
    }

    if (-not (Test-Path $envLocalPath) -or $Force) {
        Set-Content -Path $envLocalPath -Value $envLocal
        Write-Host "  Created: .env.local" -ForegroundColor Green
    } else {
        Write-Host "  Exists:  .env.local (use -Force to overwrite)" -ForegroundColor Yellow
    }

    Write-Host ""
}
#endregion

#region Bootstrap Configs
function Initialize-Configs {
    Write-Host "Bootstrapping default configurations..." -ForegroundColor Yellow

    # Check if config files exist and are valid
    $configFiles = @(
        "services/policyEngine/config.json",
        "services/quotaEngine/config.json",
        "services/modelRouter/config.json",
        "bus/toolBus/config.json"
    )

    foreach ($configFile in $configFiles) {
        $fullPath = Join-Path $ProjectRoot $configFile
        if (Test-Path $fullPath) {
            try {
                $null = Get-Content $fullPath | ConvertFrom-Json
                Write-Host "  [OK] $configFile" -ForegroundColor Green
            } catch {
                Write-Host "  [ERROR] Invalid JSON in $configFile" -ForegroundColor Red
            }
        } else {
            Write-Host "  [MISSING] $configFile" -ForegroundColor Yellow
        }
    }

    Write-Host ""
}
#endregion

#region Run Tests
function Invoke-SmokeTests {
    if ($SkipTests) {
        Write-Host "Skipping tests (--SkipTests specified)" -ForegroundColor Yellow
        return
    }

    Write-Host "Running smoke tests..." -ForegroundColor Yellow

    # Backend tests
    $backendPath = Join-Path $ProjectRoot "backend"
    if (Test-Path (Join-Path $backendPath "package.json")) {
        Write-Host "  Running backend tests..." -ForegroundColor Gray
        Push-Location $backendPath
        npm test
        Pop-Location
    }

    # Frontend tests
    $frontendPath = Join-Path $ProjectRoot "frontend"
    if (Test-Path (Join-Path $frontendPath "package.json")) {
        Write-Host "  Running frontend tests..." -ForegroundColor Gray
        Push-Location $frontendPath
        npm test
        Pop-Location
    }

    Write-Host ""
}
#endregion

#region Run Lint
function Invoke-Lint {
    if ($SkipLint) {
        Write-Host "Skipping lint (--SkipLint specified)" -ForegroundColor Yellow
        return
    }

    Write-Host "Running linters..." -ForegroundColor Yellow

    # Backend lint
    $backendPath = Join-Path $ProjectRoot "backend"
    if (Test-Path (Join-Path $backendPath "package.json")) {
        Write-Host "  Linting backend..." -ForegroundColor Gray
        Push-Location $backendPath
        try {
            npm run lint 2>$null
        } catch {
            Write-Host "  Backend lint not configured" -ForegroundColor Yellow
        }
        Pop-Location
    }

    # Frontend lint
    $frontendPath = Join-Path $ProjectRoot "frontend"
    if (Test-Path (Join-Path $frontendPath "package.json")) {
        Write-Host "  Linting frontend..." -ForegroundColor Gray
        Push-Location $frontendPath
        try {
            npm run lint 2>$null
        } catch {
            Write-Host "  Frontend lint not configured" -ForegroundColor Yellow
        }
        Pop-Location
    }

    Write-Host ""
}
#endregion

#region Main
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray
Write-Host ""

Test-Prerequisites
New-Directories
Install-Dependencies
New-EnvironmentFiles
Initialize-Configs
Invoke-Lint
Invoke-SmokeTests

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase-2 Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update .env.development with your API keys"
Write-Host "  2. Run 'make build' to build all components"
Write-Host "  3. Run 'make test' to run all tests"
Write-Host "  4. Run 'make run-orchestrator' to start the orchestrator"
Write-Host ""
#endregion
