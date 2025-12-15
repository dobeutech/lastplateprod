# System Architecture

## Overview

This document provides a visual representation of the lastplateprod system architecture, including authentication flows, monitoring, and infrastructure components.

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "CDN/Edge"
        CDN[CDN/Static Assets]
        WAF[Web Application Firewall]
    end

    subgraph "Application Layer"
        Nginx[Nginx Web Server]
        React[React Application]
        
        subgraph "Core Services"
            Auth[Authentication Service]
            Session[Session Manager]
            RateLimit[Rate Limiter]
            Health[Health Monitor]
        end
        
        subgraph "Utilities"
            Logger[Logger]
            Monitor[Error Monitor]
            API[API Client]
        end
    end

    subgraph "External Services"
        Supabase[Supabase]
        SupaAuth[Supabase Auth]
        SupaDB[(Supabase Database)]
        Sentry[Sentry Error Tracking]
        Intercom[Intercom Support]
    end

    subgraph "Infrastructure"
        Docker[Docker Container]
        GHCR[GitHub Container Registry]
        Actions[GitHub Actions CI/CD]
    end

    Browser --> WAF
    Mobile --> WAF
    WAF --> CDN
    CDN --> Nginx
    Nginx --> React
    
    React --> Auth
    React --> Session
    React --> API
    
    Auth --> RateLimit
    Auth --> SupaAuth
    Session --> Logger
    API --> RateLimit
    API --> SupaDB
    
    Logger --> Monitor
    Monitor --> Sentry
    Health --> SupaDB
    Health --> SupaAuth
    
    React -.-> Intercom
    
    Docker --> Nginx
    Actions --> Docker
    Actions --> GHCR
    
    style Auth fill:#4CAF50
    style Session fill:#4CAF50
    style RateLimit fill:#FF9800
    style Monitor fill:#2196F3
    style Sentry fill:#E91E63
    style Supabase fill:#3ECF8E
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant RateLimit
    participant Auth
    participant Supabase
    participant Session
    participant Logger

    User->>Browser: Enter credentials
    Browser->>RateLimit: Check rate limit
    
    alt Rate limit exceeded
        RateLimit-->>Browser: 429 Too Many Requests
        Browser-->>User: Show error message
    else Rate limit OK
        RateLimit->>Auth: Allow request
        Auth->>Supabase: signInWithPassword()
        
        alt Invalid credentials
            Supabase-->>Auth: Error
            Auth->>Logger: Log failed attempt
            Auth-->>Browser: Login failed
        else Valid credentials
            Supabase-->>Auth: Session + User
            Auth->>RateLimit: Reset counter
            Auth->>Session: Create session
            Session->>Logger: Audit log
            Auth-->>Browser: Success
            Browser-->>User: Redirect to dashboard
        end
    end
```

---

## Session Management Flow

```mermaid
stateDiagram-v2
    [*] --> NoSession
    NoSession --> Active: Login Success
    Active --> Active: User Activity
    Active --> Warning: 5 min before timeout
    Warning --> Active: User Activity
    Warning --> Expired: Timeout reached
    Active --> Expired: Inactivity timeout
    Expired --> NoSession: Cleanup
    Active --> NoSession: Logout
    
    note right of Active
        Session timeout: 1 hour (prod)
        Activity tracked on:
        - mousedown
        - keydown
        - scroll
        - touchstart
    end note
    
    note right of Warning
        UI shows warning
        5 minutes before expiry
    end note
```

---

## Error Monitoring Flow

```mermaid
graph LR
    subgraph "Application"
        Error[Error Occurs]
        Logger[Logger]
        Monitor[Error Monitor]
    end
    
    subgraph "Processing"
        Filter[Filter & Sanitize]
        Context[Add Context]
        Breadcrumb[Add Breadcrumbs]
    end
    
    subgraph "External"
        Sentry[Sentry]
        Alerts[Alert System]
        Dashboard[Monitoring Dashboard]
    end
    
    Error --> Logger
    Logger --> Monitor
    Monitor --> Filter
    Filter --> Context
    Context --> Breadcrumb
    Breadcrumb --> Sentry
    Sentry --> Alerts
    Sentry --> Dashboard
    
    style Error fill:#f44336
    style Sentry fill:#E91E63
    style Alerts fill:#FF9800
```

---

## Health Check System

```mermaid
graph TB
    subgraph "Health Monitor"
        Timer[5-minute Timer]
        Orchestrator[Health Orchestrator]
    end
    
    subgraph "Checks"
        DBCheck[Database Check]
        AuthCheck[Auth Check]
        StorageCheck[Storage Check]
    end
    
    subgraph "Results"
        Aggregate[Aggregate Results]
        Status{Overall Status}
    end
    
    subgraph "Actions"
        Healthy[Status: Healthy]
        Degraded[Status: Degraded]
        Unhealthy[Status: Unhealthy]
        Alert[Send Alert]
    end
    
    Timer --> Orchestrator
    Orchestrator --> DBCheck
    Orchestrator --> AuthCheck
    Orchestrator --> StorageCheck
    
    DBCheck --> Aggregate
    AuthCheck --> Aggregate
    StorageCheck --> Aggregate
    
    Aggregate --> Status
    
    Status -->|All Pass| Healthy
    Status -->|Some Warn| Degraded
    Status -->|Any Fail| Unhealthy
    
    Degraded --> Alert
    Unhealthy --> Alert
    
    style Healthy fill:#4CAF50
    style Degraded fill:#FF9800
    style Unhealthy fill:#f44336
```

---

## CI/CD Pipeline

```mermaid
graph LR
    subgraph "Trigger"
        Push[Git Push]
        PR[Pull Request]
    end
    
    subgraph "CI Pipeline"
        Checkout[Checkout Code]
        Lint[Lint & Type Check]
        Audit[Security Audit]
        Trivy[Trivy Scan]
        Build[Build Application]
    end
    
    subgraph "Docker Pipeline"
        DockerBuild[Build Docker Image]
        ImageScan[Scan Image]
        SBOM[Generate SBOM]
        Push2[Push to GHCR]
    end
    
    subgraph "Deployment"
        Deploy[Deploy to Production]
        HealthCheck[Health Check]
        Rollback{Success?}
    end
    
    Push --> Checkout
    PR --> Checkout
    
    Checkout --> Lint
    Lint --> Audit
    Audit --> Trivy
    Trivy --> Build
    
    Build --> DockerBuild
    DockerBuild --> ImageScan
    ImageScan --> SBOM
    SBOM --> Push2
    
    Push2 --> Deploy
    Deploy --> HealthCheck
    HealthCheck --> Rollback
    
    Rollback -->|Yes| Complete[Complete]
    Rollback -->|No| Revert[Revert Deployment]
    
    style Trivy fill:#2196F3
    style ImageScan fill:#2196F3
    style Rollback fill:#FF9800
```

---

## Data Flow

```mermaid
graph TB
    subgraph "User Actions"
        Login[Login]
        CRUD[CRUD Operations]
        Logout[Logout]
    end
    
    subgraph "Application Layer"
        UI[React UI]
        AuthCtx[Auth Context]
        APIClient[API Client]
    end
    
    subgraph "Middleware"
        RateLimit[Rate Limiter]
        Logger[Logger]
        Monitor[Error Monitor]
    end
    
    subgraph "Backend"
        Supabase[Supabase]
        DB[(Database)]
    end
    
    subgraph "Monitoring"
        Sentry[Sentry]
        Logs[Log Storage]
    end
    
    Login --> UI
    CRUD --> UI
    Logout --> UI
    
    UI --> AuthCtx
    UI --> APIClient
    
    AuthCtx --> RateLimit
    APIClient --> RateLimit
    
    RateLimit --> Logger
    RateLimit --> Supabase
    
    Supabase --> DB
    
    Logger --> Monitor
    Monitor --> Sentry
    Logger --> Logs
    
    style RateLimit fill:#FF9800
    style Logger fill:#2196F3
    style Monitor fill:#E91E63
```

---

## Component Architecture

```mermaid
graph TB
    subgraph "Pages"
        Dashboard[Dashboard]
        Inventory[Inventory]
        Orders[Purchase Orders]
        Vendors[Vendors]
        Settings[Settings]
    end
    
    subgraph "Shared Components"
        Header[Header]
        Sidebar[Sidebar]
        Nav[Navigation]
    end
    
    subgraph "UI Components"
        Button[Button]
        Input[Input]
        Card[Card]
        Table[Table]
        Dialog[Dialog]
    end
    
    subgraph "Contexts"
        AuthContext[Auth Context]
        ThemeContext[Theme Context]
    end
    
    subgraph "Hooks"
        useAuth[useAuth]
        useInventory[useInventory]
        useVendors[useVendors]
        usePO[usePurchaseOrders]
    end
    
    Dashboard --> Header
    Dashboard --> Sidebar
    Inventory --> Header
    Inventory --> Sidebar
    
    Header --> Nav
    Sidebar --> Nav
    
    Dashboard --> Card
    Dashboard --> Table
    Inventory --> Table
    Inventory --> Dialog
    
    Dashboard --> useAuth
    Dashboard --> useInventory
    Inventory --> useInventory
    Orders --> usePO
    Vendors --> useVendors
    
    useAuth --> AuthContext
    
    style AuthContext fill:#4CAF50
    style useAuth fill:#4CAF50
```

---

## Security Layers

```mermaid
graph TB
    subgraph "Network Security"
        WAF[Web Application Firewall]
        HTTPS[HTTPS/TLS]
        CORS[CORS Policy]
    end
    
    subgraph "Application Security"
        RateLimit[Rate Limiting]
        Auth[Authentication]
        Session[Session Management]
        CSRF[CSRF Protection]
    end
    
    subgraph "Data Security"
        Encryption[Data Encryption]
        Validation[Input Validation]
        Sanitization[Output Sanitization]
    end
    
    subgraph "Monitoring"
        AuditLog[Audit Logging]
        ErrorTrack[Error Tracking]
        HealthMon[Health Monitoring]
    end
    
    Internet[Internet] --> WAF
    WAF --> HTTPS
    HTTPS --> CORS
    CORS --> RateLimit
    
    RateLimit --> Auth
    Auth --> Session
    Session --> CSRF
    
    CSRF --> Validation
    Validation --> Encryption
    Encryption --> Sanitization
    
    Auth -.-> AuditLog
    Session -.-> AuditLog
    Validation -.-> ErrorTrack
    Encryption -.-> HealthMon
    
    style WAF fill:#f44336
    style Auth fill:#4CAF50
    style Encryption fill:#2196F3
    style AuditLog fill:#FF9800
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DevEnv[Local Development]
        DevDB[(Dev Database)]
    end
    
    subgraph "CI/CD"
        GitHub[GitHub Repository]
        Actions[GitHub Actions]
        GHCR[Container Registry]
    end
    
    subgraph "Staging"
        StagingContainer[Staging Container]
        StagingDB[(Staging Database)]
    end
    
    subgraph "Production"
        ProdContainer[Production Container]
        LoadBalancer[Load Balancer]
        ProdDB[(Production Database)]
        CDN[CDN]
    end
    
    subgraph "Monitoring"
        Sentry[Sentry]
        Uptime[Uptime Monitor]
        Logs[Log Aggregation]
    end
    
    DevEnv --> GitHub
    DevEnv --> DevDB
    
    GitHub --> Actions
    Actions --> GHCR
    
    GHCR --> StagingContainer
    StagingContainer --> StagingDB
    
    GHCR --> ProdContainer
    ProdContainer --> LoadBalancer
    LoadBalancer --> CDN
    ProdContainer --> ProdDB
    
    ProdContainer -.-> Sentry
    ProdContainer -.-> Uptime
    ProdContainer -.-> Logs
    
    style ProdContainer fill:#4CAF50
    style LoadBalancer fill:#2196F3
    style CDN fill:#FF9800
```

---

## Technology Stack

```mermaid
mindmap
  root((lastplateprod))
    Frontend
      React 19
      TypeScript
      Vite
      TailwindCSS
      Radix UI
    Backend
      Supabase
        Auth
        Database
        Storage
    Infrastructure
      Docker
      Nginx
      GitHub Actions
    Monitoring
      Sentry
      Custom Health Checks
      Structured Logging
    Security
      Rate Limiting
      Session Management
      HTTPS/TLS
      Security Headers
```

---

## Request Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant CDN
    participant Nginx
    participant React
    participant API
    participant Supabase
    participant Monitor

    User->>Browser: Navigate to page
    Browser->>CDN: Request static assets
    CDN-->>Browser: Return cached assets
    Browser->>Nginx: Request HTML
    Nginx-->>Browser: Return index.html
    Browser->>React: Initialize app
    React->>API: Fetch data
    API->>Supabase: Query database
    
    alt Success
        Supabase-->>API: Return data
        API-->>React: Return response
        React-->>Browser: Render UI
        Browser-->>User: Display page
    else Error
        Supabase-->>API: Error
        API->>Monitor: Log error
        Monitor->>Sentry: Send to Sentry
        API-->>React: Error response
        React-->>Browser: Show error UI
        Browser-->>User: Display error
    end
```

---

## Key Features

### Authentication
- Supabase Auth integration
- JWT token management
- Rate limiting (5 attempts per 15 minutes)
- Session timeout (1 hour production)

### Monitoring
- Sentry error tracking
- Structured logging
- Health checks every 5 minutes
- Audit logging for security events

### Security
- HTTPS/TLS encryption
- Security headers (CSP, X-Frame-Options, etc.)
- Rate limiting on all endpoints
- Session management with timeout
- Input validation and sanitization

### Performance
- CDN for static assets
- Gzip compression
- Multi-stage Docker builds
- Lazy loading of monitoring libraries
- Request timeout and retry logic

---

## Scalability Considerations

```mermaid
graph LR
    subgraph "Current"
        Single[Single Container]
        SingleDB[(Single Database)]
    end
    
    subgraph "Future: Horizontal Scaling"
        LB[Load Balancer]
        Container1[Container 1]
        Container2[Container 2]
        Container3[Container 3]
        DBCluster[(Database Cluster)]
        Cache[(Redis Cache)]
    end
    
    Single -.->|Scale Up| LB
    SingleDB -.->|Scale Up| DBCluster
    
    LB --> Container1
    LB --> Container2
    LB --> Container3
    
    Container1 --> Cache
    Container2 --> Cache
    Container3 --> Cache
    
    Cache --> DBCluster
    
    style LB fill:#2196F3
    style Cache fill:#FF9800
```

---

## Documentation

- **PRODUCTION_READY_SUMMARY.md** - Production readiness overview
- **PRODUCTION_FEATURES_IMPLEMENTED.md** - Feature documentation
- **PRODUCTION_SECURITY_IMPLEMENTATION.md** - Security guide
- **DEPLOYMENT.md** - Deployment instructions
- **ARCHITECTURE.md** - This document

---

**Last Updated:** 2025-12-14  
**Version:** 2.0.0
