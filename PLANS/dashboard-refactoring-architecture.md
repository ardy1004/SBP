# Arsitektur Dashboard Admin Salam Bumi Property
## Sesuai dengan request user: Form Properti Manual + Sharelink Submission

---

## 1. KONFIGURASI DATABASE - SUDAH ADA

### 1.1 Kolom Properties Table (EXISTING)

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid | Primary Key |
| kode_listing | text | Kode listing |
| judul_properti | text | Judul properti |
| deskripsi | text | Deskripsi lengkap |
| jenis_properti | text | Rumah/Tanah/Kost dll |
| legalitas | text | Status legalitas |
| provinsi | text | Provinsi |
| kabupaten | text | Kabupaten |
| alamat_lengkap | text | Alamat lengkap |
| harga_properti | numeric | Harga penawaran |
| harga_per_meter | boolean | Harga per meter |
| price_old | numeric | Harga lama |
| luas_tanah | numeric | Luas tanah (m²) |
| luas_bangunan | numeric | Luas bangunan (m²) |
| kamar_tidur | integer | Jumlah kamar tidur |
| kamar_mandi | integer | Jumlah kamar mandi |
| status | text | dijual/disewakan |
| image_url - image_url9 | text | URL gambar |
| youtube_url | text | Link YouTube |
| owner_contact | text | Contact JSON |
| meta_title | text | SEO title |
| meta_description | text | SEO description |
| publish_status | text | APPROVED/PENDING_REVIEW/REJECTED |
| source_input | text | ADMIN/OWNER |
| agreement_status | text | none/open_listing/exclusive_booster |
| contract_expired_at | timestamptz | Tgl expired kontrak |
| is_hot, is_sold, is_property_pilihan, is_premium, is_featured | boolean | Flags |
| view_count, wa_click_count | integer | Analytics |
| reject_reason | text | Alasan ditolak |
| google_maps_link | text | Link GMaps (ADMIN ONLY) |

---

## 2. WORKFLOW ARSITEKTUR

### 2.1 Diagram Flow

```mermaid
graph TD
    A[User] --> B{Login?}
    B -->|Tidak| C[Homepage]
    B -->|Admin| D[Admin Dashboard]
    
    D --> D1[Menu Properti]
    D1 --> D2[Tambah Manual]
    D1 --> D3[Daftar Properti]
    D1 --> D4[Menunggu Review]
    D1 --> D5[Agreement]
    D1 --> D6[Share Link]
    
    D2 --> F[Form Properti Manual]
    F --> G{Simpan}
    G -->|ADMIN| H[Langsung Publish]
    
    C --> E[Link Share?]
    E -->|Ya| I[/submit/:token]
    I --> I1[Step 1: Identitas Owner]
    I1 --> I2[Step 2: Detail Properti]
    I2 --> I3[Step 3: Agreement]
    I3 --> I4[Submit - Waiting Review]
    
    D4 --> J[Review Submission]
    J -->|Approve| K[Publish ke Homepage]
    J -->|Tolak| L[Notify Owner]
```

### 2.2 Dua Jenis Input Properti

| Jenis | Siapa | Workflow | Tampil di Homepage |
|-------|-------|----------|-------------------|
| **Input Manual** | Admin | Langsung publish | Ya |
| **Sharelink** | Owner via link | Submit → Review → Approve | Ya (setelah approve) |

---

## 3. FORM PROPERTI MANUAL (3) - SINKRON DENGAN PUBLIC SUBMISSION

### 3.1 Struktur Form

```
┌─────────────────────────────────────────────┐
│  TUJUAN TRANSAKSI                          │
│  ○ Dijual  ○ Disewakan  ○ Dijual & Disewakan│
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  HARGA                                      │
│  Harga Penawaran: Rp [_____________]        │
│  ☑ Nego  ☑ Nett                            │
│                                             │
│  (Jika Disewakan:)                          │
│  Harga Sewa/Tahun: Rp [_____________]        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ALAMAT                                     │
│  Alamat Lengkap: [____________________]      │
│  Link Google Maps: [____________________]    │
│  *Admin only - tidak tampil di homepage     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  JENIS PROPERTI                             │
│  ○ Rumah  ○ Tanah  ○ Kost  ○ Hotel         │
│  ○ Homestay  ○ Villa  ○ Apartment          │
│  ○ Gudang  ○ Bangunan Komersial            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  DETAIL PROPERTI (Dynamic per Jenis)       │
└─────────────────────────────────────────────┘
```

### 3.2 Dynamic Fields per Jenis Properti

| Jenis | Fields |
|-------|--------|
| **Rumah** | Luas Tanah (m²), Luas Bangunan (m²), Lebar Depan (m), Lantai, Kamar Tidur, Kamar Mandi |
| **Tanah** | Luas Tanah (m²), Lebar Depan (m) |
| **Kost** | Jenis Kost (Putra/Putri/Campur), Luas Tanah, Luas Bangunan, Lebar Depan, Lantai, Kamar Tidur, Kamar Mandi, Ruang Penjaga (checkbox), Token Listrik perkamar (checkbox), Harga Sewa Kamar/bln, Biaya Pengeluaran/bln, Kelengkapan (Fully/Semi/Unfurnished) |
| **Hotel** | Jenis Hotel (Budget/Melati/1-5 Bintang/Boutique), Luas Tanah, Luas Bangunan, Lebar Depan, Lantai, Kamar Tidur, Kamar Mandi, Harga Sewa Kamar/bln, Income Rata-rata/bln, Biaya Pengeluaran/bln, Kelengkapan |
| **Homestay** | Luas Tanah, Luas Bangunan, Lebar Depan, Lantai, Kamar Tidur, Kamar Mandi, Harga Sewa Kamar/bln, Income Rata-rata/bln, Biaya Pengeluaran/bln, Kelengkapan |
| **Villa** | Luas Tanah, Luas Bangunan, Lebar Depan, Lantai, Kamar Tidur, Kamar Mandi, Harga Sewa Kamar/bln, Income Rata-rata/bln, Biaya Pengeluaran/bln, Kelengkapan |
| **Apartment** | Luas Bangunan (m²), Lantai, No Unit, Kamar Tidur, Kamar Mandi, Kelengkapan |
| **Gudang** | Luas Tanah (m²), Luas Bangunan (m²), Lebar Depan (m) |
| **Komersial** | Luas Tanah (m²), Luas Bangunan (m²), Lebar Depan (m) |

### 3.3 Legalitas

| Opsi |
|------|
| SHM & IMB / PBG Lengkap |
| SHGB & IMB / PBG Lengkap (Berlaku Sampai: [tgl]) |
| SHM Pekarangan Saja Tanpa IMB / PBG |
| SHM Sawah / Tegalan |
| SHGB Saja Tanpa IMB / PBG |
| Girik / Letter C / PPJB / dll |
| Izin Usaha |

### 3.4 Kondisi Lingkungan

| Kondisi | Input |
|---------|-------|
| Status Legalitas | ○ On Hand  ○ On Bank |
| Jika On Bank | Bank: [_____], Outstanding: Rp [_____] |
| Dekat Sungai | ☑ Ya → Jarak: [_____] m |
| Dekat Makam | ☑ Ya → Jarak: [_____] m |
| Dekat Sutet | ☑ Ya → Jarak: [_____] m |
| Lebar Jalan | [_____] meter |

### 3.5 Informasi Tambahan

- Deskripsi Properti (textarea)
- Alasan Dijual (textarea)
- Upload Foto (multi image, auto WebP)

---

## 4. FORM IDENTITAS OWNER (2)

### 4.1 Fields

```
┌─────────────────────────────────────────────┐
│  NAMA LENGKAP SESUAI KTP                   │
│  [___________________________________]      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  NO. KTP                                    │
│  [___________________________________]      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ALAMAT SESUAI KTP                         │
│  [___________________________________]      │
│  RT/RW: [___] / [___]                      │
│  Kelurahan/Desa: [__________________]        │
│  Kecamatan: [__________________]            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  BERTINDAK SEBAGAI                         │
│  ○ Pemilik Sah Properti A/n Sertifikat     │
│  ○ Pasangan (Suami/Istri) Bukan A/n       │
│  ○ Lainnya (Broker/Perantara/Saudara)      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  NO. HP/WHATSAPP                           │
│  No. 1 (Wajib): [___] ☑ Share linkWA      │
│  No. 2 (Opsional): [___] ☑ Share linkWA   │
└─────────────────────────────────────────────┘
```

---

## 5. FORM AGREEMENT (4)

### 5.1 Opsi Perjanjian

```
┌─────────────────────────────────────────────┐
│  OPSI PERJANJIAN JASA PEMASARAN             │
│                                             │
│  ○ Open Listing                             │
│    Pemasaran Bebas / Tidak Terikat          │
│    Fee 3% dari Harga Deal (Setelah AJB)    │
│                                             │
│  ○ Exclusive Booster                        │
│    Kontrak 6 Bulan                         │
│    Fee 3% + Biaya Pemasaran                 │
│                                             │
│    ☐ Meta Ads (IG & FB)                    │
│       Admin Fee: 1.5jt/bln                  │
│       Ads: 50k-xxx/hari                    │
│                                             │
│    ☐ TikTok Ads                            │
│       Admin Fee: 1.5jt/bln                  │
│       Ads: 50k-xxx/hari                    │
└─────────────────────────────────────────────┘
```

### 5.2 Agreement PDF Format

```
═══════════════════════════════════════════════════
        PERJANJIAN JASA PEMASARAN
        SALAM BUMI PROPERTY
        (EXCLUSIVE BOOSTER – KONTRAK 6 BULAN)
═══════════════════════════════════════════════════

Nomor: [AUTO-GENERATE]

Pada hari ini, [tgl], telah dibuat Perjanjian antara:

PIHAK PERTAMA:
Nama Perusahaan : Salam Bumi Property
Alamat          : Jl Pajajaran, Catur Tunggal, Depok, Sleman
Telp/WA         : 0813-9127-8889
Email           : salambumiproperty@gmail.com
(Penyedia Jasa Pemasaran)

PIHAK KEDUA:
Nama            : [NAMA OWNER]
Alamat KTP      : [ALAMAT KTP]
No. KTP         : [NO. KTP]
Bertindak Sebagai: [ROLE]
(Pemilik Properti)

PASAL 1 - OBJEK PERJANJIAN
Jenis Properti : [JENIS]
Alamat         : [ALAMAT LENGKAP]
Sertifikat      : [LEGALITAS]
Harga Penawaran : Rp [HARGA]

PASAL 2 - JENIS LISTING
[OPEN LISTING / EXCLUSIVE - 6 BULAN]

PASAL 3 - FEE/KOMISI
3% dari harga deal (Setelah AJB)

PASAL 4 - PEMASARAN (Jika Exclusive)
☐ Meta Ads: 1.5jt/bln + Ads xxx/bln
☐ TikTok Ads: 1.5jt/bln + Ads xxx/bln

PASAL 5-7 - KEWAJIBAN & PENYELESAIAN SENGKETA
[Standard clauses]

[Yogyakarta, tgl]

[Tanda Tangan Owner]     [Tanda Tangan Agent]
[Space materai 10rb]    [Space stempel]
```

---

## 6. SHARE LINK GENERATOR

### 6.1 Fitur

- Generate unique token
- Set expiration date
- Copy link: `https://salambumi.xyz/submit/:token`
- Track usage (access count)

### 6.2 Token Table Structure

```
owner_submission_tokens:
- id: uuid
- owner_profile_id: uuid (FK)
- property_id: uuid (FK) - after submission
- token: text (unique)
- expires_at: timestamptz
- status: ACTIVE/SUBMITTED/EXPIRED/REVOKED
- access_count: integer
- created_at: timestamptz
```

---

## 7. IMPLEMENTASI COMPONENTS

### 7.1 File Structure

```
components/admin/
├── PropertyForm/
│   └── index.tsx          # SATU form untuk admin & sinkron dengan public
├── OwnerIdentityForm/
│   └── index.tsx
├── MarketingAgreementForm/
│   └── index.tsx
├── AgreementPDFGenerator/
│   └── index.tsx
├── ShareLinkGenerator/
│   └── index.tsx
└── Layout/
    └── ...
```

### 7.2 ProductionPropertyForm.tsx - SUDAH ADA

File ini sudah dibuat dan harus:
- Mapping ke kolom existing properties table
- Include semua dynamic fields sesuai jenis properti
- Google Maps field (admin_only=true)
- Source tracking: ADMIN vs OWNER

---

## 8. RINGKASAN IMPLEMENTASI

| Komponen | Status | File |
|----------|--------|------|
| Property Form (3) | ✅ Ready | ProductionPropertyForm.tsx |
| Owner Identity (2) | ✅ Ready | OwnerIdentityForm.tsx |
| Marketing Agreement (4) | ✅ Ready | MarketingAgreementForm.tsx |
| Agreement PDF | ✅ Ready | AgreementPDFGenerator.tsx |
| Share Link Generator | ✅ Ready | ShareLinkGenerator.tsx |
| Database Columns | ✅ Done | Migration executed |

###Yang perlu dilakukan:
1. ✅ ProductionPropertyForm sudah ada - cocokkan fields dengan request user
2. ✅ Update form fields sesuai 3 di atas
3. ✅ Sinkronkan dengan PublicSubmissionPage
4. ✅ Integrasi dengan EnhancedAdminPropertiesPage

---

*Plan ini sudah disesuaikan dengan request user spesifik*
*Input manual (admin) dan sharelink (owner) menggunakan form yang SAMA*
