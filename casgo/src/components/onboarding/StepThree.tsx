'use client';

import React, { useState, useEffect } from 'react';
import { Target, TrendingDown, Leaf, Zap, Droplets, Recycle, Car, Users, DollarSign, Calendar, Award } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../lib/utils';

interface StepThreeProps {
  onComplete: (data: SustainabilityGoalsData) => void;
  onPrevious?: () => void;
  initialData?: Partial<SustainabilityGoalsData>;
  className?: string;
}

export interface SustainabilityGoalsData {
  selectedGoals: GoalConfiguration[];
  targetTimeline: '6_months' | '1_year' | '2_years' | '3_years';
  priorityLevel: 'high' | 'medium' | 'low';
  investmentBudget?: number;
  primaryMotivation: 'cost_savings' | 'environmental_impact' | 'regulatory_compliance' | 'brand_reputation' | 'operational_efficiency';
}

export interface GoalConfiguration {
  category: string;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  estimatedCost?: number;
  estimatedSavings?: number;
  estimatedROI?: number;
  priority: number;
  icon: string;
}

const SUSTAINABILITY_GOAL_CATEGORIES = [
  {
    category: 'energy_reduction',
    title: 'Reduce Energy Consumption',
    description: 'Lower overall energy usage through efficiency improvements and behavior changes',
    icon: 'zap',
    defaultTarget: 15,
    unit: 'percentage',
    estimatedCost: 5000,
    estimatedSavings: 8000,
    priority: 3,
    color: 'from-yellow-500 to-orange-500',
    benefits: ['Lower utility bills', 'Reduced carbon footprint', 'Improved equipment lifespan']
  },
  {
    category: 'carbon_reduction',
    title: 'Reduce Carbon Footprint',
    description: 'Decrease total CO2 emissions through comprehensive sustainability initiatives',
    icon: 'leaf',
    defaultTarget: 20,
    unit: 'percentage',
    estimatedCost: 8000,
    estimatedSavings: 12000,
    priority: 3,
    color: 'from-green-500 to-emerald-500',
    benefits: ['Environmental leadership', 'Regulatory compliance', 'Employee engagement']
  },
  {
    category: 'waste_reduction',
    title: 'Minimize Waste Generation',
    description: 'Implement waste reduction strategies and improve recycling programs',
    icon: 'recycle',
    defaultTarget: 25,
    unit: 'percentage',
    estimatedCost: 3000,
    estimatedSavings: 5000,
    priority: 2,
    color: 'from-blue-500 to-cyan-500',
    benefits: ['Cost reduction', 'Process efficiency', 'Regulatory compliance']
  },
  {
    category: 'water_conservation',
    title: 'Conserve Water Usage',
    description: 'Reduce water consumption through efficiency measures and leak detection',
    icon: 'droplets',
    defaultTarget: 18,
    unit: 'percentage',
    estimatedCost: 2500,
    estimatedSavings: 4000,
    priority: 2,
    color: 'from-blue-400 to-blue-600',
    benefits: ['Lower water bills', 'Drought resilience', 'Resource conservation']
  },
  {
    category: 'renewable_energy',
    title: 'Increase Renewable Energy',
    description: 'Transition to solar, wind, or other renewable energy sources',
    icon: 'zap',
    defaultTarget: 30,
    unit: 'percentage',
    estimatedCost: 15000,
    estimatedSavings: 20000,
    priority: 1,
    color: 'from-green-400 to-green-600',
    benefits: ['Energy independence', 'Long-term savings', 'Carbon neutrality']
  },
  {
    category: 'green_transportation',
    title: 'Sustainable Transportation',
    description: 'Promote electric vehicles, public transit, and active transportation',
    icon: 'car',
    defaultTarget: 40,
    unit: 'percentage',
    estimatedCost: 10000,
    estimatedSavings: 15000,
    priority: 1,
    color: 'from-purple-500 to-indigo-500',
    benefits: ['Fuel cost savings', 'Employee satisfaction', 'Air quality improvement']
  },
  {
    category: 'sustainable_sourcing',
    title: 'Sustainable Sourcing',
    description: 'Choose eco-friendly suppliers and materials for business operations',
    icon: 'leaf',
    defaultTarget: 35,
    unit: 'percentage',
    estimatedCost: 5000,
    estimatedSavings: 7000,
    priority: 2,
    color: 'from-emerald-500 to-teal-500',
    benefits: ['Supply chain resilience', 'Brand reputation', 'Quality improvement']
  },
  {
    category: 'employee_engagement',
    title: 'Employee Sustainability Engagement',
    description: 'Involve staff in sustainability initiatives and build green culture',
    icon: 'users',
    defaultTarget: 50,
    unit: 'percentage',
    estimatedCost: 2000,
    estimatedSavings: 6000,
    priority: 1,
    color: 'from-pink-500 to-rose-500',
    benefits: ['Higher productivity', 'Employee retention', 'Innovation culture']
  }
];

const MOTIVATION_OPTIONS = [
  { value: 'cost_savings', label: 'Cost Savings', description: 'Primary focus on reducing operational expenses' },
  { value: 'environmental_impact', label: 'Environmental Impact', description: 'Commitment to protecting the environment' },
  { value: 'regulatory_compliance', label: 'Regulatory Compliance', description: 'Meeting environmental regulations and standards' },
  { value: 'brand_reputation', label: 'Brand Reputation', description: 'Enhancing company image and market position' },
  { value: 'operational_efficiency', label: 'Operational Efficiency', description: 'Improving business processes and productivity' }
];

const TIMELINE_OPTIONS = [
  { value: '6_months', label: '6 Months', description: 'Quick wins and immediate impact' },
  { value: '1_year', label: '1 Year', description: 'Balanced approach with measurable results' },
  { value: '2_years', label: '2 Years', description: 'Comprehensive transformation' },
  { value: '3_years', label: '3+ Years', description: 'Long-term strategic goals' }
];

const getIcon = (iconName: string) => {
  const icons = {
    zap: Zap,
    leaf: Leaf,
    recycle: Recycle,
    droplets: Droplets,
    car: Car,
    users: Users
  };
  return icons[iconName as keyof typeof icons] || Target;
};

export default function StepThree({ onComplete, onPrevious, initialData, className }: StepThreeProps) {
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [goalTargets, setGoalTargets] = useState<Record<string, number>>({});
  const [targetTimeline, setTargetTimeline] = useState<SustainabilityGoalsData['targetTimeline']>('1_year');
  const [primaryMotivation, setPrimaryMotivation] = useState<SustainabilityGoalsData['primaryMotivation']>('cost_savings');
  const [priorityLevel, setPriorityLevel] = useState<SustainabilityGoalsData['priorityLevel']>('medium');
  const [investmentBudget, setInvestmentBudget] = useState<number | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize with default targets
  useEffect(() => {
    const defaultTargets: Record<string, number> = {};
    SUSTAINABILITY_GOAL_CATEGORIES.forEach(goal => {
      defaultTargets[goal.category] = goal.defaultTarget;
    });
    setGoalTargets(defaultTargets);
  }, []);

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      if (initialData.selectedGoals) {
        setSelectedGoals(new Set(initialData.selectedGoals.map(g => g.category)));
        const targets: Record<string, number> = {};
        initialData.selectedGoals.forEach(goal => {
          targets[goal.category] = goal.targetValue;
        });
        setGoalTargets(prev => ({ ...prev, ...targets }));
      }
      if (initialData.targetTimeline) setTargetTimeline(initialData.targetTimeline);
      if (initialData.primaryMotivation) setPrimaryMotivation(initialData.primaryMotivation);
      if (initialData.priorityLevel) setPriorityLevel(initialData.priorityLevel);
      if (initialData.investmentBudget) setInvestmentBudget(initialData.investmentBudget);
    }
  }, [initialData]);

  const toggleGoal = (category: string) => {
    const newSelected = new Set(selectedGoals);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedGoals(newSelected);
    
    // Clear any existing errors when user makes changes
    if (errors.goals) {
      setErrors(prev => ({ ...prev, goals: '' }));
    }
  };

  const updateGoalTarget = (category: string, value: number) => {
    setGoalTargets(prev => ({
      ...prev,
      [category]: Math.max(1, Math.min(100, value)) // Clamp between 1-100%
    }));
  };

  const calculateTotalInvestment = () => {
    return Array.from(selectedGoals).reduce((total, category) => {
      const goal = SUSTAINABILITY_GOAL_CATEGORIES.find(g => g.category === category);
      return total + (goal?.estimatedCost || 0);
    }, 0);
  };

  const calculateTotalSavings = () => {
    return Array.from(selectedGoals).reduce((total, category) => {
      const goal = SUSTAINABILITY_GOAL_CATEGORIES.find(g => g.category === category);
      const targetMultiplier = goalTargets[category] / (goal?.defaultTarget || 100);
      return total + ((goal?.estimatedSavings || 0) * targetMultiplier);
    }, 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (selectedGoals.size === 0) {
      newErrors.goals = 'Please select at least one sustainability goal';
    }

    if (selectedGoals.size > 5) {
      newErrors.goals = 'Please select no more than 5 goals to maintain focus';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const goalConfigurations: GoalConfiguration[] = Array.from(selectedGoals).map(category => {
      const goalTemplate = SUSTAINABILITY_GOAL_CATEGORIES.find(g => g.category === category)!;
      const targetValue = goalTargets[category];
      const targetMultiplier = targetValue / goalTemplate.defaultTarget;
      
      return {
        category,
        title: goalTemplate.title,
        description: goalTemplate.description,
        targetValue,
        unit: goalTemplate.unit,
        estimatedCost: Math.round((goalTemplate.estimatedCost || 0) * targetMultiplier),
        estimatedSavings: Math.round((goalTemplate.estimatedSavings || 0) * targetMultiplier),
        estimatedROI: goalTemplate.estimatedCost ? 
          Math.round(((goalTemplate.estimatedSavings || 0) * targetMultiplier / (goalTemplate.estimatedCost * targetMultiplier)) * 100) : 0,
        priority: goalTemplate.priority,
        icon: goalTemplate.icon
      };
    });

    const data: SustainabilityGoalsData = {
      selectedGoals: goalConfigurations,
      targetTimeline,
      priorityLevel,
      investmentBudget,
      primaryMotivation
    };

    onComplete(data);
  };

  const totalInvestment = calculateTotalInvestment();
  const totalSavings = calculateTotalSavings();
  const estimatedROI = totalInvestment > 0 ? ((totalSavings / totalInvestment) * 100) : 0;

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Set Your Sustainability Goals
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose the sustainability initiatives that align with your business objectives. 
            We'll help you track progress and measure impact over time.
          </p>
        </div>
      </div>

      {/* Primary Motivation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-500" />
          What's Your Primary Motivation?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOTIVATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setPrimaryMotivation(option.value as any)}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-all hover:shadow-md",
                primaryMotivation === option.value
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              )}
            >
              <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                {option.label}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Goal Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-500" />
            Select Your Goals ({selectedGoals.size}/5)
          </h3>
          {errors.goals && (
            <span className="text-red-500 text-sm">{errors.goals}</span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUSTAINABILITY_GOAL_CATEGORIES.map((goal) => {
            const IconComponent = getIcon(goal.icon);
            const isSelected = selectedGoals.has(goal.category);
            const targetValue = goalTargets[goal.category] || goal.defaultTarget;
            
            return (
              <div
                key={goal.category}
                className={cn(
                  "p-6 rounded-xl border-2 transition-all cursor-pointer",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                )}
                onClick={() => toggleGoal(goal.category)}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center",
                    `bg-gradient-to-r ${goal.color}`
                  )}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-grow space-y-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {goal.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {goal.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Target Reduction: {targetValue}%
                          </label>
                          <input
                            type="range"
                            min="5"
                            max="50"
                            value={targetValue}
                            onChange={(e) => updateGoalTarget(goal.category, parseInt(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>5%</span>
                            <span>50%</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-white dark:bg-slate-800 rounded">
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              ${Math.round((goal.estimatedCost || 0) * (targetValue / goal.defaultTarget)).toLocaleString()}
                            </div>
                            <div className="text-slate-500">Investment</div>
                          </div>
                          <div className="text-center p-2 bg-white dark:bg-slate-800 rounded">
                            <div className="font-medium text-emerald-600">
                              ${Math.round((goal.estimatedSavings || 0) * (targetValue / goal.defaultTarget)).toLocaleString()}
                            </div>
                            <div className="text-slate-500">Savings</div>
                          </div>
                          <div className="text-center p-2 bg-white dark:bg-slate-800 rounded">
                            <div className="font-medium text-blue-600">
                              {Math.round(((goal.estimatedSavings || 0) / (goal.estimatedCost || 1)) * 100)}%
                            </div>
                            <div className="text-slate-500">ROI</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {goal.benefits.map((benefit, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-slate-300 dark:border-slate-600"
                  )}>
                    {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline and Priority */}
      {selectedGoals.size > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Target Timeline
            </h3>
            <div className="space-y-2">
              {TIMELINE_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value={option.value}
                    checked={targetTimeline === option.value}
                    onChange={(e) => setTargetTimeline(e.target.value as any)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {option.label}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-500" />
              Priority Level
            </h3>
            <div className="space-y-2">
              {[
                { value: 'high', label: 'High Priority', description: 'Aggressive targets, dedicated resources' },
                { value: 'medium', label: 'Medium Priority', description: 'Balanced approach, steady progress' },
                { value: 'low', label: 'Low Priority', description: 'Gradual implementation, minimal disruption' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value={option.value}
                    checked={priorityLevel === option.value}
                    onChange={(e) => setPriorityLevel(e.target.value as any)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {option.label}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Investment Budget */}
      {selectedGoals.size > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Available Investment Budget (Optional)
          </h3>
          <div className="max-w-md">
            <Input
              type="number"
              placeholder="Enter annual budget"
              value={investmentBudget || ''}
              onChange={(e) => setInvestmentBudget(e.target.value ? parseFloat(e.target.value) : undefined)}
              min="0"
              step="1000"
            />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              This helps us prioritize recommendations within your budget constraints.
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      {selectedGoals.size > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-500" />
            Your Sustainability Plan Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                ${totalInvestment.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Investment
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                ${totalSavings.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Projected Annual Savings
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {estimatedROI.toFixed(0)}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Estimated ROI
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <TrendingDown className="w-4 h-4 rotate-90" />
          Previous
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={selectedGoals.size === 0}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white"
        >
          Complete Setup
          <Target className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 