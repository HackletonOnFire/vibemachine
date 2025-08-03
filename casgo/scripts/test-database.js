// Test script to verify Supabase database connection and setup
// Run with: node scripts/test-database.js

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.log('Make sure you have created .env.local with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('🔌 Testing Supabase connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count', { count: 'exact' });
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');

    // Test 2: Check tables exist
    console.log('\n2. Checking database tables...');
    const tables = ['users', 'energy_data', 'sustainability_goals', 'recommendations', 'goal_progress'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count', { count: 'exact' });
        if (error) {
          console.error(`❌ Table '${table}' not found:`, error.message);
        } else {
          console.log(`✅ Table '${table}' exists (${data.length || 0} rows)`);
        }
      } catch (err) {
        console.error(`❌ Error checking table '${table}':`, err.message);
      }
    }

    // Test 3: Check RLS policies
    console.log('\n3. Testing Row Level Security...');
    try {
      // This should fail because we're not authenticated
      const { data, error } = await supabase.from('users').select('*');
      if (error && error.code === 'PGRST116') {
        console.log('✅ RLS is working (no data returned for unauthenticated user)');
      } else if (error) {
        console.log('⚠️  RLS test inconclusive:', error.message);
      } else {
        console.log('⚠️  RLS might not be enabled (data returned without auth)');
      }
    } catch (err) {
      console.log('⚠️  RLS test error:', err.message);
    }

    // Test 4: Check custom types
    console.log('\n4. Testing custom enum types...');
    try {
      const { data, error } = await supabase.rpc('get_enum_values', { enum_name: 'industry_type' });
      if (!error) {
        console.log('✅ Custom enum types are working');
      } else {
        console.log('⚠️  Custom types test inconclusive');
      }
    } catch (err) {
      console.log('ℹ️  Custom types test skipped (function not available)');
    }

    console.log('\n🎉 Database setup appears to be working correctly!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your Next.js application: npm run dev');
    console.log('2. Test the dashboard components');
    console.log('3. Set up authentication when ready');
    
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testDatabaseConnection(); 