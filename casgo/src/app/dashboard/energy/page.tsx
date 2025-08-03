'use client';

import React from 'react';
import { Layout } from '../../../../components/Layout';
import { useAuth } from '../../../lib/auth';
import { EnergyOverview } from '../../../components/dashboard';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { Spinner } from '../../../../components/ui/LoadingSpinner';

export default function EnergyPage() {
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
      <Layout currentPage="/dashboard/energy" userId={user.id}>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentPage="/dashboard/energy" userId={user.id}>
        <div className="text-center text-red-600 p-8">
          <p>Error loading energy data: {error}</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout currentPage="/dashboard/energy" userId={user.id}>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Energy Usage Analytics</h1>
          <p className="text-gray-600 mt-1">
            Monitor and analyze your energy consumption patterns, costs, and efficiency improvements.
          </p>
        </div>
        
        <EnergyOverview data={data?.energyData} loading={loading} />
      </div>
    </Layout>
  );
} 