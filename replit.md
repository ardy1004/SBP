# Workspace

## Overview

Full-stack property listing platform for Salam Bumi Property (Yogyakarta).
Monorepo using pnpm workspaces with Cloudflare Pages deployment.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Frontend**: React 19 + Vite 7 + Wouter (routing) + Tailwind CSS v4
- **Backend**: Cloudflare Pages Functions (JavaScript/TypeScript)
- **Database**: Cloudflare D1 (SQLite)
- **Object Storage**: Cloudflare R2 (property images)
- **Auth**: Custom JWT (HMAC-SHA256) + salted SHA-256 password hashing
- **Package manager**: pnpm
- **TypeScript**: 5.9

## Structure

```text
├── artifacts/salam-bumi/   # React SPA frontend (Vite)
│   ├── src/
│   │   ├── pages/          # Public pages (Home, Properties, PropertyDetail)
│   │   ├── admin/          # Admin dashboard pages + AuthContext
│   │   ├── components/     # Shared UI components
│   │   ├── lib/            # API client, utils
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Slug generator, SEO utils
│   ├── dist/public/        # Build output (served by Pages)
│   └── vite.config.ts
├── functions/              # Cloudflare Pages Functions (API backend)
│   └── api/
│       ├── auth/           # Login, verify
│       ├── properties/     # CRUD properties
│       ├── leads/          # Lead management
│       ├── contracts/      # Contract management
│       ├── import/         # CSV import
│       ├── analytics/      # Dashboard stats
│       └── _utils/         # CORS, JWT, shared helpers
├── lib/db/                 # D1 type definitions (no runtime code)
├── migrations/             # SQL migration files
├── schema.sql              # Canonical database schema
├── wrangler.toml           # Cloudflare Pages config
└── .dev.vars               # Local secrets (gitignored)
```

## Key Commands

```bash
pnpm dev                    # Vite dev server (frontend only)
pnpm dev:pages              # Wrangler Pages dev (backend + D1)
pnpm dev:pages:local        # Wrangler Pages dev (local D1 only)
pnpm dev:full               # Both frontend + backend (concurrently)
pnpm build:frontend         # Build frontend for production
```

## Deployment

- **Platform**: Cloudflare Pages
- **Domain**: salambumi.xyz (custom domain)
- **Database**: Cloudflare D1 (salambumi-property-db)
- **Storage**: Cloudflare R2 (images bucket)
- **Branch**: main → production
- **Secrets**: `wrangler pages secret put JWT_SECRET --project-name salambumi-property`
- **Build command** (Dashboard): `pnpm run build:frontend`
- **Build output**: `artifacts/salam-bumi/dist/public`

## Database

Remote D1 has 537 properties, 2088 images, 1 admin account.
Schema migrations are in `/migrations/` directory.
Use `schema.sql` as canonical reference.

## Admin Credentials

Set via `wrangler pages secret put JWT_SECRET`.
Login at `/admin/login` with admin email + password.
Password hash format: `salt$<base64_salt>$<sha256_hex>`
