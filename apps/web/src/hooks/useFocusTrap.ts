import { useEffect, useRef, RefObject } from 'react';
import { trapFocus, getFirstFocusableElement } from '@/lib/accessibility';

interface UseFocusTrapOptions {
  enabled?: boolean;
  autoFocus?: boolean;
  returnFocus?: boolean;
  initialFocus?: RefObject<HTMLElement>;
}

export function useFocusTrap<T extends HTMLElement>(
  containerRef: RefObject<T>,
  options: UseFocusTrapOptions = {}
): void {
  const { enabled = true, autoFocus = true, returnFocus = true, initialFocus } = options;
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    // Save currently focused element
    if (returnFocus && document.activeElement instanceof HTMLElement) {
      previouslyFocusedElementRef.current = document.activeElement;
    }

    // Auto-focus first focusable element or initial focus element
    if (autoFocus) {
      const focusTarget = initialFocus?.current || getFirstFocusableElement(container);
      if (focusTarget) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          focusTarget.focus();
        }, 0);
      } else {
        // If no focusable element, focus the container itself
        container.setAttribute('tabindex', '-1');
        container.focus();
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Let the component handle Escape if needed
        return;
      }
      trapFocus(container, event);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus when trap is removed
      if (returnFocus && previouslyFocusedElementRef.current) {
        setTimeout(() => {
          previouslyFocusedElementRef.current?.focus();
          previouslyFocusedElementRef.current = null;
        }, 0);
      }
    };
  }, [enabled, autoFocus, returnFocus, containerRef, initialFocus]);
}

