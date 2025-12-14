import React, { createContext, useContext, useEffect } from 'react';
import { useWasteAuth } from './waste-auth';

interface IntercomContextType {
  show: () => void;
  hide: () => void;
  update: (data?: IntercomUpdateData) => void;
  shutdown: () => void;
}

interface IntercomUpdateData {
  user_id?: string;
  email?: string;
  name?: string;
  company?: {
    id?: string;
    name?: string;
    plan?: string;
    monthly_spend?: number;
  };
  locations_count?: number;
  signup_date?: string;
  last_login?: string;
  role?: string;
  location_id?: string;
  restaurant_id?: string;
}

declare global {
  interface Window {
    Intercom: (command: string, data?: IntercomUpdateData) => void;
    intercomSettings?: {
      app_id: string;
      hide_default_launcher?: boolean;
    };
  }
}

const IntercomContext = createContext<IntercomContextType | undefined>(undefined);

const INTERCOM_APP_ID = import.meta.env.VITE_INTERCOM_APP_ID || 'YOUR_INTERCOM_APP_ID';

export function IntercomProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userProfile, user } = useWasteAuth();

  useEffect(() => {
    // Load Intercom script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://widget.intercom.io/widget/${INTERCOM_APP_ID}`;
    document.body.appendChild(script);

    // Initialize Intercom settings
    window.intercomSettings = {
      app_id: INTERCOM_APP_ID,
    };

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!window.Intercom) return;

    if (isAuthenticated && userProfile && user) {
      // Logged-in user mode - context-aware support
      const intercomData: IntercomUpdateData = {
        user_id: user.id,
        email: user.email || undefined,
        name: userProfile.username || user.email,
        role: userProfile.role,
        location_id: userProfile.location_id || undefined,
        restaurant_id: userProfile.restaurant_id || undefined,
        company: {
          id: userProfile.restaurant_id || undefined,
          name: userProfile.business_name || undefined,
          plan: userProfile.subscription_plan || 'free',
        },
        locations_count: userProfile.locations_count || 1,
        signup_date: user.created_at,
        last_login: new Date().toISOString(),
      };

      // Boot Intercom with user data
      window.Intercom('boot', {
        app_id: INTERCOM_APP_ID,
        ...intercomData,
      });

      // Set custom attributes for segmentation
      window.Intercom('update', {
        custom_launcher_selector: '#intercom-launcher',
      });
    } else {
      // Visitor mode - sales/outreach engagement
      window.Intercom('boot', {
        app_id: INTERCOM_APP_ID,
        // Anonymous visitor - FIN will handle basic questions
      });
    }

    return () => {
      if (window.Intercom) {
        window.Intercom('shutdown');
      }
    };
  }, [isAuthenticated, userProfile, user]);

  const show = () => {
    if (window.Intercom) {
      window.Intercom('show');
    }
  };

  const hide = () => {
    if (window.Intercom) {
      window.Intercom('hide');
    }
  };

  const update = (data?: IntercomUpdateData) => {
    if (window.Intercom) {
      window.Intercom('update', data);
    }
  };

  const shutdown = () => {
    if (window.Intercom) {
      window.Intercom('shutdown');
    }
  };

  return (
    <IntercomContext.Provider value={{ show, hide, update, shutdown }}>
      {children}
    </IntercomContext.Provider>
  );
}

export function useIntercom() {
  const context = useContext(IntercomContext);
  if (context === undefined) {
    throw new Error('useIntercom must be used within an IntercomProvider');
  }
  return context;
}

// Utility hook for proactive messaging based on user actions
export function useIntercomMessaging() {
  const { update } = useIntercom();
  const { userProfile } = useWasteAuth();

  const trackPageVisit = (pageName: string) => {
    update({
      // Track page visits for context-aware support
      last_login: new Date().toISOString(),
    });

    // Send event to Intercom for proactive messaging
    if (window.Intercom) {
      window.Intercom('trackEvent', 'page-visit', {
        page_name: pageName,
        role: userProfile?.role,
      });
    }
  };

  const trackFeatureUsage = (featureName: string, metadata?: Record<string, unknown>) => {
    if (window.Intercom) {
      window.Intercom('trackEvent', 'feature-used', {
        feature_name: featureName,
        ...metadata,
      });
    }
  };

  const trackWasteLog = (category: string, amount: number) => {
    if (window.Intercom) {
      window.Intercom('trackEvent', 'waste-logged', {
        category,
        amount,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const trackVendorAction = (action: string, vendorId?: string) => {
    if (window.Intercom) {
      window.Intercom('trackEvent', 'vendor-action', {
        action,
        vendor_id: vendorId,
      });
    }
  };

  const trackPurchaseOrder = (action: string, orderId?: string, total?: number) => {
    if (window.Intercom) {
      window.Intercom('trackEvent', 'purchase-order', {
        action,
        order_id: orderId,
        total,
      });
    }
  };

  return {
    trackPageVisit,
    trackFeatureUsage,
    trackWasteLog,
    trackVendorAction,
    trackPurchaseOrder,
  };
}
