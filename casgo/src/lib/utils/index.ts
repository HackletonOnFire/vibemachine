// Utility Functions Barrel Exports

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with proper Tailwind CSS class merging
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Report Generation Utilities
export { 
  ReportGenerator, 
  generateMonthlyReport, 
  generateCustomReport 
} from './reportGenerator';
export type { ReportTemplate, ReportData, ReportSection } from './reportGenerator';

// export { calculateCarbonFootprint } from './calculations';
// export { calculateROI } from './calculations';
// export { formatCurrency } from './formatting';
// export { validateEmail } from './validation';

// Placeholder - utilities will be implemented in Task 7.0 