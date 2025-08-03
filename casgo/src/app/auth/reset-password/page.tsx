'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';

// SVG Logo Component for Casgo
const CasgoLogo = ({ className }: { className?: string }) => (
  <svg 
    className={className}
    viewBox="0 0 200 50" 
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Casgo Logo"
  >
    <path 
      d="M 25,45 a 20,20 0 1,1 0,-40 a 20,20 0 0,1 0,40"
      stroke="#4ade80"
      strokeWidth="8"
      fill="none"
    />
    <path 
      d="M 25,35 a 10,10 0 1,1 0,-20 a 10,10 0 0,1 0,20"
      stroke="#16a34a"
      strokeWidth="6"
      fill="none"
    />
    <text 
      x="60" 
      y="35" 
      fontFamily="sans-serif"
      fontSize="30" 
      fill="#1f2937"
      fontWeight="bold"
    >
      casgo
    </text>
  </svg>
);

// Component that handles search params - needs to be wrapped in Suspense
function PasswordResetHandler({ 
  setMode, 
  setError,
  setDebugInfo,
  setIsProcessingCode
}: { 
  setMode: (mode: 'request' | 'update') => void;
  setError: (error: string | null) => void;
  setDebugInfo: (info: string) => void;
  setIsProcessingCode: (processing: boolean) => void;
}) {
  const searchParams = useSearchParams();

  // Check if this is a password reset callback from email
  useEffect(() => {
    const checkPasswordReset = async (retryCount = 0) => {
      // Check for auth code from password reset email
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      // Debug logging
      console.log('Password reset page - checking for reset tokens:', {
        code: code ? 'present' : 'missing',
        codeValue: code,
        error,
        errorDescription,
        retryCount,
        allQueryParams: Object.fromEntries(searchParams.entries())
      });
      
      setDebugInfo(`Checking params: code=${code ? 'present' : 'missing'}, error=${error || 'none'}, retry=${retryCount}`);
      
      // Check for errors first
      if (error) {
        console.error('Password reset error from URL:', { error, errorDescription });
        setDebugInfo(`Error detected: ${error} - ${errorDescription}`);
        if (error === 'access_denied' && errorDescription?.includes('expired')) {
          setError('Password reset link has expired. Please request a new password reset.');
        } else {
          setError('Password reset link is invalid. Please request a new password reset.');
        }
        return;
      }
      
      // Check for malformed code (like {recovery_code})
      if (code && (code.includes('{') || code.includes('recovery_code'))) {
        console.error('Malformed recovery code detected:', code);
        setDebugInfo(`Malformed code: ${code}`);
        setError('Invalid password reset link format. Please request a new password reset.');
        return;
      }
      
      if (code) {
        console.log('🔐 Password reset code detected - checking for auto-created session');
        setDebugInfo(`Checking for auto-created session... (attempt ${retryCount + 1})`);
        setIsProcessingCode(true);
        setError(null);
        
        try {
          // For password reset, Supabase auto-creates session when user visits link
          // We just need to check if session exists, no manual exchange needed
          console.log('Checking current session state...');
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          console.log('Current session check:', {
            hasSession: !!session,
            hasUser: !!session?.user,
            userEmail: session?.user?.email,
            retryCount,
            error: sessionError ? sessionError.message : 'none'
          });
          
          if (sessionError) {
            console.error('❌ Session check error:', sessionError);
            setDebugInfo(`Session check error: ${sessionError.message}`);
            setError(`Session error: ${sessionError.message}`);
            setIsProcessingCode(false);
            return;
          }
          
          if (session?.user) {
            console.log('✅ Active session found - switching to update mode');
            setDebugInfo('Active session found! Switching to update mode...');
            setMode('update');
            
            // Give a moment for state to update before cleaning URL
            setTimeout(() => {
              // Clean up the URL to remove the code from address bar
              const cleanUrl = new URL(window.location.href);
              cleanUrl.search = '';
              window.history.replaceState({}, '', cleanUrl.toString());
              setIsProcessingCode(false);
              setDebugInfo('Ready for password update');
            }, 100);
          } else {
            // If no session found, retry up to 3 times with increasing delays
            if (retryCount < 3) {
              console.log(`⏳ No session found, retrying in ${(retryCount + 1) * 500}ms... (attempt ${retryCount + 1}/3)`);
              setDebugInfo(`No session yet, retrying in ${(retryCount + 1) * 500}ms... (${retryCount + 1}/3)`);
              setTimeout(() => checkPasswordReset(retryCount + 1), (retryCount + 1) * 500);
              return;
            } else {
              console.warn('⚠️ No session found after 3 attempts - link may be expired');
              setDebugInfo('No active session after retries - link may be expired');
              setError('No active session found. Please click the reset link in your email again.');
              setIsProcessingCode(false);
            }
          }
        } catch (err) {
          console.error('❌ Exception during session check:', err);
          setDebugInfo(`Exception: ${err}`);
          setError('Failed to check session. Please try the reset link again.');
          setIsProcessingCode(false);
        }
      } else {
        setDebugInfo('No code provided - showing request form');
      }
    };
    
    // Add a small delay to allow Supabase to process the token
    const timer = setTimeout(() => checkPasswordReset(0), 100);
    return () => clearTimeout(timer);
  }, [searchParams, setMode, setError, setDebugInfo, setIsProcessingCode]);

  return null; // This component doesn't render anything
}

export default function ResetPasswordPage() {
  const router = useRouter();
  
  // Email form state
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  // New password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  
  // General state
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'request' | 'update'>('request');
  const [isProcessingCode, setIsProcessingCode] = useState(false);

  // Add debug state to track what's happening
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Email address is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    console.log('📧 Sending password reset email to:', email);
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${frontendUrl}/auth/reset-password`,
    });

    if (resetError) {
      console.error('❌ Password reset error:', resetError);
      setError(resetError.message);
    } else {
      console.log('✅ Password reset email sent successfully');
      setIsEmailSent(true);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!newPassword) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // Check if user has valid session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('❌ No active session for password update');
        setError('Session expired. Please request a new password reset.');
        setIsUpdatingPassword(false);
        return;
      }

      console.log('🔄 Updating password for authenticated user');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Password update failed:', error);
        setError(error.message);
        setIsUpdatingPassword(false);
      } else {
        console.log('✅ Password updated successfully');
        setPasswordUpdateSuccess(true);
        
        // Check if user has completed onboarding
        const checkOnboardingStatus = async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              console.log('👤 Checking onboarding status for user:', user.id);
              const { data: userProfile, error: profileError } = await supabase
                .from('users')
                .select('onboarding_completed, business_name, industry')
                .eq('id', user.id)
                .single();

              if (profileError) {
                console.warn('⚠️ Could not fetch user profile:', profileError);
                // Fallback to onboarding if profile lookup fails
                setTimeout(() => router.push('/onboarding'), 3000);
                return;
              }

              // Redirect based on onboarding status after 3 seconds
              setTimeout(() => {
                if (userProfile?.onboarding_completed) {
                  console.log('🎯 Redirecting to dashboard');
                  router.push('/dashboard');
                } else {
                  console.log('🎯 Redirecting to onboarding');
                  router.push('/onboarding');
                }
              }, 3000);
            } else {
              // Fallback to login if no user
              console.warn('⚠️ No user found after password update');
              setTimeout(() => router.push('/auth/login'), 3000);
            }
          } catch (error) {
            console.error('❌ Error checking onboarding status:', error);
            // Fallback to onboarding if there's an error
            setTimeout(() => router.push('/onboarding'), 3000);
          }
        };

        checkOnboardingStatus();
      }
    } catch (err: any) {
      console.error('❌ Exception during password update:', err);
      setError('Failed to update password. Please try again.');
      setIsUpdatingPassword(false);
    }
  };

  // Success screen after password update
  if (passwordUpdateSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <CasgoLogo className="h-12 w-auto" />
            </div>
            
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900">
              Password updated successfully!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your password has been changed. You can now continue using Casgo.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Checking your account status...
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <div className="text-center">
              <Button 
                onClick={async () => {
                  // Check onboarding status before redirecting
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                      const { data: userProfile } = await supabase
                        .from('users')
                        .select('onboarding_completed')
                        .eq('id', user.id)
                        .single();

                      if (userProfile?.onboarding_completed) {
                        router.push('/dashboard');
                      } else {
                        router.push('/onboarding');
                      }
                    }
                  } catch (error) {
                    console.error('Error checking status:', error);
                    router.push('/onboarding');
                  }
                }}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <CasgoLogo className="h-12 w-auto" />
            </div>
            
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  What's next?
                </h3>
                <div className="text-left space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-green-600 text-xs font-semibold">1</span>
                    </div>
                    <div>
                      <p><strong>Check your inbox</strong> for an email from Casgo</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-green-600 text-xs font-semibold">2</span>
                    </div>
                    <div>
                      <p><strong>Click the reset link</strong> in the email</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-green-600 text-xs font-semibold">3</span>
                    </div>
                    <div>
                      <p><strong>Create a new password</strong> and sign in</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">
                  Didn't receive the email? Check your spam folder or
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEmailSent(false)}
                  className="w-full"
                >
                  Try a different email address
                </Button>
              </div>

              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Handle search params with Suspense boundary */}
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      }>
        <PasswordResetHandler 
          setMode={setMode} 
          setError={setError}
          setDebugInfo={setDebugInfo}
          setIsProcessingCode={setIsProcessingCode}
        />
      </Suspense>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <CasgoLogo className="h-12 w-auto" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === 'update' ? 'Set new password' : 'Reset your password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'update' 
              ? 'Enter your new password below. Make sure it\'s at least 6 characters long.'
              : 'Enter your email address and we\'ll send you a link to reset your password.'
            }
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs">
              <strong>Debug:</strong> {debugInfo}
              <br />
              <strong>Mode:</strong> {mode}
              <br />
              <strong>Processing:</strong> {isProcessingCode ? 'Yes' : 'No'}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Show loading state while processing code */}
          {isProcessingCode ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Setting up password reset...</p>
              <p className="text-slate-400 text-sm mt-2">{debugInfo}</p>
            </div>
          ) : mode === 'update' ? (
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div>
                <Input
                  id="newPassword"
                  type="password"
                  label="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isUpdatingPassword}
                  className="w-full"
                >
                  {isUpdatingPassword ? 'Updating password...' : 'Update password'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  id="email"
                  type="email"
                  label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={false} // Removed loading state as it's not managed by useAuthActions
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={false} // Removed loading state as it's not managed by useAuthActions
                  className="w-full"
                >
                  {/* Removed loading text as it's not managed by useAuthActions */}
                  Send reset link
                </Button>
              </div>
            </form>
          )}

          {mode === 'request' && (
            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/auth/login')}
                className="text-sm"
              >
                ← Back to Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
} 