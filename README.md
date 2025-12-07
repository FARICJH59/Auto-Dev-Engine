# 🚀 Auto-Dev-Engine

**Full-Stack Automated Development and Deployment Platform**

[![Deploy Backend](https://github.com/FARICJH59/Auto-Dev-Engine/workflows/Phase%203%20-%20Deploy%20Backend%20to%20Cloud%20Run/badge.svg)](https://github.com/FARICJH59/Auto-Dev-Engine/actions)
[![Deploy Frontend](https://github.com/FARICJH59/Auto-Dev-Engine/workflows/Phase%203%20-%20Deploy%20Frontend%20to%20Vercel/badge.svg)](https://github.com/FARICJH59/Auto-Dev-Engine/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Auto-Dev-Engine is a comprehensive platform for automating software development workflows, from code analysis to deployment, using GitHub Actions, Google Cloud Run, and Vercel.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Quick Start](#quick-start)
- [Phase Overview](#phase-overview)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Auto-Dev-Engine implements a three-phase approach to development automation:

- **Phase 1**: Agent Matrix Execution - Parallel execution of development agents
- **Phase 2**: Pipeline Orchestration - Coordinated workflow management
- **Phase 3**: Full-Stack Deployment - Automated CI/CD with Cloud Run and Vercel

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | Node.js + Express | Orchestrator API |
| **Frontend** | Next.js + React | Dashboard UI |
| **Deployment** | Cloud Run | Backend hosting |
| **Deployment** | Vercel | Frontend hosting |
| **CI/CD** | GitHub Actions | Automation pipeline |
| **Container** | Docker | Containerization |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Phase 1    │  │   Phase 2    │  │   Phase 3    │ │
│  │   Agents     │→ │ Orchestrator │→ │  Deployment  │ │
│  │   Matrix     │  │   Pipeline   │  │  Automation  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │     GitHub Actions CI/CD      │
        └───────────────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
┌──────────────┐              ┌──────────────┐
│  Cloud Run   │              │    Vercel    │
│   (Backend)  │◄────────────►│  (Frontend)  │
└──────────────┘              └──────────────┘
```

---

## ✨ Features

### Phase 1: Agent Matrix Execution

- ✅ Parallel agent execution via GitHub Actions matrix strategy
- ✅ Agent types: code-analysis, test-generation, deployment, monitoring
- ✅ Artifact collection and result aggregation
- ✅ Configurable via workflow dispatch

### Phase 2: Pipeline Orchestration

- ✅ RESTful API for agent management
- ✅ Sequential pipeline execution
- ✅ Health monitoring and status reporting
- ✅ Express-based orchestrator service
- ✅ Docker containerization

### Phase 3: Full-Stack Deployment

- ✅ Automated Cloud Run deployment for backend
- ✅ Automated Vercel deployment for frontend
- ✅ Environment variable management via GitHub Secrets
- ✅ CI/CD integration with GitHub Actions
- ✅ Production-ready configuration

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker (for local testing)
- Google Cloud Platform account
- Vercel account
- GitHub repository with Actions enabled

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/FARICJH59/Auto-Dev-Engine.git
   cd Auto-Dev-Engine
   ```

2. **Start the backend orchestrator**
   ```bash
   cd orchestrator
   npm install
   npm start
   # Runs on http://localhost:8080
   ```

3. **Start the frontend dashboard**
   ```bash
   cd frontend
   npm install
   NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
   # Runs on http://localhost:3000
   ```

4. **Access the dashboard**
   
   Open your browser to `http://localhost:3000`

---

## 📦 Phase Overview

### Phase 1: Agent Matrix

**Location**: `.github/workflows/run-agents.yml`

Execute agents in parallel:
```bash
gh workflow run run-agents.yml
```

### Phase 2: Orchestrator

**Location**: `orchestrator/`

Key endpoints:
- `GET /health` - Health check
- `GET /status` - Orchestrator status
- `GET /agents` - List agents
- `POST /agents/:name/execute` - Execute agent
- `POST /pipeline/execute` - Execute pipeline

### Phase 3: Deployment

**Backend Workflow**: `.github/workflows/deploy-cloud-run.yml`
**Frontend Workflow**: `.github/workflows/deploy-vercel.yml`

Automatic deployment on push to `main` branch.

---

## 🌐 Deployment

### Automated Deployment

All deployments are automated via GitHub Actions:

1. **Push to main branch**
2. **Backend** automatically deploys to Cloud Run
3. **Frontend** automatically deploys to Vercel
4. **Agents** execute on every push/PR

### Manual Deployment

Trigger deployments manually:

```bash
# Backend
gh workflow run deploy-cloud-run.yml

# Frontend
gh workflow run deploy-vercel.yml

# Agents
gh workflow run run-agents.yml
```

### Configuration

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions including:
- Google Cloud Platform setup
- Vercel configuration
- GitHub Secrets configuration
- Troubleshooting guide

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[orchestrator/README.md](./orchestrator/README.md)** - Backend documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend documentation

### API Documentation

**Base URL (Production)**: `https://ade-orchestrator-xxxxx.run.app`

**Example API Call**:
```bash
curl https://ade-orchestrator-xxxxx.run.app/status
```

---

## 🛠️ Development

### Project Structure

```
Auto-Dev-Engine/
├── .github/
│   └── workflows/
│       ├── run-agents.yml          # Phase 1
│       ├── deploy-cloud-run.yml    # Phase 3 Backend
│       └── deploy-vercel.yml       # Phase 3 Frontend
├── orchestrator/                   # Phase 2 Backend
│   ├── src/
│   │   └── pipeline.js
│   ├── Dockerfile
│   └── package.json
├── frontend/                       # Phase 3 Frontend
│   ├── pages/
│   ├── vercel.json
│   └── package.json
├── DEPLOYMENT.md                   # Deployment guide
├── README.md                       # This file
└── LICENSE
```

### Running Tests

```bash
# Backend tests
cd orchestrator
npm test

# Frontend tests
cd frontend
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/FARICJH59/Auto-Dev-Engine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/FARICJH59/Auto-Dev-Engine/discussions)
- **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎯 Roadmap

- [x] Phase 1: Agent Matrix Execution
- [x] Phase 2: Pipeline Orchestration
- [x] Phase 3: Full-Stack Deployment
- [ ] Phase 4: Advanced Monitoring & Analytics
- [ ] Phase 5: Multi-cloud Support
- [ ] Phase 6: AI-Powered Optimization

---

## 🌟 Acknowledgments

Built with:
- [GitHub Actions](https://github.com/features/actions)
- [Google Cloud Run](https://cloud.google.com/run)
- [Vercel](https://vercel.com)
- [Next.js](https://nextjs.org)
- [Express](https://expressjs.com)

---

<div align="center">

**Made with ❤️ by the Auto-Dev-Engine Team**

[⭐ Star this repo](https://github.com/FARICJH59/Auto-Dev-Engine) if you find it useful!

</div>
