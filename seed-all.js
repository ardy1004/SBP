import { readFile, writeFile } from 'node:fs/promises';

const exportData = JSON.parse(await readFile('properties_export.json', 'utf8'));

// Extract all property records from API response format
const allProperties = [];
for (const key in exportData) {
  const entry = exportData[key];
  if (entry && Array.isArray(entry.results)) {
    allProperties.push(...entry.results);
  }
}

console.log(`Total properties to seed: ${allProperties.length}`);

// Generate SQL inserts
let sql = '';
let count = 0;

for (const p of allProperties) {
  const values = [
    p.id || `prop-${Math.random().toString(36).substr(2, 9)}`,
    p.listing_code || '',
    p.title || '',
    p.slug || '',
    p.purpose || '',
    p.property_type || '',
    p.price_offer || 0,
    p.price_rent || 0,
    p.old_price ?? 'NULL',
    p.price_type ?? 'NULL',
    p.province || 'DI Yogyakarta',
    p.city || '',
    p.district ?? 'NULL',
    p.village ?? 'NULL',
    p.address ?? 'NULL',
    p.google_maps_url ?? 'NULL',
    p.latitude ?? 'NULL',
    p.longitude ?? 'NULL',
    p.land_area || 0,
    p.building_area || 0,
    p.front_width ?? 'NULL',
    p.floors || 1,
    p.bedrooms || 0,
    p.bathrooms || 0,
    p.legal_status ?? 'NULL',
    p.legal_details ?? 'NULL', // May not exist in DB, will be ignored
    p.ownership_status || 'On Hand',
    p.bank_name ?? 'NULL',
    p.outstanding_amount ?? 'NULL',
    p.environmental_status || 'Ya Jauh',
    p.distance_to_river ?? 'NULL',
    p.distance_to_grave ?? 'NULL',
    p.distance_to_powerline ?? 'NULL',
    p.road_width ?? 'NULL',
    p.description ? `"${p.description.replace(/"/g, '""')}"` : 'NULL',
    p.facilities ? `'${JSON.stringify(p.facilities).replace(/'/g, "''")}'` : 'NULL',
    p.selling_reason ? `"${(p.selling_reason || '').replace(/"/g, '""')}"` : 'NULL',
    p.owner_name ?? 'NULL',
    p.owner_whatsapp_1 ?? 'NULL',
    p.owner_whatsapp_2 ?? 'NULL',
    p.is_premium ? 1 : 0,
    p.is_featured ? 1 : 0,
    p.is_hot ? 1 : 0,
    p.is_choice ? 1 : 0,
    p.views_count || 0,
    p.leads_count || 0,
    p.status || 'active',
    p.created_at ? `'${p.created_at}'` : 'datetime("now")',
    p.updated_at ? `'${p.updated_at}'` : 'datetime("now")',
  ].map(v => (v === 'NULL' || typeof v === 'number' || (typeof v === 'string' && (v.startsWith("'") || v.startsWith('"') || v.startsWith('datetime')))) ? v : `'${String(v).replace(/'/g, "''")}'`).join(', ');

  sql += `INSERT OR REPLACE INTO properties VALUES (${values});\n`;
  count++;

  if (count % 100 === 0) {
    process.stdout.write(`\rGenerated ${count}/${allProperties.length}...`);
  }
}

await writeFile('seed-all.sql', sql);
console.log(`\n✅ Generated seed-all.sql with ${count} INSERT statements`);
