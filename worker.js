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

		// --- VALIDASI FILE ---
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

		// --- SETUP ---
		const publicDomain = 'https://images.salambumi.xyz';
		const timestamp = Date.now();

		// --- SIMPAN FILE ASLI KE R2 ---
		const originalKey = `images/${propertyId}/${timestamp}-original.${ext}`;
		await env.IMAGES_BUCKET.put(originalKey, file, {
		  httpMetadata: { contentType: file.type || `image/${ext}` },
		});

		// --- RETURN URL ORIGINAL (Konversi WebP akan dilakukan di backend) ---
		const imageUrl = `${publicDomain}/${originalKey}`;

		return new Response(JSON.stringify({
		  success: true,
		  url: imageUrl,
		  originalUrl: imageUrl,
		  propertyId: propertyId
		}), {
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