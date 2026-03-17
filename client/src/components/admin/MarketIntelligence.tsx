// Market Intelligence Dashboard
// AI-powered market analysis and insights for property business

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw
} from "lucide-react";

interface MarketData {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  metrics: {
    totalUsers: number;
    sessions: number;
    pageViews: number;
    bounceRate: string;
    avgSessionDuration: string;
  };
  charts: {
    pageViews: Array<{ date: string; views: number }>;
    topPages: Array<{ page: string; views: number }>;
    trafficSources: Array<{ name: string; value: number }>;
  };
  lastUpdated: string;
}

interface PropertyInsights {
  totalProperties: number;
  activeListings: number;
  soldThisMonth: number;
  averagePrice: number;
  topLocations: Array<{ location: string; count: number; avgPrice: number }>;
  priceRanges: Array<{ range: string; count: number; percentage: number }>;
  marketTrends: string[];
}

export function MarketIntelligence() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [propertyInsights, setPropertyInsights] = useState<PropertyInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analytics?days=30');
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setMarketData(data);

      // Also fetch property insights
      await fetchPropertyInsights();

      toast({
        title: "Market Data Updated",
        description: "Analytics data berhasil diperbarui",
      });
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPropertyInsights = async () => {
    try {
      // Fetch property data from Supabase
      const response = await fetch('/api/properties?limit=1000');
      if (!response.ok) return;

      const properties = await response.json();

      const insights: PropertyInsights = {
        totalProperties: properties.length,
        activeListings: properties.filter((p: any) => p.status === 'dijual' && !p.is_sold).length,
        soldThisMonth: properties.filter((p: any) => {
          if (!p.updated_at) return false;
          const updatedDate = new Date(p.updated_at);
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          return p.is_sold && updatedDate >= oneMonthAgo;
        }).length,
        averagePrice: 0,
        topLocations: [],
        priceRanges: [],
        marketTrends: []
      };

      // Calculate average price
      const prices = properties
        .map((p: any) => parseFloat(p.harga_properti?.replace(/[^\d]/g, '') || '0'))
        .filter((p: number) => p > 0);

      insights.averagePrice = prices.length > 0 ?
        prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length : 0;

      // Top locations
      const locationStats = properties.reduce((acc: any, prop: any) => {
        const location = `${prop.kabupaten}, ${prop.provinsi}`;
        if (!acc[location]) {
          acc[location] = { count: 0, totalPrice: 0, prices: [] };
        }
        acc[location].count++;
        const price = parseFloat(prop.harga_properti?.replace(/[^\d]/g, '') || '0');
        if (price > 0) {
          acc[location].totalPrice += price;
          acc[location].prices.push(price);
        }
        return acc;
      }, {});

      insights.topLocations = Object.entries(locationStats)
        .map(([location, stats]: [string, any]) => ({
          location,
          count: stats.count,
          avgPrice: stats.prices.length > 0 ?
            stats.totalPrice / stats.prices.length : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Price ranges
      const ranges = [
        { min: 0, max: 100000000, label: '< 100jt' },
        { min: 100000000, max: 300000000, label: '100jt - 300jt' },
        { min: 300000000, max: 500000000, label: '300jt - 500jt' },
        { min: 500000000, max: 1000000000, label: '500jt - 1M' },
        { min: 1000000000, max: Infinity, label: '> 1M' }
      ];

      insights.priceRanges = ranges.map(range => {
        const count = prices.filter((p: number) => p >= range.min && p < range.max).length;
        return {
          range: range.label,
          count,
          percentage: properties.length > 0 ? (count / properties.length) * 100 : 0
        };
      });

      // Market trends
      insights.marketTrends = [];
      if (insights.soldThisMonth > 0) {
        insights.marketTrends.push(`${insights.soldThisMonth} properti terjual bulan ini`);
      }
      if (insights.topLocations.length > 0) {
        insights.marketTrends.push(`${insights.topLocations[0].location} adalah lokasi terpopuler`);
      }
      if (insights.averagePrice > 200000000) {
        insights.marketTrends.push("Pasar properti premium sedang aktif");
      }

      setPropertyInsights(insights);
    } catch (error) {
      console.error('Error fetching property insights:', error);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(1)}M`;
    if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(1)}M`;
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID');
  };

  const getGrowthIndicator = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100;
    return {
      value: growth,
      isPositive: growth > 0,
      icon: growth > 0 ? TrendingUp : TrendingDown,
      color: growth > 0 ? 'text-green-600' : 'text-red-600'
    };
  };

  if (!marketData && !propertyInsights) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Activity className="animate-spin h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p>Memuat market intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Market Intelligence Dashboard</h2>
          <p className="text-muted-foreground">
            Analisis pasar properti real-time dengan AI insights
          </p>
        </div>
        <Button onClick={fetchMarketData} disabled={isLoading}>
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      {marketData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{formatNumber(marketData.metrics.totalUsers)}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                  <p className="text-2xl font-bold">{formatNumber(marketData.metrics.pageViews)}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                  <p className="text-2xl font-bold">{marketData.metrics.bounceRate}%</p>
                </div>
                <Target className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Session</p>
                  <p className="text-2xl font-bold">{marketData.metrics.avgSessionDuration}s</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Property Insights */}
      {propertyInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Property Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {propertyInsights.totalProperties}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Properties</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {propertyInsights.activeListings}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Listings</div>
                </div>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-xl font-bold text-yellow-600">
                  {formatPrice(propertyInsights.averagePrice)}
                </div>
                <div className="text-sm text-muted-foreground">Average Price</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">
                  {propertyInsights.soldThisMonth}
                </div>
                <div className="text-sm text-muted-foreground">Sold This Month</div>
              </div>
            </CardContent>
          </Card>

          {/* Top Locations */}
          <Card>
            <CardHeader>
              <CardTitle>Top Locations</CardTitle>
              <CardDescription>Lokasi dengan listing terbanyak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {propertyInsights.topLocations.map((location, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{location.location}</div>
                      <div className="text-sm text-muted-foreground">
                        {location.count} properties
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {formatPrice(location.avgPrice)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Price Distribution */}
      {propertyInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Price Distribution
            </CardTitle>
            <CardDescription>Distribusi harga properti di pasar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {propertyInsights.priceRanges.map((range, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{range.range}</span>
                    <span>{range.count} ({range.percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={range.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Trends & Insights */}
      {marketData && propertyInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Market Insights
            </CardTitle>
            <CardDescription>Analisis tren pasar berdasarkan data real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Traffic Analysis */}
              <div>
                <h4 className="font-semibold mb-2">Traffic Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">Top Traffic Source</div>
                    <div className="text-muted-foreground">
                      {marketData.charts.trafficSources[0]?.name || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">Most Viewed Page</div>
                    <div className="text-muted-foreground">
                      {marketData.charts.topPages[0]?.page?.split('/').pop() || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">Engagement Rate</div>
                    <div className="text-muted-foreground">
                      {(100 - parseFloat(marketData.metrics.bounceRate)).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Trends */}
              <div>
                <h4 className="font-semibold mb-2">Market Trends</h4>
                <div className="space-y-2">
                  {propertyInsights.marketTrends.map((trend, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{trend}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendations */}
              <div>
                <h4 className="font-semibold mb-2">AI Recommendations</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {propertyInsights.activeListings < 10 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      📈 <strong>Recommendation:</strong> Tambah listing properti untuk meningkatkan exposure
                    </div>
                  )}
                  {parseFloat(marketData.metrics.bounceRate) > 60 && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      🎯 <strong>Recommendation:</strong> Tingkatkan kualitas konten untuk mengurangi bounce rate
                    </div>
                  )}
                  {propertyInsights.soldThisMonth > 2 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      ✅ <strong>Great Performance:</strong> Tingkat penjualan bulan ini sangat baik!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}