// AI Description Generator using Google Gemini API with model selection and fallback
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
}, selectedModel?: string): Promise<string> {
  try {
    const prompt = createSEODescriptionPrompt(propertyData);

    // Define model priority with fallback logic
    const modelPriority = selectedModel
      ? [selectedModel] // Use selected model first
      : [
          'gemini-1.5-flash',      // Primary: Free tier, good balance
          'gemini-2.0-flash-exp',  // Secondary: Experimental, fast
          'gemini-1.5-pro'         // Tertiary: Paid, high quality
        ];

    // Try each model in priority order
    for (const model of modelPriority) {
      try {
        const geminiResponse = await fetchGeminiDescription(prompt, propertyData, model);
        if (geminiResponse) {
          return geminiResponse;
        }
      } catch (error: any) {
        // Check if it's a quota/rate limit error
        const isQuotaError = error?.status === 429 ||
                           error?.status === 403 ||
                           (error?.message && (
                             error.message.includes('quota') ||
                             error.message.includes('rate limit') ||
                             error.message.includes('exceeded')
                           ));

        if (isQuotaError) {
          continue; // Try next model
        }

        // For other errors, still try next model as fallback
        continue;
      }
    }

    // Fallback to OpenAI API if all Gemini models fail
    try {
      const openAIResponse = await fetchOpenAIDescription(prompt, propertyData);
      if (openAIResponse) {
        return openAIResponse;
      }
    } catch (error) {
      // OpenAI failed
    }

    // Final fallback to rule-based description
    return generateFallbackDescription(propertyData);

  } catch (error) {
    // Fallback to rule-based description
    return generateFallbackDescription(propertyData);
  }
}

// Generate description using Google Gemini API with model selection
async function fetchGeminiDescription(prompt: string, propertyData: any, model: string = 'gemini-1.5-flash'): Promise<string | null> {
  const geminiApiKey = import.meta.env['VITE_GEMINI_API_KEY'] as string;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
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
    const openaiApiKey = import.meta.env['VITE_OPENAI_API_KEY'] as string;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const description = result.choices?.[0]?.message?.content;

    if (description && description.length > 50) {
      return formatAndOptimizeDescription(description, propertyData);
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

// Create dynamic SEO-optimized prompt for property description
function createSEODescriptionPrompt(data: any): string {
  const propertyType = data.jenis_properti || 'properti';
  const location = `${data.kabupaten || ''}, ${data.provinsi || ''}`.trim();
  const price = formatPriceForPrompt(data.harga_properti);
  const bedrooms = data.kamar_tidur ? `${data.kamar_tidur} kamar tidur` : '';
  const bathrooms = data.kamar_mandi ? `${data.kamar_mandi} kamar mandi` : '';
  const landArea = data.luas_tanah ? `${data.luas_tanah}m² tanah` : '';
  const buildingArea = data.luas_bangunan ? `${data.luas_bangunan}m² bangunan` : '';
  const status = data.status || 'dijual';

  // Get local keywords for this location and property type
  const localKeywords = getLocalKeywords(data.kabupaten || '', propertyType);

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

LOKASI SPESIFIK & KEYWORDS LOKAL:
- Kabupaten: ${data.kabupaten || 'N/A'}
- Keywords Lokal: ${localKeywords.slice(0, 8).join(', ')}
- Fokus Area: ${localKeywords.slice(0, 3).join(', ')}

KETENTUAN PEMBUATAN DESKRIPSI:
1. GAYA PENULISAN: ${selectedStyle}
2. TARGET MARKET: ${statusContext.targetMarket}
3. TONE & BAHASA: ${statusContext.tone}
4. HOOK PEMBUKA: ${selectedHook}
5. STRUKTUR NARATIF: ${selectedTemplate.structure}
6. UNSUR CLICK-BAIT: ${selectedTemplate.clickbait}
7. PANJANG IDEAL: ${selectedTemplate.length}
8. BAHASA: Indonesia modern, natural, persuasive, hindari bahasa formal kaku
9. SEO OPTIMIZATION: sertakan naturally keywords lokal seperti ${localKeywords.slice(0, 5).join(', ')}, ditambah keywords umum "${propertyType} ${data.kabupaten}", "${propertyType} ${status}", "${propertyType} premium", "${propertyType} strategis"
10. CLOSING: ${selectedClosing}

${statusContext.guidelines}

CONTOH VARIASI HOOK UNTUK ${status.toUpperCase()}:
${getHookExamples(propertyType, status).join('\n')}

CONTOH VARIASI CLOSING UNTUK ${status.toUpperCase()}:
${getClosingExamples(propertyType, status).join('\n')}

PENTING: BUAT DESKRIPSI YANG SAMA SEKALI BERBEDA DARI CONTOH DI ATAS. JANGAN MENYALIN STRUKTUR ATAU KALIMAT SAMA. GUNAKAN KREATIVITAS MAKSIMAL DAN SESUAIKAN DENGAN KONTEKS LOKAL ${data.kabupaten?.toUpperCase() || 'AREA'}!`;
}

// Get local keywords based on location
function getLocalKeywords(kabupaten: string, jenisProperti: string): string[] {
  const localMap: Record<string, string[]> = {
    'sleman': [
      'dekat ugm', 'kampus ugm', 'mahasiswa ugm', 'stasiun maguwo',
      'terminal giwangan', 'dekat malioboro', 'akses tol', 'universitas gadjah mada',
      'dekat bulaksumur', 'area kampus', 'stasiun tugu', 'dekat plaza ambarrukmo'
    ],
    'bantul': [
      'dekat bandara', 'kuliner bantul', 'pantai parangtritis', 'desa wisata',
      'dekat stasiun', 'akses tol', 'dekat bandara adi sucipto', 'wisata kuliner',
      'pantai baron', 'desa wisata candi', 'dekat malioboro', 'akses mudah ke kota'
    ],
    'yogyakarta kota': [
      'malioboro', 'kraton yogyakarta', 'tugu yogyakarta', 'pasar bringharjo',
      'dekat universitas', 'pusat kota', 'akses transportasi', 'dekat stasiun tugu',
      'area wisata', 'pusat kuliner', 'dekat monas', 'lokasi strategis kota'
    ]
  };

  const propertyTypeKeywords: Record<string, string[]> = {
    'kost': ['kost mahasiswa', 'kos kosan', 'hunian mahasiswa', 'kost modern', 'kost strategis'],
    'rumah': ['rumah minimalis', 'rumah modern', 'perumahan', 'rumah premium', 'rumah strategis'],
    'apartemen': ['apartemen furnished', 'apartemen modern', 'tower apartemen', 'apartemen premium', 'apartemen strategis'],
    'tanah': ['tanah kavling', 'lahan strategis', 'tanah premium', 'lahan investasi', 'tanah berkembang'],
    'ruko': ['ruko strategis', 'ruko bisnis', 'ruko premium', 'lokasi bisnis', 'ruko modern'],
    'villa': ['villa mewah', 'villa premium', 'villa strategis', 'villa modern', 'hunian mewah'],
    'gudang': ['gudang strategis', 'gudang premium', 'lokasi logistik', 'gudang modern', 'area industri']
  };

  const locationKeywords = localMap[kabupaten.toLowerCase()] || [];
  const typeKeywords = propertyTypeKeywords[jenisProperti.toLowerCase()] || [];

  return [...locationKeywords, ...typeKeywords];
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
    baseHooks = [
      `💰 INVESTOR CERDAS! ${propertyType.toUpperCase()} di ${location} SIAP UNTUNG BESAR!`,
      `🏆 PRESTIGE PROPERTY - ${propertyType} EKSKLUSIF di ${location} untuk ORANG SUKSES!`,
      `📈 NILAI NAIK TERUS! ${propertyType} PREMIUM di ${location} - INVESTASI EMAS!`
    ];
  } else if (isForRent) {
    baseHooks = [
      `🏠 HUNIAN NYAMAN! ${propertyType} di ${location} untuk HIDUP LEBIH BAIK!`,
      `😊 TEMUKAN KENYAMANAN di ${propertyType} ${location} - HARGA TERJANGKAU!`,
      `🎯 LOKASI STRATEGIS! ${propertyType} di ${location} untuk HIDUP PRAKTIS!`
    ];
  }

  return baseHooks;
}

// Get varied closings based on property type and status
function getPropertyClosings(propertyType: string, kabupaten: string, status: string): string[] {
  const isForSale = status === 'dijual';
  const isForRent = status === 'disewakan';

  let baseClosings: string[] = [];

  if (isForSale) {
    baseClosings = [
      `${propertyType} di ${kabupaten} - INVESTASI yang SELALU menguntungkan! Segera miliki sebelum terlambat!`,
      `KEPUTUSAN CERDAS untuk MASA DEPAN! ${propertyType} premium ${kabupaten} menunggu investor bijak!`,
      `MILIKI ${propertyType} impian di ${kabupaten} - STATUS DAN KESEJAHTERAAN dalam satu paket!`
    ];
  } else if (isForRent) {
    baseClosings = [
      `${propertyType} di ${kabupaten} - KENYAMANAN yang TERJANGKAU! Segera hubungi untuk info lebih detail!`,
      `TEMUKAN RUMAH KEDUA ANDA di ${kabupaten}! ${propertyType} nyaman siap menyambut!`,
      `${propertyType} premium ${kabupaten} - MULAI hidup lebih BAIK dengan hunian ideal!`
    ];
  }

  return baseClosings;
}

// Get hook examples for reference based on status
function getHookExamples(propertyType: string, status: string): string[] {
  if (status === 'dijual') {
    return [
      `"Investasi emas ini menjanjikan pengembalian yang spektakuler..."`,
      `"Bayangkan memiliki properti yang nilai jualnya terus meningkat..."`
    ];
  } else {
    return [
      `"Dari jendela kamar, pemandangan sunrise yang memukau menanti setiap pagi..."`,
      `"Bayangkan pulang ke rumah yang selalu menyambut dengan hangat..."`
    ];
  }
}

// Get closing examples for reference based on status
function getClosingExamples(propertyType: string, status: string): string[] {
  if (status === 'dijual') {
    return [
      `"Kode listing: [kode] - Kesempatan emas untuk memiliki properti impian!"`,
      `"Jangan lewatkan opportunity investasi ini. Hubungi kami sekarang juga!"`
    ];
  } else {
    return [
      `"Kode listing: [kode] - Kesempatan emas untuk hunian yang lebih baik!"`,
      `"Jangan lewatkan kesempatan hunian nyaman ini. Hubungi kami sekarang juga!"`
    ];
  }
}

// Format and optimize the generated description for better readability
function formatAndOptimizeDescription(description: string, data: any): string {
  // Clean up the text
  description = description
    .replace(/\n+/g, ' ') // Replace multiple newlines with space
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // Split into sentences
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Create dynamic paragraph structure
  const paragraphs = [];
  let currentParagraph = [];

  // Random paragraph length variation (2-4 sentences per paragraph)
  const maxSentencesPerParagraph = 2 + Math.floor(Math.random() * 3);

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (!sentence) continue;

    currentParagraph.push(sentence);

    // Create paragraph break based on random length
    if (currentParagraph.length >= maxSentencesPerParagraph) {
      paragraphs.push(currentParagraph.join('. ').trim() + '.');
      currentParagraph = [];
    }
  }

  // Add remaining sentences
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join('. ').trim() + '.');
  }

  // Join paragraphs
  let finalDescription = paragraphs.join('\n\n');

  // Add SEO keywords
  const propertyType = data.jenis_properti || 'properti';
  const location = data.kabupaten || '';

  const seoKeywords = [`${propertyType} ${location}`, `${propertyType} strategis`, `${propertyType} premium`];
  const missingKeywords = seoKeywords.filter(keyword =>
    !finalDescription.toLowerCase().includes(keyword.toLowerCase())
  );

  if (missingKeywords.length > 0 && finalDescription.length < 900) {
    const selectedClosing = `${propertyType} ${location} - ${missingKeywords.slice(0, 2).join(' dan ')}.`;
    finalDescription += `\n\n${selectedClosing}`;
  }

  // Add code listing
  if (data.kode_listing && !finalDescription.includes('Kode listing')) {
    finalDescription += `\n\nKode listing: ${data.kode_listing}`;
  }

  return finalDescription;
}

// Enhanced fallback description generator
function generateFallbackDescription(data: any): string {
  const propertyType = data.jenis_properti || 'properti';
  const location = `${data.kabupaten || ''}, ${data.provinsi || ''}`.trim();
  const price = formatPriceForPrompt(data.harga_properti);

  const propertyLabels: Record<string, string> = {
    kost: 'Kost',
    rumah: 'Rumah',
    apartemen: 'Apartemen',
    ruko: 'Ruko',
    villa: 'Villa',
    gudang: 'Gudang',
    tanah: 'Tanah'
  };

  const displayType = propertyLabels[propertyType as string] || propertyType.charAt(0).toUpperCase() + propertyType.slice(1);

  const hookVariations = {
    kost: [`🏠 MAHASISWA ${data.kabupaten?.toUpperCase() || 'AREA'}, WAKTUNYA UPGRADE HUNIAN!`],
    rumah: [`🏡 RUMAH IDAMAN di ${location} - MULAI CERITA BARU KELUARGA ANDA!`],
    apartemen: [`🏙️ APARTEMEN PREMIUM di ${location} - LIFESTYLE URBAN MODERN!`],
    tanah: [`🌱 LAHAN INVESTASI TERBAIK di ${location} - PELUANG EMAS!`],
    ruko: [`🏪 RUKO STRATEGIS di ${location} - BISNIS ANDA BERKEMBANG!`],
    villa: [`🏘️ VILLA MEWAH di ${location} - LIFESTYLE LUXURY!`],
    gudang: [`🏭 GUDANG STRATEGIS di ${location} - LOGISTIK ANDA MUDAH!`]
  };

  const availableHooks = hookVariations[propertyType as keyof typeof hookVariations] || hookVariations.rumah;
  const selectedHook = availableHooks[Math.floor(Math.random() * availableHooks.length)];

  const status = data.status || 'dijual';
  const isForSale = status === 'dijual';

  let descriptionParts = [
    `${selectedHook}`,
    `${displayType} premium ini menawarkan ${isForSale ? 'peluang investasi' : 'kenyamanan hunian'} yang sangat menjanjikan dengan lokasi strategis di ${location}.`,
    `Harga ${price} - ${isForSale ? 'investasi properti' : 'hunian'} yang pasti memberikan ${isForSale ? 'keuntungan' : 'kenyamanan'}!`
  ];

  let finalDescription = descriptionParts.join('\n\n');
  finalDescription += `\n\n${displayType} di ${data.kabupaten || location} - pilihan cerdas untuk masa depan!`;

  if (data.kode_listing) {
    finalDescription += `\n\nKode listing: ${data.kode_listing}`;
  }

  return finalDescription;
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