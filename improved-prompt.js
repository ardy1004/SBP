// Improved AI Prompt for Property Descriptions
// This shows what the enhanced prompt should look like

const testData = {
  jenis_properti: "kost",
  kabupaten: "sleman",
  provinsi: "yogyakarta",
  harga_properti: "6500000",
  kamar_tidur: 16,
  kamar_mandi: 16,
  luas_tanah: 311,
  luas_bangunan: 500,
  kode_listing: "K9.02"
};

console.log("🧪 Testing Improved AI Prompt for Property K9.02");
console.log("Property Data:", testData);

// Enhanced prompt that should produce much better results
const enhancedPrompt = `Buat deskripsi properti yang SANGAT MENARIK, SEO-friendly, dan click-bait untuk ${testData.jenis_properti} di ${testData.kabupaten}, ${testData.provinsi}.

INFORMASI PROPERTI:
- Tipe: ${testData.jenis_properti}
- Lokasi: ${testData.kabupaten}, ${testData.provinsi}
- Harga: Rp ${testData.harga_properti}
- Kamar: ${testData.kamar_tidur} kamar tidur ${testData.kamar_mandi} kamar mandi
- Luas: ${testData.luas_tanah}m² tanah ${testData.luas_bangunan}m² bangunan
- Kode Listing: ${testData.kode_listing}

KETENTUAN PENTING:
1. MULAI DENGAN HOOK SANGAT MENARIK - gunakan emoji 🏠 dan kata-kata powerful seperti "TEMUKAN", "IMPIAN", "EKSKLUSIF"
2. STRUKTUR 4 PARAGRAF:
   - Paragraf 1: HOOK + SPESIFIKASI UTAMA + HARGA (menarik perhatian)
   - Paragraf 2: FASILITAS + KEUNGGULAN LOKASI (detail menarik)
   - Paragraf 3: TARGET PENGHUNI + CALL-TO-ACTION (persuasi)
   - Paragraf 4: KODE LISTING (penutup)

3. SEO KEYWORDS HARUS NATURAL: "${testData.jenis_properti} ${testData.kabupaten}", "${testData.jenis_properti} murah", "sewa ${testData.jenis_properti}", "${testData.jenis_properti} strategis", "${testData.jenis_properti} premium"
4. BAHASA INDONESIA: natural, engaging, persuasive, profesional tapi ramah
5. PANJANG: 180-280 kata (lebih detail dari biasanya)
6. CLICK BAIT ELEMENTS: "impian", "premium", "strategis", "eksklusif", "terbaik", "hunian nyaman", "lokasi premium"

CONTOH YANG BAGUS UNTUK KOST:
"🏠 TEMUKAN KOST EKSKLUSIF IMPIAN ANDA DI SLEMAN YOGYAKARTA!

Kost premium dengan bangunan baru ini menawarkan hunian modern yang sangat nyaman untuk mahasiswa atau pekerja muda. Dilengkapi dengan 1 kamar tidur yang luas dan 1 kamar mandi bersih, memberikan kenyamanan maksimal dalam ruang 25m² yang efisien. Harga terjangkau mulai Rp 800.000 per bulan!

Lokasi super strategis di pusat Condongcatur yang berkembang pesat, hanya berjarak 1.2km dari Universitas Gadjah Mada (UGM) yang terkenal dan 800m dari Universitas Pembangunan Nasional "Veteran" Yogyakarta. Akses transportasi publik sangat mudah dengan berbagai pilihan angkutan umum yang melintasi area ini menuju pusat kota Yogyakarta.

Fasilitas premium lengkap termasuk WiFi unlimited berkecepatan tinggi, AC untuk kenyamanan maksimal, area parkir yang luas dan aman, serta sistem keamanan 24 jam dengan CCTV. Cocok untuk mahasiswa yang mencari hunian nyaman dekat kampus atau pekerja profesional yang membutuhkan lokasi strategis.

Kost di Sleman Yogyakarta - investasi hunian terbaik dengan fasilitas lengkap dan lokasi premium!

Kode listing: K2.60"

BUAT DESKRIPSI SANGAT MENARIK YANG MIRIP CONTOH TAPI LEBIH DETAIL DAN PERSUASIF UNTUK PROPERTI INI:`;

console.log("\n📝 Enhanced Prompt for K9.02:");
console.log("=".repeat(100));
console.log(enhancedPrompt);
console.log("=".repeat(100));

console.log("\n🎯 Expected Improvements:");
console.log("✅ Strong hook with emoji");
console.log("✅ 4 structured paragraphs");
console.log("✅ Natural SEO keywords");
console.log("✅ Persuasive Indonesian language");
console.log("✅ Click-bait elements");
console.log("✅ Professional yet friendly tone");
console.log("✅ Detailed specifications");
console.log("✅ Call-to-action");

console.log("\n🚀 This prompt should produce results like:");
console.log('"🏠 TEMUKAN KOST EKSKLUSIF IMPIAN ANDA DI SLEMAN YOGYAKARTA!');
console.log('Kost premium dengan bangunan baru ini menawarkan hunian modern yang sangat nyaman...');
console.log('[much more detailed and engaging content]');
console.log('Kode listing: K9.02"');

console.log("\n💡 The key improvements:");
console.log("1. More specific instructions");
console.log("2. Better example structure");
console.log("3. Emphasis on persuasive language");
console.log("4. Clear 4-paragraph format");
console.log("5. SEO keyword integration");
console.log("6. Click-bait elements");