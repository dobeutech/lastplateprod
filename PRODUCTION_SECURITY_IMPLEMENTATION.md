# Production Security Implementation

## ✅ Completed Security Improvements

### 1. Environment Variable Security
- **Removed hardcoded Supabase credentials** from `src/lib/supabase.ts`
- **Created `src/lib/config.ts`** with validation logic
- **Updated `.env.example`** with all required variables
- **Implemented runtime validation** that fails fast on missing/invalid config

### 2. Docker Production Configuration
- **Created `Dockerfile`** with multi-stage build
  - Builder stage: Compiles application with environment variables
  - Production stage: Minimal nginx:alpine image
  - Non-root user execution
  - Health check endpoint
  - Security updates applied
  
- **Created `nginx.conf`** with security headers
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection enabled
  - Content Security Policy configured
  - Compression enabled
  - Static asset caching
  - SPA routing support

- **Created `.dockerignore`** to exclude unnecessary files from image

### 3. CI/CD Pipeline
- **Created `.github/workflows/ci.yml`**
  - Security scanning with Trivy
  - Dependency audit
  - Linting and type checking
  - Build validation
  - Artifact upload

- **Created `.github/workflows/docker.yml`**
  - Multi-platform Docker builds
  - GitHub Container Registry integration
  - Image vulnerability scanning
  - SBOM generation
  - Automated tagging (branch, SHA, semver)

### 4. Validation Scripts
- **Created `scripts/validate-docker.sh`** for local testing

---

## 🔴 Critical: Still Required Before Production

### 1. Replace Demo Authentication
**Current State:** Authentication accepts any password
**Required Actions:**
```typescript
// src/lib/auth-context.tsx - MUST BE REPLACED
// Current: const login = async (username: string, _password: string)
// This accepts ANY password!

// Option A: Use Supabase Auth
import { supabase } from './supabase';

const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data.session !== null;
};

// Option B: Implement custom backend authentication
// - Hash passwords with bcrypt/argon2
// - Implement rate limiting
// - Add account lockout
// - Use JWT tokens
```

### 2. Set Up GitHub Secrets
Navigate to: `Settings > Secrets and variables > Actions`

Add the following secrets:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
VITE_INTERCOM_APP_ID=your_intercom_app_id (optional)
```

### 3. Configure Production Environment
Create `.env.production` (DO NOT COMMIT):
```bash
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_INTERCOM_APP_ID=your_production_intercom_id
VITE_ENABLE_DEMO_MODE=false
VITE_APP_NAME=Restaurant Management System
VITE_APP_VERSION=1.0.0
```

### 4. Implement Rate Limiting
Add to your hosting platform or reverse proxy:
- Login attempts: 5 per 15 minutes per IP
- API requests: 100 per minute per user
- Failed auth: Account lockout after 5 attempts

### 5. Set Up Monitoring
**Required Services:**
- Error tracking: Sentry, Rollbar, or similar
- Uptime monitoring: UptimeRobot, Pingdom
- Performance: Lighthouse CI, Web Vitals
- Security: Snyk, Dependabot (already configured)

**Implementation:**
```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}
```

### 6. Configure HTTPS and Domain
- Obtain SSL/TLS certificate (Let's Encrypt recommended)
- Configure DNS records
- Enable HSTS header in nginx.conf (currently commented out)
- Update CSP to match your domain

---

## 🚀 Deployment Instructions

### Option 1: Docker Deployment

#### Build Image
```bash
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  --build-arg VITE_ENABLE_DEMO_MODE=false \
  -t lastplateprod:latest .
```

#### Run Container
```bash
docker run -d \
  -p 8080:8080 \
  --name lastplateprod \
  --restart unless-stopped \
  lastplateprod:latest
```

#### Health Check
```bash
curl http://localhost:8080/health
```

### Option 2: GitHub Container Registry

#### Push to GHCR (automated via workflow)
```bash
# Workflow runs automatically on push to main
# Manual trigger:
gh workflow run docker.yml
```

#### Pull and Run
```bash
docker pull ghcr.io/dobeutech/lastplateprod:latest
docker run -d -p 8080:8080 ghcr.io/dobeutech/lastplateprod:latest
```

### Option 3: Static Hosting (Vercel/Netlify)

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Configure environment variables in Netlify dashboard
```

---

## 🧪 Testing Checklist

### Pre-Deployment Testing
- [ ] Build succeeds with production environment variables
- [ ] All environment variables are validated at startup
- [ ] No hardcoded credentials in source code
- [ ] Docker image builds successfully
- [ ] Container starts and health check passes
- [ ] Security headers are present in HTTP responses
- [ ] Static assets are cached correctly
- [ ] SPA routing works (refresh on any route)
- [ ] Authentication redirects work
- [ ] All features function correctly

### Security Testing
```bash
# 1. Scan for secrets
git secrets --scan

# 2. Dependency audit
npm audit --audit-level=moderate

# 3. Container vulnerability scan
docker run --rm -v $(pwd):/app aquasec/trivy fs /app

# 4. Image vulnerability scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image lastplateprod:latest

# 5. Check security headers
curl -I https://your-domain.com | grep -E "X-Frame|X-Content|CSP"
```

### Performance Testing
```bash
# 1. Build size check
npm run build
du -sh dist/

# 2. Lighthouse audit
npx lighthouse https://your-domain.com --view

# 3. Load testing (optional)
npx artillery quick --count 10 --num 100 https://your-domain.com
```

---

## 📊 Monitoring Setup

### 1. GitHub Security Alerts
- Already enabled via Dependabot
- Trivy scans run on every push
- SARIF results uploaded to Security tab

### 2. Application Monitoring
Add to `package.json`:
```json
{
  "dependencies": {
    "@sentry/react": "^7.x.x"
  }
}
```

### 3. Uptime Monitoring
Configure external service to check:
- `https://your-domain.com/health` every 5 minutes
- Alert on 3 consecutive failures
- Monitor response time < 1000ms

---

## 🔒 Security Best Practices

### Secrets Management
- ✅ Never commit `.env` files
- ✅ Use GitHub Secrets for CI/CD
- ✅ Rotate credentials regularly
- ✅ Use different credentials for dev/staging/prod
- ⚠️ Consider using a secrets manager (AWS Secrets Manager, HashiCorp Vault)

### Access Control
- ⚠️ Implement proper authentication (CRITICAL)
- ⚠️ Add role-based access control (RBAC)
- ⚠️ Implement session management
- ⚠️ Add audit logging

### Network Security
- ⚠️ Enable HTTPS only
- ⚠️ Configure firewall rules
- ⚠️ Use WAF (Web Application Firewall)
- ⚠️ Implement rate limiting

### Data Protection
- ⚠️ Encrypt sensitive data at rest
- ⚠️ Use secure session storage
- ⚠️ Implement data retention policies
- ⚠️ Add backup strategy

---

## 📝 Next Steps

### Immediate (This Week)
1. Set up GitHub Secrets for CI/CD
2. Test Docker build with real credentials
3. Deploy to staging environment
4. Implement real authentication
5. Set up error monitoring (Sentry)

### Short Term (This Month)
1. Configure production domain and HTTPS
2. Set up uptime monitoring
3. Implement rate limiting
4. Add comprehensive logging
5. Create backup strategy
6. Performance optimization

### Long Term (Next Quarter)
1. Implement Kubernetes deployment (if needed)
2. Set up blue-green deployments
3. Add automated performance testing
4. Implement advanced security features
5. Create disaster recovery plan

---

## 🆘 Troubleshooting

### Build Fails with "VITE_SUPABASE_URL is required"
**Solution:** Set environment variables before building
```bash
export VITE_SUPABASE_URL=https://your-project.supabase.co
export VITE_SUPABASE_ANON_KEY=your_key
npm run build
```

### Docker Container Exits Immediately
**Solution:** Check logs and ensure nginx config is valid
```bash
docker logs <container_id>
docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf nginx:alpine nginx -t
```

### Health Check Fails
**Solution:** Verify port and health endpoint
```bash
docker exec <container_id> curl http://localhost:8080/health
```

### CI/CD Pipeline Fails
**Solution:** Ensure GitHub Secrets are configured
- Go to Settings > Secrets and variables > Actions
- Add required secrets
- Re-run workflow

---

## 📚 Additional Resources

- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Nginx Security Headers](https://www.nginx.com/blog/hardening-nginx/)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [Supabase Security](https://supabase.com/docs/guides/auth/auth-helpers)

---

**Last Updated:** 2025-12-14
**Status:** ⚠️ NOT PRODUCTION READY - Authentication must be implemented
