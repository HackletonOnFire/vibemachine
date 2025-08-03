'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { useRouter } from 'next/navigation';

// LoginForm Props
interface LoginFormProps {
  onSuccess?: () => void;
  onSignUpClick?: () => void;
  onForgotPasswordClick?: () => void;
  showTitle?: boolean;
  showSocialButtons?: boolean;
  className?: string;
}

// Validation function
const validateForm = (email: string, password: string) => {
  const errors: { email?: string; password?: string } = {};
  
  // Email validation
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email address is invalid';
  }
  
  // Password validation
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  return errors;
};

// Main LoginForm component
export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSignUpClick,
  onForgotPasswordClick,
  showTitle = true,
  showSocialButtons = true,
  className = '',
}) => {
  const router = useRouter();
  
  const { 
    signIn, 
    signInWithGoogle, 
    loading, 
    error: authError,
  } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const clearError = () => {
    // Since we can't directly clear the auth error, we'll clear form errors
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    // Validate form
    const validationErrors = validateForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    // Sign in
    const result = await signIn(email, password);

    // Handle success
    if (!result.error && onSuccess) {
      onSuccess();
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    console.log('🔄 Initiating Google sign-in...');
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      console.error('❌ Google sign-in error:', error);
    } else {
      console.log('✅ Google sign-in initiated successfully, redirecting...');
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {showTitle && (
        <div className="text-left mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-gray-600">
                          Welcome back to EcoMind.
          </p>
        </div>
      )}

      {/* Authentication Error Display */}
      {authError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {authError}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <Input
            id="email"
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!loading}
            error={formErrors.email}
            placeholder="you@company.com"
            autoComplete="email"
            required
            className="modern-input"
          />
        </div>

        {/* Password Input */}
        <div>
          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!!loading}
            error={formErrors.password}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="modern-input"
          />
        </div>

        {/* Forgot Password Link */}
        <div className="flex items-center justify-end">
          <div className="text-sm">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onForgotPasswordClick ? onForgotPasswordClick() : router.push('/auth/reset-password');
              }} 
              className="font-medium text-green-600 hover:text-green-500"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
      </form>

      {/* Social Login Buttons */}
      {showSocialButtons && (
        <>
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign in with</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.3v2.84C4.02 20.44 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.3C1.42 8.51 1 10.2 1 12s.42 3.49 1.23 4.93l3.61-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 4.02 3.56 2.3 7.07l3.54 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>
                {loading ? 'Redirecting to Google...' : 'Continue with Google'}
              </span>
            </Button>
          </div>
        </>
      )}

      {/* Sign Up Link */}
      <p className="mt-8 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSignUpClick ? onSignUpClick() : router.push('/auth/signup');
          }}
          className="font-medium text-green-600 hover:text-green-500"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}; 