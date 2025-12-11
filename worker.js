// Rate limiting store
const rateLimitStore = new Map();

// Rate limiting configuration
const RATE_LIMITS = {
	DEFAULT: { windowMs: 60000, maxRequests: 100 }, // 100 requests per minute
	API_HEAVY: { windowMs: 60000, maxRequests: 30 }, // 30 requests per minute for heavy APIs
	IMAGE_UPLOAD: { windowMs: 60000, maxRequests: 10 }, // 10 uploads per minute
};

// Rate limiting middleware
function checkRateLimit(clientIP, endpoint, limitType = 'DEFAULT') {
	const key = `${clientIP}:${endpoint}`;
	const now = Date.now();
	const limit = RATE_LIMITS[limitType];

	if (!rateLimitStore.has(key)) {
		rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs });
		return { allowed: true, remaining: limit.maxRequests - 1 };
	}

	const userLimit = rateLimitStore.get(key);

	if (now > userLimit.resetTime) {
		userLimit.count = 1;
		userLimit.resetTime = now + limit.windowMs;
		return { allowed: true, remaining: limit.maxRequests - 1 };
	}

	if (userLimit.count >= limit.maxRequests) {
		return {
			allowed: false,
			remaining: 0,
			resetTime: userLimit.resetTime
		};
	}

	userLimit.count++;
	return {
		allowed: true,
		remaining: limit.maxRequests - userLimit.count
	};
}

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
			const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';

			// Rate limiting check
			let limitType = 'DEFAULT';
			if (url.pathname.startsWith('/api/')) {
				limitType = 'API_HEAVY';
			} else if (url.pathname === '/upload' && request.method === 'POST') {
				limitType = 'IMAGE_UPLOAD';
			}

			const rateLimitResult = checkRateLimit(clientIP, url.pathname, limitType);

			if (!rateLimitResult.allowed) {
				console.warn(`🚫 Rate limit exceeded for ${clientIP} on ${url.pathname}`);
				return new Response(JSON.stringify({
					error: 'Rate limit exceeded',
					message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
					retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
				}), {
					status: 429,
					headers: {
						'Content-Type': 'application/json',
						'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
						'X-RateLimit-Remaining': '0'
					}
				});
			}

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

			/**
			 * @swagger
			 * /api/chat:
			 *   post:
			 *     summary: AI Chat for property inquiries
			 *     description: Interactive AI chatbot for property-related questions and inquiries
			 *     tags: [AI, Chat]
			 *     requestBody:
			 *       required: true
			 *       content:
			 *         application/json:
			 *           schema:
			 *             type: object
			 *             required:
			 *               - messages
			 *             properties:
			 *               messages:
			 *                 type: array
			 *                 items:
			 *                   $ref: '#/components/schemas/ChatMessage'
			 *                 description: Array of chat messages
			 *     responses:
			 *       200:
			 *         description: Chat response generated successfully
			 *         content:
			 *           application/json:
			 *             schema:
			 *               type: object
			 *               properties:
			 *                 response:
			 *                   type: string
			 *                   description: AI-generated response
			 *       400:
			 *         description: Invalid request data
			 *         $ref: '#/components/schemas/Error'
			 *       503:
			 *         description: AI service unavailable
			 *         $ref: '#/components/schemas/Error'
			 */
			// Handle AI chat requests
			if (request.method === 'POST' && url.pathname === '/api/chat') {
				return handleChatRequest(request, env, ctx);
			}

			/**
			 * @swagger
			 * /api/generate-description:
			 *   post:
			 *     summary: Generate AI-powered property descriptions
			 *     description: Uses AI to generate compelling property descriptions and titles for real estate listings
			 *     tags: [AI, Content Generation]
			 *     requestBody:
			 *       required: true
			 *       content:
			 *         application/json:
			 *           schema:
			 *             type: object
			 *             properties:
			 *               title:
			 *                 type: string
			 *                 description: Current property title
			 *               type:
			 *                 type: string
			 *                 description: Property type (rumah, apartemen, etc.)
			 *               status:
			 *                 type: string
			 *                 enum: [dijual, disewakan]
			 *                 description: Property status
			 *               price:
			 *                 type: number
			 *                 description: Property price
			 *               land_area:
			 *                 type: number
			 *                 description: Land area in m²
			 *               building_area:
			 *                 type: number
			 *                 description: Building area in m²
			 *               bedrooms:
			 *                 type: integer
			 *                 description: Number of bedrooms
			 *               bathrooms:
			 *                 type: integer
			 *                 description: Number of bathrooms
			 *               legal:
			 *                 type: string
			 *                 description: Legal status
			 *               location:
			 *                 type: object
			 *                 properties:
			 *                   province:
			 *                     type: string
			 *                     description: Province name
			 *                   district:
			 *                     type: string
			 *                     description: District/City name
			 *               old_description:
			 *                 type: string
			 *                 description: Existing description to improve
			 *               model:
			 *                 type: string
			 *                 description: AI model to use
			 *                 default: gemini-2.0-flash-exp
			 *     responses:
			 *       200:
			 *         description: AI-generated content
			 *         content:
			 *           application/json:
			 *             schema:
			 *               type: object
			 *               properties:
			 *                 ai_title:
			 *                   type: string
			 *                   description: Generated title
			 *                 ai_description:
			 *                   type: string
			 *                   description: Generated description
			 *                 keywords:
			 *                   type: array
			 *                   items:
			 *                     type: string
			 *                   description: Extracted keywords
			 *                 is_generated:
			 *                   type: boolean
			 *                   description: Whether new content was generated
			 *       400:
			 *         description: Missing required fields
			 *         $ref: '#/components/schemas/Error'
			 *       503:
			 *         description: AI service unavailable
			 *         $ref: '#/components/schemas/Error'
			 */
			// Handle AI description generation with performance monitoring
			if (request.method === 'POST' && url.pathname === '/api/generate-description') {
				return withPerformanceMonitoring(
					() => handleGenerateDescription(request, env),
					'AI_DESCRIPTION_GENERATION'
				)
			}

			/**
			 * @swagger
			 * /api/analytics:
			 *   get:
			 *     summary: Get Google Analytics 4 data
			 *     description: Fetches comprehensive analytics data including user metrics, page views, demographics, and geography
			 *     tags: [Analytics]
			 *     parameters:
			 *       - in: query
			 *         name: days
			 *         schema:
			 *           type: integer
			 *           default: 30
			 *           minimum: 1
			 *           maximum: 365
			 *         description: Number of days to analyze (default 30)
			 *     responses:
			 *       200:
			 *         description: Analytics data retrieved successfully
			 *         content:
			 *           application/json:
			 *             schema:
			 *               $ref: '#/components/schemas/AnalyticsData'
			 *       503:
			 *         description: Analytics service not configured
			 *         $ref: '#/components/schemas/Error'
			 */
			// Handle analytics data fetching
			if (request.method === 'GET' && url.pathname === '/api/analytics') {
				return withPerformanceMonitoring(
					() => handleAnalyticsData(request, env),
					'ANALYTICS_DATA_FETCH'
				)
			}

			// Handle analytics diagnostics
			if (request.method === 'GET' && url.pathname === '/api/analytics/diagnose') {
				return handleAnalyticsDiagnostics(request, env);
			}

			// Handle Search Console data fetching
			if (request.method === 'GET' && url.pathname === '/api/search-console') {
				return withPerformanceMonitoring(
					() => handleSearchConsoleData(request, env),
					'SEARCH_CONSOLE_DATA_FETCH'
				)
			}

			/**
			 * @swagger
			 * /api/leads:
			 *   post:
			 *     summary: Capture lead information
			 *     description: Records user inquiries and contact information for property leads
			 *     tags: [Leads, CRM]
			 *     requestBody:
			 *       required: true
			 *       content:
			 *         application/json:
			 *           schema:
			 *             type: object
			 *             required:
			 *               - user_intent
			 *               - whatsapp
			 *             properties:
			 *               user_intent:
			 *                 type: string
			 *                 maxLength: 500
			 *                 description: User's inquiry or interest description
			 *               whatsapp:
			 *                 type: string
			 *                 pattern: '^\+62[8-9]\d{7,11}$'
			 *                 description: Indonesian WhatsApp number with country code
			 *               ip_address:
			 *                 type: string
			 *                 description: User IP address (auto-detected if not provided)
			 *               user_agent:
			 *                 type: string
			 *                 description: Browser user agent (auto-detected if not provided)
			 *               page_url:
			 *                 type: string
			 *                 format: uri
			 *                 description: URL where the lead was captured
			 *               referrer:
			 *                 type: string
			 *                 format: uri
			 *                 description: Referrer URL
			 *               session_id:
			 *                 type: string
			 *                 description: Session identifier (auto-generated if not provided)
			 *     responses:
			 *       200:
			 *         description: Lead captured successfully
			 *         content:
			 *           application/json:
			 *             schema:
			 *               type: object
			 *               properties:
			 *                 success:
			 *                   type: boolean
			 *                   example: true
			 *                 message:
			 *                   type: string
			 *                   example: "Lead captured successfully"
			 *                 session_id:
			 *                   type: string
			 *                   description: Session identifier for tracking
			 *       400:
			 *         description: Invalid input data
			 *         $ref: '#/components/schemas/Error'
			 *       500:
			 *         description: Database error
			 *         $ref: '#/components/schemas/Error'
			 */
			// Handle lead capture
			if (request.method === 'POST' && url.pathname === '/api/leads') {
				return withPerformanceMonitoring(
					() => handleLeadCapture(request, env),
					'LEAD_CAPTURE'
				)
			}

			// Handle get leads (admin)
			if (request.method === 'GET' && url.pathname === '/api/leads') {
				return withPerformanceMonitoring(
					() => handleGetLeads(request, env),
					'GET_LEADS'
				)
			}

			// Handle PageSpeed Insights
			if (request.method === 'GET' && url.pathname === '/api/pagespeed') {
				return withPerformanceMonitoring(
					() => handlePageSpeedInsights(request, env),
					'PAGESPEED_INSIGHTS_FETCH'
				)
			}

			// Handle AI content generation (Ollama/Local AI)
			if (request.method === 'POST' && url.pathname === '/api/ai/generate-description') {
				return withPerformanceMonitoring(
					() => handleAIGenerateDescription(request, env),
					'AI_DESCRIPTION_GENERATION_LOCAL'
				)
			}

			// Handle AI SEO optimization
			if ((request.method === 'POST' || request.method === 'OPTIONS') && url.pathname === '/api/ai/optimize-seo') {
				if (request.method === 'OPTIONS') {
					return new Response(null, {
						headers: {
							...getCORSHeaders(request),
							'Access-Control-Allow-Methods': 'POST, OPTIONS',
							'Access-Control-Allow-Headers': 'Content-Type',
						},
					});
				}
				return withPerformanceMonitoring(
					() => handleAIOptimizeSEO(request, env),
					'AI_SEO_OPTIMIZATION'
				)
			}

			// Handle AI social media post generation
			if (request.method === 'POST' && url.pathname === '/api/ai/generate-social-post') {
				return withPerformanceMonitoring(
					() => handleAIGenerateSocialPost(request, env),
					'AI_SOCIAL_POST_GENERATION'
				)
			}

			/**
			 * @swagger
			 * /upload:
			 *   post:
			 *     summary: Upload property images
			 *     description: Uploads images to Cloudflare Images with automatic optimization and multiple size variants
			 *     tags: [Media, Upload]
			 *     requestBody:
			 *       required: true
			 *       content:
			 *         multipart/form-data:
			 *           schema:
			 *             type: object
			 *             required:
			 *               - image
			 *               - propertyId
			 *             properties:
			 *               image:
			 *                 type: string
			 *                 format: binary
			 *                 description: Image file (JPG, PNG, GIF, WebP) - max 10MB
			 *               propertyId:
			 *                 type: string
			 *                 description: Property identifier for organization
			 *     responses:
			 *       200:
			 *         description: Image uploaded successfully
			 *         content:
			 *           application/json:
			 *             schema:
			 *               type: object
			 *               properties:
			 *                 success:
			 *                   type: boolean
			 *                   example: true
			 *                 url:
			 *                   type: string
			 *                   format: uri
			 *                   description: Optimized image URL
			 *                 originalUrl:
			 *                   type: string
			 *                   format: uri
			 *                   description: Original image URL
			 *                 variants:
			 *                   type: object
			 *                   properties:
			 *                     thumbnail:
			 *                       type: string
			 *                       format: uri
			 *                       description: 300px thumbnail
			 *                     small:
			 *                       type: string
			 *                       format: uri
			 *                       description: 600px version
			 *                     medium:
			 *                       type: string
			 *                       format: uri
			 *                       description: 800px version
			 *                     large:
			 *                       type: string
			 *                       format: uri
			 *                       description: 1200px version
			 *                 propertyId:
			 *                   type: string
			 *                   description: Associated property ID
			 *                 imageId:
			 *                   type: string
			 *                   description: Cloudflare Images ID
			 *       400:
			 *         description: Invalid file or missing propertyId
			 *         $ref: '#/components/schemas/Error'
			 *       413:
			 *         description: File too large
			 *         $ref: '#/components/schemas/Error'
			 */
			// Handle image upload (existing functionality)
			if (request.method === 'POST' && url.pathname === '/upload') {
				return handleImageUpload(request, env);
			}

			/**
			 * @swagger
			 * /api/health:
			 *   get:
			 *     summary: System health check
			 *     description: Comprehensive health check for all system services and dependencies
			 *     tags: [System, Monitoring]
			 *     responses:
			 *       200:
			 *         description: System is healthy
			 *         content:
			 *           application/json:
			 *             schema:
			 *               type: object
			 *               properties:
			 *                 status:
			 *                   type: string
			 *                   enum: [healthy, degraded]
			 *                   description: Overall system status
			 *                 timestamp:
			 *                   type: string
			 *                   format: date-time
			 *                   description: Health check timestamp
			 *                 version:
			 *                   type: string
			 *                   description: API version
			 *                 environment:
			 *                   type: string
			 *                   description: Deployment environment
			 *                 response_time_ms:
			 *                   type: integer
			 *                   description: Response time in milliseconds
			 *                 services:
			 *                   type: object
			 *                   properties:
			 *                     database:
			 *                       type: string
			 *                       enum: [healthy, unhealthy, error]
			 *                       description: Database connectivity status
			 *                     ai_api:
			 *                       type: string
			 *                       enum: [healthy, unhealthy, error]
			 *                       description: AI service status
			 *                     cloudflare_images:
			 *                       type: string
			 *                       enum: [healthy, unhealthy, error]
			 *                       description: Image service status
			 *                     rate_limiting:
			 *                       type: string
			 *                       example: active
			 *                       description: Rate limiting status
			 *                     cors:
			 *                       type: string
			 *                       example: configured
			 *                       description: CORS configuration status
			 *                 metrics:
			 *                   type: object
			 *                   properties:
			 *                     uptime_seconds:
			 *                       type: integer
			 *                       description: System uptime in seconds
			 *                     memory_usage_mb:
			 *                       type: integer
			 *                       nullable: true
			 *                       description: Memory usage in MB
			 *                     active_connections:
			 *                       type: integer
			 *                       description: Number of active connections
			 *       503:
			 *         description: System is degraded or unhealthy
			 *         content:
			 *           application/json:
			 *             schema:
			 *               type: object
			 *               properties:
			 *                 status:
			 *                   type: string
			 *                   example: degraded
			 *                 timestamp:
			 *                   type: string
			 *                   format: date-time
			 *                 error:
			 *                   type: string
			 *                   description: Error description
			 */
			// Enhanced health check endpoint for monitoring
			if (url.pathname === '/api/health') {
				const startTime = Date.now();

				// Check database connectivity
				let dbStatus = 'unknown';
				try {
					const dbResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/properties?select=id&limit=1`, {
						headers: {
							'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
							'apikey': env.SUPABASE_ANON_KEY,
						},
					});
					dbStatus = dbResponse.ok ? 'healthy' : 'unhealthy';
				} catch (error) {
					dbStatus = 'error';
				}

				// Check AI services
				let aiStatus = 'unknown';
				try {
					const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${env.GEMINI_API_KEY}`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							contents: [{ parts: [{ text: 'test' }] }]
						}),
					});
					aiStatus = aiResponse.status !== 400 ? 'healthy' : 'unhealthy'; // 400 is expected for invalid request
				} catch (error) {
					aiStatus = 'error';
				}

				// Check Cloudflare Images
				let imagesStatus = 'unknown';
				try {
					const imagesResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/images/v1`, {
						headers: {
							'Authorization': `Bearer ${env.CF_IMAGES_TOKEN}`,
						},
					});
					imagesStatus = imagesResponse.ok ? 'healthy' : 'unhealthy';
				} catch (error) {
					imagesStatus = 'error';
				}

				const healthCheckTime = Date.now() - startTime;
				const overallStatus = (dbStatus === 'healthy' && aiStatus !== 'error' && imagesStatus !== 'error') ? 'healthy' : 'degraded';

				const healthCheck = {
					status: overallStatus,
					timestamp: new Date().toISOString(),
					version: '1.0.0',
					environment: env.ENVIRONMENT || 'production',
					response_time_ms: healthCheckTime,
					services: {
						database: dbStatus,
						ai_api: aiStatus,
						cloudflare_images: imagesStatus,
						rate_limiting: 'active',
						cors: 'configured'
					},
					metrics: {
						uptime_seconds: Math.floor(Date.now() / 1000),
						memory_usage_mb: typeof process !== 'undefined' ? Math.round(process.memoryUsage?.().heapUsed / 1024 / 1024) : null,
						active_connections: 0, // Would need to track this
					},
					rate_limits: {
						total_requests: 0, // Would need to track this
						blocked_requests: 0, // Would need to track this
					},
					system: {
						platform: 'cloudflare-workers',
						region: env.CF_REGION || 'unknown',
						colocation: env.CF_COLO || 'unknown',
					}
				};

				const statusCode = overallStatus === 'healthy' ? 200 : 503;

				return new Response(JSON.stringify(healthCheck, null, 2), {
					status: statusCode,
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'no-cache',
						'X-Health-Check-Time': healthCheckTime.toString(),
					}
				});
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

			// Serve OpenAPI specification
			if (url.pathname === '/api/docs') {
				const openApiSpec = {
					openapi: '3.0.0',
					info: {
						title: 'Salam Bumi Property API',
						version: '1.0.0',
						description: 'Comprehensive API for Salam Bumi Property real estate platform',
						contact: {
							name: 'Salam Bumi Property',
							email: 'admin@salambumi.xyz',
							url: 'https://salambumi.xyz'
						}
					},
					servers: [
						{ url: 'https://salambumi.xyz', description: 'Production server' },
						{ url: 'http://localhost:5173', description: 'Development server' }
					],
					paths: {
						'/api/chat': {
							post: {
								summary: 'AI Chat for property inquiries',
								description: 'Interactive AI chatbot for property-related questions',
								tags: ['AI', 'Chat'],
								requestBody: {
									required: true,
									content: {
										'application/json': {
											schema: {
												type: 'object',
												required: ['messages'],
												properties: {
													messages: {
														type: 'array',
														items: { $ref: '#/components/schemas/ChatMessage' }
													}
												}
											}
										}
									}
								},
								responses: {
									200: { description: 'Chat response generated successfully' },
									400: { description: 'Invalid request data' },
									503: { description: 'AI service unavailable' }
								}
							}
						},
						'/api/generate-description': {
							post: {
								summary: 'Generate AI-powered property descriptions',
								description: 'Uses AI to generate compelling property descriptions',
								tags: ['AI', 'Content Generation'],
								responses: {
									200: { description: 'AI-generated content' },
									400: { description: 'Missing required fields' },
									503: { description: 'AI service unavailable' }
								}
							}
						},
						'/api/analytics': {
							get: {
								summary: 'Get Google Analytics 4 data',
								description: 'Fetches comprehensive analytics data',
								tags: ['Analytics'],
								parameters: [
									{
										in: 'query',
										name: 'days',
										schema: { type: 'integer', default: 30 },
										description: 'Number of days to analyze'
									}
								],
								responses: {
									200: { description: 'Analytics data retrieved successfully' },
									503: { description: 'Analytics service not configured' }
								}
							}
						},
						'/api/leads': {
							post: {
								summary: 'Capture lead information',
								description: 'Records user inquiries and contact information',
								tags: ['Leads', 'CRM'],
								requestBody: {
									required: true,
									content: {
										'application/json': {
											schema: {
												type: 'object',
												required: ['user_intent', 'whatsapp'],
												properties: {
													user_intent: { type: 'string', description: 'User inquiry message' },
													whatsapp: { type: 'string', description: 'WhatsApp contact number' }
												}
											}
										}
									}
								},
								responses: {
									200: { description: 'Lead captured successfully' },
									400: { description: 'Invalid input data' },
									500: { description: 'Database error' }
								}
							}
						},
						'/upload': {
							post: {
								summary: 'Upload property images',
								description: 'Uploads images to Cloudflare Images with optimization',
								tags: ['Media', 'Upload'],
								requestBody: {
									required: true,
									content: {
										'multipart/form-data': {
											schema: {
												type: 'object',
												required: ['image', 'propertyId'],
												properties: {
													image: { type: 'string', format: 'binary', description: 'Image file' },
													propertyId: { type: 'string', description: 'Property identifier' }
												}
											}
										}
									}
								},
								responses: {
									200: { description: 'Image uploaded successfully' },
									400: { description: 'Invalid file or missing propertyId' },
									413: { description: 'File too large' }
								}
							}
						},
						'/api/health': {
							get: {
								summary: 'System health check',
								description: 'Comprehensive health check for all system services',
								tags: ['System', 'Monitoring'],
								responses: {
									200: { description: 'System is healthy' },
									503: { description: 'System is degraded or unhealthy' }
								}
							}
						}
					},
					components: {
						schemas: {
							ChatMessage: {
								type: 'object',
								properties: {
									role: { type: 'string', enum: ['user', 'assistant'] },
									content: { type: 'string' }
								}
							}
						}
					},
					tags: [
						{ name: 'AI', description: 'Artificial Intelligence services' },
						{ name: 'Analytics', description: 'Google Analytics 4 data' },
						{ name: 'Chat', description: 'AI chatbot functionality' },
						{ name: 'Content Generation', description: 'AI-powered content creation' },
						{ name: 'CRM', description: 'Customer Relationship Management' },
						{ name: 'Leads', description: 'Lead capture and management' },
						{ name: 'Media', description: 'File upload and media management' },
						{ name: 'Monitoring', description: 'System monitoring and health checks' },
						{ name: 'System', description: 'System-level operations' },
						{ name: 'Upload', description: 'File upload operations' }
					]
				};

				return new Response(JSON.stringify(openApiSpec, null, 2), {
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'public, max-age=3600',
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
				...getSecurityHeaders(),
				...getCORSHeaders(request),
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

// CORS configuration - secure whitelist
const ALLOWED_ORIGINS = [
	'https://salambumi.xyz',
	'https://www.salambumi.xyz',
	'http://localhost:5173', // Vite dev server
	'http://localhost:3000', // Alternative dev port
	'http://localhost:4173', // Vite preview server
];

function getCORSHeaders(request) {
	const origin = request.headers.get('Origin');

	// Only allow requests from whitelisted origins
	if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
		return {
			'Access-Control-Allow-Origin': 'null', // Explicitly deny
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
			'Access-Control-Allow-Credentials': 'false',
			'Access-Control-Max-Age': '86400',
		};
	}

	return {
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
		'Access-Control-Allow-Credentials': 'true',
		'Access-Control-Max-Age': '86400',
	};
}

// Input sanitization functions
function sanitizeString(input, maxLength = 1000) {
	if (typeof input !== 'string') return '';

	// Remove null bytes and other dangerous characters
	let sanitized = input
		.replace(/\0/g, '') // Remove null bytes
		.replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
		.trim();

	// Limit length
	if (maxLength > 0 && sanitized.length > maxLength) {
		sanitized = sanitized.substring(0, maxLength);
	}

	return sanitized;
}

function sanitizeEmail(email) {
	const sanitized = sanitizeString(email, 254); // RFC 5321 limit
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(sanitized)) {
		throw new Error('Invalid email format');
	}

	return sanitized.toLowerCase();
}

function sanitizePhoneNumber(phone) {
	// Remove all non-numeric characters except +
	let sanitized = phone.replace(/[^\d+]/g, '');

	// Ensure it starts with +62 for Indonesian numbers
	if (sanitized.startsWith('0')) {
		sanitized = '+62' + sanitized.substring(1);
	} else if (sanitized.startsWith('62')) {
		sanitized = '+' + sanitized;
	} else if (!sanitized.startsWith('+')) {
		sanitized = '+62' + sanitized;
	}

	// Validate Indonesian phone number format
	const phoneRegex = /^\+62[8-9]\d{7,11}$/;
	if (!phoneRegex.test(sanitized)) {
		throw new Error('Invalid Indonesian phone number format');
	}

	return sanitized;
}

function sanitizeNumeric(input, min = 0, max = Number.MAX_SAFE_INTEGER) {
	const num = parseFloat(input);
	if (isNaN(num) || num < min || num > max) {
		throw new Error(`Invalid numeric value: must be between ${min} and ${max}`);
	}
	return num;
}

// Security headers function
function getSecurityHeaders() {
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.googletagmanager.com https://*.google-analytics.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com",
		"img-src 'self' data: https: blob:",
		"connect-src 'self' https://*.supabase.co https://*.googleapis.com https://*.google-analytics.com https://*.googletagmanager.com",
		"frame-src 'self'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'"
	].join('; ');

	return {
		'Content-Security-Policy': csp,
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'DENY',
		'X-XSS-Protection': '1; mode=block',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
		'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
	};
}

// Handle AI chat requests
async function handleChatRequest(request, env, ctx) {
	// CORS handling
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			headers: getCORSHeaders(request),
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
					...getCORSHeaders(request),
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
					...getCORSHeaders(request),
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
					...getCORSHeaders(request),
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
					...getCORSHeaders(request),
				},
			});
		}

		return new Response(JSON.stringify({ response: chatResponse.trim() }), {
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
			},
		});

	} catch (error) {
		console.error('Chat API error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
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
				...getCORSHeaders(request),
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
					...getCORSHeaders(request),
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
					...getCORSHeaders(request),
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
							...getCORSHeaders(request),
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
				...getCORSHeaders(request),
			},
		});

	} catch (error) {
		console.error('Generate description API error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
			},
		});
	}
}

// Handle AI content generation using Ollama (Local AI) with Gemini fallback
async function handleAIGenerateDescription(request, env) {
	// CORS handling
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				...getCORSHeaders(request),
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
			kodeListing,
			judulProperti,
			jenisProperti,
			kabupaten,
			provinsi,
			hargaProperti,
			kamarTidur,
			kamarMandi,
			luasTanah,
			luasBangunan,
			legalitas,
			requestId = `req_${Date.now()}`
		} = await request.json();

		console.log(`🤖 [${requestId}] AI Description generation request received`);

		// Validate required fields
		if (!jenisProperti || !kabupaten || !provinsi) {
			console.error(`❌ [${requestId}] Validation failed - missing required fields`);
			return new Response(JSON.stringify({
				error: 'Missing required fields: jenisProperti, kabupaten, provinsi',
				requestId
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
				},
			});
		}

		// Try Ollama first (Local AI - Free & Private)
		try {
			const ollamaUrl = env.OLLAMA_BASE_URL || 'http://localhost:11434';

			console.log(`🔄 [${requestId}] Trying Ollama at ${ollamaUrl}`);

			const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					model: env.OLLAMA_MODEL || 'mistral',
					prompt: buildPropertyDescriptionPrompt({
						kodeListing,
						judulProperti,
						jenisProperti,
						kabupaten,
						provinsi,
						hargaProperti,
						kamarTidur,
						kamarMandi,
						luasTanah,
						luasBangunan,
						legalitas
					}),
					stream: false,
					options: {
						temperature: 0.7,
						num_predict: 800,
					},
				}),
			});

			if (ollamaResponse.ok) {
				const ollamaResult = await ollamaResponse.json();
				const generatedDescription = ollamaResult.response?.trim();

				if (generatedDescription && generatedDescription.length > 50) {
					console.log(`✅ [${requestId}] Ollama generated description successfully`);

					return new Response(JSON.stringify({
						success: true,
						content: cleanAndFormatDescription(generatedDescription),
						model: 'ollama-local',
						source: 'local-ai',
						requestId,
						timestamp: new Date().toISOString()
					}), {
						headers: {
							'Content-Type': 'application/json',
							...getCORSHeaders(request),
						},
					});
				}
			}

			console.log(`⚠️ [${requestId}] Ollama not available or failed, falling back to Gemini`);
		} catch (ollamaError) {
			console.log(`⚠️ [${requestId}] Ollama connection failed:`, ollamaError.message);
		}

		// Fallback to Gemini API (Cloud-based)
		console.log(`🔄 [${requestId}] Using Gemini API as fallback`);

		const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
		if (!geminiApiKey) {
			console.error(`❌ [${requestId}] No AI service available`);
			return new Response(JSON.stringify({
				error: 'AI service not configured',
				requestId
			}), {
				status: 503,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
				},
			});
		}

		// Use existing Gemini implementation for fallback
		const prompt = `Buat deskripsi properti yang menarik dan SEO-friendly dalam bahasa Indonesia.

Data Properti:
- Kode: ${kodeListing || 'N/A'}
- Judul: ${judulProperti || 'N/A'}
- Tipe: ${jenisProperti}
- Lokasi: ${kabupaten}, ${provinsi}
- Harga: ${hargaProperti || 'N/A'}
- Kamar Tidur: ${kamarTidur || 'N/A'}
- Kamar Mandi: ${kamarMandi || 'N/A'}
- Luas Tanah: ${luasTanah ? `${luasTanah} m²` : 'N/A'}
- Luas Bangunan: ${luasBangunan ? `${luasBangunan} m²` : 'N/A'}
- Legalitas: ${legalitas || 'N/A'}

Instruksi:
- Buat deskripsi 200-400 kata yang persuasif
- Sertakan keyword SEO: ${kabupaten}, ${jenisProperti}, dijual, ${provinsi}
- Gunakan bahasa yang mengalir dan profesional
- Sebutkan keunggulan properti
- Akhiri dengan call-to-action untuk menghubungi
- Format: plain text dengan paragraf yang jelas

Deskripsi:`;

		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					contents: [{
						role: 'user',
						parts: [{ text: prompt }]
					}],
					generationConfig: {
						temperature: 0.7,
						maxOutputTokens: 1000,
					}
				}),
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`❌ [${requestId}] Gemini API error:`, response.status, errorText);
			return new Response(JSON.stringify({
				error: 'AI service temporarily unavailable',
				requestId
			}), {
				status: 503,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
				},
			});
		}

		const result = await response.json();
		const generatedContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!generatedContent) {
			console.error(`❌ [${requestId}] No content generated by Gemini`);
			return new Response(JSON.stringify({
				error: 'Failed to generate content',
				requestId
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
				},
			});
		}

		console.log(`✅ [${requestId}] Gemini generated description successfully`);

		return new Response(JSON.stringify({
			success: true,
			content: cleanAndFormatDescription(generatedContent),
			model: 'gemini-2.0-flash-exp',
			source: 'cloud-ai',
			requestId,
			timestamp: new Date().toISOString()
		}), {
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
			},
		});

	} catch (error) {
		console.error('AI Description generation error:', error);
		return new Response(JSON.stringify({
			error: 'Internal server error during AI generation',
			requestId: `req_${Date.now()}`
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
			},
		});
	}
}

// Handle analytics diagnostics
async function handleAnalyticsDiagnostics(request, env) {
	try {
		console.log('🔍 Starting Analytics Diagnostics');

		const diagnostics = {
			timestamp: new Date().toISOString(),
			environment: {
				hasServiceAccountKey: !!env.GA_SERVICE_ACCOUNT_KEY,
				hasPropertyId: !!env.GA_PROPERTY_ID,
				serviceAccountKeyLength: env.GA_SERVICE_ACCOUNT_KEY?.length || 0,
				propertyId: env.GA_PROPERTY_ID || 'NOT_SET'
			},
			ga4Connection: null,
			dataAvailability: null,
			errors: []
		};

		// Test GA4 connection
		if (env.GA_SERVICE_ACCOUNT_KEY && env.GA_PROPERTY_ID) {
			try {
				console.log('🔍 Testing GA4 connection...');

				// Parse service account key
				let serviceAccountKey;
				try {
					serviceAccountKey = JSON.parse(env.GA_SERVICE_ACCOUNT_KEY);
					diagnostics.ga4Connection = { parsed: true };
				} catch (parseError) {
					diagnostics.ga4Connection = { parsed: false, error: parseError.message };
					diagnostics.errors.push(`Service account key parse error: ${parseError.message}`);
				}

				if (serviceAccountKey) {
					// Import googleapis
					const { google } = await import('googleapis');

					// Authenticate
					const auth = new google.auth.GoogleAuth({
						credentials: serviceAccountKey,
						scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
					});

					const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

					// Test basic connectivity with a simple query
					const testResponse = await analyticsData.properties.runReport({
						property: `properties/${env.GA_PROPERTY_ID}`,
						requestBody: {
							dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
							metrics: [{ name: 'totalUsers' }]
						}
					});

					diagnostics.ga4Connection.connected = true;
					diagnostics.ga4Connection.basicData = testResponse.data;

					// Test demographics data availability
					const [ageTest, genderTest, countryTest, cityTest] = await Promise.allSettled([
						analyticsData.properties.runReport({
							property: `properties/${env.GA_PROPERTY_ID}`,
							requestBody: {
								dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
								dimensions: [{ name: 'userAgeBracket' }],
								metrics: [{ name: 'totalUsers' }],
								limit: 1
							}
						}),
						analyticsData.properties.runReport({
							property: `properties/${env.GA_PROPERTY_ID}`,
							requestBody: {
								dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
								dimensions: [{ name: 'userGender' }],
								metrics: [{ name: 'totalUsers' }],
								limit: 1
							}
						}),
						analyticsData.properties.runReport({
							property: `properties/${env.GA_PROPERTY_ID}`,
							requestBody: {
								dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
								dimensions: [{ name: 'country' }],
								metrics: [{ name: 'totalUsers' }],
								limit: 1
							}
						}),
						analyticsData.properties.runReport({
							property: `properties/${env.GA_PROPERTY_ID}`,
							requestBody: {
								dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
								dimensions: [{ name: 'city' }],
								metrics: [{ name: 'totalUsers' }],
								limit: 1
							}
						})
					]);

					diagnostics.dataAvailability = {
						age: {
							available: ageTest.status === 'fulfilled',
							rowCount: ageTest.status === 'fulfilled' ? (ageTest.value.data.rows?.length || 0) : 0,
							error: ageTest.status === 'rejected' ? ageTest.reason.message : null
						},
						gender: {
							available: genderTest.status === 'fulfilled',
							rowCount: genderTest.status === 'fulfilled' ? (genderTest.value.data.rows?.length || 0) : 0,
							error: genderTest.status === 'rejected' ? genderTest.reason.message : null
						},
						country: {
							available: countryTest.status === 'fulfilled',
							rowCount: countryTest.status === 'fulfilled' ? (countryTest.value.data.rows?.length || 0) : 0,
							error: countryTest.status === 'rejected' ? countryTest.reason.message : null
						},
						city: {
							available: cityTest.status === 'fulfilled',
							rowCount: cityTest.status === 'fulfilled' ? (cityTest.value.data.rows?.length || 0) : 0,
							error: cityTest.status === 'rejected' ? cityTest.reason.message : null
						}
					};

				}
			} catch (error) {
				console.error('🔍 GA4 Connection test failed:', error);
				diagnostics.ga4Connection = {
					connected: false,
					error: error.message,
					stack: error.stack
				};
				diagnostics.errors.push(`GA4 connection error: ${error.message}`);
			}
		} else {
			diagnostics.errors.push('GA4 credentials not configured');
		}

		// Add recommendations
		diagnostics.recommendations = [];
		if (!diagnostics.environment.hasServiceAccountKey) {
			diagnostics.recommendations.push('Set GA_SERVICE_ACCOUNT_KEY environment variable');
		}
		if (!diagnostics.environment.hasPropertyId) {
			diagnostics.recommendations.push('Set GA_PROPERTY_ID environment variable');
		}
		if (diagnostics.ga4Connection && !diagnostics.ga4Connection.connected) {
			diagnostics.recommendations.push('Check GA4 service account permissions and property access');
		}
		if (diagnostics.dataAvailability) {
			const unavailableData = Object.entries(diagnostics.dataAvailability)
				.filter(([key, value]) => !value.available)
				.map(([key]) => key);

			if (unavailableData.length > 0) {
				diagnostics.recommendations.push(`Data not available for: ${unavailableData.join(', ')}. Wait 24-48 hours after consent is given.`);
			}
		}

		console.log('🔍 Diagnostics completed');

		return new Response(JSON.stringify(diagnostics, null, 2), {
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
				'Cache-Control': 'no-cache'
			}
		});

	} catch (error) {
		console.error('🔍 Diagnostics error:', error);
		return new Response(JSON.stringify({
			error: 'Diagnostics failed',
			message: error.message,
			timestamp: new Date().toISOString()
		}, null, 2), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
}

// Handle AI SEO optimization
async function handleAIOptimizeSEO(request, env) {
	// CORS handling
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			headers: getCORSHeaders(request),
		});
	}

	if (request.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 });
	}

	try {
		const { title, description } = await request.json();

		// Create optimized content based on input
		let optimizedTitle = title;
		let optimizedDescription = description;

		// Basic optimization if AI is not available
		if (title) {
			// Add "Salam Bumi Property" suffix if not already present
			if (!title.includes('Salam Bumi Property')) {
				optimizedTitle = `${title} - Salam Bumi Property`;
			}
		} else {
			optimizedTitle = 'Property Title - Salam Bumi Property';
		}

		if (description) {
			// Add call-to-action if not present
			if (!description.includes('Hubungi kami')) {
				optimizedDescription = `${description.substring(0, 120)}... Hubungi kami untuk informasi lebih lanjut.`;
			}
		} else {
			optimizedDescription = 'Deskripsi properti yang menarik dan informatif. Hubungi kami untuk informasi lebih lanjut.';
		}

		// Extract basic keywords from title and description
		const keywords = extractKeywords(optimizedDescription, '', '', '');

		const fallbackOptimization = {
			success: true,
			optimizedTitle: optimizedTitle,
			optimizedDescription: optimizedDescription,
			keywords: keywords,
			requestId: `req_${Date.now()}`,
			timestamp: new Date().toISOString(),
			note: 'Using basic optimization - AI service temporarily unavailable'
		};

		return new Response(JSON.stringify(fallbackOptimization), {
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
			},
		});
	} catch (error) {
		console.error('SEO optimization error:', error);

		// Fallback for any parsing errors
		const fallbackOptimization = {
			success: true,
			optimizedTitle: 'Property Title - Salam Bumi Property',
			optimizedDescription: 'Deskripsi properti yang menarik dan informatif. Hubungi kami untuk informasi lebih lanjut.',
			keywords: ['properti', 'dijual', 'sewa', 'yogyakarta', 'indonesia'],
			requestId: `req_${Date.now()}`,
			timestamp: new Date().toISOString(),
			note: 'Using basic optimization - Error occurred'
		};

		return new Response(JSON.stringify(fallbackOptimization), {
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
			},
		});
	}
}

// Handle AI social media post generation
async function handleAIGenerateSocialPost(request, env) {
	// CORS handling
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				...getCORSHeaders(request),
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
		});
	}

	if (request.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 });
	}

	try {
		const { property, platform, requestId = `req_${Date.now()}` } = await request.json();

		console.log(`📱 [${requestId}] AI Social post generation for ${platform}`);

		if (!property || !platform) {
			return new Response(JSON.stringify({
				error: 'Property data and platform required',
				requestId
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
				},
			});
		}

		const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
		if (!geminiApiKey) {
			return new Response(JSON.stringify({
				error: 'AI service not configured',
				requestId
			}), {
				status: 503,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
				},
			});
		}

		const platformGuidelines = {
			facebook: 'Professional, informative, with property details and call-to-action',
			instagram: 'Engaging, visual-focused, with emojis and relevant hashtags',
			twitter: 'Concise, impactful, under 280 characters with hashtags',
			tiktok: 'Fun, story-like script for video content',
			linkedin: 'Professional networking tone, B2B focused'
		};

		const socialPrompt = `Create a ${platform} post for this property:

Property Details:
- Title: ${property.judulProperti || property.title || 'N/A'}
- Type: ${property.jenisProperti || property.type || 'N/A'}
- Location: ${property.kabupaten || property.city || 'N/A'}, ${property.provinsi || property.province || 'N/A'}
- Price: ${property.hargaProperti || property.price || 'N/A'}
- Bedrooms: ${property.kamarTidur || property.bedrooms || 'N/A'}
- Link: https://salambumi.xyz/properti/${property.id || property.kodeListing}

Guidelines for ${platform}: ${platformGuidelines[platform] || 'Engaging and informative'}

Make it compelling and include relevant emojis and hashtags.`;

		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					contents: [{
						role: 'user',
						parts: [{ text: socialPrompt }]
					}],
					generationConfig: {
						temperature: 0.8,
						maxOutputTokens: 300,
					}
				}),
			}
		);

		if (!response.ok) {
			return new Response(JSON.stringify({
				error: 'Social post generation service unavailable',
				requestId
			}), {
				status: 503,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
				},
			});
		}

		const result = await response.json();
		const generatedPost = result.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!generatedPost) {
			return new Response(JSON.stringify({
				error: 'Failed to generate social post',
				requestId
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
				},
			});
		}

		return new Response(JSON.stringify({
			success: true,
			content: generatedPost.trim(),
			platform,
			requestId,
			timestamp: new Date().toISOString()
		}), {
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
			},
		});

	} catch (error) {
		console.error('AI Social post generation error:', error);
		return new Response(JSON.stringify({
			error: 'Internal server error during social post generation',
			requestId: `req_${Date.now()}`
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
			},
		});
	}
}

// Helper functions
function buildPropertyDescriptionPrompt(data) {
	return `Buat deskripsi properti yang menarik dan SEO-friendly dalam bahasa Indonesia.

Data Properti:
- Kode: ${data.kodeListing || 'N/A'}
- Judul: ${data.judulProperti || 'N/A'}
- Tipe: ${data.jenisProperti}
- Lokasi: ${data.kabupaten}, ${data.provinsi}
- Harga: ${data.hargaProperti || 'N/A'}
- Kamar Tidur: ${data.kamarTidur || 'N/A'}
- Kamar Mandi: ${data.kamarMandi || 'N/A'}
- Luas Tanah: ${data.luasTanah ? `${data.luasTanah} m²` : 'N/A'}
- Luas Bangunan: ${data.luasBangunan ? `${data.luasBangunan} m²` : 'N/A'}
- Legalitas: ${data.legalitas || 'N/A'}

Instruksi:
- Buat deskripsi 200-400 kata yang persuasif
- Sertakan keyword SEO: ${data.kabupaten}, ${data.jenisProperti}, dijual, ${data.provinsi}
- Gunakan bahasa yang mengalir dan profesional
- Sebutkan keunggulan properti
- Akhiri dengan call-to-action untuk menghubungi
- Format: plain text dengan paragraf yang jelas

Deskripsi:`;
}

function cleanAndFormatDescription(content) {
	return content
		.trim()
		.replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
		.replace(/^\s*[-•*]\s*/gm, '') // Remove bullet points
		.replace(/\s+/g, ' ') // Normalize spaces
		.trim();
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
				...getCORSHeaders(request),
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
					...getCORSHeaders(request),
				},
			});
		}

		// Parse credentials
		let serviceAccountKey;
		try {
			serviceAccountKey = JSON.parse(gaCredentials);
		} catch (error) {
			console.error('Invalid GA4 credentials format, using fallback data');
			// Return fallback data instead of error
			const fallbackResponse = {
				period: {
					startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
					endDate: new Date().toISOString().split('T')[0],
					days: 30
				},
				metrics: {
					totalUsers: Math.floor(Math.random() * 100) + 50,
					sessions: Math.floor(Math.random() * 200) + 100,
					pageViews: Math.floor(Math.random() * 500) + 200,
					bounceRate: (Math.random() * 0.3 + 0.4).toFixed(2),
					avgSessionDuration: (Math.random() * 300 + 100).toFixed(2)
				},
				charts: {
					pageViews: Array.from({length: 30}, (_, i) => ({
						date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
						views: Math.floor(Math.random() * 50) + 10
					})),
					topPages: [
						{page: '/', views: Math.floor(Math.random() * 100) + 50},
						{page: '/properties', views: Math.floor(Math.random() * 80) + 30},
						{page: '/about', views: Math.floor(Math.random() * 60) + 20}
					],
					trafficSources: [
						{name: 'Direct', value: Math.floor(Math.random() * 40) + 30},
						{name: 'Organic Search', value: Math.floor(Math.random() * 30) + 20},
						{name: 'Social Media', value: Math.floor(Math.random() * 20) + 10}
					],
					demographics: {
						age: [
							{age: '18-24', users: Math.floor(Math.random() * 20) + 5},
							{age: '25-34', users: Math.floor(Math.random() * 30) + 10},
							{age: '35-44', users: Math.floor(Math.random() * 25) + 8},
							{age: '45-54', users: Math.floor(Math.random() * 15) + 3},
							{age: '55-64', users: Math.floor(Math.random() * 10) + 2}
						],
						gender: [
							{gender: 'male', users: Math.floor(Math.random() * 40) + 20},
							{gender: 'female', users: Math.floor(Math.random() * 35) + 15}
						]
					},
					geography: {
						countries: [
							{country: 'Indonesia', users: Math.floor(Math.random() * 60) + 30},
							{country: 'Malaysia', users: Math.floor(Math.random() * 15) + 5},
							{country: 'Singapore', users: Math.floor(Math.random() * 10) + 3}
						],
						cities: [
							{city: 'Jakarta', users: Math.floor(Math.random() * 25) + 10},
							{city: 'Yogyakarta', users: Math.floor(Math.random() * 20) + 8},
							{city: 'Surabaya', users: Math.floor(Math.random() * 15) + 5}
						]
					}
				},
				lastUpdated: new Date().toISOString(),
				note: 'Using demo data - GA4 not configured'
			};

			return new Response(JSON.stringify(fallbackResponse), {
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
					'Cache-Control': 'no-cache'
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
		const [pageViewsReport, topPagesReport, trafficSourcesReport, realtimeReport, ageReport, genderReport, countryReport, cityReport] = await Promise.all([
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
			}),

			// Demographics: Age
			analyticsData.properties.runReport({
				property: `properties/${gaPropertyId}`,
				requestBody: {
					dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
					dimensions: [{ name: 'userAgeBracket' }],
					metrics: [{ name: 'totalUsers' }],
					orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }]
				}
			}),

			// Demographics: Gender
			analyticsData.properties.runReport({
				property: `properties/${gaPropertyId}`,
				requestBody: {
					dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
					dimensions: [{ name: 'userGender' }],
					metrics: [{ name: 'totalUsers' }],
					orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }]
				}
			}),

			// Geography: Countries
			analyticsData.properties.runReport({
				property: `properties/${gaPropertyId}`,
				requestBody: {
					dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
					dimensions: [{ name: 'country' }],
					metrics: [{ name: 'totalUsers' }],
					orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
					limit: 10
				}
			}),

			// Geography: Cities
			analyticsData.properties.runReport({
				property: `properties/${gaPropertyId}`,
				requestBody: {
					dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
					dimensions: [{ name: 'city' }],
					metrics: [{ name: 'totalUsers' }],
					orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
					limit: 10
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

		// Process demographics data
		const ageData = ageReport.data.rows?.map(row => ({
			age: row.dimensionValues[0].value,
			users: parseInt(row.metricValues[0].value)
		})) || [];

		const genderData = genderReport.data.rows?.map(row => ({
			gender: row.dimensionValues[0].value,
			users: parseInt(row.metricValues[0].value)
		})) || [];

		// Process geography data
		const countriesData = countryReport.data.rows?.map(row => ({
			country: row.dimensionValues[0].value,
			users: parseInt(row.metricValues[0].value)
		})) || [];

		const citiesData = cityReport.data.rows?.map(row => ({
			city: row.dimensionValues[0].value,
			users: parseInt(row.metricValues[0].value)
		})) || [];

		// Debug logging
		console.log('📊 Demographics data processed:');
		console.log('  - Age data:', ageData.length, 'entries');
		console.log('  - Gender data:', genderData.length, 'entries');
		console.log('📊 Geography data processed:');
		console.log('  - Countries data:', countriesData.length, 'entries');
		console.log('  - Cities data:', citiesData.length, 'entries');

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
				trafficSources: trafficSourcesData,
				demographics: {
					age: ageData,
					gender: genderData
				},
				geography: {
					countries: countriesData,
					cities: citiesData
				}
			},
			lastUpdated: new Date().toISOString()
		};

		console.log(`✅ Analytics data fetched successfully for ${days} days`);

		return new Response(JSON.stringify(analyticsResponse), {
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
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
				trafficSources: [],
				demographics: {
					age: [],
					gender: []
				},
				geography: {
					countries: [],
					cities: []
				}
			},
			error: error.message,
			lastUpdated: new Date().toISOString()
		};

		return new Response(JSON.stringify(fallbackResponse), {
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
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
				...getCORSHeaders(request),
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
						...getCORSHeaders(request),
					},
				}
			);
		}

		// Enhanced file validation
		console.log('Received file for upload:', {
			name: file.name,
			size: file.size,
			type: file.type,
			propertyId: propertyId
		});

		// Validate file size
		if (file.size === 0) {
			return new Response(
				JSON.stringify({ error: 'File is empty' }),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
						...getCORSHeaders(request),
					},
				}
			);
		}

		if (file.size > 10 * 1024 * 1024) { // 10MB limit
			return new Response(
				JSON.stringify({ error: 'File too large (max 10MB)' }),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
						...getCORSHeaders(request),
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
		// For development, we need to use a publicly accessible URL
		// Since R2 development bucket is not publicly accessible, we'll use production domain
		// In production deployment, this should use the actual production CDN
		const publicDomain = 'https://images.salambumi.xyz';
		const timestamp = Date.now();

		// --- UPLOAD KE CLOUDFLARE IMAGES UNTUK OPTIMASI ---
		const cfFormData = new FormData();
		cfFormData.append('file', file);
		cfFormData.append('requireSignedURLs', 'false');

		// Metadata untuk SEO dan organisasi
		const metadata = {
			propertyId: propertyId,
			uploadedAt: new Date().toISOString(),
			originalName: file.name,
			fileSize: file.size
		};

		// Upload to Cloudflare Images
		const cfImagesResponse = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/images/v1`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${env.CF_IMAGES_TOKEN}`,
				},
				body: cfFormData,
			}
		);

		if (!cfImagesResponse.ok) {
			const errorData = await cfImagesResponse.json();
			console.error('Cloudflare Images upload failed:', errorData);
			throw new Error(`Image upload failed: ${errorData.errors?.[0]?.message || 'Unknown error'}`);
		}

		const cfResult = await cfImagesResponse.json();
		const imageId = cfResult.result.id;

		console.log('Image uploaded to Cloudflare Images:', imageId);

		// --- SIMPAN FILE ASLI KE R2 SEBAGAI BACKUP ---
		const originalKey = `images/${propertyId}/${timestamp}-original.${ext}`;

		await env.IMAGES_BUCKET.put(originalKey, file, {
			httpMetadata: { contentType: file.type || `image/${ext}` },
		});

		console.log('File backup saved to R2');

		// --- RETURN CLOUDFLARE IMAGES URL DENGAN WebP CONVERSION ---
		// Cloudflare Images otomatis serve WebP jika browser support dengan format=auto
		const imageUrl = `https://imagedelivery.net/${env.CF_ACCOUNT_ID}/${imageId}/public`;

		// Untuk variants responsive, gunakan transform parameters dengan auto format
		const imageVariants = {
			thumbnail: `https://imagedelivery.net/${env.CF_ACCOUNT_ID}/${imageId}/w=300,sharpen=1,format=auto`,
			small: `https://imagedelivery.net/${env.CF_ACCOUNT_ID}/${imageId}/w=600,sharpen=1,format=auto`,
			medium: `https://imagedelivery.net/${env.CF_ACCOUNT_ID}/${imageId}/w=800,sharpen=1,format=auto`,
			large: `https://imagedelivery.net/${env.CF_ACCOUNT_ID}/${imageId}/w=1200,sharpen=1,format=auto`,
			original: imageUrl
		};

		// Variants untuk responsive images
		const variants = {
			thumbnail: `https://imagedelivery.net/${env.CF_ACCOUNT_ID}/${imageId}/w=300,sharpen=1`,
			small: `https://imagedelivery.net/${env.CF_ACCOUNT_ID}/${imageId}/w=600,sharpen=1`,
			medium: `https://imagedelivery.net/${env.CF_ACCOUNT_ID}/${imageId}/w=800,sharpen=1`,
			large: `https://imagedelivery.net/${env.CF_ACCOUNT_ID}/${imageId}/w=1200,sharpen=1`,
			original: imageUrl
		};

		console.log('Generated image URL:', imageUrl);

		return new Response(JSON.stringify({
			success: true,
			url: variants.medium, // Default medium size
			originalUrl: variants.original,
			variants: variants,
			propertyId: propertyId,
			imageId: imageId,
			metadata: metadata
		}), {
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
			},
		});
	} catch (error) {
		console.error('Worker error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
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
					...getCORSHeaders(request),
				},
			});
		}

		// Parse service account key
		let credentials;
		try {
			credentials = JSON.parse(serviceAccountKey);
		} catch (error) {
			console.error('Invalid Search Console credentials, using fallback data');
			// Return fallback data instead of error
			const fallbackResponse = {
				period: {
					startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
					endDate: new Date().toISOString().split('T')[0],
					days: 30
				},
				summary: {
					totalClicks: Math.floor(Math.random() * 500) + 100,
					totalImpressions: Math.floor(Math.random() * 5000) + 1000,
					averageCTR: (Math.random() * 0.1 + 0.02).toFixed(4),
					averagePosition: (Math.random() * 20 + 5).toFixed(1)
				},
				topQueries: Array.from({length: 10}, (_, i) => ({
					query: ['kost yogyakarta', 'rumah dijual', 'apartemen sewa', 'tanah kavling', 'ruko strategis'][i % 5] + (i > 4 ? ` ${i}` : ''),
					clicks: Math.floor(Math.random() * 50) + 5,
					impressions: Math.floor(Math.random() * 500) + 50,
					ctr: (Math.random() * 0.15 + 0.01).toFixed(4),
					position: (Math.random() * 15 + 1).toFixed(1)
				})),
				topPages: Array.from({length: 10}, (_, i) => ({
					page: ['/', '/properties', '/about', '/contact', '/blog'][i % 5] + (i > 4 ? `/${i}` : ''),
					clicks: Math.floor(Math.random() * 30) + 3,
					impressions: Math.floor(Math.random() * 300) + 30,
					ctr: (Math.random() * 0.12 + 0.01).toFixed(4),
					position: (Math.random() * 12 + 1).toFixed(1)
				})),
				deviceBreakdown: [
					{device: 'desktop', clicks: Math.floor(Math.random() * 200) + 50, impressions: Math.floor(Math.random() * 2000) + 500},
					{device: 'mobile', clicks: Math.floor(Math.random() * 250) + 75, impressions: Math.floor(Math.random() * 2500) + 750},
					{device: 'tablet', clicks: Math.floor(Math.random() * 50) + 10, impressions: Math.floor(Math.random() * 500) + 100}
				],
				countryBreakdown: [
					{country: 'Indonesia', clicks: Math.floor(Math.random() * 400) + 100, impressions: Math.floor(Math.random() * 4000) + 1000},
					{country: 'Malaysia', clicks: Math.floor(Math.random() * 50) + 10, impressions: Math.floor(Math.random() * 500) + 100},
					{country: 'Singapore', clicks: Math.floor(Math.random() * 30) + 5, impressions: Math.floor(Math.random() * 300) + 50}
				],
				lastUpdated: new Date().toISOString(),
				note: 'Using demo data - Search Console not configured'
			};

			return new Response(JSON.stringify(fallbackResponse), {
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
					'Cache-Control': 'no-cache'
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
				...getCORSHeaders(request),
				'Cache-Control': 'no-cache'
			},
		});

	} catch (error) {
		console.error('Search Console API error:', error);

		// Always return JSON response, never HTML
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
			error: error.message || 'Search Console API unavailable',
			lastUpdated: new Date().toISOString()
		};

		return new Response(JSON.stringify(fallbackResponse), {
			status: 200, // Always return 200 to prevent HTML error pages
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
				'Cache-Control': 'no-cache'
			},
		});
	}
}

// Handle lead capture
async function handleLeadCapture(request, env) {
	// CORS handling
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				...getCORSHeaders(request),
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				'Access-Control-Max-Age': '86400',
			},
		});
	}

	if (request.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 });
	}

	try {
		const rawData = await request.json();
		const { user_intent, whatsapp, ip_address, user_agent, page_url, referrer, session_id } = rawData;

		// Sanitize and validate inputs
		let sanitizedIntent, sanitizedWhatsapp, sanitizedPageUrl, sanitizedReferrer, sanitizedSessionId;

		try {
			sanitizedIntent = sanitizeString(user_intent, 500);
			sanitizedWhatsapp = sanitizePhoneNumber(whatsapp);
			sanitizedPageUrl = sanitizeString(page_url || '', 500);
			sanitizedReferrer = sanitizeString(referrer || '', 500);
			sanitizedSessionId = sanitizeString(session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 100);
		} catch (validationError) {
			return new Response(JSON.stringify({
				error: `Validation error: ${validationError.message}`
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			});
		}

		// Validate required fields
		if (!sanitizedIntent || !sanitizedWhatsapp) {
			return new Response(JSON.stringify({
				error: 'Missing required fields: user_intent and whatsapp'
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			});
		}

		// Get Supabase credentials
		const supabaseUrl = env.SUPABASE_URL;
		const supabaseKey = env.SUPABASE_ANON_KEY;

		if (!supabaseUrl || !supabaseKey) {
			console.error('Supabase configuration missing');
			return new Response(JSON.stringify({ error: 'Database configuration error' }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			});
		}

		// Prepare lead data with sanitized inputs
		const leadData = {
			user_intent: sanitizedIntent,
			whatsapp: sanitizedWhatsapp,
			ip_address: sanitizeString(ip_address || request.headers.get('CF-Connecting-IP') || 'unknown', 45),
			user_agent: sanitizeString(user_agent || request.headers.get('User-Agent') || 'unknown', 500),
			page_url: sanitizedPageUrl,
			referrer: sanitizedReferrer,
			session_id: sanitizedSessionId,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		console.log('📝 Capturing lead:', {
			intent: user_intent,
			whatsapp: leadData.whatsapp.substring(0, 3) + '***' + leadData.whatsapp.substring(leadData.whatsapp.length - 3),
			session_id: leadData.session_id
		});

		// Insert to Supabase
		const response = await fetch(`${supabaseUrl}/rest/v1/lead_captures`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${supabaseKey}`,
				'apikey': supabaseKey,
				'Content-Type': 'application/json',
				'Prefer': 'return=minimal'
			},
			body: JSON.stringify(leadData)
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Supabase insert error:', response.status, errorText);
			return new Response(JSON.stringify({
				error: 'Failed to save lead data',
				details: errorText
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			});
		}

		console.log('✅ Lead captured successfully');

		return new Response(JSON.stringify({
			success: true,
			message: 'Lead captured successfully',
			session_id: leadData.session_id
		}), {
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
		});

	} catch (error) {
		console.error('Lead capture error:', error);
		return new Response(JSON.stringify({
			error: 'Internal server error during lead capture'
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
		});
	}
}

// Handle get leads (admin dashboard)
async function handleGetLeads(request, env) {
	// CORS handling
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				...getCORSHeaders(request),
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				'Access-Control-Max-Age': '86400',
			},
		});
	}

	if (request.method !== 'GET') {
		return new Response('Method not allowed', { status: 405 });
	}

	try {
		// Get Supabase credentials
		const supabaseUrl = env.SUPABASE_URL;
		const supabaseKey = env.SUPABASE_ANON_KEY;

		if (!supabaseUrl || !supabaseKey) {
			console.error('Supabase configuration missing');
			return new Response(JSON.stringify({ error: 'Database configuration error' }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			});
		}

		// Parse query parameters
		const url = new URL(request.url);
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const offset = (page - 1) * limit;

		console.log('📊 Fetching leads:', { page, limit, offset });

		// Fetch leads from Supabase
		const response = await fetch(`${supabaseUrl}/rest/v1/lead_captures?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`, {
			headers: {
				'Authorization': `Bearer ${supabaseKey}`,
				'apikey': supabaseKey,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Supabase fetch error:', response.status, errorText);
			return new Response(JSON.stringify({
				error: 'Failed to fetch leads',
				details: errorText
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...getCORSHeaders(request),
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			});
		}

		const leads = await response.json();

		// Get total count for pagination
		const countResponse = await fetch(`${supabaseUrl}/rest/v1/lead_captures?select=id&count=exact`, {
			headers: {
				'Authorization': `Bearer ${supabaseKey}`,
				'apikey': supabaseKey,
				'Content-Type': 'application/json',
			},
		});

		const totalCount = countResponse.headers.get('content-range')?.split('/')[1] || '0';

		console.log(`✅ Fetched ${leads.length} leads (total: ${totalCount})`);

		return new Response(JSON.stringify({
			leads,
			pagination: {
				page,
				limit,
				total: parseInt(totalCount),
				totalPages: Math.ceil(parseInt(totalCount) / limit)
			}
		}), {
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				'Cache-Control': 'no-cache'
			},
		});

	} catch (error) {
		console.error('Get leads error:', error);
		return new Response(JSON.stringify({
			error: 'Internal server error during lead fetch'
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
					...getCORSHeaders(request),
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
					...getCORSHeaders(request),
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
				...getCORSHeaders(request),
				'Cache-Control': 'no-cache'
			},
		});

	} catch (error) {
		console.error('PageSpeed Insights error:', error);

		// Always return JSON response, never HTML
		const fallbackResponse = {
			url: targetUrl || 'https://salambumi.xyz',
			categories: {
				performance: { score: null, title: 'Performance - API Not Configured' },
				accessibility: { score: null, title: 'Accessibility - API Not Configured' },
				'best-practices': { score: null, title: 'Best Practices - API Not Configured' },
				seo: { score: null, title: 'SEO - API Not Configured' }
			},
			coreWebVitals: {
				lcp: 'API Not Configured',
				fid: 'API Not Configured',
				cls: 'API Not Configured',
				fcp: 'API Not Configured',
				ttfb: 'API Not Configured'
			},
			loadingExperience: {},
			originLoadingExperience: {},
			error: 'PageSpeed API key not configured. Please set PAGESPEED_API_KEY environment variable.',
			lastUpdated: new Date().toISOString()
		};

		return new Response(JSON.stringify(fallbackResponse), {
			status: 200, // Always return 200 to prevent HTML error pages
			headers: {
				'Content-Type': 'application/json',
				...getCORSHeaders(request),
				'Cache-Control': 'no-cache'
			},
		});
	}
}
