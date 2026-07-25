# SavePlate - Restaurant Management System

## Overview
SavePlate is a React 19 SPA for restaurant food waste tracking, inventory management, vendor management, purchase orders, and ESG reporting. It uses Supabase for auth, database, and storage.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Charts**: Recharts + D3
- **Monitoring**: Sentry (optional), Intercom (optional)
- **Build plugins**: @github/spark (icon proxy, Vite plugin)

## Architecture
- Pure client-side SPA — no server-side code
- All API calls go through Supabase JS client (`src/lib/supabase.ts`)
- Two auth providers exist:
  - `src/lib/waste-auth.tsx` — used by App.tsx (main auth)
  - `src/lib/auth-context.tsx` — used by some dashboard view components
- Config validation in `src/lib/config.ts` with graceful missing-env handling
- Role-based access: owner, admin, regional_manager, manager, staff

## Key Files
- `src/App.tsx` — Main app, routing, setup screen
- `src/lib/config.ts` — Centralized config with env validation
- `src/lib/api/` — Supabase API modules (inventory, vendors, purchase-orders, etc.)
- `src/hooks/` — Custom hooks for data fetching
- `database/schema.sql` — Full DB schema with RLS policies

## Environment Variables (Required)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key

## Development
- Dev server: `npm run dev` (port 5000, bound to 0.0.0.0)
- Build: `npm run build`
- Lint: `npm run lint`

## Deployment
- Configured as static site deployment
- Build: `npm run build` → output in `dist/`
- All data persists in Supabase (external)
