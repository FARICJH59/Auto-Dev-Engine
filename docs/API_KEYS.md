# API Keys Guide

Learn how to create, manage, and use API keys for programmatic access to the QGPS Control Plane.

## Overview

API keys provide secure, programmatic access to the QGPS platform without requiring interactive authentication. Each key is scoped to a specific organization and can have limited permissions.

## Creating API Keys

### Via Dashboard UI

1. Navigate to **Dashboard → API Keys**
2. Click **"Create API Key"**
3. Configure your key:
   - **Name**: Descriptive name (e.g., "Production Backend", "CI/CD Pipeline")
   - **Scopes**: Select permissions (see Scopes section)
   - **Expiration**: Optional expiration date
4. Click **Create**
5. **⚠️ Important**: Copy the secret immediately - it won't be shown again!

### Programmatically (Admin Only)

```bash
curl -X POST https://api.example.com/api/admin/api-keys \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Backend Service Key",
    "scopes": ["read:projects", "write:executions"],
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```

Response:
```json
{
  "id": "key_abc123",
  "name": "Backend Service Key",
  "secret": "sk_org_abc123_xyz789",
  "scopes": ["read:projects", "write:executions"],
  "expiresAt": "2025-12-31T23:59:59Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "orgId": "org_abc123",
  "warning": "Save the secret securely. It will not be shown again."
}
```

## Using API Keys

### Making Authenticated Requests

Include your API key in the `Authorization` header:

```bash
curl -X GET https://api.example.com/v1/projects \
  -H "Authorization: Bearer sk_org_abc123_xyz789" \
  -H "Content-Type: application/json"
```

### JavaScript/TypeScript Example

```typescript
const apiKey = process.env.QGPS_API_KEY;

const response = await fetch('https://api.example.com/v1/projects', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
});

const projects = await response.json();
```

### Python Example

```python
import os
import requests

api_key = os.environ['QGPS_API_KEY']

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json',
}

response = requests.get(
    'https://api.example.com/v1/projects',
    headers=headers
)

projects = response.json()
```

## Available Scopes

| Scope | Description | Who Can Use |
|-------|-------------|-------------|
| `read:projects` | Read project data | All roles |
| `write:projects` | Create/update projects | Members, Admins |
| `delete:projects` | Delete projects | Admins only |
| `read:executions` | Read execution data | All roles |
| `write:executions` | Create/run executions | Members, Admins |
| `read:api-keys` | List API keys | Admins only |
| `write:api-keys` | Create/revoke API keys | Admins only |

### Scope Inheritance

- **Admins** can create keys with any scope
- **Members** can create keys for read/write operations
- **Viewers** can only create keys with read scopes

## Security Best Practices

### Storage

✅ **DO:**
- Store keys in environment variables
- Use secret management services (AWS Secrets Manager, HashiCorp Vault)
- Rotate keys regularly (every 90 days recommended)
- Use different keys for different environments

❌ **DON'T:**
- Hardcode keys in source code
- Commit keys to version control
- Share keys across multiple services
- Use the same key for development and production

### Key Management

1. **Name keys descriptively**: Include purpose and environment
   - ✅ `production-backend-api`
   - ✅ `staging-ci-cd-runner`
   - ❌ `my-key`

2. **Set expiration dates**: Especially for temporary access
   - CI/CD keys: 90 days
   - Development keys: 30 days
   - Production keys: 180 days with auto-renewal

3. **Use minimal scopes**: Only grant necessary permissions
   - Read-only services: `read:*` scopes only
   - Execution services: `read:projects`, `write:executions`
   - Admin tools: All scopes

4. **Monitor usage**: Review API key activity regularly
   - Check for unusual patterns
   - Revoke unused keys
   - Audit access logs

### Revocation

Immediately revoke a key if:
- It's been compromised or leaked
- The service using it is decommissioned
- Team member with access leaves
- Key reaches expiration date

To revoke:
1. Go to **Dashboard → API Keys**
2. Find the key to revoke
3. Click **"Revoke"**
4. Confirm revocation

## Error Handling

### Common Error Codes

| Status | Error Code | Description | Solution |
|--------|-----------|-------------|----------|
| 401 | `UNAUTHORIZED` | Invalid or expired key | Check key format, verify not expired |
| 403 | `FORBIDDEN` | Insufficient scopes | Request key with required scopes |
| 402 | `QUOTA_EXCEEDED` | Quota limit reached | Upgrade plan or wait for reset |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests | Implement exponential backoff |

### Example Error Response

```json
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN",
  "requiredScopes": ["write:projects"],
  "providedScopes": ["read:projects"],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Rate Limiting

API keys are subject to rate limits based on your organization's plan:

| Plan | Requests/Minute | Requests/Day |
|------|----------------|--------------|
| Free | 60 | 1,000 |
| Pro | 600 | 50,000 |
| Enterprise | Custom | Custom |

### Handling Rate Limits

Implement exponential backoff:

```typescript
async function makeRequestWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
    }
  }
}
```

## Webhook Alternative

For real-time updates, consider using webhooks instead of polling:
- More efficient than repeated API calls
- Lower latency for event-driven workflows
- Doesn't count toward rate limits

See webhook documentation for setup instructions.

## Support

- API Reference: [api-docs.example.com](https://api-docs.example.com)
- Support: [support@example.com](mailto:support@example.com)
- Report Security Issue: [security@example.com](mailto:security@example.com)
