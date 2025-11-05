import { useMutation } from '@tanstack/react-query';
import { mockTrpcClient } from './mock-trpc-client';
import { askRag as callRagApi, isRagApiConfigured } from './rag-api';

/**
 * Hook to call RAG Engine
 * 
 * Automatically uses real RAG API if VITE_RAG_API_URL is configured,
 * otherwise falls back to mock client for development/testing
 */
export const useAskRag = () => {
  const useRealApi = isRagApiConfigured();

  return useMutation({
    mutationFn: async (input: { query: string; context?: string }) => {
      if (useRealApi) {
        // Use real RAG Engine API
        return await callRagApi(input);
      }
      // Fallback to mock for development
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
