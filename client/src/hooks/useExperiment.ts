import { useState, useEffect } from 'react';
import { abTesting } from '@/utils/abTesting';
import type { Variant } from '@/utils/abTesting';

export const useExperiment = (experimentId: string, userId?: string) => {
  const [variant, setVariant] = useState<Variant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const assignedVariant = abTesting.getVariant(experimentId, userId);
    setVariant(assignedVariant);
    setIsLoading(false);
  }, [experimentId, userId]);

  const trackConversion = (event: string, metadata?: Record<string, any>) => {
    if (variant) {
      abTesting.trackConversion(experimentId, variant.id, event, metadata);
    }
  };

  return { variant, isLoading, trackConversion };
};