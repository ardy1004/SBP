import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { cacheManager, CACHE_CONFIG } from '@/lib/cache';

interface LPContentConfig {
  id?: string;
  lp_template: string; // 'LP-1', 'LP-2', etc.
  content_type: string; // 'hero', 'agent', 'testimonials', 'properties'
  content_data: any; // JSON data
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Query keys for React Query
export const lpContentKeys = {
  all: ['lp-content'] as const,
  lists: () => [...lpContentKeys.all, 'list'] as const,
  list: (lpTemplate: string) => [...lpContentKeys.lists(), lpTemplate] as const,
  details: () => [...lpContentKeys.all, 'detail'] as const,
  detail: (id: string) => [...lpContentKeys.details(), id] as const,
  byTemplate: (template: string) => [...lpContentKeys.all, 'template', template] as const,
  byType: (template: string, type: string) => [...lpContentKeys.all, 'template', template, 'type', type] as const,
};

// Hook to get all content for a specific LP template
export function useLPContent(lpTemplate: string) {
  return useQuery({
    queryKey: lpContentKeys.byTemplate(lpTemplate),
    queryFn: async (): Promise<LPContentConfig[]> => {
      // Try cache first
      const cacheKey = `lp_content_${lpTemplate}`;
      const cached = cacheManager.get<LPContentConfig[]>(cacheKey, CACHE_CONFIG.LANDING_PAGES);
      if (cached) {
        console.log(`Using cached LP content for ${lpTemplate}`);
        return cached;
      }

      console.log(`Fetching LP content for ${lpTemplate}`);
      const { data, error } = await supabase
        .from('lp_content_configs')
        .select('*')
        .eq('lp_template', lpTemplate)
        .eq('is_active', true)
        .order('content_type');

      if (error) throw error;

      // Cache the result
      cacheManager.set(cacheKey, data, CACHE_CONFIG.LANDING_PAGES);

      return data || [];
    },
    enabled: !!lpTemplate,
  });
}

// Hook to get specific content type for a template
export function useLPContentByType(lpTemplate: string, contentType: string) {
  return useQuery({
    queryKey: lpContentKeys.byType(lpTemplate, contentType),
    queryFn: async (): Promise<LPContentConfig | null> => {
      const { data, error } = await supabase
        .from('lp_content_configs')
        .select('*')
        .eq('lp_template', lpTemplate)
        .eq('content_type', contentType)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data || null;
    },
    enabled: !!lpTemplate && !!contentType,
  });
}

// Hook to get all available LP templates with their content
export function useLPTemplates() {
  return useQuery({
    queryKey: lpContentKeys.lists(),
    queryFn: async (): Promise<string[]> => {
      // Return static list of available templates
      // In a real implementation, this could query the database for available templates
      return ['LP-1', 'LP-2', 'LP-3', 'LP-4', 'LP-5', 'LP-6', 'LP-7', 'LP-8', 'LP-9'];
    },
  });
}

// Mutation to update LP content
export function useUpdateLPContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Omit<LPContentConfig, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('lp_content_configs')
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
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: lpContentKeys.byTemplate(data.lp_template) });
      queryClient.invalidateQueries({ queryKey: lpContentKeys.byType(data.lp_template, data.content_type) });
      queryClient.invalidateQueries({ queryKey: lpContentKeys.all });

      // Clear cache for this template
      cacheManager.invalidate(`lp_content_${data.lp_template}`, CACHE_CONFIG.LANDING_PAGES);

      console.log(`LP content updated for ${data.lp_template}:${data.content_type}`);
    },
    onError: (error) => {
      console.error('Failed to update LP content:', error);
    },
  });
}

// Mutation to delete LP content
export function useDeleteLPContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lp_content_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      // Get the template from cache or refetch
      queryClient.invalidateQueries({ queryKey: lpContentKeys.all });
      console.log(`LP content deleted: ${id}`);
    },
    onError: (error) => {
      console.error('Failed to delete LP content:', error);
    },
  });
}

// Hook for content management utilities
export function useLPContentManager() {
  const queryClient = useQueryClient();

  const invalidateTemplate = (template: string) => {
    cacheManager.invalidate(`lp_content_${template}`, CACHE_CONFIG.LANDING_PAGES);
    queryClient.invalidateQueries({ queryKey: lpContentKeys.byTemplate(template) });
  };

  const invalidateAll = () => {
    // Clear all LP content caches (simplified approach)
    ['LP-1', 'LP-2', 'LP-3', 'LP-4', 'LP-5', 'LP-6', 'LP-7', 'LP-8', 'LP-9'].forEach(template => {
      cacheManager.invalidate(`lp_content_${template}`, CACHE_CONFIG.LANDING_PAGES);
    });
    queryClient.invalidateQueries({ queryKey: lpContentKeys.all });
  };

  const getDefaultContent = (contentType: string): any => {
    const defaults: Record<string, any> = {
      hero: {
        title: "Temukan Properti Impian Anda",
        subtitle: "Platform terpercaya untuk jual beli properti di Yogyakarta",
        backgroundImage: "/default-hero-bg.jpg",
        ctaText: "Jelajahi Properti",
        ctaLink: "/search"
      },
      agent: {
        name: "Nama Agent",
        title: "Property Consultant",
        photo: "/default-agent.jpg",
        bio: "Berpengalaman dalam bidang properti dengan track record yang terbukti.",
        phone: "+62 812-3456-7890",
        email: "agent@salambumi.com"
      },
      testimonials: [
        {
          name: "Customer 1",
          photo: "/default-testimonial-1.jpg",
          quote: "Pelayanan yang sangat memuaskan dan profesional.",
          rating: 5
        },
        {
          name: "Customer 2",
          photo: "/default-testimonial-2.jpg",
          quote: "Berhasil menemukan rumah impian melalui platform ini.",
          rating: 5
        }
      ],
      properties: [
        {
          title: "Rumah Minimalis Condongcatur",
          image: "/default-property-1.jpg",
          price: "Rp 500.000.000",
          link: "/properti/rumah-minimalis-condongcatur",
          location: "Condongcatur, Yogyakarta"
        },
        {
          title: "Apartemen Modern Malioboro",
          image: "/default-property-2.jpg",
          price: "Rp 750.000.000",
          link: "/properti/apartemen-modern-malioboro",
          location: "Malioboro, Yogyakarta"
        }
      ]
    };

    return defaults[contentType] || {};
  };

  return {
    invalidateTemplate,
    invalidateAll,
    getDefaultContent,
  };
}