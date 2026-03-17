# ✅ Deployment Checklist - WhatsApp OG Fix

## 📋 Status Perubahan

### 1. ✅ Frontend (PropertyDetailPage + ShareButtons)
- **Status**: Sudah di-push ke GitHub
- **File yang diubah**:
  - `client/src/pages/PropertyDetailPage.tsx` - OG meta tags
  - `client/src/components/ShareButtons.tsx` - Debounce protection
- **Action needed**: Deploy ke Vercel (jika menggunakan Vercel)

### 2. ⚠️ Backend (Cloudflare Worker) - PENTING!
- **Status**: Sudah di-push ke GitHub, **BELUM DEPLOY**
- **File yang diubah**: `worker.js`
- **Action needed**: **DEPLOY MANUAL** dengan `wrangler deploy`

### 3. 🧪 Testing Tools
- **Status**: Sudah tersedia
- **File**: `test-og-meta.html`, `WHATSAPP_OG_FIX_DOCUMENTATION.md`

---

## 🚀 Langkah Deployment

### Step 1: Deploy Frontend (Vercel)
```bash
# Jika menggunakan Vercel CLI
vercel --prod
```
Atau push ke GitHub akan otomatis trigger Vercel deployment.

### Step 2: Deploy Cloudflare Worker (WAJIB!)
```bash
# Pastikan sudah di root project
cd d:/Backup Web SBP/SBP 08-02-2026/SBP-main/SBP-main

# Deploy worker
npx wrangler deploy

# Atau jika wrangler sudah di-install global
wrangler deploy
```

**Catatan**: Step 2 ini **WAJIB** dilakukan agar WhatsApp thumbnail berfungsi!

---

## 🔍 Verifikasi Setelah Deploy

### 1. Test Share Buttons (Frontend)
```
1. Buka halaman properti
2. Klik tombol WhatsApp share
3. Pastikan tidak ada duplikat text
4. Format seharusnya: "[Judul] di [Lokasi]. Harga: [Harga]"
```

### 2. Test OG Meta Tags (Worker)
```
1. Buka: https://developers.facebook.com/tools/debug/
2. Masukkan URL properti (contoh: https://salambumi.xyz/dijual-rumah-yogyakarta-sleman-judul-K2.60)
3. Klik "Debug"
4. Pastikan og:image muncul dengan benar
```

### 3. Test WhatsApp
```
1. Share link properti via WhatsApp
2. Tunggu preview load (bisa sampai 24 jam untuk cache baru)
3. Pastikan thumbnail muncul
```

---

## ⚠️ Troubleshooting

### Jika thumbnail masih tidak muncul setelah deploy:

1. **Clear WhatsApp Cache**
   - WhatsApp cache OG tags selama 24 jam
   - Solusi: Gunakan URL dengan query parameter baru:
     ```
     https://salambumi.xyz/dijual-rumah-yogyakarta-sleman-judul-K2.60?v=2
     ```

2. **Cek Worker Deployment**
   ```bash
   # Cek logs
   wrangler tail
   ```

3. **Cek Image URL Accessible**
   - Buka URL gambar langsung di browser
   - Pastikan bisa diakses tanpa login

4. **Cek Facebook Sharing Debugger**
   - https://developers.facebook.com/tools/debug/
   - Pastikan tidak ada error

---

## 📞 Need Help?

Jika ada masalah:
1. Cek dokumentasi: `WHATSAPP_OG_FIX_DOCUMENTATION.md`
2. Test dengan: `test-og-meta.html` (buka di browser)
3. Cek Worker logs dengan `wrangler tail`

---

**Last Updated**: 2026-03-03  
**Deploy Status**: Frontend ✅ | Backend ⚠️ (Pending manual deploy)
