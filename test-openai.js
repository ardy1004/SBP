// Test OpenAI API with real property data
// Run with: node test-openai.js

// Mock property data for K2.60 (based on your database)
const testPropertyData = {
  jenis_properti: "kost",
  kabupaten: "sleman",
  provinsi: "yogyakarta",
  harga_properti: "800000",
  kamar_tidur: 1,
  kamar_mandi: 1,
  luas_tanah: 100,
  luas_bangunan: 25,
  kode_listing: "K2.60",
  judul_properti: "Kost Exclusive Bangunan Baru"
};

console.log("🧪 Testing OpenAI API with Real Property Data");
console.log("Property:", testPropertyData.kode_listing, "-", testPropertyData.judul_properti);
console.log("Location:", testPropertyData.kabupaten + ",", testPropertyData.provinsi);
console.log("Price:", "Rp", testPropertyData.harga_properti);
console.log("");

// Simulate OpenAI API call (this would normally run in browser)
console.log("🤖 Calling OpenAI API...");

// Mock the enhanced prompt that would be sent to OpenAI
const prompt = `Buat deskripsi properti yang sangat menarik, SEO-friendly, dan click-bait untuk kost di sleman, yogyakarta.

INFORMASI PROPERTI:
- Tipe: kost
- Lokasi: sleman, yogyakarta
- Harga: Rp 800000
- Kamar: 1 kamar tidur 1 kamar mandi
- Luas: 100m² tanah 25m² bangunan
- Kode Listing: K2.60

KETENTUAN DESKRIPSI:
1. MULAI DENGAN HOOK MENARIK - gunakan kalimat yang membuat orang ingin baca terus
2. STRUKTUR PARAGRAF:
   - Paragraf 1: Hook + spesifikasi utama + harga
   - Paragraf 2: Fasilitas + keunggulan lokasi
   - Paragraf 3: Target penghuni + call-to-action
3. SEO KEYWORDS: sertakan naturally "kost sleman", "kost murah", "sewa kost", "kost strategis"
4. BAHASA: Indonesia natural, engaging, persuasive
5. PANJANG: 150-250 kata
6. CLICK BAIT: gunakan kata-kata seperti "impian", "premium", "strategis", "eksklusif", "terbaik"

CONTOH STRUKTUR:
"🏠 TEMUKAN KOST EKSKLUSIF IMPIAN ANDA DI SLEMAN YOGYAKARTA!

Kost premium dengan desain modern ini menawarkan hunian nyaman yang sempurna untuk mahasiswa atau pekerja profesional. Dilengkapi dengan 1 kamar tidur yang luas dan 1 kamar mandi bersih, memberikan kenyamanan maksimal dalam ruang 25m² yang efisien.

Lokasi sangat strategis di area Condongcatur yang berkembang pesat, hanya 1.2km dari Universitas Gadjah Mada (UGM) dan 800m dari Universitas Pembangunan Nasional "Veteran" Yogyakarta. Akses transportasi publik sangat mudah dengan berbagai pilihan angkutan umum menuju pusat kota.

Fasilitas lengkap termasuk WiFi unlimited, AC untuk kenyamanan, area parkir yang aman, dan sistem keamanan 24 jam. Kost di Sleman Yogyakarta - investasi hunian terbaik dengan harga terjangkau Rp 800rb per bulan!

Kode: K2.60"

BUAT DESKRIPSI YANG MIRIP CONTOH TAPI LEBIH MENARIK DAN DETAIL:`;

console.log("📝 Prompt sent to OpenAI:");
console.log("-".repeat(50));
console.log(prompt);
console.log("-".repeat(50));

// This would be the actual API call in the browser
console.log("\n🔄 In browser environment, this would call:");
console.log("POST https://api.openai.com/v1/chat/completions");
console.log("Headers: Authorization: Bearer", process.env.VITE_OPENAI_API_KEY?.substring(0, 20) + "...");
console.log("Model: gpt-3.5-turbo");
console.log("Max tokens: 800");

console.log("\n✅ OpenAI API Test Setup Complete!");
console.log("\n💡 To test with real API:");
console.log("1. Open browser dev tools");
console.log("2. Go to Admin → Add Property");
console.log("3. Fill property data for K2.60");
console.log("4. Click 'Generate AI Description'");
console.log("5. Check network tab for API calls");
console.log("6. See the generated description!");