'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { 
  Implementation, 
  ImplementationStats,
  getStatusColor, 
  getStatusLabel, 
  formatCurrency, 
  formatCo2,
  formatROI,
  calculateROIMetrics,
  calculatePortfolioROI
} from '../../lib/implementation';
import { useImplementation } from '../../hooks/useImplementation';

interface ImplementationHistoryProps {
  userId: string;
  className?: string;
  showAnalytics?: boolean;
  maxItems?: number;
}

/**
 * ImplementationHistory Component
 * 
 * Displays comprehensive implementation history and analytics for user profiles
 */
export const ImplementationHistory: React.FC<ImplementationHistoryProps> = ({
  userId,
  className = '',
  showAnalytics = true,
  maxItems = 20
}) => {
  const { implementations, stats, fetchImplementations, fetchStats, loading } = useImplementation();
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30d' | '90d' | '1y'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'in-progress' | 'started'>('all');

  useEffect(() => {
    if (userId) {
      fetchImplementations(userId);
      fetchStats(userId);
    }
  }, [userId, fetchImplementations, fetchStats]);

  // Filter implementations based on selected filters
  const filteredImplementations = implementations.filter(impl => {
    // Status filter
    if (selectedStatus !== 'all' && impl.status !== selectedStatus) {
      return false;
    }

    // Period filter
    if (selectedPeriod !== 'all') {
      const implDate = new Date(impl.started_at);
      const now = new Date();
      const daysDiff = (now.getTime() - implDate.getTime()) / (1000 * 60 * 60 * 24);
      
      switch (selectedPeriod) {
        case '30d':
          return daysDiff <= 30;
        case '90d':
          return daysDiff <= 90;
        case '1y':
          return daysDiff <= 365;
        default:
          return true;
      }
    }

    return true;
  }).slice(0, maxItems);

  // Calculate analytics for filtered implementations
  const portfolioAnalytics = React.useMemo(() => {
    if (filteredImplementations.length === 0) return null;
    return calculatePortfolioROI(filteredImplementations);
  }, [filteredImplementations]);

  // Group implementations by status for summary
  const implementationsByStatus = React.useMemo(() => {
    const groups = {
      completed: filteredImplementations.filter(impl => impl.status === 'completed'),
      'in-progress': filteredImplementations.filter(impl => impl.status === 'in-progress'),
      started: filteredImplementations.filter(impl => impl.status === 'started')
    };
    return groups;
  }, [filteredImplementations]);

  // Calculate trend data
  const trendData = React.useMemo(() => {
    const completedByMonth = implementationsByStatus.completed.reduce((acc, impl) => {
      const month = new Date(impl.completed_at || impl.started_at).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { count: 0, savings: 0, co2Reduction: 0 };
      }
      acc[month].count++;
      acc[month].savings += impl.estimated_cost_savings;
      acc[month].co2Reduction += impl.estimated_co2_reduction;
      return acc;
    }, {} as Record<string, { count: number; savings: number; co2Reduction: number }>);

    return Object.entries(completedByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months
  }, [implementationsByStatus.completed]);

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Implementation History</h3>
              <p className="text-sm text-gray-600 mt-1">
                Track your sustainability implementation journey and achievements
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="started">Started</option>
              </select>
            </div>
          </div>
        </CardHeader>

        {/* Quick Stats */}
        {stats && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalImplementations}</div>
                <div className="text-xs text-blue-600">Total Projects</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.completedImplementations}</div>
                <div className="text-xs text-green-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.completedSavings)}</div>
                <div className="text-xs text-purple-600">Total Savings</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{stats.completedCo2Reduction.toFixed(1)}</div>
                <div className="text-xs text-emerald-600">Tons CO₂ Reduced</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Portfolio Analytics */}
      {showAnalytics && portfolioAnalytics && (
        <Card>
          <CardHeader>
            <h4 className="text-md font-semibold text-gray-900">Portfolio Analytics</h4>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="text-lg font-bold text-indigo-700">{formatROI(portfolioAnalytics.portfolioROI)}</div>
                <div className="text-sm text-indigo-600">Portfolio ROI</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="text-lg font-bold text-green-700">{portfolioAnalytics.averagePaybackMonths.toFixed(1)} mo</div>
                <div className="text-sm text-green-600">Avg Payback</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-blue-700">{portfolioAnalytics.implementationEfficiency.toFixed(1)}%</div>
                <div className="text-sm text-blue-600">Efficiency Score</div>
              </div>
            </div>

            {/* Monthly Trend */}
            {trendData.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Completion Trend (Last 6 Months)</h5>
                <div className="grid grid-cols-6 gap-2">
                  {trendData.map(([month, data]) => (
                    <div key={month} className="text-center">
                      <div className="bg-blue-100 rounded-lg p-2 mb-1">
                        <div className="text-lg font-bold text-blue-700">{data.count}</div>
                      </div>
                      <div className="text-xs text-gray-500">{month.slice(5)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Implementation Timeline */}
      <Card>
        <CardHeader>
          <h4 className="text-md font-semibold text-gray-900">
            Implementation Timeline 
            <span className="ml-2 text-sm text-gray-500">({filteredImplementations.length} implementations)</span>
          </h4>
        </CardHeader>
        <CardContent>
          {filteredImplementations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📋</div>
              <p className="text-gray-600">No implementations found for the selected filters</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your time period or status filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredImplementations.map((implementation, index) => {
                const roiMetrics = calculateROIMetrics(implementation);
                const statusColor = getStatusColor(implementation.status);
                const statusLabel = getStatusLabel(implementation.status);
                
                return (
                  <div key={implementation.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    {/* Timeline indicator */}
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-3 h-3 rounded-full ${statusColor.replace('text-', 'bg-')}`} />
                      {index < filteredImplementations.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-300 mx-auto mt-2" />
                      )}
                    </div>
                    
                    {/* Implementation details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-900 truncate">{implementation.title}</h5>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} bg-white border`}>
                          {statusLabel}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-1">{implementation.category}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Started: {new Date(implementation.started_at).toLocaleDateString()}</span>
                          {implementation.completed_at && (
                            <span>Completed: {new Date(implementation.completed_at).toLocaleDateString()}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-green-600 font-medium">
                            {formatCurrency(implementation.estimated_cost_savings)}
                          </span>
                          <span className="text-blue-600 font-medium">
                            {formatCo2(implementation.estimated_co2_reduction)}
                          </span>
                          {implementation.status === 'completed' && (
                            <span className="text-purple-600 font-medium">
                              {formatROI(roiMetrics.currentROI)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress bar for non-completed items */}
                      {implementation.status !== 'completed' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{implementation.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${implementation.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      {showAnalytics && stats && stats.completedImplementations > 0 && (
        <Card>
          <CardHeader>
            <h4 className="text-md font-semibold text-gray-900">Achievements</h4>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.completedImplementations >= 1 && (
                <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl mb-1">🌱</div>
                  <div className="text-xs font-medium text-yellow-700">First Steps</div>
                  <div className="text-xs text-yellow-600">Completed 1+ implementations</div>
                </div>
              )}
              
              {stats.completedImplementations >= 5 && (
                <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="text-2xl mb-1">🌿</div>
                  <div className="text-xs font-medium text-green-700">Momentum Builder</div>
                  <div className="text-xs text-green-600">Completed 5+ implementations</div>
                </div>
              )}
              
              {stats.completedSavings >= 1000 && (
                <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="text-xs font-medium text-purple-700">Cost Saver</div>
                  <div className="text-xs text-purple-600">Saved $1,000+</div>
                </div>
              )}
              
              {stats.completedCo2Reduction >= 10 && (
                <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="text-2xl mb-1">🌍</div>
                  <div className="text-xs font-medium text-blue-700">Planet Protector</div>
                  <div className="text-xs text-blue-600">10+ tons CO₂ reduced</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 