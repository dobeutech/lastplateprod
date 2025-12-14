# Security Best Practices - Restaurant Management System

## Overview

This document outlines security considerations and best practices for deploying and maintaining the Restaurant Management System in production.

## Critical Security Issues 🔴

### 1. Authentication System (MUST FIX)

**Current State**: The application uses demo authentication that accepts any password. This is **COMPLETELY INSECURE** and must be replaced before production deployment.

**Required Changes**:

```typescript
// Current (INSECURE - Demo only):
const login = async (username: string, password: string): Promise<boolean> => {
  const foundUser = users?.find((u) => u.username === username);
  if (foundUser) {
    return true; // ❌ Accepts any password!
  }
  return false;
};

// Required for Production:
const login = async (username: string, password: string): Promise<boolean> => {
  // 1. Rate limiting check
  if (await isRateLimited(username)) {
    throw new Error('Too many login attempts. Please try again later.');
  }

  // 2. Validate credentials against backend
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  // 3. Server validates against hashed password
  if (response.ok) {
    const { token, user } = await response.json();
    // 4. Store JWT token securely
    secureStorage.setToken(token);
    return true;
  }

  // 5. Track failed attempts
  await recordFailedAttempt(username);
  return false;
};
```

**Implementation Checklist**:
- [ ] Create backend authentication API
- [ ] Implement password hashing with bcrypt (cost factor 12+)
- [ ] Add rate limiting (max 10 attempts per 15 minutes per IP/username)
- [ ] Implement account lockout after 5 failed attempts
- [ ] Add JWT token generation and validation
- [ ] Implement secure session management
- [ ] Add password reset flow with email verification
- [ ] Implement 2FA/MFA (recommended)

### 2. Data Persistence (MUST FIX)

**Current State**: Data is stored in browser IndexedDB, which is:
- Not suitable for multi-user access
- Can be lost when browser cache is cleared
- Not secure for sensitive data
- Cannot be backed up reliably

**Required Changes**:
- [ ] Implement PostgreSQL or MySQL database
- [ ] Create secure API layer
- [ ] Implement proper access controls
- [ ] Set up automated backups
- [ ] Encrypt sensitive data at rest

### 3. Session Management (MUST FIX)

**Required Implementation**:
- [ ] Use httpOnly, secure, SameSite cookies for tokens
- [ ] Implement session timeout (recommended: 1 hour)
- [ ] Add token refresh mechanism
- [ ] Clear sessions on logout
- [ ] Implement concurrent session detection
- [ ] Add "Force logout all devices" feature

## Security Headers

### Required HTTP Headers

Configure your web server (nginx/Apache) or hosting platform to send these headers:

```nginx
# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Enable XSS protection
add_header X-XSS-Protection "1; mode=block" always;

# Control referrer information
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.yourrestaurant.com; frame-ancestors 'self';" always;

# HTTP Strict Transport Security
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Permissions Policy
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

## Input Validation & Sanitization

### Frontend Validation

**Current State**: Basic HTML5 validation only

**Required Additions**:

```typescript
// Add Zod schema validation for all forms
import { z } from 'zod';

const inventoryItemSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Invalid characters'),
  currentStock: z.number()
    .int('Must be whole number')
    .min(0, 'Cannot be negative')
    .max(999999, 'Value too large'),
  costPerUnit: z.number()
    .min(0, 'Cannot be negative')
    .max(99999.99, 'Value too large'),
  // ... other fields
});

// Validate before submission
try {
  inventoryItemSchema.parse(formData);
  // Submit to API
} catch (error) {
  // Display validation errors
}
```

### Backend Validation (When Implemented)

**Critical**: Never trust client-side validation alone. Always validate on the server.

```typescript
// Example Express.js validation middleware
const validateInventoryItem = (req, res, next) => {
  try {
    inventoryItemSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};

app.post('/api/inventory', authenticate, authorize, validateInventoryItem, createItem);
```

## SQL Injection Prevention

**When implementing backend database**:

✅ **DO**: Use parameterized queries
```typescript
// Safe - parameterized query
const result = await db.query(
  'SELECT * FROM inventory WHERE location_id = $1 AND name = $2',
  [locationId, name]
);
```

❌ **DON'T**: Concatenate user input into queries
```typescript
// UNSAFE - vulnerable to SQL injection
const result = await db.query(
  `SELECT * FROM inventory WHERE location_id = ${locationId} AND name = '${name}'`
);
```

## XSS Prevention

### Current Protections
- React automatically escapes JSX content ✅
- Using dangerouslySetInnerHTML is avoided ✅

### Additional Measures Needed
- [ ] Sanitize any HTML content if rich text is added
- [ ] Validate URLs before rendering links
- [ ] Use DOMPurify library for user-generated content

## CSRF Protection

**When backend is implemented**:

```typescript
// Server-side CSRF token generation
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Client-side token inclusion
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCsrfToken()
  },
  body: JSON.stringify(data)
});
```

## API Security

### Authentication
```typescript
// Verify JWT on every request
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

### Authorization
```typescript
// Check user permissions
const authorize = (requiredPermission) => {
  return (req, res, next) => {
    const user = req.user;
    const permissions = getRolePermissions(user.role);
    
    if (!permissions[requiredPermission]) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Use in routes
app.post('/api/inventory', 
  authenticateToken, 
  authorize('canEditInventory'), 
  createInventoryItem
);
```

### Rate Limiting
```typescript
const rateLimit = require('express-rate-limit');

// Login endpoint rate limit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per window
  message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', loginLimiter, login);

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // max 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
```

## Data Encryption

### In Transit
- [ ] Enforce HTTPS for all connections
- [ ] Use TLS 1.3 (minimum TLS 1.2)
- [ ] Configure strong cipher suites
- [ ] Implement certificate pinning (mobile apps)

### At Rest
```sql
-- Encrypt sensitive columns in database
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
  email VARCHAR(255) NOT NULL,
  -- Use pgcrypto for sensitive data
  social_security_number BYTEA -- encrypted with pgp_sym_encrypt
);

-- Encrypt before storing
INSERT INTO users (id, social_security_number)
VALUES (uuid_generate_v4(), pgp_sym_encrypt('123-45-6789', :encryption_key));

-- Decrypt when reading
SELECT pgp_sym_decrypt(social_security_number, :encryption_key) FROM users;
```

## Secrets Management

### ❌ DON'T Store Secrets In Code
```typescript
// NEVER do this
const API_KEY = 'sk_live_12345abcdef'; // ❌ Hardcoded secret
const DB_PASSWORD = 'mypassword123'; // ❌ Hardcoded password
```

### ✅ DO Use Environment Variables
```typescript
// Use environment variables
const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;

// Validate required secrets on startup
if (!API_KEY || !DB_PASSWORD) {
  throw new Error('Required secrets not configured');
}
```

### ✅ DO Use Secrets Management Service
- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- Google Secret Manager

## Password Policy

**Implement strong password requirements**:

```typescript
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

// Check against common passwords
const isCommonPassword = (password: string): boolean => {
  const commonPasswords = ['password123', 'qwerty123', /* ... */];
  return commonPasswords.includes(password.toLowerCase());
};

// Implement password history (prevent reuse of last 5 passwords)
const hasUsedPasswordBefore = async (userId: string, password: string): Promise<boolean> => {
  const history = await getPasswordHistory(userId, 5);
  for (const oldHash of history) {
    if (await bcrypt.compare(password, oldHash)) {
      return true;
    }
  }
  return false;
};
```

## Audit Logging

**Track security-relevant events**:

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId: string;
  result: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  details?: any;
}

// Log critical actions
const auditLog = async (log: AuditLog) => {
  await db.auditLogs.create(log);
  
  // Alert on suspicious activity
  if (log.action === 'login' && log.result === 'failure') {
    await checkForBruteForce(log.userId, log.ipAddress);
  }
};

// Usage
await auditLog({
  id: generateId(),
  timestamp: new Date(),
  userId: user.id,
  username: user.username,
  action: 'order_approved',
  resource: 'purchase_order',
  resourceId: order.id,
  result: 'success',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

## Dependency Security

### Automated Scanning

```json
// package.json scripts
{
  "scripts": {
    "security:audit": "npm audit",
    "security:check": "npm audit --audit-level=moderate",
    "security:fix": "npm audit fix"
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Regular Updates
- [ ] Enable Dependabot for automated dependency updates
- [ ] Review and merge security updates within 48 hours
- [ ] Test updates in staging before production
- [ ] Subscribe to security advisories for key dependencies

## Compliance Considerations

### GDPR (If serving EU users)
- [ ] Obtain explicit consent for data collection
- [ ] Implement right to access (data export)
- [ ] Implement right to deletion (account deletion)
- [ ] Implement right to rectification (data correction)
- [ ] Provide privacy policy
- [ ] Appoint Data Protection Officer (if required)
- [ ] Implement data breach notification procedures

### PCI DSS (If handling payment cards)
- [ ] Never store full credit card numbers
- [ ] Use tokenization for payment processing
- [ ] Implement secure payment gateway
- [ ] Regular security assessments
- [ ] Network segmentation

### SOC 2 (For enterprise customers)
- [ ] Implement comprehensive audit logging
- [ ] Define and document security policies
- [ ] Regular security assessments
- [ ] Incident response procedures
- [ ] Business continuity planning

## Incident Response Plan

### Detection
- Monitor for unusual activity patterns
- Set up automated alerts
- Review logs regularly
- Subscribe to security mailing lists

### Response
1. **Identify**: Confirm and classify the incident
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove the threat
4. **Recover**: Restore systems to normal operation
5. **Review**: Conduct post-incident analysis

### Communication
- Designate incident response team
- Define escalation procedures
- Prepare notification templates
- Maintain contact list

## Security Testing Schedule

### Continuous
- Automated dependency scanning (CI/CD)
- Static code analysis (linters, CodeQL)

### Weekly
- Review security logs
- Check for failed authentication attempts
- Monitor error rates

### Monthly
- Manual security review
- Update dependencies
- Review access controls

### Quarterly
- Penetration testing
- Security audit
- Disaster recovery test
- Security training for team

### Annually
- Third-party security assessment
- Policy review and update
- Compliance audit

## Security Contacts

- **Security Issues**: opensource-security@github.com
- **Incident Response**: [TO BE DEFINED]
- **Security Team Lead**: [TO BE DEFINED]

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Last Updated**: 2025-10-27  
**Version**: 1.0  
**Review Frequency**: Quarterly
