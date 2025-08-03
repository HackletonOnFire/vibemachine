'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components/ui';

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

// SVG for the side panel graphic
const SidePanelGraphic = () => (
    <div className="absolute inset-0 h-full w-full">
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full"
        >
            <defs>
                <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" style={{stopColor: '#15803d', stopOpacity: 0.3}} />
                    <stop offset="100%" style={{stopColor: '#14532d', stopOpacity: 0.6}} />
                </radialGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 0.1}} />
                    <stop offset="100%" style={{stopColor: '#ffffff', stopOpacity: 0}} />
                </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#grad1)" />
            <path d="M0,0 L50,0 C20,50 80,50 50,100 L0,100 Z" fill="#16a34a" opacity="0.4" />
            <path d="M100,0 L50,0 C80,50 20,50 50,100 L100,100 Z" fill="#16a34a" opacity="0.4" />
            <path d="M-10,30 C30,10 70,10 110,30 L110,0 L-10,0 Z" fill="url(#grad2)" />
            <path d="M-10,80 C30,60 70,60 110,80 L110,50 L-10,50 Z" fill="url(#grad2)" opacity="0.5" />
        </svg>
    </div>
);

export default function SignupPage() {
  const router = useRouter();
  
  // Redirect authenticated users away from this page
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Spinner size="lg" />
        </div>
    );
  }

  // Don't render signup form if user is authenticated
  if (user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        
        {/* Left Side: Graphic Panel */}
        <div className="hidden lg:flex w-1/2 bg-green-900 text-white relative items-center justify-center p-12">
          <SidePanelGraphic />
          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Join the Sustainability Revolution
            </h1>
            <p className="mt-4 text-lg text-green-200">
              Start your journey towards carbon neutrality and cost savings with AI-powered insights.
            </p>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
                <CasgoLogo className="h-12 w-auto" />
            </div>
            <SignupForm 
              showTitle={false}
              onSuccess={() => router.push('/auth/verify-email')}
              onSignInClick={() => router.push('/auth/login')}
            />
          </div>
        </div>

      </div>
    </div>
  );
} 