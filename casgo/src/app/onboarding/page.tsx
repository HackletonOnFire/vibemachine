'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingWizard, type OnboardingData } from '../../components/onboarding';
import { useAuth } from '../../lib/auth';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, error } = useAuth();

  // Handle redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirectTo=/onboarding');
    }
  }, [user, loading, router]);

  const handleComplete = (data: OnboardingData) => {
    console.log('Onboarding completed with data:', data);
  };

  const handleSuccess = () => {
    console.log('🎯 handleSuccess called - onboarding saved successfully to database');
    console.log('🔀 Attempting redirect to dashboard...');
    
    try {
      // Redirect to dashboard after successful completion
      router.push('/dashboard');
      console.log('✅ router.push("/dashboard") called successfully');
    } catch (error) {
      console.error('❌ Error during redirect:', error);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle authentication errors gracefully
  if (error) {
    console.warn('Authentication error (non-critical):', error);
  }

  // Show redirecting message while not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please log in to continue</p>
          <p className="text-slate-500 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <OnboardingWizard 
        onComplete={handleComplete} 
        onSuccess={handleSuccess}
      />
    </div>
  );
} 