/**
 * Re-export semua types dari types.ts untuk kemudahan import.
 *
 * Contoh penggunaan di Cloudflare Pages Functions:
 *   import type { Property, Lead } from "@workspace/db/schema";
 *
 * Catatan: Package ini hanya menyediakan TypeScript types (no runtime code).
 * Akses database dilakukan via Cloudflare D1 binding (env.DB).
 */
export type {
  Admin,
  Property,
  PropertyImage,
  Lead,
  Contract,
  ActivityLog,
  ImportLog,
  LoginRateLimit,
  D1Env,
} from "../types";
