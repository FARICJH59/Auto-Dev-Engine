# Backend Integration Guide

How to integrate your backend service with the QGPS Control Plane's authentication and organization context.

## Overview

The frontend (Next.js) handles authentication via Clerk and passes organization context to your backend via HTTP headers. Your backend should:
1. Read organization context from headers
2. Trust these headers (they're set by your own middleware)
3. Use organization ID for all database queries
4. Implement proper error handling

## Architecture

```
User → Frontend (Next.js) → Middleware → API Routes → Your Backend
                              ↓
                         (Injects Headers)
```

## Reading Organization Context

### Headers Provided

The frontend automatically injects these headers for authenticated requests:

| Header | Example Value | Description |
|--------|---------------|-------------|
| `X-Organization-ID` | `org_abc123` | Clerk organization ID |
| `X-User-ID` | `user_xyz789` | Clerk user ID |
| `X-Clerk-Org-Role` | `org:admin` | User's role in organization |
| `Authorization` | `Bearer token...` | Clerk session token (optional) |

### Go Example

```go
package main

import (
    "net/http"
    "database/sql"
)

// Middleware to extract organization context
func orgContextMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        orgID := r.Header.Get("X-Organization-ID")
        userID := r.Header.Get("X-User-ID")
        role := r.Header.Get("X-Clerk-Org-Role")
        
        if orgID == "" {
            http.Error(w, "Missing organization context", http.StatusUnauthorized)
            return
        }
        
        // Add to request context
        ctx := context.WithValue(r.Context(), "orgID", orgID)
        ctx = context.WithValue(ctx, "userID", userID)
        ctx = context.WithValue(ctx, "role", role)
        
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// Example handler
func getProjectsHandler(w http.ResponseWriter, r *http.Request) {
    orgID := r.Context().Value("orgID").(string)
    
    // Query with org filter
    rows, err := db.Query(
        "SELECT id, name, description FROM projects WHERE org_id = ?",
        orgID,
    )
    if err != nil {
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }
    defer rows.Close()
    
    // Process results...
    json.NewEncoder(w).Encode(projects)
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/projects", getProjectsHandler)
    
    // Apply middleware
    handler := orgContextMiddleware(mux)
    http.ListenAndServe(":8080", handler)
}
```

### Python (Flask) Example

```python
from flask import Flask, request, jsonify, g
from functools import wraps
import psycopg2

app = Flask(__name__)

# Middleware to extract organization context
def require_org_context(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        g.org_id = request.headers.get('X-Organization-ID')
        g.user_id = request.headers.get('X-User-ID')
        g.role = request.headers.get('X-Clerk-Org-Role')
        
        if not g.org_id:
            return jsonify({'error': 'Missing organization context'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

# Example endpoint
@app.route('/projects', methods=['GET'])
@require_org_context
def get_projects():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Query with org filter
    cursor.execute(
        "SELECT id, name, description FROM projects WHERE org_id = %s",
        (g.org_id,)
    )
    
    projects = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return jsonify({
        'projects': [dict(row) for row in projects],
        'orgId': g.org_id
    })

# Create project endpoint with role check
@app.route('/projects', methods=['POST'])
@require_org_context
def create_project():
    # Check permissions
    if g.role == 'org:viewer':
        return jsonify({'error': 'Insufficient permissions'}), 403
    
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({'error': 'Project name required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Insert with org context
    cursor.execute(
        """
        INSERT INTO projects (id, org_id, name, created_by)
        VALUES (gen_random_uuid(), %s, %s, %s)
        RETURNING id, name, org_id, created_at
        """,
        (g.org_id, name, g.user_id)
    )
    
    project = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify(dict(project)), 201

if __name__ == '__main__':
    app.run(port=8080)
```

### Node.js (Express) Example

```typescript
import express from 'express';
import { Pool } from 'pg';

const app = express();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Middleware to extract organization context
app.use((req, res, next) => {
  req.orgId = req.headers['x-organization-id'];
  req.userId = req.headers['x-user-id'];
  req.role = req.headers['x-clerk-org-role'];
  
  if (!req.orgId) {
    return res.status(401).json({ error: 'Missing organization context' });
  }
  
  next();
});

// Get projects
app.get('/projects', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, description FROM projects WHERE org_id = $1',
      [req.orgId]
    );
    
    res.json({
      projects: result.rows,
      orgId: req.orgId,
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Create project
app.post('/projects', async (req, res) => {
  // Check permissions
  if (req.role === 'org:viewer') {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Project name required' });
  }
  
  try {
    const result = await db.query(
      `INSERT INTO projects (id, org_id, name, description, created_by)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING *`,
      [req.orgId, name, description, req.userId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.listen(8080, () => {
  console.log('Backend listening on port 8080');
});
```

## Database Query Patterns

### Always Include org_id

❌ **Wrong:**
```sql
SELECT * FROM projects WHERE id = ?
```

✅ **Correct:**
```sql
SELECT * FROM projects WHERE id = ? AND org_id = ?
```

### Joins with org_id

```sql
SELECT 
  p.id,
  p.name,
  e.status
FROM projects p
INNER JOIN executions e ON e.project_id = p.id
WHERE p.org_id = ? AND e.org_id = ?
```

### Aggregations

```sql
SELECT 
  COUNT(*) as total_projects,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects
FROM projects
WHERE org_id = ?
```

## Permission Checks

### Role-Based Access Control

```go
func checkPermission(role string, requiredRole string) bool {
    roleHierarchy := map[string]int{
        "org:admin":  3,
        "org:member": 2,
        "org:viewer": 1,
    }
    
    return roleHierarchy[role] >= roleHierarchy[requiredRole]
}

func deleteProjectHandler(w http.ResponseWriter, r *http.Request) {
    role := r.Context().Value("role").(string)
    
    if !checkPermission(role, "org:admin") {
        http.Error(w, "Admin access required", http.StatusForbidden)
        return
    }
    
    // Proceed with deletion...
}
```

### Action-Based Permissions

```python
PERMISSIONS = {
    'org:admin': ['read', 'write', 'delete', 'manage'],
    'org:member': ['read', 'write'],
    'org:viewer': ['read'],
}

def check_permission(role, action):
    return action in PERMISSIONS.get(role, [])

@app.route('/projects/<project_id>', methods=['DELETE'])
@require_org_context
def delete_project(project_id):
    if not check_permission(g.role, 'delete'):
        return jsonify({'error': 'Insufficient permissions'}), 403
    
    # Proceed with deletion...
```

## Error Handling

### Standard Error Responses

```typescript
// 401 Unauthorized - Missing auth
{
  "error": "Missing organization context",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-01-01T12:00:00Z"
}

// 403 Forbidden - Insufficient permissions
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN",
  "requiredRole": "org:admin",
  "userRole": "org:member",
  "timestamp": "2024-01-01T12:00:00Z"
}

// 402 Payment Required - Quota exceeded
{
  "error": "Monthly execution quota exceeded",
  "code": "QUOTA_EXCEEDED",
  "orgId": "org_abc123",
  "used": 1050,
  "limit": 1000,
  "timestamp": "2024-01-01T12:00:00Z"
}

// 404 Not Found - Resource not found or not in org
{
  "error": "Project not found",
  "code": "NOT_FOUND",
  "resourceId": "proj_123",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Quota Enforcement

```go
func checkQuota(orgID string, quotaType string) (bool, error) {
    var used, limit int
    
    err := db.QueryRow(
        "SELECT executions_used, executions_limit FROM organization_quotas WHERE org_id = ?",
        orgID,
    ).Scan(&used, &limit)
    
    if err != nil {
        return false, err
    }
    
    return used < limit, nil
}

func createExecutionHandler(w http.ResponseWriter, r *http.Request) {
    orgID := r.Context().Value("orgID").(string)
    
    // Check quota
    hasQuota, err := checkQuota(orgID, "executions")
    if err != nil {
        http.Error(w, "Failed to check quota", http.StatusInternalServerError)
        return
    }
    
    if !hasQuota {
        w.WriteHeader(http.StatusPaymentRequired)
        json.NewEncoder(w).Encode(map[string]interface{}{
            "error": "Execution quota exceeded",
            "code": "QUOTA_EXCEEDED",
            "orgId": orgID,
        })
        return
    }
    
    // Proceed with execution creation...
    
    // Increment quota usage
    db.Exec("UPDATE organization_quotas SET executions_used = executions_used + 1 WHERE org_id = ?", orgID)
}
```

## Health Check Endpoint

Implement a health check that the frontend can verify:

```go
func healthHandler(w http.ResponseWriter, r *http.Request) {
    // Check database connection
    err := db.Ping()
    
    status := "healthy"
    statusCode := http.StatusOK
    
    if err != nil {
        status = "unhealthy"
        statusCode = http.StatusServiceUnavailable
    }
    
    w.WriteHeader(statusCode)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "status": status,
        "timestamp": time.Now().Format(time.RFC3339),
        "version": "1.0.0",
        "database": err == nil,
    })
}
```

## Testing

### Unit Tests

```python
import pytest
from unittest.mock import Mock, patch

def test_get_projects_requires_org_context():
    """Test that projects endpoint requires organization context"""
    with app.test_client() as client:
        # Request without org header
        response = client.get('/projects')
        assert response.status_code == 401
        assert 'Missing organization context' in response.json['error']

def test_get_projects_returns_org_data_only():
    """Test that projects are filtered by organization"""
    with app.test_client() as client:
        # Request with org header
        response = client.get('/projects', headers={
            'X-Organization-ID': 'org_test123',
            'X-User-ID': 'user_test456',
        })
        
        assert response.status_code == 200
        projects = response.json['projects']
        # Verify all projects belong to the organization
        assert all(p['orgId'] == 'org_test123' for p in projects)
```

### Integration Tests

```bash
#!/bin/bash

# Test health endpoint (public)
curl -X GET http://localhost:8080/health

# Test authenticated endpoint
curl -X GET http://localhost:8080/projects \
  -H "X-Organization-ID: org_test123" \
  -H "X-User-ID: user_test456" \
  -H "X-Clerk-Org-Role: org:admin"

# Test permission denied
curl -X DELETE http://localhost:8080/projects/proj_123 \
  -H "X-Organization-ID: org_test123" \
  -H "X-User-ID: user_test456" \
  -H "X-Clerk-Org-Role: org:viewer"  # Should return 403
```

## Security Considerations

1. **Trust but verify**: Headers come from your own middleware, but validate org_id exists in database
2. **Use HTTPS**: Always use TLS in production for header security
3. **Implement rate limiting**: Prevent abuse per organization
4. **Log suspicious activity**: Monitor for cross-org access attempts
5. **Validate input**: Never trust user input, even from authenticated users
6. **Use prepared statements**: Prevent SQL injection

## Deployment

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/qgps

# Server
PORT=8080
LOG_LEVEL=info

# Optional: Direct Clerk validation (if not trusting headers)
CLERK_SECRET_KEY=sk_test_...
```

### Docker Example

```dockerfile
FROM golang:1.21-alpine

WORKDIR /app
COPY . .

RUN go build -o server .

EXPOSE 8080
CMD ["./server"]
```

## Support

- Backend Examples: [github.com/qgps/backend-examples](https://github.com/qgps/backend-examples)
- API Documentation: [api-docs.example.com](https://api-docs.example.com)
- Support: [support@example.com](mailto:support@example.com)
