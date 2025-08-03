const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection error:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('📊 Users table count:', data);
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return false;
  }
}

async function checkTables() {
  console.log('\n🔍 Checking database tables...');
  
  const tables = ['users', 'energy_data', 'sustainability_goals', 'recommendations', 'goal_progress'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count} records`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

async function createTestUser() {
  console.log('\n🔍 Creating test user...');
  
  const testUserId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', testUserId)
      .single();
    
    if (existingUser) {
      console.log('✅ Test user already exists');
      return testUserId;
    }
    
    // Create new test user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: testUserId,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          business_name: 'Green Energy Corp',
          industry: 'Renewable Energy',
          location: 'San Francisco, CA',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Failed to create test user:', error.message);
      return null;
    }
    
    console.log('✅ Test user created successfully');
    return testUserId;
  } catch (err) {
    console.error('❌ Error creating test user:', err.message);
    return null;
  }
}

async function createSampleData(userId) {
  if (!userId) return;
  
  console.log('\n🔍 Creating sample data...');
  
  try {
    // Create energy data
    const energyData = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      energyData.push({
        user_id: userId,
        energy_type: 'electricity',
        consumption_kwh: Math.floor(Math.random() * 1000) + 500,
        cost_usd: Math.floor(Math.random() * 200) + 100,
        measurement_date: date.toISOString().split('T')[0],
        source: 'manual',
        created_at: new Date().toISOString()
      });
    }
    
    const { error: energyError } = await supabase
      .from('energy_data')
      .insert(energyData);
    
    if (energyError) {
      console.error('❌ Failed to create energy data:', energyError.message);
    } else {
      console.log('✅ Energy data created');
    }
    
    // Create sustainability goals
    const goals = [
      {
        user_id: userId,
        title: 'Reduce Energy Consumption',
        description: 'Reduce monthly energy consumption by 20%',
        target_value: 20,
        current_value: 15,
        unit: 'percentage',
        target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        category: 'energy',
        created_at: new Date().toISOString()
      },
      {
        user_id: userId,
        title: 'Install Solar Panels',
        description: 'Install 10kW solar panel system',
        target_value: 10,
        current_value: 0,
        unit: 'kW',
        target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        category: 'renewable',
        created_at: new Date().toISOString()
      }
    ];
    
    const { error: goalsError } = await supabase
      .from('sustainability_goals')
      .insert(goals);
    
    if (goalsError) {
      console.error('❌ Failed to create goals:', goalsError.message);
    } else {
      console.log('✅ Sustainability goals created');
    }
    
    // Create recommendations
    const recommendations = [
      {
        user_id: userId,
        title: 'Switch to LED Lighting',
        description: 'Replace all incandescent bulbs with LED alternatives to save 75% on lighting costs',
        impact_description: 'Potential savings: $200/year',
        priority: 'high',
        category: 'energy_efficiency',
        estimated_savings_usd: 200,
        implementation_effort: 'low',
        created_at: new Date().toISOString()
      },
      {
        user_id: userId,
        title: 'Install Smart Thermostat',
        description: 'Smart thermostats can reduce heating/cooling costs by up to 23%',
        impact_description: 'Potential savings: $300/year',
        priority: 'medium',
        category: 'smart_technology',
        estimated_savings_usd: 300,
        implementation_effort: 'medium',
        created_at: new Date().toISOString()
      }
    ];
    
    const { error: recError } = await supabase
      .from('recommendations')
      .insert(recommendations);
    
    if (recError) {
      console.error('❌ Failed to create recommendations:', recError.message);
    } else {
      console.log('✅ Recommendations created');
    }
    
  } catch (err) {
    console.error('❌ Error creating sample data:', err.message);
  }
}

async function main() {
  console.log('🚀 Testing Supabase Setup\n');
  
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }
  
  await checkTables();
  
  const userId = await createTestUser();
  await createSampleData(userId);
  
  console.log('\n✅ Setup complete! Your dashboard should now work.');
}

main().catch(console.error); 