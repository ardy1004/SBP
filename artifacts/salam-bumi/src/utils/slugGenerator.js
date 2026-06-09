/**
 * Slug Generator Utility untuk Salam Bumi Property
 * 
 * Fungsi untuk generate SEO-friendly slug secara otomatis
 * Pattern: {property-type}-{key-features}-{location}-{listing-code}
 * 
 * Contoh: rumah-mewah-2-lantai-sleman-r3-27
 */

// Stop words bahasa Indonesia yang dihapus dari slug
const STOP_WORDS = [
  "yang", "di", "ke", "dari", "untuk", "dengan", "dan", "atau", "pada", "dalam",
  "adalah", "akan", "sangat", "ini", "itu", "tersebut", "sebuah", "secara",
  "telah", "sedang", "sudah", "jadi", "menjadi", "harga", "turun", "naik",
  "murah", "mahal", "promo", "diskon", "ter", "se", "ber", "me", "pe",
  "lah", "kah", "pun", "nya", "ku", "mu", "dia", "ia", "mereka", "kami",
  "kita", "anda", "beliau", "saya", "hanya", "juga", "tidak", "bukan",
  "belum", "sudah", "masih", "lebih", "paling", "sekali", "banget"
];

/**
 * Normalize text: lowercase, remove special chars, replace with hyphen
 * @param {string} text - Input text
 * @returns {string} - Normalized text
 */
function normalizeText(text) {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9\s-]/g, "") // Hapus karakter khusus kecuali spasi dan hyphen
    .replace(/\s+/g, "-") // Ganti spasi dengan hyphen
    .replace(/-+/g, "-") // Ganti multiple hyphen dengan single
    .replace(/^-|-$/g, ""); // Hapus hyphen di awal/akhir
}

/**
 * Remove stop words dari text
 * @param {string} text - Input text
 * @returns {string} - Text tanpa stop words
 */
function removeStopWords(text) {
  if (!text) return "";
  
  const words = text.split("-");
  const filtered = words.filter(word => !STOP_WORDS.includes(word));
  
  return filtered.join("-");
}

/**
 * Truncate slug ke panjang maksimal tanpa memotong kata
 * @param {string} slug - Input slug
 * @param {number} maxLength - Panjang maksimal (default: 60)
 * @returns {string} - Slug yang sudah dipotong
 */
function truncateSlug(slug, maxLength = 60) {
  if (!slug || slug.length <= maxLength) return slug;
  
  // Potong di hyphen terakhir sebelum maxLength
  const truncated = slug.substring(0, maxLength);
  const lastHyphen = truncated.lastIndexOf("-");
  
  if (lastHyphen > 0) {
    return truncated.substring(0, lastHyphen);
  }
  
  return truncated;
}

/**
 * Format listing code: replace dot with hyphen, lowercase
 * @param {string} code - Listing code (e.g., "R3.27")
 * @returns {string} - Formatted code (e.g., "r3-27")
 */
function formatListingCode(code) {
  if (!code) return "";
  
  return code
    .toLowerCase()
    .replace(/\./g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Generate SEO-friendly slug
 * 
 * @param {Object} params - Parameter untuk generate slug
 * @param {string} params.title - Judul properti
 * @param {string} params.propertyType - Tipe properti (rumah, kost, tanah, dll)
 * @param {string} params.location - Lokasi (kota/kecamatan)
 * @param {string} params.listingCode - Kode listing (e.g., "R3.27")
 * @returns {string} - SEO-friendly slug
 */
function generateSlug(params) {
  const { title, propertyType, location, listingCode } = params;
  
  if (!title && !propertyType) {
    return "";
  }
  
  // Step 1: Normalize title
  let slugParts = [];
  
  // Tambahkan property type jika ada
  if (propertyType) {
    slugParts.push(normalizeText(propertyType));
  }
  
  // Tambahkan kata kunci dari title (maksimal 5 kata)
  if (title) {
    const normalizedTitle = normalizeText(title);
    const titleWithoutStopWords = removeStopWords(normalizedTitle);
    const titleWords = titleWithoutStopWords.split("-").slice(0, 5);
    
    // Hapus property type dari title jika sudah ada di depan
    const propTypeNormalized = normalizeText(propertyType);
    const filteredWords = titleWords.filter(word => word !== propTypeNormalized);
    
    slugParts = slugParts.concat(filteredWords);
  }
  
  // Tambahkan location jika ada
  if (location) {
    slugParts.push(normalizeText(location));
  }
  
  // Gabungkan semua parts
  let slug = slugParts.filter(p => p).join("-");
  
  // Hapus duplikat kata
  const uniqueWords = [];
  slug.split("-").forEach(word => {
    if (!uniqueWords.includes(word)) {
      uniqueWords.push(word);
    }
  });
  slug = uniqueWords.join("-");
  
  // Truncate jika terlalu panjang (sebelum tambah listing code)
  slug = truncateSlug(slug, 50);
  
  // Tambahkan listing code di akhir
  if (listingCode) {
    const formattedCode = formatListingCode(listingCode);
    slug = `${slug}-${formattedCode}`;
  }
  
  // Final cleanup
  slug = slug
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  
  return slug;
}

/**
 * Validasi format slug
 * @param {string} slug - Slug untuk divalidasi
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateSlug(slug) {
  const errors = [];
  
  if (!slug) {
    return { isValid: false, errors: ["Slug tidak boleh kosong"] };
  }
  
  // Cek panjang
  if (slug.length > 80) {
    errors.push("Slug terlalu panjang (maksimal 80 karakter)");
  }
  
  // Cek format: hanya lowercase, angka, dan hyphen
  const validFormat = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!validFormat.test(slug)) {
    errors.push("Slug hanya boleh berisi huruf kecil, angka, dan hyphen");
  }
  
  // Cek tidak boleh diawali/diakhiri dengan hyphen
  if (slug.startsWith("-") || slug.endsWith("-")) {
    errors.push("Slug tidak boleh diawali atau diakhiri dengan hyphen");
  }
  
  // Cek tidak ada double hyphen
  if (slug.includes("--")) {
    errors.push("Slug tidak boleh mengandung double hyphen");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Hitung SEO score untuk slug
 * @param {string} slug - Slug untuk dinilai
 * @returns {number} - Score 0-100
 */
function calculateSEOScore(slug) {
  if (!slug) return 0;
  
  let score = 0;
  
  // Punya property type (+20 poin)
  const propertyTypes = ["rumah", "kost", "tanah", "villa", "ruko", "apartment", "hotel", "gudang"];
  if (propertyTypes.some(type => slug.includes(type))) {
    score += 20;
  }
  
  // Punya listing code di akhir (+20 poin)
  if (/[a-z]+[0-9]+-[0-9]+$/.test(slug) || /[a-z]+[0-9]+$/.test(slug)) {
    score += 20;
  }
  
  // Panjang antara 30-60 karakter (+20 poin)
  if (slug.length >= 30 && slug.length <= 60) {
    score += 20;
  } else if (slug.length >= 20 && slug.length <= 80) {
    score += 10;
  }
  
  // Tidak ada stop words (+20 poin)
  const hasStopWords = STOP_WORDS.some(word => slug.includes(`-${word}-`) || slug.startsWith(`${word}-`) || slug.endsWith(`-${word}`));
  if (!hasStopWords) {
    score += 20;
  }
  
  // Format valid (+20 poin)
  const validation = validateSlug(slug);
  if (validation.isValid) {
    score += 20;
  }
  
  return score;
}

/**
 * Generate suggestions jika slug sudah dipakai
 * @param {string} baseSlug - Slug dasar
 * @param {number} count - Jumlah saran (default: 3)
 * @returns {string[]} - Array saran slug
 */
function generateSlugSuggestions(baseSlug, count = 3) {
  const suggestions = [];
  
  for (let i = 1; i <= count; i++) {
    suggestions.push(`${baseSlug}-${i}`);
  }
  
  return suggestions;
}

// Export semua fungsi
export {
  generateSlug,
  validateSlug,
  normalizeText,
  removeStopWords,
  truncateSlug,
  formatListingCode,
  calculateSEOScore,
  generateSlugSuggestions,
  STOP_WORDS
};
