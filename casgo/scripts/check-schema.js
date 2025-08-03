const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('🔍 Checking current database schema...');

  try {
    // Check sustainability_goals table structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT column_name, data_type, is_nullable, column_default 
          FROM information_schema.columns 
          WHERE table_name = 'sustainability_goals' 
          ORDER BY ordinal_position;
        ` 
      });

    if (tableError) {
      console.log('Note: Could not fetch table info, checking with direct query instead...');
      
      // Try a simpler approach - just test inserting
      const testGoal = {
        user_id: '1de561d6-33b8-49d8-bc50-a3d508648384',
        title: 'Test Goal',
        description: 'Test description',
        category: 'energy_reduction',
        target_value: 10.0,
        current_value: 5.0,
        unit: 'percentage',
        start_date: '2024-01-01',
        target_date: '2024-12-31',
        priority: 3,
        status: 'draft'
      };

      console.log('\n📝 Testing goal insertion with minimal data...');
      const { data: testData, error: testError } = await supabase
        .from('sustainability_goals')
        .insert(testGoal)
        .select();

      if (testError) {
        console.error('❌ Test insertion failed:', testError);
        return;
      } else {
        console.log('✅ Test insertion successful!');
        console.log('Inserted goal:', testData[0]);
        
        // Clean up test goal
        await supabase
          .from('sustainability_goals')
          .delete()
          .eq('id', testData[0].id);
        console.log('🧹 Cleaned up test goal');
      }
    } else {
      console.log('✅ sustainability_goals table structure:');
      console.table(tableInfo);
    }

    // Check enum values
    const { data: enumData, error: enumError } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT enumlabel 
          FROM pg_enum 
          WHERE enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'goal_status'
          );
        ` 
      });

    if (enumError) {
      console.log('Note: Could not fetch enum values');
    } else {
      console.log('\n📋 Valid goal_status enum values:');
      enumData.forEach(item => console.log(`  - ${item.enumlabel}`));
    }

    // Check existing goals count
    const { count, error: countError } = await supabase
      .from('sustainability_goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', '1de561d6-33b8-49d8-bc50-a3d508648384');

    if (!countError) {
      console.log(`\n📊 Current goals count for user: ${count}`);
    }

    console.log('\n✅ Schema check complete - ready to run add-test-goals.js');

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkSchema().catch(console.error); 