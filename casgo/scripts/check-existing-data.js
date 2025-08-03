const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkExistingData() {
  console.log('🔍 Checking existing data...\n');
  
  // Check existing users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*');
  
  if (usersError) {
    console.error('❌ Error fetching users:', usersError.message);
  } else {
    console.log('👥 Existing users:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Name: ${user.first_name} ${user.last_name}`);
      console.log(`    Business: ${user.business_name}`);
      console.log(`    Industry: ${user.industry}`);
      console.log('');
    });
  }
  
  // Get the first user ID to use for testing
  if (users && users.length > 0) {
    const firstUserId = users[0].id;
    console.log(`🎯 Using user ID for testing: ${firstUserId}\n`);
    
    // Check their data
    const { data: energyData } = await supabase
      .from('energy_data')
      .select('*')
      .eq('user_id', firstUserId)
      .limit(3);
    
    const { data: goals } = await supabase
      .from('sustainability_goals')
      .select('*')
      .eq('user_id', firstUserId)
      .limit(3);
    
    const { data: recommendations } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', firstUserId)
      .limit(3);
    
    console.log(`⚡ Energy data for user (${energyData?.length || 0} records):`, energyData);
    console.log(`🎯 Goals for user (${goals?.length || 0} records):`, goals);
    console.log(`💡 Recommendations for user (${recommendations?.length || 0} records):`, recommendations);
    
    return firstUserId;
  }
  
  return null;
}

checkExistingData().then(userId => {
  if (userId) {
    console.log(`\n✅ Found existing user: ${userId}`);
    console.log('💡 Update your dashboard page to use this user ID instead of the hardcoded one.');
  } else {
    console.log('\n❌ No users found in database');
  }
}).catch(console.error); 