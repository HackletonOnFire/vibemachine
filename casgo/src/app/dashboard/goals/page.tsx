'use client';

import React from 'react';
import { Layout } from '../../../../components';
import { useAuth } from '../../../lib/auth';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { Card, Button } from '../../../components/ui';
import { Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { ProgressChart, CarbonFootprint } from '../../../components/dashboard';
import { Spinner } from '../../../../components/ui/LoadingSpinner';

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;
  const { data, loading, error } = useDashboardData(user?.id);
  
  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <Layout currentPage="/dashboard/goals" userId={user.id}>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentPage="/dashboard/goals" userId={user.id}>
        <div className="text-center text-red-600 p-8">
          <p>Error loading goals data: {error}</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout currentPage="/dashboard/goals" userId={user.id}>
      <div className="space-y-8">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Goals & Progress</h1>
          <p className="text-gray-600 mt-1">
            Track your sustainability goals, milestones, and overall progress toward your targets.
          </p>
        </div>
        
        {/* Progress Tracking Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sustainability Goal Progress</h2>
          <ProgressChart data={data?.goals} loading={loading} />
        </section>

        {/* Carbon Footprint Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Carbon Footprint Tracking</h2>
          <CarbonFootprint data={data?.carbonFootprint} loading={loading} />
        </section>
      </div>
    </Layout>
  );
} 