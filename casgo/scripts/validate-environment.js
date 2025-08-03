#!/usr/bin/env node

/**
 * Environment Validation Script
 * Checks that all required environment variables are properly configured
 */

require('dotenv').config();

const requiredEnvVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    validation: (value) => {
      if (!value) return 'Missing';
      if (value === 'your_supabase_project_url') return 'Using placeholder value';
      if (!value.includes('supabase.co')) return 'Invalid format (should be https://xxx.supabase.co)';
      return null;
    }
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
    validation: (value) => {
      if (!value) return 'Missing';
      if (value === 'your_supabase_anon_key') return 'Using placeholder value';
      if (value.length < 100) return 'Too short (anon key should be ~100+ characters)';
      return null;
    }
  }
];

const optionalEnvVars = [
  'AZURE_OPENAI_API_KEY',
  'AZURE_OPENAI_ENDPOINT',
  'AZURE_OPENAI_DEPLOYMENT_NAME',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('🔍 Environment Validation Report\n');

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('📋 Required Environment Variables:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar.name];
  const error = envVar.validation(value);
  
  if (error) {
    console.log(`❌ ${envVar.name}: ${error}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${envVar.name}: Configured correctly`);
  }
});

// Check optional variables
console.log('\n🔧 Optional Environment Variables:');
optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  
  if (value) {
    console.log(`✅ ${envVar}: Set`);
  } else {
    console.log(`⚠️  ${envVar}: Not set (optional)`);
    hasWarnings = true;
  }
});

// Summary
console.log('\n📊 Summary:');
if (hasErrors) {
  console.log('❌ Environment configuration has ERRORS that must be fixed!');
  console.log('\n🔧 Fix Instructions:');
  console.log('1. Go to your Supabase dashboard (https://supabase.com)');
  console.log('2. Navigate to: Settings > API');
  console.log('3. Copy your "Project URL" and "anon public" key');
  console.log('4. Update your .env.local file in the /casgo folder');
  console.log('5. Restart your development server: npm run dev:all');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Environment configuration is functional but has optional items missing');
  console.log('✅ Core functionality should work correctly');
  process.exit(0);
} else {
  console.log('✅ All environment variables are properly configured!');
  process.exit(0);
} 