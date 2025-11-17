import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate SEO-friendly slug for property URLs (optimized version)
export function generatePropertySlug(property: {
  status?: string;
  jenis_properti?: string;
  provinsi?: string;
  kabupaten?: string;
  judul_properti?: string;
  kode_listing?: string;
}): string {
  // Clean province name (remove "DI." prefix and standardize)
  const cleanProvince = (provinsi: string) => {
    return provinsi
      .replace(/^DI\./i, '') // Remove "DI." prefix
      .replace(/^DAERAH\s+ISTIMEWA\s+/i, '') // Remove "Daerah Istimewa" prefix
      .toLowerCase()
      .trim();
  };

  // Extract key words from title (first 3-4 meaningful words)
  const extractKeyWords = (title: string): string => {
    if (!title) return '';

    // Split by spaces and filter out common words
    const words = title.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2) // Remove very short words
      .filter(word => !['dan', 'atau', 'dengan', 'yang', 'di', 'ke', 'dari', 'untuk', 'oleh', 'pada', 'dalam'].includes(word)) // Remove common words
      .slice(0, 3); // Take only first 3 words

    return words.join('-');
  };

  const parts = [
    property.status || 'dijual', // Status (dijual/disewakan)
    property.jenis_properti || 'properti', // Property type (kost, rumah, etc)
    cleanProvince(property.provinsi || ''), // Province (yogyakarta, jakarta, etc)
    property.kabupaten?.toLowerCase() || '', // Regency/City
    extractKeyWords(property.judul_properti || ''), // Key words from title (max 3 words)
    property.kode_listing || '' // Property code (K2.60, R1.25, etc)
  ];

  // Clean and format each part
  const cleanedParts = parts.map((part, index) => {
    if (!part) return '';

    // For kode_listing, keep original format
    if (index === 5) {
      return part.trim();
    }

    // For other parts, make lowercase and clean
    return part
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }).filter(part => part.length > 0); // Remove empty parts

  return cleanedParts.join('-');
}

// AI Description Generator using Google Gemini API (Free tier available)
export async function generatePropertyDescription(propertyData: {
  jenis_properti?: string;
  kabupaten?: string;
  provinsi?: string;
  harga_properti?: string;
  kamar_tidur?: number;
  kamar_mandi?: number;
  luas_tanah?: number;
  luas_bangunan?: number;
  kode_listing?: string;
  judul_properti?: string;
}): Promise<string> {
  try {
    const prompt = createSEODescriptionPrompt(propertyData);

    // Try Google Gemini API first (free tier available)
    try {
      const geminiResponse = await fetchGeminiDescription(prompt, propertyData);
      if (geminiResponse) {
        return geminiResponse;
      }
    } catch (error) {
      console.log('Gemini API failed, trying OpenAI:', error);
    }

    // Fallback to OpenAI API if Gemini fails
    try {
      const openAIResponse = await fetchOpenAIDescription(prompt, propertyData);
      if (openAIResponse) {
        return openAIResponse;
      }
    } catch (error) {
      console.log('OpenAI API failed:', error);
    }

    // Final fallback to rule-based description
    console.log('All AI APIs failed, using rule-based fallback');
    return generateFallbackDescription(propertyData);

  } catch (error) {
    console.error('AI Description generation failed:', error);
    // Fallback to rule-based description
    return generateFallbackDescription(propertyData);
  }
}

// Generate description using Google Gemini API
async function fetchGeminiDescription(prompt: string, propertyData: any): Promise<string | null> {
  // Using Gemini 2.5 Flash with higher creativity settings
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9, // Increased for more creativity
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json();
  const description = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (description) {
    return formatAndOptimizeDescription(description, propertyData);
  }

  return null;
}

// Generate description using OpenAI API
async function fetchOpenAIDescription(prompt: string, propertyData: any): Promise<string | null> {
  try {
    console.log('🔄 Calling OpenAI API...');
    console.log('API Key available:', !!import.meta.env.VITE_OPENAI_API_KEY);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: 'You are a professional real estate copywriter specializing in Indonesian property descriptions. Create engaging, SEO-friendly descriptions that attract buyers and rank well in Google.'
        }, {
          role: 'user',
          content: prompt
        }],
        max_tokens: 1000,
        temperature: 1.0, // Higher for maximum creativity
        presence_penalty: 0.4, // Encourage diverse vocabulary
        frequency_penalty: 0.4, // Reduce repetition more aggressively
        top_p: 0.95,
      }),
    });

    console.log('OpenAI Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('OpenAI Response:', result);

    const description = result.choices?.[0]?.message?.content;

    if (description && description.length > 50) {
      console.log('✅ OpenAI generated description successfully');
      return formatAndOptimizeDescription(description, propertyData);
    } else {
      console.log('❌ OpenAI returned empty or too short description');
      return null;
    }
  } catch (error) {
    console.error('❌ OpenAI API call failed:', error);
    return null;
  }
}

// Create dynamic SEO-optimized prompt for property description with multiple templates
function createSEODescriptionPrompt(data: any): string {
  const propertyType = data.jenis_properti || 'properti';
  const location = `${data.kabupaten || ''}, ${data.provinsi || ''}`.trim();
  const price = formatPriceForPrompt(data.harga_properti);
  const bedrooms = data.kamar_tidur ? `${data.kamar_tidur} kamar tidur` : '';
  const bathrooms = data.kamar_mandi ? `${data.kamar_mandi} kamar mandi` : '';
  const landArea = data.luas_tanah ? `${data.luas_tanah}m² tanah` : '';
  const buildingArea = data.luas_bangunan ? `${data.luas_bangunan}m² bangunan` : '';

  // Random template selection for variety
  const templates = getDescriptionTemplates();
  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

  // Random hook selection
  const hooks = getPropertyHooks(propertyType, location);
  const selectedHook = hooks[Math.floor(Math.random() * hooks.length)];

  // Random closing selection
  const closings = getPropertyClosings(propertyType, data.kabupaten || '');
  const selectedClosing = closings[Math.floor(Math.random() * closings.length)];

  // Random style variations
  const writingStyles = [
    "cerita personal yang engaging",
    "promosi yang persuasif",
    "deskripsi yang emosional",
    "penjelasan yang informatif namun menarik",
    "narrative yang mengalir natural"
  ];
  const selectedStyle = writingStyles[Math.floor(Math.random() * writingStyles.length)];

  return `${selectedTemplate.prompt}

INFORMASI PROPERTI DETAIL:
- Tipe Properti: ${propertyType}
- Lokasi Lengkap: ${location}
- Kisaran Harga: ${price}
- Spesifikasi Kamar: ${bedrooms} ${bathrooms}
- Luas Area: ${landArea} ${buildingArea}
- Kode Listing: ${data.kode_listing || 'N/A'}
- Judul Properti: ${data.judul_properti || 'N/A'}

KETENTUAN PEMBUATAN DESKRIPSI:
1. GAYA PENULISAN: ${selectedStyle}
2. HOOK PEMBUKA: ${selectedHook}
3. STRUKTUR NARATIF: ${selectedTemplate.structure}
4. UNSUR CLICK-BAIT: ${selectedTemplate.clickbait}
5. PANJANG IDEAL: ${selectedTemplate.length}
6. BAHASA: Indonesia modern, natural, persuasive, hindari bahasa formal kaku
7. SEO OPTIMIZATION: sertakan naturally keywords seperti "${propertyType} ${data.kabupaten}", "${propertyType} premium", "${propertyType} strategis", "${propertyType} murah"
8. CLOSING: ${selectedClosing}

CONTOH VARIASI HOOK:
${getHookExamples(propertyType).join('\n')}

CONTOH VARIASI CLOSING:
${getClosingExamples(propertyType).join('\n')}

PENTING: BUAT DESKRIPSI YANG SAMA SEKALI BERBEDA DARI CONTOH DI ATAS. JANGAN MENYALIN STRUKTUR ATAU KALIMAT SAMA. GUNAKAN KREATIVITAS MAKSIMAL UNTUK MEMBUAT DESKRIPSI YANG UNIK DAN MENARIK!`;
}

// Get multiple description templates for variety
function getDescriptionTemplates() {
  return [
    {
      prompt: "Buat deskripsi properti yang sangat menarik dan unik dengan pendekatan storytelling yang personal.",
      structure: "Mulai dengan hook emosional, lalu deskripsikan pengalaman tinggal di properti ini, kemudian jelaskan keunggulan lokasi, dan akhiri dengan call-to-action yang persuasive",
      clickbait: "Gunakan kata-kata seperti 'mimpi jadi kenyataan', 'hunian impian', 'lokasi premium', 'investasi cerdas'",
      length: "180-280 kata dengan alur cerita yang mengalir"
    },
    {
      prompt: "Buat deskripsi properti dengan gaya promosi modern yang menggabungkan benefit dan emosi.",
      structure: "Buka dengan masalah yang diselesaikan properti ini, jelaskan solusi melalui spesifikasi, gambarkan lifestyle yang didapat, dan tutup dengan value proposition yang kuat",
      clickbait: "Gunakan 'transformasi hidup', 'kenyamanan maksimal', 'lokasi strategis', 'harga terbaik'",
      length: "160-260 kata dengan fokus pada manfaat personal"
    },
    {
      prompt: "Buat deskripsi properti dengan pendekatan lifestyle dan aspirasi hidup penghuni.",
      structure: "Mulai dengan gambaran lifestyle yang diinginkan, hubungkan dengan fitur properti, jelaskan keunggulan area, dan akhiri dengan visi masa depan",
      clickbait: "Gunakan 'lifestyle modern', 'hunian berkelas', 'area premium', 'investasi masa depan'",
      length: "170-270 kata dengan tone aspiratif"
    },
    {
      prompt: "Buat deskripsi properti dengan gaya jurnalistik yang informatif namun sangat menarik.",
      structure: "Buka dengan fakta menarik tentang lokasi, jelaskan detail properti secara kronologis, tambahkan insight unik, dan tutup dengan rekomendasi investasi",
      clickbait: "Gunakan 'fakta menarik', 'lokasi eksklusif', 'properti premium', 'nilai investasi tinggi'",
      length: "190-290 kata dengan gaya reportase"
    },
    {
      prompt: "Buat deskripsi properti dengan pendekatan emosional dan koneksi personal.",
      structure: "Mulai dengan pertanyaan retoris tentang hunian ideal, jawab melalui deskripsi properti, bagikan 'kisah sukses' lokasi, dan akhiri dengan ajakan emosional",
      clickbait: "Gunakan 'apakah Anda mencari', 'bayangkan tinggal di', 'temukan kebahagiaan di', 'wujudkan impian'",
      length: "175-275 kata dengan tone personal"
    }
  ];
}

// Get varied hooks based on property type
function getPropertyHooks(propertyType: string, location: string) {
  const baseHooks = [
    `🚨 ALERT! ${location} punya ${propertyType} yang BIKIN NGEBANGGAIN!`,
    `😍 TEMUKAN ${propertyType.toUpperCase()} yang SELALU DIPIMPIN orang!`,
    `💫 SIAPA SIH yang GAK MAU punya ${propertyType} di ${location}?`,
    `🎯 ${propertyType.toUpperCase()} di ${location} - MIMPI JADI KENYATAAN!`,
    `🔥 BREAKING: ${propertyType} PREMIUM di ${location} BARU SAJA TERSEDIA!`,
    `🌟 KENAPA orang BERKUMPUL di ${propertyType} ini? SIMAK ceritanya!`,
    `💎 ${propertyType.toUpperCase()} EKSKLUSIF - HANYA untuk yang TAU NILAI!`,
    `🏆 JUARA ${propertyType} di ${location} - GAK PERLU DEBAT LAGI!`,
    `🎪 SELAMAT DATANG di DUNIA ${propertyType} yang BERBEDA!`,
    `⚡ SHOCKING! ${propertyType} di ${location} dengan HARGA GILA!`
  ];

  // Add property-specific hooks
  if (propertyType === 'kost') {
    baseHooks.push(
      `🎓 MAHASISWA ${location}, WAKTUNYA upgrade hunian!`,
      `💼 PEKERJA MILENIAL, ini ${propertyType} yang kamu CARI!`,
      `🏠 INDOMIE TIAP HARI? UPGRADE ke ${propertyType} premium!`
    );
  } else if (propertyType === 'rumah') {
    baseHooks.push(
      `👨‍👩‍👧‍👦 KELUARGA bahagia DIMULAI dari ${propertyType} yang TEPAT!`,
      `🏡 RUMAH IDAMAN - BUKAN lagi sekedar hunian!`,
      `🌳 PEKARANGAN HIJAU + ${propertyType} NYAMAN = SURGA!`
    );
  } else if (propertyType === 'apartemen') {
    baseHooks.push(
      `🏙️ URBAN LIFE maksimal di ${propertyType} premium!`,
      `🚀 LIFSTYLE MODERN dimulai dari ${propertyType} strategis!`,
      `🌆 CITY VIEW + FACILITIES LENGKAP = ${propertyType} impian!`
    );
  }

  return baseHooks;
}

// Get varied closings based on property type
function getPropertyClosings(propertyType: string, kabupaten: string) {
  const baseClosings = [
    `${propertyType} di ${kabupaten} - INVESTASI yang SELALU menguntungkan!`,
    `JANGAN ragu, ${propertyType} ini menunggu Anda!`,
    `${propertyType} premium ${kabupaten} - PILIHAN TERBAIK untuk masa depan!`,
    `WAKTUNYA memiliki ${propertyType} impian di ${kabupaten}!`,
    `${propertyType} strategis - KEPUTUSAN CERDAS untuk keluarga Anda!`,
    `BERGABUNG dengan pemilik ${propertyType} bahagia di ${kabupaten}!`,
    `${propertyType} eksklusif - HANYA untuk yang BERANI memilih yang terbaik!`,
    `MULAI babak baru dengan ${propertyType} premium di ${kabupaten}!`
  ];

  return baseClosings;
}

// Get hook examples for reference
function getHookExamples(propertyType: string) {
  return [
    `"Dari jendela kamar, pemandangan sunrise yang memukau menanti setiap pagi..."`,
    `"Bayangkan pulang ke rumah yang selalu menyambut dengan hangat..."`,
    `"Di tengah hiruk pikuk kota, ada oasis ketenangan yang menunggu..."`,
    `"Ini bukan sekedar hunian, ini adalah cerita hidup yang baru..."`,
    `"Ketika rumah menjadi lebih dari sekadar tempat tinggal..."`
  ];
}

// Get closing examples for reference
function getClosingExamples(propertyType: string) {
  return [
    `"Kode listing: [kode] - Kesempatan emas untuk memiliki hunian impian!"`,
    `"Jangan lewatkan opportunity ini. Hubungi kami sekarang juga!"`,
    `"Properti ini menunggu pemiliknya yang tepat. Apakah itu Anda?"`,
    `"Investasi cerdas dimulai dari keputusan yang tepat. Pilih properti ini!"`,
    `"Wujudkan impian hunian Anda bersama kami. Hubungi untuk informasi lebih detail!"`
  ];
}

// Format and optimize the generated description for better readability with more variety
function formatAndOptimizeDescription(description: string, data: any): string {
  // Clean up the text
  description = description
    .replace(/\n+/g, ' ') // Replace multiple newlines with space
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // Split into sentences
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Create dynamic paragraph structure with more variety
  const paragraphs = [];
  let currentParagraph = [];

  // Random paragraph length variation (2-4 sentences per paragraph)
  const maxSentencesPerParagraph = 2 + Math.floor(Math.random() * 3); // 2-4 sentences

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (!sentence) continue;

    currentParagraph.push(sentence);

    // Create paragraph break based on random length or key transition words
    const shouldBreak = (
      currentParagraph.length >= maxSentencesPerParagraph ||
      sentence.toLowerCase().includes('lokasi') ||
      sentence.toLowerCase().includes('fasilitas') ||
      sentence.toLowerCase().includes('cocok') ||
      sentence.toLowerCase().includes('harga') ||
      sentence.toLowerCase().includes('bangunan') ||
      sentence.toLowerCase().includes('tanah') ||
      (i > 0 && Math.random() < 0.3) // 30% chance for random breaks
    );

    if (shouldBreak && currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join('. ').trim() + (Math.random() < 0.7 ? '.' : '!'));
      currentParagraph = [];
    }
  }

  // Add remaining sentences
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join('. ').trim() + '.');
  }

  // Ensure we have at least 2-4 paragraphs for good structure
  const targetParagraphs = 2 + Math.floor(Math.random() * 3); // 2-4 paragraphs
  if (paragraphs.length < targetParagraphs && sentences.length > 3) {
    // Re-split into better paragraphs with more variety
    const sentencesPerPara = Math.ceil(sentences.length / targetParagraphs);
    const newParagraphs = [];

    for (let i = 0; i < sentences.length; i += sentencesPerPara) {
      const paraSentences = sentences.slice(i, i + sentencesPerPara);
      if (paraSentences.length > 0) {
        newParagraphs.push(paraSentences.join('. ').trim() + '.');
      }
    }

    paragraphs.length = 0;
    paragraphs.push(...newParagraphs.filter(p => p.length > 10));
  }

  // Join paragraphs with varied line breaks
  let finalDescription = paragraphs.join('\n\n');

  // Add more dynamic SEO keywords with variety
  const propertyType = data.jenis_properti || 'properti';
  const location = data.kabupaten || '';

  // More varied SEO keywords
  const seoKeywordSets = [
    [`${propertyType} ${location}`, `${propertyType} strategis`, `${propertyType} premium`],
    [`${propertyType} ${location}`, `${propertyType} murah`, `${propertyType} berkualitas`],
    [`${propertyType} ${location}`, `${propertyType} eksklusif`, `${propertyType} terjangkau`],
    [`${propertyType} ${location}`, `${propertyType} modern`, `${propertyType} nyaman`],
    [`${propertyType} ${location}`, `${propertyType} terbaik`, `${propertyType} recommended`]
  ];

  const selectedKeywordSet = seoKeywordSets[Math.floor(Math.random() * seoKeywordSets.length)];

  // Add SEO keywords more naturally and variably
  const missingKeywords = selectedKeywordSet.filter(keyword =>
    !finalDescription.toLowerCase().includes(keyword.toLowerCase())
  );

  if (missingKeywords.length > 0 && finalDescription.length < 900) {
    // Random closing variations
    const closingVariations = [
      `${propertyType} ${location} - ${missingKeywords.slice(0, 2).join(' dan ')}.`,
      `Temukan ${missingKeywords.slice(0, 2).join(' dan ')} di ${location}.`,
      `${propertyType} di ${location} menawarkan ${missingKeywords.slice(0, 2).join(' dan ')}.`,
      `Pilihan terbaik: ${missingKeywords.slice(0, 2).join(' dan ')} di ${location}.`,
      `${location} - Destinasi ${missingKeywords.slice(0, 2).join(' dan ')}.`
    ];

    const selectedClosing = closingVariations[Math.floor(Math.random() * closingVariations.length)];

    // Add to different positions randomly
    const lastParagraph = paragraphs[paragraphs.length - 1];
    if (lastParagraph && !lastParagraph.includes('Kode listing')) {
      if (Math.random() < 0.6) {
        // Add as separate paragraph
        finalDescription = finalDescription.replace(
          lastParagraph,
          lastParagraph + `\n\n${selectedClosing}`
        );
      } else {
        // Integrate into last paragraph
        finalDescription = finalDescription.replace(
          lastParagraph,
          lastParagraph + ` ${selectedClosing}`
        );
      }
    }
  }

  // Add code listing with more variety
  if (data.kode_listing && !finalDescription.includes('Kode listing') && !finalDescription.includes(data.kode_listing)) {
    const codeVariations = [
      `\n\nKode listing: ${data.kode_listing}`,
      `\n\nListing ID: ${data.kode_listing}`,
      `\n\nReferensi: ${data.kode_listing}`,
      `\n\nKode properti: ${data.kode_listing}`,
      `\n\nID: ${data.kode_listing}`
    ];

    const selectedCodeFormat = codeVariations[Math.floor(Math.random() * codeVariations.length)];
    finalDescription += selectedCodeFormat;
  }

  return finalDescription;
}

// Enhanced fallback description generator with more variety and creativity
function generateFallbackDescription(data: any): string {
  const propertyType = data.jenis_properti || 'properti';
  const location = `${data.kabupaten || ''}, ${data.provinsi || ''}`.trim();
  const price = formatPriceForPrompt(data.harga_properti);

  // Enhanced property type labels with more variety
  const propertyLabels: Record<string, string> = {
    kost: 'Kost',
    rumah: 'Rumah',
    apartemen: 'Apartemen',
    ruko: 'Ruko',
    villa: 'Villa',
    gudang: 'Gudang',
    tanah: 'Tanah'
  };

  const displayType = propertyLabels[propertyType as string] || (propertyType as string)?.charAt(0).toUpperCase() + (propertyType as string)?.slice(1);

  // Multiple hook variations for each property type
  const hookVariations = {
    kost: [
      `🏠 MAHASISWA ${data.kabupaten?.toUpperCase() || 'AREA'}, WAKTUNYA UPGRADE HUNIAN!`,
      `🎓 KOST PREMIUM di ${location} - MIMPI SETIAP MAHASISWA!`,
      `💼 PEKERJA MILENIAL, TEMUKAN KOST IDEAL di ${data.kabupaten || 'lokasi strategis'}!`,
      `🏢 KOST MODERN dengan FASILITAS LENGKAP di ${location}!`,
      `🌟 KOST EKSKLUSIF - BUKAN SEKEDAR TEMPAT TINGGAL!`
    ],
    rumah: [
      `🏡 RUMAH IDAMAN di ${location} - MULAI CERITA BARU KELUARGA ANDA!`,
      `👨‍👩‍👧‍👦 KELUARGA BAHAGIA DIMULAI dari RUMAH yang TEPAT!`,
      `🏠 RUMAH PREMIUM dengan TAMAN HIJAU di ${data.kabupaten || 'area nyaman'}!`,
      `🌳 PEKARANGAN LUAS + RUMAH NYAMAN = SURGA KELUARGA!`,
      `💫 RUMAH MODERN - INVESTASI UNTUK MASA DEPAN KELUARGA!`
    ],
    apartemen: [
      `🏙️ APARTEMEN PREMIUM di ${location} - LIFESTYLE URBAN MODERN!`,
      `🌆 CITY VIEW MENAKJUBKAN dari APARTEMEN STRATEGIS!`,
      `🚀 APARTEMEN MODERN dengan FACILITIES LENGKAP di ${data.kabupaten || 'pusat kota'}!`,
      `🏢 APARTEMEN EKSKLUSIF - STATUS SYMBOL ANDA!`,
      `💎 APARTEMEN LUXURY dengan PELAYANAN BINTANG LIMA!`
    ],
    tanah: [
      `🌱 LAHAN INVESTASI TERBAIK di ${location} - PELUANG EMAS!`,
      `🏗️ TANAH KAVLING STRATEGIS untuk PENGEMBANGAN BISNIS!`,
      `💰 INVESTASI TANAH di ${data.kabupaten || 'area berkembang'} - PASTI UNTUNG!`,
      `🌄 TANAH PREMIUM dengan POTENSI PENGEMBANGAN TINGGI!`,
      `📈 LAHAN STRATEGIS - NILAI INVESTASI TERUS NAIK!`
    ],
    ruko: [
      `🏪 RUKO STRATEGIS di ${location} - BISNIS ANDA BERKEMBANG!`,
      `💼 RUKO PREMIUM untuk USAHA ANDA di ${data.kabupaten || 'lokasi ramai'}!`,
      `🏢 RUKO MODERN - TEMPAT BISNIS IDEAL!`,
      `🌟 RUKO EKSKLUSIF dengan TRAFFIC TINGGI!`,
      `💡 RUKO BISNIS - MULAI WIRAUSAHA ANDA!`
    ],
    villa: [
      `🏘️ VILLA MEWAH di ${location} - LIFESTYLE LUXURY!`,
      `🌴 VILLA TROPIS dengan KOLAM RENANG PRIBADI!`,
      `💎 VILLA EKSKLUSIF - PRIVACY DAN KENYAMANAN MAKSIMAL!`,
      `🏊 VILLA RESORT-STYLE di ${data.kabupaten || 'area premium'}!`,
      `🌺 VILLA INDONESIA - SURGA TERSENDIRI!`
    ],
    gudang: [
      `🏭 GUDANG STRATEGIS di ${location} - LOGISTIK ANDA MUDAH!`,
      `📦 GUDANG PREMIUM untuk BISNIS ANDA!`,
      `🏢 GUDANG MODERN dengan AKSES MUDAH!`,
      `💼 GUDANG BISNIS - INVESTASI CERDAS!`,
      `🚛 GUDANG LOGISTIK - DISTRIBUSI OPTIMAL!`
    ]
  };

  const availableHooks = hookVariations[propertyType as keyof typeof hookVariations] || hookVariations.rumah;
  const selectedHook = availableHooks[Math.floor(Math.random() * availableHooks.length)];

  // Generate varied paragraph content based on property type
  const paragraphGenerators = {
    kost: generateKostDescription,
    rumah: generateRumahDescription,
    apartemen: generateApartemenDescription,
    tanah: generateTanahDescription,
    ruko: generateRukoDescription,
    villa: generateVillaDescription,
    gudang: generateGudangDescription
  };

  const generateDescription = paragraphGenerators[propertyType as keyof typeof paragraphGenerators] || generateRumahDescription;

  // Generate description with variety
  const descriptionParts = generateDescription(data, displayType, location, price, selectedHook);

  // Add varied SEO keywords
  const seoVariations = [
    `${displayType} di ${data.kabupaten || location} - investasi terbaik dengan lokasi premium!`,
    `${displayType} strategis ${data.kabupaten || location} - harga bersaing, kualitas terjamin!`,
    `Temukan ${displayType} premium di ${data.kabupaten || location} - hunian ideal untuk Anda!`,
    `${displayType} ${data.kabupaten || location} - pilihan cerdas untuk masa depan!`,
    `${data.kabupaten || location} - destinasi ${displayType} berkualitas tinggi!`
  ];

  const selectedSEO = seoVariations[Math.floor(Math.random() * seoVariations.length)];

  // Combine all parts
  let finalDescription = descriptionParts.join('\n\n');
  finalDescription += `\n\n${selectedSEO}`;

  if (data.kode_listing) {
    const codeFormats = [
      `Kode listing: ${data.kode_listing}`,
      `Referensi: ${data.kode_listing}`,
      `ID Properti: ${data.kode_listing}`,
      `Listing: ${data.kode_listing}`
    ];
    const selectedCodeFormat = codeFormats[Math.floor(Math.random() * codeFormats.length)];
    finalDescription += `\n\n${selectedCodeFormat}`;
  }

  return finalDescription;
}

// Individual description generators for each property type with variety
function generateKostDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    // Variation 1: Student-focused
    [
      `${hook}\n\n${displayType} modern ini dirancang khusus untuk mahasiswa dan pekerja muda yang menginginkan hunian praktis namun berkualitas. Dengan ${data.kamar_tidur || 'beberapa'} kamar tidur yang nyaman dan ${data.kamar_mandi || 'kamar mandi'} bersih, tempat ini menawarkan keseimbangan sempurna antara kenyamanan dan aksesibilitas.`,
      `Lokasi sangat strategis di ${data.kabupaten || 'pusat kota'} yang dekat dengan kampus-kampus ternama dan pusat perbelanjaan. Akses transportasi umum sangat mudah, sehingga memudahkan aktivitas sehari-hari Anda.`,
      `Fasilitas lengkap termasuk WiFi unlimited, area laundry bersama, dapur bersama yang bersih, dan sistem keamanan 24 jam. Cocok untuk mahasiswa yang ingin fokus pada studi atau pekerja profesional yang membutuhkan hunian sementara yang terjangkau.`,
      `Harga mulai dari ${price} - investasi cerdas untuk hunian berkualitas!`
    ],
    // Variation 2: Modern lifestyle
    [
      `${hook}\n\n${displayType} ini bukan sekedar tempat tinggal, tapi gaya hidup modern yang affordable. Setiap unit dirancang dengan konsep minimalis namun fungsional, dilengkapi dengan ${data.kamar_tidur || 'kamar tidur'} yang luas dan ${data.kamar_mandi || 'kamar mandi'} modern.`,
      `Terletak di ${location}, lokasi premium yang mudah diakses dari berbagai penjuru kota. Dekat dengan mall, restoran, dan fasilitas umum lainnya, membuat hidup Anda lebih praktis dan menyenangkan.`,
      `Fasilitas premium seperti gym mini, co-working space, dan community area membuat hunian ini lebih dari sekedar kost biasa. Sistem keamanan canggih dan CCTV memastikan kenyamanan dan keamanan penghuni.`,
      `Dengan harga terjangkau ${price}, dapatkan pengalaman hunian premium yang tak tertandingi!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateRumahDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    // Variation 1: Family-oriented
    [
      `${hook}\n\n${displayType} ini dirancang untuk menciptakan suasana keluarga yang hangat dan nyaman. Dengan ${data.kamar_tidur || 'beberapa'} kamar tidur yang luas dan ${data.kamar_mandi || 'kamar mandi'} modern, setiap anggota keluarga akan memiliki privasi yang cukup.`,
      `Berada di ${location}, lokasi strategis namun tetap tenang dan asri. Akses tol dan transportasi umum sangat mudah, sehingga memudahkan mobilitas keluarga.`,
      `Fasilitas rumah tangga lengkap termasuk taman yang hijau, area parkir luas, dan lingkungan yang aman untuk anak-anak bermain. Cocok untuk keluarga yang menginginkan hunian permanen dengan kualitas hidup tinggi.`,
      `Harga properti ${price} - investasi jangka panjang yang menguntungkan!`
    ],
    // Variation 2: Modern living
    [
      `${hook}\n\n${displayType} modern dengan desain arsitektur kontemporer yang memukau. Luas bangunan ${data.luas_bangunan || 'optimal'}m² memberikan ruang yang cukup untuk berbagai aktivitas keluarga.`,
      `Lokasi premium di ${data.kabupaten || 'area berkembang'} yang terus meningkat nilai investasinya. Dekat dengan sekolah, rumah sakit, dan pusat perbelanjaan modern.`,
      `Interior yang elegan dengan finishing berkualitas tinggi, taman tropis yang indah, dan fasilitas smart home membuat hunian ini benar-benar istimewa.`,
      `Mulai dari ${price} - rumah impian Anda menanti!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateApartemenDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    // Variation 1: Urban lifestyle
    [
      `${hook}\n\n${displayType} ini menawarkan lifestyle urban modern yang praktis dan mewah. Unit dengan ${data.kamar_tidur || 'kamar tidur'} yang ergonomic dan ${data.kamar_mandi || 'kamar mandi'} premium, dirancang untuk kenyamanan maksimal.`,
      `Lokasi strategis di ${location}, pusat bisnis dan hiburan kota. Akses mudah ke bandara, stasiun kereta, dan jalan tol membuat mobilitas Anda tak terbatas.`,
      `Fasilitas bintang lima seperti infinity pool, fitness center, spa, dan sky lounge. Sistem keamanan 24 jam dan concierge service memastikan kenyamanan penghuni.`,
      `Harga mulai ${price} - status symbol Anda di tengah kota!`
    ],
    // Variation 2: Smart living
    [
      `${hook}\n\n${displayType} cerdas dengan teknologi terdepan untuk kemudahan hidup modern. Setiap unit dilengkapi smart home system yang dapat dikontrol via aplikasi.`,
      `Terletak di ${data.kabupaten || 'pusat kota'}, lokasi premium dengan city view menakjubkan. Dekat dengan pusat bisnis, mall, dan restoran ternama.`,
      `Fasilitas lengkap termasuk roof garden, business center, kids playground, dan multipurpose room. Komunitas yang eksklusif dengan event rutin.`,
      `Investasi properti ${price} - masa depan cerah Anda!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateTanahDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    // Variation 1: Investment focus
    [
      `${hook}\n\n${displayType} kavling ini menawarkan peluang investasi emas dengan potensi pengembangan yang sangat tinggi. Luas ${data.luas_tanah || 'strategis'}m² siap untuk berbagai macam pengembangan properti.`,
      `Lokasi sangat strategis di ${location}, area yang terus berkembang dengan infrastruktur yang semakin lengkap. Akses tol, jalan utama, dan transportasi umum sangat mudah.`,
      `Dekat dengan pusat pertumbuhan ekonomi, sekolah, rumah sakit, dan pusat perbelanjaan. Nilai investasi yang terus meningkat seiring perkembangan daerah.`,
      `Harga tanah ${price} - keputusan investasi cerdas untuk masa depan!`
    ],
    // Variation 2: Development potential
    [
      `${hook}\n\n${displayType} premium dengan sertifikat hak milik yang jelas dan siap bangun. Kontur tanah yang baik membuat pengembangan menjadi lebih mudah dan efisien.`,
      `Terletak di ${data.kabupaten || 'area potensial'}, lokasi yang diproyeksikan menjadi pusat pertumbuhan baru. Infrastruktur yang terus dibangun pemerintah.`,
      `Cocok untuk pengembangan perumahan, apartemen, ruko, atau investasi jangka panjang. Potensi keuntungan yang sangat menjanjikan.`,
      `Mulai dari ${price} - lahan impian pengembang properti!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateRukoDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} strategis ini menawarkan lokasi bisnis yang sangat menguntungkan. Desain modern dengan luas bangunan ${data.luas_bangunan || 'optimal'}m² yang efisien untuk berbagai jenis usaha.`,
      `Terletak di ${location}, area dengan traffic tinggi dan potensi customer yang besar. Dekat dengan pemukiman, perkantoran, dan pusat perbelanjaan.`,
      `Fasilitas lengkap termasuk area parkir luas, loading dock, dan ruang atas yang dapat dimanfaatkan untuk kantor atau gudang. Cocok untuk retail, jasa, atau food business.`,
      `Harga ${price} - investasi bisnis yang pasti menguntungkan!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateVillaDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} mewah ini menawarkan pengalaman hidup tropis yang tak tertandingi. Dengan ${data.kamar_tidur || 'beberapa'} kamar tidur mewah dan kolam renang pribadi, setiap hari terasa seperti berlibur.`,
      `Lokasi eksklusif di ${location}, area premium dengan pemandangan alam yang indah. Lingkungan yang tenang namun mudah diakses dari pusat kota.`,
      `Fasilitas luxury seperti home theater, gym pribadi, taman tropis, dan gazebo. Desain arsitektur yang menggabungkan unsur tradisional dan modern.`,
      `Harga premium ${price} - lifestyle mewah dalam jangkauan Anda!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateGudangDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} modern dengan luas ${data.luas_bangunan || 'optimal'}m² yang dirancang untuk efisiensi logistik maksimal. Tinggi plafon yang memadai untuk berbagai jenis penyimpanan.`,
      `Lokasi strategis di ${location}, mudah diakses dari jalan tol dan pelabuhan. Infrastruktur logistik yang lengkap memudahkan distribusi barang.`,
      `Fasilitas lengkap termasuk loading dock, area parkir truk, dan sistem keamanan 24 jam. Cocok untuk bisnis retail, manufaktur, atau distribusi.`,
      `Investasi gudang ${price} - bisnis logistik Anda makin efisien!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

// Helper function to format price for prompts
function formatPriceForPrompt(price: string): string {
  if (!price) return 'harga bersaing';

  const num = parseFloat(price);
  if (num >= 1000000000) {
    return `Rp ${(num / 1000000000).toFixed(1)}M`;
  } else if (num >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(1)}M`;
  }
  return `Rp ${num.toLocaleString('id-ID')}`;
}




// Parse slug back to property search criteria (for routing)
export function parsePropertySlug(slug: string): {
  status?: string;
  jenis_properti?: string;
  provinsi?: string;
  kabupaten?: string;
  judul_properti?: string;
  kode_listing?: string;
} {
  const parts = slug.split('-');

  // Try to identify kode_listing (usually ends with pattern like K2.60, R1.25, etc)
  let kodeListingIndex = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/^[A-Z]\d+\.\d+$/.test(parts[i].toUpperCase())) {
      kodeListingIndex = i;
      break;
    }
  }

  if (kodeListingIndex === -1) {
    // Fallback: assume last part is kode_listing
    kodeListingIndex = parts.length - 1;
  }

  const kode_listing = parts[kodeListingIndex]?.toUpperCase();

  // Extract other parts based on position
  const status = parts[0];
  const jenis_properti = parts[1];

  // Reconstruct location parts (provinsi-kabupaten might be combined)
  let provinsi = '';
  let kabupaten = '';
  let judulStartIndex = 2;

  if (parts.length > kodeListingIndex) {
    // Try to identify location parts
    const locationParts = parts.slice(2, kodeListingIndex);

    // Common province names in Indonesia
    const provinces = ['diyogyakarta', 'jakarta', 'jabar', 'jateng', 'jatim', 'bali', 'sumatera', 'sulawesi', 'kalimantan', 'papua'];

    for (let i = 0; i < locationParts.length; i++) {
      if (provinces.some(p => locationParts[i].includes(p))) {
        provinsi = locationParts[i];
        kabupaten = locationParts[i + 1] || '';
        judulStartIndex = 2 + i + (kabupaten ? 1 : 0) + 1;
        break;
      }
    }

    // If no province found, assume first two are location
    if (!provinsi && locationParts.length >= 2) {
      provinsi = locationParts[0];
      kabupaten = locationParts[1];
      judulStartIndex = 4;
    } else if (!provinsi && locationParts.length === 1) {
      provinsi = locationParts[0];
      judulStartIndex = 3;
    }
  }

  // Reconstruct title from remaining parts
  const titleParts = parts.slice(judulStartIndex, kodeListingIndex);
  const judul_properti = titleParts.join(' ').replace(/-/g, ' ');

  return {
    status,
    jenis_properti,
    provinsi,
    kabupaten,
    judul_properti,
    kode_listing
  };
}
