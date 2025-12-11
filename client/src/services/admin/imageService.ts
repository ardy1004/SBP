/**
 * Image Service for Blog System
 * Handles image upload, compression, validation, and management
 * Uses Cloudflare R2 storage via Workers (same as property images)
 */

import { toast } from '@/hooks/use-toast';

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

/**
 * Validate image file
 */
export function validateImage(file: File): ImageValidationResult {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Format gambar harus JPG, PNG, WebP, atau GIF'
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Ukuran file maksimal 5MB'
    };
  }

  // Check minimum size (at least 1KB to avoid empty files)
  if (file.size < 1024) {
    return {
      isValid: false,
      error: 'File gambar terlalu kecil atau rusak'
    };
  }

  return { isValid: true };
}

/**
 * Compress and resize image
 */
export async function compressImage(
  file: File,
  options: ImageCompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeMB = 2
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            // Check if compression achieved desired size
            const targetSize = maxSizeMB * 1024 * 1024;
            if (blob.size <= targetSize || quality <= 0.5) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // Try again with lower quality
              canvas.toBlob((blob2) => {
                if (blob2) {
                  const compressedFile = new File([blob2], file.name, {
                    type: file.type,
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  resolve(file); // Fallback
                }
              }, file.type, quality - 0.2);
            }
          } else {
            resolve(file); // Fallback to original
          }
        }, file.type, quality);
      } catch (error) {
        console.error('Canvas compression failed:', error);
        resolve(file); // Fallback to original
      }
    };

    img.onerror = () => {
      console.error('Image load failed during compression');
      resolve(file); // Fallback to original
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check WebP support safely
 */
const checkWebPSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    if (!canvas.getContext || !canvas.getContext('2d')) return false;

    // Test WebP encoding support
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  } catch (error) {
    console.warn('WebP support check failed:', error);
    return false;
  }
};

/**
 * Convert image to WebP with comprehensive error handling
 */
const convertToWebP = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Check WebP support first
    if (!checkWebPSupport()) {
      console.warn('WebP not supported by browser, using original file');
      resolve(file); // Safe fallback to original file
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Add timeout for safety (10 seconds)
    const timeout = setTimeout(() => {
      console.warn('WebP conversion timeout, using original file');
      resolve(file); // Safe fallback
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);

      try {
        // Set canvas size with safety limits to prevent memory issues
        const maxSize = 4096; // Max 4K resolution
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
          console.log('Image resized for WebP conversion:', { original: img.width + 'x' + img.height, resized: width + 'x' + height });
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image to canvas
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to WebP blob
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            const compressionRatio = ((file.size - webpFile.size) / file.size * 100).toFixed(1);
            console.log('WebP conversion successful:', {
              originalSize: file.size,
              webpSize: webpFile.size,
              compressionRatio: compressionRatio + '%',
              dimensions: width + 'x' + height
            });

            resolve(webpFile);
          } else {
            console.warn('WebP conversion produced empty blob, using original file');
            resolve(file); // Safe fallback
          }
        }, 'image/webp', 0.8); // 80% quality
      } catch (error) {
        console.error('Canvas operation failed during WebP conversion:', error);
        clearTimeout(timeout);
        resolve(file); // Safe fallback
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      console.warn('Image failed to load for WebP conversion, using original file');
      resolve(file); // Safe fallback
    };

    // Create object URL safely
    try {
      img.src = URL.createObjectURL(file);
    } catch (error) {
      clearTimeout(timeout);
      console.error('Failed to create object URL for WebP conversion:', error);
      resolve(file); // Safe fallback
    }
  });
};

/**
 * Upload file using Cloudflare Worker (same as property images)
 */
const uploadFileToWorker = async (file: File, articleId?: string, retryCount = 0): Promise<string> => {
  const maxRetries = 3;
  const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s

  try {
    console.log('Converting image to WebP:', file.name);

    // Convert to WebP first
    const webpFile = await convertToWebP(file);
    console.log('WebP conversion successful, new file:', webpFile.name, 'size:', webpFile.size);

    // Always try to upload to worker in production, fallback to data URL if needed
    const isProduction = typeof window !== 'undefined' && window.location.hostname === 'salambumi.xyz';

    if (!isProduction) {
      // For development: Use data URL instead of uploading to avoid cloud dependency
      console.log('Development mode: Using data URL instead of cloud upload');
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(webpFile);
      });
    }

    // Production: Upload to Cloudflare Worker
    const formData = new FormData();
    formData.append('image', webpFile);
    formData.append('propertyId', articleId || 'blog-temp');

    console.log('Uploading WebP file to Cloudflare Worker');

    const workerUrl = 'https://sbp-upload-worker.salambumiproperty-f1b.workers.dev/upload';

    const response = await fetch(workerUrl, {
      method: 'POST',
      body: formData,
      // Add timeout for fetch
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('Worker response status:', response.status);

    if (!response.ok) {
      let errorMessage = `Upload gagal: ${response.status}`;
      try {
        const errorText = await response.text();
        console.error('Worker error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        // Try to parse as JSON for better error messages
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          // If not JSON, use the raw text
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        }
      } catch (readError) {
        console.error('Failed to read error response:', readError);
      }

      // Provide specific error messages for common issues
      if (response.status === 404) {
        errorMessage = 'Worker endpoint tidak ditemukan. Periksa konfigurasi worker.';
      } else if (response.status === 500) {
        errorMessage = 'Terjadi kesalahan di server upload. Coba lagi nanti.';
      } else if (response.status === 0) {
        errorMessage = 'Tidak dapat terhubung ke server upload. Periksa koneksi internet.';
      }

      // Don't retry for client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(errorMessage);
      }

      // Retry for server errors (5xx) or network errors
      if (retryCount < maxRetries) {
        console.log(`Upload failed, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return uploadFileToWorker(file, articleId, retryCount + 1);
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Worker result:', result);

    if (!result.success || !result.url) {
      throw new Error(result.error || 'No image URL returned from worker');
    }

    // Return the full URL from worker
    const imageUrl = result.url;
    console.log('WebP Image URL from worker:', imageUrl);

    return imageUrl;
  } catch (error) {
    // Handle timeout errors
    if (error instanceof Error && error.name === 'TimeoutError') {
      const timeoutMessage = 'Upload timeout. Server membutuhkan waktu terlalu lama untuk merespons.';
      if (retryCount < maxRetries) {
        console.log(`Upload timeout, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return uploadFileToWorker(file, articleId, retryCount + 1);
      }
      throw new Error(timeoutMessage);
    }

    // Handle network errors
    if (error instanceof Error && error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      const networkMessage = 'Gagal terhubung ke server upload. Periksa koneksi internet.';
      if (retryCount < maxRetries) {
        console.log(`Network error, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return uploadFileToWorker(file, articleId, retryCount + 1);
      }
      throw new Error(networkMessage);
    }

    console.error('Upload/WebP conversion error:', error);
    throw error;
  }
};

/**
 * Upload featured image for blog article
 */
export async function uploadFeaturedImage(
  file: File,
  articleId?: string
): Promise<ImageUploadResult> {
  try {
    // Validate
    const validation = validateImage(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Upload using Cloudflare Worker
    const imageUrl = await uploadFileToWorker(file, articleId);

    return {
      success: true,
      url: imageUrl
    };

  } catch (error: any) {
    console.error('Featured image upload failed:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat upload'
    };
  }
}

/**
 * Upload content image for blog article (used in WYSIWYG editor)
 */
export async function uploadContentImage(
  file: File,
  articleId?: string
): Promise<ImageUploadResult> {
  try {
    // Validate
    const validation = validateImage(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Upload using Cloudflare Worker (same as featured images)
    const imageUrl = await uploadFileToWorker(file, articleId);

    return {
      success: true,
      url: imageUrl
    };

  } catch (error: any) {
    console.error('Content image upload failed:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat upload gambar konten'
    };
  }
}

/**
 * Delete image from storage (Cloudflare R2 - not directly accessible)
 * Note: Images are managed by Cloudflare R2, deletion requires API call
 */
export async function deleteImage(path: string): Promise<boolean> {
  // For now, just log the request
  // In production, this would need a Cloudflare Worker endpoint for deletion
  console.log('Image deletion requested for:', path);
  console.warn('Image deletion not implemented for Cloudflare R2 storage');
  return false;
}

/**
 * Get image URL from storage path (Cloudflare R2 URLs are returned directly from upload)
 */
export function getImageUrl(path: string): string {
  // Since we get full URLs from Cloudflare Worker, this function is not needed
  // But keeping it for compatibility
  console.warn('getImageUrl not needed with Cloudflare R2 - URLs are returned directly from upload');
  return path; // Assume path is already a full URL
}

/**
 * Get image metadata (dimensions, size, etc.)
 */
export async function getImageMetadata(file: File): Promise<{
  width: number;
  height: number;
  size: number;
  type: string;
} | null> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type
      });
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Batch upload multiple images
 */
export async function uploadMultipleImages(
  files: File[],
  type: 'featured' | 'content' = 'content',
  articleId?: string
): Promise<ImageUploadResult[]> {
  const results: ImageUploadResult[] = [];

  for (const file of files) {
    try {
      let result: ImageUploadResult;

      if (type === 'featured') {
        result = await uploadFeaturedImage(file, articleId);
      } else {
        result = await uploadContentImage(file, articleId);
      }

      results.push(result);

      // Add small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      results.push({
        success: false,
        error: 'Upload failed'
      });
    }
  }

  return results;
}

/**
 * Clean up temporary images (Cloudflare R2 - not directly accessible)
 * Note: Temp file cleanup would need to be handled by Cloudflare Worker
 */
export async function cleanupTempImages(pattern: string): Promise<void> {
  console.log('Temp image cleanup requested for pattern:', pattern);
  console.warn('Temp image cleanup not implemented for Cloudflare R2 storage');
}