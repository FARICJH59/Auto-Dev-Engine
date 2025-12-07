# Auto-Dev-Engine

**Intelligent Multi-Agent System for Automated Development Workflows**

[![Multi-Agent System Execution](https://github.com/FARICJH59/Auto-Dev-Engine/actions/workflows/run-agents.yml/badge.svg)](https://github.com/FARICJH59/Auto-Dev-Engine/actions/workflows/run-agents.yml)
[![Mermaid Architecture Integration](https://github.com/FARICJH59/Auto-Dev-Engine/actions/workflows/mermaid-integration.yml/badge.svg)](https://github.com/FARICJH59/Auto-Dev-Engine/actions/workflows/mermaid-integration.yml)

## Overview

Auto-Dev-Engine is a sophisticated multi-agent system that automates code analysis, performance monitoring, syntax optimization, and AI-powered development workflows. The system implements a three-phase architecture with parallel execution capabilities and comprehensive reporting.

## 🤖 Multi-Agent System

The system consists of four specialized agents working in parallel:

### 1. **LSAS** (Language-Specific Analysis System)
- Automated language detection
- Static code analysis
- Pattern recognition
- Issue identification

### 2. **Pulse** (Performance and Usage Logging)
- Real-time system monitoring
- Resource utilization tracking (CPU, Memory, Disk)
- Performance analysis
- Health status reporting

### 3. **Parso** (Parser and Syntax Optimization)
- Python AST parsing
- Syntax validation
- Code structure analysis
- Complexity metrics

### 4. **Gemini** (AI-Powered Analysis)
- Repository structure analysis
- AI-driven insights
- Code quality assessment
- Actionable recommendations

## 🏗️ Architecture

The system implements a three-phase architecture:

```
Phase 1: Agent Infrastructure
  ├── Agent initialization
  ├── Configuration loading
  └── Logging setup

Phase 2: Parallel Execution
  ├── Matrix strategy (GitHub Actions)
  ├── Concurrent agent processing
  └── Result aggregation

Phase 3: Integration & Deployment
  ├── Report generation
  ├── Artifact handling
  ├── Status tracking
  └── Cloud deployment (Cloud Run + Vercel)
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed documentation.

## 📊 Architecture Diagrams

### System Architecture
![Architecture Diagram](docs/architecture.png)

### Workflow Sequence
![Workflow Diagram](docs/workflow.png)

### Phase Flow
![Phase Flow Diagram](docs/phase-flow.png)

*Diagrams are automatically generated from Mermaid source files in `docs/`*

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- pip package manager
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/FARICJH59/Auto-Dev-Engine.git
cd Auto-Dev-Engine
```

2. Install dependencies:
```bash
pip install -r agents/requirements.txt
```

3. Run individual agents:
```bash
# Run LSAS agent
python agents/lsas/lsas_agent.py

# Run Pulse agent
python agents/pulse/pulse_agent.py

# Run Parso agent
python agents/parso/parso_agent.py

# Run Gemini agent
python agents/gemini/gemini_agent.py
```

4. Run all agents in parallel:
```bash
cd agents
python run_all_agents.py
```

## 📋 Agent Reports

Each agent generates a JSON report with detailed findings:

- `lsas_report.json` - Language analysis results
- `pulse_report.json` - Performance metrics
- `parso_report.json` - Syntax parsing results
- `gemini_report.json` - AI-powered insights
- `orchestration_report.json` - Aggregated results

## 🔄 GitHub Actions Workflows

### run-agents.yml
Automated agent execution with matrix strategy:
- **Triggers**: Push, PR, Schedule (daily), Manual
- **Features**:
  - Parallel execution using matrix strategy
  - Individual agent isolation
  - Artifact generation and upload
  - Status tracking and reporting
  - Deployment to Cloud Run and Vercel (main branch)

### mermaid-integration.yml
Documentation and diagram generation:
- **Triggers**: Push to docs/, agents/, workflows/
- **Features**:
  - Mermaid diagram generation (PNG/SVG)
  - Syntax validation
  - Automatic documentation updates
  - Architecture report generation

## 🛠️ Configuration

### Environment Variables

Set the following secrets in your GitHub repository:

```yaml
GEMINI_API_KEY       # Gemini AI API key
VERCEL_TOKEN         # Vercel deployment token
GCP_PROJECT_ID       # Google Cloud project ID
GCP_REGION          # GCP deployment region
GCP_SA_KEY          # GCP service account key
```

## 📦 Project Structure

```
Auto-Dev-Engine/
├── agents/
│   ├── lsas/
│   │   └── lsas_agent.py
│   ├── pulse/
│   │   └── pulse_agent.py
│   ├── parso/
│   │   └── parso_agent.py
│   ├── gemini/
│   │   └── gemini_agent.py
│   ├── run_all_agents.py
│   └── requirements.txt
├── .github/
│   └── workflows/
│       ├── run-agents.yml
│       ├── mermaid-integration.yml
│       └── main.yml
├── docs/
│   ├── architecture.mmd
│   ├── workflow.mmd
│   ├── phase-flow.mmd
│   └── ARCHITECTURE.md
├── README.md
└── LICENSE
```

## 🔍 Features

### ✅ Implemented (Phases 1-3)

- [x] Agent directories and executable scripts
- [x] Comprehensive logging system
- [x] Status tracking and reporting
- [x] GitHub Actions matrix strategy
- [x] Parallel execution support
- [x] Artifact handling and upload
- [x] Mermaid architecture diagrams
- [x] Documentation integration
- [x] Cloud Run deployment placeholder
- [x] Vercel deployment placeholder

### 🚧 Future Enhancements

- [ ] Database integration for historical tracking
- [ ] Real-time dashboard
- [ ] Advanced AI model integration
- [ ] Custom agent plugins
- [ ] WebSocket-based live updates
- [ ] Multi-repository support

## 📖 Documentation

- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Workflows**: See [.github/workflows/](.github/workflows/)
- **Diagrams**: See [docs/](docs/) directory
- **Agent Documentation**: See individual agent source files

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for guidelines on adding new agents or modifying workflows.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GitHub Actions for CI/CD automation
- Mermaid for architecture diagrams
- Python community for excellent libraries
- Google Gemini for AI capabilities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/FARICJH59/Auto-Dev-Engine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/FARICJH59/Auto-Dev-Engine/discussions)

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-07  
**Status**: Production Ready ✅
