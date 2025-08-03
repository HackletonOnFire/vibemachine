'use client';

import React from 'react';

export const Footer = React.memo(() => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; 2025 EcoMind Sustainability. Empowering sustainable business transformation.</p>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer'; 