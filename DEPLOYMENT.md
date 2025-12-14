# Deployment Guide - Restaurant Management System

## Production Deployment Checklist

### Prerequisites

1. **Node.js Environment**
   - Node.js 18.x or higher
   - npm 9.x or higher
   - Ensure production environment has matching Node version

2. **Build System**
   - Vite 6.x for production builds
   - TypeScript compiler for type checking

### Environment Configuration

#### Required Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Application Configuration
VITE_APP_NAME="Restaurant Management System"
VITE_APP_VERSION="1.0.0"

# API Configuration (if backend is added in future)
# VITE_API_URL=https://api.yourrestaurant.com
# VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEMO_MODE=false

# Security
VITE_SESSION_TIMEOUT=3600000
VITE_ENABLE_AUDIT_LOG=true
```

#### Security Considerations

**IMPORTANT**: The current demo version accepts any password for authentication. 
Before production deployment:

1. **Implement Real Authentication**
   - Replace demo authentication with proper user/password validation
   - Use bcrypt or argon2 for password hashing
   - Implement JWT or session-based authentication
   - Add rate limiting for login attempts
   - Implement account lockout after failed attempts

2. **Add Backend API**
   - Replace KV store with proper database (PostgreSQL/MySQL)
   - Implement API authentication middleware
   - Add CORS configuration
   - Implement request validation

3. **Secure Session Management**
   - Use httpOnly cookies for session tokens
   - Implement CSRF protection
   - Add session timeout and refresh mechanisms
   - Store sensitive data server-side only

### Build Process

1. **Install Dependencies**
   ```bash
   npm ci --production=false
   ```

2. **Run Security Audit**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Run Linter**
   ```bash
   npm run lint
   ```

4. **Run Type Check**
   ```bash
   npx tsc --noEmit
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

   This will:
   - Compile TypeScript to JavaScript
   - Bundle all assets with Vite
   - Minify and optimize code
   - Output to `dist/` directory

6. **Test Production Build Locally**
   ```bash
   npm run preview
   ```

### Deployment Options

#### Option 1: Static Hosting (Recommended for MVP)

**Supported Platforms:**
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- Azure Static Web Apps
- GitHub Pages

**Example: Vercel Deployment**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

**Example: Netlify Deployment**

1. Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. Deploy via Netlify CLI or connect GitHub repository

#### Option 2: Docker Container

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;

    # Compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Build and run:
```bash
docker build -t restaurant-management .
docker run -p 80:80 restaurant-management
```

### Performance Optimization

1. **Code Splitting**
   - Already configured via Vite's dynamic imports
   - Consider splitting large chart libraries if bundle size grows

2. **Asset Optimization**
   - Images: Use WebP format with fallbacks
   - Fonts: Subset fonts to include only used characters
   - Icons: Already using Phosphor Icons efficiently

3. **Caching Strategy**
   - Static assets: Cache for 1 year with immutable flag
   - HTML: No cache or short cache (5 minutes)
   - API responses: Implement appropriate cache headers when backend is added

4. **CDN Configuration**
   - Use CDN for static assets
   - Enable Brotli compression
   - Configure cache rules based on file types

### Monitoring & Logging

#### Recommended Monitoring Tools

1. **Application Monitoring**
   - Sentry for error tracking
   - LogRocket for session replay
   - Google Analytics or Plausible for usage analytics

2. **Performance Monitoring**
   - Lighthouse CI for automated performance checks
   - Web Vitals tracking
   - Real User Monitoring (RUM)

3. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

#### Implement Logging

Add to application:

```typescript
// src/lib/logger.ts
export const logger = {
  error: (message: string, error?: Error) => {
    if (import.meta.env.PROD) {
      // Send to logging service (e.g., Sentry)
      console.error(message, error);
    } else {
      console.error(message, error);
    }
  },
  warn: (message: string) => {
    if (import.meta.env.PROD) {
      // Send to logging service
      console.warn(message);
    } else {
      console.warn(message);
    }
  },
  info: (message: string) => {
    if (!import.meta.env.PROD) {
      console.info(message);
    }
  }
};
```

### Security Hardening

1. **Content Security Policy**
   - Configure CSP headers in hosting platform
   - Restrict script sources to self and trusted CDNs
   - Prevent inline scripts in production

2. **HTTPS Only**
   - Force HTTPS redirect
   - Enable HSTS header
   - Use valid SSL/TLS certificate

3. **Rate Limiting**
   - Implement at CDN/hosting level
   - Protect API endpoints when added
   - Limit login attempts

4. **Data Protection**
   - Encrypt sensitive data at rest
   - Use secure session storage
   - Implement data retention policies

### Backup & Recovery

1. **Data Backup Strategy**
   - Currently using browser IndexedDB (KV store)
   - Implement server-side backup when backend is added
   - Schedule daily automated backups
   - Store backups in multiple locations
   - Test restoration process monthly

2. **Disaster Recovery Plan**
   - Document RTO (Recovery Time Objective): Target < 4 hours
   - Document RPO (Recovery Point Objective): Target < 1 hour
   - Maintain runbook for common issues
   - Keep deployment configuration in version control

### Health Checks

Add health check endpoint (when backend is implemented):

```typescript
// api/health
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION
  });
}
```

Configure health check monitoring:
- Check endpoint every 30 seconds
- Alert on 3 consecutive failures
- Check response time < 1000ms

### Rollback Procedure

1. **Automated Rollback**
   - Configure hosting platform to keep previous 3 deployments
   - Set up one-click rollback capability
   - Test rollback in staging environment

2. **Manual Rollback**
   ```bash
   # Vercel
   vercel rollback [deployment-url]
   
   # Netlify
   netlify rollback
   
   # Docker
   docker pull restaurant-management:previous
   docker stop restaurant-management
   docker run -d --name restaurant-management restaurant-management:previous
   ```

### Post-Deployment Verification

1. **Smoke Tests**
   - [ ] Application loads without errors
   - [ ] Login works for all user roles
   - [ ] Navigation between views functions
   - [ ] Data loads and displays correctly
   - [ ] Forms submit successfully
   - [ ] Permissions are enforced properly

2. **Performance Checks**
   - [ ] Lighthouse score > 90
   - [ ] First Contentful Paint < 1.5s
   - [ ] Time to Interactive < 3.5s
   - [ ] Total bundle size < 1MB

3. **Security Verification**
   - [ ] HTTPS enabled
   - [ ] Security headers present
   - [ ] No exposed secrets
   - [ ] Authentication required for protected routes
   - [ ] CORS configured properly

### Maintenance Schedule

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

### Support & Troubleshooting

**Common Issues:**

1. **Build Failures**
   - Check Node.js version matches requirements
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

2. **Runtime Errors**
   - Check browser console for errors
   - Verify all environment variables are set
   - Check IndexedDB is enabled in browser

3. **Performance Issues**
   - Enable production mode
   - Verify CDN is serving assets
   - Check for memory leaks in long-running sessions

### Contact & Escalation

- **Technical Issues**: Create GitHub issue
- **Security Concerns**: Email opensource-security@github.com
- **Urgent Production Issues**: Follow incident response plan

---

**Last Updated**: 2025-10-27
**Version**: 1.0.0
