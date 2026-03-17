/**
 * Lazy Image Loading Hook with IntersectionObserver
 * 
 * Provides lazy loading functionality for images to improve performance.
 * Images are only loaded when they enter the viewport.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/logger';

export interface LazyImageOptions {
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection (0-1) */
  threshold?: number;
  /** Placeholder image while loading */
  placeholderSrc?: string;
  /** Callback when image starts loading */
  onLoadStart?: () => void;
  /** Callback when image finishes loading */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: Error) => void;
  /** Whether to enable lazy loading */
  enabled?: boolean;
  /** Preload distance in pixels */
  preloadDistance?: number;
}

export interface LazyImageState {
  /** Whether the image should start loading */
  shouldLoad: boolean;
  /** Whether the image has loaded */
  loaded: boolean;
  /** Whether the image is currently loading */
  loading: boolean;
  /** Error if loading failed */
  error: Error | null;
  /** Current src to display */
  currentSrc: string;
}

/**
 * Hook for lazy loading images with IntersectionObserver
 * 
 * Usage:
 * ```tsx
 * const { ref, src, loaded, loading } = useLazyImage({
 *   src: 'https://example.com/image.jpg',
 *   placeholderSrc: '/placeholder.jpg'
 * });
 * 
 * return <img ref={ref} src={src} className={loaded ? 'loaded' : 'loading'} />;
 * ```
 */
export function useLazyImage(
  src: string,
  options: LazyImageOptions = {}
): {
  ref: React.RefObject<HTMLImageElement>;
  state: LazyImageState;
  retry: () => void;
} {
  const {
    rootMargin = '50px',
    threshold = 0,
    placeholderSrc = '',
    onLoadStart,
    onLoad,
    onError,
    enabled = true,
  } = options;

  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredRef = useRef(false);

  const [state, setState] = useState<LazyImageState>({
    shouldLoad: !enabled,
    loaded: false,
    loading: false,
    error: null,
    currentSrc: placeholderSrc,
  });

  // Start loading the actual image
  const startLoading = useCallback(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    setState(prev => ({
      ...prev,
      shouldLoad: true,
      loading: true,
    }));

    onLoadStart?.();

    // Preload the image
    const img = new Image();
    
    img.onload = () => {
      setState({
        shouldLoad: true,
        loaded: true,
        loading: false,
        error: null,
        currentSrc: src,
      });
      onLoad?.();
    };

    img.onerror = () => {
      const error = new Error(`Failed to load image: ${src}`);
      setState(prev => ({
        ...prev,
        loading: false,
        error,
        currentSrc: placeholderSrc,
      }));
      logger.error('Image load failed', { src, error: error.message });
      onError?.(error);
    };

    img.src = src;
  }, [src, placeholderSrc, onLoadStart, onLoad, onError]);

  // Retry loading
  const retry = useCallback(() => {
    hasTriggeredRef.current = false;
    setState(prev => ({
      ...prev,
      loaded: false,
      loading: false,
      error: null,
    }));
    startLoading();
  }, [startLoading]);

  // Set up IntersectionObserver
  useEffect(() => {
    if (!enabled || state.shouldLoad) return;

    const element = imgRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startLoading();
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
  }, [enabled, state.shouldLoad, rootMargin, threshold, startLoading]);

  // If lazy loading is disabled, load immediately
  useEffect(() => {
    if (!enabled && !state.loaded && !state.loading) {
      startLoading();
    }
  }, [enabled, state.loaded, state.loading, startLoading]);

  return {
    ref: imgRef,
    state,
    retry,
  };
}

/**
 * Hook for lazy loading multiple images
 */
export function useLazyImages(
  imageUrls: string[],
  options: LazyImageOptions = {}
): {
  refs: React.RefObject<HTMLImageElement>[];
  states: LazyImageState[];
  retry: (index: number) => void;
} {
  const refs = useRef<React.RefObject<HTMLImageElement>[]>([]);
  const [states, setStates] = useState<LazyImageState[]>([]);

  // Initialize refs and states
  useEffect(() => {
    refs.current = imageUrls.map(() => ({ current: null } as React.RefObject<HTMLImageElement>));
    setStates(imageUrls.map(() => ({
      shouldLoad: false,
      loaded: false,
      loading: false,
      error: null,
      currentSrc: options.placeholderSrc || '',
    })));
  }, [imageUrls.length, options.placeholderSrc]);

  // Set up observers for each image
  useEffect(() => {
    if (options.enabled === false) return;

    const observers: IntersectionObserver[] = [];

    refs.current.forEach((ref, index) => {
      const element = ref.current;
      if (!element || states[index]?.shouldLoad) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Start loading this image
              setStates(prev => {
                const newStates = [...prev];
                newStates[index] = {
                  ...newStates[index],
                  shouldLoad: true,
                  loading: true,
                };
                return newStates;
              });

              // Load the image
              const img = new Image();
              img.onload = () => {
                setStates(prev => {
                  const newStates = [...prev];
                  newStates[index] = {
                    shouldLoad: true,
                    loaded: true,
                    loading: false,
                    error: null,
                    currentSrc: imageUrls[index],
                  };
                  return newStates;
                });
                options.onLoad?.();
              };
              img.onerror = () => {
                const error = new Error(`Failed to load image: ${imageUrls[index]}`);
                setStates(prev => {
                  const newStates = [...prev];
                  newStates[index] = {
                    ...newStates[index],
                    loading: false,
                    error,
                  };
                  return newStates;
                });
                options.onError?.(error);
              };
              img.src = imageUrls[index];

              observer.disconnect();
            }
          });
        },
        {
          rootMargin: options.rootMargin || '50px',
          threshold: options.threshold || 0,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [imageUrls, options]);

  const retry = useCallback((index: number) => {
    setStates(prev => {
      const newStates = [...prev];
      newStates[index] = {
        shouldLoad: false,
        loaded: false,
        loading: false,
        error: null,
        currentSrc: options.placeholderSrc || '',
      };
      return newStates;
    });
  }, [options.placeholderSrc]);

  return {
    refs: refs.current,
    states,
    retry,
  };
}

/**
 * Hook for background image lazy loading
 */
export function useLazyBackground(
  backgroundUrl: string,
  options: LazyImageOptions = {}
): {
  ref: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
  loaded: boolean;
  loading: boolean;
} {
  const divRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentBackground, setCurrentBackground] = useState<string>('');

  useEffect(() => {
    if (options.enabled === false) {
      setCurrentBackground(backgroundUrl);
      setLoaded(true);
      return;
    }

    const element = divRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loaded && !loading) {
            setLoading(true);
            options.onLoadStart?.();

            const img = new Image();
            img.onload = () => {
              setCurrentBackground(backgroundUrl);
              setLoaded(true);
              setLoading(false);
              options.onLoad?.();
              observer.disconnect();
            };
            img.onerror = () => {
              setLoading(false);
              options.onError?.(new Error(`Failed to load background: ${backgroundUrl}`));
              observer.disconnect();
            };
            img.src = backgroundUrl;
          }
        });
      },
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [backgroundUrl, loaded, loading, options]);

  return {
    ref: divRef,
    style: {
      backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
    },
    loaded,
    loading,
  };
}

export default useLazyImage;