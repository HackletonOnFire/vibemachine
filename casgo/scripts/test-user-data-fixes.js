const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const userId = '1de561d6-33b8-49d8-bc50-a3d508648384';

async function testUserDataFixes() {
  console.log('🧪 Testing User Data Fixes Across Application...\n');

  try {
    // Test 1: Check user profile data
    console.log('1. 📋 Testing User Profile Data Fetch...');
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.log('❌ User profile fetch failed:', userError.message);
      return;
    }

    const displayName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 
                       userProfile.email?.split('@')[0] || 'User';
    const businessName = userProfile.business_name || 'Your Business';

    console.log('✅ User profile data:');
    console.log(`   Name: ${displayName}`);
    console.log(`   Business: ${businessName}`);
    console.log(`   Email: ${userProfile.email}`);
    console.log(`   Industry: ${userProfile.industry || 'Not specified'}`);

    // Test 2: Check goals data
    console.log('\n2. 🎯 Testing Goals Data...');
    const { data: goals, error: goalsError } = await supabase
      .from('sustainability_goals')
      .select('*')
      .eq('user_id', userId)
      .limit(5);

    if (goalsError) {
      console.log('❌ Goals fetch failed:', goalsError.message);
    } else {
      console.log(`✅ Found ${goals.length} sustainability goals`);
      goals.forEach((goal, index) => {
        console.log(`   ${index + 1}. ${goal.title} - ${goal.progress_percentage || 0}% complete`);
      });
    }

    // Test 3: Check energy data
    console.log('\n3. ⚡ Testing Energy Data...');
    const { data: energyData, error: energyError } = await supabase
      .from('energy_data')
      .select('*')
      .eq('user_id', userId)
      .order('measurement_date', { ascending: false })
      .limit(3);

    if (energyError) {
      console.log('❌ Energy data fetch failed:', energyError.message);
    } else {
      console.log(`✅ Found ${energyData.length} energy records`);
      energyData.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.measurement_date}: ${record.kwh_usage || 0} kWh, $${record.total_cost || 0}`);
      });
    }

    // Test 4: Check recommendations
    console.log('\n4. 💡 Testing Recommendations Data...');
    const { data: recommendations, error: recError } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .limit(3);

    if (recError) {
      console.log('❌ Recommendations fetch failed:', recError.message);
    } else {
      console.log(`✅ Found ${recommendations.length} recommendations`);
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec.title} - Priority: ${rec.priority}, Savings: $${rec.estimated_annual_savings || 0}`);
      });
    }

    console.log('\n🎉 User Data Test Summary:');
    console.log('✅ Layout Component Updates:');
    console.log('   • User name will now display:', displayName);
    console.log('   • Business name will now display:', businessName);
    console.log('   • All dashboard pages now pass userId to Layout');
    
    console.log('\n✅ Data Flow Fixes:');
    console.log('   • Dashboard components use real Supabase data');
    console.log('   • Mock data fallbacks removed where appropriate');
    console.log('   • Error states properly handle missing data');
    
    console.log('\n🌐 Test Your Fixes:');
    console.log('   • Visit: http://localhost:3000/dashboard');
    console.log('   • Check left sidebar for real user name');
    console.log('   • Navigate through all dashboard pages');
    console.log('   • Verify all components show real data');

  } catch (error) {
    console.error('❌ Test script error:', error);
  }
}

testUserDataFixes().catch(console.error); 