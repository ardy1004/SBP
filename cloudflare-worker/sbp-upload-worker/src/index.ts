export default {
  async fetch(request, env, ctx) {
    // --- CORS ---
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('image');
      const propertyId = formData.get('propertyId');

      if (!file || !propertyId) {
        return new Response(
          JSON.stringify({ error: 'Missing file or propertyId' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // --- DETEKSI EKSTENSI ASLI ---
      const fileName = file.name || 'upload';
      const extensionMatch = fileName.match(/\.(\w+)$/);
      const ext = extensionMatch ? extensionMatch[1].toLowerCase() : 'jpg';
      const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!allowed.includes(ext)) {
        return new Response(JSON.stringify({ error: 'Unsupported file type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // --- SIMPAN FILE ASLI KE R2 ---
      const timestamp = Date.now();
      const originalKey = `images/${timestamp}.${ext}`;
      await env.IMAGES_BUCKET.put(originalKey, file, {
        httpMetadata: { contentType: file.type || `image/${ext}` },
      });

      // --- KONVERSI KE WEBP DENGAN CLOUDFLARE IMAGE API ---
      const publicDomain = 'images.salambumi.xyz';
      const convertUrl = `https://${publicDomain}/cdn-cgi/image/format=webp/${timestamp}.${ext}`;

      // --- RETRY 3X UNTUK ANTISIPASI FILE BELUM PROPAGATE ---
      let webpResponse;
      for (let i = 0; i < 3; i++) {
        webpResponse = await fetch(convertUrl);
        if (webpResponse.ok) break;
        await new Promise((res) => setTimeout(res, 800)); // tunggu 0.8 detik
      }

      if (!webpResponse.ok) {
        throw new Error(`Conversion failed with status ${webpResponse.status}`);
      }

      const webpBuffer = await webpResponse.arrayBuffer();

      // --- SIMPAN FILE WEBP KE R2 ---
      const webpKey = `images/${timestamp}.webp`;
      await env.IMAGES_BUCKET.put(webpKey, webpBuffer, {
        httpMetadata: { contentType: 'image/webp' },
      });

      const webpUrl = `https://${publicDomain}/${webpKey}`;

      return new Response(JSON.stringify({ url: webpUrl }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
