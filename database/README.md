# Database Setup Guide

## Overview

This directory contains the database schema and setup instructions for the LastPlate production system.

## Prerequisites

- Supabase account
- Supabase project created
- Database access credentials

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: lastplateprod
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 2. Run Database Schema

1. Open Supabase SQL Editor
2. Copy contents of `schema.sql`
3. Paste into SQL Editor
4. Click "Run" to execute

This will create:
- All tables with proper relationships
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamps
- Seed data for development

### 3. Verify Setup

Run this query to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- audit_log
- esg_reports
- inventory_items
- kb_articles
- kb_categories
- locations
- purchase_order_items
- purchase_orders
- users
- vendor_categories
- vendors

### 4. Configure Environment Variables

Copy the following from Supabase dashboard:

1. Go to Settings > API
2. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`

Add to `.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Enable Email Authentication

1. Go to Authentication > Providers
2. Enable "Email" provider
3. Configure email templates (optional)
4. Set up SMTP (optional, for custom emails)

### 6. Test Connection

Run in your application:
```javascript
__testAuth()  // In browser console
```

Or test manually:
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('locations')
  .select('*')
  .limit(1);

console.log(data, error);
```

## Database Schema

### Core Tables

#### users
User accounts and profiles. Linked to Supabase Auth.

#### locations
Restaurant locations. Each user belongs to a location.

#### inventory_items
Inventory items tracked per location.

#### vendors
Supplier/vendor information.

#### purchase_orders
Purchase orders with line items.

#### esg_reports
Environmental, Social, and Governance reports.

#### kb_articles
Knowledge base articles for help documentation.

#### audit_log
Audit trail for all database changes.

### Relationships

```
users
  ├─ belongs to → locations
  └─ has many → purchase_orders

locations
  ├─ has many → users
  ├─ has many → inventory_items
  ├─ has many → purchase_orders
  └─ has many → esg_reports

vendors
  ├─ has many → vendor_categories
  └─ has many → purchase_orders

purchase_orders
  ├─ belongs to → vendors
  ├─ belongs to → locations
  ├─ belongs to → users (created_by)
  └─ has many → purchase_order_items

kb_categories
  └─ has many → kb_articles
```

## Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:

- Users can only see data for their location
- Managers can manage their location's data
- Admins can see all data
- Knowledge base is publicly readable

### Testing RLS

```sql
-- Test as authenticated user
SELECT * FROM inventory_items;  -- Should only see your location

-- Test as admin
SELECT * FROM audit_log;  -- Should see all logs
```

## Migrations

For future schema changes, create migration files:

```sql
-- migrations/001_add_column.sql
ALTER TABLE inventory_items 
ADD COLUMN new_field TEXT;
```

Run migrations in order through Supabase SQL Editor.

## Backup & Recovery

### Automatic Backups

Supabase provides automatic daily backups for paid plans.

### Manual Backup

```bash
# Export schema
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  --schema-only \
  > backup_schema.sql

# Export data
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  --data-only \
  > backup_data.sql
```

### Restore

```bash
psql -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  < backup_schema.sql
```

## Performance Optimization

### Indexes

All foreign keys and frequently queried columns have indexes.

### Query Optimization

Use `.explain()` to analyze queries:

```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .select('*')
  .explain({ analyze: true });
```

### Connection Pooling

Supabase handles connection pooling automatically.

## Troubleshooting

### Common Issues

**"permission denied for table"**
- Check RLS policies
- Verify user is authenticated
- Check user role

**"relation does not exist"**
- Run schema.sql
- Check table name spelling
- Verify schema is 'public'

**"duplicate key value"**
- Check for existing records
- Use `ON CONFLICT` clause
- Verify unique constraints

### Debug Queries

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'inventory_items';

-- Check user role
SELECT auth.role();

-- Check current user
SELECT auth.uid();
```

## Security Best Practices

1. **Never expose service_role key** - Only use anon key in frontend
2. **Always use RLS** - Never disable RLS in production
3. **Validate input** - Use TypeScript types and Zod validation
4. **Audit sensitive operations** - Log to audit_log table
5. **Rotate credentials** - Change passwords every 90 days

## Monitoring

### Query Performance

Monitor slow queries in Supabase dashboard:
1. Go to Database > Query Performance
2. Review slow queries
3. Add indexes as needed

### Database Size

Check database size:
```sql
SELECT 
  pg_size_pretty(pg_database_size('postgres')) as size;
```

### Table Sizes

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated:** 2025-12-14  
**Schema Version:** 1.0.0
