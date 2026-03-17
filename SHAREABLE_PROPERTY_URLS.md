# Shareable Property URLs dengan Dynamic OG Image

Fitur ini memungkinkan setiap properti memiliki URL pendek yang dapat dishare ke media sosial dengan preview yang menarik.

## 🚀 Fitur Utama

- **URL Short Share**: `https://salambumi.xyz/p/[PROPERTY_ID]`
- **Dynamic OG Image**: Preview menampilkan gambar utama properti
- **Auto Redirect**: Otomatis redirect ke halaman detail setelah 1 detik
- **Social Media Ready**: Kompatibel dengan WhatsApp, Facebook, Instagram, Telegram

## 📋 Implementasi Teknis

### 1. Endpoint `/p/[PROPERTY_ID]`

Endpoint ini di-handle oleh Cloudflare Worker yang:
- Fetch data properti dari Supabase
- Generate HTML dengan meta tags OG dinamis
- Auto redirect ke `/properti/[PROPERTY_ID]`

### 2. Meta Tags yang Digenerate

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://salambumi.xyz/p/[PROPERTY_ID]">
<meta property="og:title" content="[JUDUL_PROPERTI]">
<meta property="og:description" content="[DESKRIPSI_RINGKAS]">
<meta property="og:image" content="[URL_GAMBAR_UTAMA]">
<meta property="og:site_name" content="Salam Bumi Property">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[JUDUL_PROPERTI]">
<meta name="twitter:description" content="[DESKRIPSI_RINGKAS]">
<meta name="twitter:image" content="[URL_GAMBAR_UTAMA]">
```

### 3. Auto Redirect

```html
<meta http-equiv="refresh" content="1; url=/properti/[PROPERTY_ID]">
```

## 🔧 Konfigurasi

### Environment Variables (wrangler.toml)

```toml
[vars]
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "your-anon-key"
```

### Routing

- `/p/[PROPERTY_ID]` → Share card dengan OG meta tags
- `/properti/[PROPERTY_ID]` → Halaman detail properti (React SPA)

## 📱 Cara Penggunaan

### 1. Share dari Property Card

Klik tombol share pada property card → otomatis menggunakan URL `/p/[PROPERTY_ID]`

### 2. Share dari Halaman Detail

Klik tombol share → copy URL `/p/[PROPERTY_ID]`

### 3. Manual URL

Kunjungi: `https://salambumi.xyz/p/[PROPERTY_ID]`

## ✅ Testing Checklist

- [ ] Share ke WhatsApp → preview menampilkan gambar utama
- [ ] Share ke Facebook → preview lengkap dengan gambar
- [ ] Share ke Telegram → preview large image
- [ ] Klik link → redirect ke halaman detail
- [ ] Property tanpa gambar → fallback ke gambar default

## 🛠️ Development

### Menjalankan Worker Locally

```bash
npm run dev
```

### Deploy ke Cloudflare

```bash
npm run deploy
```

## 📊 Data Flow

1. User klik share → dapat URL `/p/[PROPERTY_ID]`
2. Social crawler akses URL tersebut
3. Cloudflare Worker fetch data dari Supabase
4. Worker generate HTML dengan OG meta tags
5. Social platform menampilkan preview
6. User klik link → redirect ke halaman detail React

## 🔍 Troubleshooting

### Preview tidak muncul
- Pastikan `main_image_url` ada di database
- Check Supabase connection di worker
- Verify OG meta tags di browser inspector

### Redirect tidak bekerja
- Check URL redirect di meta refresh tag
- Pastikan routing di client sudah benar

### Gambar tidak loading
- Verify image URL accessible publik
- Check CORS headers jika diperlukan

## 📝 Catatan Developer

- OG meta tags harus server-side rendered (tidak client-side)
- Crawler tidak mengeksekusi JavaScript
- Semua gambar harus accessible tanpa authentication
- Cache headers di-set untuk performance