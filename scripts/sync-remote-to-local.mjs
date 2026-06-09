#!/usr/bin/env node
/**
 * Sync data dari remote D1 ke local D1 untuk development.
 * 
 * Cara pakai:
 *   node scripts/sync-remote-to-local.mjs
 * 
 * Prasyarat:
 *   - wrangler sudah login (wrangler login)
 *   - wrangler.toml sudah dikonfigurasi dengan database_id
 *   - wrangler pages dev TIDAK sedang berjalan (lock conflict)
 */
import { execSync } from "child_process";

const DB_NAME = "salambumi-property-db";

function run(cmd) {
  try {
    const result = execSync(cmd, { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 });
    return result;
  } catch (e) {
    console.error(`Command failed: ${cmd}`);
    console.error(e.stderr || e.message);
    process.exit(1);
  }
}

function d1Remote(sql) {
  const raw = run(`wrangler d1 execute ${DB_NAME} --remote --command "${sql.replace(/"/g, '\\"')}" --json`);
  return JSON.parse(raw);
}

function d1Local(sql) {
  const raw = run(`wrangler d1 execute ${DB_NAME} --local --command "${sql.replace(/"/g, '\\"')}" --json`);
  return JSON.parse(raw);
}

function d1LocalFile(file) {
  run(`wrangler d1 execute ${DB_NAME} --local --file=${file}`);
}

console.log("=== Sync Remote D1 → Local D1 ===\n");

// Step 1: Cek local tables
console.log("1. Memastikan schema lokal...");
d1LocalFile("schema.sql");
console.log("   Schema diterapkan.\n");

// Step 2: Seed admin  
console.log("2. Seed admin...");
d1LocalFile("migrations/004_consolidated_admin_password.sql");
console.log("   Admin di-seed.\n");

// Step 3: Export properties dari remote
console.log("3. Mengambil properti dari remote...");
const propsResult = d1Remote("SELECT * FROM properties");
const properties = propsResult[0]?.results || [];
console.log(`   Ditemukan ${properties.length} properti.`);

if (properties.length > 0) {
  // Get column names from first row
  const cols = Object.keys(properties[0]);
  
  // Batch insert (50 per batch)
  const BATCH = 50;
  let inserted = 0;
  
  for (let i = 0; i < properties.length; i += BATCH) {
    const batch = properties.slice(i, i + BATCH);
    for (const row of batch) {
      const values = cols.map(c => {
        const v = row[c];
        if (v === null || v === undefined) return "NULL";
        if (typeof v === "number") return String(v);
        return `'${String(v).replace(/'/g, "''")}'`;
      });
      const sql = `INSERT OR IGNORE INTO properties (${cols.join(",")}) VALUES (${values.join(",")})`;
      try {
        d1Local(sql);
        inserted++;
      } catch {}
    }
    process.stdout.write(`   Inserted ${Math.min(i + BATCH, properties.length)}/${properties.length}\r`);
  }
  console.log(`\n   ${inserted} properti di-insert.\n`);
}

// Step 4: Export property_images
console.log("4. Mengambil gambar properti dari remote...");
const imgResult = d1Remote("SELECT * FROM property_images");
const images = imgResult[0]?.results || [];
console.log(`   Ditemukan ${images.length} gambar.`);

if (images.length > 0) {
  const cols = Object.keys(images[0]);
  let inserted = 0;
  
  for (let i = 0; i < images.length; i++) {
    const row = images[i];
    const values = cols.map(c => {
      const v = row[c];
      if (v === null || v === undefined) return "NULL";
      if (typeof v === "number") return String(v);
      return `'${String(v).replace(/'/g, "''")}'`;
    });
    const sql = `INSERT OR IGNORE INTO property_images (${cols.join(",")}) VALUES (${values.join(",")})`;
    try {
      d1Local(sql);
      inserted++;
    } catch {}
    if (i % 100 === 0) process.stdout.write(`   Inserted ${i}/${images.length}\r`);
  }
  console.log(`\n   ${inserted} gambar di-insert.\n`);
}

// Step 5: Export leads
console.log("5. Mengambil leads dari remote...");
const leadsResult = d1Remote("SELECT * FROM leads");
const leads = leadsResult[0]?.results || [];
console.log(`   Ditemukan ${leads.length} leads.`);

if (leads.length > 0) {
  const cols = Object.keys(leads[0]);
  for (const row of leads) {
    const values = cols.map(c => {
      const v = row[c];
      if (v === null || v === undefined) return "NULL";
      if (typeof v === "number") return String(v);
      return `'${String(v).replace(/'/g, "''")}'`;
    });
    const sql = `INSERT OR IGNORE INTO leads (${cols.join(",")}) VALUES (${values.join(",")})`;
    try { d1Local(sql); } catch {}
  }
  console.log(`   ${leads.length} leads di-insert.\n`);
}

// Step 6: Verifikasi
console.log("6. Verifikasi lokal...");
const localCount = d1Local("SELECT (SELECT COUNT(*) FROM properties) as props, (SELECT COUNT(*) FROM property_images) as imgs, (SELECT COUNT(*) FROM leads) as leads, (SELECT COUNT(*) FROM admins) as admins");
const counts = localCount[0]?.results?.[0];
console.log(`   Properties: ${counts?.props || 0}`);
console.log(`   Images:     ${counts?.imgs || 0}`);
console.log(`   Leads:      ${counts?.leads || 0}`);
console.log(`   Admins:     ${counts?.admins || 0}`);

console.log("\n=== Sync selesai! ===");
console.log("Jalankan: pnpm dev:pages:local && pnpm dev");
