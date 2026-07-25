interface Config {
  supabaseUrl: string;
  supabaseAnonKey: string;
  intercomAppId?: string;
  sentryDsn?: string;
  enableDemoMode: boolean;
  environment: 'development' | 'staging' | 'production';
  appName: string;
  appVersion: string;
  apiTimeout: number;
  enableAnalytics: boolean;
  enableAuditLog: boolean;
  sessionTimeout: number;
  maxUploadSize: number;
}

function validateConfig(): Config {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const intercomAppId = import.meta.env.VITE_INTERCOM_APP_ID;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const enableDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
  const environment = (import.meta.env.MODE || 'development') as Config['environment'];
  const appName = import.meta.env.VITE_APP_NAME || 'Restaurant Management System';
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS !== 'false';
  const enableAuditLog = import.meta.env.VITE_ENABLE_AUDIT_LOG !== 'false';

  const missingVars: string[] = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  if (supabaseUrl) {
    try {
      new URL(supabaseUrl);
    } catch {
      missingVars.push('VITE_SUPABASE_URL (invalid URL format)');
    }
  }

  if (missingVars.length > 0) {
    if (environment === 'production') {
      throw new Error(`Production startup blocked: missing required env vars: ${missingVars.join(', ')}`);
    }
    (window as any).__MISSING_ENV_VARS = missingVars;
  }

  if (environment === 'production' && enableDemoMode) {
    throw new Error('Demo mode cannot be enabled in production');
  }

  const apiTimeout = environment === 'production' ? 30000 : 60000;
  const sessionTimeout = environment === 'production' ? 3600000 : 7200000;
  const maxUploadSize = 10 * 1024 * 1024;

  return {
    supabaseUrl,
    supabaseAnonKey,
    intercomAppId,
    sentryDsn,
    enableDemoMode,
    environment,
    appName,
    appVersion,
    apiTimeout,
    enableAnalytics,
    enableAuditLog,
    sessionTimeout,
    maxUploadSize,
  };
}

export const config = validateConfig();

// Feature flags
export const features = {
  multiLocation: true,
  esgReports: true,
  knowledgeBase: true,
  advancedAnalytics: config.environment !== 'development',
  betaFeatures: config.environment === 'development',
};

// API endpoints (if backend is added)
export const apiEndpoints = {
  base: config.supabaseUrl,
  auth: `${config.supabaseUrl}/auth/v1`,
  rest: `${config.supabaseUrl}/rest/v1`,
};
