# Fix: Property Data Not Displaying on Homepage

## Problem
After Cloudflare Pages deployment, the homepage showed no properties. API calls to `/api/properties` returned the HTML index page instead of JSON, indicating Cloudflare Functions were not deployed.

## Root Cause
The `functions/` directory (Cloudflare Pages Functions) was not being copied into the build output (`artifacts/salam-bumi/dist/public`). The build only output static frontend files, so all `/api/*` routes fell back to `index.html`.

## Changes Made

### 1. Build Process
- **`package.json`** (root): Added post-build step `node scripts/copy-functions.mjs`
- **`scripts/copy-functions.mjs`**: New script that:
  - Copies all non-TypeScript files from `functions/` to `dist/public/functions`
  - Compiles TypeScript function files to JavaScript
  - Ensures only `.js` files land in build output (Cloudflare Pages requires JS)

### 2. Function Files Converted from TypeScript to JavaScript
All Cloudflare Functions were converted from `.ts` to `.js` to avoid runtime compilation issues:

- `functions/[[catchall]].ts` → `functions/[[catchall]].js`
- `functions/api/sitemap.xml.ts` → `functions/api/sitemap.xml.js`
- `functions/api/sitemap-categories.xml.ts` → `functions/api/sitemap-categories.xml.js`
- `functions/api/sitemap-properties.xml.ts` → `functions/api/sitemap-properties.xml.js`
- `functions/api/properties/[id]/images.ts` → `functions/api/properties/[id]/images.js`

Type annotations removed, logic preserved.

### 3. TypeScript Configuration
- **`tsconfig.functions.json`**: Added (but unused after JS conversion; kept for reference)
- **`functions/global.d.ts`**: Added module declaration for JS imports
- **`package.json`** (root): Added `typescript` devDependency for compilation step

### 4. Cleaned Up
- Removed all `.ts` function files from source (only `.js` remain)
- Verified build output contains only `.js` files under `functions/`

## Files Changed Summary
```
package.json (root)                    | + build script update
scripts/copy-functions.mjs              | NEW
tsconfig.functions.json                 | NEW
functions/global.d.ts                   | NEW
functions/[[catchall]].js               | CONVERTED from .ts
functions/api/sitemap.xml.js            | CONVERTED from .ts
functions/api/sitemap-categories.xml.js | CONVERTED from .ts
functions/api/sitemap-properties.xml.js | CONVERTED from .ts
functions/api/properties/[id]/images.js | CONVERTED from .ts
```

## Validation
- Local `npm run build` completes successfully.
- Build output includes `dist/public/functions/` with all API endpoints as `.js` files.
- Local `wrangler pages dev` (using source `functions/`) confirmed API returns property JSON correctly.
- Deployed site (`sbp-dfg.pages.dev`) should now serve Functions after redeploy.

## Deployment Steps
1. Commit and push changes to GitHub.
2. Cloudflare Pages will automatically redeploy from the pushed commit.
3. After deployment, verify:
   - `https://sbp-dfg.pages.dev/api/properties?limit=1` returns `{"success":true,"data":[...]}`
   - Homepage displays property cards.

## Environment Variables
Ensure Cloudflare Pages project has `VITE_API_URL` set appropriately:
- If the frontend and API are on the same domain (recommended), either unset `VITE_API_URL` or set it to the same domain (e.g., `https://sbp-dfg.pages.dev`).
- If pointing to a different API host, ensure that host is publicly reachable and has CORS enabled for your Pages domain.
