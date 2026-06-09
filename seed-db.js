import { readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';

const properties = JSON.parse(await readFile('properties_export.json', 'utf8'));
const dbPath = '.wrangler/state/v3/d1/DB/db.sqlite';

console.log(`Seeding ${properties.length} properties...`);

// Use sqlite3 to insert data
import('sqlite3').then(({ Database }) => {
  const db = new Database(dbPath);

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    properties.forEach((p, i) => {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO properties (
          id, listing_code, title, slug, purpose, property_type,
          price_offer, price_rent, old_price, price_type,
          province, city, district, village, address,
          google_maps_url, latitude, longitude,
          land_area, building_area, front_width, floors, bedrooms, bathrooms,
          legal_status, legal_details, ownership_status, bank_name, outstanding_amount,
          environmental_status, distance_to_river, distance_to_grave, distance_to_powerline, road_width,
          description, facilities, selling_reason,
          owner_name, owner_whatsapp_1, owner_whatsapp_2,
          is_premium, is_featured, is_hot, is_choice,
          views_count, leads_count, status, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?
        )
      `);

      stmt.run([
        p.id, p.listing_code, p.title, p.slug, p.purpose, p.property_type,
        p.price_offer || 0, p.price_rent || 0, p.old_price || null, p.price_type || null,
        p.province || 'DI Yogyakarta', p.city, p.district || null, p.village || null, p.address || null,
        p.google_maps_url || null, p.latitude || null, p.longitude || null,
        p.land_area || 0, p.building_area || 0, p.front_width || null, p.floors || 1, p.bedrooms || 0, p.bathrooms || 0,
        p.legal_status || null, p.legal_details || null, p.ownership_status || 'On Hand', p.bank_name || null, p.outstanding_amount || null,
        p.environmental_status || 'Ya Jauh', p.distance_to_river || null, p.distance_to_grave || null, p.distance_to_powerline || null, p.road_width || null,
        p.description || null, p.facilities ? JSON.stringify(p.facilities) : null, p.selling_reason || null,
        p.owner_name || null, p.owner_whatsapp_1 || null, p.owner_whatsapp_2 || null,
        p.is_premium ? 1 : 0, p.is_featured ? 1 : 0, p.is_hot ? 1 : 0, p.is_choice ? 1 : 0,
        p.views_count || 0, p.leads_count || 0, p.status || 'active',
        p.created_at || new Date().toISOString(), p.updated_at || new Date().toISOString()
      ]);

      if ((i + 1) % 1000 === 0) {
        console.log(`Inserted ${i + 1}/${properties.length}...`);
      }
    });

    stmt.finalize();
    db.run("COMMIT", (err) => {
      db.close();
      if (err) {
        console.error('Error:', err);
        process.exit(1);
      }
      console.log('✅ Seeding completed!');
      process.exit(0);
    });
  });
}).catch(err => {
  console.error('Failed to import:', err);
  process.exit(1);
});
