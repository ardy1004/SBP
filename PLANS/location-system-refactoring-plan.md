# Rencana Refactoring Sistem Lokasi

## Ringkasan Masalah

Sistem lokasi saat ini tidak konsisten:
- URL menggunakan format SEO: `/dijual/rumah/yogyakarta/kota-yogyakarta`
- Database menggunakan: `DI.Yogyakarta` (provinsi) dan `Sleman` (kabupaten)
- Tidak ada mapping standar antara URL dan database
- Form input lokasi masih manual (free text)

## Tujuan

1. **Normalisasi data lokasi** di database agar sesuai dengan format standar
2. **Mapping otomatis** antara URL SEO dan data database
3. **Dropdown lokasi bertingkat** di form properti (Provinsi → Kabupaten → Kecamatan → Kelurahan)
4. **Kompatibilitas SEO URL** yang sudah ada

---

## Arsitektur Sistem Baru

### 1. Data Master Lokasi

Membuat data master lokasi Indonesia yang terstruktur:

```typescript
// Struktur data lokasi
interface LocationMaster {
  provinsi: {
    id: string;           // "34"
    nama: string;         // "DI Yogyakarta"
    seoSlug: string;      // "yogyakarta"
    variations: string[]; // ["DI.Yogyakarta", "D.I Yogyakarta", "Yogyakarta", "DIY"]
  };
  kabupaten: {
    id: string;           // "3404"
    provinsiId: string;   // "34"
    nama: string;         // "Sleman"
    seoSlug: string;      // "sleman"
    tipe: "Kabupaten" | "Kota";
    variations: string[]; // ["Kota Yogyakarta", "Yogyakarta"]
  };
  kecamatan?: {
    id: string;
    kabupatenId: string;
    nama: string;
    seoSlug: string;
  };
  kelurahan?: {
    id: string;
    kecamatanId: string;
    nama: string;
    seoSlug: string;
  };
}
```

### 2. Location Service

Service untuk mapping dan normalisasi lokasi:

```typescript
// client/src/services/locationService.ts
class LocationService {
  // Mapping URL ke format database
  static getDbFormatFromSlug(slug: string): LocationMapping;
  
  // Normalisasi data existing
  static normalizeProvinsi(input: string): string;
  static normalizeKabupaten(input: string, provinsi: string): string;
  
  // Get data untuk dropdown
  static getProvinsiList(): Provinsi[];
  static getKabupatenByProvinsi(provinsiId: string): Kabupaten[];
  static getKecamatanByKabupaten(kabupatenId: string): Kecamatan[];
  static getKelurahanByKecamatan(kecamatanId: string): Kelurahan[];
  
  // Validasi lokasi
  static validateLocation(provinsi: string, kabupaten: string): boolean;
}
```

### 3. Komponen Dropdown Lokasi

```typescript
// client/src/components/LocationDropdown.tsx
interface LocationDropdownProps {
  value: {
    provinsi?: string;
    kabupaten?: string;
    kecamatan?: string;
    kelurahan?: string;
  };
  onChange: (location: LocationValue) => void;
  level: number; // 1=provinsi, 2=kabupaten, 3=kecamatan, 4=kelurahan
}
```

---

## Data Master - Fokus Yogyakarta (Contoh)

```typescript
// client/src/data/locations/yogyakarta.ts
export const yogyakartaLocation = {
  id: "34",
  nama: "DI Yogyakarta",
  seoSlug: "yogyakarta",
  variations: ["DI.Yogyakarta", "D.I Yogyakarta", "DIY", "Yogyakarta"],
  kabupaten: [
    {
      id: "3401",
      nama: "Kulon Progo",
      seoSlug: "kulon-progo",
      tipe: "Kabupaten",
      variations: ["Kulonprogo", "Kulon Progo"]
    },
    {
      id: "3402",
      nama: "Bantul",
      seoSlug: "bantul",
      tipe: "Kabupaten",
      variations: []
    },
    {
      id: "3403",
      nama: "Gunung Kidul",
      seoSlug: "gunung-kidul",
      tipe: "Kabupaten",
      variations: ["Gunungkidul"]
    },
    {
      id: "3404",
      nama: "Sleman",
      seoSlug: "sleman",
      tipe: "Kabupaten",
      variations: []
    },
    {
      id: "3471",
      nama: "Kota Yogyakarta",
      seoSlug: "kota-yogyakarta",
      tipe: "Kota",
      variations: ["Yogyakarta", "Yogyakarta Kota", "Jogja", "Kota Jogja"]
    }
  ]
};
```

---

## Migrasi Data Database

### Step 1: Normalisasi Provinsi

```sql
-- Update varian provinsi menjadi format standar
UPDATE properties 
SET provinsi = 'DI Yogyakarta'
WHERE provinsi ILIKE ANY(ARRAY['%yogyakarta%', '%diy%', 'd.i%']);
```

### Step 2: Normalisasi Kabupaten

```sql
-- Mapping kabupaten ke format standar
UPDATE properties 
SET kabupaten = 'Kota Yogyakarta'
WHERE provinsi ILIKE '%yogyakarta%' 
  AND (kabupaten ILIKE '%kota%' OR kabupaten ILIKE '%yogyakarta%');

-- Data yang tersisa (yang lokasinya memang di Sleman) tetap "Sleman"
```

### Step 3: Verifikasi

```sql
-- Cek hasil normalisasi
SELECT DISTINCT provinsi, kabupaten 
FROM properties 
WHERE provensi ILIKE '%yogyakarta%'
ORDER BY kabupaten;
```

---

## Implementasi

### Phase 1: Setup Data Master & Service (Tanpa Merusak yang Ada)

1. Buat data master lokasi
2. Buat LocationService dengan fungsi mapping
3. Update FilteredPropertyPage untuk menggunakan mapping

### Phase 2: Update Form Properti

1. Ganti input manual dengan dropdown
2. Integrasi dengan LocationService
3. Validasi lokasi saat submit

### Phase 3: Migrasi Data

1. Script migrasi data existing
2. Verifikasi hasil migrasi

---

## Diagram Alur

```
User Request: /dijual/rumah/yogyakarta/kota-yogyakarta
                    │
                    ▼
┌─────────────────────────────────────┐
│  FilteredPropertyPage.tsx           │
│  - Parse URL params                 │
│  - Normalize dengan LocationService │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│  LocationService                    │
│  - seoSlug "kota-yogyakarta"        │
│  → dbFormat "Kota Yogyakarta"       │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│  Supabase Query                     │
│  WHERE kabupaten = 'Kota Yogyakarta'│
└─────────────────────────────────────┘
                    │
                    ▼
              [RESULT]
```

---

## Catatan Penting

1. **Backward Compatibility**: URL SEO yang sudah ada tetap berfungsi
2. **SEO**: Slug URL tetap SEO-friendly (`kota-yogyakarta`, bukan `Kota Yogyakarta`)
3. **Extensibility**: Sistem mudah di-extend untuk provinsi/kabupaten lain
4. **Performance**: Data master di-cache di client, tidak perlu fetch berulang

---

## Next Action

Setelah persetujuan, saya akan mulai implementasi:
1. Buat data master lokasi Yogyakarta
2. Buat LocationService
3. Update FilteredPropertyPage
4. Update form properti dengan dropdown