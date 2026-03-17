/**
 * Advanced image optimization utilities for better performance
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto' | 'jpg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  sharpen?: number;
}

/**
 * Get optimized image URL with advanced transformations
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    fit = 'cover',
    sharpen = 1
  } = options;

  // Cloudflare Images transformation
  if (baseUrl.includes('imagedelivery.net')) {
    const transformations = [];

    if (width) transformations.push(`w=${width}`);
    if (height) transformations.push(`h=${height}`);
    if (quality !== 80) transformations.push(`q=${quality}`);
    if (format !== 'auto') transformations.push(`f=${format}`);
    if (fit !== 'cover') transformations.push(`fit=${fit}`);
    if (sharpen !== 1) transformations.push(`sharpen=${sharpen}`);

    const transformString = transformations.join(',');
    return baseUrl.replace('/public', `/${transformString}`);
  }

  // Cloudinary transformation
  if (baseUrl.includes('cloudinary.com')) {
    const transformations = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality !== 80) transformations.push(`q_${quality}`);
    if (format !== 'auto') transformations.push(`f_${format}`);
    if (fit !== 'cover') transformations.push(`c_${fit}`);
    if (sharpen !== 1) transformations.push(`e_sharpen:${sharpen}`);

    const transformString = transformations.join(',');
    const urlParts = baseUrl.split('/upload/');
    if (urlParts.length === 2) {
      return `${urlParts[0]}/upload/${transformString}/${urlParts[1]}`;
    }
  }

  // For other URLs, return as-is
  return baseUrl;
}

/**
 * Generate responsive image variants
 */
export function generateImageVariants(baseUrl: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  xlarge: string;
} {
  return {
    thumbnail: getOptimizedImageUrl(baseUrl, { width: 150, height: 150, quality: 70 }),
    small: getOptimizedImageUrl(baseUrl, { width: 400, height: 300, quality: 75 }),
    medium: getOptimizedImageUrl(baseUrl, { width: 800, height: 600, quality: 80 }),
    large: getOptimizedImageUrl(baseUrl, { width: 1200, height: 900, quality: 85 }),
    xlarge: getOptimizedImageUrl(baseUrl, { width: 1920, height: 1440, quality: 90 })
  };
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(baseUrl: string, breakpoints: number[] = [400, 800, 1200, 1920]): string {
  const variants = breakpoints.map(width => {
    const optimizedUrl = getOptimizedImageUrl(baseUrl, { width, quality: 80 });
    return `${optimizedUrl} ${width}w`;
  });

  return variants.join(', ');
}

/**
 * Generate sizes attribute based on common responsive breakpoints
 */
export function generateSizes(breakpoints: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
} = {}): string {
  const {
    mobile = '100vw',
    tablet = '50vw',
    desktop = '33vw'
  } = breakpoints;

  return `(max-width: 640px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`;
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.crossOrigin = 'anonymous';

  document.head.appendChild(link);
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurPlaceholder(width: number = 10, height: number = 6): string {
  // Create a simple SVG blur placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blur">
          <feGaussianBlur stdDeviation="1"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#f3f4f6" filter="url(#blur)"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Check if image URL is valid and accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get image dimensions
 */
export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Compress image data URL
 */
export function compressImageDataUrl(dataUrl: string, quality: number = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.src = dataUrl;
  });
}

/**
 * Convert image to WebP format
 */
export function convertToWebP(file: File, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/webp', quality);
    };

    img.src = URL.createObjectURL(file);
  });
}