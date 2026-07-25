# Production Readiness Report

**Project**: SavePlate (lastplateprod)
**Date**: March 7, 2026
**Target Platform**: Replit (Static Deployment)

## Executive Summary

SavePlate has been hardened for production deployment on Replit. The application is a React 19 SPA backed by Supabase (auth, database, storage). Key changes include: fixing dependency conflicts, removing dead code and stale documentation, improving error handling and security posture, optimizing bundle size, configuring Replit-specific deployment, and producing clear documentation.

The app is deployable as a static site on Replit once Supabase credentials are configured.

## What Was Fixed

### Critical Blockers
1. **Dependency conflict**: `@sentry/react` v7 was incompatible with React 19. Upgraded to v8.
2. **Duplicate dev dependency**: Removed unused `@vitejs/plugin-react` (project uses `@vitejs/plugin-react-swc`).
3. **Broken `workspaces` field**: `package.json` referenced a non-existent `packages/*` directory. Removed.
4. **White screen on missing env vars**: Config threw an unhandled error when Supabase vars were missing, causing a blank page. Now shows a friendly "Setup Required" screen.

### High-Priority Hardening
5. **Error boundary improvement**: ErrorFallback no longer leaks error details (stack traces, internal messages) to end users in production.
6. **Console statement cleanup**: Replaced `console.error` calls in auth flows with structured `logger` calls to prevent secret/token leakage in browser console.
7. **Demo mode safety**: Tightened the demo mode check to use strict equality (`!== 'production'`) instead of `.includes()`.
8. **Supabase client safety**: Client now handles missing credentials gracefully instead of crashing.

### Reliability / Maintainability
9. **Removed 29 stale markdown files**: Planning docs, strategy notes, and duplicate guides that added confusion.
10. **Removed Docker/Nginx artifacts**: `Dockerfile`, `nginx.conf`, deployment scripts — not needed for Replit deployment.
11. **Fixed merge artifact in useInventory.ts**: Removed duplicate code block (dead code after line 122).
12. **Updated .env.example**: Clear documentation of all variables with required/optional labels.

### Performance
13. **Bundle splitting**: Added Vite `manualChunks` configuration to split vendor libraries (React, Radix UI, Recharts/D3, Supabase) into separate chunks for better caching.

### Replit-Specific
14. **Vite server configuration**: Bound to `0.0.0.0:5000` with `allowedHosts` for Replit proxy.
15. **Workflow configuration**: "Start application" workflow configured for port 5000 webview.
16. **Static deployment configuration**: Build command and public directory configured for Replit publish.
17. **Script normalization**: Removed unnecessary `kill`/`optimize` scripts; added `start` and `preview` with correct host/port.

### Documentation
18. **README rewrite**: Complete setup guide, env var table, project structure, Replit deployment steps, troubleshooting.
19. **SEO meta tags**: Added Open Graph tags, theme-color, and improved meta description in index.html.

## Remaining Risks

### Medium Risk
- **Two auth contexts**: `auth-context.tsx` (used by dashboard views) and `waste-auth.tsx` (used by App.tsx) provide overlapping auth functionality. Consolidation is recommended but was deferred to avoid breaking existing behavior.
- **Large bundle**: Even with code splitting, the main application chunk is ~456KB (128KB gzipped). Dynamic imports for page components would further reduce initial load.
- **No automated tests**: Only one manual test file exists (`src/lib/__tests__/auth.test.ts`). Production-critical paths lack automated coverage.

### Low Risk
- **Client-side rate limiting**: The rate limiter runs in-browser and can be bypassed. Supabase's server-side rate limiting provides the real protection.
- **32 ESLint warnings**: All are non-blocking (unused vars, `any` types). No errors.
- **`@github/spark` dependency**: The codebase uses GitHub Spark for the Vite plugin and entry point. This is tightly integrated and was preserved.

## Assumptions Made

1. **Supabase is the sole backend**: No separate API server is needed. All data operations go through the Supabase JS client.
2. **RLS policies are already applied**: The schema in `database/schema.sql` defines RLS policies. It is assumed these are active in the target Supabase project.
3. **Static deployment is appropriate**: Since the app is a pure SPA with no server-side rendering, static deployment on Replit is the correct target.
4. **Supabase handles backups**: Data durability depends on the Supabase plan (automatic backups on Pro).
5. **`@github/spark` packages are required**: These Vite plugins are used for icon proxying and other build features.

## Manual Steps Required

1. **Set Supabase credentials**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Replit Secrets.
2. **Apply database schema**: Run `database/schema.sql` in the Supabase SQL Editor if not already done.
3. **Optional: Set Sentry DSN**: Add `VITE_SENTRY_DSN` for production error monitoring.
4. **Optional: Set Intercom ID**: Add `VITE_INTERCOM_APP_ID` for customer support chat.
5. **Publish**: Click "Publish" in Replit to deploy the static site.

## Verification Commands

```bash
# Install dependencies
npm install

# Lint (expect 0 errors, ~32 warnings)
npm run lint

# TypeScript check + production build
npm run build

# Start development server
npm run dev
```

## Rollback Notes

- **Code rollback**: Replit maintains automatic checkpoints. Use the Version History in Replit to roll back to any previous state.
- **Database rollback**: Supabase provides point-in-time recovery on Pro plans. For Free plans, maintain manual SQL backups before schema changes.
- **Deployment rollback**: Re-publish a previous checkpoint from Replit's Version History.
