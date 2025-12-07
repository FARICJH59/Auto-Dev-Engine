<header>

# Auto-Dev-Engine 🚀

_An Interactive GitHub Actions Learning Platform with Automated Deployment_

</header>

## 🎯 What We Are Building

**Auto-Dev-Engine** is an educational repository that combines two powerful concepts:

1. **Interactive GitHub Actions Tutorial** - A hands-on, self-paced learning system that teaches developers how to create and use GitHub Actions workflows
2. **Automated Deployment Pipeline** - A production-ready CI/CD workflow that demonstrates real-world deployment to cloud platforms (Vercel and Google Cloud Platform)

This project serves as both a learning tool for beginners and a reference implementation for developers looking to set up automated workflows in their own projects.

---

## 🏗️ Architecture & How It Works

### Interactive Learning System

The repository uses a clever **self-updating tutorial system** that guides learners through 6 progressive steps:

```
Step 0: Welcome → Step 1: Create Workflow → Step 2: Add Job → 
Step 3: Add Actions → Step 4: Merge PR → Step 5: Test Workflow → Finish
```

**How the automation works:**
- Each step has its own GitHub Actions workflow file in `.github/workflows/`
- When you complete a step's requirements, the corresponding workflow automatically:
  - Validates your changes
  - Updates the step counter (`.github/steps/-step.txt`)
  - Replaces the README with instructions for the next step
- This creates an interactive, self-guided learning experience

### Deployment Workflow

The `main.yml` workflow demonstrates a production deployment pipeline that:
- Triggers on pushes to the `main` branch or manual dispatch
- Sets up Node.js, Google Cloud SDK, and Docker
- Authenticates with cloud services using secrets
- Executes a deployment script for multi-platform deployment

---

## 📚 What You'll Learn

Through this interactive course, you'll master:

1. **Workflow Fundamentals**
   - Creating YAML workflow files
   - Understanding workflow triggers and events
   - Configuring permissions

2. **Jobs and Runners**
   - Setting up jobs with Ubuntu runners
   - Understanding job execution contexts

3. **Actions and Steps**
   - Adding steps to workflows
   - Using environment variables and secrets
   - Working with GitHub CLI (`gh`)

4. **Pull Request Automation**
   - Automating PR comments
   - Implementing CI/CD checks

5. **Real-World Deployment**
   - Multi-cloud deployment strategies
   - Secret management
   - Container orchestration with Docker

---

## 🚀 Getting Started

### For Learners (Interactive Tutorial)

**Step 1: Create a workflow file**

_Welcome to "Hello GitHub Actions"! :wave:_

**What is _GitHub Actions_?**: GitHub Actions is a flexible way to automate nearly every aspect of your team's software workflow. You can automate testing, continuously deploy, review code, manage issues and pull requests, and much more. The best part, these workflows are stored as code in your repository and easily shared and reused across teams. To learn more, check out these resources:

- The GitHub Actions feature page, see [GitHub Actions](https://github.com/features/actions).
- The "GitHub Actions" user documentation, see [GitHub Actions](https://docs.github.com/actions).

**What is a _workflow_?**: A workflow is a configurable automated process that will run one or more jobs. Workflows are defined in special files in the `.github/workflows` directory and they execute based on your chosen event. For this exercise, we'll use a `pull_request` event.

- To read more about workflows, jobs, and events, see "[Understanding GitHub Actions](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions)".
- If you want to learn more about the `pull_request` event before using it, see "[pull_request](https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request)".

To get you started, we ran an Actions workflow in your new repository that, among other things, created a branch for you to work in, called `welcome-workflow`.

### :keyboard: Activity: Create a workflow file

1. Open a new browser tab, and navigate to this same repository. Then, work on the steps in your second tab while you read the instructions in this tab.
1. Create a pull request. This will contain all of the changes you'll make throughout this part of the course.

   Click the **Pull Requests** tab, click **New pull request**, set `base: main` and `compare:welcome-workflow`, click **Create pull request**, then click **Create pull request** again.

1. Navigate to the **Code** tab.
1. From the **main** branch dropdown, click on the **welcome-workflow** branch.
1. Navigate to the `.github/workflows/` folder, then select **Add file** and click on **Create new file**.
1. In the **Name your file** field, enter `welcome.yml`.
1. Add the following content to the `welcome.yml` file:

   ```yaml copy
   name: Post welcome comment
   on:
     pull_request:
       types: [opened]
   permissions:
     pull-requests: write
   ```

1. To commit your changes, click **Commit changes**.
1. Type a commit message, select **Commit directly to the welcome-workflow branch** and click **Commit changes**.
1. Wait about 20 seconds, then refresh this page (the one you're following instructions from). A separate Actions workflow in the repository (not the workflow you created) will run and will automatically replace the contents of this README file with instructions for the next step.

---

## 🔧 For Developers (Deployment Setup)

If you want to use the deployment workflow for your own projects:

### Required Secrets

Configure these in your repository settings (Settings → Secrets and variables → Actions):

```
VERCEL_TOKEN      - Your Vercel deployment token
GCP_PROJECT_ID    - Google Cloud Platform project ID
GCP_REGION        - GCP region for deployment
GEMINI_API_KEY    - Google Gemini API key (if using AI features)
GCP_SA_KEY        - GCP Service Account key (JSON format)
```

⚠️ **Security Best Practices:**
- **Never commit secrets** to your repository or expose them in logs
- **Use least-privilege principles**: Grant service accounts only the minimum permissions needed
- **Rotate credentials regularly**: Update tokens and keys periodically
- **Use GitHub Secrets**: Always store sensitive values as encrypted secrets, not in code
- **Limit secret access**: Only give repository collaborators access when necessary

### Deployment Workflow Features

- **Automated Deployment**: Deploys on every push to `main`
- **Manual Trigger**: Can be triggered manually via `workflow_dispatch`
- **Multi-Platform**: Supports both Vercel and GCP
- **Docker Support**: Uses Docker Buildx for containerization
- **Cloud Authentication**: Automatic authentication with GCP services

---

## 📁 Repository Structure

```
.github/
├── workflows/          # GitHub Actions workflow definitions
│   ├── main.yml       # Production deployment workflow
│   ├── 0-welcome.yml  # Tutorial step 0
│   ├── 1-create-a-workflow.yml
│   ├── 2-add-a-job.yml
│   ├── 3-add-actions.yml
│   ├── 4-merge-your-pull-request.yml
│   └── 5-trigger.yml
├── steps/             # Tutorial step content (markdown)
│   ├── -step.txt     # Current step tracker
│   ├── 0-welcome.md
│   ├── 1-create-a-workflow.md
│   ├── 2-add-a-job.md
│   ├── 3-add-actions.md
│   ├── 4-merge-your-pull-request.md
│   ├── 5-trigger.md
│   └── X-finish.md
└── dependabot.yml     # Dependency update configuration
```

---

## 🎓 Use Cases

1. **Learning GitHub Actions**: Perfect for developers new to CI/CD and automation
2. **Teaching**: Use as a classroom or workshop resource
3. **Reference Implementation**: Study the workflows as examples for your projects
4. **Template**: Fork and adapt for your own automated learning systems
5. **Production Deployment**: Use the deployment workflow as a starting point

---

## 🤝 Contributing

This is an educational repository. Feel free to:
- Fork it for your own learning
- Adapt the workflows for your projects
- Share improvements via pull requests

---

## 📖 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Awesome Actions](https://github.com/sdras/awesome-actions)
- [GitHub Skills](https://skills.github.com/)

---

<footer>

---

Get help: [Post in our discussion board](https://github.com/orgs/skills/discussions/categories/hello-github-actions) &bull; [Review the GitHub status page](https://www.githubstatus.com/)

&copy; 2023 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

</footer>
