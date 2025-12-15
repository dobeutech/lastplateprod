# Disaster Recovery Plan

**Project:** lastplateprod  
**Version:** 2.0.0  
**Last Updated:** 2025-12-14  
**Review Schedule:** Quarterly

---

## Executive Summary

This document outlines the disaster recovery procedures for the lastplateprod application. It defines recovery objectives, procedures, and responsibilities for various disaster scenarios.

### Recovery Objectives

- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 1 hour
- **Availability Target:** 99.9% (8.76 hours downtime/year)

---

## Table of Contents

1. [Disaster Scenarios](#disaster-scenarios)
2. [Backup Strategy](#backup-strategy)
3. [Recovery Procedures](#recovery-procedures)
4. [Testing & Validation](#testing--validation)
5. [Roles & Responsibilities](#roles--responsibilities)
6. [Communication Plan](#communication-plan)

---

## Disaster Scenarios

### 1. Complete System Failure

**Scenario:** Entire production environment unavailable

**Impact:** All users affected, complete service outage

**Recovery Priority:** P1 - Critical

**Estimated RTO:** 2-4 hours

**Recovery Steps:**
1. Activate disaster recovery team
2. Assess scope of failure
3. Deploy to backup infrastructure
4. Restore from latest backup
5. Verify functionality
6. Switch DNS to backup
7. Monitor for stability

### 2. Database Corruption/Loss

**Scenario:** Database data corrupted or lost

**Impact:** Data integrity compromised

**Recovery Priority:** P1 - Critical

**Estimated RTO:** 1-2 hours

**Recovery Steps:**
1. Stop all writes to database
2. Assess extent of corruption
3. Restore from latest backup
4. Verify data integrity
5. Resume operations
6. Investigate root cause

### 3. Security Breach

**Scenario:** Unauthorized access or data breach

**Impact:** Security and data privacy compromised

**Recovery Priority:** P1 - Critical

**Estimated RTO:** Immediate containment, 4-8 hours recovery

**Recovery Steps:**
1. Isolate affected systems
2. Preserve evidence
3. Notify security team
4. Assess breach scope
5. Rotate all credentials
6. Deploy security patches
7. Notify affected users
8. Legal/compliance notification

### 4. Regional Outage

**Scenario:** Cloud provider region unavailable

**Impact:** Service unavailable in affected region

**Recovery Priority:** P1 - Critical

**Estimated RTO:** 2-4 hours

**Recovery Steps:**
1. Verify outage scope
2. Activate failover region
3. Update DNS records
4. Verify service availability
5. Monitor performance
6. Communicate with users

### 5. Data Center Failure

**Scenario:** Physical data center unavailable

**Impact:** Infrastructure unavailable

**Recovery Priority:** P1 - Critical

**Estimated RTO:** 4-8 hours

**Recovery Steps:**
1. Confirm data center status
2. Activate backup data center
3. Deploy application
4. Restore data
5. Update routing
6. Verify functionality

---

## Backup Strategy

### Database Backups

#### Automated Backups (Supabase)
- **Frequency:** Daily at 2:00 AM UTC
- **Retention:** 30 days
- **Type:** Full database backup
- **Location:** Supabase managed storage
- **Encryption:** AES-256

#### Manual Backups
- **Frequency:** Before major changes
- **Retention:** 90 days
- **Type:** Full database export
- **Location:** Separate cloud storage
- **Verification:** Monthly restoration test

#### Backup Verification
```bash
# Weekly verification
./scripts/verify-backup.sh

# Monthly restoration test
./scripts/test-restore.sh
```

### Application Backups

#### Code Repository
- **Location:** GitHub
- **Branches:** main, staging, develop
- **Tags:** All releases
- **Backup:** GitHub automatic backup

#### Configuration
- **Location:** Git repository
- **Files:** .env.example, configs
- **Secrets:** Separate secure storage
- **Backup:** Version controlled

#### Docker Images
- **Location:** GitHub Container Registry
- **Retention:** All tagged versions
- **Cleanup:** Manual for old versions
- **Backup:** Registry replication

### Infrastructure as Code

#### Terraform/CloudFormation
- **Location:** Git repository
- **State:** Remote backend
- **Backup:** Version controlled
- **Validation:** Pre-commit hooks

---

## Recovery Procedures

### Procedure 1: Database Recovery

#### Prerequisites
- Access to Supabase dashboard
- Database credentials
- Backup verification completed

#### Steps

**1. Stop Application (5 minutes)**
```bash
# Stop all instances
kubectl scale deployment/lastplateprod --replicas=0

# Verify stopped
kubectl get pods -l app=lastplateprod
```

**2. Assess Damage (10 minutes)**
```sql
-- Connect to database
psql -h db.supabase.co -U postgres -d postgres

-- Check table counts
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Check for corruption
SELECT * FROM pg_stat_database;
```

**3. Restore from Backup (30-60 minutes)**
```bash
# Via Supabase Dashboard
1. Go to Database > Backups
2. Select latest backup
3. Click "Restore"
4. Confirm restoration
5. Wait for completion

# OR via CLI
supabase db restore --backup-id <backup-id>
```

**4. Verify Data Integrity (15 minutes)**
```sql
-- Check row counts
SELECT count(*) FROM users;
SELECT count(*) FROM inventory_items;
SELECT count(*) FROM purchase_orders;

-- Check recent data
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- Verify relationships
SELECT 
  u.id, u.email, l.name as location
FROM users u
LEFT JOIN locations l ON u.location_id = l.id
LIMIT 10;
```

**5. Restart Application (10 minutes)**
```bash
# Start instances
kubectl scale deployment/lastplateprod --replicas=3

# Verify health
curl https://lastplateprod.com/health

# Check logs
kubectl logs -l app=lastplateprod --tail=50
```

**6. Monitor (30 minutes)**
```bash
# Watch for errors
kubectl logs -l app=lastplateprod -f

# Check Sentry
open https://sentry.io/organizations/your-org/issues/

# Monitor metrics
# Check response times
# Verify user logins
```

**Total Estimated Time:** 1.5-2 hours

### Procedure 2: Complete System Recovery

#### Prerequisites
- Backup infrastructure available
- Latest backups verified
- DNS access
- Deployment credentials

#### Steps

**1. Activate DR Team (5 minutes)**
- Notify all team members
- Assign roles
- Establish communication channel
- Begin incident log

**2. Deploy to Backup Infrastructure (30 minutes)**
```bash
# Clone repository
git clone https://github.com/dobeutech/lastplateprod.git
cd lastplateprod

# Checkout latest stable version
git checkout v2.0.0

# Set environment variables
cp .env.backup .env
# Edit with backup infrastructure details

# Build and deploy
docker build -t lastplateprod:recovery .
docker push ghcr.io/dobeutech/lastplateprod:recovery

# Deploy to backup cluster
kubectl config use-context backup-cluster
kubectl apply -f k8s/production/
```

**3. Restore Database (60 minutes)**
```bash
# Follow Procedure 1: Database Recovery
# Use latest backup
# Verify data integrity
```

**4. Update DNS (15 minutes)**
```bash
# Update DNS records to point to backup infrastructure
# TTL should be low (300 seconds)
# Monitor DNS propagation

# Verify
dig lastplateprod.com
curl https://lastplateprod.com/health
```

**5. Verify Functionality (30 minutes)**
```bash
# Test critical paths
- User login
- Inventory operations
- Purchase orders
- Reports generation

# Check integrations
- Supabase connection
- Sentry reporting
- Email notifications

# Monitor metrics
- Response times
- Error rates
- User activity
```

**6. Monitor and Stabilize (2 hours)**
```bash
# Continuous monitoring
kubectl logs -l app=lastplateprod -f

# Check metrics every 15 minutes
# Review Sentry for errors
# Monitor user feedback
# Document issues
```

**Total Estimated Time:** 4-5 hours

### Procedure 3: Security Breach Recovery

#### Prerequisites
- Security team activated
- Evidence preservation tools
- Communication templates
- Legal team notified

#### Steps

**1. Immediate Containment (15 minutes)**
```bash
# Isolate affected systems
kubectl scale deployment/lastplateprod --replicas=0

# Block suspicious IPs
# Disable compromised accounts
# Preserve logs
docker logs lastplateprod > breach-logs-$(date +%Y%m%d-%H%M%S).txt
```

**2. Assess Breach Scope (1-2 hours)**
```bash
# Review audit logs
SELECT * FROM audit_log 
WHERE created_at > now() - interval '24 hours'
ORDER BY created_at DESC;

# Check for unauthorized access
SELECT * FROM audit_log 
WHERE action LIKE '%unauthorized%'
OR action LIKE '%failed%';

# Identify affected data
# Document timeline
# Preserve evidence
```

**3. Rotate All Credentials (30 minutes)**
```bash
# Database passwords
# API keys
# Service account tokens
# User sessions (force logout)
# SSH keys
# SSL certificates (if compromised)

# Update in all environments
# Update in secret management
# Notify team of changes
```

**4. Deploy Security Patches (1 hour)**
```bash
# Apply security updates
npm audit fix

# Update dependencies
npm update

# Deploy patches
git checkout -b security-patch
# Make changes
git commit -m "security: apply emergency patches"
git push

# Deploy to production
kubectl apply -f k8s/production/
```

**5. Restore Service (1 hour)**
```bash
# Verify security measures
# Deploy to production
kubectl scale deployment/lastplateprod --replicas=3

# Monitor closely
kubectl logs -l app=lastplateprod -f

# Verify no suspicious activity
```

**6. Notification and Reporting (2-4 hours)**
```bash
# Notify affected users
# Prepare incident report
# Legal/compliance notification
# Public disclosure (if required)
# Post-mortem planning
```

**Total Estimated Time:** 6-10 hours

---

## Testing & Validation

### Quarterly DR Drill

#### Objectives
- Validate recovery procedures
- Train team members
- Identify gaps
- Update documentation

#### Drill Scenarios
1. **Q1:** Database corruption recovery
2. **Q2:** Complete system failure
3. **Q3:** Security breach response
4. **Q4:** Regional outage failover

#### Drill Process
```bash
# 1. Schedule drill (2 weeks notice)
# 2. Prepare test environment
# 3. Execute drill
# 4. Document results
# 5. Identify improvements
# 6. Update procedures
```

### Monthly Backup Verification

```bash
# Automated verification
./scripts/verify-backup.sh

# Manual verification
1. Select random backup
2. Restore to test environment
3. Verify data integrity
4. Test application functionality
5. Document results
```

### Weekly Health Checks

```bash
# Backup status
./scripts/check-backups.sh

# Infrastructure health
./scripts/check-infrastructure.sh

# Security posture
./scripts/security-check.sh
```

---

## Roles & Responsibilities

### Disaster Recovery Team

#### Incident Commander
- **Role:** Overall coordination
- **Responsibilities:**
  - Activate DR team
  - Make critical decisions
  - Coordinate communication
  - Approve recovery steps
- **Contact:** Technical Lead

#### Technical Lead
- **Role:** Technical recovery
- **Responsibilities:**
  - Execute recovery procedures
  - Coordinate technical team
  - Verify system functionality
  - Document technical details
- **Contact:** TBD

#### Database Administrator
- **Role:** Database recovery
- **Responsibilities:**
  - Restore database
  - Verify data integrity
  - Optimize performance
  - Document database state
- **Contact:** TBD

#### Security Lead
- **Role:** Security assessment
- **Responsibilities:**
  - Assess security impact
  - Coordinate breach response
  - Implement security measures
  - Document security events
- **Contact:** TBD

#### Communications Lead
- **Role:** Stakeholder communication
- **Responsibilities:**
  - Notify stakeholders
  - Update status page
  - Coordinate with PR
  - Document communications
- **Contact:** Product Owner

---

## Communication Plan

### Internal Communication

#### Activation
```
🚨 DISASTER RECOVERY ACTIVATED

Scenario: [Description]
Severity: P1 - Critical
Incident Commander: @tech-lead
War Room: #dr-incident-response

All hands on deck. Check #dr-incident-response for updates.
```

#### Status Updates (Every 30 minutes)
```
📊 DR UPDATE - [Time]

Status: [In Progress/Resolved]
Current Step: [Step description]
ETA: [Estimated completion]
Blockers: [Any issues]

Next Update: [Time]
```

#### Resolution
```
✅ DISASTER RECOVERY COMPLETE

Duration: [X hours]
Impact: [Description]
Root Cause: [Summary]

Post-Mortem: Scheduled for [Date/Time]

Thank you to the team for the quick response.
```

### External Communication

#### User Notification
```
Subject: Service Disruption - lastplateprod

Dear Valued Customer,

We are currently experiencing a service disruption affecting 
[description of impact]. Our team is actively working to restore 
service.

Status: [Current status]
ETA: [Estimated resolution time]
Updates: [Status page URL]

We apologize for the inconvenience and appreciate your patience.

Best regards,
lastplateprod Team
```

#### Status Page Updates
- Update every 30 minutes
- Clear, non-technical language
- Realistic ETAs
- Contact information

---

## Post-Disaster Activities

### Immediate (Within 24 hours)
- [ ] Verify all systems operational
- [ ] Document timeline
- [ ] Collect metrics
- [ ] Initial debrief

### Short-term (Within 1 week)
- [ ] Conduct post-mortem
- [ ] Identify root cause
- [ ] Create action items
- [ ] Update procedures
- [ ] Train team on learnings

### Long-term (Within 1 month)
- [ ] Implement improvements
- [ ] Update DR plan
- [ ] Conduct follow-up drill
- [ ] Review with stakeholders

---

## Appendices

### A. Contact List

**Emergency Contacts:**
- On-Call: [Rotation schedule]
- Technical Lead: TBD
- Security Lead: TBD
- DevOps Lead: TBD
- Product Owner: TBD

**External Contacts:**
- Supabase Support: support@supabase.com
- Sentry Support: support@sentry.io
- Cloud Provider: TBD
- Legal: TBD

### B. Critical Credentials

**Location:** Secure password manager

**Required Access:**
- Supabase admin
- GitHub admin
- Cloud provider admin
- DNS management
- Secret management

### C. Recovery Checklists

**Database Recovery:**
- [ ] Stop application
- [ ] Assess damage
- [ ] Restore backup
- [ ] Verify integrity
- [ ] Restart application
- [ ] Monitor

**System Recovery:**
- [ ] Activate DR team
- [ ] Deploy to backup
- [ ] Restore database
- [ ] Update DNS
- [ ] Verify functionality
- [ ] Monitor

**Security Breach:**
- [ ] Contain breach
- [ ] Assess scope
- [ ] Rotate credentials
- [ ] Deploy patches
- [ ] Restore service
- [ ] Notify users

---

## Document Control

**Version History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-14 | Initial version | Ona |

**Review Schedule:** Quarterly

**Next Review:** 2025-03-14

**Approvals:**
- [ ] Technical Lead
- [ ] Security Lead
- [ ] DevOps Lead
- [ ] Product Owner
- [ ] Legal

---

**This is a living document. Update after each incident and quarterly review.**
