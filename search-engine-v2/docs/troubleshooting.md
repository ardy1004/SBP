# 🔧 Search Engine V2 - Troubleshooting Guide

## Quick Diagnosis

### Is Search Working?
```bash
# Test basic search
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"term": "rumah", "limit": 5}'
```

### Check Database Connection
```bash
# Test Supabase connection
node -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data } = await supabase.from('properties').select('count').limit(1);
console.log('DB connected:', !!data);
"
```

---

## 🔍 Common Issues & Solutions

### 1. Search Returns No Results

#### Symptom
Search queries return empty results even for common terms like "rumah".

#### Diagnosis
```sql
-- Check if data exists
SELECT COUNT(*) FROM properties WHERE jenis_properti ILIKE '%rumah%';

-- Check search vector generation
SELECT id, kode_listing, search_vector FROM properties LIMIT 1;

-- Test FTS query directly
SELECT id, kode_listing, judul_properti
FROM properties
WHERE search_vector @@ plainto_tsquery('indonesian', 'rumah')
LIMIT 5;
```

#### Solutions

**A. Missing Full-Text Search Setup**
```sql
-- Run FTS migration if not done
\i search-engine-v2/database/migrations/002_fulltext_search.sql

-- Regenerate search vectors for existing data
UPDATE properties SET updated_at = NOW() WHERE id IS NOT NULL;
```

**B. Search Vector Not Generated**
```sql
-- Force regeneration of search vectors
UPDATE properties SET search_vector = NULL WHERE search_vector IS NULL;
-- The generated column will auto-regenerate
```

**C. FTS Configuration Issue**
```sql
-- Check PostgreSQL FTS configuration
SELECT cfgname FROM pg_ts_config WHERE cfgname = 'indonesian';

-- Install Indonesian FTS if missing
CREATE TEXT SEARCH CONFIGURATION indonesian (COPY = simple);
```

### 2. Slow Search Performance

#### Symptom
Search queries take >2 seconds to complete.

#### Diagnosis
```sql
-- Check query execution plan
EXPLAIN ANALYZE
SELECT * FROM properties
WHERE search_vector @@ plainto_tsquery('indonesian', 'rumah')
LIMIT 20;

-- Check index usage
SELECT * FROM pg_stat_user_indexes
WHERE relname = 'properties' AND indexname LIKE '%search%';
```

#### Solutions

**A. Missing Indexes**
```sql
-- Create missing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_search_vector
ON properties USING gin(search_vector);
```

**B. Index Not Being Used**
```sql
-- Force re-analyze table statistics
ANALYZE properties;

-- Check if query planner uses index
EXPLAIN SELECT * FROM properties
WHERE search_vector @@ plainto_tsquery('indonesian', 'rumah');
```

**C. Cache Configuration**
```typescript
// Check cache settings in your app
const cacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000
};
```

### 3. Search Analytics Not Working

#### Symptom
Search tracking doesn't work, no analytics data.

#### Diagnosis
```javascript
// Check browser console
console.log(localStorage.getItem('search-analytics-history'));

// Check if analytics hook is initialized
const { getSearchStats } = useSearchAnalytics();
console.log(getSearchStats());
```

#### Solutions

**A. LocalStorage Issues**
```javascript
// Clear corrupted analytics data
localStorage.removeItem('search-analytics-history');
localStorage.removeItem('search-analytics-popular');

// Reload page to reinitialize
window.location.reload();
```

**B. Google Analytics Not Configured**
```typescript
// Check GA configuration
if (typeof window !== 'undefined' && window.gtag) {
  console.log('GA available');
} else {
  console.log('GA not configured');
}
```

### 4. Input Sanitization Errors

#### Symptom
Search fails with "Invalid search term" errors.

#### Diagnosis
```typescript
import { validateSearchInput } from 'search-engine-v2/backend/utils/searchSanitizer';

const result = validateSearchInput('test search term');
console.log(result); // Check warnings and suggestions
```

#### Solutions

**A. Overly Restrictive Validation**
```typescript
// Adjust validation rules if needed
const customValidation = {
  maxLength: 300, // Increase from 200
  allowSpecialChars: true
};
```

**B. Unicode Issues**
```typescript
// Test Unicode handling
const testTerms = [
  'jalan',     // Should work
  'café',      // Accented characters
  'Jakarta',   // Mixed case
  '🏠 rumah'   // Emojis
];

testTerms.forEach(term => {
  const result = validateSearchInput(term);
  console.log(`${term}: ${result.isValid ? 'OK' : 'FAILED'}`);
});
```

### 5. Database Connection Issues

#### Symptom
Search fails with connection errors.

#### Diagnosis
```bash
# Test Supabase connection
curl -I https://your-project.supabase.co

# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### Solutions

**A. Environment Variables**
```bash
# Check .env file
cat .env | grep SUPABASE

# Restart development server
npm run dev
```

**B. Network Issues**
```bash
# Test connectivity
ping your-project.supabase.co

# Check firewall settings
telnet your-project.supabase.co 443
```

### 6. Frontend Component Issues

#### Symptom
Search UI not rendering or not responding.

#### Diagnosis
```typescript
// Check React component mounting
console.log('AdvancedSearch component mounted');

// Check hook initialization
const { trackSearch, getSuggestions } = useSearchAnalytics();
console.log('Analytics hook:', { trackSearch, getSuggestions });
```

#### Solutions

**A. Import Issues**
```typescript
// Verify correct imports
import { AdvancedSearch } from 'search-engine-v2/frontend/components/AdvancedSearch';
import { useSearchAnalytics } from 'search-engine-v2/frontend/hooks/useSearchAnalytics';
import { useDebounce } from 'search-engine-v2/frontend/hooks/useDebounce';
```

**B. TypeScript Errors**
```typescript
// Check for type issues
// Ensure all interfaces are properly imported
interface SearchQuery {
  term: string;
  filters?: Record<string, any>;
  timestamp: number;
  source: string;
}
```

---

## 🧪 Testing & Validation

### Run Test Suite
```bash
# Unit tests
npm run test:unit -- --grep "search"

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e -- --grep "search"
```

### Manual Testing Checklist
- [ ] Search "rumah" returns results
- [ ] Search with filters works
- [ ] Auto-suggestions appear
- [ ] Search history is saved
- [ ] No console errors
- [ ] Performance < 500ms
- [ ] Mobile responsive

### Performance Testing
```bash
# Load testing
npm run test:load -- --url /search --requests 100 --concurrency 10

# Memory leak testing
npm run test:memory -- --component AdvancedSearch
```

---

## 🔧 Advanced Debugging

### Database Query Logging
```sql
-- Enable query logging (temporary)
SET log_statement = 'all';
SET log_duration = on;

-- Run search query and check logs
SELECT * FROM properties
WHERE search_vector @@ plainto_tsquery('indonesian', 'rumah')
LIMIT 5;

-- Disable logging
SET log_statement = 'none';
SET log_duration = off;
```

### Frontend Debug Mode
```typescript
// Enable debug logging
const DEBUG_SEARCH = true;

if (DEBUG_SEARCH) {
  console.log('Search Debug:', {
    term: searchTerm,
    strategy: result.strategy,
    duration: result.analytics.duration,
    resultCount: result.results.length
  });
}
```

### Network Debugging
```bash
# Monitor network requests
curl -v -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"term": "rumah", "debug": true}'
```

---

## 🚨 Emergency Rollback

### Quick Rollback to V1
```typescript
// 1. Replace search component
import { SearchBar } from './components/SearchBar'; // V1 component

// 2. Remove V2 imports
// Remove AdvancedSearch, useSearchAnalytics, etc.

// 3. Revert search logic
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .or('judul_properti.ilike.%term%,deskripsi.ilike.%term%')
  .limit(20);
```

### Database Rollback
```sql
-- Remove V2 tables and columns
DROP TABLE IF EXISTS search_suggestions;
DROP TABLE IF EXISTS search_analytics;
DROP INDEX IF EXISTS idx_properties_search_vector;

-- Keep performance indexes (they help V1 too)
-- idx_properties_judul_properti_gin, etc.
```

---

## 📊 Monitoring & Alerts

### Key Metrics to Monitor
- Search response time (>500ms = alert)
- Search success rate (<95% = alert)
- Error rate (>1% = alert)
- Database connection status

### Health Check Endpoint
```typescript
// Add to your app
app.get('/health/search', async (req, res) => {
  try {
    const searchEngine = new HybridSearchEngine(supabase);
    const result = await searchEngine.search('test', { limit: 1 });

    res.json({
      status: 'healthy',
      responseTime: result.analytics.duration,
      strategy: result.strategy
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## 📞 Support Resources

### Documentation
- [Main README](README.md)
- [API Documentation](api-documentation.md)
- [Changelog](changelog.md)

### Community Support
- GitHub Issues: Report bugs with full error logs
- Stack Overflow: Tag with `salam-bumi-property`
- Discord: Real-time help for urgent issues

### Professional Support
- Email: support@salambumi.property
- SLA: 24 hours for critical issues
- Enterprise: Dedicated support team

---

## 🔍 Diagnostic Script

Run this script to diagnose common issues:

```bash
#!/bin/bash
echo "🔍 Search Engine V2 Diagnostic Script"
echo "===================================="

# Check Node.js version
echo "Node.js version: $(node --version)"

# Check database connection
echo "Testing database connection..."
node -e "
import { createClient } from '@supabase/supabase-js';
try {
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  console.log('✅ Database connection OK');
} catch (error) {
  console.log('❌ Database connection failed:', error.message);
}
"

# Check search functionality
echo "Testing search functionality..."
node -e "
import { HybridSearchEngine } from './search-engine-v2/backend/utils/hybridSearchEngine.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const searchEngine = new HybridSearchEngine(supabase);

searchEngine.search('rumah', { limit: 1 }).then(result => {
  console.log('✅ Search test passed');
  console.log('Strategy used:', result.strategy);
  console.log('Response time:', result.analytics.duration + 'ms');
}).catch(error => {
  console.log('❌ Search test failed:', error.message);
});
"

echo "Diagnostic complete."
```

---

*For urgent issues, include this diagnostic output when reporting problems.*