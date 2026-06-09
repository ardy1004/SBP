// lib/db drizzle.config.ts — TIDAK AKTIF
//
// Project menggunakan Cloudflare D1 (SQLite) yang dikelola via:
//   wrangler d1 execute salambumi-property-db --file=migrations/<file>.sql
//
// Drizzle ORM dengan node-postgres TIDAK digunakan.
// File ini dipertahankan sebagai placeholder agar TypeScript build tidak error.
//
// Jika di masa depan ingin menggunakan Drizzle dengan D1, gunakan:
//   import { defineConfig } from "drizzle-kit";
//   export default defineConfig({ dialect: "sqlite", schema: "./src/schema/index.ts" });

export default {};
