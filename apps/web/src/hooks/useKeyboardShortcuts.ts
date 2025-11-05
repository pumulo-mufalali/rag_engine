import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  scope?: 'global' | 'local';
  target?: HTMLElement;
}

/**
 * Hook for managing keyboard shortcuts
 * 
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 'k',
 *       ctrlKey: true,
 *       handler: () => openSearch(),
 *       description: 'Open search'
 *     }
 *   ]
 * });
 * ```
 */
export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions
): void {
  const { shortcuts, enabled = true, scope = 'global', target } = options;
  const shortcutsRef = useRef(shortcuts);

  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if typing in an input, textarea, or contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow some shortcuts even when typing (e.g., Escape)
        const isEscape = event.key === 'Escape';
        if (!isEscape) return;
      }

      for (const shortcut of shortcutsRef.current) {
        const matches =
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          (shortcut.ctrlKey ?? false) === event.ctrlKey &&
          (shortcut.shiftKey ?? false) === event.shiftKey &&
          (shortcut.altKey ?? false) === event.altKey &&
          (shortcut.metaKey ?? false) === event.metaKey;

        if (matches) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.handler(event);
          break;
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    const eventTarget = target || (scope === 'global' ? window : null);
    if (!eventTarget) return;

    eventTarget.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      eventTarget.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [enabled, scope, target, handleKeyDown]);
}

/**
 * Helper to format keyboard shortcut display text
 */
export function formatKeyboardShortcut(shortcut: {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  key: string;
}): string {
  const parts: string[] = [];

  if (shortcut.metaKey) parts.push('⌘');
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  parts.push(shortcut.key.toUpperCase());

  return parts.join(shortcut.metaKey ? '' : '+');
}

