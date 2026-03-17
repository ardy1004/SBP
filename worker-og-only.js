/**
 * Cloudflare Worker - OG Meta Tags Only (Minimal Version)
 * This is a lightweight version focused only on Open Graph meta tags for social sharing
 * Without heavy dependencies like googleapis
 */

export default {
	async fetch(request, env, ctx) {
		try {
			const url = new URL(request.url);
			const userAgent = request.headers.get('User-Agent') || '';

			// Check if this is a social media crawler
			// Enhanced detection for WhatsApp and other platforms
			const crawlerPatterns = [
				'facebookexternalhit', 'twitterbot', 'linkedinbot',
				'whatsapp', 'telegrambot', 'discordbot', 'slackbot',
				'googlebot', 'bingbot', 'yandex', 'applebot',
				'whatsapp-bot', 'whatsapp/', 'wa\.whatsapp',
				'facebook', 'instagram', 'fb_iab',
				'whatsappa', 'whatsappi', 'whatsappon\/',  // WhatsApp variations
				'preview', 'crawler', 'bot\/',  // Generic crawler indicators
			];
			const isCrawler = crawlerPatterns.some(pattern => 
				new RegExp(pattern, 'i').test(userAgent)
			);
			
			// Debug logging (only for testing, can be removed in production)
			console.log(`User-Agent: ${userAgent.substring(0, 100)}...`);
			console.log(`Is Crawler: ${isCrawler}`);

			// Only process property URLs for crawlers
			if (!isCrawler) {
				// For regular users, redirect to SPA
				const html = `<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Salam Bumi Property</title>
	<script>
		const path = window.location.pathname + window.location.search;
		window.location.href = 'https://salambumi.xyz#' + path.substring(1);
	</script>
</head>
<body>
	<p>Mengalihkan ke aplikasi...</p>
</body>
</html>`;
				return new Response(html, {
					headers: { 'Content-Type': 'text/html; charset=utf-8' }
				});
			}

			// Handle property share pages (/p/[KODE_LISTING])
			if (url.pathname.startsWith('/p/')) {
				return handlePropertyShare(request, env, url);
			}

			// Handle slug URLs for property pages
			if (url.pathname.length > 1 && !url.pathname.startsWith('/api/') && !url.pathname.startsWith('/admin/')) {
				const slugResult = await handleSlugRedirect(request, env, url);
				if (slugResult) return slugResult;
			}

			// Default: serve SPA
			const html = `<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Salam Bumi Property</title>
	<script>
		const path = window.location.pathname + window.location.search;
		window.location.href = 'https://salambumi.xyz#' + path.substring(1);
	</script>
</head>
<body>
	<p>Mengalihkan ke aplikasi...</p>
</body>
</html>`;
			return new Response(html, {
				headers: { 'Content-Type': 'text/html; charset=utf-8' }
			});

		} catch (error) {
			console.error('Worker error:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	}
};

// Property type specific placeholder images (social media optimized)
const propertyTypePlaceholders = {
	rumah: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=630&fit=crop',
	kost: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&h=630&fit=crop',
	apartemen: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=630&fit=crop',
	villa: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&h=630&fit=crop',
	ruko: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop',
	tanah: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=630&fit=crop',
	gudang: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&h=630&fit=crop',
	hotel: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&h=630&fit=crop',
};

// Get fallback image based on property type
function getFallbackImage(jenisProperti) {
	if (!jenisProperti) return propertyTypePlaceholders.rumah;
	const type = jenisProperti.toLowerCase().replace(/_/g, '');
	return propertyTypePlaceholders[type] || propertyTypePlaceholders.rumah;
}

// Validate and format image URL for social sharing
function formatImageUrl(imageUrl, jenisProperti) {
	// If no image URL provided, use fallback
	if (!imageUrl || imageUrl.trim() === '') {
		return getFallbackImage(jenisProperti);
	}
	
	let formattedUrl = imageUrl.trim();
	
	// Handle Cloudflare Images
	if (formattedUrl.includes('imagedelivery.net')) {
		// Remove any existing transform params and add consistent sizing
		formattedUrl = formattedUrl.replace(/\/[^/]+$/, '/w=1200,h=630,fit=crop,format=auto');
		// If URL ends with /public, replace with transform params
		if (formattedUrl.endsWith('/public')) {
			formattedUrl = formattedUrl.replace(/\/public$/, '/w=1200,h=630,fit=crop,format=auto');
		}
	}
	// Handle Unsplash images
	else if (formattedUrl.includes('unsplash.com')) {
		formattedUrl = formattedUrl.replace(/\?.*$/, '?w=1200&h=630&fit=crop&q=80');
	}
	// Handle Supabase storage images
	else if (formattedUrl.includes('supabase.co') || formattedUrl.includes('supabase.in')) {
		// Supabase images should already be accessible, but ensure they're not too large
		if (!formattedUrl.includes('?')) {
			formattedUrl += '?width=1200&height=630&resize=cover';
		}
	}
	
	return formattedUrl;
}

// Handle property share cards (/p/[KODE_LISTING])
async function handlePropertyShare(request, env, url) {
	const kodeListing = url.pathname.split('/p/')[1];

	if (!kodeListing) {
		return new Response('Kode listing required', { status: 400 });
	}

	try {
		const property = await fetchPropertyFromSupabase(kodeListing, env);

		if (!property) {
			return new Response('Property not found', { status: 404 });
		}

		const images = [
			property.image_url,
			property.image_url1,
			property.image_url2,
			property.image_url3,
			property.image_url4,
		].filter(img => img && img.trim() !== '');

		// Get the first valid image and format it
		const firstImage = images.length > 0 ? images[0] : null;
		const mainImageUrl = formatImageUrl(firstImage, property.jenis_properti);

		const html = generateShareCardHTML(property, kodeListing, mainImageUrl);

		return new Response(html, {
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
				'Cache-Control': 'public, max-age=3600',
			}
		});
	} catch (error) {
		console.error('Property share error:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}

// Handle SEO-friendly slug URLs
async function handleSlugRedirect(request, env, url) {
	const slug = url.pathname.substring(1);

	try {
		const kodeListing = parseSlugForKodeListing(slug);

		if (!kodeListing) {
			console.log(`No kode listing found in slug: ${slug}`);
			return null;
		}
		
		console.log(`Looking up property with kode listing: ${kodeListing}`);

		const property = await fetchPropertyFromSupabase(kodeListing, env);

		if (!property) {
			console.log(`Property not found for kode listing: ${kodeListing}`);
			return null;
		}
		
		console.log(`Property found: ${property.judul_properti || property.kode_listing}`);

		const images = [
			property.image_url,
			property.image_url1,
			property.image_url2,
			property.image_url3,
			property.image_url4,
		].filter(img => img && img.trim() !== '');
		
		console.log(`Found ${images.length} images for property`);

		// Get the first valid image and format it
		const firstImage = images.length > 0 ? images[0] : null;
		const mainImageUrl = formatImageUrl(firstImage, property.jenis_properti);
		
		console.log(`Using image URL: ${mainImageUrl}`);

		const html = generateShareCardHTML(property, kodeListing, mainImageUrl, slug);
		return new Response(html, {
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
				'Cache-Control': 'public, max-age=3600',
			}
		});

	} catch (error) {
		console.error('Slug redirect error:', error);
		return null;
	}
}

// Parse slug to extract kode_listing
function parseSlugForKodeListing(slug) {
	const parts = slug.split('-');

	// First, try to find SBP-XXXXXX-XXXX format (full kode listing with prefix)
	const slugLower = slug.toLowerCase();
	const sbpMatch = slugLower.match(/sbp-[a-z0-9]+-[a-z0-9]+$/i);
	if (sbpMatch) {
		return sbpMatch[0].toUpperCase();
	}

	// Then try other patterns (K2.60, R1.25, A123, etc)
	for (let i = parts.length - 1; i >= 0; i--) {
		const part = parts[i].toUpperCase();
		// Match patterns like K2.60, R1.25, A123, etc
		if (/^[A-Z]\d+(\.\d+)?$/.test(part) || /^\d+[A-Z]+\d*$/i.test(part)) {
			return part;
		}
	}

	return null;
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
		}
	});

	if (!response.ok) {
		return null;
	}

	const data = await response.json();
	return data[0] || null;
}

// Generate HTML template with OG meta tags
function generateShareCardHTML(property, propertyId, mainImageUrl, slug = null) {
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

	const title = property.judul_properti ||
		`${property.jenis_properti?.charAt(0).toUpperCase() + property.jenis_properti?.slice(1).replace(/_/g, ' ')} di ${property.kabupaten}`;

	const description = property.deskripsi ?
		(property.deskripsi.length > 160 ? property.deskripsi.substring(0, 157) + '...' : property.deskripsi) :
		`Properti ${property.status || 'dijual'} di ${property.kabupaten}, ${property.provinsi}. ${formatPrice(property.harga_properti)}`;

	const baseUrl = 'https://salambumi.xyz';
	const shareUrl = slug ? `${baseUrl}/${slug}` : `${baseUrl}/p/${propertyId}`;
	const detailUrl = `${baseUrl}/properti/${property.id}`;

	// Fixed HTML escaping function - properly escapes special characters
	const escapeHtml = (text) => {
		if (!text) return '';
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	};

	const escapedTitle = escapeHtml(title);
	const escapedDescription = escapeHtml(description);

	return `<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${escapedTitle} - Salam Bumi Property</title>
	<meta name="description" content="${escapedDescription}">

	<!-- Open Graph / WhatsApp / Facebook -->
	<meta property="og:type" content="website">
	<meta property="og:url" content="${shareUrl}">
	<meta property="og:title" content="${escapedTitle}">
	<meta property="og:description" content="${escapedDescription}">
	<meta property="og:image" content="${mainImageUrl}">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta property="og:image:type" content="image/jpeg">
	<meta property="og:image:alt" content="${escapedTitle}">
	<meta property="og:site_name" content="Salam Bumi Property">
	<meta property="og:locale" content="id_ID">
	
	<!-- WhatsApp specific -->
	<meta property="og:rich_attachment" content="true">

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:url" content="${shareUrl}">
	<meta name="twitter:title" content="${escapedTitle}">
	<meta name="twitter:description" content="${escapedDescription}">
	<meta name="twitter:image" content="${mainImageUrl}">
	<meta name="twitter:image:alt" content="${escapedTitle}">

	<!-- Performance optimizations -->
	<link rel="preconnect" href="https://imagedelivery.net">
	<link rel="dns-prefetch" href="https://imagedelivery.net">

	<!-- Auto redirect to actual property page -->
	<meta http-equiv="refresh" content="2; url=${detailUrl}">

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
		.price-tag {
			font-size: 20px;
			font-weight: bold;
			background: rgba(255, 255, 255, 0.2);
			padding: 10px 20px;
			border-radius: 8px;
			margin-bottom: 15px;
			display: inline-block;
		}
	</style>
</head>
<body>
	<div class="container">
		<img src="${mainImageUrl}" alt="${escapedTitle}" class="image" loading="eager">
		<h1 class="title">${escapedTitle}</h1>
		<div class="price-tag">${formatPrice(property.harga_properti)}</div>
		<p class="description">${escapedDescription}</p>
		<p>Mengalihkan ke halaman detail... <span class="loading"></span></p>
		<p style="font-size: 14px; opacity: 0.7; margin-top: 20px;">
			Jika tidak dialihkan otomatis, <a href="${detailUrl}" style="color: white; text-decoration: underline;">klik di sini</a>
		</p>
	</div>
</body>
</html>`;
}
