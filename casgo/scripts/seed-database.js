// Script to populate database with sample data for testing
// Run with: node scripts/seed-database.js

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Ensure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sample data
const sampleUser = {
  id: '550e8400-e29b-41d4-a716-446655440000', // Fixed UUID for testing
  email: 'sarah.johnson@ecotech.com',
  first_name: 'Sarah',
  last_name: 'Johnson',
  business_name: 'EcoTech Solutions',
  industry: 'technology',
  company_size: 'medium',
  location: 'San Francisco, CA',
  phone: '+1-555-0123',
  website: 'https://ecotech.example.com'
};

const sampleEnergyData = [
  {
    user_id: sampleUser.id,
    measurement_date: '2024-01-31',
    reading_type: 'monthly_summary',
    kwh_usage: 15420,
    gas_usage_therms: 2850,
    water_usage_gallons: 5200,
    total_cost: 3240.50,
    data_source: 'manual'
  },
  {
    user_id: sampleUser.id,
    measurement_date: '2023-12-31',
    reading_type: 'monthly_summary',
    kwh_usage: 16100,
    gas_usage_therms: 3200,
    water_usage_gallons: 5500,
    total_cost: 3580.25,
    data_source: 'manual'
  },
  {
    user_id: sampleUser.id,
    measurement_date: '2023-11-30',
    reading_type: 'monthly_summary',
    kwh_usage: 14800,
    gas_usage_therms: 3100,
    water_usage_gallons: 5100,
    total_cost: 3420.75,
    data_source: 'manual'
  }
];

const sampleGoals = [
  {
    user_id: sampleUser.id,
    title: 'Reduce Energy Consumption by 30%',
    description: 'Lower overall energy usage through efficiency improvements and smart technology',
    category: 'energy_reduction',
    target_value: 30,
    unit: 'percentage',
    start_date: '2024-01-01',
    target_date: '2025-12-31',
    current_value: 17,
    status: 'active',
    priority: 1
  },
  {
    user_id: sampleUser.id,
    title: 'Install Solar Panels',
    description: 'Generate 50% of electricity needs through solar power',
    category: 'renewable_energy',
    target_value: 50,
    unit: 'percentage',
    start_date: '2024-03-01',
    target_date: '2024-09-15',
    current_value: 0,
    status: 'active',
    priority: 2
  }
];

const sampleRecommendations = [
  {
    user_id: sampleUser.id,
    title: 'Upgrade to Smart Thermostats',
    description: 'Install programmable smart thermostats to optimize heating and cooling efficiency.',
    category: 'energy_efficiency',
    priority: 'high',
    estimated_annual_savings: 2400,
    annual_co2_reduction_tons: 3.2,
    implementation_cost: 1200,
    payback_period_months: 6,
    status: 'pending'
  },
  {
    user_id: sampleUser.id,
    title: 'Switch to Renewable Energy Provider',
    description: 'Transition to a renewable energy provider for 50% of your electricity needs.',
    category: 'renewable_energy',
    priority: 'medium',
    estimated_annual_savings: 1800,
    annual_co2_reduction_tons: 8.5,
    implementation_cost: 0,
    payback_period_months: 0,
    status: 'pending'
  },
  {
    user_id: sampleUser.id,
    title: 'Implement Energy Monitoring System',
    description: 'Install smart meters and real-time energy monitoring across all facilities.',
    category: 'monitoring',
    priority: 'medium',
    estimated_annual_savings: 3600,
    annual_co2_reduction_tons: 2.1,
    implementation_cost: 2400,
    payback_period_months: 8,
    status: 'pending'
  }
];

const sampleGoalProgress = [
  {
    user_id: sampleUser.id,
    goal_id: null, // Will be set after goals are created
    measurement_date: '2024-01-15',
    recorded_value: 17,
    progress_percentage: 56.67,
    notes: 'Good progress with LED installation completed'
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    let userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; // Fixed ID for consistency

    // 1. Check if the user already exists in auth.users
    console.log('1. Checking for existing auth user...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    
    let authUser = users.find(u => u.email === sampleUser.email);

    if (authUser) {
      console.log('⚠️  Auth user already exists. Using existing user ID:', authUser.id);
      userId = authUser.id;
    } else {
      console.log('✅ Auth user does not exist. Creating new user...');
      const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
        id: userId,
        email: sampleUser.email,
        password: 'password123',
        email_confirm: true,
        user_metadata: { 
          first_name: sampleUser.first_name,
          last_name: sampleUser.last_name
        }
      });
      if (createError) throw createError;
      
      authUser = newAuthUser.user;
      userId = authUser.id;
      console.log('✅ Auth user created successfully with ID:', userId);
    }
    
    sampleUser.id = userId;

    // 2. Insert the user profile into the public.users table
    console.log('\n2. Upserting user profile...');
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .upsert({ ...sampleUser, id: userId })
      .select()
      .single();

    if (profileError) throw profileError;
    console.log('✅ User profile created/updated for:', userProfile.business_name);

    // Update other sample data to use the real user ID
    const sampleDataWithUserId = (data) => data.map(item => ({ ...item, user_id: sampleUser.id }));

    // 3. Insert energy data
    console.log('\n3. Adding energy data...');
    const { data: energyData, error: energyError } = await supabase
      .from('energy_data')
      .upsert(sampleDataWithUserId(sampleEnergyData))
      .select();

    if (energyError) {
      console.error('❌ Error creating energy data:', energyError.message);
      return;
    }
    console.log(`✅ ${energyData.length} energy records created`);

    // 4. Insert sustainability goals
    console.log('\n4. Setting up sustainability goals...');
    const { data: goals, error: goalsError } = await supabase
      .from('sustainability_goals')
      .upsert(sampleDataWithUserId(sampleGoals))
      .select();

    if (goalsError) {
      console.error('❌ Error creating goals:', goalsError.message);
      return;
    }
    console.log(`✅ ${goals.length} goals created`);

    // 5. Insert recommendations
    console.log('\n5. Adding AI recommendations...');
    const { data: recommendations, error: recError } = await supabase
      .from('recommendations')
      .upsert(sampleDataWithUserId(sampleRecommendations))
      .select();

    if (recError) {
      console.error('❌ Error creating recommendations:', recError.message);
      return;
    }
    console.log(`✅ ${recommendations.length} recommendations created`);

    // 6. Insert goal progress
    console.log('\n6. Recording goal progress...');
    const progressWithIds = sampleGoalProgress.map(progress => ({
      ...progress,
      user_id: sampleUser.id,
      goal_id: goals[0].id // Link to the first created goal
    }));

    const { data: progress, error: progressError } = await supabase
      .from('goal_progress')
      .upsert(progressWithIds)
      .select();

    if (progressError) {
      console.error('❌ Error creating progress:', progressError.message);
      return;
    }
    console.log(`✅ ${progress.length} progress records created`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log(`   User: ${userProfile.business_name} (${userProfile.industry})`);
    console.log(`   Energy Records: ${energyData.length} months`);
    console.log(`   Active Goals: ${goals.length}`);
    console.log(`   Recommendations: ${recommendations.length}`);
    console.log(`   Progress Entries: ${progress.length}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000/dashboard');
    console.log('3. Test with real data by editing the Dashboard page to pass:');
    console.log(`   <Dashboard userId="${sampleUser.id}" />`);

  } catch (error) {
    console.error(`❌ An error occurred during seeding: ${error.message}`);
    // Optional: Add cleanup logic here if needed
  }
}

// Run the seeding
seedDatabase(); 