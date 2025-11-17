export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// --- ROUTING ---
		// Handle /p/[PROPERTY_ID] for shareable property cards
		if (url.pathname.startsWith('/p/')) {
			return handlePropertyShare(request, env, url);
		}

		// Handle SEO-friendly slug URLs (redirect to property detail page)
		if (url.pathname.length > 1 && !url.pathname.includes('/admin') && !url.pathname.includes('/api')) {
			const slugResult = await handleSlugRedirect(request, env, url);
			if (slugResult) return slugResult;
		}

		// Handle AI chat requests
		if (request.method === 'POST' && url.pathname === '/api/chat') {
			return handleChatRequest(request, env);
		}

		// Handle image upload (existing functionality)
		if (request.method === 'POST' && url.pathname === '/upload') {
			return handleImageUpload(request, env);
		}

		// Default: return 404 for unknown routes
		return new Response('Not Found', { status: 404 });
	},
};

// Handle property share cards (/p/[KODE_LISTING])
async function handlePropertyShare(request, env, url) {
	const kodeListing = url.pathname.split('/p/')[1];

	console.log('Property share request for kode_listing:', kodeListing);

	if (!kodeListing) {
		console.log('No kode_listing provided');
		return new Response('Kode listing required', { status: 400 });
	}

	try {
		// Fetch property data from Supabase
		const property = await fetchPropertyFromSupabase(kodeListing, env);

		if (!property) {
			console.log('Property not found for kode_listing:', kodeListing);
			return new Response('Property not found', { status: 404 });
		}

		console.log('Property found:', property.kode_listing, 'with images:', property.image_url, property.image_url1);

		// Build image array and get main image
		const images = [
			property.image_url,
			property.image_url1,
			property.image_url2,
			property.image_url3,
			property.image_url4,
		].filter(Boolean);

		const mainImageUrl = images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
		console.log('Main image URL for share:', mainImageUrl);
		console.log('All available images:', images);

		// Generate HTML with OG meta tags
		const html = generateShareCardHTML(property, kodeListing, mainImageUrl);

		return new Response(html, {
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
				'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
			},
		});
	} catch (error) {
		console.error('Property share error:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}

// Handle SEO-friendly slug URLs (serve OG meta tags for crawlers, redirect for users)
async function handleSlugRedirect(request, env, url) {
	const slug = url.pathname.substring(1); // Remove leading slash
	const userAgent = request.headers.get('User-Agent') || '';

	console.log('Slug request for:', slug, 'User-Agent:', userAgent);

	try {
		// Parse slug to extract kode_listing
		const kodeListing = parseSlugForKodeListing(slug);

		if (!kodeListing) {
			console.log('No kode_listing found in slug:', slug);
			return null; // Let it fall through to 404
		}

		// Fetch property data
		const property = await fetchPropertyFromSupabase(kodeListing, env);

		if (!property) {
			console.log('Property not found for kode_listing from slug:', kodeListing);
			return null;
		}

		console.log('Property found for slug:', property.kode_listing);

		// Check if this is a social media crawler or bot
		const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot/i.test(userAgent);

		if (isCrawler) {
			console.log('Serving OG meta tags for crawler');

			// Build image array and get main image
			const images = [
				property.image_url,
				property.image_url1,
				property.image_url2,
				property.image_url3,
				property.image_url4,
			].filter(Boolean);

			const mainImageUrl = images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
			console.log('Main image URL for crawler:', mainImageUrl);
			console.log('All available images:', images);

			// Generate HTML with OG meta tags for crawler
			const html = generateShareCardHTML(property, kodeListing, mainImageUrl);
			return new Response(html, {
				headers: {
					'Content-Type': 'text/html; charset=utf-8',
					'Cache-Control': 'public, max-age=3600',
				},
			});
		} else {
			// For regular users, redirect to SPA with slug as hash
			// This ensures the SPA loads and can handle client-side routing
			console.log('Redirecting user to SPA with slug as hash:', slug);
			const spaUrl = `https://salambumi.xyz/#${slug}`;
			return Response.redirect(spaUrl, 302);
		}

	} catch (error) {
		console.error('Slug redirect error:', error);
		return null;
	}
}

// Parse slug to extract kode_listing (simple implementation)
function parseSlugForKodeListing(slug) {
	const parts = slug.split('-');

	// Look for kode_listing pattern (e.g., K2.60, R1.25)
	for (let i = parts.length - 1; i >= 0; i--) {
		const part = parts[i].toUpperCase();
		if (/^[A-Z]\d+\.\d+$/.test(part)) {
			return part;
		}
	}

	return null;
}

// Generate SEO-friendly slug (optimized version)
function generatePropertySlug(property) {
	// Clean province name (remove "DI." prefix and standardize)
	const cleanProvince = (provinsi) => {
		return provinsi
			.replace(/^DI\./i, '') // Remove "DI." prefix
			.replace(/^DAERAH\s+ISTIMEWA\s+/i, '') // Remove "Daerah Istimewa" prefix
			.toLowerCase()
			.trim();
	};

	// Extract key words from title (first 3-4 meaningful words)
	const extractKeyWords = (title) => {
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

// Fetch property data from Supabase
async function fetchPropertyFromSupabase(kodeListing, env) {
	const supabaseUrl = env.SUPABASE_URL;
	const supabaseKey = env.SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new Error('Supabase configuration missing');
	}

	const response = await fetch(`${supabaseUrl}/rest/v1/properties?kode_listing=eq.${encodeURIComponent(kodeListing)}&select=*`, {
		headers: {
			'Authorization': `Bearer ${supabaseKey}`,
			'apikey': supabaseKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		return null;
	}

	const data = await response.json();
	return data[0] || null;
}

// Generate HTML template with OG meta tags
function generateShareCardHTML(property, propertyId, mainImageUrl) {

	// Format price
	const formatPrice = (price) => {
		if (!price) return 'Harga belum ditentukan';
		const num = parseFloat(price);
		if (num >= 1000000000) {
			return `Rp ${(num / 1000000000).toFixed(1)}M`;
		} else if (num >= 1000000) {
			return `Rp ${(num / 1000000).toFixed(1)}M`;
		}
		return `Rp ${num.toLocaleString('id-ID')}`;
	};

	// Generate title
	const title = property.judul_properti ||
		`${property.jenis_properti?.charAt(0).toUpperCase() + property.jenis_properti?.slice(1).replace(/_/g, ' ')} di ${property.kabupaten}`;

	// Generate description
	const description = property.deskripsi ?
		(property.deskripsi.length > 80 ? property.deskripsi.substring(0, 77) + '...' : property.deskripsi) :
		`Properti ${property.status || 'dijual'} di ${property.kabupaten}, ${property.provinsi}. ${formatPrice(property.harga_properti)}`;

	const baseUrl = 'https://salambumi.xyz';
	const shareUrl = `${baseUrl}/p/${propertyId}`;
	const detailUrl = `${baseUrl}/properti/${property.id}`;

	return `<!DOCTYPE html>
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
}

// Handle AI chat requests
async function handleChatRequest(request, env) {
	// CORS handling
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
		const { messages } = await request.json();

		if (!messages || !Array.isArray(messages)) {
			return new Response(JSON.stringify({ error: 'Messages array required' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		// Get API key from environment
		const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
		if (!geminiApiKey) {
			console.error('Gemini API key not configured');
			return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
				status: 503,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		// System prompt for property chatbot
		const systemPrompt = `You are a friendly and helpful property agent chatbot for SalamBumiProperty, a real estate company in Indonesia.

Your role:
- Help users find properties (kost, rumah, apartemen, tanah, ruko, villa, gudang)
- Answer questions about real estate, locations, pricing, and property features
- Provide information about property listings, market trends, and investment opportunities
- Guide users through the property search process
- Be conversational, professional, and enthusiastic
- Always respond in Indonesian (Bahasa Indonesia)
- If users ask about specific properties, mention that they can browse our website or contact our agents
- For pricing questions, give general ranges and suggest checking current listings
- Be knowledgeable about Indonesian property market, especially Yogyakarta and surrounding areas
- End conversations helpfully by offering more assistance or directing to contact information

Guidelines:
- Keep responses concise but informative (2-4 sentences typically)
- Use friendly, approachable language
- Include relevant property keywords naturally for SEO
- If unsure about specific details, suggest contacting human agents
- Always maintain a positive, helpful tone`;

		// Prepare messages for Gemini API
		const geminiMessages = [
			{
				role: 'user',
				parts: [{ text: systemPrompt }]
			},
			...messages.map(msg => ({
				role: msg.role === 'assistant' ? 'model' : 'user',
				parts: [{ text: msg.content }]
			}))
		];

		// Call Gemini API
		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					contents: geminiMessages,
					generationConfig: {
						temperature: 0.7,
						topK: 40,
						topP: 0.9,
						maxOutputTokens: 800,
					}
				}),
			}
		);

		if (!response.ok) {
			console.error('Gemini API error:', response.status, await response.text());
			return new Response(JSON.stringify({ error: 'AI service temporarily unavailable' }), {
				status: 503,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		const result = await response.json();
		const chatResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!chatResponse) {
			return new Response(JSON.stringify({ error: 'No response generated' }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		return new Response(JSON.stringify({ response: chatResponse.trim() }), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});

	} catch (error) {
		console.error('Chat API error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});
	}
}

// Handle image upload (existing functionality)
async function handleImageUpload(request, env) {
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
}