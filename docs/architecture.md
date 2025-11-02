# iStock Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                       │
│              (React + TypeScript SPA)                   │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/WebSocket
┌──────────────────▼──────────────────────────────────────┐
│                  Frontend App (Vite)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Pages    │  │Components│  │ Contexts │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐                            │
│  │  Hooks   │  │  Utils   │                            │
│  └──────────┘  └──────────┘                            │
└──────────────────┬──────────────────────────────────────┘
                   │ tRPC
┌──────────────────▼──────────────────────────────────────┐
│            tRPC Router (Cloud Functions)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ RAG      │  │ Feed Opt │  │ Health   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              External Services                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Firestore│  │  Vector  │  │   AI/LLM │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Shared Package (@istock/shared)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Zod     │  │  Types   │  │ Schemas  │             │
│  │Schemas   │  │          │  │          │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── AppLayout
│   ├── SkipLinks
│   ├── Sidebar (Navigation)
│   │   ├── Navigation Items
│   │   └── User Menu
│   └── Main Content
│       ├── Dashboard
│       │   ├── StatsCard (x4)
│       │   ├── QuickActions
│       │   └── ActivityFeed
│       ├── Chatbot
│       │   ├── ChatInterface
│       │   │   └── MessageBubble (xN)
│       │   └── Chat Input Form
│       ├── FeedOptimizer
│       │   └── IngredientForm
│       ├── HealthRecords
│       ├── IngredientLibrary
│       └── Settings
├── ThemeProvider
├── AuthProvider
├── NotificationProvider
└── QueryClientProvider
```

## Data Flow

### Authentication Flow
1. User submits credentials
2. AuthContext handles login/signup
3. User state stored in localStorage
4. AppLayout shows authenticated UI
5. Protected routes rendered

### Chat Flow
1. User types message
2. React Hook Form validates with Zod
3. tRPC mutation sent via TanStack Query
4. Response cached and displayed
5. Chat history saved to localStorage
6. Screen reader announcement for new messages

### State Management Flow

```
Global UI State (Context API)
├── AuthContext ────────► localStorage
├── ThemeContext ───────► localStorage
└── NotificationContext ─► In-memory

Server State (TanStack Query)
├── useAskRag ──────────► tRPC mutation
├── useOptimizeFeed ─────► tRPC mutation
└── Query Cache ────────► In-memory

Form State (React Hook Form)
├── Chatbot Form ───────► Zod validation
├── Feed Form ──────────► Zod validation
└── Local component state
```

## Package Dependencies

### apps/web
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **TanStack Query**: Server state
- **React Hook Form**: Form handling
- **Zod**: Validation
- **Radix UI**: Accessible components
- **Tailwind CSS**: Styling
- **@istock/shared**: Shared types and schemas

### packages/shared
- **Zod**: Schema definitions
- **TypeScript**: Type exports

## Build and Deployment

### Development
```bash
pnpm dev  # Start Vite dev server
```

### Production Build
```bash
pnpm build  # TypeScript check + Vite build
```

### Build Output
- `apps/web/dist/`: Static assets
- Code splitting: Route-based lazy loading
- Tree shaking: Unused code eliminated

## Security Considerations

1. **Authentication**: Mock currently, will integrate Firebase Auth
2. **API Security**: tRPC provides type-safe, validated endpoints
3. **XSS Protection**: React automatically escapes user input
4. **CORS**: Configured in tRPC/backend
5. **Secrets**: Environment variables via T3 Env

## Performance Optimizations

1. **Code Splitting**: React.lazy for route-based splitting
2. **Tree Shaking**: Vite eliminates unused code
3. **React Query Caching**: Reduces API calls
4. **React Hook Form**: Uncontrolled components reduce re-renders
5. **Image Optimization**: Future: next/image or similar
6. **Bundle Analysis**: Vite build reports bundle size

## Future Enhancements

1. **Server-Side Rendering**: Consider Next.js if needed
2. **PWA Support**: Service workers for offline capability
3. **Testing**: Add Vitest for unit tests, Playwright for E2E
4. **Storybook**: Component documentation and testing
5. **Monitoring**: Add error tracking (Sentry)
6. **Analytics**: User behavior tracking

