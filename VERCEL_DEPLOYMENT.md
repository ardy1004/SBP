# Panduan Deploy ke Vercel

Dokumen ini menjelaskan langkah-langkah untuk deploy project Salam Bumi Property ke Vercel.

## Prasyarat

1. Akun Vercel (daftar di https://vercel.com)
2. Repository GitHub/GitLab/Bitbucket yang berisi project ini
3. Vercel CLI (opsional, untuk deploy dari terminal)

## Struktur Project untuk Vercel

```
├── api/                    # Vercel Serverless Functions
│   ├── _lib/
│   │   └── utils.ts       # Shared utilities
│   ├── health.ts          # Health check endpoint
│   ├── chat.ts            # AI Chat API
│   ├── generate-description.ts  # AI Description generator
│   ├── leads.ts           # Lead capture API
│   ├── upload.ts          # Image upload API
│   ├── property-share.ts  # Property share cards
│   └── analytics.ts       # Analytics API
├── client/                 # Frontend React app
│   ├── src/
│   └── index.html
├── vercel.json            # Vercel configuration
├── vite.config.ts         # Vite configuration
└── package.json
```

## Langkah 1: Setup Environment Variables di Vercel

Buka dashboard Vercel > Project Settings > Environment Variables dan tambahkan variabel berikut:

### Variabel Wajib
| Variable Name | Description | Contoh |
|--------------|-------------|--------|
| `SUPABASE_URL` | URL Supabase project | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Anon key dari Supabase | `eyJhbGciOiJ...` |
| `GEMINI_API_KEY` | API key untuk Google Gemini AI | `AIza...` |

### Variabel Opsional (untuk fitur tambahan)
| Variable Name | Description |
|--------------|-------------|
| `GA_SERVICE_ACCOUNT_KEY` | JSON string Google Service Account untuk Analytics |
| `GA_PROPERTY_ID` | Google Analytics 4 Property ID |
| `SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY` | JSON string untuk Search Console API |
| `SEARCH_CONSOLE_SITE_URL` | URL site di Search Console |
| `PAGESPEED_API_KEY` | API key untuk PageSpeed Insights |
| `CF_ACCOUNT_ID` | Cloudflare Account ID untuk image upload |
| `CF_IMAGES_TOKEN` | Cloudflare Images API token |

## Langkah 2: Deploy via Vercel Dashboard

1. Buka https://vercel.com dan login
2. Klik "Add New..." > "Project"
3. Import repository dari GitHub/GitLab/Bitbucket
4. Vercel akan otomatis mendeteksi framework Vite
5. Konfigurasi:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`
6. Klik "Environment Variables" dan tambahkan semua variabel yang diperlukan
7. Klik "Deploy"

## Langkah 3: Deploy via Vercel CLI (Alternatif)

```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy ke production
npm run deploy:vercel

# Atau deploy manual
vercel --prod
```

## Langkah 4: Konfigurasi Domain Custom

1. Buka Project Settings > Domains
2. Tambahkan domain custom (misal: `salambumi.xyz`)
3. Konfigurasi DNS sesuai instruksi Vercel:
   - Untuk root domain: A record ke `76.76.21.21`
   - Untuk subdomain: CNAME ke `cname.vercel-dns.com`
4. Tunggu propagasi DNS (biasanya 5-30 menit)

## API Endpoints yang Tersedia

Setelah deploy, API endpoints berikut akan tersedia:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check sistem |
| `/api/chat` | POST | AI Chat untuk property inquiries |
| `/api/generate-description` | POST | Generate deskripsi properti dengan AI |
| `/api/leads` | GET, POST | Capture dan ambil data leads |
| `/upload` | POST | Upload gambar ke Cloudflare Images |
| `/p/:kode_listing` | GET | Share card untuk properti |
| `/api/analytics` | GET | Data Google Analytics |

## Troubleshooting

### Build Error: "Module not found"
- Pastikan semua dependencies terinstall: `npm install`
- Check apakah ada import yang salah

### API Error: "Internal Server Error"
- Check environment variables di Vercel dashboard
- Lihat logs di Vercel > Deployments > klik deployment > Functions

### Image Upload Error
- Pastikan `CF_ACCOUNT_ID` dan `CF_IMAGES_TOKEN` sudah diset
- Check apakah Cloudflare Images sudah diaktifkan

### CORS Error
- Pastikan domain sudah ditambahkan ke `ALLOWED_ORIGINS` di `api/_lib/utils.ts`
- Check headers di browser developer tools

## Monitoring dan Logs

1. Buka Vercel Dashboard > Project
2. Klik tab "Deployments" untuk melihat history deploy
3. Klik deployment untuk melihat detail dan logs
4. Tab "Functions" menampilkan logs dari serverless functions
5. Tab "Analytics" menampilkan statistik traffic

## Perbedaan dengan Cloudflare Workers

| Fitur | Cloudflare Workers | Vercel Serverless |
|-------|-------------------|-------------------|
| Runtime | V8 Isolates | Node.js |
| Image Storage | R2 Bucket | Cloudflare Images (API) |
| Cold Start | Minimal | ~100-500ms |
| Environment | wrangler.toml | vercel.json + Dashboard |
| Rate Limiting | In-memory (reset per request) | In-memory (reset per cold start) |

## Catatan Penting

1. **Rate Limiting**: Di Vercel, rate limiting menggunakan in-memory storage yang akan reset setiap cold start. Untuk production, pertimbangkan menggunakan Redis atau Upstash.

2. **Image Upload**: Karena Vercel tidak mendukung R2 Bucket, upload gambar menggunakan Cloudflare Images API langsung.

3. **Environment Variables**: Jangan commit file `.env` ke repository. Selalu set environment variables melalui Vercel Dashboard.

4. **Build Output**: Pastikan build output di `dist/public` sesuai dengan konfigurasi `vercel.json`.

## Support

Jika mengalami masalah, cek:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deployment.html#vercel)
- Project logs di Vercel Dashboard
