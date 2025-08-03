'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Button, Spinner } from '../../../../components/ui';
import { Layout } from '../../../../components/Layout';
import { useAuth } from '../../../lib/auth';
import { recommendationOperations } from '../../../lib/database';
import { RecommendationsList } from '../../../components/recommendations/RecommendationsList';
import { useRecommendationCount } from '../../../hooks/useRecommendationCount';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { Recommendation as DatabaseRecommendation } from '../../../lib/types/database';

// Use the database type directly to ensure consistency
type Recommendation = DatabaseRecommendation;

// Sample business data for hybrid AI recommendations (when no stored data available)
const sampleBusinessData = {
  businessName: "Sample Tech Company",
  industry: "technology",
  companySize: "51-200 employees",
  location: "California, USA",
  monthlyKwh: 15000,
  monthlyTherms: 500,
  sustainabilityGoals: ["Energy Efficiency", "Renewable Energy", "Carbon Footprint Reduction"],
  currentChallenges: ["High energy costs", "Regulatory compliance"],
  budget: "50000-100000",
  timeline: "6-12 months"
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  // Get real-time recommendation count for insights
  const { count: recommendationCount, refresh: refreshCount } = useRecommendationCount(user?.id || null);
  
  // Get user profile and premium status
  const { profile: userProfile, loading: profileLoading, upgradeToPremium } = useUserProfile(user?.id || null);

  const fetchRecommendations = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // This now fetches only active recommendations by default
      const result = await recommendationOperations.getUserRecommendations(user.id);
      
      if (result.success && result.data) {
        setRecommendations(result.data);
      } else {
        setError(result.error || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user?.id]);

  const handleGenerateNewRecommendations = async () => {
    if (!user || !userProfile) return;

    try {
      setGenerating(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          businessName: userProfile.business_name,
          industry: userProfile.industry,
          companySize: userProfile.company_size,
          location: userProfile.location,
          // TODO: Replace with actual data
          monthlyKwh: 15000, 
          monthlyTherms: 500,
          sustainabilityGoals: ['Reduce Energy Consumption']
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate new recommendations');
      }

      const data = await response.json();
      
      // Refresh recommendations list to show the new ones
      await fetchRecommendations();
      
      alert(`✅ Successfully generated ${data.newRecommendations.length} new recommendations!`);

    } catch (err) {
      console.error('Error generating new recommendations:', err);
      setError('Failed to generate new recommendations');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpgradeToPremium = async () => {
    try {
      setUpgrading(true);
      await upgradeToPremium();
    } catch (err) {
      console.error('Error upgrading to premium:', err);
    } finally {
      setUpgrading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading || profileLoading) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-800 bg-red-100 border-red-300';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalSavings = recommendations.reduce((sum, rec) => sum + (rec.estimated_annual_savings || 0), 0);

  // Check if user has completed onboarding
  const hasCompletedOnboarding = userProfile?.onboarding_completed;
  const isPremium = userProfile?.isPremium || false;
  const subscriptionTier = userProfile?.subscriptionTier || 'free';

  if (loading) {
    return (
      <Layout currentPage="/dashboard/recommendations" userId={user.id}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading recommendations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="/dashboard/recommendations" userId={user.id}>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI-Powered Recommendations
                {isPremium && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800">
                    ✨ {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                Your personalized sustainability recommendations. New insights are generated based on your latest data.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={fetchRecommendations}
                disabled={loading}
              >
                🔄 Refresh
              </Button>
              <Button 
                variant="primary"
                onClick={handleGenerateNewRecommendations}
                disabled={generating}
              >
                {generating ? <Spinner size="sm" /> : '🧠 Generate New Recommendations'}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {recommendationCount.total}
            </div>
            <div className="text-sm text-blue-700">Active Recommendations</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="text-2xl font-bold text-red-600">
              {recommendationCount.priority.high}
            </div>
            <div className="text-sm text-red-700">High Priority</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-2xl font-bold text-green-600">
              ${totalSavings.toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Potential Annual Savings</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {recommendationCount.status.pending + recommendationCount.status.in_progress}
            </div>
            <div className="text-sm text-purple-700">Active Items</div>
          </Card>
        </div>

        {/* Premium/Freemium Model Notice - Development Mode */}
        {!isPremium ? (
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-green-900">🚀 Development Mode: Unlimited Access</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Free tier has unlimited recommendations for development. In production: $29/month for premium features.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleUpgradeToPremium}
                disabled={upgrading}
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                {upgrading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Testing...
                  </div>
                ) : (
                  '🧪 Test Premium'
                )}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-purple-900">
                  ✨ {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Member
                </h3>
                <p className="text-sm text-purple-700 mt-1">
                  Unlimited AI recommendations, advanced analytics, and priority support included.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* MAIN Recommendations List */}
        <>
          {error && (
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-red-900">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Conditional Content Based on Onboarding Status */}
          {!hasCompletedOnboarding ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Setup</h3>
              <p className="text-gray-600 mb-4">
                Please complete your business profile and add energy data to receive personalized sustainability recommendations.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="primary" onClick={() => window.location.href = '/onboarding'}>
                  Complete Setup
                </Button>
              </div>
            </Card>
          ) : recommendations.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
              <p className="text-gray-600 mb-4">
                Click "Generate New Recommendations" to get your first set of personalized insights.
              </p>
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleGenerateNewRecommendations}
                disabled={generating}
              >
                {generating ? <Spinner /> : '🚀 Generate My Recommendations'}
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Recommendations 
                  {!isPremium && (
                    <span className="ml-2 text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      🚀 Dev Mode: Unlimited
                    </span>
                  )}
                </h2>
                {!isPremium && (
                  <Button
                    variant="outline"
                    onClick={handleUpgradeToPremium}
                    disabled={upgrading}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    🧪 Test Premium Features
                  </Button>
                )}
              </div>
              
              {recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary-500"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {rec.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {rec.description}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority || 'low')}`}>
                      {rec.priority?.toUpperCase() || 'LOW'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <div className="text-gray-500 mb-1">Annual Savings</div>
                      <div className="font-semibold text-green-600">
                        ${rec.estimated_annual_savings?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">CO₂ Reduction</div>
                      <div className="font-semibold text-blue-600">
                        {rec.annual_co2_reduction_tons?.toFixed(1) || 'N/A'} tons/year
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Category</div>
                      <div className="font-semibold capitalize">{rec.category?.replace('_', ' ') || 'General'}</div>
                    </div>
                  </div>
                  
                  {rec.detailed_explanation && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-700">{rec.detailed_explanation}</div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 mb-4">
                    {rec.implementation_cost && (
                      <div>
                        <div>Implementation Cost</div>
                        <div className="font-medium">${rec.implementation_cost.toLocaleString()}</div>
                      </div>
                    )}
                    {rec.payback_period_months && (
                      <div>
                        <div>Payback Period</div>
                        <div className="font-medium">{rec.payback_period_months} months</div>
                      </div>
                    )}
                    {rec.difficulty_level && (
                      <div>
                        <div>Difficulty</div>
                        <div className="font-medium">
                          {rec.difficulty_level <= 2 ? 'Easy' : 
                           rec.difficulty_level <= 3 ? 'Medium' : 'Hard'}
                        </div>
                      </div>
                    )}
                    {rec.ai_confidence_score && (
                      <div>
                        <div>Confidence</div>
                        <div className="font-medium">{Math.round(rec.ai_confidence_score * 100)}%</div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={async () => {
                        // BUSINESS LOGIC: Create implementation record for progress tracking
                        try {
                          const { implementationApi } = await import('../../../lib/implementation');
                          
                          // Map difficulty level from number to string
                          const getDifficultyString = (level: number): 'Easy' | 'Medium' | 'Hard' => {
                            if (level <= 2) return 'Easy';
                            if (level <= 3) return 'Medium';
                            return 'Hard';
                          };
                          
                          // Create implementation record
                          const implementationData = {
                            userId: user.id,
                            recommendationId: rec.id,
                            title: rec.title,
                            description: rec.description || 'Implementation started from recommendation',
                            category: rec.category || 'general',
                            estimatedCostSavings: rec.estimated_annual_savings || 0,
                            estimatedCo2Reduction: rec.annual_co2_reduction_tons || 0,
                            roiMonths: rec.payback_period_months || 12,
                            difficulty: getDifficultyString(rec.difficulty_level || 1),
                          };
                          
                          console.log('🚀 Creating implementation:', implementationData);
                          const result = await implementationApi.create(implementationData);
                          const newImplementation = result?.implementation;
                          
                          if (newImplementation) {
                            // Mark the recommendation as completed
                            const { recommendationOperations } = await import('../../../lib/database');
                            await recommendationOperations.markRecommendationCompleted(rec.id, user.id);
                            
                            // Refresh the recommendations list
                            await fetchRecommendations();
                            
                            // Refresh the count as well
                            refreshCount();
                            
                            alert(`🚀 Implementation Started!\n\n"${rec.title}" has been added to your implementation tracking.\n\nView progress on your dashboard!`);
                          }
                        } catch (error) {
                          console.error('Error creating implementation:', error);
                          alert('❌ Error starting implementation. Please try again.');
                        }
                      }}
                    >
                      🚀 Start Implementation
                    </Button>
                  </div>
                </Card>
              ))}

              {!isPremium && recommendations.length > 0 && (
                <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-green-900">
                        🚀 Development Mode Active
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        All {recommendations.length} recommendations are available. In production, free users get 3/month.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleUpgradeToPremium}
                      disabled={upgrading}
                      className="border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      {upgrading ? 'Testing...' : '🧪 Test Premium UI'}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </>
      </div>
    </Layout>
  );
} 