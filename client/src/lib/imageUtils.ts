// Image optimization utilities for responsive images and WebP support

export interface ImageVariants {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
}

export interface ResponsiveImageProps {
  src: string;
  variants?: ImageVariants;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

/**
 * Generate responsive image srcSet from Cloudflare Images variants
 */
export function generateSrcSet(variants: ImageVariants): string {
  return [
    `${variants.small} 600w`,
    `${variants.medium} 800w`,
    `${variants.large} 1200w`,
  ].join(', ');
}

/**
 * Generate responsive image sizes attribute
 */
export function generateSizes(breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop'): string {
  switch (breakpoint) {
    case 'mobile':
      return '(max-width: 640px) 100vw, 640px';
    case 'tablet':
      return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px';
    case 'desktop':
    default:
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px';
  }
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}
): string {
  const { width, height, quality = 80, format = 'auto' } = options;

  // If it's a Cloudflare Images URL, use their transformation syntax
  if (baseUrl.includes('imagedelivery.net')) {
    const transformations = [];
    if (width) transformations.push(`w=${width}`);
    if (height) transformations.push(`h=${height}`);
    if (quality !== 80) transformations.push(`q=${quality}`);
    transformations.push('sharpen=1'); // Always sharpen for better quality

    const transformString = transformations.join(',');
    return baseUrl.replace('/public', `/${transformString}`);
  }

  // For other URLs, return as-is (could add Cloudinary, Imgix, etc. support later)
  return baseUrl;
}

/**
 * Preload critical images for better performance
 */
export function preloadImage(src: string, as: 'image' = 'image'): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  link.crossOrigin = 'anonymous';

  document.head.appendChild(link);
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(false);
      return;
    }

    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Get the best image format supported by the browser
 */
export async function getOptimalImageFormat(): Promise<'webp' | 'avif' | 'jpg'> {
  if (typeof document === 'undefined') return 'jpg';

  // Check for AVIF support (newer, better compression)
  try {
    const avifResult = await fetch('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=');
    if (avifResult.headers.get('content-type')?.includes('avif')) {
      return 'avif';
    }
  } catch (e) {
    // AVIF not supported
  }

  // Check for WebP support
  if (await supportsWebP()) {
    return 'webp';
  }

  return 'jpg';
}