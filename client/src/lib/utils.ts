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
  // Using Gemini 2.5 Flash (stable version)
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
          temperature: 0.7,
          topK: 40,
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
        temperature: 0.8, // Slightly higher for more creativity
        presence_penalty: 0.3, // Encourage diverse vocabulary
        frequency_penalty: 0.3, // Reduce repetition
        top_p: 0.9,
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

// Create SEO-optimized prompt for property description
function createSEODescriptionPrompt(data: any): string {
  const propertyType = data.jenis_properti || 'properti';
  const location = `${data.kabupaten || ''}, ${data.provinsi || ''}`.trim();
  const price = formatPriceForPrompt(data.harga_properti);
  const bedrooms = data.kamar_tidur ? `${data.kamar_tidur} kamar tidur` : '';
  const bathrooms = data.kamar_mandi ? `${data.kamar_mandi} kamar mandi` : '';
  const landArea = data.luas_tanah ? `${data.luas_tanah}m² tanah` : '';
  const buildingArea = data.luas_bangunan ? `${data.luas_bangunan}m² bangunan` : '';

  return `Buat deskripsi properti yang sangat menarik, SEO-friendly, dan click-bait untuk ${propertyType} di ${location}.

INFORMASI PROPERTI:
- Tipe: ${propertyType}
- Lokasi: ${location}
- Harga: ${price}
- Kamar: ${bedrooms} ${bathrooms}
- Luas: ${landArea} ${buildingArea}
- Kode Listing: ${data.kode_listing || ''}

KETENTUAN DESKRIPSI:
1. MULAI DENGAN HOOK MENARIK - gunakan kalimat yang membuat orang ingin baca terus
2. STRUKTUR PARAGRAF:
   - Paragraf 1: Hook + spesifikasi utama + harga
   - Paragraf 2: Fasilitas + keunggulan lokasi
   - Paragraf 3: Target penghuni + call-to-action
3. SEO KEYWORDS: sertakan naturally "${propertyType} ${data.kabupaten}", "${propertyType} murah", "sewa ${propertyType}", "${propertyType} strategis"
4. BAHASA: Indonesia natural, engaging, persuasive
5. PANJANG: 150-250 kata
6. CLICK BAIT: gunakan kata-kata seperti "impian", "premium", "strategis", "eksklusif", "terbaik"

CONTOH STRUKTUR:
"🏠 Temukan ${propertyType} impian Anda di ${location} dengan harga terjangkau!

${propertyType} premium ini menawarkan hunian modern dengan ${bedrooms} dan ${bathrooms}, luas ${buildingArea}. Lokasi sangat strategis dekat pusat kota dan akses tol mudah.

Cocok untuk keluarga muda atau pekerja profesional. Fasilitas lengkap dengan keamanan 24 jam. ${propertyType} di ${data.kabupaten} - investasi properti terbaik saat ini!

Kode: ${data.kode_listing}"

BUAT DESKRIPSI YANG MIRIP CONTOH TAPI LEBIH MENARIK DAN DETAIL: `;
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

  // Create better paragraph structure
  const paragraphs = [];
  let currentParagraph = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (!sentence) continue;

    currentParagraph.push(sentence);

    // Create paragraph break after 2-3 sentences, or if sentence contains key transition words
    const shouldBreak = (
      currentParagraph.length >= 2 ||
      sentence.toLowerCase().includes('lokasi') ||
      sentence.toLowerCase().includes('fasilitas') ||
      sentence.toLowerCase().includes('cocok') ||
      sentence.toLowerCase().includes('harga') ||
      (i > 0 && i % 3 === 0)
    );

    if (shouldBreak && currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join('. ').trim() + '.');
      currentParagraph = [];
    }
  }

  // Add remaining sentences
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join('. ').trim() + '.');
  }

  // Ensure we have at least 3 paragraphs for good structure
  if (paragraphs.length < 3 && sentences.length > 4) {
    // Re-split into better paragraphs
    const midPoint = Math.floor(sentences.length / 3);
    const newParagraphs = [
      sentences.slice(0, midPoint).join('. ').trim() + '.',
      sentences.slice(midPoint, midPoint * 2).join('. ').trim() + '.',
      sentences.slice(midPoint * 2).join('. ').trim() + '.'
    ].filter(p => p.length > 10);

    paragraphs.length = 0;
    paragraphs.push(...newParagraphs);
  }

  // Join paragraphs with double line breaks for better web readability
  let finalDescription = paragraphs.join('\n\n');

  // For web display, ensure proper line breaks are preserved
  // Convert single newlines to double newlines for better paragraph separation
  finalDescription = finalDescription.replace(/\n/g, '\n\n');

  // Ensure SEO keywords are included naturally
  const propertyType = data.jenis_properti || 'properti';
  const location = data.kabupaten || '';
  const seoKeywords = [
    `${propertyType} ${location}`,
    `${propertyType} strategis`,
    `${propertyType} premium`
  ];

  // Add SEO keywords if not present (in a natural way)
  const missingKeywords = seoKeywords.filter(keyword =>
    !finalDescription.toLowerCase().includes(keyword.toLowerCase())
  );

  if (missingKeywords.length > 0 && finalDescription.length < 900) {
    // Add as a natural concluding sentence
    const lastParagraph = paragraphs[paragraphs.length - 1];
    if (lastParagraph && !lastParagraph.includes('Kode listing')) {
      finalDescription = finalDescription.replace(
        lastParagraph,
        lastParagraph + `\n\n${propertyType} ${location} - ${missingKeywords.slice(0, 2).join(' dan ')}.`
      );
    }
  }

  // Add code listing at the end if not present
  if (data.kode_listing && !finalDescription.includes('Kode listing')) {
    finalDescription += `\n\nKode listing: ${data.kode_listing}`;
  }

  return finalDescription;
}

// Enhanced fallback description generator (rule-based with AI-like quality)
function generateFallbackDescription(data: any): string {
  const propertyType = data.jenis_properti || 'properti';
  const location = `${data.kabupaten || ''}, ${data.provinsi || ''}`.trim();
  const price = formatPriceForPrompt(data.harga_properti);

  // Enhanced property type labels
  const propertyLabels: Record<string, string> = {
    kost: 'Kost',
    rumah: 'Rumah',
    apartemen: 'Apartemen',
    ruko: 'Ruko',
    villa: 'Villa',
    gudang: 'Gudang'
  };

  const displayType = propertyLabels[propertyType as string] || (propertyType as string)?.charAt(0).toUpperCase() + (propertyType as string)?.slice(1);

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
