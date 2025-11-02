import { useSkipLink } from '@/hooks/useSkipLink';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function SkipLinks() {
  const { skipToContent: skipToMain, label: mainLabel } = useSkipLink({
    targetId: 'main-content',
    label: 'Skip to main content',
  });

  const { skipToContent: skipToNav, label: navLabel } = useSkipLink({
    targetId: 'main-navigation',
    label: 'Skip to navigation',
  });

  // Add keyboard shortcut (Alt+M for main, Alt+N for nav)
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'm',
        altKey: true,
        handler: skipToMain,
        description: 'Skip to main content',
      },
      {
        key: 'n',
        altKey: true,
        handler: skipToNav,
        description: 'Skip to navigation',
      },
    ],
  });

  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          skipToMain();
        }}
        className="absolute left-4 top-4 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {mainLabel}
      </a>
      <a
        href="#main-navigation"
        onClick={(e) => {
          e.preventDefault();
          skipToNav();
        }}
        className="absolute left-4 top-16 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {navLabel}
      </a>
    </div>
  );
}

