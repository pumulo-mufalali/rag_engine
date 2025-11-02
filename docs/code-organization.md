# Code Organization Guide

## Directory Structure

```
apps/web/src/
├── components/          # React components
│   ├── a11y/           # Accessibility components
│   ├── auth/           # Authentication components
│   ├── chatbot/        # Chat-related components
│   ├── dashboard/      # Dashboard components
│   ├── feed/           # Feed optimizer components
│   ├── layout/         # Layout components
│   ├── theme/          # Theme components
│   └── ui/             # Reusable UI primitives (shadcn/ui)
├── contexts/           # React contexts for global state
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and helpers
├── pages/              # Page-level components
└── types/              # TypeScript type definitions (if needed)
```

## Naming Conventions

### Components
- **PascalCase**: `ChatInterface.tsx`, `StatsCard.tsx`
- **File name matches component name**: `ChatInterface.tsx` exports `ChatInterface`
- **Component directory**: Group related components in folders

### Hooks
- **camelCase with "use" prefix**: `useAuth.ts`, `useFocusTrap.ts`
- **File name matches hook name**: `useAuth.ts` exports `useAuth`

### Utilities
- **camelCase**: `accessibility.ts`, `date-utils.ts`
- **Descriptive names**: Clear purpose from filename

### Pages
- **PascalCase**: `Dashboard.tsx`, `Chatbot.tsx`
- **One page per file**

## Component Patterns

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onClick: () => void;
}

// 3. Component
export function Component({ title, onClick }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Event handlers
  const handleClick = () => {
    onClick();
  };
  
  // 6. Render
  return (
    <Button onClick={handleClick}>{title}</Button>
  );
}
```

### Component Organization Principles

1. **Co-location**: Keep related files together
   ```
   components/chatbot/
   ├── ChatInterface.tsx
   ├── MessageBubble.tsx
   └── index.ts (if exporting multiple)
   ```

2. **Single Responsibility**: Each component has one clear purpose

3. **Composition**: Build complex components from simple ones

4. **Accessibility First**: All components must be accessible

## Hook Patterns

### Custom Hook Structure
```typescript
// hooks/useExample.ts
import { useState, useEffect } from 'react';

export function useExample(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [value]);
  
  return { value, setValue };
}
```

### Hook Naming
- Always start with "use"
- Describe what the hook does
- Examples: `useAuth`, `useFocusTrap`, `useLiveRegion`

## Utility Organization

### Utilities in `lib/`

1. **Domain-specific**: Group by domain
   - `accessibility.ts`: A11y utilities
   - `date-utils.ts`: Date formatting
   - `trpc.ts`: tRPC client setup

2. **Generic utilities**: `utils.ts` for generic helpers
   - `cn()` for className merging
   - Generic helper functions

### Utility Structure
```typescript
// lib/utility.ts

/**
 * Description of what the utility does
 * 
 * @param param - Description of parameter
 * @returns Description of return value
 * @example
 * ```ts
 * utilityFunction('example');
 * ```
 */
export function utilityFunction(param: string): string {
  // Implementation
  return result;
}
```

## Import Organization

### Import Order
1. React and React-related
2. Third-party libraries
3. Internal components
4. Internal utilities/hooks
5. Types
6. Styles (if needed)

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. Third-party
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';

// 3. Internal components
import { ChatInterface } from '@/components/chatbot/ChatInterface';

// 4. Internal utilities
import { useLiveRegion } from '@/hooks/useLiveRegion';
import { formatDistanceToNow } from '@/lib/date-utils';

// 5. Types
import type { Message } from '@/types';
```

### Import Aliases
Use `@/` alias for imports from `src/`:
- ✅ `import { Button } from '@/components/ui/button';`
- ❌ `import { Button } from '../../../components/ui/button';`

## File Organization Best Practices

1. **One component per file**: Easier to find and maintain

2. **Co-locate related files**: Keep components, hooks, and types together

3. **Index files for exports**: Use `index.ts` to re-export multiple items

4. **Avoid deep nesting**: Keep folder structure shallow (max 3-4 levels)

5. **Group by feature**: Organize by feature/domain, not by type

## Type Definitions

### Where to put types
1. **Component-local**: Types used only in one component
2. **Shared types**: `@istock/shared` package
3. **App-specific shared**: `src/types/` (if needed)

### Type Naming
- **Interfaces**: PascalCase, descriptive
  - `ChatHistoryItem`, `MessageProps`
- **Types**: PascalCase, descriptive
  - `AppRoute`, `QueryForm`
- **Enums**: PascalCase, singular
  - `UserRole`, `ThemeMode`

## Accessibility Patterns

All components should follow accessibility patterns:

1. **Semantic HTML**: Use proper HTML elements
2. **ARIA attributes**: Add where semantic HTML isn't sufficient
3. **Keyboard navigation**: All interactive elements keyboard accessible
4. **Focus management**: Clear focus indicators
5. **Screen reader support**: Proper labels and descriptions

## Testing Structure (Future)

When adding tests:
```
components/
├── ChatInterface.tsx
├── ChatInterface.test.tsx
└── ChatInterface.stories.tsx (Storybook)
```

## Code Review Checklist

- [ ] Components are accessible (keyboard nav, ARIA labels)
- [ ] Types are properly defined
- [ ] Imports are organized correctly
- [ ] Naming conventions followed
- [ ] No unnecessary nesting
- [ ] Comments for complex logic
- [ ] Proper error handling

