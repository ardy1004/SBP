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

const columns = [
  'id','listing_code','title','slug','purpose','property_type',
  'price_offer','price_rent','old_price','price_type',
  'province','city','district','village','address',
  'google_maps_url','latitude','longitude',
  'land_area','building_area','front_width','floors','bedrooms','bathrooms',
  'legal_status','legal_details','ownership_status','bank_name','outstanding_amount',
  'environmental_status','distance_to_river','distance_to_grave','distance_to_powerline','road_width',
  'description','facilities','selling_reason',
  'owner_name','owner_whatsapp_1','owner_whatsapp_2',
  'is_premium','is_featured','is_hot','is_sold','is_choice',
  'views_count','leads_count','status','created_at','updated_at',
  'video_url'
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

// Batch of 100
const batchSize = 100;
const batches = [];
for (let i = 0; i < allProperties.length; i += batchSize) {
  batches.push(allProperties.slice(i, i + batchSize));
}

console.log(`Creating ${batches.length} batches...`);

let batchNum = 1;
for (const batch of batches) {
  let sql = '';
  for (const p of batch) {
    const values = columns.map(col => escapeValue(p[col], col)).join(', ');
    sql += `INSERT OR REPLACE INTO properties (${columns.join(', ')}) VALUES (${values});\n`;
  }
  await writeFile(`seed-batch-${batchNum}.sql`, sql);
  batchNum++;
}

console.log(`✅ Generated ${batches.length} batch files`);
