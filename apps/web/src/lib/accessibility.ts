/**
 * Accessibility utilities for keyboard navigation, focus management, and screen reader support
 */

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
    (el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && !el.hasAttribute('inert');
    }
  );
}

/**
 * Get the first focusable element in a container
 */
export function getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
  const focusable = getFocusableElements(container);
  return focusable[0] || null;
}

/**
 * Get the last focusable element in a container
 */
export function getLastFocusableElement(container: HTMLElement): HTMLElement | null {
  const focusable = getFocusableElements(container);
  return focusable[focusable.length - 1] || null;
}

/**
 * Handle arrow key navigation in a list
 */
export function handleArrowKeys(
  event: KeyboardEvent,
  options: {
    items: HTMLElement[];
    currentIndex: number;
    orientation?: 'horizontal' | 'vertical' | 'both';
    onNavigate: (index: number) => void;
    loop?: boolean;
  }
): void {
  const { items, currentIndex, orientation = 'vertical', onNavigate, loop = true } = options;

  if (items.length === 0) return;

  let nextIndex = currentIndex;

  if (orientation === 'vertical' || orientation === 'both') {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : loop ? 0 : currentIndex;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = currentIndex > 0 ? currentIndex - 1 : loop ? items.length - 1 : currentIndex;
    }
  }

  if (orientation === 'horizontal' || orientation === 'both') {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : loop ? 0 : currentIndex;
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      nextIndex = currentIndex > 0 ? currentIndex - 1 : loop ? items.length - 1 : currentIndex;
    }
  }

  if (event.key === 'Home') {
    event.preventDefault();
    nextIndex = 0;
  }

  if (event.key === 'End') {
    event.preventDefault();
    nextIndex = items.length - 1;
  }

  if (nextIndex !== currentIndex && nextIndex >= 0 && nextIndex < items.length) {
    onNavigate(nextIndex);
    items[nextIndex]?.focus();
  }
}

/**
 * Trap focus within a container
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first || !container.contains(document.activeElement)) {
      event.preventDefault();
      last?.focus();
    }
  } else {
    if (document.activeElement === last || !container.contains(document.activeElement)) {
      event.preventDefault();
      first?.focus();
    }
  }
}

/**
 * Restore focus to a previously focused element
 */
const focusHistory: HTMLElement[] = [];

export function saveFocus(): void {
  if (document.activeElement instanceof HTMLElement) {
    focusHistory.push(document.activeElement);
  }
}

export function restoreFocus(): void {
  const element = focusHistory.pop();
  if (element) {
    element.focus();
  } else {
    // Fallback: focus first focusable element in main content
    const main = document.querySelector('main');
    if (main) {
      const firstFocusable = getFirstFocusableElement(main);
      firstFocusable?.focus();
    }
  }
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcer = document.getElementById('a11y-announcer') || createAnnouncer();
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.textContent = message;

  // Clear message after announcement
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

function createAnnouncer(): HTMLElement {
  const announcer = document.createElement('div');
  announcer.id = 'a11y-announcer';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  `;
  document.body.appendChild(announcer);
  return announcer;
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  if (element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  return true;
}

/**
 * Move focus to a specific element
 */
export function moveFocus(element: HTMLElement | null): void {
  if (element && typeof element.focus === 'function') {
    element.focus();
    // Ensure focus is visible
    if (element instanceof HTMLElement) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

