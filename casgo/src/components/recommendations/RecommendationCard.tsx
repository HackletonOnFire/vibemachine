'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../lib/auth';
import { useImplementation } from '../../hooks/useImplementation';
import { CreateImplementationRequest } from '../../lib/implementation';

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

interface RecommendationCardProps {
  /** The recommendation data to display */
  recommendation: HybridRecommendation;
  /** Index/rank of the recommendation (for numbering) */
  index?: number;
  /** Whether AI service is available (affects source badge styling) */
  aiServiceAvailable?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Callback when a recommendation is selected for implementation */
  onImplement?: (recommendation: HybridRecommendation) => void;
  /** Callback when more details are requested */
  onViewDetails?: (recommendation: HybridRecommendation) => void;
  /** Size variant for the card */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the detailed metrics section */
  showMetrics?: boolean;
  /** Whether to show AI reasoning section */
  showReasoning?: boolean;
  /** Whether to show implementation steps */
  showImplementationSteps?: boolean;
}

/**
 * RecommendationCard Component
 * 
 * Displays an individual sustainability recommendation with ROI estimates,
 * action buttons, and detailed metrics. Designed to be reusable across
 * different contexts (dashboard, details page, etc.).
 */
export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  index,
  aiServiceAvailable = false,
  className = '',
  onImplement,
  onViewDetails,
  size = 'md',
  showMetrics = true,
  showReasoning = true,
  showImplementationSteps = true,
}) => {
  const { success, info, error: showError } = useToast(); // Toast notifications
  const { user } = useAuth(); // Get authenticated user
  const { createImplementation, creating } = useImplementation(); // Implementation management
  const [isImplementing, setIsImplementing] = useState(false);
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200/60';
      case 'Medium': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200/60';
      case 'Hard': return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200/60';
      default: return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border border-slate-200/60';
    }
  };

  const getSourceBadge = (source: string, aiAvailable: boolean) => {
    switch (source) {
      case 'ai': return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200/60';
      case 'hybrid': return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200/60';
      case 'rules': return aiAvailable ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border border-slate-200/60' : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200/60';
      default: return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border border-slate-200/60';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'ai': return '✨ AI Generated';
      case 'hybrid': return '🔮 AI Enhanced';
      case 'rules': return '⚡ Expert Rules';
      default: return source;
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'Low': return 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200/60';
      case 'Medium': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200/60';
      case 'High': return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200/60';
      default: return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border border-slate-200/60';
    }
  };

  const getPriorityIcon = (priorityScore: number) => {
    if (priorityScore >= 80) return '🔥'; // High priority
    if (priorityScore >= 60) return '⭐'; // Medium priority
    return '💡'; // Low priority
  };

  // Handle implementation creation
  const handleImplementNow = async () => {
    if (!user) {
      showError(
        'Authentication Required',
        'Please log in to implement recommendations.',
        { duration: 5000 }
      );
      return;
    }

    try {
      setIsImplementing(true);

      // Check if recommendationId is a valid UUID format
      const isValidUUID = (str: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };

      const implementationData: CreateImplementationRequest = {
        userId: user.id,
        // Only include recommendationId if it's a valid UUID
        ...(isValidUUID(recommendation.id) && { recommendationId: recommendation.id }),
        title: recommendation.title,
        description: recommendation.description,
        category: recommendation.category,
        estimatedCostSavings: recommendation.estimatedCostSavings,
        estimatedCo2Reduction: recommendation.estimatedCo2Reduction,
        roiMonths: recommendation.roiMonths,
        difficulty: recommendation.difficulty,
      };

      console.log('🎯 Implementation data with UUID check:', implementationData);

      const newImplementation = await createImplementation(implementationData);

      if (newImplementation) {
        success(
          'Implementation Started! 🚀',
          `You've started implementing: ${recommendation.title}. Track your progress in the dashboard!`,
          { 
            duration: 8000,
            action: {
              label: 'View Dashboard',
              onClick: () => {
                window.location.href = '/dashboard';
              }
            }
          }
        );

        // Call the original onImplement callback if provided
        onImplement?.(recommendation);
      }
    } catch (error) {
      showError(
        'Implementation Failed',
        error instanceof Error ? error.message : 'Failed to start implementation. Please try again.',
        { duration: 5000 }
      );
    } finally {
      setIsImplementing(false);
    }
  };

  // Calculate payback period (use roiMonths or paybackYears)
  const getPaybackDisplay = () => {
    if (recommendation.paybackYears) {
      const years = recommendation.paybackYears;
      const months = Math.round(years * 12);
      return years < 1 ? `${months} mo` : `${years.toFixed(1)} yr`;
    }
    return `${recommendation.roiMonths} mo`;
  };

  // Calculate annual ROI percentage
  const getAnnualROI = () => {
    const months = recommendation.paybackYears ? recommendation.paybackYears * 12 : recommendation.roiMonths;
    if (months > 0) {
      return Math.round((12 / months) * 100);
    }
    return 0;
  };

  return (
    <Card 
      variant="default"
      size={size}
      className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer
        bg-gradient-to-br from-white via-slate-50/50 to-white
        border border-slate-200/60 hover:border-slate-300/80 shadow-lg hover:shadow-2xl
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:to-slate-100/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
        ${className}`}
    >
      {/* Priority indicator stripe */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
      
      {/* Priority corner badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`
          inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-sm
          ${recommendation.priorityScore >= 80 ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
            recommendation.priorityScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
            'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'}
        `}>
          <span>{getPriorityIcon(recommendation.priorityScore)}</span>
          <span>#{typeof index === 'number' ? index + 1 : '?'}</span>
        </div>
      </div>
      
      <CardHeader size={size} className="relative z-10 pb-4">
        <div className="space-y-4">
          {/* Enhanced badges section */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 hover:scale-105 ${getDifficultyColor(recommendation.difficulty)}`}>
              {recommendation.difficulty}
            </span>
            <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 hover:scale-105 ${getSourceBadge(recommendation.source, aiServiceAvailable)}`}>
              {getSourceLabel(recommendation.source)}
            </span>
            {recommendation.riskLevel && (
              <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 hover:scale-105 ${getRiskColor(recommendation.riskLevel)}`}>
                🛡️ {recommendation.riskLevel} Risk
              </span>
            )}
          </div>
          
          {/* Enhanced title and description */}
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-3 leading-tight">
              {recommendation.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
              {recommendation.description}
            </p>
          </div>
          
          {/* Enhanced ROI highlight section */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/60 rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ${recommendation.estimatedCostSavings.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-700 font-medium">Annual Savings</div>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {getAnnualROI()}%
                </div>
                <div className="text-xs text-blue-700 font-medium">ROI</div>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {getPaybackDisplay()}
                </div>
                <div className="text-xs text-purple-700 font-medium">Payback</div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent size={size} className="relative z-10 pt-2">
        {/* Enhanced Impact Metrics */}
        {showMetrics && (
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200/60 rounded-2xl shadow-sm">
              <div className="text-center group">
                <div className="text-lg font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-200">
                  {recommendation.estimatedCo2Reduction.toFixed(1)}
                </div>
                <div className="text-xs text-slate-600 font-medium">🌱 CO₂ tons/year</div>
              </div>
              <div className="text-center group">
                <div className="text-lg font-bold text-blue-600 group-hover:scale-110 transition-transform duration-200">
                  {Math.round(recommendation.confidence * 100)}%
                </div>
                <div className="text-xs text-slate-600 font-medium">🎯 Confidence</div>
              </div>
              <div className="text-center group">
                <div className="text-lg font-bold text-purple-600 group-hover:scale-110 transition-transform duration-200 capitalize">
                  {recommendation.category.replace('_', ' ')}
                </div>
                <div className="text-xs text-slate-600 font-medium">📂 Category</div>
              </div>
              <div className="text-center group">
                <div className="text-lg font-bold text-orange-600 group-hover:scale-110 transition-transform duration-200">
                  {recommendation.priorityScore}
                </div>
                <div className="text-xs text-slate-600 font-medium">⚡ Priority</div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced AI Reasoning */}
        {showReasoning && recommendation.reasoning && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/60 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div className="text-sm font-semibold text-blue-900">AI Insights</div>
            </div>
            <div className="text-sm text-blue-800 leading-relaxed pl-2 border-l-2 border-blue-300/50">
              {recommendation.reasoning}
            </div>
          </div>
        )}

        {/* Enhanced Implementation Steps */}
        {showImplementationSteps && recommendation.implementationSteps && recommendation.implementationSteps.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border border-violet-200/60 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white text-sm">📋</span>
              </div>
              <div className="text-sm font-semibold text-violet-900">Implementation Roadmap</div>
            </div>
            <ol className="space-y-2 text-sm text-violet-800">
              {recommendation.implementationSteps.slice(0, 3).map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 p-2 bg-white/60 rounded-lg">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
              {recommendation.implementationSteps.length > 3 && (
                <li className="flex items-center gap-3 text-violet-600 italic">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-violet-300 to-purple-300 text-violet-700 text-xs font-bold rounded-full">
                    +
                  </span>
                  <span>+{recommendation.implementationSteps.length - 3} more steps available...</span>
                </li>
              )}
            </ol>
          </div>
        )}

        {/* Enhanced Financial Impact Summary */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm">💰</span>
            </div>
            <div className="text-sm font-semibold text-emerald-900">Financial Impact Analysis</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/70 rounded-xl border border-emerald-200/40">
              <div className="text-xs text-emerald-700 font-medium mb-1">💵 Annual Savings</div>
              <div className="text-lg font-bold text-emerald-900">
                ${recommendation.estimatedCostSavings.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-white/70 rounded-xl border border-emerald-200/40">
              <div className="text-xs text-emerald-700 font-medium mb-1">📈 5-Year Value</div>
              <div className="text-lg font-bold text-emerald-900">
                ${(recommendation.estimatedCostSavings * 5).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter size={size} className="relative z-10 pt-6 pb-6">
        <div className="w-full space-y-4">
          {/* Timestamp and metadata */}
          <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-4">
            <div className="flex items-center gap-2 text-slate-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Generated: {new Date(recommendation.generated_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{Math.round(recommendation.confidence * 100)}% confidence</span>
            </div>
          </div>
          
          {/* Enhanced Mobile-First CTA buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                info(
                  'Viewing Details',
                  `Opening detailed information for: ${recommendation.title}`,
                  { duration: 3000 }
                );
                onViewDetails?.(recommendation);
              }}
              className="w-full sm:flex-1 group relative overflow-hidden bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 border-slate-300/60 text-slate-700 hover:text-slate-900 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg touch-manipulation"
              leftIcon={
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <span className="relative z-10 font-semibold text-base">📖 Learn More</span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Button>
            
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleImplementNow}
              disabled={isImplementing || creating || !user}
              className="w-full sm:flex-1 group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              leftIcon={
                (isImplementing || creating) ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )
              }
            >
              <span className="relative z-10 font-bold text-base">
                {(isImplementing || creating) ? '⏳ Starting...' : '🚀 Implement Now'}
              </span>
              {/* Pulse effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Button>
          </div>
          
          {/* Quick action hints */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>Quick to implement</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>High impact potential</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RecommendationCard; 