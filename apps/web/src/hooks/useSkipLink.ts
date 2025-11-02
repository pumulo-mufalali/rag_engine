import { useCallback, useRef } from 'react';
import { moveFocus } from '@/lib/accessibility';

interface UseSkipLinkOptions {
  targetId: string;
  label?: string;
}

/**
 * Hook for skip link functionality
 * 
 * @example
 * ```tsx
 * const { skipToContent } = useSkipLink({
 *   targetId: 'main-content',
 *   label: 'Skip to main content'
 * });
 * 
 * return (
 *   <>
 *     <button onClick={skipToContent}>Skip to main content</button>
 *     <main id="main-content">...</main>
 *   </>
 * );
 * ```
 */
export function useSkipLink(options: UseSkipLinkOptions) {
  const { targetId, label = 'Skip to main content' } = options;

  const skipToContent = useCallback(() => {
    const target = document.getElementById(targetId);
    if (target) {
      // Make target focusable temporarily if it isn't
      const originalTabIndex = target.getAttribute('tabindex');
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }

      moveFocus(target);

      // Remove tabindex after focus moves (cleanup)
      if (originalTabIndex === null) {
        target.addEventListener(
          'blur',
          () => {
            target.removeAttribute('tabindex');
          },
          { once: true }
        );
      }
    }
  }, [targetId]);

  return {
    skipToContent,
    label,
  };
}

