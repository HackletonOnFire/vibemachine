'use client';

import { useState, useCallback } from 'react';
import { 
  Implementation, 
  ImplementationStats,
  CreateImplementationRequest,
  UpdateImplementationRequest,
  implementationApi 
} from '../lib/implementation';

export interface UseImplementationReturn {
  // State
  implementations: Implementation[];
  stats: ImplementationStats | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;

  // Actions
  createImplementation: (data: CreateImplementationRequest) => Promise<Implementation | null>;
  fetchImplementations: (userId: string, status?: string) => Promise<void>;
  updateImplementation: (id: string, data: UpdateImplementationRequest) => Promise<Implementation | null>;
  fetchStats: (userId: string) => Promise<void>;
  clearError: () => void;
  refreshData: (userId: string) => Promise<void>;
}

/**
 * Custom hook for managing implementation state and API calls
 * Provides loading states, error handling, and convenient methods
 */
export function useImplementation(): UseImplementationReturn {
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const [stats, setStats] = useState<ImplementationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createImplementation = useCallback(async (data: CreateImplementationRequest): Promise<Implementation | null> => {
    try {
      setCreating(true);
      setError(null);
      
      const response = await implementationApi.create(data);
      
      if (response.success) {
        // Add the new implementation to the list
        setImplementations(prev => [response.implementation, ...prev]);
        return response.implementation;
      } else {
        throw new Error('Failed to create implementation');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create implementation';
      setError(errorMessage);
      console.error('Error creating implementation:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  const fetchImplementations = useCallback(async (userId: string, status?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await implementationApi.getByUser(userId, status);
      
      if (response.success) {
        setImplementations(response.implementations);
      } else {
        throw new Error('Failed to fetch implementations');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch implementations';
      setError(errorMessage);
      console.error('Error fetching implementations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateImplementation = useCallback(async (id: string, data: UpdateImplementationRequest): Promise<Implementation | null> => {
    try {
      setUpdating(true);
      setError(null);
      
      const response = await implementationApi.update(id, data);
      
      if (response.success) {
        // Update the implementation in the list
        setImplementations(prev => 
          prev.map(impl => 
            impl.id === id ? response.implementation : impl
          )
        );
        return response.implementation;
      } else {
        throw new Error('Failed to update implementation');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update implementation';
      setError(errorMessage);
      console.error('Error updating implementation:', err);
      return null;
    } finally {
      setUpdating(false);
    }
  }, []);

  const fetchStats = useCallback(async (userId: string): Promise<void> => {
    try {
      setError(null);
      
      const response = await implementationApi.getStats(userId);
      
      if (response.success) {
        setStats(response.stats);
      } else {
        throw new Error('Failed to fetch implementation stats');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch implementation stats';
      setError(errorMessage);
      console.error('Error fetching implementation stats:', err);
    }
  }, []);

  const refreshData = useCallback(async (userId: string): Promise<void> => {
    // Refresh both implementations and stats
    await Promise.all([
      fetchImplementations(userId),
      fetchStats(userId)
    ]);
  }, [fetchImplementations, fetchStats]);

  return {
    // State
    implementations,
    stats,
    loading,
    error,
    creating,
    updating,

    // Actions
    createImplementation,
    fetchImplementations,
    updateImplementation,
    fetchStats,
    clearError,
    refreshData,
  };
} 