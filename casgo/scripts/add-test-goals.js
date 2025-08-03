const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const userId = '1de561d6-33b8-49d8-bc50-a3d508648384';

async function addTestGoals() {
  console.log('🎯 Adding realistic sustainability goals...');

  try {
    // Clear existing goals
    const { error: deleteError } = await supabase
      .from('sustainability_goals')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.log('Note: Could not clear existing goals:', deleteError.message);
    }

    // Add comprehensive sustainability goals
    const goals = [
      {
        user_id: userId,
        title: 'Reduce Energy Consumption by 25%',
        description: 'Implement LED lighting, HVAC optimization, and smart building systems to achieve 25% reduction in energy usage by end of 2024.',
        category: 'energy_reduction',
        target_value: 25.0,
        current_value: 18.7,
        unit: 'percentage',
        start_date: '2024-01-01',
        target_date: '2024-12-31',
        priority: 2,
        status: 'active',
        progress_percentage: 74.8
      },
      {
        user_id: userId,
        title: 'Cut Carbon Emissions by 30%',
        description: 'Reduce CO2 emissions through renewable energy adoption, fleet electrification, and supply chain optimization.',
        category: 'carbon_reduction',
        target_value: 30.0,
        current_value: 22.4,
        unit: 'percentage',
        start_date: '2024-01-01',
        target_date: '2024-12-31',
        priority: 1,
        status: 'active',
        progress_percentage: 74.7
      },
      {
        user_id: userId,
        title: 'Achieve 60% Renewable Energy',
        description: 'Install solar panels, secure wind energy contracts, and implement battery storage systems.',
        category: 'renewable_energy',
        target_value: 60.0,
        current_value: 42.0,
        unit: 'percentage',
        start_date: '2024-01-01',
        target_date: '2024-12-31',
        priority: 2,
        status: 'active',
        progress_percentage: 70.0
      },
      {
        user_id: userId,
        title: 'Reduce Waste Generation by 40%',
        description: 'Implement comprehensive recycling program, reduce packaging, and optimize material usage.',
        category: 'waste_reduction',
        target_value: 40.0,
        current_value: 28.5,
        unit: 'percentage',
        start_date: '2024-01-01',
        target_date: '2024-12-31',
        priority: 3,
        status: 'active',
        progress_percentage: 71.3
      },
      {
        user_id: userId,
        title: 'Water Conservation - 20% Reduction',
        description: 'Install low-flow fixtures, implement rainwater harvesting, and optimize irrigation systems.',
        category: 'water_conservation',
        target_value: 20.0,
        current_value: 20.0,
        unit: 'percentage',
        start_date: '2024-01-01',
        target_date: '2024-09-30',
        priority: 4,
        status: 'completed',
        progress_percentage: 100.0
      },
      {
        user_id: userId,
        title: 'Green Transportation Initiative',
        description: 'Transition company fleet to electric vehicles and promote employee public transit usage.',
        category: 'carbon_reduction',
        target_value: 50.0,
        current_value: 15.0,
        unit: 'percentage',
        start_date: '2024-06-01',
        target_date: '2025-06-30',
        priority: 3,
        status: 'draft',
        progress_percentage: 30.0
      }
    ];

    const { data: goalsData, error: goalsError } = await supabase
      .from('sustainability_goals')
      .insert(goals)
      .select();

    if (goalsError) {
      console.error('Error inserting goals:', goalsError);
      return;
    }

    console.log(`✅ Added ${goalsData.length} sustainability goals`);

    console.log('📈 Goals added with realistic progress data and status indicators');

    console.log('🎉 Test goals and milestones added successfully!');
    console.log('\n📊 Dashboard should now show:');
    console.log('- 6 sustainability goals with realistic progress');
    console.log('- Goal Progress Overview with status indicators');
    console.log('- Performance Overview bar charts');
    console.log('- Timeline Progress tracking');
    
    console.log('\n🌐 Visit your dashboard at: http://localhost:3001/dashboard/goals');

  } catch (error) {
    console.error('❌ Error adding test goals:', error);
  }
}

addTestGoals().catch(console.error); 