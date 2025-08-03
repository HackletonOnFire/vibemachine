'use client';

import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Globe, Users, DollarSign, Briefcase, Sparkles } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../lib/utils';
import type { IndustryType, CompanySize } from '../../lib/types/database';

interface StepOneProps {
  onComplete: (data: BusinessBasicsData) => void;
  onPrevious?: () => void;
  initialData?: Partial<BusinessBasicsData>;
  className?: string;
}

export interface BusinessBasicsData {
  business_name: string;
  industry: IndustryType;
  company_size: CompanySize;
  location: string;
  website?: string;
  annual_revenue?: number;
  number_of_employees?: number;
  facilities_count?: number;
}

// Industry options from database enum
const INDUSTRY_OPTIONS: { value: IndustryType; label: string }[] = [
  { value: 'technology', label: 'Technology' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'retail', label: 'Retail' },
  { value: 'education', label: 'Education' },
  { value: 'energy', label: 'Energy' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'construction', label: 'Construction' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'other', label: 'Other' },
];

// Company size options from database enum
const COMPANY_SIZE_OPTIONS: { value: CompanySize; label: string; description: string }[] = [
  { value: 'startup', label: 'Startup', description: '1-10 employees' },
  { value: 'small', label: 'Small Business', description: '11-50 employees' },
  { value: 'medium', label: 'Medium Business', description: '51-200 employees' },
  { value: 'large', label: 'Large Business', description: '201-1000 employees' },
  { value: 'enterprise', label: 'Enterprise', description: '1000+ employees' },
];

// Form validation function
const validateForm = (data: Partial<BusinessBasicsData>) => {
  const errors: Record<string, string> = {};

  // Required fields validation
  if (!data.business_name?.trim()) {
    errors.business_name = 'Business name is required';
  } else if (data.business_name.trim().length < 2) {
    errors.business_name = 'Business name must be at least 2 characters';
  }

  if (!data.industry) {
    errors.industry = 'Please select your industry';
  }

  if (!data.company_size) {
    errors.company_size = 'Please select your company size';
  }

  if (!data.location?.trim()) {
    errors.location = 'Location is required';
  } else if (data.location.trim().length < 2) {
    errors.location = 'Location must be at least 2 characters';
  }

  // Optional field validation
  if (data.website && data.website.trim()) {
    const urlPattern = /^https?:\/\/.+\..+/;
    if (!urlPattern.test(data.website)) {
      errors.website = 'Please enter a valid website URL (e.g., https://example.com)';
    }
  }

  if (data.annual_revenue !== undefined && data.annual_revenue < 0) {
    errors.annual_revenue = 'Annual revenue cannot be negative';
  }

  if (data.number_of_employees !== undefined && data.number_of_employees < 1) {
    errors.number_of_employees = 'Number of employees must be at least 1';
  }

  if (data.facilities_count !== undefined && data.facilities_count < 1) {
    errors.facilities_count = 'Number of facilities must be at least 1';
  }

  return errors;
};

// Select component for dropdowns
interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  error?: string;
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  required,
  placeholder,
  icon,
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-3 text-sm transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon ? "pl-10" : "pl-3",
            error
              ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
              : "border-slate-300 text-slate-900 hover:border-slate-400"
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.description && ` (${option.description})`}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default function StepOne({ onComplete, onPrevious, initialData, className }: StepOneProps) {
  const [formData, setFormData] = useState<Partial<BusinessBasicsData>>({
    business_name: '',
    industry: undefined,
    company_size: undefined,
    location: '',
    website: '',
    annual_revenue: undefined,
    number_of_employees: undefined,
    facilities_count: 1,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when initial data changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleInputChange = (field: keyof BusinessBasicsData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
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
    const cleanData: BusinessBasicsData = {
      business_name: formData.business_name!.trim(),
      industry: formData.industry!,
      company_size: formData.company_size!,
      location: formData.location!.trim(),
      ...(formData.website?.trim() && { website: formData.website.trim() }),
      ...(formData.annual_revenue && { annual_revenue: formData.annual_revenue }),
      ...(formData.number_of_employees && { number_of_employees: formData.number_of_employees }),
      ...(formData.facilities_count && { facilities_count: formData.facilities_count }),
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
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Tell us about your business
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          We'll use this information to personalize your sustainability journey
        </p>
      </div>

      {/* Enhanced Required Fields */}
      <div className="relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-700/30 rounded-2xl p-8 space-y-8 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Basic Information
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tell us about your company to get started
            </p>
          </div>
        </div>

        {/* Business Name - Featured with floating label */}
        <div className="relative group">
          <Input
            label="Business Name"
            value={formData.business_name || ''}
            onChange={(e) => handleInputChange('business_name', e.target.value)}
            error={errors.business_name}
            placeholder=""
            required
            floating
            leftIcon={<Building2 className="w-5 h-5" />}
            className="text-lg font-medium"
            helperText="This will appear on your sustainability reports and certificates"
          />
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-0 group-hover:opacity-10 transition duration-300 -z-10"></div>
        </div>

        {/* Industry and Company Size - Enhanced Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative group">
            <Select
              label="Industry"
              value={formData.industry || ''}
              onChange={(value) => handleInputChange('industry', value)}
              options={INDUSTRY_OPTIONS}
              error={errors.industry}
              placeholder="Select your industry"
              required
              icon={<Briefcase className="w-5 h-5" />}
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-10 transition duration-300 -z-10"></div>
          </div>

          <div className="relative group">
            <Select
              label="Company Size"
              value={formData.company_size || ''}
              onChange={(value) => handleInputChange('company_size', value)}
              options={COMPANY_SIZE_OPTIONS}
              error={errors.company_size}
              placeholder="Select your company size"
              required
              icon={<Users className="w-5 h-5" />}
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition duration-300 -z-10"></div>
          </div>
        </div>

        {/* Location - Enhanced with floating label */}
        <div className="relative group">
          <Input
            label="Location"
            value={formData.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            error={errors.location}
            placeholder="City, State, Country"
            required
            floating
            leftIcon={<MapPin className="w-5 h-5" />}
            className="text-base"
            helperText="We'll use this for region-specific sustainability regulations and incentives"
          />
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-10 transition duration-300 -z-10"></div>
        </div>
      </div>

      {/* Enhanced Optional Fields */}
      <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/30 dark:to-slate-700/20 rounded-2xl p-8 space-y-8 border border-slate-200/80 dark:border-slate-700/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Additional Details
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Help us provide more personalized recommendations (optional)
            </p>
          </div>
        </div>

        {/* Website - Enhanced with floating label */}
        <div className="relative group">
          <Input
            label="Website"
            value={formData.website || ''}
            onChange={(e) => handleInputChange('website', e.target.value)}
            error={errors.website}
            placeholder="https://yourcompany.com"
            floating
            leftIcon={<Globe className="w-5 h-5" />}
            className="text-base"
            helperText="We'll analyze your current sustainability messaging and initiatives"
          />
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition duration-300 -z-10"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Annual Revenue - Enhanced */}
          <div className="relative group">
            <Input
              label="Annual Revenue (USD)"
              type="number"
              value={formData.annual_revenue || ''}
              onChange={(e) => handleInputChange('annual_revenue', parseInt(e.target.value) || undefined)}
              error={errors.annual_revenue}
              placeholder="1,000,000"
              min="0"
              floating
              leftIcon={<DollarSign className="w-5 h-5" />}
              className="text-base"
              helperText="Helps us scale recommendations to your budget"
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-10 transition duration-300 -z-10"></div>
          </div>

          {/* Number of Employees - Enhanced */}
          <div className="relative group">
            <Input
              label="Number of Employees"
              type="number"
              value={formData.number_of_employees || ''}
              onChange={(e) => handleInputChange('number_of_employees', parseInt(e.target.value) || undefined)}
              error={errors.number_of_employees}
              placeholder="50"
              min="1"
              floating
              leftIcon={<Users className="w-5 h-5" />}
              className="text-base"
              helperText="For employee engagement initiatives"
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-10 transition duration-300 -z-10"></div>
          </div>
        </div>

        {/* Facilities Count - Enhanced */}
        <div className="relative group">
          <Input
            label="Number of Facilities"
            type="number"
            value={formData.facilities_count || 1}
            onChange={(e) => handleInputChange('facilities_count', parseInt(e.target.value) || 1)}
            error={errors.facilities_count}
            placeholder="1"
            min="1"
            floating
            leftIcon={<Building2 className="w-5 h-5" />}
            className="text-base"
            helperText="Include all office locations, warehouses, and manufacturing sites"
          />
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl opacity-0 group-hover:opacity-10 transition duration-300 -z-10"></div>
        </div>
      </div>

      {/* Enhanced Form Actions */}
      <div className="flex gap-6 pt-8">
        {onPrevious && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}
            size="lg"
            className="flex-1 group relative overflow-hidden border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 transition-all duration-300"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            <span className="relative z-10">Previous Step</span>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="flex-1 group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          rightIcon={
            !isSubmitting && (
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )
          }
        >
          {isSubmitting ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving your information...</span>
            </div>
          ) : (
            <span className="relative z-10">Continue to Energy Usage</span>
          )}
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        </Button>
      </div>
    </form>
  );
} 