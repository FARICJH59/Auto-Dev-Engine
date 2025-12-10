# DevOps Automation Scaffold - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Verify Your Setup
```bash
./scripts/full-platform-verify.sh
```

This will:
- ✅ Check your repository structure
- ✅ Validate all scripts
- ✅ Run all phase agents
- ✅ Report any issues

### 2. Test the Agents
```bash
./scripts/test-agents.sh
```

Expected output: All 9 agents should PASS ✅

### 3. Apply the Scaffold (Preview)
```bash
./scripts/safe_apply_scaffold.sh --dry-run
```

This shows what would happen without making changes.

## 📋 Common Commands

### Full Platform Verification
```bash
# Basic verification
./scripts/full-platform-verify.sh

# With Docker smoke tests
./scripts/full-platform-verify.sh --smoke

# With deployment validation
./scripts/full-platform-verify.sh --deploy

# Verbose output
./scripts/full-platform-verify.sh --verbose

# All features
./scripts/full-platform-verify.sh --smoke --deploy --verbose
```

### Safe Scaffold Application
```bash
# Preview changes (safe)
./scripts/safe_apply_scaffold.sh --dry-run

# Apply safely (creates *.scaffold for conflicts)
./scripts/safe_apply_scaffold.sh

# Force apply with backups
./scripts/safe_apply_scaffold.sh --force
```

### Agent Testing
```bash
# Test all agents
./scripts/test-agents.sh

# Test individual agent
bash phase1/agents/init-agent.sh
bash phase2/security-scanner.sh
bash phase3/docker-builder.sh
```

## 🔧 GitHub Actions Workflows

### Trigger Full Platform CI Validation
1. Go to Actions tab in GitHub
2. Select "Full Platform CI Validation"
3. Click "Run workflow"
4. Optional: Enable --smoke or --deploy

### Trigger Auto Scaffold Apply
1. Go to Actions tab in GitHub
2. Select "Auto Scaffold Apply"
3. Click "Run workflow"
4. Choose:
   - Dry run: Yes (preview) or No (apply)
   - Force apply: Yes (with backups) or No (safe mode)
   - Trigger verification: Yes (recommended) or No

## 🎯 For Different Project Types

### For ML Projects
The scaffold automatically detects:
- Python requirements.txt
- Jupyter notebooks (via file structure)
- Can be extended for model validation

```bash
# Add your ML-specific checks to phase1/agents/
cp phase1/agents/dependency-scanner.sh phase1/agents/ml-model-validator.sh
# Edit to add your checks
```

### For IoT Projects
Supports:
- Cross-platform dependencies
- Embedded configurations
- Multi-architecture validation

```bash
# Add IoT-specific validation to phase3
nano phase3/iot-device-validator.sh
```

### For Web Applications
Validates:
- Node.js/npm dependencies
- Docker containers
- Cloud deployments

```bash
# Already configured! Just run:
./scripts/full-platform-verify.sh --smoke --deploy
```

### For Client-Specific Projects
Customize by adding agents:
```bash
# Create custom agent
nano phase2/client-custom-validator.sh

# Make executable
chmod +x phase2/client-custom-validator.sh

# Test it
./scripts/test-agents.sh
```

## 📚 Documentation

- **Full documentation**: `docs/README.md`
- **Architecture diagram**: `docs/diagram.mmd`
- **Implementation details**: `SCAFFOLD_SUMMARY.md`

## 🔍 Troubleshooting

### "Permission denied" error
```bash
chmod +x scripts/*.sh
chmod +x phase*/**/*.sh
```

### Shellcheck warnings
```bash
shellcheck scripts/*.sh phase*/**/*.sh
```

### YAML linting issues
```bash
yamllint .
```

### Agent test failures
```bash
# Run individual agent to see detailed output
bash -x phase2/security-scanner.sh
```

## 🛡️ Security Best Practices

1. **Before committing**:
   ```bash
   # Check for secrets
   gitleaks detect --verbose
   ```

2. **Generate SBOM**:
   ```bash
   syft dir:. -o json > sbom.json
   ```

3. **Scan containers**:
   ```bash
   trivy image your-image:tag
   ```

## 🎓 Next Steps

1. ✅ Run `./scripts/full-platform-verify.sh` to validate setup
2. ✅ Review `docs/README.md` for comprehensive documentation
3. ✅ Customize agents for your specific needs
4. ✅ Enable GitHub Actions workflows
5. ✅ Integrate with your CI/CD pipeline

## 💡 Pro Tips

- Use `--dry-run` first to preview changes
- Check `*.scaffold` files after applying scaffold
- Run verification before committing changes
- Enable GitHub Actions for automatic validation
- Keep agents simple and focused on one task
- Document custom agents you add

## 🆘 Getting Help

1. Check `docs/README.md` for detailed documentation
2. Review `SCAFFOLD_SUMMARY.md` for implementation details
3. Look at existing agents for examples
4. Check shellcheck output for script issues
5. Review GitHub Actions logs for CI failures

## ✅ Validation Checklist

Before considering the scaffold "ready":
- [ ] All agent tests pass (`./scripts/test-agents.sh`)
- [ ] Verification script runs successfully
- [ ] No shellcheck warnings
- [ ] YAML files pass yamllint
- [ ] GitHub Actions workflows are enabled
- [ ] Documentation is reviewed
- [ ] Custom agents are added (if needed)
- [ ] Team is trained on usage

---

**Ready to start?** Run: `./scripts/full-platform-verify.sh`

**Need help?** Check: `docs/README.md`

**Want details?** Read: `SCAFFOLD_SUMMARY.md`
