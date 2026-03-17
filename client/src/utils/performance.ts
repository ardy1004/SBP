import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

export interface PerformanceMetrics {
  cls: number;
  fcp: number;
  lcp: number;
  ttfb: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  init() {
    // Core Web Vitals (FID removed in v3+)
    onCLS(this.handleCLS.bind(this));
    onFCP(this.handleFCP.bind(this));
    onLCP(this.handleLCP.bind(this));
    onTTFB(this.handleTTFB.bind(this));

    // Additional performance observers
    this.observeNavigationTiming();
    this.observeResourceTiming();
    this.observePaintTiming();
  }

  private handleCLS(metric: any) {
    this.metrics.cls = metric.value;
    this.reportMetric('CLS', metric);
  }

  // FID removed in web-vitals v3+

  private handleFCP(metric: any) {
    this.metrics.fcp = metric.value;
    this.reportMetric('FCP', metric);
  }

  private handleLCP(metric: any) {
    this.metrics.lcp = metric.value;
    this.reportMetric('LCP', metric);
  }

  private handleTTFB(metric: any) {
    this.metrics.ttfb = metric.value;
    this.reportMetric('TTFB', metric);
  }

  private observeNavigationTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.reportMetric('NavigationTiming', {
              dnsLookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
              tcpConnect: navEntry.connectEnd - navEntry.connectStart,
              serverResponse: navEntry.responseEnd - navEntry.requestStart,
              pageLoad: navEntry.loadEventEnd - navEntry.loadEventStart,
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
            });
          }
        }
      });
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Navigation timing not supported');
    }
  }

  private observeResourceTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        const resources = list.getEntries().map(entry => {
          const resourceEntry = entry as PerformanceResourceTiming;
          return {
            name: entry.name,
            duration: entry.duration,
            size: resourceEntry.transferSize || 0,
            type: resourceEntry.initiatorType || 'unknown'
          };
        });
        this.reportMetric('ResourceTiming', resources.slice(0, 10)); // Limit to first 10
      });
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Resource timing not supported');
    }
  }

  private observePaintTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.reportMetric('PaintTiming', {
            name: entry.name,
            startTime: entry.startTime
          });
        }
      });
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Paint timing not supported');
    }
  }

  private reportMetric(name: string, data: any) {
    const metricData = {
      name,
      data,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };

    // Send to analytics
    this.sendToAnalytics(metricData);

    // Log in development
    if (process.env['NODE_ENV'] === 'development') {
      console.log(`Performance Metric: ${name}`, metricData);
    }
  }

  private sendToAnalytics(data: any) {
    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        custom_parameter_1: data.name,
        custom_parameter_2: JSON.stringify(data.data),
        value: data.timestamp
      });
    }

    // Send to custom analytics endpoint (optional)
    if (typeof fetch !== 'undefined') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(err => console.warn('Failed to send performance data:', err));
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();