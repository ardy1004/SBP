// AI Content Generation Hooks
// Provides safe and easy-to-use AI functionality for the admin panel

import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface PropertyData {
  kodeListing?: string;
  judulProperti?: string;
  jenisProperti?: string;
  kabupaten?: string;
  provinsi?: string;
  hargaProperti?: string;
  kamarTidur?: number;
  kamarMandi?: number;
  luasTanah?: number;
  luasBangunan?: number;
  legalitas?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  content?: string;
  model?: string;
  source?: 'local-ai' | 'cloud-ai';
  error?: string;
  requestId?: string;
  timestamp?: string;
}

export interface SEOOptimizationResponse {
  success: boolean;
  optimizedTitle?: string;
  optimizedDescription?: string;
  keywords?: string[];
  error?: string;
  requestId?: string;
  timestamp?: string;
}

export interface SocialPostResponse {
  success: boolean;
  content?: string;
  platform?: string;
  error?: string;
  requestId?: string;
  timestamp?: string;
}

/**
 * Hook for AI-powered property description generation
 */
export const useAIPropertyDescription = () => {
  const { toast } = useToast();

  const generateDescription = useMutation<AIGenerationResponse, Error, PropertyData>({
    mutationFn: async (propertyData: PropertyData) => {
      const response = await fetch('https://sbp-upload-worker.salambumiproperty-f1b.workers.dev/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || 'Failed to generate description');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'AI Description Generated',
          description: `Generated using ${data.source === 'local-ai' ? 'Local AI (Free)' : 'Cloud AI'}`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'AI Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    generateDescription,
    isGenerating: generateDescription.isPending,
  };
};

/**
 * Hook for AI-powered SEO optimization
 */
export const useAISEOOptimization = () => {
  const { toast } = useToast();

  const optimizeSEO = useMutation<SEOOptimizationResponse, Error, {
    title?: string;
    description?: string;
  }>({
    mutationFn: async ({ title, description }) => {
      const response = await fetch('https://sbp-upload-worker.salambumiproperty-f1b.workers.dev/api/ai/optimize-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || 'Failed to optimize SEO');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'SEO Optimized',
          description: `Content optimized with ${data.keywords?.length || 0} keywords`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'SEO Optimization Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    optimizeSEO,
    isOptimizing: optimizeSEO.isPending,
  };
};

/**
 * Hook for AI-powered social media post generation
 */
export const useAISocialPost = () => {
  const { toast } = useToast();

  const generateSocialPost = useMutation<SocialPostResponse, Error, {
    property: PropertyData;
    platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'linkedin';
  }>({
    mutationFn: async ({ property, platform }) => {
      const response = await fetch('https://sbp-upload-worker.salambumiproperty-f1b.workers.dev/api/ai/generate-social-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ property, platform }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || 'Failed to generate social post');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        toast({
          title: 'Social Post Generated',
          description: `Created ${variables.platform} post for ${variables.property.judulProperti}`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Social Post Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    generateSocialPost,
    isGenerating: generateSocialPost.isPending,
  };
};

/**
 * Combined hook for all AI features
 */
export const useAIContent = () => {
  const description = useAIPropertyDescription();
  const seo = useAISEOOptimization();
  const social = useAISocialPost();

  return {
    // Description generation
    generateDescription: description.generateDescription,
    isGeneratingDescription: description.isGenerating,

    // SEO optimization
    optimizeSEO: seo.optimizeSEO,
    isOptimizingSEO: seo.isOptimizing,

    // Social media posts
    generateSocialPost: social.generateSocialPost,
    isGeneratingSocialPost: social.isGenerating,

    // Combined loading state
    isAnyLoading: description.isGenerating || seo.isOptimizing || social.isGenerating,
  };
};