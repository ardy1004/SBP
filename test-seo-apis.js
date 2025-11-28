#!/usr/bin/env node

/**
 * Test script for Search Console and PageSpeed Insights APIs
 * Run with: node test-seo-apis.js
 */

const API_BASE = 'http://localhost:8787'; // Adjust if your worker runs on different port

async function testAPI(endpoint, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`📡 Endpoint: ${endpoint}`);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();

    console.log(`📊 Status: ${response.status}`);
    console.log(`✅ Response:`, JSON.stringify(data, null, 2).substring(0, 500) + '...');

    if (response.ok) {
      console.log(`✅ ${description} - SUCCESS`);
      return { success: true, data };
    } else {
      console.log(`❌ ${description} - FAILED`);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`❌ ${description} - ERROR:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting SEO APIs Test Suite');
  console.log('=' .repeat(50));

  // Test Search Console API
  const searchConsoleResult = await testAPI(
    '/api/search-console?days=7',
    'Search Console API (7 days)'
  );

  // Test PageSpeed Insights API
  const pageSpeedResult = await testAPI(
    '/api/pagespeed?url=https://salambumi.xyz',
    'PageSpeed Insights API'
  );

  // Test with invalid URL
  const invalidUrlResult = await testAPI(
    '/api/pagespeed?url=invalid-url',
    'PageSpeed Insights API (Invalid URL)'
  );

  // Test missing credentials scenario (if possible)
  const missingCredsResult = await testAPI(
    '/api/search-console?days=999',
    'Search Console API (Edge case)'
  );

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST SUMMARY:');
  console.log(`Search Console: ${searchConsoleResult.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`PageSpeed Insights: ${pageSpeedResult.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Error Handling: ${invalidUrlResult.success ? '⚠️ UNEXPECTED' : '✅ PASS'}`);
  console.log(`Edge Cases: ${missingCredsResult.success ? '✅ PASS' : '❌ FAIL'}`);

  const totalTests = 4;
  const passedTests = [
    searchConsoleResult.success,
    pageSpeedResult.success,
    !invalidUrlResult.success, // Should fail for invalid URL
    missingCredsResult.success
  ].filter(Boolean).length;

  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! SEO APIs are working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the implementation.');
  }
}

// Run tests
runTests().catch(console.error);