import { supabase } from './supabase';

// Cache configuration
export const CACHE_CONFIG = {
  LANDING_PAGES: {
    key: 'landing_pages_cache',
    ttl: 5 * 60 * 1000, // 5 minutes
    maxAge: 30 * 60 * 1000, // 30 minutes
  },
  USER_PREFERENCES: {
    key: 'personalize_preferences',
    ttl: 24 * 60 * 60 * 1000, // 24 hours
  },
  IMAGES: {
    key: 'lp_images_cache',
    ttl: 60 * 60 * 1000, // 1 hour
  },
} as const;

// Cache entry interface
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

// Cache utilities
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache = new Map<string, CacheEntry>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Memory cache operations
  setMemory<T>(key: string, data: T, ttl: number = CACHE_CONFIG.LANDING_PAGES.ttl): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      version: '1.0',
    });
  }

  getMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  clearMemory(key?: string): void {
    if (key) {
      this.memoryCache.delete(key);
    } else {
      this.memoryCache.clear();
    }
  }

  // LocalStorage cache operations
  setLocalStorage<T>(key: string, data: T, ttl: number = CACHE_CONFIG.USER_PREFERENCES.ttl): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        version: '1.0',
      };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to cache to localStorage:', error);
    }
  }

  getLocalStorage<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const entry: CacheEntry<T> = JSON.parse(stored);

      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to retrieve from localStorage:', error);
      localStorage.removeItem(key); // Clean up corrupted data
      return null;
    }
  }

  clearLocalStorage(key?: string): void {
    try {
      if (key) {
        localStorage.removeItem(key);
      } else {
        // Clear only our cache keys
        Object.values(CACHE_CONFIG).forEach(config => {
          localStorage.removeItem(config.key);
        });
      }
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  // Combined cache operations (memory first, then localStorage)
  set<T>(key: string, data: T, config = CACHE_CONFIG.LANDING_PAGES): void {
    this.setMemory(key, data, config.ttl);
    this.setLocalStorage(config.key, data, config.ttl);
  }

  get<T>(key: string, config = CACHE_CONFIG.LANDING_PAGES): T | null {
    // Try memory cache first
    let data = this.getMemory<T>(key);
    if (data !== null) return data;

    // Try localStorage as fallback
    data = this.getLocalStorage<T>(config.key);
    if (data !== null) {
      // Restore to memory cache
      this.setMemory(key, data, config.ttl);
      return data;
    }

    return null;
  }

  invalidate(key: string, config = CACHE_CONFIG.LANDING_PAGES): void {
    this.memoryCache.delete(key);
    this.clearLocalStorage(config.key);
  }

  clearAll(): void {
    this.clearMemory();
    this.clearLocalStorage();
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// React Query cache configuration
export const queryCacheConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }
    return failureCount < 3;
  },
};

// Image caching utilities
export class ImageCache {
  private static instance: ImageCache;
  private cache = new Map<string, Promise<HTMLImageElement>>();
  private loadedImages = new Set<string>();

  static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.loadedImages.has(src)) {
      // Return a resolved promise for already loaded images
      return Promise.resolve(new Image());
    }

    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.loadedImages.add(src);
        resolve(img);
      };

      img.onerror = () => {
        this.cache.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });

    this.cache.set(src, promise);
    return promise;
  }

  isLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }

  clear(): void {
    this.cache.clear();
    this.loadedImages.clear();
  }
}

export const imageCache = ImageCache.getInstance();

// Cache invalidation helpers
export const invalidateLandingPagesCache = () => {
  cacheManager.invalidate('landing_pages');
};

export const invalidateUserPreferences = () => {
  cacheManager.clearLocalStorage(CACHE_CONFIG.USER_PREFERENCES.key);
};

export const invalidateAllCaches = () => {
  cacheManager.clearAll();
  imageCache.clear();
};

// Background sync for cache updates
export const setupBackgroundCacheSync = () => {
  // Sync cache every 10 minutes when tab is visible
  const syncInterval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      // Trigger cache refresh for critical data
      console.log('Background cache sync triggered');
    }
  }, 10 * 60 * 1000);

  return () => clearInterval(syncInterval);
};

// Cache warming for critical resources
export const warmUpCache = async () => {
  try {
    // Preload critical landing page data
    const { data: landingPages } = await supabase
      .from('landing_pages_master')
      .select('*')
      .eq('is_active', true)
      .order('lp_id');

    if (landingPages) {
      cacheManager.set('landing_pages', landingPages, CACHE_CONFIG.LANDING_PAGES);

      // Preload preview images
      const imagePromises = landingPages.map(lp =>
        imageCache.preloadImage(lp.preview_url).catch(() => {
          // Ignore image preload failures
          console.warn(`Failed to preload image: ${lp.preview_url}`);
        })
      );

      await Promise.allSettled(imagePromises);
    }
  } catch (error) {
    console.warn('Cache warm-up failed:', error);
  }
};