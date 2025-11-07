import dotenv from 'dotenv';
import { onRequest, Request } from 'firebase-functions/v2/https';
import { Response } from 'express';
import { initializeApp, getApps } from 'firebase-admin/app';
// import { getAuth } from 'firebase-admin/auth'; // Uncomment when you enable authentication
import { GoogleAuth } from 'google-auth-library';
import * as path from 'path';
import * as functions from 'firebase-functions';
import { handleCorsPreflight, setCorsHeaders } from './cors';

// Load environment variables from .env file (for local development)
// In production, these should be set via Firebase Functions config
// Try multiple paths to find .env file
const envPath = path.join(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error && process.env.NODE_ENV !== 'production') {
  // Only log warning in development, not production
  // In production, environment variables should be set via Firebase config
  console.warn(`Warning: Could not load .env file from ${envPath}. Make sure your .env file exists or set environment variables via Firebase config.`);
}

// Initialize Firebase Admin (only if not already initialized)
if (getApps().length === 0) {
  initializeApp();
}

interface RagRequest {
  prompt: string;
  context?: string;
}

interface RagResponse {
  text: string;
  sources: Array<{ uri: string; title: string }>;
  confidence: number;
}

/**
 * Get RAG Engine configuration from environment variables
 * Supports both new process.env and legacy functions.config() API
 */
function getRagConfig() {
  // Try new environment variables first (for v2 functions)
  let projectId = process.env.RAG_ENGINE_PROJECT_ID;
  let location = process.env.RAG_ENGINE_LOCATION;
  let ragEngineId = process.env.RAG_ENGINE_ID;

  // Fall back to legacy functions.config() API if not set
  if (!projectId || !location || !ragEngineId) {
    try {
      const config = functions.config();
      projectId = projectId || config.rag?.engine_project_id;
      location = location || config.rag?.engine_location;
      ragEngineId = ragEngineId || config.rag?.engine_id;
    } catch (e) {
      // Ignore if config API is not available
    }
  }

  if (!projectId) {
    throw new Error('RAG_ENGINE_PROJECT_ID environment variable is not set');
  }

  if (!location) {
    throw new Error('RAG_ENGINE_LOCATION environment variable is not set');
  }

  if (!ragEngineId) {
    throw new Error('RAG_ENGINE_ID environment variable is not set');
  }

  return { projectId, location, ragEngineId };
}

/**
 * Initialize Google Cloud authentication client
 */
async function getAuthenticatedClient() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    projectId: getRagConfig().projectId,
  });
  return await auth.getClient();
}

/**
 * Cloud Function to query RAG Engine via Vertex AI
 * 
 * This function:
 * 1. Handles CORS preflight requests (OPTIONS)
 * 2. Calls Google Cloud RAG Engine API
 * 3. Returns formatted response
 * 
 * Environment variables required (in functions/.env or Firebase config):
 * - RAG_ENGINE_PROJECT_ID: Your Google Cloud project ID
 * - RAG_ENGINE_LOCATION: Location of RAG Engine (e.g., us-east1)
 * - RAG_ENGINE_ID: Your RAG Engine ID
 * 
 * POST /ragQuery
 * Body: { "prompt": "your question here", "context": "optional context" }
 */

export const ragQuery = onRequest(
  {
    region: process.env.RAG_ENGINE_LOCATION || 'us-east1', // Make sure this region is correct
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '512MiB',
  },
  async (req: Request, res: Response) => {
    // ========================================
    // CRITICAL: OPTIONS handling MUST be FIRST
    // ========================================
    // The browser sends OPTIONS preflight BEFORE the actual request
    // This MUST be handled immediately, before ANY other logic
    if (handleCorsPreflight(req, res)) {
      return; // Preflight handled, stop execution
    }

    // ========================================
    // Set CORS headers for actual requests (POST, GET, etc.)
    // ========================================
    const allowedOrigin = setCorsHeaders(req, res);
    
    // For actual requests, if origin is specified and not allowed, reject
    if (req.headers.origin && !allowedOrigin) {
      res.status(403).json({ error: 'Origin not allowed by CORS policy' });
      return;
    }

    // ========================================
    // Handle ACTUAL requests (e.g., POST)
    // ========================================
    
    // Only allow POST requests for actual RAG queries
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    try {
      // Step 1: Optional - Verify Firebase Authentication
      // Uncomment the following section if you want to require authentication
      /*
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required. Please sign in.' });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      let uid: string;

      try {
        const decodedToken = await getAuth().verifyIdToken(token);
        uid = decodedToken.uid;
      } catch (error: any) {
        res.status(401).json({ error: `Invalid authentication token: ${error.message}` });
        return;
      }
      */

      // Step 2: Validate request data
      const { prompt, context }: RagRequest = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt is required and must be a string' });
        return;
      }

      if (prompt.length < 3) {
        res.status(400).json({ error: 'Prompt must be at least 3 characters long' });
        return;
      }

      if (prompt.length > 2000) {
        res.status(400).json({ error: 'Prompt must be less than 2000 characters' });
        return;
      }

      // Step 3: Get configuration
      const { projectId, location, ragEngineId } = getRagConfig();

      // Step 4: Get Google Cloud access token
      const client = await getAuthenticatedClient();
      const accessTokenResponse = await client.getAccessToken();

      if (!accessTokenResponse.token) {
        throw new Error('Failed to obtain access token');
      }

      // Step 5: Call RAG Corpus REST API
      // Using ragCorpora endpoint as per resource name format
      const ragEngineUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/ragCorpora/${ragEngineId}:retrieveContexts`;

      const response = await fetch(ragEngineUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessTokenResponse.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: prompt,
          numContexts: 5, // Number of context chunks to retrieve
          similarityTopK: 5, // Top K similar contexts
          ...(context && { context: context }), // Optional context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
        console.error('RAG Engine API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        if (response.status === 404) {
          throw new Error('RAG Engine not found. Check your RAG_ENGINE_ID configuration.');
        }
        if (response.status === 403) {
          throw new Error('Permission denied. Check service account permissions.');
        }
        
        throw new Error(`RAG Engine API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json() as {
        contexts?: Array<Record<string, unknown>>;
        contextChunks?: Array<Record<string, unknown>>;
        scores?: number[];
        response?: string;
        confidence?: number;
      };

      // Step 6: Format response
      const contexts = data.contexts || data.contextChunks || [];
      const scores = data.scores || [];

      const ragResponse: RagResponse = {
        text: (contexts[0]?.text as string) || (contexts[0]?.content as string) || data.response || 'No response generated',
        sources: contexts.map((ctx: unknown, idx: number) => {
          const context = ctx as Record<string, unknown>;
          return {
            uri: (context.sourceUri || context.uri || (context.metadata as Record<string, unknown>)?.source || `context-${idx}`) as string,
            title: (context.sourceTitle || context.title || (context.metadata as Record<string, unknown>)?.title || 'Reference') as string,
          };
        }),
        confidence: scores[0] || data.confidence || 0.8,
      };

      // Log successful request (optional)
      console.log('RAG request successful', {
        promptLength: prompt.length,
        sourcesCount: ragResponse.sources.length,
      });

      // Return success response
      res.status(200).json(ragResponse);
    } catch (error: unknown) {
      const errorObj = error as { message?: string; stack?: string };
      console.error('RAG Engine error:', {
        error: errorObj.message,
        stack: errorObj.stack,
      });

      // Provide user-friendly error messages
      let statusCode = 500;
      let errorMessage = errorObj.message || 'Unknown error occurred';

      if (errorMessage.includes('environment variable')) {
        statusCode = 500;
        errorMessage = `Configuration error: ${errorMessage}`;
      } else if (errorMessage.includes('fetch') || errorMessage.includes('Network')) {
        statusCode = 503;
        errorMessage = 'Network error connecting to RAG Engine. Please try again.';
      } else if (errorMessage.includes('Permission denied')) {
        statusCode = 403;
      } else if (errorMessage.includes('not found')) {
        statusCode = 404;
      }

      // Ensure CORS headers are set on error responses too
      setCorsHeaders(req, res);
      
      res.status(statusCode).json({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorObj.stack : undefined,
      });
    }
  }
);
