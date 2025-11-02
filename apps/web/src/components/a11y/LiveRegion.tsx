import { useEffect, useRef, ReactNode } from 'react';

interface LiveRegionProps {
  children: ReactNode;
  level?: 'polite' | 'assertive';
  atomic?: boolean;
  role?: 'status' | 'alert' | 'log' | 'timer' | 'marquee';
}

/**
 * Live region component for screen reader announcements
 * 
 * @example
 * ```tsx
 * <LiveRegion level="assertive" role="alert">
 *   {error && <div>Error: {error.message}</div>}
 * </LiveRegion>
 * ```
 */
export function LiveRegion({
  children,
  level = 'polite',
  atomic = true,
  role = 'status',
}: LiveRegionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.setAttribute('aria-live', level);
    container.setAttribute('aria-atomic', atomic.toString());
    container.setAttribute('role', role);

    // Ensure it's accessible but visually hidden
    container.className = 'sr-only';
  }, [level, atomic, role]);

  return (
    <div ref={containerRef} className="sr-only">
      {children}
    </div>
  );
}

