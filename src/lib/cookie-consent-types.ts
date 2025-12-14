export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  third_party: boolean;
}

export interface CookieConsentRecord extends CookieConsent {
  id: string;
  user_id: string | null;
  session_id: string | null;
  consent_date: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  third_party: false,
};

export const CONSENT_STORAGE_KEY = 'saveplate_cookie_consent';
export const CONSENT_BANNER_DISMISSED_KEY = 'saveplate_consent_banner_dismissed';
