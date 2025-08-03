'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { useRouter } from 'next/navigation';

// SignupForm Props
interface SignupFormProps {
  onSuccess?: () => void;
  onSignInClick?: () => void;
  showTitle?: boolean;
  showSocialButtons?: boolean;
  className?: string;
}

// Form validation function
const validateForm = (formData: {
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  fullName: string;
}) => {
  const errors: Record<string, string> = {};
  
  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email address is invalid';
  }
  
  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Business name validation
  if (!formData.businessName) {
    errors.businessName = 'Business name is required';
  }
  
  // Full name validation
  if (!formData.fullName) {
    errors.fullName = 'Full name is required';
  }
  
  return errors;
};

// Reusable Signup Form Component
export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onSignInClick,
  showTitle = true,
  showSocialButtons = true,
  className = '',
}) => {
  const router = useRouter();
  const { 
    signUp, 
    signInWithGoogle, 
    loading, 
    error: authError,
  } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    fullName: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const clearError = () => {
    // Clear form errors since we can't directly clear auth errors
    setFormErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setFormErrors({});
    setShowSuccess(false);

    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    console.log('📝 Submitting signup form with data:', {
      email: formData.email,
      businessName: formData.businessName,
      fullName: formData.fullName
    });

    try {
      // Sign up with properly mapped user data
      const { error } = await signUp(formData.email, formData.password, {
        business_name: formData.businessName,
        full_name: formData.fullName,
      });

      // Handle success
      if (!error) {
        console.log('✅ Signup form submission successful');
        setShowSuccess(true);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/auth/verify-email');
          }
        }, 2000);
      } else {
        console.error('❌ Signup form error:', error);
      }
    } catch (error) {
      console.error('❌ Signup form exception:', error);
    }
  };

  const handleGoogleSignUp = async () => {
    clearError();
    const { error } = await signInWithGoogle();
    
    // Note: successful Google sign-up will redirect, so no onSuccess call needed here
  };

  return (
    <div className={`w-full ${className}`}>
      {showTitle && (
        <div className="text-left mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Create account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
                          Start your sustainability journey with EcoMind.
          </p>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Account created! Please check your email to verify your account.
          </div>
        </div>
      )}

      {/* Authentication Error Display */}
      {authError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {authError}
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name Input */}
        <div>
          <Input
            id="fullName"
            type="text"
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            disabled={!!loading || showSuccess}
            error={formErrors.fullName}
            placeholder="John Doe"
            autoComplete="name"
            required
          />
        </div>

        {/* Business Name Input */}
        <div>
          <Input
            id="businessName"
            type="text"
            label="Business Name"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            disabled={!!loading || showSuccess}
            error={formErrors.businessName}
            placeholder="Your Company Inc."
            autoComplete="organization"
            required
          />
        </div>

        {/* Email Input */}
        <div>
          <Input
            id="email"
            type="email"
            label="Email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!!loading || showSuccess}
            error={formErrors.email}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </div>

        {/* Password Input */}
        <div>
          <Input
            id="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={!!loading || showSuccess}
            error={formErrors.password}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>

        {/* Confirm Password Input */}
        <div>
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            disabled={!!loading || showSuccess}
            error={formErrors.confirmPassword}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>

        {/* Terms and Privacy */}
        <div className="text-xs text-gray-600">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-green-600 hover:text-green-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-green-600 hover:text-green-500">
            Privacy Policy
          </a>
          .
        </div>

        {/* Submit Button */}
        <div>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading || showSuccess}
            className="w-full"
          >
            {loading ? 'Creating Account...' : showSuccess ? 'Account Created!' : 'Create Account'}
          </Button>
        </div>
      </form>

      {/* Social Signup Buttons */}
      {showSocialButtons && !showSuccess && (
        <>
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleGoogleSignUp}
              disabled={!!loading || showSuccess}
              className="w-full"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.3v2.84C4.02 20.44 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.3C1.42 8.51 1 10.2 1 12s.42 3.49 1.23 4.93l3.61-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 4.02 3.56 2.3 7.07l3.54 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </Button>
          </div>
        </>
      )}

      {/* Sign In Link */}
      {!showSuccess && (
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSignInClick ? onSignInClick() : router.push('/auth/login');
            }}
            className="font-medium text-green-600 hover:text-green-500"
          >
            Sign in
          </a>
        </p>
      )}
    </div>
  );
}; 