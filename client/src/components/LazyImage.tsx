/**
 * LazyImage Component
 * 
 * Optimized image component with lazy loading using IntersectionObserver.
 * Falls back to eager loading for critical images or when IntersectionObserver
 * is not supported.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

export interface LazyImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Placeholder image to show while loading */
  placeholderSrc?: string;
  /** Whether to enable lazy loading */
  lazy?: boolean;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection */
  threshold?: number;
  /** Width of the image */
  width?: number | string;
  /** Height of the image */
  height?: number | string;
  /** CSS class */
  className?: string;
  /** CSS style */
  style?: React.CSSProperties;
  /** Aspect ratio to prevent layout shift */
  aspectRatio?: string;
  /** Object fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Custom loading spinner */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onImageError?: (error: Error) => void;
  /** Whether this is a priority/critical image */
  priority?: boolean;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Srcset for responsive images */
  srcSet?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderSrc,
  lazy = true,
  rootMargin = '50px',
  threshold = 0,
  width,
  height,
  aspectRatio,
  objectFit = 'cover',
  loadingComponent,
  errorComponent,
  onLoad,
  onImageError,
  priority = false,
  sizes,
  srcSet,
  className,
  style,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredRef = useRef(false);

  const [imageState, setImageState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '');
  const [isInViewport, setIsInViewport] = useState(priority || !lazy);

  // Load the actual image
  const loadImage = useCallback(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    setImageState('loading');

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setImageState('loaded');
      onLoad?.();
    };

    img.onerror = () => {
      const error = new Error(`Failed to load image: ${src}`);
      setImageState('error');
      logger.error('LazyImage load failed', { src, error: error.message });
      onImageError?.(error);
    };

    // If srcset is provided, set it as well
    if (srcSet) {
      img.srcset = srcSet;
    }
    if (sizes) {
      img.sizes = sizes;
    }
    img.src = src;
  }, [src, srcSet, sizes, onLoad, onImageError]);

  // Set up IntersectionObserver
  useEffect(() => {
    // If not lazy or priority, load immediately
    if (!lazy || priority) {
      setIsInViewport(true);
      return;
    }

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      setIsInViewport(true);
      return;
    }

    const element = imgRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInViewport(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [lazy, priority, rootMargin, threshold]);

  // Load image when in viewport
  useEffect(() => {
    if (isInViewport && imageState === 'idle') {
      loadImage();
    }
  }, [isInViewport, imageState, loadImage]);

  // Container style for aspect ratio
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: width || '100%',
    height: height || (aspectRatio ? 'auto' : '100%'),
    ...(aspectRatio && {
      aspectRatio,
    }),
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: aspectRatio ? '100%' : height || 'auto',
    objectFit,
    opacity: imageState === 'loaded' ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    ...style,
  };

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit,
    opacity: imageState === 'loaded' ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
  };

  // Default loading component
  const defaultLoadingComponent = (
    <div 
      className="absolute inset-0 flex items-center justify-center bg-gray-100"
      style={{ opacity: imageState === 'loading' ? 1 : 0, transition: 'opacity 0.3s' }}
    >
      <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
    </div>
  );

  // Default error component
  const defaultErrorComponent = (
    <div 
      className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500"
      style={{ opacity: imageState === 'error' ? 1 : 0, transition: 'opacity 0.3s' }}
    >
      <div className="text-center">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">Gagal memuat gambar</p>
      </div>
    </div>
  );

  return (
    <div style={containerStyle} className={cn('overflow-hidden', className)}>
      {/* Placeholder or actual image */}
      {(imageState !== 'loaded' || placeholderSrc) && (
        <img
          ref={imgRef}
          src={currentSrc || placeholderSrc}
          alt={alt}
          style={placeholderStyle}
          className="lazy-image-placeholder"
        />
      )}

      {/* Main image */}
      <img
        src={imageState === 'loaded' ? src : undefined}
        alt={alt}
        style={imageStyle}
        className="lazy-image-main"
        loading={lazy && !priority ? 'lazy' : 'eager'}
        decoding={lazy && !priority ? 'async' : 'sync'}
      />

      {/* Loading state */}
      {imageState === 'loading' && (
        loadingComponent || defaultLoadingComponent
      )}

      {/* Error state */}
      {imageState === 'error' && (
        errorComponent || defaultErrorComponent
      )}
    </div>
  );
};

LazyImage.displayName = 'LazyImage';

export default LazyImage;
