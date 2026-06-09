import { readFile, writeFile } from 'node:fs/promises';

const exportData = JSON.parse(await readFile('properties_export.json', 'utf8'));

const allProperties = [];
for (const key in exportData) {
  const entry = exportData[key];
  if (entry && Array.isArray(entry.results)) {
    allProperties.push(...entry.results);
  }
}

console.log(`Total properties: ${allProperties.length}`);

// Correct column order from PRAGMA table_info (51 columns)
const columns = [
  'id','listing_code','title','slug','purpose','property_type',
  'price_offer','price_rent','old_price','price_type',
  'province','city','district','village','address',
  'google_maps_url','latitude','longitude',
  'land_area','building_area','front_width','floors','bedrooms','bathrooms',
  'legal_status','ownership_status','bank_name','outstanding_amount',
  'environmental_status','distance_to_river','distance_to_grave','distance_to_powerline','road_width',
  'description','facilities','selling_reason',
  'owner_name','owner_whatsapp_1','owner_whatsapp_2',
  'is_premium','is_featured','is_hot','is_sold','is_choice',
  'views_count','leads_count','status','created_at','updated_at',
  'legal_details','video_url'  // added columns (last)
];

function escapeValue(v, col) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v.toString();
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (col === 'facilities' && Array.isArray(v)) return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
  if (col === 'facilities' && typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
  const str = String(v).replace(/'/g, "''");
  return `'${str}'`;
}

let sql = '';
let count = 0;

for (const p of allProperties) {
  const values = columns.map(col => escapeValue(p[col], col)).join(', ');
  sql += `INSERT OR REPLACE INTO properties (${columns.join(', ')}) VALUES (${values});\n`;
  count++;
  if (count % 100 === 0) process.stdout.write(`\rGenerated ${count}/${allProperties.length}...`);
}

await writeFile('seed-final.sql', sql);
console.log(`\n✅ Generated seed-final.sql with ${count} records`);
