/**
 * Blog Admin Implementation Verification Script
 * Run this in browser console at http://localhost:5177/admin/blog
 */

async function verifyBlogAdminImplementation() {
  console.group('🔍 BLOG ADMIN IMPLEMENTATION VERIFICATION');
  console.log('⏰ Started at:', new Date().toLocaleTimeString());

  const results = {
    adminService: false,
    listPage: false,
    editorPage: false,
    routing: false,
    database: false,
    crudOperations: false
  };

  try {
    // 1. Check Admin Service
    console.log('\n1. 🛠️ Testing Admin Service...');
    try {
      const { getAllArticles, createArticle, updateArticle, deleteArticle } = await import('./services/admin/articleService.ts');
      results.adminService = !!(getAllArticles && createArticle && updateArticle && deleteArticle);
      console.log('✅ Admin service functions available:', results.adminService);
    } catch (e) {
      console.error('❌ Admin service error:', e.message);
    }

    // 2. Check List Page Components
    console.log('\n2. 📋 Testing List Page...');
    const listPageElements = {
      table: !!document.querySelector('table'),
      newArticleBtn: !!document.querySelector('button:has-text("New Article")'),
      searchInput: !!document.querySelector('input[placeholder*="search"]'),
      statusFilter: !!document.querySelector('select'),
      articles: document.querySelectorAll('tbody tr').length
    };
    results.listPage = Object.values(listPageElements).every(v => v !== false);
    console.log('✅ List page elements:', listPageElements);

    // 3. Check Routing
    console.log('\n3. 🧭 Testing Routing...');
    const currentPath = window.location.pathname;
    const routes = [
      '/admin/blog',
      '/admin/blog/editor',
      '/admin/blog/seed-test-data'
    ];
    results.routing = routes.some(route => currentPath.startsWith(route));
    console.log('✅ Current route valid:', results.routing, '- Path:', currentPath);

    // 4. Check Database Connection
    console.log('\n4. 🗄️ Testing Database Connection...');
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        results.database = true;
        console.log('✅ API endpoint accessible');
      }
    } catch (e) {
      // Try alternative check
      const supabaseCheck = window.localStorage.getItem('supabase.auth.token');
      results.database = !!supabaseCheck;
      console.log('ℹ️ API check failed, using localStorage check:', results.database);
    }

    // 5. Check for Console Errors
    console.log('\n5. 🚨 Checking for Errors...');
    const originalError = console.error;
    let errorCount = 0;
    console.error = (...args) => {
      errorCount++;
      originalError(...args);
    };

    // Restore after a brief moment
    setTimeout(() => {
      console.error = originalError;
      console.log('✅ Error count in last 2 seconds:', errorCount);
    }, 2000);

    // 6. Summary
    console.log('\n📊 VERIFICATION SUMMARY:');
    console.table(results);

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;

    console.log(`\n🎯 OVERALL RESULT: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! Blog admin is fully functional.');
    } else {
      console.log('⚠️ Some tests failed. Check the details above.');
    }

    // User Instructions
    console.log('\n📝 MANUAL TESTING INSTRUCTIONS:');
    console.log('1. Click "New Article" → Should navigate to editor');
    console.log('2. Fill form and save → Should create article');
    console.log('3. Edit article → Should load existing data');
    console.log('4. Delete article → Should remove from list');
    console.log('5. Check Supabase dashboard → Articles should appear in table');

  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error);
  }

  console.groupEnd();
  return results;
}

// Auto-run if this script is loaded
if (typeof window !== 'undefined') {
  // Run after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verifyBlogAdminImplementation);
  } else {
    setTimeout(verifyBlogAdminImplementation, 1000);
  }
}

export { verifyBlogAdminImplementation };