# ADR-0001: Monorepo Structure

## Status
Accepted

## Context
We need to organize our codebase to support multiple applications and shared packages while maintaining clear separation of concerns and efficient dependency management.

## Decision
We will use a pnpm workspace-based monorepo structure with the following organization:

```
istock-monorepo/
├── apps/
│   └── web/          # React frontend application
├── packages/
│   └── shared/      # Shared Zod schemas and TypeScript types
├── functions/        # Cloud Functions / tRPC routers
└── docs/            # Project documentation
```

### Rationale

1. **pnpm Workspaces**: Provides efficient dependency management, faster installs, and proper linking between packages
2. **Separation of Concerns**: Clear distinction between applications, shared code, and backend functions
3. **Scalability**: Easy to add new apps or packages without restructuring
4. **Type Safety**: Shared package ensures consistent types across frontend and backend

## Consequences

### Positive
- Type-safe communication between frontend and backend through shared schemas
- Single source of truth for types and validation
- Efficient dependency management with pnpm
- Easy to add new applications or microservices

### Negative
- Requires understanding of pnpm workspace syntax
- More complex initial setup
- Need to rebuild shared package when types change

## Alternatives Considered

1. **Multiple repositories**: Rejected due to difficulty maintaining consistency
2. **Single package repository**: Rejected due to lack of separation and scalability concerns
3. **Nx/Turborepo**: Considered but rejected for simplicity - pnpm workspaces are sufficient for current scale

