import dotenv from 'dotenv';
import { onRequest, Request } from 'firebase-functions/v2/https';
import { Response } from 'express';
import { initializeApp, getApps } from 'firebase-admin/app';
import { VertexRagServiceClient } from '@google-cloud/aiplatform';
import * as path from 'path';
import * as functions from 'firebase-functions';
import { handleCorsPreflight, setCorsHeaders } from './cors';

// Load environment variables from .env file (for local development)
// In production, these should be set via Firebase Functions config
const envPath = path.join(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error && process.env.NODE_ENV !== 'production') {
  console.warn(`Warning: Could not load .env file from ${envPath}. Make sure your .env file exists or set environment variables via Firebase config.`);
}

// Initialize Firebase Admin (only if not already initialized)
if (getApps().length === 0) {
  initializeApp();
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
 * Initialize Vertex RAG Service client
 */
function getVertexRagClient(projectId: string, location: string) {
  return new VertexRagServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
    projectId: projectId,
  });
}

/**
 * Get access token for Vertex AI API calls
 */
async function getAccessToken(): Promise<string> {
  const { GoogleAuth } = require('google-auth-library');
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken?.token || '';
}

/**
 * Synthesize a concise answer from retrieved contexts using Vertex AI Generative AI (Gemini) via REST API
 */
async function synthesizeAnswer(
  userQuery: string,
  contexts: string[],
  projectId: string,
  location: string
): Promise<string> {
  try {
    // Get access token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }

    // Combine contexts (use top 5)
    const combinedContext = contexts
      .slice(0, 5)
      .join('\n\n---\n\n');

    // Create prompt for synthesis
    const systemInstruction = `You are a helpful assistant that provides accurate information about livestock health based on veterinary documents. Provide clear, concise answers (2-4 paragraphs, 200-400 words) using simple, professional language appropriate for farmers. Do not include disclaimers, legal text, or document metadata.`;

    const userPrompt = `Based on the following context from veterinary documents, answer this question: ${userQuery}

Context:
${combinedContext}`;

    // Call Vertex AI Generative AI REST API
    const apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-1.5-flash:generateContent`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: userPrompt,
          }],
        }],
        systemInstruction: {
          parts: [{
            text: systemInstruction,
          }],
        },
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
          topP: 0.95,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', response.status, errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract generated text
    const candidates = data.candidates || [];
    if (candidates.length > 0 && candidates[0].content?.parts) {
      const textParts = candidates[0].content.parts
        .filter((part: any) => part.text)
        .map((part: any) => part.text);
      
      if (textParts.length > 0) {
        return textParts.join('\n').trim();
      }
    }

    // Fallback if no text generated
    throw new Error('No text generated from Gemini');
  } catch (error: any) {
    console.error('LLM synthesis error:', error);
    // Fallback: return first context truncated intelligently
    if (contexts.length > 0) {
      const truncated = contexts[0].substring(0, 800);
      const lastPeriod = truncated.lastIndexOf('.');
      const lastNewline = truncated.lastIndexOf('\n');
      const cutPoint = Math.max(lastPeriod, lastNewline);
      
      if (cutPoint > 400) {
        return truncated.substring(0, cutPoint + 1);
      }
      return truncated + '...';
    }
    return 'Unable to generate answer. Please try rephrasing your question.';
  }
}

/**
 * tRPC endpoint handler for RAG queries
 * 
 * This function:
 * 1. Handles CORS preflight requests (OPTIONS)
 * 2. Parses tRPC-style requests
 * 3. Calls Google Cloud RAG Engine API
 * 4. Returns formatted response
 * 
 * Environment variables required (in functions/.env or Firebase config):
 * - RAG_ENGINE_PROJECT_ID: Your Google Cloud project ID
 * - RAG_ENGINE_LOCATION: Location of RAG Engine (e.g., us-east1)
 * - RAG_ENGINE_ID: Your RAG Engine ID
 * 
 * POST /trpc
 * Body: { "prompt": "your question here", "context": "optional context" }
 */
export const trpc = onRequest(
  {
    region: process.env.RAG_ENGINE_LOCATION || 'us-east1',
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '512MiB',
  },
  async (req: Request, res: Response) => {
    // ========================================
    // CRITICAL: OPTIONS handling MUST be FIRST
    // ========================================
    if (handleCorsPreflight(req, res)) {
      return; // Preflight handled, stop execution
    }

    // ========================================
    // Set CORS headers for actual requests
    // ========================================
    const allowedOrigin = setCorsHeaders(req, res);
    
    if (req.headers.origin && !allowedOrigin) {
      res.status(403).json({ error: 'Origin not allowed by CORS policy' });
      return;
    }

    // ========================================
    // Handle ACTUAL requests (e.g., POST)
    // ========================================
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    try {
      // Parse the request path for tRPC routing (if needed)
      const path = req.path || '';
      console.log('tRPC Handler - Parsed path:', path);
      
      // If path contains procedure name (e.g., /health/askRag), extract it but don't require it
      // The current implementation doesn't require procedure names in the path
      
      console.log('tRPC Handler - Content-Type:', req.headers['content-type']);
      console.log('tRPC Handler - Request method:', req.method);
      console.log('tRPC Handler - Request body type:', typeof req.body);
      console.log('tRPC Handler - Raw body exists:', !!req.body);
      console.log('tRPC Handler - Body is object:', typeof req.body === 'object');
      console.log('tRPC Handler - Body is string:', typeof req.body === 'string');

      // Parse request body
      // Frontend sends: { prompt: string, context?: string }
      // Firebase Functions v2 may auto-parse JSON, but handle both cases
      let body: any = {};
      
      if (req.body) {
        // If body is already parsed (object)
        if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
          body = req.body;
        } else if (typeof req.body === 'string') {
          // If body is a string, parse it
          try {
            body = JSON.parse(req.body);
          } catch (e) {
            console.error('Failed to parse body as JSON:', e);
            res.status(400).json({ error: 'Invalid JSON in request body' });
            return;
          }
        }
      } else {
        // Body might be in raw format - try to read it
        // For Firebase Functions v2, body should be auto-parsed, but check anyway
        console.warn('Request body is empty or undefined');
        res.status(400).json({ error: 'Request body is required' });
        return;
      }
      
      console.log('tRPC Handler - Parsed body:', JSON.stringify(body));
      console.log('tRPC Handler - Body keys:', Object.keys(body || {}));
      console.log('tRPC Handler - Extracting prompt from body...');
      console.log('tRPC Handler - Body.prompt:', body.prompt);
      console.log('tRPC Handler - Body.prompt type:', typeof body.prompt);

      let prompt: string;
      let context: string | undefined;

      // Handle different request formats
      if (body.prompt) {
        // Direct format: { prompt: string, context?: string }
        prompt = body.prompt;
        context = body.context;
        console.log('tRPC Handler - Prompt extracted:', prompt);
        console.log('tRPC Handler - Context:', context);
      } else if (body.query) {
        // Alternative format: { query: string, context?: string }
        prompt = body.query;
        context = body.context;
      } else if (body.data?.prompt) {
        // Wrapped format: { data: { prompt: string, context?: string } }
        prompt = body.data.prompt;
        context = body.data.context;
      } else if (body.data?.query) {
        // Wrapped format: { data: { query: string, context?: string } }
        prompt = body.data.query;
        context = body.data.context;
      } else {
        console.error('tRPC Handler - Invalid request body format:', body);
        res.status(400).json({ 
          error: 'Invalid request format. Expected { prompt: string, context?: string }',
          received: body 
        });
        return;
      }

      // Validate prompt
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

      console.log('tRPC Handler - Prompt validated, length:', prompt.length);
      console.log('tRPC Handler - About to get RAG config...');

      // Get configuration
      let projectId: string;
      let location: string;
      let ragEngineId: string;
      
      try {
        const config = getRagConfig();
        projectId = config.projectId;
        location = config.location;
        ragEngineId = config.ragEngineId;
        console.log('tRPC Handler - RAG Config retrieved successfully');
      } catch (error: any) {
        console.error('tRPC Handler - Error getting RAG config:', error);
        console.error('tRPC Handler - Error stack:', error.stack);
        throw error;
      }
      
      console.log('tRPC Handler - RAG Config:', {
        projectId,
        location,
        ragEngineId,
        timestamp: new Date().toISOString(),
      });
      
      // Verify we're using the correct corpus ID
      if (ragEngineId !== '6301661778598166528') {
        console.error('WARNING: Using incorrect RAG Engine ID:', ragEngineId, 'Expected: 6301661778598166528');
      }

      // Use Vertex AI SDK instead of REST API for better reliability
      console.log('tRPC Handler - Using Vertex AI SDK to query RAG corpus...');
      
      const ragClient = getVertexRagClient(projectId, location);
      const parent = `projects/${projectId}/locations/${location}`;
      const ragCorpusName = `projects/${projectId}/locations/${location}/ragCorpora/${ragEngineId}`;
      
      console.log('tRPC Handler - Parent:', parent);
      console.log('tRPC Handler - RAG Corpus name:', ragCorpusName);
      
      try {
        // Use the Vertex AI SDK to retrieve contexts
        // The SDK handles the correct endpoint format automatically
        const result = await ragClient.retrieveContexts({
          parent: parent,
          query: {
            text: prompt,
            // Note: context parameter might not be supported in the query object
            // If needed, it might need to be passed differently
          },
          vertexRagStore: {
            ragResources: [{
              ragCorpus: ragCorpusName,
            }],
          },
        });

        // The result is a Promise that resolves to an array
        const [response] = await result;
        console.log('tRPC Handler - Vertex AI SDK response received');
        console.log('tRPC Handler - Response keys:', Object.keys(response || {}));
        console.log('tRPC Handler - Response structure:', JSON.stringify(response, null, 2));
        
        // Format response from SDK
        // The Vertex AI SDK response structure may vary - try multiple possible formats
        // Use type assertion to handle dynamic response structure
        const responseAny = response as any;
        let contextsArray: any[] = [];
        let scores: number[] = [];
        
        // Handle nested contexts structure: response.contexts.contexts
        if (responseAny.contexts) {
          if (Array.isArray(responseAny.contexts)) {
            // Direct array: response.contexts = [...]
            contextsArray = responseAny.contexts;
          } else if (responseAny.contexts.contexts && Array.isArray(responseAny.contexts.contexts)) {
            // Nested structure: response.contexts.contexts = [...]
            contextsArray = responseAny.contexts.contexts;
          } else if (responseAny.contexts.contexts) {
            // Single nested context
            contextsArray = [responseAny.contexts.contexts];
          } else {
            // Single context object
            contextsArray = [responseAny.contexts];
          }
        } else if (responseAny.ragContexts && Array.isArray(responseAny.ragContexts)) {
          contextsArray = responseAny.ragContexts;
        } else if (responseAny.ragContexts) {
          contextsArray = [responseAny.ragContexts];
        } else if (responseAny.contextChunks && Array.isArray(responseAny.contextChunks)) {
          contextsArray = responseAny.contextChunks;
        } else if (responseAny.contextChunks) {
          contextsArray = [responseAny.contextChunks];
        }
        
        // Extract scores - check nested structure too
        if (responseAny.scores && Array.isArray(responseAny.scores)) {
          scores = responseAny.scores;
        } else if (responseAny.contexts?.scores && Array.isArray(responseAny.contexts.scores)) {
          scores = responseAny.contexts.scores;
        } else if (responseAny.similarityScores && Array.isArray(responseAny.similarityScores)) {
          scores = responseAny.similarityScores;
        } else if (contextsArray.length > 0) {
          // Extract scores from individual contexts if they have score field
          scores = contextsArray
            .map((ctx: any) => ctx.score || ctx._score)
            .filter((score: any) => typeof score === 'number')
            .slice(0, 5); // Limit to top 5
        }
        
        console.log('tRPC Handler - Extracted contexts count:', contextsArray.length);
        console.log('tRPC Handler - Extracted scores count:', scores.length);
        if (contextsArray.length > 0) {
          console.log('tRPC Handler - First context structure:', JSON.stringify(contextsArray[0], null, 2));
          console.log('tRPC Handler - First context keys:', Object.keys(contextsArray[0] || {}));
        }

        // Extract contexts and synthesize answer using LLM
        let responseText = 'No response generated';
        if (contextsArray.length > 0) {
          // Extract text from all contexts
          const contextTexts = contextsArray
            .map((ctx: any) => {
              return ctx.text || ctx.content || ctx.contextText || 
                     ctx.ragContext?.text || ctx.ragContext?.content || '';
            })
            .filter((text: string) => text && String(text).trim().length > 0)
            .map((text: string) => String(text).trim());
          
          if (contextTexts.length > 0) {
            console.log('tRPC Handler - Synthesizing answer from', contextTexts.length, 'contexts');
            // Use LLM to synthesize a concise answer
            responseText = await synthesizeAnswer(prompt, contextTexts, projectId, location);
            console.log('tRPC Handler - Synthesized answer length:', responseText.length);
          }
        }
        
        // Fallback if synthesis didn't work
        if (responseText === 'No response generated') {
          const responseLevelText = 
            (responseAny.response && String(responseAny.response).trim()) ||
            (responseAny.text && String(responseAny.text).trim());
          
          if (responseLevelText) {
            responseText = responseLevelText
              .replace(/\r\n/g, ' ')
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }
        
        console.log('tRPC Handler - Final responseText length:', responseText.length);
        
        // Deduplicate sources by title (or URI if title is generic)
        const sourceMap = new Map<string, { uri: string; title: string }>();
        
        contextsArray.forEach((ctx: any) => {
          const uri = ctx.sourceUri 
            || ctx.uri 
            || ctx.source?.uri
            || ctx.metadata?.sourceUri
            || ctx.metadata?.source
            || ctx.ragContext?.sourceUri
            || ctx.ragContext?.uri;
          
          const title = ctx.sourceDisplayName
            || ctx.sourceTitle 
            || ctx.title 
            || ctx.source?.title
            || ctx.metadata?.title
            || ctx.ragContext?.title
            || ctx.ragContext?.sourceTitle
            || 'Reference';
          
          // Use title as the deduplication key (or URI if title is generic)
          const key = title !== 'Reference' ? title.toLowerCase().trim() : (uri || 'unknown');
          
          // Only add if we haven't seen this source before and it has valid data
          if (!sourceMap.has(key) && title && title !== 'Reference') {
            const validUri = uri && (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:'))
              ? uri
              : `https://rag.istock.local/${encodeURIComponent(title)}`;
            
            sourceMap.set(key, {
              uri: validUri,
              title: title,
            });
          }
        });
        
        const ragResponse: RagResponse = {
          text: responseText,
          sources: Array.from(sourceMap.values()), // Convert Map to array of unique sources
          confidence: scores[0] || responseAny.confidence || 0.8,
        };

        // Log successful request
        console.log('tRPC RAG request successful', {
          promptLength: prompt.length,
          sourcesCount: ragResponse.sources.length,
        });

        // Return success response
        res.status(200).json(ragResponse);
      } catch (error: any) {
        console.error('tRPC Handler - Vertex AI SDK error:', error);
        throw error;
      }
    } catch (error: unknown) {
      const errorObj = error as { message?: string; stack?: string };
      console.error('tRPC RAG Engine error:', {
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

