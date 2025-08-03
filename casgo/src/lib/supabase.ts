// This file is the single source of truth for Supabase client configuration.
// It is re-architected to use the new @supabase/ssr library for robustness.

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types/database';
import type { User, Session } from '@supabase/supabase-js';

// ============================================================================
// Type Exports (Maintained for compatibility)
// ============================================================================

export type AuthUser = User;
export type AuthSession = Session;

// ============================================================================
// Browser Client (Singleton Pattern)
// Used in client components (.tsx files with 'use client').
// ============================================================================

// We create a singleton instance to avoid creating a new client on every render.
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

function getBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing from .env.local');
  }

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  
  return browserClient;
}

export const supabase = getBrowserClient();

// ============================================================================
// Error Handling Utility (Maintained for compatibility)
// ============================================================================

export function handleSupabaseError(error: any): string {
  if (!error) return 'An unknown error occurred';
  
  // Handle auth errors
  if (error.message) {
    return error.message;
  }
  
  // Handle database errors
  if (error.details) {
    return error.details;
  }
  
  // Fallback
  return error.toString() || 'An unexpected error occurred';
}

// ============================================================================
// Auth Helpers (Updated for the new @supabase/ssr client)
// All functions are now simpler and delegate directly to the robust client.
// ============================================================================

export const auth = {
  client: supabase.auth,

  signInWithGoogle: () => {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';
    const redirectTo = `${frontendUrl}/auth/callback`;
    console.log(`Initiating Google OAuth with redirect to: ${redirectTo}`);
    
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
  },

  signIn: (email: string, password: string) => 
    supabase.auth.signInWithPassword({ email, password }),
  
  signUp: (email: string, password: string, userData?: Record<string, any>) => 
    supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    }),

  signOut: () => supabase.auth.signOut(),

  getUser: () => supabase.auth.getUser(),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
    supabase.auth.onAuthStateChange(callback),

  resetPassword: (email: string) => {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';
    const redirectTo = `${frontendUrl}/auth/reset-password`;
    console.log(`📧 Sending password reset email with redirect to: ${redirectTo}`);
    
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
  },
};

// ============================================================================
// Auth Utilities (Maintained for compatibility)
// ============================================================================

export const authUtils = {
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  getUserProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  hasCompletedOnboarding: async (): Promise<boolean> => {
    try {
      const profile = await authUtils.getUserProfile();
      return profile?.onboarding_completed || false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },
};

// ============================================================================
// Database Helpers (Unchanged, they will use the new reliable client)
// ============================================================================

export const db = {
  users: supabase.from('users'),
  energyData: supabase.from('energy_data'),
  goals: supabase.from('sustainability_goals'),
  recommendations: supabase.from('recommendations'),
  goalProgress: supabase.from('goal_progress'),
}; 