'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering for this dashboard page
export const dynamic = 'force-dynamic';
import { Layout } from '../../../../components/Layout';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Spinner } from '../../../../components/ui/LoadingSpinner';
import { userOperations } from '../../../lib/database';
import type { IndustryType } from '../../../lib/types/database';
import { useAuth } from '../../../lib/auth';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  business_name?: string;
  industry?: IndustryType;
  location?: string;
  phone?: string;
  website?: string;
}

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { user, loading: userLoading, signOut } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();

  const handleSignOut = async () => {
    const confirmed = confirm('Are you sure you want to sign out?');
    if (confirmed) {
      try {
        await signOut();
        router.push('/auth/login');
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const result = await userOperations.getProfile(user.id);
        
        if (result.success && result.data) {
          setUserProfile(result.data);
        } else {
          setError(result.error || 'Failed to fetch user profile');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!userProfile) return;

    try {
      setSaving(true);
      if (!user?.id) return;
      const result = await userOperations.updateProfile(user.id, userProfile);
      
      if (result.success) {
        // Show success message or toast
        console.log('Profile updated successfully');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred while saving');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (!userProfile) return;
    setUserProfile({ ...userProfile, [field]: value });
  };

  if (userLoading || loading) {
    return (
      <Layout currentPage="/dashboard/settings" userId={user?.id}>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentPage="/dashboard/settings" userId={user?.id}>
        <div className="text-center text-red-600 p-8">
          <p>Error loading settings: {error}</p>
        </div>
      </Layout>
    );
  }

  const settingsTabs = [
    { id: 'profile', label: 'Profile', active: activeTab === 'profile' },
    { id: 'organization', label: 'Organization', active: activeTab === 'organization' },
    { id: 'integrations', label: 'Integrations', active: activeTab === 'integrations' },
    { id: 'notifications', label: 'Notifications', active: activeTab === 'notifications' },
    { id: 'billing', label: 'Billing', active: activeTab === 'billing' },
    { id: 'security', label: 'Security', active: activeTab === 'security' }
  ];

  return (
    <Layout currentPage="/dashboard/settings" userId={user?.id}>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account, organization settings, and integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {settingsTabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'profile' && userProfile && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                  <p className="text-sm text-gray-600">Update your personal information and preferences.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <Input 
                        value={userProfile.first_name || ''} 
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <Input 
                        value={userProfile.last_name || ''} 
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input 
                      value={userProfile.email || ''} 
                      type="email" 
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <Input 
                      value={userProfile.phone || ''} 
                      type="tel" 
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <Input 
                      value={userProfile.website || ''} 
                      type="url" 
                      onChange={(e) => handleInputChange('website', e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'organization' && userProfile && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Organization Settings</h3>
                  <p className="text-sm text-gray-600">Configure your organization's sustainability settings.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <Input 
                      value={userProfile.business_name || ''} 
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                      <select 
                        value={userProfile.industry || ''} 
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select Industry</option>
                        <option value="technology">Technology</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="retail">Retail</option>
                        <option value="education">Education</option>
                        <option value="energy">Energy</option>
                        <option value="agriculture">Agriculture</option>
                        <option value="transportation">Transportation</option>
                        <option value="construction">Construction</option>
                        <option value="hospitality">Hospitality</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <Input 
                        value={userProfile.location || ''} 
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Saving...' : 'Update Organization'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Other tabs remain as static content for now */}
            {activeTab === 'integrations' && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
                  <p className="text-sm text-gray-600">Connect with external services and data sources.</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Utility Company API', description: 'Automatic energy usage data import', status: 'connected', icon: '⚡' },
                      { name: 'Azure OpenAI', description: 'AI-powered sustainability recommendations', status: 'disconnected', icon: '🤖' },
                      { name: 'Google Analytics', description: 'Website carbon footprint tracking', status: 'connected', icon: '📊' },
                      { name: 'Supabase Database', description: 'Data storage and management', status: 'connected', icon: '🗄️' },
                      { name: 'Slack Notifications', description: 'Real-time alerts and updates', status: 'disconnected', icon: '💬' }
                    ].map((integration, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{integration.icon}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{integration.name}</h4>
                            <p className="text-sm text-gray-600">{integration.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            integration.status === 'connected' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {integration.status}
                          </span>
                          <Button 
                            variant={integration.status === 'connected' ? 'ghost' : 'primary'}
                            size="sm"
                          >
                            {integration.status === 'connected' ? 'Configure' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                    <p className="text-sm text-gray-600">Manage your account security settings and sessions.</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Change Password Section */}
                    <div className="border-b border-gray-200 pb-6">
                      <h4 className="text-base font-medium text-gray-900 mb-4">Password</h4>
                      <div className="space-y-4">
                        <Input
                          label="Current Password"
                          type="password"
                          placeholder="Enter current password"
                        />
                        <Input
                          label="New Password"
                          type="password"
                          placeholder="Enter new password"
                        />
                        <Input
                          label="Confirm New Password"
                          type="password"
                          placeholder="Confirm new password"
                        />
                        <Button variant="primary" size="sm">
                          Update Password
                        </Button>
                      </div>
                    </div>

                    {/* Session Management */}
                    <div className="border-b border-gray-200 pb-6">
                      <h4 className="text-base font-medium text-gray-900 mb-4">Active Sessions</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Current Session</p>
                            <p className="text-xs text-gray-500">
                              Started {new Date().toLocaleDateString()} - This device
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sign Out Section */}
                    <div>
                      <h4 className="text-base font-medium text-gray-900 mb-4">Sign Out</h4>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <h5 className="text-sm font-medium text-red-800">
                              Sign out of your account
                            </h5>
                            <p className="text-sm text-red-700 mt-1">
                              This will end your current session and require you to sign in again.
                            </p>
                            <div className="mt-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleSignOut}
                                disabled={false} // Removed authLoading as per new_code
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                Sign Out
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {!['profile', 'organization', 'integrations', 'security'].includes(activeTab) && (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <p className="text-lg mb-2">{settingsTabs.find(t => t.id === activeTab)?.label} Settings</p>
                  <p className="text-sm">This section is coming soon.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 