import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCORSHeaders, formatPrice, getSupabaseConfig } from './_lib/utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  const origin = req.headers.get('origin') || req.headers.get('Origin') || null;
  const corsHeaders = getCORSHeaders(origin);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  // Get kode_listing from path or query
  const url = new URL(req.url || '', `https://${req.headers.get('host') || 'localhost'}`);
  const pathParts = url.pathname.split('/p/');
  const kodeListing = pathParts[1] || req.query?.kode_listing;

  console.log('Property share request for kode_listing:', kodeListing);

  if (!kodeListing) {
    return res.status(400).json({ error: 'Kode listing required' });
  }

  try {
    // Fetch property data from Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/properties?kode_listing=eq.${encodeURIComponent(kodeListing)}&select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const data = await response.json();
    const property = data[0];

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    console.log('Property found:', property.kode_listing);

    // Build image array
    const images = [
      property.image_url,
      property.image_url1,
      property.image_url2,
      property.image_url3,
      property.image_url4,
    ].filter(Boolean);

    const mainImageUrl = images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';

    // Check if this is a crawler
    const userAgent = req.headers.get('user-agent') || '';
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot/i.test(userAgent);

    if (isCrawler) {
      // Return HTML with OG meta tags for crawlers
      const title = property.judul_properti ||
        `${property.jenis_properti?.charAt(0).toUpperCase() + property.jenis_properti?.slice(1).replace(/_/g, ' ')} di ${property.kabupaten}`;

      const description = property.deskripsi ?
        (property.deskripsi.length > 80 ? property.deskripsi.substring(0, 77) + '...' : property.deskripsi) :
        `Properti ${property.status || 'dijual'} di ${property.kabupaten}, ${property.provinsi}. ${formatPrice(property.harga_properti)}`;

      const shareUrl = `https://salambumi.xyz/p/${kodeListing}`;
      const detailUrl = `https://salambumi.xyz/properti/${property.id}`;

      const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Salam Bumi Property</title>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${mainImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Salam Bumi Property">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${shareUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${mainImageUrl}">

  <!-- Auto redirect after 1 second -->
  <meta http-equiv="refresh" content="1; url=${detailUrl}">

  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      max-width: 600px;
      padding: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .image {
      width: 100%;
      max-width: 400px;
      height: 250px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .description {
      font-size: 16px;
      margin-bottom: 20px;
      opacity: 0.9;
    }
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="${mainImageUrl}" alt="${title}" class="image">
    <h1 class="title">${title}</h1>
    <p class="description">${description}</p>
    <p>Mengalihkan ke halaman detail... <span class="loading"></span></p>
    <p style="font-size: 14px; opacity: 0.7; margin-top: 20px;">
      Jika tidak dialihkan otomatis, <a href="${detailUrl}" style="color: white; text-decoration: underline;">klik di sini</a>
    </p>
  </div>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(html);
    }

    // For regular users, redirect to SPA
    const detailUrl = `https://salambumi.xyz/properti/${property.id}`;
    return res.status(302).setHeader('Location', detailUrl).send('');

  } catch (error) {
    console.error('Property share error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
