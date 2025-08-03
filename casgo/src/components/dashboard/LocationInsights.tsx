'use client';

import React from 'react';
import { MapPin, Zap, Leaf, TrendingUp, Globe, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../components/ui';
import { getLocationInsights, formatLocalCurrency, type GlobalRegionalFactors } from '../../lib/global-energy-factors';
import { cn } from '../../lib/utils';

interface LocationInsightsProps {
  location: string;
  className?: string;
}

export const LocationInsights: React.FC<LocationInsightsProps> = ({ location, className }) => {
  const { factors, insights, recommendations } = getLocationInsights(location);

  return (
    <Card className={cn("bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Location Insights</h3>
            <p className="text-sm text-gray-600">{location} • {factors.region}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Regional Factors Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600">Electricity Rate</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatLocalCurrency(factors.electricityRate, factors)}
            </div>
            <div className="text-xs text-gray-500">per kWh</div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600">Grid Cleanliness</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {factors.gridCleanlinessScore}%
            </div>
            <div className="text-xs text-gray-500">{factors.renewablePercentage}% renewable</div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-gray-600">Solar Potential</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {factors.solarPotential.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">kWh/kW/year</div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-gray-600">CO₂ Factor</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {factors.co2EmissionFactor}
            </div>
            <div className="text-xs text-gray-500">kg CO₂/kWh</div>
          </div>
        </div>

        {/* Location-Specific Insights */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              Regional Insights
            </h4>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg p-3 border border-blue-100 text-sm text-gray-700"
                >
                  {insight}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location-Specific Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Location-Specific Recommendations
            </h4>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200 text-sm text-gray-700"
                >
                  {recommendation}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Climate Data */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Climate Characteristics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Heating Degree Days:</span>
              <span className="ml-2 font-medium text-gray-900">{factors.heatingDegreeDays.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Cooling Degree Days:</span>
              <span className="ml-2 font-medium text-gray-900">{factors.coolingDegreeDays.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Data Source Note */}
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-3 h-3" />
            <span className="font-medium">Data Sources</span>
          </div>
          Calculations use region-specific factors from government energy agencies, grid operators, and international databases. 
          Factors are updated regularly to reflect changing grid composition and local policies.
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationInsights; 