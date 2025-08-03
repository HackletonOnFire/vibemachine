// Dashboard Components Barrel Exports

export { Dashboard } from './Dashboard';
export { DashboardGrid } from './DashboardGrid';
export { KPICards } from './KPICards';
export { EnergyOverview } from './EnergyOverview';
export { CarbonFootprint } from './CarbonFootprint';
export { ProgressChart } from './ProgressChart';
export { 
  LoadingSkeleton, 
  KPICardSkeleton, 
  ChartSkeleton, 
  DashboardGridSkeleton,
  ErrorState,
  NetworkError,
  DataLoadingError,
  NoDataAvailable,
  TimeoutError,
  PermissionError,
  MaintenanceMode
} from './LoadingStates';
export { AddDataModal } from './AddDataModal';
export { LocationInsights } from './LocationInsights';

// Re-export types
export type { 
  DashboardProps, 
  DashboardSection,
  EnergyData, 
  CarbonFootprintData, 
  SustainabilityGoals, 
  RecommendationData,
  DashboardData 
} from './Dashboard';

// Future components - will be implemented in subsequent tasks

// Placeholder - more components will be implemented in Tasks 3.3-3.7 