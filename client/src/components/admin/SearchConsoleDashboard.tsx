import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, TrendingUp, Eye, MousePointer, Globe } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SearchConsoleData {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  summary: {
    totalClicks: number;
    totalImpressions: number;
    averageCTR: number;
    averagePosition: number;
  };
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    clicks: number;
    impressions: number;
  }>;
  countryBreakdown: Array<{
    country: string;
    clicks: number;
    impressions: number;
  }>;
  lastUpdated: string;
  error?: string;
}

export function SearchConsoleDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const { data: searchData, isLoading, error, refetch } = useQuery<SearchConsoleData>({
    queryKey: ['search-console', selectedPeriod],
    queryFn: () => apiRequest('GET', `/api/search-console?days=${selectedPeriod}`),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  const handleRefresh = () => {
    refetch();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(1) + '%';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load Search Console data</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Google Search Console</h2>
          <p className="text-muted-foreground">
            Monitor your website's search performance and SEO metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MousePointer className="h-4 w-4 mr-2" />
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(searchData?.summary?.totalClicks || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(searchData?.summary?.totalImpressions || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Avg. CTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(Number(searchData?.summary?.averageCTR || 0))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Avg. Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(searchData?.summary?.averagePosition || 0).toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Search Queries</CardTitle>
            <p className="text-sm text-muted-foreground">
              Most searched keywords bringing traffic to your site
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchData?.topQueries?.slice(0, 10).map((query, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      "{query.query}"
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-bold">{formatNumber(query.clicks)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(query.impressions)} impressions
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CTR: {formatPercentage(Number(query.ctr || 0))}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-muted-foreground">
                  No query data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Pages</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pages with the most search impressions
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchData?.topPages?.slice(0, 10).map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {page.page.replace('https://salambumi.xyz', '') || '/'}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-bold">{formatNumber(page.clicks)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(page.impressions)} impressions
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pos: {Number(page.position || 0).toFixed(1)}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-muted-foreground">
                  No page data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              Search traffic by device type
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchData?.deviceBreakdown?.map((device, index) => {
                const totalImpressions = searchData?.deviceBreakdown?.reduce((sum, d) => sum + (d.impressions || 0), 0) || 0;
                const percentage = totalImpressions > 0 ? ((device.impressions / totalImpressions) * 100).toFixed(1) : '0.0';
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium capitalize">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatNumber(device.clicks)}</p>
                      <p className="text-xs text-muted-foreground">{percentage}% of impressions</p>
                    </div>
                  </div>
                );
              }) || (
                <div className="text-center py-4 text-muted-foreground">
                  No device data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Country Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <p className="text-sm text-muted-foreground">
              Geographic distribution of search traffic
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchData?.countryBreakdown?.slice(0, 8).map((country, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatNumber(country.clicks)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(country.impressions)} impressions
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-muted-foreground">
                  No country data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {searchData?.lastUpdated ? new Date(searchData.lastUpdated).toLocaleString() : 'Never'}
        {searchData?.error && (
          <div className="text-red-600 mt-2">
            Error: {searchData.error}
          </div>
        )}
      </div>
    </div>
  );
}