import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CookieConsent, 
  DEFAULT_CONSENT, 
  CONSENT_STORAGE_KEY,
  CONSENT_BANNER_DISMISSED_KEY 
} from '@/lib/cookie-consent-types';

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT);
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load consent from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    const bannerDismissed = localStorage.getItem(CONSENT_BANNER_DISMISSED_KEY);
    
    if (stored) {
      setConsent(JSON.parse(stored));
      setShowBanner(false);
    } else if (!bannerDismissed) {
      setShowBanner(true);
    }
    
    setLoading(false);
  }, []);

  // Load scripts based on consent
  useEffect(() => {
    if (consent.analytics) {
      loadAnalyticsScripts();
    }
    if (consent.marketing) {
      loadMarketingScripts();
    }
    if (consent.third_party) {
      loadThirdPartyScripts();
    }
  }, [consent]);

  const saveConsent = async (newConsent: CookieConsent) => {
    // Save to localStorage
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newConsent));
    localStorage.setItem(CONSENT_BANNER_DISMISSED_KEY, 'true');
    setConsent(newConsent);
    setShowBanner(false);

    // Save to database for audit trail
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = crypto.randomUUID();

      await supabase.from('cookie_consents').insert({
        user_id: user?.id || null,
        session_id: user ? null : sessionId,
        necessary: newConsent.necessary,
        analytics: newConsent.analytics,
        marketing: newConsent.marketing,
        third_party: newConsent.third_party,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Error saving consent to database:', error);
    }
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      third_party: true,
    });
  };

  const rejectAll = () => {
    saveConsent(DEFAULT_CONSENT);
  };

  const openPreferences = () => {
    setShowBanner(true);
  };

  return {
    consent,
    showBanner,
    loading,
    saveConsent,
    acceptAll,
    rejectAll,
    openPreferences,
  };
}

// Script loading functions
function loadAnalyticsScripts() {
  // Google Analytics
  if (typeof window !== 'undefined' && !window.gtag) {
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: unknown[]) { 
      window.dataLayer.push(args); 
    };
    window.gtag('js', new Date());
    window.gtag('config', 'GA_MEASUREMENT_ID');
  }
}

function loadMarketingScripts() {
  // Facebook Pixel
  if (typeof window !== 'undefined' && !window.fbq) {
    const fbqFunction = function(...args: unknown[]) { 
      if (window.fbq.callMethod) {
        window.fbq.callMethod(...args);
      } else {
        window.fbq.queue.push(args);
      }
    };
    
    window.fbq = fbqFunction as FbqFunction;
    if (!window._fbq) window._fbq = window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = [];
    
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.async = true;
    document.head.appendChild(script);
    
    window.fbq('init', 'FB_PIXEL_ID');
    window.fbq('track', 'PageView');
  }
}

function loadThirdPartyScripts() {
  // Intercom is already loaded via IntercomProvider
  // Add other third-party scripts as needed
}

// Type declarations for global objects
interface FbqFunction {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: FbqFunction;
  loaded: boolean;
  version: string;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    fbq: FbqFunction;
    _fbq: FbqFunction;
  }
}