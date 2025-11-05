# RAG Engine Integration Guide - Google Cloud & Firebase

This guide provides step-by-step instructions for integrating Google Cloud RAG Engine with your Firebase-hosted iStock application.

## 📋 Prerequisites

- Google Cloud Project (same project as Firebase, or linked)
- Firebase project with authentication enabled
- Node.js 18+ installed
- Google Cloud SDK (`gcloud`) installed and authenticated
- Firebase CLI installed (`firebase-tools`)

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  React App      │
│  (Firebase)     │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│ Cloud Function  │
│ (Firebase/GC)   │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│  RAG Engine     │
│ (Google Cloud)  │
└─────────────────┘
```

## 📝 Step-by-Step Instructions

### Step 1: Set Up RAG Engine in Google Cloud

#### 1.1 Enable Required APIs

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable Vertex AI API (required for RAG Engine)
gcloud services enable aiplatform.googleapis.com

# Enable Cloud Build API (for deploying functions)
gcloud services enable cloudbuild.googleapis.com

# Enable Cloud Functions API
gcloud services enable cloudfunctions.googleapis.com
```

#### 1.2 Create RAG Engine Application

1. **Go to Vertex AI in Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/vertex-ai
   - Select your project

2. **Create RAG Engine Instance**
   - Go to **Vertex AI** → **RAG** → **Create RAG Engine**
   - Or use the API: https://cloud.google.com/vertex-ai/docs/rag-engine/overview

3. **Configure RAG Engine**
   - **Name**: `istock-rag-engine`
   - **Region**: Choose a region (e.g., `us-central1`)
   - **Model**: Select Gemini or another supported model
   - **Knowledge Base**: Upload your livestock health documents or connect to data source

4. **Get RAG Engine Endpoint**
   - Note down the RAG Engine endpoint URL
   - Example: `https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/ragEngines/istock-rag-engine`

5. **Set Up Authentication**
   - Enable Service Account
   - Create a service account for Cloud Functions
   ```bash
   gcloud iam service-accounts create rag-engine-function \
     --display-name="RAG Engine Cloud Function"
   
   # Grant Vertex AI User role
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:rag-engine-function@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

### Step 2: Create Cloud Function (Firebase Functions)

#### 2.1 Initialize Firebase Functions (if not done)

```bash
cd functions
npm install firebase-functions@latest firebase-admin@latest
npm install @google-cloud/aiplatform
```

#### 2.2 Create the RAG Function

Create `functions/src/rag.ts`:

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { VertexAI } from '@google-cloud/aiplatform';

initializeApp();

// Initialize Vertex AI client
const vertexAI = new VertexAI({
  project: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.RAG_ENGINE_LOCATION || 'us-central1',
});

interface RagRequest {
  query: string;
  context?: string;
}

interface RagResponse {
  text: string;
  sources: Array<{ uri: string; title: string }>;
  confidence: number;
}

/**
 * Cloud Function to call RAG Engine
 * Requires authentication via Firebase Auth token
 */
export const askRag = onCall(
  {
    cors: true,
    region: 'us-central1', // Match your RAG Engine region
  },
  async (request) => {
    // Verify authentication
    const authHeader = request.rawRequest.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const token = authHeader.split('Bearer ')[1];
    let uid: string;

    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      uid = decodedToken.uid;
    } catch (error) {
      throw new HttpsError('unauthenticated', 'Invalid authentication token');
    }

    // Get request data
    const { query, context }: RagRequest = request.data;

    if (!query || typeof query !== 'string') {
      throw new HttpsError('invalid-argument', 'Query is required');
    }

    try {
      // Call RAG Engine
      const ragEngineName = process.env.RAG_ENGINE_NAME || 'projects/YOUR_PROJECT/locations/us-central1/ragEngines/YOUR_RAG_ENGINE_ID';
      
      const response = await vertexAI.preview.ragEngine.retrieveContexts({
        ragEngine: ragEngineName,
        query: query,
        numContexts: 5, // Number of contexts to retrieve
      });

      // Format response
      const ragResponse: RagResponse = {
        text: response.contexts?.[0]?.text || 'No response generated',
        sources: response.contexts?.map((ctx, idx) => ({
          uri: ctx.sourceUri || `context-${idx}`,
          title: ctx.sourceTitle || 'Reference',
        })) || [],
        confidence: response.scores?.[0] || 0.8,
      };

      return ragResponse;
    } catch (error: any) {
      console.error('RAG Engine error:', error);
      throw new HttpsError(
        'internal',
        `RAG Engine error: ${error.message || 'Unknown error'}`
      );
    }
  }
);
```

#### 2.3 Alternative: Using REST API Directly

If RAG Engine SDK isn't available, use REST API:

```typescript
// functions/src/rag.ts (Alternative implementation)
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp } from 'firebase-admin/app';

initializeApp();

interface RagRequest {
  query: string;
  context?: string;
}

export const askRag = onCall(
  {
    cors: true,
    region: 'us-central1',
  },
  async (request) => {
    // Verify authentication
    const authHeader = request.rawRequest.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      await getAuth().verifyIdToken(token);
    } catch (error) {
      throw new HttpsError('unauthenticated', 'Invalid token');
    }

    const { query }: RagRequest = request.data;

    if (!query) {
      throw new HttpsError('invalid-argument', 'Query required');
    }

    try {
      // Get access token for Vertex AI
      const { GoogleAuth } = require('google-auth-library');
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();

      // Call RAG Engine REST API
      const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
      const location = process.env.RAG_ENGINE_LOCATION || 'us-central1';
      const ragEngineId = process.env.RAG_ENGINE_ID || 'YOUR_RAG_ENGINE_ID';

      const ragUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/ragEngines/${ragEngineId}:retrieveContexts`;

      const response = await fetch(ragUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          numContexts: 5,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`RAG Engine API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        text: data.contexts?.[0]?.text || data.response || 'No response generated',
        sources: data.contexts?.map((ctx: any, idx: number) => ({
          uri: ctx.sourceUri || ctx.uri || `context-${idx}`,
          title: ctx.sourceTitle || ctx.title || 'Reference',
        })) || [],
        confidence: data.scores?.[0] || data.confidence || 0.8,
      };
    } catch (error: any) {
      console.error('RAG Engine error:', error);
      throw new HttpsError(
        'internal',
        `RAG Engine error: ${error.message || 'Unknown error'}`
      );
    }
  }
);
```

#### 2.4 Update Functions Index

Create/update `functions/src/index.ts`:

```typescript
export { askRag } from './rag';
```

#### 2.5 Set Environment Variables

```bash
# Set in Firebase Functions config
firebase functions:config:set \
  rag.engine_location="us-central1" \
  rag.engine_id="YOUR_RAG_ENGINE_ID"

# Or use .env file (for local development)
# Create functions/.env
```

### Step 3: Deploy Cloud Function

```bash
cd functions

# Install dependencies
npm install

# Deploy the function
firebase deploy --only functions:askRag

# Or deploy all functions
firebase deploy --only functions
```

After deployment, note the function URL:
```
https://us-central1-YOUR_PROJECT.cloudfunctions.net/askRag
```

### Step 4: Update Frontend to Use Real RAG API

#### 4.1 Update Environment Variables

Add to `apps/web/.env`:

```env
# RAG Engine Configuration
VITE_RAG_API_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/askRag
```

#### 4.2 Create RAG API Service

Create `apps/web/src/lib/rag-api.ts`:

```typescript
import { auth } from '@/lib/firebase';
import type { RagResponse } from '@istock/shared';

const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || 'https://us-central1-YOUR_PROJECT.cloudfunctions.net/askRag';

interface RagRequest {
  query: string;
  context?: string;
}

/**
 * Call RAG Engine via Cloud Function
 */
export async function askRag(input: RagRequest): Promise<RagResponse> {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be authenticated to use RAG');
  }

  // Get Firebase Auth token
  const token = await user.getIdToken();

  try {
    const response = await fetch(RAG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          query: input.query,
          context: input.context,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Cloud Functions return result in { result: ... } format
    return result.result || result;
  } catch (error: any) {
    console.error('RAG API error:', error);
    throw new Error(`Failed to get RAG response: ${error.message}`);
  }
}
```

#### 4.3 Update tRPC Client

Update `apps/web/src/lib/trpc.ts`:

```typescript
import { useMutation } from '@tanstack/react-query';
import { askRag as callRagApi } from './rag-api';
import { mockTrpcClient } from './mock-trpc-client';

// Check if we should use real API or mock
const USE_REAL_API = import.meta.env.VITE_RAG_API_URL !== undefined;

export const useAskRag = () => {
  return useMutation({
    mutationFn: async (input: { query: string; context?: string }) => {
      if (USE_REAL_API) {
        return await callRagApi(input);
      }
      // Fallback to mock for development/testing
      return await mockTrpcClient.health.askRag(input);
    },
  });
};

export const useOptimizeFeed = () => {
  return useMutation({
    mutationFn: async (input: {
      targetAnimal: 'Dairy Cattle' | 'Beef Cattle' | 'Calf';
      ingredients: Array<{
        name: string;
        unitPrice: number;
        nutritionalValues: {
          protein?: number;
          energy?: number;
          fiber?: number;
          fat?: number;
        };
      }>;
    }) => {
      return await mockTrpcClient.nutrition.optimizeFeed(input);
    },
  });
};
```

### Step 5: Test the Integration

#### 5.1 Test Locally (with Firebase Emulator)

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start your app
cd apps/web
pnpm dev
```

#### 5.2 Test with Real RAG Engine

1. Ensure Firebase Functions are deployed
2. Ensure environment variable `VITE_RAG_API_URL` is set
3. Start the app: `pnpm dev`
4. Log in and try asking a question in the chatbot
5. Check browser console for API calls
6. Check Firebase Functions logs: `firebase functions:log`

### Step 6: Error Handling & Monitoring

#### 6.1 Add Error Handling in Frontend

Update `apps/web/src/lib/rag-api.ts` to handle errors better:

```typescript
export async function askRag(input: RagRequest): Promise<RagResponse> {
  // ... existing code ...

  try {
    const response = await fetch(RAG_API_URL, {
      // ... config ...
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      
      // Handle specific error codes
      if (response.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      }
      if (response.status === 403) {
        throw new Error('Permission denied. Please check your account.');
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again in a moment.');
      }
      
      throw new Error(error.error?.message || `Request failed with status ${response.status}`);
    }

    // ... rest of code ...
  } catch (error: any) {
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
}
```

#### 6.2 Add Logging to Cloud Function

```typescript
import * as logger from 'firebase-functions/logger';

// In your function
logger.info('RAG request received', { query: query, uid: uid });
logger.error('RAG Engine error', { error: error.message });
```

### Step 7: Security & Best Practices

#### 7.1 Add Rate Limiting (Optional)

Install `firebase-functions-rate-limiter` or implement custom rate limiting in Cloud Function.

#### 7.2 Add CORS Configuration

The Cloud Function already has `cors: true`, but you can customize:

```typescript
export const askRag = onCall(
  {
    cors: [
      'https://your-firebase-app.web.app',
      'https://your-firebase-app.firebaseapp.com',
      'http://localhost:5173', // For local development
    ],
    region: 'us-central1',
  },
  // ... function code ...
);
```

#### 7.3 Add Request Validation

```typescript
// Validate query length and content
if (query.length > 1000) {
  throw new HttpsError('invalid-argument', 'Query too long (max 1000 characters)');
}

if (query.length < 3) {
  throw new HttpsError('invalid-argument', 'Query too short (min 3 characters)');
}
```

## 📊 Monitoring & Debugging

### View Function Logs

```bash
# Real-time logs
firebase functions:log --only askRag

# Or in Google Cloud Console
# Cloud Functions → askRag → Logs
```

### Monitor RAG Engine

- **Vertex AI Console**: https://console.cloud.google.com/vertex-ai
- **Metrics**: View usage, latency, errors
- **Logs**: API request/response logs

## 🔧 Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check service account permissions
   - Verify IAM roles are set correctly
   - Ensure function service account has `roles/aiplatform.user`

2. **"RAG Engine not found"**
   - Verify RAG Engine ID and location
   - Check environment variables
   - Ensure RAG Engine is in the same project

3. **CORS errors**
   - Add your app domain to CORS config
   - Check function CORS settings

4. **Authentication errors**
   - Verify Firebase Auth token is passed correctly
   - Check token expiration
   - Ensure user is authenticated

## 🚀 Next Steps

1. **Optimize Performance**
   - Add caching for common queries
   - Implement request deduplication
   - Add response compression

2. **Enhance RAG Quality**
   - Fine-tune knowledge base
   - Add more livestock health documents
   - Implement feedback loop

3. **Add Analytics**
   - Track query patterns
   - Monitor response quality
   - User feedback collection

---

## 📚 Additional Resources

- [Vertex AI RAG Engine Documentation](https://cloud.google.com/vertex-ai/docs/rag-engine/overview)
- [Firebase Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [Vertex AI Authentication](https://cloud.google.com/vertex-ai/docs/general/authentication)

