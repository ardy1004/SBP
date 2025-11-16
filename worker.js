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
			// For regular users, generate the correct slug URL and redirect if needed
			const correctSlug = generatePropertySlug(property);

			// If the slug doesn't match the correct one, redirect to the correct slug
			if (slug !== correctSlug) {
				console.log('Redirecting from', slug, 'to correct slug', correctSlug);
				return Response.redirect(`${url.origin}/${correctSlug}`, 301);
			}

			// If slug is correct, let the request pass through to the SPA
			return null;
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

// Generate SEO-friendly slug (simplified version for worker)
function generatePropertySlug(property) {
	// Clean province name
	const cleanProvince = (provinsi) => {
		return provinsi
			.replace(/^DI\./i, '')
			.replace(/^DAERAH\s+ISTIMEWA\s+/i, '')
			.toLowerCase()
			.trim();
	};

	const parts = [
		property.status || 'dijual',
		property.jenis_properti || 'properti',
		cleanProvince(property.provinsi || ''),
		property.kabupaten?.toLowerCase() || '',
		property.judul_properti || '',
		property.kode_listing || ''
	];

	const cleanedParts = parts.map((part, index) => {
		if (!part) return '';

		if (index === 4) { // judul_properti
			return part
				.trim()
				.replace(/\s+/g, '-')
				.replace(/[^a-zA-Z0-9\s\-.,()]/g, '')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '');
		} else if (index === 5) { // kode_listing
			return part.trim();
		} else {
			return part
				.toLowerCase()
				.trim()
				.replace(/[^a-z0-9\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '');
		}
	}).filter(part => part.length > 0);

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