// Implementation Components Export Barrel

export { ImplementationCard } from './ImplementationCard';
export { ImplementationsList } from './ImplementationsList';
export { ROIMetrics, PortfolioROI } from './ROIMetrics';
export { TimelineCard } from './TimelineCard';
export { ImplementationHistory } from './ImplementationHistory';

// Re-export types and utilities for convenience
export type { 
  Implementation,
  ImplementationStats,
  CreateImplementationRequest,
  UpdateImplementationRequest,
  ROIMetrics as ROIMetricsType,
  PortfolioROI as PortfolioROIType
} from '../../lib/implementation';

export { 
  getStatusColor,
  getStatusLabel,
  formatCurrency,
  formatCo2,
  formatROI,
  formatMonths,
  calculateROIMetrics,
  calculatePortfolioROI,
  getROIStatus,
  implementationApi 
} from '../../lib/implementation'; 