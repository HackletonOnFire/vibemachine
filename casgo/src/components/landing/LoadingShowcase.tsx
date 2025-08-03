'use client';

import React from 'react';
import { 
  CircularSpinner,
  PulseDotsSpinner, 
  BouncingBallsSpinner, 
  WaveSpinner, 
  SustainabilitySpinner,
  ProgressBar,
  Skeleton,
  Card,
  Button,
  microInteractions 
} from '../../components/ui';

export const LoadingShowcase = React.memo(() => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Loading Components & Micro-interactions</h2>
          <p className="text-lg text-gray-600">Modern loading states and smooth micro-interactions</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="space-y-12">
            
            {/* Loading Spinners */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Loading Spinners</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                <Card className="p-6 flex flex-col items-center">
                  <h4 className="text-sm font-medium mb-4 text-gray-700">Circular</h4>
                  <CircularSpinner size="lg" text="Loading..." />
                </Card>
                
                <Card className="p-6 flex flex-col items-center">
                  <h4 className="text-sm font-medium mb-4 text-gray-700">Pulse Dots</h4>
                  <PulseDotsSpinner size="lg" />
                </Card>
                
                <Card className="p-6 flex flex-col items-center">
                  <h4 className="text-sm font-medium mb-4 text-gray-700">Bouncing</h4>
                  <BouncingBallsSpinner size="lg" />
                </Card>
                
                <Card className="p-6 flex flex-col items-center">
                  <h4 className="text-sm font-medium mb-4 text-gray-700">Wave</h4>
                  <WaveSpinner size="lg" />
                </Card>
                
                <Card className="p-6 flex flex-col items-center">
                  <h4 className="text-sm font-medium mb-4 text-gray-700">Sustainability</h4>
                  <SustainabilitySpinner size="lg" text="Loading..." />
                </Card>
              </div>
            </div>

            {/* Progress Bars */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Progress Indicators</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h4 className="text-sm font-medium mb-4 text-gray-700">Default Progress</h4>
                  <ProgressBar value={75} showPercentage={true} />
                </Card>
                
                <Card className="p-6">
                  <h4 className="text-sm font-medium mb-4 text-gray-700">Success Progress</h4>
                  <ProgressBar value={90} variant="success" showPercentage={true} />
                </Card>
                
                <Card className="p-6">
                  <h4 className="text-sm font-medium mb-4 text-gray-700">Warning Progress</h4>
                  <ProgressBar value={45} variant="warning" showPercentage={true} />
                </Card>
                
                <Card className="p-6">
                  <h4 className="text-sm font-medium mb-4 text-gray-700">Error Progress</h4>
                  <ProgressBar value={25} variant="error" showPercentage={true} />
                </Card>
              </div>
            </div>

            {/* Skeleton Loaders */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Skeleton Loaders</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h4 className="text-sm font-medium mb-4 text-gray-700">Card Skeleton</h4>
                  <div className="space-y-3">
                    <Skeleton height="60px" rounded="lg" />
                    <Skeleton height="20px" width="80%" />
                    <Skeleton height="16px" width="60%" />
                    <div className="flex space-x-2">
                      <Skeleton height="32px" width="80px" rounded="md" />
                      <Skeleton height="32px" width="80px" rounded="md" />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h4 className="text-sm font-medium mb-4 text-gray-700">Profile Skeleton</h4>
                  <div className="flex items-center space-x-4">
                    <Skeleton width="64px" height="64px" rounded="full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton height="20px" width="70%" />
                      <Skeleton height="16px" width="50%" />
                      <Skeleton height="14px" width="40%" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Micro-interactions */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Micro-interactions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Button className={microInteractions.hoverScale} variant="primary">
                  Hover Scale
                </Button>
                
                <Button className="hover-lift" variant="secondary">
                  Hover Lift
                </Button>
                
                <Button className="hover-glow" variant="primary">
                  Hover Glow
                </Button>
                
                <Button className="press-scale" variant="secondary">
                  Press Effect
                </Button>
              </div>
            </div>

            {/* Animations */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Custom Animations</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="p-4 animate-float">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm">Float</p>
                  </div>
                </Card>
                
                <Card className="p-4 animate-breathe">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-secondary-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm">Breathe</p>
                  </div>
                </Card>
                
                <Card className="p-4 animate-glow">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm">Glow</p>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-sustainability rounded-full mx-auto mb-2"></div>
                    <p className="text-sm gradient-text">Gradient</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

LoadingShowcase.displayName = 'LoadingShowcase'; 