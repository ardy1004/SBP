import { useState, useEffect, useCallback } from 'react';

interface UseLeadCaptureTriggerOptions {
  scrollThreshold?: number; // Percentage of page height (default: 40%)
  timeThreshold?: number; // Time in milliseconds before showing (default: 45000ms = 45s)
  enableScrollTrigger?: boolean;
  enableTimeTrigger?: boolean;
  enableLoadMoreTrigger?: boolean;
}

interface UseLeadCaptureTriggerReturn {
  shouldShow: boolean;
  triggerSource: 'scroll' | 'time' | 'load_more' | null;
  reset: () => void;
  markAsShown: () => void;
}

export function useLeadCaptureTrigger(options: UseLeadCaptureTriggerOptions = {}): UseLeadCaptureTriggerReturn {
  const {
    scrollThreshold = 10, // 10% of page height for testing
    timeThreshold = 10000, // 10 seconds for testing
    enableScrollTrigger = true,
    enableTimeTrigger = true,
    enableLoadMoreTrigger = true
  } = options;

  console.log('🎯 useLeadCaptureTrigger initialized', { scrollThreshold, timeThreshold });

  const [shouldShow, setShouldShow] = useState(false);
  const [triggerSource, setTriggerSource] = useState<'scroll' | 'time' | 'load_more' | null>(null);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [loadMoreClicked, setLoadMoreClicked] = useState(false);

  // Reset function
  const reset = useCallback(() => {
    setShouldShow(false);
    setTriggerSource(null);
    setHasBeenShown(false);
    setLoadMoreClicked(false);
  }, []);

  // Mark as shown function
  const markAsShown = useCallback(() => {
    setHasBeenShown(true);
    setShouldShow(false);
  }, []);

  // Scroll trigger
  useEffect(() => {
    if (!enableScrollTrigger || hasBeenShown) {
      console.log('🎯 Scroll trigger disabled or already shown', { enableScrollTrigger, hasBeenShown });
      return;
    }

    console.log('🎯 Scroll trigger enabled, listening for scroll events');

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;

      console.log('📜 Scroll detected', {
        scrollTop: scrollTop.toFixed(0),
        windowHeight,
        documentHeight,
        scrollPercentage: scrollPercentage.toFixed(1) + '%',
        threshold: scrollThreshold + '%'
      });

      if (scrollPercentage >= scrollThreshold && !shouldShow) {
        console.log('🎯 Lead capture triggered by scroll', {
          scrollPercentage: scrollPercentage.toFixed(1) + '%',
          threshold: scrollThreshold + '%'
        });
        setShouldShow(true);
        setTriggerSource('scroll');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold, enableScrollTrigger, hasBeenShown, shouldShow]);

  // Time-based trigger
  useEffect(() => {
    if (!enableTimeTrigger || hasBeenShown) return;

    const timer = setTimeout(() => {
      if (!shouldShow) {
        console.log('⏰ Lead capture triggered by time', {
          elapsed: ((Date.now() - sessionStartTime) / 1000).toFixed(1) + 's',
          threshold: (timeThreshold / 1000) + 's'
        });
        setShouldShow(true);
        setTriggerSource('time');
      }
    }, timeThreshold);

    return () => clearTimeout(timer);
  }, [timeThreshold, enableTimeTrigger, hasBeenShown, shouldShow, sessionStartTime]);

  // Load more button trigger
  useEffect(() => {
    if (!enableLoadMoreTrigger || hasBeenShown) return;

    const handleLoadMoreClick = (event: Event) => {
      // Check if the clicked element or its parents have load-more related classes
      const target = event.target as HTMLElement;
      const isLoadMoreButton = target.closest('[data-lead-trigger="load-more"]') ||
                              target.closest('.load-more-btn') ||
                              target.closest('[class*="load-more"]') ||
                              target.textContent?.toLowerCase().includes('load more') ||
                              target.textContent?.toLowerCase().includes('muat lebih');

      if (isLoadMoreButton && !shouldShow) {
        console.log('🔄 Lead capture triggered by load more click');
        setLoadMoreClicked(true);
        setShouldShow(true);
        setTriggerSource('load_more');
      }
    };

    document.addEventListener('click', handleLoadMoreClick);
    return () => document.removeEventListener('click', handleLoadMoreClick);
  }, [enableLoadMoreTrigger, hasBeenShown, shouldShow]);

  // Prevent showing if already shown in this session
  useEffect(() => {
    const hasShownBefore = sessionStorage.getItem('lead_capture_shown');
    console.log('🎯 Session check', { hasShownBefore, hasBeenShown });
    if (hasShownBefore) {
      console.log('🎯 Lead capture already shown this session, disabling triggers');
      setHasBeenShown(true);
    }
  }, []);

  // Mark as shown in session storage when shown
  useEffect(() => {
    if (shouldShow) {
      sessionStorage.setItem('lead_capture_shown', 'true');
    }
  }, [shouldShow]);

  return {
    shouldShow: shouldShow && !hasBeenShown,
    triggerSource,
    reset,
    markAsShown
  };
}