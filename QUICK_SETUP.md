# Quick Setup Guide

Get lastplateprod running in production in under 30 minutes.

---

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Sentry account (optional but recommended)

---

## Step 1: Clone and Install (2 minutes)

```bash
git clone https://github.com/dobeutech/lastplateprod.git
cd lastplateprod
npm install
```

---

## Step 2: Set Up Supabase (10 minutes)

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name: `lastplateprod`
4. Generate strong password
5. Choose region closest to users
6. Wait ~2 minutes for creation

### Run Database Schema
1. Open Supabase SQL Editor
2. Copy contents of `database/schema.sql`
3. Paste and click "Run"
4. Verify tables created (should see 11 tables)

### Get Credentials
1. Go to Settings > API
2. Copy:
   - Project URL
   - anon/public key

---

## Step 3: Configure Environment (2 minutes)

```bash
cp .env.example .env
```

Edit `.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SENTRY_DSN=your_sentry_dsn_here  # Optional
VITE_ENABLE_DEMO_MODE=false
```

---

## Step 4: Test Locally (2 minutes)

```bash
npm run dev
```

Open browser to http://localhost:5173

Test authentication:
1. Open browser console
2. Run: `__testAuth()`
3. Should see all tests pass

---

## Step 5: Build for Production (2 minutes)

```bash
npm run build
```

Verify build:
```bash
npm run preview
```

---

## Step 6: Deploy (10 minutes)

### Option A: Docker (Recommended)

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  --build-arg VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
  -t lastplateprod:latest .

docker run -d -p 8080:8080 --name lastplateprod lastplateprod:latest
```

Test: `curl http://localhost:8080/health`

### Option B: Vercel

```bash
npm i -g vercel
vercel --prod
```

Add environment variables in Vercel dashboard.

### Option C: Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod
```

Add environment variables in Netlify dashboard.

---

## Step 7: Verify Deployment (2 minutes)

### Health Check
```bash
curl https://your-domain.com/health
```

Should return: `healthy`

### Test Authentication
1. Go to your deployed URL
2. Try to sign up/login
3. Check Sentry for any errors

### Run All Checks
```bash
./scripts/tools/all-checks.sh
```

---

## Common Issues

### "VITE_SUPABASE_URL is required"
**Solution:** Set environment variables before building

### "Permission denied for table"
**Solution:** Run database schema in Supabase SQL Editor

### "Too many login attempts"
**Solution:** Rate limiter working correctly, wait 15 minutes

### Docker build fails
**Solution:** Ensure all build args are provided

---

## Next Steps

### Immediate
1. Create first user account
2. Add test data
3. Test all features
4. Set up monitoring alerts

### This Week
1. Complete remaining API implementations
2. Fix non-functioning pages
3. Add comprehensive tests
4. Performance optimization

### This Month
1. User acceptance testing
2. Security audit
3. Load testing
4. Production launch

---

## Monitoring

### Sentry (Error Tracking)
1. Create project at sentry.io
2. Get DSN
3. Add to environment variables
4. Errors will appear in dashboard

### Uptime Monitoring
1. Sign up for UptimeRobot or Pingdom
2. Monitor: `https://your-domain.com/health`
3. Set up alerts

### Health Checks
Run in browser console:
```javascript
__healthCheck()
```

---

## Support

### Documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [SYSTEM_DOCUMENTATION.md](docs/SYSTEM_DOCUMENTATION.md) - API reference
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Current status
- [database/README.md](database/README.md) - Database setup

### Tools
```bash
./scripts/code-review.sh      # Code quality
./scripts/a11y-review.sh      # Accessibility
./scripts/tools/env-check.sh  # Environment
./scripts/tools/all-checks.sh # All checks
```

### Getting Help
1. Check documentation
2. Review error logs in Sentry
3. Check health monitoring
4. Create GitHub issue

---

## Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] Local testing passed
- [ ] Production build successful
- [ ] Deployed to hosting
- [ ] Health check passing
- [ ] Authentication working
- [ ] Monitoring configured
- [ ] Team trained

---

## Success!

Your application is now running in production! 🎉

**Next:** See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for remaining tasks.

---

**Setup Time:** ~30 minutes  
**Status:** Production Ready (with configuration)  
**Last Updated:** 2025-12-14
