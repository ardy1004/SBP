// Performance monitoring middleware
async function withPerformanceMonitoring(handler, operationName) {
	const startTime = Date.now()

	try {
		const result = await handler()
		const duration = Date.now() - startTime

		// Log successful operations
		console.log(`✅ ${operationName} completed in ${duration}ms`)

		// Alert on slow operations
		if (duration > 5000) { // 5 seconds
			console.warn(`⚠️ SLOW OPERATION: ${operationName} took ${duration}ms`)
		}

		return result
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`❌ ${operationName} failed after ${duration}ms:`, error.message)
		throw error
	}
}

export default {
	async fetch(request, env, ctx) {
		// Sentry error monitoring will be handled at the edge

		try {
			const url = new URL(request.url);

			// --- ROUTING ---
			// Handle /p/[PROPERTY_ID] for shareable property cards
			if (url.pathname.startsWith('/p/')) {
				return handlePropertyShare(request, env, url);
			}

			// Handle SEO-friendly slug URLs (serve SPA for users, OG meta for crawlers)
			if (url.pathname.length > 1 && !url.pathname.includes('/admin') && !url.pathname.includes('/api') && !url.pathname.includes('/p/')) {
				const slugResult = await handleSlugRedirect(request, env, url);
				if (slugResult) return slugResult;
			}

			// Handle AI chat requests
			if (request.method === 'POST' && url.pathname === '/api/chat') {
				return handleChatRequest(request, env);
			}

			// Handle AI description generation with performance monitoring
			if (request.method === 'POST' && url.pathname === '/api/generate-description') {
				return withPerformanceMonitoring(
					() => handleGenerateDescription(request, env),
					'AI_DESCRIPTION_GENERATION'
				)
			}

			// Handle analytics data fetching
			if (request.method === 'GET' && url.pathname === '/api/analytics') {
				return withPerformanceMonitoring(
					() => handleAnalyticsData(request, env),
					'ANALYTICS_DATA_FETCH'
				)
			}

			// Handle Search Console data fetching
			if (request.method === 'GET' && url.pathname === '/api/search-console') {
				return withPerformanceMonitoring(
					() => handleSearchConsoleData(request, env),
					'SEARCH_CONSOLE_DATA_FETCH'
				)
			}

			// Handle PageSpeed Insights
			if (request.method === 'GET' && url.pathname === '/api/pagespeed') {
				return withPerformanceMonitoring(
					() => handlePageSpeedInsights(request, env),
					'PAGESPEED_INSIGHTS_FETCH'
				)
			}

			// Handle image upload (existing functionality)
			if (request.method === 'POST' && url.pathname === '/upload') {
				return handleImageUpload(request, env);
			}

			// Health check endpoint for monitoring
			if (url.pathname === '/api/health') {
				const healthCheck = {
					status: 'healthy',
					timestamp: new Date().toISOString(),
					version: '1.0.0',
					environment: 'production',
					services: {
						ai_api: 'configured',
						database: 'configured',
						storage: 'configured'
					},
					metrics: {
						uptime: Date.now(),
						request_count: 0 // TODO: Add actual metrics
					}
				}

				return new Response(JSON.stringify(healthCheck, null, 2), {
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'no-cache'
					}
				})
			}

			// Handle static assets (favicon, robots.txt, etc.)
			if (url.pathname === '/favicon.ico') {
				console.log('🖼️ Handling favicon.ico request');
				// Redirect favicon.ico to favicon.png
				return new Response(null, {
					status: 302,
					headers: {
						'Location': '/favicon.png',
						'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
					},
				});
			}

			if (url.pathname === '/robots.txt') {
				const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://salambumi.xyz/sitemap.xml`;

				return new Response(robotsTxt, {
					headers: {
						'Content-Type': 'text/plain; charset=utf-8',
						'Cache-Control': 'public, max-age=86400',
					},
				});
			}

			// Default: serve SPA for client-side routing (fallback for unknown routes)
			return serveSPA(request, env);
		} catch (error) {
			// Log error for monitoring (temporary solution until Sentry backend is fixed)
			console.error('🚨 WORKER ERROR:', {
				timestamp: new Date().toISOString(),
				url: request.url,
				method: request.method,
				userAgent: request.headers.get('User-Agent'),
				error: error.message,
				stack: error.stack
			});

			// TODO: Replace with proper Sentry integration when package issues resolved
			// sentry.captureException(error);

			// Return user-friendly error response
			return new Response(JSON.stringify({
				error: 'Internal Server Error',
				message: 'Terjadi kesalahan pada server. Tim kami telah diberitahu dan sedang memperbaikinya.',
				timestamp: new Date().toISOString(),
				requestId: `req_${Date.now()}`
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
	},
};

// Serve SPA for client-side routing
async function serveSPA(request, env) {
	try {
		// For now, return a simple HTML that redirects to the SPA
		// In production, this should serve the built index.html
		const html = `<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Salam Bumi Property</title>
	<script>
		// Redirect to SPA with current path as hash
		const path = window.location.pathname + window.location.search;
		window.location.href = 'https://salambumi.xyz#' + path.substring(1);
	</script>
</head>
<body>
	<p>Mengalihkan ke aplikasi...</p>
</body>
</html>`;

		return new Response(html, {
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
			},
		});
	} catch (error) {
		console.error('SPA serve error:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}

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

	// Look for kode_listing pattern (e.g., K2.60, R1.25, H15, A1, etc.)
	for (let i = parts.length - 1; i >= 0; i--) {
		const part = parts[i].toUpperCase();
		// Support both formats: with dot (K2.60) and without dot (H15)
		if (/^[A-Z]\d+(\.\d+)?$/.test(part)) {
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

// Handle AI description generation
async function handleGenerateDescription(request, env) {
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
		const {
			title,
			type,
			status,
			price,
			land_area,
			building_area,
			bedrooms,
			bathrooms,
			legal,
			location,
			old_description,
			model = "gemini-2.0-flash-exp",
			requestId
		} = await request.json();

		console.log(`🔧 [${requestId}] BACKEND: Processing AI generation request`);

		// Validate required fields
		if (!type || !location || !location.province) {
			console.error(`❌ [${requestId}] Validation failed - type: ${!!type}, location: ${!!location}, province: ${location?.province}`);
			return new Response(JSON.stringify({
				error: 'Missing required fields: type and location.province',
				details: { type: !!type, location: !!location, province: location?.province }
			}), {
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


		let aiTitle = title;
		let aiDescription = old_description;

		// Use model from request or default to gemini-2.0-flash
		const apiModel = model || "gemini-2.0-flash";

		// Single combined prompt for efficiency - Focus on clickbait title and marketable SEO description
		const combinedPrompt = `Dari Judul dan Deskripsi tersebut, tolong kembangkan menjadi judul Klik Bait yang bagus dan deskripsi yang marketable, seo friendly, meningkatkan visibilitas di google dan berpotensi muncul di pencarian atas google, mengandung keyword yang relevan. Tanpa bullet, tanpa bold, tanpa italic, keluarkan plain text saja.

Judul: maximal 100 karakter, mengandung klik bait
Deskripsi: output deskripsi maximal 600 karakter, mengandung judul klik bait, foreshadow, body, keyword relevan dan call to action: Jadwalkan Survay Lokasi, Hubungi Kami Segera! (gunakan emoticon didalam format deskripsi untuk mempercantik tampilan)

Dalam penyusunan deskripsi:
-Beri spasi jelas antar paragraf.
-Bahasa harus mengalir, mudah dipahami, dan tidak bertele-tele.

Judul Input: ${title || ''}
Deskripsi Input: ${old_description || ''}

FORMAT OUTPUT (harus mengikuti format ini persis):
# Judul
{judul properti}

# Deskripsi
{deskripsi lengkap properti}`;

		try {
			// Single API call for both title and description with timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

			const response = await fetch(
				`https://generativelanguage.googleapis.com/v1/models/${apiModel}:generateContent?key=${geminiApiKey}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						contents: [{
							role: 'user',
							parts: [{ text: combinedPrompt }]
						}],
						generationConfig: {
							temperature: 0.7,
							maxOutputTokens: 1000,
						}
					}),
					signal: controller.signal
				}
			);

			clearTimeout(timeoutId);

			if (response.ok) {
				const result = await response.json();
				const generatedContent = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

				console.log("RAW_AI_RESPONSE:", generatedContent);

				if (generatedContent) {
					// Parse the combined response with # Judul / # Deskripsi format
					const titleMatch = generatedContent.match(/# Judul\s*\n(.+?)(?=\n# Deskripsi|\n*$)/is);
					const descMatch = generatedContent.match(/# Deskripsi\s*\n(.+?)(?=\n#|\n*$)/is);

					if (titleMatch && titleMatch[1] && titleMatch[1].trim().length > 0) {
						aiTitle = titleMatch[1].trim();
					} else {
						console.error(`❌ [${requestId}] Format AI tidak sesuai - # Judul tidak ditemukan`);
					}

					if (descMatch && descMatch[1] && descMatch[1].trim().length > 0) {
						aiDescription = descMatch[1].trim();
					} else {
						console.error(`❌ [${requestId}] Format AI tidak sesuai - # Deskripsi tidak ditemukan`);
					}
				}
			} else {
				const errorText = await response.text();
				console.error(`❌ [${requestId}] AI generation failed:`, response.status, errorText);

				// Log specific error types for debugging
				if (response.status === 404) {
					console.error(`❌ [${requestId}] Model not found:`, apiModel);
					return new Response(JSON.stringify({
						error: `Model "${apiModel}" tidak tersedia. Periksa daftar model yang valid.`,
						model: apiModel
					}), {
						status: 503,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					});
				} else if (response.status === 429) {
					console.error(`❌ [${requestId}] Quota exceeded for model:`, apiModel);
				}
			}
		} catch (error) {
			if (error.name === 'AbortError') {
				console.error(`⏰ [${requestId}] AI generation timeout`);
			} else {
				console.error(`❌ [${requestId}] AI generation error:`, error);
			}
			// Continue with fallback - don't throw
		}

		// Always provide safe fallback content
		const safeTitle = aiTitle && aiTitle !== title ? aiTitle : title;
		const safeDescription = aiDescription && aiDescription !== old_description ? aiDescription : old_description;

		// Check if AI actually generated new content
		const isGenerated = (aiTitle !== title && aiTitle !== "") ||
		                   (aiDescription !== old_description && aiDescription !== "");

		// Extract keywords from final description
		const keywords = extractKeywords(safeDescription, type, location.province, location.district);

		console.log(`📊 [${requestId}] AI Generation result:`, {
			isGenerated,
			titleChanged: aiTitle !== title,
			descriptionChanged: aiDescription !== old_description,
			keywordCount: keywords.length
		});

		return new Response(JSON.stringify({
			ai_title: safeTitle,
			ai_description: safeDescription,
			keywords: keywords,
			is_generated: isGenerated,
			message: isGenerated ? "AI berhasil generate konten baru" : "Konten berhasil dimuat dengan aman"
		}), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});

	} catch (error) {
		console.error('Generate description API error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});
	}
}

// Extract keywords from text
function extractKeywords(text, propertyType, province, district) {
	const keywords = new Set();

	// Add property type
	if (propertyType) keywords.add(propertyType.toLowerCase());

	// Add location keywords
	if (province) keywords.add(province.toLowerCase());
	if (district) keywords.add(district.toLowerCase());

	// Extract common real estate keywords from text
	const commonKeywords = [
		'rumah', 'apartemen', 'kost', 'villa', 'ruko', 'tanah', 'gudang',
		'dijual', 'disewakan', 'sewa', 'jual',
		'strategis', 'murah', 'bagus', 'baru', 'cantik', 'indah',
		'fasilitas', 'dekat', 'pusat', 'kota', 'lokasi'
	];

	// Only process text if it's a valid string
	if (text && typeof text === 'string') {
		const lowerText = text.toLowerCase();
		commonKeywords.forEach(keyword => {
			if (lowerText.includes(keyword)) {
				keywords.add(keyword);
			}
		});
	}

	return Array.from(keywords).slice(0, 10); // Limit to 10 keywords
}

// Handle analytics data fetching
async function handleAnalyticsData(request, env) {
	// CORS handling
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
		});
	}

	if (request.method !== 'GET') {
		return new Response('Method not allowed', { status: 405 });
	}

	try {
		// Get GA4 credentials from environment
		const gaCredentials = env.GA_SERVICE_ACCOUNT_KEY;
		const gaPropertyId = env.GA_PROPERTY_ID;

		if (!gaCredentials || !gaPropertyId) {
			console.error('GA4 credentials not configured');
			return new Response(JSON.stringify({
				error: 'Analytics service not configured',
				details: 'GA4 credentials missing'
			}), {
				status: 503,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		// Parse credentials
		let serviceAccountKey;
		try {
			serviceAccountKey = JSON.parse(gaCredentials);
		} catch (error) {
			console.error('Invalid GA4 credentials format');
			return new Response(JSON.stringify({
				error: 'Invalid analytics configuration'
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		// Import googleapis dynamically (for Cloudflare Workers)
		const { google } = await import('googleapis');

		// Authenticate with GA4
		const auth = new google.auth.GoogleAuth({
			credentials: serviceAccountKey,
			scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
		});

		const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

		// Get date range from query params (default 30 days)
		const url = new URL(request.url);
		const days = parseInt(url.searchParams.get('days') || '30');
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(endDate.getDate() - days);

		const startDateStr = startDate.toISOString().split('T')[0];
		const endDateStr = endDate.toISOString().split('T')[0];

		console.log(`📊 Fetching GA4 data for ${gaPropertyId}: ${startDateStr} to ${endDateStr}`);

		// Fetch multiple reports in parallel
		const [pageViewsReport, topPagesReport, trafficSourcesReport, realtimeReport] = await Promise.all([
			// Page views trend
			analyticsData.properties.runReport({
				property: `properties/${gaPropertyId}`,
				requestBody: {
					dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
					dimensions: [{ name: 'date' }],
					metrics: [{ name: 'screenPageViews' }],
					orderBys: [{ dimension: { dimensionName: 'date' } }]
				}
			}),

			// Top pages
			analyticsData.properties.runReport({
				property: `properties/${gaPropertyId}`,
				requestBody: {
					dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
					dimensions: [{ name: 'pagePath' }],
					metrics: [{ name: 'screenPageViews' }],
					orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
					limit: 10
				}
			}),

			// Traffic sources
			analyticsData.properties.runReport({
				property: `properties/${gaPropertyId}`,
				requestBody: {
					dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
					dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
					metrics: [{ name: 'sessions' }],
					orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
				}
			}),

			// Basic metrics (total users, sessions, etc.)
			analyticsData.properties.runReport({
				property: `properties/${gaPropertyId}`,
				requestBody: {
					dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
					metrics: [
						{ name: 'totalUsers' },
						{ name: 'sessions' },
						{ name: 'screenPageViews' },
						{ name: 'bounceRate' },
						{ name: 'averageSessionDuration' }
					]
				}
			})
		]);

		// Process page views data for chart
		const pageViewsData = pageViewsReport.data.rows?.map(row => ({
			date: row.dimensionValues[0].value,
			views: parseInt(row.metricValues[0].value)
		})) || [];

		// Process top pages data for chart
		const topPagesData = topPagesReport.data.rows?.map(row => ({
			page: row.dimensionValues[0].value,
			views: parseInt(row.metricValues[0].value)
		})) || [];

		// Process traffic sources data for chart
		const trafficSourcesData = trafficSourcesReport.data.rows?.map(row => ({
			name: row.dimensionValues[0].value,
			value: parseInt(row.metricValues[0].value)
		})) || [];

		// Get basic metrics
		const metrics = realtimeReport.data.rows?.[0]?.metricValues || [];
		const basicMetrics = {
			totalUsers: parseInt(metrics[0]?.value || '0'),
			sessions: parseInt(metrics[1]?.value || '0'),
			pageViews: parseInt(metrics[2]?.value || '0'),
			bounceRate: parseFloat(metrics[3]?.value || '0').toFixed(2),
			avgSessionDuration: parseFloat(metrics[4]?.value || '0').toFixed(2)
		};

		const analyticsResponse = {
			period: {
				startDate: startDateStr,
				endDate: endDateStr,
				days: days
			},
			metrics: basicMetrics,
			charts: {
				pageViews: pageViewsData,
				topPages: topPagesData,
				trafficSources: trafficSourcesData
			},
			lastUpdated: new Date().toISOString()
		};

		console.log(`✅ Analytics data fetched successfully for ${days} days`);

		return new Response(JSON.stringify(analyticsResponse), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Cache-Control': 'no-cache'
			},
		});

	} catch (error) {
		console.error('Analytics API error:', error);

		// Return fallback data for development/testing
		const fallbackResponse = {
			period: {
				startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
				endDate: new Date().toISOString().split('T')[0],
				days: 30
			},
			metrics: {
				totalUsers: 0,
				sessions: 0,
				pageViews: 0,
				bounceRate: '0.00',
				avgSessionDuration: '0.00'
			},
			charts: {
				pageViews: [],
				topPages: [],
				trafficSources: []
			},
			error: error.message,
			lastUpdated: new Date().toISOString()
		};

		return new Response(JSON.stringify(fallbackResponse), {
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

// Handle Search Console data fetching
async function handleSearchConsoleData(request, env) {
	try {
		// Get Search Console credentials from environment
		const serviceAccountKey = env.SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY;
		const siteUrl = env.SEARCH_CONSOLE_SITE_URL;

		if (!serviceAccountKey || !siteUrl) {
			console.error('Search Console credentials not configured');
			return new Response(JSON.stringify({
				error: 'Search Console not configured',
				details: 'Missing SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY or SEARCH_CONSOLE_SITE_URL'
			}), {
				status: 503,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		// Parse service account key
		let credentials;
		try {
			credentials = JSON.parse(serviceAccountKey);
		} catch (error) {
			console.error('Invalid Search Console service account key format');
			return new Response(JSON.stringify({
				error: 'Invalid Search Console configuration'
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		// Import googleapis dynamically
		const { google } = await import('googleapis');

		// Authenticate with Search Console
		const auth = new google.auth.GoogleAuth({
			credentials: credentials,
			scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
		});

		const searchconsole = google.searchconsole({ version: 'v1', auth });

		// Get date range from query params (default 30 days)
		const url = new URL(request.url);
		const days = parseInt(url.searchParams.get('days') || '30');
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(endDate.getDate() - days);

		const startDateStr = startDate.toISOString().split('T')[0];
		const endDateStr = endDate.toISOString().split('T')[0];

		console.log(`📊 Fetching Search Console data for ${siteUrl}: ${startDateStr} to ${endDateStr}`);

		// Fetch search analytics data
		const searchAnalyticsResponse = await searchconsole.searchanalytics.query({
			siteUrl: siteUrl,
			requestBody: {
				startDate: startDateStr,
				endDate: endDateStr,
				dimensions: ['query', 'page', 'device', 'country'],
				rowLimit: 1000,
				startRow: 0
			}
		});

		// Process the data
		const rows = searchAnalyticsResponse.data.rows || [];

		// Aggregate data by query
		const queryData = new Map();
		const pageData = new Map();
		const deviceData = new Map();
		const countryData = new Map();

		rows.forEach(row => {
			const query = row.keys[0] || 'Unknown';
			const page = row.keys[1] || 'Unknown';
			const device = row.keys[2] || 'Unknown';
			const country = row.keys[3] || 'Unknown';

			// Aggregate by query
			if (!queryData.has(query)) {
				queryData.set(query, { clicks: 0, impressions: 0, ctr: 0, position: 0 });
			}
			const queryStats = queryData.get(query);
			queryStats.clicks += row.clicks || 0;
			queryStats.impressions += row.impressions || 0;
			queryStats.ctr = queryStats.clicks / queryStats.impressions;
			queryStats.position = (queryStats.position + (row.position || 0)) / 2;

			// Aggregate by page
			if (!pageData.has(page)) {
				pageData.set(page, { clicks: 0, impressions: 0, ctr: 0, position: 0 });
			}
			const pageStats = pageData.get(page);
			pageStats.clicks += row.clicks || 0;
			pageStats.impressions += row.impressions || 0;
			pageStats.ctr = pageStats.clicks / pageStats.impressions;
			pageStats.position = (pageStats.position + (row.position || 0)) / 2;

			// Aggregate by device
			if (!deviceData.has(device)) {
				deviceData.set(device, { clicks: 0, impressions: 0 });
			}
			const deviceStats = deviceData.get(device);
			deviceStats.clicks += row.clicks || 0;
			deviceStats.impressions += row.impressions || 0;

			// Aggregate by country
			if (!countryData.has(country)) {
				countryData.set(country, { clicks: 0, impressions: 0 });
			}
			const countryStats = countryData.get(country);
			countryStats.clicks += row.clicks || 0;
			countryStats.impressions += row.impressions || 0;
		});

		// Convert to arrays and sort
		const topQueries = Array.from(queryData.entries())
			.map(([query, stats]) => ({ query, ...stats }))
			.sort((a, b) => b.impressions - a.impressions)
			.slice(0, 20);

		const topPages = Array.from(pageData.entries())
			.map(([page, stats]) => ({ page, ...stats }))
			.sort((a, b) => b.impressions - a.impressions)
			.slice(0, 20);

		const deviceBreakdown = Array.from(deviceData.entries())
			.map(([device, stats]) => ({ device, ...stats }));

		const countryBreakdown = Array.from(countryData.entries())
			.map(([country, stats]) => ({ country, ...stats }))
			.sort((a, b) => b.impressions - a.impressions)
			.slice(0, 10);

		const searchConsoleResponse = {
			period: {
				startDate: startDateStr,
				endDate: endDateStr,
				days: days
			},
			summary: {
				totalClicks: rows.reduce((sum, row) => sum + (row.clicks || 0), 0),
				totalImpressions: rows.reduce((sum, row) => sum + (row.impressions || 0), 0),
				averageCTR: rows.length > 0 ? rows.reduce((sum, row) => sum + (row.ctr || 0), 0) / rows.length : 0,
				averagePosition: rows.length > 0 ? rows.reduce((sum, row) => sum + (row.position || 0), 0) / rows.length : 0
			},
			topQueries,
			topPages,
			deviceBreakdown,
			countryBreakdown,
			lastUpdated: new Date().toISOString()
		};

		console.log(`✅ Search Console data fetched successfully for ${days} days`);

		return new Response(JSON.stringify(searchConsoleResponse), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Cache-Control': 'no-cache'
			},
		});

	} catch (error) {
		console.error('Search Console API error:', error);

		// Return fallback data for development/testing
		const fallbackResponse = {
			period: {
				startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
				endDate: new Date().toISOString().split('T')[0],
				days: 30
			},
			summary: {
				totalClicks: 0,
				totalImpressions: 0,
				averageCTR: 0,
				averagePosition: 0
			},
			topQueries: [],
			topPages: [],
			deviceBreakdown: [],
			countryBreakdown: [],
			error: error.message,
			lastUpdated: new Date().toISOString()
		};

		return new Response(JSON.stringify(fallbackResponse), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});
	}
}

// Handle PageSpeed Insights
async function handlePageSpeedInsights(request, env) {
	try {
		const url = new URL(request.url);
		const targetUrl = url.searchParams.get('url') || 'https://salambumi.xyz';
		const apiKey = env.PAGESPEED_API_KEY;

		if (!apiKey) {
			console.error('PageSpeed API key not configured');
			return new Response(JSON.stringify({
				error: 'PageSpeed API key not configured'
			}), {
				status: 503,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		console.log(`📊 Running PageSpeed Insights for: ${targetUrl}`);

		// Call Google PageSpeed Insights API
		const response = await fetch(
			`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&key=${apiKey}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('PageSpeed API error:', response.status, errorText);
			return new Response(JSON.stringify({
				error: 'PageSpeed API request failed',
				details: errorText
			}), {
				status: response.status,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		const data = await response.json();

		// Extract key metrics
		const lighthouseResult = data.lighthouseResult || {};
		const categories = lighthouseResult.categories || {};
		const audits = lighthouseResult.audits || {};

		const processedData = {
			url: targetUrl,
			requestedUrl: data.id,
			analysisUTCTimestamp: data.analysisUTCTimestamp,
			categories: {
				performance: {
					score: categories.performance?.score || 0,
					title: categories.performance?.title || 'Performance'
				},
				accessibility: {
					score: categories.accessibility?.score || 0,
					title: categories.accessibility?.title || 'Accessibility'
				},
				'best-practices': {
					score: categories['best-practices']?.score || 0,
					title: categories['best-practices']?.title || 'Best Practices'
				},
				seo: {
					score: categories.seo?.score || 0,
					title: categories.seo?.title || 'SEO'
				}
			},
			coreWebVitals: {
				lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
				fid: audits['first-input']?.displayValue || 'N/A',
				cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
				fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
				ttfb: audits['server-response-time']?.displayValue || 'N/A'
			},
			loadingExperience: data.loadingExperience || {},
			originLoadingExperience: data.originLoadingExperience || {},
			lastUpdated: new Date().toISOString()
		};

		console.log(`✅ PageSpeed Insights completed for ${targetUrl}`);

		return new Response(JSON.stringify(processedData), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Cache-Control': 'no-cache'
			},
		});

	} catch (error) {
		console.error('PageSpeed Insights error:', error);

		// Return fallback data for development/testing
		const fallbackResponse = {
			url: 'https://salambumi.xyz',
			categories: {
				performance: { score: 0, title: 'Performance' },
				accessibility: { score: 0, title: 'Accessibility' },
				'best-practices': { score: 0, title: 'Best Practices' },
				seo: { score: 0, title: 'SEO' }
			},
			coreWebVitals: {
				lcp: 'N/A',
				fid: 'N/A',
				cls: 'N/A',
				fcp: 'N/A',
				ttfb: 'N/A'
			},
			loadingExperience: {},
			originLoadingExperience: {},
			error: error.message,
			lastUpdated: new Date().toISOString()
		};

		return new Response(JSON.stringify(fallbackResponse), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});
	}
}