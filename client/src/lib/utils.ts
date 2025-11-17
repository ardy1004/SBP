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
  const status = data.status || 'dijual'; // dijual or disewakan

  // Get status-specific context
  const statusContext = getStatusContext(status, propertyType);

  // Random template selection for variety
  const templates = getDescriptionTemplates(status);
  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

  // Random hook selection based on status
  const hooks = getPropertyHooks(propertyType, location, status);
  const selectedHook = hooks[Math.floor(Math.random() * hooks.length)];

  // Random closing selection based on status
  const closings = getPropertyClosings(propertyType, data.kabupaten || '', status);
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
- Status: ${status} (${statusContext.description})
- Lokasi Lengkap: ${location}
- Kisaran Harga: ${price}
- Spesifikasi Kamar: ${bedrooms} ${bathrooms}
- Luas Area: ${landArea} ${buildingArea}
- Kode Listing: ${data.kode_listing || 'N/A'}
- Judul Properti: ${data.judul_properti || 'N/A'}

KETENTUAN PEMBUATAN DESKRIPSI:
1. GAYA PENULISAN: ${selectedStyle}
2. TARGET MARKET: ${statusContext.targetMarket}
3. TONE & BAHASA: ${statusContext.tone}
4. HOOK PEMBUKA: ${selectedHook}
5. STRUKTUR NARATIF: ${selectedTemplate.structure}
6. UNSUR CLICK-BAIT: ${selectedTemplate.clickbait}
7. PANJANG IDEAL: ${selectedTemplate.length}
8. BAHASA: Indonesia modern, natural, persuasive, hindari bahasa formal kaku
9. SEO OPTIMIZATION: sertakan naturally keywords seperti "${propertyType} ${data.kabupaten}", "${propertyType} ${status}", "${propertyType} premium", "${propertyType} strategis"
10. CLOSING: ${selectedClosing}

${statusContext.guidelines}

CONTOH VARIASI HOOK UNTUK ${status.toUpperCase()}:
${getHookExamples(propertyType, status).join('\n')}

CONTOH VARIASI CLOSING UNTUK ${status.toUpperCase()}:
${getClosingExamples(propertyType, status).join('\n')}

PENTING: BUAT DESKRIPSI YANG SAMA SEKALI BERBEDA DARI CONTOH DI ATAS. JANGAN MENYALIN STRUKTUR ATAU KALIMAT SAMA. GUNAKAN KREATIVITAS MAKSIMAL DAN SESUAIKAN DENGAN KONTEKS ${status.toUpperCase()}!`;
}

// Get status-specific context for property descriptions
function getStatusContext(status: string, propertyType: string) {
  if (status === 'disewakan') {
    return {
      description: 'Properti untuk disewakan - hunian sementara',
      targetMarket: 'Target market luas: mahasiswa, pekerja, keluarga muda, ekspatriat, siapa saja yang butuh hunian praktis dan terjangkau',
      tone: 'Bahasa friendly, accessible, menekankan kenyamanan sehari-hari, fasilitas, dan kemudahan akses',
      guidelines: 'KETENTUAN KHUSUS UNTUK SEWA:\n- Fokus pada kenyamanan dan kemudahan hidup sehari-hari\n- Tonjolkan fasilitas yang membuat hidup lebih praktis\n- Sebutkan target audience yang luas (mahasiswa, pekerja, dll)\n- Gunakan bahasa yang ramah dan approachable\n- Tekankan nilai sewa yang reasonable untuk kualitas yang didapat'
    };
  } else {
    // dijual
    return {
      description: 'Properti untuk dijual - investasi jangka panjang',
      targetMarket: 'Target market premium: investor, pembeli dengan budget tinggi, keluarga mapan, pencari properti permanen',
      tone: 'Bahasa sophisticated, menekankan nilai investasi, prestige, kualitas premium, dan potensi pengembangan',
      guidelines: 'KETENTUAN KHUSUS UNTUK JUAL:\n- Fokus pada nilai investasi dan pengembalian (ROI)\n- Tonjolkan prestige, eksklusivitas, dan kualitas premium\n- Sebutkan potensi kenaikan nilai dan pengembangan\n- Gunakan bahasa yang sophisticated dan aspiratif\n- Tekankan keunggulan jangka panjang dan status sosial'
    };
  }
}

// Get multiple description templates for variety based on status
function getDescriptionTemplates(status: string) {
  const baseTemplates = [
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

  // Add status-specific templates
  if (status === 'disewakan') {
    baseTemplates.push({
      prompt: "Buat deskripsi properti sewa yang menekankan kenyamanan hidup sehari-hari dan kemudahan akses.",
      structure: "Mulai dengan kebutuhan penghuni modern, jelaskan bagaimana properti memenuhi kebutuhan tersebut, sebutkan fasilitas praktis, dan akhiri dengan penawaran yang menarik",
      clickbait: "Gunakan 'hidup praktis', 'fasilitas lengkap', 'lokasi strategis', 'harga terjangkau'",
      length: "150-250 kata dengan fokus pada kenyamanan sehari-hari"
    });
  } else {
    baseTemplates.push({
      prompt: "Buat deskripsi properti jual yang menekankan nilai investasi dan prestige kepemilikan.",
      structure: "Mulai dengan potensi investasi, jelaskan keunggulan properti sebagai aset, sebutkan nilai jangka panjang, dan akhiri dengan ajakan untuk memiliki",
      clickbait: "Gunakan 'investasi menguntungkan', 'aset prestisius', 'nilai meningkat', 'kepemilikan eksklusif'",
      length: "180-280 kata dengan fokus pada nilai investasi"
    });
  }

  return baseTemplates;
}

// Get varied hooks based on property type and status
function getPropertyHooks(propertyType: string, location: string, status: string): string[] {
  const isForSale = status === 'dijual';
  const isForRent = status === 'disewakan';

  let baseHooks: string[] = [];

  if (isForSale) {
    // Hooks for properties for sale - focus on investment and prestige
    baseHooks = [
      `💰 INVESTOR CERDAS! ${propertyType.toUpperCase()} di ${location} SIAP UNTUNG BESAR!`,
      `🏆 PRESTIGE PROPERTY - ${propertyType} EKSKLUSIF di ${location} untuk ORANG SUKSES!`,
      `📈 NILAI NAIK TERUS! ${propertyType} PREMIUM di ${location} - INVESTASI EMAS!`,
      `💎 HANYA UNTUK ELITE! ${propertyType} LUXURY di ${location} BARU SAJA TERSEDIA!`,
      `🏦 BANKABLE ASSET! ${propertyType} STRATEGIS di ${location} - MODAL BERPUTAR!`,
      `🌟 STATUS SYMBOL! Miliki ${propertyType} di ${location} - BUKA PRESTISE ANDA!`,
      `🎯 OPPORTUNITY EMAS! ${propertyType} PREMIUM di ${location} untuk INVESTOR!`,
      `🏠 PROPERTY IMPRESSIVE! ${propertyType} di ${location} - ASET KELAS ATAS!`,
      `💼 BISNIS OPPORTUNITY! ${propertyType} STRATEGIS di ${location} MENUNGGU!`,
      `⚡ LIMITED EDITION! ${propertyType} EKSKLUSIF di ${location} - CEPAT HABIS!`
    ];
  } else if (isForRent) {
    // Hooks for properties for rent - focus on comfort and accessibility
    baseHooks = [
      `🏠 HUNIAN NYAMAN! ${propertyType} di ${location} untuk HIDUP LEBIH BAIK!`,
      `😊 TEMUKAN KENYAMANAN di ${propertyType} ${location} - HARGA TERJANGKAU!`,
      `🎯 LOKASI STRATEGIS! ${propertyType} di ${location} untuk HIDUP PRAKTIS!`,
      `🌟 FASILITAS LENGKAP! ${propertyType} PREMIUM di ${location} MENUNGGU ANDA!`,
      `🏡 RUMAH KEDUA ANDA! ${propertyType} NYAMAN di ${location} - MULAI SEKARANG!`,
      `💼 UNTUK PEKERJA MODERN! ${propertyType} di ${location} dengan FASILITAS TOP!`,
      `🎓 MAHASISWA & PEKERJA! ${propertyType} IDEAL di ${location} TERSEDIA!`,
      `🏘️ LIFESTYLE BARU! ${propertyType} MODERN di ${location} - UPGRADE HUNIAN!`,
      `🚀 START LIVING BETTER! ${propertyType} di ${location} dengan KENYAMANAN MAX!`,
      `💫 YOUR DREAM SPACE! ${propertyType} di ${location} - HARGA BERSAHABAT!`
    ];
  }

  // Add property-specific hooks based on status
  if (isForSale) {
    if (propertyType === 'kost') {
      baseHooks.push(
        `💰 BISNIS KOST MENJANJIKAN! Lokasi ${location} - PENDAPATAN PASIF TINGGI!`,
        `🏢 INVESTASI PROPERTY! Kost premium di ${location} - MODAL KEMBALI CEPAT!`,
        `📊 ROI MENJANJIKAN! Kost strategis di ${location} untuk PENGUSAHA CERDAS!`
      );
    } else if (propertyType === 'rumah') {
      baseHooks.push(
        `🏡 RUMAH IMPRESSIVE! Properti premium di ${location} untuk KELUARGA MAPAN!`,
        `💎 STATUS PROPERTY! Rumah eksklusif di ${location} - SIMBOL KESEJAHTERAAN!`,
        `🌟 HERITAGE PROPERTY! Rumah klasik di ${location} - INVESTASI BERHARGA!`
      );
    } else if (propertyType === 'apartemen') {
      baseHooks.push(
        `🏙️ HIGH-END APARTEMEN! Unit premium di ${location} untuk ELITE URBAN!`,
        `🌆 SKYSCRAPER LIVING! Apartemen luxury di ${location} - VIEW MENAKJUBKAN!`,
        `💼 EXECUTIVE RESIDENCE! Apartemen eksklusif di ${location} untuk EXECUTIVE!`
      );
    } else if (propertyType === 'tanah') {
      baseHooks.push(
        `🌱 LAHAN PREMIUM! Tanah strategis di ${location} - NILAI INVESTASI TINGGI!`,
        `🏗️ DEVELOPMENT LAND! Lahan potensial di ${location} untuk PENGEMBANG!`,
        `💰 CAPITAL GAIN! Tanah di ${location} - ASET YANG SELALU NAIK NILAINYA!`
      );
    }
  } else if (isForRent) {
    if (propertyType === 'kost') {
      baseHooks.push(
        `🎓 MAHASISWA ${location}! Kost modern dengan FASILITAS CAMPUS!`,
        `💼 YOUNG PROFESSIONAL! Kost premium di ${location} - LIFESTYLE URBAN!`,
        `🏠 AWAY FROM HOME! Kost nyaman di ${location} seperti RUMAH SENDIRI!`
      );
    } else if (propertyType === 'rumah') {
      baseHooks.push(
        `👨‍👩‍👧‍👦 KELUARGA MUDA! Rumah sewa di ${location} - TEMPAT IDEAL BESAR!`,
        `🏡 FAMILY HOME! Rumah nyaman di ${location} untuk HIDUP TENANG!`,
        `🌳 GARDEN HOUSE! Rumah dengan taman di ${location} - PERFECT UNTUK KELUARGA!`
      );
    } else if (propertyType === 'apartemen') {
      baseHooks.push(
        `🏙️ CITY LIVING! Apartemen sewa di ${location} - FASILITAS MODERN!`,
        `🚀 MODERN LIFESTYLE! Apartemen premium di ${location} dengan FACILITIES TOP!`,
        `💼 BUSINESS DISTRICT! Apartemen strategis di ${location} untuk PEKERJA KANTOR!`
      );
    } else if (propertyType === 'tanah') {
      baseHooks.push(
        `🏗️ TEMPORARY USE! Lahan sewa di ${location} untuk KEBUTUHAN PROYEK!`,
        `🌱 SHORT-TERM LAND! Area strategis di ${location} untuk PENGGUNAAN FLEKSIBEL!`,
        `📍 FLEXIBLE SPACE! Lahan di ${location} untuk KEBUTUHAN BISNIS!`
      );
    }
  }

  return baseHooks;
}

// Get varied closings based on property type and status
function getPropertyClosings(propertyType: string, kabupaten: string, status: string): string[] {
  const isForSale = status === 'dijual';
  const isForRent = status === 'disewakan';

  let baseClosings: string[] = [];

  if (isForSale) {
    // Closings for properties for sale - focus on investment and ownership
    baseClosings = [
      `${propertyType} di ${kabupaten} - INVESTASI yang SELALU menguntungkan! Segera miliki sebelum terlambat!`,
      `KEPUTUSAN CERDAS untuk MASA DEPAN! ${propertyType} premium ${kabupaten} menunggu investor bijak!`,
      `MILIKI ${propertyType} impian di ${kabupaten} - STATUS DAN KESEJAHTERAAN dalam satu paket!`,
      `${propertyType} strategis ${kabupaten} - ASET BERHARGA yang akan selalu diinginkan pasar!`,
      `BERGABUNG dengan pemilik ${propertyType} sukses! Properti premium ${kabupaten} siap menjadi milik Anda!`,
      `INVESTASI EMAS di ${kabupaten}! ${propertyType} eksklusif - HANYA untuk yang paham nilai!`,
      `MULAI babak baru KESEJAHTERAAN dengan ${propertyType} premium di ${kabupaten}!`,
      `JANGAN lewatkan OPPORTUNITY EMAS! ${propertyType} di ${kabupaten} - MILIK ANDA SEKARANG!`,
      `${propertyType} ${kabupaten} - PILIHAN INVESTOR CERDAS untuk generasi mendatang!`,
      `WAKTUNYA memiliki ${propertyType} impian! Properti premium ${kabupaten} menunggu pemiliknya!`
    ];
  } else if (isForRent) {
    // Closings for properties for rent - focus on comfort and availability
    baseClosings = [
      `${propertyType} di ${kabupaten} - KENYAMANAN yang TERJANGKAU! Segera hubungi untuk info lebih detail!`,
      `TEMUKAN RUMAH KEDUA ANDA di ${kabupaten}! ${propertyType} nyaman siap menyambut!`,
      `${propertyType} premium ${kabupaten} - MULAI hidup lebih BAIK dengan hunian ideal!`,
      `FASILITAS LENGKAP + LOKASI STRATEGIS! ${propertyType} di ${kabupaten} menunggu Anda!`,
      `UPGRADE hunian Anda SEKARANG! ${propertyType} modern di ${kabupaten} - HARGA BERSAHABAT!`,
      `${propertyType} strategis ${kabupaten} - SOLUSI hunian PRAKTIS untuk kehidupan modern!`,
      `BERGABUNG dengan penghuni ${propertyType} bahagia! Lokasi premium ${kabupaten} tersedia sekarang!`,
      `KEHIDUPAN LEBIH MUDAH dimulai dari ${propertyType} di ${kabupaten}! Hubungi kami segera!`,
      `${propertyType} ${kabupaten} - PILIHAN TERBAIK untuk hunian sementara yang berkualitas!`,
      `JANGAN ragu lagi! ${propertyType} nyaman di ${kabupaten} siap menjadi hunian Anda!`
    ];
  }

  return baseClosings;
}

// Get hook examples for reference based on status
function getHookExamples(propertyType: string, status: string): string[] {
  if (status === 'dijual') {
    return [
      `"Investasi emas ini menjanjikan pengembalian yang spektakuler..."`,
      `"Bayangkan memiliki properti yang nilai jualnya terus meningkat..."`,
      `"Di era dimana aset properti semakin langka, kesempatan ini datang..."`,
      `"Ini bukan sekedar rumah, ini adalah legacy untuk generasi mendatang..."`,
      `"Ketika properti menjadi simbol kesuksesan dan keamanan finansial..."`
    ];
  } else {
    return [
      `"Dari jendela kamar, pemandangan sunrise yang memukau menanti setiap pagi..."`,
      `"Bayangkan pulang ke rumah yang selalu menyambut dengan hangat..."`,
      `"Di tengah hiruk pikuk kota, ada oasis ketenangan yang menunggu..."`,
      `"Ini bukan sekedar hunian, ini adalah cerita hidup yang baru..."`,
      `"Ketika rumah menjadi lebih dari sekadar tempat tinggal..."`
    ];
  }
}

// Get closing examples for reference based on status
function getClosingExamples(propertyType: string, status: string): string[] {
  if (status === 'dijual') {
    return [
      `"Kode listing: [kode] - Kesempatan emas untuk memiliki properti impian!"`,
      `"Jangan lewatkan opportunity investasi ini. Hubungi kami sekarang juga!"`,
      `"Properti premium ini menunggu investornya yang tepat. Apakah itu Anda?"`,
      `"Investasi cerdas dimulai dari keputusan yang tepat. Pilih properti ini!"`,
      `"Wujudkan impian kepemilikan properti Anda bersama kami. Hubungi untuk informasi lebih detail!"`
    ];
  } else {
    return [
      `"Kode listing: [kode] - Kesempatan emas untuk hunian yang lebih baik!"`,
      `"Jangan lewatkan kesempatan hunian nyaman ini. Hubungi kami sekarang juga!"`,
      `"Properti ini menunggu penghuninya yang tepat. Apakah itu Anda?"`,
      `"Kenyamanan hidup dimulai dari keputusan yang tepat. Pilih properti ini!"`,
      `"Wujudkan impian hunian Anda bersama kami. Hubungi untuk informasi lebih detail!"`
    ];
  }
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

  // Generate varied paragraph content based on property type and status
  const status = data.status || 'dijual';
  const isForSale = status === 'dijual';
  const isForRent = status === 'disewakan';

  const paragraphGenerators = {
    kost: isForSale ? generateKostForSaleDescription : generateKostForRentDescription,
    rumah: isForSale ? generateRumahForSaleDescription : generateRumahForRentDescription,
    apartemen: isForSale ? generateApartemenForSaleDescription : generateApartemenForRentDescription,
    tanah: isForSale ? generateTanahForSaleDescription : generateTanahForRentDescription,
    ruko: isForSale ? generateRukoForSaleDescription : generateRukoForRentDescription,
    villa: isForSale ? generateVillaForSaleDescription : generateVillaForRentDescription,
    gudang: isForSale ? generateGudangForSaleDescription : generateGudangForRentDescription,
    hotel: isForSale ? generateHotelForSaleDescription : generateHotelForRentDescription
  };

  const generateDescription = paragraphGenerators[propertyType as keyof typeof paragraphGenerators] || (isForSale ? generateRumahForSaleDescription : generateRumahForRentDescription);

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

// Individual description generators for each property type with status differentiation
function generateKostForSaleDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} premium ini menawarkan peluang investasi properti yang sangat menjanjikan dengan lokasi strategis dan fasilitas lengkap. Dengan ${data.kamar_tidur || 'beberapa'} kamar tidur yang nyaman dan ${data.kamar_mandi || 'kamar mandi'} modern, properti ini siap memberikan penghasilan pasif yang stabil.`,
      `Terletak di ${location}, area dengan demand hunian tinggi dari kalangan mahasiswa dan pekerja muda. Dekat dengan universitas terkemuka dan pusat bisnis, memastikan occupancy rate yang tinggi sepanjang tahun.`,
      `Fasilitas premium termasuk WiFi unlimited, area laundry bersama, dapur modern, dan sistem keamanan 24 jam. ROI menjanjikan dengan pengembalian investasi yang cepat dan nilai properti yang terus meningkat.`,
      `Harga ${price} - investasi properti yang pasti memberikan keuntungan jangka panjang!`
    ],
    [
      `${hook}\n\n${displayType} bisnis ini adalah aset income-generating yang sangat potensial. Dirancang untuk memaksimalkan hunian dengan layout yang efisien dan fasilitas yang menarik bagi target market mahasiswa dan profesional muda.`,
      `Lokasi premium di ${data.kabupaten || 'pusat kota'} dengan akses mudah ke kampus, mall, dan transportasi umum. Area yang terus berkembang dengan pertumbuhan ekonomi yang positif.`,
      `Fasilitas modern seperti co-working space, gym mini, dan community area. Sistem manajemen properti yang mudah dengan potensi pengembalian investasi hingga 15-20% per tahun.`,
      `Mulai dari ${price} - properti bisnis yang menjanjikan profitabilitas tinggi!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateKostForRentDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} modern ini dirancang khusus untuk mahasiswa dan pekerja muda yang menginginkan hunian praktis namun berkualitas. Dengan ${data.kamar_tidur || 'beberapa'} kamar tidur yang nyaman dan ${data.kamar_mandi || 'kamar mandi'} bersih, tempat ini menawarkan keseimbangan sempurna antara kenyamanan dan aksesibilitas.`,
      `Lokasi sangat strategis di ${data.kabupaten || 'pusat kota'} yang dekat dengan kampus-kampus ternama dan pusat perbelanjaan. Akses transportasi umum sangat mudah, sehingga memudahkan aktivitas sehari-hari Anda.`,
      `Fasilitas lengkap termasuk WiFi unlimited, area laundry bersama, dapur bersama yang bersih, dan sistem keamanan 24 jam. Cocok untuk mahasiswa yang ingin fokus pada studi atau pekerja profesional yang membutuhkan hunian sementara yang terjangkau.`,
      `Harga mulai dari ${price} per bulan - hunian nyaman dengan harga terjangkau!`
    ],
    [
      `${hook}\n\n${displayType} ini bukan sekedar tempat tinggal, tapi gaya hidup modern yang affordable. Setiap unit dirancang dengan konsep minimalis namun fungsional, dilengkapi dengan ${data.kamar_tidur || 'kamar tidur'} yang luas dan ${data.kamar_mandi || 'kamar mandi'} modern.`,
      `Terletak di ${location}, lokasi premium yang mudah diakses dari berbagai penjuru kota. Dekat dengan mall, restoran, dan fasilitas umum lainnya, membuat hidup Anda lebih praktis dan menyenangkan.`,
      `Fasilitas premium seperti gym mini, co-working space, dan community area membuat hunian ini lebih dari sekedar kost biasa. Sistem keamanan canggih dan CCTV memastikan kenyamanan dan keamanan penghuni.`,
      `Dengan harga terjangkau ${price} per bulan, dapatkan pengalaman hunian premium yang tak tertandingi!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateRumahForSaleDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} premium ini adalah investasi properti jangka panjang yang sangat menguntungkan. Dengan ${data.kamar_tidur || 'beberapa'} kamar tidur yang luas dan ${data.kamar_mandi || 'kamar mandi'} modern, properti ini menawarkan nilai investasi yang terus meningkat seiring waktu.`,
      `Terletak di ${location}, lokasi strategis dengan pertumbuhan ekonomi yang positif. Dekat dengan sekolah internasional, rumah sakit premium, dan pusat perbelanjaan mewah.`,
      `Fasilitas lengkap termasuk taman tropis yang indah, area parkir luas, dan lingkungan eksklusif dengan keamanan 24 jam. Cocok untuk keluarga mapan yang menginginkan properti dengan nilai apresiasi tinggi.`,
      `Harga ${price} - keputusan investasi cerdas untuk generasi mendatang!`
    ],
    [
      `${hook}\n\n${displayType} eksklusif ini menawarkan peluang investasi properti yang luar biasa. Desain arsitektur modern dengan luas bangunan ${data.luas_bangunan || 'optimal'}m² memberikan ruang yang cukup untuk berbagai kebutuhan keluarga modern.`,
      `Lokasi premium di ${data.kabupaten || 'area elite'} yang terus berkembang menjadi pusat bisnis baru. Infrastruktur yang lengkap dengan akses tol dan transportasi umum yang mudah.`,
      `Interior mewah dengan finishing berkualitas tinggi, sistem smart home terintegrasi, dan taman yang dirancang secara profesional. Properti ini adalah simbol status dan investasi yang aman.`,
      `Mulai dari ${price} - properti eksklusif untuk orang sukses!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateRumahForRentDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} ini dirancang untuk menciptakan suasana keluarga yang hangat dan nyaman. Dengan ${data.kamar_tidur || 'beberapa'} kamar tidur yang luas dan ${data.kamar_mandi || 'kamar mandi'} modern, setiap anggota keluarga akan memiliki privasi yang cukup.`,
      `Berada di ${location}, lokasi strategis namun tetap tenang dan asri. Akses tol dan transportasi umum sangat mudah, sehingga memudahkan mobilitas keluarga.`,
      `Fasilitas rumah tangga lengkap termasuk taman yang hijau, area parkir luas, dan lingkungan yang aman untuk anak-anak bermain. Cocok untuk keluarga yang menginginkan hunian sementara yang berkualitas.`,
      `Harga sewa ${price} per bulan - hunian keluarga yang nyaman dan terjangkau!`
    ],
    [
      `${hook}\n\n${displayType} modern dengan desain arsitektur kontemporer yang memukau. Luas bangunan ${data.luas_bangunan || 'optimal'}m² memberikan ruang yang cukup untuk berbagai aktivitas keluarga.`,
      `Lokasi premium di ${data.kabupaten || 'area berkembang'} yang mudah diakses dari pusat kota. Dekat dengan sekolah, rumah sakit, dan pusat perbelanjaan modern.`,
      `Interior yang elegan dengan finishing berkualitas tinggi, taman tropis yang indah, dan fasilitas yang lengkap membuat hunian ini benar-benar istimewa.`,
      `Mulai dari ${price} per bulan - rumah modern untuk keluarga modern!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateApartemenForSaleDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} premium ini adalah investasi properti tinggi yang menjanjikan pengembalian luar biasa. Unit dengan ${data.kamar_tidur || 'kamar tidur'} yang ergonomic dan ${data.kamar_mandi || 'kamar mandi'} premium, dirancang untuk lifestyle eksekutif modern.`,
      `Lokasi strategis di ${location}, pusat bisnis dan hiburan kota. Akses mudah ke bandara, stasiun kereta, dan jalan tol membuat properti ini sangat likuid dan diminati investor.`,
      `Fasilitas bintang lima seperti infinity pool, fitness center, spa, dan sky lounge. Sistem keamanan 24 jam dan concierge service menjadikan properti ini aset prestisius.`,
      `Harga ${price} - investasi properti elite dengan potensi capital gain tinggi!`
    ],
    [
      `${hook}\n\n${displayType} cerdas dengan teknologi terdepan untuk kemudahan hidup modern. Setiap unit dilengkapi smart home system yang dapat dikontrol via aplikasi, menjadikannya properti masa depan.`,
      `Terletak di ${data.kabupaten || 'pusat kota'}, lokasi premium dengan city view menakjubkan. Dekat dengan pusat bisnis, mall, dan restoran ternama - area dengan demand tinggi.`,
      `Fasilitas lengkap termasuk roof garden, business center, kids playground, dan multipurpose room. Komunitas eksklusif dengan nilai investasi yang terus meningkat.`,
      `Investasi ${price} - properti smart living untuk generasi modern!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateApartemenForRentDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} ini menawarkan lifestyle urban modern yang praktis dan mewah. Unit dengan ${data.kamar_tidur || 'kamar tidur'} yang ergonomic dan ${data.kamar_mandi || 'kamar mandi'} premium, dirancang untuk kenyamanan maksimal.`,
      `Lokasi strategis di ${location}, pusat bisnis dan hiburan kota. Akses mudah ke bandara, stasiun kereta, dan jalan tol membuat mobilitas Anda tak terbatas.`,
      `Fasilitas bintang lima seperti infinity pool, fitness center, spa, dan sky lounge. Sistem keamanan 24 jam dan concierge service memastikan kenyamanan penghuni.`,
      `Harga sewa mulai ${price} per bulan - lifestyle premium yang terjangkau!`
    ],
    [
      `${hook}\n\n${displayType} cerdas dengan teknologi terdepan untuk kemudahan hidup modern. Setiap unit dilengkapi smart home system yang dapat dikontrol via aplikasi.`,
      `Terletak di ${data.kabupaten || 'pusat kota'}, lokasi premium dengan city view menakjubkan. Dekat dengan pusat bisnis, mall, dan restoran ternama.`,
      `Fasilitas lengkap termasuk roof garden, business center, kids playground, dan multipurpose room. Komunitas yang eksklusif dengan event rutin.`,
      `Sewa ${price} per bulan - pengalaman hunian modern yang tak tertandingi!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateTanahForSaleDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} kavling ini menawarkan peluang investasi emas dengan potensi pengembangan yang sangat tinggi. Luas ${data.luas_tanah || 'strategis'}m² siap untuk berbagai macam pengembangan properti komersial dan residential.`,
      `Lokasi sangat strategis di ${location}, area yang terus berkembang dengan infrastruktur yang semakin lengkap. Akses tol, jalan utama, dan transportasi umum sangat mudah.`,
      `Dekat dengan pusat pertumbuhan ekonomi, sekolah, rumah sakit, dan pusat perbelanjaan. Nilai investasi yang terus meningkat seiring perkembangan daerah - capital gain yang menjanjikan.`,
      `Harga tanah ${price} - investasi properti dengan potensi keuntungan maksimal!`
    ],
    [
      `${hook}\n\n${displayType} premium dengan sertifikat hak milik yang jelas dan siap bangun. Kontur tanah yang baik membuat pengembangan menjadi lebih mudah dan efisien untuk berbagai proyek.`,
      `Terletak di ${data.kabupaten || 'area potensial'}, lokasi yang diproyeksikan menjadi pusat pertumbuhan baru. Infrastruktur yang terus dibangun pemerintah menjadikan nilai properti ini terus naik.`,
      `Cocok untuk pengembangan perumahan premium, apartemen, ruko, atau investasi jangka panjang. Potensi keuntungan yang sangat menjanjikan dengan ROI tinggi.`,
      `Mulai dari ${price} - lahan strategis untuk pengembang properti sukses!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateTanahForRentDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} kavling ini tersedia untuk sewa dengan luas ${data.luas_tanah || 'strategis'}m² yang cocok untuk berbagai kebutuhan proyek sementara.`,
      `Lokasi strategis di ${location}, area yang mudah diakses dengan infrastruktur yang lengkap. Akses tol, jalan utama, dan transportasi umum sangat mudah.`,
      `Dekat dengan pusat kegiatan ekonomi dan bisnis. Cocok untuk penyimpanan sementara, event, atau proyek konstruksi jangka pendek.`,
      `Harga sewa ${price} per bulan - lahan fleksibel untuk kebutuhan bisnis Anda!`
    ],
    [
      `${hook}\n\n${displayType} premium dengan akses mudah dan kontur tanah yang baik. Luas area ${data.luas_tanah || 'optimal'}m² memberikan fleksibilitas untuk berbagai penggunaan sementara.`,
      `Terletak di ${data.kabupaten || 'area strategis'}, lokasi yang mudah dijangkau dari pusat kota. Infrastruktur yang memadai untuk berbagai kebutuhan operasional.`,
      `Cocok untuk penyimpanan material, area kerja proyek, atau kegiatan bisnis temporer. Sewa fleksibel dengan akses 24 jam.`,
      `Mulai dari ${price} per bulan - solusi lahan sementara yang praktis!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateRukoForSaleDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} strategis ini menawarkan lokasi bisnis yang sangat menguntungkan dengan potensi pendapatan tinggi. Desain modern dengan luas bangunan ${data.luas_bangunan || 'optimal'}m² yang efisien untuk berbagai jenis usaha retail dan jasa.`,
      `Terletak di ${location}, area dengan traffic tinggi dan potensi customer yang besar. Dekat dengan pemukiman padat, perkantoran, dan pusat perbelanjaan - lokasi bisnis yang sangat prospektif.`,
      `Fasilitas lengkap termasuk area parkir luas, loading dock, dan ruang atas yang dapat dimanfaatkan untuk kantor atau gudang. ROI menjanjikan dengan occupancy rate tinggi.`,
      `Harga ${price} - investasi bisnis properti yang pasti memberikan keuntungan!`
    ],
    [
      `${hook}\n\n${displayType} premium ini adalah properti komersial dengan nilai investasi tinggi. Lokasi strategis dengan visibilitas maksimal dan akses mudah dari jalan utama.`,
      `Terletak di ${data.kabupaten || 'pusat bisnis'}, area dengan pertumbuhan ekonomi yang positif. Dekat dengan bank, restoran, dan fasilitas umum lainnya.`,
      `Fasilitas modern termasuk AC, listrik backup, dan area display yang menarik. Cocok untuk berbagai jenis bisnis dengan potensi keuntungan yang tinggi.`,
      `Mulai dari ${price} - properti komersial dengan nilai investasi terbukti!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateRukoForRentDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} strategis ini tersedia untuk disewa dengan lokasi bisnis yang sangat menguntungkan. Desain modern dengan luas bangunan ${data.luas_bangunan || 'optimal'}m² yang efisien untuk berbagai jenis usaha.`,
      `Terletak di ${location}, area dengan traffic tinggi dan potensi customer yang besar. Dekat dengan pemukiman, perkantoran, dan pusat perbelanjaan.`,
      `Fasilitas lengkap termasuk area parkir luas, loading dock, dan ruang atas yang dapat dimanfaatkan untuk kantor atau gudang. Cocok untuk retail, jasa, atau food business.`,
      `Harga sewa ${price} per bulan - lokasi bisnis strategis siap pakai!`
    ],
    [
      `${hook}\n\n${displayType} premium ini tersedia untuk disewa dengan lokasi strategis dan fasilitas lengkap. Area komersial yang siap digunakan untuk berbagai jenis bisnis.`,
      `Terletak di ${data.kabupaten || 'pusat bisnis'}, area dengan pertumbuhan ekonomi yang positif. Dekat dengan bank, restoran, dan fasilitas umum lainnya.`,
      `Fasilitas modern termasuk AC, listrik backup, dan area display yang menarik. Sewa fleksibel dengan akses 24 jam untuk kebutuhan bisnis Anda.`,
      `Mulai dari ${price} per bulan - properti komersial siap pakai untuk bisnis Anda!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateVillaForSaleDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} mewah ini menawarkan pengalaman hidup tropis yang tak tertandingi dengan nilai investasi tinggi. Dengan ${data.kamar_tidur || 'beberapa'} kamar tidur mewah dan kolam renang pribadi, setiap hari terasa seperti berlibur di resort pribadi.`,
      `Lokasi eksklusif di ${location}, area premium dengan pemandangan alam yang indah. Lingkungan yang tenang namun mudah diakses dari pusat kota - properti yang sangat diminati kolektor.`,
      `Fasilitas luxury seperti home theater, gym pribadi, taman tropis, dan gazebo. Desain arsitektur yang menggabungkan unsur tradisional dan modern dengan nilai apresiasi tinggi.`,
      `Harga premium ${price} - investasi properti mewah dengan potensi capital gain luar biasa!`
    ],
    [
      `${hook}\n\n${displayType} eksklusif ini adalah properti prestisius dengan desain arsitektur yang memukau. Setiap detail dirancang untuk memberikan kenyamanan maksimal dan nilai investasi jangka panjang.`,
      `Terletak di ${data.kabupaten || 'area elite'}, lokasi premium dengan privasi tinggi dan aksesibilitas yang baik. Pemandangan alam yang menakjubkan sepanjang tahun.`,
      `Fasilitas lengkap termasuk infinity pool, home office, wine cellar, dan garden yang dirancang profesional. Properti ini adalah simbol status dan investasi yang aman.`,
      `Mulai dari ${price} - properti villa eksklusif untuk orang sukses!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateVillaForRentDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} mewah ini menawarkan pengalaman hidup tropis yang tak tertandingi. Dengan ${data.kamar_tidur || 'beberapa'} kamar tidur mewah dan kolam renang pribadi, setiap hari terasa seperti berlibur.`,
      `Lokasi eksklusif di ${location}, area premium dengan pemandangan alam yang indah. Lingkungan yang tenang namun mudah diakses dari pusat kota.`,
      `Fasilitas luxury seperti home theater, gym pribadi, taman tropis, dan gazebo. Desain arsitektur yang menggabungkan unsur tradisional dan modern.`,
      `Harga sewa ${price} per bulan - pengalaman hidup mewah yang terjangkau!`
    ],
    [
      `${hook}\n\n${displayType} eksklusif ini tersedia untuk disewa dengan fasilitas lengkap dan pemandangan menakjubkan. Hunian sementara yang terasa seperti rumah kedua.`,
      `Terletak di ${data.kabupaten || 'area premium'}, lokasi strategis dengan privasi tinggi. Dekat dengan pusat kuliner dan rekreasi namun tetap tenang.`,
      `Fasilitas lengkap termasuk infinity pool, home office, dan garden yang indah. Cocok untuk liburan keluarga atau working holiday yang berkesan.`,
      `Mulai dari ${price} per bulan - villa impian untuk liburan Anda!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateGudangForSaleDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} modern dengan luas ${data.luas_bangunan || 'optimal'}m² yang dirancang untuk efisiensi logistik maksimal. Tinggi plafon yang memadai untuk berbagai jenis penyimpanan dan distribusi.`,
      `Lokasi strategis di ${location}, mudah diakses dari jalan tol dan pelabuhan. Infrastruktur logistik yang lengkap memudahkan distribusi barang dalam skala besar.`,
      `Fasilitas lengkap termasuk loading dock, area parkir truk, dan sistem keamanan 24 jam. ROI menjanjikan untuk bisnis logistik dan distribusi.`,
      `Harga ${price} - investasi properti logistik dengan potensi keuntungan tinggi!`
    ],
    [
      `${hook}\n\n${displayType} premium ini adalah properti komersial strategis dengan nilai investasi jangka panjang. Desain modern dengan fasilitas logistik lengkap untuk berbagai jenis bisnis.`,
      `Terletak di ${data.kabupaten || 'pusat distribusi'}, lokasi yang menjadi hub logistik utama. Akses mudah ke jalan tol dan pelabuhan membuat properti ini sangat likuid.`,
      `Fasilitas canggih termasuk automated storage, loading dock elektrik, dan sistem keamanan terintegrasi. Cocok untuk e-commerce, manufaktur, atau distribusi nasional.`,
      `Mulai dari ${price} - properti logistik premium dengan nilai investasi terbukti!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateGudangForRentDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} modern dengan luas ${data.luas_bangunan || 'optimal'}m² yang dirancang untuk efisiensi logistik maksimal. Tinggi plafon yang memadai untuk berbagai jenis penyimpanan.`,
      `Lokasi strategis di ${location}, mudah diakses dari jalan tol dan pelabuhan. Infrastruktur logistik yang lengkap memudahkan distribusi barang.`,
      `Fasilitas lengkap termasuk loading dock, area parkir truk, dan sistem keamanan 24 jam. Cocok untuk bisnis retail, manufaktur, atau distribusi.`,
      `Harga sewa ${price} per bulan - gudang modern untuk operasional bisnis Anda!`
    ],
    [
      `${hook}\n\n${displayType} premium ini tersedia untuk disewa dengan fasilitas logistik lengkap. Area penyimpanan yang efisien untuk berbagai kebutuhan bisnis.`,
      `Terletak di ${data.kabupaten || 'pusat distribusi'}, lokasi strategis dengan akses mudah ke jalan tol. Infrastruktur yang memadai untuk operasional harian.`,
      `Fasilitas modern termasuk loading dock, area parkir truk, dan sistem keamanan 24 jam. Sewa fleksibel untuk kebutuhan bisnis jangka pendek atau panjang.`,
      `Mulai dari ${price} per bulan - solusi gudang praktis untuk bisnis Anda!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateHotelForSaleDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} premium ini menawarkan peluang investasi hospitality yang sangat menjanjikan dengan lokasi strategis dan fasilitas lengkap. Dengan luas bangunan ${data.luas_bangunan || 'optimal'}m² dan kapasitas yang dapat dikembangkan, properti ini siap memberikan pengembalian investasi tinggi dari sektor perhotelan.`,
      `Terletak di ${location}, area dengan demand wisatawan tinggi dan pertumbuhan ekonomi yang positif. Dekat dengan atraksi wisata, bandara, dan pusat bisnis - lokasi ideal untuk bisnis hotel.`,
      `Fasilitas hotel modern termasuk lobi elegan, restoran, spa, kolam renang, dan ruang pertemuan. Konsep hospitality yang dapat menghasilkan pendapatan dari room rental, F&B, dan event.`,
      `Harga ${price} - investasi hotel premium dengan potensi keuntungan tinggi!`
    ],
    [
      `${hook}\n\n${displayType} bisnis ini adalah properti hospitality dengan nilai investasi jangka panjang. Dirancang untuk memaksimalkan occupancy rate dengan layout yang efisien dan fasilitas yang menarik bagi wisatawan dan pebisnis.`,
      `Lokasi premium di ${data.kabupaten || 'pusat wisata'}, area dengan traffic wisatawan yang tinggi. Dekat dengan destinasi wisata terkenal dan pusat perbelanjaan modern.`,
      `Fasilitas lengkap termasuk restaurant, lounge, fitness center, dan business center. ROI menjanjikan dengan pendapatan dari berbagai sumber (akomodasi, kuliner, event).`,
      `Mulai dari ${price} - properti hotel strategis untuk investasi hospitality!`
    ]
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

function generateHotelForRentDescription(data: any, displayType: string, location: string, price: string, hook: string) {
  const variations = [
    [
      `${hook}\n\n${displayType} premium ini tersedia untuk disewa dengan fasilitas hospitality lengkap. Penginapan yang nyaman dan modern untuk wisatawan dan pebisnis dengan pelayanan bintang hotel.`,
      `Terletak di ${location}, lokasi strategis dengan akses mudah ke atraksi wisata dan pusat bisnis. Dekat dengan bandara, stasiun, dan pusat perbelanjaan.`,
      `Fasilitas lengkap termasuk restoran, spa, kolam renang, gym, dan ruang pertemuan. Pelayanan 24 jam dengan housekeeping, room service, dan concierge.`,
      `Harga sewa mulai ${price} per malam - pengalaman menginap bintang hotel!`
    ],
    [
      `${hook}\n\n${displayType} bisnis ini tersedia untuk disewa dengan konsep hospitality modern. Hunian sementara yang terasa seperti hotel bintang dengan fasilitas lengkap untuk kenyamanan maksimal.`,
      `Lokasi premium di ${data.kabupaten || 'pusat kota'}, area dengan aktivitas bisnis dan wisata yang tinggi. Mudah diakses dari berbagai penjuru kota.`,
      `Fasilitas hotel meliputi restaurant, lounge, business center, dan layanan housekeeping harian. Cocok untuk business travel, liburan keluarga, atau staycation.`,
      `Mulai dari ${price} per malam - hotel modern untuk pengalaman menginap premium!`
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

// Chatbot function using secure backend API
export async function generateChatResponse(messages: Array<{role: 'user' | 'assistant', content: string}>): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.response) {
      return data.response;
    }

    // Fallback response when API returns empty result
    return generateFallbackChatResponse(messages);

  } catch (error) {
    console.error('Chatbot API failed:', error);
    // Fallback response when API completely fails
    return generateFallbackChatResponse(messages);
  }
}

// Fallback chat response generator when AI API fails - now context-aware
function generateFallbackChatResponse(messages: Array<{role: 'user' | 'assistant', content: string}>): string {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
  const conversationHistory = messages.map(m => m.content.toLowerCase()).join(' ');

  // Extract context from conversation history
  const hasMentionedKost = conversationHistory.includes('kost') || conversationHistory.includes('boarding');
  const hasMentionedExclusive = conversationHistory.includes('exclusive') || conversationHistory.includes('premium') || conversationHistory.includes('luxury');
  const hasMentionedUGM = conversationHistory.includes('ugm') || conversationHistory.includes('universitas gadjah mada');
  const hasMentionedJual = lastUserMessage.includes('dijual') || lastUserMessage.includes('jual') || lastUserMessage.includes('beli');
  const hasMentionedSewa = lastUserMessage.includes('sewa') || lastUserMessage.includes('disewa');
  const askingForLink = lastUserMessage.includes('link') || lastUserMessage.includes('website') || lastUserMessage.includes('lihat');

  // Context-aware responses based on conversation flow
  if (askingForLink) {
    if (hasMentionedKost && hasMentionedExclusive && hasMentionedUGM) {
      return `Untuk melihat kost exclusive dekat UGM yang tersedia, Anda bisa:\n\n🌐 **Kunjungi halaman pencarian:** [www.salambumiproperty.com/kost-ugm](http://www.salambumiproperty.com/kost-ugm)\n\n📱 **Hubungi WhatsApp:** +62 813 9127 8889 untuk rekomendasi personal\n\nAgen kami akan kirimkan foto, virtual tour, dan informasi terbaru kost exclusive di area Condongcatur, Depok, dan sekitar UGM. Ada update harga dan ketersediaan terbaru nih!`;
    }
    return `Anda bisa melihat semua properti kami di website resmi:\n\n🌐 **Semua Properti:** [www.salambumiproperty.com/properti](http://www.salambumiproperty.com/properti)\n🏠 **Kost & Kos:** [www.salambumiproperty.com/kost](http://www.salambumiproperty.com/kost)\n🏡 **Rumah:** [www.salambumiproperty.com/rumah](http://www.salambumiproperty.com/rumah)\n🏢 **Apartemen:** [www.salambumiproperty.com/apartemen](http://www.salambumiproperty.com/apartemen)\n\nAtau chat WhatsApp +62 813 9127 8889 untuk bantuan personal!`;
  }

  if (hasMentionedKost && hasMentionedExclusive && hasMentionedUGM) {
    if (hasMentionedJual) {
      return `Ah, Anda mencari kost exclusive dekat UGM yang **DIJUAL** (bukan disewa)? Kami memang lebih fokus pada properti jual/sewa, tapi untuk kost exclusive area UGM yang dijual biasanya berupa bangunan kost dengan harga mulai Rp 500jt - Rp 2M+ tergantung ukuran dan lokasi.\n\nBeberapa opsi investasi kost di area UGM:\n🏢 **Bangunan Kost Condongcatur** - Rp 800jt-1.5M (12 kamar)\n🏢 **Kost Premium Depok** - Rp 600jt-1.2M (8 kamar)\n\nUntuk detail investasi dan ROI, hubungi WhatsApp +62 813 9127 8889. Kami bisa bantu analisis feasibility study!`;
    }

    if (hasMentionedSewa) {
      return `Kost exclusive dekat UGM untuk **DISEWA** tersedia dengan harga Rp 800rb - Rp 2jt per bulan. Berikut rekomendasi terbaru:\n\n🏠 **Kost Premium Condongcatur**\n• Rp 1.2jt/bulan (2 kamar, AC, WiFi unlimited)\n• 5 menit ke UGM, dekat mall Condongcatur\n• Laundry, dapur bersama, security 24 jam\n\n🏠 **Kost Exclusive Depok**\n• Rp 950rb/bulan (1 kamar, fully furnished)\n• Gym mini, balkon pribadi\n• Akses mudah ke kampus UGM\n\n🏠 **Kost Luxury Sleman**\n• Rp 1.8jt/bulan (private bathroom, balkon)\n• Kolam renang, area parkir luas\n• Lokasi strategis dekat UGM\n\nMau lihat foto dan virtual tour? Hubungi WhatsApp +62 813 9127 8889 untuk jadwal survey gratis!`;
    }

    // Default kost exclusive UGM response
    return `Kost exclusive dekat UGM tersedia dengan fasilitas premium dan lokasi strategis. Harga sewa Rp 800rb - Rp 2jt per bulan. Area terbaik: Condongcatur, Depok, dan Sleman.\n\nRekomendasi top:\n🏠 Kost Premium Condongcatur - Rp 1.2jt/bulan\n🏠 Kost Exclusive Depok - Rp 950rb/bulan\n🏠 Kost Luxury Sleman - Rp 1.8jt/bulan\n\nSemua dengan AC, WiFi unlimited, laundry, dan dekat UGM. Untuk foto dan detail, WhatsApp +62 813 9127 8889!`;
  }

  // Other context-aware responses
  if (lastUserMessage.includes('kost') || lastUserMessage.includes('boarding')) {
    if (lastUserMessage.includes('exclusive') || lastUserMessage.includes('premium')) {
      return `Kost exclusive/premium di Yogyakarta harga Rp 800rb - Rp 2jt per bulan. Area populer: Condongcatur (UGM), Prawirotaman, dan Malioboro.\n\nFasilitas: AC, WiFi unlimited, laundry, dapur modern, security 24 jam.\n\nRekomendasi: Kost di Condongcatur Rp 1.2jt/bulan, Depok Rp 950rb/bulan.\n\nMau lihat pilihan lengkap? WhatsApp +62 813 9127 8889!`;
    }
    return `Kost di Yogyakarta dari Rp 400rb - Rp 1.5jt/bulan. Area: Condongcatur, Depok, Malioboro, Prawirotaman.\n\nFasilitas bervariasi: AC, WiFi, laundry, dapur.\n\nCocok untuk mahasiswa dan pekerja. Mau rekomendasi spesifik? WhatsApp +62 813 9127 8889!`;
  }

  if (lastUserMessage.includes('rumah') || lastUserMessage.includes('house')) {
    return `Rumah di Yogyakarta dijual Rp 200jt-2M+, sewa Rp 3jt-15jt/bulan.\n\nArea premium: Prawirotaman, Tamanan, Mergangsan, Condongcatur.\n\nTersedia rumah minimalis, modern, mewah dengan 2-5 kamar tidur.\n\nMau lihat katalog rumah? WhatsApp +62 813 9127 8889!`;
  }

  if (lastUserMessage.includes('apartemen') || lastUserMessage.includes('apartment')) {
    return `Apartemen di Yogyakarta: Ambarukmo, Grand Galaxy, Living World.\n\nHarga jual Rp 300jt-3M+, sewa Rp 2jt-8jt/bulan.\n\nFasilitas: kolam renang, gym, security 24 jam, parking.\n\nCocok untuk lifestyle modern. Mau virtual tour? WhatsApp +62 813 9127 8889!`;
  }

  if (lastUserMessage.includes('rekomendasi') || lastUserMessage.includes('saran')) {
    return `Rekomendasi properti terbaik Yogyakarta saat ini:\n\n🏠 **Kost Premium Condongcatur** - Rp 900rb-1.5jt/bulan\n🏡 **Rumah Minimalis Prawirotaman** - Rp 350jt-600jt\n🏢 **Apartemen Grand Galaxy** - Rp 400jt-800jt\n\nSemua lokasi strategis dengan fasilitas lengkap. Mau detail lebih lanjut? WhatsApp +62 813 9127 8889!`;
  }

  // Generic response with context awareness
  return `Saya siap bantu cari properti di Yogyakarta! 🎯 Kami punya:\n\n🏠 Kost exclusive Rp 800rb-2jt/bulan\n🏡 Rumah modern Rp 200jt-2M+\n🏢 Apartemen premium Rp 300jt-3M+\n🏪 Ruko strategis untuk bisnis\n🌱 Tanah investasi potensial\n\nApa yang Anda cari? Misal: "kost dekat UGM", "rumah minimalis", "apartemen murah".\n\nAtau konsultasi langsung: WhatsApp +62 813 9127 8889!`;
}
