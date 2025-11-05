import { useRef, type ReactNode } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface FocusTrapProps {
  children: ReactNode;
  enabled?: boolean;
  autoFocus?: boolean;
  returnFocus?: boolean;
}

/**
 * Component that traps focus within its children
 * Useful for modals, dialogs, and other overlay components
 * 
 * @example
 * ```tsx
 * <FocusTrap enabled={isOpen}>
 *   <div>
 *     <button>First</button>
 *     <button>Second</button>
 *   </div>
 * </FocusTrap>
 * ```
 */
export function FocusTrap({
  children,
  enabled = true,
  autoFocus = true,
  returnFocus = true,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, {
    enabled,
    autoFocus,
    returnFocus,
  });

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  );
}

