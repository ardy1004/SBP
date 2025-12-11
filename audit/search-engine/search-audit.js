import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test cases as specified by user
const testCases = [
  { name: 'rumah-jl-kaliurang', keyword: 'Rumah jl kaliurang' },
  { name: 'jual-tanah-yogyakarta', keyword: 'jual tanah yogyakarta' },
  { name: 'mewah-3-lantai', keyword: 'mewah 3 lantai' },
  { name: 'shm', keyword: 'SHM' },
  { name: 'jogja-kota', keyword: 'jogja kota' },
  { name: 'kode-listing-test', keyword: 'KAL001' }, // Using fallback data code
  { name: 'alamat-lengkap-test', keyword: 'Jl. Kaliurang KM 5' }
];

// Function to build search query (mimicking HomePage logic)
function buildSearchQuery(keyword) {
  const searchTerm = keyword.trim();
  const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
  const searchConditions = [];

  console.log('Building search query for term:', searchTerm, 'words:', searchWords);

  // Primary search fields (judul, deskripsi, kode_listing)
  searchConditions.push(`judul_properti.ilike.%${searchTerm}%`);
  searchConditions.push(`deskripsi.ilike.%${searchTerm}%`);
  searchConditions.push(`kode_listing.ilike.%${searchTerm}%`);

  // Location fields (kabupaten, provinsi, alamat_lengkap)
  searchConditions.push(`kabupaten.ilike.%${searchTerm}%`);
  searchConditions.push(`provinsi.ilike.%${searchTerm}%`);
  searchConditions.push(`alamat_lengkap.ilike.%${searchTerm}%`);

  // Property type and status
  searchConditions.push(`jenis_properti.ilike.%${searchTerm}%`);
  searchConditions.push(`status.ilike.%${searchTerm}%`);

  // Search for individual words if multiple words (for better matching)
  if (searchWords.length > 1) {
    searchWords.forEach(word => {
      if (word.length > 2) { // Skip very short words
        searchConditions.push(`judul_properti.ilike.%${word}%`);
        searchConditions.push(`deskripsi.ilike.%${word}%`);
        searchConditions.push(`kabupaten.ilike.%${word}%`);
        searchConditions.push(`provinsi.ilike.%${word}%`);
        searchConditions.push(`alamat_lengkap.ilike.%${word}%`);
      }
    });
  }

  console.log('Search conditions count:', searchConditions.length);
  return searchConditions.join(',');
}

// Function to execute search test
async function runSearchTest(testCase) {
  console.log(`\n=== Testing: ${testCase.name} ===`);
  console.log(`Keyword: "${testCase.keyword}"`);

  try {
    const searchCondition = buildSearchQuery(testCase.keyword);

    console.log('SQL OR condition:', searchCondition);

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .or(searchCondition)
      .limit(10);

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    console.log(`Results found: ${data?.length || 0}`);

    if (data && data.length > 0) {
      console.log('Top 5 results:');
      data.slice(0, 5).forEach((property, index) => {
        console.log(`${index + 1}. ${property.kode_listing} - ${property.judul_properti}`);
        console.log(`   Type: ${property.jenis_properti}, Location: ${property.kabupaten}, ${property.provinsi}`);
        console.log(`   Address: ${property.alamat_lengkap}`);
        console.log(`   Description: ${property.deskripsi?.substring(0, 100)}...`);
        console.log('');
      });
    }

    return {
      success: true,
      count: data?.length || 0,
      results: data?.slice(0, 5) || []
    };

  } catch (error) {
    console.error('Test execution error:', error);
    return { success: false, error: error.message };
  }
}

// Main audit function
async function runSearchAudit() {
  console.log('🔍 SEARCH ENGINE AUDIT STARTED');
  console.log('================================');

  const results = {};

  for (const testCase of testCases) {
    const result = await runSearchTest(testCase);
    results[testCase.name] = result;

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 AUDIT SUMMARY');
  console.log('================');

  Object.entries(results).forEach(([name, result]) => {
    const status = result.success ? '✅' : '❌';
    const count = result.success ? result.count : 0;
    console.log(`${status} ${name}: ${count} results`);
  });

  // Save results to file
  import('fs').then(fs => {
    fs.writeFileSync('audit/search-engine/logs/query-outputs.log', JSON.stringify(results, null, 2));
  });

  console.log('\n📁 Results saved to audit/search-engine/logs/query-outputs.log');
}

runSearchAudit().catch(console.error);