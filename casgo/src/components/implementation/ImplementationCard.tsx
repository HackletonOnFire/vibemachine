'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { useImplementation } from '../../hooks/useImplementation';
import { ROIMetrics } from './ROIMetrics';
import { 
  Implementation, 
  getStatusColor, 
  getStatusLabel, 
  formatCurrency, 
  formatCo2 
} from '../../lib/implementation';

interface ImplementationCardProps {
  implementation: Implementation;
  className?: string;
  showActions?: boolean;
  showROI?: boolean;
  compact?: boolean;
  onStatusUpdate?: (implementation: Implementation) => void;
}

/**
 * ImplementationCard Component
 * 
 * Displays implementation status, progress, and estimated benefits.
 * Provides simple status management with automatic progression.
 */
export const ImplementationCard: React.FC<ImplementationCardProps> = ({
  implementation,
  className = '',
  showActions = true,
  showROI = false,
  compact = false,
  onStatusUpdate
}) => {
  const { success, info } = useToast();
  const { updateImplementation, updating } = useImplementation();

  const handleMarkCompleted = async () => {
    try {
      const updated = await updateImplementation(implementation.id, {
        status: 'completed',
        progressPercentage: 100
      });

      if (updated) {
        success(
          'Implementation Completed! 🎉',
          `Congratulations! You've completed "${implementation.title}". Your sustainability goals have been automatically updated with ${formatCurrency(implementation.estimated_cost_savings)} in savings and ${formatCo2(implementation.estimated_co2_reduction)} CO₂ reduction!`,
          { 
            duration: 10000,
            action: {
              label: 'View Goals Progress',
              onClick: () => {
                window.location.href = '/dashboard/goals';
              }
            }
          }
        );
        onStatusUpdate?.(updated);
      }
    } catch (error) {
      console.error('Error marking implementation as completed:', error);
    }
  };

  const handleMarkInProgress = async () => {
    try {
      const updated = await updateImplementation(implementation.id, {
        status: 'in-progress'
      });

      if (updated) {
        success(
          'Implementation Started! 🚀',
          `Great job! You've started working on "${implementation.title}". This implementation will save ${formatCurrency(implementation.estimated_cost_savings)} and reduce ${formatCo2(implementation.estimated_co2_reduction)} CO₂. Keep up the excellent work!`,
          { 
            duration: 6000,
            action: {
              label: 'Track Progress',
              onClick: () => {
                window.location.href = '/dashboard';
              }
            }
          }
        );
        onStatusUpdate?.(updated);
      }
    } catch (error) {
      console.error('Error updating implementation status:', error);
    }
  };

  // Calculate days since started
  const daysSinceStarted = Math.floor(
    (Date.now() - new Date(implementation.started_at).getTime()) / (24 * 60 * 60 * 1000)
  );

  // Auto-suggest status progression
  const shouldSuggestInProgress = implementation.status === 'started' && daysSinceStarted >= 3;
  const estimatedWeeksRemaining = Math.max(0, implementation.estimated_completion_weeks - Math.floor(daysSinceStarted / 7));

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors ${className}`}>
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="flex-shrink-0">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(implementation.status).replace('bg-', 'bg-').replace('text-', '').replace('border-', '')}`}></div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{implementation.title}</p>
            <p className="text-xs text-gray-500">{getStatusLabel(implementation.status)} • {implementation.progress_percentage}% complete</p>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-medium text-emerald-600">{formatCurrency(implementation.estimated_cost_savings)}</p>
          <p className="text-xs text-gray-500">{formatCo2(implementation.estimated_co2_reduction)}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{implementation.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{implementation.category}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(implementation.status)}`}>
            {getStatusLabel(implementation.status)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{implementation.progress_percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                implementation.status === 'completed' ? 'bg-green-500' :
                implementation.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
              }`}
              style={{ width: `${implementation.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Estimated Benefits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <p className="text-xs text-emerald-600 font-medium">Annual Savings</p>
            <p className="text-lg font-bold text-emerald-700">{formatCurrency(implementation.estimated_cost_savings)}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">CO₂ Reduction</p>
            <p className="text-lg font-bold text-blue-700">{formatCo2(implementation.estimated_co2_reduction)}</p>
          </div>
        </div>

        {/* Timeline Info */}
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Started:</span>
            <span>{new Date(implementation.started_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Difficulty:</span>
            <span className={`px-2 py-0.5 rounded text-xs ${
              implementation.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
              implementation.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {implementation.difficulty}
            </span>
          </div>
          {estimatedWeeksRemaining > 0 && implementation.status !== 'completed' && (
            <div className="flex justify-between">
              <span>Est. completion:</span>
              <span>{estimatedWeeksRemaining} week{estimatedWeeksRemaining !== 1 ? 's' : ''} remaining</span>
            </div>
          )}
        </div>

        {/* Auto-suggestion for status progression */}
        {shouldSuggestInProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Ready to make progress?</span> You started this {daysSinceStarted} days ago. 
              Mark it as "In Progress" to track your journey!
            </p>
          </div>
        )}

        {/* ROI Metrics Section */}
        {showROI && (
          <div className="pt-4 border-t border-gray-200">
            <ROIMetrics 
              implementation={implementation}
              compact={true}
              className="mt-0"
            />
          </div>
        )}
      </CardContent>

      {showActions && implementation.status !== 'completed' && (
        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            {/* Status progression buttons */}
            {implementation.status === 'started' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkInProgress}
                disabled={updating}
                className="flex-1"
              >
                {updating ? 'Updating...' : '🚀 Start Working'}
              </Button>
            )}
            
            {implementation.status === 'in-progress' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkCompleted}
                disabled={updating}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {updating ? 'Completing...' : '✅ Mark Complete'}
              </Button>
            )}

            {/* Always show complete button as secondary option */}
            {implementation.status === 'started' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkCompleted}
                disabled={updating}
                className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                Skip to Complete
              </Button>
            )}
          </div>
        </CardFooter>
      )}

      {/* Completion celebration */}
      {implementation.status === 'completed' && (
        <CardFooter className="pt-0">
          <div className="w-full text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">🎉 Implementation Complete!</p>
            <p className="text-sm text-green-600 mt-1">
              Completed {implementation.completed_at ? new Date(implementation.completed_at).toLocaleDateString() : 'recently'}
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}; 