// Lazy loading utilities using Intersection Observer
import React from 'react';

export interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
}

// Intersection Observer for lazy loading
export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private options: LazyLoadOptions;

  constructor(options: LazyLoadOptions = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      once: true,
      ...options
    };

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        this.options
      );
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLElement;

        // Handle different types of lazy elements
        if (target.tagName === 'IMG') {
          this.loadImage(target as HTMLImageElement);
        } else if (target.hasAttribute('data-lazy-bg')) {
          this.loadBackground(target);
        } else if (target.hasAttribute('data-lazy-src')) {
          this.loadElement(target);
        }

        if (this.options.once) {
          this.observer?.unobserve(target);
        }
      }
    });
  }

  private loadImage(img: HTMLImageElement): void {
    const src = img.getAttribute('data-lazy-src');
    const srcSet = img.getAttribute('data-lazy-srcset');

    if (src) {
      img.src = src;
      img.removeAttribute('data-lazy-src');
    }

    if (srcSet) {
      img.srcset = srcSet;
      img.removeAttribute('data-lazy-srcset');
    }

    // Remove loading class and add loaded class
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-loaded');
  }

  private loadBackground(element: HTMLElement): void {
    const bgImage = element.getAttribute('data-lazy-bg');
    if (bgImage) {
      element.style.backgroundImage = `url(${bgImage})`;
      element.removeAttribute('data-lazy-bg');
      element.classList.add('lazy-bg-loaded');
    }
  }

  private loadElement(element: HTMLElement): void {
    const src = element.getAttribute('data-lazy-src');
    if (src) {
      // For custom elements, you might want to trigger a load event
      element.setAttribute('src', src);
      element.removeAttribute('data-lazy-src');
      element.classList.add('lazy-loaded');
    }
  }

  observe(element: Element): void {
    this.observer?.observe(element);
  }

  unobserve(element: Element): void {
    this.observer?.unobserve(element);
  }

  disconnect(): void {
    this.observer?.disconnect();
  }
}

// Global lazy loader instance
let globalLazyLoader: LazyLoader | null = null;

export function getGlobalLazyLoader(): LazyLoader {
  if (!globalLazyLoader) {
    globalLazyLoader = new LazyLoader();
  }
  return globalLazyLoader;
}

// Hook for lazy loading images
export function useLazyImage(
  src: string,
  options: {
    srcSet?: string;
    placeholder?: string;
    onLoad?: () => void;
    onError?: () => void;
  } = {}
) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const lazyLoader = getGlobalLazyLoader();

    // Set data attributes for lazy loading
    if (src) {
      img.setAttribute('data-lazy-src', src);
    }
    if (options.srcSet) {
      img.setAttribute('data-lazy-srcset', options.srcSet);
    }

    // Add loading class
    img.classList.add('lazy-loading');

    // Set placeholder
    if (options.placeholder) {
      img.src = options.placeholder;
    }

    // Observe the image
    lazyLoader.observe(img);

    // Cleanup
    return () => {
      lazyLoader.unobserve(img);
    };
  }, [src, options.srcSet, options.placeholder]);

  const handleLoad = React.useCallback(() => {
    setLoaded(true);
    options.onLoad?.();
  }, [options.onLoad]);

  const handleError = React.useCallback(() => {
    setError(true);
    options.onError?.();
  }, [options.onError]);

  return {
    imgRef,
    loaded,
    error,
    handleLoad,
    handleError
  };
}

// Preload images with priority
export function preloadImages(urls: string[], priority: 'high' | 'low' = 'low'): void {
  if (typeof document === 'undefined') return;

  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.crossOrigin = 'anonymous';

    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high');
    }

    document.head.appendChild(link);
  });
}

// Image optimization utilities
export function optimizeImageUrl(url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
}): string {
  if (!url) return url;

  // Cloudflare Images optimization
  if (url.includes('imagedelivery.net')) {
    const transformations = [];
    if (options.width) transformations.push(`w=${options.width}`);
    if (options.height) transformations.push(`h=${options.height}`);
    if (options.quality) transformations.push(`q=${options.quality}`);
    if (options.format) transformations.push(`format=${options.format}`);
    transformations.push('sharpen=1');

    const transformString = transformations.join(',');
    return url.replace('/public', `/${transformString}`);
  }

  return url;
}

// Generate responsive image URLs
export function generateResponsiveUrls(baseUrl: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
} {
  return {
    thumbnail: optimizeImageUrl(baseUrl, { width: 150, quality: 80 }),
    small: optimizeImageUrl(baseUrl, { width: 400, quality: 85 }),
    medium: optimizeImageUrl(baseUrl, { width: 800, quality: 90 }),
    large: optimizeImageUrl(baseUrl, { width: 1200, quality: 90 })
  };
}