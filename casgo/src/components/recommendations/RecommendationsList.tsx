'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/LoadingSpinner';
import { RecommendationCard } from './RecommendationCard';
import { useToast } from '../../contexts/ToastContext';

// Types matching our hybrid API response
interface HybridRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedCostSavings: number;
  estimatedCo2Reduction: number;
  roiMonths: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  priorityScore: number;
  
  // Enhanced fields from AI service
  implementationSteps?: string[];
  reasoning?: string;
  
  // Metadata for transparency
  source: 'ai' | 'rules' | 'hybrid';
  confidence: number;
  generated_at: string;
  paybackYears?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
}

interface RecommendationsMetadata {
  totalRecommendations: number;
  aiRecommendations: number;
  rulesRecommendations: number;
  totalPotentialSavings: number;
  totalCo2Reduction: number;
  processingTimeMs: number;
  aiServiceAvailable: boolean;
  rulesEngineStatus: 'success' | 'partial' | 'failed';
}

interface HybridRecommendationResponse {
  recommendations: HybridRecommendation[];
  metadata: RecommendationsMetadata;
  executionTimestamp: string;
}

interface RecommendationsListProps {
  /** Business data for generating recommendations */
  businessData: {
    businessName: string;
    industry: string;
    companySize: string;
    location: string;
    monthlyKwh: number;
    monthlyTherms: number;
    sustainabilityGoals: string[];
    currentChallenges?: string[];
    budget?: string;
    timeline?: string;
  };
  /** Maximum number of recommendations to display (default: 5) */
  maxRecommendations?: number;
  /** Custom CSS classes */
  className?: string;
  /** Callback when a recommendation is selected for implementation */
  onImplement?: (recommendation: HybridRecommendation) => void;
  /** Callback when more details are requested */
  onViewDetails?: (recommendation: HybridRecommendation) => void;
}

/**
 * RecommendationsList Component
 * 
 * Fetches and displays hybrid AI + rules-based sustainability recommendations
 * from the backend API. Shows prioritized suggestions with implementation guidance.
 */
export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  businessData,
  maxRecommendations = 5,
  className = '',
  onImplement,
  onViewDetails
}) => {
  const { success, error: showError, warning, info } = useToast(); // Toast notifications
  const [recommendations, setRecommendations] = useState<HybridRecommendation[]>([]);
  const [metadata, setMetadata] = useState<RecommendationsMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<{
    type: 'full' | 'partial' | 'failed' | 'network';
    message: string;
    canRetry: boolean;
  } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchRecommendations = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      setServiceStatus(null);
      if (isRetry) {
        setIsRetrying(true);
      }

      const response = await fetch('http://localhost:5000/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData)
      });

      const data: HybridRecommendationResponse = await response.json();

      // Handle different response scenarios
      if (response.status === 200) {
        // Full success - AI + Rules working
        setServiceStatus({
          type: 'full',
          message: 'All services operational - AI enhanced recommendations available',
          canRetry: false
        });
      } else if (response.status === 206) {
        // Partial content - Rules only, AI unavailable
        setServiceStatus({
          type: 'partial',
          message: 'AI service temporarily unavailable - showing expert rules-based recommendations',
          canRetry: true
        });
      } else {
        // Other non-success status codes
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Service error: ${response.status}`);
      }
      
      // Process recommendations
      const limitedRecs = data.recommendations
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, maxRecommendations);
      
      setRecommendations(limitedRecs);
      setMetadata(data.metadata);

      // Reset retry count on success
      setRetryCount(0);

    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      
      // Determine error type and set appropriate status
      if (err instanceof TypeError && err.message.includes('fetch')) {
        // Network error - service might be down
        setServiceStatus({
          type: 'network',
          message: 'Unable to connect to recommendation service. Please check your internet connection.',
          canRetry: true
        });
      } else {
        // Server or other error
        setServiceStatus({
          type: 'failed',
          message: err instanceof Error ? err.message : 'An unexpected error occurred',
          canRetry: retryCount < 3
        });
      }
      
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      
      // Try fallback recommendations for certain error types
      if (retryCount === 0) {
        generateFallbackRecommendations();
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  // Generate fallback recommendations when services are unavailable
  const generateFallbackRecommendations = () => {
    const fallbackRecs: HybridRecommendation[] = [
      {
        id: 'fallback-1',
        title: 'Switch to LED Lighting',
        description: 'Replace traditional incandescent and CFL bulbs with energy-efficient LED lighting throughout your facility.',
        category: 'energy_efficiency',
        estimatedCostSavings: 2400,
        estimatedCo2Reduction: 1.8,
        roiMonths: 8,
        difficulty: 'Easy',
        priorityScore: 0.9,
        source: 'rules',
        confidence: 0.95,
        generated_at: new Date().toISOString(),
        implementationSteps: [
          'Audit current lighting systems',
          'Calculate potential savings',
          'Purchase LED replacements',
          'Install new lighting systems'
        ],
        reasoning: 'LED lighting typically reduces energy consumption by 75% compared to traditional bulbs.'
      },
      {
        id: 'fallback-2',
        title: 'Programmable Thermostats',
        description: 'Install programmable or smart thermostats to optimize heating and cooling schedules.',
        category: 'energy_efficiency',
        estimatedCostSavings: 1800,
        estimatedCo2Reduction: 2.1,
        roiMonths: 12,
        difficulty: 'Easy',
        priorityScore: 0.8,
        source: 'rules',
        confidence: 0.9,
        generated_at: new Date().toISOString(),
        implementationSteps: [
          'Choose appropriate smart thermostats',
          'Schedule professional installation',
          'Configure optimal temperature schedules',
          'Monitor and adjust settings'
        ]
      },
      {
        id: 'fallback-3',
        title: 'Energy Audit',
        description: 'Conduct a comprehensive energy audit to identify the most impactful efficiency opportunities.',
        category: 'assessment',
        estimatedCostSavings: 5000,
        estimatedCo2Reduction: 3.5,
        roiMonths: 6,
        difficulty: 'Medium',
        priorityScore: 0.85,
        source: 'rules',
        confidence: 0.8,
        generated_at: new Date().toISOString(),
        implementationSteps: [
          'Research certified energy auditors',
          'Schedule comprehensive facility assessment',
          'Review audit recommendations',
          'Prioritize implementation based on ROI'
        ]
      }
    ];

    setRecommendations(fallbackRecs);
    setMetadata({
      totalRecommendations: fallbackRecs.length,
      aiRecommendations: 0,
      rulesRecommendations: fallbackRecs.length,
      totalPotentialSavings: fallbackRecs.reduce((sum, rec) => sum + rec.estimatedCostSavings, 0),
      totalCo2Reduction: fallbackRecs.reduce((sum, rec) => sum + rec.estimatedCo2Reduction, 0),
      processingTimeMs: 0,
      aiServiceAvailable: false,
      rulesEngineStatus: 'failed'
    });
  };

  // Retry with automatic backoff
  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    
    // Add exponential backoff delay
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    await fetchRecommendations(true);
  };

  // Button click handlers
  const handleRetryClick = () => {
    handleRetry();
  };

  const handleRefreshClick = () => {
    fetchRecommendations();
  };

  useEffect(() => {
    if (businessData.businessName && businessData.sustainabilityGoals.length > 0) {
      fetchRecommendations();
    }
  }, [businessData, maxRecommendations]);



  // Loading state
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Generating personalized recommendations...</p>
          <p className="mt-2 text-sm text-gray-500">
            Analyzing your data with AI and industry best practices
          </p>
        </div>
      </div>
    );
  }

  // Enhanced error state with different handling based on service status
  if (error && serviceStatus) {
    const getErrorConfig = () => {
      switch (serviceStatus.type) {
        case 'network':
          return {
            variant: 'warning' as const,
            icon: (
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            ),
            title: 'Connection Issue',
            textColor: 'text-yellow-800',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-300',
            buttonColor: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
          };
        case 'failed':
          return {
            variant: 'error' as const,
            icon: (
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ),
            title: 'Service Error',
            textColor: 'text-red-800',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-300',
            buttonColor: 'border-red-300 text-red-700 hover:bg-red-50'
          };
        default:
          return {
            variant: 'error' as const,
            icon: (
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ),
            title: 'Failed to Load Recommendations',
            textColor: 'text-red-800',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-300',
            buttonColor: 'border-red-300 text-red-700 hover:bg-red-50'
          };
      }
    };

    const config = getErrorConfig();

    return (
      <Card variant={config.variant} className={className}>
        <CardContent>
          <div className="text-center py-6">
            <div className={`mb-4 ${config.textColor}`}>
              {config.icon}
            </div>
            <h3 className={`text-lg font-semibold ${config.textColor} mb-2`}>{config.title}</h3>
            <p className={`${config.textColor} mb-4`}>{serviceStatus.message}</p>
            
            {recommendations.length > 0 && (
              <div className={`mb-4 p-3 ${config.bgColor} border ${config.borderColor} rounded-lg`}>
                <p className={`text-sm ${config.textColor}`}>
                  ✨ Don't worry! We've provided {recommendations.length} backup recommendations below based on industry best practices.
                </p>
              </div>
            )}
            
            {serviceStatus.canRetry && (
              <div className="space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleRetryClick}
                  loading={isRetrying}
                  className={config.buttonColor}
                >
                  {isRetrying ? `Retrying... (${retryCount + 1}/3)` : 'Try Again'}
                </Button>
                {recommendations.length === 0 && (
                  <Button 
                    variant="ghost" 
                    onClick={() => generateFallbackRecommendations()}
                    className="text-gray-600 hover:bg-gray-50"
                  >
                    Show Backup Recommendations
                  </Button>
                )}
              </div>
            )}
            
            {!serviceStatus.canRetry && (
              <p className={`text-sm ${config.textColor} mt-2`}>
                Maximum retry attempts reached. Please try again later.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Available</h3>
            <p className="text-gray-600 mb-4">
              We couldn't generate recommendations for your current business profile.
            </p>
            <Button 
              variant="outline" 
              onClick={handleRefreshClick}
            >
              Refresh Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Stats */}
      {metadata && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card size="sm" className="text-center">
            <CardContent className="py-4">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {recommendations.length}
              </div>
              <div className="text-sm text-gray-600">Recommendations</div>
            </CardContent>
          </Card>
          <Card size="sm" className="text-center">
            <CardContent className="py-4">
              <div className="text-2xl font-bold text-green-600 mb-1">
                ${metadata.totalPotentialSavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Potential Savings</div>
            </CardContent>
          </Card>
          <Card size="sm" className="text-center">
            <CardContent className="py-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {metadata.totalCo2Reduction.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">CO₂ Reduction (tons)</div>
            </CardContent>
          </Card>
          <Card size="sm" className="text-center">
            <CardContent className="py-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {metadata.aiServiceAvailable ? metadata.aiRecommendations : 0}
              </div>
              <div className="text-sm text-gray-600">AI Enhanced</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Service Status Indicator */}
      {metadata && (
        <Card size="sm" className={serviceStatus?.type === 'partial' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Generation Status:</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    serviceStatus?.type === 'full' ? 'bg-green-500' : 
                    serviceStatus?.type === 'partial' ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}></div>
                  <span className={
                    serviceStatus?.type === 'partial' ? 'text-yellow-700 font-medium' : 'text-gray-700'
                  }>
                    {metadata.aiServiceAvailable ? 'AI + Rules Engine' : 'Rules Engine Only'}
                  </span>
                  {serviceStatus?.type === 'partial' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Partial Service
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">
                  Generated in {metadata.processingTimeMs}ms
                </span>
                {serviceStatus?.canRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetryClick}
                    disabled={isRetrying}
                    className="text-xs h-6 px-2"
                  >
                    {isRetrying ? 'Retrying...' : 'Retry AI'}
                  </Button>
                )}
              </div>
            </div>
            
            {serviceStatus?.type === 'partial' && (
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-xs">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-yellow-800">
                    <p className="font-medium mb-1">AI Service Temporarily Unavailable</p>
                    <p>Showing expert rules-based recommendations. AI enhancements will return automatically when the service is restored.</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Recommendations List */}
      <div className="space-y-8">
        {recommendations.map((rec, index) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            index={index}
            aiServiceAvailable={metadata?.aiServiceAvailable || false}
            onImplement={onImplement}
            onViewDetails={onViewDetails}
            size="md"
            showMetrics={true}
            showReasoning={true}
            showImplementationSteps={true}
className="animate-fade-in"
          />
        ))}
      </div>

      {/* Refresh Button */}
      <div className="text-center pt-4">
        <Button 
          variant="outline" 
          onClick={handleRefreshClick}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Refresh Recommendations'}
        </Button>
      </div>
    </div>
  );
};

export default RecommendationsList; 