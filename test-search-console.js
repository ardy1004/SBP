import { google } from 'googleapis';
import fs from 'fs';

async function testSearchConsoleConnection() {
  console.log('🔍 Testing Google Search Console API Connection...\n');

  try {
    // Load Search Console credentials
    const credentials = JSON.parse(fs.readFileSync('../../../pro-lattice-473513-s6-eb198fa17876.json', 'utf8'));

    console.log('📧 Service Account:', credentials.client_email);
    console.log('🏗️  Project ID:', credentials.project_id);
    console.log('🔑 Type:', credentials.type);

    // Authenticate with Search Console
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const searchconsole = google.searchconsole({ version: 'v1', auth });

    console.log('\n📡 Making API call to Search Console...');

    // Test API call - get search analytics data
    const response = await searchconsole.searchanalytics.query({
      siteUrl: 'https://salambumi.xyz',
      requestBody: {
        startDate: '2024-11-25',
        endDate: '2024-12-01',
        dimensions: ['query'],
        rowLimit: 5,
        startRow: 0
      }
    });

    console.log('\n✅ SUCCESS! Search Console API Connected');
    console.log('📊 Response received with', response.data.rows?.length || 0, 'rows');

    if (response.data.rows && response.data.rows.length > 0) {
      console.log('\n📈 Sample Data:');
      response.data.rows.slice(0, 3).forEach((row, index) => {
        const query = row.keys[0] || 'Unknown';
        const clicks = row.clicks || 0;
        const impressions = row.impressions || 0;
        console.log(`  "${query}": ${clicks} clicks, ${impressions} impressions`);
      });
    }

    return true;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }

    return false;
  }
}

testSearchConsoleConnection();