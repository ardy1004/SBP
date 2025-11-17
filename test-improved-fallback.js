// Test Improved Fallback Description Generator
// Run with: node test-improved-fallback.js

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

// Simulate the improved fallback description
function generateFallbackDescription(data) {
  const propertyType = data.jenis_properti || 'properti';
  const location = `${data.kabupaten || ''}, ${data.provinsi || ''}`.trim();

  // Format price
  const price = (() => {
    if (!data.harga_properti) return 'harga bersaing';
    const num = parseFloat(data.harga_properti);
    if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(1)}M`;
    } else if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(1)}M`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
  })();

  // Enhanced property type labels
  const propertyLabels = {
    kost: 'Kost',
    rumah: 'Rumah',
    apartemen: 'Apartemen',
    ruko: 'Ruko',
    villa: 'Villa',
    gudang: 'Gudang'
  };

  const displayType = propertyLabels[propertyType] || propertyType.charAt(0).toUpperCase() + propertyType.slice(1);

  // Create engaging hook based on property type
  let hook = '';
  if (propertyType === 'kost') {
    hook = `🏠 TEMUKAN ${displayType.toUpperCase()} EKSKLUSIF IMPIAN ANDA DI ${location.toUpperCase()}!`;
  } else if (propertyType === 'rumah') {
    hook = `🏡 TEMUKAN ${displayType.toUpperCase()} IDAMAN ANDA DI ${location.toUpperCase()}!`;
  } else if (propertyType === 'apartemen') {
    hook = `🏢 TEMUKAN ${displayType.toUpperCase()} PREMIUM DI ${location.toUpperCase()}!`;
  } else {
    hook = `🏠 TEMUKAN ${displayType.toUpperCase()} EKSKLUSIF DI ${location.toUpperCase()}!`;
  }

  // Paragraph 1: Hook + Specifications + Price
  let paragraph1 = `${hook}\n\n${displayType} premium dengan bangunan berkualitas ini menawarkan hunian modern yang sangat nyaman`;

  if (data.kamar_tidur && data.kamar_mandi) {
    paragraph1 += ` dengan ${data.kamar_tidur} kamar tidur dan ${data.kamar_mandi} kamar mandi yang bersih`;
  } else if (data.kamar_tidur) {
    paragraph1 += ` dengan ${data.kamar_tidur} kamar tidur yang luas`;
  }

  if (data.luas_bangunan) {
    paragraph1 += ` dalam area ${data.luas_bangunan}m² yang efisien`;
  }

  paragraph1 += `. Harga terjangkau mulai ${price}!`;

  // Paragraph 2: Location & Accessibility
  let paragraph2 = `Lokasi sangat strategis di ${data.kabupaten || 'area strategis'} yang berkembang pesat`;

  // Add location-specific advantages for Yogyakarta/Sleman
  if (data.provinsi?.toLowerCase().includes('yogyakarta') || data.kabupaten?.toLowerCase().includes('sleman')) {
    paragraph2 += ', hanya berjarak strategis dari Universitas Gadjah Mada (UGM) dan Universitas Pembangunan Nasional "Veteran" Yogyakarta';
  }

  paragraph2 += '. Akses transportasi publik sangat mudah dengan berbagai pilihan angkutan umum menuju pusat kota.';

  if (data.luas_tanah) {
    paragraph2 += ` Luas tanah ${data.luas_tanah}m² memberikan ruang yang cukup untuk berbagai aktivitas penghuni.`;
  }

  // Paragraph 3: Facilities & Target Audience
  let paragraph3 = 'Fasilitas lengkap termasuk area parkir yang aman';

  if (propertyType === 'kost') {
    paragraph3 += ', WiFi unlimited, dan sistem keamanan 24 jam. Cocok untuk mahasiswa yang mencari hunian nyaman dekat kampus atau pekerja profesional yang membutuhkan lokasi strategis.';
  } else if (propertyType === 'rumah') {
    paragraph3 += ', taman yang asri, dan lingkungan yang tenang. Cocok untuk hunian keluarga yang menginginkan kenyamanan dan ketenangan.';
  } else if (propertyType === 'apartemen') {
    paragraph3 += ', gym, kolam renang, dan fasilitas modern lainnya. Cocok untuk urban lifestyle yang modern dan praktis.';
  } else {
    paragraph3 += ' dan lingkungan yang kondusif. Cocok untuk berbagai kebutuhan hunian dan investasi properti.';
  }

  // Paragraph 4: SEO & Call-to-action
  let paragraph4 = `${displayType} di ${data.kabupaten || location} - investasi hunian terbaik dengan lokasi premium dan fasilitas lengkap. ${displayType} strategis dengan harga bersaing di pasar properti saat ini.`;

  if (data.kode_listing) {
    paragraph4 += `\n\nKode listing: ${data.kode_listing}`;
  }

  // Combine all paragraphs
  const description = `${paragraph1}\n\n${paragraph2}\n\n${paragraph3}\n\n${paragraph4}`;

  return description;
}

console.log("🧪 Testing Improved Fallback Description Generator");
console.log("Property:", testData.kode_listing, "-", testData.jenis_properti);
console.log("Location:", testData.kabupaten + ",", testData.provinsi);
console.log("Price:", "Rp", testData.harga_properti);
console.log("");

// Generate and display the description
const description = generateFallbackDescription(testData);

console.log("✨ Generated Description:");
console.log("=".repeat(100));
console.log(description);
console.log("=".repeat(100));

console.log("\n📊 Quality Analysis:");
console.log("- Word count:", description.split(/\s+/).length);
console.log("- Character count:", description.length);
console.log("- Paragraphs:", description.split('\n\n').length);
console.log("- Has emoji hook:", description.includes('🏠'));
console.log("- SEO keywords:", description.toLowerCase().includes('kost sleman'));
console.log("- Location mentions:", (description.match(/universitas|ugm|yogyakarta/gi) || []).length);
console.log("- Call-to-action:", description.includes('investasi'));

console.log("\n🎯 SEO Keywords Found:");
const seoKeywords = ['kost', 'sleman', 'yogyakarta', 'strategis', 'premium', 'hunian', 'lokasi'];
seoKeywords.forEach(keyword => {
  const count = (description.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
  if (count > 0) {
    console.log(`- "${keyword}": ${count} times`);
  }
});

console.log("\n✅ Improved Fallback Test Completed!");
console.log("\n🚀 This should be MUCH better than the previous basic fallback!");