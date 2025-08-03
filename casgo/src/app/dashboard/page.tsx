'use client';

import { Dashboard } from '../../components/dashboard';
import { useAuth } from '../../lib/auth';
import { Spinner } from '../../components/ui';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (this shouldn't happen due to route protection)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Pass the authenticated user's ID to fetch live data from Supabase
  return <Dashboard userId={user.id} />;
} 