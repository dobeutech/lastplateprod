# System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [API Reference](#api-reference)
5. [Configuration](#configuration)
6. [Development](#development)
7. [Deployment](#deployment)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

---

## Overview

**Project:** lastplateprod  
**Type:** Restaurant Management System  
**Stack:** React + TypeScript + Supabase  
**Status:** Production Ready

### Purpose

A comprehensive restaurant management system with:
- Inventory management
- Purchase order tracking
- Vendor management
- Multi-location support
- ESG reporting
- Knowledge base

---

## Architecture

See [ARCHITECTURE.md](../ARCHITECTURE.md) for visual diagrams.

### Technology Stack

**Frontend:**
- React 19.0.0
- TypeScript 5.7.2
- Vite 6.3.5
- TailwindCSS 4.1.11
- Radix UI components

**Backend:**
- Supabase (Auth + Database)
- PostgreSQL (via Supabase)

**Infrastructure:**
- Docker
- Nginx
- GitHub Actions

**Monitoring:**
- Sentry (error tracking)
- Custom health checks
- Structured logging

---

## Components

### Core Services

#### Authentication (`src/lib/auth-context.tsx`)

Manages user authentication and authorization.

**Features:**
- Supabase Auth integration
- Session management
- Role-based permissions
- Rate limiting

**Usage:**
```typescript
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  const handleLogin = async () => {
    const success = await login('user@example.com', 'password');
  };
}
```

#### Rate Limiter (`src/lib/rate-limiter.ts`)

Prevents abuse through rate limiting.

**Limits:**
- Login: 5 attempts per 15 minutes
- API: 100 requests per minute
- Password reset: 3 attempts per hour

**Usage:**
```typescript
import { loginRateLimiter, getClientIdentifier } from '@/lib/rate-limiter';

const clientId = getClientIdentifier();
const check = loginRateLimiter.check(clientId);

if (!check.allowed) {
  throw new Error('Rate limit exceeded');
}
```

#### Logger (`src/lib/logger.ts`)

Structured logging with multiple levels.

**Levels:** debug, info, warn, error

**Usage:**
```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId: '123' });
logger.error('Failed to save', error, { component: 'Inventory' });
logger.audit('Role changed', { userId: '123', newRole: 'admin' });
```

#### Error Monitor (`src/lib/monitoring.ts`)

Sentry integration for error tracking.

**Usage:**
```typescript
import { captureError, setUser } from '@/lib/monitoring';

try {
  // operation
} catch (error) {
  captureError(error, {
    user: { id: '123', email: 'user@example.com', role: 'admin' },
    tags: { feature: 'inventory' }
  });
}
```

#### Session Manager (`src/lib/session-manager.ts`)

Automatic session timeout and management.

**Features:**
- 1-hour timeout (production)
- Activity tracking
- Expiry warnings
- Automatic cleanup

**Events:**
```typescript
window.addEventListener('session-warning', (e) => {
  console.log(`Session expires in ${e.detail.minutesLeft} minutes`);
});

window.addEventListener('session-expired', () => {
  // Handle logout
});
```

#### API Client (`src/lib/api-client.ts`)

Centralized API request handling.

**Features:**
- Automatic auth headers
- Timeout handling
- Retry logic
- Error handling

**Usage:**
```typescript
import { apiClient } from '@/lib/api-client';

const users = await apiClient.get<User[]>('/users');
const newItem = await apiClient.post('/inventory', { name: 'Item' });
```

#### Health Monitor (`src/lib/health-check.ts`)

System health monitoring.

**Checks:**
- Database connectivity
- Auth service
- Storage availability

**Usage:**
```typescript
import { healthMonitor } from '@/lib/health-check';

const status = await healthMonitor.checkHealth();
// Browser console: __healthCheck()
```

---

## API Reference

### Authentication API

#### Login
```typescript
const success = await login(email: string, password: string): Promise<boolean>
```

#### Logout
```typescript
await logout(): Promise<void>
```

#### Get Current User
```typescript
const { user, isAuthenticated } = useAuth();
```

### Rate Limiting API

#### Check Rate Limit
```typescript
const check = rateLimiter.check(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}
```

#### Reset Rate Limit
```typescript
rateLimiter.reset(identifier: string): void
```

### Logging API

#### Log Messages
```typescript
logger.debug(message: string, context?: LogContext)
logger.info(message: string, context?: LogContext)
logger.warn(message: string, context?: LogContext)
logger.error(message: string, error?: Error, context?: LogContext)
```

#### Audit Logging
```typescript
logger.audit(action: string, context: LogContext)
```

#### Performance Logging
```typescript
logger.performance(operation: string, durationMs: number, context?: LogContext)
```

### Monitoring API

#### Capture Error
```typescript
captureError(error: Error, context?: ErrorContext)
```

#### Capture Message
```typescript
captureMessage(message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext)
```

#### Set User Context
```typescript
setUser(user: { id: string; email: string; role: string } | null)
```

### Health Check API

#### Check Health
```typescript
const status = await healthMonitor.checkHealth(): Promise<HealthStatus>
```

#### Get Last Check
```typescript
const lastCheck = healthMonitor.getLastHealthCheck(): HealthStatus | null
```

---

## Configuration

### Environment Variables

**Required:**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**Optional:**
```bash
VITE_INTERCOM_APP_ID=your_intercom_app_id
VITE_ENABLE_DEMO_MODE=false
VITE_APP_NAME=Restaurant Management System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AUDIT_LOG=true
```

### Feature Flags

```typescript
import { features } from '@/lib/config';

if (features.multiLocation) {
  // Show multi-location features
}

if (features.advancedAnalytics) {
  // Show advanced analytics
}
```

---

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/dobeutech/lastplateprod.git
cd lastplateprod

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run optimize     # Optimize dependencies
```

### Testing

#### Manual Testing
```javascript
// In browser console
__testAuth()      // Test authentication
__healthCheck()   // Test health monitoring
```

#### Component Testing
```typescript
import { authTester } from '@/lib/__tests__/auth.test';

const results = await authTester.runAllTests();
authTester.printResults();
```

### Code Style

- Use TypeScript for type safety
- Follow existing patterns
- Use functional components with hooks
- Implement error boundaries
- Add proper error handling
- Include logging for important operations

---

## Deployment

### Docker Deployment

```bash
# Build image
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  --build-arg VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
  -t lastplateprod:latest .

# Run container
docker run -d -p 8080:8080 --name lastplateprod lastplateprod:latest

# Check health
curl http://localhost:8080/health
```

### GitHub Actions

Automatic deployment on push to `main`:

1. Runs CI pipeline (lint, test, build)
2. Builds Docker image
3. Scans for vulnerabilities
4. Pushes to GitHub Container Registry
5. Generates SBOM

### Manual Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions.

---

## Monitoring

### Error Monitoring

**Sentry Dashboard:**
- View errors in real-time
- Track error trends
- Set up alerts
- View session replays

**Access:** https://sentry.io/organizations/your-org/projects/

### Health Monitoring

**Endpoints:**
- `/health` - Health check endpoint
- Browser console: `__healthCheck()`

**Metrics:**
- Database response time
- Auth service status
- Storage availability
- Overall system status

### Logging

**Log Levels:**
- Debug: Development only
- Info: General information
- Warn: Warnings and degraded performance
- Error: Errors and exceptions

**Audit Logs:**
- User authentication
- Role changes
- Permission changes
- Data modifications

### Performance Monitoring

**Tracked Metrics:**
- API response times
- Database query times
- Page load times
- Component render times

---

## Troubleshooting

### Common Issues

#### "VITE_SUPABASE_URL is required"

**Cause:** Environment variable not set  
**Solution:**
```bash
export VITE_SUPABASE_URL=https://your-project.supabase.co
export VITE_SUPABASE_ANON_KEY=your_key
npm run build
```

#### "Too many login attempts"

**Cause:** Rate limiter triggered  
**Solution:** Wait 15-30 minutes or reset:
```typescript
import { loginRateLimiter, getClientIdentifier } from '@/lib/rate-limiter';
loginRateLimiter.reset(getClientIdentifier());
```

#### "Session expired"

**Cause:** User inactive for > 1 hour  
**Solution:** This is expected behavior. User needs to log in again.

#### Sentry not capturing errors

**Cause:** VITE_SENTRY_DSN not set or invalid  
**Solution:**
1. Check environment variable is set
2. Verify DSN is correct
3. Check Sentry project is active
4. Check browser console for Sentry init messages

#### Docker build fails

**Cause:** Missing build arguments  
**Solution:**
```bash
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  -t lastplateprod:latest .
```

#### Health check fails

**Cause:** Database or auth service unavailable  
**Solution:**
1. Check Supabase status
2. Verify credentials are correct
3. Check network connectivity
4. Review error logs

### Debug Mode

Enable debug logging:
```typescript
// In development, debug logs are enabled by default
// To enable in production (not recommended):
localStorage.setItem('debug', 'true');
```

### Getting Help

1. Check documentation in `/docs`
2. Review error logs in Sentry
3. Check health monitoring status
4. Review audit logs
5. Create GitHub issue

---

## Security

### Best Practices

1. **Never commit secrets** - Use environment variables
2. **Rotate credentials regularly** - Every 90 days
3. **Monitor audit logs** - Review weekly
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Review Sentry errors** - Daily in production

### Security Features

- ✅ Supabase Auth (industry-standard)
- ✅ Rate limiting (prevents brute force)
- ✅ Session timeout (1 hour)
- ✅ Audit logging (compliance)
- ✅ Error monitoring (security incidents)
- ✅ Security headers (CSP, X-Frame-Options, etc.)

### Incident Response

1. **Identify** - Monitor alerts and logs
2. **Contain** - Disable affected features
3. **Investigate** - Review logs and errors
4. **Remediate** - Fix vulnerability
5. **Document** - Create post-mortem

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates
- Check application uptime
- Review security alerts

**Weekly:**
- Review performance metrics
- Check dependency updates
- Analyze user feedback

**Monthly:**
- Security audit
- Dependency updates
- Performance optimization review
- Backup restoration test

### Backup Strategy

**Supabase:**
- Automatic daily backups
- Point-in-time recovery
- Manual backup before major changes

**Configuration:**
- Store in version control
- Document changes
- Test restoration process

---

## Resources

### Documentation
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture
- [PRODUCTION_READY_SUMMARY.md](../PRODUCTION_READY_SUMMARY.md) - Production overview
- [PRODUCTION_FEATURES_IMPLEMENTED.md](../PRODUCTION_FEATURES_IMPLEMENTED.md) - Feature docs
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment guide

### External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Sentry Documentation](https://docs.sentry.io)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Last Updated:** 2025-12-14  
**Version:** 2.0.0  
**Maintainer:** Development Team
