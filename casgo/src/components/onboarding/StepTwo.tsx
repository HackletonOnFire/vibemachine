'use client';

import React, { useState, useCallback } from 'react';
import { Zap, Upload, FileText, Calendar, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../lib/utils';

interface StepTwoProps {
  onComplete: (data: EnergyUsageData) => void;
  onPrevious?: () => void;
  initialData?: Partial<EnergyUsageData>;
  className?: string;
}

export interface EnergyUsageData {
  // Manual input data
  kwh_usage?: number;
  gas_usage_therms?: number;
  gas_usage_ccf?: number;
  water_usage_gallons?: number;
  
  // Billing period for context
  billing_period_start?: string;
  billing_period_end?: string;
  
  // CSV upload data
  csv_file?: File;
  data_source: 'manual' | 'csv_upload';
  
  // Cost information (optional)
  electricity_cost?: number;
  gas_cost?: number;
  water_cost?: number;
}

// Form validation function
const validateForm = (data: Partial<EnergyUsageData>) => {
  const errors: Record<string, string> = {};

  if (data.data_source === 'manual') {
    // At least one energy type is required for manual entry
    const hasEnergyData = data.kwh_usage || data.gas_usage_therms || data.gas_usage_ccf || data.water_usage_gallons;
    
    if (!hasEnergyData) {
      errors.general = 'Please enter at least one type of energy usage';
    }

    // Validate individual fields if provided
    if (data.kwh_usage !== undefined && data.kwh_usage < 0) {
      errors.kwh_usage = 'Electricity usage cannot be negative';
    }
    
    if (data.gas_usage_therms !== undefined && data.gas_usage_therms < 0) {
      errors.gas_usage_therms = 'Gas usage cannot be negative';
    }
    
    if (data.gas_usage_ccf !== undefined && data.gas_usage_ccf < 0) {
      errors.gas_usage_ccf = 'Gas usage cannot be negative';
    }
    
    if (data.water_usage_gallons !== undefined && data.water_usage_gallons < 0) {
      errors.water_usage_gallons = 'Water usage cannot be negative';
    }

    // Validate costs if provided
    if (data.electricity_cost !== undefined && data.electricity_cost < 0) {
      errors.electricity_cost = 'Cost cannot be negative';
    }
    
    if (data.gas_cost !== undefined && data.gas_cost < 0) {
      errors.gas_cost = 'Cost cannot be negative';
    }
    
    if (data.water_cost !== undefined && data.water_cost < 0) {
      errors.water_cost = 'Cost cannot be negative';
    }
  } else if (data.data_source === 'csv_upload') {
    if (!data.csv_file) {
      errors.csv_file = 'Please select a CSV file to upload';
    }
  }

  return errors;
};

// CSV Upload Component
interface CSVUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error?: string;
}

const CSVUpload: React.FC<CSVUploadProps> = ({ onFileSelect, selectedFile, error }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      onFileSelect(csvFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          isDragOver
            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
            : error
            ? "border-red-300 bg-red-50 dark:bg-red-900/20"
            : "border-slate-300 hover:border-slate-400 dark:border-slate-600"
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            selectedFile 
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" 
              : "bg-slate-100 text-slate-400 dark:bg-slate-700"
          )}>
            {selectedFile ? <CheckCircle className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
          </div>
          
          {selectedFile ? (
            <div className="text-center">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                File selected: {selectedFile.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                Drop your CSV file here, or click to browse
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Supports utility bills in CSV format
              </p>
            </div>
          )}
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            {selectedFile ? 'Change File' : 'Select File'}
          </label>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {/* CSV Format Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          CSV Format Guide
        </h4>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <p>Your CSV should include columns for:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><code>date</code> - billing period date</li>
            <li><code>kwh</code> - electricity usage in kWh</li>
            <li><code>therms</code> - gas usage in therms</li>
            <li><code>gallons</code> - water usage in gallons</li>
            <li><code>cost</code> - total cost (optional)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default function StepTwo({ onComplete, onPrevious, initialData, className }: StepTwoProps) {
  const [inputMethod, setInputMethod] = useState<'manual' | 'csv'>('manual');
  const [formData, setFormData] = useState<Partial<EnergyUsageData>>({
    data_source: 'manual',
    kwh_usage: undefined,
    gas_usage_therms: undefined,
    gas_usage_ccf: undefined,
    water_usage_gallons: undefined,
    electricity_cost: undefined,
    gas_cost: undefined,
    water_cost: undefined,
    billing_period_start: '',
    billing_period_end: '',
    csv_file: undefined,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof EnergyUsageData, value: string | number | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      data_source: inputMethod === 'csv' ? 'csv_upload' : 'manual',
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleMethodChange = (method: 'manual' | 'csv') => {
    setInputMethod(method);
    setFormData(prev => ({
      ...prev,
      data_source: method === 'csv' ? 'csv_upload' : 'manual',
    }));
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // Clean data for submission
    const cleanData: EnergyUsageData = {
      data_source: formData.data_source!,
      ...(formData.kwh_usage && { kwh_usage: formData.kwh_usage }),
      ...(formData.gas_usage_therms && { gas_usage_therms: formData.gas_usage_therms }),
      ...(formData.gas_usage_ccf && { gas_usage_ccf: formData.gas_usage_ccf }),
      ...(formData.water_usage_gallons && { water_usage_gallons: formData.water_usage_gallons }),
      ...(formData.electricity_cost && { electricity_cost: formData.electricity_cost }),
      ...(formData.gas_cost && { gas_cost: formData.gas_cost }),
      ...(formData.water_cost && { water_cost: formData.water_cost }),
      ...(formData.billing_period_start && { billing_period_start: formData.billing_period_start }),
      ...(formData.billing_period_end && { billing_period_end: formData.billing_period_end }),
      ...(formData.csv_file && { csv_file: formData.csv_file }),
    };

    // Simulate form submission delay
    setTimeout(() => {
      onComplete(cleanData);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Share your energy consumption
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Help us understand your current usage to provide better recommendations
        </p>
      </div>

      {/* Input Method Selection */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
        <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
          How would you like to provide your energy data?
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleMethodChange('manual')}
            className={cn(
              "p-4 rounded-xl border-2 transition-all duration-200 text-left",
              inputMethod === 'manual'
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-600"
            )}
          >
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-emerald-600" />
              <div>
                <h5 className="font-medium text-slate-800 dark:text-slate-200">Manual Entry</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Enter your usage numbers directly
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleMethodChange('csv')}
            className={cn(
              "p-4 rounded-xl border-2 transition-all duration-200 text-left",
              inputMethod === 'csv'
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-600"
            )}
          >
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6 text-emerald-600" />
              <div>
                <h5 className="font-medium text-slate-800 dark:text-slate-200">CSV Upload</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload your utility bill data
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Manual Input Form */}
      {inputMethod === 'manual' && (
        <div className="bg-white dark:bg-slate-800/30 rounded-xl p-6 space-y-6 border border-slate-200 dark:border-slate-700">
          <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
            Enter Your Usage Data
          </h4>

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.general}
              </p>
            </div>
          )}

          {/* Billing Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Billing Period Start"
              type="date"
              value={formData.billing_period_start || ''}
              onChange={(e) => handleInputChange('billing_period_start', e.target.value)}
              className="bg-white dark:bg-slate-700"
            />
            <Input
              label="Billing Period End"
              type="date"
              value={formData.billing_period_end || ''}
              onChange={(e) => handleInputChange('billing_period_end', e.target.value)}
              className="bg-white dark:bg-slate-700"
            />
          </div>

          {/* Energy Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Electricity Usage (kWh)"
              type="number"
              value={formData.kwh_usage || ''}
              onChange={(e) => handleInputChange('kwh_usage', parseFloat(e.target.value) || undefined)}
              error={errors.kwh_usage}
              placeholder="1200"
              min="0"
              step="0.01"
              className="bg-white dark:bg-slate-700"
            />

            <Input
              label="Gas Usage (Therms)"
              type="number"
              value={formData.gas_usage_therms || ''}
              onChange={(e) => handleInputChange('gas_usage_therms', parseFloat(e.target.value) || undefined)}
              error={errors.gas_usage_therms}
              placeholder="85"
              min="0"
              step="0.01"
              className="bg-white dark:bg-slate-700"
            />

            <Input
              label="Gas Usage (CCF)"
              type="number"
              value={formData.gas_usage_ccf || ''}
              onChange={(e) => handleInputChange('gas_usage_ccf', parseFloat(e.target.value) || undefined)}
              error={errors.gas_usage_ccf}
              placeholder="85"
              min="0"
              step="0.01"
              className="bg-white dark:bg-slate-700"
            />

            <Input
              label="Water Usage (Gallons)"
              type="number"
              value={formData.water_usage_gallons || ''}
              onChange={(e) => handleInputChange('water_usage_gallons', parseFloat(e.target.value) || undefined)}
              error={errors.water_usage_gallons}
              placeholder="3000"
              min="0"
              step="0.01"
              className="bg-white dark:bg-slate-700"
            />
          </div>

          {/* Cost Information (Optional) */}
          <div className="border-t border-slate-200 dark:border-slate-600 pt-6">
            <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-4">
              Cost Information (Optional)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Electricity Cost ($)"
                type="number"
                value={formData.electricity_cost || ''}
                onChange={(e) => handleInputChange('electricity_cost', parseFloat(e.target.value) || undefined)}
                error={errors.electricity_cost}
                placeholder="150.00"
                min="0"
                step="0.01"
                className="bg-white dark:bg-slate-700"
              />

              <Input
                label="Gas Cost ($)"
                type="number"
                value={formData.gas_cost || ''}
                onChange={(e) => handleInputChange('gas_cost', parseFloat(e.target.value) || undefined)}
                error={errors.gas_cost}
                placeholder="75.00"
                min="0"
                step="0.01"
                className="bg-white dark:bg-slate-700"
              />

              <Input
                label="Water Cost ($)"
                type="number"
                value={formData.water_cost || ''}
                onChange={(e) => handleInputChange('water_cost', parseFloat(e.target.value) || undefined)}
                error={errors.water_cost}
                placeholder="45.00"
                min="0"
                step="0.01"
                className="bg-white dark:bg-slate-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Form */}
      {inputMethod === 'csv' && (
        <div className="bg-white dark:bg-slate-800/30 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
            Upload Your Energy Data
          </h4>
          
          <CSVUpload
            onFileSelect={(file) => handleInputChange('csv_file', file)}
            selectedFile={formData.csv_file || null}
            error={errors.csv_file}
          />
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-4 pt-6">
        {onPrevious && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="flex-1"
          >
            Previous
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            'Continue to Goals'
          )}
        </Button>
      </div>
    </form>
  );
} 