/**
 * @workspace/db
 *
 * Package ini menyediakan TypeScript types untuk tabel-tabel D1 (SQLite)
 * yang digunakan oleh Cloudflare Pages Functions.
 *
 * Database diakses via Cloudflare D1 binding (env.DB) di dalam Pages Functions,
 * bukan via koneksi langsung (node-postgres/pg). Tidak ada instance "db" yang
 * dieksport dari sini.
 *
 * Gunakan types dari ./schema untuk type safety di seluruh workspace.
 */

export * from "./schema";
export * from "./types";
