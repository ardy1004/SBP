import React from 'react';
import { useExperiment } from '@/hooks/useExperiment';
import type { Experiment as ExperimentType } from '@/utils/abTesting';

interface ABExperimentProps {
  experiment: ExperimentType;
  children: (variant: any) => React.ReactNode;
  fallback?: React.ReactNode;
}

export const ABExperiment: React.FC<ABExperimentProps> = ({
  experiment,
  children,
  fallback = null
}) => {
  const { variant, isLoading } = useExperiment(experiment.id);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!variant) {
    return <>{children(null)}</>;
  }

  return <>{children(variant)}</>;
};