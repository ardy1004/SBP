# Sistem Lokasi Indonesia - Implementasi Lengkap

## Ringkasan

Implementasi sistem lokasi terpadu untuk menangani mapping antara SEO URL slug dan format database, serta menyediakan dropdown lokasi bertingkat untuk form properti.

## Masalah yang Diselesaikan

### Issue: Filter kabupaten tidak menemukan properti

**URL yang bermasalah:** `/dijual/rumah/yogyakarta/kota-yogyakarta`

**Root Cause:**
1. URL menggunakan slug `kota-yogyakarta` yang dinormalisasi menjadi `kota yogyakarta`
2. Query database menggunakan `ilike('%kota yogyakarta%')`
3. Data di database menggunakan format `Sleman`, bukan `Kota Yogyakarta`
4. Tidak ada mapping antara SEO slug dan format database

## Struktur File

### 1. Data Master Lokasi

```
client/src/data/locations/
├── types.ts          # TypeScript interfaces
├── indonesia.ts      # Data master provinsi & kabupaten
├── mapping.ts        # Utility functions untuk mapping
└── index.ts          # Export aggregator
```

#### Data yang Tersedia:
- **38 Provinsi** - Semua provinsi di Indonesia dengan variasi nama
- **200+ Kabupaten/Kota** - Fokus pada Jawa, Bali, dan Sumatera
- **Variasi Nama** - Setiap lokasi memiliki variasi (e.g., "DIY", "Yogya", "Jogja")

### 2. Location Service

```
client/src/services/locationService.ts
```

#### Fitur:
- `mapSeoToFilters()` - Konversi SEO slug ke database format
- `buildQueryFilters()` - Build Supabase query filters
- `validateLocation()` - Validasi kombinasi lokasi
- `generatePropertyUrl()` - Generate SEO URL dari database
- `normalizeLocationData()` - Normalisasi data existing

### 3. Komponen Dropdown

```
client/src/components/LocationDropdown.tsx
```

#### Fitur:
- Dropdown bertingkat: Provinsi → Kabupaten
- Auto-populate kabupaten berdasarkan provinsi
- Validasi dan error handling
- Custom hook `useLocationDropdown()`

### 4. Update FilteredPropertyPage

```
client/src/pages/FilteredPropertyPage.tsx
```

#### Perubahan:
- Menggunakan `locationService.buildQueryFilters()` untuk filter lokasi
- Support multiple variations dalam satu query (OR condition)
- Contoh: `yogyakarta` akan match dengan `DI Yogyakarta`, `DI.Yogyakarta`, dll

### 5. Migrasi Database

```
migrations/normalize_location_data.sql
scripts/normalize-location-data.js
```

#### Fitur:
- Mapping table untuk normalisasi
- SQL function `normalize_location()`
- View `properties_location_normalized`
- Script Node.js untuk batch update

## Cara Penggunaan

### 1. Di FilteredPropertyPage (SEO URL → Database)

```typescript
import { locationService } from '@/services/locationService';

// Di dalam fetchFilteredProperties
if (filters.provinsi) {
  const locationFilters = locationService.buildQueryFilters(
    filters.provinsi,
    filters.kabupaten
  );

  // Build OR condition untuk provinsi variations
  if (locationFilters.allProvinsiTerms.length > 0) {
    const provinsiConditions = locationFilters.allProvinsiTerms
      .map((term) => `provinsi.ilike.%${term}%`)
      .join(',');
    query = query.or(provinsiConditions);
  }

  // Filter kabupaten dengan multiple variations
  if (filters.kabupaten && locationFilters.allKabupatenTerms.length > 0) {
    const kabupatenConditions = locationFilters.allKabupatenTerms
      .map((term) => `kabupaten.ilike.%${term}%`)
      .join(',');
    query = query.or(kabupatenConditions);
  }
}
```

### 2. Di Form Properti (Database → Dropdown)

```typescript
import { LocationDropdown, useLocationDropdown } from '@/components/LocationDropdown';

function PropertyForm() {
  const { location, setLocation, errors, validate } = useLocationDropdown();

  const handleSubmit = () => {
    if (validate(['provinsi', 'kabupaten'])) {
      // Submit data
      console.log(location.provinsi, location.kabupaten);
    }
  };

  return (
    <LocationDropdown
      value={location}
      onChange={setLocation}
      errors={errors}
      required
    />
  );
}
```

### 3. Generate SEO URL

```typescript
import { locationService } from '@/services/locationService';

const url = locationService.generatePropertyUrl(
  'dijual',
  'rumah',
  'DI Yogyakarta',
  'Sleman'
);
// Result: /dijual/rumah/yogyakarta/sleman
```

### 4. Validasi Lokasi

```typescript
import { locationService } from '@/services/locationService';

const isValid = locationService.validateLocation('yogyakarta', 'sleman');
// Returns: true

const suggestions = locationService.getSuggestions('yogyakarta', 'kota-yogya');
// Returns: { provinsi: 'DI Yogyakarta', kabupaten: ['Kota Yogyakarta', 'Sleman', ...] }
```

## Menjalankan Migrasi

### Option 1: SQL Migration (Supabase Dashboard)

1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file `migrations/normalize_location_data.sql`
3. Jalankan untuk preview (Step 1-5)
4. Uncomment Step 6 untuk apply changes

### Option 2: Node.js Script

```bash
# Preview changes (dry run)
node scripts/normalize-location-data.js --dry-run

# Apply changes
node scripts/normalize-location-data.js

# Custom batch size
node scripts/normalize-location-data.js --batch-size=50
```

## Mapping Contoh

| SEO Slug | Database Format |
|----------|-----------------|
| `yogyakarta` | `DI Yogyakarta` |
| `jakarta` | `DKI Jakarta` |
| `jawa-barat` | `Jawa Barat` |
| `kota-yogyakarta` | `Kota Yogyakarta` |
| `sleman` | `Sleman` |
| `kota-bandung` | `Kota Bandung` |
| `bandung-kab` | `Bandung` (kabupaten) |

## Testing

### Test URL yang Sekarang Berfungsi:

1. `/dijual/rumah/yogyakarta` - Semua rumah di DI Yogyakarta
2. `/dijual/rumah/yogyakarta/sleman` - Rumah di Sleman
3. `/dijual/rumah/yogyakarta/kota-yogyakarta` - Rumah di Kota Yogyakarta
4. `/dijual/rumah/jakarta/jakarta-selatan` - Rumah di Jakarta Selatan
5. `/dijual/rumah/jawa-barat/bandung-kab` - Rumah di Kabupaten Bandung
6. `/dijual/rumah/jawa-barat/kota-bandung` - Rumah di Kota Bandung

### Test Cases:

```typescript
// Test 1: Yogyakarta variations
locationService.mapSeoToFilters('yogyakarta', 'kota-yogyakarta');
// Returns: { provinsiDb: 'DI Yogyakarta', kabupatenDb: 'Kota Yogyakarta', ... }

// Test 2: Jakarta
locationService.mapSeoToFilters('jakarta', 'jakarta-selatan');
// Returns: { provinsiDb: 'DKI Jakarta', kabupatenDb: 'Kota Jakarta Selatan', ... }

// Test 3: Validation
locationService.validateLocation('yogyakarta', 'sleman');
// Returns: true

// Test 4: Invalid location
locationService.validateLocation('yogyakarta', 'unknown-kabupaten');
// Returns: false
```

## Statistik Data

```typescript
const stats = locationService.getStats();
// Returns:
// {
//   totalProvinsi: 38,
//   totalKabupaten: 200+,
//   totalKota: ~100,
//   totalKabupatenOnly: ~100
// }
```

## Best Practices

### 1. Selalu Gunakan LocationService

Jangan hardcode mapping lokasi. Selalu gunakan `locationService` untuk konsistensi.

### 2. Handle Invalid Locations

```typescript
const result = locationService.mapSeoToFilters(provinsiSlug, kabupatenSlug);

if (!result.isValid) {
  // Show suggestions or 404
  const suggestions = locationService.getSuggestions(provinsiSlug, kabupatenSlug);
  return <LocationSuggestions suggestions={suggestions} />;
}
```

### 3. Normalisasi Data Input

Saat menyimpan properti baru, gunakan format standar:

```typescript
const normalized = locationService.normalizeLocationData(
  formData.provinsi,
  formData.kabupaten
);

// Save normalized.provinsi and normalized.kabupaten to database
```

### 4. Update Data Existing

Jalankan migrasi untuk normalisasi data lama:

```bash
node scripts/normalize-location-data.js --dry-run
node scripts/normalize-location-data.js
```

## Troubleshooting

### Issue: Lokasi tidak ditemukan

**Check:**
1. Apakah SEO slug ada di `indonesia.ts`?
2. Apakah format database sesuai mapping?
3. Coba gunakan `getSuggestions()` untuk melihat alternatif

### Issue: Query terlalu lambat

**Solusi:**
1. Pastikan index sudah dibuat:
   ```sql
   CREATE INDEX idx_properties_provinsi_lower ON properties (LOWER(provinsi));
   CREATE INDEX idx_properties_kabupaten_lower ON properties (LOWER(kabupaten));
   ```

2. Gunakan view `properties_location_normalized` untuk query read-only

### Issue: Data provinsi/kabupaten tidak muncul

**Check:**
1. Pastikan `provinsiList` dan `kabupatenList` sudah di-export
2. Check browser console untuk error
3. Verify import path: `@/data/locations`

## Maintenance

### Menambah Lokasi Baru

1. Edit `client/src/data/locations/indonesia.ts`
2. Tambahkan provinsi/kabupaten ke array
3. Pastikan include `variations` untuk fleksibilitas
4. Update SQL migration jika perlu

### Update Mapping

Jika ada perubahan format database:

1. Update `mapping.ts` - fungsi mapping
2. Update SQL migration
3. Jalankan migrasi ulang

## Catatan Penting

1. **SEO Slug Format:**
   - Lowercase
   - Kebab-case (e.g., `kota-yogyakarta`)
   - Tanpa tanda baca

2. **Database Format:**
   - Proper case (e.g., `Kota Yogyakarta`)
   - Include prefix `Kota` atau `Kabupaten`

3. **Variations:**
   - Setiap lokasi bisa memiliki multiple variations
   - Contoh: `Yogyakarta` = `DIY`, `Yogya`, `Jogja`
   - Variations digunakan untuk fuzzy matching

## Roadmap

- [ ] Tambah data kecamatan untuk wilayah prioritas
- [ ] Tambah data kelurahan
- [ ] Integrasi dengan API BPS untuk data terbaru
- [ ] Cache location data di localStorage
- [ ] Auto-complete search untuk lokasi