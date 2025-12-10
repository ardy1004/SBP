import React, { useState } from 'react';
import { ProgressiveLeadCapture } from './ProgressiveLeadCapture';
import { useLeadCaptureTrigger } from '@/hooks/useLeadCaptureTrigger';

interface LeadCaptureManagerProps {
  children: React.ReactNode;
}

export function LeadCaptureManager({ children }: LeadCaptureManagerProps) {
  console.log('🎯 LeadCaptureManager rendered');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { shouldShow, triggerSource, markAsShown } = useLeadCaptureTrigger({
    scrollThreshold: 10, // 10% scroll for testing
    timeThreshold: 10000, // 10 seconds for testing
    enableScrollTrigger: true,
    enableTimeTrigger: true,
    enableLoadMoreTrigger: true
  });

  console.log('🎯 LeadCaptureManager state:', { shouldShow, triggerSource, isModalOpen });

  // Show modal when trigger conditions are met
  React.useEffect(() => {
    if (shouldShow && !isModalOpen) {
      console.log('🎯 Opening lead capture modal', { triggerSource });
      setIsModalOpen(true);
    }
  }, [shouldShow, isModalOpen, triggerSource]);

  const handleClose = () => {
    setIsModalOpen(false);
    markAsShown();
  };

  return (
    <>
      {children}

      <ProgressiveLeadCapture
        isOpen={isModalOpen}
        onClose={handleClose}
        triggerSource={triggerSource || undefined}
      />
    </>
  );
}