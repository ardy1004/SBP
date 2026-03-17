// Script to check legal status data in Supabase
import { createClient } from '@supabase/supabase-js';

// Hardcoded for this check (from .env file)
const supabaseUrl = 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLegalStatusData() {
  console.log('🔍 Checking legal status data in properties table...\n');

  try {
    // Get all unique legalitas values
    const { data, error } = await supabase
      .from('properties')
      .select('legalitas')
      .not('legalitas', 'is', null);

    if (error) {
      console.error('❌ Error fetching data:', error);
      return;
    }

    // Extract unique values
    const uniqueLegalitas = [...new Set(data.map(item => item.legalitas))];

    console.log('📊 Unique legalitas values found in database:');
    uniqueLegalitas.forEach((value, index) => {
      console.log(`  ${index + 1}. "${value}"`);
    });

    console.log(`\n📈 Total unique values: ${uniqueLegalitas.length}`);
    console.log(`📈 Total records: ${data.length}`);

    // Check for specific problematic values
    const shgbPbgVariants = uniqueLegalitas.filter(val =>
      val && (val.includes('SHGB') || val.includes('PBG'))
    );

    console.log('\n🔍 SHGB/PBG related values:');
    shgbPbgVariants.forEach((value, index) => {
      console.log(`  ${index + 1}. "${value}"`);
    });

    // Check price range for properties with SHGB & PBG
    const targetValue = 'SHGB & PBG';
    const { data: priceData, error: priceError } = await supabase
      .from('properties')
      .select('harga_properti, legalitas')
      .eq('legalitas', targetValue)
      .gte('harga_properti', '5000000000');

    if (!priceError && priceData) {
      console.log(`\n💰 Properties with legalitas="${targetValue}" and price >= 5B:`);
      console.log(`   Found: ${priceData.length} properties`);
      if (priceData.length > 0) {
        priceData.slice(0, 5).forEach((prop, index) => {
          console.log(`   ${index + 1}. Price: ${prop.harga_properti}, Legalitas: "${prop.legalitas}"`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkLegalStatusData();