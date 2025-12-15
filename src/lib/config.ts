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
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const intercomAppId = import.meta.env.VITE_INTERCOM_APP_ID;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const enableDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
  const environment = (import.meta.env.MODE || 'development') as Config['environment'];
  const appName = import.meta.env.VITE_APP_NAME || 'Restaurant Management System';
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS !== 'false';
  const enableAuditLog = import.meta.env.VITE_ENABLE_AUDIT_LOG !== 'false';

  // Validate required variables
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is required');
  }

  if (!supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY is required');
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error('VITE_SUPABASE_URL must be a valid URL');
  }

  // Production safety checks
  if (environment === 'production') {
    if (enableDemoMode) {
      throw new Error('Demo mode cannot be enabled in production');
    }
    if (!intercomAppId) {
      console.warn('VITE_INTERCOM_APP_ID not set - support chat disabled');
    }
    if (!sentryDsn) {
      console.warn('VITE_SENTRY_DSN not set - error monitoring disabled');
    }
  }

  // Environment-specific defaults
  const apiTimeout = environment === 'production' ? 30000 : 60000;
  const sessionTimeout = environment === 'production' ? 3600000 : 7200000; // 1h prod, 2h dev
  const maxUploadSize = 10 * 1024 * 1024; // 10MB

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
