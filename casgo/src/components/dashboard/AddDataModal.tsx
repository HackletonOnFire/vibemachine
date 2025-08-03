'use client';

import React, { useState, useCallback } from 'react';
import { X, Zap, Flame, Droplets, DollarSign, Calendar, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardContent } from '../../../components/ui';
import { cn } from '../../lib/utils';
import { energyOperations } from '../../lib/database';
import type { EnergyDataInsert } from '../../lib/types/database';

interface AddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onDataAdded?: () => void; // Callback to refresh dashboard data
  className?: string;
}

interface EnergyFormData {
  measurement_date: string;
  kwh_usage: string;
  gas_usage_therms: string;
  gas_usage_ccf: string;
  water_usage_gallons: string;
  electricity_cost: string;
  gas_cost: string;
  water_cost: string;
  billing_period_start: string;
  billing_period_end: string;
  facility_name: string;
  meter_id: string;
  notes: string;
}

const initialFormData: EnergyFormData = {
  measurement_date: new Date().toISOString().split('T')[0],
  kwh_usage: '',
  gas_usage_therms: '',
  gas_usage_ccf: '',
  water_usage_gallons: '',
  electricity_cost: '',
  gas_cost: '',
  water_cost: '',
  billing_period_start: '',
  billing_period_end: '',
  facility_name: '',
  meter_id: '',
  notes: ''
};

export const AddDataModal: React.FC<AddDataModalProps> = ({
  isOpen,
  onClose,
  userId,
  onDataAdded,
  className
}) => {
  const [formData, setFormData] = useState<EnergyFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof EnergyFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  }, [error]);

  // Validate form data
  const validateForm = useCallback((): string | null => {
    if (!formData.measurement_date) {
      return 'Please select a month/year for your energy data';
    }

    // At least one energy measurement is required
    const hasEnergyData = formData.kwh_usage || 
                         formData.gas_usage_therms || 
                         formData.gas_usage_ccf || 
                         formData.water_usage_gallons;
    
    if (!hasEnergyData) {
      return 'At least one energy measurement (electricity, gas, or water) is required';
    }

    // Validate numeric fields
    const numericFields = [
      'kwh_usage', 'gas_usage_therms', 'gas_usage_ccf', 'water_usage_gallons',
      'electricity_cost', 'gas_cost', 'water_cost'
    ] as const;

    for (const field of numericFields) {
      const value = formData[field];
      if (value && (isNaN(Number(value)) || Number(value) < 0)) {
        return `${field.replace(/_/g, ' ')} must be a valid positive number`;
      }
    }

    return null;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data for database insertion/update with proper type conversion
      const totalCost = calculateTotalCost();
      
      // For business logic: One comprehensive record per user per month
      // Set measurement_date to first day of the selected month for consistency
      const selectedDate = new Date(formData.measurement_date);
      const monthlyDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const monthlyDateString = monthlyDate.toISOString().split('T')[0];
      
      const energyData: EnergyDataInsert = {
        user_id: userId,
        measurement_date: monthlyDateString, // First day of month for consistency
        reading_type: 'monthly_summary', // Comprehensive monthly data
        kwh_usage: formData.kwh_usage ? Number(formData.kwh_usage) : null,
        gas_usage_therms: formData.gas_usage_therms ? Number(formData.gas_usage_therms) : null,
        gas_usage_ccf: formData.gas_usage_ccf ? Number(formData.gas_usage_ccf) : null,
        water_usage_gallons: formData.water_usage_gallons ? Number(formData.water_usage_gallons) : null,
        electricity_cost: formData.electricity_cost ? Number(formData.electricity_cost) : null,
        gas_cost: formData.gas_cost ? Number(formData.gas_cost) : null,
        water_cost: formData.water_cost ? Number(formData.water_cost) : null,
        total_cost: totalCost ? Number(totalCost) : null,
        billing_period_start: formData.billing_period_start || null,
        billing_period_end: formData.billing_period_end || null,
        facility_name: formData.facility_name || null,
        meter_id: formData.meter_id || null,
        notes: formData.notes || null,
        data_source: 'manual_entry',
        is_estimated: false,
        quality_score: 90, // High quality for manual entry (0-100 scale)
        created_at: new Date().toISOString()
      };

      const result = await energyOperations.upsertEnergyData(energyData);

      if (result.success) {
        setSuccess(true);
        
        // Call the refresh callback to update dashboard charts
        if (onDataAdded) {
          onDataAdded();
        }

        // Auto-close after success feedback
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to save energy data');
      }
    } catch (err) {
      console.error('Error saving energy data:', err);
      setError('An unexpected error occurred while saving data');
    } finally {
      setLoading(false);
    }
  }, [formData, userId, validateForm, onDataAdded]);

  // Calculate total cost
  const calculateTotalCost = useCallback((): number | null => {
    const costs = [
      formData.electricity_cost,
      formData.gas_cost,
      formData.water_cost
    ].filter(Boolean).map(Number);
    
    return costs.length > 0 ? costs.reduce((sum, cost) => sum + cost, 0) : null;
  }, [formData.electricity_cost, formData.gas_cost, formData.water_cost]);

  // Handle modal close
  const handleClose = useCallback(() => {
    setFormData(initialFormData);
    setError(null);
    setSuccess(false);
    setLoading(false);
    onClose();
  }, [onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className={cn(
        'w-full max-w-4xl max-h-[90vh] overflow-hidden',
        'animate-in fade-in-0 zoom-in-95 duration-300',
        className
      )}>
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Add Monthly Energy Data</h2>
                <p className="text-blue-100 text-sm">Add or update monthly energy usage and costs for any month</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {success ? (
            /* Success State */
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Monthly Energy Data Saved!</h3>
              <p className="text-gray-600 mb-4">Your monthly energy data has been saved. If data existed for this month, it has been updated. Charts will refresh automatically.</p>
              <div className="text-sm text-gray-500">This modal will close automatically...</div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Month/Year for Energy Data *</label>
                    <Input
                      type="date"
                      value={formData.measurement_date}
                      onChange={(e) => handleInputChange('measurement_date', e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">Select any date in the month you want to add/update data for</p>
                  </div>
                  <Input
                    label="Facility Name"
                    value={formData.facility_name}
                    onChange={(e) => handleInputChange('facility_name', e.target.value)}
                    placeholder="Main Office, Warehouse A, etc."
                  />
                  <Input
                    label="Meter ID"
                    value={formData.meter_id}
                    onChange={(e) => handleInputChange('meter_id', e.target.value)}
                    placeholder="Meter identification number"
                  />
                </div>
              </div>

              {/* Energy Usage */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-medium text-gray-900">Energy Usage</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <label className="text-sm font-medium text-gray-700">Electricity (kWh)</label>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.kwh_usage}
                      onChange={(e) => handleInputChange('kwh_usage', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <label className="text-sm font-medium text-gray-700">Gas (Therms)</label>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.gas_usage_therms}
                      onChange={(e) => handleInputChange('gas_usage_therms', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <label className="text-sm font-medium text-gray-700">Gas (CCF)</label>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.gas_usage_ccf}
                      onChange={(e) => handleInputChange('gas_usage_ccf', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">Water (Gallons)</label>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.water_usage_gallons}
                      onChange={(e) => handleInputChange('water_usage_gallons', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Costs */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-medium text-gray-900">Costs (Optional)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <label className="text-sm font-medium text-gray-700">Electricity Cost ($)</label>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.electricity_cost}
                      onChange={(e) => handleInputChange('electricity_cost', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <label className="text-sm font-medium text-gray-700">Gas Cost ($)</label>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.gas_cost}
                      onChange={(e) => handleInputChange('gas_cost', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <label className="text-sm font-medium text-gray-700">Water Cost ($)</label>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.water_cost}
                      onChange={(e) => handleInputChange('water_cost', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Total Cost Display */}
                {calculateTotalCost() && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Total Cost:</span>
                      <span className="text-lg font-semibold text-green-900">
                        ${calculateTotalCost()?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Billing Period */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-medium text-gray-900">Billing Period (Optional)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Billing Start Date"
                    type="date"
                    value={formData.billing_period_start}
                    onChange={(e) => handleInputChange('billing_period_start', e.target.value)}
                  />
                  <Input
                    label="Billing End Date"
                    type="date"
                    value={formData.billing_period_end}
                    onChange={(e) => handleInputChange('billing_period_end', e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any additional notes about this reading..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Energy Data'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

AddDataModal.displayName = 'AddDataModal'; 