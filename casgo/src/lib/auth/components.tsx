'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context';
import { authUtils } from '../supabase';
import { Spinner } from '@/components/ui';

// Props for protected route components
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
  requireOnboarding?: boolean;
  onboardingRedirectTo?: string;
}

interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

interface ConditionalRenderProps {
  when: 'authenticated' | 'unauthenticated' | 'loading' | 'onboarded' | 'not-onboarded';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Hook for onboarding status
function useOnboardingStatus() {
  const { user } = useAuth();
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const checkOnboardingStatus = useCallback(async () => {
    if (!user) {
      setCompleted(null);
      setLoading(false);
      setNeedsOnboarding(false);
      return;
    }

    try {
      setLoading(true);
      const isComplete = await authUtils.hasCompletedOnboarding();
      setCompleted(isComplete);
      setNeedsOnboarding(!isComplete);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setCompleted(false);
      setNeedsOnboarding(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return { completed, loading, needsOnboarding };
}

// Loading component for authentication states
const AuthLoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = 'Checking authentication...' 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

// Error component for authentication failures
const AuthErrorDisplay: React.FC<{ error: string; onRetry?: () => void }> = ({ 
  error, 
  onRetry 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      <div className="text-red-600 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// Protected Route Component - Requires authentication
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/auth/login',
  fallback,
  requireOnboarding = false,
  onboardingRedirectTo = '/onboarding',
}) => {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show error if authentication failed
  if (error) {
    return <AuthErrorDisplay error={error} />;
  }

  // Show loading while checking authentication
  if (loading) {
    return fallback || <AuthLoadingSpinner message="Verifying access..." />;
  }

  // Show loading if redirecting (user not authenticated)
  if (!user) {
    return fallback || <AuthLoadingSpinner message="Redirecting to login..." />;
  }

  // Note: Onboarding redirects are handled automatically by the AuthProvider
  // in the checkAndRedirectUser function, so we don't need to duplicate that logic here

  return <>{children}</>;
};

// Guest Route Component - Requires NO authentication (redirects if authenticated)
export const GuestRoute: React.FC<GuestRouteProps> = ({
  children,
  redirectTo = '/dashboard',
  fallback,
}) => {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show error if authentication failed
  if (error) {
    return <AuthErrorDisplay error={error} />;
  }

  // Show loading while checking authentication
  if (loading) {
    return fallback || <AuthLoadingSpinner message="Checking authentication..." />;
  }

  // Show loading if redirecting (user is authenticated)
  if (user) {
    return fallback || <AuthLoadingSpinner message="Redirecting..." />;
  }

  return <>{children}</>;
};

// Conditional Render Component - Render based on auth state
export const AuthConditionalRender: React.FC<ConditionalRenderProps> = ({
  when,
  children,
  fallback = null,
}) => {
  const { user, loading } = useAuth();
  const { completed: onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();

  // Show loading fallback while checking auth state
  if (loading || (when.includes('onboard') && onboardingLoading)) {
    return <>{fallback}</>;
  }

  const shouldRender = (() => {
    switch (when) {
      case 'authenticated':
        return !!user;
      case 'unauthenticated':
        return !user;
      case 'loading':
        return loading;
      case 'onboarded':
        return !!user && onboardingCompleted === true;
      case 'not-onboarded':
        return !!user && onboardingCompleted === false;
      default:
        return false;
    }
  })();

  return shouldRender ? <>{children}</> : <>{fallback}</>;
};

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    redirectTo?: string;
    requireOnboarding?: boolean;
    onboardingRedirectTo?: string;
  } = {}
) {
  const displayName = Component.displayName || Component.name || 'Component';

  const WrappedComponent = (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );

  WrappedComponent.displayName = `withAuth(${displayName})`;
  return WrappedComponent;
}

// Higher-order component for guest-only routes
export function withGuest<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    redirectTo?: string;
  } = {}
) {
  const displayName = Component.displayName || Component.name || 'Component';

  const WrappedComponent = (props: P) => (
    <GuestRoute {...options}>
      <Component {...props} />
    </GuestRoute>
  );

  WrappedComponent.displayName = `withGuest(${displayName})`;
  return WrappedComponent;
}

// Auth Status Indicator Component
export const AuthStatusIndicator: React.FC<{
  showText?: boolean;
  className?: string;
}> = ({ showText = true, className = '' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
        {showText && <span className="text-sm text-yellow-600">Checking authentication...</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${
        user ? 'bg-green-400' : 'bg-red-400'
      }`}></div>
      {showText && (
        <span className={`text-sm ${
          user ? 'text-green-600' : 'text-red-600'
        }`}>
          {user ? 'Authenticated' : 'Not authenticated'}
        </span>
      )}
    </div>
  );
};

// Onboarding Status Component
export const OnboardingStatusIndicator: React.FC<{
  showText?: boolean;
  className?: string;
}> = ({ showText = true, className = '' }) => {
  const { completed, loading, needsOnboarding } = useOnboardingStatus();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
        {showText && <span className="text-sm text-yellow-600">Checking onboarding...</span>}
      </div>
    );
  }

  if (completed === null) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${
        completed ? 'bg-green-400' : 'bg-orange-400'
      }`}></div>
      {showText && (
        <span className={`text-sm ${
          completed ? 'text-green-600' : 'text-orange-600'
        }`}>
          {completed ? 'Onboarding complete' : 'Onboarding required'}
        </span>
      )}
    </div>
  );
}; 