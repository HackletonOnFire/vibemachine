// UI Components Barrel Exports
export { Button, ButtonGroup, buttonVariants, type ButtonProps } from './Button';
export { Input, Textarea, inputVariants, type InputProps, type TextareaProps } from './Input';
export { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardGrid,
  cardVariants, 
  cardHeaderVariants, 
  cardFooterVariants, 
  cardContentVariants,
  type CardProps,
  type CardHeaderProps,
  type CardContentProps,
  type CardFooterProps
} from './Card';
export { 
  Chart, 
  chartVariants, 
  SUSTAINABILITY_COLORS, 
  DEFAULT_COLORS,
  SustainabilityChartPresets,
  formatChartData,
  type ChartProps,
  type BaseChartProps,
  type LineChartProps,
  type AreaChartProps,
  type BarChartProps,
  type PieChartProps,
  type ChartDataPoint,
  type ChartSeries
} from './Chart';
export {
  Spinner,
  CircularSpinner,
  PulseDotsSpinner,
  BouncingBallsSpinner,
  WaveSpinner,
  SustainabilitySpinner,
  LoadingOverlay,
  ProgressBar,
  Skeleton,
  spinnerVariants,
  overlayVariants,
  microInteractions,
  type SpinnerProps,
  type LoadingOverlayProps,
  type ProgressBarProps,
  type SkeletonProps
} from './LoadingSpinner';

// Theme Components  
export { default as ThemeToggle, useThemeDetection } from './ThemeToggle';

// Future UI component exports will be added here: 