# Test Case 1: "Rumah jl kaliurang"

## Test Details
- **Keyword:** "Rumah jl kaliurang"
- **Expected Behavior:** Find properties with type "rumah" and address containing "jl kaliurang"
- **Search Fields:** jenis_properti, alamat_lengkap, judul_properti, deskripsi

## Generated SQL Query
```sql
SELECT * FROM properties
WHERE (
  judul_properti.ilike.%Rumah jl kaliurang% OR
  deskripsi.ilike.%Rumah jl kaliurang% OR
  kode_listing.ilike.%Rumah jl kaliurang% OR
  kabupaten.ilike.%Rumah jl kaliurang% OR
  provinsi.ilike.%Rumah jl kaliurang% OR
  alamat_lengkap.ilike.%Rumah jl kaliurang% OR
  jenis_properti.ilike.%Rumah jl kaliurang% OR
  status.ilike.%Rumah jl kaliurang% OR
  judul_properti.ilike.%Rumah% OR
  deskripsi.ilike.%Rumah% OR
  kabupaten.ilike.%Rumah% OR
  provinsi.ilike.%Rumah% OR
  alamat_lengkap.ilike.%Rumah% OR
  judul_properti.ilike.%kaliurang% OR
  deskripsi.ilike.%kaliurang% OR
  kabupaten.ilike.%kaliurang% OR
  provinsi.ilike.%kaliurang% OR
  alamat_lengkap.ilike.%kaliurang%
)
ORDER BY created_at DESC
LIMIT 10
```

## Expected Results
- Properties with `jenis_properti = 'rumah'`
- Properties with `alamat_lengkap` containing "Jl. Kaliurang"
- Properties with titles/descriptions containing the keywords

## Test Status
- [ ] Not executed
- [ ] Passed
- [ ] Failed

## Actual Results
```
[To be filled after execution]
```

## Analysis
```
[Relevance analysis and match highlighting]