# Firebase Setup Guide

This guide shows you how to get Firebase configuration variables and set up your environment.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "iStock")
   - Optionally enable Google Analytics
   - Create the project

## Step 2: Register Your Web App

1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Register your app:
   - App nickname: "iStock Web" (or any name)
   - Check **"Also set up Firebase Hosting"** if you want to deploy
   - Click **"Register app"**

## Step 3: Get Firebase Configuration

After registering, you'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

### Where to Find This Later

If you need to find this again:
1. Go to Firebase Console
2. Click the gear icon ⚙️ next to **"Project Overview"**
3. Select **"Project settings"**
4. Scroll down to **"Your apps"** section
5. Click on your web app
6. The config is shown there

## Step 4: Enable Required Firebase Services

### Enable Authentication

1. In Firebase Console, go to **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Enable **Email/Password** provider:
   - Click on **"Email/Password"**
   - Toggle **"Enable"**
   - Click **"Save"**

### Enable Firestore Database

1. Go to **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose mode:
   - **Production mode**: For production use
   - **Test mode**: For development (less secure)
4. Choose a location (closest to your users)
5. Click **"Enable"**

## Step 5: Set Up Environment Variables

### Create .env File

1. Copy the example file:
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

2. Open `apps/web/.env` and fill in your Firebase values:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Emulator (for local development - optional)
VITE_USE_FIREBASE_EMULATOR=false
VITE_FIREBASE_EMULATOR_HOST=localhost
VITE_FIREBASE_AUTH_EMULATOR_PORT=9099
VITE_FIREBASE_FIRESTORE_EMULATOR_PORT=8080

# tRPC API Endpoint
VITE_TRPC_ENDPOINT=http://localhost:5001/trpc

# Environment
VITE_ENVIRONMENT=development
```

### Mapping Firebase Config to Environment Variables

| Firebase Config | Environment Variable | Description |
|----------------|---------------------|-------------|
| `apiKey` | `VITE_FIREBASE_API_KEY` | Firebase API key |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` | Authentication domain |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` | Your project ID |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket URL |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `appId` | `VITE_FIREBASE_APP_ID` | Your app ID |
| `measurementId` | `VITE_FIREBASE_MEASUREMENT_ID` | Analytics measurement ID (optional) |

## Step 6: Set Up Firebase Emulator (Optional - for Local Development)

If you want to use Firebase Emulator Suite for local development:

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init emulators
   ```

4. Select emulators to use:
   - Authentication
   - Firestore

5. Set up `firebase.json`:
   ```json
   {
     "emulators": {
       "auth": {
         "port": 9099
       },
       "firestore": {
         "port": 8080
       },
       "ui": {
         "enabled": true,
         "port": 4000
       }
     }
   }
   ```

6. Update `.env`:
   ```env
   VITE_USE_FIREBASE_EMULATOR=true
   VITE_FIREBASE_EMULATOR_HOST=localhost
   VITE_FIREBASE_AUTH_EMULATOR_PORT=9099
   VITE_FIREBASE_FIRESTORE_EMULATOR_PORT=8080
   ```

7. Start emulators:
   ```bash
   firebase emulators:start
   ```

## Step 7: Set Up Firebase Security Rules

### Firestore Rules

Go to **Firestore Database > Rules** and set up appropriate rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat history - users can only access their own chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Add more rules as needed
  }
}
```

### Storage Rules (if using Firebase Storage)

Go to **Storage > Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 8: Verify Setup

Create a test file to verify your configuration:

```typescript
// apps/web/src/lib/test-firebase-config.ts
import { env, validateEnv } from './env';

// This will log warnings if variables are missing
validateEnv();

console.log('Firebase Config:', {
  projectId: env.firebase.projectId,
  authDomain: env.firebase.authDomain,
  // Don't log apiKey in production!
  hasApiKey: !!env.firebase.apiKey,
});
```

## Usage in Your Code

Import and use the environment configuration:

```typescript
import { env } from '@/lib/env';

// Use Firebase config
const firebaseConfig = env.firebase;

// Check environment
if (env.environment === 'development') {
  console.log('Running in development mode');
}

// Use tRPC endpoint
const trpcUrl = env.trpcEndpoint;
```

## Troubleshooting

### Environment Variables Not Working

1. **Restart dev server**: Vite needs to be restarted when `.env` changes
2. **Check prefix**: All variables must start with `VITE_`
3. **Check file location**: `.env` should be in `apps/web/` directory
4. **Check syntax**: No spaces around `=` sign in `.env` file

### Firebase Not Initializing

1. Check that all required environment variables are set
2. Verify Firebase services are enabled in Firebase Console
3. Check browser console for error messages
4. Ensure you're using the correct project ID

### Emulator Not Working

1. Make sure Firebase CLI is installed: `firebase --version`
2. Verify emulators are running: `firebase emulators:start`
3. Check ports aren't already in use
4. Ensure `VITE_USE_FIREBASE_EMULATOR=true` in `.env`

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` file**: It's already in `.gitignore`
2. **Firebase API keys are safe to expose**: They're meant to be public in client-side code
3. **Secure with Firestore Rules**: Use security rules to protect your data
4. **Production vs Development**: Use different Firebase projects for production
5. **Environment variables**: Never put secrets (like service account keys) in `VITE_*` variables

## Next Steps

After setting up environment variables:

1. Initialize Firebase in your app (see Firebase SDK integration)
2. Set up authentication flows
3. Configure Firestore database structure
4. Set up Cloud Functions for backend logic
5. Configure deployment settings

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

