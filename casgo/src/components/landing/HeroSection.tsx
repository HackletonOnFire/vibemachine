'use client';

import React from 'react';
import { Button } from '../../components/ui';

const ArrowIcon = React.memo(() => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
));

ArrowIcon.displayName = 'ArrowIcon';

export const HeroSection = React.memo(() => {
  return (
    <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            EcoMind Sustainability
          </h1>
          <p className="text-xl mb-8 text-green-100">
            Transform your business with AI-powered sustainability insights and carbon footprint optimization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" rightIcon={<ArrowIcon />}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection'; 