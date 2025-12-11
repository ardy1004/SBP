# Test Case 2: "jual tanah yogyakarta"

## Test Details
- **Keyword:** "jual tanah yogyakarta"
- **Expected Behavior:** Find land properties for sale in Yogyakarta area
- **Search Fields:** status, jenis_properti, provinsi, kabupaten

## Generated SQL Query
```sql
SELECT * FROM properties
WHERE (
  judul_properti.ilike.%jual tanah yogyakarta% OR
  deskripsi.ilike.%jual tanah yogyakarta% OR
  kode_listing.ilike.%jual tanah yogyakarta% OR
  kabupaten.ilike.%jual tanah yogyakarta% OR
  provinsi.ilike.%jual tanah yogyakarta% OR
  alamat_lengkap.ilike.%jual tanah yogyakarta% OR
  jenis_properti.ilike.%jual tanah yogyakarta% OR
  status.ilike.%jual tanah yogyakarta% OR
  judul_properti.ilike.%jual% OR
  deskripsi.ilike.%jual% OR
  kabupaten.ilike.%jual% OR
  provinsi.ilike.%jual% OR
  alamat_lengkap.ilike.%jual% OR
  judul_properti.ilike.%tanah% OR
  deskripsi.ilike.%tanah% OR
  kabupaten.ilike.%tanah% OR
  provinsi.ilike.%tanah% OR
  alamat_lengkap.ilike.%tanah% OR
  judul_properti.ilike.%yogyakarta% OR
  deskripsi.ilike.%yogyakarta% OR
  kabupaten.ilike.%yogyakarta% OR
  provinsi.ilike.%yogyakarta% OR
  alamat_lengkap.ilike.%yogyakarta%
)
ORDER BY created_at DESC
LIMIT 10
```

## Expected Results
- Properties with `status` containing "jual"
- Properties with `jenis_properti = 'tanah'`
- Properties with `provinsi` or `kabupaten` containing "yogyakarta"

## Test Status
- [ ] Not executed
- [ ] Passed
- [ ] Failed