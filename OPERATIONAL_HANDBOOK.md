# Operational Handbook & Standards

**Project:** lastplateprod  
**Version:** 2.0.0  
**Last Updated:** 2025-12-14  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Team Structure](#team-structure)
3. [Development Standards](#development-standards)
4. [Security Standards](#security-standards)
5. [Deployment Procedures](#deployment-procedures)
6. [Monitoring & Alerting](#monitoring--alerting)
7. [Incident Response](#incident-response)
8. [Maintenance Procedures](#maintenance-procedures)
9. [Communication Protocols](#communication-protocols)
10. [Compliance & Audit](#compliance--audit)

---

## Overview

### Mission
Provide a secure, reliable, and scalable restaurant management system that meets enterprise-grade standards.

### Core Values
- **Security First** - Never compromise on security
- **Reliability** - 99.9% uptime target
- **Transparency** - Clear communication and documentation
- **Continuous Improvement** - Regular reviews and updates

### System Architecture
See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed diagrams and component descriptions.

---

## Team Structure

### Roles & Responsibilities

#### Technical Lead
- **Responsibilities:**
  - Architecture decisions
  - Code review approval
  - Security oversight
  - Performance optimization
- **Contact:** TBD
- **Escalation:** CTO

#### DevOps Lead
- **Responsibilities:**
  - Infrastructure management
  - CI/CD pipeline
  - Deployment automation
  - Monitoring setup
- **Contact:** TBD
- **Escalation:** Technical Lead

#### Security Lead
- **Responsibilities:**
  - Security audits
  - Vulnerability management
  - Compliance oversight
  - Incident response
- **Contact:** TBD
- **Escalation:** Technical Lead

#### Product Owner
- **Responsibilities:**
  - Feature prioritization
  - User acceptance
  - Stakeholder communication
  - Roadmap planning
- **Contact:** TBD
- **Escalation:** CEO

### On-Call Rotation
- **Schedule:** 24/7 coverage
- **Rotation:** Weekly
- **Response Time:** 15 minutes for critical, 1 hour for high
- **Escalation Path:** On-call → Technical Lead → CTO

---

## Development Standards

### Code Quality

#### TypeScript Standards
```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// ❌ Bad
interface User {
  id: any;
  email: string;
  role: string;
}
```

**Requirements:**
- Strict TypeScript mode enabled
- No `any` types without justification
- Proper interface definitions
- JSDoc comments for complex functions

#### Code Review Checklist
- [ ] TypeScript types properly defined
- [ ] Error handling implemented
- [ ] Logging added for important operations
- [ ] Security considerations addressed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No hardcoded secrets

#### Testing Standards
```typescript
// Unit test example
describe('InventoryAPI', () => {
  it('should fetch all items', async () => {
    const items = await InventoryAPI.getAll();
    expect(items).toBeInstanceOf(Array);
  });
});
```

**Requirements:**
- Unit tests for all utilities
- Component tests for UI
- Integration tests for APIs
- E2E tests for critical flows
- Minimum 80% code coverage

### Git Workflow

#### Branch Naming
```
feature/DBS-123-add-inventory-search
bugfix/DBS-124-fix-login-error
hotfix/DBS-125-security-patch
```

#### Commit Messages
```
feat: add inventory search functionality

- Implement search API endpoint
- Add search UI component
- Update documentation

Closes DBS-123

Co-authored-by: Ona <no-reply@ona.com>
```

**Format:**
- Type: feat, fix, docs, style, refactor, test, chore
- Subject: imperative mood, lowercase, no period
- Body: what and why, not how
- Footer: issue references, breaking changes

#### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Run all checks: `./scripts/tools/all-checks.sh`
4. Create PR with template
5. Request review from 2+ team members
6. Address feedback
7. Merge after approval (squash and merge)

### Code Organization

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── lib/              # Core libraries
│   ├── api/         # API clients
│   ├── utils/       # Utility functions
│   └── types/       # TypeScript types
├── styles/          # Global styles
└── tests/           # Test files
```

---

## Security Standards

### Authentication & Authorization

#### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

#### Session Management
- Session timeout: 1 hour (production)
- Activity tracking enabled
- Automatic logout on timeout
- Session refresh on activity

#### Rate Limiting
```typescript
// Login attempts
- 5 attempts per 15 minutes
- 30-minute lockout after limit

// API requests
- 100 requests per minute per user

// Password reset
- 3 attempts per hour
```

### Data Protection

#### Sensitive Data Handling
```typescript
// ✅ Good - Never log sensitive data
logger.info('User logged in', { userId: user.id });

// ❌ Bad - Exposes sensitive data
logger.info('User logged in', { 
  userId: user.id, 
  password: user.password // NEVER DO THIS
});
```

#### Encryption Standards
- Data at rest: AES-256
- Data in transit: TLS 1.3
- Database: Supabase encryption
- Secrets: Environment variables only

### Security Checklist

#### Before Deployment
- [ ] No hardcoded secrets
- [ ] Environment variables validated
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] HTTPS enforced
- [ ] RLS policies tested
- [ ] Vulnerability scan passed
- [ ] Dependency audit clean

#### Regular Security Tasks
- **Daily:** Monitor security alerts
- **Weekly:** Review audit logs
- **Monthly:** Security audit
- **Quarterly:** Penetration testing
- **Annually:** Compliance review

---

## Deployment Procedures

### Pre-Deployment Checklist

#### Code Quality
- [ ] All tests passing
- [ ] Code review approved
- [ ] No linting errors
- [ ] TypeScript compilation successful
- [ ] Bundle size acceptable (<1MB)

#### Security
- [ ] Secrets not in code
- [ ] Environment variables set
- [ ] Security scan passed
- [ ] Dependencies updated
- [ ] Vulnerability scan clean

#### Documentation
- [ ] CHANGELOG updated
- [ ] API docs updated
- [ ] README updated if needed
- [ ] Deployment notes prepared

### Deployment Process

#### Staging Deployment
```bash
# 1. Merge to staging branch
git checkout staging
git merge main

# 2. Run tests
npm run test

# 3. Build
npm run build

# 4. Deploy to staging
./scripts/deploy-staging.sh

# 5. Smoke tests
./scripts/smoke-tests.sh staging

# 6. Notify team
```

#### Production Deployment
```bash
# 1. Create release tag
git tag -a v2.0.0 -m "Release v2.0.0"

# 2. Build Docker image
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  -t lastplateprod:v2.0.0 .

# 3. Push to registry
docker push ghcr.io/dobeutech/lastplateprod:v2.0.0

# 4. Deploy
kubectl apply -f k8s/production/

# 5. Health check
curl https://lastplateprod.com/health

# 6. Monitor for 1 hour
```

### Rollback Procedure

#### Immediate Rollback (Critical Issues)
```bash
# 1. Identify previous stable version
git log --oneline -10

# 2. Rollback deployment
kubectl rollout undo deployment/lastplateprod

# 3. Verify health
curl https://lastplateprod.com/health

# 4. Notify team
# 5. Create incident report
```

#### Planned Rollback
```bash
# 1. Notify users (maintenance window)
# 2. Create database backup
# 3. Deploy previous version
# 4. Verify functionality
# 5. Monitor for issues
```

---

## Monitoring & Alerting

### Key Metrics

#### Application Metrics
- **Response Time:** <100ms (p95)
- **Error Rate:** <0.1%
- **Uptime:** >99.9%
- **API Success Rate:** >99.5%

#### Infrastructure Metrics
- **CPU Usage:** <70%
- **Memory Usage:** <80%
- **Disk Usage:** <85%
- **Network Latency:** <50ms

#### Business Metrics
- **Active Users:** Daily tracking
- **Feature Usage:** Weekly analysis
- **Conversion Rate:** Monthly review
- **Customer Satisfaction:** Quarterly survey

### Alert Levels

#### Critical (P1)
- **Response Time:** Immediate (15 minutes)
- **Examples:**
  - System down
  - Data breach
  - Authentication failure
  - Database unavailable
- **Notification:** Phone call + SMS + Slack

#### High (P2)
- **Response Time:** 1 hour
- **Examples:**
  - High error rate (>1%)
  - Slow response time (>500ms)
  - Failed deployment
  - Security vulnerability
- **Notification:** SMS + Slack

#### Medium (P3)
- **Response Time:** 4 hours
- **Examples:**
  - Elevated error rate (>0.5%)
  - Performance degradation
  - Non-critical feature failure
- **Notification:** Slack + Email

#### Low (P4)
- **Response Time:** Next business day
- **Examples:**
  - Minor UI issues
  - Documentation updates
  - Non-urgent improvements
- **Notification:** Email

### Monitoring Tools

#### Sentry (Error Tracking)
- **URL:** https://sentry.io/organizations/your-org
- **Alerts:** Configured for error spikes
- **Review:** Daily by on-call engineer

#### Uptime Monitoring
- **Tool:** UptimeRobot or Pingdom
- **Checks:** Every 5 minutes
- **Endpoints:**
  - https://lastplateprod.com/health
  - https://lastplateprod.com/api/health

#### Performance Monitoring
- **Tool:** Lighthouse CI
- **Frequency:** Every deployment
- **Thresholds:**
  - Performance: >90
  - Accessibility: >90
  - Best Practices: >90
  - SEO: >90

---

## Incident Response

### Incident Classification

#### Severity Levels

**P1 - Critical**
- System completely down
- Data breach or security incident
- Data loss or corruption
- Authentication system failure

**P2 - High**
- Major feature unavailable
- Significant performance degradation
- Security vulnerability discovered
- Affecting >50% of users

**P3 - Medium**
- Minor feature unavailable
- Moderate performance issues
- Affecting <50% of users
- Workaround available

**P4 - Low**
- Cosmetic issues
- Minor bugs
- Documentation errors
- Affecting <10% of users

### Incident Response Process

#### 1. Detection (0-5 minutes)
- Alert received via monitoring
- User report via support
- Team member discovery

#### 2. Triage (5-15 minutes)
- Assess severity
- Identify affected systems
- Determine impact
- Assign incident commander

#### 3. Response (15 minutes - 4 hours)
- Notify stakeholders
- Begin investigation
- Implement fix or workaround
- Monitor for resolution

#### 4. Resolution (Varies)
- Deploy fix
- Verify resolution
- Monitor for recurrence
- Update status page

#### 5. Post-Mortem (Within 48 hours)
- Document timeline
- Identify root cause
- List action items
- Share learnings

### Communication Templates

#### Incident Notification
```
🚨 INCIDENT ALERT - P1

Title: Authentication System Down
Status: Investigating
Impact: All users unable to login
Started: 2025-12-14 10:30 UTC
ETA: Unknown

Incident Commander: @tech-lead
Updates: Every 15 minutes

#incident-response
```

#### Status Update
```
📊 INCIDENT UPDATE - P1

Title: Authentication System Down
Status: Fix deployed, monitoring
Impact: Service restored
Duration: 45 minutes

Root Cause: Database connection pool exhausted
Fix: Increased pool size, added monitoring

Next Update: 30 minutes or when resolved

#incident-response
```

#### Resolution Notice
```
✅ INCIDENT RESOLVED - P1

Title: Authentication System Down
Status: Resolved
Duration: 1 hour 15 minutes
Impact: All users affected

Root Cause: Database connection pool exhausted
Fix: Increased pool size from 10 to 50
Prevention: Added connection pool monitoring

Post-Mortem: Will be published within 48 hours

Thank you for your patience.

#incident-response
```

---

## Maintenance Procedures

### Daily Tasks

#### On-Call Engineer
- [ ] Check monitoring dashboards
- [ ] Review error logs in Sentry
- [ ] Check system health
- [ ] Review security alerts
- [ ] Respond to incidents

### Weekly Tasks

#### Team Lead
- [ ] Review performance metrics
- [ ] Check dependency updates
- [ ] Review open issues
- [ ] Plan sprint work
- [ ] Team sync meeting

### Monthly Tasks

#### Technical Lead
- [ ] Security audit
- [ ] Performance review
- [ ] Dependency updates
- [ ] Backup restoration test
- [ ] Documentation review

### Quarterly Tasks

#### Leadership Team
- [ ] Disaster recovery drill
- [ ] Penetration testing
- [ ] Compliance review
- [ ] Architecture review
- [ ] Roadmap planning

### Database Maintenance

#### Backup Schedule
- **Frequency:** Daily at 2 AM UTC
- **Retention:** 30 days
- **Location:** Supabase automatic backups
- **Verification:** Weekly restoration test

#### Backup Restoration Test
```bash
# 1. Create test environment
# 2. Restore latest backup
# 3. Verify data integrity
# 4. Test critical operations
# 5. Document results
```

### Dependency Updates

#### Process
```bash
# 1. Check for updates
npm outdated

# 2. Review changelogs
# 3. Update in development
npm update

# 4. Run tests
npm test

# 5. Deploy to staging
# 6. Monitor for issues
# 7. Deploy to production
```

#### Schedule
- **Security patches:** Immediate
- **Minor updates:** Weekly
- **Major updates:** Monthly (with testing)

---

## Communication Protocols

### Channels

#### Slack Channels
- `#lastplateprod-general` - General discussion
- `#lastplateprod-dev` - Development updates
- `#lastplateprod-alerts` - Automated alerts
- `#lastplateprod-incidents` - Incident response
- `#lastplateprod-deploys` - Deployment notifications

#### Email Lists
- `dev@lastplateprod.com` - Development team
- `ops@lastplateprod.com` - Operations team
- `security@lastplateprod.com` - Security team
- `all@lastplateprod.com` - All team members

### Meeting Schedule

#### Daily Standup
- **Time:** 9:00 AM local time
- **Duration:** 15 minutes
- **Format:** What did you do? What will you do? Any blockers?

#### Weekly Planning
- **Time:** Monday 10:00 AM
- **Duration:** 1 hour
- **Agenda:** Review sprint, plan work, discuss blockers

#### Monthly Review
- **Time:** First Friday of month
- **Duration:** 2 hours
- **Agenda:** Metrics review, retrospective, planning

#### Quarterly Planning
- **Time:** First week of quarter
- **Duration:** Half day
- **Agenda:** Roadmap review, goal setting, team building

### Status Updates

#### Development Updates
```markdown
## Weekly Update - Week of Dec 14, 2025

### Completed
- Implemented inventory API
- Fixed authentication bug
- Updated documentation

### In Progress
- ESG reports page
- Multi-location support
- Performance optimization

### Blocked
- Waiting for design approval on settings page

### Next Week
- Complete ESG reports
- Deploy to staging
- Begin testing phase
```

---

## Compliance & Audit

### Data Privacy

#### GDPR Compliance
- [ ] Privacy policy published
- [ ] Cookie consent implemented
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Consent management
- [ ] Data processing agreements

#### Data Retention
- **User Data:** Retained while account active
- **Audit Logs:** 1 year
- **Backups:** 30 days
- **Analytics:** 90 days
- **Error Logs:** 30 days

### Security Compliance

#### SOC 2 Requirements (Future)
- [ ] Access controls documented
- [ ] Change management process
- [ ] Incident response plan
- [ ] Business continuity plan
- [ ] Vendor management

#### Security Audit Schedule
- **Internal:** Monthly
- **External:** Quarterly
- **Penetration Testing:** Annually
- **Compliance Review:** Annually

### Audit Logging

#### What to Log
```typescript
// ✅ Log these events
- User authentication (success/failure)
- Role changes
- Permission changes
- Data access (sensitive)
- Configuration changes
- Security events

// ❌ Don't log these
- Passwords
- API keys
- Personal data (unless required)
- Credit card numbers
```

#### Audit Log Retention
- **Duration:** 1 year minimum
- **Storage:** Supabase audit_log table
- **Access:** Admin and security team only
- **Review:** Monthly by security team

---

## Appendices

### A. Glossary

**RLS** - Row Level Security  
**CRUD** - Create, Read, Update, Delete  
**API** - Application Programming Interface  
**CI/CD** - Continuous Integration/Continuous Deployment  
**P1/P2/P3/P4** - Priority levels (1=highest)  
**SLA** - Service Level Agreement  
**RTO** - Recovery Time Objective  
**RPO** - Recovery Point Objective

### B. Contact Information

**Emergency Contacts:**
- On-Call Engineer: [On-call rotation]
- Technical Lead: TBD
- Security Lead: TBD
- DevOps Lead: TBD

**External Contacts:**
- Supabase Support: support@supabase.com
- Sentry Support: support@sentry.io
- Hosting Provider: TBD

### C. Related Documents

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [PRODUCTION_READY_SUMMARY.md](PRODUCTION_READY_SUMMARY.md) - Production guide
- [SECURITY_AUDIT_SUMMARY.md](SECURITY_AUDIT_SUMMARY.md) - Security audit
- [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md) - DR plan (to be created)
- [RUNBOOK.md](RUNBOOK.md) - Operations runbook (to be created)

### D. Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-14 | 1.0.0 | Initial version | Ona |

---

## Approval

**Prepared By:** Ona (AI Agent)  
**Date:** 2025-12-14  
**Status:** Draft - Pending Review

**Approvals Required:**
- [ ] Technical Lead
- [ ] Security Lead
- [ ] DevOps Lead
- [ ] Product Owner

---

**This is a living document. Review and update quarterly or after major incidents.**
