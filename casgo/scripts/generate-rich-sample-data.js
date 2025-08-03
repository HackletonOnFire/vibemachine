const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const userId = '1de561d6-33b8-49d8-bc50-a3d508648384';

async function generateRichSampleData() {
  console.log('🚀 Generating rich sample data for compelling dashboard...\n');

  try {
    // 1. Clear existing data
    await clearExistingData();

    // 2. Generate 18 months of energy data with realistic trends
    await generateEnergyData();

    // 3. Generate monthly summaries
    await generateMonthlySummaries();

    // 4. Generate carbon footprint history
    await generateCarbonHistory();

    // 5. Create comprehensive goals with milestones
    await generateGoalsWithMilestones();

    // 6. Generate smart recommendations
    await generateSmartRecommendations();

    // 7. Update dashboard cache
    await updateDashboardCache();

    console.log('\n✅ Rich sample data generation complete!');
    console.log('🎯 Your dashboard now has compelling data trends!');

  } catch (error) {
    console.error('❌ Error generating sample data:', error);
  }
}

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  
  // Clear in correct order to avoid foreign key constraints
  await supabase.from('goal_progress').delete().eq('user_id', userId);
  await supabase.from('goal_milestones').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('recommendations').delete().eq('user_id', userId);
  await supabase.from('sustainability_goals').delete().eq('user_id', userId);
  await supabase.from('carbon_footprint_history').delete().eq('user_id', userId);
  await supabase.from('monthly_energy_summary').delete().eq('user_id', userId);
  await supabase.from('energy_data').delete().eq('user_id', userId);
  
  console.log('✅ Existing data cleared');
}

async function generateEnergyData() {
  console.log('⚡ Generating 18 months of energy data...');
  
  const energyData = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 17); // 18 months ago

  // Base values with seasonal variation
  const baseElectricity = 12000; // kWh per month
  const baseGas = 2500; // therms per month
  const baseWater = 4500; // gallons per month

  for (let i = 0; i < 18; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    
    // Seasonal factors (higher usage in summer/winter)
    const month = date.getMonth();
    const seasonalFactor = 1 + 0.3 * Math.sin((month - 5) * Math.PI / 6);
    
    // Add gradual improvement trend (efficiency gains over time)
    const improvementFactor = 1 - (i * 0.01); // 1% improvement per month
    
    // Add some realistic random variation
    const variation = 0.9 + Math.random() * 0.2; // ±10% variation
    
    const electricity = Math.round(baseElectricity * seasonalFactor * improvementFactor * variation);
    const gas = Math.round(baseGas * seasonalFactor * improvementFactor * variation);
    const water = Math.round(baseWater * 1.1 * variation); // Less seasonal variation for water
    
    // Calculate realistic costs
    const electricityCost = Math.round(electricity * 0.12 * 100) / 100; // $0.12 per kWh
    const gasCost = Math.round(gas * 1.2 * 100) / 100; // $1.20 per therm
    const waterCost = Math.round(water * 0.008 * 100) / 100; // $0.008 per gallon
    
    energyData.push({
      user_id: userId,
      measurement_date: date.toISOString().split('T')[0],
      reading_type: 'monthly_summary',
      kwh_usage: electricity,
      gas_usage_therms: gas,
      water_usage_gallons: water,
      electricity_cost: electricityCost,
      gas_cost: gasCost,
      water_cost: waterCost,
      total_cost: electricityCost + gasCost + waterCost,
      data_source: 'api',
      quality_score: 95 + Math.floor(Math.random() * 5),
      created_at: new Date().toISOString()
    });
  }

  const { error } = await supabase.from('energy_data').insert(energyData);
  if (error) throw error;
  
  console.log(`✅ Generated ${energyData.length} months of energy data`);
}

async function generateMonthlySummaries() {
  console.log('📊 Generating monthly summaries...');
  
  // Get the energy data we just created
  const { data: energyData, error } = await supabase
    .from('energy_data')
    .select('*')
    .eq('user_id', userId)
    .order('measurement_date');
  
  if (error) throw error;

  const summaries = energyData.map(entry => {
    const date = new Date(entry.measurement_date);
    const electricityCO2 = entry.kwh_usage * 0.0005; // tons CO2e per kWh
    const gasCO2 = entry.gas_usage_therms * 0.0053; // tons CO2e per therm
    
    return {
      user_id: userId,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      total_kwh: entry.kwh_usage,
      total_therms: entry.gas_usage_therms,
      total_water_gallons: entry.water_usage_gallons,
      total_electricity_cost: entry.electricity_cost,
      total_gas_cost: entry.gas_cost,
      total_water_cost: entry.water_cost,
      total_cost: entry.total_cost,
      total_co2_tons: Math.round((electricityCO2 + gasCO2) * 100) / 100,
      electricity_co2_tons: Math.round(electricityCO2 * 100) / 100,
      gas_co2_tons: Math.round(gasCO2 * 100) / 100,
      kwh_per_dollar: Math.round((entry.kwh_usage / entry.electricity_cost) * 100) / 100,
      cost_per_kwh: Math.round((entry.electricity_cost / entry.kwh_usage) * 10000) / 10000
    };
  });

  const { error: summaryError } = await supabase.from('monthly_energy_summary').insert(summaries);
  if (summaryError) throw summaryError;
  
  console.log(`✅ Generated ${summaries.length} monthly summaries`);
}

async function generateCarbonHistory() {
  console.log('🌱 Generating carbon footprint history...');
  
  const { data: summaries, error } = await supabase
    .from('monthly_energy_summary')
    .select('*')
    .eq('user_id', userId)
    .order('year, month');
  
  if (error) throw error;

  const carbonHistory = summaries.map((summary, index) => {
    const date = new Date(summary.year, summary.month - 1, 15); // Mid-month
    const baseline = index === 0 ? summary.total_co2_tons : summaries[0].total_co2_tons;
    const reduction = baseline > 0 ? Math.max(0, ((baseline - summary.total_co2_tons) / baseline) * 100) : 0;
    
    return {
      user_id: userId,
      measurement_date: date.toISOString().split('T')[0],
      scope1_emissions: Math.round(summary.gas_co2_tons * 100) / 100,
      scope2_emissions: Math.round(summary.electricity_co2_tons * 100) / 100,
      scope3_emissions: Math.round(summary.total_co2_tons * 0.15 * 100) / 100, // Estimate 15% for scope 3
      total_emissions: summary.total_co2_tons,
      baseline_emissions: baseline,
      reduction_percentage: Math.round(reduction * 100) / 100,
      target_emissions: Math.round(baseline * 0.7 * 100) / 100, // 30% reduction target
      temperature_avg: 60 + 20 * Math.sin((summary.month - 1) * Math.PI / 6), // Seasonal temp
      business_days: 22
    };
  });

  const { error: carbonError } = await supabase.from('carbon_footprint_history').insert(carbonHistory);
  if (carbonError) throw carbonError;
  
  console.log(`✅ Generated ${carbonHistory.length} carbon footprint records`);
}

async function generateGoalsWithMilestones() {
  console.log('🎯 Creating goals with milestones...');
  
  // Create sustainability goals
  const goals = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: userId,
      title: 'Reduce Energy Consumption by 25%',
      description: 'Achieve 25% reduction in monthly energy usage through efficiency improvements',
      category: 'energy_reduction',
      target_value: 25,
      current_value: 15,
      unit: 'percentage',
      baseline_value: 100,
      baseline_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      progress_percentage: 60,
      priority: 1,
      estimated_cost: 5000,
      estimated_savings: 18000,
      estimated_roi: 260
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      user_id: userId,
      title: 'Install 15kW Solar Panel System',
      description: 'Deploy rooftop solar panels to generate renewable energy',
      category: 'renewable_energy',
      target_value: 15,
      current_value: 0,
      unit: 'kW',
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      progress_percentage: 25,
      priority: 2,
      estimated_cost: 25000,
      estimated_savings: 45000,
      estimated_roi: 80
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      user_id: userId,
      title: 'Achieve Carbon Neutrality',
      description: 'Reach net-zero carbon emissions through efficiency and offsets',
      category: 'carbon_reduction',
      target_value: 100,
      current_value: 35,
      unit: 'percentage',
      baseline_value: 0,
      start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      target_date: new Date(Date.now() + 540 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      progress_percentage: 35,
      priority: 1,
      estimated_cost: 15000,
      estimated_savings: 8000,
      estimated_roi: -47
    }
  ];

  const { error: goalsError } = await supabase.from('sustainability_goals').insert(goals);
  if (goalsError) throw goalsError;

  // Create milestones for each goal
  const milestones = [
    // Energy Reduction Goal Milestones
    {
      goal_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'LED Lighting Upgrade',
      description: 'Replace all lighting with LED fixtures',
      target_value: 8,
      target_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_completed: true,
      completion_percentage: 100,
      actual_value: 9,
      milestone_order: 1,
      is_critical: false
    },
    {
      goal_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'HVAC System Optimization',
      description: 'Optimize heating and cooling systems',
      target_value: 12,
      target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_completed: false,
      completion_percentage: 75,
      actual_value: 6,
      milestone_order: 2,
      is_critical: true
    },
    // Solar Panel Goal Milestones
    {
      goal_id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Solar Assessment Complete',
      description: 'Complete rooftop assessment and permits',
      target_value: 100,
      target_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_completed: true,
      completion_percentage: 100,
      actual_value: 100,
      milestone_order: 1,
      is_critical: true
    },
    {
      goal_id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Panel Installation',
      description: 'Install solar panels and inverter system',
      target_value: 15,
      target_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_completed: false,
      completion_percentage: 15,
      actual_value: 0,
      milestone_order: 2,
      is_critical: true
    }
  ];

  const { error: milestonesError } = await supabase.from('goal_milestones').insert(milestones);
  if (milestonesError) throw milestonesError;

  console.log(`✅ Created ${goals.length} goals with ${milestones.length} milestones`);
}

async function generateSmartRecommendations() {
  console.log('💡 Generating smart recommendations...');
  
  const recommendations = [
    {
      user_id: userId,
      goal_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Install Smart Thermostats',
      description: 'Replace existing thermostats with programmable smart models to optimize heating and cooling schedules',
      detailed_explanation: 'Smart thermostats can learn your schedule and automatically adjust temperatures when spaces are unoccupied. Studies show average savings of 10-23% on heating and cooling costs.',
      category: 'smart_technology',
      priority: 'high',
      difficulty_level: 2,
      implementation_cost: 800,
      estimated_annual_savings: 1200,
      payback_period_months: 8,
      roi_percentage: 50,
      annual_co2_reduction_tons: 1.2,
      annual_energy_savings_kwh: 2400,
      implementation_steps: JSON.stringify([
        'Research compatible smart thermostat models',
        'Schedule professional installation',
        'Configure temperature schedules',
        'Monitor savings for first month'
      ]),
      required_resources: ['Licensed electrician', 'Wi-Fi network', 'Smartphone app'],
      timeline_weeks: 2,
      ai_confidence_score: 0.92,
      data_sources: ['EPA Energy Star', 'Historical usage data'],
      generated_by: 'ai',
      status: 'pending'
    },
    {
      user_id: userId,
      goal_id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Energy Storage Battery System',
      description: 'Add battery storage to maximize solar panel efficiency and provide backup power',
      detailed_explanation: 'Battery storage allows you to store excess solar energy for use during peak rate periods or outages. This can increase your solar ROI by 20-30%.',
      category: 'renewable_energy',
      priority: 'medium',
      difficulty_level: 4,
      implementation_cost: 12000,
      estimated_annual_savings: 2400,
      payback_period_months: 60,
      roi_percentage: 20,
      annual_co2_reduction_tons: 2.8,
      annual_energy_savings_kwh: 4800,
      timeline_weeks: 8,
      ai_confidence_score: 0.85,
      data_sources: ['Tesla Powerwall specs', 'Local utility rates'],
      generated_by: 'ai',
      status: 'pending'
    },
    {
      user_id: userId,
      title: 'Implement Energy Monitoring System',
      description: 'Install real-time energy monitoring to identify usage patterns and inefficiencies',
      detailed_explanation: 'Real-time monitoring provides detailed insights into energy consumption by circuit, helping identify phantom loads and optimization opportunities.',
      category: 'energy_efficiency',
      priority: 'high',
      difficulty_level: 2,
      implementation_cost: 600,
      estimated_annual_savings: 900,
      payback_period_months: 8,
      roi_percentage: 50,
      annual_co2_reduction_tons: 0.8,
      annual_energy_savings_kwh: 1600,
      timeline_weeks: 1,
      ai_confidence_score: 0.89,
      data_sources: ['Sense Energy Monitor', 'Usage analytics'],
      generated_by: 'ai',
      status: 'pending'
    },
    {
      user_id: userId,
      goal_id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Switch to Green Energy Provider',
      description: 'Transition to a renewable energy provider for immediate carbon footprint reduction',
      detailed_explanation: 'Many utilities now offer 100% renewable energy plans with minimal or no premium. This provides immediate carbon reduction while supporting renewable energy infrastructure.',
      category: 'renewable_energy',
      priority: 'high',
      difficulty_level: 1,
      implementation_cost: 0,
      estimated_annual_savings: -240, // Slight premium
      payback_period_months: 0,
      roi_percentage: -10,
      annual_co2_reduction_tons: 8.5,
      annual_energy_savings_kwh: 0,
      timeline_weeks: 1,
      ai_confidence_score: 0.95,
      data_sources: ['Local utility programs', 'EPA green power'],
      generated_by: 'ai',
      status: 'pending'
    }
  ];

  const { error } = await supabase.from('recommendations').insert(recommendations);
  if (error) throw error;
  
  console.log(`✅ Generated ${recommendations.length} smart recommendations`);
}

async function updateDashboardCache() {
  console.log('⚡ Updating dashboard cache...');
  
  // Calculate current KPIs
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Get current and previous month data
  const { data: currentMonthData } = await supabase
    .from('monthly_energy_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('year', currentYear)
    .eq('month', currentMonth)
    .single();

  const { data: previousMonthData } = await supabase
    .from('monthly_energy_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('year', previousMonthYear)
    .eq('month', previousMonth)
    .single();

  // Get YTD data
  const { data: ytdData } = await supabase
    .from('monthly_energy_summary')
    .select('total_kwh, total_cost, total_co2_tons')
    .eq('user_id', userId)
    .eq('year', currentYear);

  // Get goals data
  const { data: goalsData } = await supabase
    .from('sustainability_goals')
    .select('status, progress_percentage, target_date')
    .eq('user_id', userId);

  // Get recommendations data
  const { data: recommendationsData } = await supabase
    .from('recommendations')
    .select('status, estimated_annual_savings')
    .eq('user_id', userId);

  const activeGoals = goalsData?.filter(g => g.status === 'active') || [];
  const completedGoals = goalsData?.filter(g => g.status === 'completed') || [];
  const overdueGoals = goalsData?.filter(g => g.status === 'active' && new Date(g.target_date) < new Date()) || [];
  const avgProgress = activeGoals.length > 0 ? activeGoals.reduce((sum, g) => sum + (g.progress_percentage || 0), 0) / activeGoals.length : 0;

  const pendingRecs = recommendationsData?.filter(r => r.status === 'pending') || [];
  const implementedRecs = recommendationsData?.filter(r => r.status === 'completed') || [];
  const totalSavings = pendingRecs.reduce((sum, r) => sum + (r.estimated_annual_savings || 0), 0);

  const cacheData = {
    user_id: userId,
    current_month_kwh: currentMonthData?.total_kwh || 0,
    current_month_cost: currentMonthData?.total_cost || 0,
    month_over_month_kwh_change: previousMonthData ? 
      ((currentMonthData?.total_kwh || 0) - previousMonthData.total_kwh) / previousMonthData.total_kwh * 100 : 0,
    month_over_month_cost_change: previousMonthData ? 
      ((currentMonthData?.total_cost || 0) - previousMonthData.total_cost) / previousMonthData.total_cost * 100 : 0,
    year_to_date_kwh: ytdData?.reduce((sum, m) => sum + (m.total_kwh || 0), 0) || 0,
    year_to_date_cost: ytdData?.reduce((sum, m) => sum + (m.total_cost || 0), 0) || 0,
    current_month_co2: currentMonthData?.total_co2_tons || 0,
    total_co2_reduction: 5.2, // Calculated from baseline
    co2_reduction_percentage: 15.8,
    active_goals_count: activeGoals.length,
    completed_goals_count: completedGoals.length,
    overdue_goals_count: overdueGoals.length,
    avg_goal_progress: Math.round(avgProgress * 100) / 100,
    pending_recommendations_count: pendingRecs.length,
    total_potential_savings: Math.round(totalSavings),
    implemented_recommendations_count: implementedRecs.length
  };

  // Upsert cache data
  const { error } = await supabase
    .from('dashboard_kpi_cache')
    .upsert(cacheData, { onConflict: 'user_id' });

  if (error) throw error;
  
  console.log('✅ Dashboard cache updated');
}

// Run the script
generateRichSampleData().catch(console.error); 