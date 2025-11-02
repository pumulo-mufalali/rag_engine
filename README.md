# iStock - RAG for Precision Livestock

An AI-powered livestock health and nutrition application that provides farmers with immediate, citable diagnostic and treatment advice.

## Monorepo Structure

- `apps/web` - React frontend application
- `packages/shared` - Shared Zod schemas and types
- `functions` - Cloud Functions / tRPC routers
- `docs` - Project documentation

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env and add your Firebase configuration
# See docs/firebase-setup.md for detailed instructions

# Run development server
pnpm dev
```

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

2. Get your Firebase configuration:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create or select a project
   - Add a web app and copy the configuration
   - See [docs/firebase-setup.md](docs/firebase-setup.md) for detailed steps

3. Fill in your `.env` file with Firebase values

