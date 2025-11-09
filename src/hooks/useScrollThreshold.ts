import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if window has scrolled past a threshold
 * @param threshold - Scroll position threshold in pixels (default: 400)
 * @returns boolean - true if scrolled past threshold
 */
export function useScrollThreshold(threshold: number = 400): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    // Check on mount in case already scrolled
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}
