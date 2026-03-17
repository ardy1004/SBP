/**
 * OpenAPI 3.0 Specification for Salam Bumi Property API
 * Generated using swagger-jsdoc
 */

// Static OpenAPI 3.0 specification for Salam Bumi Property API
const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Salam Bumi Property API',
    version: '1.0.0',
    description: 'Comprehensive API for Salam Bumi Property real estate platform',
    contact: {
      name: 'Salam Bumi Property',
      email: 'admin@salambumi.xyz',
      url: 'https://salambumi.xyz'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'https://salambumi.xyz',
      description: 'Production server'
    },
    {
      url: 'http://localhost:5173',
      description: 'Development server'
    }
  ],
  paths: {
    '/api/chat': {
      post: {
        summary: 'AI Chat for property inquiries',
        description: 'Interactive AI chatbot for property-related questions and inquiries',
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
                    items: { $ref: '#/components/schemas/ChatMessage' },
                    description: 'Array of chat messages'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Chat response generated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    response: {
                      type: 'string',
                      description: 'AI-generated response'
                    }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          503: { $ref: '#/components/responses/ServiceUnavailable' }
        }
      }
    },
    '/api/generate-description': {
      post: {
        summary: 'Generate AI-powered property descriptions',
        description: 'Uses AI to generate compelling property descriptions and titles for real estate listings',
        tags: ['AI', 'Content Generation'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Current property title' },
                  type: { type: 'string', description: 'Property type (rumah, apartemen, etc.)' },
                  status: { type: 'string', enum: ['dijual', 'disewakan'], description: 'Property status' },
                  price: { type: 'number', description: 'Property price' },
                  land_area: { type: 'number', description: 'Land area in m²' },
                  building_area: { type: 'number', description: 'Building area in m²' },
                  bedrooms: { type: 'integer', description: 'Number of bedrooms' },
                  bathrooms: { type: 'integer', description: 'Number of bathrooms' },
                  legal: { type: 'string', description: 'Legal status' },
                  location: {
                    type: 'object',
                    properties: {
                      province: { type: 'string', description: 'Province name' },
                      district: { type: 'string', description: 'District/City name' }
                    }
                  },
                  old_description: { type: 'string', description: 'Existing description to improve' },
                  model: { type: 'string', description: 'AI model to use', default: 'gemini-2.0-flash-exp' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'AI-generated content',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ai_title: { type: 'string', description: 'Generated title' },
                    ai_description: { type: 'string', description: 'Generated description' },
                    keywords: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Extracted keywords'
                    },
                    is_generated: { type: 'boolean', description: 'Whether new content was generated' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          503: { $ref: '#/components/responses/ServiceUnavailable' }
        }
      }
    },
    '/api/analytics': {
      get: {
        summary: 'Get Google Analytics 4 data',
        description: 'Fetches comprehensive analytics data including user metrics, page views, demographics, and geography',
        tags: ['Analytics'],
        parameters: [
          {
            in: 'query',
            name: 'days',
            schema: { type: 'integer', default: 30, minimum: 1, maximum: 365 },
            description: 'Number of days to analyze (default 30)'
          }
        ],
        responses: {
          200: {
            description: 'Analytics data retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AnalyticsData' }
              }
            }
          },
          503: { $ref: '#/components/responses/ServiceUnavailable' }
        }
      }
    },
    '/api/leads': {
      post: {
        summary: 'Capture lead information',
        description: 'Records user inquiries and contact information for property leads',
        tags: ['Leads', 'CRM'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['user_intent', 'whatsapp'],
                properties: {
                  user_intent: { type: 'string', maxLength: 500, description: 'User inquiry message' },
                  whatsapp: { type: 'string', pattern: '^\\+62[8-9]\\d{7,11}$', description: 'Indonesian WhatsApp number' },
                  ip_address: { type: 'string', description: 'User IP address (auto-detected)' },
                  user_agent: { type: 'string', description: 'Browser user agent (auto-detected)' },
                  page_url: { type: 'string', format: 'uri', description: 'Page where lead was captured' },
                  referrer: { type: 'string', format: 'uri', description: 'Referrer URL' },
                  session_id: { type: 'string', description: 'Session identifier (auto-generated)' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Lead captured successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Lead captured successfully' },
                    session_id: { type: 'string', description: 'Session identifier' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/InternalServerError' }
        }
      }
    },
    '/upload': {
      post: {
        summary: 'Upload property images',
        description: 'Uploads images to Cloudflare Images with automatic optimization and multiple size variants',
        tags: ['Media', 'Upload'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image', 'propertyId'],
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file (JPG, PNG, GIF, WebP) - max 10MB'
                  },
                  propertyId: { type: 'string', description: 'Property identifier for organization' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Image uploaded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    url: { type: 'string', format: 'uri', description: 'Optimized image URL' },
                    originalUrl: { type: 'string', format: 'uri', description: 'Original image URL' },
                    variants: {
                      type: 'object',
                      properties: {
                        thumbnail: { type: 'string', format: 'uri', description: '300px thumbnail' },
                        small: { type: 'string', format: 'uri', description: '600px version' },
                        medium: { type: 'string', format: 'uri', description: '800px version' },
                        large: { type: 'string', format: 'uri', description: '1200px version' }
                      }
                    },
                    propertyId: { type: 'string', description: 'Associated property ID' },
                    imageId: { type: 'string', description: 'Cloudflare Images ID' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          413: { description: 'File too large' },
          500: { $ref: '#/components/responses/InternalServerError' }
        }
      }
    },
    '/api/health': {
      get: {
        summary: 'System health check',
        description: 'Comprehensive health check for all system services and dependencies',
        tags: ['System', 'Monitoring'],
        responses: {
          200: {
            description: 'System is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['healthy', 'degraded'] },
                    timestamp: { type: 'string', format: 'date-time' },
                    version: { type: 'string' },
                    environment: { type: 'string' },
                    response_time_ms: { type: 'integer' },
                    services: {
                      type: 'object',
                      properties: {
                        database: { type: 'string', enum: ['healthy', 'unhealthy', 'error'] },
                        ai_api: { type: 'string', enum: ['healthy', 'unhealthy', 'error'] },
                        cloudflare_images: { type: 'string', enum: ['healthy', 'unhealthy', 'error'] },
                        rate_limiting: { type: 'string', example: 'active' },
                        cors: { type: 'string', example: 'configured' }
                      }
                    }
                  }
                }
              }
            }
          },
          503: { description: 'System is degraded or unhealthy' }
        }
      }
    },
    '/api/docs': {
      get: {
        summary: 'Get OpenAPI specification',
        description: 'Returns the complete OpenAPI 3.0 specification for the Salam Bumi Property API',
        tags: ['Documentation'],
        responses: {
          200: {
            description: 'OpenAPI specification',
            content: {
              'application/json': {
                schema: { type: 'object', description: 'Complete OpenAPI 3.0 specification' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Error message' },
          message: { type: 'string', description: 'Detailed error message' },
          timestamp: { type: 'string', format: 'date-time', description: 'Error timestamp' }
        }
      },
      Article: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Article unique identifier' },
          title: { type: 'string', description: 'Article title' },
          slug: { type: 'string', description: 'URL-friendly slug' },
          content: { type: 'string', description: 'Article content (HTML/Markdown)' },
          excerpt: { type: 'string', description: 'Article excerpt/summary' },
          thumbnail: { type: 'string', format: 'uri', description: 'Thumbnail image URL' },
          featured_image_url: { type: 'string', format: 'uri', description: 'Featured image URL' },
          status: { type: 'string', enum: ['draft', 'publish'], description: 'Publication status' },
          author: { type: 'string', description: 'Article author' },
          category: { type: 'string', description: 'Article category' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Article tags' },
          meta_title: { type: 'string', description: 'SEO meta title' },
          meta_description: { type: 'string', description: 'SEO meta description' },
          seo_title: { type: 'string', description: 'SEO optimized title' },
          seo_description: { type: 'string', description: 'SEO optimized description' },
          focus_keyword: { type: 'string', description: 'SEO focus keyword' },
          reading_time_minutes: { type: 'integer', description: 'Estimated reading time' },
          schema_json: { type: 'string', description: 'JSON-LD schema markup' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          published_at: { type: 'string', format: 'date-time' }
        }
      },
      Property: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          kode_listing: { type: 'string', description: 'Property listing code' },
          judul_properti: { type: 'string', description: 'Property title' },
          jenis_properti: { type: 'string', description: 'Property type' },
          harga_properti: { type: 'number', description: 'Property price' },
          kamar_tidur: { type: 'integer', description: 'Number of bedrooms' },
          kamar_mandi: { type: 'integer', description: 'Number of bathrooms' },
          luas_tanah: { type: 'number', description: 'Land area in m²' },
          luas_bangunan: { type: 'number', description: 'Building area in m²' },
          kabupaten: { type: 'string', description: 'District/City' },
          provinsi: { type: 'string', description: 'Province' },
          deskripsi: { type: 'string', description: 'Property description' },
          image_url: { type: 'string', format: 'uri', description: 'Main image URL' },
          image_url1: { type: 'string', format: 'uri', description: 'Additional image 1' },
          image_url2: { type: 'string', format: 'uri', description: 'Additional image 2' },
          image_url3: { type: 'string', format: 'uri', description: 'Additional image 3' },
          image_url4: { type: 'string', format: 'uri', description: 'Additional image 4' },
          status: { type: 'string', enum: ['dijual', 'disewakan'] },
          legalitas: { type: 'string', description: 'Legal status' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      Lead: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          user_intent: { type: 'string', description: 'User inquiry message' },
          whatsapp: { type: 'string', description: 'WhatsApp contact number' },
          ip_address: { type: 'string', description: 'User IP address' },
          user_agent: { type: 'string', description: 'Browser user agent' },
          page_url: { type: 'string', format: 'uri', description: 'Page where lead was captured' },
          referrer: { type: 'string', format: 'uri', description: 'Referrer URL' },
          session_id: { type: 'string', description: 'Session identifier' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      ChatMessage: {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['user', 'assistant'], description: 'Message role' },
          content: { type: 'string', description: 'Message content' }
        }
      },
      AnalyticsData: {
        type: 'object',
        properties: {
          period: {
            type: 'object',
            properties: {
              startDate: { type: 'string', format: 'date' },
              endDate: { type: 'string', format: 'date' },
              days: { type: 'integer' }
            }
          },
          metrics: {
            type: 'object',
            properties: {
              totalUsers: { type: 'integer' },
              sessions: { type: 'integer' },
              pageViews: { type: 'integer' },
              bounceRate: { type: 'string' },
              avgSessionDuration: { type: 'string' }
            }
          },
          charts: {
            type: 'object',
            properties: {
              pageViews: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    date: { type: 'string', format: 'date' },
                    views: { type: 'integer' }
                  }
                }
              },
              topPages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    page: { type: 'string' },
                    views: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Invalid input data',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      InternalServerError: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      ServiceUnavailable: {
        description: 'Service unavailable',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    }
  },
  tags: [
    { name: 'AI', description: 'Artificial Intelligence services' },
    { name: 'Analytics', description: 'Google Analytics 4 data' },
    { name: 'Articles', description: 'Blog article management' },
    { name: 'Chat', description: 'AI chatbot functionality' },
    { name: 'Content Generation', description: 'AI-powered content creation' },
    { name: 'CRM', description: 'Customer Relationship Management' },
    { name: 'Documentation', description: 'API documentation' },
    { name: 'Leads', description: 'Lead capture and management' },
    { name: 'Media', description: 'File upload and media management' },
    { name: 'Monitoring', description: 'System monitoring and health checks' },
    { name: 'System', description: 'System-level operations' },
    { name: 'Upload', description: 'File upload operations' }
  ]
};

module.exports = spec;