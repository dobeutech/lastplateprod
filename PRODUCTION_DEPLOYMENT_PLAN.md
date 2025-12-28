# Production Deployment Plan - SavePlate Restaurant Management System

**Created**: 2025-12-28
**Status**: 🔴 NOT PRODUCTION-READY
**Current Phase**: Pre-Production / Staging Ready
**Version**: 2.0.0

---

## Executive Summary

The SavePlate Restaurant Management System is a well-architected SaaS application with a solid foundation. However, critical blockers must be addressed before production deployment.

### Current Assessment

| Category | Status | Notes |
|----------|--------|-------|
| **Code Quality** | ✅ Ready | Clean React 19 + TypeScript, professional architecture |
| **UI/UX** | ✅ Ready | Radix UI components, responsive design |
| **Database Schema** | ✅ Ready | Complete PostgreSQL schema with RLS |
| **Docker/CI/CD** | ✅ Ready | Multi-stage builds, GitHub Actions pipelines |
| **Documentation** | ✅ Ready | Comprehensive docs (60+ pages) |
| **Authentication** | 🔴 BLOCKER | Demo auth accepts any password |
| **GitHub Secrets** | 🔴 BLOCKER | Not configured in repository |
| **Testing** | 🔴 BLOCKER | Zero test coverage |
| **Monitoring** | 🟡 Pending | Sentry integration coded but not configured |
| **SSL/HTTPS** | 🟡 Pending | Needs certificate setup |

### Go/No-Go Decision

**Current Status**: 🔴 **NO-GO FOR PRODUCTION**

**Required for GO**: All Phase 1 critical blockers resolved

---

## Phase 1: Critical Blockers (1-2 Days)

### 1.1 Configure GitHub Repository Secrets

**Priority**: 🔴 CRITICAL
**Effort**: 30 minutes

Navigate to: `Repository → Settings → Secrets and variables → Actions`

Add the following secrets:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_INTERCOM_APP_ID=your_intercom_app_id (optional)
```

**Verification**:
```bash
# Trigger CI pipeline and verify build succeeds
git push origin main
# Check Actions tab for successful build
```

---

### 1.2 Set Up Supabase Project

**Priority**: 🔴 CRITICAL
**Effort**: 30 minutes

#### Step 1: Create Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Configure:
   - **Name**: saveplate-production
   - **Database Password**: [Generate strong password - SAVE THIS]
   - **Region**: Choose closest to your users
4. Wait ~2 minutes for provisioning

#### Step 2: Run Database Schema
1. Open Supabase SQL Editor
2. Copy contents from `database/schema.sql`
3. Execute the script
4. Verify all tables created:
   - `users`, `locations`, `inventory_items`
   - `vendors`, `vendor_categories`
   - `purchase_orders`, `purchase_order_items`
   - `esg_reports`, `kb_categories`, `kb_articles`
   - `audit_log`

#### Step 3: Configure Authentication
1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure:
   - Confirm email: ON
   - Secure email change: ON
   - Password minimum length: 12
4. Go to **Authentication → Email Templates**
5. Customize templates with branding

#### Step 4: Get API Credentials
1. Go to **Settings → API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

---

### 1.3 Fix Authentication Implementation

**Priority**: 🔴 CRITICAL
**Effort**: 2-4 hours

The current authentication in `src/lib/auth-context.tsx` uses demo mode. The codebase already has Supabase Auth integration ready, but needs verification.

#### Current State (Already Implemented):
- ✅ Supabase client configured (`src/lib/supabase.ts`)
- ✅ Auth context with login/logout (`src/lib/auth-context.tsx`)
- ✅ Rate limiting (5 attempts per 15 minutes)
- ✅ Session management (1-hour timeout in production)
- ✅ User profile fetching

#### Verification Steps:
```typescript
// Verify auth-context.tsx is using Supabase Auth
// Look for: supabase.auth.signInWithPassword()
// Ensure demo mode is disabled: VITE_ENABLE_DEMO_MODE=false
```

#### Environment Configuration:
```bash
# .env.production (set in hosting platform)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ENABLE_DEMO_MODE=false  # CRITICAL: Must be false
VITE_SENTRY_DSN=your_sentry_dsn
VITE_APP_VERSION=2.0.0
```

---

### 1.4 Set Up Error Monitoring (Sentry)

**Priority**: 🔴 CRITICAL
**Effort**: 30 minutes

#### Step 1: Create Sentry Project
1. Go to [https://sentry.io](https://sentry.io)
2. Create new project → Select "React"
3. Copy the DSN

#### Step 2: Configure
Add to GitHub Secrets:
```
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

The code is already configured in `src/lib/monitoring.ts`:
- Error capture with context
- User tracking
- Session replay

#### Step 3: Verify
After deployment, trigger a test error and verify it appears in Sentry dashboard.

---

## Phase 2: Pre-Deployment Checklist (1 Day)

### 2.1 Local Build Verification

```bash
# Clone and install
git clone https://github.com/dobeutech/lastplateprod.git
cd lastplateprod
npm install

# Set environment variables
cp .env.example .env
# Edit .env with production values

# Build and verify
npm run build
npm run lint

# Test Docker build
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  --build-arg VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
  --build-arg VITE_ENABLE_DEMO_MODE=false \
  -t saveplate:2.0.0 .

# Run locally
docker run -d -p 8080:8080 --name saveplate-test saveplate:2.0.0

# Verify health check
curl http://localhost:8080/health
# Expected: healthy

# Cleanup
docker stop saveplate-test && docker rm saveplate-test
```

### 2.2 Security Verification Checklist

- [ ] **Environment Variables**: All secrets in GitHub Secrets, not in code
- [ ] **Demo Mode**: `VITE_ENABLE_DEMO_MODE=false` in production
- [ ] **Supabase RLS**: Row Level Security enabled on all tables
- [ ] **Security Headers**: Configured in nginx.conf
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Content-Security-Policy: restrictive
- [ ] **Rate Limiting**: Implemented in auth and API layers
- [ ] **Session Timeout**: 1 hour in production

### 2.3 Database Seed Data (Optional)

If you need initial data:
```sql
-- Create initial admin user (after Supabase Auth signup)
INSERT INTO users (id, username, name, email, role, created_at)
VALUES (
  'user-uuid-from-supabase-auth',
  'admin',
  'System Administrator',
  'admin@yourcompany.com',
  'owner',
  NOW()
);

-- Create initial location
INSERT INTO locations (name, address, city, state, phone, is_active)
VALUES ('Main Restaurant', '123 Main St', 'New York', 'NY', '555-0100', true);
```

---

## Phase 3: Deployment (2-4 Hours)

### Option A: Docker Deployment (Recommended)

#### Step 1: Build Production Image
```bash
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  --build-arg VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
  --build-arg VITE_INTERCOM_APP_ID=$VITE_INTERCOM_APP_ID \
  --build-arg VITE_ENABLE_DEMO_MODE=false \
  --build-arg VITE_APP_VERSION=2.0.0 \
  -t saveplate:2.0.0 \
  -t saveplate:latest .
```

#### Step 2: Push to Registry
```bash
# GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
docker tag saveplate:2.0.0 ghcr.io/dobeutech/saveplate:2.0.0
docker push ghcr.io/dobeutech/saveplate:2.0.0
```

#### Step 3: Deploy to Server
```bash
# On production server
docker pull ghcr.io/dobeutech/saveplate:2.0.0
docker stop saveplate || true
docker rm saveplate || true
docker run -d \
  -p 8080:8080 \
  --name saveplate \
  --restart unless-stopped \
  ghcr.io/dobeutech/saveplate:2.0.0
```

#### Step 4: Configure Reverse Proxy (Nginx)
```nginx
# /etc/nginx/sites-available/saveplate
server {
    listen 80;
    server_name saveplate.yourcompany.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name saveplate.yourcompany.com;

    ssl_certificate /etc/letsencrypt/live/saveplate.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saveplate.yourcompany.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 5: SSL Certificate
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d saveplate.yourcompany.com
```

### Option B: Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Add environment variables
vercel secrets add vite-supabase-url "https://your-project.supabase.co"
vercel secrets add vite-supabase-anon-key "your_anon_key"
vercel secrets add vite-sentry-dsn "your_sentry_dsn"

# Deploy
vercel --prod
```

### Option C: Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/saveplate:2.0.0

# Deploy
gcloud run deploy saveplate \
  --image gcr.io/PROJECT_ID/saveplate:2.0.0 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"
```

---

## Phase 4: Post-Deployment Verification (1 Hour)

### 4.1 Immediate Checks (First 15 Minutes)

```bash
# Health check
curl https://saveplate.yourcompany.com/health
# Expected: healthy

# SSL verification
curl -I https://saveplate.yourcompany.com
# Check for: HTTP/2 200, security headers

# Security headers check
curl -I https://saveplate.yourcompany.com | grep -E "(X-Frame|X-Content|Content-Security)"
```

### 4.2 Functional Testing (15-30 Minutes)

- [ ] **Homepage loads**: Marketing page displays correctly
- [ ] **Signup flow**: Can create new account with email verification
- [ ] **Login flow**: Can login with valid credentials
- [ ] **Login rejection**: Invalid password is rejected
- [ ] **Dashboard access**: Authenticated users see dashboard
- [ ] **Inventory management**: Can view/add/edit inventory
- [ ] **Vendor management**: Can view/add/edit vendors
- [ ] **Purchase orders**: Can create and view orders
- [ ] **Role-based access**: Different roles see appropriate features
- [ ] **Logout**: Session ends properly

### 4.3 Monitoring Verification (15 Minutes)

- [ ] **Sentry**: Test error appears in dashboard
- [ ] **Health endpoint**: Returns 200 OK
- [ ] **Database connection**: Queries execute successfully
- [ ] **Auth service**: Supabase Auth responding

---

## Phase 5: Monitoring & Observability Setup (2 Hours)

### 5.1 Uptime Monitoring

**UptimeRobot Setup**:
1. Create account at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor:
   - Type: HTTP(s)
   - URL: https://saveplate.yourcompany.com/health
   - Interval: 5 minutes
3. Configure alerts:
   - Email to team
   - Slack webhook (optional)
   - SMS for critical (optional)

### 5.2 Error Alerting (Sentry)

Configure alerts in Sentry:
1. Go to **Alerts → Create Alert**
2. Set conditions:
   - Error rate > 1% for 5 minutes
   - New issue types
   - High volume issues
3. Set notification channels

### 5.3 Performance Monitoring

Run Lighthouse audit:
```bash
npm install -g @lhci/cli
lhci autorun --collect.url=https://saveplate.yourcompany.com
```

Targets:
- Performance Score: >90
- Accessibility Score: >90
- Best Practices Score: >90
- SEO Score: >90

---

## Phase 6: Backup & Disaster Recovery

### 6.1 Supabase Backups

Supabase provides automatic daily backups (Pro plan). Verify:
1. Go to Supabase Dashboard → Settings → Database
2. Confirm backups are enabled
3. Note retention period

### 6.2 Manual Backup Procedure

```bash
# Export database
pg_dump "postgresql://user:pass@db.xxx.supabase.co:5432/postgres" > backup_$(date +%Y%m%d).sql

# Store in secure location (S3, GCS)
aws s3 cp backup_$(date +%Y%m%d).sql s3://your-backup-bucket/
```

### 6.3 Rollback Procedure

If deployment has issues:

```bash
# Immediate rollback
docker stop saveplate
docker rm saveplate

# Deploy previous version
docker pull ghcr.io/dobeutech/saveplate:previous-tag
docker run -d -p 8080:8080 --name saveplate \
  --restart unless-stopped \
  ghcr.io/dobeutech/saveplate:previous-tag

# Verify
curl https://saveplate.yourcompany.com/health
```

---

## Post-Launch Checklist

### Day 1
- [ ] Monitor error rates every 2 hours
- [ ] Check Sentry for new issues
- [ ] Verify user signups working
- [ ] Check database performance
- [ ] Review security logs

### Week 1
- [ ] Daily error rate review
- [ ] Performance baseline established
- [ ] User feedback collected
- [ ] First patch if needed

### Month 1
- [ ] Weekly metrics review
- [ ] Security update review
- [ ] Dependency audit
- [ ] Disaster recovery test

---

## Support Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| On-Call Engineer | TBD | After 15 min |
| Technical Lead | TBD | After 30 min |
| DevOps Lead | TBD | After 30 min |
| Security Lead | TBD | Immediately for security issues |

---

## Quick Reference Commands

```bash
# View container logs
docker logs saveplate -f

# Restart container
docker restart saveplate

# Check container health
docker inspect saveplate --format='{{.State.Health.Status}}'

# View resource usage
docker stats saveplate

# Enter container shell
docker exec -it saveplate sh

# Database backup
pg_dump $DATABASE_URL > backup.sql

# Rebuild and deploy
docker build -t saveplate:new . && docker-compose up -d
```

---

## Success Criteria

Deployment is successful when:

- ✅ Health check returns "healthy"
- ✅ HTTPS working with valid certificate
- ✅ Users can sign up and log in
- ✅ Demo mode is disabled (real authentication)
- ✅ All CRUD operations work
- ✅ Error rate <0.1%
- ✅ Response time <500ms
- ✅ Monitoring active and alerting
- ✅ No critical errors in Sentry
- ✅ Backups verified

---

**Document Version**: 1.0.0
**Created By**: Claude Code
**Last Updated**: 2025-12-28
