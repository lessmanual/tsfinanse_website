import { useState, useEffect } from 'react';

export type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

export type ConsentState = {
  hasConsented: boolean;
  preferences: CookiePreferences;
  timestamp: string;
};

const CONSENT_STORAGE_KEY = 'tsfinanse-cookie-consent';

const defaultPreferences: CookiePreferences = {
  essential: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
};

export function useCookieConsent() {
  const [consentState, setConsentState] = useState<ConsentState | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ConsentState;
        setConsentState(parsed);
        setShowBanner(false);
      } catch (error) {
        console.error('Failed to parse cookie consent:', error);
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (preferences: CookiePreferences) => {
    const newState: ConsentState = {
      hasConsented: true,
      preferences: {
        ...preferences,
        essential: true, // Always true
      },
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newState));
    setConsentState(newState);
    setShowBanner(false);

    // Log consent (GDPR requirement)
    console.log('Cookie consent saved:', newState);

    // Reload page to apply analytics if accepted
    if (preferences.analytics) {
      window.location.reload();
    }
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectAll = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
    });
  };

  const customizeConsent = (preferences: CookiePreferences) => {
    saveConsent(preferences);
  };

  const resetConsent = () => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setConsentState(null);
    setShowBanner(true);
  };

  return {
    consentState,
    showBanner,
    acceptAll,
    rejectAll,
    customizeConsent,
    resetConsent,
    hasAnalyticsConsent: consentState?.preferences.analytics ?? false,
    hasMarketingConsent: consentState?.preferences.marketing ?? false,
  };
}
