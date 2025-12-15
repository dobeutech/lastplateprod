# Operations Runbook

**Project:** lastplateprod  
**Version:** 2.0.0  
**Last Updated:** 2025-12-14

---

## Quick Reference

### Emergency Contacts
- **On-Call:** Check rotation schedule
- **Technical Lead:** TBD
- **Security Lead:** TBD
- **Escalation:** CTO

### Critical URLs
- **Production:** https://lastplateprod.com
- **Staging:** https://staging.lastplateprod.com
- **Health Check:** https://lastplateprod.com/health
- **Sentry:** https://sentry.io/organizations/your-org
- **Monitoring:** https://uptimerobot.com

---

## Common Operations

### 1. Check System Health

```bash
# Quick health check
curl https://lastplateprod.com/health

# Detailed health check
curl https://lastplateprod.com/api/health | jq

# Check all services
./scripts/health-check-all.sh
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-14T10:00:00.000Z",
  "version": "2.0.0",
  "checks": {
    "database": { "status": "pass", "responseTime": 45 },
    "auth": { "status": "pass", "responseTime": 23 },
    "storage": { "status": "pass" }
  }
}
```

### 2. View Logs

```bash
# Application logs
docker logs lastplateprod --tail 100 -f

# Error logs only
docker logs lastplateprod 2>&1 | grep ERROR

# Specific time range
docker logs lastplateprod --since 1h

# Sentry dashboard
open https://sentry.io/organizations/your-org/issues/
```

### 3. Restart Service

```bash
# Graceful restart
docker restart lastplateprod

# Force restart
docker stop lastplateprod && docker start lastplateprod

# Kubernetes
kubectl rollout restart deployment/lastplateprod

# Verify restart
curl https://lastplateprod.com/health
```

### 4. Scale Service

```bash
# Docker Compose
docker-compose up -d --scale app=3

# Kubernetes
kubectl scale deployment/lastplateprod --replicas=3

# Verify scaling
kubectl get pods -l app=lastplateprod
```

### 5. Deploy New Version

```bash
# See OPERATIONAL_HANDBOOK.md for full procedure

# Quick deploy (staging)
git checkout staging
git pull
./scripts/deploy-staging.sh

# Production deploy
git checkout main
git tag v2.0.1
./scripts/deploy-production.sh
```

---

## Troubleshooting

### Application Won't Start

**Symptoms:**
- Container exits immediately
- Health check fails
- 502/503 errors

**Diagnosis:**
```bash
# Check container logs
docker logs lastplateprod

# Check environment variables
docker exec lastplateprod env | grep VITE

# Check disk space
df -h

# Check memory
free -m
```

**Solutions:**
1. **Missing environment variables:**
   ```bash
   # Verify .env file
   cat .env
   # Add missing variables
   echo "VITE_SUPABASE_URL=..." >> .env
   docker restart lastplateprod
   ```

2. **Database connection failed:**
   ```bash
   # Test database connection
   psql -h db.supabase.co -U postgres -d postgres
   # Check Supabase status
   curl https://status.supabase.com
   ```

3. **Out of memory:**
   ```bash
   # Check memory usage
   docker stats lastplateprod
   # Increase memory limit
   docker update --memory 2g lastplateprod
   ```

### High Error Rate

**Symptoms:**
- Sentry alerts
- Error rate >1%
- User complaints

**Diagnosis:**
```bash
# Check Sentry dashboard
open https://sentry.io/organizations/your-org/issues/

# Check error logs
docker logs lastplateprod 2>&1 | grep ERROR | tail -50

# Check specific error
docker logs lastplateprod 2>&1 | grep "specific error message"
```

**Solutions:**
1. **Database errors:**
   ```bash
   # Check database health
   curl https://lastplateprod.com/api/health
   # Check connection pool
   # Review RLS policies
   ```

2. **API errors:**
   ```bash
   # Check API response times
   # Review rate limiting
   # Check external service status
   ```

3. **Authentication errors:**
   ```bash
   # Check Supabase auth status
   # Review session management
   # Check rate limiting
   ```

### Slow Performance

**Symptoms:**
- Response time >500ms
- User complaints
- Timeout errors

**Diagnosis:**
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://lastplateprod.com

# Check database queries
# Review Supabase dashboard

# Check CPU/Memory
docker stats lastplateprod

# Check network latency
ping lastplateprod.com
```

**Solutions:**
1. **Database slow:**
   ```bash
   # Check slow queries in Supabase
   # Add indexes if needed
   # Optimize queries
   ```

2. **High CPU:**
   ```bash
   # Scale horizontally
   kubectl scale deployment/lastplateprod --replicas=5
   # Optimize code
   # Add caching
   ```

3. **Network issues:**
   ```bash
   # Check CDN status
   # Review nginx configuration
   # Check DNS resolution
   ```

### Database Issues

**Symptoms:**
- Connection errors
- Slow queries
- Data inconsistencies

**Diagnosis:**
```bash
# Check database health
curl https://lastplateprod.com/api/health

# Check Supabase dashboard
open https://app.supabase.com/project/your-project

# Check connection pool
# Review slow queries
```

**Solutions:**
1. **Connection pool exhausted:**
   ```sql
   -- Check active connections
   SELECT count(*) FROM pg_stat_activity;
   
   -- Kill idle connections
   SELECT pg_terminate_backend(pid) 
   FROM pg_stat_activity 
   WHERE state = 'idle' 
   AND state_change < now() - interval '5 minutes';
   ```

2. **Slow queries:**
   ```sql
   -- Find slow queries
   SELECT query, mean_exec_time 
   FROM pg_stat_statements 
   ORDER BY mean_exec_time DESC 
   LIMIT 10;
   
   -- Add indexes
   CREATE INDEX idx_inventory_location 
   ON inventory_items(location_id);
   ```

3. **RLS policy issues:**
   ```sql
   -- Check policies
   SELECT * FROM pg_policies 
   WHERE tablename = 'inventory_items';
   
   -- Test policy
   SET ROLE authenticated;
   SELECT * FROM inventory_items LIMIT 1;
   ```

### Authentication Issues

**Symptoms:**
- Users can't login
- Session expired errors
- Rate limit errors

**Diagnosis:**
```bash
# Check Supabase auth status
open https://app.supabase.com/project/your-project/auth

# Check rate limiting
# Review session management logs

# Test authentication
curl -X POST https://lastplateprod.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

**Solutions:**
1. **Supabase auth down:**
   ```bash
   # Check Supabase status
   curl https://status.supabase.com
   # Wait for resolution or failover
   ```

2. **Rate limiting:**
   ```bash
   # Check rate limit logs
   # Reset rate limit for user
   # Adjust rate limit settings
   ```

3. **Session issues:**
   ```bash
   # Clear sessions
   # Check session timeout settings
   # Review session management code
   ```

---

## Maintenance Tasks

### Daily

```bash
# Check system health
./scripts/health-check-all.sh

# Review error logs
docker logs lastplateprod --since 24h 2>&1 | grep ERROR

# Check monitoring alerts
open https://sentry.io/organizations/your-org/issues/

# Review metrics
open https://uptimerobot.com
```

### Weekly

```bash
# Check for updates
npm outdated

# Review performance metrics
# Check disk usage
df -h

# Review security alerts
npm audit

# Backup verification
./scripts/verify-backups.sh
```

### Monthly

```bash
# Security audit
./scripts/security-audit.sh

# Dependency updates
npm update
npm audit fix

# Performance review
# Review and optimize slow queries

# Backup restoration test
./scripts/test-backup-restore.sh
```

---

## Emergency Procedures

### System Down (P1)

**Immediate Actions:**
1. Check health endpoint
2. Review error logs
3. Check infrastructure status
4. Notify team via Slack
5. Begin investigation

**Recovery Steps:**
```bash
# 1. Identify issue
docker logs lastplateprod --tail 100

# 2. Quick fix attempts
docker restart lastplateprod
# OR
kubectl rollout restart deployment/lastplateprod

# 3. If not resolved, rollback
kubectl rollout undo deployment/lastplateprod

# 4. Verify recovery
curl https://lastplateprod.com/health

# 5. Monitor for 30 minutes
```

### Data Breach (P1)

**Immediate Actions:**
1. **DO NOT** restart or modify systems
2. Notify Security Lead immediately
3. Preserve logs and evidence
4. Follow incident response plan
5. Notify legal team

**Initial Response:**
```bash
# 1. Isolate affected systems
# 2. Preserve evidence
docker logs lastplateprod > incident-logs.txt

# 3. Review audit logs
# 4. Identify scope of breach
# 5. Begin containment
```

### Database Corruption (P1)

**Immediate Actions:**
1. Stop writes to database
2. Notify Technical Lead
3. Assess damage
4. Begin recovery

**Recovery Steps:**
```bash
# 1. Stop application
kubectl scale deployment/lastplateprod --replicas=0

# 2. Assess corruption
# Connect to database and check

# 3. Restore from backup
./scripts/restore-backup.sh latest

# 4. Verify data integrity
./scripts/verify-data.sh

# 5. Restart application
kubectl scale deployment/lastplateprod --replicas=3

# 6. Monitor closely
```

---

## Monitoring Queries

### Check Error Rate

```bash
# Last hour
docker logs lastplateprod --since 1h 2>&1 | grep ERROR | wc -l

# By error type
docker logs lastplateprod --since 1h 2>&1 | grep ERROR | sort | uniq -c | sort -rn
```

### Check Response Times

```bash
# Average response time
docker logs lastplateprod --since 1h | grep "response_time" | awk '{sum+=$NF; count++} END {print sum/count}'

# Slow requests (>1s)
docker logs lastplateprod --since 1h | grep "response_time" | awk '$NF > 1000'
```

### Check Active Users

```sql
-- Current active sessions
SELECT count(DISTINCT user_id) 
FROM sessions 
WHERE last_activity > now() - interval '15 minutes';

-- Users by location
SELECT location_id, count(*) 
FROM users 
WHERE last_login > now() - interval '24 hours' 
GROUP BY location_id;
```

### Check Database Performance

```sql
-- Connection count
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Useful Commands

### Docker

```bash
# View running containers
docker ps

# View all containers
docker ps -a

# Container stats
docker stats

# Execute command in container
docker exec -it lastplateprod sh

# View container details
docker inspect lastplateprod

# Remove stopped containers
docker container prune
```

### Kubernetes

```bash
# Get pods
kubectl get pods

# Describe pod
kubectl describe pod lastplateprod-xxx

# Get logs
kubectl logs lastplateprod-xxx

# Execute command
kubectl exec -it lastplateprod-xxx -- sh

# Port forward
kubectl port-forward lastplateprod-xxx 8080:8080

# Get events
kubectl get events --sort-by='.lastTimestamp'
```

### Database

```bash
# Connect to database
psql -h db.supabase.co -U postgres -d postgres

# Backup database
pg_dump -h db.supabase.co -U postgres -d postgres > backup.sql

# Restore database
psql -h db.supabase.co -U postgres -d postgres < backup.sql

# Check database size
psql -h db.supabase.co -U postgres -d postgres -c "SELECT pg_size_pretty(pg_database_size('postgres'));"
```

---

## Escalation Paths

### P1 - Critical
1. On-Call Engineer (immediate)
2. Technical Lead (15 minutes)
3. CTO (30 minutes)
4. CEO (1 hour)

### P2 - High
1. On-Call Engineer (1 hour)
2. Technical Lead (4 hours)
3. CTO (next business day)

### P3 - Medium
1. On-Call Engineer (4 hours)
2. Technical Lead (next business day)

### P4 - Low
1. Create ticket
2. Assign to appropriate team
3. Address in next sprint

---

## Additional Resources

- [OPERATIONAL_HANDBOOK.md](OPERATIONAL_HANDBOOK.md) - Full operational guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md) - DR procedures
- [SYSTEM_DOCUMENTATION.md](docs/SYSTEM_DOCUMENTATION.md) - Technical docs

---

**Last Updated:** 2025-12-14  
**Maintained By:** DevOps Team  
**Review Schedule:** Monthly
