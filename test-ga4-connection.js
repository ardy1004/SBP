import { google } from 'googleapis';
import fs from 'fs';

async function testGA4Connection() {
  console.log('🔍 Testing GA4 API Connection...\n');

  try {
    // Load credentials from JSON file
    const credentials = JSON.parse(fs.readFileSync('./pro-lattice-473513-s6-27e5dc8cf7d4.json', 'utf8'));

    console.log('📧 Service Account:', credentials.client_email);
    console.log('🏗️  Project ID:', credentials.project_id);
    console.log('🔑 Type:', credentials.type);

    // Authenticate with GA4
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    console.log('\n📡 Making API call to GA4...');

    // Test API call - get basic metrics
    const response = await analyticsData.properties.runReport({
      property: 'properties/513948591',
      requestBody: {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }]
      }
    });

    console.log('\n✅ SUCCESS! GA4 API Connected');
    console.log('📊 Response received with', response.data.rows?.length || 0, 'rows');

    if (response.data.rows && response.data.rows.length > 0) {
      console.log('\n📈 Sample Data:');
      response.data.rows.slice(0, 3).forEach((row, index) => {
        const date = row.dimensionValues[0].value;
        const users = row.metricValues[0].value;
        console.log(`  ${date}: ${users} users`);
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

testGA4Connection();