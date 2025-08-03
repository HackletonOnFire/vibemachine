'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase'; // Assuming 'auth' is not a separate export
import type { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

// Cleaned and simplified auth context type
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Centralized error logging
  const logError = (context: string, error: any) => {
    // In a real app, you'd use a logging service like Sentry or LogRocket
    console.error(`[AuthContext:${context}]`, error);
    setError(error.message || 'An unexpected error occurred.');
  };

  const checkAndRedirectUser = useCallback(async (currentUser: User) => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', currentUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const hasCompletedOnboarding = profile?.onboarding_completed || false;
      const isAuthPage = pathname.startsWith('/auth') || pathname === '/onboarding' || pathname === '/';

      if (hasCompletedOnboarding && isAuthPage) {
        router.replace('/dashboard');
      } else if (!hasCompletedOnboarding && pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
    } catch (err) {
      logError('checkAndRedirectUser', err);
    } finally {
      setLoading(false);
    }
  }, [router, pathname]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        logError('getSession', sessionError);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        // We only redirect on initial load if user is on a page they shouldn't be
        if (pathname.startsWith('/auth') || pathname === '/onboarding' || pathname === '/') {
          await checkAndRedirectUser(session.user);
        }
      } else {
        // If no session and user is on a protected page, redirect to login
        if (!pathname.startsWith('/auth') && pathname !== '/') {
          router.replace('/auth/login');
        }
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.user) {
        checkAndRedirectUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        router.replace('/auth/login');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [checkAndRedirectUser, pathname]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) logError('signInWithGoogle', error);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      logError('signIn', signInError);
    } else if (data.user) {
      setUser(data.user);
      await checkAndRedirectUser(data.user);
    }
    setLoading(false);
    return { data, error: signInError };
  }, [checkAndRedirectUser]);

  const signUp = useCallback(async (email: string, password: string, userData: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    
    // Get the frontend URL for email redirect
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                       (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
    
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          business_name: userData.business_name,
        },
        emailRedirectTo: `${frontendUrl}/auth/callback?next=/onboarding`
      },
    });

    if (signUpError) {
      logError('signUp', signUpError);
    } else if (data.user) {
      // The onAuthStateChange handler will typically catch the new user
      // and redirect them to onboarding. No need to duplicate logic here.
      setUser(data.user);
    }
    
    setLoading(false);
    return { data, error: signUpError };
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      logError('signOut', error);
    } else {
      setUser(null);
      router.push('/auth/login');
    }
    setLoading(false);
  }, [router]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 