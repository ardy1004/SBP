import { readFile, writeFile } from 'node:fs/promises';

const imagesData = JSON.parse(await readFile('property_images_export.json', 'utf8'));

const allImages = [];
for (const key in imagesData) {
  const entry = imagesData[key];
  if (entry && Array.isArray(entry.results)) {
    allImages.push(...entry.results);
  }
}

console.log(`Total images to import: ${allImages.length}`);

let sql = '';
let count = 0;

for (const img of allImages) {
  // Extract filename from URL: last part after /
  const url = img.image_url || img.image_webp_url;
  if (!url) continue;

  const filename = url.split('/').pop();
  const id = img.id || crypto.randomUUID();
  const propertyId = img.property_id;
  const isPrimary = img.is_primary ? 1 : 0;
  const sortOrder = img.sort_order || 0;
  const createdAt = img.created_at ? new Date(img.created_at * 1000).toISOString() : 'datetime("now")';

  sql += `INSERT OR REPLACE INTO property_images (id, property_id, url, filename, is_primary, sort_order, created_at) VALUES ('${id}', '${propertyId}', '${url.replace(/'/g, "''")}', '${filename}', ${isPrimary}, ${sortOrder}, '${createdAt}');\n`;
  count++;

  if (count % 100 === 0) process.stdout.write(`\rGenerated ${count}/${allImages.length}...`);
}

await writeFile('seed-images.sql', sql);
console.log(`\n✅ Generated seed-images.sql with ${count} records`);
