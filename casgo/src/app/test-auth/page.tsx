'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';

export default function AuthTestPage() {
  const { user, loading, error } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Authentication Test Page (Simplified)
          </h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Auth Status</h2>
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
              <p>User: {user ? user.email : 'Not logged in'}</p>
              <p>Error: {error || 'None'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 