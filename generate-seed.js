import { readFile, writeFile } from 'node:fs/promises';

const properties = JSON.parse(await readFile('properties_export.json', 'utf8'));

let sql = '';

properties.forEach((p, i) => {
  const values = [
    p.id,
    p.listing_code,
    p.title,
    p.slug,
    p.purpose,
    p.property_type,
    p.price_offer || 0,
    p.price_rent || 0,
    p.old_price || 'null',
    p.price_type || 'null',
    p.province || 'DI Yogyakarta',
    p.city,
    p.district || 'null',
    p.village || 'null',
    p.address || 'null',
    p.google_maps_url || 'null',
    p.latitude || 'null',
    p.longitude || 'null',
    p.land_area || 0,
    p.building_area || 0,
    p.front_width || 'null',
    p.floors || 1,
    p.bedrooms || 0,
    p.bathrooms || 0,
    p.legal_status || 'null',
    p.legal_details || 'null',
    p.ownership_status || 'On Hand',
    p.bank_name || 'null',
    p.outstanding_amount || 'null',
    p.environmental_status || 'Ya Jauh',
    p.distance_to_river || 'null',
    p.distance_to_grave || 'null',
    p.distance_to_powerline || 'null',
    p.road_width || 'null',
    p.description ? `"${p.description.replace(/"/g, '""')}"` : 'null',
    p.facilities ? `'${JSON.stringify(p.facilities).replace(/'/g, "''")}'` : 'null',
    p.selling_reason ? `"${p.selling_reason.replace(/"/g, '""')}"` : 'null',
    p.owner_name || 'null',
    p.owner_whatsapp_1 || 'null',
    p.owner_whatsapp_2 || 'null',
    (p.is_premium ? 1 : 0),
    (p.is_featured ? 1 : 0),
    (p.is_hot ? 1 : 0),
    (p.is_choice ? 1 : 0),
    p.views_count || 0,
    p.leads_count || 0,
    p.status || 'active',
    p.created_at ? `'${p.created_at}'` : 'datetime("now")',
    p.updated_at ? `'${p.updated_at}'` : 'datetime("now")',
  ].map(v => (v === 'null' || typeof v === 'number' || (typeof v === 'string' && v.startsWith("'")) ? v : `'${v.replace(/'/g, "''")}'`)).join(', ');

  sql += `INSERT OR REPLACE INTO properties VALUES (${values});\n`;
});

await writeFile('seed.sql', sql);
console.log(`✅ Generated ${properties.length} INSERT statements`);
