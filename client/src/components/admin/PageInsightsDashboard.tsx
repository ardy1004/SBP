import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Zap, RefreshCw, TrendingUp, Clock, Monitor, Smartphone, Globe, MousePointer } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface PageInsightsData {
  url: string;
  requestedUrl: string;
  analysisUTCTimestamp: string;
  categories: {
    performance: { score: number; title: string };
    accessibility: { score: number; title: string };
    'best-practices': { score: number; title: string };
    seo: { score: number; title: string };
  };
  coreWebVitals: {
    lcp: string;
    fid: string;
    cls: string;
    fcp: string;
    ttfb: string;
  };
  loadingExperience: any;
  originLoadingExperience: any;
  lastUpdated: string;
  error?: string;
}

export function PageInsightsDashboard() {
  const [targetUrl, setTargetUrl] = useState('https://salambumi.xyz');

  const { data: insights, isLoading, error, refetch } = useQuery<PageInsightsData>({
    queryKey: ['pagespeed', targetUrl],
    queryFn: () => apiRequest('GET', `/api/pagespeed?url=${encodeURIComponent(targetUrl)}`),
    enabled: false, // Manual trigger only
  });

  const runAnalysis = () => {
    refetch();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  const formatMetric = (value: string) => {
    if (value === 'N/A') return value;
    // Convert milliseconds to seconds for readability
    const numValue = parseFloat(value.replace(/[^\d.]/g, ''));
    if (numValue > 1000) {
      return (numValue / 1000).toFixed(1) + 's';
    }
    return value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">PageSpeed Insights</h2>
          <p className="text-muted-foreground">
            Analyze website performance and Core Web Vitals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={runAnalysis} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle>Test URL</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the URL you want to analyze for performance
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://salambumi.xyz"
              className="flex-1"
            />
            <Button onClick={runAnalysis} disabled={isLoading}>
              <Zap className="h-4 w-4 mr-2" />
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {insights && !error && (
        <>
          {/* Lighthouse Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {Math.round(insights.categories.performance.score * 100)}
                  </div>
                  <Badge className={getScoreColor(insights.categories.performance.score * 100)}>
                    {getScoreLabel(insights.categories.performance.score * 100)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Monitor className="h-4 w-4 mr-2" />
                  Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {Math.round(insights.categories.accessibility.score * 100)}
                  </div>
                  <Badge className={getScoreColor(insights.categories.accessibility.score * 100)}>
                    {getScoreLabel(insights.categories.accessibility.score * 100)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {Math.round(insights.categories['best-practices'].score * 100)}
                  </div>
                  <Badge className={getScoreColor(insights.categories['best-practices'].score * 100)}>
                    {getScoreLabel(insights.categories['best-practices'].score * 100)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  SEO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {Math.round(insights.categories.seo.score * 100)}
                  </div>
                  <Badge className={getScoreColor(insights.categories.seo.score * 100)}>
                    {getScoreLabel(insights.categories.seo.score * 100)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Core Web Vitals */}
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Key metrics that measure user experience quality
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Largest Contentful Paint (LCP)</span>
                  </div>
                  <div className="text-2xl font-bold">{formatMetric(insights.coreWebVitals.lcp)}</div>
                  <p className="text-xs text-muted-foreground">
                    Measures loading performance. Target: under 2.5s
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">First Input Delay (FID)</span>
                  </div>
                  <div className="text-2xl font-bold">{formatMetric(insights.coreWebVitals.fid)}</div>
                  <p className="text-xs text-muted-foreground">
                    Measures interactivity. Target: under 100ms
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Cumulative Layout Shift (CLS)</span>
                  </div>
                  <div className="text-2xl font-bold">{insights.coreWebVitals.cls}</div>
                  <p className="text-xs text-muted-foreground">
                    Measures visual stability. Target: under 0.1
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">First Contentful Paint (FCP)</span>
                  </div>
                  <div className="text-2xl font-bold">{formatMetric(insights.coreWebVitals.fcp)}</div>
                  <p className="text-xs text-muted-foreground">
                    Measures paint performance. Target: under 1.8s
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Time to First Byte (TTFB)</span>
                  </div>
                  <div className="text-2xl font-bold">{formatMetric(insights.coreWebVitals.ttfb)}</div>
                  <p className="text-xs text-muted-foreground">
                    Measures server response time. Target: under 800ms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Info */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tested URL:</span>
                  <p className="text-muted-foreground break-all">{insights.requestedUrl}</p>
                </div>
                <div>
                  <span className="font-medium">Analysis Time:</span>
                  <p className="text-muted-foreground">
                    {insights.analysisUTCTimestamp ?
                      new Date(insights.analysisUTCTimestamp).toLocaleString() :
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <span className="font-medium">Device Strategy:</span>
                  <p className="text-muted-foreground">Mobile</p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p className="text-muted-foreground">
                    {new Date(insights.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Error State */}
      {error && (
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load PageSpeed Insights data</p>
              <Button onClick={runAnalysis} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!insights && !isLoading && !error && (
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ready to Analyze</h3>
              <p className="text-muted-foreground mb-4">
                Enter a URL above and click "Analyze" to get performance insights
              </p>
              <Button onClick={runAnalysis}>
                <Zap className="h-4 w-4 mr-2" />
                Analyze Current URL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}