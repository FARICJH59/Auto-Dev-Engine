#!/usr/bin/env node
/**
 * Dynamic GitHub App Creator
 * Registers a GitHub App under an organization and sets up webhooks for Brain Spark orchestration
 */

import "dotenv/config";

const ORG_NAME = process.env.GITHUB_ORG;
const PAT = process.env.GITHUB_PAT;
const APP_NAME = process.env.APP_NAME || "brain-spark-orchestrator";
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const APP_URL = process.env.APP_URL || "https://brain-spark.io";
const CALLBACK_URL = process.env.CALLBACK_URL || "https://brain-spark.io/callback";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

function ensureConfig() {
  const missing = [
    ["GITHUB_ORG", ORG_NAME],
    ["GITHUB_PAT", PAT],
    ["WEBHOOK_URL", WEBHOOK_URL],
    ["WEBHOOK_SECRET", WEBHOOK_SECRET],
  ].filter(([, value]) => !value);

  if (missing.length) {
    console.error("Missing required environment variables:", missing.map(([k]) => k).join(", "));
    return false;
  }

  return true;
}

async function createGitHubApp() {
  if (!ensureConfig()) {
    process.exitCode = 1;
    return null;
  }

  const url = `https://api.github.com/orgs/${ORG_NAME}/apps`;

  const body = {
    name: APP_NAME,
    description: "Handles client ML project orchestration dynamically",
    url: APP_URL,
    hook_attributes: {
      url: WEBHOOK_URL,
      content_type: "json",
      secret: WEBHOOK_SECRET,
    },
    callback_urls: [CALLBACK_URL],
    public: false,
    default_permissions: {
      contents: "read",
      issues: "write",
      metadata: "read",
      actions: "write",
    },
    default_events: ["push", "pull_request", "workflow_run"],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `token ${PAT}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  let responseData = responseText;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    // leave responseData as raw text when JSON parsing fails
  }

  if (!response.ok) {
    console.error("GitHub App creation failed:", responseData);
    return null;
  }

  const appId = typeof responseData === "object" && responseData !== null ? responseData.id : "(unavailable)";

  console.log("GitHub App created successfully!");
  console.log("App ID:", appId);
  console.log("Webhook URL:", WEBHOOK_URL);
  console.log("Callback URL:", CALLBACK_URL);

  return responseData;
}

createGitHubApp()
  .then((app) => {
    if (app) {
      console.log("App registered dynamically and ready for integration with Brain Spark.");
    }
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
