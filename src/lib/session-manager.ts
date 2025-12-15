import { config } from './config';
import { logger } from './logger';

interface SessionData {
  userId: string;
  email: string;
  role: string;
  lastActivity: number;
  createdAt: number;
}

class SessionManager {
  private sessionKey = 'app_session';
  private activityKey = 'last_activity';
  private warningShown = false;
  private timeoutWarningMs = 5 * 60 * 1000; // 5 minutes before timeout
  private checkInterval: number | null = null;

  constructor() {
    this.startActivityMonitoring();
  }

  private startActivityMonitoring() {
    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), { passive: true });
    });

    // Check session validity periodically
    this.checkInterval = window.setInterval(() => {
      this.checkSessionValidity();
    }, 60000); // Check every minute
  }

  private updateActivity() {
    const now = Date.now();
    localStorage.setItem(this.activityKey, now.toString());
    this.warningShown = false;
  }

  private checkSessionValidity() {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivity;
    const timeUntilTimeout = config.sessionTimeout - timeSinceActivity;

    // Show warning before timeout
    if (timeUntilTimeout <= this.timeoutWarningMs && !this.warningShown) {
      this.warningShown = true;
      const minutesLeft = Math.ceil(timeUntilTimeout / 60000);
      logger.warn(`Session will expire in ${minutesLeft} minutes due to inactivity`, {
        component: 'SessionManager',
      });
      
      // Dispatch custom event for UI to show warning
      window.dispatchEvent(new CustomEvent('session-warning', {
        detail: { minutesLeft }
      }));
    }

    // Expire session
    if (timeSinceActivity > config.sessionTimeout) {
      logger.info('Session expired due to inactivity', {
        component: 'SessionManager',
      });
      this.clearSession();
      
      // Dispatch custom event for UI to handle logout
      window.dispatchEvent(new CustomEvent('session-expired'));
    }
  }

  createSession(data: Omit<SessionData, 'lastActivity' | 'createdAt'>) {
    const now = Date.now();
    const sessionData: SessionData = {
      ...data,
      lastActivity: now,
      createdAt: now,
    };

    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
      localStorage.setItem(this.activityKey, now.toString());
      
      logger.audit('Session created', {
        userId: data.userId,
        email: data.email,
        role: data.role,
      });
    } catch (error) {
      logger.error('Failed to create session', error as Error, {
        component: 'SessionManager',
      });
    }
  }

  getSession(): SessionData | null {
    try {
      const sessionStr = localStorage.getItem(this.sessionKey);
      if (!sessionStr) return null;

      const session = JSON.parse(sessionStr) as SessionData;
      
      // Validate session hasn't expired
      const lastActivity = this.getLastActivity();
      if (!lastActivity || Date.now() - lastActivity > config.sessionTimeout) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      logger.error('Failed to get session', error as Error, {
        component: 'SessionManager',
      });
      return null;
    }
  }

  updateSession(updates: Partial<Omit<SessionData, 'createdAt'>>) {
    const session = this.getSession();
    if (!session) return;

    const updatedSession: SessionData = {
      ...session,
      ...updates,
      lastActivity: Date.now(),
    };

    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(updatedSession));
      this.updateActivity();
    } catch (error) {
      logger.error('Failed to update session', error as Error, {
        component: 'SessionManager',
      });
    }
  }

  clearSession() {
    try {
      const session = this.getSession();
      if (session) {
        logger.audit('Session cleared', {
          userId: session.userId,
          email: session.email,
        });
      }

      localStorage.removeItem(this.sessionKey);
      localStorage.removeItem(this.activityKey);
    } catch (error) {
      logger.error('Failed to clear session', error as Error, {
        component: 'SessionManager',
      });
    }
  }

  private getLastActivity(): number | null {
    const activityStr = localStorage.getItem(this.activityKey);
    return activityStr ? parseInt(activityStr, 10) : null;
  }

  getSessionDuration(): number {
    const session = this.getSession();
    if (!session) return 0;
    return Date.now() - session.createdAt;
  }

  getTimeUntilExpiry(): number {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return 0;
    
    const timeSinceActivity = Date.now() - lastActivity;
    return Math.max(0, config.sessionTimeout - timeSinceActivity);
  }

  refreshSession() {
    this.updateActivity();
    const session = this.getSession();
    if (session) {
      this.updateSession({ lastActivity: Date.now() });
    }
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const sessionManager = new SessionManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  sessionManager.destroy();
});
