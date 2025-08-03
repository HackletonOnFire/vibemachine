'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Sparkles, Zap, Target } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth';
import { onboardingService } from '../../lib/onboarding';
import { useToast } from '../../contexts/ToastContext';
import StepOne, { type BusinessBasicsData } from './StepOne';
import StepTwo, { type EnergyUsageData } from './StepTwo';
import StepThree, { type SustainabilityGoalsData } from './StepThree';

interface OnboardingWizardProps {
  onComplete?: (data: OnboardingData) => void;
  onSuccess?: () => void; // Called after successful database save
  className?: string;
}

export interface OnboardingData {
  businessBasics: BusinessBasicsData;
  energyUsage: EnergyUsageData;
  sustainabilityGoals: SustainabilityGoalsData;
}

const steps = [
  {
    id: 1,
    title: 'Business Basics',
    subtitle: 'Tell us about your company',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    title: 'Energy Usage',
    subtitle: 'Share your energy consumption',
    icon: Zap,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 3,
    title: 'Sustainability Goals',
    subtitle: 'Set your green targets',
    icon: Target,
    color: 'from-violet-500 to-purple-500',
  },
];

export default function OnboardingWizard({ onComplete, onSuccess, className }: OnboardingWizardProps) {
  const { user, loading: authLoading } = useAuth(); // Get authenticated user
  const { success, error, warning, info } = useToast(); // Toast notifications
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    sustainabilityGoals: {
      selectedGoals: [],
      targetTimeline: '1_year',
      priorityLevel: 'medium',
      primaryMotivation: 'cost_savings'
    }
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboarding-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.data || {});
        setCurrentStep(parsed.currentStep || 1);
        setCompletedSteps(parsed.completedSteps || []);
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('onboarding-progress', JSON.stringify({
      data: formData,
      currentStep,
      completedSteps,
    }));
  }, [formData, currentStep, completedSteps]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleStepComplete = async (stepData: any) => {
    const stepKey = currentStep === 1 ? 'businessBasics' : 
                   currentStep === 2 ? 'energyUsage' : 'sustainabilityGoals';
    
    setFormData(prev => ({
      ...prev,
      [stepKey]: stepData,
    }));

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }

    if (currentStep === steps.length) {
      // Final step completed - save to database
      await handleFinalSubmit(stepData, stepKey);
    } else {
      handleNext();
    }
  };

  const handleFinalSubmit = async (finalStepData: any, stepKey: string) => {
    console.log('🔄 handleFinalSubmit called with:', { stepKey, finalStepData, userId: user?.id });

    if (!user?.id) {
      console.error('❌ No user ID available for onboarding submission');
      setSubmitError('Authentication session expired. Please refresh the page and log in again.');
      return;
    }

    console.log('⏳ Setting isSubmitting to true...');
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const completeData = {
        ...formData,
        [stepKey]: finalStepData,
      } as OnboardingData;

      console.log('📦 Complete onboarding data prepared:', completeData);
      console.log('💾 Calling onboardingService.saveOnboardingData for user:', user.id);
      
      // Save to database using the onboarding service
      const result = await onboardingService.saveOnboardingData(user.id, completeData);
      
      console.log('📋 Onboarding service result:', result);

      if (result.success) {
        console.log('✅ Onboarding data saved successfully:', result.data);
        
        console.log('🧹 Removing localStorage progress...');
        localStorage.removeItem('onboarding-progress');
        
        console.log('📞 Calling completion handlers...');
        // Call both completion handlers
        try {
          onComplete?.(completeData);
          console.log('✅ onComplete handler called successfully');
        } catch (err) {
          console.error('❌ Error in onComplete handler:', err);
        }
        
        try {
          onSuccess?.();
          console.log('✅ onSuccess handler called successfully');
        } catch (err) {
          console.error('❌ Error in onSuccess handler:', err);
        }
        
        // Show success toast notification
        console.log('🎉 Showing success toast...');
        success(
          'Onboarding Complete! 🎉',
          'Welcome to your sustainability dashboard. Your journey to a greener future starts now!',
          { 
            duration: 8000,
            action: {
              label: 'Go to Dashboard',
              onClick: () => {
                window.location.href = '/dashboard';
              }
            }
          }
        );
        console.log('✅ Success toast shown');
      } else {
        console.error('❌ Failed to save onboarding data:', result.error);
        
        // Provide helpful error messages
        let userFriendlyError = result.error || 'Failed to save data. Please try again.';
        if (result.error?.includes('No rows returned')) {
          userFriendlyError = 'Profile setup issue detected. Please refresh the page and try again.';
        }
        
        // Show error toast notification
        error(
          'Onboarding Failed',
          userFriendlyError,
          {
            persistent: true,
            action: {
              label: 'Try Again',
              onClick: () => {
                setSubmitError(null);
                setIsSubmitting(false);
                // Let user try again manually
              }
            }
          }
        );
        
        setSubmitError(userFriendlyError);
      }
    } catch (error) {
      console.error('💥 Onboarding submission error:', error);
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      
      // Show error toast notification
      error(
        'System Error',
        errorMessage,
        {
          persistent: true,
          action: {
            label: 'Report Issue',
            onClick: () => {
              // Could open a support form or email
              window.open('mailto:support@casgo.com?subject=Onboarding Error&body=' + encodeURIComponent(errorMessage));
            }
          }
        }
      );
      
      setSubmitError(errorMessage);
    } finally {
      console.log('🏁 Setting isSubmitting to false in finally block...');
      setIsSubmitting(false);
      console.log('🏁 handleFinalSubmit completed');
    }
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber <= Math.max(...completedSteps) + 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(stepNumber);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const currentStepData = steps[currentStep - 1];
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  // Show loading if auth is still being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Initializing onboarding...</p>
        </div>
      </div>
    );
  }

  // Show error if no user is available
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Authentication required</p>
          <p className="text-slate-500 text-sm">Please log in to access the onboarding wizard</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,175,80,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(33,150,243,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(156,39,176,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Enhanced Mobile-First Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg border border-white/20 mb-4 sm:mb-6 mx-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
              Welcome to Casgo
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-emerald-700 dark:from-white dark:via-blue-200 dark:to-emerald-300 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            Let's get you started
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">
            Set up your sustainability journey in just 3 simple steps
          </p>
        </div>

        {/* Enhanced Mobile-First Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12 animate-slide-up">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
            {/* Progress Percentage */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Setup Progress</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  {Math.round(((completedSteps.length + (currentStep > completedSteps.length ? 0.5 : 0)) / steps.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ 
                    width: `${((completedSteps.length + (currentStep > completedSteps.length ? 0.5 : 0)) / steps.length) * 100}%` 
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Step Indicators */}
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                const isAccessible = step.id <= Math.max(...completedSteps) + 1;
                const Icon = step.icon;

                return (
                  <React.Fragment key={step.id}>
                    <button
                      type="button"
                      onClick={() => goToStep(step.id)}
                      disabled={!isAccessible}
                      className={cn(
                        "group relative flex flex-col items-center transition-all duration-300 hover:scale-105 active:scale-95",
                        isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                      )}
                    >
                      {/* Enhanced Icon Container */}
                      <div className={cn(
                        "relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg transform transition-all duration-300 border-2 group-hover:shadow-xl",
                        isCompleted 
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30 border-emerald-300" 
                          : isCurrent 
                            ? `bg-gradient-to-r ${step.color} text-white shadow-lg border-white` 
                            : "bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600 group-hover:border-slate-300"
                      )}>
                        {isCompleted ? (
                          <Check className="w-8 h-8 animate-bounce-once" />
                        ) : (
                          <Icon className="w-8 h-8" />
                        )}

                        {/* Enhanced Pulse Animation for Current Step */}
                        {isCurrent && !isCompleted && (
                          <>
                            <div
                              className={cn(
                                "absolute inset-0 rounded-full bg-gradient-to-r animate-pulse opacity-75",
                                step.color
                              )}
                              style={{ animationDuration: '2s' }}
                            />
                            <div
                              className={cn(
                                "absolute inset-0 rounded-full bg-gradient-to-r animate-ping opacity-50",
                                step.color
                              )}
                              style={{ animationDuration: '3s' }}
                            />
                          </>
                        )}

                        {/* Completion Checkmark Animation */}
                        {isCompleted && (
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse opacity-20"></div>
                        )}
                      </div>

                      {/* Enhanced Step Info */}
                      <div className="text-center mt-4 max-w-32">
                        <div className={cn(
                          "text-sm font-semibold transition-colors duration-200",
                          isCompleted 
                            ? "text-emerald-600 dark:text-emerald-400" 
                            : isCurrent 
                              ? "text-slate-900 dark:text-slate-100"
                              : "text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                        )}>
                          {step.title}
                        </div>
                        <div className={cn(
                          "text-xs mt-1 transition-colors duration-200",
                          isCompleted 
                            ? "text-emerald-500 dark:text-emerald-400" 
                            : isCurrent 
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-500 dark:text-slate-500"
                        )}>
                          {step.subtitle}
                        </div>
                        
                        {/* Step Status Indicator */}
                        <div className="mt-2">
                          {isCompleted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              ✓ Complete
                            </span>
                          )}
                          {isCurrent && !isCompleted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-pulse">
                              ● In Progress
                            </span>
                          )}
                          {!isAccessible && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                              ○ Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Enhanced Connection Line */}
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-4">
                        <div className={cn(
                          "h-0.5 w-full transition-all duration-500 relative overflow-hidden",
                          isCompleted && completedSteps.includes(steps[index + 1].id)
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                            : isCompleted || (isCurrent && currentStep > step.id)
                              ? "bg-gradient-to-r from-emerald-500 to-slate-300"
                              : "bg-slate-300 dark:bg-slate-600"
                        )}>
                          {/* Animated progress line */}
                          {(isCompleted || isCurrent) && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 animate-shimmer-slow"></div>
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Enhanced Navigation Hints */}
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {currentStep === 1 && "Let's start by learning about your business"}
                {currentStep === 2 && "Now, tell us about your energy consumption"}
                {currentStep === 3 && "Finally, set your sustainability goals"}
                {completedSteps.length === steps.length && "🎉 Setup complete! Ready to start your sustainability journey"}
              </p>
              {completedSteps.length < steps.length && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto animate-slide-up-delayed">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Step Header */}
            <div className={cn(
              "px-8 py-6 bg-gradient-to-r text-white relative overflow-hidden",
              currentStepData.color
            )}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <currentStepData.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
                    <p className="text-white/80">{currentStepData.subtitle}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-8">
              <div
                key={currentStep}
                className={cn(
                  "transition-all duration-300",
                  isTransitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
                )}
              >
                {/* Step Components */}
                {currentStep === 1 && (
                  <StepOne
                    onComplete={handleStepComplete}
                    onPrevious={currentStep > 1 ? handlePrevious : undefined}
                    initialData={formData.businessBasics}
                  />
                )}

                {currentStep === 2 && (
                  <StepTwo
                    onComplete={handleStepComplete}
                    onPrevious={handlePrevious}
                    initialData={formData.energyUsage}
                  />
                )}

                {currentStep === 3 && (
                  <StepThree
                    onComplete={(data) => handleStepComplete(data)}
                    onPrevious={handlePrevious}
                    initialData={formData.sustainabilityGoals}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md text-center">
            <p className="text-sm">{submitError}</p>
            <button 
              onClick={() => setSubmitError(null)}
              className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl text-center">
              <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
              <p className="text-slate-700 font-medium">Saving your data...</p>
              <p className="text-slate-500 text-sm mt-1">This may take a few moments</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-once {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-8px,0); }
          70% { transform: translate3d(0,-4px,0); }
          90% { transform: translate3d(0,-2px,0); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes shimmer-slow {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.2s both;
        }
        
        .animate-slide-up-delayed {
          animation: slide-up 0.6s ease-out 0.4s both;
        }
        
        .animate-bounce-once {
          animation: bounce-once 0.8s ease-out;
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
        
        .animate-shimmer-slow {
          animation: shimmer-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 