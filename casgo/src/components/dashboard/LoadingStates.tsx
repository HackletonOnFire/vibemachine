'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '../../../components/ui';
import { cn } from '../../../lib/utils';

// Loading skeleton component props
interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  showHeader?: boolean;
  height?: 'sm' | 'md' | 'lg' | 'xl';
}

// Error state component props
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'card' | 'inline' | 'full';
}

// Network error component props
interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

/**
 * Generic Loading Skeleton Component
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  lines = 3,
  showHeader = true,
  height = 'md'
}) => {
  const heights = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
    xl: 'h-80'
  };

  return (
    <div className={cn('animate-pulse space-y-4', className)}>
      {showHeader && (
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      )}
      <div className={cn('bg-gray-200 rounded', heights[height])}></div>
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <div 
            key={i} 
            className="h-4 bg-gray-200 rounded" 
            style={{ width: `${Math.random() * 40 + 60}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

/**
 * KPI Card Loading Skeleton
 */
export const KPICardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Card className={cn('p-6 animate-pulse', className)}>
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-2 bg-gray-200 rounded w-full mt-4"></div>
      </div>
    </Card>
  );
};

const SKELETON_BAR_HEIGHTS = [45, 60, 75, 50, 65, 80, 55, 70];

export const ChartSkeleton = ({ className, height = 'md' }: { className?: string; height?: 'sm' | 'md' | 'lg' }) => {
  const heightClass = {
    sm: 'h-48',
    md: 'h-64',
    lg: 'h-80',
  }[height];

  return (
    <Card className={cn("p-6 animate-pulse", className)}>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2 mb-6"></div>
      <div className={cn("relative w-full", heightClass)}>
        <div className="absolute bottom-0 left-0 w-full flex items-end justify-between space-x-1 h-full">
          {Array.from({ length: 8 }, (_, i) => (
            <div 
              key={i}
              className="bg-gray-300 rounded-t w-8 opacity-50"
              style={{ height: `${SKELETON_BAR_HEIGHTS[i % SKELETON_BAR_HEIGHTS.length]}%` }}
            />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gray-300 mt-2"></div>
      </div>
    </Card>
  );
};

/**
 * Dashboard Grid Loading Skeleton
 */
export const DashboardGridSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-8', className)}>
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="space-y-8">
        {Array.from({ length: 3 }, (_, sectionIndex) => (
          <section key={sectionIndex} className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartSkeleton className="lg:col-span-2" height="lg" />
              <ChartSkeleton height="md" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

/**
 * Generic Error State Component
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an error while loading this data. Please try again.",
  onRetry,
  className,
  variant = 'card'
}) => {
  const content = (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn('min-h-screen flex items-center justify-center bg-gray-50', className)}>
        <div className="max-w-md w-full">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

/**
 * Network Error Component
 */
export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry, className }) => {
  return (
    <ErrorState
      title="Connection Problem"
      message="Unable to connect to our servers. Please check your internet connection and try again."
      onRetry={onRetry}
      className={className}
    />
  );
};

/**
 * Data Loading Error Component
 */
export const DataLoadingError: React.FC<NetworkErrorProps> = ({ onRetry, className }) => {
  return (
    <ErrorState
      title="Data Loading Failed"
      message="We couldn't load your sustainability data. This might be a temporary issue."
      onRetry={onRetry}
      className={className}
    />
  );
};

/**
 * No Data Available Component
 */
export const NoDataAvailable: React.FC<{ 
  message?: string; 
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}> = ({ 
  message = "No data available yet. Start by adding your energy usage information.",
  actionLabel = "Add Data",
  onAction,
  className 
}) => {
  return (
    <Card className={className}>
      <CardContent>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
          {onAction && (
            <button
              onClick={onAction}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Timeout Error Component
 */
export const TimeoutError: React.FC<NetworkErrorProps> = ({ onRetry, className }) => {
  return (
    <ErrorState
      title="Request Timeout"
      message="The request is taking longer than expected. Please try again."
      onRetry={onRetry}
      className={className}
    />
  );
};

/**
 * Permission Error Component
 */
export const PermissionError: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <ErrorState
      title="Access Denied"
      message="You don't have permission to view this data. Please contact your administrator."
      className={className}
      variant="card"
    />
  );
};

/**
 * Maintenance Mode Component
 */
export const MaintenanceMode: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">System Maintenance</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        We're currently updating our systems to serve you better. Please check back in a few minutes.
      </p>
    </div>
  );
};

// All components are exported individually above 