import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCORSHeaders, checkRateLimit, getEnvVar } from './_lib/utils';
import formidable from 'formidable';
import fs from 'fs';
import sharp from 'sharp';

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Cloudflare Configuration
const CF_ACCOUNT_ID = () => getEnvVar('CF_ACCOUNT_ID');
const CF_IMAGES_TOKEN = () => getEnvVar('CF_IMAGES_TOKEN');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  const origin = req.headers.origin || req.headers.Origin || null;
  const corsHeaders = getCORSHeaders(origin);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIP = (req.headers['x-forwarded-for'] as string) || 
                   (req.headers['x-real-ip'] as string) || 
                   'unknown';
  const rateLimitResult = checkRateLimit(String(clientIP).split(',')[0].trim(), '/upload', 'IMAGE_UPLOAD');
  
  if (!rateLimitResult.allowed) {
    const retryAfter = rateLimitResult.resetTime ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) : 60;
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
      retryAfter
    });
  }

  // Check Cloudflare Images configuration
  const cfAccountId = CF_ACCOUNT_ID();
  const cfImagesToken = CF_IMAGES_TOKEN();

  if (!cfAccountId || !cfImagesToken) {
    console.error('Cloudflare Images configuration missing');
    return res.status(500).json({ 
      error: 'Image upload service not configured',
      details: 'Missing CF_ACCOUNT_ID or CF_IMAGES_TOKEN. Please set these environment variables in Vercel.'
    });
  }

  try {
    // Parse form data using formidable
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      allowEmptyFiles: false,
    });

    // Parse the form
    const [fields, files] = await new Promise<any>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.image?.[0] || files.file?.[0];
    const propertyId = fields.propertyId?.[0] || 'general';

    if (!file) {
      return res.status(400).json({ error: 'Missing file' });
    }

    console.log('Received file for upload:', {
      name: file.originalFilename,
      size: file.size,
      type: file.mimetype,
      propertyId
    });

    // Validate file size
    if (file.size === 0) {
      return res.status(400).json({ error: 'File is empty' });
    }

    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported file type. Allowed: JPG, PNG, GIF, WebP' });
    }

    // Read file
    const fileBuffer = fs.readFileSync(file.filepath);

    // ========================================
    // STEP 1: Convert to WebP using Sharp
    // ========================================
    console.log('Converting image to WebP format...');
    
    const webpBuffer = await sharp(fileBuffer)
      .webp({ 
        quality: 85, // Good quality with reasonable file size
        effort: 6,   // Balance between compression and speed
      })
      .toBuffer();

    const compressionRatio = ((1 - webpBuffer.length / file.size) * 100).toFixed(1);
    console.log(`Image converted: ${file.size} bytes -> ${webpBuffer.length} bytes (WebP, ${compressionRatio}% smaller)`);

    // ========================================
    // STEP 2: Generate unique image ID
    // ========================================
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const imageId = `prop-${propertyId}-${timestamp}-${randomId}`;

    // ========================================
    // STEP 3: Upload to Cloudflare Images
    // ========================================
    console.log('Uploading to Cloudflare Images...');
    
    // Convert Buffer to Uint8Array for compatibility with FormData
    const uint8Array = new Uint8Array(webpBuffer);
    const blob = new Blob([uint8Array], { type: 'image/webp' });
    
    const cfFormData = new FormData();
    cfFormData.append('file', blob, `${imageId}.webp`);
    cfFormData.append('id', imageId);
    cfFormData.append('metadata', JSON.stringify({
      propertyId,
      originalName: file.originalFilename,
      uploadedAt: new Date().toISOString(),
    }));
    
    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfImagesToken}`,
        },
        body: cfFormData,
      }
    );

    // Clean up temp file
    try { 
      fs.unlinkSync(file.filepath); 
    } catch (e) { 
      console.warn('Failed to clean up temp file:', e);
    }

    if (!cfResponse.ok) {
      const errorText = await cfResponse.text();
      console.error('Cloudflare Images upload failed:', cfResponse.status, errorText);
      return res.status(500).json({ 
        error: 'Failed to upload image',
        details: `Cloudflare Images API error: ${cfResponse.status}`,
        response: errorText
      });
    }

    const cfResult = await cfResponse.json();
    const uploadedImageId = cfResult.result?.id || imageId;
    
    // ========================================
    // STEP 4: Generate URLs
    // ========================================
    // Cloudflare Images URL format: https://imagedelivery.net/{account_id}/{image_id}/{variant}
    const baseUrl = `https://imagedelivery.net/${cfAccountId}/${uploadedImageId}`;
    
    const imageUrl = `${baseUrl}/public`;
    const variants = {
      thumbnail: `${baseUrl}/w=300,format=auto`,    // 300px width, auto format (WebP)
      small: `${baseUrl}/w=600,format=auto`,        // 600px width
      medium: `${baseUrl}/w=800,format=auto`,       // 800px width
      large: `${baseUrl}/w=1200,format=auto`,       // 1200px width
      original: imageUrl,
    };

    console.log('Image uploaded successfully:', imageUrl);

    return res.status(200).json({
      success: true,
      url: variants.medium, // Default to medium size
      webpUrl: variants.medium,
      variants,
      propertyId,
      imageId: uploadedImageId,
      format: 'webp',
      originalSize: file.size,
      webpSize: webpBuffer.length,
      compressionRatio: `${compressionRatio}%`,
      metadata: {
        propertyId,
        uploadedAt: new Date().toISOString(),
        originalName: file.originalFilename,
        format: 'webp',
        imageId: uploadedImageId,
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
