import { useEffect, useRef } from 'react';
import { announceToScreenReader } from '@/lib/accessibility';

interface UseLiveRegionOptions {
  level?: 'polite' | 'assertive';
  atomic?: boolean;
}

/**
 * Hook for managing live region announcements to screen readers
 * 
 * @example
 * ```tsx
 * const { announce } = useLiveRegion({ level: 'assertive' });
 * 
 * useEffect(() => {
 *   if (error) {
 *     announce('Error occurred. Please try again.');
 *   }
 * }, [error]);
 * ```
 */
export function useLiveRegion(options: UseLiveRegionOptions = {}) {
  const { level = 'polite', atomic = true } = options;
  const timeoutRef = useRef<number | null>(null);

  const announce = (message: string, priority?: 'polite' | 'assertive') => {
    // Clear any pending announcements
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Announce immediately
    announceToScreenReader(message, priority || level);

    // Clear after announcement
    timeoutRef.current = window.setTimeout(() => {
      const announcer = document.getElementById('a11y-announcer');
      if (announcer) {
        announcer.textContent = '';
      }
    }, 1000);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { announce };
}

