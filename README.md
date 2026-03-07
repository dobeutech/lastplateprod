# SavePlate - Restaurant Management System

A comprehensive restaurant management platform built with React, TypeScript, and Supabase. SavePlate helps restaurants reduce food waste, manage inventory across multiple locations, handle vendor relationships, process purchase orders with approval workflows, and generate ESG reports.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix UI), Framer Motion
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Charts**: Recharts, D3
- **Monitoring**: Sentry (optional), Intercom (optional)
- **State**: React Context, TanStack Query

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous/public key |
| `VITE_SENTRY_DSN` | No | Sentry DSN for error monitoring |
| `VITE_INTERCOM_APP_ID` | No | Intercom App ID for support chat |
| `VITE_ENABLE_DEMO_MODE` | No | Must be `false` in production |
| `VITE_APP_NAME` | No | App display name (default: SavePlate) |
| `VITE_APP_VERSION` | No | App version (default: 1.0.0) |
| `VITE_ENABLE_ANALYTICS` | No | Enable analytics (default: true) |
| `VITE_ENABLE_AUDIT_LOG` | No | Enable audit logging (default: true) |

### 3. Set Up Supabase Database

Apply the schema to your Supabase project:

```bash
# Run the SQL in database/schema.sql via the Supabase SQL Editor
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5000) |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
  App.tsx                  # Main application with routing
  ErrorFallback.tsx        # Global error boundary
  main.tsx                 # Entry point
  components/
    ui/                    # Reusable UI primitives (shadcn/ui)
    brand/                 # Landing/marketing components
    marketing/             # Marketing page components
    views/                 # Dashboard view components
    signup/                # Multi-step signup flow
    kb/                    # Knowledge base components
  hooks/                   # Custom React hooks
  lib/
    api/                   # Supabase API modules
    config.ts              # Centralized configuration
    supabase.ts            # Supabase client
    auth-context.tsx       # Auth with RBAC (used by dashboard views)
    waste-auth.tsx         # Auth provider (used by main App)
    permissions.ts         # Role-based permissions
    rate-limiter.ts        # Client-side rate limiting
    logger.ts              # Structured logging
    health-check.ts        # Client-side health monitoring
    monitoring.ts          # Sentry integration
  pages/                   # Page-level components
database/
  schema.sql               # Full database schema with RLS policies
```

## User Roles

| Role | Capabilities |
|------|-------------|
| Owner | Full access, all locations |
| Admin | User management, order approval, multi-location |
| Regional Manager | Cross-location oversight, approvals |
| Manager | Single location management, approvals |
| Staff | Inventory updates, create orders |

## Deploying on Replit

### Development

1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Replit Secrets
2. The workflow "Start application" runs `npm run dev` on port 5000
3. The app is available in the Replit webview

### Production (Publish)

1. Ensure all required Secrets are set
2. The deployment is configured as a static site:
   - Build command: `npm run build`
   - Public directory: `dist`
3. Click "Publish" in Replit to deploy

### Storage Notes

- All persistent data is stored in Supabase (external)
- The Replit filesystem is used only for code and build artifacts
- No local database or file storage is needed

## Database

The database schema is defined in `database/schema.sql` and includes:

- Row Level Security (RLS) policies for multi-tenant data isolation
- Automatic `updated_at` triggers
- Audit logging table
- Indexes on frequently queried columns

### Backup Strategy

Since data is stored in Supabase, use Supabase's built-in backup features:
- Automatic daily backups (Pro plan)
- Point-in-time recovery (Pro plan)
- Manual SQL exports via Supabase dashboard

## Troubleshooting

### White/blank screen
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- The app shows a "Setup Required" page when these are missing

### 401 Unauthorized errors
- Verify your Supabase anon key is correct
- Check that RLS policies are applied in your Supabase project

### Build fails
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors with `npx tsc --noEmit`

### Port issues on Replit
- The dev server binds to `0.0.0.0:5000` by default
- Do not change the port unless you also update the Replit workflow
