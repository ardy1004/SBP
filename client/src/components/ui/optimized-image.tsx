import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  srcSet?: string; // Add srcSet support
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

/**
 * OptimizedImage component with lazy loading, WebP/AVIF support, blur placeholder, and error handling
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  onLoad,
  onError,
  fallbackSrc = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URLs
  const generateOptimizedUrl = (baseSrc: string, options: { width?: number; height?: number; quality?: number; format?: string }) => {
    const { width: w, height: h, quality: q = 80, format } = options;

    // If it's a Cloudflare Images URL, use their transformation syntax
    if (baseSrc.includes('imagedelivery.net')) {
      const transformations = [];
      if (w) transformations.push(`w=${w}`);
      if (h) transformations.push(`h=${h}`);
      if (q !== 80) transformations.push(`q=${q}`);
      if (format) transformations.push(`f=${format}`);
      transformations.push('sharpen=1');

      const transformString = transformations.join(',');
      return baseSrc.replace('/public', `/${transformString}`);
    }

    // For Unsplash images, add parameters
    if (baseSrc.includes('unsplash.com')) {
      const params = new URLSearchParams();
      if (w) params.set('w', w.toString());
      if (h) params.set('h', h.toString());
      params.set('fit', 'crop');
      params.set('q', q.toString());
      if (format === 'webp') params.set('fm', 'webp');
      else if (format === 'avif') params.set('fm', 'avif');

      return `${baseSrc}${baseSrc.includes('?') ? '&' : '?'}${params.toString()}`;
    }

    // For other URLs, return as-is
    return baseSrc;
  };

  // Generate responsive srcSet
  const generateSrcSet = (baseSrc: string, format?: string) => {
    const widths = [400, 800, 1200, 1600, 2000];
    return widths
      .map(width => `${generateOptimizedUrl(baseSrc, { width, quality, format })} ${width}w`)
      .join(', ');
  };

  const webpSrc = generateOptimizedUrl(src, { width, height, quality, format: 'webp' });
  const avifSrc = generateOptimizedUrl(src, { width, height, quality, format: 'avif' });
  const fallbackImgSrc = generateOptimizedUrl(src, { width, height, quality });

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters the viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate sizes attribute if not provided
  const defaultSizes = sizes || (
    width && height
      ? `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px`
      : '100vw'
  );

  // Blur placeholder styles
  const blurStyles = placeholder === 'blur' && !isLoaded
    ? {
        backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(10px)',
        transform: 'scale(1.1)'
      }
    : {};

  if (hasError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={cn('object-cover', className)}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
      />
    );
  }

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined,
        ...blurStyles
      }}
    >
      {isInView && (
        <picture>
          {/* AVIF source for modern browsers */}
          <source
            srcSet={generateSrcSet(src, 'avif')}
            sizes={defaultSizes}
            type="image/avif"
          />

          {/* WebP source for modern browsers */}
          <source
            srcSet={generateSrcSet(src, 'webp')}
            sizes={defaultSizes}
            type="image/webp"
          />

          {/* Fallback image */}
          <img
            src={fallbackImgSrc}
            srcSet={generateSrcSet(src)}
            alt={alt}
            className={cn(
              'w-full h-full transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              className // inherit object-contain/cover from parent
            )}
            loading={priority ? 'eager' : 'lazy'}
            sizes={defaultSizes}
            onLoad={handleLoad}
            onError={handleError}
            decoding="async"
          />
        </picture>
      )}

      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;