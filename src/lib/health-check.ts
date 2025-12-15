import { supabase } from './supabase';
import { config } from './config';
import { logger } from './logger';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: CheckResult;
    auth: CheckResult;
    storage: CheckResult;
  };
  uptime: number;
  environment: string;
}

export interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

class HealthMonitor {
  private startTime: number;
  private lastHealthCheck: HealthStatus | null = null;
  private checkInterval: number | null = null;

  constructor() {
    this.startTime = Date.now();
    this.startPeriodicChecks();
  }

  private startPeriodicChecks() {
    // Run health checks every 5 minutes in production
    if (config.environment === 'production') {
      this.checkInterval = window.setInterval(() => {
        this.checkHealth().catch(error => {
          logger.error('Health check failed', error);
        });
      }, 5 * 60 * 1000);
    }
  }

  async checkHealth(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    const [database, auth, storage] = await Promise.all([
      this.checkDatabase(),
      this.checkAuth(),
      this.checkStorage(),
    ]);

    const checks = { database, auth, storage };
    
    // Determine overall status
    const hasFailure = Object.values(checks).some(check => check.status === 'fail');
    const hasWarning = Object.values(checks).some(check => check.status === 'warn');
    
    const status: HealthStatus['status'] = hasFailure 
      ? 'unhealthy' 
      : hasWarning 
      ? 'degraded' 
      : 'healthy';

    const healthStatus: HealthStatus = {
      status,
      timestamp,
      version: config.appVersion,
      checks,
      uptime,
      environment: config.environment,
    };

    this.lastHealthCheck = healthStatus;

    // Log if unhealthy
    if (status !== 'healthy') {
      logger.warn('System health degraded', {
        component: 'HealthMonitor',
        status,
        checks,
      });
    }

    return healthStatus;
  }

  private async checkDatabase(): Promise<CheckResult> {
    const startTime = performance.now();
    const lastChecked = new Date().toISOString();

    try {
      // Simple query to check database connectivity
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single();

      const responseTime = performance.now() - startTime;

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        return {
          status: 'fail',
          responseTime,
          message: error.message,
          lastChecked,
        };
      }

      // Warn if response time is slow
      if (responseTime > 1000) {
        return {
          status: 'warn',
          responseTime,
          message: 'Database response time is slow',
          lastChecked,
        };
      }

      return {
        status: 'pass',
        responseTime,
        lastChecked,
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        status: 'fail',
        responseTime,
        message: error instanceof Error ? error.message : 'Unknown error',
        lastChecked,
      };
    }
  }

  private async checkAuth(): Promise<CheckResult> {
    const startTime = performance.now();
    const lastChecked = new Date().toISOString();

    try {
      // Check if we can get session
      const { error } = await supabase.auth.getSession();
      const responseTime = performance.now() - startTime;

      if (error) {
        return {
          status: 'fail',
          responseTime,
          message: error.message,
          lastChecked,
        };
      }

      return {
        status: 'pass',
        responseTime,
        lastChecked,
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        status: 'fail',
        responseTime,
        message: error instanceof Error ? error.message : 'Unknown error',
        lastChecked,
      };
    }
  }

  private async checkStorage(): Promise<CheckResult> {
    const lastChecked = new Date().toISOString();

    try {
      // Check if localStorage is available and working
      const testKey = '__health_check__';
      const testValue = Date.now().toString();
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (retrieved !== testValue) {
        return {
          status: 'fail',
          message: 'localStorage not working correctly',
          lastChecked,
        };
      }

      // Check storage quota
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usagePercent = estimate.usage && estimate.quota 
          ? (estimate.usage / estimate.quota) * 100 
          : 0;

        if (usagePercent > 90) {
          return {
            status: 'warn',
            message: `Storage usage at ${usagePercent.toFixed(1)}%`,
            lastChecked,
          };
        }
      }

      return {
        status: 'pass',
        lastChecked,
      };
    } catch (error) {
      return {
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        lastChecked,
      };
    }
  }

  getLastHealthCheck(): HealthStatus | null {
    return this.lastHealthCheck;
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const healthMonitor = new HealthMonitor();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  healthMonitor.destroy();
});

// Expose health check endpoint for monitoring services
if (typeof window !== 'undefined') {
  (window as any).__healthCheck = () => healthMonitor.checkHealth();
}
