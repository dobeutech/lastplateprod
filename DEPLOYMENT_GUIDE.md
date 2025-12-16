# Deployment Guide - lastplateprod

**Status:** Ready for Deployment  
**Date:** 2025-12-14  
**Version:** 2.0.0

---

## ⚠️ Pre-Deployment Requirements

Before deploying, you must complete these steps:

### 1. Set Up Supabase Project (10 minutes)

#### Create Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Name:** lastplateprod
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose closest to your users
4. Wait ~2 minutes for project creation

#### Run Database Schema
1. Open Supabase SQL Editor
2. Copy entire contents of `database/schema.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify: Should see "Success" message

#### Get Credentials
1. Go to **Settings > API**
2. Copy these values:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon/public key** → This is your `VITE_SUPABASE_ANON_KEY`

### 2. Set Up Sentry (Optional but Recommended - 5 minutes)

1. Go to [https://sentry.io](https://sentry.io)
2. Create new project
3. Choose "React"
4. Copy the DSN → This is your `VITE_SENTRY_DSN`

### 3. Configure Environment Variables

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```bash
# REQUIRED - From Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# RECOMMENDED - From Sentry
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# OPTIONAL
VITE_INTERCOM_APP_ID=your_intercom_app_id
VITE_ENABLE_DEMO_MODE=false
VITE_APP_NAME=Restaurant Management System
VITE_APP_VERSION=2.0.0
```

---

## 🚀 Deployment Options

Choose one of the following deployment methods:

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker installed
- Environment variables configured

#### Steps

**1. Build Docker Image**
```bash
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  --build-arg VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
  --build-arg VITE_ENABLE_DEMO_MODE=false \
  --build-arg VITE_APP_VERSION=2.0.0 \
  -t lastplateprod:2.0.0 .
```

**2. Test Locally**
```bash
docker run -d -p 8080:8080 --name lastplateprod-test lastplateprod:2.0.0

# Wait 5 seconds
sleep 5

# Test health check
curl http://localhost:8080/health

# Should return: healthy

# Cleanup
docker stop lastplateprod-test
docker rm lastplateprod-test
```

**3. Deploy to Production**
```bash
# Tag for production
docker tag lastplateprod:2.0.0 lastplateprod:latest

# Run in production
docker run -d \
  -p 8080:8080 \
  --name lastplateprod \
  --restart unless-stopped \
  lastplateprod:latest

# Verify
curl http://localhost:8080/health
```

**4. Set Up Reverse Proxy (Nginx)**

Create `/etc/nginx/sites-available/lastplateprod`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/lastplateprod /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**5. Set Up SSL (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 2: GitHub Container Registry + Cloud Deployment

#### Prerequisites
- GitHub account
- Cloud provider account (AWS, GCP, Azure, DigitalOcean)

#### Steps

**1. Push to GitHub Container Registry**
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag image
docker tag lastplateprod:2.0.0 ghcr.io/dobeutech/lastplateprod:2.0.0
docker tag lastplateprod:2.0.0 ghcr.io/dobeutech/lastplateprod:latest

# Push
docker push ghcr.io/dobeutech/lastplateprod:2.0.0
docker push ghcr.io/dobeutech/lastplateprod:latest
```

**2. Deploy to Cloud Provider**

**AWS ECS:**
```bash
# Create task definition
# Create service
# Deploy container
```

**Google Cloud Run:**
```bash
gcloud run deploy lastplateprod \
  --image ghcr.io/dobeutech/lastplateprod:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**DigitalOcean App Platform:**
```bash
# Use web interface
# Connect to GitHub
# Select repository
# Configure environment variables
# Deploy
```

---

### Option 3: Vercel (Static Hosting)

#### Prerequisites
- Vercel account
- Vercel CLI installed

#### Steps

**1. Install Vercel CLI**
```bash
npm i -g vercel
```

**2. Configure Environment Variables**

Create `vercel.json`:
```json
{
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_SENTRY_DSN": "@sentry-dsn"
  }
}
```

**3. Add Secrets**
```bash
vercel secrets add supabase-url "https://your-project.supabase.co"
vercel secrets add supabase-anon-key "your_anon_key"
vercel secrets add sentry-dsn "your_sentry_dsn"
```

**4. Deploy**
```bash
vercel --prod
```

---

### Option 4: Netlify (Static Hosting)

#### Prerequisites
- Netlify account
- Netlify CLI installed

#### Steps

**1. Install Netlify CLI**
```bash
npm i -g netlify-cli
```

**2. Build**
```bash
npm run build
```

**3. Deploy**
```bash
netlify deploy --prod --dir=dist
```

**4. Configure Environment Variables**
- Go to Netlify dashboard
- Site settings > Environment variables
- Add all required variables

---

## ✅ Post-Deployment Checklist

### Immediate (First 15 minutes)

- [ ] Health check passes
  ```bash
  curl https://your-domain.com/health
  # Should return: healthy
  ```

- [ ] Can access application
  ```bash
  curl https://your-domain.com
  # Should return HTML
  ```

- [ ] Can create account
  - Go to signup page
  - Create test account
  - Verify email works

- [ ] Can login
  - Login with test account
  - Verify redirects to dashboard

- [ ] Check Sentry
  - Go to Sentry dashboard
  - Verify no errors
  - Check that events are being received

### First Hour

- [ ] Monitor error rates
  - Check Sentry every 15 minutes
  - Error rate should be <0.1%

- [ ] Monitor performance
  - Check response times
  - Should be <500ms

- [ ] Test critical features
  - Inventory management
  - Vendor management
  - Purchase orders

- [ ] Check database
  - Verify connections
  - Check query performance
  - Review RLS policies

### First Day

- [ ] Set up monitoring
  - Configure uptime monitoring (UptimeRobot)
  - Set up alerts
  - Configure status page

- [ ] Set up backups
  - Verify Supabase backups running
  - Test backup restoration

- [ ] Security review
  - Verify HTTPS working
  - Check security headers
  - Review access logs

- [ ] Documentation
  - Update deployment notes
  - Document any issues
  - Update runbook if needed

---

## 🔍 Verification Commands

### Health Check
```bash
curl https://your-domain.com/health
# Expected: healthy
```

### API Test
```bash
curl https://your-domain.com/api/health
# Expected: JSON with status
```

### Security Headers
```bash
curl -I https://your-domain.com
# Should see:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Content-Security-Policy: ...
```

### Database Connection
```bash
# In browser console
__healthCheck()
# Should show all checks passing
```

### Authentication Test
```bash
# In browser console
__testAuth()
# Should show all tests passing
```

---

## 🐛 Troubleshooting

### Issue: Health check fails

**Symptoms:** `/health` returns 404 or 500

**Solutions:**
1. Check container logs:
   ```bash
   docker logs lastplateprod
   ```

2. Verify environment variables:
   ```bash
   docker exec lastplateprod env | grep VITE
   ```

3. Restart container:
   ```bash
   docker restart lastplateprod
   ```

### Issue: Can't connect to database

**Symptoms:** Errors about Supabase connection

**Solutions:**
1. Verify Supabase URL and key:
   ```bash
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

2. Check Supabase status:
   ```bash
   curl https://status.supabase.com
   ```

3. Test connection manually:
   ```bash
   curl https://your-project.supabase.co/rest/v1/
   ```

### Issue: Authentication not working

**Symptoms:** Can't login or signup

**Solutions:**
1. Check Supabase Auth is enabled
2. Verify email provider configured
3. Check rate limiting
4. Review browser console for errors

### Issue: High error rate

**Symptoms:** Many errors in Sentry

**Solutions:**
1. Check Sentry dashboard for patterns
2. Review application logs
3. Check database performance
4. Verify all environment variables set

---

## 📊 Monitoring Setup

### Uptime Monitoring

**UptimeRobot:**
1. Create account at uptimerobot.com
2. Add monitor:
   - Type: HTTP(s)
   - URL: https://your-domain.com/health
   - Interval: 5 minutes
3. Set up alerts (email, SMS, Slack)

### Error Monitoring

**Sentry:**
- Already configured in code
- Check dashboard: https://sentry.io
- Set up alerts for error spikes
- Configure integrations (Slack, email)

### Performance Monitoring

**Lighthouse CI:**
```bash
npm install -g @lhci/cli
lhci autorun --collect.url=https://your-domain.com
```

---

## 🔄 Rollback Procedure

If deployment has issues:

**1. Immediate Rollback**
```bash
# Stop current version
docker stop lastplateprod
docker rm lastplateprod

# Deploy previous version
docker run -d \
  -p 8080:8080 \
  --name lastplateprod \
  --restart unless-stopped \
  lastplateprod:1.0.0

# Verify
curl http://localhost:8080/health
```

**2. GitHub Container Registry Rollback**
```bash
# Pull previous version
docker pull ghcr.io/dobeutech/lastplateprod:1.0.0

# Deploy
docker run -d -p 8080:8080 --name lastplateprod \
  ghcr.io/dobeutech/lastplateprod:1.0.0
```

**3. Notify Team**
```
🔄 ROLLBACK EXECUTED

Version: 2.0.0 → 1.0.0
Reason: [Description]
Status: Service restored

Post-mortem: [Date/Time]
```

---

## 📞 Support

### Issues During Deployment

1. Check [RUNBOOK.md](RUNBOOK.md) for troubleshooting
2. Review [OPERATIONAL_HANDBOOK.md](OPERATIONAL_HANDBOOK.md)
3. Check Sentry for errors
4. Review application logs
5. Create GitHub issue if needed

### Emergency Contacts

- On-Call Engineer: [Check rotation]
- Technical Lead: TBD
- DevOps Lead: TBD

---

## 📝 Deployment Log Template

```markdown
## Deployment - v2.0.0

**Date:** 2025-12-14
**Deployed By:** [Name]
**Environment:** Production

### Pre-Deployment
- [ ] Environment variables verified
- [ ] Database schema deployed
- [ ] Tests passing
- [ ] Security scan clean

### Deployment
- [ ] Docker image built
- [ ] Image tested locally
- [ ] Deployed to production
- [ ] Health check passed

### Post-Deployment
- [ ] Monitoring configured
- [ ] No errors in first hour
- [ ] Performance acceptable
- [ ] Team notified

### Issues
- None / [List any issues]

### Notes
- [Any additional notes]
```

---

## ✅ Success Criteria

Deployment is successful when:

- ✅ Health check returns "healthy"
- ✅ Application accessible via HTTPS
- ✅ Users can signup and login
- ✅ All features working
- ✅ Error rate <0.1%
- ✅ Response time <500ms
- ✅ No critical errors in Sentry
- ✅ Monitoring configured
- ✅ Team notified

---

**Ready to deploy? Follow the steps above and good luck!** 🚀

**Need help?** Check [QUICK_SETUP.md](QUICK_SETUP.md) for a faster guide.
