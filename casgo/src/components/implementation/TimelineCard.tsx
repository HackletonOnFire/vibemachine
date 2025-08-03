'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { 
  Implementation,
  formatMonths
} from '../../lib/implementation';

interface TimelineCardProps {
  implementation: Implementation;
  className?: string;
  compact?: boolean;
}

interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  weekOffset: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

/**
 * TimelineCard Component
 * 
 * Auto-generates implementation timeline based on difficulty level
 * Shows milestone progress with visual indicators
 */
export const TimelineCard: React.FC<TimelineCardProps> = ({
  implementation,
  className = '',
  compact = false
}) => {
  // Auto-generate timeline based on difficulty
  const generateTimeline = (difficulty: string, roiMonths: number): TimelineMilestone[] => {
    const totalWeeks = Math.round(roiMonths * 4.33); // Convert months to weeks
    
    let milestones: TimelineMilestone[] = [];
    
    switch (difficulty) {
      case 'Easy':
        milestones = [
          { id: '1', title: 'Planning & Setup', description: 'Initial preparation and resource allocation', weekOffset: 0, isCompleted: false, isCurrent: false },
          { id: '2', title: 'Implementation Start', description: 'Begin executing the recommendation', weekOffset: 1, isCompleted: false, isCurrent: false },
          { id: '3', title: 'Completion & Testing', description: 'Finalize implementation and validate results', weekOffset: Math.max(1, totalWeeks - 1), isCompleted: false, isCurrent: false }
        ];
        break;
        
      case 'Medium':
        milestones = [
          { id: '1', title: 'Planning & Research', description: 'Detailed planning and feasibility analysis', weekOffset: 0, isCompleted: false, isCurrent: false },
          { id: '2', title: 'Phase 1: Foundation', description: 'Establish groundwork and initial setup', weekOffset: Math.round(totalWeeks * 0.25), isCompleted: false, isCurrent: false },
          { id: '3', title: 'Phase 2: Implementation', description: 'Core implementation activities', weekOffset: Math.round(totalWeeks * 0.5), isCompleted: false, isCurrent: false },
          { id: '4', title: 'Phase 3: Optimization', description: 'Fine-tuning and optimization', weekOffset: Math.round(totalWeeks * 0.75), isCompleted: false, isCurrent: false },
          { id: '5', title: 'Completion & Validation', description: 'Final testing and performance validation', weekOffset: totalWeeks - 1, isCompleted: false, isCurrent: false }
        ];
        break;
        
      case 'Hard':
        milestones = [
          { id: '1', title: 'Strategic Planning', description: 'Comprehensive planning and stakeholder alignment', weekOffset: 0, isCompleted: false, isCurrent: false },
          { id: '2', title: 'Phase 1: Infrastructure', description: 'Build necessary infrastructure and frameworks', weekOffset: Math.round(totalWeeks * 0.15), isCompleted: false, isCurrent: false },
          { id: '3', title: 'Phase 2: Pilot Implementation', description: 'Small-scale pilot testing and refinement', weekOffset: Math.round(totalWeeks * 0.35), isCompleted: false, isCurrent: false },
          { id: '4', title: 'Phase 3: Full Deployment', description: 'Complete implementation rollout', weekOffset: Math.round(totalWeeks * 0.55), isCompleted: false, isCurrent: false },
          { id: '5', title: 'Phase 4: Integration', description: 'System integration and workflow optimization', weekOffset: Math.round(totalWeeks * 0.75), isCompleted: false, isCurrent: false },
          { id: '6', title: 'Phase 5: Monitoring', description: 'Performance monitoring and adjustments', weekOffset: Math.round(totalWeeks * 0.9), isCompleted: false, isCurrent: false },
          { id: '7', title: 'Completion & Review', description: 'Final validation and impact assessment', weekOffset: totalWeeks - 1, isCompleted: false, isCurrent: false }
        ];
        break;
        
      default:
        milestones = [
          { id: '1', title: 'Planning', description: 'Initial planning phase', weekOffset: 0, isCompleted: false, isCurrent: false },
          { id: '2', title: 'Implementation', description: 'Core implementation work', weekOffset: Math.round(totalWeeks * 0.5), isCompleted: false, isCurrent: false },
          { id: '3', title: 'Completion', description: 'Finalization and validation', weekOffset: totalWeeks - 1, isCompleted: false, isCurrent: false }
        ];
    }
    
    // Calculate current progress based on implementation status and time elapsed
    const now = Date.now();
    const startTime = new Date(implementation.started_at).getTime();
    const weeksElapsed = (now - startTime) / (7 * 24 * 60 * 60 * 1000);
    
    // Mark milestones as completed or current based on progress
    milestones.forEach((milestone, index) => {
      if (implementation.status === 'completed') {
        milestone.isCompleted = true;
      } else if (weeksElapsed >= milestone.weekOffset) {
        milestone.isCompleted = true;
      } else if (index > 0 && weeksElapsed >= milestones[index - 1].weekOffset && weeksElapsed < milestone.weekOffset) {
        milestone.isCurrent = true;
      } else if (index === 0 && weeksElapsed < milestone.weekOffset) {
        milestone.isCurrent = true;
      }
    });
    
    // If no milestone is current and not all are completed, mark the next incomplete as current
    if (!milestones.some(m => m.isCurrent) && !milestones.every(m => m.isCompleted)) {
      const nextIncomplete = milestones.find(m => !m.isCompleted);
      if (nextIncomplete) {
        nextIncomplete.isCurrent = true;
      }
    }
    
    return milestones;
  };

  const timeline = generateTimeline(implementation.difficulty, implementation.roi_months);
  const completedCount = timeline.filter(m => m.isCompleted).length;
  const currentMilestone = timeline.find(m => m.isCurrent);

  if (compact) {
    return (
      <div className={`p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-indigo-900">Timeline Progress</p>
            <p className="text-xs text-indigo-600">
              {completedCount} of {timeline.length} milestones completed
            </p>
          </div>
          <div className="text-right">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-800">
                {Math.round((completedCount / timeline.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
        
        {currentMilestone && (
          <div className="bg-white rounded-lg p-2 border border-indigo-200">
            <p className="text-xs font-medium text-indigo-900">{currentMilestone.title}</p>
            <p className="text-xs text-indigo-600">{currentMilestone.description}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={`border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-100 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-indigo-900">Implementation Timeline</h4>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-indigo-700 bg-white border border-indigo-200">
            {completedCount}/{timeline.length} Milestones
          </span>
        </div>
        <p className="text-sm text-indigo-600 mt-1">
          Auto-generated timeline for {implementation.difficulty} difficulty • {formatMonths(implementation.roi_months)} implementation
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timeline Progress Bar */}
        <div className="bg-white rounded-lg border border-indigo-200 p-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-indigo-600 font-medium">Overall Progress</span>
            <span className="font-bold text-indigo-900">
              {Math.round((completedCount / timeline.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / timeline.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Timeline Milestones */}
        <div className="space-y-3">
          {timeline.map((milestone, index) => (
            <div 
              key={milestone.id}
              className={`relative flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                milestone.isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : milestone.isCurrent 
                    ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' 
                    : 'bg-white border-gray-200'
              }`}
            >
              {/* Timeline connector line */}
              {index < timeline.length - 1 && (
                <div className="absolute left-6 top-10 w-0.5 h-8 bg-gray-300" />
              )}
              
              {/* Milestone icon */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                milestone.isCompleted 
                  ? 'bg-green-500 text-white' 
                  : milestone.isCurrent 
                    ? 'bg-blue-500 text-white animate-pulse' 
                    : 'bg-gray-300 text-gray-600'
              }`}>
                {milestone.isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : milestone.isCurrent ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                )}
              </div>
              
              {/* Milestone content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    milestone.isCompleted 
                      ? 'text-green-900' 
                      : milestone.isCurrent 
                        ? 'text-blue-900' 
                        : 'text-gray-900'
                  }`}>
                    {milestone.title}
                  </p>
                  <span className="text-xs text-gray-500">
                    Week {milestone.weekOffset + 1}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${
                  milestone.isCompleted 
                    ? 'text-green-700' 
                    : milestone.isCurrent 
                      ? 'text-blue-700' 
                      : 'text-gray-600'
                }`}>
                  {milestone.description}
                </p>
                
                {milestone.isCurrent && (
                  <div className="mt-2 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="text-xs text-blue-600 ml-2 font-medium">In Progress</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        {!timeline.every(m => m.isCompleted) && (
          <div className="bg-white rounded-lg border border-indigo-200 p-3">
            <p className="text-sm font-medium text-indigo-900 mb-2">Next Steps</p>
            {currentMilestone ? (
              <div className="space-y-1 text-xs text-indigo-700">
                <p className="flex items-center">
                  <span className="text-blue-500 mr-1">→</span>
                  Focus on: {currentMilestone.title}
                </p>
                <p className="flex items-center">
                  <span className="text-indigo-500 mr-1">📅</span>
                  Target completion: Week {currentMilestone.weekOffset + 1}
                </p>
              </div>
            ) : (
              <p className="text-xs text-indigo-700">All milestones completed! 🎉</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 