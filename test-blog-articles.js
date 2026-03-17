// Test script to create sample blog articles for testing
// Run with: node test-blog-articles.js

// Load environment variables from .env file
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client using environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample article data
const sampleArticles = [
  {
    title: "Investasi Tanah di Kawasan Pendidikan Jogja: Peluang ROI Tinggi 2024",
    slug: "investasi-tanah-kawasan-pendidikan-jogja-roi-tinggi-2024",
    content: `<h2>Mengapa Investasi Tanah di Kawasan Pendidikan Menguntungkan?</h2>

<p>Yogyakarta dikenal sebagai kota pelajar dengan lebih dari 500.000 mahasiswa dari seluruh Indonesia. Setiap tahun, ribuan mahasiswa baru membutuhkan tempat tinggal, membuka peluang bisnis kos-kosan, apartemen, dan usaha pendukung.</p>

<h3>Lokasi Terbaik untuk Investasi Tanah di Jogja:</h3>
<ul>
<li><strong>Seturan</strong>: Dekat UGM, akses mudah, harga masih terjangkau</li>
<li><strong>Condongcatur</strong>: Berkembang pesat dengan banyak perumahan baru</li>
<li><strong>Sleman Utara</strong>: Area UII dan UPN, potensi perkembangan jangka panjang</li>
<li><strong>Pogung</strong>: Sudah established, harga tinggi tapi permintaan stabil</li>
</ul>

<h2>Analisis ROI Investasi Tanah Jogja 2024</h2>
<p>Berdasarkan data dari Dinas Tata Kota Yogyakarta, kenaikan harga tanah di kawasan pendidikan mencapai:</p>

<table>
<tr><th>Lokasi</th><th>Kenaikan 2023</th><th>Proyeksi 2024</th></tr>
<tr><td>Seturan</td><td>18%</td><td>20-25%</td></tr>
<tr><td>Condongcatur</td><td>22%</td><td>25-30%</td></tr>
<tr><td>Sleman Utara</td><td>15%</td><td>18-22%</td></tr>
</table>

<h2>Tips Memilih Tanah untuk Investasi:</h2>
<ol>
<li><strong>Cek legalitas</strong>: Pastikan sertifikat SHM, bukan girik</li>
<li><strong>Akses jalan</strong>: Minimal bisa dilalui mobil</li>
<li><strong>Ketersediaan air</strong>: Sumur atau PDAM tersedia</li>
<li><strong>Perkembangan wilayah</strong>: Proyek pemerintah atau swasta di sekitar</li>
<li><strong>Lingkungan</strong>: Aman dan nyaman untuk hunian</li>
</ol>

<blockquote>
"Investasi tanah di Jogja ibarat menanam padi di sawah subur. Butuh kesabaran, tapi panennya berlimpah." - Pakar Properti Jogja
</blockquote>

<h2>Kesimpulan</h2>
<p>Investasi tanah di kawasan pendidikan Jogja masih sangat menjanjikan. Dengan penelitian yang matang dan timing yang tepat, ROI 20-30% per tahun sangat mungkin dicapai.</p>`,
    excerpt: "Jogja bukan hanya kota pelajar, tapi juga surga investasi properti. Dengan pertumbuhan kampus baru dan kebutuhan akomodasi mahasiswa, tanah di sekitar UGM, UII, dan UPN menunjukkan potensi return on investment (ROI) hingga 20-30% per tahun.",
    thumbnail_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000",
    category: "Investasi",
    tags: ["investasi", "tanah", "jogja", "properti", "uang", "roi", "mahasiswa"],
    status: "publish",
    seo_title: "Investasi Tanah Jogja 2024: ROI 30% di Kawasan Kampus | Salam Bumi Property",
    seo_description: "Peluang investasi tanah di Yogyakarta masih terbuka lebar. Temukan strategi mendapatkan ROI 20-30% dengan investasi tanah di kawasan pendidikan seperti dekat UGM, UII, dan UPN. Analisis lengkap 2024.",
    seo_keywords: "investasi tanah jogja",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    title: "5 Kesalahan Fatal Saat Membeli Rumah Pertama di Jogja",
    slug: "5-kesalahan-fatal-membeli-rumah-pertama-jogja",
    content: `<h2>Kesalahan #1: Terburu-buru karena Takut Kehabisan</h2>
<p>Psikologi FOMO (Fear Of Missing Out) sering membuat calon pembeli rumah terburu-buru. Mereka melihat rumah impian sudah ada calon pembeli lain, lalu memutuskan membeli tanpa survey properti yang matang.</p>

<p>Akibatnya, setelah beberapa bulan tinggal, mereka menemukan berbagai masalah: akses jalan buruk, banjir saat hujan, atau tetangga yang bising. Padahal, dengan bersabar mencari, masih banyak pilihan rumah yang lebih baik dengan harga sama.</p>

<h2>Kesalahan #2: Tidak Cek Legalitas dengan Teliti</h2>
<p>Banyak pembeli rumah pertama tertipu dengan iming-iming harga murah. Mereka tidak melakukan pengecekan legalitas yang menyeluruh, hanya percaya omongan penjual atau developer.</p>

<p>Hasilnya, setelah beberapa tahun, rumah yang dibeli ternyata bermasalah: sertifikat palsu, tanah sengketa, atau tidak sesuai dengan IMB. Kerugian finansial dan emosional yang ditimbulkan sangat besar.</p>

<h2>Kesalahan #3: Mengabaikan Kondisi Lingkungan</h2>
<p>Fokus utama saat membeli rumah pertama biasanya pada interior dan fasilitas rumah. Padahal, kondisi lingkungan sekitar sama pentingnya. Apakah aman dari kejahatan? Apakah tetangga ramah? Apakah ada fasilitas umum terdekat?</p>

<p>Banyak yang menyesal karena setelah pindah, lingkungan tidak seperti yang dibayangkan: sering banjir, macet, atau kurang nyaman untuk keluarga.</p>

<h2>Kesalahan #4: Tidak Melibatkan Ahli</h2>
<p>Pembeli rumah pertama seringkali merasa sudah cukup dengan pengetahuan dari internet atau teman. Mereka tidak melibatkan ahli seperti surveyor, notaris, atau konsultan properti.</p>

<p>Akibatnya, mereka tidak mengetahui cacat tersembunyi rumah, kesalahan dalam kontrak jual beli, atau tidak mendapatkan harga terbaik.</p>

<h2>Kesalahan #5: Tidak Memikirkan Jangka Panjang</h2>
<p>Membeli rumah pertama sering didasari kebutuhan saat ini saja. Tidak memikirkan kebutuhan jangka panjang seperti pertumbuhan keluarga, perubahan pekerjaan, atau investasi.</p>

<p>Hasilnya, rumah yang dibeli terlalu kecil untuk keluarga yang berkembang, atau terlalu mahal untuk dijual jika perlu pindah kerja.</p>

<h2>Tips Menghindari Kesalahan Fatal</h2>
<p>Untuk menghindari kesalahan-kesalahan di atas, ikuti tips berikut:</p>
<ul>
<li>Selalu lakukan survey minimal 3 kali ke lokasi</li>
<li>Gunakan jasa notaris dan surveyor profesional</li>
<li>Tanyakan pendapat tetangga sekitar</li>
<li>Hitung kemampuan bayar jangka panjang</li>
<li>Konsultasikan dengan keluarga sebelum memutuskan</li>
</ul>`,
    excerpt: "Membeli rumah pertama adalah momen penting yang penuh emosi. Sayangnya, banyak calon homeowner terjebak kesalahan yang merugikan. Artikel ini membahas 5 kesalahan fatal yang harus dihindari saat membeli rumah pertama di Yogyakarta.",
    thumbnail_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000",
    category: "Tips & Panduan",
    tags: ["rumah", "beli rumah", "tips", "jogja", "properti"],
    status: "draft",
    seo_title: "5 Kesalahan Fatal Beli Rumah Pertama di Jogja | Panduan Lengkap",
    seo_description: "Hindari 5 kesalahan fatal saat membeli rumah pertama di Yogyakarta. Panduan lengkap untuk calon homeowner agar tidak menyesal di kemudian hari.",
    seo_keywords: "beli rumah pertama jogja, tips beli rumah, kesalahan beli rumah",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function createTestArticles() {
  console.log('🚀 Starting to create test blog articles...');

  try {
    for (const article of sampleArticles) {
      console.log(`📝 Creating article: "${article.title}"`);

      const { data, error } = await supabase
        .from('articles')
        .insert(article)
        .select();

      if (error) {
        console.error(`❌ Error creating article "${article.title}":`, error);
      } else {
        console.log(`✅ Successfully created article: ${data[0].title} (ID: ${data[0].id})`);
      }
    }

    console.log('🎉 All test articles created successfully!');
    console.log('📊 You can now test the blog admin panel at: http://localhost:5176/admin/blog');

  } catch (error) {
    console.error('💥 Error in createTestArticles:', error);
  }
}

// Run the function
createTestArticles();