import { useState, useEffect, useCallback } from 'react';
import { userOperations } from '../lib/database';
import { User as DatabaseUser } from '../lib/types/database';

interface UserProfile extends Pick<DatabaseUser, 'id' | 'email' | 'business_name' | 'industry' | 'company_size' | 'location' | 'onboarding_completed' | 'first_name' | 'last_name' | 'role'> {
  isPremium: boolean;
  subscriptionTier: 'free' | 'premium' | 'professional' | 'enterprise';
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
}

/**
 * Custom hook for managing user profile and premium status
 */
export const useUserProfile = (userId: string | null): UseUserProfileResult => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const determineSubscriptionTier = (role: string | null): 'free' | 'premium' | 'professional' | 'enterprise' => {
    if (role === 'premium') return 'premium';
    if (role === 'professional') return 'professional';
    if (role === 'enterprise') return 'enterprise';
    return 'free';
  };

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await userOperations.getProfile(userId);
      
      if (result.success && result.data) {
        const user = result.data;
        const subscriptionTier = determineSubscriptionTier(user.role);
        const isPremium = subscriptionTier !== 'free';

        setProfile({
          id: user.id,
          email: user.email,
          business_name: user.business_name,
          industry: user.industry,
          company_size: user.company_size,
          location: user.location,
          onboarding_completed: user.onboarding_completed,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          isPremium,
          subscriptionTier
        });
      } else {
        setProfile(null);
        if (result.error) {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const upgradeToPremium = useCallback(async () => {
    if (!userId || !profile) return;

    try {
      setLoading(true);
      setError(null);

      // Update user role to premium
      const result = await userOperations.updateProfile(userId, {
        role: 'premium',
        updated_at: new Date().toISOString()
      });

      if (result.success) {
        // Refresh profile to get updated data
        await fetchProfile();
      } else {
        setError(result.error || 'Failed to upgrade to premium');
      }
    } catch (err) {
      console.error('Error upgrading to premium:', err);
      setError('Failed to upgrade to premium');
    } finally {
      setLoading(false);
    }
  }, [userId, profile, fetchProfile]);

  const refresh = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refresh,
    upgradeToPremium
  };
};

export default useUserProfile; 