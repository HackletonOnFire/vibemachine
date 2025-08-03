'use client';

import React, { useMemo } from 'react';
import { 
  Button, 
  Input, 
  Textarea, 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardGrid, 
  Chart, 
  SustainabilityChartPresets 
} from '../../components/ui';

// Memoized icons to prevent re-renders
const PlusIcon = React.memo(() => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
));

const ArrowIcon = React.memo(() => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
));

const SearchIcon = React.memo(() => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
));

const EmailIcon = React.memo(() => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
));

PlusIcon.displayName = 'PlusIcon';
ArrowIcon.displayName = 'ArrowIcon';
SearchIcon.displayName = 'SearchIcon';
EmailIcon.displayName = 'EmailIcon';

export const ComponentShowcase = React.memo(() => {
  // Memoize chart data to prevent recalculation
  const chartData = useMemo(() => ({
    energyData: [
      { month: 'Jan', electricity: 1200, gas: 85, target: 1100 },
      { month: 'Feb', electricity: 1100, gas: 78, target: 1100 },
      { month: 'Mar', electricity: 1000, gas: 70, target: 1100 },
      { month: 'Apr', electricity: 950, gas: 65, target: 1100 },
      { month: 'May', electricity: 900, gas: 60, target: 1100 },
      { month: 'Jun', electricity: 850, gas: 55, target: 1100 },
    ],
    emissionsData: [
      { source: 'Electricity', value: 45, color: '#ef4444' },
      { source: 'Natural Gas', value: 25, color: '#f59e0b' },
      { source: 'Transportation', value: 20, color: '#22c55e' },
      { source: 'Other', value: 10, color: '#06b6d4' },
    ],
    goalProgressData: [
      { metric: 'Energy Reduction', actual: 65, target: 100 },
      { metric: 'Renewable Energy', actual: 40, target: 80 },
      { metric: 'Waste Reduction', actual: 75, target: 90 },
      { metric: 'Water Conservation', actual: 50, target: 70 },
    ],
  }), []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Design System Showcase
          </h2>

          {/* Button Variants */}
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="error">Error</Button>
                <Button variant="link">Link Style</Button>
              </div>
            </div>

            {/* Input Components */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Input Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input 
                    label="Name" 
                    placeholder="Enter your name"
                    helperText="This will be used for personalization"
                  />
                  <Input 
                    label="Email" 
                    type="email"
                    leftIcon={<EmailIcon />}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <Input 
                    label="Search"
                    leftIcon={<SearchIcon />}
                    placeholder="Search sustainability goals..."
                  />
                  <Textarea 
                    label="Sustainability Goals"
                    placeholder="Describe your organization's sustainability objectives..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Card Components */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Card Components</h3>
              <CardGrid columns={2} gap="lg">
                <Card variant="elevated" size="lg">
                  <CardHeader 
                    title="Energy Usage Report" 
                    subtitle="Last 30 days"
                    actions={<Button size="sm" variant="ghost">View All</Button>}
                  />
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Electricity:</span>
                        <span className="font-semibold">1,245 kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Natural Gas:</span>
                        <span className="font-semibold">89 therms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CO2 Emissions:</span>
                        <span className="font-semibold text-primary-600">2.1 tons</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="primary" size="sm">
                      Download Report
                    </Button>
                    <Button variant="outline" size="sm">
                      Set Goals
                    </Button>
                  </CardFooter>
                </Card>

                <Card variant="primary" size="lg">
                  <CardHeader 
                    title="Sustainability Goals" 
                    subtitle="Progress overview"
                  />
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-green-700">Reduce emissions by 25%</span>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" size="sm" leftIcon={<PlusIcon />}>
                      Add Goal
                    </Button>
                  </CardFooter>
                </Card>
              </CardGrid>
            </div>

            {/* Chart Components */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Chart Components</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Chart
                  type="line"
                  data={chartData.energyData}
                  series={[
                    { dataKey: 'electricity', name: 'Electricity (kWh)', color: '#22c55e' },
                    { dataKey: 'gas', name: 'Natural Gas (therms)', color: '#06b6d4' }
                  ]}
                  xAxisKey="month"
                  title="Energy Usage Trend"
                  subtitle="Last 6 months"
                  variant="elevated"
                  size="md"
                  showPoints={true}
                  curve="monotone"
                />

                <Chart
                  type="pie"
                  data={chartData.emissionsData}
                  series={[]}
                  valueKey="value"
                  labelKey="source"
                  title="Emissions by Source"
                  subtitle="Carbon footprint breakdown"
                  variant="primary"
                  size="md"
                  showLabels={false}
                  innerRadius={60}
                />
              </div>
            </div>

            {/* Sustainability Actions */}
            <div className="bg-primary-50 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-6 text-primary-900">
                Sustainability Actions
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="success" leftIcon={<PlusIcon />} fullWidth>
                  Add Green Goal
                </Button>
                <Button variant="primary" rightIcon={<ArrowIcon />} fullWidth>
                  View Dashboard
                </Button>
                <Button variant="outline" fullWidth>
                  Upload CSV Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ComponentShowcase.displayName = 'ComponentShowcase'; 