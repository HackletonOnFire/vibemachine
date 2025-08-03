const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rbhdeusdtzxagvniikef.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock onboarding data that matches the wizard format
const mockOnboardingData = {
  businessBasics: {
    business_name: "Test Company Inc",
    industry: "technology",
    company_size: "medium",
    location: "San Francisco, CA",
    website: "https://testcompany.com",
    annual_revenue: 5000000,
    number_of_employees: 75,
    facilities_count: 2
  },
  energyUsage: {
    data_source: "manual",
    kwh_usage: 12500,
    gas_usage_therms: 450,
    water_usage_gallons: 8500,
    electricity_cost: 1850,
    gas_cost: 325,
    water_cost: 125,
    billing_period_start: "2024-01-01",
    billing_period_end: "2024-01-31"
  },
  sustainabilityGoals: {
    selectedGoals: [
      {
        category: "energy_reduction",
        title: "Reduce Energy Consumption", 
        description: "Lower overall energy usage through efficiency improvements",
        targetValue: 20,
        unit: "percentage",
        estimatedCost: 5000,
        estimatedSavings: 8000,
        estimatedROI: 160,
        priority: 3,
        icon: "zap"
      },
      {
        category: "carbon_reduction",
        title: "Reduce Carbon Footprint",
        description: "Decrease total CO2 emissions through sustainability initiatives", 
        targetValue: 25,
        unit: "percentage",
        estimatedCost: 8000,
        estimatedSavings: 12000,
        estimatedROI: 150,
        priority: 3,
        icon: "leaf"
      }
    ],
    targetTimeline: "1_year",
    priorityLevel: "high",
    primaryMotivation: "environmental_impact"
  }
};

async function testOnboardingFlow() {
  console.log('🧪 Testing Complete Onboarding Flow\n');

  try {
    // Step 1: Check if we have a test user
    console.log('🔍 Step 1: Checking for existing test user...');
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, email, business_name')
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return;
    }
    
    console.log(`✅ Found ${existingUsers.length} existing users`);
    if (existingUsers.length > 0) {
      console.log('📋 Existing users:', existingUsers.map(u => ({ id: u.id, email: u.email, business: u.business_name })));
    }

    // Use the first existing user for testing, or create a new one
    let testUserId;
    if (existingUsers.length > 0) {
      testUserId = existingUsers[0].id;
      console.log(`✅ Using existing user: ${testUserId}`);
    } else {
      // Create a test user manually
      const newUserId = `test-user-${Date.now()}`;
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: newUserId,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          business_name: 'Pending Setup',
          industry: 'technology',
          company_size: 'small',
          location: 'Test Location',
          onboarding_completed: false,
          onboarding_step: 1
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating test user:', createError);
        return;
      }
      
      testUserId = newUser.id;
      console.log(`✅ Created new test user: ${testUserId}`);
    }

    // Step 2: Test Business Basics Update
    console.log('\n🏢 Step 2: Testing Business Basics Update...');
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        business_name: mockOnboardingData.businessBasics.business_name,
        industry: mockOnboardingData.businessBasics.industry,
        company_size: mockOnboardingData.businessBasics.company_size,
        location: mockOnboardingData.businessBasics.location,
        website: mockOnboardingData.businessBasics.website,
        annual_revenue: mockOnboardingData.businessBasics.annual_revenue,
        number_of_employees: mockOnboardingData.businessBasics.number_of_employees,
        facilities_count: mockOnboardingData.businessBasics.facilities_count,
        updated_at: new Date().toISOString()
      })
      .eq('id', testUserId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating user profile:', updateError);
      return;
    }
    
    console.log('✅ Business basics updated successfully');
    console.log(`📊 Updated business: ${updatedUser.business_name} (${updatedUser.industry})`);

    // Step 3: Test Energy Data Creation
    console.log('\n⚡ Step 3: Testing Energy Data Creation...');
    const energyData = {
      user_id: testUserId,
      measurement_date: new Date().toISOString().split('T')[0],
      reading_type: 'billing_period',
      kwh_usage: mockOnboardingData.energyUsage.kwh_usage,
      gas_usage_therms: mockOnboardingData.energyUsage.gas_usage_therms,
      water_usage_gallons: mockOnboardingData.energyUsage.water_usage_gallons,
      electricity_cost: mockOnboardingData.energyUsage.electricity_cost,
      gas_cost: mockOnboardingData.energyUsage.gas_cost,
      water_cost: mockOnboardingData.energyUsage.water_cost,
      billing_period_start: mockOnboardingData.energyUsage.billing_period_start,
      billing_period_end: mockOnboardingData.energyUsage.billing_period_end,
      data_source: 'manual_entry',
      created_at: new Date().toISOString()
    };

    const { data: createdEnergy, error: energyError } = await supabase
      .from('energy_data')
      .insert(energyData)
      .select()
      .single();

    if (energyError) {
      console.error('❌ Error creating energy data:', energyError);
      return;
    }

    console.log('✅ Energy data created successfully');
    console.log(`📊 Energy usage: ${createdEnergy.kwh_usage} kWh, ${createdEnergy.gas_usage_therms} therms`);

    // Step 4: Test Sustainability Goals Creation
    console.log('\n🎯 Step 4: Testing Sustainability Goals Creation...');
    const targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() + 1);
    const targetDateString = targetDate.toISOString().split('T')[0];

    let goalsCreated = 0;
    for (const goalConfig of mockOnboardingData.sustainabilityGoals.selectedGoals) {
      const goalData = {
        user_id: testUserId,
        title: goalConfig.title,
        description: `${goalConfig.description} (Primary motivation: ${mockOnboardingData.sustainabilityGoals.primaryMotivation.replace('_', ' ')})`,
        category: goalConfig.category,
        target_value: goalConfig.targetValue,
        unit: goalConfig.unit,
        baseline_value: 0,
        start_date: new Date().toISOString().split('T')[0],
        target_date: targetDateString,
        status: 'active',
        priority: goalConfig.priority,
        estimated_cost: goalConfig.estimatedCost,
        estimated_savings: goalConfig.estimatedSavings,
        estimated_roi: goalConfig.estimatedROI,
        created_at: new Date().toISOString()
      };

      const { data: createdGoal, error: goalError } = await supabase
        .from('sustainability_goals')
        .insert(goalData)
        .select()
        .single();

      if (goalError) {
        console.error(`❌ Error creating goal ${goalConfig.title}:`, goalError);
        continue;
      }

      goalsCreated++;
      console.log(`✅ Created goal: ${goalConfig.title} (${goalConfig.targetValue}% target)`);
    }

    console.log(`✅ Successfully created ${goalsCreated} sustainability goals`);

    // Step 5: Mark Onboarding Complete
    console.log('\n🎉 Step 5: Marking Onboarding Complete...');
    const { data: completedUser, error: completeError } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        onboarding_step: 3,
        updated_at: new Date().toISOString()
      })
      .eq('id', testUserId)
      .select()
      .single();

    if (completeError) {
      console.error('❌ Error marking onboarding complete:', completeError);
      return;
    }

    console.log('✅ Onboarding marked as complete');

    // Step 6: Verify Complete User Data
    console.log('\n🔍 Step 6: Verifying Complete User Data...');
    
    // Check user profile
    const { data: finalUser, error: userFetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (userFetchError) {
      console.error('❌ Error fetching final user data:', userFetchError);
      return;
    }

    // Check energy data
    const { data: userEnergyData, error: energyFetchError } = await supabase
      .from('energy_data')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });

    if (energyFetchError) {
      console.error('❌ Error fetching energy data:', energyFetchError);
      return;
    }

    // Check goals
    const { data: userGoals, error: goalsFetchError } = await supabase
      .from('sustainability_goals')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });

    if (goalsFetchError) {
      console.error('❌ Error fetching goals data:', goalsFetchError);
      return;
    }

    // Print final verification
    console.log('\n📋 FINAL VERIFICATION REPORT:');
    console.log('================================');
    console.log(`👤 User: ${finalUser.first_name} ${finalUser.last_name} (${finalUser.email})`);
    console.log(`🏢 Business: ${finalUser.business_name} - ${finalUser.industry} (${finalUser.company_size})`);
    console.log(`📍 Location: ${finalUser.location}`);
    console.log(`✅ Onboarding Complete: ${finalUser.onboarding_completed}`);
    console.log(`⚡ Energy Records: ${userEnergyData.length}`);
    console.log(`🎯 Goals: ${userGoals.length}`);
    
    if (userEnergyData.length > 0) {
      const latest = userEnergyData[0];
      console.log(`📊 Latest Energy: ${latest.kwh_usage} kWh, ${latest.gas_usage_therms} therms`);
    }
    
    if (userGoals.length > 0) {
      console.log('🎯 Goals:');
      userGoals.forEach(goal => {
        console.log(`   - ${goal.title}: ${goal.target_value}% reduction (${goal.status})`);
      });
    }

    console.log('\n🎉 END-TO-END TEST COMPLETED SUCCESSFULLY!');
    console.log(`📝 Test User ID for dashboard testing: ${testUserId}`);
    
    return testUserId;

  } catch (error) {
    console.error('💥 Unexpected error during testing:', error);
  }
}

// Test Dashboard Data Fetch
async function testDashboardDataFetch(userId) {
  console.log('\n📊 Testing Dashboard Data Fetch...');
  
  try {
    // Simulate the dashboard data query
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Dashboard profile fetch error:', profileError);
      return;
    }

    console.log('✅ Profile fetched for dashboard');

    // Fetch energy summary
    const { data: energyData, error: energyError } = await supabase
      .from('energy_data')
      .select('*')
      .eq('user_id', userId)
      .order('measurement_date', { ascending: false })
      .limit(12);

    if (energyError) {
      console.error('❌ Dashboard energy fetch error:', energyError);
      return;
    }

    console.log(`✅ Energy data fetched: ${energyData.length} records`);

    // Fetch goals
    const { data: goals, error: goalsError } = await supabase
      .from('sustainability_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (goalsError) {
      console.error('❌ Dashboard goals fetch error:', goalsError);
      return;
    }

    console.log(`✅ Goals fetched: ${goals.length} active goals`);
    console.log('✅ Dashboard data fetch simulation successful!');

  } catch (error) {
    console.error('💥 Dashboard fetch error:', error);
  }
}

// Run the comprehensive test
async function runTest() {
  const testUserId = await testOnboardingFlow();
  if (testUserId) {
    await testDashboardDataFetch(testUserId);
  }
}

runTest().catch(console.error); 