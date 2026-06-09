/**
 * Script untuk migrasi slug existing ke format baru
 * 
 * Langkah:
 * 1. Backup slug lama ke slug_redirects
 * 2. Generate slug baru untuk semua properti
 * 3. Update database
 */

// Import slug generator
import { generateSlug } from './artifacts/salam-bumi/src/utils/slugGenerator.js';

// Fungsi untuk jalankan migrasi via API
async function runMigration() {
  console.log('=== SLUG MIGRATION SCRIPT ===\n');
  
  // Test generate beberapa slug
  const testCases = [
    { title: 'Rumah Mewah 2 Lantai di Sleman', type: 'Rumah', location: 'Sleman', code: 'R3.27' },
    { title: 'Kost Putri Exclusive 14 Kamar', type: 'Kost', location: 'Yogyakarta', code: 'K2.36' },
    { title: 'Tanah Strategis Pinggir Jalan', type: 'Tanah', location: 'Klaten', code: 'T33' },
  ];
  
  console.log('Test slug generation:');
  testCases.forEach((t, i) => {
    const slug = generateSlug({
      title: t.title,
      propertyType: t.type,
      location: t.location,
      listingCode: t.code
    });
    console.log(`  ${i+1}. ${t.title}`);
    console.log(`     → ${slug}`);
  });
  
  console.log('\n✅ Slug generator siap digunakan');
  console.log('\nUntuk migrasi database, jalankan:');
  console.log('  wrangler d1 execute salambumi-property-db --local --file=migrations/002_add_slug_redirects.sql');
}

runMigration();
