'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Spinner } from '../components/ui';
import { HeroSection, Footer } from '../components/landing';

// Dynamic imports for code splitting and better performance
const ComponentShowcase = dynamic(
  () => import('../components/landing').then(mod => ({ default: mod.ComponentShowcase })),
  {
    ssr: false,
    loading: () => (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
);

const LoadingShowcase = dynamic(
  () => import('../components/landing').then(mod => ({ default: mod.LoadingShowcase })),
  {
    ssr: false,
    loading: () => (
      <div className="py-16 bg-gray-50 flex justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section - loaded immediately */}
      <HeroSection />

      {/* Component Showcase - lazy loaded */}
      <Suspense fallback={
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      }>
        <ComponentShowcase />
      </Suspense>

      {/* Loading Showcase - lazy loaded */}
      <Suspense fallback={
        <div className="py-16 bg-gray-50 flex justify-center">
          <Spinner size="lg" />
        </div>
      }>
        <LoadingShowcase />
      </Suspense>

      {/* Footer - loaded immediately */}
      <Footer />
    </main>
  );
}
