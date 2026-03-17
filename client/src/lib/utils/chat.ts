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
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.response) {
      return data.response;
    }

    // Fallback response when API returns empty result
    return generateFallbackChatResponse(messages);

  } catch (error) {
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