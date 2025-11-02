import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScreenReaderOnlyProps {
  children: ReactNode;
  className?: string;
}

/**
 * Component that hides content visually but keeps it accessible to screen readers
 * 
 * @example
 * ```tsx
 * <button>
 *   <span>Submit</span>
 *   <ScreenReaderOnly>Form will be submitted</ScreenReaderOnly>
 * </button>
 * ```
 */
export function ScreenReaderOnly({ children, className }: ScreenReaderOnlyProps) {
  return (
    <span
      className={cn(
        'sr-only',
        className
      )}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: '0',
      }}
    >
      {children}
    </span>
  );
}

