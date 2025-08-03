'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { 
  Implementation, 
  ROIMetrics as ROIMetricsType,
  PortfolioROI as PortfolioROIType,
  calculateROIMetrics,
  calculatePortfolioROI,
  getROIStatus,
  formatROI,
  formatCurrency,
  formatCo2,
  formatMonths
} from '../../lib/implementation';

interface ROIMetricsProps {
  implementation: Implementation;
  className?: string;
  compact?: boolean;
}

/**
 * ROIMetrics Component
 * 
 * Displays automatic ROI calculations for individual implementations
 * including current ROI, payback progress, and efficiency metrics.
 */
export const ROIMetrics: React.FC<ROIMetricsProps> = ({
  implementation,
  className = '',
  compact = false
}) => {
  const metrics = calculateROIMetrics(implementation);
  const roiStatus = getROIStatus(metrics.currentROI);

  if (compact) {
    return (
      <div className={`p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Current ROI</p>
            <p className={`text-lg font-bold ${roiStatus.color}`}>
              {formatROI(metrics.currentROI)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-700">Payback Progress</p>
            <p className="text-sm font-medium text-blue-900">
              {metrics.paybackProgress.toFixed(1)}%
            </p>
          </div>
        </div>
        
        {/* Mini Progress Bar */}
        <div className="mt-2">
          <div className="w-full bg-blue-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(metrics.paybackProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-blue-900">ROI Analytics</h4>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roiStatus.color} bg-white border`}>
            {roiStatus.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current ROI */}
        <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium mb-1">Current ROI</p>
          <p className={`text-3xl font-bold ${roiStatus.color}`}>
            {formatROI(metrics.currentROI)}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {formatCurrency(metrics.timeValue)} value generated
          </p>
        </div>

        {/* ROI Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 font-medium">Projected Annual ROI</p>
            <p className="text-lg font-bold text-blue-900">
              {formatROI(metrics.projectedAnnualROI)}
            </p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 font-medium">Efficiency Score</p>
            <p className="text-lg font-bold text-blue-900">
              {metrics.efficiencyScore.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Payback Progress */}
        <div className="bg-white rounded-lg border border-blue-200 p-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-blue-600 font-medium">Payback Progress</span>
            <span className="font-bold text-blue-900">{metrics.paybackProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(metrics.paybackProgress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-blue-600 mt-2">
            <span>Started</span>
            <span>Expected: {formatMonths(implementation.roi_months)}</span>
            <span>Actual: {formatMonths(metrics.actualMonthsToPayback)}</span>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-lg border border-blue-200 p-3">
          <p className="text-sm font-medium text-blue-900 mb-2">Performance Insights</p>
          <div className="space-y-1 text-xs text-blue-700">
            {metrics.efficiencyScore >= 100 && (
              <p className="flex items-center">
                <span className="text-green-500 mr-1">✓</span>
                Ahead of schedule - excellent progress!
              </p>
            )}
            {metrics.efficiencyScore >= 80 && metrics.efficiencyScore < 100 && (
              <p className="flex items-center">
                <span className="text-blue-500 mr-1">→</span>
                On track - meeting expectations
              </p>
            )}
            {metrics.efficiencyScore < 80 && (
              <p className="flex items-center">
                <span className="text-yellow-500 mr-1">⚠</span>
                Behind schedule - consider reviewing progress
              </p>
            )}
            {metrics.currentROI > metrics.projectedAnnualROI * 0.5 && (
              <p className="flex items-center">
                <span className="text-green-500 mr-1">💰</span>
                Strong ROI performance
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PortfolioROIProps {
  implementations: Implementation[];
  className?: string;
  showDetails?: boolean;
}

/**
 * PortfolioROI Component
 * 
 * Displays portfolio-level ROI metrics across all implementations
 */
export const PortfolioROI: React.FC<PortfolioROIProps> = ({
  implementations,
  className = '',
  showDetails = true
}) => {
  const portfolio = calculatePortfolioROI(implementations);
  const roiStatus = getROIStatus(portfolio.portfolioROI);

  if (implementations.length === 0) {
    return (
      <Card className={`border-gray-200 bg-gray-50 ${className}`}>
        <CardContent className="text-center py-6">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-600">No implementations to analyze</p>
          <p className="text-sm text-gray-500 mt-1">Start implementing recommendations to see ROI metrics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-purple-200 bg-gradient-to-br from-purple-50 to-pink-100 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-purple-900">Portfolio ROI</h4>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roiStatus.color} bg-white border`}>
            {roiStatus.label}
          </span>
        </div>
        <p className="text-sm text-purple-600 mt-1">
          Analysis of {implementations.length} implementation{implementations.length !== 1 ? 's' : ''}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Portfolio ROI Display */}
        <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600 font-medium mb-1">Portfolio ROI</p>
          <p className={`text-3xl font-bold ${roiStatus.color}`}>
            {formatROI(portfolio.portfolioROI)}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            {formatCurrency(portfolio.totalCurrentValue)} of {formatCurrency(portfolio.totalProjectedAnnualValue)} annual potential
          </p>
        </div>

        {showDetails && (
          <>
            {/* Investment Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">Total Investment</p>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(portfolio.totalInvestment)}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">Current Value</p>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(portfolio.totalCurrentValue)}
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">Avg Payback</p>
                <p className="text-sm font-bold text-purple-900">
                  {formatMonths(portfolio.averagePaybackMonths)}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">CO₂ Impact</p>
                <p className="text-sm font-bold text-purple-900">
                  {portfolio.totalCO2Impact.toFixed(1)} tons
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">Efficiency</p>
                <p className="text-sm font-bold text-purple-900">
                  {portfolio.implementationEfficiency.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Portfolio Insights */}
            <div className="bg-white rounded-lg border border-purple-200 p-3">
              <p className="text-sm font-medium text-purple-900 mb-2">Portfolio Insights</p>
              <div className="space-y-1 text-xs text-purple-700">
                {portfolio.portfolioROI >= 100 && (
                  <p className="flex items-center">
                    <span className="text-green-500 mr-1">🎯</span>
                    Excellent portfolio performance - ROI above 100%
                  </p>
                )}
                {portfolio.implementationEfficiency >= 80 && (
                  <p className="flex items-center">
                    <span className="text-blue-500 mr-1">⚡</span>
                    High implementation efficiency across portfolio
                  </p>
                )}
                {portfolio.totalCO2Impact >= 10 && (
                  <p className="flex items-center">
                    <span className="text-green-500 mr-1">🌱</span>
                    Significant environmental impact achieved
                  </p>
                )}
                <p className="flex items-center">
                  <span className="text-purple-500 mr-1">📈</span>
                  Projected annual value: {formatCurrency(portfolio.totalProjectedAnnualValue)}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 