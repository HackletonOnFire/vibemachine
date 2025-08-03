// Authentication System Exports
// Clean, simple authentication functionality

// Core Auth Context and Provider
export { AuthProvider, useAuth, type AuthContextType } from './context';

// Client-side authentication hooks
export { useRequireGuest } from './hooks';

// Re-export common types from supabase for convenience
export type { User as AuthUser, Session as AuthSession } from '@supabase/supabase-js';

// Re-export utilities from supabase lib
export { authUtils, handleSupabaseError } from '../supabase'; 