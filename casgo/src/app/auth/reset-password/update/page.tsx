'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Component to handle the redirect logic
function UpdateRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get all URL parameters for debugging
    const allParams = Object.fromEntries(searchParams.entries());
    console.log('🔍 Update page received params:', allParams);
    
    // Get the code from URL parameters
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    // Check for errors first
    if (error) {
      console.log('❌ Update page received error:', { error, errorDescription });
      // Pass errors to main page
      const errorParams = new URLSearchParams();
      if (error) errorParams.set('error', error);
      if (errorDescription) errorParams.set('error_description', errorDescription);
      router.replace(`/auth/reset-password?${errorParams.toString()}`);
      return;
    }
    
    if (code && code !== '{recovery_code}' && !code.includes('{')) {
      // Redirect to the main reset password page with the code
      console.log('🔄 Redirecting password reset with valid code to main page');
      router.replace(`/auth/reset-password?code=${encodeURIComponent(code)}`);
    } else {
      // No valid code found
      console.log('⚠️ No valid reset code found, redirecting to request page');
      console.log('Code received:', code);
      router.replace('/auth/reset-password');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600">Processing password reset...</p>
        <p className="text-slate-400 text-sm mt-2">Redirecting to password update form...</p>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function ResetPasswordUpdatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <UpdateRedirectHandler />
    </Suspense>
  );
} 