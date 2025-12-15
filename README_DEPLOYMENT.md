# Quick Deployment Guide

## Prerequisites
- Node.js 18+
- Docker (for containerized deployment)
- GitHub account (for CI/CD)

## 🚀 Quick Start

### 1. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
VITE_ENABLE_DEMO_MODE=false
```

### 2. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 3. Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### 4. Docker Deployment

```bash
# Build Docker image
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  -t lastplateprod:latest .

# Run container
docker run -d -p 8080:8080 --name lastplateprod lastplateprod:latest

# Check health
curl http://localhost:8080/health
```

### 5. GitHub Actions Setup

1. Go to repository Settings > Secrets and variables > Actions
2. Add secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_INTERCOM_APP_ID` (optional)
3. Push to `main` branch to trigger deployment

## ⚠️ Critical Security Notice

**The current authentication system is for DEMO purposes only and accepts any password.**

Before production deployment, you MUST:
1. Implement real authentication (see `PRODUCTION_SECURITY_IMPLEMENTATION.md`)
2. Set `VITE_ENABLE_DEMO_MODE=false`
3. Configure proper user management
4. Add rate limiting

## 📚 Documentation

- [Full Security Implementation Guide](PRODUCTION_SECURITY_IMPLEMENTATION.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Security Best Practices](SECURITY_BEST_PRACTICES.md)

## 🆘 Support

For issues or questions:
1. Check [PRODUCTION_SECURITY_IMPLEMENTATION.md](PRODUCTION_SECURITY_IMPLEMENTATION.md) troubleshooting section
2. Review GitHub Actions logs
3. Check Docker container logs: `docker logs lastplateprod`
