import { useLayoutEffect } from 'react';

// Type declarations for global objects
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface Metric {
  id: string;
  value: number;
  delta: number;
}

export function useCoreWebVitals() {
  // Ensure we're in a React component context and browser environment
  if (typeof window === 'undefined') return;

  try {
    useLayoutEffect(() => {
      // Only run in browser environment
      if (typeof window === 'undefined') return;

      // Dynamically import web-vitals library
      import('web-vitals').then((webVitals) => {
        // Track Core Web Vitals
        webVitals.onCLS((metric: Metric) => {
          console.log('CLS:', metric);
          sendToAnalytics('CLS', metric);
        });

        // Note: FID is deprecated, using INP instead for interaction metrics
        webVitals.onINP((metric: Metric) => {
          console.log('INP:', metric);
          sendToAnalytics('INP', metric);
        });

        webVitals.onFCP((metric: Metric) => {
          console.log('FCP:', metric);
          sendToAnalytics('FCP', metric);
        });

        webVitals.onLCP((metric: Metric) => {
          console.log('LCP:', metric);
          sendToAnalytics('LCP', metric);
        });

        webVitals.onTTFB((metric: Metric) => {
          console.log('TTFB:', metric);
          sendToAnalytics('TTFB', metric);
        });
      }).catch((error) => {
        console.warn('Failed to load web-vitals:', error);
      });
    }, []);
  } catch (error) {
    // Silently handle hook call errors in non-React contexts
    console.warn('useCoreWebVitals: Hook called outside React component context');
  }
}

function sendToAnalytics(metricName: string, metric: Metric) {
  // Send to Google Analytics 4
  if (window.gtag) {
    window.gtag('event', metricName, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      custom_map: {
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
      }
    });
  }

  // Send to Google Tag Manager
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'web_vitals',
      web_vitals_metric: metricName,
      web_vitals_value: metric.value,
      web_vitals_id: metric.id,
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ${metricName}:`, {
      id: metric.id,
      value: metric.value,
      delta: metric.delta,
      rating: getRating(metricName, metric.value)
    });
  }
}

function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (metricName) {
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'needs-improvement';
  }
}