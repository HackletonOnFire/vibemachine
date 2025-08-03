'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useImplementation } from '../../hooks/useImplementation';
import { ImplementationCard } from './ImplementationCard';
import { Implementation } from '../../lib/implementation';

interface ImplementationsListProps {
  userId: string;
  className?: string;
  maxItems?: number;
  showTitle?: boolean;
  compact?: boolean;
}

/**
 * ImplementationsList Component
 * 
 * Displays user implementations with filtering and status management.
 * Integrates seamlessly with dashboard layout.
 */
export const ImplementationsList: React.FC<ImplementationsListProps> = ({
  userId,
  className = '',
  maxItems,
  showTitle = true,
  compact = false
}) => {
  const { 
    implementations, 
    loading, 
    error, 
    fetchImplementations,
    clearError 
  } = useImplementation();
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchImplementations(userId);
    }
  }, [userId, fetchImplementations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchImplementations(userId);
    setRefreshing(false);
  };

  const handleStatusUpdate = async (updatedImplementation: Implementation) => {
    // Refresh data to get latest status
    await fetchImplementations(userId);
  };

  // Filter implementations
  const filteredImplementations = implementations.filter(impl => {
    switch (filter) {
      case 'active':
        return impl.status === 'started' || impl.status === 'in-progress';
      case 'completed':
        return impl.status === 'completed';
      default:
        return true;
    }
  });

  const displayedImplementations = maxItems 
    ? filteredImplementations.slice(0, maxItems)
    : filteredImplementations;

  // Calculate stats for display
  const stats = {
    total: implementations.length,
    active: implementations.filter(i => i.status === 'started' || i.status === 'in-progress').length,
    completed: implementations.filter(i => i.status === 'completed').length,
    totalSavings: implementations
      .filter(i => i.status === 'completed')
      .reduce((sum, i) => sum + i.estimated_cost_savings, 0),
    totalCo2: implementations
      .filter(i => i.status === 'completed')
      .reduce((sum, i) => sum + i.estimated_co2_reduction, 0)
  };

  if (loading && implementations.length === 0) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <h3 className="text-lg font-semibold">Your Implementations</h3>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading implementations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <h3 className="text-lg font-semibold">Your Implementations</h3>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">⚠️ Failed to load implementations</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => { clearError(); handleRefresh(); }}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (implementations.length === 0) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <h3 className="text-lg font-semibold">Your Implementations</h3>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌱</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Start Your Sustainability Journey</h4>
            <p className="text-gray-600 mb-4">
              Click "Implement Now" on any recommendation to begin tracking your progress toward a greener future.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard/recommendations'}
            >
              View Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Your Implementations</h3>
              <p className="text-sm text-gray-600 mt-1">
                {stats.active} active • {stats.completed} completed • {stats.total} total
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-gray-500 hover:text-gray-700"
            >
              {refreshing ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {/* Quick Stats for Completed Implementations */}
        {stats.completed > 0 && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-center">
              <p className="text-sm text-green-600 font-medium">Total Savings Achieved</p>
              <p className="text-lg font-bold text-green-700">
                ${stats.totalSavings.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-green-600 font-medium">CO₂ Reduced</p>
              <p className="text-lg font-bold text-green-700">
                {stats.totalCo2.toFixed(1)} tons
              </p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {!compact && (
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'active', label: 'Active', count: stats.active },
              { key: 'completed', label: 'Completed', count: stats.completed },
              { key: 'all', label: 'All', count: stats.total }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  filter === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        )}

        {/* Implementations List */}
        <div className={`space-y-${compact ? '3' : '4'}`}>
          {displayedImplementations.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">
                No {filter === 'all' ? '' : filter} implementations found.
              </p>
              {filter !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="mt-2"
                >
                  View All
                </Button>
              )}
            </div>
          ) : (
            displayedImplementations.map((implementation) => (
              <ImplementationCard
                key={implementation.id}
                implementation={implementation}
                compact={compact}
                showActions={!compact}
                showROI={!compact}
                onStatusUpdate={handleStatusUpdate}
              />
            ))
          )}
        </div>

        {/* View More Link */}
        {maxItems && filteredImplementations.length > maxItems && (
          <div className="text-center pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/dashboard/implementations'}
            >
              View All {filteredImplementations.length} Implementations →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 