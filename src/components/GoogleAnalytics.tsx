import { useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';

// Google Analytics 4 Measurement ID
// Replace with your actual GA4 Measurement ID (format: G-XXXXXXXXXX)
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

export function GoogleAnalytics() {
  const { hasAnalyticsConsent } = useCookieConsent();

  useEffect(() => {
    // Only load Google Analytics if user has given consent
    if (!hasAnalyticsConsent) {
      console.log('[GA4] Analytics tracking disabled - no user consent');
      return;
    }

    // Check if GA is already loaded
    if (window.gtag) {
      console.log('[GA4] Google Analytics already loaded');
      return;
    }

    console.log('[GA4] Loading Google Analytics with user consent');

    // Create and inject Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    // Configure Google Analytics
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true, // Anonymize IP addresses (GDPR requirement)
      cookie_flags: 'SameSite=None;Secure', // Cookie security settings
    });

    console.log('[GA4] Google Analytics initialized');

    // Cleanup function
    return () => {
      // Note: We don't remove the script on unmount to persist analytics
      // across page navigations in SPA
    };
  }, [hasAnalyticsConsent]);

  return null; // This component doesn't render anything
}

// TypeScript declarations for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
