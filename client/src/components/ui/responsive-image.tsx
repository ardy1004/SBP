import React, { useState, useEffect } from 'react';
import { generateSrcSet, generateSizes, getOptimizedImageUrl, ResponsiveImageProps } from '@/lib/imageUtils';

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  variants,
  alt,
  className = '',
  loading = 'lazy',
  sizes
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate responsive attributes
  const srcSet = variants ? generateSrcSet(variants) : undefined;
  const sizesAttr = sizes || generateSizes();

  // Fallback image for errors
  const fallbackSrc = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Preload critical images
  useEffect(() => {
    if (loading === 'eager' && src) {
      const img = new Image();
      img.src = src;
    }
  }, [src, loading]);

  if (imageError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        loading={loading}
        onLoad={handleLoad}
      />
    );
  }

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizesAttr}
      alt={alt}
      className={className}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        opacity: imageLoaded ? 1 : 0.7,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
};

// Picture component for advanced format support
export const OptimizedPicture: React.FC<ResponsiveImageProps> = ({
  src,
  variants,
  alt,
  className = '',
  loading = 'lazy',
  sizes
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const srcSet = variants ? generateSrcSet(variants) : undefined;
  const sizesAttr = sizes || generateSizes();
  const fallbackSrc = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  if (imageError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        loading={loading}
        onLoad={handleLoad}
      />
    );
  }

  return (
    <picture>
      {/* WebP source for modern browsers - menggunakan Cloudflare Images format=auto */}
      {variants && (
        <source
          srcSet={`${variants.small.replace('format=auto', 'format=webp')} 600w, ${variants.medium.replace('format=auto', 'format=webp')} 800w, ${variants.large.replace('format=auto', 'format=webp')} 1200w`}
          sizes={sizesAttr}
          type="image/webp"
        />
      )}

      {/* AVIF source for latest browsers - menggunakan Cloudflare Images format=auto */}
      {variants && (
        <source
          srcSet={`${variants.small.replace('format=auto', 'format=avif')} 600w, ${variants.medium.replace('format=auto', 'format=avif')} 800w, ${variants.large.replace('format=auto', 'format=avif')} 1200w`}
          sizes={sizesAttr}
          type="image/avif"
        />
      )}

      {/* Fallback */}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizesAttr}
        alt={alt}
        className={className}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: imageLoaded ? 1 : 0.7,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </picture>
  );
};