import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { cacheManager, CACHE_CONFIG, queryCacheConfig, imageCache, warmUpCache } from '@/lib/cache';
import { useEffect } from 'react';

interface LandingPage {
  id: string;
  lp_id: string;
  name: string;
  description: string;
  preview_url: string;
  folder_path: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LandingPageConfig {
  id?: string;
  active_lp: string;
  google_ads_link?: string;
  tiktok_link?: string;
  custom_links?: Record<string, string>;
  updated_at?: string;
}

// Query keys for React Query
export const landingPageKeys = {
  all: ['landing-pages'] as const,
  lists: () => [...landingPageKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...landingPageKeys.lists(), filters] as const,
  details: () => [...landingPageKeys.all, 'detail'] as const,
  detail: (id: string) => [...landingPageKeys.details(), id] as const,
  config: ['landing-page-config'] as const,
};

// Custom hook for landing pages with advanced caching
export function useLandingPages() {
  return useQuery({
    queryKey: landingPageKeys.lists(),
    queryFn: async (): Promise<LandingPage[]> => {
      // Try cache first
      const cached = cacheManager.get<LandingPage[]>('landing_pages', CACHE_CONFIG.LANDING_PAGES);
      if (cached) {
        console.log('Using cached landing pages data');
        return cached;
      }

      console.log('Fetching landing pages from database');
      const { data, error } = await supabase
        .from('landing_pages_master')
        .select('*')
        .eq('is_active', true)
        .order('lp_id');

      if (error) throw error;

      // Cache the result
      cacheManager.set('landing_pages', data, CACHE_CONFIG.LANDING_PAGES);

      return data;
    },
    ...queryCacheConfig,
    // Cache for 5 minutes, background refetch every 30 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Hook for landing page configuration
export function useLandingPageConfig() {
  return useQuery({
    queryKey: landingPageKeys.config,
    queryFn: async (): Promise<LandingPageConfig | null> => {
      const { data, error } = await supabase
        .from('landing_page_configs')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data || null;
    },
    ...queryCacheConfig,
  });
}

// Mutation for updating landing page configuration
export function useUpdateLandingPageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Omit<LandingPageConfig, 'id' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('landing_page_configs')
        .upsert({
          ...config,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(landingPageKeys.config, data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: landingPageKeys.all });

      // Cache user preference
      cacheManager.setLocalStorage(
        CACHE_CONFIG.USER_PREFERENCES.key,
        { activeLP: data.active_lp },
        CACHE_CONFIG.USER_PREFERENCES.ttl
      );
    },
    onError: (error) => {
      console.error('Failed to update landing page config:', error);
    },
  });
}

// Hook for cache management
export function useCacheManager() {
  const queryClient = useQueryClient();

  const invalidateLandingPages = () => {
    cacheManager.invalidate('landing_pages', CACHE_CONFIG.LANDING_PAGES);
    queryClient.invalidateQueries({ queryKey: landingPageKeys.lists() });
  };

  const invalidateConfig = () => {
    queryClient.invalidateQueries({ queryKey: landingPageKeys.config });
  };

  const clearAllCaches = () => {
    cacheManager.clearAll();
    imageCache.clear();
    queryClient.clear();
  };

  const warmUpCaches = async () => {
    await warmUpCache();
  };

  return {
    invalidateLandingPages,
    invalidateConfig,
    clearAllCaches,
    warmUpCaches,
  };
}

// Hook for offline support
export function useOfflineSupport() {
  useEffect(() => {
    const handleOnline = () => {
      console.log('Back online - refreshing cached data');
      // Could trigger background sync here
    };

    const handleOffline = () => {
      console.log('Gone offline - using cached data');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline: navigator.onLine,
  };
}

// Hook for performance monitoring
export function useCachePerformance() {
  useEffect(() => {
    // Monitor cache hit rates and performance
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const result = await originalFetch(...args);
      const duration = performance.now() - start;

      // Log slow requests (>500ms)
      if (duration > 500) {
        console.warn(`Slow network request: ${args[0]} took ${duration.toFixed(2)}ms`);
      }

      return result;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return {
    // Could expose cache statistics here
    cacheStats: {
      memoryCacheSize: cacheManager['memoryCache'].size,
      imageCacheSize: imageCache['loadedImages'].size,
    },
  };
}