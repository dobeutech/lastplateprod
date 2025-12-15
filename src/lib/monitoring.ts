import { config } from './config';

interface ErrorContext {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

class ErrorMonitor {
  private isProduction: boolean;
  private sentryInitialized: boolean = false;

  constructor() {
    this.isProduction = config.environment === 'production';
    this.initializeSentry();
  }

  private async initializeSentry() {
    if (!this.isProduction) {
      console.log('Error monitoring: Development mode - logging to console');
      return;
    }

    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    if (!sentryDsn) {
      console.warn('VITE_SENTRY_DSN not configured - error monitoring disabled');
      return;
    }

    try {
      // Dynamic import to avoid bundling Sentry in development
      const Sentry = await import('@sentry/react');
      
      Sentry.init({
        dsn: sentryDsn,
        environment: config.environment,
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration(),
        ],
        beforeSend(event, hint) {
          // Filter out non-critical errors
          if (event.level === 'info' || event.level === 'debug') {
            return null;
          }
          return event;
        },
      });

      this.sentryInitialized = true;
      console.log('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  captureError(error: Error, context?: ErrorContext) {
    if (this.isProduction && this.sentryInitialized) {
      import('@sentry/react').then((Sentry) => {
        if (context?.user) {
          Sentry.setUser({
            id: context.user.id,
            email: context.user.email,
            role: context.user.role,
          });
        }

        if (context?.tags) {
          Sentry.setTags(context.tags);
        }

        if (context?.extra) {
          Sentry.setExtras(context.extra);
        }

        Sentry.captureException(error);
      });
    } else {
      console.error('Error captured:', error, context);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    if (this.isProduction && this.sentryInitialized) {
      import('@sentry/react').then((Sentry) => {
        if (context?.user) {
          Sentry.setUser({
            id: context.user.id,
            email: context.user.email,
            role: context.user.role,
          });
        }

        if (context?.tags) {
          Sentry.setTags(context.tags);
        }

        Sentry.captureMessage(message, level);
      });
    } else {
      console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'](message, context);
    }
  }

  setUser(user: { id: string; email: string; role: string } | null) {
    if (this.isProduction && this.sentryInitialized) {
      import('@sentry/react').then((Sentry) => {
        if (user) {
          Sentry.setUser(user);
        } else {
          Sentry.setUser(null);
        }
      });
    }
  }

  addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
    if (this.isProduction && this.sentryInitialized) {
      import('@sentry/react').then((Sentry) => {
        Sentry.addBreadcrumb({
          message,
          category,
          data,
          level: 'info',
        });
      });
    } else {
      console.log(`[Breadcrumb] ${category}: ${message}`, data);
    }
  }
}

export const errorMonitor = new ErrorMonitor();

// Convenience functions
export const captureError = (error: Error, context?: ErrorContext) => 
  errorMonitor.captureError(error, context);

export const captureMessage = (message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext) => 
  errorMonitor.captureMessage(message, level, context);

export const setUser = (user: { id: string; email: string; role: string } | null) => 
  errorMonitor.setUser(user);

export const addBreadcrumb = (message: string, category: string, data?: Record<string, unknown>) => 
  errorMonitor.addBreadcrumb(message, category, data);
