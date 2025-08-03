'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
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

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [email, setEmail] = useState('');

  const handleResendEmail = async () => {
    if (!email) {
      setResendStatus('error');
      return;
    }

    setIsResending(true);
    setResendStatus('idle');

    try {
      console.log('📧 Resending verification email to:', email);
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${frontendUrl}/auth/callback?next=/onboarding`
        }
      });

      if (error) {
        console.error('❌ Resend error:', error);
        setResendStatus('error');
      } else {
        console.log('✅ Verification email resent successfully');
        setResendStatus('success');
      }
    } catch (error) {
      console.error('❌ Resend exception:', error);
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <CasgoLogo className="h-12 w-auto" />
          </div>
          
          {/* Email Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to your email address.
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
                    <p><strong>Click the verification link</strong> in the email</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-green-600 text-xs font-semibold">3</span>
                  </div>
                  <div>
                    <p><strong>Start your sustainability journey</strong> with Casgo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resend Email Section */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                Didn't receive the email? Check your spam folder or resend it below:
              </p>
              
              {/* Email input for resend */}
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Status Messages */}
              {resendStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                  ✅ Verification email sent successfully! Check your inbox.
                </div>
              )}
              
              {resendStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                  ❌ Failed to send email. Please check your email address and try again.
                </div>
              )}

              <Button 
                variant="outline" 
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="w-full"
              >
                {isResending ? 'Sending...' : 'Resend verification email'}
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