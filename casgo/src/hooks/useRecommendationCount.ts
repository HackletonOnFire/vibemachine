import { useState, useEffect, useCallback } from 'react';
import { recommendationOperations } from '../lib/database';
import { RecommendationPriority, RecommendationStatus } from '../lib/types/database';

interface RecommendationCount {
  total: number;
  priority: {
    high: number;
    medium: number;
    low: number;
    critical: number;
  };
  status: {
    pending: number;
    in_progress: number;
    completed: number;
  };
}

interface UseRecommendationCountResult {
  count: RecommendationCount;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const defaultCount: RecommendationCount = {
  total: 0,
  priority: { high: 0, medium: 0, low: 0, critical: 0 },
  status: { pending: 0, in_progress: 0, completed: 0 }
};

/**
 * Custom hook for managing real-time recommendation counts
 * Used for navigation badges and dashboard metrics
 * BUSINESS LOGIC: Only counts active recommendations (not completed)
 */
export const useRecommendationCount = (
  userId: string | null,
  refreshInterval: number = 30000 // 30 seconds default
): UseRecommendationCountResult => {
  const [count, setCount] = useState<RecommendationCount>(defaultCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    if (!userId) {
      setCount(defaultCount);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // BUSINESS LOGIC: Fetch only active recommendations (excludes completed)
      // This matches the getUserRecommendations function logic
      const result = await recommendationOperations.getUserRecommendations(userId, 100);
      
      if (result.success && result.data) {
        const recommendations = result.data;
        
        // Calculate counts by priority (only active recommendations)
        const priorityCounts = recommendations.reduce(
          (acc, rec) => {
            if (rec.priority) {
              acc[rec.priority] = (acc[rec.priority] || 0) + 1;
            }
            return acc;
          },
          { high: 0, medium: 0, low: 0, critical: 0 }
        );

        // Calculate counts by status (only active recommendations)
        const statusCounts = recommendations.reduce(
          (acc, rec) => {
            if (rec.status) {
              acc[rec.status] = (acc[rec.status] || 0) + 1;
            } else {
              // Default to pending if status is null
              acc.pending = (acc.pending || 0) + 1;
            }
            return acc;
          },
          { pending: 0, in_progress: 0, completed: 0 }
        );

        setCount({
          total: recommendations.length, // Only active recommendations
          priority: priorityCounts,
          status: statusCounts
        });
      } else {
        setCount(defaultCount);
        if (result.error) {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error('Error fetching recommendation count:', err);
      setError('Failed to fetch recommendation count');
      setCount(defaultCount);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    await fetchCount();
  }, [fetchCount]);

  // Initial fetch
  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (refreshInterval > 0 && userId) {
      const interval = setInterval(fetchCount, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchCount, refreshInterval, userId]);

  return {
    count,
    loading,
    error,
    refresh
  };
};

export default useRecommendationCount; 