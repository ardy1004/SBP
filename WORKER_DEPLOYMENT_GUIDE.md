# 🚀 Panduan Deploy Cloudflare Worker

## 📋 Prasyarat

Pastikan Anda sudah memiliki:
1. Akun Cloudflare (gratis)
2. Wrangler CLI terinstall
3. API Token dari Cloudflare

---

## Step 1: Install Wrangler CLI (Jika Belum)

```bash
# Install via npm
npm install -g wrangler

# Atau install via npx (tidak perlu install global)
npx wrangler --version
```

Verifikasi instalasi:
```bash
wrangler --version
# Harus muncul versi, contoh: wrangler 3.x.x
```

---

## Step 2: Login ke Cloudflare

```bash
wrangler login
```

Ini akan membuka browser untuk autentikasi. Setelah login berhasil, kembali ke terminal.

---

## Step 3: Verifikasi Konfigurasi Worker

Cek file `wrangler.toml` di root project:

```toml
name = "salam-bumi-property"
main = "worker.js"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

# Secrets (jika ada)
# [[env.production.secrets]]
# SUPABASE_URL = "..."
# SUPABASE_ANON_KEY = "..."
```

Pastikan:
- `name` sesuai dengan nama worker di Cloudflare dashboard
- `main` menunjuk ke `worker.js`

---

## Step 4: Deploy Worker

### A. Deploy ke Production

```bash
# Pastikan di root project
cd d:/Backup Web SBP/SBP 08-02-2026/SBP-main/SBP-main

# Deploy
wrangler deploy

# Atau dengan environment specific
wrangler deploy --env production
```

### B. Deploy dengan npx (tanpa install global)

```bash
npx wrangler deploy
```

---

## Step 5: Verifikasi Deploy

Setelah deploy berhasil, Anda akan melihat output seperti:

```
✨ Successfully deployed to:
https://salam-bumi-property.your-subdomain.workers.dev
```

**Cek deploy status:**
```bash
# Lihat logs real-time
wrangler tail

# Atau buka browser dan akses URL worker
https://salam-bumi-property.your-subdomain.workers.dev/api/health
```

---

## 🔧 Troubleshooting Deploy

### Error: "Not authenticated"
```bash
# Login ulang
wrangler login
```

### Error: "Account ID required"
Tambahkan account ID ke `wrangler.toml`:
```toml
name = "salam-bumi-property"
account_id = "YOUR_ACCOUNT_ID"
main = "worker.js"
```

Atau set via environment variable:
```bash
export CLOUDFLARE_ACCOUNT_ID=your_account_id
wrangler deploy
```

### Error: "Script not found"
Pastikan file `worker.js` ada di root project dan tidak error.

---

## 📝 Set Environment Variables (Secrets)

Jika Worker membutuhkan secrets (API keys, dll):

```bash
# Set secret
wrangler secret put SUPABASE_URL
# Akan diminta input nilai secret

wrangler secret put SUPABASE_ANON_KEY
wrangler secret put GEMINI_API_KEY
# ... dan lainnya
```

**List semua secrets:**
```bash
wrangler secret list
```

---

## 🔄 Update Worker Setelah Perubahan

Setiap kali ada perubahan di `worker.js`:

```bash
# Commit ke GitHub (opsional tapi recommended)
git add worker.js
git commit -m "update: deskripsi perubahan"
git push

# Deploy ke Cloudflare
wrangler deploy
```

---

## 📊 Monitor Worker

### Via CLI
```bash
# Lihat logs real-time
wrangler tail

# Lihat metrics
wrangler stats
```

### Via Dashboard
1. Buka https://dash.cloudflare.com
2. Pilih account Anda
3. Klik "Workers & Pages"
4. Pilih worker "salam-bumi-property"
5. Lihat metrics, logs, dan settings

---

## ✅ Checklist Deploy

- [ ] Wrangler CLI terinstall (`wrangler --version`)
- [ ] Sudah login (`wrangler login`)
- [ ] File `wrangler.toml` sudah benar
- [ ] File `worker.js` ada di root
- [ ] Run `wrangler deploy`
- [ ] Verifikasi URL worker berjalan
- [ ] Test dengan share link WhatsApp

---

## 🆘 Bantuan Lanjut

Jika ada masalah:
1. Cek dokumentasi Wrangler: https://developers.cloudflare.com/workers/wrangler/
2. Cek logs: `wrangler tail`
3. Test locally: `wrangler dev`

**Catatan Penting:**
- Deploy Worker **WAJIB** dilakukan agar WhatsApp thumbnail berfungsi
- Push ke GitHub tidak otomatis deploy Worker
- Setiap perubahan di `worker.js` perlu deploy ulang
