/**
 * Location Data Normalization Script
 *
 * This script normalizes location data in the Supabase database
 * to ensure consistency with the LocationService master data.
 *
 * Usage:
 *   node scripts/normalize-location-data.js [--dry-run] [--batch-size=100]
 *
 * Options:
 *   --dry-run       Preview changes without applying them
 *   --batch-size    Number of records to process per batch (default: 100)
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Location mappings (sync with client/src/data/locations/indonesia.ts)
const provinsiMappings = {
  // DI Yogyakarta
  'di.yogyakarta': 'DI Yogyakarta',
  'di yogyakarta': 'DI Yogyakarta',
  'd.i yogyakarta': 'DI Yogyakarta',
  'diy': 'DI Yogyakarta',
  'yogyakarta': 'DI Yogyakarta',
  'daerah istimewa yogyakarta': 'DI Yogyakarta',

  // DKI Jakarta
  'dki jakarta': 'DKI Jakarta',
  'jakarta': 'DKI Jakarta',
  'dki': 'DKI Jakarta',

  // Jawa Barat
  'jawa barat': 'Jawa Barat',
  'jabar': 'Jawa Barat',

  // Jawa Tengah
  'jawa tengah': 'Jawa Tengah',
  'jateng': 'Jawa Tengah',

  // Jawa Timur
  'jawa timur': 'Jawa Timur',
  'jatim': 'Jawa Timur',

  // Banten
  'banten': 'Banten',

  // Bali
  'bali': 'Bali',
};

const kabupatenMappings = {
  // Yogyakarta
  'sleman': 'Sleman',
  'kabupaten sleman': 'Sleman',
  'bantul': 'Bantul',
  'kabupaten bantul': 'Bantul',
  'kulon progo': 'Kulon Progo',
  'kulonprogo': 'Kulon Progo',
  'gunung kidul': 'Gunung Kidul',
  'gunungkidul': 'Gunung Kidul',
  'kota yogyakarta': 'Kota Yogyakarta',
  'yogyakarta kota': 'Kota Yogyakarta',
  'jogja': 'Kota Yogyakarta',
  'kota jogja': 'Kota Yogyakarta',

  // Jakarta
  'jakarta pusat': 'Kota Jakarta Pusat',
  'kota jakarta pusat': 'Kota Jakarta Pusat',
  'jakpus': 'Kota Jakarta Pusat',
  'jakarta utara': 'Kota Jakarta Utara',
  'kota jakarta utara': 'Kota Jakarta Utara',
  'jakut': 'Kota Jakarta Utara',
  'jakarta barat': 'Kota Jakarta Barat',
  'kota jakarta barat': 'Kota Jakarta Barat',
  'jakbar': 'Kota Jakarta Barat',
  'jakarta selatan': 'Kota Jakarta Selatan',
  'kota jakarta selatan': 'Kota Jakarta Selatan',
  'jaksel': 'Kota Jakarta Selatan',
  'jakarta timur': 'Kota Jakarta Timur',
  'kota jakarta timur': 'Kota Jakarta Timur',
  'jaktim': 'Kota Jakarta Timur',

  // Jawa Barat
  'bogor': 'Bogor',
  'kabupaten bogor': 'Bogor',
  'kota bogor': 'Kota Bogor',
  'bogor kota': 'Kota Bogor',
  'bandung': 'Bandung',
  'kabupaten bandung': 'Bandung',
  'kota bandung': 'Kota Bandung',
  'bandung kota': 'Kota Bandung',
  'bekasi': 'Bekasi',
  'kabupaten bekasi': 'Bekasi',
  'kota bekasi': 'Kota Bekasi',
  'bekasi kota': 'Kota Bekasi',
  'depok': 'Kota Depok',
  'kota depok': 'Kota Depok',
  'tangerang': 'Tangerang',
  'kabupaten tangerang': 'Tangerang',
  'kota tangerang': 'Kota Tangerang',
  'tangerang kota': 'Kota Tangerang',
  'tangerang selatan': 'Kota Tangerang Selatan',
  'kota tangerang selatan': 'Kota Tangerang Selatan',
  'tangsel': 'Kota Tangerang Selatan',

  // Jawa Tengah
  'semarang': 'Semarang',
  'kabupaten semarang': 'Semarang',
  'kota semarang': 'Kota Semarang',
  'semarang kota': 'Kota Semarang',
  'solo': 'Kota Surakarta',
  'surakarta': 'Kota Surakarta',
  'kota surakarta': 'Kota Surakarta',
  'kota solo': 'Kota Surakarta',

  // Jawa Timur
  'surabaya': 'Kota Surabaya',
  'kota surabaya': 'Kota Surabaya',
  'surabaya kota': 'Kota Surabaya',
  'malang': 'Malang',
  'kabupaten malang': 'Malang',
  'kota malang': 'Kota Malang',
  'malang kota': 'Kota Malang',
  'sidoarjo': 'Sidoarjo',
  'kabupaten sidoarjo': 'Sidoarjo',

  // Bali
  'denpasar': 'Kota Denpasar',
  'kota denpasar': 'Kota Denpasar',
  'denpasar kota': 'Kota Denpasar',
  'badung': 'Badung',
  'kabupaten badung': 'Badung',
  'gianyar': 'Gianyar',
  'kabupaten gianyar': 'Gianyar',
};

/**
 * Normalize a location value using mappings
 */
function normalizeLocation(value, type) {
  if (!value) return value;

  const normalized = value.toString().toLowerCase().trim();
  const mappings = type === 'provinsi' ? provinsiMappings : kabupatenMappings;

  // Direct match
  if (mappings[normalized]) {
    return mappings[normalized];
  }

  // Try with removed prefixes for kabupaten
  if (type === 'kabupaten') {
    const withoutPrefix = normalized
      .replace(/^kota\s+/, '')
      .replace(/^kabupaten\s+/, '')
      .trim();

    if (mappings[withoutPrefix]) {
      return mappings[withoutPrefix];
    }
  }

  // Return original if no mapping found
  return value;
}

/**
 * Fetch properties in batches
 */
async function* fetchProperties(batchSize = 100) {
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('properties')
      .select('id, provinsi, kabupaten, kecamatan, kelurahan')
      .range(offset, offset + batchSize - 1);

    if (error) {
      throw new Error(`Error fetching properties: ${error.message}`);
    }

    if (data && data.length > 0) {
      yield data;
      offset += data.length;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }
}

/**
 * Update a property with normalized location data
 */
async function updateProperty(id, updates, dryRun = false) {
  if (dryRun) {
    console.log(`[DRY RUN] Would update property ${id}:`, updates);
    return true;
  }

  const { error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error(`Error updating property ${id}:`, error.message);
    return false;
  }

  return true;
}

/**
 * Main migration function
 */
async function runMigration(options = {}) {
  const { dryRun = false, batchSize = 100 } = options;

  console.log('========================================');
  console.log('Location Data Normalization Script');
  console.log('========================================');
  console.log(`Mode: ${dryRun ? 'DRY RUN (preview only)' : 'LIVE'}`);
  console.log(`Batch size: ${batchSize}`);
  console.log('');

  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalErrors = 0;
  const stats = {
    provinsi: { changed: 0, unchanged: 0 },
    kabupaten: { changed: 0, unchanged: 0 },
  };

  // Process properties in batches
  for await (const batch of fetchProperties(batchSize)) {
    console.log(`Processing batch of ${batch.length} properties...`);

    for (const property of batch) {
      totalProcessed++;

      const updates = {};

      // Normalize provinsi
      if (property.provinsi) {
        const normalizedProvinsi = normalizeLocation(property.provinsi, 'provinsi');
        if (normalizedProvinsi !== property.provinsi) {
          updates.provinsi = normalizedProvinsi;
          stats.provinsi.changed++;
        } else {
          stats.provinsi.unchanged++;
        }
      }

      // Normalize kabupaten
      if (property.kabupaten) {
        const normalizedKabupaten = normalizeLocation(property.kabupaten, 'kabupaten');
        if (normalizedKabupaten !== property.kabupaten) {
          updates.kabupaten = normalizedKabupaten;
          stats.kabupaten.changed++;
        } else {
          stats.kabupaten.unchanged++;
        }
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        const success = await updateProperty(property.id, updates, dryRun);
        if (success) {
          totalUpdated++;
          if (dryRun) {
            console.log(`  Property ${property.id}:`);
            if (updates.provinsi) {
              console.log(`    Provinsi: "${property.provinsi}" -> "${updates.provinsi}"`);
            }
            if (updates.kabupaten) {
              console.log(`    Kabupaten: "${property.kabupaten}" -> "${updates.kabupaten}"`);
            }
          }
        } else {
          totalErrors++;
        }
      }
    }
  }

  // Print summary
  console.log('');
  console.log('========================================');
  console.log('Migration Summary');
  console.log('========================================');
  console.log(`Total properties processed: ${totalProcessed}`);
  console.log(`Total properties updated: ${totalUpdated}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log('');
  console.log('Provinsi changes:');
  console.log(`  Changed: ${stats.provinsi.changed}`);
  console.log(`  Unchanged: ${stats.provinsi.unchanged}`);
  console.log('');
  console.log('Kabupaten changes:');
  console.log(`  Changed: ${stats.kabupaten.changed}`);
  console.log(`  Unchanged: ${stats.kabupaten.unchanged}`);
  console.log('========================================');

  if (dryRun) {
    console.log('');
    console.log('This was a DRY RUN. No changes were applied.');
    console.log('To apply changes, run without --dry-run flag.');
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    batchSize: 100,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--batch-size=')) {
      options.batchSize = parseInt(arg.split('=')[1], 10) || 100;
    }
  }

  return options;
}

// Run migration
const options = parseArgs();
runMigration(options)
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error.message);
    process.exit(1);
  });